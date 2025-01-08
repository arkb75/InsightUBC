# InsightUBC - Dataset Manager

## Overview
InsightUBC is a full-stack web application designed to enable users to upload, manage, and analyze academic datasets. This application provides valuable data insights through dynamic visualizations, empowering users to extract meaningful information from complex datasets. The application leverages a modular architecture built upon a React.js front-end and a REST API back-end.

## Key Features

1. **Dataset Management**:
	- **Uploading Datasets**: Users can upload datasets in ZIP format using a straightforward file selection interface. The application handles both valid and corrupted ZIP files and provides feedback.
	- **Naming Datasets**: Users assign custom names to datasets for organized management and retrieval, facilitating identification of different datasets.
	- **Successful Addition Feedback**: On successful upload of a dataset, the system provides a confirmation message to affirm the action.
	- **Dataset Listing**: Users can see all added datasets listed in a clear table, including the name, kind, and number of rows of each dataset, in addition to a view action.
	- **Removing Datasets**: Users can remove datasets via a trash can icon, and the removal action is confirmed by a feedback message.

2. **Data Insights and Visualization**:
	- **Insight Selection**: Users choose various types of data insights through a dropdown menu, which include:
		- Sorted Averages for Courses in a Department Exceeding a Grade Threshold.
		- Filter Course Sections by Instructor's Name.
		- Average Across Different Years for a Selected Course.
		- Courses Sorted by Number of Students Passed.
		- Number of Students Failed for Sorted Instructors of a Course.
	- **Parametric Insight Generation**: Each insight type can be modified with parameters, such as the department, grade thresholds, course IDs, instructor names, output order, and year filters.
	- **Dynamic Data Visualization**: Data is displayed with either dynamic graphs or charts in direct response to the insights chosen and parameters provided.

3. **User Interface and Experience**:
	- **Intuitive Design**: The interface is intuitive and user-friendly, which allows users to manage their datasets easily and gain insights without needing specialized knowledge of the program.
	- **Feedback System**: Throughout the application, feedback messages inform users of the app's current state, such as successful dataset uploads, removals, or errors.
	- **Dark Mode**: A dark mode toggle option is provided for the user's preference.

## Tech Stack

### Front-End:
- **React.js**: A component-based library used for building interactive UI elements.
- **Chart.js**: A library utilized to provide dynamic visualizations in the front-end.

### Back-End:
- **REST API**: A stateless backend using the HTTP protocol for communication with the React front-end.
- **Node.js/Express.js**: (Implied, not explicit but likely based on testing practices.) A server-side runtime for the backend.
- **JSZip**: Used to manage and process zipped files.
- **Mocha and Chai**: Used for unit testing the backend.

## Testing
- **Automated Testing**: Implemented using Mocha and Chai for backend functionality with focus on unit and integration tests.
- **Manual Testing**: Applied to the front-end testing to address user interaction and visual bugs, and to ensure ease of use.
- **Fuzz Testing**: Fuzz testing was used to help uncover additional edge cases that might not have been apparent during standard testing processes.

## User Stories Implemented
- Users can add a dataset to the system and the system verifies validity.
- Users can remove a dataset from the system.
- Users can see a list of datasets in the system.
- Users can get results for datasets sorted by course department exceeding a certain grade threshold.
- Users can filter courses by an instructor’s name.
- Users can get the average across different years for a selected course.
- Users can see a list of courses sorted by the number of students passed.
- Users can get the number of students failed for instructors of a course.
- Users can filter courses by semester.
- Users can get results with the number of students failed and sorted by instructors.
- Users can visualize previous insights.
- Users can filter for invalid department names.

## API Endpoints
- **GET /datasets**: Retrieves a list of all datasets.
- **PUT /dataset/:id**: Adds or updates a dataset. Note: the dataset kind can also be sent using a custom header or the request body.
- **DELETE /dataset/:id**: Removes a dataset.
- **POST /query**: Returns the result of a query on one or more datasets.

## How to Run Locally (Example with React)
To run this project locally on your machine, follow these steps (assuming you have NodeJS and npm installed):

1. Clone the repository:
   ```bash
   git clone https://github.com/arkb75/InsightUBC
   cd InsightUBC
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
	```
This will start the React development server, usually on `http://localhost:3000`. Open this URL in your browser to use the application.

**Note**: You will need a back-end service running at the specified URL. Please refer to documentation for that service.

## Future Enhancements
- Expand the range of dataset formats that can be processed (e.g. CSV).
- Include support for different types of visualizations.
- Implement a loading state during data processing to enhance the user experience.
- Add caching and user-specific history.

## About Me
I am Abdul Rafay Khurram, a Computer Science student and the primary developer of InsightUBC. This project demonstrates my proficiency in building full-stack applications using React, Node.js and REST APIs. I also implemented key features from the initial design to test implementation and was instrumental in the refactoring of the codebase to ensure high cohesion and maintainability. Through the implementation of the InsightUBC app, I have further developed my abilities to take a project from concept to final delivery using diverse testing strategies, and also reinforced my proficiency in TypeScript as well as unit and integration testing.

## Contact
**Abdul Rafay Khurram**  
rafay@abdulkhurram.com  
GitHub Profile: [arkb75](https://github.com/arkb75)
