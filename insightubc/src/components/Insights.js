import React, { useEffect, useState } from 'react';
import {
	Paper,
	Typography,
	Box,
	CircularProgress,
	TextField,
	MenuItem,
	Grid,
} from '@mui/material';
import { Line, Bar } from 'react-chartjs-2';
import Chart from 'chart.js/auto';

const Insights = ({ datasetId }) => {
	const [loading, setLoading] = useState(false);
	const [insights, setInsights] = useState(null);
	const [error, setError] = useState(null);
	const [insightType, setInsightType] = useState('');
	const [department, setDepartment] = useState('');
	const [gradeThreshold, setGradeThreshold] = useState('');
	const [order, setOrder] = useState('DOWN'); // Default to 'DOWN' for pass count
	const [courseId, setCourseId] = useState('');
	const [chartData, setChartData] = useState(null);
	const [barChartData, setBarChartData] = useState(null);
	const [horizontalBarChartData, setHorizontalBarChartData] = useState(null);

	useEffect(() => {
		const fetchInsights = async () => {
			if (
				!datasetId ||
				!insightType ||
				(!department && insightType !== 'averageByYears') ||
				(insightType === 'averageByYears' && (!courseId || !department)) ||
				(insightType === 'topProfessors' && (!department || !courseId)) ||
				(insightType === 'coursesByPassCount' && !department)
			)
				return;

			setLoading(true);
			setError(null);
			setInsights(null);
			setChartData(null);
			setBarChartData(null);
			setHorizontalBarChartData(null);

			try {
				// Use department and courseId as is, since case sensitivity may cause issues
				const departmentValue = department.trim();
				const courseIdValue = courseId.trim();

				let query = {};
				if (insightType === 'topCourses') {
					query = {
						WHERE: {
							AND: [
								{ IS: { [`${datasetId}_dept`]: departmentValue } },
								...(gradeThreshold
									? [{ GT: { [`${datasetId}_avg`]: Number(gradeThreshold) } }]
									: []),
							],
						},
						OPTIONS: {
							COLUMNS: [`${datasetId}_dept`, `${datasetId}_id`, `${datasetId}_avg`],
							ORDER: {
								dir: order,
								keys: [`${datasetId}_avg`],
							},
						},
					};
				} else if (insightType === 'topProfessors') {
					query = {
						WHERE: {
							AND: [
								{ IS: { [`${datasetId}_dept`]: departmentValue } },
								{ IS: { [`${datasetId}_id`]: courseIdValue } },
							],
						},
						TRANSFORMATIONS: {
							GROUP: [`${datasetId}_instructor`],
							APPLY: [{ averageavg: { AVG: `${datasetId}_avg` } }],
						},
						OPTIONS: {
							COLUMNS: [`${datasetId}_instructor`, `averageavg`],
							ORDER: {
								dir: order,
								keys: [`averageavg`],
							},
						},
					};
				} else if (insightType === 'averageByYears') {
					query = {
						WHERE: {
							AND: [
								{ IS: { [`${datasetId}_dept`]: departmentValue } },
								{ IS: { [`${datasetId}_id`]: courseIdValue } },
								{ GT: { [`${datasetId}_year`]: 1900 } },
							],
						},
						TRANSFORMATIONS: {
							GROUP: [`${datasetId}_year`],
							APPLY: [{ averageavg: { AVG: `${datasetId}_avg` } }],
						},
						OPTIONS: {
							COLUMNS: [`${datasetId}_year`, `averageavg`],
							ORDER: {
								dir: 'UP',
								keys: [`${datasetId}_year`],
							},
						},
					};
				} else if (insightType === 'coursesByPassCount') {
					query = {
						WHERE: {
							AND: [
								{ IS: { [`${datasetId}_dept`]: departmentValue } },
								{ GT: { [`${datasetId}_avg`]: 49 } },
							],
						},
						TRANSFORMATIONS: {
							GROUP: [`${datasetId}_dept`, `${datasetId}_id`],
							APPLY: [
								{
									passCount: {
										COUNT: `${datasetId}_uuid`,
									},
								},
							],
						},
						OPTIONS: {
							COLUMNS: [`${datasetId}_dept`, `${datasetId}_id`, 'passCount'],
							ORDER: {
								dir: order, // Use the user's selected order
								keys: ['passCount'],
							},
						},
					};
				}

				// Uncomment the next line to see the generated query in the console
				// console.log(JSON.stringify(query, null, 2));

				const response = await fetch('http://localhost:4321/query', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(query),
				});

				const result = await response.json();

				if (response.ok) {
					if (result.result.length === 0) {
						setError('No data found for the selected criteria.');
						setLoading(false);
						return;
					}

					setInsights(result.result);

					if (insightType === 'topCourses') {
						const ids = result.result.map((item) => item[`${datasetId}_id`]);
						const averages = result.result.map((item) => item[`${datasetId}_avg`]);
						setBarChartData({
							labels: ids,
							datasets: [
								{
									label: `Top Courses in ${department}`,
									data: averages,
									backgroundColor: 'rgba(75, 192, 192, 0.2)',
									borderColor: 'rgba(75, 192, 192, 1)',
									borderWidth: 1,
								},
							],
						});
					} else if (insightType === 'topProfessors') {
						const instructors = result.result.map(
							(item) => item[`${datasetId}_instructor`]
						);
						const averages = result.result.map((item) => item[`averageavg`]);
						setHorizontalBarChartData({
							labels: instructors,
							datasets: [
								{
									label: `Top Professors for ${department} ${courseId}`,
									data: averages,
									backgroundColor: 'rgba(75, 192, 192, 0.2)',
									borderColor: 'rgba(75, 192, 192, 1)',
									borderWidth: 1,
								},
							],
						});
					} else if (insightType === 'averageByYears') {
						const years = result.result.map((item) => item[`${datasetId}_year`]);
						const averages = result.result.map((item) => item[`averageavg`]);
						setChartData({
							labels: years,
							datasets: [
								{
									label: `Average Grades for ${department} ${courseId}`,
									data: averages,
									borderColor: 'rgba(75, 192, 192, 1)',
									backgroundColor: 'rgba(75, 192, 192, 0.2)',
									fill: true,
								},
							],
						});
					} else if (insightType === 'coursesByPassCount') {
						const courseLabels = result.result.map(
							(item) => `${item[`${datasetId}_dept`]} ${item[`${datasetId}_id`]}`
						);
						const passCounts = result.result.map((item) => item['passCount']);
						setBarChartData({
							labels: courseLabels,
							datasets: [
								{
									label: `Courses Sorted by Number of Students Passed`,
									data: passCounts,
									backgroundColor: 'rgba(54, 162, 235, 0.6)',
									borderColor: 'rgba(54, 162, 235, 1)',
									borderWidth: 1,
								},
							],
						});
					}
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
	}, [
		datasetId,
		insightType,
		department,
		gradeThreshold,
		order,
		courseId,
	]);

	const handleInsightTypeChange = (event) => {
		setInsightType(event.target.value);
		setChartData(null);
		setBarChartData(null);
		setHorizontalBarChartData(null);
		setError(null); // Clear error when changing insight type
		setDepartment('');
		setCourseId('');
		setGradeThreshold('');
	};

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
							onChange={handleInsightTypeChange}
							variant="outlined"
							fullWidth
							size="small"
						>
							<MenuItem value="topCourses">
								Sorted Averages for Courses in a Department Exceeding Grade Threshold
							</MenuItem>
							<MenuItem value="topProfessors">Top Professors for a Course</MenuItem>
							<MenuItem value="averageByYears">
								Average Across Different Years for a Selected Course
							</MenuItem>
							<MenuItem value="coursesByPassCount">
								Courses Sorted by Number of Students Passed
							</MenuItem>
						</TextField>
					</Grid>
					{insightType && insightType !== '' && (
						<>
							{insightType === 'topCourses' && (
								<>
									<Grid item xs={12} md={6}>
										<TextField
											label="Department"
											value={department}
											onChange={(e) => setDepartment(e.target.value)}
											variant="outlined"
											fullWidth
											size="small"
										/>
									</Grid>
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
							{insightType === 'topProfessors' && (
								<>
									<Grid item xs={12} md={6}>
										<TextField
											label="Department"
											value={department}
											onChange={(e) => setDepartment(e.target.value)}
											variant="outlined"
											fullWidth
											size="small"
										/>
									</Grid>
									<Grid item xs={12} md={6}>
										<TextField
											label="Course ID"
											value={courseId}
											onChange={(e) => setCourseId(e.target.value)}
											variant="outlined"
											fullWidth
											size="small"
										/>
									</Grid>
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
							{insightType === 'averageByYears' && (
								<>
									<Grid item xs={12} md={6}>
										<TextField
											label="Department"
											value={department}
											onChange={(e) => setDepartment(e.target.value)}
											variant="outlined"
											fullWidth
											size="small"
										/>
									</Grid>
									<Grid item xs={12} md={6}>
										<TextField
											label="Course ID"
											value={courseId}
											onChange={(e) => setCourseId(e.target.value)}
											variant="outlined"
											fullWidth
											size="small"
										/>
									</Grid>
								</>
							)}
							{insightType === 'coursesByPassCount' && (
								<>
									<Grid item xs={12} md={6}>
										<TextField
											label="Department"
											value={department}
											onChange={(e) => setDepartment(e.target.value)}
											variant="outlined"
											fullWidth
											size="small"
										/>
									</Grid>
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
											<MenuItem value="DOWN">Descending</MenuItem>
											<MenuItem value="UP">Ascending</MenuItem>
										</TextField>
									</Grid>
								</>
							)}
						</>
					)}
				</Grid>
			</Box>
			{loading && <CircularProgress size={20} />}
			{error && <Typography color="error">{error}</Typography>}
			{barChartData && (
				<Box mt={2} style={{ height: '500px', width: '100%' }}>
					<Bar data={barChartData} />
				</Box>
			)}
			{horizontalBarChartData && (
				<Box mt={2} style={{ height: '500px', width: '100%' }}>
					<Bar data={horizontalBarChartData} options={{ indexAxis: 'y' }} />
				</Box>
			)}
			{chartData && (
				<Box mt={2} style={{ height: '500px', width: '100%' }}>
					<Line data={chartData} />
				</Box>
			)}
		</Paper>
	);
};

export default Insights;
