import {object, z} from "zod";

export const userNameValidation=z
.string()
.min(2,"username should be atleast 2 character length")
.max(20,"username should not be greater than 20 characters")
.regex(/^[a-zA-Z0-9_]+$/,"username should not have any special characters")

export const signUpSchema = z.object({
  username: userNameValidation,
  email: z.string().email({ message: "Invalid email" }),
  password: z
    .string()
    .min(6, { message: "password should of minimum of 6 characeters length" }),
});