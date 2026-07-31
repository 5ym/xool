export interface User {
	accessToken: string;
	refreshToken: string;
	key: string;
	socialId: string;
}
export interface LImage {
	id: number;
	fileName: string;
	userKey: string;
	createdAt: number;
}
export interface Tweet {
	tweetId: string;
	userKey: string;
	text: string;
	postedAt: number;
}
export interface TweetMetric {
	id: number;
	tweetId: string;
	capturedAt: number;
	impressions: number;
	profileClicks: number;
	linkClicks: number;
	likes: number;
	reposts: number;
	replies: number;
	quotes: number;
	bookmarks: number;
}
