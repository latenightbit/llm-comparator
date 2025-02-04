// src/components/TokenInputs.jsx
import React from 'react';

const TokenInputs = ({ tokens, setTokens, calculateCost, selectedProviders }) => {
  const handleInputChange = (type, value) => {
    const newVal = parseInt(value.replace(/,/g, '')) || 0;
    setTokens(prev => ({
      ...prev,
      [type]: newVal
    }));
  };

  return (
    <div
      style={{
        margin: '1.8rem 0',
        padding: '1.8rem',
        backgroundColor: 'white',
        borderRadius: '10px',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)'
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: '40px',
          alignItems: 'flex-end',
          maxWidth: '1100px',
          margin: '0 auto'
        }}
      >
        <div style={{ flex: 1 }}>
          <div style={{ marginBottom: '8px', fontWeight: '500', color: '#4a5568' }}>
            Input Tokens
          </div>
          <input
            type="text"
            value={tokens.input.toLocaleString()}
            onChange={e => handleInputChange('input', e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #e2e8f0',
              fontSize: '0.95rem'
            }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ marginBottom: '8px', fontWeight: '500', color: '#4a5568' }}>
            Output Tokens
          </div>
          <input
            type="text"
            value={tokens.output.toLocaleString()}
            onChange={e => handleInputChange('output', e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #e2e8f0',
              fontSize: '0.95rem'
            }}
          />
        </div>
        <button
          onClick={calculateCost}
          disabled={selectedProviders.length === 0}
          style={{
            padding: '8px 20px',
            backgroundColor: selectedProviders.length === 0 ? '#a0aec0' : '#3182ce',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '0.95rem',
            fontWeight: '500',
            cursor: selectedProviders.length === 0 ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.2s',
            minWidth: '120px'
          }}
        >
          Calculate
        </button>
      </div>
    </div>
  );
};

export default TokenInputs;