import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

export default function App() {
  const [results, setResults] = useState([]);
  const [tokens, setTokens] = useState({ input: 1000, output: 500 });
  const [selectedProviders, setSelectedProviders] = useState([]);
  const [searchQuery, setSearchQuery] = useState(''); // Add search state here

  // Fetch default providers from your backend (/pricing)
  const [defaultProviders, setDefaultProviders] = useState([]);
  
  useEffect(() => {
    async function fetchPricing() {
      try {
        const response = await fetch('http://localhost:8000/pricing');  // Changed back to port 8000
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Fetched default providers:", data);
        setDefaultProviders(data);
      } catch (error) {
        console.error('Error fetching pricing:', error);
        setDefaultProviders([]); // Set empty array on error
      }
    }
    fetchPricing();
  }, []);

  // Custom providers (persisted to localStorage)
  const [customProviders, setCustomProviders] = useState(() => {
    const saved = localStorage.getItem('customProviders');
    return saved ? JSON.parse(saved) : [];
  });
  const [newProvider, setNewProvider] = useState({
    name: '',
    model: '',
    inputCost: 0,
    outputCost: 0
  });
  const [editingIndex, setEditingIndex] = useState(null);
  
  // Persist customProviders in localStorage
  useEffect(() => {
    localStorage.setItem('customProviders', JSON.stringify(customProviders));
  }, [customProviders]);

  const editProvider = (index) => {
    setNewProvider({ ...customProviders[index] });
    setEditingIndex(index);
  };

  const cancelEdit = () => {
    setNewProvider({ name: '', model: '', inputCost: 0, outputCost: 0 });
    setEditingIndex(null);
  };

  const deleteProvider = (index) => {
    setCustomProviders(prevProviders => prevProviders.filter((_, i) => i !== index));
    setSelectedProviders(prev =>
      prev
        .filter(i => i !== index)
        .map(i => i > index ? i - 1 : i)
    );
  };

  const deleteSelectedProviders = () => {
    const defaultLen = defaultProviders.length;
    
    // Get indices of selected custom providers
    const customIndices = selectedProviders
      .filter(index => index >= defaultLen)
      .map(index => index - defaultLen);

    // Delete from customProviders
    setCustomProviders(prev => 
      prev.filter((_, index) => !customIndices.includes(index))
    );

    // Update selectedProviders state
    setSelectedProviders(prev => {
      const deletedIndices = new Set(customIndices.map(c => c + defaultLen));
      return prev
        .filter(i => !deletedIndices.has(i))
        .map(i => {
          const numDeletedBefore = customIndices.filter(c => (c + defaultLen) < i).length;
          return i - numDeletedBefore;
        });
    });
  };

  const updateProvider = () => {
    if (editingIndex !== null) {
      const updatedProviders = [...customProviders];
      updatedProviders[editingIndex] = { ...newProvider };
      setCustomProviders(updatedProviders);
      setNewProvider({ name: '', model: '', inputCost: 0, outputCost: 0 });
      setEditingIndex(null);
    }
  };

  const addCustomProvider = () => {
    if (newProvider.name && newProvider.model) {
      if (editingIndex !== null) {
        updateProvider();
      } else {
        setCustomProviders([...customProviders, { ...newProvider }]);
        setNewProvider({ name: '', model: '', inputCost: 0, outputCost: 0 });
      }
    }
  };

  const deselectAllProviders = () => {
    setSelectedProviders([]);
  };

  const toggleProvider = (index) => {
    setSelectedProviders(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  // When selectedProviders changes, recalculate or clear results.
  useEffect(() => {
    if (selectedProviders.length > 0) {
      calculateCost();
    } else {
      setResults([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProviders]);

  // Calculate cost function – exits early if no providers are selected.
  const calculateCost = async () => {
    if (selectedProviders.length === 0) {
      setResults([]);
      return;
    }
    // Combine default (dynamic) providers with custom ones.
    const allProviders = [...defaultProviders, ...customProviders];
    console.log("All providers:", allProviders);
    const selectedProvidersData = allProviders.filter((_, index) => 
      selectedProviders.includes(index)
    );
    console.log("Selected providers data:", selectedProvidersData);

    try {
      const response = await fetch('http://localhost:8000/calculate', {  // Changed back to port 8000
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input_tokens: tokens.input,
          output_tokens: tokens.output,
          custom_providers: selectedProvidersData
        })
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log("Calculation response:", data);
      setResults(data);
    } catch (error) {
      console.error("Error during calculation:", error);
      setResults([]); // Set empty array on error
    }
  };

  // Select all providers (both default and custom)
  const selectAllProviders = () => {
    const totalProviders = defaultProviders.length + customProviders.length;
    setSelectedProviders(Array.from({ length: totalProviders }, (_, i) => i));
  };

  // Token input change handler to trigger recalculation
  const handleTokenChange = (type, value) => {
    const newValue = parseInt(value.replace(/,/g, '')) || 0;
    setTokens(prev => ({
      ...prev,
      [type]: newValue
    }));
    if (selectedProviders.length > 0) {
      calculateCost();
    }
  };

  return (
    <div
      style={{
        maxWidth: '1080px',
        margin: '0 auto',
        padding: '36px 18px',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        fontSize: '0.9rem'
      }}
    >
      <h1
        style={{
          fontSize: '2.25rem',
          fontWeight: '700',
          marginBottom: '1.8rem',
          color: '#1a1a1a'
        }}
      >
        LLM Cost Calculator
      </h1>

      {/* Token inputs container */}
      <div
        style={{
          margin: '1.8rem 0',
          padding: '1.8rem',
          backgroundColor: 'white',
          borderRadius: '10px',
          boxShadow:
            '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
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
            <div
              style={{
                marginBottom: '8px',
                fontWeight: '500',
                color: '#4a5568'
              }}
            >
              Input Tokens
            </div>
            <input
              type="text"
              value={tokens.input.toLocaleString()}
              onChange={e =>
                setTokens({
                  ...tokens,
                  input: parseInt(e.target.value.replace(/,/g, '')) || 0
                })
              }
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
            <div
              style={{
                marginBottom: '8px',
                fontWeight: '500',
                color: '#4a5568'
              }}
            >
              Output Tokens
            </div>
            <input
              type="text"
              value={tokens.output.toLocaleString()}
              onChange={e =>
                setTokens({
                  ...tokens,
                  output: parseInt(e.target.value.replace(/,/g, '')) || 0
                })
              }
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
              backgroundColor:
                selectedProviders.length === 0 ? '#a0aec0' : '#3182ce',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '0.95rem',
              fontWeight: '500',
              cursor:
                selectedProviders.length === 0 ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s',
              minWidth: '120px'
            }}
          >
            Calculate
          </button>
        </div>
      </div>

      {/* Custom provider form */}
      <div
        style={{
          margin: '2rem 0',
          padding: '2rem',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow:
            '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
        }}
      >
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <h3
            style={{
              fontSize: '1.35rem',
              fontWeight: '600',
              marginBottom: '1.35rem',
              color: '#2d3748'
            }}
          >
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
              onChange={e =>
                setNewProvider({ ...newProvider, name: e.target.value })
              }
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
              onChange={e =>
                setNewProvider({ ...newProvider, model: e.target.value })
              }
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
                  inputCost: Math.max(
                    0,
                    Number(parseFloat(e.target.value).toFixed(2))
                  )
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
                  outputCost: Math.max(
                    0,
                    Number(parseFloat(e.target.value).toFixed(2))
                  )
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
          <div
            style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'center',
              marginTop: '40px'
            }}
          >
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

      {/* Remove this incorrect state declaration */}
      {/* // Add this new state for search
          const [searchQuery, setSearchQuery] = useState(''); */}
      
      {/* Providers list */}
      {(defaultProviders.length > 0 || customProviders.length > 0) && (
        <div
          style={{
            margin: '1.8rem 0',
            padding: '1.8rem',
            backgroundColor: 'white',
            borderRadius: '10px',
            boxShadow:
              '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.35rem'
            }}
          >
            <h3
              style={{
                fontSize: '1.35rem',
                fontWeight: '600',
                color: '#2d3748'
              }}
            >
              Providers
            </h3>
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
          
          {/* Add search input */}
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
          <div style={{ display: 'grid', gap: '14px' }}>
            {[...defaultProviders, ...customProviders]
              .filter(provider => 
                provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                provider.model.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((provider, index) => (
                <div
                  key={index}
                  style={{
                    padding: '14px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '7px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    border: '1px solid #e2e8f0'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <input
                      type="checkbox"
                      checked={selectedProviders.includes(index)}
                      onChange={() => toggleProvider(index)}
                      style={{
                        width: '16px',
                        height: '16px',
                        cursor: 'pointer'
                      }}
                    />
                    <div>
                      <strong style={{ fontSize: '1rem', color: '#2d3748' }}>
                        {provider.name} - {provider.model}
                      </strong>
                      <div style={{ marginTop: '4px', color: '#4a5568', fontSize: '0.85rem' }}>
                        Input Cost: ${provider.inputCost} / Output Cost: ${provider.outputCost}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => editProvider(index)}
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
                      onClick={() => deleteProvider(index)}
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
              ))}
          </div>
        </div>
      )}

      {/* Results section */}
      {results.length > 0 && (
        <div
          style={{
            margin: '2rem 0',
            padding: '2rem',
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow:
              '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
          }}
        >
          <div style={{ height: '400px', marginBottom: '2rem' }}>
            <Bar
              data={{
                labels: results.map(r => `${r.provider} - ${r.model}`),
                datasets: [{
                  label: 'Total Cost ($)',
                  data: results.map(r => r.total_cost),
                  backgroundColor: [
                    '#3182ce', '#38a169', '#805ad5', '#d53f8c', '#d69e2e',
                    '#319795', '#744210', '#2c5282', '#285e61', '#702459'
                  ].slice(0, results.length)
                }]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    titleFont: { size: 14, weight: 'bold' },
                    bodyFont: { size: 13 },
                    callbacks: {
                      label: (context) => {
                        const value = context.raw;
                        const minCost = Math.min(...results.map(r => r.total_cost));
                        const timesMoreExpensive = (value / minCost).toFixed(2);
                        return value === minCost
                          ? `$${value.toFixed(5)} (Cheapest)`
                          : `$${value.toFixed(5)} (${timesMoreExpensive}x more expensive)`;
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
                <th style={{ padding: '16px', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>Provider</th>
                <th style={{ padding: '16px', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>Cost</th>
                <th style={{ padding: '16px', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>Input</th>
                <th style={{ padding: '16px', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>Output</th>
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
      )}
    </div>
  );
}