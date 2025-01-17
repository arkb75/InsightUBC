import { Query, Filter, Comparison, LogicComparison, Negation, ApplyRule } from "./IQuery"; // removed Option, OrderObject for testing purposes.
import { InsightResult, InsightError, ResultTooLargeError } from "../IInsightFacade";
import { Calculations } from "./Calculations";
// Removed InsightDataset

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
		let datasetIds: any = {};
		try {
			datasetIds = this.extractDatasetIds(query);
		} catch {
			throw new InsightError("unable to extract dataset ids");
		}

		if (datasetIds.size !== 1 && !query.TRANSFORMATIONS) {
			throw new InsightError("Query must reference exactly one dataset.");
		}

		const datasetId = Array.from(datasetIds)[0];
		const dataset = this.datasets.find((ds) => ds.id === datasetId);
		//console.log(dataset);

		if (!dataset && !query.TRANSFORMATIONS) {
			throw new InsightError(`Dataset ${datasetId} not found in the executor.`);
		}

		// perform the query
		try {
			return this.evaluateQuery(this.datasets, query);
		} catch {
			throw new InsightError("unable to evaluate the query");
		}
	}

	private normalizeData(data: any[]): void {
		data.forEach((item) => {
			if (typeof item.year === "string") {
				item.year = Number(item.year);
			}

			if (typeof item.uuid === "number") {
				item.uuid = String(item.uuid);
			}
		});
	}

	private processDataset(data: any[], query: Query): InsightResult[] {
		let filteredQuery = this.applyFilter(data, query.WHERE);
		if (query.TRANSFORMATIONS) {
			filteredQuery = this.applyTransformations(filteredQuery, query.TRANSFORMATIONS);
		}
		if (filteredQuery.length > this.maxNum) {
			throw new ResultTooLargeError("Query results exceed 5000 entries.");
		}
		return this.applyOptions(filteredQuery, query.OPTIONS);
	}

	private async evaluateQuery(dataset: any[], query: Query): Promise<InsightResult[]> {
		// apply the WHERE clause
		let foundValidDataset = false;

		for (const data of dataset) {
			try {
				this.normalizeData(data.data);

				const datasetIds = this.extractDatasetIds(query);
				const datasetId = Array.from(datasetIds)[0];

				if (data.id === datasetId) {
					const results = this.processDataset(data.data, query);
					foundValidDataset = true;
					return results;
				}
			} catch (err) {
				if (err instanceof InsightError && err.message.includes("does not exist in the dataset")) {
					continue;
				}

				if (err instanceof ResultTooLargeError) {
					throw new ResultTooLargeError("Query results exceed 5000 entries.");
				}
			}
		}

		if (!foundValidDataset) {
			throw new InsightError("Required key(s) do not exist in any provided dataset.");
		}

		return [];
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

		if (!query.TRANSFORMATIONS) {
			// extract dataset IDs from COLUMNS
			for (const column of query.OPTIONS.COLUMNS) {
				const [id] = column.split("_");
				datasetIds.add(id);
			}
		} else {
			// extract dataset IDs from GROUP
			for (const column of query.TRANSFORMATIONS.GROUP) {
				const [id] = column.split("_");
				datasetIds.add(id);
			}
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
			fullname: "fullname",
			shortname: "shortname",
			number: "number",
			name: "name",
			address: "address",
			lat: "lat",
			lon: "lon",
			seats: "seats",
			type: "type",
			furniture: "furniture",
			href: "href",
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

	private applyOptions(filteredQuery: any[], options: any): InsightResult[] {
		if (!options?.COLUMNS) {
			throw new InsightError("OPTIONS must contain COLUMNS.");
		}

		const columns = options.COLUMNS; // list of columns to include in the result
		let results = filteredQuery.map((item) => {
			const result: InsightResult = {};
			for (const column of columns) {
				const mappedColumn = this.mapKey(column);
				result[column] = item[mappedColumn];
			}
			return result;
		});

		// apply ORDER clause if it exists
		if (options.ORDER) {
			results = this.applyOrder(results, options);
		}
		return results;
	}

	private applyOrder(filteredQuery: InsightResult[], options: any): InsightResult[] {
		// const orderKey = typeof options.ORDER === "string" ? options.ORDER : options.ORDER.keys[0];
		const direction = typeof options.ORDER === "object" && options.ORDER.dir === "DOWN" ? -1 : 1;
		let results = filteredQuery;
		if (typeof options.ORDER === "string") {
			results = this.applySorting(filteredQuery, options.ORDER, direction);
		} else {
			for (const key of options.ORDER.keys) {
				results = this.applySorting(filteredQuery, key, direction);
			}
		}
		return results;
	}

	private applySorting(results: InsightResult[], orderKey: any, direction: any): InsightResult[] {
		return results.sort((a, b) => {
			if (a[orderKey] > b[orderKey]) {
				return direction;
			}
			if (a[orderKey] < b[orderKey]) {
				return -direction;
			}
			return 0; // 0 keep original order for equal values I think??
		});
	}

	private applyTransformations(filteredQuery: InsightResult[], transformations: any): InsightResult[] {
		if (!transformations.GROUP) {
			throw new InsightError("TRANSFORMATIONS must contain GROUP.");
		}
		if (!transformations.APPLY) {
			throw new InsightError("TRANSFORMATIONS must contain APPLY.");
		}

		const groups = this.groupBy(filteredQuery, transformations);

		return this.evaluateApply(Object.values(groups), transformations);
	}

	// https://keestalkstech.com/2021/10/having-fun-grouping-arrays-into-maps-with-typescript/
	private groupBy(data: InsightResult[], transformations: any): Record<string, InsightResult[]> {
		// https://www.wisdomgeek.com/development/web-development/javascript/how-to-groupby-using-reduce-in-javascript/
		const groups = transformations.GROUP;
		return data.reduce((results, item) => {
			// https://gist.github.com/mikaello/06a76bca33e5d79cdd80c162d7774e9c
			const key = groups.map((group: any) => item[group.split("_")[1]]).join("-");
			if (!results[key]) {
				results[key] = [];
			}
			results[key].push(item);
			return results;
		}, {} as Record<string, InsightResult[]>);
	}

	private evaluateApply(groupedData: InsightResult[][], transformations: any): InsightResult[] {
		const groups: string[] = transformations.GROUP;
		const apply: ApplyRule[] = transformations.APPLY;
		const results: InsightResult[] = [];

		for (const data of groupedData) {
			const itemValue: InsightResult = {};
			for (const applyRule of apply) {
				const mappedKey = this.mapKey(applyRule.key);
				const keyToApply = data.map((item) => item[mappedKey]);
				itemValue[applyRule.applykey] = Calculations.calculate(keyToApply, applyRule.token);
			}

			for (const group of groups) {
				itemValue[group.split("_")[1]] = data[0][group.split("_")[1]];
			}
			results.push(itemValue);
		}
		return results;
	}
}
