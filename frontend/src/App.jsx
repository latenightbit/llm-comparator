import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

export default function App() {
  // States for calculation, providers, tokens, etc.
  const [results, setResults] = useState([]);
  const [tokens, setTokens] = useState({ input: 1000, output: 500 });
  const [selectedProviders, setSelectedProviders] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [defaultProviders, setDefaultProviders] = useState([]);

  // State for benchmark table data (populated from .json files in your benchmarks folder)
  const [benchmarkTableData, setBenchmarkTableData] = useState([]);
  // State for individual model benchmarks (when clicking "Show Benchmarks") — not used in results table now.
  const [benchmarks, setBenchmarks] = useState([]);

  // Toggle states: all toggles are closed by default.
  // Inner group toggles (by group key)
  const [expandedProviders, setExpandedProviders] = useState({});
  // Outer source toggles ("openRouter" and "custom")
  const [expandedSource, setExpandedSource] = useState({
    openRouter: false,
    custom: false
  });

  // NEW: Toggle for showing/hiding the leaderboard (benchmark comparison table)
  const [showLeaderboard, setShowLeaderboard] = useState(true);

  // Sorting states for the benchmark table.
  const [sortKey, setSortKey] = useState("name");
  const [sortDirection, setSortDirection] = useState("desc");

  // Fetch default providers (e.g., from OpenRouter)
  useEffect(() => {
    async function fetchPricing() {
      try {
        const response = await fetch('http://localhost:8000/pricing');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Fetched default providers:", data);
        setDefaultProviders(data);
      } catch (error) {
        console.error('Error fetching pricing:', error);
        setDefaultProviders([]);
      }
    }
    fetchPricing();
  }, []);

  // Fetch benchmark table data from your backend (which reads the JSON files in the benchmarks folder)
  useEffect(() => {
    async function fetchBenchmarkTable() {
      try {
        const response = await fetch(
          `http://localhost:8000/benchmark-table?sort_key=${sortKey}&direction=${sortDirection}`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Fetched benchmark table data:", data);
        setBenchmarkTableData(data);
      } catch (error) {
        console.error("Error fetching benchmark table data:", error);
      }
    }
    fetchBenchmarkTable();
  }, [sortKey, sortDirection]);

  // Custom providers stored in localStorage
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
    // Do not allow deletion of default (OpenRouter) providers.
    if (index < defaultProviders.length) {
      console.warn("Cannot delete OpenRouter provider");
    } else {
      setCustomProviders(prev =>
        prev.filter((_, i) => i !== index - defaultProviders.length)
      );
    }
    setSelectedProviders(prev =>
      prev.filter(i => i !== index).map(i => (i > index ? i - 1 : i))
    );
  };

  const deleteSelectedProviders = () => {
    const defaultLen = defaultProviders.length;
    const customIndices = selectedProviders
      .filter(index => index >= defaultLen)
      .map(index => index - defaultLen);

    setCustomProviders(prev =>
      prev.filter((_, index) => !customIndices.includes(index))
    );

    setSelectedProviders(prev => {
      const deleted = new Set(customIndices.map(c => c + defaultLen));
      return prev
        .filter(i => !deleted.has(i))
        .map(i => {
          const countBefore = customIndices.filter(c => (c + defaultLen) < i).length;
          return i - countBefore;
        });
    });
  };

  const updateProvider = () => {
    if (editingIndex !== null) {
      const updated = [...customProviders];
      updated[editingIndex] = { ...newProvider };
      setCustomProviders(updated);
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

  // --- Grouping helper ---
  // For grouping providers we use the text before "/" in the model field.
  // If that text includes "mistral" (case-insensitive), force the group key to "Mistral".
  function getGroupKey(provider) {
    if (provider.model && provider.model.includes('/')) {
      const prefix = provider.model.split('/')[0].trim();
      if (prefix.toLowerCase().includes("mistral")) {
        return "Mistral";
      }
      return prefix;
    } else if (provider.name.includes(':')) {
      return provider.name.split(':')[0].trim();
    }
    return provider.name;
  }

  // Toggle functions for inner and outer groups (default closed)
  const toggleProviderGroup = (groupKey) => {
    const isExpanded = expandedProviders[groupKey] === undefined ? false : expandedProviders[groupKey];
    setExpandedProviders(prev => ({
      ...prev,
      [groupKey]: !isExpanded
    }));
  };

  const toggleSourceGroup = (source) => {
    setExpandedSource(prev => ({
      ...prev,
      [source]: !prev[source]
    }));
  };

  // Recalculate results when selectedProviders changes.
  useEffect(() => {
    if (selectedProviders.length > 0) {
      calculateCost();
    } else {
      setResults([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProviders]);

  const calculateCost = async () => {
    if (selectedProviders.length === 0) {
      setResults([]);
      return;
    }
    const allProviders = [...defaultProviders, ...customProviders];
    console.log("All providers:", allProviders);
    const selectedData = allProviders.filter((_, index) =>
      selectedProviders.includes(index)
    );
    console.log("Selected providers data:", selectedData);

    try {
      const response = await fetch('http://localhost:8000/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input_tokens: tokens.input,
          output_tokens: tokens.output,
          custom_providers: selectedData
        })
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log("Calculation response:", data);
      setResults(data);
      setBenchmarks([]);
    } catch (error) {
      console.error("Error during calculation:", error);
      setResults([]);
    }
  };

  // Fetch benchmarks for an individual model (when clicking "Show Benchmarks")
  const handleCalculateBenchmarks = async (modelName) => {
    try {
      const encoded = encodeURIComponent(modelName);
      const benchRes = await fetch(`http://localhost:8000/benchmarks/${encoded}`);
      if (!benchRes.ok) {
        throw new Error(`HTTP error! status: ${benchRes.status}`);
      }
      const benchData = await benchRes.json();
      console.log("Benchmarks for", modelName, ":", benchData);
      setBenchmarks(benchData);
    } catch (error) {
      console.error("Error fetching benchmarks:", error);
      setBenchmarks([]);
    }
  };

  // Select all providers (default + custom)
  const selectAllProviders = () => {
    const total = defaultProviders.length + customProviders.length;
    setSelectedProviders(Array.from({ length: total }, (_, i) => i));
  };

  // Token input change handler
  const handleTokenChange = (type, value) => {
    const newVal = parseInt(value.replace(/,/g, '')) || 0;
    setTokens(prev => ({
      ...prev,
      [type]: newVal
    }));
    if (selectedProviders.length > 0) {
      calculateCost();
    }
  };

  // ===== Prepare filtered and grouped providers =====
  const filteredOpenRouter = defaultProviders
    .filter(provider =>
      provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      provider.model.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .map((provider, i) => ({ ...provider, originalIndex: i }));

  const filteredCustom = customProviders
    .filter(provider =>
      provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      provider.model.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .map((provider, i) => ({ ...provider, originalIndex: defaultProviders.length + i }));

  const groupedOpenRouter = filteredOpenRouter.reduce((acc, provider) => {
    const key = getGroupKey(provider);
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(provider);
    return acc;
  }, {});

  const groupedCustom = filteredCustom.reduce((acc, provider) => {
    const key = getGroupKey(provider);
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(provider);
    return acc;
  }, {});

  // ===== Sorting functions for benchmark table =====
  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDirection(prev => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection("desc");
    }
  };

  // Modified renderSortArrow: Always returns an arrow.
  // For the active column, show ▲ (if ascending) or ▼ (if descending).
  // For non-active columns, display a default down arrow.
  const renderSortArrow = (key) => {
    if (sortKey === key) {
      return sortDirection === "asc" ? " ▲" : " ▼";
    }
    return " ▼";
  };

  return (
    <div
      style={{
        maxWidth: '1080px',
        margin: '0 auto',
        padding: '36px 18px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        fontSize: '0.9rem'
      }}
    >
      <h1 style={{ fontSize: '2.25rem', fontWeight: '700', marginBottom: '1.8rem', color: '#1a1a1a' }}>
        LLM Cost Calculator
      </h1>

      {/* --- Leaderboard Toggle Button --- */}
      <div style={{ marginBottom: '1rem' }}>
        <button
          onClick={() => setShowLeaderboard(prev => !prev)}
          style={{
            padding: '8px 16px',
            backgroundColor: '#3182ce',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '0.95rem',
            cursor: 'pointer'
          }}
        >
          {showLeaderboard ? "Hide Leaderboard" : "Show Leaderboard"}
        </button>
      </div>

      {/* --- Benchmark Comparison Table Section --- */}
      {showLeaderboard && (
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>
            Model Comparison
          </h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#f7fafc' }}>
                <th
                  onClick={() => handleSort("organization")}
                  style={{ padding: '8px', border: '1px solid #e2e8f0', cursor: 'pointer' }}
                >
                  Organization{renderSortArrow("organization")}
                </th>
                <th
                  onClick={() => handleSort("name")}
                  style={{ padding: '8px', border: '1px solid #e2e8f0', cursor: 'pointer' }}
                >
                  Model{renderSortArrow("name")}
                </th>
                <th
                  onClick={() => handleSort("license")}
                  style={{ padding: '8px', border: '1px solid #e2e8f0', cursor: 'pointer' }}
                >
                  License{renderSortArrow("license")}
                </th>
                <th
                  onClick={() => handleSort("parameters")}
                  style={{ padding: '8px', border: '1px solid #e2e8f0', cursor: 'pointer' }}
                >
                  Parameters (B){renderSortArrow("parameters")}
                </th>
                <th
                  onClick={() => handleSort("context")}
                  style={{ padding: '8px', border: '1px solid #e2e8f0', cursor: 'pointer' }}
                >
                  Context{renderSortArrow("context")}
                </th>
                <th
                  onClick={() => handleSort("inputCost")}
                  style={{ padding: '8px', border: '1px solid #e2e8f0', cursor: 'pointer' }}
                >
                  Input $/M{renderSortArrow("inputCost")}
                </th>
                <th
                  onClick={() => handleSort("outputCost")}
                  style={{ padding: '8px', border: '1px solid #e2e8f0', cursor: 'pointer' }}
                >
                  Output $/M{renderSortArrow("outputCost")}
                </th>
                <th
                  onClick={() => handleSort("GPQA")}
                  style={{ padding: '8px', border: '1px solid #e2e8f0', cursor: 'pointer' }}
                >
                  GPQA{renderSortArrow("GPQA")}
                </th>
                <th
                  onClick={() => handleSort("MMLU")}
                  style={{ padding: '8px', border: '1px solid #e2e8f0', cursor: 'pointer' }}
                >
                  MMLU{renderSortArrow("MMLU")}
                </th>
                <th
                  onClick={() => handleSort("MMLUPro")}
                  style={{ padding: '8px', border: '1px solid #e2e8f0', cursor: 'pointer' }}
                >
                  MMLU Pro{renderSortArrow("MMLUPro")}
                </th>
                <th
                  onClick={() => handleSort("DROP")}
                  style={{ padding: '8px', border: '1px solid #e2e8f0', cursor: 'pointer' }}
                >
                  DROP{renderSortArrow("DROP")}
                </th>
                <th
                  onClick={() => handleSort("HumanEval")}
                  style={{ padding: '8px', border: '1px solid #e2e8f0', cursor: 'pointer' }}
                >
                  HumanEval{renderSortArrow("HumanEval")}
                </th>
                <th
                  onClick={() => handleSort("multimodal")}
                  style={{ padding: '8px', border: '1px solid #e2e8f0', cursor: 'pointer', textAlign: 'center' }}
                >
                  Multimodal{renderSortArrow("multimodal")}
                </th>
              </tr>
            </thead>
            <tbody>
              {benchmarkTableData && benchmarkTableData.length > 0 ? (
                benchmarkTableData.map((bench, idx) => {
                  const paramsB = bench.param_count ? (bench.param_count / 1e9).toFixed(0) : '-';
                  const context = bench.input_context_size ? bench.input_context_size.toLocaleString() : '-';
                  const inputCost = (typeof bench.inputCost === 'number')
                    ? `$${bench.inputCost.toFixed(2)}`
                    : '-';
                  const outputCost = (typeof bench.outputCost === 'number')
                    ? `$${bench.outputCost.toFixed(2)}`
                    : '-';

                  const getMetric = (dataset) => {
                    const metric = bench.qualitative_metrics?.find(
                      m => m.dataset_name.toLowerCase() === dataset.toLowerCase()
                    );
                    return metric ? `${(metric.score * 100).toFixed(1)}%` : '-';
                  };

                  return (
                    <tr key={idx}>
                      <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>
                        {bench.organization || '-'}
                      </td>
                      <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>
                        {bench.name || '-'}
                      </td>
                      <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>
                        {bench.license || '-'}
                      </td>
                      <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>
                        {paramsB}
                      </td>
                      <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>
                        {context}
                      </td>
                      <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>
                        {inputCost}
                      </td>
                      <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>
                        {outputCost}
                      </td>
                      <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>
                        {getMetric("GPQA")}
                      </td>
                      <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>
                        {getMetric("MMLU")}
                      </td>
                      <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>
                        {getMetric("MMLU-Pro")}
                      </td>
                      <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>
                        {getMetric("DROP")}
                      </td>
                      <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>
                        {getMetric("HumanEval")}
                      </td>
                      <td style={{ padding: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                        {bench.multimodal ? '✓' : '-'}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="13" style={{ padding: '8px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                    Loading benchmark data...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* --- Token Inputs Section --- */}
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
            <div style={{ marginBottom: '8px', fontWeight: '500', color: '#4a5568' }}>
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

      {/* --- Custom Provider Form Section --- */}
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

      {/* --- Providers Toggle List Section --- */}
      {(filteredOpenRouter.length > 0 || filteredCustom.length > 0) && (
        <div
          style={{
            margin: '1.8rem 0',
            padding: '1.8rem',
            backgroundColor: 'white',
            borderRadius: '10px',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)'
          }}
        >
          {/* Top controls */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.35rem'
            }}
          >
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
          {/* Search input */}
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

          {/* ----- OpenRouter Providers Section ----- */}
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
                      providers.map(
                        ({ name, model, inputCost, outputCost, originalIndex }) => (
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
                        )
                      )}
                  </div>
                ))}
            </div>
          )}

          {/* ----- Custom Providers Section ----- */}
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
                      providers.map(
                        ({ name, model, inputCost, outputCost, originalIndex }) => (
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
                        )
                      )}
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* --- Results Section --- */}
      {results.length > 0 && (
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
              data={{
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
              }}
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
      )}

      {/* --- Benchmarks Display Section --- */}
      {benchmarks.length > 0 && (
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
      )}
    </div>
  );
}