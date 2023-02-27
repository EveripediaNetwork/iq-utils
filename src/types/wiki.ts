export type ProfileLinks = {
  twitter: string | null;
  website: string | null;
  instagram: string | null;
};

export type ProfileData = {
  id: string;
  username: string;
  bio: string | null;
  links: ProfileLinks[];
  banner: string | null;
  avatar: string | null;
};

export interface BaseCategory {
  id: string;
  title: string;
}

export interface BaseTag {
  id: string;
}

export interface Image {
  id: string;
  type: string;
}

export enum MediaType {
  GALLERY = 'GALLERY',
  ICON = 'ICON',
}

export enum MediaSource {
  IPFS_IMG = 'IPFS_IMG',
  VIMEO = 'VIMEO',
  YOUTUBE = 'YOUTUBE',
  IPFS_VID = 'IPFS_VID',
}

export interface Media {
  id: string;
  size?: string;
  name?: string;
  type?: MediaType;
  caption?: string;
  thumbnail?: string;
  source: MediaSource;
}

export const EditorContentOverride = '%OVERRIDE@EDITOR@MARKDOWN%';
export const CreateNewWikiSlug = '/*CREATE+NEW+WIKI*/';

export enum CommonMetaIds {
  REFERENCES = 'references',

  // other info
  WEBSITE = 'website',
  CONTRACT_URL = 'contract_url',

  // social Links
  EMAIL_URL = 'email_url',
  FACEBOOK_PROFILE = 'facebook_profile',
  INSTAGRAM_PROFILE = 'instagram_profile',
  TWITTER_PROFILE = 'twitter_profile',
  LINKEDIN_PROFILE = 'linkedin_profile',
  YOUTUBE_PROFILE = 'youtube_profile',
  DISCORD_PROFILE = 'discord_profile',
  REDDIT_URL = 'reddit_profile',
  TELEGRAM_URL = 'telegram_profile',
  GITHUB_URL = 'github_profile',
  COIN_MARKET_CAP = 'coinmarketcap_url',
  COINGECKO_PROFILE = 'coingecko_profile',
  OPENSEA_PROFILE = 'opensea_profile',
  MEDIUM_PROFILE = 'medium_profile',

  // Explorers
  ETHERSCAN_PROFILE = 'etherscan_profile',
  ARBISCAN_PROFILE = 'arbiscan_profile',
  POLYGONSCAN_PROFILE = 'polygonscan_profile',
  BSCSCAN_PROFILE = 'bscscan_profile',
  OPTIMISTIC_ETHERSCAN_PROFILE = 'optimistic_etherscan_profile',
}

export const WikiPossibleSocialsList = [
  // other info
  CommonMetaIds.WEBSITE,
  CommonMetaIds.CONTRACT_URL,

  // social Links
  CommonMetaIds.EMAIL_URL,
  CommonMetaIds.FACEBOOK_PROFILE,
  CommonMetaIds.INSTAGRAM_PROFILE,
  CommonMetaIds.TWITTER_PROFILE,
  CommonMetaIds.LINKEDIN_PROFILE,
  CommonMetaIds.YOUTUBE_PROFILE,
  CommonMetaIds.REDDIT_URL,
  CommonMetaIds.TELEGRAM_URL,
  CommonMetaIds.DISCORD_PROFILE,
  CommonMetaIds.GITHUB_URL,
  CommonMetaIds.COIN_MARKET_CAP,
  CommonMetaIds.COINGECKO_PROFILE,
  CommonMetaIds.OPENSEA_PROFILE,
  CommonMetaIds.MEDIUM_PROFILE,

  // Explorers
  CommonMetaIds.ETHERSCAN_PROFILE,
  CommonMetaIds.ARBISCAN_PROFILE,
  CommonMetaIds.POLYGONSCAN_PROFILE,
  CommonMetaIds.BSCSCAN_PROFILE,
  CommonMetaIds.OPTIMISTIC_ETHERSCAN_PROFILE,
];

