import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import FeaturesGrid from './components/FeaturesGrid';
import Footer from './components/Footer';

import BenchmarkTable from './components/BenchmarkTable';
import TokenInputs from './components/TokenInputs';
import ProviderList from './components/ProviderList';
import CustomProviderForm from './components/CustomProviderForm';
import ResultsChart from './components/ResultsChart';
import BenchmarksDisplay from './components/BenchmarksDisplay';

export default function App() {
    // States for calculation, providers, tokens, etc.
    const [results, setResults] = useState([]);
    const [tokens, setTokens] = useState({ input: 1000, output: 500 });
    const [selectedProviders, setSelectedProviders] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [defaultProviders, setDefaultProviders] = useState([]);

    // Benchmark table data & individual benchmarks
    const [benchmarkTableData, setBenchmarkTableData] = useState([]);
    const [benchmarks, setBenchmarks] = useState([]);

    // Toggle states
    const [expandedProviders, setExpandedProviders] = useState({});
    const [expandedSource, setExpandedSource] = useState({
        openRouter: false,
        custom: false
    });
    const [showLeaderboard, setShowLeaderboard] = useState(true);

    // Sorting states for benchmark table
    const [sortKey, setSortKey] = useState("name");
    const [sortDirection, setSortDirection] = useState("desc");

    // Fetch default providers (OpenRouter pricing)
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

    // Fetch benchmark table data
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

    // Provider editing functions
    const editProvider = (index) => {
        // For default providers, do nothing (or warn)
        const allProviders = [...defaultProviders, ...customProviders];
        setNewProvider({ ...allProviders[index] });
        setEditingIndex(index - defaultProviders.length);
    };

    const cancelEdit = () => {
        setNewProvider({ name: '', model: '', inputCost: 0, outputCost: 0 });
        setEditingIndex(null);
    };

    const deleteProvider = (index) => {
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

    // Grouping helper
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

    const [resultsState, setResultsState] = useState([]);

    const [calcLoading, setCalcLoading] = useState(false);
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
            setCalcLoading(true);
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
        } finally {
            setCalcLoading(false);
        }
    };

    // Fetch benchmarks for an individual model
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

    const selectAllProviders = () => {
        const total = defaultProviders.length + customProviders.length;
        setSelectedProviders(Array.from({ length: total }, (_, i) => i));
    };

    // Sorting functions for benchmark table
    const handleSort = (key) => {
        if (sortKey === key) {
            setSortDirection(prev => (prev === "asc" ? "desc" : "asc"));
        } else {
            setSortKey(key);
            setSortDirection("desc");
        }
    };

    const renderSortArrow = (key) => {
        if (sortKey === key) {
            return sortDirection === "asc" ? " ▲" : " ▼";
        }
        return " ▼";
    };

    // Prepare filtered and grouped providers
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
        .map((provider, i) => ({ ...provider, originalIndex: i }));

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

    return (
        <div style={{ fontFamily: 'inherit' }}>
            {/* 1. Nav + hero + logos + dev pitch */}
            <Header />

            {/* 2. Features Section */}
            <FeaturesGrid />

            {/* 3. The cost calculator sections */}
            <div 
                className="container calculator-root" 
                style={{ 
                    padding: '2rem 0',
                    scrollMarginTop: '100px'  // Adds space for fixed header
                }}
                id="calculator-root"
            >
                {/* Benchmark Table */}
                <BenchmarkTable
                    benchmarkTableData={benchmarkTableData}
                    handleSort={handleSort}
                    sortKey={sortKey}
                    sortDirection={sortDirection}
                    renderSortArrow={renderSortArrow}
                    showLeaderboard={showLeaderboard}
                    toggleShowLeaderboard={setShowLeaderboard}
                />

                {/* Price Calculator Title - ADDED HERE */}
                <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>
                    Price Calculator
                </h2>

                {/* Token Inputs */}
                <TokenInputs
                    tokens={tokens}
                    setTokens={setTokens}
                    calculateCost={calculateCost}
                    selectedProviders={selectedProviders}
                />

                {/* Custom Provider Form */}
                <CustomProviderForm
                    newProvider={newProvider}
                    setNewProvider={setNewProvider}
                    editingIndex={editingIndex}
                    addCustomProvider={addCustomProvider}
                    cancelEdit={cancelEdit}
                />

                {/* Providers List */}
                {(filteredOpenRouter.length > 0 || filteredCustom.length > 0) && (
                    <ProviderList
                        filteredOpenRouter={filteredOpenRouter}
                        filteredCustom={filteredCustom}
                        expandedSource={expandedSource}
                        toggleSourceGroup={toggleSourceGroup}
                        groupedOpenRouter={groupedOpenRouter}
                        groupedCustom={groupedCustom}
                        expandedProviders={expandedProviders}
                        toggleProviderGroup={toggleProviderGroup}
                        toggleProvider={toggleProvider}
                        selectedProviders={selectedProviders}
                        editProvider={editProvider}
                        deleteProvider={deleteProvider}
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        selectAllProviders={selectAllProviders}
                        deselectAllProviders={deselectAllProviders}
                        deleteSelectedProviders={deleteSelectedProviders}
                    />
                )}

                {/* Results Section */}
                {results.length > 0 && (
                    <ResultsChart results={results} />
                )}

                {/* Benchmarks Display */}
                {benchmarks.length > 0 && (
                    <BenchmarksDisplay benchmarks={benchmarks} />
                )}
            </div>

            {/* 4. Footer */}
            <Footer />
        </div>
    );
}