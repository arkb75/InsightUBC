import React, { useState } from 'react';
import {
	TextField,
	Button,
	Typography,
	Snackbar,
	Paper,
	Box,
	Grid,
} from '@mui/material';

const AddDataset = ({ onDatasetAdded }) => {
	const [datasetId, setDatasetId] = useState('');
	const [file, setFile] = useState(null);
	const [feedback, setFeedback] = useState('');

	const handleIdChange = (e) => {
		setDatasetId(e.target.value);
	};

	const handleFileChange = (e) => {
		setFile(e.target.files[0]);
	};

	const isValidId = (id) => {
		return id.trim() !== '' && !id.includes('_');
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!isValidId(datasetId)) {
			setFeedback('Invalid dataset ID.');
			return;
		}

		if (!file) {
			setFeedback('Please select a ZIP file to upload.');
			return;
		}

		try {
			const response = await fetch(
				`http://localhost:4321/dataset/${datasetId}/sections`,
				{
					method: 'PUT',
					headers: {
						'Content-Type': 'application/x-zip-compressed',
					},
					body: file,
				}
			);

			const result = await response.json();

			if (response.ok) {
				setFeedback('Dataset added successfully!');
				onDatasetAdded(); // Notify App.js that a dataset was added
				setDatasetId('');
				setFile(null);
			} else {
				setFeedback(`Error: ${result.error}`);
			}
		} catch (error) {
			setFeedback('An error occurred while adding the dataset.');
		}
	};

	return (
		<Paper elevation={3} style={{ padding: '1rem' }}>
			<Typography variant="h5" gutterBottom>
				Add Dataset
			</Typography>
			<Box component="form" onSubmit={handleSubmit}>
				<Grid container spacing={2}>
					<Grid item xs={12}>
						<TextField
							label="Dataset ID"
							value={datasetId}
							onChange={handleIdChange}
							required
							fullWidth
						/>
					</Grid>
					<Grid item xs={12}>
						<Button variant="contained" component="label" color="primary">
							Upload File
							<input
								type="file"
								accept=".zip"
								hidden
								onChange={handleFileChange}
							/>
						</Button>
						{file && (
							<Typography variant="body2" style={{ marginTop: '0.5rem' }}>
								Selected File: {file.name}
							</Typography>
						)}
					</Grid>
					<Grid item xs={12}>
						<Button
							type="submit"
							variant="contained"
							color="secondary"
							disabled={!datasetId || !file}
						>
							Add Dataset
						</Button>
					</Grid>
				</Grid>
			</Box>
			<Snackbar
				open={!!feedback}
				autoHideDuration={6000}
				message={feedback}
				onClose={() => setFeedback('')}
			/>
		</Paper>
	);
};

export default AddDataset;
