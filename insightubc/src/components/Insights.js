import React from 'react';
import { Typography, Box, Paper, Divider } from '@mui/material';
import { Line, Bar, Pie } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    PointElement,
    LineElement,
    ArcElement,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    PointElement,
    LineElement,
    ArcElement
);

const Insights = ({ datasets }) => {
    return (
        <Paper elevation={3} style={{ padding: '1rem' }}>
            <Typography variant="h5" gutterBottom>
                Insights
            </Typography>
            {datasets.length === 0 ? (
                <Typography variant="body1" color="textSecondary">
                    No datasets added yet. Add a dataset to see insights.
                </Typography>
            ) : (
                datasets.map((dataset, index) => (
                    <Box key={index} mb={4}>
                        <Typography variant="h6" gutterBottom>
                            Dataset {index + 1} Insights
                        </Typography>
                        <Box mt={2} mb={2}>
                            <Line
                                data={{
                                    labels: dataset.labels,
                                    datasets: [
                                        {
                                            label: 'Trend Analysis',
                                            data: dataset.data,
                                            borderColor: 'rgba(75,192,192,1)',
                                            fill: false,
                                        },
                                    ],
                                }}
                                options={{ responsive: true }}
                            />
                        </Box>
                        <Box mt={2} mb={2}>
                            <Bar
                                data={{
                                    labels: dataset.labels,
                                    datasets: [
                                        {
                                            label: 'Category Comparison',
                                            data: dataset.data,
                                            backgroundColor: 'rgba(255,99,132,0.2)',
                                            borderColor: 'rgba(255,99,132,1)',
                                            borderWidth: 1,
                                        },
                                    ],
                                }}
                                options={{ responsive: true }}
                            />
                        </Box>
                        <Box mt={2} mb={2}>
                            <Pie
                                data={{
                                    labels: dataset.labels,
                                    datasets: [
                                        {
                                            label: 'Proportions',
                                            data: dataset.data,
                                            backgroundColor: [
                                                'rgba(255,99,132,0.2)',
                                                'rgba(54,162,235,0.2)',
                                                'rgba(255,206,86,0.2)',
                                                'rgba(75,192,192,0.2)',
                                            ],
                                        },
                                    ],
                                }}
                                options={{ responsive: true }}
                            />
                        </Box>
                        <Divider style={{ margin: '1rem 0' }} />
                    </Box>
                ))
            )}
        </Paper>
    );
};

export default Insights;
