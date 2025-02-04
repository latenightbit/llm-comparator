import React from 'react';

const BenchmarkTable = ({ benchmarkTableData, handleSort, sortKey, sortDirection, renderSortArrow, showLeaderboard, toggleShowLeaderboard }) => {
    const getMetric = (bench, dataset) => {
        const metric = bench.qualitative_metrics?.find(
            m => m.dataset_name.toLowerCase() === dataset.toLowerCase()
        );
        return metric ? `${(metric.score * 100).toFixed(1)}%` : '-';
    };

    return (
        <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>
                Model Comparison
            </h2>
            {/* Leaderboard Toggle Button - Moved here */}
            <div style={{ marginBottom: '1rem' }}>
                <button
                    onClick={() => toggleShowLeaderboard(!showLeaderboard)}
                    className="btn btn-primary"
                    style={{ fontWeight: '600' }}
                >
                    {showLeaderboard ? "Hide Leaderboard" : "Show Leaderboard"}
                </button>
            </div>

            {/* Conditionally render the entire table based on showLeaderboard */}
            {showLeaderboard && (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f7fafc' }}>
                            <th onClick={() => handleSort("organization")} style={{ padding: '8px', border: '1px solid #e2e8f0', cursor: 'pointer' }}>
                                Organization{renderSortArrow("organization")}
                            </th>
                            <th onClick={() => handleSort("name")} style={{ padding: '8px', border: '1px solid #e2e8f0', cursor: 'pointer' }}>
                                Model{renderSortArrow("name")}
                            </th>
                            <th onClick={() => handleSort("license")} style={{ padding: '8px', border: '1px solid #e2e8f0', cursor: 'pointer' }}>
                                License{renderSortArrow("license")}
                            </th>
                            <th onClick={() => handleSort("parameters")} style={{ padding: '8px', border: '1px solid #e2e8f0', cursor: 'pointer' }}>
                                Parameters (B){renderSortArrow("parameters")}
                            </th>
                            <th onClick={() => handleSort("context")} style={{ padding: '8px', border: '1px solid #e2e8f0', cursor: 'pointer' }}>
                                Context{renderSortArrow("context")}
                            </th>
                            <th onClick={() => handleSort("inputCost")} style={{ padding: '8px', border: '1px solid #e2e8f0', cursor: 'pointer' }}>
                                Input $/M{renderSortArrow("inputCost")}
                            </th>
                            <th onClick={() => handleSort("outputCost")} style={{ padding: '8px', border: '1px solid #e2e8f0', cursor: 'pointer' }}>
                                Output $/M{renderSortArrow("outputCost")}
                            </th>
                            <th onClick={() => handleSort("GPQA")} style={{ padding: '8px', border: '1px solid #e2e8f0', cursor: 'pointer' }}>
                                GPQA{renderSortArrow("GPQA")}
                            </th>
                            <th onClick={() => handleSort("MMLU")} style={{ padding: '8px', border: '1px solid #e2e8f0', cursor: 'pointer' }}>
                                MMLU{renderSortArrow("MMLU")}
                            </th>
                            <th onClick={() => handleSort("MMLUPro")} style={{ padding: '8px', border: '1px solid #e2e8f0', cursor: 'pointer' }}>
                                MMLU Pro{renderSortArrow("MMLUPro")}
                            </th>
                            <th onClick={() => handleSort("DROP")} style={{ padding: '8px', border: '1px solid #e2e8f0', cursor: 'pointer' }}>
                                DROP{renderSortArrow("DROP")}
                            </th>
                            <th onClick={() => handleSort("HumanEval")} style={{ padding: '8px', border: '1px solid #e2e8f0', cursor: 'pointer' }}>
                                HumanEval{renderSortArrow("HumanEval")}
                            </th>
                            <th onClick={() => handleSort("multimodal")} style={{ padding: '8px', border: '1px solid #e2e8f0', cursor: 'pointer', textAlign: 'center' }}>
                                Multimodal{renderSortArrow("multimodal")}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* Conditionally render table rows based on benchmarkData */}
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
                                            {getMetric(bench, "GPQA")}
                                        </td>
                                        <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>
                                            {getMetric(bench, "MMLU")}
                                        </td>
                                        <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>
                                            {getMetric(bench, "MMLU-Pro")}
                                        </td>
                                        <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>
                                            {getMetric(bench, "DROP")}
                                        </td>
                                        <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>
                                            {getMetric(bench, "HumanEval")}
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
            )}
        </div>
    );
};

export default BenchmarkTable;