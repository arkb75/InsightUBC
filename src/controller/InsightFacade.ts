import {
	IInsightFacade,
	InsightDataset,
	InsightDatasetKind,
	InsightResult,
	InsightError,
	NotFoundError,
	ResultTooLargeError,
} from "./IInsightFacade";
import { QueryParser } from "./query/QueryParser";
import { Query } from "./query/IQuery";
import { QueryExecutor } from "./query/QueryExecutor";

import { Section } from "./SectionModel";

import fs from "fs-extra";
import JSZip from "jszip";

/**
 * This is the main programmatic entry point for the project.
 * Method documentation is in IInsightFacade
 *
 */
export default class InsightFacade implements IInsightFacade {
	// create list of courses from reading the file content
	public async readData(content: string): Promise<Promise<string>[]> {
		// https://stuk.github.io/jszip/documentation/api_jszip/load_async.html
		// read content zip file ensuring it is base64
		const zip = new JSZip();
		const unzipped = await zip.loadAsync(content, { base64: true });
		if (!unzipped) {
			throw new InsightError("unable to read content");
		}
		// check for courses folder
		if (!unzipped.files["courses/"]) {
			throw new InsightError("courses folder missing.");
		}
		// list for courses
		const courses: Promise<string>[] = [];
		const coursesFolder = unzipped.folder("courses");
		if (coursesFolder === null) {
			throw new InsightError("null courses folder");
		} else {
			// add all the courses in the courses folder in the created courses list
			coursesFolder.forEach(function (relativePath: string) {
				const file = zip.file("courses/" + relativePath);
				if (file === null) {
					throw new InsightError("null file");
				}
				const course = file.async("string");
				courses.push(course);
			});
		}
		return courses;
	}

	// create sections based on section data model from the file data
	public async createSections(courses: string[]): Promise<Section[]> {
		const sections: Section[] = [];

		// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for...of
		// go through each course in the courses list
		for (const course of courses) {
			// go through the sections in each course
			for (const section of JSON.parse(course).result) {
				// check valid section - contains every field in proper format
				if (this.validSection(section)) {
					throw new InsightError("invalid section or no sections");
				} else {
					// setYear is year, but change to be 1900 if Section = overall
					const autoYear = 1900;
					let setYear = section.Year;
					if (section.Section === "overall") {
						setYear = autoYear;
					}
					// create section
					const currSection: Section = {
						uuid: section.id,
						id: section.Course,
						title: section.Title,
						instructor: section.Professor,
						dept: section.Subject,
						year: setYear,
						avg: section.Avg,
						pass: section.Pass,
						fail: section.Fail,
						audit: section.Audit,
					};
					// add section to sections list
					sections.push(currSection);
				}
			}
		}
		return sections;
	}

	// check if a given section is valid - contains every field of interest and in the proper format
	public validSection(section: any): Boolean {
		return !(
			section === null ||
			!section.id ||
			typeof section.id !== "string" ||
			!section.Course ||
			typeof section.Course !== "string" ||
			!section.Title ||
			typeof section.Title !== "string" ||
			!section.Professor ||
			typeof section.Professor !== "string" ||
			!section.Subject ||
			typeof section.Subject !== "string" ||
			!section.Year ||
			typeof section.Year !== "number" ||
			!section.Avg ||
			typeof section.Avg !== "number" ||
			!section.Pass ||
			typeof section.Pass !== "number" ||
			!section.Fail ||
			typeof section.Fail !== "number" ||
			!section.Audit ||
			typeof section.Audit !== "number"
		);
	}

	public checkArg(id: string, kind: InsightDatasetKind, datasets: any[]): Boolean {
		// if id has underscore or
		// is empty after removing whitespaces or
		// is an existing id string added, throw error for invalid id
		if (id.includes("_") || id.trim() === "" || !id || datasets.some((ds: any) => ds.id === id)) {
			throw new InsightError("invalid id!!");
		}
		// throw error if the kind is not sections
		if (kind !== InsightDatasetKind.Sections) {
			throw new InsightError("invalid kind: not sections");
		}
		return true;
	}

	public async addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
		// datasets added -- get data in disk if there are any
		let datasets: any[] = [];
		try {
			datasets = await fs.readJSON("data/data.JSON");
		} catch {
			/* empty */
		}
		// throw errors for id and kind arguments if any
		this.checkArg(id, kind, datasets);
		// read data and get courses (files)
		let courses: Promise<string>[] = [];
		try {
			courses = await this.readData(content);
		} catch (err) {
			throw new InsightError("unable to read data successfully. error: " + err);
		}
		// create sections following created Section data model
		let sections: Section[] = [];
		try {
			sections = await this.createSections(await Promise.all(courses));
		} catch (err) {
			throw new InsightError("unable to create sections successfully. error: " + err);
		}
		// check if course is invalid - does not have 1 or more valid sections
		if (sections.length === 0) {
			throw new InsightError("invalid course: doesn't contain one or more valid sections");
		}
		// add to datasetList
		datasets.push({
			id: id,
			kind: kind,
			numRows: sections.length,
			data: sections,
		});
		// write to disk
		await fs.outputJSON("data/data.JSON", datasets);
		// return ids of current successfully added datasets
		return datasets.map((ds: any) => ds.id);
	}

	public async removeDataset(id: string): Promise<string> {
		// datasets added -- get data in disk if there are any
		let datasets: any[] = [];
		try {
			datasets = await fs.readJSON("data/data.JSON");
		} catch {
			/* empty */
		}
		// if id has underscore or is empty after removing whitespaces, throw error for invalid id
		if (id.includes("_") || id.trim() === "" || !id) {
			throw new InsightError("invalid id :(");
		}
		// if the id isn't in the list of successfully added ids, throw NotFoundError
		if (!datasets.some((ds: any) => ds.id === id)) {
			throw new NotFoundError("id not found :(");
		}
		// update the list to be filter out any datasets in the list that have the id to remove
		datasets = datasets.filter((ds: any) => ds.id !== id);
		// caching
		try {
			// update with updated datasets with removed dataset
			await fs.outputJSON("data/data.JSON", datasets);
		} catch (err) {
			throw new InsightError("unable to cache due to error: " + err);
		}
		// promise fulfills id of dataset removed
		return id;
	}

	public async performQuery(query: unknown): Promise<InsightResult[]> {
		let parsedQuery: Query;
		try {
			parsedQuery = QueryParser.parse(query);
			//console.log(parsedQuery);
		} catch (error) {
			if (error instanceof InsightError) {
				throw error;
			} else {
				throw new InsightError("An unexpected error occurred during query parsing.");
			}
		}
		// datasets added -- get data in disk if there are any
		let datasets: any[] = [];
		try {
			datasets = await fs.readJSON("data/data.JSON");
			//console.log(datasets);
		} catch {
			/* empty */
		}
		try {
			const executor = new QueryExecutor(datasets);
			return await executor.execute(parsedQuery);
		} catch (error) {
			if (error instanceof ResultTooLargeError) {
				throw new ResultTooLargeError("L");
			} else {
				throw new InsightError(`Failed to execute query: ${error}`);
			}
		}
	}

	public async listDatasets(): Promise<InsightDataset[]> {
		// datasets added -- get data in disk if there are any
		let datasets: any[] = [];
		try {
			datasets = await fs.readJSON("data/data.JSON");
		} catch {
			/* empty */
		}
		// only return id, kind and numRows of the added datasets
		return datasets.map((ds: any) => ({
			id: ds.id,
			kind: ds.kind,
			numRows: ds.numRows,
		}));
	}
}
