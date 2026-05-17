import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toggleSelectedCoin } from '../store/actions';
import { TrendingUp, TrendingDown } from 'lucide-react';

// Formatter helper for currency
const formatCurrency = (value, currency) => {
  const symbolMap = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    INR: '₹'
  };
  const symbol = symbolMap[currency.toUpperCase()] || '$';
  
  if (value >= 1e9) {
    return `${symbol}${(value / 1e9).toFixed(2)}B`;
  }
  if (value >= 1e6) {
    return `${symbol}${(value / 1e6).toFixed(2)}M`;
  }
  return `${symbol}${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
};

const Sidebar = () => {
  const dispatch = useDispatch();
  
  // Extract state from Redux
  const { marketList, searchQuery, baseCurrency, selectedCoins } = useSelector(
    (state) => state.crypto
  );
  
  const { data: coins, loading, error } = marketList;

  // Filter coins by search query
  const filteredCoins = coins.filter(
    (coin) =>
      coin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      coin.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCoinClick = (coinId) => {
    dispatch(toggleSelectedCoin(coinId));
  };

  return (
    <aside className="bg-white rounded-3xl p-6 shadow-premium border border-brand-border h-[calc(100vh-140px)] flex flex-col min-w-0">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-brand-dark tracking-tight">
          Cryptocurrency by
        </h2>
        <h2 className="text-lg font-bold text-brand-dark tracking-tight -mt-1">
          market cap
        </h2>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="flex-1 space-y-4 overflow-hidden pr-1">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-center justify-between py-2 animate-pulse">
              <div className="flex items-center space-x-3 min-w-0 flex-1">
                <div className="w-8 h-8 bg-slate-100 rounded-full flex-shrink-0" />
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="h-3 bg-slate-100 rounded w-2/3" />
                  <div className="h-2.5 bg-slate-100 rounded w-1/2" />
                </div>
              </div>
              <div className="h-3 bg-slate-100 rounded w-12 flex-shrink-0" />
            </div>
          ))}
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="bg-red-50 text-red-500 rounded-xl p-4 text-xs font-medium border border-red-100 text-center my-4">
          <p>{error}</p>
        </div>
      )}

      {/* Coins List */}
      {!loading && !error && (
        <div className="flex-1 overflow-y-auto pr-1 space-y-3 custom-scrollbar">
          {filteredCoins.length === 0 ? (
            <div className="text-center py-8 text-sm text-slate-400 font-medium">
              No matching coins found
            </div>
          ) : (
            filteredCoins.map((coin) => {
              const isSelected = selectedCoins.includes(coin.id);
              const isPositive = coin.price_change_percentage_24h >= 0;
              
              return (
                <div
                  key={coin.id}
                  onClick={() => handleCoinClick(coin.id)}
                  className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all duration-200 group border ${
                    isSelected
                      ? 'bg-brand-blue/5 border-brand-blue/30 shadow-sm'
                      : 'hover:bg-slate-50 border-transparent hover:border-slate-100'
                  }`}
                >
                  {/* Coin info */}
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <img
                      src={coin.image}
                      alt={coin.name}
                      className="w-8 h-8 rounded-full flex-shrink-0 group-hover:scale-105 transition"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm text-brand-dark truncate group-hover:text-brand-blue transition">
                        {coin.name}
                      </p>
                      <p className="text-[11px] text-slate-400 font-medium truncate mt-0.5">
                        Mkt.Cap {formatCurrency(coin.market_cap, baseCurrency)}
                      </p>
                    </div>
                  </div>

                  {/* 24h Change */}
                  <div className="flex items-center space-x-1 pl-2 flex-shrink-0 text-right">
                    {isPositive ? (
                      <TrendingUp className="w-3.5 h-3.5 text-brand-success" />
                    ) : (
                      <TrendingDown className="w-3.5 h-3.5 text-brand-danger" />
                    )}
                    <span
                      className={`text-xs font-bold ${
                        isPositive ? 'text-brand-success' : 'text-brand-danger'
                      }`}
                    >
                      {Math.abs(coin.price_change_percentage_24h || 0).toFixed(2)}%
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
