import { expect } from "chai";
import { QueryParser } from "../../src/controller/query/QueryParser";
import { InsightError } from "../../src/controller/IInsightFacade";

describe("QueryParser", () => {
	it("Should parse a valid simple query", () => {
		const query = {
			WHERE: {},
			OPTIONS: {
				COLUMNS: ["courses_avg"],
			},
		};
		const result = QueryParser.parse(query);
		expect(result).to.deep.equal({
			WHERE: { type: "EMPTY" },
			OPTIONS: { COLUMNS: ["courses_avg"] },
		});
	});

	it("Should parse a valid query with GT filter", () => {
		const query = {
			WHERE: {
				GT: { courses_avg: 90 },
			},
			OPTIONS: {
				COLUMNS: ["courses_dept", "courses_avg"],
			},
		};
		const result = QueryParser.parse(query);
		expect(result).to.deep.equal({
			WHERE: {
				type: "MCOMPARISON",
				key: "courses_avg",
				operator: "GT",
				value: 90,
			},
			OPTIONS: {
				COLUMNS: ["courses_dept", "courses_avg"],
			},
		});
	});

	it("Should parse a valid query with AND filter", () => {
		const query = {
			WHERE: {
				AND: [{ GT: { courses_avg: 90 } }, { IS: { courses_dept: "cpsc" } }],
			},
			OPTIONS: {
				COLUMNS: ["courses_dept", "courses_avg"],
			},
		};
		const result = QueryParser.parse(query);
		expect(result).to.deep.equal({
			WHERE: {
				type: "LOGIC",
				operator: "AND",
				filters: [
					{
						type: "MCOMPARISON",
						key: "courses_avg",
						operator: "GT",
						value: 90,
					},
					{
						type: "SCOMPARISON",
						key: "courses_dept",
						operator: "IS",
						value: "cpsc",
					},
				],
			},
			OPTIONS: {
				COLUMNS: ["courses_dept", "courses_avg"],
			},
		});
	});

	it("Should throw an error for missing WHERE", () => {
		const query = {
			OPTIONS: {
				COLUMNS: ["courses_avg"],
			},
		};
		expect(() => QueryParser.parse(query)).to.throw(InsightError, "Query must contain WHERE and OPTIONS.");
	});

	it("Should throw an error for invalid filter", () => {
		const query = {
			WHERE: {
				INVALID: {},
			},
			OPTIONS: {
				COLUMNS: ["courses_avg"],
			},
		};
		expect(() => QueryParser.parse(query)).to.throw(InsightError, "Invalid filter in WHERE clause.");
	});

	it("Should throw an error for invalid ORDER key not in COLUMNS", () => {
		const query = {
			WHERE: {},
			OPTIONS: {
				COLUMNS: ["courses_avg"],
				ORDER: "courses_dept",
			},
		};
		expect(() => QueryParser.parse(query)).to.throw(InsightError, "ORDER key must be in COLUMNS.");
	});

	it("Should parse valid query from simple.json", () => {
		const query = {
			WHERE: {
				GT: {
					sections_avg: 97,
				},
			},
			OPTIONS: {
				COLUMNS: ["sections_dept", "sections_avg"],
				ORDER: "sections_avg",
			},
		};
		expect(() => QueryParser.parse(query)).to.not.throw();
	});

	it("Should parse valid query with OR", () => {
		const query = {
			WHERE: {
				OR: [{ IS: { courses_dept: "cpsc" } }, { IS: { courses_dept: "math" } }],
			},
			OPTIONS: {
				COLUMNS: ["courses_dept", "courses_avg"],
				ORDER: "courses_dept",
			},
		};
		expect(() => QueryParser.parse(query)).to.not.throw();
	});

	it("Should parse valid query with complex logic", () => {
		const query = {
			WHERE: {
				AND: [
					{ IS: { courses_dept: "cpsc" } },
					{
						OR: [{ GT: { courses_avg: 85 } }, { LT: { courses_avg: 70 } }],
					},
				],
			},
			OPTIONS: {
				COLUMNS: ["courses_dept", "courses_avg"],
				ORDER: {
					dir: "DOWN",
					keys: ["courses_avg"],
				},
			},
		};
		expect(() => QueryParser.parse(query)).to.not.throw();
	});

	it("Should parse valid query with NOT condition", () => {
		const query = {
			WHERE: {
				NOT: {
					IS: { courses_instructor: "*smith*" },
				},
			},
			OPTIONS: {
				COLUMNS: ["courses_instructor", "courses_avg"],
				ORDER: "courses_avg",
			},
		};
		expect(() => QueryParser.parse(query)).to.not.throw();
	});

	it("Should parse valid query with wildcard IS", () => {
		const query = {
			WHERE: {
				IS: { courses_title: "*intro*" },
			},
			OPTIONS: {
				COLUMNS: ["courses_title", "courses_avg"],
				ORDER: "courses_title",
			},
		};
		expect(() => QueryParser.parse(query)).to.not.throw();
	});

	it("Should throw error for invalid logic comparator", () => {
		const query = {
			WHERE: {
				AND: {},
			},
			OPTIONS: {
				COLUMNS: ["courses_dept"],
			},
		};
		expect(() => QueryParser.parse(query)).to.throw(InsightError, "AND must be a non-empty array.");
	});

	it("Should throw error for invalid IS comparator", () => {
		const query = {
			WHERE: {
				IS: { courses_dept: 123 },
			},
			OPTIONS: {
				COLUMNS: ["courses_dept"],
			},
		};
		expect(() => QueryParser.parse(query)).to.throw(InsightError, "Value of IS must be a string.");
	});

	it("Should throw error for invalid GT comparator", () => {
		const query = {
			WHERE: {
				GT: { courses_avg: "ninety" },
			},
			OPTIONS: {
				COLUMNS: ["courses_dept", "courses_avg"],
			},
		};
		expect(() => QueryParser.parse(query)).to.throw(InsightError, "Value of GT must be a number.");
	});

	it("Should throw error for missing COLUMNS in OPTIONS", () => {
		const query = {
			WHERE: {},
			OPTIONS: {},
		};
		expect(() => QueryParser.parse(query)).to.throw(InsightError, "OPTIONS must contain COLUMNS.");
	});

	it("Should throw error for empty COLUMNS array", () => {
		const query = {
			WHERE: {},
			OPTIONS: {
				COLUMNS: [],
			},
		};
		expect(() => QueryParser.parse(query)).to.throw(InsightError, "COLUMNS must be a non-empty array.");
	});

	it("Should throw error for invalid ORDER type", () => {
		const query = {
			WHERE: {},
			OPTIONS: {
				COLUMNS: ["courses_dept"],
				ORDER: 123,
			},
		};
		expect(() => QueryParser.parse(query)).to.throw(InsightError, "ORDER must be a string or an object.");
	});

	it("Should parse valid query with ORDER object", () => {
		const query = {
			WHERE: {},
			OPTIONS: {
				COLUMNS: ["courses_dept", "courses_avg"],
				ORDER: {
					dir: "UP",
					keys: ["courses_avg", "courses_dept"],
				},
			},
		};
		expect(() => QueryParser.parse(query)).to.not.throw();
	});

	it("Should throw error for invalid ORDER dir", () => {
		const query = {
			WHERE: {},
			OPTIONS: {
				COLUMNS: ["courses_dept", "courses_avg"],
				ORDER: {
					dir: "SIDEWAYS",
					keys: ["courses_avg"],
				},
			},
		};
		expect(() => QueryParser.parse(query)).to.throw(InsightError, "ORDER dir must be 'UP' or 'DOWN'.");
	});

	it("Should throw error for ORDER keys not in COLUMNS", () => {
		const query = {
			WHERE: {},
			OPTIONS: {
				COLUMNS: ["courses_dept"],
				ORDER: {
					dir: "UP",
					keys: ["courses_avg"],
				},
			},
		};
		expect(() => QueryParser.parse(query)).to.throw(InsightError, "ORDER keys must be in COLUMNS.");
	});
});
