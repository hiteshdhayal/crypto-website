import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchMarkets, 
  fetchChartData, 
  setBaseCurrency, 
  setSearchQuery,
  setSelectedCoins
} from './store/actions';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ChartContainer from './components/ChartContainer';
import PortfolioContainer from './components/PortfolioContainer';
import ExchangeContainer from './components/ExchangeContainer';
import { Search, ChevronDown, Check, AlertTriangle, RefreshCw } from 'lucide-react';

const App = () => {
  const dispatch = useDispatch();

  // Extract Redux State
  const { 
    baseCurrency, 
    selectedCoins, 
    chartPeriod, 
    searchQuery, 
    marketList 
  } = useSelector(state => state.crypto);

  // Local state for currency selector dropdown
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const currencyDropdownRef = useRef(null);

  // Currency options supported
  const currencyOptions = ['USD', 'EUR', 'GBP', 'INR'];

  // Handle clicking outside to close currency dropdown
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (currencyDropdownRef.current && !currencyDropdownRef.current.contains(e.target)) {
        setCurrencyOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // 1. Bootstrapping App Data: Load Markets on mount and when baseCurrency changes
  useEffect(() => {
    dispatch(fetchMarkets(baseCurrency)).then((coins) => {
      // Once coins load, fetch chart data for default selected coins
      if (coins && coins.length > 0) {
        dispatch(fetchChartData(selectedCoins, baseCurrency, chartPeriod));
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseCurrency, dispatch]);

  // 2. Search and Auto-Chart Sync: Updates search filter & updates chart to show typed coin
  const handleSearchChange = (e) => {
    const query = e.target.value;
    dispatch(setSearchQuery(query));

    if (query.trim().length >= 2 && marketList.data) {
      // Find matching coin in our loaded dataset
      const matchedCoin = marketList.data.find(coin => 
        coin.name.toLowerCase().startsWith(query.toLowerCase()) || 
        coin.symbol.toLowerCase() === query.toLowerCase()
      );
      if (matchedCoin) {
        // Automatically update chart to show this coin!
        dispatch(setSelectedCoins([matchedCoin.id]));
      }
    }
  };

  return (
    <div 
      className="min-h-screen flex flex-col font-sans antialiased text-brand-dark pb-12"
      style={{
        backgroundImage: "url('/mount_fuji_bg.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
        backgroundAttachment: 'fixed',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Premium Header */}
      <Header />

      {/* Top Level Global Error Banner (API Rate Limits/Network Errors) */}
      {marketList.error && (
        <div className="max-w-[1600px] mx-auto w-full px-8 mt-6">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl flex items-center justify-between shadow-sm animate-bounce">
            <div className="flex items-center space-x-2.5">
              <AlertTriangle className="w-5 h-5 text-brand-danger flex-shrink-0" />
              <span className="text-xs font-semibold">
                Global Connection Issue: {marketList.error}
              </span>
            </div>
            <button
              onClick={() => dispatch(fetchMarkets(baseCurrency))}
              className="flex items-center space-x-1.5 px-3 py-1 bg-brand-danger text-white rounded-lg text-xs font-bold hover:bg-red-600 transition"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Retry Load</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Dashboard Panel */}
      <main className="max-w-[1600px] mx-auto w-full px-8 flex-1 flex flex-col justify-start mt-6">
        
        {/* Topbar: Currency Dropdown & Search by Coin */}
        <div className="flex items-center space-x-4 mb-6">
          
          {/* Base Currency Dropdown Card */}
          <div className="relative" ref={currencyDropdownRef}>
            <button
              onClick={() => setCurrencyOpen(!currencyOpen)}
              className={`flex items-center space-x-2.5 px-5 py-3 bg-brand-card border border-brand-border rounded-2xl shadow-premium font-extrabold text-sm text-brand-dark hover:bg-slate-50/50 backdrop-blur-md transition ${
                currencyOpen ? 'border-brand-blue ring-2 ring-brand-blue/5' : ''
              }`}
            >
              <span>{baseCurrency.toUpperCase()}</span>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${currencyOpen ? 'rotate-180' : ''}`} />
            </button>

            {currencyOpen && (
              <div className="absolute left-0 mt-2 w-32 bg-brand-card border border-brand-border rounded-2xl shadow-dropdown z-50 p-1 backdrop-blur-md">
                {currencyOptions.map((curr) => {
                  const isSelected = baseCurrency.toUpperCase() === curr;
                  return (
                    <button
                      key={curr}
                      onClick={() => {
                        dispatch(setBaseCurrency(curr));
                        setCurrencyOpen(false);
                      }}
                      className={`flex items-center justify-between w-full px-3 py-2 rounded-xl text-left text-xs font-bold transition ${
                        isSelected 
                          ? 'bg-brand-blue/5 text-brand-blue font-extrabold' 
                          : 'text-slate-600 hover:bg-slate-50/50'
                      }`}
                    >
                      <span>{curr}</span>
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Search by Coin Input Bar */}
          <div className="flex-1 max-w-md flex items-center space-x-2.5 px-4 py-3 bg-brand-card border border-brand-border rounded-2xl shadow-premium backdrop-blur-md">
            <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search by coin"
              className="bg-transparent text-sm w-full font-semibold focus:outline-none text-brand-dark placeholder-slate-400"
            />
          </div>

        </div>

        {/* Core Layout Grid: grid-cols-4 */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          
          {/* Main Area: col-span-3 */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Large Interactive Chart component */}
            <ChartContainer />

            {/* Sub Widgets (Portfolio and Exchange side by side) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <PortfolioContainer />
              <ExchangeContainer />
            </div>

          </div>

          {/* Sidebar Area: col-span-1 */}
          <div className="lg:col-span-1">
            <Sidebar />
          </div>

        </div>

      </main>
    </div>
  );
};

export default App;
