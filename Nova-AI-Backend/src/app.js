import express from "express";
import { corsMiddleware } from "./middleware/cors.js";
import routes from "./routes/index.js";

const app = express();

app.use(corsMiddleware);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(routes);

export default app;
