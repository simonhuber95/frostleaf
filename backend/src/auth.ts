import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { getDb } from './db/index';
import * as schema from './db/schema';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _auth: any = null;

export function getAuth() {
  if (!_auth) {
    _auth = betterAuth({
      database: drizzleAdapter(getDb(), {
        provider: 'pg',
        schema: {
          user: schema.authUsers,
          session: schema.authSessions,
          account: schema.authAccounts,
          verification: schema.authVerifications,
        },
      }),
      basePath: '/api/auth',
      emailAndPassword: {
        enabled: true,
      },
      trustedOrigins: [
        'http://localhost:5173',
        'http://localhost:4173',
      ],
    });
  }
  return _auth as ReturnType<typeof betterAuth>;
}
