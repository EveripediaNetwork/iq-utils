import { z } from "zod";

import {
	MAX_MEDIA_COUNT,
	WIKI_CONTENT_MIN_WORDS,
	WIKI_SUMMARY_MAX_LENGTH,
	WIKI_TITLE_MAX_LENGTH,
} from "../data/constants";
import {
	areContentLinksVerified,
	countWords,
	validateEventWiki,
	validateMediaContent,
	validateMediaCount,
} from "../lib/helpers/wiki.helpers";

/**
 * ========================
 * ===== Enum Schemas =====
 * ========================
 */
export const MediaTypeEnum = z.enum(["GALLERY", "ICON"]);
export const MediaSourceEnum = z.enum([
	"IPFS_IMG",
	"VIMEO",
	"YOUTUBE",
	"IPFS_VID",
]);
export const CommonMetaIdsEnum = z.enum([
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
	"etherscan_profile",
	"arbiscan_profile",
	"polygonscan_profile",
	"bscscan_profile",
	"optimistic_etherscan_profile",
	"basescan_profile",
	"ftmscan_profile",
	"solscan_profile",
	"avascan_profile",
	"nearblocks_profile",
	"troscan_profile",
	"xrpscan_profile",
	"kavascan_profile",
	"tonscan_profile",
	"celoscan_profile",
	"cronoscan_profile",
	"zkscan_profile",
	"explorer_injective_profile",
	"blastscan_profile",
]);

export const WikiPossibleSocialsList: (keyof typeof CommonMetaIdsEnum.enum)[] =
	Object.values(CommonMetaIdsEnum.enum);

const EditSpecificMetaIdsEnum = z.enum([
	"previous_cid",
	"commit-message",
	"words-changed",
	"percent-changed",
	"blocks-changed",
	"wiki-score",
]);

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

const LanguagesISOEnum = z.enum(["en", "es", "zh", "ko"]);
const LinkedWikiKeyEnum = z.enum(["founders", "blockchains", "speakers"]);
const EventTypeEnum = z.enum(["CREATED", "DEFAULT", "MULTIDATE"]);
export const TagEnum = z.enum([
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
	"Hackathon",
	"Marketplaces",
	"Memecoins",
	"Organizations",
	"Online",
	"PeopleInDeFi",
	"Polkadot",
	"Polygon",
	"Protocols",
	"Solana",
	"Speakers",
	"Stablecoins",
	"Venture",
]);
export const CategoryEnum = z.enum([
	"nfts",
	"defi",
	"exchanges",
	"cryptocurrencies",
	"daos",
	"people",
	"dapps",
	"organizations",
]);

/**
 * ==============================
 * ===== Supporting Schemas =====
 * ==============================
 */

const ProfileLinksSchema = z.object({
	twitter: z.string().nullable(),
	website: z.string().nullable(),
	instagram: z.string().nullable(),
});

const ProfileDataSchema = z.object({
	id: z.string().nullish(),
	username: z.string().nullish(),
	bio: z.string().nullish(),
	links: z.array(ProfileLinksSchema).nullish(),
	banner: z.string().nullish(),
	avatar: z.string().nullish(),
});

export const ImageSchema = z.object({
	id: z.string(),
	type: z.string(),
});

export type Image = z.infer<typeof ImageSchema>;

export const MediaSchema = z.object({
	id: z.string(),
	size: z.string().nullish(),
	name: z.string().nullish(),
	type: MediaTypeEnum.nullish(),
	caption: z.string().nullish(),
	thumbnail: z.string().nullish(),
	source: MediaSourceEnum,
});

export type Media = z.infer<typeof MediaSchema>;

const MetaDataSchema = z.object({
	id: z.union([CommonMetaIdsEnum, EditSpecificMetaIdsEnum]),
	value: z.any(),
});

const BaseCategorySchema = z.object({
	id: CategoryEnum,
	title: z.string(),
});

export const BaseEventsSchema = z.object({
	id: z.string().optional().nullable(),
	date: z.string().nullable(),
	title: z.string().optional().nullable(),
	type: EventTypeEnum.nullable(),
	description: z.string().optional().nullable(),
	link: z.string().optional().nullable(),
	multiDateStart: z.string().optional().nullable(),
	multiDateEnd: z.string().optional().nullable(),
	continent: z.string().optional().nullable(),
	country: z.string().optional().nullable(),
	action: z.enum(["DELETE", "EDIT", "CREATE"]).optional().nullable(),
});

