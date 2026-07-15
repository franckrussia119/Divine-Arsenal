/** Returns the user's real uploaded avatar, or a generic placeholder path if
 * they haven't uploaded one — never a fake stock photo pretending to be them. */
export function avatarOrDefault(url?: string | null): string {
  return url && url.trim() ? url : '/default-avatar.svg';
}
