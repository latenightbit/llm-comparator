// src/components/ResultsChart.jsx
import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

const ResultsChart = ({ results }) => {
  const chartData = {
    labels: results.map(r => `${r.provider} - ${r.model}`),
    datasets: [
      {
        label: 'Total Cost ($)',
        data: results.map(r => r.total_cost),
        backgroundColor: [
          '#3182ce',
          '#38a169',
          '#805ad5',
          '#d53f8c',
          '#d69e2e',
          '#319795',
          '#744210',
          '#2c5282',
          '#285e61',
          '#702459'
        ].slice(0, results.length)
      }
    ]
  };

  return (
    <div
      style={{
        margin: '2rem 0',
        padding: '2rem',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)'
      }}
    >
      <div style={{ height: '400px', marginBottom: '2rem' }}>
        <Bar
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                backgroundColor: 'rgba(0,0,0,0.8)',
                padding: 12,
                titleFont: { size: 14, weight: 'bold' },
                bodyFont: { size: 13 },
                callbacks: {
                  label: (context) => {
                    const value = context.raw;
                    const minCost = Math.min(...results.map(r => r.total_cost));
                    const multiplier = (value / minCost).toFixed(2);
                    return value === minCost
                      ? `$${value.toFixed(5)} (Cheapest)`
                      : `$${value.toFixed(5)} (${multiplier}x more expensive)`;
                  }
                }
              }
            }
          }}
        />
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
        <thead>
          <tr style={{ backgroundColor: '#f7fafc' }}>
            <th style={{ padding: '16px', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>
              Provider
            </th>
            <th style={{ padding: '16px', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>
              Cost
            </th>
            <th style={{ padding: '16px', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>
              Input
            </th>
            <th style={{ padding: '16px', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>
              Output
            </th>
          </tr>
        </thead>
        <tbody>
          {results.map((result, i) => (
            <tr key={i} style={{ borderBottom: '1px solid #e2e8f0' }}>
              <td style={{ padding: '16px' }}>{result.provider}</td>
              <td style={{ padding: '16px' }}>${result.total_cost.toFixed(5)}</td>
              <td style={{ padding: '16px' }}>${result.input_cost.toFixed(5)}</td>
              <td style={{ padding: '16px' }}>${result.output_cost.toFixed(5)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ResultsChart;