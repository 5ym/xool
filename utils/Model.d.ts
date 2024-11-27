export interface User {
	accessToken: string;
	refreshToken: string;
	key: string;
	socialId: string;
}
export interface LImage {
	fileName: string;
	userKey: string;
	createdAt: Date;
}
