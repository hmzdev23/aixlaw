/**
 * Module augmentation: extend NextAuth's `Session` and `JWT` with the Google
 * tokens we forward to the integration clients.
 */
import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    refreshToken?: string;
    /** Unix seconds when the access token expires. */
    expiresAt?: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
  }
}
