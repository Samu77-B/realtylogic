const DEFAULT_SUPER_ADMIN_EMAILS = ['admin@realtylogic.co.uk']

function superAdminEmails(): string[] {
  const fromEnv = process.env.SUPER_ADMIN_EMAILS?.split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)

  return fromEnv?.length ? fromEnv : DEFAULT_SUPER_ADMIN_EMAILS
}

/** CMS accounts that can edit other users (e.g. reset passwords). */
export function isSuperAdmin(user: { email?: string | null } | null | undefined): boolean {
  const email = user?.email?.trim().toLowerCase()
  if (!email) return false
  return superAdminEmails().includes(email)
}
