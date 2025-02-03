import { handleVerifyEmployee } from "@/controllers/employee-controller";
import { authenticate } from "@/middlewares/auth";
import { createRouter } from "@/utils/create";
import { Router } from "express";

export default createRouter((router: Router) => {
    router.get("/verify", handleVerifyEmployee);
});
