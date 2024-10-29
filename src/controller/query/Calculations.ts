import Decimal from "decimal.js";

export class Calculations {
	public static calculateMax(values: any): number {
		let maximum = values[0];

		for (const item in values) {
			maximum = maximum < values[item] ? values[item] : maximum;
		}
		return maximum;
	}

	public static calculateMin(values: any): number {
		let minimum = values[0];

		for (const item in values) {
			minimum = minimum > values[item] ? values[item] : minimum;
		}
		return minimum;
	}

	public static calculateAvg(values: any): number {
		let total = new Decimal(0);
		for (const num of values) {
			const decimalVal = new Decimal(num);
			total = Decimal.add(decimalVal, total);
		}
		const avg = total.toNumber() / values.length;
		const rounding = 2;
		return Number(avg.toFixed(rounding));
	}

	public static calculateSum(values: any): number {
		let total = new Decimal(0);
		for (const num of values) {
			const decimalVal = new Decimal(num);
			total = Decimal.add(decimalVal, total);
		}
		const rounding = 2;
		return Number(total.toFixed(rounding));
	}

	public static calculateCount(data: any): number {
		// https://stackoverflow.com/questions/5667888/counting-the-occurrences-frequency-of-array-elements
		const counts: any = {};
		for (const item of data) {
			counts[item] = counts[item] ? counts[item] + 1 : 1;
		}
		return counts.size;
	}
}
