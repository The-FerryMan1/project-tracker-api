import { Hono } from "hono";
import { registerRoute } from "./routes/register";
import { logger } from "hono/logger";
import { loginRoute } from "./routes/login";

const app = new Hono().basePath("/api/v1/");

app.use(logger());

app.route("/register", registerRoute);
app.route("/login", loginRoute);
export default app;
