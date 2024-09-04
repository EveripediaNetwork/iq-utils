import {
	IPFS_HASH_LENGTH,
	MAX_MEDIA_COUNT,
	MEDIA_UPLOAD_PENDING_SUFFIX,
	WIKI_CONTENT_MIN_WORDS,
	WIKI_SUMMARY_MAX_LENGTH,
	WIKI_TITLE_MAX_LENGTH,
} from "../data/constants";
import {
	CommonMetaIds,
	MediaSource,
	MediaType,
	type Wiki,
	// eslint-disable-next-line sort-imports
	whiteListedDomains,
	whiteListedLinkNames,
} from "../types/wiki";

/**
 * Counts the number of words in a given string.
 * @param text - The input string to count words from.
 * @returns The number of words in the string.
 */
const countWords = (text: string) =>
	text.split(" ").filter((word) => word !== "").length;

/**
 * Checks if a given string is a valid URL.
 * @param urlString - The string to check.
 * @returns True if the string is a valid URL, false otherwise.
 */
const isValidUrl = (urlString: string) => {
	try {
		return Boolean(new URL(urlString));
	} catch (_e) {
		return false;
	}
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

/**
 * Checks if the media in the wiki is valid.
 * @param wiki - The wiki object to check.
 * @returns True if the media is valid, false otherwise.
 */
const isMediaValid = (wiki: Wiki) => {
	if (!wiki.media) return true;

	const isMediaContentValid = wiki.media.every((media) => {
		if (
			media.source === MediaSource.IPFS_IMG ||
			media.source === MediaSource.IPFS_VID
		) {
			return media.id.length === IPFS_HASH_LENGTH;
		}

		if (media.source === MediaSource.YOUTUBE) {
			const youtubePattern =
				/^.*(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/|shorts\/|watch\?v=)([^#&?]*).*/;
			return (
				media.id === `https://www.youtube.com/watch?v=${media.name}` &&
				youtubePattern.test(media.id)
			);
		}

		if (media.source === MediaSource.VIMEO) {
			return media.id === `https://vimeo.com/${media.name}`;
		}

		return media.type ? Object.values(MediaType).includes(media.type) : true;
	});

	const iconMediaCount = wiki.media.filter(
		(media) => media.type === MediaType.ICON,
	).length;

	return (
		wiki.media.length <= MAX_MEDIA_COUNT &&
		isMediaContentValid &&
		iconMediaCount <= 1
	);
};

/**
 * Checks if any media in the wiki is still uploading.
 * @param wiki - The wiki object to check.
 * @returns True if any media is still uploading, false otherwise.
 */
const isAnyMediaUploading = (wiki: Wiki) =>
	wiki.media?.some((media) => media.id.endsWith(MEDIA_UPLOAD_PENDING_SUFFIX)) ??
	false;

/**
 * Checks if the event URL is missing for an event wiki.
 * @param wiki - The wiki object to check.
 * @returns True if the event URL is missing, false otherwise.
 */
const isEventUrlMissing = (wiki: Wiki) => {
	if (wiki.tags.some((tag) => tag.id === "Events")) {
		const referencesData =
			wiki.metadata.find((meta) => meta.id === CommonMetaIds.REFERENCES)
				?.value || "[]";
		const references = JSON.parse(referencesData);
		return !references.some(
			(item: { description: string }) =>
				item.description.toLowerCase() === "event link",
		);
	}
	return false;
};

/**
 * Checks if the event date is missing for an event wiki.
 * @param wiki - The wiki object to check.
 * @returns True if the event date is missing, false otherwise.
 */
const isEventDateMissing = (wiki: Wiki) =>
	wiki.tags.some((tag) => tag.id === "Events") && wiki.events?.length === 0;

/**
 * Checks if the wiki summary exceeds the maximum length.
 * @param wiki - The wiki object to check.
 * @returns True if the summary exceeds the limit, false otherwise.
 */
const isSummaryTooLong = (wiki: Wiki) =>
	!!(wiki.summary && wiki.summary.length > WIKI_SUMMARY_MAX_LENGTH);

/**
 * Checks if the wiki has no citations.
 * @param wiki - The wiki object to check.
 * @returns True if there are no citations, false otherwise.
 */
const hasNoCitations = (wiki: Wiki) => {
	const references = wiki.metadata.find(
		(meta) => meta.id === CommonMetaIds.REFERENCES,
	);
	return !references?.value || references.value.length === 0;
};

/**
 * Validates a wiki object and returns the validation result.
 * @param wiki - The wiki object to validate.
 * @returns An object containing the validation result and an error message if applicable.
 */
export const validateWiki = (wiki: Wiki) => {
	const wordCount = countWords(wiki.content || "");

	if (!wiki.title) {
		return {
			isValid: false,
			error: "Add a Title at the top for this Wiki to continue",
		};
	}

	if (wiki.title.length > WIKI_TITLE_MAX_LENGTH) {
		return {
			isValid: false,
			error: `Title should be less than ${WIKI_TITLE_MAX_LENGTH} characters`,
		};
	}

	if (!wiki.content) {
		return { isValid: false, error: "Add a Content section to continue" };
	}

	if (wordCount < WIKI_CONTENT_MIN_WORDS) {
		return {
			isValid: false,
			error: `Add a minimum of ${WIKI_CONTENT_MIN_WORDS} words in the content section to continue. You have written ${wordCount}`,
		};
	}

	if (!areContentLinksVerified(wiki.content)) {
		return {
			isValid: false,
			error: "Please remove all external links from the content",
		};
	}

	if (!wiki.images?.length) {
		return {
			isValid: false,
			error: "Add a main image on the right column to continue",
		};
	}

	if (wiki.categories.length === 0) {
		return { isValid: false, error: "Add one category to continue" };
	}

	if (isSummaryTooLong(wiki)) {
		return {
			isValid: false,
			error: `Summary exceeds maximum limit of ${WIKI_SUMMARY_MAX_LENGTH}`,
		};
	}

	if (isAnyMediaUploading(wiki)) {
		return {
			isValid: false,
			error: "Some media are still uploading, please wait",
		};
	}

	if (hasNoCitations(wiki)) {
		return { isValid: false, error: "Please add at least one citation" };
	}

	if (isEventUrlMissing(wiki)) {
		return {
			isValid: false,
			error:
				"Please cite the event official website with 'Event Link' description",
		};
	}

	if (isEventDateMissing(wiki)) {
		return {
			isValid: false,
			error:
				'Please open the "Edit Wiki Details Modal" and enter a valid event date',
		};
	}

	if (!isMediaValid(wiki)) {
		return { isValid: false, error: "Media is invalid" };
	}

	return { isValid: true };
};
