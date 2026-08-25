import jwt from "jsonwebtoken";

// 1. Set environment variable BEFORE importing generateToken
process.env.JWT_SECRET = process.env.JWT_SECRET || "test_secret_key";

import generateToken from "../../utils/generateToken";

describe("generateToken utility", () => {
  const originalSecret = process.env.JWT_SECRET;

  beforeAll(() => {
    process.env.JWT_SECRET = "test_secret_key";
  });

  afterAll(() => {
    // 2. Restore original environment variable after tests complete
    process.env.JWT_SECRET = originalSecret;
  });

  it("should generate a valid JWT containing the correct id and role", () => {
    const fakeUserId = "64f1a2b3c4d5e6f7a8b9c0d1";
    const fakeRole = "customer";

    const token = generateToken(fakeUserId, fakeRole);

    // A JWT should be a non-empty string with 3 parts separated by dots
    expect(typeof token).toBe("string");
    expect(token.split(".").length).toBe(3);

    // Decode it and verify the payload matches what we passed in
    const decoded = jwt.verify(token, "test_secret_key") as {
      id: string;
      role: string;
    };

    expect(decoded.id).toBe(fakeUserId);
    expect(decoded.role).toBe(fakeRole);
  });

  it("should generate different tokens for different users", () => {
    const token1 = generateToken("userId1", "customer");
    const token2 = generateToken("userId2", "admin");

    expect(token1).not.toBe(token2);
  });
});
