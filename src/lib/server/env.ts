/**
 * The hostname LGTM answers on. Requests arriving on any other host are the
 * summary tool, which is why this is the only name that has to be configured:
 * everything else follows from the request itself.
 */
export const LGTM_HOST = process.env.LGTM_HOST;
