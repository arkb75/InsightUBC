import { Query, Filter, Comparison, LogicComparison, Negation } from "./IQuery"; // removed Option, OrderObject for testing purposes.
import { InsightResult, InsightError, ResultTooLargeError } from "../IInsightFacade"; // Removed InsightDataset

//import fs from "fs-extra";

export class QueryExecutor {
	private datasets: any[];
	private maxNum: number;

	constructor(datasets: any[]) {
		this.datasets = datasets;
		this.maxNum = 5000;
	}

	public async execute(query: Query): Promise<InsightResult[]> {
		// find dataset id from query
		const datasetIds = this.extractDatasetIds(query);

		if (datasetIds.size !== 1) {
			throw new InsightError("Query must reference exactly one dataset.");
		}

		const datasetId = Array.from(datasetIds)[0];
		const dataset = this.datasets.find((ds) => ds.id === datasetId);
		//console.log(dataset);

		if (!dataset) {
			throw new InsightError(`Dataset ${datasetId} not found in the executor.`);
		}

		// perform the query
		return this.evaluateQuery(this.datasets, query);
	}

	private async evaluateQuery(dataset: any[], query: Query): Promise<InsightResult[]> {
		// retrieve the sections for the dataset from disk
		//const sections = await this.getSectionDataForDataset(dataset.id);
		//console.log(sections);

		// apply the WHERE clause
		const realData: any[] = dataset[0].data;

		const filteredSections = this.applyFilter(realData, query.WHERE);
		//console.log(filteredSections.length);

		// console.log("Filtered Sections:", filteredSections);
		if (filteredSections.length > this.maxNum) {
			throw new ResultTooLargeError("Query results exceed 5000 entries.");
		}

		// apply the OPTIONS clause
		const result = this.applyOptions(filteredSections, query.OPTIONS);

		return result;
	}

	// private async getSectionDataForDataset(datasetId: string): Promise<any[]> {
	// 	try {
	// 		// read the JSON file from the data folder
	// 		let data = await fs.readJSON(`data/data.JSON`);
	// 		// parse it
	// 		if (typeof data === "string") {
	// 			data = JSON.parse(data);
	// 		}
	// 		if (!data?.result) {
	// 			throw new InsightError(`Data for dataset ${datasetId} is missing or corrupted.`);
	// 		}
	// 		//console.log(data.result);
	// 		return data.result;
	// 	} catch (err) {
	// 		throw new InsightError(`Failed to read dataset from disk: ${err}`);
	// 	}
	// }

	private extractDatasetIds(query: Query): Set<string> {
		const datasetIds = new Set<string>();

		// extract dataset IDs from COLUMNS
		for (const column of query.OPTIONS.COLUMNS) {
			const [id] = column.split("_");
			datasetIds.add(id);
		}

		// extract dataset IDs from WHERE clause
		this.collectDatasetIdsFromFilter(query.WHERE, datasetIds);

		return datasetIds;
	}

	private collectDatasetIdsFromFilter(filter: Filter, datasetIds: Set<string>): void {
		if (filter.type === "EMPTY") {
			// Do nothing LOL
		} else if (filter.type === "MCOMPARISON" || filter.type === "SCOMPARISON") {
			const [id] = filter.key.split("_");
			datasetIds.add(id);
		} else if (filter.type === "LOGIC") {
			for (const subFilter of filter.filters) {
				this.collectDatasetIdsFromFilter(subFilter, datasetIds);
			}
		} else if (filter.type === "NOT") {
			this.collectDatasetIdsFromFilter(filter.filter, datasetIds);
		}
	}

	private applyFilter(data: any[], filter: Filter): any[] {
		//console.log(filter.type);
		switch (filter.type) {
			case "EMPTY":
				return data;

			case "MCOMPARISON":
			case "SCOMPARISON":
				return data.filter((item) => this.evaluateComparison(filter as Comparison, item));

			case "LOGIC":
				return this.evaluateLogic(filter as LogicComparison, data);

			case "NOT": {
				const negationFilter = filter as Negation;
				const includedData = this.applyFilter(data, negationFilter.filter); // hopefully apply the negated filter
				const excludedSet = new Set(includedData);
				return data.filter((item) => !excludedSet.has(item)); // return items not in the negated result
			}

			default:
				throw new InsightError(`Unsupported filter type: ${filter}`);
		}
	}

