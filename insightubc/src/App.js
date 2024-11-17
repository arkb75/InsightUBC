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

function App() {
	const [mode, setMode] = useState(() => {
		return localStorage.getItem('themeMode') || 'light';
	});
	const [updateList, setUpdateList] = useState(false);

	useEffect(() => {
		localStorage.setItem('themeMode', mode);
	}, [mode]);

	const handleDatasetAdded = () => {
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
				<Grid container spacing={4}>
					<Grid item xs={12}>
						<AddDataset onDatasetAdded={handleDatasetAdded} />
					</Grid>
					<Grid item xs={12}>
						<ListDataset key={updateList} />
					</Grid>
				</Grid>
			</Container>
		</ThemeProvider>
	);
}

export default App;
