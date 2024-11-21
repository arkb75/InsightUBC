import React, { useEffect, useState } from 'react';
import { Paper, Typography, Box, CircularProgress } from '@mui/material';

const Insights = ({ datasetId }) => {
    const [loading, setLoading] = useState(false);
    const [insights, setInsights] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!datasetId) return;

        // Fetch insights when datasetId changes
        const fetchInsights = async () => {
            setLoading(true);
            setError(null);
            setInsights(null);

            try {
                const query = {
                    WHERE: {
                        GT: {
                            [`${datasetId}_avg`]: 95, // Adjust key dynamically based on the dataset ID
                        },
                    },
                    OPTIONS: {
                        COLUMNS: [`${datasetId}_dept`, `${datasetId}_avg`],
                        ORDER: `${datasetId}_avg`,
                    },
                };

                const response = await fetch('http://localhost:4321/query', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(query),
                });

                const result = await response.json();

                if (response.ok) {
                    setInsights(result.result);
                } else {
                    setError(result.error || 'An error occurred while fetching insights.');
                }
            } catch (err) {
                setError('An unexpected error occurred.');
            } finally {
                setLoading(false);
            }
        };

        fetchInsights();
    }, [datasetId]);

    return (
        <Paper elevation={3} style={{ padding: '1rem' }}>
            <Typography variant="h5" gutterBottom>
                Insights for: {datasetId || 'None'}
            </Typography>
            {loading && <CircularProgress size={20} />}
            {error && <Typography color="error">{error}</Typography>}
            {
                insights && (
                    <Box>
                        {insights.map((item, index) => (
                            <Typography key={index} style={{ fontSize: '0.9rem' }}>
                                {JSON.stringify(item)}
                            </Typography>
                        ))}
                    </Box>
                )
            }
            {
                !datasetId && !loading && (
                    <Typography style={{ fontSize: '0.9rem' }}>
                        Select a dataset to view insights.
                    </Typography>
                )
            }
        </Paper >

    );
};

export default Insights;
