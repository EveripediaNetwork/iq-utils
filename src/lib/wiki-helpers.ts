import type { z } from "zod";

import {
	IPFS_HASH_LENGTH,
	MAX_MEDIA_COUNT,
	WHITELISTED_DOMAINS,
	WHITELISTED_LINK_NAMES,
} from "../data/constants";
import {
	CommonMetaIds,
	type Media,
	MediaSource,
	MediaType,
	type Tag,
} from "../schema";

/**
 * Counts the number of words in a given string.
 * @param text - The input string to count words from.
 * @returns The number of words in the string.
 */
export const countWords = (text: string) =>
	text.split(" ").filter((word) => word !== "").length;

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

/**
 * Validates the media content in a wiki, ensuring that the media items have valid IDs and sources.
 * @param media - The array of media items to validate.
 * @returns True if all media items have valid content, false otherwise.
 */
export const validateMediaContent = (media: Media[]) => {
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
};

/**
 * Validates the count of media items in a wiki, ensuring that the total count does not exceed a maximum limit and that there is at most one icon media item.
 * @param media - The array of media items to validate.
 * @returns True if the media count is valid, false otherwise.
 */
export const validateMediaCount = (media: Media[]) => {
	const iconMediaCount = media.filter(
		(item) => item.type === MediaType.Enum.ICON,
	).length;
	return media.length <= MAX_MEDIA_COUNT && iconMediaCount <= 1;
};

/**
 * Validates the event wiki data, ensuring that if the wiki has a "Events" tag, it also has a reference with the description "Event Link" and at least one event.
 * @param wiki - The wiki data to validate.
 * @returns True if the event wiki data is valid, false otherwise.
 */
export const validateEventWiki = (wiki: {
	tags: { id: z.infer<typeof Tag> }[];
	metadata: { id: string; value?: string }[];
	events?: unknown[];
}): boolean => {
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
};

/**
 * Checks if all content links in the given text are verified.
 * @param content - The content to check for links.
 * @returns True if all links are verified, false otherwise.
 */
export const areContentLinksVerified = (content: string) => {
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
};
