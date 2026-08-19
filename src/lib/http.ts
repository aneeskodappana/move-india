import { ZodError, type ZodType } from "zod";
import { AppError } from "@/lib/app-error";

export async function parseJson<T>(request: Request, schema: ZodType<T>): Promise<T> {
  try {
    return schema.parse(await request.json());
  } catch (error) {
    if (error instanceof ZodError || error instanceof SyntaxError) {
      throw new AppError("invalid_request", "Check the submitted fields and try again.", 400);
    }
    throw error;
  }
}

export function errorResponse(error: unknown): Response {
  if (error instanceof AppError) {
    return Response.json({ error: { code: error.code, message: error.message } }, { status: error.status });
  }

  return Response.json(
    { error: { code: "internal_error", message: "Something went wrong. Please try again." } },
    { status: 500 },
  );
}
