import {
    handleAddCompany,
    handleAddEmployee,
    handleCompanyChangePassword,
    handleCompanyLogin,
    handleUpdateCompanyData,
    handleVerifyCompany,
} from "@/controllers/company-controller";
import { authenticate } from "@/middlewares/auth";
import { createRouter } from "@/utils/create";
import { Router } from "express";

export default createRouter((router: Router) => {
    router.post("/addCompany", handleAddCompany);
    router.get("/verify", handleVerifyCompany);
    router.post("/login", handleCompanyLogin);
    router.put("/changePassword", authenticate("company"), handleCompanyChangePassword);
    router.put("/updateCompanyData", authenticate("company"), handleUpdateCompanyData);
    router.post("/addEmployee", authenticate("company"), handleAddEmployee);
});
