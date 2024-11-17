import { expect } from "chai";
import request, { Response } from "supertest";
import { StatusCodes } from "http-status-codes";
import Log from "@ubccpsc310/folder-test/build/Log";
import Server from "../../src/rest/Server";
import { clearDisk } from "../TestUtil";
import fs from "fs-extra";

describe("Facade C3", function () {
	let server: Server;
	const SERVER_URL = "http://localhost:4321";
	const ENDPOINT_URL = "/dataset/sections/sections";

	before(async function () {
		const port = 4321;
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
		await clearDisk();
	});

	it("PUT test for courses dataset", function () {
		// const SERVER_URL = "TBD";
		// const ENDPOINT_URL = "TBD";
		// const ZIP_FILE_DATA = "TBD";
		const ZIP_FILE_DATA = fs.readFileSync("test/resources/archives/pair.zip");

		try {
			return request(SERVER_URL)
				.put(ENDPOINT_URL)
				.send(ZIP_FILE_DATA)
				.set("Content-Type", "application/x-zip-compressed")
				.then(function (res: Response) {
					// some logging here please!
					expect(res.status).to.be.equal(StatusCodes.OK);
				})
				.catch(function () {
					// some logging here please!
					expect.fail();
				});
		} catch (err) {
			Log.error(err);
			// and some more logging here!
		}
	});

	it("PUT test fail", function () {
		const ZIP_FILE_DATA = fs.readFileSync("test/resources/archives/invalidsection.zip");

		try {
			return request(SERVER_URL)
				.put(ENDPOINT_URL)
				.send(ZIP_FILE_DATA)
				.set("Content-Type", "application/x-zip-compressed")
				.then(function (res: Response) {
					expect(res.status).to.be.equal(StatusCodes.BAD_REQUEST);
				})
				.catch(function () {
					expect.fail();
				});
		} catch (err) {
			Log.error(err);
		}
	});

	it("DELETE test success", function () {
		const ZIP_FILE_DATA = fs.readFileSync("test/resources/archives/pair.zip");

		try {
			request(SERVER_URL)
				.put(ENDPOINT_URL)
				.send(ZIP_FILE_DATA)
				.set("Content-Type", "application/x-zip-compressed")
				.then(function (res: Response) {
					expect(res.status).to.be.equal(StatusCodes.OK);
				})
				.catch(function () {
					expect.fail();
				});

			request(SERVER_URL)
				.get("/datasets/sections")
				.then(function (res: Response) {
					expect(res.status).to.be.equal(StatusCodes.OK);
				})
				.catch(function () {
					expect.fail();
				});
		} catch (err) {
			Log.error(err);
		}
	});

	it("DELETE test fail with not found error", function () {
		const ZIP_FILE_DATA = fs.readFileSync("test/resources/archives/pair.zip");

		try {
			request(SERVER_URL)
				.put(ENDPOINT_URL)
				.send(ZIP_FILE_DATA)
				.set("Content-Type", "application/x-zip-compressed")
				.then(function (res: Response) {
					expect(res.status).to.be.equal(StatusCodes.OK);
				})
				.catch(function () {
					expect.fail();
				});

			request(SERVER_URL)
				.get("/datasets/dne")
				.then(function (res: Response) {
					expect(res.status).to.be.equal(StatusCodes.NOT_FOUND);
				})
				.catch(function () {
					expect.fail();
				});
		} catch (err) {
			Log.error(err);
		}
	});

	it("DELETE test fail with ingisht error", function () {
		const ZIP_FILE_DATA = fs.readFileSync("test/resources/archives/pair.zip");

		try {
			request(SERVER_URL)
				.put(ENDPOINT_URL)
				.send(ZIP_FILE_DATA)
				.set("Content-Type", "application/x-zip-compressed")
				.then(function (res: Response) {
					expect(res.status).to.be.equal(StatusCodes.OK);
				})
				.catch(function () {
					expect.fail();
				});

			request(SERVER_URL)
				.get("/datasets/bad_req")
				.then(function (res: Response) {
					expect(res.status).to.be.equal(StatusCodes.BAD_REQUEST);
				})
				.catch(function () {
					expect.fail();
				});
		} catch (err) {
			Log.error(err);
		}
	});

	it("POST test success", function () {
		const ZIP_FILE_DATA = fs.readFileSync("test/resources/archives/pair.zip");
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

		try {
			request(SERVER_URL)
				.put(ENDPOINT_URL)
				.send(ZIP_FILE_DATA)
				.set("Content-Type", "application/x-zip-compressed")
				.then(function (res: Response) {
					expect(res.status).to.be.equal(StatusCodes.OK);
				})
				.catch(function () {
					expect.fail();
				});
			request(SERVER_URL)
				.post("/query")
				.send(query)
				.set("Content-Type", "application/json")
				.then(function (res: Response) {
					expect(res.status).to.be.equal(StatusCodes.OK);
				})
				.catch(function () {
					expect.fail();
				});
		} catch (err) {
			Log.error(err);
		}
	});

	it("POST test fail", function () {
		const ZIP_FILE_DATA = fs.readFileSync("test/resources/archives/pair.zip");
		const query = JSON.stringify({
			OPTIONS: {},
		});

		try {
			request(SERVER_URL)
				.put(ENDPOINT_URL)
				.send(ZIP_FILE_DATA)
				.set("Content-Type", "application/x-zip-compressed")
				.then(function (res: Response) {
					expect(res.status).to.be.equal(StatusCodes.OK);
				})
				.catch(function () {
					expect.fail();
				});
			request(SERVER_URL)
				.post("/query")
				.send(query)
				.set("Content-Type", "application/json")
				.then(function (res: Response) {
					expect(res.status).to.be.equal(StatusCodes.BAD_REQUEST);
				})
				.catch(function () {
					expect.fail();
				});
		} catch (err) {
			Log.error(err);
		}
	});

	it("GET test success", function () {
		const ZIP_FILE_DATA = fs.readFileSync("test/resources/archives/pair.zip");

		try {
			request(SERVER_URL)
				.put(ENDPOINT_URL)
				.send(ZIP_FILE_DATA)
				.set("Content-Type", "application/x-zip-compressed")
				.then(function (res: Response) {
					expect(res.status).to.be.equal(StatusCodes.OK);
				})
				.catch(function () {
					expect.fail();
				});

			request(SERVER_URL)
				.get("/datasets")
				.then(function (res: Response) {
					expect(res.status).to.be.equal(StatusCodes.OK);
				})
				.catch(function () {
					expect.fail();
				});
		} catch (err) {
			Log.error(err);
		}
	});
});
