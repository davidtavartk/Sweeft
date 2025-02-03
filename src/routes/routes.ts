import type { Router } from "express";
import { createRouter } from "@/utils/create";
import companyRoutes from "./company-routes";
import employeeRoutes from "./employee-routes";

export default createRouter((router: Router) => {
    router.use("/company", companyRoutes);
    router.use("/employee", employeeRoutes);
});