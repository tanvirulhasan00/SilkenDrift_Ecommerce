// ============================================================================
// SILKEN DRIFT - ADMIN SECURITY & ROUTE OBFUSCATION CONFIG
// ============================================================================

/**
 * Secret, non-guessable admin route prefix.
 * Attackers or curious users probing '/admin', '/wp-admin', or '/dashboard'
 * will only ever see a 404 Page Not Found.
 *
 * Authorized staff enter via the discreet portal gateway or direct secret URL.
 */
export const ADMIN_SECRET_PATH = "sd-hq-vault-88";

/**
 * Generates an internal URL for the secret admin portal
 * @param subpath Optional subpath without leading slash, e.g. "products", "orders"
 */
export function getAdminPath(subpath: string = ""): string {
  const clean = subpath.replace(/^\//, "");
  return `/${ADMIN_SECRET_PATH}${clean ? `/${clean}` : ""}`;
}

/**
 * Verifies if a given path belongs to the administrative vault
 */
export function isAdminRoute(pathname: string): boolean {
  return pathname.startsWith(`/${ADMIN_SECRET_PATH}`);
}
