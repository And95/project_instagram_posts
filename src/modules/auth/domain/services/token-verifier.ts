export interface VerifiedTokenPayload {
  sub: string;
  email: string;
}

export interface TokenVerifier {
  verify(token: string): Promise<VerifiedTokenPayload>;
}
