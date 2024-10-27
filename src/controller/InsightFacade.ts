import {
	IInsightFacade,
	InsightDataset,
	InsightDatasetKind,
	InsightError,
	InsightResult,
	NotFoundError,
	ResultTooLargeError,
} from "./IInsightFacade";
import { QueryParser } from "./query/QueryParser";
import { Query } from "./query/IQuery";
import { QueryExecutor } from "./query/QueryExecutor";
import { RoomsProcessor } from "./RoomsProcessor";
import { Section } from "./SectionModel";
import fs from "fs-extra";
import JSZip from "jszip";

/**
 * This is the main programmatic entry point for the project.
 * Method documentation is in IInsightFacade
 *
 */
export default class InsightFacade implements IInsightFacade {
	public async updateDatasets(): Promise<any[]> {
		let datasets: any[];
		try {
			datasets = await fs.readJSON("data/data.JSON");
		} catch {
			datasets = [];
		}
		return datasets;
	}

	public async processCourses(content: string): Promise<Promise<string>[]> {
		// https://stuk.github.io/jszip/documentation/api_jszip/load_async.html
		const zip = new JSZip();
		const unzipped = await zip.loadAsync(content, { base64: true });
		if (!unzipped) {
			throw new InsightError("unable to read content");
		}
		if (!unzipped.files["courses/"]) {
			throw new InsightError("courses folder missing.");
		}
		const courses: Promise<string>[] = [];
		const coursesFolder = unzipped.folder("courses");
		if (coursesFolder === null) {
			throw new InsightError("null courses folder");
		} else {
			// https://stuk.github.io/jszip/documentation/api_jszip/for_each.html
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

	public validSection(section: any): Boolean {
		return (
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

	public async createSections(courses: string[]): Promise<Section[]> {
		const sections: Section[] = [];
		// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for...of
		for (const course of courses) {
			for (const section of JSON.parse(course).result) {
				if (this.validSection(section)) {
					let setYear = 1900;
					if (section.Section !== "overall") {
						setYear = section.Year;
					}
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
					sections.push(currSection);
				}
			}
		}
		return sections;
	}

	public async getSections(courses: Promise<string>[]): Promise<Section[]> {
		let sections: Section[] = [];
		try {
			sections = await this.createSections(await Promise.all(courses));
		} catch (err) {
			throw new InsightError("unable to create sections successfully. error: " + err);
		}
		if (sections.length === 0) {
			throw new InsightError("invalid course: doesn't contain one or more valid sections");
		}
		return sections;
	}

	public checkArg(id: string, kind: InsightDatasetKind, datasets: any[]): boolean {
		// Validate 'id'
		if (typeof id !== "string" || id.trim() === "" || id.includes("_")) {
			throw new InsightError("Invalid id: id must be a non-empty string without underscores");
		}

		// Check if 'id' already exists
		if (datasets.some((ds: any) => ds.id === id)) {
			throw new InsightError(`Dataset with id '${id}' already exists`);
		}

		// Validate 'kind'
		if (kind !== InsightDatasetKind.Sections && kind !== InsightDatasetKind.Rooms) {
			throw new InsightError("Invalid kind: must be either 'sections' or 'rooms'");
		}

		return true;
	}

	public async addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
		const datasets = await this.updateDatasets();
		this.checkArg(id, kind, datasets);

		if (kind === InsightDatasetKind.Sections) {
			// Existing logic for processing sections dataset
			let courses: Promise<string>[] = [];
			try {
				courses = await this.processCourses(content);
			} catch (err) {
				throw new InsightError("unable to read data successfully. error: " + err);
			}
			const sections = await this.getSections(courses);
			datasets.push({
				id: id,
				kind: kind,
				numRows: sections.length,
				data: sections,
			});
		} else if (kind === InsightDatasetKind.Rooms) {
			// Process rooms dataset using RoomsProcessor
			const roomsProcessor = new RoomsProcessor();
			const rooms = await roomsProcessor.processRooms(content);
			if (rooms.length === 0) {
				throw new InsightError("No valid rooms found in dataset");
			}
			datasets.push({
				id: id,
				kind: kind,
				numRows: rooms.length,
				data: rooms,
			});
		}

		await fs.outputJSON("data/data.JSON", datasets);
		return datasets.map((ds: any) => ds.id);
	}

	public async removeDataset(id: string): Promise<string> {
		let datasets = await this.updateDatasets();
		if (id.includes("_") || id.trim() === "" || !id) {
			throw new InsightError("invalid id :(");
		}
		if (!datasets.some((ds: any) => ds.id === id)) {
			throw new NotFoundError("id not found :(");
		}
		datasets = datasets.filter((ds: any) => ds.id !== id);
		try {
			await fs.outputJSON("data/data.JSON", datasets);
		} catch (err) {
			throw new InsightError("unable to cache due to error: " + err);
		}
		return id;
	}

	public async performQuery(query: unknown): Promise<InsightResult[]> {
		let parsedQuery: Query;
		try {
			parsedQuery = QueryParser.parse(query);
		} catch (error) {
			if (error instanceof InsightError) {
				throw error;
			} else {
				throw new InsightError("An unexpected error occurred during query parsing.");
			}
		}
		const datasets = await this.updateDatasets();
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
		const datasets = await this.updateDatasets();
		return datasets.map((ds: any) => ({
			id: ds.id,
			kind: ds.kind,
			numRows: ds.numRows,
		}));
	}
}
