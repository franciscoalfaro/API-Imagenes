import { z } from "zod";

export const createImageSchema = z.object({
  name: z
    .string({ required_error: "Nombre es requerido" })
    .min(4, { message: "El nombre debe tener al menos 4 caracteres" })
    .refine((data) => data.trim() !== "", {
      message: "El nombre no puede estar vacío",
    }),
  path: z
    .string({ required_error: "Path es requerido" })
    .refine((data) => data.trim() !== "", {
      message: "El path no puede estar vacío",
    }),
  public: z.boolean().default(true),
  galleryId: z.string().optional(),
});

export const updateImageSchema = z.object({
  name: z
    .string()
    .optional()
    .refine(
      (data) =>
        data === undefined || (data.trim() !== "" && data.trim().length >= 4),
      {
        message:
          "El nombre no puede estar vacío, ni puede tener menos de 4 caracteres",
      }
    ),
  public: z.boolean().default(true),
  galleryIds: z.array(z.string()).optional(),
});
