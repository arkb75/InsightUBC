import {
	IInsightFacade,
	InsightDataset,
	InsightDatasetKind,
	InsightError,
	InsightResult,
	NotFoundError,
	ResultTooLargeError,
} from "../../src/controller/IInsightFacade";
import InsightFacade from "../../src/controller/InsightFacade";
import { clearDisk, getContentFromArchives, loadTestQuery } from "../TestUtil";

import { expect, use } from "chai";
import chaiAsPromised from "chai-as-promised";

use(chaiAsPromised);

export interface ITestQuery {
	title?: string;
	input: unknown;
	errorExpected: boolean;
	expected: any;
}

describe("InsightFacade", function () {
	let facade: IInsightFacade;

	// Declare datasets used in tests. You should add more datasets like this!
	let sections: string;
	let sections2: string;
	let invalidsection: string;
	let nothingsection: string;

	before(async function () {
		// This block runs once and loads the datasets.
		sections = await getContentFromArchives("pair.zip");
		sections2 = await getContentFromArchives("elysia.zip");
		invalidsection = await getContentFromArchives("invalidsection.zip");
		nothingsection = await getContentFromArchives("nothing.zip");

		// Just in case there is anything hanging around from a previous run of the test suite
		await clearDisk();
	});

	describe("AddDataset", function () {
		beforeEach(function () {
			// This section resets the insightFacade instance
			// This runs before each test
			facade = new InsightFacade();
		});

		afterEach(async function () {
			// This section resets the data directory (removing any cached data)
			// This runs after each test, which should make each test independent of the previous one
			await clearDisk();
		});

		// it("should reject with  an empty dataset id", async function () {
		// 	try {
		// 		await facade.addDataset("", sections, InsightDatasetKind.Sections);
		// 	} catch (err) {
		// 		expect(err).to.be.instanceOf(InsightError);
		// 	}
		// 	expect.fail("Should have thrown above.");
		// });

		// 1 [accepted]
		it("should reject with  an empty dataset id", function () {
			const result = facade.addDataset("", sections, InsightDatasetKind.Sections);

			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		// 2 [accepted]
		it("should successfully add a valid dataset", async function () {
			const result = await facade.addDataset("validDataSet", sections2, InsightDatasetKind.Sections);
			expect(result).to.be.include("validDataSet");
		});

		// 3 [accepted]
		it("should reject with only spaces", async function () {
			try {
				await facade.addDataset(" ", sections2, InsightDatasetKind.Sections);
				expect.fail("Not supposed to happen");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		// 4 [accpeted]
		it("should reject with underscores", async function () {
			try {
				await facade.addDataset("el_ysia", sections2, InsightDatasetKind.Sections);
				expect.fail("how did u fail");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		// 5 [accpeted]
		it("should reject with invalid content", async function () {
			try {
				await facade.addDataset("valid", invalidsection, InsightDatasetKind.Sections);
				expect.fail("failure");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		// 6 [accepted]
		it("should reject with same ID", async function () {
			const result = await facade.addDataset("dududu", sections2, InsightDatasetKind.Sections);
			expect(result).to.be.include("dududu");

			// second try ;)
			try {
				await facade.addDataset("dududu", sections2, InsightDatasetKind.Sections);
				expect.fail("should have rejected");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		// 7 [accepted]
		it("should reject with nonzip file", async function () {
			try {
				await facade.addDataset("valid", "fakezipfileLOL", InsightDatasetKind.Sections);
				expect.fail("why did u keep going");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		// 8 [accepted]
		it("should reject with nothing", async function () {
			try {
				await facade.addDataset("valid", nothingsection, InsightDatasetKind.Sections);
				expect.fail("lmao");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		// 9 [accepted]
		it("should reject with empty section", async function () {
			try {
				await facade.addDataset("valid", invalidsection, InsightDatasetKind.Sections);
				expect.fail("lol");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		// 10 [accepted]
		it("accept double add valid", async function () {
			const result = await facade.addDataset("elysia", sections2, InsightDatasetKind.Sections);
			expect(result).to.be.include("elysia");

			// second try ;)
			const result2 = await facade.addDataset("big", sections2, InsightDatasetKind.Sections);
			expect(result2).to.be.include("big");
		});

		// 11 [accepted]
		it("reject with empty content", async function () {
			try {
				await facade.addDataset("melt", "", InsightDatasetKind.Sections);
				expect.fail(":(");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		// 12 [accepted]
		it("accept special characters [not underscore]", async function () {
			const result = await facade.addDataset("aikatsu#!", sections2, InsightDatasetKind.Sections);
			expect(result).to.be.include("aikatsu#!");
		});

		// 13 [accepted]
		it("accept only 1 character", async function () {
			const result = await facade.addDataset("a", sections2, InsightDatasetKind.Sections);
			expect(result).to.be.include("a");
		});

		// 14
		it("should successfully add a valid dataset with words and whitespace", async function () {
			const result = await facade.addDataset("el ysia", sections2, InsightDatasetKind.Sections);
			expect(result).to.be.include("el ysia");
		});

		// 15
		it("should reject with just underscores", async function () {
			try {
				await facade.addDataset("_", sections2, InsightDatasetKind.Sections);
				expect.fail("how did u fail");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		// 16
		it("rejects room", async function () {
			try {
				await facade.addDataset("meltryllis", sections2, InsightDatasetKind.Rooms);
				expect.fail("sad emoji");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		// 17
		it("add 2, add invalid last [reject]", async function () {
			const result = await facade.addDataset("elysia", sections2, InsightDatasetKind.Sections);
			expect(result).to.be.include("elysia");

			// second try
			const result2 = await facade.addDataset("big", sections2, InsightDatasetKind.Sections);
			expect(result2).to.be.include("big");

			// add another, invalid
			try {
				await facade.addDataset("_", sections2, InsightDatasetKind.Sections);
				expect.fail("how did u fail");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		// 18
		it("one add first then reject with words + underscore", async function () {
			const result = await facade.addDataset("dududu", sections2, InsightDatasetKind.Sections);
			expect(result).to.be.include("dududu");

			// second try ;)
			try {
				await facade.addDataset("dud_udu", sections2, InsightDatasetKind.Sections);
				expect.fail("should have rejected");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		// 19
		it("one add, then should reject with just underscore", async function () {
			const result = await facade.addDataset("dududu", sections2, InsightDatasetKind.Sections);
			expect(result).to.be.include("dududu");

			// second try ;)
			try {
				await facade.addDataset("_", sections2, InsightDatasetKind.Sections);
				expect.fail("should have rejected");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		// 20
		it("one add, then should reject whitespace", async function () {
			const result = await facade.addDataset("dududu", sections2, InsightDatasetKind.Sections);
			expect(result).to.be.include("dududu");

			// second try ;)
			try {
				await facade.addDataset(" ", sections2, InsightDatasetKind.Sections);
				expect.fail("should have rejected");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		// 21
		it("add one, then should reject nothing", async function () {
			const result = await facade.addDataset("dududu", sections2, InsightDatasetKind.Sections);
			expect(result).to.be.include("dududu");

			// second try ;)
			try {
				await facade.addDataset("", sections2, InsightDatasetKind.Sections);
				expect.fail("should have rejected");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});
	});

	describe("RemoveDataset", function () {
		beforeEach(function () {
			// This section resets the insightFacade instance
			// This runs before each test
			facade = new InsightFacade();
		});

		afterEach(async function () {
			// This section resets the data directory (removing any cached data)
			// This runs after each test, which should make each test independent of the previous one
			await clearDisk();
		});

		// 1 [accepted]
		it("remove one", async function () {
			const result = await facade.addDataset("lll", sections2, InsightDatasetKind.Sections);
			expect(result).to.be.include("lll");

			const endresult = await facade.removeDataset("lll");
			expect(endresult).to.be.equal("lll");
		});

		// 2 [accepted]
		it("should reject with invalid id [underscore]", async function () {
			try {
				await facade.removeDataset("eli_i");
				expect.fail("failed");
			} catch (err) {
				if (err instanceof NotFoundError) {
					expect.fail("Not found error is wrongggg :(((");
				}
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		// 3 [accepted]
		it("should reject with invalid id [whitespace]", async function () {
			try {
				await facade.removeDataset(" ");
				expect.fail("failed");
			} catch (err) {
				if (err instanceof NotFoundError) {
					expect.fail("Not found error is wrongggg :(((");
				}
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		// 4 [accepted]
		it("successfully remove multiple with same name", async function () {
			const result = await facade.addDataset("lll", sections2, InsightDatasetKind.Sections);
			expect(result).to.be.include("lll");

			const endresult1 = await facade.removeDataset("lll");
			expect(endresult1).to.be.equal("lll");

			const result2 = await facade.addDataset("lll", sections2, InsightDatasetKind.Sections);
			expect(result2).to.be.include("lll");

			const endresult = await facade.removeDataset("lll");
			expect(endresult).to.be.equal("lll");
		});

		// 5 [accepted]
		it("should reject remove when already gone", async function () {
			const result = await facade.addDataset("lll", sections2, InsightDatasetKind.Sections);
			expect(result).to.be.include("lll");

			const endresult = await facade.removeDataset("lll");
			expect(endresult).to.be.equal("lll");

			try {
				await facade.removeDataset("lll");
				expect.fail("failed");
			} catch (err) {
				expect(err).to.be.instanceOf(NotFoundError);
			}
		});

		// 6 [accepted]
		it("not found error", async function () {
			// const endresult = await facade.removeDataset("Nonexistantidlmao");
			// return expect(endresult).to.be.eventually.rejectedWith(NotFoundError);

			try {
				await facade.removeDataset("nonexistantresultlol");
				expect.fail("how did this happen");
			} catch (err) {
				expect(err).to.be.instanceOf(NotFoundError);
			}
		});
	});

	describe("PerformQuery", function () {
		/**
		 * Loads the TestQuery specified in the test name and asserts the behaviour of performQuery.
		 *
		 * Note: the 'this' parameter is automatically set by Mocha and contains information about the test.
		 */
		async function checkQuery(this: Mocha.Context): Promise<void> {
			//changed never to void
			if (!this.test) {
				throw new Error(
					"Invalid call to checkQuery." +
						"Usage: 'checkQuery' must be passed as the second parameter of Mocha's it(..) function." +
						"Do not invoke the function directly."
				);
			}
			// Destructuring assignment to reduce property accesses
			const { input, expected, errorExpected } = await loadTestQuery(this.test.title);
			let result: InsightResult[];
			try {
				result = await facade.performQuery(input);
				expect(result).to.be.deep.equal(expected);
			} catch (err) {
				if (!errorExpected) {
					expect.fail(`performQuery threw unexpected error: ${err}`);
				}

				if (err instanceof ResultTooLargeError) {
					expect(expected).to.be.equal("ResultTooLargeError");
				} else if (err instanceof InsightError) {
					expect(expected).to.be.equal("InsightError");
				} else {
					expect.fail("bruh how did this even happen :sob:");
				}
				return;
			}

			if (errorExpected) {
				expect.fail(`performQuery resolved when it should have rejected with ${expected}`);
			}
		}

		before(async function () {
			facade = new InsightFacade();

			// Add the datasets to InsightFacade once.
			// Will *fail* if there is a problem reading ANY dataset.
			const loadDatasetPromises: Promise<string[]>[] = [
				facade.addDataset("sections", sections, InsightDatasetKind.Sections),
			];

			try {
				await Promise.all(loadDatasetPromises);
			} catch (err) {
				throw new Error(`In PerformQuery Before hook, dataset(s) failed to be added. \n${err}`);
			}
		});

		after(async function () {
			await clearDisk();
		});

		// Examples demonstrating how to test performQuery using the JSON Test Queries.
		// The relative path to the query file must be given in square brackets.
		it("[invalid/invalid.json] Query missing WHERE", checkQuery);
		it("[invalid/datasetNotFound.json] datasetNotFound", checkQuery);
		it("[invalid/invalidKey.json] invalidKey", checkQuery);
		it("[invalid/lotsOfResultsHelp.json] lotsOfResultsHelp", checkQuery);
		it("[invalid/missingCondition.json] missingCondition", checkQuery);
		it("[invalid/referencingMultipleDatasets.json] MultipleDatasets", checkQuery);
		it("[invalid/invalidOrderKey.json] invalidOrderKey", checkQuery);
		it("[invalid/invalidWhereField.json] invalidWhereField", checkQuery);
		it("[invalid/noMiddleWildcard.json] noMiddleWild*card", checkQuery);
		it("[invalid/slightlyAbove5000.json] slightlyAbove5000", checkQuery);

		it("[valid/simple.json] SELECT dept, avg WHERE avg > 97", checkQuery);
		it("[valid/complex.json] complex query", checkQuery);
		it("[valid/complex2.json] complex2 query", checkQuery);
		it("[valid/notCondition.json] notCondition", checkQuery);
		it("[valid/wildCard1.json] wildCard*", checkQuery);
		it("[valid/wildCard2.json] *wildCard", checkQuery);
		it("[valid/wildCard3.json] *wildCard*", checkQuery);
		it("[valid/exactly5000.json] exactly5000", checkQuery);
		it("[valid/exactly4999.json] exactly4999", checkQuery);
		it("[valid/just0.json] just0", checkQuery);
		it("[valid/just1.json] just1", checkQuery);
		it("[valid/aLotofRandomStuff.json] aLotofRandomStuff", checkQuery);

		it("[valid/onlyAnd.json] onlyAnd", checkQuery);
		it("[valid/onlyOr.json] onlyOr", checkQuery);
		it("[valid/andOr.json] andOr", checkQuery);
		it("[valid/gT.json] gT", checkQuery);
		it("[valid/lT.json] lT", checkQuery);
		it("[valid/lTEQ.json] lTEQ", checkQuery);
		it("[valid/eQ.json] eQ", checkQuery);
		it("[valid/gTEQ.json] gTEQ", checkQuery);
		it("[valid/iS.json] iS", checkQuery);
	});

	describe("ListDatasets", function () {
		beforeEach(function () {
			// This section resets the insightFacade instance
			// This runs before each test
			facade = new InsightFacade();
		});

		afterEach(async function () {
			// This section resets the data directory (removing any cached data)
			// This runs after each test, which should make each test independent of the previous one
			await clearDisk();
		});

		// 1 [accepted] todo: removed cause error cause when doing lint:check
		// it("should return empty array with no datasets added", async function () {
		// 	const result = await facade.listDatasets();

		// 	expect(result).to.be.an("array").that.is.empty;
		// });

		// 2
		it("one valid dataset added", async function () {
			await facade.addDataset("elysia", sections2, InsightDatasetKind.Sections);

			const result = await facade.listDatasets();

			expect(result).to.be.an("array").that.has.lengthOf(1);

			const dataset: InsightDataset = result[0];

			expect(dataset.id).to.be.equal("elysia");
			expect(dataset.numRows).to.be.a("number").that.is.greaterThan(0);
		});

		// 3
		it("multiple datasets added", async function () {
			const result = await facade.addDataset("elysia", sections2, InsightDatasetKind.Sections);
			expect(result).to.be.include("elysia");

			const result1 = await facade.addDataset("aponia", sections2, InsightDatasetKind.Sections);
			expect(result1).to.be.include("aponia");

			const result2 = await facade.listDatasets();
			//expect(result2).to.have.lengthOf(2);

			//expect(result2).to.be.an("array").that.has.lengthOf(2);

			const dataset: InsightDataset = result2[0];
			const dataset2: InsightDataset = result2[1];

			expect(dataset.id).to.be.equal("elysia");
			expect(dataset2.id).to.be.equal("aponia");
			expect(dataset.numRows).to.be.a("number").that.is.greaterThan(0);
			expect(dataset2.numRows).to.be.a("number").that.is.greaterThan(0);
		});

		// 4
		it("add, remove and list", async function () {
			const result1 = await facade.addDataset("elysia", sections2, InsightDatasetKind.Sections);
			expect(result1).to.be.include("elysia");

			const result = await facade.addDataset("aponia", sections2, InsightDatasetKind.Sections);
			expect(result).to.be.include("aponia");

			const endresult = await facade.removeDataset("aponia");
			expect(endresult).to.be.equal("aponia");

			const result2 = await facade.listDatasets();
			expect(result2).to.be.an("array").that.has.lengthOf(1);
			expect(result2[0].id).to.be.equal("elysia");
		});
	});
});