export type EventType = z.infer<typeof EventTypeEnum>;
export type BaseEvents = z.infer<typeof BaseEventsSchema>;

const WikiReference = z.object({
	id: z.string(),
	title: z.string(),
});

/**
 * ========================
 * ===== Core Schemas =====
 * ========================
 */

export const WikiSchema = z
	.object({
		id: z.string(),
		title: z
			.string()
			.min(1, "Add a Title at the top for this Wiki to continue")
			.max(
				WIKI_TITLE_MAX_LENGTH,
				`Title should be less than ${WIKI_TITLE_MAX_LENGTH} characters`,
			),
		ipfs: z.string().optional(),
		content: z
			.string()
			.min(1, "Add a Content section to continue")
			.refine(
				(content) => countWords(content) >= WIKI_CONTENT_MIN_WORDS,
				`Add a minimum of ${WIKI_CONTENT_MIN_WORDS} words in the content section to continue`,
			)
			.refine(
				areContentLinksVerified,
				"Please remove all external links from the content",
			),
		summary: z
			.string()
			.max(
				WIKI_SUMMARY_MAX_LENGTH,
				`Summary exceeds maximum limit of ${WIKI_SUMMARY_MAX_LENGTH}`,
			),
		images: z
			.array(ImageSchema)
			.min(1, "Add a main image on the right column to continue"),
		categories: z
			.array(BaseCategorySchema)
			.min(1, "Add one category to continue"),
		tags: z.array(z.object({ id: z.string() })).transform((tags) =>
			tags.map((tag) => ({
				id: TagEnum.parse(tag.id),
			})),
		),
		media: z
			.array(MediaSchema)
			.max(MAX_MEDIA_COUNT)
			.refine((media) => {
				if (!media) return true;
				return validateMediaContent(media) && validateMediaCount(media);
			}, "Media is invalid")
			.optional(),
		metadata: z.array(MetaDataSchema).refine((metadata) => {
			const references = metadata.find(
				(meta) => meta.id === CommonMetaIdsEnum.Enum.references,
			);
			return !references?.value || references.value.length > 0;
		}, "Please add at least one citation"),
		events: z.array(BaseEventsSchema).optional().nullable(),
		user: z
			.object({
				id: z.string(),
				profile: ProfileDataSchema.optional().nullable(),
			})
			.nullable()
			.optional(),
		author: z
			.object({
				id: z.string(),
				profile: ProfileDataSchema.optional().nullable(),
			})
			.nullable()
			.optional(),
		language: LanguagesISOEnum.default(LanguagesISOEnum.Enum.en),
		version: z.number().default(1),
		hidden: z.boolean().default(false),
		promoted: z.number().default(0),
		views: z.number().optional().default(0),
		linkedWikis: z
			.object({
				[LinkedWikiKeyEnum.Enum.blockchains]: z
					.array(z.string())
					.optional()
					.nullable(),
				[LinkedWikiKeyEnum.Enum.founders]: z
					.array(z.string())
					.optional()
					.nullable(),
				[LinkedWikiKeyEnum.Enum.speakers]: z
					.array(z.string())
					.optional()
					.nullable(),
			})
			.nullable()
			.optional()
			.default({}),
		founderWikis: z.array(WikiReference).optional().default([]),
		blockchainWikis: z.array(WikiReference).optional().default([]),
	})
	.refine(
		(arg) =>
			validateEventWiki(
				arg as {
					tags: { id: z.infer<typeof TagEnum> }[];
					metadata: { id: string; value?: string }[];
					events?: unknown[];
				},
			),
		{
			message:
				"Event wikis must have an event link citation and at least one event date",
			path: ["events"],
		},
	);

export type Wiki = z.infer<typeof WikiSchema>;

export const ReferenceSchema = z.object({
	id: z.string(),
	description: z.string(),
	timestamp: z.number(),
	url: z.string(),
});

export type Reference = z.infer<typeof ReferenceSchema>;
