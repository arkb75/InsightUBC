import {
	IInsightFacade,
	//InsightDataset,
	//InsightDataset, TODO: Remove comment later
	InsightDatasetKind,
	InsightError,
	InsightResult,
	NotFoundError,
	//NotFoundError, TODO: Remove comment later
	ResultTooLargeError,
} from "../../src/controller/IInsightFacade";
import InsightFacade from "../../src/controller/InsightFacade";
import { clearDisk, getContentFromArchives, loadTestQuery } from "../TestUtil";

//import { LogicComparison, Negation, Comparison } from "../../src/controller/query/IQuery"; // removed Filter for testing purposes

import { expect, use } from "chai";
import chaiAsPromised from "chai-as-promised";
//import { QueryExecutor } from "../../src/controller/query/QueryExecutor";import {
// 	IInsightFacade,
// 	//InsightDataset,
// 	//InsightDataset, TODO: Remove comment later
// 	InsightDatasetKind,
// 	InsightError,
// 	InsightResult,
// 	NotFoundError,
// 	//NotFoundError, TODO: Remove comment later
// 	ResultTooLargeError,
// } from "../../src/controller/IInsightFacade";
// import InsightFacade from "../../src/controller/InsightFacade";
// import { clearDisk, getContentFromArchives, loadTestQuery } from "../TestUtil";
//
// //import { LogicComparison, Negation, Comparison } from "../../src/controller/query/IQuery"; // removed Filter for testing purposes
//
// import { expect, use } from "chai";
// import chaiAsPromised from "chai-as-promised";
// //import { QueryExecutor } from "../../src/controller/query/QueryExecutor";
//
// use(chaiAsPromised);
//
// export interface ITestQuery {
// 	title?: string;
// 	input: unknown;
// 	errorExpected: boolean;
// 	expected: any;
// }
//
// describe("InsightFacade", function () {
// 	let facade: IInsightFacade;
//
// 	// Declare datasets used in tests. You should add more datasets like this!
// 	let sections: string;
// 	let sections2: string;
// 	let invalidsection: string;
// 	let nothingsection: string;
// 	let rooms: string;
//
// 	before(async function () {
// 		// This block runs once and loads the datasets.
// 		sections = await getContentFromArchives("pair.zip");
// 		sections2 = await getContentFromArchives("elysia.zip");
// 		invalidsection = await getContentFromArchives("invalidsection.zip");
// 		nothingsection = await getContentFromArchives("nothing.zip");
// 		rooms = await getContentFromArchives("campus.zip");
//
// 		// Just in case there is anything hanging around from a previous run of the test suite
// 		await clearDisk();
// 	});
//
// 	describe("AddDataset", function () {
// 		beforeEach(function () {
// 			// This section resets the insightFacade instance
// 			// This runs before each test
// 			facade = new InsightFacade();
// 		});
//
// 		afterEach(async function () {
// 			// This section resets the data directory (removing any cached data)
// 			// This runs after each test, which should make each test independent of the previous one
// 			await clearDisk();
// 		});
//
// 		// it("should reject with  an empty dataset id", async function () {
// 		// 	try {
// 		// 		await facade.addDataset("", sections, InsightDatasetKind.Sections);
// 		// 	} catch (err) {
// 		// 		expect(err).to.be.instanceOf(InsightError);
// 		// 	}
// 		// 	expect.fail("Should have thrown above.");
// 		// });
//
// 		//1[accepted]
// 		it("should reject with  an empty dataset id", function () {
// 			const result = facade.addDataset("", sections, InsightDatasetKind.Sections);
//
// 			return expect(result).to.eventually.be.rejectedWith(InsightError);
// 		});
//
// 		// 2 [accepted]
// 		it("should successfully add a valid dataset", async function () {
// 			const result = await facade.addDataset("validDataSet", sections2, InsightDatasetKind.Sections);
// 			expect(result).to.be.include("validDataSet");
// 		});
//
// 		// 3 [accepted]
// 		it("should reject with only spaces", async function () {
// 			try {
// 				await facade.addDataset(" ", sections2, InsightDatasetKind.Sections);
// 				expect.fail("Not supposed to happen");
// 			} catch (err) {
// 				expect(err).to.be.instanceOf(InsightError);
// 			}
// 		});
//
// 		// 4 [accpeted]
// 		it("should reject with underscores", async function () {
// 			try {
// 				await facade.addDataset("el_ysia", sections2, InsightDatasetKind.Sections);
// 				expect.fail("how did u fail");
// 			} catch (err) {
// 				expect(err).to.be.instanceOf(InsightError);
// 			}
// 		});
//
// 		// 5 [accpeted]
// 		it("should reject with invalid content", async function () {
// 			try {
// 				await facade.addDataset("valid", invalidsection, InsightDatasetKind.Sections);
// 				expect.fail("failure");
// 			} catch (err) {
// 				expect(err).to.be.instanceOf(InsightError);
// 			}
// 		});
//
// 		// 6 [accepted]
// 		it("should reject with same ID", async function () {
// 			const result = await facade.addDataset("dududu", sections2, InsightDatasetKind.Sections);
// 			expect(result).to.be.include("dududu");
//
// 			// second try ;)
// 			try {
// 				await facade.addDataset("dududu", sections2, InsightDatasetKind.Sections);
// 				expect.fail("should have rejected");
// 			} catch (err) {
// 				expect(err).to.be.instanceOf(InsightError);
// 			}
// 		});
//
// 		// 7 [accepted]
// 		it("should reject with nonzip file", async function () {
// 			try {
// 				await facade.addDataset("valid", "fakezipfileLOL", InsightDatasetKind.Sections);
// 				expect.fail("why did u keep going");
// 			} catch (err) {
// 				expect(err).to.be.instanceOf(InsightError);
// 			}
// 		});
//
// 		// 8 [accepted]
// 		it("should reject with nothing", async function () {
// 			try {
// 				await facade.addDataset("valid", nothingsection, InsightDatasetKind.Sections);
// 				expect.fail("lmao");
// 			} catch (err) {
// 				expect(err).to.be.instanceOf(InsightError);
// 			}
// 		});
//
// 		// 9 [accepted]
// 		it("should reject with empty section", async function () {
// 			try {
// 				await facade.addDataset("valid", invalidsection, InsightDatasetKind.Sections);
// 				expect.fail("lol");
// 			} catch (err) {
// 				expect(err).to.be.instanceOf(InsightError);
// 			}
// 		});
//
// 		// 10 [accepted]
// 		it("accept double add valid", async function () {
// 			const result = await facade.addDataset("elysia", sections2, InsightDatasetKind.Sections);
// 			expect(result).to.be.include("elysia");
//
// 			// second try ;)
// 			const result2 = await facade.addDataset("big", sections2, InsightDatasetKind.Sections);
// 			expect(result2).to.be.include("big");
// 		});
//
// 		// 11 [accepted]
// 		it("reject with empty content", async function () {
// 			try {
// 				await facade.addDataset("melt", "", InsightDatasetKind.Sections);
// 				expect.fail(":(");
// 			} catch (err) {
// 				expect(err).to.be.instanceOf(InsightError);
// 			}
// 		});
//
// 		// 12 [accepted]
// 		it("accept special characters [not underscore]", async function () {
// 			const result = await facade.addDataset("aikatsu#!", sections2, InsightDatasetKind.Sections);
// 			expect(result).to.be.include("aikatsu#!");
// 		});
//
// 		// 13 [accepted]
// 		it("accept only 1 character", async function () {
// 			const result = await facade.addDataset("a", sections2, InsightDatasetKind.Sections);
// 			expect(result).to.be.include("a");
// 		});
//
// 		// 14
// 		it("should successfully add a valid dataset with words and whitespace", async function () {
// 			const result = await facade.addDataset("el ysia", sections2, InsightDatasetKind.Sections);
// 			expect(result).to.be.include("el ysia");
// 		});
//
// 		// 15
// 		it("should reject with just underscores", async function () {
// 			try {
// 				await facade.addDataset("_", sections2, InsightDatasetKind.Sections);
// 				expect.fail("how did u fail");
// 			} catch (err) {
// 				expect(err).to.be.instanceOf(InsightError);
// 			}
// 		});
//
// 		// 16
// 		it("rejects room", async function () {
// 			try {
// 				await facade.addDataset("meltryllis", sections2, InsightDatasetKind.Rooms);
// 				expect.fail("sad emoji");
// 			} catch (err) {
// 				expect(err).to.be.instanceOf(InsightError);
// 			}
// 		});
//
// 		// 17
// 		it("add 2, add invalid last [reject]", async function () {
// 			const result = await facade.addDataset("elysia", sections2, InsightDatasetKind.Sections);
// 			expect(result).to.be.include("elysia");
//
// 			// second try
// 			const result2 = await facade.addDataset("big", sections2, InsightDatasetKind.Sections);
// 			expect(result2).to.be.include("big");
//
// 			// add another, invalid
// 			try {
// 				await facade.addDataset("_", sections2, InsightDatasetKind.Sections);
// 				expect.fail("how did u fail");
// 			} catch (err) {
// 				expect(err).to.be.instanceOf(InsightError);
// 			}
// 		});
//
// 		// 18
// 		it("one add first then reject with words + underscore", async function () {
// 			const result = await facade.addDataset("dududu", sections2, InsightDatasetKind.Sections);
// 			expect(result).to.be.include("dududu");
//
// 			// second try ;)
// 			try {
// 				await facade.addDataset("dud_udu", sections2, InsightDatasetKind.Sections);
// 				expect.fail("should have rejected");
// 			} catch (err) {
// 				expect(err).to.be.instanceOf(InsightError);
// 			}
// 		});
//
// 		// 19
// 		it("one add, then should reject with just underscore", async function () {
// 			const result = await facade.addDataset("dududu", sections2, InsightDatasetKind.Sections);
// 			expect(result).to.be.include("dududu");
//
// 			// second try ;)
// 			try {
// 				await facade.addDataset("_", sections2, InsightDatasetKind.Sections);
// 				expect.fail("should have rejected");
// 			} catch (err) {
// 				expect(err).to.be.instanceOf(InsightError);
// 			}
// 		});
//
// 		// 20
// 		it("one add, then should reject whitespace", async function () {
// 			const result = await facade.addDataset("dududu", sections2, InsightDatasetKind.Sections);
// 			expect(result).to.be.include("dududu");
//
// 			// second try ;)
// 			try {
// 				await facade.addDataset(" ", sections2, InsightDatasetKind.Sections);
// 				expect.fail("should have rejected");
// 			} catch (err) {
// 				expect(err).to.be.instanceOf(InsightError);
// 			}
// 		});
//
// 		// 21
// 		it("add one, then should reject nothing", async function () {
// 			const result = await facade.addDataset("dududu", sections2, InsightDatasetKind.Sections);
// 			expect(result).to.be.include("dududu");
//
// 			// second try ;)
// 			try {
// 				await facade.addDataset("", sections2, InsightDatasetKind.Sections);
// 				expect.fail("should have rejected");
// 			} catch (err) {
// 				expect(err).to.be.instanceOf(InsightError);
// 			}
// 		});
//
// 		// 22
// 		it("should successfully add a valid rooms dataset", async function () {
// 			const result = await facade.addDataset("rooms", rooms, InsightDatasetKind.Rooms);
// 			expect(result).to.include("rooms");
// 		});
//
// 		// 23
// 		it("should reject adding a rooms dataset with an existing id", async function () {
// 			await facade.addDataset("rooms", rooms, InsightDatasetKind.Rooms);
// 			try {
// 				await facade.addDataset("rooms", rooms, InsightDatasetKind.Rooms);
// 				expect.fail("Should have thrown an InsightError due to duplicate id");
// 			} catch (err) {
// 				expect(err).to.be.instanceOf(InsightError);
// 			}
// 		});
//
// 		// 24
// 		it("should reject adding a rooms dataset with an invalid id", async function () {
// 			try {
// 				await facade.addDataset("_rooms", rooms, InsightDatasetKind.Rooms);
// 				expect.fail("Should have thrown an InsightError due to invalid id");
// 			} catch (err) {
// 				expect(err).to.be.instanceOf(InsightError);
// 			}
// 		});
// 	});
//
// 	describe("RemoveDataset", function () {
// 		beforeEach(function () {
// 			// This section resets the insightFacade instance
// 			// This runs before each test
// 			facade = new InsightFacade();
// 		});
//
// 		afterEach(async function () {
// 			// This section resets the data directory (removing any cached data)
// 			// This runs after each test, which should make each test independent of the previous one
// 			await clearDisk();
// 		});
//
// 		// 1 [accepted]
// 		it("remove one", async function () {
// 			const result = await facade.addDataset("lll", sections2, InsightDatasetKind.Sections);
// 			expect(result).to.be.include("lll");
//
// 			const endresult = await facade.removeDataset("lll");
// 			expect(endresult).to.be.equal("lll");
// 		});
//
// 		// 2 [accepted]
// 		it("should reject with invalid id [underscore]", async function () {
// 			try {
// 				await facade.removeDataset("eli_i");
// 				expect.fail("failed");
// 			} catch (err) {
// 				if (err instanceof NotFoundError) {
// 					expect.fail("Not found error is wrongggg :(((");
// 				}
// 				expect(err).to.be.instanceOf(InsightError);
// 			}
// 		});
//
// 		// 3 [accepted]
// 		it("should reject with invalid id [whitespace]", async function () {
// 			try {
// 				await facade.removeDataset(" ");
// 				expect.fail("failed");
// 			} catch (err) {
// 				if (err instanceof NotFoundError) {
// 					expect.fail("Not found error is wrongggg :(((");
// 				}
// 				expect(err).to.be.instanceOf(InsightError);
// 			}
// 		});
//
// 		// 4 [accepted]
// 		it("successfully remove multiple with same name", async function () {
// 			const result = await facade.addDataset("lll", sections2, InsightDatasetKind.Sections);
// 			expect(result).to.be.include("lll");
//
// 			const endresult1 = await facade.removeDataset("lll");
// 			expect(endresult1).to.be.equal("lll");
//
// 			const result2 = await facade.addDataset("lll", sections2, InsightDatasetKind.Sections);
// 			expect(result2).to.be.include("lll");
//
// 			const endresult = await facade.removeDataset("lll");
// 			expect(endresult).to.be.equal("lll");
// 		});
//
// 		// 5 [accepted]
// 		it("should reject remove when already gone", async function () {
// 			const result = await facade.addDataset("lll", sections2, InsightDatasetKind.Sections);
// 			expect(result).to.be.include("lll");
//
// 			const endresult = await facade.removeDataset("lll");
// 			expect(endresult).to.be.equal("lll");
//
// 			try {
// 				await facade.removeDataset("lll");
// 				expect.fail("failed");
// 			} catch (err) {
// 				expect(err).to.be.instanceOf(NotFoundError);
// 			}
// 		});
//
// 		// 6 [accepted]
// 		it("not found error", async function () {
// 			// const endresult = await facade.removeDataset("Nonexistantidlmao");
// 			// return expect(endresult).to.be.eventually.rejectedWith(NotFoundError);
//
// 			try {
// 				await facade.removeDataset("nonexistantresultlol");
// 				expect.fail("how did this happen");
// 			} catch (err) {
// 				expect(err).to.be.instanceOf(NotFoundError);
// 			}
// 		});
//
// 		// 7
// 		it("should successfully remove a rooms dataset", async function () {
// 			await facade.addDataset("rooms", rooms, InsightDatasetKind.Rooms);
// 			const result = await facade.removeDataset("rooms");
// 			expect(result).to.equal("rooms");
// 		});
//
// 		// 8
// 		it("should reject removing a non-existent rooms dataset", async function () {
// 			try {
// 				await facade.removeDataset("nonExistentRooms");
// 				expect.fail("Should have thrown a NotFoundError");
// 			} catch (err) {
// 				expect(err).to.be.instanceOf(NotFoundError);
// 			}
// 		});
//
// 		// 9
// 		it("should reject removing a rooms dataset with an invalid id", async function () {
// 			try {
// 				await facade.removeDataset("_rooms");
// 				expect.fail("Should have thrown an InsightError due to invalid id");
// 			} catch (err) {
// 				expect(err).to.be.instanceOf(InsightError);
// 			}
// 		});
//
// 		it("one concurrent active InsightFacade", async function () {
// 			const result = await facade.addDataset("lll", sections2, InsightDatasetKind.Sections);
// 			expect(result).to.be.include("lll");
// 			const newInstance = new InsightFacade();
// 			// this should still work, and work the same as facade.removeDataset("lll")
// 			const endResult = await newInstance.removeDataset("lll");
// 			expect(endResult).to.be.equal("lll");
// 		});
// 	});
//
// 	describe("PerformQuery", function () {
// 		/**
// 		 * Loads the TestQuery specified in the test name and asserts the behaviour of performQuery.
// 		 *
// 		 * Note: the 'this' parameter is automatically set by Mocha and contains information about the test.
// 		 */
//
// 		before(async function () {
// 			facade = new InsightFacade();
//
// 			// Add only the sections dataset
// 			try {
// 				await facade.addDataset("sections", sections, InsightDatasetKind.Sections);
// 			} catch (err) {
// 				throw new Error(`In PerformQuery Before hook, dataset failed to be added.\n${err}`);
// 			}
// 		});
//
// 		after(async function () {
// 			await clearDisk();
// 		});
//
// 		async function checkQuery(this: Mocha.Context): Promise<void> {
// 			//changed never to void
// 			if (!this.test) {
// 				throw new Error(
// 					"Invalid call to checkQuery." +
// 						"Usage: 'checkQuery' must be passed as the second parameter of Mocha's it(..) function." +
// 						"Do not invoke the function directly."
// 				);
// 			}
// 			// Destructuring assignment to reduce property accesses
// 			const { input, expected, errorExpected } = await loadTestQuery(this.test.title);
// 			let result: InsightResult[];
// 			try {
// 				result = await facade.performQuery(input);
// 				//console.log(result);
// 				//expect(result).to.be.deep.equal(expected);
// 				expect(result).to.have.deep.members(expected);
// 				//expect(result).to.have.ordered.members(expected);
// 			} catch (err) {
// 				if (!errorExpected) {
// 					expect.fail(`performQuery threw unexpected error: ${err}`);
// 				}
//
// 				if (err instanceof ResultTooLargeError) {
// 					expect(expected).to.be.equal("ResultTooLargeError");
// 				} else if (err instanceof InsightError) {
// 					expect(expected).to.be.equal("InsightError");
// 				} else {
// 					expect.fail("bruh how did this even happen :sob:" + err);
// 				}
// 				return;
// 			}
//
// 			if (errorExpected) {
// 				expect.fail(`performQuery resolved when it should have rejected with ${expected}`);
// 			}
// 		}
//
// 		// test invalid query - not object type
// 		it("should reject query that is not an object type", async function () {
// 			try {
// 				await facade.performQuery("test");
// 				expect.fail("Should have rejected.");
// 			} catch (err) {
// 				expect(err).to.be.instanceOf(InsightError);
// 			}
// 		});
//
// 		// test invalid query - blank
// 		it("should reject blank query", async function () {
// 			try {
// 				await facade.performQuery({});
// 				expect.fail("Should have rejected.");
// 			} catch (err) {
// 				expect(err).to.be.instanceOf(InsightError);
// 			}
// 		});
// 		// Examples demonstrating how to test performQuery using the JSON Test Queries.
// 		// The relative path to the query file must be given in square brackets.
// 		it("[valid/aLotofRandomStuff.json] aLotofRandomStuff", checkQuery);
// 		it("[invalid/invalid.json] Query missing WHERE", checkQuery);
// 		it("[invalid/datasetNotFound.json] datasetNotFound", checkQuery);
// 		it("[invalid/invalidKey.json] invalidKey", checkQuery);
// 		it("[invalid/lotsOfResultsHelp.json] lotsOfResultsHelp", checkQuery);
// 		it("[invalid/missingCondition.json] missingCondition", checkQuery);
// 		it("[invalid/referencingMultipleDatasets.json] MultipleDatasets", checkQuery);
// 		it("[invalid/invalidOrderKey.json] invalidOrderKey", checkQuery);
// 		it("[invalid/invalidWhereField.json] invalidWhereField", checkQuery);
// 		it("[invalid/noMiddleWildcard.json] noMiddleWild*card", checkQuery);
// 		it("[invalid/slightlyAbove5000.json] slightlyAbove5000", checkQuery);
// 		it("[invalid/datasetNotFound.json] Query referencing a non-existent dataset", checkQuery);
// 		it("[valid/simple.json] SELECT dept, avg WHERE avg > 97", checkQuery);
// 		it("[valid/complex.json] complex query", checkQuery);
// 		it("[valid/complex2.json] complex2 query", checkQuery);
// 		it("[valid/notCondition.json] notCondition", checkQuery);
// 		it("[valid/wildCard1.json] wildCard*", checkQuery);
// 		it("[valid/wildCard2.json] *wildCard", checkQuery);
// 		it("[valid/wildCard3.json] *wildCard*", checkQuery);
// 		it("[valid/exactly5000.json] exactly5000", checkQuery);
// 		it("[valid/exactly4999.json] exactly4999", checkQuery);
// 		it("[valid/just0.json] just0", checkQuery);
// 		it("[valid/just1.json] just1", checkQuery);
//
// 		it("[valid/onlyAnd.json] onlyAnd", checkQuery);
// 		it("[valid/onlyOr.json] onlyOr", checkQuery);
// 		it("[valid/andOr.json] andOr", checkQuery);
// 		it("[valid/gT.json] gT", checkQuery);
// 		it("[valid/lT.json] lT", checkQuery);
// 		it("[valid/lTEQ.json] lTEQ", checkQuery);
// 		it("[valid/eQ.json] eQ", checkQuery);
// 		it("[valid/gTEQ.json] gTEQ", checkQuery);
// 		it("[valid/iS.json] iS", checkQuery);
//
// 		it("[valid/orCase1.json] orCase1", checkQuery);
// 		it("[invalid/orCase2.json] orCase2", checkQuery);
//
// 		it("[valid/orCase3.json] orCase3", checkQuery);
// 		it("[valid/orCase4.json] orCase4", checkQuery);
// 		it("[valid/orCase5.json] orCase5", checkQuery);
//
// 		// c2 query engine focused (transformations and sort)
// 		it("[invalidC2/applyKeyWhere.json] Invalid key in WHERE: applyKey", checkQuery);
// 		it("[invalidC2/emptyGroup.json] Invalid GROUP in TRANSFORMATIONS: empty list", checkQuery);
// 		it("[invalidC2/invalidApplykey.json] Invalid applykey in APPLY ApplyRule: applykey has underscore", checkQuery);
// 		it("[invalidC2/invalidApplyRule.json] Invalid APPLY: ApplyRule has more than 1 key", checkQuery);
// 		it("[invalidC2/invalidArray.json] Invalid APPLY: is not a list", checkQuery);
// 		it(
// 			"[invalidC2/invalidColumnMix.json] " +
// 				"Invalid COLUMN key - has one in & not in GROUP or APPLY when TRANSFORMATIONS exists",
// 			checkQuery
// 		);
// 		it("[invalidC2/invalidColumnOrder.json] Invalid ORDER key - not in COLUMNS", checkQuery);
// 		it(
// 			"[invalidC2/invalidColumnsTransformations.json] " +
// 				"Invalid COLUMN key - not in GROUP or APPLY when TRANSFORMATIONS exists",
// 			checkQuery
// 		);
// 		it("[invalidC2/invalidDirection.json] Invalid ORDER: not valid direction", checkQuery);
// 		it("[invalidC2/invalidGroupArray.json] Invalid GROUP in TRANSFORMATIONS: not an array", checkQuery);
// 		it("[invalidC2/invalidOrderList.json] Invalid ORDER key - not a list", checkQuery);
// 		it("[invalidC2/missingApply.json] Missing APPLY in TRANSFORMATIONS", checkQuery);
// 		it("[invalidC2/missingGroup.json] Missing GROUP in TRANSFORMATIONS", checkQuery);
// 		it("[invalidC2/missingGroupApply.json] Missing GROUP and APPLY in TRANSFORMATIONS", checkQuery);
// 		it("[invalidC2/invalidKeyType.json] invalid key type for token in APPLY", checkQuery);
// 		it("[invalidC2/invalidApplyObj.json] ApplyRule missing token and key", checkQuery);
// 		it("[invalidC2/invalidToken.json] invalid token", checkQuery);
// 		it("[invalidC2/duplicateApplykey.json] duplicateApplykey", checkQuery);
// 		it("[invalidC2/sortListNoDirection.json] Invalid ORDER: has no direction when there is list of keys", checkQuery);
// 		it("[validC2/simple.json] valid transformation apply and group", checkQuery);
// 		it("[validC2/simpleSum.json] sum and single group", checkQuery);
// 		it("[validC2/sortMix.json] order on an applykey and a key", checkQuery);
// 		it("[validC2/columnApply.json] columns from APPLY and not GROUP", checkQuery);
// 		it("[validC2/columnGroup.json] columns from GROUP and not APPLY", checkQuery);
// 		it("[validC2/countM.json] count with mfield", checkQuery);
// 		it("[validC2/countS.json] count with sfield", checkQuery);
// 		it("[validC2/isolatedApply.json] APPLY that is unused", checkQuery);
// 		it("[validC2/multiple.json] multiple group and multiple apply", checkQuery);
// 		it("[validC2/multipleApply.json] single group and multiple apply", checkQuery);
// 		it("[validC2/multipleApply2.json] single group and multiple apply with different keys", checkQuery);
// 		it("[validC2/multipleGroup.json] multiple group and single apply", checkQuery);
// 		it("[validC2/orderApplykey.json] order on an applykey", checkQuery);
// 		it("[validC2/orderApplykeyDirection.json] order with given direction on an applykey", checkQuery);
// 	});
//
// 	describe("PerformQueryRooms", function () {
// 		before(async function () {
// 			facade = new InsightFacade();
//
// 			// Add only the sections dataset
// 			try {
// 				await facade.addDataset("sections", sections, InsightDatasetKind.Sections);
// 				await facade.addDataset("rooms", rooms, InsightDatasetKind.Rooms);
// 			} catch (err) {
// 				throw new Error(`In PerformQuery Before hook, dataset failed to be added.\n${err}`);
// 			}
// 		});
//
// 		after(async function () {
// 			await clearDisk();
// 		});
//
// 		async function checkQuery(this: Mocha.Context): Promise<void> {
// 			//changed never to void
// 			if (!this.test) {
// 				throw new Error(
// 					"Invalid call to checkQuery." +
// 						"Usage: 'checkQuery' must be passed as the second parameter of Mocha's it(..) function." +
// 						"Do not invoke the function directly."
// 				);
// 			}
// 			// Destructuring assignment to reduce property accesses
// 			const { input, expected, errorExpected } = await loadTestQuery(this.test.title);
// 			let result: InsightResult[];
// 			try {
// 				result = await facade.performQuery(input);
// 				//console.log(result);
// 				//expect(result).to.be.deep.equal(expected);
// 				expect(result).to.have.deep.members(expected);
// 				//expect(result).to.have.ordered.members(expected);
// 			} catch (err) {
// 				if (!errorExpected) {
// 					expect.fail(`performQuery threw unexpected error: ${err}`);
// 				}
//
// 				if (err instanceof ResultTooLargeError) {
// 					expect(expected).to.be.equal("ResultTooLargeError");
// 				} else if (err instanceof InsightError) {
// 					expect(expected).to.be.equal("InsightError");
// 				} else {
// 					expect.fail("bruh how did this even happen :sob:" + err);
// 				}
// 				return;
// 			}
//
// 			if (errorExpected) {
// 				expect.fail(`performQuery resolved when it should have rejected with ${expected}`);
// 			}
// 		}
//
// 		it("[validC2/rooms.json] simple rooms query", checkQuery);
// 		it("[validC2/emptyApply.json] empty APPLY", checkQuery);
// 		it("[validC2/countM.json] empty APPLY", checkQuery);
// 		it("[validC2/isolatedApply.json] empty APPLY", checkQuery);
// 		it("[validC2/columnApply.json] empty APPLY", checkQuery);
// 	});
//
// 	describe("PerformQuerySections", function () {
// 		before(async function () {
// 			facade = new InsightFacade();
//
// 			// Add only the sections dataset
// 			try {
// 				await facade.addDataset("sections", sections, InsightDatasetKind.Sections);
// 				await facade.addDataset("rooms", rooms, InsightDatasetKind.Rooms);
// 			} catch (err) {
// 				throw new Error(`In PerformQuery Before hook, dataset failed to be added.\n${err}`);
// 			}
// 		});
//
// 		after(async function () {
// 			await clearDisk();
// 		});
//
// 		async function checkQuery(this: Mocha.Context): Promise<void> {
// 			//changed never to void
// 			if (!this.test) {
// 				throw new Error(
// 					"Invalid call to checkQuery." +
// 						"Usage: 'checkQuery' must be passed as the second parameter of Mocha's it(..) function." +
// 						"Do not invoke the function directly."
// 				);
// 			}
// 			// Destructuring assignment to reduce property accesses
// 			const { input, expected, errorExpected } = await loadTestQuery(this.test.title);
// 			let result: InsightResult[];
// 			try {
// 				result = await facade.performQuery(input);
// 				//console.log(result);
// 				//expect(result).to.be.deep.equal(expected);
// 				expect(result).to.have.deep.members(expected);
// 				//expect(result).to.have.ordered.members(expected);
// 			} catch (err) {
// 				if (!errorExpected) {
// 					expect.fail(`performQuery threw unexpected error: ${err}`);
// 				}
//
// 				if (err instanceof ResultTooLargeError) {
// 					expect(expected).to.be.equal("ResultTooLargeError");
// 				} else if (err instanceof InsightError) {
// 					expect(expected).to.be.equal("InsightError");
// 				} else {
// 					expect.fail("bruh how did this even happen :sob:" + err);
// 				}
// 				return;
// 			}
//
// 			if (errorExpected) {
// 				expect.fail(`performQuery resolved when it should have rejected with ${expected}`);
// 			}
// 		}
//
// 		it("[validC2/rooms.json] simple rooms query", checkQuery);
// 		it("[validC2/emptyApply.json] empty APPLY", checkQuery);
// 		it("[validC2/countM.json] empty APPLY", checkQuery);
// 		it("[validC2/isolatedApply.json] empty APPLY", checkQuery);
// 		it("[validC2/columnApply.json] empty APPLY", checkQuery);
// 	});
//
// 	// describe("ListDatasets", function () {
// 	// 	beforeEach(function () {
// 	// 		// This section resets the insightFacade instance
// 	// 		// This runs before each test
// 	// 		facade = new InsightFacade();
// 	// 	});
//
// 	// 	afterEach(async function () {
// 	// 		// This section resets the data directory (removing any cached data)
// 	// 		// This runs after each test, which should make each test independent of the previous one
// 	// 		await clearDisk();
// 	// 	});
//
// 	// 	// 1 [accepted] todo: removed cause error cause when doing lint:check
// 	// 	// it("should return empty array with no datasets added", async function () {
// 	// 	// 	const result = await facade.listDatasets();
//
// 	// 	// 	expect(result).to.be.an("array").that.is.empty;
// 	// 	// });
//
// 	// 	// 2
// 	// 	it("one valid dataset added", async function () {
// 	// 		await facade.addDataset("elysia", sections2, InsightDatasetKind.Sections);
//
// 	// 		const result = await facade.listDatasets();
//
// 	// 		expect(result).to.be.an("array").that.has.lengthOf(1);
//
// 	// 		const dataset: InsightDataset = result[0];
//
// 	// 		expect(dataset.id).to.be.equal("elysia");
// 	// 		expect(dataset.numRows).to.be.a("number").that.is.greaterThan(0);
// 	// 	});
//
// 	// 	// 3
// 	// 	it("multiple datasets added", async function () {
// 	// 		const result = await facade.addDataset("elysia", sections2, InsightDatasetKind.Sections);
// 	// 		expect(result).to.be.include("elysia");
//
// 	// 		const result1 = await facade.addDataset("aponia", sections2, InsightDatasetKind.Sections);
// 	// 		expect(result1).to.be.include("aponia");
//
// 	// 		const result2 = await facade.listDatasets();
// 	// 		//expect(result2).to.have.lengthOf(2);
//
// 	// 		//expect(result2).to.be.an("array").that.has.lengthOf(2);
//
// 	// 		const dataset: InsightDataset = result2[0];
// 	// 		const dataset2: InsightDataset = result2[1];
//
// 	// 		expect(dataset.id).to.be.equal("elysia");
// 	// 		expect(dataset2.id).to.be.equal("aponia");
// 	// 		expect(dataset.numRows).to.be.a("number").that.is.greaterThan(0);
// 	// 		expect(dataset2.numRows).to.be.a("number").that.is.greaterThan(0);
// 	// 	});
//
// 	// 	// 4
// 	// 	it("add, remove and list", async function () {
// 	// 		const result1 = await facade.addDataset("elysia", sections2, InsightDatasetKind.Sections);
// 	// 		expect(result1).to.be.include("elysia");
//
// 	// 		const result = await facade.addDataset("aponia", sections2, InsightDatasetKind.Sections);
// 	// 		expect(result).to.be.include("aponia");
//
// 	// 		const endresult = await facade.removeDataset("aponia");
// 	// 		expect(endresult).to.be.equal("aponia");
//
// 	// 		const result2 = await facade.listDatasets();
// 	// 		expect(result2).to.be.an("array").that.has.lengthOf(1);
// 	// 		expect(result2[0].id).to.be.equal("elysia");
// 	// 	});
// 	// });
//
// 	// 	// describe("QueryExecutor Tests", () => {
// 	// 	// 	let queryExecutor: QueryExecutor;
// 	// 	// 	let datasets: Map<string, any[]>;
// 	// 	// 	let testData: any[];
//
// 	// 	// 	beforeEach(() => {
// 	// 	// 		// Sample dataset to use in the tests
// 	// 	// 		testData = [
// 	// 	// 			{ dept: "cpsc", avg: 90, year: 2021 },
// 	// 	// 			{ dept: "math", avg: 85, year: 2021 },
// 	// 	// 			{ dept: "phys", avg: 78, year: 2021 },
// 	// 	// 			{ dept: "cpsc", avg: 60, year: 2020 },
// 	// 	// 			{ dept: "cpsc", avg: 45, year: 2019 },
// 	// 	// 		];
//
// 	// 	// 		// Initialize datasets map with a sample dataset
// 	// 	// 		datasets = new Map();
// 	// 	// 		datasets.set("courses", testData);
//
// 	// 	// 		// Instantiate QueryExecutor with the datasets map
// 	// 	// 		queryExecutor = new QueryExecutor(datasets);
// 	// 	// 	});
//
// 	// 	// 	it("should filter data using a simple comparison (GT)", () => {
// 	// 	// 		const filter: Comparison = {
// 	// 	// 			type: "MCOMPARISON",
// 	// 	// 			operator: "GT",
// 	// 	// 			key: "avg",
// 	// 	// 			value: 80,
// 	// 	// 		};
//
// 	// 	// 		const result = queryExecutor.applyFilter(filter, testData);
// 	// 	// 		expect(result).to.deep.include({ dept: "cpsc", avg: 90, year: 2021 });
// 	// 	// 		expect(result).to.deep.include({ dept: "math", avg: 85, year: 2021 });
// 	// 	// 	});
//
// 	// 	// 	it("should apply negation correctly (NOT avg > 80)", () => {
// 	// 	// 		const filter: Negation = {
// 	// 	// 			type: "NOT",
// 	// 	// 			filter: {
// 	// 	// 				type: "MCOMPARISON",
// 	// 	// 				operator: "GT",
// 	// 	// 				key: "avg",
// 	// 	// 				value: 80,
// 	// 	// 			},
// 	// 	// 		};
//
// 	// 	// 		const result = queryExecutor.applyFilter(filter, testData);
// 	// 	// 		expect(result).to.deep.include({ dept: "phys", avg: 78, year: 2021 });
// 	// 	// 		expect(result).to.deep.include({ dept: "cpsc", avg: 60, year: 2020 });
// 	// 	// 		expect(result).to.deep.include({ dept: "cpsc", avg: 45, year: 2019 });
// 	// 	// 	});
//
// 	// 	// 	it("should apply logical AND (avg > 70 AND year = 2021)", () => {
// 	// 	// 		const filter: LogicComparison = {
// 	// 	// 			type: "LOGIC",
// 	// 	// 			operator: "AND",
// 	// 	// 			filters: [
// 	// 	// 				{
// 	// 	// 					type: "MCOMPARISON",
// 	// 	// 					operator: "GT",
// 	// 	// 					key: "avg",
// 	// 	// 					value: 70,
// 	// 	// 				},
// 	// 	// 				{
// 	// 	// 					type: "MCOMPARISON",
// 	// 	// 					operator: "EQ",
// 	// 	// 					key: "year",
// 	// 	// 					value: 2021,
// 	// 	// 				},
// 	// 	// 			],
// 	// 	// 		};
//
// 	// 	// 		const result = queryExecutor.applyFilter(filter, testData);
// 	// 	// 		expect(result).to.deep.include({ dept: "cpsc", avg: 90, year: 2021 });
// 	// 	// 		expect(result).to.deep.include({ dept: "math", avg: 85, year: 2021 });
// 	// 	// 	});
//
// 	// 	// 	it("should handle complex negation with logic (NOT (avg > 70 AND year = 2021))", () => {
// 	// 	// 		const filter: Negation = {
// 	// 	// 			type: "NOT",
// 	// 	// 			filter: {
// 	// 	// 				type: "LOGIC",
// 	// 	// 				operator: "AND",
// 	// 	// 				filters: [
// 	// 	// 					{
// 	// 	// 						type: "MCOMPARISON",
// 	// 	// 						operator: "GT",
// 	// 	// 						key: "avg",
// 	// 	// 						value: 70,
// 	// 	// 					},
// 	// 	// 					{
// 	// 	// 						type: "MCOMPARISON",
// 	// 	// 						operator: "EQ",
// 	// 	// 						key: "year",
// 	// 	// 						value: 2021,
// 	// 	// 					},
// 	// 	// 				],
// 	// 	// 			},
// 	// 	// 		};
//
// 	// 	// 		const result = queryExecutor.applyFilter(filter, testData);
// 	// 	// 		expect(result).to.deep.include({ dept: "cpsc", avg: 60, year: 2020 });
// 	// 	// 		expect(result).to.deep.include({ dept: "cpsc", avg: 45, year: 2019 });
// 	// 	// 	});
// 	// 	// });
// });

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
	let rooms: string;

	before(async function () {
		// This block runs once and loads the datasets.
		sections = await getContentFromArchives("pair.zip");
		sections2 = await getContentFromArchives("elysia.zip");
		invalidsection = await getContentFromArchives("invalidsection.zip");
		nothingsection = await getContentFromArchives("nothing.zip");
		rooms = await getContentFromArchives("campus.zip");

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

		//1[accepted]
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

		// 22
		it("should successfully add a valid rooms dataset", async function () {
			const result = await facade.addDataset("rooms", rooms, InsightDatasetKind.Rooms);
			expect(result).to.include("rooms");
		});

		// 23
		it("should reject adding a rooms dataset with an existing id", async function () {
			await facade.addDataset("rooms", rooms, InsightDatasetKind.Rooms);
			try {
				await facade.addDataset("rooms", rooms, InsightDatasetKind.Rooms);
				expect.fail("Should have thrown an InsightError due to duplicate id");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		// 24
		it("should reject adding a rooms dataset with an invalid id", async function () {
			try {
				await facade.addDataset("_rooms", rooms, InsightDatasetKind.Rooms);
				expect.fail("Should have thrown an InsightError due to invalid id");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		it("should persist datasets across instances", async function () {
			await facade.addDataset("sections", sections, InsightDatasetKind.Sections);

			const newFacade = new InsightFacade();
			await newFacade.init(); // Ensure datasets are loaded

			const datasets = await newFacade.listDatasets();

			expect(datasets).to.have.lengthOf(1);
			expect(datasets[0].id).to.equal("sections");
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

		// 7
		it("should successfully remove a rooms dataset", async function () {
			await facade.addDataset("rooms", rooms, InsightDatasetKind.Rooms);
			const result = await facade.removeDataset("rooms");
			expect(result).to.equal("rooms");
		});

		// 8
		it("should reject removing a non-existent rooms dataset", async function () {
			try {
				await facade.removeDataset("nonExistentRooms");
				expect.fail("Should have thrown a NotFoundError");
			} catch (err) {
				expect(err).to.be.instanceOf(NotFoundError);
			}
		});

		// 9
		it("should reject removing a rooms dataset with an invalid id", async function () {
			try {
				await facade.removeDataset("_rooms");
				expect.fail("Should have thrown an InsightError due to invalid id");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		it("one concurrent active InsightFacade", async function () {
			const result = await facade.addDataset("lll", sections2, InsightDatasetKind.Sections);
			expect(result).to.be.include("lll");
			const newInstance = new InsightFacade();
			// this should still work, and work the same as facade.removeDataset("lll")
			const endResult = await newInstance.removeDataset("lll");
			expect(endResult).to.be.equal("lll");
		});
	});

	describe("PerformQuery", function () {
		/**
		 * Loads the TestQuery specified in the test name and asserts the behaviour of performQuery.
		 *
		 * Note: the 'this' parameter is automatically set by Mocha and contains information about the test.
		 */

		before(async function () {
			facade = new InsightFacade();

			// Add only the sections dataset
			try {
				await facade.addDataset("sections", sections, InsightDatasetKind.Sections);
			} catch (err) {
				throw new Error(`In PerformQuery Before hook, dataset failed to be added.\n${err}`);
			}
		});

		after(async function () {
			await clearDisk();
		});

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
				//console.log(result);
				//expect(result).to.be.deep.equal(expected);
				expect(result).to.have.deep.members(expected);
				//expect(result).to.have.ordered.members(expected);
			} catch (err) {
				if (!errorExpected) {
					expect.fail(`performQuery threw unexpected error: ${err}`);
				}

				if (err instanceof ResultTooLargeError) {
					expect(expected).to.be.equal("ResultTooLargeError");
				} else if (err instanceof InsightError) {
					expect(expected).to.be.equal("InsightError");
				} else {
					expect.fail("bruh how did this even happen :sob:" + err);
				}
				return;
			}

			if (errorExpected) {
				expect.fail(`performQuery resolved when it should have rejected with ${expected}`);
			}
		}

		// test invalid query - not object type
		it("should reject query that is not an object type", async function () {
			try {
				await facade.performQuery("test");
				expect.fail("Should have rejected.");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		// test invalid query - blank
		it("should reject blank query", async function () {
			try {
				await facade.performQuery({});
				expect.fail("Should have rejected.");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});
		// Examples demonstrating how to test performQuery using the JSON Test Queries.
		// The relative path to the query file must be given in square brackets.
		it("[valid/aLotofRandomStuff.json] aLotofRandomStuff", checkQuery);
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
		it("[invalid/datasetNotFound.json] Query referencing a non-existent dataset", checkQuery);
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

		it("[valid/onlyAnd.json] onlyAnd", checkQuery);
		it("[valid/onlyOr.json] onlyOr", checkQuery);
		it("[valid/andOr.json] andOr", checkQuery);
		it("[valid/gT.json] gT", checkQuery);
		it("[valid/lT.json] lT", checkQuery);
		it("[valid/lTEQ.json] lTEQ", checkQuery);
		it("[valid/eQ.json] eQ", checkQuery);
		it("[valid/gTEQ.json] gTEQ", checkQuery);
		it("[valid/iS.json] iS", checkQuery);

		it("[valid/orCase1.json] orCase1", checkQuery);
		it("[invalid/orCase2.json] orCase2", checkQuery);

		it("[valid/orCase3.json] orCase3", checkQuery);
		it("[valid/orCase4.json] orCase4", checkQuery);
		it("[valid/orCase5.json] orCase5", checkQuery);

		// c2 query engine focused (transformations and sort)
		it("[invalidC2/applyKeyWhere.json] Invalid key in WHERE: applyKey", checkQuery);
		it("[invalidC2/emptyGroup.json] Invalid GROUP in TRANSFORMATIONS: empty list", checkQuery);
		it("[invalidC2/invalidApplykey.json] Invalid applykey in APPLY ApplyRule: applykey has underscore", checkQuery);
		it("[invalidC2/invalidApplyRule.json] Invalid APPLY: ApplyRule has more than 1 key", checkQuery);
		it("[invalidC2/invalidArray.json] Invalid APPLY: is not a list", checkQuery);
		it(
			"[invalidC2/invalidColumnMix.json] " +
				"Invalid COLUMN key - has one in & not in GROUP or APPLY when TRANSFORMATIONS exists",
			checkQuery
		);
		it("[invalidC2/invalidColumnOrder.json] Invalid ORDER key - not in COLUMNS", checkQuery);
		it(
			"[invalidC2/invalidColumnsTransformations.json] " +
				"Invalid COLUMN key - not in GROUP or APPLY when TRANSFORMATIONS exists",
			checkQuery
		);
		it("[invalidC2/invalidDirection.json] Invalid ORDER: not valid direction", checkQuery);
		it("[invalidC2/invalidGroupArray.json] Invalid GROUP in TRANSFORMATIONS: not an array", checkQuery);
		it("[invalidC2/invalidOrderList.json] Invalid ORDER key - not a list", checkQuery);
		it("[invalidC2/missingApply.json] Missing APPLY in TRANSFORMATIONS", checkQuery);
		it("[invalidC2/missingGroup.json] Missing GROUP in TRANSFORMATIONS", checkQuery);
		it("[invalidC2/missingGroupApply.json] Missing GROUP and APPLY in TRANSFORMATIONS", checkQuery);
		it("[invalidC2/invalidKeyType.json] invalid key type for token in APPLY", checkQuery);
		it("[invalidC2/invalidApplyObj.json] ApplyRule missing token and key", checkQuery);
		it("[invalidC2/invalidToken.json] invalid token", checkQuery);
		it("[invalidC2/duplicateApplykey.json] duplicateApplykey", checkQuery);
		it("[invalidC2/sortListNoDirection.json] Invalid ORDER: has no direction when there is list of keys", checkQuery);
		it("[validC2/simple.json] valid transformation apply and group", checkQuery);
		it("[validC2/simpleSum.json] sum and single group", checkQuery);
		it("[validC2/sortMix.json] order on an applykey and a key", checkQuery);
		it("[validC2/columnApply.json] columns from APPLY and not GROUP", checkQuery);
		it("[validC2/columnGroup.json] columns from GROUP and not APPLY", checkQuery);
		it("[validC2/countM.json] count with mfield", checkQuery);
		it("[validC2/countS.json] count with sfield", checkQuery);
		it("[validC2/isolatedApply.json] APPLY that is unused", checkQuery);
		it("[validC2/multiple.json] multiple group and multiple apply", checkQuery);
		it("[validC2/multipleApply.json] single group and multiple apply", checkQuery);
		it("[validC2/multipleApply2.json] single group and multiple apply with different keys", checkQuery);
		it("[validC2/multipleGroup.json] multiple group and single apply", checkQuery);
		it("[validC2/orderApplykey.json] order on an applykey", checkQuery);
		it("[validC2/orderApplykeyDirection.json] order with given direction on an applykey", checkQuery);
	});

	describe("PerformQueryRooms", function () {
		before(async function () {
			facade = new InsightFacade();

			// Add only the sections dataset
			try {
				await facade.addDataset("sections", sections, InsightDatasetKind.Sections);
				await facade.addDataset("rooms", rooms, InsightDatasetKind.Rooms);
			} catch (err) {
				throw new Error(`In PerformQuery Before hook, dataset failed to be added.\n${err}`);
			}
		});

		after(async function () {
			await clearDisk();
		});

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
				//console.log(result);
				//expect(result).to.be.deep.equal(expected);
				expect(result).to.have.deep.members(expected);
				//expect(result).to.have.ordered.members(expected);
			} catch (err) {
				if (!errorExpected) {
					expect.fail(`performQuery threw unexpected error: ${err}`);
				}

				if (err instanceof ResultTooLargeError) {
					expect(expected).to.be.equal("ResultTooLargeError");
				} else if (err instanceof InsightError) {
					expect(expected).to.be.equal("InsightError");
				} else {
					expect.fail("bruh how did this even happen :sob:" + err);
				}
				return;
			}

			if (errorExpected) {
				expect.fail(`performQuery resolved when it should have rejected with ${expected}`);
			}
		}

		it("[validC2/rooms.json] simple rooms query", checkQuery);
		it("[validC2/emptyApply.json] empty APPLY", checkQuery);
		it("[validC2/countM.json] empty APPLY", checkQuery);
		it("[validC2/isolatedApply.json] empty APPLY", checkQuery);
		it("[validC2/columnApply.json] empty APPLY", checkQuery);
	});

	describe("PerformQuerySections", function () {
		before(async function () {
			facade = new InsightFacade();

			// Add only the sections dataset
			try {
				await facade.addDataset("sections", sections, InsightDatasetKind.Sections);
				await facade.addDataset("rooms", rooms, InsightDatasetKind.Rooms);
			} catch (err) {
				throw new Error(`In PerformQuery Before hook, dataset failed to be added.\n${err}`);
			}
		});

		after(async function () {
			await clearDisk();
		});

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
				//console.log(result);
				//expect(result).to.be.deep.equal(expected);
				expect(result).to.have.deep.members(expected);
				//expect(result).to.have.ordered.members(expected);
			} catch (err) {
				if (!errorExpected) {
					expect.fail(`performQuery threw unexpected error: ${err}`);
				}

				if (err instanceof ResultTooLargeError) {
					expect(expected).to.be.equal("ResultTooLargeError");
				} else if (err instanceof InsightError) {
					expect(expected).to.be.equal("InsightError");
				} else {
					expect.fail("bruh how did this even happen :sob:" + err);
				}
				return;
			}

			if (errorExpected) {
				expect.fail(`performQuery resolved when it should have rejected with ${expected}`);
			}
		}

		it("[validC2/rooms.json] simple rooms query", checkQuery);
		it("[validC2/emptyApply.json] empty APPLY", checkQuery);
		it("[validC2/countM.json] empty APPLY", checkQuery);
		it("[validC2/isolatedApply.json] empty APPLY", checkQuery);
		it("[validC2/columnApply.json] empty APPLY", checkQuery);
	});

	// describe("ListDatasets", function () {
	// 	beforeEach(function () {
	// 		// This section resets the insightFacade instance
	// 		// This runs before each test
	// 		facade = new InsightFacade();
	// 	});

	// 	afterEach(async function () {
	// 		// This section resets the data directory (removing any cached data)
	// 		// This runs after each test, which should make each test independent of the previous one
	// 		await clearDisk();
	// 	});

	// 	// 1 [accepted] todo: removed cause error cause when doing lint:check
	// 	// it("should return empty array with no datasets added", async function () {
	// 	// 	const result = await facade.listDatasets();

	// 	// 	expect(result).to.be.an("array").that.is.empty;
	// 	// });

	// 	// 2
	// 	it("one valid dataset added", async function () {
	// 		await facade.addDataset("elysia", sections2, InsightDatasetKind.Sections);

	// 		const result = await facade.listDatasets();

	// 		expect(result).to.be.an("array").that.has.lengthOf(1);

	// 		const dataset: InsightDataset = result[0];

	// 		expect(dataset.id).to.be.equal("elysia");
	// 		expect(dataset.numRows).to.be.a("number").that.is.greaterThan(0);
	// 	});

	// 	// 3
	// 	it("multiple datasets added", async function () {
	// 		const result = await facade.addDataset("elysia", sections2, InsightDatasetKind.Sections);
	// 		expect(result).to.be.include("elysia");

	// 		const result1 = await facade.addDataset("aponia", sections2, InsightDatasetKind.Sections);
	// 		expect(result1).to.be.include("aponia");

	// 		const result2 = await facade.listDatasets();
	// 		//expect(result2).to.have.lengthOf(2);

	// 		//expect(result2).to.be.an("array").that.has.lengthOf(2);

	// 		const dataset: InsightDataset = result2[0];
	// 		const dataset2: InsightDataset = result2[1];

	// 		expect(dataset.id).to.be.equal("elysia");
	// 		expect(dataset2.id).to.be.equal("aponia");
	// 		expect(dataset.numRows).to.be.a("number").that.is.greaterThan(0);
	// 		expect(dataset2.numRows).to.be.a("number").that.is.greaterThan(0);
	// 	});

	// 	// 4
	// 	it("add, remove and list", async function () {
	// 		const result1 = await facade.addDataset("elysia", sections2, InsightDatasetKind.Sections);
	// 		expect(result1).to.be.include("elysia");

	// 		const result = await facade.addDataset("aponia", sections2, InsightDatasetKind.Sections);
	// 		expect(result).to.be.include("aponia");

	// 		const endresult = await facade.removeDataset("aponia");
	// 		expect(endresult).to.be.equal("aponia");

	// 		const result2 = await facade.listDatasets();
	// 		expect(result2).to.be.an("array").that.has.lengthOf(1);
	// 		expect(result2[0].id).to.be.equal("elysia");
	// 	});
	// });

	// 	// describe("QueryExecutor Tests", () => {
	// 	// 	let queryExecutor: QueryExecutor;
	// 	// 	let datasets: Map<string, any[]>;
	// 	// 	let testData: any[];

	// 	// 	beforeEach(() => {
	// 	// 		// Sample dataset to use in the tests
	// 	// 		testData = [
	// 	// 			{ dept: "cpsc", avg: 90, year: 2021 },
	// 	// 			{ dept: "math", avg: 85, year: 2021 },
	// 	// 			{ dept: "phys", avg: 78, year: 2021 },
	// 	// 			{ dept: "cpsc", avg: 60, year: 2020 },
	// 	// 			{ dept: "cpsc", avg: 45, year: 2019 },
	// 	// 		];

	// 	// 		// Initialize datasets map with a sample dataset
	// 	// 		datasets = new Map();
	// 	// 		datasets.set("courses", testData);

	// 	// 		// Instantiate QueryExecutor with the datasets map
	// 	// 		queryExecutor = new QueryExecutor(datasets);
	// 	// 	});

	// 	// 	it("should filter data using a simple comparison (GT)", () => {
	// 	// 		const filter: Comparison = {
	// 	// 			type: "MCOMPARISON",
	// 	// 			operator: "GT",
	// 	// 			key: "avg",
	// 	// 			value: 80,
	// 	// 		};

	// 	// 		const result = queryExecutor.applyFilter(filter, testData);
	// 	// 		expect(result).to.deep.include({ dept: "cpsc", avg: 90, year: 2021 });
	// 	// 		expect(result).to.deep.include({ dept: "math", avg: 85, year: 2021 });
	// 	// 	});

	// 	// 	it("should apply negation correctly (NOT avg > 80)", () => {
	// 	// 		const filter: Negation = {
	// 	// 			type: "NOT",
	// 	// 			filter: {
	// 	// 				type: "MCOMPARISON",
	// 	// 				operator: "GT",
	// 	// 				key: "avg",
	// 	// 				value: 80,
	// 	// 			},
	// 	// 		};

	// 	// 		const result = queryExecutor.applyFilter(filter, testData);
	// 	// 		expect(result).to.deep.include({ dept: "phys", avg: 78, year: 2021 });
	// 	// 		expect(result).to.deep.include({ dept: "cpsc", avg: 60, year: 2020 });
	// 	// 		expect(result).to.deep.include({ dept: "cpsc", avg: 45, year: 2019 });
	// 	// 	});

	// 	// 	it("should apply logical AND (avg > 70 AND year = 2021)", () => {
	// 	// 		const filter: LogicComparison = {
	// 	// 			type: "LOGIC",
	// 	// 			operator: "AND",
	// 	// 			filters: [
	// 	// 				{
	// 	// 					type: "MCOMPARISON",
	// 	// 					operator: "GT",
	// 	// 					key: "avg",
	// 	// 					value: 70,
	// 	// 				},
	// 	// 				{
	// 	// 					type: "MCOMPARISON",
	// 	// 					operator: "EQ",
	// 	// 					key: "year",
	// 	// 					value: 2021,
	// 	// 				},
	// 	// 			],
	// 	// 		};

	// 	// 		const result = queryExecutor.applyFilter(filter, testData);
	// 	// 		expect(result).to.deep.include({ dept: "cpsc", avg: 90, year: 2021 });
	// 	// 		expect(result).to.deep.include({ dept: "math", avg: 85, year: 2021 });
	// 	// 	});

	// 	// 	it("should handle complex negation with logic (NOT (avg > 70 AND year = 2021))", () => {
	// 	// 		const filter: Negation = {
	// 	// 			type: "NOT",
	// 	// 			filter: {
	// 	// 				type: "LOGIC",
	// 	// 				operator: "AND",
	// 	// 				filters: [
	// 	// 					{
	// 	// 						type: "MCOMPARISON",
	// 	// 						operator: "GT",
	// 	// 						key: "avg",
	// 	// 						value: 70,
	// 	// 					},
	// 	// 					{
	// 	// 						type: "MCOMPARISON",
	// 	// 						operator: "EQ",
	// 	// 						key: "year",
	// 	// 						value: 2021,
	// 	// 					},
	// 	// 				],
	// 	// 			},
	// 	// 		};

	// 	// 		const result = queryExecutor.applyFilter(filter, testData);
	// 	// 		expect(result).to.deep.include({ dept: "cpsc", avg: 60, year: 2020 });
	// 	// 		expect(result).to.deep.include({ dept: "cpsc", avg: 45, year: 2019 });
	// 	// 	});
	// 	// });
});
