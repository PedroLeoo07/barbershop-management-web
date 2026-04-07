import { NextResponse } from "next/server";

/**
 * Standard API error class
 */
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public details?: any,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Handle API errors and return appropriate response
 */
export function handleError(error: unknown): NextResponse {
  console.error("[API Error]", error);

  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        error: error.name,
        message: error.message,
        details: error.details,
      },
      { status: error.statusCode },
    );
  }

  if (error instanceof Error) {
    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: error.message,
      },
      { status: 500 },
    );
  }

  return NextResponse.json(
    {
      error: "Internal Server Error",
      message: "Ocorreu um erro desconhecido",
    },
    { status: 500 },
  );
}

/**
 * Success response helper
 */
export function success<T>(data: T, status: number = 200): NextResponse {
  return NextResponse.json(data, { status });
}

/**
 * Created response helper
 */
export function created<T>(data: T): NextResponse {
  return NextResponse.json(data, { status: 201 });
}

/**
 * No content response helper
 */
export function noContent(): NextResponse {
  return new NextResponse(null, { status: 204 });
}

/**
 * Not found error
 */
export function notFound(
  message: string = "Recurso não encontrado",
): NextResponse {
  return NextResponse.json({ error: "Not Found", message }, { status: 404 });
}

/**
 * Bad request error
 */
export function badRequest(message: string, details?: any): NextResponse {
  return NextResponse.json(
    { error: "Bad Request", message, details },
    { status: 400 },
  );
}

/**
 * Unauthorized error
 */
export function unauthorized(message: string = "Não autorizado"): NextResponse {
  return NextResponse.json({ error: "Unauthorized", message }, { status: 401 });
}

/**
 * Forbidden error
 */
export function forbidden(message: string = "Acesso negado"): NextResponse {
  return NextResponse.json({ error: "Forbidden", message }, { status: 403 });
}

/**
 * Conflict error
 */
export function conflict(message: string, details?: any): NextResponse {
  return NextResponse.json(
    { error: "Conflict", message, details },
    { status: 409 },
  );
}
