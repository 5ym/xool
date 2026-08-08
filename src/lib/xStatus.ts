/**
 * Turns an x.com HTTP status into something the person reading it can act on.
 * The status alone does not say whether to wait, sign in again, or go look at
 * the developer portal, and those are the only three answers.
 */
export function xStatusMessage(status: number): string {
	switch (status) {
		case 401:
		case 403:
			return "𝕏に拒否されました。Sign in with 𝕏 で入り直してください";
		case 402:
			return "𝕏 APIのプランでは取得できません。開発者ポータルでプランをご確認ください";
		case 429:
			return "𝕏の取得上限に達しました。しばらく待ってから試してください";
		default:
			return `𝕏がエラーを返しました (${status})`;
	}
}
