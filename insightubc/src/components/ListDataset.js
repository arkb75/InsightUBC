import React, { useEffect, useState } from 'react';
import {
	Typography,
	Paper,
	List,
	ListItem,
	ListItemText,
	IconButton,
	Snackbar,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

const ListDataset = () => {
	const [datasets, setDatasets] = useState([]);
	const [feedback, setFeedback] = useState('');

	const fetchDatasets = async () => {
		try {
			const response = await fetch('http://localhost:4321/datasets');
			const result = await response.json();

			if (response.ok) {
				setDatasets(result.result);
			} else {
				setFeedback(`Error: ${result.error}`);
			}
		} catch (error) {
			console.error('Fetch error:', error);
			setFeedback('An error occurred while fetching datasets.');
		}
	};

	useEffect(() => {
		fetchDatasets();
	}, []);

	const handleRemove = async (id) => {
		try {
			const response = await fetch(`/dataset/${id}`, {
				method: 'DELETE',
			});

			const result = await response.json();

			if (response.ok) {
				setFeedback(`Dataset ${id} removed successfully.`);
				setDatasets(datasets.filter((ds) => ds.id !== id));
			} else {
				setFeedback(`Error: ${result.error}`);
			}
		} catch (error) {
			setFeedback('An error occurred while removing the dataset.');
		}
	};

	return (
		<Paper elevation={3} style={{ padding: '1rem', marginTop: '2rem' }}>
			<Typography variant="h5" gutterBottom>
				Added Datasets
			</Typography>
			{datasets.length === 0 ? (
				<Typography variant="body1">No datasets added.</Typography>
			) : (
				<List>
					{datasets.map((dataset) => (
						<ListItem
							key={dataset.id}
							secondaryAction={
								<IconButton
									edge="end"
									aria-label="delete"
									onClick={() => handleRemove(dataset.id)}
								>
									<DeleteIcon />
								</IconButton>
							}
						>
							<ListItemText
								primary={dataset.id}
								secondary={`Kind: ${dataset.kind}, Rows: ${dataset.numRows}`}
							/>
						</ListItem>
					))}
				</List>
			)}
			<Snackbar
				open={!!feedback}
				autoHideDuration={6000}
				message={feedback}
				onClose={() => setFeedback('')}
			/>
		</Paper>
	);
};

export default ListDataset;
