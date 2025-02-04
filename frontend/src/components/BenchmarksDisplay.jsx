// src/components/BenchmarksDisplay.jsx
import React from 'react';

const BenchmarksDisplay = ({ benchmarks }) => {
  if (benchmarks.length === 0) return null;
  return (
    <div
      style={{
        margin: '2rem 0',
        padding: '1.5rem',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}
    >
      <h3 style={{ marginBottom: '1rem', color: '#2d3748' }}>Performance Benchmarks:</h3>
      {benchmarks.map((b, i) => (
        <div key={i} style={{ marginBottom: '0.75rem' }}>
          <p style={{ margin: 0 }}>
            <strong>{b.dataset_name}:</strong> {Math.round(b.score * 100)}%
          </p>
          <small style={{ color: '#4a5568' }}>Tested on {b.date_recorded}</small>
        </div>
      ))}
    </div>
  );
};

export default BenchmarksDisplay;