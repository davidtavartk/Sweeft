import express, { type Express } from "express";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import env from "@/env";
import consola from "consola";
import routes from "@/routes/routes";
import { db } from "./configs/db";

dotenv.config();

const app: Express = express();


app.use(express.json());

app.use(
    rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 100,
        handler: (req, res) => {
            consola.warn(`DDoS Attempt from ${req.ip}`);
            res.status(429).json({
                error: "Too many requests in a short time. Please try in a minute.",
            });
        },
    })
);

app.get("/", (req, res) => {
    res.send("Hello, TypeScript + Node.js + Express API! It's working!");
});


app.use("/api", routes);

db
  .execute("SELECT 1")
  .then(() => {
    consola.success("Database connected successfully!");
  })
  .catch((error: unknown) => {
    if (error instanceof Error) {
      consola.error("Database connection failed:", error.message);
    } else {
      consola.error("Database connection failed: Unknown error");
    }
  });

app.listen(env.PORT, () => {
    consola.info(`Server is running on http://localhost:${env.PORT}`);
});
