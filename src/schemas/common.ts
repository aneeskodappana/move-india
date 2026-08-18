import { z } from "zod";

export const uuidSchema = z.string().uuid();
export const isoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD.");
export const monthSchema = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Use YYYY-MM.");
export const syntheticPhoneSchema = z
  .string()
  .regex(/^\+91-00000-\d{5}$/, "Use a synthetic demo number such as +91-00000-00001.");
export const mockQrIdSchema = z
  .string()
  .regex(/^VN-EKM-\d{2}-\d{4}$/, "Use the independent prototype QR format VN-EKM-00-0000.");
export const timestampSchema = z.coerce.date();
