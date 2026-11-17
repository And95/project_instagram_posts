export interface TokenPayload {
  sub: string;
  email: string;
}

export interface TokenGenerator {
  generate(payload: TokenPayload): Promise<string>;
}
