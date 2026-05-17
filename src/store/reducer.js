import { combineReducers } from 'redux';
import * as types from './types';

const initialCryptoState = {
  baseCurrency: 'USD',
  marketList: {
    data: [],
    loading: false,
    error: null,
    lastFetched: null,
  },
  chartData: {
    data: {}, // Map: { ethereum: { prices: [...] }, bitcoin: { prices: [...] } }
    loading: false,
    error: null,
    lastFetched: {}, // Map: { [coinId_currency_period]: timestamp }
  },
  selectedCoins: ['ethereum'], // Initial selected coin for charting
  chartPeriod: '1W',
  chartType: 'line',
  searchQuery: '',
  exchange: {
    sellCoin: 'bitcoin',
    buyCoin: 'ethereum',
    sellAmount: '1',
    rate: null,
    sellPrice: null,
    buyPrice: null,
    loading: false,
    error: null,
    validationError: null,
  }
};

const cryptoReducer = (state = initialCryptoState, action) => {
  switch (action.type) {
    // Market List
    case types.FETCH_MARKETS_START:
      return {
        ...state,
        marketList: {
          ...state.marketList,
          loading: true,
          error: null
        }
      };
    case types.FETCH_MARKETS_SUCCESS:
      return {
        ...state,
        marketList: {
          ...state.marketList,
          loading: false,
          data: action.payload,
          error: null,
          lastFetched: Date.now()
        }
      };
    case types.FETCH_MARKETS_FAILURE:
      return {
        ...state,
        marketList: {
          ...state.marketList,
          loading: false,
          error: action.payload
        }
      };

    // Chart Data
    case types.FETCH_CHART_START:
      return {
        ...state,
        chartData: {
          ...state.chartData,
          loading: true,
          error: null
        }
      };
    case types.FETCH_CHART_SUCCESS: {
      const newTimestamps = {};
      const now = Date.now();
      const base = state.baseCurrency.toLowerCase();
      const period = state.chartPeriod;
      Object.keys(action.payload).forEach(coinId => {
        newTimestamps[`${coinId}_${base}_${period}`] = now;
      });
      return {
        ...state,
        chartData: {
          ...state.chartData,
          loading: false,
          data: {
            ...state.chartData.data,
            ...action.payload
          },
          error: null,
          lastFetched: {
            ...state.chartData.lastFetched,
            ...newTimestamps
          }
        }
      };
    }
    case types.FETCH_CHART_FAILURE:
      return {
        ...state,
        chartData: {
          ...state.chartData,
          loading: false,
          error: action.payload
        }
      };

    // UI Configuration
    case types.SET_BASE_CURRENCY:
      return {
        ...state,
        baseCurrency: action.payload
      };
      
    case types.TOGGLE_SELECTED_COIN: {
      const coinId = action.payload;
      const exists = state.selectedCoins.includes(coinId);
      let newSelected;
      if (exists) {
        // Keep at least one selected
        newSelected = state.selectedCoins.filter(id => id !== coinId);
        if (newSelected.length === 0) {
          newSelected = [coinId];
        }
      } else {
        newSelected = [...state.selectedCoins, coinId];
      }
      return {
        ...state,
        selectedCoins: newSelected
      };
    }

    case types.SET_SELECTED_COINS:
      return {
        ...state,
        selectedCoins: action.payload
      };

    case types.SET_CHART_PERIOD:
      return {
        ...state,
        chartPeriod: action.payload
      };

    case types.SET_CHART_TYPE:
      return {
        ...state,
        chartType: action.payload
      };

    case types.SET_SEARCH_QUERY:
      return {
        ...state,
        searchQuery: action.payload
      };

    // Live Exchange Calculator
    case types.SET_EXCHANGE_SELL_COIN:
      return {
        ...state,
        exchange: {
          ...state.exchange,
          sellCoin: action.payload,
          validationError: null
        }
      };

    case types.SET_EXCHANGE_BUY_COIN:
      return {
        ...state,
        exchange: {
          ...state.exchange,
          buyCoin: action.payload,
          validationError: null
        }
      };

    case types.SET_EXCHANGE_SELL_AMOUNT:
      return {
        ...state,
        exchange: {
          ...state.exchange,
          sellAmount: action.payload.amount,
          validationError: action.payload.validationError
        }
      };

    case types.SET_EXCHANGE_VALIDATION_ERROR:
      return {
        ...state,
        exchange: {
          ...state.exchange,
          validationError: action.payload
        }
      };

    // Exchange Rates
    case types.FETCH_EXCHANGE_RATE_START:
      return {
        ...state,
        exchange: {
          ...state.exchange,
          loading: true,
          error: null
        }
      };
    case types.FETCH_EXCHANGE_RATE_SUCCESS:
      return {
        ...state,
        exchange: {
          ...state.exchange,
          loading: false,
          rate: action.payload.rate,
          sellPrice: action.payload.sellPrice,
          buyPrice: action.payload.buyPrice,
          error: null
        }
      };
    case types.FETCH_EXCHANGE_RATE_FAILURE:
      return {
        ...state,
        exchange: {
          ...state.exchange,
          loading: false,
          error: action.payload
        }
      };

    default:
      return state;
  }
};

export const rootReducer = combineReducers({
  crypto: cryptoReducer
});
