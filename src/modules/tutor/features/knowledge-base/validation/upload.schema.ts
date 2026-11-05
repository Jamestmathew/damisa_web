import { z } from "zod";

export function buildUploadSchema(allowedTypes: string[], maxSizeMb: number) {
  return z.object({
    courseId: z.string().min(1),
    fileName: z.string().min(1, "File name is required"),
    fileType: z
      .string()
      .refine((type) => allowedTypes.includes(type.toLowerCase()), {
        message: `File type must be one of: ${allowedTypes.join(", ")}`,
      }),
    fileSizeMb: z.coerce
      .number<number>()
      .positive("File size must be greater than zero")
      .max(maxSizeMb, `File must be smaller than ${maxSizeMb}MB`),
  });
}

export type UploadDocumentSchema = z.infer<
  ReturnType<typeof buildUploadSchema>
>;
