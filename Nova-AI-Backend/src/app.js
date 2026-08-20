import express from "express";
import { corsMiddleware } from "./middleware/cors.js";
import routes from "./routes/index.js";

const app = express();

app.use(corsMiddleware);
app.use(express.json());
app.use(routes);

export default app;
