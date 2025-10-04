import { Hono } from "hono";
import { validator } from "hono/validator";
import z from "zod";
import { db } from "../utils/database";
import { userTable } from "../database/schema";
import { eq } from "drizzle-orm";

const app = new Hono();
const database = db();
const schema = z
  .object({
    username: z
      .string()
      .max(255, "Letter must not exceed the 255-character limit")
      .nonempty()
      .trim(),
    password: z.string().min(8, "The password must have 8 characters"),
    confirm: z.string().min(8, "The password must have 8 characters"),
  })
  .refine((data) => data.password === data.confirm, {
    message: "Password don't match",
    path: ["confirm"],
  });

app.post(
  "/",
  validator("json", (value, c) => {
    const parsed = schema.safeParse(value);
    if (!parsed.success)
      return c.json({ message: z.prettifyError(parsed.error) }, 400);
    return parsed.data;
  }),
  async (c) => {
    const { password, username } = c.req.valid("json");
    try {
      const isUsernameExists = await database.$count(
        userTable,
        eq(userTable.username, username),
      );
      if (isUsernameExists)
        return c.json({ message: "Username is already taken" }, 400);

      const hashPassword = await Bun.password.hash(password);

      await database
        .insert(userTable)
        .values({ username, password: hashPassword });

      return c.json({ message: "Account created!" }, 200);
    } catch (error) {
      return c.json({ message: "Internal service error" }, 500);
    }
  },
);

export { app as registerRoute };
