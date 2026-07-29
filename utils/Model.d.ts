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
