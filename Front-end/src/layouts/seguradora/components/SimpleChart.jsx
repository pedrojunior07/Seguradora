// components/charts/SimpleChart.jsx
import React from 'react';

const SimpleChart = () => {
  const data = [65, 59, 80, 81, 56, 55, 40, 70, 85, 90, 95, 88];
  const maxValue = Math.max(...data);
  
  return (
    <div className="relative h-48 w-full">
      <div className="flex items-end justify-between h-32 px-4 border-b border-l">
        {data.map((value, index) => (
          <div key={index} className="flex flex-col items-center">
            <div
              className="w-4 bg-blue-500 rounded-t"
              style={{ height: `${(value / maxValue) * 100}%` }}
            />
            <span className="text-xs mt-1 text-gray-500">
              {['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'][index]}
            </span>
          </div>
        ))}
      </div>
      <div className="text-center mt-4 text-sm text-gray-600">
        Distribuição mensal de sinistros no último ano
      </div>
    </div>
  );
};

export default SimpleChart;