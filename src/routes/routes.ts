import type { Router } from "express";
import { createRouter } from "@/utils/create";
import companyRoutes from "./company-routes";

export default createRouter((router: Router) => {
    router.use("/company", companyRoutes);
});
