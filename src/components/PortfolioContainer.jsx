import React from 'react';
import { useSelector } from 'react-redux';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

// Currency multipliers for representation (static fallbacks for high stability)
const CURRENCY_DETAILS = {
  USD: { symbol: '$', rate: 1 },
  EUR: { symbol: '€', rate: 0.92 },
  GBP: { symbol: '£', rate: 0.79 },
  INR: { symbol: '₹', rate: 83.5 }
};

const PortfolioContainer = () => {
  const { baseCurrency } = useSelector(state => state.crypto);
  
  const curr = baseCurrency.toUpperCase();
  const symbol = CURRENCY_DETAILS[curr]?.symbol || '$';
  const rate = CURRENCY_DETAILS[curr]?.rate || 1;

  // Base USD holdings
  const holdingsUSD = {
    Tether: 250,
    Luna: 375,
    Ethereum: 375
  };

  // Convert holdings based on selected currency
  const tetherValue = holdingsUSD.Tether * rate;
  const lunaValue = holdingsUSD.Luna * rate;
  const ethereumValue = holdingsUSD.Ethereum * rate;
  const totalValue = tetherValue + lunaValue + ethereumValue;

  const data = {
    labels: ['Tether', 'Luna', 'Ethereum'],
    datasets: [
      {
        data: [tetherValue, lunaValue, ethereumValue],
        backgroundColor: [
          '#186ade', // Brand Blue (matching Tether in our system)
          '#ef4444', // Red (matching Luna)
          '#10b981', // Green (matching Ethereum)
        ],
        hoverBackgroundColor: [
          '#1353b0',
          '#d32f2f',
          '#0891b2',
        ],
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // Custom legends below look much cleaner!
      },
      tooltip: {
        backgroundColor: '#0b1329',
        titleFont: { family: 'Inter', size: 12, weight: 'bold' },
        bodyFont: { family: 'Inter', size: 12 },
        padding: 12,
        cornerRadius: 12,
        callbacks: {
          label: function (context) {
            const val = context.parsed;
            const percentage = ((val / totalValue) * 100).toFixed(0);
            return ` ${context.label}: ${symbol}${val.toLocaleString(undefined, { maximumFractionDigits: 0 })} (${percentage}%)`;
          }
        }
      }
    },
    cutout: '0%', // Traditional pie chart
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-premium border border-brand-border h-[260px] flex flex-col min-w-0">
      
      {/* Title Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-brand-dark tracking-tight">
          Portfolio
        </h3>
        <span className="text-xs text-slate-400 font-semibold">
          Total value <span className="text-brand-dark font-extrabold">{symbol}{totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
        </span>
      </div>

      {/* Main Pie Chart & custom Legends */}
      <div className="flex items-center justify-between flex-1 min-h-0">
        
        {/* Left Side: Chart canvas */}
        <div className="w-[120px] h-[120px] relative flex-shrink-0">
          <Pie data={data} options={options} />
        </div>

        {/* Right Side: Custom Styled Legends */}
        <div className="flex-1 pl-6 space-y-2.5">
          {[
            { name: 'Tether', val: tetherValue, color: 'bg-brand-blue' },
            { name: 'Luna', val: lunaValue, color: 'bg-brand-danger' },
            { name: 'Ethereum', val: ethereumValue, color: 'bg-brand-success' }
          ].map((item) => (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center space-x-2 min-w-0">
                <span className={`w-3 h-3 rounded-full ${item.color} flex-shrink-0`} />
                <span className="text-xs font-semibold text-slate-500 truncate">{item.name}</span>
              </div>
              <span className="text-xs font-bold text-brand-dark pl-2 flex-shrink-0">
                {symbol}{item.val.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
            </div>
          ))}
        </div>

      </div>

    </div>
  );
};

export default PortfolioContainer;
