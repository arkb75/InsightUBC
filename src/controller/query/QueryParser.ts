import {
	ApplyRule,
	Comparison,
	Filter,
	LogicComparison,
	Negation,
	Options,
	Order,
	OrderObject,
	Query,
	Transformations,
} from "./IQuery";
import { InsightError } from "../IInsightFacade";

export class QueryParser {
	public static parse(query: unknown): Query {
		if (typeof query !== "object" || query === null) {
			throw new InsightError("Query must be an object.");
		}

		const queryObjOriginal = query as any;
		const queryObj: any = {};

		for (const key of Object.keys(queryObjOriginal)) {
			queryObj[key.toUpperCase()] = queryObjOriginal[key];
		}

		if (!("WHERE" in queryObj) || !("OPTIONS" in queryObj)) {
			throw new InsightError("Query must contain WHERE and OPTIONS.");
		}

		const where = this.parseFilter(queryObj.WHERE);

		if (!("TRANSFORMATIONS" in queryObj)) {
			const options = this.parseOptions(queryObj.OPTIONS, null);
			return { WHERE: where, OPTIONS: options };
		}

		const options = this.parseOptions(queryObj.OPTIONS, queryObj.TRANSFORMATIONS);
		const transformations = this.parseTransformations(queryObj.TRANSFORMATIONS);
		return { WHERE: where, OPTIONS: options, TRANSFORMATIONS: transformations };
	}

	private static parseFilter(filter: any): Filter {
		if (Object.keys(filter).length === 0) {
			// Empty WHERE clause
			return { type: "EMPTY" };
		}

		if ("AND" in filter || "OR" in filter) {
			return this.parseLogicComparison(filter);
		} else if ("NOT" in filter) {
			return this.parseNegation(filter);
		} else if ("GT" in filter || "LT" in filter || "EQ" in filter) {
			return this.parseMComparison(filter);
		} else if ("IS" in filter) {
			return this.parseSComparison(filter);
		} else {
			throw new InsightError("Invalid filter in WHERE clause.");
		}
	}

	private static parseLogicComparison(filter: any): LogicComparison {
		const operator = "AND" in filter ? "AND" : "OR";
		const filtersArray = filter[operator];

		if (!Array.isArray(filtersArray) || filtersArray.length === 0) {
			throw new InsightError(`${operator} must be a non-empty array.`);
		}

		const filters: Filter[] = filtersArray.map((subFilter: any) => this.parseFilter(subFilter));

		return {
			type: "LOGIC",
			operator: operator,
			filters: filters,
		};
	}

	private static parseNegation(filter: any): Negation {
		const negationFilter = filter.NOT;

		if (typeof negationFilter !== "object" || negationFilter === null) {
			throw new InsightError("NOT must be a filter.");
		}

		const parsedFilter = this.parseFilter(negationFilter);

		return {
			type: "NOT",
			filter: parsedFilter,
		};
	}

	private static parseMComparison(filter: any): Comparison {
		const operator = "GT" in filter ? "GT" : "LT" in filter ? "LT" : "EQ";
		const mComparator = filter[operator];

		if (typeof mComparator !== "object" || mComparator === null) {
			throw new InsightError(`${operator} must be an object.`);
		}

		const keys = Object.keys(mComparator);

		if (keys.length !== 1) {
			throw new InsightError(`${operator} must have exactly one key.`);
		}

		const key = keys[0];
		const value = mComparator[key];

		if (typeof value !== "number") {
			throw new InsightError(`Value of ${operator} must be a number.`);
		}

		return {
			type: "MCOMPARISON",
			key: key,
			operator: operator,
			value: value,
		};
	}

	private static parseSComparison(filter: any): Comparison {
		const operator = "IS";
		const sComparator = filter[operator];

		if (typeof sComparator !== "object" || sComparator === null) {
			throw new InsightError(`${operator} must be an object.`);
		}

		const keys = Object.keys(sComparator);

		if (keys.length !== 1) {
			throw new InsightError(`${operator} must have exactly one key.`);
		}

		const key = keys[0];
		const value = sComparator[key];

		if (typeof value !== "string") {
			throw new InsightError(`Value of ${operator} must be a string.`);
		}

		return {
			type: "SCOMPARISON",
			key: key,
			operator: operator,
			value: value,
		};
	}

