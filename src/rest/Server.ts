import express, { Application, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import Log from "@ubccpsc310/folder-test/build/Log";
import * as http from "http";
import cors from "cors";
import { IInsightFacade, InsightDatasetKind, NotFoundError } from "../controller/IInsightFacade";
import InsightFacade from "../controller/InsightFacade";

export default class Server {
	private readonly port: number;
	private express: Application;
	private server: http.Server | undefined;
	private static insightFacade: IInsightFacade;

	constructor(port: number) {
		Log.info(`Server::<init>( ${port} )`);
		this.port = port;
		this.express = express();

		this.registerMiddleware();
		this.registerRoutes();

		Server.insightFacade = new InsightFacade();
		// NOTE: you can serve static frontend files in from your express server
		// by uncommenting the line below. This makes files in ./frontend/public
		// accessible at http://localhost:<port>/
		// this.express.use(express.static("./frontend/public"))
	}

	/**
	 * Starts the server. Returns a promise that resolves if success. Promises are used
	 * here because starting the server takes some time and we want to know when it
	 * is done (and if it worked).
	 *
	 * @returns {Promise<void>}
	 */
	public async start(): Promise<void> {
		return new Promise((resolve, reject) => {
			Log.info("Server::start() - start");
			if (this.server !== undefined) {
				Log.error("Server::start() - server already listening");
				reject();
			} else {
				this.server = this.express
					.listen(this.port, () => {
						Log.info(`Server::start() - server listening on port: ${this.port}`);
						resolve();
					})
					.on("error", (err: Error) => {
						// catches errors in server start
						Log.error(`Server::start() - server ERROR: ${err.message}`);
						reject(err);
					});
			}
		});
	}

	/**
	 * Stops the server. Again returns a promise so we know when the connections have
	 * actually been fully closed and the port has been released.
	 *
	 * @returns {Promise<void>}
	 */
	public async stop(): Promise<void> {
		Log.info("Server::stop()");
		return new Promise((resolve, reject) => {
			if (this.server === undefined) {
				Log.error("Server::stop() - ERROR: server not started");
				reject();
			} else {
				this.server.close(() => {
					Log.info("Server::stop() - server closed");
					resolve();
				});
			}
		});
	}

	// Registers middleware to parse request before passing them to request handlers
	private registerMiddleware(): void {
		// JSON parser must be place before raw parser because of wildcard matching done by raw parser below
		this.express.use(express.json());
		this.express.use(express.raw({ type: "application/*", limit: "10mb" }));

		// enable cors in request headers to allow cross-origin HTTP requests
		this.express.use(cors());
	}

	// Registers all request handlers to routes
	private registerRoutes(): void {
		// This is an example endpoint this you can invoke by accessing this URL in your browser:
		// http://localhost:4321/echo/hello
		this.express.get("/echo/:msg", Server.echo);

		this.express.put("/dataset/:id/:kind", Server.addDataset);
		this.express.delete("/dataset/:id", Server.removeDataset);
		this.express.post("/query", Server.performQuery);
		this.express.get("/datasets", Server.listDatasets);
	}

	private static async addDataset(req: Request, res: Response): Promise<void> {
		const resolveCode = 200;
		const rejectCode = 400;

		try {
			Log.info(`Server::addDataset(..) - params: ${JSON.stringify(req.params)}`);
			const id = req.params.id;
			// https://stackoverflow.com/questions/56952405/how-to-decode-encode-string-to-base64-in-typescript-express-server
			const content = Buffer.from(req.body).toString("base64");
			const kind = req.params.kind as InsightDatasetKind;
			const arr = await Server.insightFacade.addDataset(id, content, kind);
			res.status(resolveCode).json({ result: arr });
		} catch (err: any) {
			res.status(rejectCode).json({ error: err.message });
		}
	}

	private static async removeDataset(req: Request, res: Response): Promise<void> {
		const resolveCode = 200;
		const rejectCode = 400;
		const notFoundCode = 404;
		try {
			Log.info(`Server::removeDataset(..) - params: ${JSON.stringify(req.params)}`);
			const str = await Server.insightFacade.removeDataset(req.params.id);
			res.status(resolveCode).json({ result: str });
		} catch (err: any) {
			if (err instanceof NotFoundError) {
				res.status(notFoundCode).json({ error: err.message });
			} else {
				res.status(rejectCode).json({ error: err.message });
			}
		}
	}

	private static async performQuery(req: Request, res: Response): Promise<void> {
		const resolveCode = 200;
		const rejectCode = 400;
		try {
			Log.info(`Server::performQuery(..) - params: ${JSON.stringify(req.params)}`);
			const arr = await Server.insightFacade.performQuery(req.body);
			// const arr = Server.performEcho(req.params.msg);
			res.status(resolveCode).json({ result: arr });
		} catch (err: any) {
			res.status(rejectCode).json({ error: err.message });
		}
	}

	private static async listDatasets(req: Request, res: Response): Promise<void> {
		const resolveCode = 200;
		try {
			Log.info(`Server::listDatasets(..) - params: ${JSON.stringify(req.params)}`);
			const arr = await Server.insightFacade.listDatasets();
			res.status(resolveCode).json({ result: arr });
		} catch (err: any) {
			res.status(StatusCodes.IM_A_TEAPOT).json({ error: err.message });
		}
	}

	// The next two methods handle the echo service.
	// These are almost certainly not the best place to put these, but are here for your reference.
	// By updating the Server.echo function pointer above, these methods can be easily moved.
	private static echo(req: Request, res: Response): void {
		try {
			Log.info(`Server::echo(..) - params: ${JSON.stringify(req.params)}`);
			const response = Server.performEcho(req.params.msg);
			res.status(StatusCodes.OK).json({ result: response });
		} catch (err: any) {
			res.status(StatusCodes.BAD_REQUEST).json({ error: err.message });
		}
	}

	private static performEcho(msg: string): string {
		if (typeof msg !== "undefined" && msg !== null) {
			return `${msg}...${msg}`;
		} else {
			return "Message not provided";
		}
	}
}
