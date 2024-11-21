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
import Insights from './Insights';

const ListDataset = ({ datasets, onSelectDataset }) => {
	const [feedback, setFeedback] = useState('');

	const handleViewInsights = (id) => {
		onSelectDataset(datasets.find((ds) => ds.id === id)); // Pass selected dataset to parent
	};

	return (
		<Box display="flex" flexDirection="column" flexGrow={1}>
			<Paper elevation={3} style={{ padding: '1rem', marginTop: '2rem' }}>
				<Typography variant="h5" gutterBottom>
					Added Datasets
				</Typography>
				{datasets.length === 0 ? (
					<Typography variant="body1">No datasets added.</Typography>
				) : (
					<List>
						{datasets.map((dataset) => (
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
		</Box>
	);
};

export default ListDataset;
