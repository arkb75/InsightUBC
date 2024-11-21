import React, { useEffect, useState } from 'react';
import { Paper, Typography, Box, CircularProgress, TextField, MenuItem, Button, Grid } from '@mui/material';

const Insights = ({ datasetId }) => {
    const [loading, setLoading] = useState(false);
    const [insights, setInsights] = useState(null);
    const [error, setError] = useState(null);
    const [insightType, setInsightType] = useState('');
    const [department, setDepartment] = useState('');
    const [gradeThreshold, setGradeThreshold] = useState('');
    const [order, setOrder] = useState('UP');

    useEffect(() => {
        const fetchInsights = async () => {
            if (!datasetId || !insightType || !department) return;

            setLoading(true);
            setError(null);
            setInsights(null);

            try {
                let query = {};
                if (insightType === 'topCourses') {
                    query = {
                        WHERE: {
                            AND: [
                                { IS: { [`${datasetId}_dept`]: department } },
                                ...(gradeThreshold ? [{ GT: { [`${datasetId}_avg`]: Number(gradeThreshold) } }] : [])
                            ],
                        },
                        OPTIONS: {
                            COLUMNS: [`${datasetId}_dept`, `${datasetId}_avg`, `${datasetId}_title`],
                            ORDER: {
                                dir: order,
                                keys: [`${datasetId}_avg`],
                            },
                        },
                    };
                } else if (insightType === 'topProfessors') {
                    query = {
                        WHERE: {
                            IS: {
                                [`${datasetId}_course`]: department,
                            },
                        },
                        OPTIONS: {
                            COLUMNS: [`${datasetId}_instructor`, `${datasetId}_avg`],
                            ORDER: {
                                dir: order,
                                keys: [`${datasetId}_avg`],
                            },
                        },
                    };
                }
                // Add other types of queries as needed

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
    }, [datasetId, insightType, department, gradeThreshold, order]);

    const handleGradeThresholdChange = (event) => {
        const value = event.target.value;
        if (!value || /^[0-9]*\.?[0-9]+$/.test(value)) {
            setGradeThreshold(value);
            setError(null);
        } else {
            setError('Invalid grade threshold. Please enter a valid number.');
        }
    };

    return (
        <Paper elevation={3} style={{ padding: '1rem' }}>
            <Typography variant="h5" gutterBottom>
                Insights for: {datasetId || 'None'}
            </Typography>
            <Box display="flex" flexDirection="column" gap="1rem">
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={6}>
                        <TextField
                            select
                            label="Insight Type"
                            value={insightType}
                            onChange={(e) => setInsightType(e.target.value)}
                            variant="outlined"
                            fullWidth
                            size="small"
                        >
                            <MenuItem value="topCourses">Top Courses for a Department</MenuItem>
                            <MenuItem value="topProfessors">Top Professors for a Course</MenuItem>
                            {/* Add other types as needed */}
                        </TextField>
                    </Grid>
                    {insightType && (
                        <>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    label={insightType === 'topCourses' ? "Department" : "Course"}
                                    value={department}
                                    onChange={(e) => setDepartment(e.target.value)}
                                    variant="outlined"
                                    fullWidth
                                    size="small"
                                />
                            </Grid>
                            {insightType === 'topCourses' && (
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        label="Grade Threshold"
                                        value={gradeThreshold}
                                        onChange={handleGradeThresholdChange}
                                        variant="outlined"
                                        fullWidth
                                        size="small"
                                        error={!!error}
                                        helperText={error}
                                    />
                                </Grid>
                            )}
                            <Grid item xs={12} md={6}>
                                <TextField
                                    select
                                    label="Order"
                                    value={order}
                                    onChange={(e) => setOrder(e.target.value)}
                                    variant="outlined"
                                    fullWidth
                                    size="small"
                                >
                                    <MenuItem value="UP">Ascending</MenuItem>
                                    <MenuItem value="DOWN">Descending</MenuItem>
                                </TextField>
                            </Grid>
                        </>
                    )}
                    <Grid item xs={12}>
                        <Button variant="contained" color="primary" onClick={() => { }} fullWidth>
                            Apply
                        </Button>
                    </Grid>
                </Grid>
            </Box>
            {loading && <CircularProgress size={20} />}
            {error && <Typography color="error">{error}</Typography>}
            {
                insights && (
                    <Box mt={2}>
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
        </Paper>
    );
};

export default Insights;
