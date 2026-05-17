import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  setExchangeSellCoin, 
  setExchangeBuyCoin, 
  setExchangeSellAmount,
  fetchExchangeRate
} from '../store/actions';
import { ChevronDown, Loader2, RefreshCw } from 'lucide-react';

const ExchangeContainer = () => {
  const dispatch = useDispatch();

  // Redux state
  const { marketList, exchange, baseCurrency } = useSelector(state => state.crypto);
  const { sellCoin, buyCoin, sellAmount, rate, loading, validationError } = exchange;

  // Dropdown states
  const [sellDropdownOpen, setSellDropdownOpen] = useState(false);
  const [buyDropdownOpen, setBuyDropdownOpen] = useState(false);

  // Refs for click outside
  const sellRef = useRef(null);
  const buyRef = useRef(null);

  useEffect(() => {
    const clickOutside = (e) => {
      if (sellRef.current && !sellRef.current.contains(e.target)) setSellDropdownOpen(false);
      if (buyRef.current && !buyRef.current.contains(e.target)) setBuyDropdownOpen(false);
    };
    document.addEventListener('mousedown', clickOutside);
    return () => document.removeEventListener('mousedown', clickOutside);
  }, []);

  // Fetch initial exchange rate
  useEffect(() => {
    if (sellCoin && buyCoin) {
      dispatch(fetchExchangeRate(sellCoin, buyCoin, baseCurrency));
    }
  }, [sellCoin, buyCoin, baseCurrency, dispatch]);

  const handleSellAmountChange = (e) => {
    dispatch(setExchangeSellAmount(e.target.value));
  };

  const sellCoinData = marketList.data.find(c => c.id === sellCoin);
  const buyCoinData = marketList.data.find(c => c.id === buyCoin);

  // Calculate buy amount
  let buyAmount = '0.00';
  if (rate && sellAmount && !validationError) {
    const calculated = Number(sellAmount) * rate;
    // Format nicely based on size
    if (calculated >= 1) {
      buyAmount = calculated.toLocaleString(undefined, { maximumFractionDigits: 4 });
    } else {
      buyAmount = calculated.toFixed(6);
    }
  }

  // Handle Mock Exchange Success Animation
  const [swapping, setSwapping] = useState(false);
  const [swappedSuccess, setSwappedSuccess] = useState(false);
  
  const handleExchange = () => {
    if (validationError || !sellAmount || Number(sellAmount) <= 0) return;
    setSwapping(true);
    setTimeout(() => {
      setSwapping(false);
      setSwappedSuccess(true);
      setTimeout(() => setSwappedSuccess(false), 3000);
    }, 1200);
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-premium border border-brand-border h-[260px] flex flex-col min-w-0">
      
      {/* Title */}
      <h3 className="text-sm font-bold text-brand-dark tracking-tight mb-4 flex items-center justify-between">
        <span>Exchange Coins</span>
        {loading && <Loader2 className="w-3.5 h-3.5 text-brand-blue animate-spin" />}
      </h3>

      {/* Main Grid */}
      <div className="grid grid-cols-2 gap-4 items-center flex-1 min-h-0">
        
        {/* Left Side: Selectors */}
        <div className="space-y-3.5">
          {/* Sell Dropdown */}
          <div className="relative" ref={sellRef}>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Sell</div>
            <button
              onClick={() => setSellDropdownOpen(!sellDropdownOpen)}
              className="flex items-center justify-between w-full px-3 py-2 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-slate-100 text-xs font-semibold text-brand-dark transition-all"
            >
              <div className="flex items-center space-x-2 truncate">
                {sellCoinData && <img src={sellCoinData.image} alt="" className="w-4 h-4 rounded-full flex-shrink-0" />}
                <span className="truncate">{sellCoinData ? sellCoinData.name : 'Select'}</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            </button>

            {sellDropdownOpen && (
              <div className="absolute left-0 mt-1 w-full bg-white border border-brand-border rounded-2xl shadow-dropdown z-40 max-h-36 overflow-y-auto p-1 custom-scrollbar">
                {marketList.data.map((coin) => (
                  <button
                    key={coin.id}
                    onClick={() => {
                      dispatch(setExchangeSellCoin(coin.id));
                      setSellDropdownOpen(false);
                    }}
                    className={`flex items-center space-x-2 w-full px-3 py-2 rounded-xl text-left text-xs font-semibold transition ${
                      sellCoin === coin.id ? 'bg-brand-blue/5 text-brand-blue' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <img src={coin.image} alt="" className="w-4 h-4 rounded-full" />
                    <span className="truncate">{coin.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Buy Dropdown */}
          <div className="relative" ref={buyRef}>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Buy</div>
            <button
              onClick={() => setBuyDropdownOpen(!buyDropdownOpen)}
              className="flex items-center justify-between w-full px-3 py-2 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-slate-100 text-xs font-semibold text-brand-dark transition-all"
            >
              <div className="flex items-center space-x-2 truncate">
                {buyCoinData && <img src={buyCoinData.image} alt="" className="w-4 h-4 rounded-full flex-shrink-0" />}
                <span className="truncate">{buyCoinData ? buyCoinData.name : 'Select'}</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            </button>

            {buyDropdownOpen && (
              <div className="absolute left-0 mt-1 w-full bg-white border border-brand-border rounded-2xl shadow-dropdown z-40 max-h-36 overflow-y-auto p-1 custom-scrollbar">
                {marketList.data.map((coin) => (
                  <button
                    key={coin.id}
                    onClick={() => {
                      dispatch(setExchangeBuyCoin(coin.id));
                      setBuyDropdownOpen(false);
                    }}
                    className={`flex items-center space-x-2 w-full px-3 py-2 rounded-xl text-left text-xs font-semibold transition ${
                      buyCoin === coin.id ? 'bg-brand-blue/5 text-brand-blue' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <img src={coin.image} alt="" className="w-4 h-4 rounded-full" />
                    <span className="truncate">{coin.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Inputs & Live Display */}
        <div className="space-y-3 flex flex-col justify-end h-full">
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Enter value</div>
            <input
              type="text"
              value={sellAmount}
              onChange={handleSellAmountChange}
              placeholder={`Avl : 0.002 ${sellCoinData?.symbol?.toUpperCase() || ''}`}
              className={`w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border focus:outline-none focus:bg-white text-xs font-bold text-slate-700 transition ${
                validationError 
                  ? 'border-brand-danger focus:ring-2 focus:ring-red-100 bg-red-50/10' 
                  : 'border-slate-100 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/5'
              }`}
            />
            {/* Show Numeric Validation Error */}
            {validationError && (
              <p className="text-[10px] font-semibold text-brand-danger mt-1 animate-pulse">
                {validationError}
              </p>
            )}
          </div>

          {/* Live Calculated Yield Box */}
          <div className="min-h-[44px] flex flex-col justify-center">
            {!validationError && sellAmount !== '' && (
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Estimated Yield</div>
                <div className="text-sm font-extrabold text-brand-success truncate">
                  {buyAmount} {buyCoinData?.symbol?.toUpperCase() || ''}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Action Button */}
      <div className="mt-4">
        <button
          onClick={handleExchange}
          disabled={!!validationError || swapping || swappedSuccess || !sellAmount || Number(sellAmount) <= 0}
          className={`w-full py-2.5 rounded-2xl text-xs font-bold text-white transition-all shadow-sm ${
            swappedSuccess 
              ? 'bg-brand-success hover:bg-emerald-600' 
              : 'bg-brand-blue hover:bg-blue-600 active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none'
          }`}
        >
          {swapping ? (
            <span className="flex items-center justify-center space-x-1.5">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Processing Exchange...</span>
            </span>
          ) : swappedSuccess ? (
            <span>Exchange Successful!</span>
          ) : (
            <span>Exchange</span>
          )}
        </button>
      </div>

    </div>
  );
};

export default ExchangeContainer;
