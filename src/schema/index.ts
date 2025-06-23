import { z } from "zod";

import {
	MAX_MEDIA_COUNT,
	WIKI_CONTENT_MIN_WORDS,
	WIKI_SUMMARY_MAX_LENGTH,
	WIKI_TITLE_MAX_LENGTH,
} from "../data/constants";
import {
	transformAndFilterMetadata,
	containsOnlyVerifiedLinks,
	hasAtLeastOneReference,
	hasMinimumWordCount,
	isEventWikiValid,
	isMediaContentAndCountValid,
	transformAndFilterTags,
} from "../lib/wiki-helpers";

/**
 * ========================
 * ===== Enum Schemas =====
 * ========================
 */
export const MediaType = z.enum(["GALLERY", "ICON"]);
export type MediaType = z.infer<typeof MediaType>;

export const MediaSource = z.enum(["IPFS_IMG", "VIMEO", "YOUTUBE", "IPFS_VID"]);
export type MediaSource = z.infer<typeof MediaSource>;

export const CommonMetaIds = z.enum([
	"references",
	"website",
	"contract_url",
	"location",
	"email_url",
	"facebook_profile",
	"instagram_profile",
	"twitter_profile",
	"linkedin_profile",
	"youtube_profile",
	"discord_profile",
	"reddit_profile",
	"telegram_profile",
	"github_profile",
	"coinmarketcap_url",
	"coingecko_profile",
	"opensea_profile",
	"medium_profile",
	"mirror_profile",
	"tiktok_profile",
	"explorer_injective_profile",
]);
export type CommonMetaIds = z.infer<typeof CommonMetaIds>;

export const EditSpecificMetaIds = z.enum(["previous_cid", "commit-message"]);
export type EditSpecificMetaIds = z.infer<typeof EditSpecificMetaIds>;

export const ValidatorCodes = z.enum([
	"VALID_WIKI",
	"ID_ERROR",
	"LANGUAGE_ERROR",
	"USER_ERROR",
	"WORD_COUNT_ERROR",
	"CATEGORY_ERROR",
	"SUMMARY_ERROR",
	"IMAGE_ERROR",
	"TAG_ERROR",
	"EXTERNAL_URL_ERROR",
	"METADATA_ERROR",
	"MEDIA_ERROR",
	"GLOBAL_RATE_LIMIT",
	"LINKED_WIKIS",
	"EVENTS_ERROR",
]);
export type ValidatorCodes = z.infer<typeof ValidatorCodes>;

export const LanguagesISO = z.enum(["en", "es", "zh", "ko"]);
export type LanguagesISO = z.infer<typeof LanguagesISO>;

export const LinkedWikiKey = z.enum(["founders", "blockchains", "speakers"]);
export type LinkedWikiKey = z.infer<typeof LinkedWikiKey>;

export const EventType = z.enum(["CREATED", "DEFAULT", "MULTIDATE"]);
export type EventType = z.infer<typeof EventType>;

export const Tag = z.enum([
	"Artists",
	"AI",
	"BinanceSmartChain",
	"Blockchains",
	"CEXes",
	"Collections",
	"Collectors",
	"Conference",
	"DEXes",
	"Developers",
	"Entertainment",
	"Ethereum",
	"Events",
	"Forum",
	"Founders",
	"Festival",
	"Games",
	"Glossary",
	"Government",
	"Hackathon",
	"Marketplaces",
	"Memecoins",
	"Organizations",
	"Online",
	"PeopleInDeFi",
	"Polkadot",
	"Polygon",
	"Protocols",
	"Regulations",
	"Solana",
	"Speakers",
	"Stablecoins",
	"Venture",
]);
export type Tag = z.infer<typeof Tag>;

export const Category = z.enum([
	"nfts",
	"defi",
	"exchanges",
	"cryptocurrencies",
	"daos",
	"people",
	"dapps",
	"organizations",
]);
export type Category = z.infer<typeof Category>;

/**
 * ==============================
 * ===== Supporting Schemas =====
 * ==============================
 */

export const ProfileLinks = z.object({
	twitter: z.string().nullable(),
	website: z.string().nullable(),
	instagram: z.string().nullable(),
});
export type ProfileLinks = z.infer<typeof ProfileLinks>;

export const ProfileData = z.object({
	id: z.string().nullable(),
	username: z.string().nullable(),
	bio: z.string().nullable(),
	links: z.array(ProfileLinks).nullable(),
	banner: z.string().nullable(),
	avatar: z.string().nullable(),
});
export type ProfileData = z.infer<typeof ProfileData>;

