import { handleAddCompany } from "@/controllers/company-controller";
import { createRouter } from "@/utils/create";
import { Router } from "express";

export default createRouter((router: Router) => {
    router.post("/addCompany", handleAddCompany);
});
