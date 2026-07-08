import { z } from "zod";

const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Name must be at least 3 characters.")
    .max(50, "Name cannot exceed 50 characters."),

  email: z
    .string()
    .trim()
    .email("Please provide a valid email address."),

  subject: z
    .string()
    .trim()
    .min(5, "Subject must be at least 5 characters.")
    .max(100, "Subject cannot exceed 100 characters."),

  message: z
    .string()
    .trim()
    .min(20, "Message must contain at least 20 characters.")
    .max(500, "Message cannot exceed 500 characters."),
});

export default contactSchema;