export interface Summary {
	userKey: string;
	enabled: number;
	lastSummarizedOn: string | null;
	lastPostId: string | null;
	lastError: string | null;
}
export interface User {
	accessToken: string;
	refreshToken: string;
	key: string;
	socialId: string;
}
