import crypto from "node:crypto";
import OAuth from "oauth-1.0a";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

interface IDiscordLogger {
	log(data: DiscordLogData): Promise<void>;
}

type DiscordLogData = {
	message: string;
	title?: string;
	color?: number;
};

export const oauth = new OAuth({
	consumer: {
		key: process.env.TWITTER_CONSUMER_KEY ?? "",
		secret: process.env.TWITTER_CONSUMER_SECRET ?? "",
	},
	signature_method: "HMAC-SHA1",
	hash_function: (base_string, key) => {
		return crypto.createHmac("sha1", key).update(base_string).digest("base64");
	},
});

const twitterAuthConfig = {
	key: process.env.TWITTER_ACCESS_TOKEN ?? "",
	secret: process.env.TWITTER_ACCESS_TOKEN_SECRET ?? "",
};

export async function sendTwitterApiRequest(
	url: string,
	method: HttpMethod,
	logger?: IDiscordLogger,
	body?: string,
): Promise<Response> {
	const oauth_headers = oauth.toHeader(
		oauth.authorize(
			{
				url,
				method,
			},
			twitterAuthConfig,
		),
	);

	const response = await fetch(url, {
		method,
		headers: {
			...oauth_headers,
			"Content-Type": "application/json",
		},
		body,
	});

	if (!response.ok) {
		const errorBody = await response.text();
		logger?.log({
			message: `🚨 HTTP error! status: ${response.status} ${response.statusText}. Body: ${errorBody}`,
			title: "Twitter Authentication: makeAuthenticatedRequest",
		});
		throw new Error(
			`HTTP error! status: ${response.status} ${response.statusText}. Body: ${errorBody}`,
		);
	}

	return response;
}