export const Image = z.object({
	id: z.string(),
	type: z.string(),
});
export type Image = z.infer<typeof Image>;

export const Media = z.object({
	id: z.string(),
	size: z.union([z.string(), z.number()]).nullish(),
	name: z.string().nullish(),
	type: MediaType.nullish(),
	caption: z.string().nullish(),
	thumbnail: z.string().nullish(),
	source: MediaSource,
});
export type Media = z.infer<typeof Media>;

const MetaData = z.object({
	id: z.string(),
	value: z.any(),
});
export type MetaData = z.infer<typeof MetaData>;

export const BaseCategory = z.object({
	id: Category,
	title: z.string(),
});
export type BaseCategory = z.infer<typeof BaseCategory>;

export const BaseEvents = z.object({
	id: z.string().nullish(),
	date: z.string().nullable(),
	title: z.string().nullish(),
	type: EventType.nullable(),
	description: z.string().nullish(),
	link: z.string().nullish(),
	multiDateStart: z.string().nullish(),
	multiDateEnd: z.string().nullish(),
	continent: z.string().nullish(),
	country: z.string().nullish(),
	action: z.enum(["DELETE", "EDIT", "CREATE"]).nullish(),
});
export type BaseEvents = z.infer<typeof BaseEvents>;

/**
 * ========================
 * ===== Core Schemas =====
 * ========================
 */

export const Wiki = z
	.object({
		id: z.string(),
		title: z
			.string()
			.min(1, "Add a Title at the top for this Wiki to continue")
			.max(
				WIKI_TITLE_MAX_LENGTH,
				`Title should be less than ${WIKI_TITLE_MAX_LENGTH} characters`,
			),
		content: z
			.string()
			.min(1, "Add a Content section to continue")
			.refine(
				hasMinimumWordCount,
				`Add a minimum of ${WIKI_CONTENT_MIN_WORDS} words in the content section to continue`,
			)
			.refine(
				containsOnlyVerifiedLinks,
				"Please remove all external links from the content",
			),
		summary: z
			.string()
			.max(
				WIKI_SUMMARY_MAX_LENGTH,
				`Summary exceeds maximum limit of ${WIKI_SUMMARY_MAX_LENGTH}`,
			),
		images: z
			.array(Image)
			.min(1, "Add a main image on the right column to continue"),
		categories: z.array(BaseCategory).min(1, "Add one category to continue"),
		tags: z
			.array(z.object({ id: z.string() }))
			.transform(transformAndFilterTags),
		media: z
			.array(Media)
			.max(MAX_MEDIA_COUNT)
			.refine(isMediaContentAndCountValid, "Media is invalid")
			.optional(),
		metadata: z
			.array(MetaData)
			.refine(hasAtLeastOneReference, "Please add at least one citation")
			.transform(transformAndFilterMetadata),
		events: z.array(BaseEvents).nullish(),
		user: z.object({ id: z.string() }),
		author: z.object({ id: z.string() }),
		language: LanguagesISO.default(LanguagesISO.Enum.en),
		version: z.number().default(1),
		linkedWikis: z
			.object({
				[LinkedWikiKey.Enum.blockchains]: z
					.array(z.string())
					.nullish()
					.default([]),
				[LinkedWikiKey.Enum.founders]: z
					.array(z.string())
					.nullish()
					.default([]),
				[LinkedWikiKey.Enum.speakers]: z
					.array(z.string())
					.nullish()
					.default([]),
			})
			.nullish()
			.default({
				[LinkedWikiKey.Enum.blockchains]: [],
				[LinkedWikiKey.Enum.founders]: [],
				[LinkedWikiKey.Enum.speakers]: [],
			})
			.transform((val) => ({
				[LinkedWikiKey.Enum.blockchains]:
					val?.[LinkedWikiKey.Enum.blockchains] ?? [],
				[LinkedWikiKey.Enum.founders]: val?.[LinkedWikiKey.Enum.founders] ?? [],
				[LinkedWikiKey.Enum.speakers]: val?.[LinkedWikiKey.Enum.speakers] ?? [],
			})),
	})
	.refine(
		(arg) =>
			isEventWikiValid(
				arg as {
					tags: { id: string }[];
					metadata: { id: string; value: string }[];
					events: unknown[];
				},
			),
		{
			message:
				"Event wikis must have an event link citation and at least one event date",
			path: ["events"],
		},
	);
export type Wiki = z.infer<typeof Wiki>;

export const Reference = z.object({
	id: z.string(),
	description: z.string(),
	timestamp: z.number(),
	url: z.string(),
});
export type Reference = z.infer<typeof Reference>;
