import { Router } from "express";
import { db } from "@/configs/db";
import { createRouter } from "@/utils/create";

const router = Router();

export default createRouter((router: Router) => {
    router.get("/test-db", async (req, res) => {
      try {
        await db.execute("SELECT 1");
        res.json({ success: true, message: "Database connected successfully!" });
      } catch (error) {
        console.error("DB connection error:", error);
        res.status(500).json({ success: false, error: "Error occured here" });
      }
    });
  });