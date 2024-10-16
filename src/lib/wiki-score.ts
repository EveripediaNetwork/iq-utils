import {
	CITATIONS_SCORE_WEIGHT,
	CONTENT_SCORE_WEIGHT,
	GOOD_CONTENT_WORD_COUNT,
	IDEAL_CITATIONS_COUNT,
	IDEAL_CONTENT_WORD_COUNT,
	IDEAL_INTERNAL_LINKS_COUNT,
	IDEAL_MEDIA_COUNT,
	IDEAL_SOCIAL_MEDIA_COUNT,
	IDEAL_SUMMARY_LENGTH,
	IDEAL_TAGS_COUNT,
	INTERNAL_LINKS_SCORE_WEIGHT,
	MEDIA_SCORE_WEIGHT,
	MIN_CONTENT_WORD_COUNT,
	SOCIAL_SCORE_WEIGHT,
	SUMMARY_SCORE_WEIGHT,
	TAGS_SCORE_WEIGHT,
} from "../data/constants";
import { CommonMetaIds, type Wiki } from "../schema";

const contentQuality = (wordCount: number): number => {
	const scoreMin = 0.0;
	const scoreMax = 1.0;

	let score = 0;

	if (wordCount < MIN_CONTENT_WORD_COUNT) {
		return scoreMin;
	}

	if (
		wordCount >= MIN_CONTENT_WORD_COUNT &&
		wordCount <= GOOD_CONTENT_WORD_COUNT
	) {
		score = wordCount / GOOD_CONTENT_WORD_COUNT;
		score *= 0.8;
	}

	if (
		wordCount > GOOD_CONTENT_WORD_COUNT &&
		wordCount < IDEAL_CONTENT_WORD_COUNT
	) {
		const baseScore = 0.8;
		const wordCountAboveGood = wordCount - GOOD_CONTENT_WORD_COUNT;
		const extraScoreFactor =
			wordCountAboveGood / (IDEAL_CONTENT_WORD_COUNT - GOOD_CONTENT_WORD_COUNT);
		const extraScore = Math.sqrt(extraScoreFactor) * 0.2;
		score = baseScore + extraScore;
	}

	if (wordCount >= IDEAL_CONTENT_WORD_COUNT) {
		return scoreMax;
	}

	if (score < scoreMin) {
		return scoreMin;
	}

	if (score > scoreMax) {
		return scoreMax;
	}

	return score;
};

const countQuality = (idealCount: number, realCount: number): number => {
	const scoreMin = 0.0;
	const scoreMax = 1.0;

	const score = realCount / idealCount;

	if (score < scoreMin) {
		return scoreMin;
	}

	if (score > scoreMax) {
		return scoreMax;
	}

	return score;
};

const getHostnameFromRegex = (url: string) => {
	const matches = RegExp(/^https?:\/\/([^/?#]+)(?:[/?#]|$)/i).exec(url);
	return matches?.[1];
};

const getWikiInternalLinks = (content: string): number => {
	const markdownLinkRegex = /\[(.*?)\]\((.*?)\)/g;
	let internalLinksCount = 0;
	let match = markdownLinkRegex.exec(content);

	while (match !== null) {
		const url = match[2];
		if (url && !url.startsWith("#")) {
			const hostname = getHostnameFromRegex(url);
			if (
				hostname === "everipedia.org" ||
				hostname === "iq.wiki" ||
				hostname?.endsWith(".everipedia.org")
			) {
				internalLinksCount++;
			}
		}
		match = markdownLinkRegex.exec(content); // Move assignment here
	}

	return internalLinksCount;
};

const getWikiCitationLinks = (wiki: Wiki) => {
	const rawWikiReferences = wiki.metadata.find(
		(m) => m.id === CommonMetaIds.Enum.references,
	)?.value;

	if (
		rawWikiReferences === undefined ||
		rawWikiReferences?.trim().length === 0
	) {
		return 0;
	}

	const wikiReferences = JSON.parse(rawWikiReferences);

	return wikiReferences.length;
};

const getSocialsCount = (wiki: Wiki): number => {
	let socialsCount = 0;
	for (const meta of wiki.metadata) {
		if (
			CommonMetaIds.options.includes(meta.id as keyof typeof CommonMetaIds.enum)
		) {
			if (meta.value) {
				socialsCount += 1;
			}
		}
	}
	return socialsCount;
};

export const calculateWikiScore = (wiki: Wiki): number => {
	const wordCount = wiki.content.split(" ").length;
	const internalLinksCount = getWikiInternalLinks(wiki.content);
	const citationCount = getWikiCitationLinks(wiki);
	const mediaCount = wiki.media?.length || 0;
	const tagsCount = wiki.tags?.length || 0;
	const summaryWordCount = wiki.summary?.length || 0;
	const socialsCount = getSocialsCount(wiki);

	const contentScore = contentQuality(wordCount);
	const internalLinksScore = countQuality(
		IDEAL_INTERNAL_LINKS_COUNT,
		internalLinksCount,
	);
	const citationScore = countQuality(IDEAL_CITATIONS_COUNT, citationCount);
	const mediaScore = countQuality(IDEAL_MEDIA_COUNT, mediaCount);
	const tagsScore = countQuality(IDEAL_TAGS_COUNT, tagsCount);
	const summaryScore = countQuality(IDEAL_SUMMARY_LENGTH, summaryWordCount);
	const socialsScore = countQuality(IDEAL_SOCIAL_MEDIA_COUNT, socialsCount);

	const sumOfWeights =
		CONTENT_SCORE_WEIGHT +
		INTERNAL_LINKS_SCORE_WEIGHT +
		CITATIONS_SCORE_WEIGHT +
		MEDIA_SCORE_WEIGHT +
		TAGS_SCORE_WEIGHT +
		SUMMARY_SCORE_WEIGHT +
		SOCIAL_SCORE_WEIGHT;

	const score =
		(contentScore * CONTENT_SCORE_WEIGHT +
			internalLinksScore * INTERNAL_LINKS_SCORE_WEIGHT +
			citationScore * CITATIONS_SCORE_WEIGHT +
			mediaScore * MEDIA_SCORE_WEIGHT +
			tagsScore * TAGS_SCORE_WEIGHT +
			summaryScore * SUMMARY_SCORE_WEIGHT +
			socialsScore * SOCIAL_SCORE_WEIGHT) /
		sumOfWeights;

	const percentScore = Math.floor(score * 100);
	return percentScore;
};