export enum ValidatorCodes {
  VALID_WIKI = 'VALID_WIKI',
  ID = 'ID_ERROR',
  LANGUAGE = 'LANGUAGE_ERROR',
  USER = 'USER_ERROR',
  WORDS = 'WORD_COUNT_ERROR',
  CATEGORY = 'CATEGORY_ERROR',
  SUMMARY = 'SUMMARY_ERROR',
  IMAGE = 'IMAGE_ERROR',
  TAG = 'TAG_ERROR',
  URL = 'EXTERNAL_URL_ERROR',
  METADATA = 'METADATA_ERROR',
  MEDIA = 'MEDIA_ERROR',
  GLOBAL_RATE_LIMIT = 'GLOBAL_RATE_LIMIT',
  ID_ERROR = 'ID_ERROR',
  LINKED_WIKIS = 'LINKED_WIKIS',
  EVENTS = 'EVENTS_ERROR',
}

export enum EditSpecificMetaIds {
  PREVIOUS_CID = 'previous_cid',
  COMMIT_MESSAGE = 'commit-message',
  WORDS_CHANGED = 'words-changed',
  PERCENT_CHANGED = 'percent-changed',
  BLOCKS_CHANGED = 'blocks-changed',
  WIKI_SCORE = 'wiki-score',
}

export interface MData {
  id: CommonMetaIds | EditSpecificMetaIds;
  value: string;
}

export interface User {
  id: string;
  profile?: ProfileData | null;
}

export interface Author {
  id: string | null;
  profile?: ProfileData | null;
}

export interface CiteReference {
  id: string;
  url: string;
  description: string;
  timestamp: string;
}

enum LanguagesValuesEnum {
  SPANISH = 'Español',
  ENGLISH = 'English',
  CHINESE = '中文',
  KOREAN = '한국어',
}

export enum LanguagesISOEnum {
  EN = 'en',
  ES = 'es',
  ZH = 'zh',
  KO = 'ko',
}

type LanguagesType = Record<LanguagesISOEnum, LanguagesValuesEnum>;

export const Languages: LanguagesType = {
  en: LanguagesValuesEnum.ENGLISH,
  es: LanguagesValuesEnum.SPANISH,
  zh: LanguagesValuesEnum.CHINESE,
  ko: LanguagesValuesEnum.KOREAN,
};

export enum LinkedWikiKey {
  FOUNDER = 'founders',
  BLOCKCHAIN = 'blockchains',
}

export type LinkedWikis = Partial<Record<LinkedWikiKey, string[]>>;

export enum EventType {
  CREATED = 'CREATED',
  DEFAULT = 'DEFAULT',
}

export interface BaseEvents {
  date: string;
  title?: string;
  type: EventType;
  description?: string;
  link?: string;
}

export interface Wiki {
  id: string;
  transactionHash?: string;
  ipfs?: string;
  summary: string;
  promoted: number;
  title: string;
  content: string;
  categories: BaseCategory[];
  tags: BaseTag[];
  images?: Image[];
  media?: Media[];
  events?: BaseEvents[];
  user: User;
  metadata: MData[];
  linkedWikis?: LinkedWikis;
  version: number;
  language: LanguagesISOEnum;
  updated?: string;
  created?: string;
  views?: number;
  author: Author;
  hidden: boolean;
}

export type ActivityCardDetails = Pick<
  Wiki,
  | 'id'
  | 'title'
  | 'summary'
  | 'images'
  | 'categories'
  | 'tags'
  | 'user'
  | 'updated'
>;

export type WikiPreview = Pick<
  Wiki,
  | 'id'
  | 'hidden'
  | 'title'
  | 'summary'
  | 'tags'
  | 'images'
  | 'categories'
  | 'user'
  | 'updated'
>;

export const whiteListedDomains = [
  'youtube.com/watch',
  'youtu.be',
  'vimeo.com',
  'alpha.everipedia.org/wiki',
  'beta.everipedia.org/wiki',
  'iq.wiki/wiki',
  'ipfs.everipedia.org/ipfs',
];

export const whiteListedLinkNames = ['YOUTUBE@VID', 'DUNE@EMBED'];
