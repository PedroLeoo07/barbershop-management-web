import { z } from "zod";
import { NextResponse } from "next/server";

/**
 * Validate request body against Zod schema
 */
export async function validateBody<T>(
  request: Request,
  schema: z.ZodSchema<T>,
): Promise<{ data: T; error?: never } | { data?: never; error: NextResponse }> {
  try {
    const body = await request.json();
    const data = schema.parse(body);
    return { data };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        error: NextResponse.json(
          {
            error: "Validation Error",
            message: "Dados inválidos",
            details: error.errors.map((err) => ({
              field: err.path.join("."),
              message: err.message,
            })),
          },
          { status: 400 },
        ),
      };
    }

    return {
      error: NextResponse.json(
        { error: "Bad Request", message: "Corpo da requisição inválido" },
        { status: 400 },
      ),
    };
  }
}

/**
 * Validate query parameters against Zod schema
 */
export function validateQuery<T>(
  searchParams: URLSearchParams,
  schema: z.ZodSchema<T>,
): { data: T; error?: never } | { data?: never; error: NextResponse } {
  try {
    const params = Object.fromEntries(searchParams.entries());
    const data = schema.parse(params);
    return { data };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        error: NextResponse.json(
          {
            error: "Validation Error",
            message: "Parâmetros inválidos",
            details: error.errors.map((err) => ({
              field: err.path.join("."),
              message: err.message,
            })),
          },
          { status: 400 },
        ),
      };
    }

    return {
      error: NextResponse.json(
        { error: "Bad Request", message: "Parâmetros inválidos" },
        { status: 400 },
      ),
    };
  }
}
