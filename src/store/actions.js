import * as types from './types';


// Map chart period to days parameter required by CoinGecko API
const periodToDays = {
  '1D': '1',
  '1W': '7',
  '1M': '30',
  '6M': '180',
  '1Y': '365'
};

// 1. Fetch Market List Thunk
export const fetchMarkets = (baseCurrency) => async (dispatch, getState) => {
  const { crypto } = getState();
  const now = Date.now();
  if (crypto.marketList.lastFetched && (now - crypto.marketList.lastFetched < 60000)) {
    console.log('[Frontend Cache] Skipping market list fetch (fresh within 60s)');
    return crypto.marketList.data;
  }

  dispatch({ type: types.FETCH_MARKETS_START });
  try {
    // Fetch fiat exchange rates from our local rates proxy with silent fallback to USD
    let rates = [];
    try {
      const ratesResponse = await fetch('/api/rates');
      if (ratesResponse.ok) {
        const ratesData = await ratesResponse.json();
        rates = ratesData.data || [];
      } else {
        console.warn('Rates API returned error status, silently falling back to USD.');
      }
    } catch (ratesErr) {
      console.warn('Silent fallback to USD due to rates fetch failure:', ratesErr.message);
    }

    const currency = baseCurrency.toUpperCase();
    let currencyRate = 1.0;
    if (currency !== 'USD') {
      const rateObj = rates.find(r => r.symbol.toUpperCase() === currency);
      if (rateObj) {
        currencyRate = parseFloat(rateObj.rateUsd || 1.0);
      }
    }

    // Fetch CoinCap assets from local proxy
    const response = await fetch('/api/markets');
    if (!response.ok) {
      throw new Error(`Proxy returned status ${response.status}: ${response.statusText}`);
    }

    const marketsData = await response.json();
    const assets = marketsData.data || [];

    // Map CoinCap response fields to the existing state shape
    const mappedData = assets.map(asset => {
      const priceInBase = parseFloat(asset.priceUsd || 0) / currencyRate;
      const marketCapInBase = parseFloat(asset.marketCapUsd || 0) / currencyRate;
      return {
        id: asset.id,
        name: asset.name,
        symbol: asset.symbol,
        image: `https://assets.coincap.io/assets/icons/${asset.symbol.toLowerCase()}@2x.png`,
        price: priceInBase,
        current_price: priceInBase,
        market_cap: marketCapInBase,
        price_change_percentage_24h: parseFloat(asset.changePercent24Hr || 0)
      };
    });

    dispatch({
      type: types.FETCH_MARKETS_SUCCESS,
      payload: mappedData
    });
    return mappedData;
  } catch (error) {
    console.error('Error fetching market list:', error);
    dispatch({
      type: types.FETCH_MARKETS_FAILURE,
      payload: error.message || 'Failed to fetch cryptocurrency markets. Please try again later.'
    });
    throw error;
  }
};

// 2. Fetch Chart Data for Multiple Selected Coins
export const fetchChartData = (coinIds, baseCurrency, period) => async (dispatch, getState) => {
  if (!coinIds || coinIds.length === 0) {
    dispatch({
      type: types.FETCH_CHART_SUCCESS,
      payload: {}
    });
    return;
  }

  const { crypto } = getState();
  const now = Date.now();
  const base = baseCurrency.toLowerCase();
  const days = periodToDays[period] || '7';

  dispatch({ type: types.FETCH_CHART_START });

  try {
    // Fetch fiat exchange rates from our rates proxy with silent fallback to USD
    let rates = [];
    try {
      const ratesResponse = await fetch('/api/rates');
      if (ratesResponse.ok) {
        const ratesData = await ratesResponse.json();
        rates = ratesData.data || [];
      } else {
        console.warn('Rates API returned error status, silently falling back to USD.');
      }
    } catch (ratesErr) {
      console.warn('Silent fallback to USD due to rates fetch failure:', ratesErr.message);
    }

    const currency = baseCurrency.toUpperCase();
    let currencyRate = 1.0;
    if (currency !== 'USD') {
      const rateObj = rates.find(r => r.symbol.toUpperCase() === currency);
      if (rateObj) {
        currencyRate = parseFloat(rateObj.rateUsd || 1.0);
      }
    }

    const cachedResults = {};
    const coinsToFetch = [];

    coinIds.forEach((id) => {
      const cacheKey = `${id.toLowerCase()}_${base}_${period}`;
      const lastFetchedTime = crypto.chartData.lastFetched?.[cacheKey];
      const existingData = crypto.chartData.data?.[id];

      if (lastFetchedTime && (now - lastFetchedTime < 60000) && existingData) {
        console.log(`[Frontend Cache] Using cached chart data for ${id}`);
        cachedResults[id] = existingData;
      } else {
        coinsToFetch.push(id);
      }
    });

    const fetchResults = {};
    if (coinsToFetch.length > 0) {
      const fetchPromises = coinsToFetch.map(async (id) => {
        const response = await fetch(
          `/api/chart/${id.toLowerCase()}?days=${days}`
        );
        
        if (!response.ok) {
          throw new Error(`Failed to fetch chart for ${id}: ${response.statusText}`);
        }
        
        const chartRes = await response.json();
        
        // Convert CoinCap chart history structure into the expected shape:
        // { prices: [ [timestamp, price], ... ] }
        const historyPoints = chartRes.data || [];
        const prices = historyPoints.map(item => [
          item.time,
          parseFloat(item.priceUsd || 0) / currencyRate
        ]);

        return { id, data: { prices } };
      });

      const results = await Promise.all(fetchPromises);
      results.forEach((res) => {
        fetchResults[res.id] = res.data;
      });
    }

    dispatch({
      type: types.FETCH_CHART_SUCCESS,
      payload: {
        ...cachedResults,
        ...fetchResults
      }
    });
  } catch (error) {
    console.error('Error fetching chart data:', error);
    dispatch({
      type: types.FETCH_CHART_FAILURE,
      payload: 'Failed to retrieve chart data. Please wait a moment and try again.'
    });
  }
};

