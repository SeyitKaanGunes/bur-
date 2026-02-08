// In-memory password reset tokens (Vercel/development fallback)
export const passwordResetTokens = new Map<string, { userId: string; email: string; name: string; expiresAt: Date }>();
