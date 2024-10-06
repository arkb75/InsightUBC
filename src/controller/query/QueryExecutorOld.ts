import { Query, Filter, Options, Comparison, LogicComparison, Negation, OrderObject } from "./IQuery"; // removed Negation for testing purposes.
import { InsightResult, InsightError, InsightDataset } from "../IInsightFacade";

export class QueryExecutor {
	private datasets: InsightDataset[];

	constructor(datasets: InsightDataset[]) {
		this.datasets = datasets;
	}

	public execute(query: Query): InsightResult[] {
		const data = this.getRelevantDataset(query);

		const filteredData = this.applyFilter(query.WHERE, data);

		const result = this.applyOptions(filteredData, query.OPTIONS);

		return result;
	}

	private getRelevantDataset(query: Query): any[] {
		const datasetIds = this.extractDatasetIds(query);

		if (datasetIds.size !== 1) {
			throw new InsightError("Query must reference exactly one dataset.");
		}

		const datasetId = Array.from(datasetIds)[0];

		//const dataset = this.datasets.get(datasetId);
		// console.log(dataset); PROBLEM
		const dataset = this.datasets.find((dataset1) => dataset1.id === datasetId);
		//console.log(dataset);

		if (!dataset) {
			throw new InsightError(`Dataset ${datasetId} not found.`);
		}

		//const datasetContent = this.datasets.get(datasetId);

		return [];
	}

	private extractDatasetIds(query: Query): Set<string> {
		const datasetIds = new Set<string>();

		for (const column of query.OPTIONS.COLUMNS) {
			const [id] = column.split("_");
			datasetIds.add(id);
		}

		this.collectDatasetIdsFromFilter(query.WHERE, datasetIds);

		return datasetIds;
	}

	private collectDatasetIdsFromFilter(filter: Filter, datasetIds: Set<string>): void {
		if (filter.type === "EMPTY") {
			// Do nothing
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

	public applyFilter(filter: Filter, data: any[]): any[] {
		if (filter.type === "EMPTY") {
			return data;
		} else if (filter.type === "MCOMPARISON" || filter.type === "SCOMPARISON") {
			return data.filter((item) => this.evaluateComparison(filter as Comparison, item));
		} else if (filter.type === "LOGIC") {
			return this.evaluateLogic(filter as LogicComparison, data);
		} else if (filter.type === "NOT") {
			// const includedData = this.applyFilter(filter.filter, data);
			// const excludedSet = new Set(includedData);
			// return data.filter((item) => !excludedSet.has(item));
			const negationFilter = filter as Negation;
			const includedData = this.applyFilter(negationFilter.filter, data); // Apply the negated filter
			const excludedSet = new Set(includedData);
			return data.filter((item) => !excludedSet.has(item)); // Return all elements not in the negated result
		} else {
			throw new InsightError("Invalid filter type.");
		}
	}

	private evaluateComparison(comparison: Comparison, item: any): boolean {
		const itemValue = item[comparison.key];
		const comparisonValue = comparison.value;

		if (itemValue === undefined) {
			throw new InsightError(`Key ${comparison.key} does not exist in the dataset.`);
		}

		if (comparison.operator === "GT") {
			return itemValue > comparisonValue;
		} else if (comparison.operator === "LT") {
			return itemValue < comparisonValue;
		} else if (comparison.operator === "EQ") {
			return itemValue === comparisonValue;
		} else if (comparison.operator === "IS") {
			return this.evaluateIs(comparisonValue as string, itemValue);
		} else {
			throw new InsightError("Invalid comparison operator.");
		}
	}

	private evaluateIs(pattern: string, value: any): boolean {
		if (typeof value !== "string") {
			return false;
		}

		const escapedPattern = pattern.replace(/([.+?^${}()|[\]\\])/g, "\\$1");
		const regexPattern = "^" + escapedPattern.replace(/\*/g, ".*") + "$";
		const regex = new RegExp(regexPattern);

		return regex.test(value);
	}

	private evaluateLogic(logic: LogicComparison, data: any[]): any[] {
		if (logic.operator === "AND") {
			return logic.filters.reduce((result, currentFilter) => {
				return this.applyFilter(currentFilter, result);
			}, data);
		} else if (logic.operator === "OR") {
			const resultSet = new Set<any>();
			for (const filter of logic.filters) {
				const filteredData = this.applyFilter(filter, data);
				for (const item of filteredData) {
					resultSet.add(item);
				}
			}
			return Array.from(resultSet);
		} else {
			throw new InsightError("Invalid logic operator.");
		}
	}

	private applyOptions(data: any[], options: Options): InsightResult[] {
		let result = data.map((item) => {
			const resultItem: InsightResult = {};
			for (const column of options.COLUMNS) {
				resultItem[column] = item[column];
			}
			return resultItem;
		});

		if (options.ORDER) {
			result = this.applyOrder(result, options.ORDER);
		}

		return result;
	}

	private applyOrder(data: InsightResult[], order: string | OrderObject): InsightResult[] {
		if (typeof order === "string") {
			const key = order;
			data.sort((a, b) => this.compareValues(a[key], b[key]));
		} else {
			const { dir, keys } = order;
			data.sort((a, b) => {
				for (const key of keys) {
					const comparison = this.compareValues(a[key], b[key]);
					if (comparison !== 0) {
						return dir === "UP" ? comparison : -comparison;
					}
				}
				return 0;
			});
		}
		return data;
	}

	private compareValues(valueA: any, valueB: any): number {
		if (valueA < valueB) {
			return -1;
		} else if (valueA > valueB) {
			return 1;
		} else {
			return 0;
		}
	}
}