// 3. Fetch Exchange Rate Thunk
export const fetchExchangeRate = (sellCoinId, buyCoinId, baseCurrency) => async (dispatch) => {
  if (!sellCoinId || !buyCoinId) return;
  
  dispatch({ type: types.FETCH_EXCHANGE_RATE_START });
  
  try {
    const currency = baseCurrency.toLowerCase();
    const ids = `${sellCoinId.toLowerCase()},${buyCoinId.toLowerCase()}`;
    const response = await fetch(
      `/api/price?ids=${ids}&vs_currencies=${currency}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch exchange rates: ${response.statusText}`);
    }

    const priceData = await response.json();
    
    const sellPrice = priceData[sellCoinId.toLowerCase()]?.[currency];
    const buyPrice = priceData[buyCoinId.toLowerCase()]?.[currency];

    if (!sellPrice || !buyPrice) {
      throw new Error('Could not find price data for selected exchange pair.');
    }

    // Rate = value of 1 sellCoin in terms of buyCoin
    // e.g. If BTC is $60000 and ETH is $3000, 1 BTC = 60000 / 3000 = 20 ETH
    const rate = sellPrice / buyPrice;

    dispatch({
      type: types.FETCH_EXCHANGE_RATE_SUCCESS,
      payload: {
        rate,
        sellPrice,
        buyPrice
      }
    });
  } catch (error) {
    console.error('Error fetching exchange rate:', error);
    dispatch({
      type: types.FETCH_EXCHANGE_RATE_FAILURE,
      payload: error.message || 'Failed to fetch exchange rates.'
    });
  }
};

// 4. Action Creators for Interactive UI changes
export const setBaseCurrency = (currency) => (dispatch, getState) => {
  dispatch({
    type: types.SET_BASE_CURRENCY,
    payload: currency
  });
  
  // Re-fetch markets, chart data, and exchange rate with new currency
  const { crypto } = getState();
  dispatch(fetchMarkets(currency)).then((markets) => {
    dispatch(fetchChartData(crypto.selectedCoins, currency, crypto.chartPeriod));
    dispatch(fetchExchangeRate(crypto.exchange.sellCoin, crypto.exchange.buyCoin, currency));
  });
};

export const toggleSelectedCoin = (coinId) => (dispatch, getState) => {
  dispatch({
    type: types.TOGGLE_SELECTED_COIN,
    payload: coinId
  });

  const { crypto } = getState();
  // Fetch chart data for new list of selected coins
  dispatch(fetchChartData(crypto.selectedCoins, crypto.baseCurrency, crypto.chartPeriod));
};

export const setSelectedCoins = (coinIds) => (dispatch, getState) => {
  dispatch({
    type: types.SET_SELECTED_COINS,
    payload: coinIds
  });

  const { crypto } = getState();
  dispatch(fetchChartData(coinIds, crypto.baseCurrency, crypto.chartPeriod));
};

export const setChartPeriod = (period) => (dispatch, getState) => {
  dispatch({
    type: types.SET_CHART_PERIOD,
    payload: period
  });

  const { crypto } = getState();
  dispatch(fetchChartData(crypto.selectedCoins, crypto.baseCurrency, period));
};

export const setChartType = (type) => ({
  type: types.SET_CHART_TYPE,
  payload: type
});

export const setSearchQuery = (query) => ({
  type: types.SET_SEARCH_QUERY,
  payload: query
});

export const setExchangeSellCoin = (coinId) => (dispatch, getState) => {
  dispatch({
    type: types.SET_EXCHANGE_SELL_COIN,
    payload: coinId
  });

  const { crypto } = getState();
  dispatch(fetchExchangeRate(coinId, crypto.exchange.buyCoin, crypto.baseCurrency));
};

export const setExchangeBuyCoin = (coinId) => (dispatch, getState) => {
  dispatch({
    type: types.SET_EXCHANGE_BUY_COIN,
    payload: coinId
  });

  const { crypto } = getState();
  dispatch(fetchExchangeRate(crypto.exchange.sellCoin, coinId, crypto.baseCurrency));
};

export const setExchangeSellAmount = (amount) => (dispatch) => {
  // 1. Perform validation first
  if (amount === '') {
    dispatch({
      type: types.SET_EXCHANGE_SELL_AMOUNT,
      payload: { amount: '', validationError: null }
    });
    return;
  }

  // Check if valid numeric
  const numericVal = Number(amount);
  if (isNaN(numericVal) || numericVal < 0) {
    dispatch({
      type: types.SET_EXCHANGE_VALIDATION_ERROR,
      payload: 'Please enter a valid number'
    });
    return;
  }

  dispatch({
    type: types.SET_EXCHANGE_SELL_AMOUNT,
    payload: { amount, validationError: null }
  });
};
