import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export function signToken(payload: { userId: number }) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string) {
  return jwt.verify(token, JWT_SECRET) as { userId: number };
}