	private evaluateComparison(comparison: Comparison, item: any): boolean {
		const mappedKey = this.mapKey(comparison.key);
		//console.log(item);
		const itemValue = item[mappedKey];
		//console.log(itemValue)

		const comparisonValue = comparison.value;
		//console.log(comparison.operator);
		if (itemValue === undefined) {
			throw new InsightError(`Key ${comparison.key} does not exist in the dataset.`);
		}

		switch (comparison.operator) {
			case "GT":
				return itemValue > comparisonValue;
			case "LT":
				return itemValue < comparisonValue;
			case "EQ":
				return itemValue === comparisonValue;
			case "IS":
				return this.evaluateIs(comparisonValue as string, itemValue);
			default:
				throw new InsightError(`Unsupported comparison operator: ${comparison.operator}`);
		}
	}

	private mapKey(key: string): string {
		// extract the key by removing any prefix before the first underscore
		const coreKey = key.includes("_") ? key.split("_").slice(1).join("_") : key;

		// define the mapping for the core keys
		const keyMapping: Record<string, string> = {
			uuid: "uuid",
			id: "id",
			title: "title",
			instructor: "instructor",
			dept: "dept",
			year: "year",
			avg: "avg",
			pass: "pass",
			fail: "fail",
			audit: "audit",
		};

		// return the mapped key or the core key if not found in the mapping
		//console.log(keyMapping[coreKey]);
		//console.log("Mapping key:", coreKey, "to", keyMapping[coreKey] || coreKey);

		return keyMapping[coreKey] || coreKey;
	}

	private evaluateIs(pattern: string, value: any): boolean {
		if (typeof value !== "string") {
			return false;
		}

		// check for wildcards in the middle (not allowed)
		const middleWildcard = /.+\*.+/;
		if (middleWildcard.test(pattern)) {
			throw new InsightError("Middle wildcards are not allowed in the IS operator.");
		}

		// escape special regex characters and replace '*' with '.*'
		const escapedPattern = pattern.replace(/([.+?^${}()|[\]\\])/g, "\\$1");
		const regexPattern = "^" + escapedPattern.replace(/\*/g, ".*") + "$";
		const regex = new RegExp(regexPattern);

		return regex.test(value);
	}

	private evaluateLogic(logic: LogicComparison, data: any[]): any[] {
		if (logic.operator === "AND") {
			return logic.filters.reduce((result, currentFilter) => {
				return this.applyFilter(result, currentFilter);
			}, data);
		} else if (logic.operator === "OR") {
			const resultSet = new Set<any>();
			for (const filter of logic.filters) {
				const filteredData = this.applyFilter(data, filter);
				filteredData.forEach((item) => resultSet.add(item));
			}
			return Array.from(resultSet);
		} else {
			throw new InsightError(`Unsupported logic operator: ${logic.operator}`);
		}
	}

	private applyOptions(filteredSections: any[], options: any): InsightResult[] {
		if (!options?.COLUMNS) {
			throw new InsightError("OPTIONS must contain COLUMNS.");
		}

		const columns = options.COLUMNS; // list of columns to include in the result
		let results = filteredSections.map((section) => {
			const result: InsightResult = {};
			for (const column of columns) {
				const mappedColumn = this.mapKey(column);
				result[column] = section[mappedColumn];
			}
			return result;
		});

		// apply ORDER clause if it exists
		if (options.ORDER) {
			const orderKey = typeof options.ORDER === "string" ? options.ORDER : options.ORDER.keys[0];
			const direction = typeof options.ORDER === "object" && options.ORDER.dir === "DOWN" ? -1 : 1;

			results = results.sort((a, b) => {
				if (a[orderKey] > b[orderKey]) {
					return direction;
				}
				if (a[orderKey] < b[orderKey]) {
					return -direction;
				}
				return 0; // 0 keep original order for equal values i think??
			});
		}

		return results;
	}
}
