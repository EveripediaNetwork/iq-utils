import type { Wiki } from "../schema/wiki.schema";

type WikiWithTimestamp = Wiki & { updated: Date };

export type ActivityCardDetails = Pick<
	WikiWithTimestamp,
	| "id"
	| "title"
	| "summary"
	| "images"
	| "categories"
	| "tags"
	| "user"
	| "updated"
>;

export type WikiPreview = Pick<
	WikiWithTimestamp,
	| "id"
	| "hidden"
	| "title"
	| "summary"
	| "tags"
	| "images"
	| "categories"
	| "user"
	| "updated"
>;

export const whiteListedDomains = [
	"youtube.com/watch",
	"youtu.be",
	"vimeo.com",
	"alpha.everipedia.org/wiki",
	"beta.everipedia.org/wiki",
	"iq.wiki/wiki",
	"ipfs.everipedia.org/ipfs",
];

export const whiteListedLinkNames = ["YOUTUBE@VID", "DUNE@EMBED"];
