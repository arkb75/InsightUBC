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
		sections = await getContentFromArchives("small.zip");
		server = new Server(port);
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
	function successfulAdd(): void {
		const resolveCode = 200;
		request(SERVER_URL)
			.put(ENDPOINT_URL)
			.send(Buffer.from(sections, "base64"))
			.set("Content-Type", "application/x-zip-compressed")
			.then(function (res: Response) {
				expect(res.status).to.be.equal(resolveCode);
			})
			.catch(function () {
				expect.fail();
			});
	}

	it("PUT test success", function () {
		successfulAdd();
	});

	it("PUT test fail", function () {
		const rejectCode = 400;
		request(SERVER_URL)
			.put("/dataset/invalid_sections/invalid_sections")
			.send(Buffer.from(sections, "base64"))
			.set("Content-Type", "application/x-zip-compressed")
			.then(function (res: Response) {
				expect(res.status).to.be.equal(rejectCode);
			})
			.catch(function () {
				expect.fail();
			});
	});

	it("DELETE test success", function () {
		const resolveCode = 200;

		successfulAdd();

		request(SERVER_URL)
			.get("/datasets/sections")
			.then(function (res: Response) {
				expect(res.status).to.be.equal(resolveCode);
			})
			.catch(function () {
				expect.fail();
			});
	});

	it("DELETE test fail with not found error", function () {
		const notFoundCode = 404;

		request(SERVER_URL)
			.get("/datasets/name")
			.then(function (res: Response) {
				expect(res.status).to.be.equal(notFoundCode);
			})
			.catch(function () {
				expect.fail();
			});
	});

	it("DELETE test fail with insight error", function () {
		const rejectCode = 400;

		successfulAdd();

		request(SERVER_URL)
			.get("/datasets/bad_req")
			.then(function (res: Response) {
				expect(res.status).to.be.equal(rejectCode);
			})
			.catch(function () {
				expect.fail();
			});
	});

	it("POST test success", function () {
		const resolveCode = 200;
		const query = JSON.stringify({
			WHERE: {
				GT: {
					sections_avg: 97,
				},
			},
			OPTIONS: {
				COLUMNS: ["sections_dept", "sections_avg"],
				ORDER: "sections_avg",
			},
		});

		successfulAdd();

		request(SERVER_URL)
			.post("/query")
			.send(query)
			.set("Content-Type", "application/json")
			.then(function (res: Response) {
				expect(res.status).to.be.equal(resolveCode);
			})
			.catch(function () {
				expect.fail();
			});
	});

	it("POST test fail", function () {
		const rejectCode = 400;
		const query = JSON.stringify({
			OPTIONS: {},
		});

		successfulAdd();

		request(SERVER_URL)
			.post("/query")
			.send(query)
			.set("Content-Type", "application/json")
			.then(function (res: Response) {
				expect(res.status).to.be.equal(rejectCode);
			})
			.catch(function () {
				expect.fail();
			});
	});

	it("GET test success", function () {
		const resolveCode = 200;

		request(SERVER_URL)
			.get("/datasets")
			.set("Content-Type", "application/x-zip-compressed")
			.then(function (res: Response) {
				expect(res.status).to.be.equal(resolveCode);
			})
			.catch(function () {
				expect.fail();
			});
	});
});
