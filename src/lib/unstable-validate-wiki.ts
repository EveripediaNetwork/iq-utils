import axios from "axios";
import { CommonMetaIds, EditSpecificMetaIds, Wiki } from "../schema";
import { ZodError } from "zod";
import { isValidUrl } from "./wiki-helpers";

/**
 * Validates the provided wiki object against a set of metadata IDs, including common metadata IDs, edit-specific metadata IDs, and IDs of registered explorers. It also checks if the value of any explorer metadata is a valid URL and matches the explorer's base URL.
 *
 * @param wiki - The wiki object to be validated.
 * @throws {ZodError} - If any of the metadata IDs are invalid or if the value of any explorer metadata is not a valid URL or does not match the explorer's base URL.
 */
export async function unstableValidateWiki(wiki: unknown) {
	const parsedWiki = Wiki.safeParse(wiki);
	const explorers = await getExplorers();
	const explorerIds = explorers.map((explorer) => explorer.id);

	const METADATA_IDS = [
		...CommonMetaIds.options,
		...EditSpecificMetaIds.options,
		...explorerIds,
	];

	for (const meta of parsedWiki.data?.metadata ?? []) {
		// check if metadata id is valid
		if (!METADATA_IDS.includes(meta.id)) {
			throw new ZodError([
				{
					code: "custom",
					message: `Invalid metadata id: ${meta.id}`,
					path: ["metadata", meta.id],
				},
			]);
		}

		// if metadata id is explorer, check if explorer exists
		if (explorerIds.includes(meta.id)) {
			const explorer = explorers.find(
				(explorer) => explorer.id === meta.id,
			) as Explorer;

			// check if value is valid with baseUrl
			if (
				!isValidUrl(meta.value) ||
				new URL(meta.value).origin !== new URL(explorer.baseUrl).origin
			) {
				throw new ZodError([
					{
						code: "custom",
						message: `Explorer ${meta.id} value is not valid`,
						path: ["metadata", meta.id],
					},
				]);
			}
		}
	}
}

/**
 * Fetches a list of Explorer objects from the GraphQL API.
 *
 * @returns A promise that resolves to an array of Explorer objects.
 */
async function getExplorers() {
	const query = `
   query ExplorersList($offset: Int!, $limit: Int!) {
      explorers(offset: $offset, limit: $limit) {
        id
        baseUrl
        explorer
        hidden
      }
    }
  `;

	const client = axios.create({
		baseURL: "https://graphql.everipedia.org",
		headers: {
			"Content-Type": "application/json",
		},
	});

	// TODO: make sure to fetch all explorers here. currently only fetching first 30 explorers
	const { data } = await client.post<Explorer[]>("", {
		query,
		variables: {
			offset: 0,
			limit: 30,
		},
	});

	return data;
}

interface Explorer {
	id: string;
	baseUrl: string;
	explorer: string;
	hidden: boolean;
}
