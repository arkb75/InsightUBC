import Decimal from "decimal.js";
import { InsightError } from "../IInsightFacade";

export class Calculations {
	public static calculate(data: any, token: string): number {
		switch (token) {
			case "MAX":
				if (typeof data[0] !== "number") {
					throw new InsightError("invalid field type: cannot use MAX token on a sfield");
				} else {
					return this.calculateMax(data);
				}
			case "MIN":
				if (typeof data[0] !== "number") {
					throw new InsightError("invalid field type: cannot use MIN token on a sfield");
				} else {
					return this.calculateMin(data);
				}
			case "AVG":
				if (typeof data[0] !== "number") {
					throw new InsightError("invalid field type: cannot use AVG token on a sfield");
				} else {
					return this.calculateAvg(data);
				}
			case "SUM":
				if (typeof data[0] !== "number") {
					throw new InsightError("invalid field type: cannot use AVG token on a sfield");
				} else {
					return this.calculateSum(data);
				}
			case "COUNT":
				return this.calculateCount(data);
			default:
				throw new InsightError(`Unsupported apply token: ${token}`);
		}
	}

	private static calculateMax(values: any): number {
		let maximum = values[0];

		for (const item in values) {
			maximum = maximum < values[item] ? values[item] : maximum;
		}
		return maximum;
	}

	private static calculateMin(values: any): number {
		let minimum = values[0];

		for (const item in values) {
			minimum = minimum > values[item] ? values[item] : minimum;
		}
		return minimum;
	}

	private static calculateAvg(values: any): number {
		let total = new Decimal(0);
		for (const num of values) {
			const decimalVal = new Decimal(num);
			total = Decimal.add(decimalVal, total);
		}
		const avg = total.toNumber() / values.length;
		const rounding = 2;
		return Number(avg.toFixed(rounding));
	}

	private static calculateSum(values: any): number {
		let total = new Decimal(0);
		for (const num of values) {
			const decimalVal = new Decimal(num);
			total = Decimal.add(decimalVal, total);
		}
		const rounding = 2;
		return Number(total.toFixed(rounding));
	}

	private static calculateCount(data: any): number {
		// https://stackoverflow.com/questions/5667888/counting-the-occurrences-frequency-of-array-elements
		const counts: any = {};
		for (const item of data) {
			counts[item] = counts[item] ? counts[item] + 1 : 1;
		}
		return Object.keys(counts).length;
	}
}
