import { expect } from "chai";
import { QueryParser } from "../../src/controller/query/QueryParser";
import { InsightError } from "../../src/controller/IInsightFacade";
import * as fs from "fs-extra";
import * as path from "path";

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
		expect(() => QueryParser.parse(query)).throw(InsightError, "Query must contain WHERE and OPTIONS.");
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

	// Load additional test cases from provided query files
	const queryDir = path.join(__dirname, "../resources/queries");
	const validQueriesDir = path.join(queryDir, "valid");
	const invalidQueriesDir = path.join(queryDir, "invalid");

	fs.readdirSync(validQueriesDir).forEach((file) => {
		it(`Should parse valid query from file: ${file}`, () => {
			const queryFileContent = fs.readJSONSync(path.join(validQueriesDir, file));
			const query = queryFileContent.input;
			const errorExpected = queryFileContent.errorExpected;

			if (errorExpected) {
				expect(() => QueryParser.parse(query)).to.throw(InsightError);
			} else {
				expect(() => QueryParser.parse(query)).to.not.throw();
			}
		});
	});

	fs.readdirSync(invalidQueriesDir).forEach((file) => {
		it(`Should throw error for invalid query from file: ${file}`, () => {
			const query = fs.readJSONSync(path.join(invalidQueriesDir, file));
			expect(() => QueryParser.parse(query)).to.throw(InsightError);
		});
	});
});
