import React, { useEffect, useState } from 'react';
import {
	Typography,
	Paper,
	List,
	ListItem,
	ListItemText,
	IconButton,
	Snackbar,
	Box,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

const ListDataset = ({ datasetsUpdated, onSelectDataset }) => {
	const [localDatasets, setLocalDatasets] = useState([]);
	const [feedback, setFeedback] = useState('');

	// Fetch datasets from the server
	const fetchDatasets = async () => {
		try {
			const response = await fetch('http://localhost:4321/datasets');
			const result = await response.json();

			if (response.ok) {
				setLocalDatasets(result.result);
			} else {
				setFeedback(`Error: ${result.error}`);
			}
		} catch (error) {
			setFeedback('An error occurred while fetching datasets.');
		}
	};

	useEffect(() => {
		fetchDatasets();
	}, [datasetsUpdated]); // Re-fetch datasets when datasetsUpdated changes

	// Remove a dataset
	const handleRemove = async (id) => {
		try {
			const response = await fetch(`http://localhost:4321/dataset/${id}`, {
				method: 'DELETE',
			});
			const result = await response.json();

			if (response.ok) {
				setFeedback(`Dataset ${id} removed successfully.`);
				fetchDatasets(); // Re-fetch datasets after deletion
			} else {
				setFeedback(`Error: ${result.error}`);
			}
		} catch (error) {
			setFeedback('An error occurred while removing the dataset.');
		}
	};

	// Handle viewing insights
	const handleViewInsights = (id) => {
		onSelectDataset(localDatasets.find((ds) => ds.id === id)); // Pass selected dataset to parent
	};

	return (
		<Box display="flex" flexDirection="column" flexGrow={1}>
			<Paper elevation={3} style={{ padding: '1rem', marginTop: '2rem' }}>
				<Typography variant="h5" gutterBottom>
					Added Datasets
				</Typography>
				{localDatasets.length === 0 ? (
					<Typography variant="body1">No datasets added.</Typography>
				) : (
					<List>
						{localDatasets.map((dataset) => (
							<ListItem key={dataset.id}>
								<Box
									display="flex"
									justifyContent="space-between"
									alignItems="center"
									width="100%"
								>
									<Box>
										<ListItemText
											primary={dataset.id}
											secondary={`Kind: ${dataset.kind}, Rows: ${dataset.numRows}`}
										/>
									</Box>
									<Box>
										<IconButton
											edge="end"
											color="primary"
											onClick={() => handleViewInsights(dataset.id)} // Trigger onSelectDataset
										>
											View
										</IconButton>
										<IconButton
											edge="end"
											aria-label="delete"
											onClick={() => handleRemove(dataset.id)}
										>
											<DeleteIcon />
										</IconButton>
									</Box>
								</Box>
							</ListItem>
						))}
					</List>
				)}
			</Paper>
			<Snackbar
				open={!!feedback}
				autoHideDuration={6000}
				message={feedback}
				onClose={() => setFeedback('')}
			/>
		</Box>
	);
};

export default ListDataset;
