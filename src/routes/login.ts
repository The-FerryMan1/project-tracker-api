import { Hono } from "hono";
import { validator } from "hono/validator";
import z from "zod";
import { db } from "../utils/database";
import { userTable } from "../database/schema";
import { eq } from "drizzle-orm";
import { sign } from "hono/jwt";
import { setSignedCookie } from "hono/cookie";

const schema = z.object({
  username: z.string().nonempty(),
  password: z.string().min(8),
});

const app = new Hono();
const database = db();
app.post(
  "/",
  validator("json", (value, c) => {
    const parsed = schema.safeParse(value);
    if (!parsed.success)
      return c.json({ message: z.prettifyError(parsed.error) });
    return parsed.data;
  }),
  async (c) => {
    const { password: passwordRaw, username: usernameRaw } =
      c.req.valid("json");

    try {
      const [user] = await database
        .select()
        .from(userTable)
        .where(eq(userTable.username, usernameRaw));
      if (!user) return c.json({ message: "Invalid Credentials" }, 401);

      const { password, username, id } = user;

      const matchedPassword = await Bun.password.verify(passwordRaw, password);
      if (!matchedPassword) return c.json({ message: "Invalid Credentials" });

      const access_token = {
        id,
        username,
        exp: Math.floor(Date.now() / 1000) + 60 * 5,
      };

      const refresh_token = {
        id,
        exp: Math.floor(Date.now() / 1000) + 604800,
      };

      const accessToken = await sign(
        access_token,
        Bun.env.ACCESS_TOKEN_SECRET!,
      );
      const refreshToken = await sign(
        refresh_token,
        Bun.env.REFRESH_TOKEN_SECRET!,
      );

      await setSignedCookie(
        c,
        "access_token",
        accessToken,
        Bun.env.COOKIE_TOKEN_SECRET!,
        {
          path: "/",
          secure: true,
          httpOnly: true,
          maxAge: 1000,
          expires: new Date(Date.now() + 86400000),
          sameSite: "lax",
        },
      );
      await setSignedCookie(
        c,
        "refresh_token",
        refreshToken,
        Bun.env.COOKIE_TOKEN_SECRET!,
        {
          path: "/",
          secure: true,
          httpOnly: true,
          maxAge: 1000,
          expires: new Date(Date.now() + 864000000),
          sameSite: "lax",
        },
      );

      return c.json({ message: "You have logged in successfully" }, 200);
    } catch (error) {
      return c.json({ message: "internal service error!" }, 500);
    }
  },
);

export { app as loginRoute };
