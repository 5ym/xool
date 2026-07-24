export async function generateUniqueKey(
	exists: (key: string) => Promise<boolean>,
): Promise<string> {
	const key = crypto.randomUUID();
	return (await exists(key)) ? generateUniqueKey(exists) : key;
}
