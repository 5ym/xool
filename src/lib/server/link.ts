import db from "./db";

/**
 * Makes `sourceKey` a second way into the account `targetKey` already owns:
 * the images move across and the GitHub row, if any, is repointed.
 *
 * Ownership of an uploaded image is the key that was in the cookie when it was
 * uploaded, and the two sign-ins mint different keys. Without this, signing in
 * the other way looks like a different person -- your own images stop being
 * yours and can no longer be deleted.
 */
export function adopt(targetKey: string, sourceKey: string) {
	if (targetKey === sourceKey) return;
	db().transaction(() => {
		db().run("UPDATE lImage SET userKey = ? WHERE userKey = ?", [
			targetKey,
			sourceKey,
		]);
		db().run("UPDATE ghUser SET key = ? WHERE key = ?", [targetKey, sourceKey]);
	})();
}
