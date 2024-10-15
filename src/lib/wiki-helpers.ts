import type { z } from "zod";

import {
	IPFS_HASH_LENGTH,
	MAX_MEDIA_COUNT,
	WHITELISTED_DOMAINS,
	WHITELISTED_LINK_NAMES,
	WIKI_CONTENT_MIN_WORDS,
} from "../data/constants";
import {
	CommonMetaIds,
	EditSpecificMetaIds,
	type Media,
	MediaSource,
	MediaType,
	type MetaData,
	Tag,
} from "../schema";
import axios from "axios";

// ===============================
// Text and content helpers
// ===============================

export function countWords(text: string): number {
	return text.split(" ").filter((word) => word !== "").length;
}

export function isValidUrl(urlString: string): boolean {
	try {
		return Boolean(new URL(urlString));
	} catch (_e) {
		return false;
	}
}

export function containsOnlyVerifiedLinks(content: string): boolean {
	const markdownLinks = content.match(/\[(.*?)\]\((.*?)\)/g);
	return (
		markdownLinks?.every((link) => {
			const [, linkText, linkUrl] =
				RegExp(/\[(.*?)\]\((.*?)\)/).exec(link) || [];

			if (
				linkText &&
				linkUrl &&
				WHITELISTED_LINK_NAMES.includes(linkText) &&
				!isValidUrl(linkUrl)
			) {
				return true;
			}

			if (linkUrl && !linkUrl.startsWith("#")) {
				const validDomainPattern = new RegExp(
					`^https?://(www\\.)?(${WHITELISTED_DOMAINS.join("|")})`,
				);
				return validDomainPattern.test(linkUrl);
			}
			return true;
		}) ?? true
	);
}

// ===============================
// Media validation helpers
// ===============================
export function isMediaContentValid(media: Media[]): boolean {
	return media.every((item) => {
		if (
			item.source === MediaSource.Enum.IPFS_IMG ||
			item.source === MediaSource.Enum.IPFS_VID
		) {
			return item.id.length === IPFS_HASH_LENGTH;
		}

		if (item.source === MediaSource.Enum.YOUTUBE) {
			const youtubePattern =
				/^.*(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/|shorts\/|watch\?v=)([^#&?]*).*/;
			return (
				item.id === `https://www.youtube.com/watch?v=${item.name}` &&
				youtubePattern.test(item.id)
			);
		}

		if (item.source === MediaSource.Enum.VIMEO) {
			return item.id === `https://vimeo.com/${item.name}`;
		}

		return item.type ? item.type in MediaType : true;
	});
}

export function isMediaCountWithinLimits(media: Media[]): boolean {
	const iconMediaCount = media.filter(
		(item) => item.type === MediaType.Enum.ICON,
	).length;
	return media.length <= MAX_MEDIA_COUNT && iconMediaCount <= 1;
}

export function isMediaContentAndCountValid(media: Media[]): boolean {
	return isMediaContentValid(media) && isMediaCountWithinLimits(media);
}

// ===============================
// Wiki-specific validation helpers
// ===============================
export function isEventWikiValid(wiki: any): boolean {
	if (wiki.tags.some((tag: any) => tag.id === "Events")) {
		const referencesData =
			wiki.metadata.find(
				(meta: any) => meta.id === CommonMetaIds.Enum.references,
			)?.value || "[]";
		const references: { description: string }[] = JSON.parse(
			referencesData,
		) as { description: string }[];
		const hasEventLink = references.some(
			(item) => item.description.toLowerCase() === "event link",
		);
		return hasEventLink && Array.isArray(wiki.events) && wiki.events.length > 0;
	}
	return true;
}

export function hasMinimumWordCount(content: string): boolean {
	return countWords(content) >= WIKI_CONTENT_MIN_WORDS;
}

// ===============================
// Metadata helpers
// ===============================
export function hasAtLeastOneReference(metadata: MetaData[]): boolean {
	const referencesData =
		metadata.find((meta) => meta.id === CommonMetaIds.Enum.references)?.value ||
		"[]";
	const references = JSON.parse(referencesData) as { description: string }[];
	return references.length > 0;
}

export async function areMetadataAndExplorerValid(
	metadata: MetaData[],
): Promise<boolean> {
	const explorers = await getExplorers();
	const validIds = new Set([
		...CommonMetaIds.options,
		...EditSpecificMetaIds.options,
		...explorers.map((e) => e.id),
	]);

	return metadata.every(
		(meta) =>
			validIds.has(meta.id) &&
			(!explorers.some((e) => e.id === meta.id) ||
				(isValidUrl(meta.value) &&
					new URL(meta.value).origin ===
						new URL(explorers.find((e) => e.id === meta.id)?.baseUrl || "")
							.origin)),
	);
}

// ===============================
// Tag helpers
// ===============================
export function transformAndFilterTags(tags: { id: string }[]): { id: Tag }[] {
	return tags
		.filter((tag) => Tag.safeParse(tag.id).success)
		.map((tag) => ({ id: tag.id as Tag }));
}

// ===============================
// API-related helpers
// ===============================
export async function getExplorers() {
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
		baseURL: "https://graph.everipedia.org/graphql",
		headers: {
			"Content-Type": "application/json",
		},
	});

	// TODO: make sure to fetch all explorers here. currently only fetching first 30 explorers
	const { data } = await client.post<{ data: { explorers: Explorer[] } }>("", {
		query,
		variables: {
			offset: 0,
			limit: 30,
		},
	});

	return data.data.explorers;
}

// ===============================
// Types
// ===============================
interface WikiEventData {
	tags: { id: z.infer<typeof Tag> }[];
	metadata: { id: string; value?: string }[];
	events?: unknown[];
}

interface Explorer {
	id: string;
	baseUrl: string;
	explorer: string;
	hidden: boolean;
}
