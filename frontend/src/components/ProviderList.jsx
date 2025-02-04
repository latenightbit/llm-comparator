// src/components/ProviderList.jsx
import React from 'react';

const ProviderList = ({
  filteredOpenRouter,
  filteredCustom,
  expandedSource,
  toggleSourceGroup,
  groupedOpenRouter,
  groupedCustom,
  expandedProviders,
  toggleProviderGroup,
  toggleProvider,
  selectedProviders,
  editProvider,
  deleteProvider,
  searchQuery,
  setSearchQuery,
  selectAllProviders,
  deselectAllProviders,
  deleteSelectedProviders
}) => {
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
      {/* Top Controls */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.35rem'
      }}>
        <h3 style={{ fontSize: '1.35rem', fontWeight: '600', color: '#2d3748' }}>Providers</h3>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={selectAllProviders}
            style={{
              padding: '6px 12px',
              backgroundColor: '#4a5568',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              fontSize: '0.85rem',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            Select All
          </button>
          <button
            onClick={deselectAllProviders}
            style={{
              padding: '6px 12px',
              backgroundColor: '#4a5568',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              fontSize: '0.85rem',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            Deselect All
          </button>
          <button
            onClick={deleteSelectedProviders}
            disabled={selectedProviders.length === 0}
            style={{
              padding: '6px 12px',
              backgroundColor: selectedProviders.length === 0 ? '#CBD5E0' : '#718096',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              fontSize: '0.85rem',
              fontWeight: '500',
              cursor: selectedProviders.length === 0 ? 'not-allowed' : 'pointer',
              opacity: selectedProviders.length === 0 ? 0.6 : 1
            }}
          >
            Delete Selected
          </button>
        </div>
      </div>
      {/* Search Input */}
      <div style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search providers..."
          style={{
            width: '100%',
            padding: '8px 12px',
            borderRadius: '6px',
            border: '1px solid #e2e8f0',
            fontSize: '0.95rem'
          }}
        />
      </div>

      {/* OpenRouter Providers */}
      {filteredOpenRouter.length > 0 && (
        <div style={{ marginBottom: '1rem' }}>
          <div
            onClick={() => toggleSourceGroup('openRouter')}
            style={{
              padding: '14px',
              backgroundColor: '#cbd5e0',
              borderRadius: '7px',
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontWeight: 'bold',
              color: '#2d3748'
            }}
          >
            <span>OpenRouter Providers</span>
            <span>{expandedSource.openRouter ? '▼' : '►'}</span>
          </div>
          {expandedSource.openRouter &&
            Object.entries(groupedOpenRouter).map(([groupKey, providers]) => (
              <div
                key={`openRouter-${groupKey}`}
                style={{
                  backgroundColor: '#f8fafc',
                  borderRadius: '7px',
                  border: '1px solid #e2e8f0',
                  marginTop: '8px'
                }}
              >
                <div
                  onClick={() => toggleProviderGroup(`openRouter-${groupKey}`)}
                  style={{
                    padding: '14px',
                    backgroundColor: '#f1f5f9',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontWeight: 'bold',
                    color: '#2d3748'
                  }}
                >
                  <span>{groupKey}</span>
                  <span>
                    {(expandedProviders[`openRouter-${groupKey}`] === undefined ||
                      expandedProviders[`openRouter-${groupKey}`])
                      ? '▼'
                      : '►'}
                  </span>
                </div>
                {(expandedProviders[`openRouter-${groupKey}`] === undefined ||
                  expandedProviders[`openRouter-${groupKey}`]) &&
                  providers.map(({ name, model, inputCost, outputCost, originalIndex }) => (
                    <div
                      key={originalIndex}
                      style={{
                        padding: '14px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderTop: '1px solid #e2e8f0'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <input
                          type="checkbox"
                          checked={selectedProviders.includes(originalIndex)}
                          onChange={() => toggleProvider(originalIndex)}
                          style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                        />
                        <div>
                          <div style={{ fontSize: '1rem', color: '#2d3748' }}>{model}</div>
                          <div style={{ marginTop: '4px', color: '#4a5568', fontSize: '0.85rem' }}>
                            Input Cost: ${inputCost} / Output Cost: ${outputCost}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => editProvider(originalIndex)}
                          style={{
                            padding: '7px 14px',
                            backgroundColor: '#ed8936',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            fontSize: '0.85rem',
                            fontWeight: '500',
                            cursor: 'pointer'
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteProvider(originalIndex)}
                          style={{
                            padding: '7px 14px',
                            backgroundColor: '#e53e3e',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            fontSize: '0.85rem',
                            fontWeight: '500',
                            cursor: 'pointer'
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                }
              </div>
            ))
          }
        </div>
      )}

      {/* Custom Providers */}
      {filteredCustom.length > 0 && (
        <div style={{ marginBottom: '1rem' }}>
          <div
            onClick={() => toggleSourceGroup('custom')}
            style={{
              padding: '14px',
              backgroundColor: '#cbd5e0',
              borderRadius: '7px',
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontWeight: 'bold',
              color: '#2d3748'
            }}
          >
            <span>Custom Providers</span>
            <span>{expandedSource.custom ? '▼' : '►'}</span>
          </div>
          {expandedSource.custom &&
            Object.entries(groupedCustom).map(([groupKey, providers]) => (
              <div
                key={`custom-${groupKey}`}
                style={{
                  backgroundColor: '#f8fafc',
                  borderRadius: '7px',
                  border: '1px solid #e2e8f0',
                  marginTop: '8px'
                }}
              >
                <div
                  onClick={() => toggleProviderGroup(`custom-${groupKey}`)}
                  style={{
                    padding: '14px',
                    backgroundColor: '#f1f5f9',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontWeight: 'bold',
                    color: '#2d3748'
                  }}
                >
                  <span>{groupKey}</span>
                  <span>
                    {(expandedProviders[`custom-${groupKey}`] === undefined ||
                      expandedProviders[`custom-${groupKey}`])
                      ? '▼'
                      : '►'}
                  </span>
                </div>
                {(expandedProviders[`custom-${groupKey}`] === undefined ||
                  expandedProviders[`custom-${groupKey}`]) &&
                  providers.map(({ name, model, inputCost, outputCost, originalIndex }) => (
                    <div
                      key={originalIndex}
                      style={{
                        padding: '14px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderTop: '1px solid #e2e8f0'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <input
                          type="checkbox"
                          checked={selectedProviders.includes(originalIndex)}
                          onChange={() => toggleProvider(originalIndex)}
                          style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                        />
                        <div>
                          <div style={{ fontSize: '1rem', color: '#2d3748' }}>{model}</div>
                          <div style={{ marginTop: '4px', color: '#4a5568', fontSize: '0.85rem' }}>
                            Input Cost: ${inputCost} / Output Cost: ${outputCost}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => editProvider(originalIndex)}
                          style={{
                            padding: '7px 14px',
                            backgroundColor: '#ed8936',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            fontSize: '0.85rem',
                            fontWeight: '500',
                            cursor: 'pointer'
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteProvider(originalIndex)}
                          style={{
                            padding: '7px 14px',
                            backgroundColor: '#e53e3e',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            fontSize: '0.85rem',
                            fontWeight: '500',
                            cursor: 'pointer'
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                }
              </div>
            ))
          }
        </div>
      )}

    </div>
  );
};

export default ProviderList;