import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Line, Bar } from 'react-chartjs-2';
import { 
  setChartPeriod, 
  setChartType, 
  toggleSelectedCoin 
} from '../store/actions';
import { 
  Calendar, 
  ChevronDown, 
  Check, 
  Search, 
  Loader2, 
  AlertCircle,
  TrendingUp
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const colorsPalette = [
  { stroke: '#186ade', fill: 'rgba(24, 106, 222, 0.05)', raw: '#186ade' }, // Blue
  { stroke: '#ef4444', fill: 'rgba(239, 68, 68, 0.05)', raw: '#ef4444' }, // Red
  { stroke: '#10b981', fill: 'rgba(16, 185, 129, 0.05)', raw: '#10b981' }, // Green
  { stroke: '#f59e0b', fill: 'rgba(245, 158, 11, 0.05)', raw: '#f59e0b' }, // Orange
  { stroke: '#8b5cf6', fill: 'rgba(139, 92, 246, 0.05)', raw: '#8b5cf6' }, // Purple
];

const ChartContainer = () => {
  const dispatch = useDispatch();
  
  // Redux state
  const { 
    chartData, 
    selectedCoins, 
    chartPeriod, 
    chartType, 
    baseCurrency, 
    marketList 
  } = useSelector(state => state.crypto);

  // Local UI State
  const [cryptoDropdownOpen, setCryptoDropdownOpen] = useState(false);
  const [chartTypeDropdownOpen, setChartTypeDropdownOpen] = useState(false);
  const [dropdownSearch, setDropdownSearch] = useState('');

  // Refs for closing dropdowns when clicking outside
  const cryptoDropdownRef = useRef(null);
  const chartTypeDropdownRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cryptoDropdownRef.current && !cryptoDropdownRef.current.contains(event.target)) {
        setCryptoDropdownOpen(false);
      }
      if (chartTypeDropdownRef.current && !chartTypeDropdownRef.current.contains(event.target)) {
        setChartTypeDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Format dates for labels
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    if (chartPeriod === '1D') {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    if (chartPeriod === '1W') {
      return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
    }
    if (chartPeriod === '1M') {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
    return date.toLocaleDateString([], { year: '2-digit', month: 'short' });
  };

  // Build labels and datasets
  let labels = [];
  const datasets = [];

  // Generate dataset for each selected coin if chartData has loaded successfully
  if (selectedCoins && selectedCoins.length > 0 && chartData.data && !chartData.loading && !chartData.error) {
    selectedCoins.forEach((coinId, index) => {
      const coinChart = chartData.data[coinId];
      if (coinChart && coinChart.prices && coinChart.prices.length > 0) {
        // Use first selected coin to set up labels
        if (labels.length === 0) {
          labels = coinChart.prices.map(item => formatTimestamp(item[0]));
        }

        const color = colorsPalette[index % colorsPalette.length];
        const coinMeta = marketList.data.find(c => c.id === coinId);
        const displayName = coinMeta ? coinMeta.name : coinId.charAt(0).toUpperCase() + coinId.slice(1);

        datasets.push({
          label: displayName,
          data: coinChart.prices.map(item => item[1]),
          borderColor: color.stroke,
          backgroundColor: chartType === 'bar' ? color.raw : color.fill,
          fill: chartType === 'line',
          tension: 0.3,
          pointRadius: chartPeriod === '1D' ? 1 : 2,
          pointHoverRadius: 6,
          borderWidth: 2,
        });
      }
    });
  }

  const data = {
    labels,
    datasets,
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        align: 'end',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 20,
          font: {
            family: 'Inter',
            size: 11,
            weight: '600'
          },
          color: '#475569'
        }
      },
      tooltip: {
        backgroundColor: '#0b1329',
        titleFont: { family: 'Inter', size: 12, weight: 'bold' },
        bodyFont: { family: 'Inter', size: 12 },
        padding: 12,
        cornerRadius: 12,
        displayColors: true,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('en-US', { 
                style: 'currency', 
                currency: baseCurrency.toUpperCase() 
              }).format(context.parsed.y);
            }
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: { family: 'Inter', size: 10, weight: '500' },
          color: '#94a3b8',
          maxTicksLimit: 8
        }
      },
      y: {
        grid: {
          color: '#f1f5f9'
        },
        ticks: {
          font: { family: 'Inter', size: 10, weight: '500' },
          color: '#94a3b8',
          callback: function(value) {
            const symbolMap = { USD: '$', EUR: '€', GBP: '£', INR: '₹' };
            const symbol = symbolMap[baseCurrency.toUpperCase()] || '$';
            if (value >= 1000) return `${symbol}${(value / 1000).toFixed(0)}K`;
            return `${symbol}${value}`;
          }
        }
      }
    }
  };

  // Find currently selected coin names for cryptocurrency dropdown display
  const selectedCoinNames = selectedCoins.map(id => {
    const coin = marketList.data.find(c => c.id === id);
    return coin ? coin.name : id;
  });

  const dropdownLabel = selectedCoinNames.length === 0
    ? 'Cryptocurrency'
    : selectedCoinNames.length <= 2
      ? selectedCoinNames.join(', ')
      : `${selectedCoinNames.length} Cryptos`;

  // Filter available coins inside dropdown search
  const filteredDropdownCoins = marketList.data.filter(coin => 
    coin.name.toLowerCase().includes(dropdownSearch.toLowerCase()) ||
    coin.symbol.toLowerCase().includes(dropdownSearch.toLowerCase())
  );

  return (
    <div className="bg-white rounded-3xl p-6 shadow-premium border border-brand-border flex flex-col h-[420px]">
      
      {/* Chart Top Controls Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        
        {/* Left: Time Period selection capsules */}
        <div className="flex items-center space-x-1.5 bg-slate-50 p-1 rounded-2xl border border-slate-100 self-start">
          {['1D', '1W', '1M', '6M', '1Y'].map((p) => {
            const isActive = chartPeriod === p;
            return (
              <button
                key={p}
                onClick={() => dispatch(setChartPeriod(p))}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-white text-brand-blue border border-brand-blue/20 shadow-sm'
                    : 'text-slate-500 hover:text-brand-dark'
                }`}
              >
                {p}
              </button>
            );
          })}
          {/* Calendar icon button */}
          <button className="p-1.5 text-slate-400 hover:text-brand-blue transition rounded-xl">
            <Calendar className="w-4 h-4" />
          </button>
        </div>

        {/* Right: Dropdowns */}
        <div className="flex items-center space-x-3 self-end md:self-auto">
          
          {/* Cryptocurrency Dropdown (Multi-select) */}
          <div className="relative" ref={cryptoDropdownRef}>
            <button
              onClick={() => setCryptoDropdownOpen(!cryptoDropdownOpen)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl bg-slate-50 border text-xs font-semibold text-brand-dark shadow-sm hover:bg-slate-100 transition-all ${
                cryptoDropdownOpen ? 'border-brand-blue bg-white ring-2 ring-brand-blue/5' : 'border-slate-100'
              }`}
            >
              <span className="max-w-[120px] truncate">{dropdownLabel}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${cryptoDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {cryptoDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-brand-border rounded-2xl shadow-dropdown z-30 p-2 animate-in fade-in duration-100">
                {/* Search input inside dropdown */}
                <div className="flex items-center space-x-2 px-3 py-2 bg-slate-50 rounded-xl mb-2 border border-slate-100">
                  <Search className="w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={dropdownSearch}
                    onChange={(e) => setDropdownSearch(e.target.value)}
                    placeholder="Search coins..."
                    className="bg-transparent text-xs w-full focus:outline-none text-brand-dark font-medium placeholder-slate-400"
                  />
                </div>

                {/* Coins checklist */}
                <div className="max-h-48 overflow-y-auto space-y-0.5 custom-scrollbar pr-1">
                  {marketList.loading && (
                    <div className="flex justify-center items-center py-4">
                      <Loader2 className="w-5 h-5 text-brand-blue animate-spin" />
                    </div>
                  )}

                  {!marketList.loading && filteredDropdownCoins.length === 0 && (
                    <div className="text-center py-4 text-xs text-slate-400 font-medium">
                      No coins found
                    </div>
                  )}

                  {!marketList.loading && filteredDropdownCoins.map((coin) => {
                    const isChecked = selectedCoins.includes(coin.id);
                    return (
                      <div
                        key={coin.id}
                        onClick={() => dispatch(toggleSelectedCoin(coin.id))}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer text-xs font-semibold transition ${
                          isChecked 
                            ? 'bg-brand-blue/5 text-brand-blue' 
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5 truncate">
                          <img src={coin.image} alt={coin.name} className="w-5 h-5 rounded-full flex-shrink-0" />
                          <span className="truncate">{coin.name}</span>
                        </div>
                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                          isChecked 
                            ? 'border-brand-blue bg-brand-blue text-white' 
                            : 'border-slate-300 bg-white'
                        }`}>
                          {isChecked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Chart Type Dropdown (Line/Bar) */}
          <div className="relative" ref={chartTypeDropdownRef}>
            <button
              onClick={() => setChartTypeDropdownOpen(!chartTypeDropdownOpen)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl bg-slate-50 border text-xs font-semibold text-brand-dark shadow-sm hover:bg-slate-100 transition-all ${
                chartTypeDropdownOpen ? 'border-brand-blue bg-white ring-2 ring-brand-blue/5' : 'border-slate-100'
              }`}
            >
              <span className="capitalize">{chartType} chart</span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${chartTypeDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {chartTypeDropdownOpen && (
              <div className="absolute right-0 mt-2 w-36 bg-white border border-brand-border rounded-xl shadow-dropdown z-30 p-1 animate-in fade-in duration-100">
                {['line', 'bar'].map((type) => {
                  const isChecked = chartType === type;
                  return (
                    <button
                      key={type}
                      onClick={() => {
                        dispatch(setChartType(type));
                        setChartTypeDropdownOpen(false);
                      }}
                      className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-left text-xs font-semibold transition ${
                        isChecked 
                          ? 'bg-brand-blue/5 text-brand-blue' 
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className="capitalize">{type}</span>
                      {isChecked && <Check className="w-3.5 h-3.5" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Chart Canvas Area */}
      <div className="flex-1 relative min-h-0 flex items-center justify-center">
        
        {/* Loading Spinner */}
        {chartData.loading && (
          <div className="absolute inset-0 bg-white/70 flex flex-col items-center justify-center z-10 space-y-2">
            <Loader2 className="w-8 h-8 text-brand-blue animate-spin stroke-[2.5]" />
            <span className="text-xs font-semibold text-slate-500">Fetching live market data...</span>
          </div>
        )}

        {/* Error Banner */}
        {!chartData.loading && chartData.error && (
          <div className="bg-red-50 text-red-500 rounded-2xl p-6 text-sm font-semibold border border-red-100 flex flex-col items-center text-center max-w-md mx-auto shadow-sm">
            <AlertCircle className="w-8 h-8 text-brand-danger mb-2 stroke-[2.5]" />
            <p className="mb-4">{chartData.error}</p>
            <button
              onClick={() => dispatch(setChartPeriod(chartPeriod))}
              className="px-4 py-2 bg-brand-danger text-white text-xs font-bold rounded-xl hover:bg-red-600 transition shadow-sm"
            >
              Retry Connection
            </button>
          </div>
        )}

        {/* Empty state */}
        {!chartData.loading && !chartData.error && datasets.length === 0 && (
          <div className="text-center text-slate-400 font-semibold text-sm flex flex-col items-center">
            <TrendingUp className="w-8 h-8 text-slate-300 mb-2" />
            <span>Select at least one cryptocurrency to render chart analytics</span>
          </div>
        )}

        {/* Actual Chart render */}
        {!chartData.loading && !chartData.error && datasets.length > 0 && (
          <div className="w-full h-full">
            {/* Absolute indicator for Y-axis currency */}
            <div className="absolute left-0 top-0 text-[10px] font-bold text-slate-400 tracking-wider">
              {baseCurrency.toUpperCase()}
            </div>
            
            {chartType === 'line' ? (
              <Line data={data} options={chartOptions} />
            ) : (
              <Bar data={data} options={chartOptions} />
            )}
          </div>
        )}
      </div>

    </div>
  );
};

export default ChartContainer;
