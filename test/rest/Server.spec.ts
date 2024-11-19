import { expect } from "chai";
import request, { Response } from "supertest";
// import { StatusCodes } from "http-status-codes";
// import Log from "@ubccpsc310/folder-test/build/Log";
import Server from "../../src/rest/Server";
import { clearDisk, getContentFromArchives } from "../TestUtil";

describe("Facade C3", function () {
	let server: Server;
	let sections: any;
	const SERVER_URL = "http://localhost:4321";
	const ENDPOINT_URL = "/dataset/sections/sections";

	before(async function () {
		const port = 4321;
		server = new Server(port);
		sections = await getContentFromArchives("small.zip");
		await server.start();
	});

	after(async function () {
		await server.stop();
	});

	beforeEach(async function () {
		// might want to add some process logging here to keep track of what is going on
		await clearDisk();
	});

	afterEach(async function () {
		// might want to add some process logging here to keep track of what is going on
		// await clearDisk();
	});

	// it("PUT test for courses dataset", function () {
	// 	const SERVER_URL = "TBD";
	// 	const ENDPOINT_URL = "TBD";
	// 	const ZIP_FILE_DATA = "TBD";
	//
	// 	try {
	// 		return request(SERVER_URL)
	// 			.put(ENDPOINT_URL)
	// 			.send(ZIP_FILE_DATA)
	// 			.set("Content-Type", "application/x-zip-compressed")
	// 			.then(function (res: Response) {
	// 				// some logging here please!
	// 				expect(res.status).to.be.equal(StatusCodes.OK);
	// 			})
	// 			.catch(function () {
	// 				// some logging here please!
	// 				expect.fail();
	// 			});
	// 	} catch (err) {
	// 		Log.error(err);
	// 		// and some more logging here!
	// 	}
	// });
	async function successfulAdd(): Promise<void> {
		const resolveCode = 200;

		return request(SERVER_URL)
			.put(ENDPOINT_URL)
			.send(Buffer.from(sections, "base64"))
			.set("Content-Type", "application/x-zip-compressed")
			.then(function (res: Response) {
				expect(res.status).to.be.equal(resolveCode);
			})
			.catch(function (err) {
				expect.fail(err);
			});
	}

	it("PUT test success", async function () {
		return successfulAdd();
	});

	it("PUT test fail", async function () {
		const rejectCode = 400;

		return request(SERVER_URL)
			.put("/dataset/invalid_sections/invalid_sections")
			.send(Buffer.from(sections, "base64"))
			.set("Content-Type", "application/x-zip-compressed")
			.then(function (res: Response) {
				expect(res.status).to.be.equal(rejectCode);
			})
			.catch(function (err) {
				expect.fail(err);
			});
	});

	it("DELETE test success", async function () {
		const resolveCode = 200;

		await successfulAdd();

		return request(SERVER_URL)
			.delete("/dataset/sections")
			.then(function (res: Response) {
				expect(res.status).to.be.equal(resolveCode);
			})
			.catch(function (err) {
				expect.fail(err);
			});
	});

	it("DELETE test fail with not found error", async function () {
		const notFoundCode = 404;

		return request(SERVER_URL)
			.delete("/dataset/name")
			.then(function (res: Response) {
				expect(res.status).to.be.equal(notFoundCode);
			})
			.catch(function (err) {
				expect.fail(err);
			});
	});

	it("DELETE test fail with insight error", async function () {
		const rejectCode = 400;

		await successfulAdd();

		return request(SERVER_URL)
			.delete("/dataset/bad_req")
			.then(function (res: Response) {
				expect(res.status).to.be.equal(rejectCode);
			})
			.catch(function (err) {
				expect.fail(err);
			});
	});

	it("POST test success", async function () {
		const resolveCode = 200;
		const query = JSON.stringify({
			WHERE: {
				GT: {
					sections_avg: 50,
				},
			},
			OPTIONS: {
				COLUMNS: ["sections_dept", "sections_avg"],
				ORDER: "sections_avg",
			},
		});

		await successfulAdd();

		return request(SERVER_URL)
			.post("/query")
			.send(query)
			.set("Content-Type", "application/json")
			.then(function (res: Response) {
				expect(res.status).to.be.equal(resolveCode);
			})
			.catch(function (err) {
				expect.fail(err);
			});
	});

	it("POST test fail", async function () {
		const rejectCode = 400;
		const query = JSON.stringify({
			OPTIONS: {},
		});

		await successfulAdd();

		return request(SERVER_URL)
			.post("/query")
			.send(query)
			.set("Content-Type", "application/json")
			.then(function (res: Response) {
				expect(res.status).to.be.equal(rejectCode);
			})
			.catch(function (err) {
				expect.fail(err);
			});
	});

	it("GET test success", async function () {
		const resolveCode = 200;

		await successfulAdd();

		return request(SERVER_URL)
			.get("/datasets")
			.then(function (res: Response) {
				expect(res.status).to.be.equal(resolveCode);
			})
			.catch(function (err) {
				expect.fail(err);
			});
	});
});