	private static parseOptions(options: any, transformations: any): Options {
		if (typeof options !== "object" || options === null) {
			throw new InsightError("OPTIONS must be an object.");
		}

		if (!("COLUMNS" in options)) {
			throw new InsightError("OPTIONS must contain COLUMNS.");
		}

		const columns = options.COLUMNS;

		if (!Array.isArray(columns) || columns.length === 0) {
			throw new InsightError("COLUMNS must be a non-empty array.");
		}

		if (transformations !== null) {
			const groups: string[] = transformations.GROUP;
			const applykeys = this.getApplyKeys(transformations);
			for (const column of columns) {
				if (!groups.indexOf(column) && !applykeys.indexOf(column)) {
					throw new InsightError("COLUMNS must be in GROUP/APPLY when TRANSFORMATIONS is present");
				}
			}
		}

		// for (const col of columns) {
		// 	if (typeof col !== "string") {
		// 		throw new InsightError("COLUMNS must contain only strings.");
		// 	}
		// }

		let order: Order | undefined;
		if ("ORDER" in options) {
			order = this.parseOrder(options.ORDER, columns);
		}

		const resultOptions: Options = {
			COLUMNS: columns,
		};
		if (order !== undefined) {
			resultOptions.ORDER = order;
		}
		return resultOptions;
	}

	private static getApplyKeys(transformation: any): string[] {
		const result: string[] = [];
		for (const applykey of transformation.APPLY) {
			result.push(applykey.applykey);
		}
		return result;
	}

	private static parseOrder(order: any, columns: string[]): Order {
		if (typeof order === "string") {
			if (!columns.includes(order)) {
				throw new InsightError("ORDER key must be in COLUMNS.");
			}
			return order;
		} else if (typeof order === "object" && order !== null) {
			return this.parseOrderObject(order, columns);
		} else {
			throw new InsightError("ORDER must be a string or an object.");
		}
	}

	private static parseOrderObject(orderObj: any, columns: string[]): OrderObject {
		if (!("dir" in orderObj) || !("keys" in orderObj)) {
			throw new InsightError("ORDER object must contain dir and keys.");
		}

		const dir = orderObj.dir;
		const keys = orderObj.keys;

		if (dir !== "UP" && dir !== "DOWN") {
			throw new InsightError("ORDER dir must be 'UP' or 'DOWN'.");
		}

		if (!Array.isArray(keys) || keys.length === 0) {
			throw new InsightError("ORDER keys must be a non-empty array.");
		}

		for (const key of keys) {
			// if (typeof key !== "string") {
			// 	throw new InsightError("ORDER keys must be strings.");
			// }
			if (!columns.includes(key)) {
				throw new InsightError("ORDER keys must be in COLUMNS.");
			}
		}

		return {
			dir: dir,
			keys: keys,
		};
	}

	private static parseTransformations(transformations: any): Transformations {
		if (typeof transformations !== "object" || transformations === null) {
			throw new InsightError("TRANSFORMATIONS must be an object.");
		}

		if (!("GROUP" in transformations)) {
			throw new InsightError("invalid GROUP: OPTIONS must contain GROUP.");
		}

		const group = transformations.GROUP;

		if (!Array.isArray(group) || group.length === 0) {
			throw new InsightError("invalid GROUP: GROUP must be a non-empty array.");
		}

		if (!("APPLY" in transformations)) {
			throw new InsightError("invalid APPLY: OPTIONS must contain APPLY.");
		}

		const appKey = transformations[transformations.key];
		const apply: ApplyRule[] = appKey.map((applyRule: any) => this.parseApply(applyRule));

		if (!this.uniqueApplyKeys(transformations.APPLY)) {
			throw new InsightError("invalid APPLY: some APPLYRULEs share an applykey with the same name.");
		}

		if (!Array.isArray(apply) || apply.length === 0) {
			throw new InsightError("invalid APPLY: APPLY must be a non-empty array.");
		}

		return {
			GROUP: group,
			APPLY: apply,
		};
	}
	// TODO: fix this?
	private static parseApply(applyObj: ApplyRule): ApplyRule {
		if (!("applykey" in applyObj) || !("token" in applyObj) || !("key" in applyObj)) {
			throw new InsightError("APPLY object must contain applykey, token and key.");
		}

		const applykey = applyObj.applykey;
		const token = applyObj.token;
		const key = applyObj.key;

		if (applykey.length !== 1) {
			throw new InsightError("APPLYRULE must have only 1 key.");
		}

		if (token !== "MAX" && token !== "MIN" && token !== "SUM" && token !== "COUNT" && token !== "AVG") {
			throw new InsightError("APPLY token must be 'MAX', 'MIN', 'SUM', 'COUNT' or 'AVG'.");
		}

		return {
			applykey: applykey,
			token: token,
			key: key,
		};
	}

	private static uniqueApplyKeys(applyRules: ApplyRule[]): boolean {
		const applyKeys: string[] = [];
		for (const ar of applyRules) {
			applyKeys.push(ar.key);
		}
		// https://www.geeksforgeeks.org/how-to-create-a-typescript-function-to-check-for-duplicates-in-an-array/
		return !applyKeys.every((item, index) => applyKeys.indexOf(item) === index);
	}
}
