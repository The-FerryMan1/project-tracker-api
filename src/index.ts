import { Hono } from "hono";
import { registerRoute } from "./routes/register";
import { logger } from "hono/logger";

const app = new Hono().basePath("/api/v1/");

app.use(logger());

app.route("/register", registerRoute);

export default app;
