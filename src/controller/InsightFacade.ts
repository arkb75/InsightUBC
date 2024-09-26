import { IInsightFacade, InsightDataset, InsightDatasetKind, InsightResult, InsightError } from "./IInsightFacade";
import { QueryParser } from "./query/QueryParser";
import { Query } from "./query/IQuery";

/**
 * This is the main programmatic entry point for the project.
 * Method documentation is in IInsightFacade
 *
 */
export default class InsightFacade implements IInsightFacade {
	public async addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
		// TODO: Remove this once you implement the methods!
		throw new Error(
			`InsightFacadeImpl::addDataset() is unimplemented! - id=${id}; content=${content?.length}; kind=${kind}`
		);
	}

	public async removeDataset(id: string): Promise<string> {
		// TODO: Remove this once you implement the methods!
		throw new Error(`InsightFacadeImpl::removeDataset() is unimplemented! - id=${id};`);
	}

	public async performQuery(query: unknown): Promise<InsightResult[]> {
		let parsedQuery: Query;
		try {
			// eslint-disable-next-line descriptive/no-unused-vars
			parsedQuery = QueryParser.parse(query);
		} catch (error) {
			if (error instanceof InsightError) {
				throw error;
			} else {
				throw new InsightError("An unexpected error occurred during query parsing.");
			}
		}

		// TODO: Implement query execution using parsedQuery
		// For now, throw an error indicating that execution is not yet implemented
		throw new Error(`InsightFacade::performQuery execution not implemented.`);
	}

	public async listDatasets(): Promise<InsightDataset[]> {
		// TODO: Remove this once you implement the methods!
		throw new Error(`InsightFacadeImpl::listDatasets is unimplemented!`);
	}
}
