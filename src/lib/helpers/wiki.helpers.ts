import { IPFS_HASH_LENGTH, MAX_MEDIA_COUNT } from "../../data/constants";
import {
	CommonMetaIdsEnum,
	type Media,
	MediaSourceEnum,
	MediaTypeEnum,
} from "../../schema/wiki.schema";
import { whiteListedDomains, whiteListedLinkNames } from "../../types/wiki";
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

export const validateMediaContent = (media: Media[]) => {
	return media.every((item) => {
		if (
			item.source === MediaSourceEnum.Enum.IPFS_IMG ||
			item.source === MediaSourceEnum.Enum.IPFS_VID
		) {
			return item.id.length === IPFS_HASH_LENGTH;
		}

		if (item.source === MediaSourceEnum.Enum.YOUTUBE) {
			const youtubePattern =
				/^.*(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/|shorts\/|watch\?v=)([^#&?]*).*/;
			return (
				item.id === `https://www.youtube.com/watch?v=${item.name}` &&
				youtubePattern.test(item.id)
			);
		}

		if (item.source === MediaSourceEnum.Enum.VIMEO) {
			return item.id === `https://vimeo.com/${item.name}`;
		}

		return item.type ? item.type in MediaTypeEnum : true;
	});
};

export const validateMediaCount = (media: Media[]) => {
	const iconMediaCount = media.filter(
		(item) => item.type === MediaTypeEnum.Enum.ICON,
	).length;
	return media.length <= MAX_MEDIA_COUNT && iconMediaCount <= 1;
};

export const validateEventWiki = (wiki: {
	tags: { id: string }[];
	metadata: { id: string; value?: string }[];
	events?: unknown[];
}): boolean => {
	if (wiki.tags.some((tag) => tag.id === "Events")) {
		const referencesData =
			wiki.metadata.find(
				(meta) => meta.id === CommonMetaIdsEnum.Enum.references,
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
				whiteListedLinkNames.includes(linkText) &&
				!isValidUrl(linkUrl)
			) {
				return true;
			}

			if (linkUrl && !linkUrl.startsWith("#")) {
				const validDomainPattern = new RegExp(
					`^https?://(www\\.)?(${whiteListedDomains.join("|")})`,
				);
				return validDomainPattern.test(linkUrl);
			}
			return true;
		}) ?? true
	);
};
