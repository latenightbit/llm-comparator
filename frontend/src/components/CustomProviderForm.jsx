// src/components/CustomProviderForm.jsx
import React from 'react';

const CustomProviderForm = ({
  newProvider,
  setNewProvider,
  editingIndex,
  addCustomProvider,
  cancelEdit
}) => {
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
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <h3 style={{ fontSize: '1.35rem', fontWeight: '600', marginBottom: '1.35rem', color: '#2d3748' }}>
          {editingIndex !== null ? 'Edit Provider' : 'Add Custom Provider'}
        </h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '40px',
            marginBottom: '20px'
          }}
        >
          <input
            type="text"
            value={newProvider.name}
            onChange={e => setNewProvider({ ...newProvider, name: e.target.value })}
            placeholder="Provider Name"
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #e2e8f0',
              fontSize: '0.95rem'
            }}
          />
          <input
            type="text"
            value={newProvider.model}
            onChange={e => setNewProvider({ ...newProvider, model: e.target.value })}
            placeholder="Model Name"
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #e2e8f0',
              fontSize: '0.95rem'
            }}
          />
          <input
            type="number"
            value={newProvider.inputCost}
            onChange={e =>
              setNewProvider({
                ...newProvider,
                inputCost: Math.max(0, Number(parseFloat(e.target.value).toFixed(2)))
              })
            }
            min="0"
            step="0.01"
            placeholder="Input Cost Per Million Tokens (USD)"
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #e2e8f0',
              fontSize: '0.95rem'
            }}
          />
          <input
            type="number"
            value={newProvider.outputCost}
            onChange={e =>
              setNewProvider({
                ...newProvider,
                outputCost: Math.max(0, Number(parseFloat(e.target.value).toFixed(2)))
              })
            }
            min="0"
            step="0.01"
            placeholder="Output Cost Per Million Tokens (USD)"
            style={{
              width: '100%',
              padding: '7px 11px',
              borderRadius: '5px',
              border: '1px solid #e2e8f0',
              fontSize: '0.85rem'
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '40px' }}>
          <button
            onClick={addCustomProvider}
            style={{
              padding: '8px 20px',
              backgroundColor: '#3182ce',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '0.95rem',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            {editingIndex !== null ? 'Update Provider' : 'Add Provider'}
          </button>
          {editingIndex !== null && (
            <button
              onClick={cancelEdit}
              style={{
                padding: '8px 20px',
                backgroundColor: '#e53e3e',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '0.95rem',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Cancel Edit
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomProviderForm;