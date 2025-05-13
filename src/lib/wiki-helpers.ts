import axios from "axios";
import QuickLRU from "quick-lru";
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
	Wiki,
} from "../schema";

// ===============================
// Text and content helpers
// ===============================

/**
 * Counts the number of words in a given string.
 * @param text - The input string to count words from.
 * @returns The number of words in the string.
 */
export function countWords(text: string): number {
	return text.split(" ").filter((word) => word !== "").length;
}

/**
 * Checks if a given string is a valid URL.
 * @param urlString - The string to check.
 * @returns True if the string is a valid URL, false otherwise.
 */
export const isValidUrl = (urlString: string) => {
	try {
		return Boolean(new URL(urlString));
	} catch (_e) {
		return false;
	}
};

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
				/^.*(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/|shorts\/|watch\?v=)([^#&?]*)(?:\?si=[^#&?]*)?(?:\?v=[^#&?]*)?(?:[#&].*)?$/;
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
export function isEventWikiValid(wiki: {
	tags: { id: string }[];
	metadata: { id: string; value: string }[];
	events: unknown[];
}): boolean {
	if (wiki.tags.some((tag) => tag.id === "Events")) {
		const referencesData =
			wiki.metadata.find((meta) => meta.id === CommonMetaIds.Enum.references)
				?.value || "[]";
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

export async function transformAndFilterMetadata(
	metadata: MetaData[],
): Promise<MetaData[]> {
	const explorers = await getExplorers();
	const validIds = new Set([
		...CommonMetaIds.options,
		...EditSpecificMetaIds.options,
		...explorers.map((e) => e.id),
	]);

	return metadata.filter((meta) => {
		if (!validIds.has(meta.id)) return false;

		const explorer = explorers.find((e) => e.id === meta.id);
		if (explorer) {
			return (
				isValidUrl(meta.value) &&
				new URL(meta.value).origin === new URL(explorer.baseUrl).origin
			);
		}

		return true;
	});
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

const cache = new QuickLRU({
	maxSize: 1000,
	maxAge: 12 * 60 * 60 * 1000, // 12 hours
});

export const api = axios.create({
	baseURL: "https://graph.everipedia.org/graphql",
	headers: {
		"Content-Type": "application/json",
	},
});

export async function getExplorers(): Promise<Explorer[]> {
	const cacheKey = "explorers";
	const cachedData = cache.get(cacheKey) as Explorer[];

	if (cachedData) {
		return cachedData;
	}

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

	const { data } = await api.post<{ data: { explorers: Explorer[] } }>("", {
		query,
		variables: {
			offset: 0,
			limit: 30,
		},
	});

	const explorers = data.data.explorers;
	cache.set(cacheKey, explorers);

	return explorers;
}

// ===============================
// Types
// ===============================

interface Explorer {
	id: string;
	baseUrl: string;
	explorer: string;
	hidden: boolean;
}
