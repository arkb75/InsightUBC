import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import {
	Container,
	Grid,
	AppBar,
	Toolbar,
	Typography,
	IconButton,
	Switch,
	CssBaseline,
} from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import AddDataset from './components/AddDataset';
import ListDataset from './components/ListDataset';
import Insights from './components/Insights';

function App() {
	const [mode, setMode] = useState(() => {
		return localStorage.getItem('themeMode') || 'light';
	});
	const [datasets, setDatasets] = useState([]);
	const [updateList, setUpdateList] = useState(false);

	useEffect(() => {
		localStorage.setItem('themeMode', mode);
	}, [mode]);

	const handleDatasetAdded = (newDataset) => {
		setDatasets((prev) => [...prev, newDataset]);
		setUpdateList((prev) => !prev);
	};

	const colorMode = {
		toggleColorMode: () => {
			setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
		},
	};

	const theme = createTheme({
		palette: {
			mode: mode,
			primary: {
				main: '#4285F4',
			},
			secondary: {
				main: '#DB4437',
			},
			background: {
				default: mode === 'light' ? '#fafafa' : '#303030',
				paper: mode === 'light' ? '#fff' : '#424242',
			},
		},
		typography: {
			fontFamily: 'Roboto, sans-serif',
		},
	});

	return (
		<ThemeProvider theme={theme}>
			<CssBaseline />
			<AppBar position="static">
				<Toolbar>
					<Typography variant="h6" style={{ flexGrow: 1 }}>
						InsightUBC - Dataset Manager
					</Typography>
					<IconButton
						edge="end"
						color="inherit"
						aria-label="mode"
						onClick={colorMode.toggleColorMode}
					>
						{mode === 'light' ? <Brightness7Icon /> : <Brightness4Icon />}
					</IconButton>
					<Switch
						checked={mode === 'dark'}
						onChange={colorMode.toggleColorMode}
						color="default"
					/>
				</Toolbar>
			</AppBar>
			<Container maxWidth="md" style={{ marginTop: '2rem' }}>
				<Grid container spacing={4} alignItems="flex-start">
					<Grid item xs={12} md={6}>
						<AddDataset onDatasetAdded={handleDatasetAdded} />
						<ListDataset key={updateList} />
					</Grid>
					<Grid item xs={12} md={6}>
						<Insights datasets={datasets} />
					</Grid>
				</Grid>
			</Container>
		</ThemeProvider>
	);
}

export default App;
