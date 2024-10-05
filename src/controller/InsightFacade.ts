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
	public datasetList: InsightDataset[] = [];

	//private datasets: Map<string, any[]>;

	constructor() {
		//this.datasets = new Map<string, any[]>();
	}

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

	public async addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
		// if id has underscore or
		// is empty after removing whitespaces or
		// is an existing id string added, throw error for invalid id
		if (id.includes("_") || id.trim() === "" || !id || this.datasetList.some((item) => item.id === id)) {
			throw new InsightError("invalid id!!");
		}
		// throw error if the kind is not sections
		if (kind !== InsightDatasetKind.Sections) {
			throw new InsightError("invalid kind: not sections");
		}
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
		this.datasetList.push({
			id: id,
			kind: kind,
			numRows: sections.length,
		});
		// write to disk
		const data: any = {};
		data.result = sections;
		await fs.outputJSON("data/" + id, JSON.stringify(data));
		// return ids of current successfully added datasets
		return this.datasetList.map((item) => item.id);
	}

	public async removeDataset(id: string): Promise<string> {
		// if id has underscore or is empty after removing whitespaces, throw error for invalid id
		if (id.includes("_") || id.trim() === "" || !id) {
			throw new InsightError("invalid id :(");
		}
		// if the id isn't in the list of successfully added ids, throw NotFoundError
		if (!this.datasetList.some((item) => item.id === id)) {
			throw new NotFoundError("id not found :(");
		}
		// update the list to be filter out any items in the list that have the id to remove
		this.datasetList = this.datasetList.filter((item) => item.id !== id);
		// cache from disk
		await fs.unlink("data/" + id);
		// promise fulfills id of dataset removed
		return id;
	}

	public async performQuery(query: unknown): Promise<InsightResult[]> {
		let parsedQuery: Query;
		try {
			// eslint-disable-next-line descriptive/no-unused-vars
			parsedQuery = QueryParser.parse(query);
			//console.log(parsedQuery);
		} catch (error) {
			if (error instanceof InsightError) {
				throw error;
			} else {
				throw new InsightError("An unexpected error occurred during query parsing.");
			}
		}

		// TODO: Implement query execution using parsedQuery
		// For now, throw an error indicating that execution is not yet implemented

		try {
			const executor = new QueryExecutor(this.datasetList);
			const result = await executor.execute(parsedQuery);
			return result;
		} catch (error) {
			if (error instanceof ResultTooLargeError) {
				throw new ResultTooLargeError("L");
			} else {
				throw new InsightError(`Failed to execute query: ${error}`);
			}
		}

		// throw new Error(`InsightFacade::performQuery execution not implemented.`);
	}

	public async listDatasets(): Promise<InsightDataset[]> {
		// TODO: Remove this once you implement the methods!
		//throw new Error(`InsightFacadeImpl::listDatasets is unimplemented!`);
		return this.datasetList;
	}
}
