import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken, TokenPayload } from "./auth";

export interface AuthenticatedRequest extends NextRequest {
  user?: TokenPayload;
}

/**
 * Middleware to authenticate requests
 */
export function authenticate(
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>,
) {
  return async (req: AuthenticatedRequest): Promise<NextResponse> => {
    try {
      // Get token from Authorization header
      const authHeader = req.headers.get("authorization");

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return NextResponse.json(
          { error: "Unauthorized", message: "Token não fornecido" },
          { status: 401 },
        );
      }

      const token = authHeader.substring(7);

      // Verify token
      const payload = verifyAccessToken(token);

      // Attach user to request
      req.user = payload;

      // Call handler
      return handler(req);
    } catch (error) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Token inválido ou expirado" },
        { status: 401 },
      );
    }
  };
}

/**
 * Middleware to check user role
 */
export function authorize(...allowedRoles: string[]) {
  return (handler: (req: AuthenticatedRequest) => Promise<NextResponse>) => {
    return authenticate(async (req: AuthenticatedRequest) => {
      if (!req.user) {
        return NextResponse.json(
          { error: "Unauthorized", message: "Usuário não autenticado" },
          { status: 401 },
        );
      }

      if (!allowedRoles.includes(req.user.role)) {
        return NextResponse.json(
          { error: "Forbidden", message: "Acesso negado" },
          { status: 403 },
        );
      }

      return handler(req);
    });
  };
}

/**
 * Helper to get authenticated user from request
 */
export function getAuthUser(req: AuthenticatedRequest): TokenPayload {
  if (!req.user) {
    throw new Error("User not authenticated");
  }
  return req.user;
}
