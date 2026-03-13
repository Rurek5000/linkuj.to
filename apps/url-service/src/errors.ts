export class UnsafeUrlError extends Error {
  constructor() {
    super("URL flagged as unsafe");
    this.name = "UnsafeUrlError";
  }
}

export class ShortCodeCollisionError extends Error {
  constructor() {
    super("Failed to generate unique short code");
    this.name = "ShortCodeCollisionError";
  }
}
