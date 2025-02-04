import {
    changePasswordSchema,
    companyLoginSchema,
    CompanyTable,
    newCompanySchema,
    updateCompanyDataSchema,
    updateCompanySubscriptionSchema,
    verifyCompanySchema,
} from '@/schema/company';
import { createHandler } from '@/utils/create';
import { addCompany, addEmployee, updateCompanyData } from '@/services/company-services';
import { deleteEntity, getEntityByEmail, getEntityById, updatePassword, verifyEntity } from '@/services/entity-services';
import { updateRefreshToken } from '@/services/token-services';
import { BackendError, getStatusFromErrorCode } from '@/utils/errors';
import { sendVerificationEmail } from '@/utils/email';
import env from '@/env';
import consola from 'consola';
import { generateTokens } from '@/utils/jwt';
import { compareToHash } from '@/utils/hash';
import { deleteEmployeeSchema, EmployeeTable, newEmployeeSchema } from '@/schema/employee';
import { SubscriptionTable } from '@/schema/subscription';
import { setOrUpdateCompanySubscription } from '@/services/subscription-services';

export const handleAddCompany = createHandler(newCompanySchema, async (req, res) => {
    try {
        const company = req.body;

        const existingCompany = await getEntityByEmail(CompanyTable, company.email);

        if (existingCompany) {
            throw new BackendError('CONFLICT', {
                message: 'Company with this email already exists',
            });
        }

        const { company: addedCompany, code } = await addCompany(company);

        const success = await sendVerificationEmail(env.API_BASE_URL, addedCompany.email, code, 'company');

        if (!success) {
            await deleteEntity(CompanyTable, addedCompany.email);
            throw new BackendError('INTERNAL_ERROR', {
                message: 'Failed to register company',
            });
        }

        res.status(201).json(addedCompany);
    } catch (error) {
        if (error instanceof BackendError) {
            res.status(getStatusFromErrorCode(error.code)).json({
                code: error.code,
                message: error.message,
                details: error.details,
            });
            return;
        }
        throw error;
    }
});

export const handleVerifyCompany = createHandler(verifyCompanySchema, async (req, res) => {
    try {
        const { email, code } = req.query;

        await verifyEntity('company', email, code);
        consola.success('Company verified successfully');
        res.status(200).json({ message: 'Company verified successfully' });
    } catch (err) {
        if (err instanceof BackendError) {
            res.status(getStatusFromErrorCode(err.code)).json({
                code: err.code,
                message: err.message,
                details: err.details,
            });
            return;
        }
        throw err;
    }
});

export const handleCompanyLogin = createHandler(companyLoginSchema, async (req, res) => {
    try {
        const { email, password } = req.body;
        const company = await getEntityByEmail(CompanyTable, email);

        if (!company) throw new BackendError('USER_NOT_FOUND');

        const matchPassword = await compareToHash(password, company.password);
        if (!matchPassword) throw new BackendError('INVALID_PASSWORD');

        const { accessToken, refreshToken } = generateTokens(company.id);

        await updateRefreshToken(CompanyTable, company.id, refreshToken);

        consola.success('Company logged in successfully');
        res.status(200).json({
            accessToken,
            refreshToken,
            company: {
                id: company.id,
                name: company.name || '',
                email: company.email,
                country: company.country || '',
                industry: company.industry || '',
                isVerified: company.isVerified,
            },
        });
    } catch (err) {
        if (err instanceof BackendError) {
            res.status(getStatusFromErrorCode(err.code)).json({
                code: err.code,
                message: err.message,
                details: err.details,
            });
            return;
        }
        throw err;
    }
});

export const handleCompanyChangePassword = createHandler(changePasswordSchema, async (req, res) => {
    try {
        const { email, password, newPassword } = req.body;

        const updatedCompany = await updatePassword(CompanyTable, email, password, newPassword);

        consola.success('Password updated successfully');
        res.status(200).json({ message: 'Password updated successfully', company: updatedCompany });
    } catch (err) {
        if (err instanceof BackendError) {
            res.status(getStatusFromErrorCode(err.code)).json({
                code: err.code,
                message: err.message,
                details: err.details,
            });
            return;
        }
        throw err;
    }
});

export const handleUpdateCompanyData = createHandler(updateCompanyDataSchema, async (req, res) => {
    try {
        const { email } = req.body;
        const updatedData = req.body;

        const company = await getEntityByEmail(CompanyTable, email);

        if (!company) {
            throw new BackendError('USER_NOT_FOUND', { message: 'Company not found' });
        }

        const updatedCompany = await updateCompanyData(company, email, updatedData);

        consola.success('Company data updated successfully:', updatedData);
        res.status(200).json({
            message: 'Company data updated successfully',
            company: updatedCompany,
        });
    } catch (err) {
        if (err instanceof BackendError) {
            res.status(getStatusFromErrorCode(err.code)).json({
                code: err.code,
                message: err.message,
                details: err.details,
            });
            return;
        }
        throw err;
    }
});

export const handleAddEmployee = createHandler(newEmployeeSchema, async (req, res) => {
    try {
        const employee = req.body;
        const companyId = res.locals.user.id;

        const existingEmployee = await getEntityByEmail(EmployeeTable, employee.email);

        if (existingEmployee) {
            throw new BackendError('CONFLICT', {
                message: 'Employee with this email already exists',
            });
        }

        const { employee: addedEmployee, code } = await addEmployee( employee, companyId,);

        const success = await sendVerificationEmail(env.API_BASE_URL, addedEmployee.email, code, 'employee');

        if (!success) {
            await deleteEntity(EmployeeTable, addedEmployee.email);
            throw new BackendError('INTERNAL_ERROR', {
                message: 'Failed to register company',
            });
        }

        res.status(201).json(addedEmployee);
    } catch (error) {
        if (error instanceof BackendError) {
            res.status(getStatusFromErrorCode(error.code)).json({
                code: error.code,
                message: error.message,
                details: error.details,
            });
            return;
        }
        throw error;
    }
});

export const handleDeleteEmployee = createHandler(deleteEmployeeSchema, async (req, res) => { 

    try {
        const { email } = req.params;
        const companyId = res.locals.user.id;

        const employee = await getEntityByEmail(EmployeeTable, email);

        if (!employee) {
            throw new BackendError('USER_NOT_FOUND', { message: 'Employee not found' });
        }

        if (employee.companyId !== companyId) {
            res.status(403).json({ message: 'Unauthorized to delete this employee' });
        }

        const deletedEmployee = await deleteEntity(EmployeeTable, email);
        consola.success(`Employee with email: ${email} was deleted successfully`);

        res.status(200).json({ message: 'Employee deleted successfully', employee: deletedEmployee });
    } catch (error) {
        if (error instanceof BackendError) {
            res.status(getStatusFromErrorCode(error.code)).json({
                code: error.code,
                message: error.message,
                details: error.details,
            });
        }
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


export const handleUpdateSubscriptionPlan = createHandler(updateCompanySubscriptionSchema, async (req, res) => {
    try {
      const { subscriptionId } = req.body;
      const company = res.locals.user;

      const subscription = await getEntityById(SubscriptionTable, subscriptionId);
      
      if (!subscription) {
        throw new BackendError('NOT_FOUND', { message: 'Invalid subscription plan' });
      }

      if(company.subscriptionId === subscriptionId) {
        consola.info('Company is already subscribed to this plan');
        res.status(400).json({ message: 'Company is already subscribed to this plan' });
      }
      
      const updatedSubscription = await setOrUpdateCompanySubscription(company.id, subscriptionId);

      consola.success('Subscription plan updated successfully:', updatedSubscription);

      res.status(200).json({
          message: 'Subscription plan updated successfully',
          company: updatedSubscription,
      });
  
    } catch (error) {
      if (error instanceof BackendError) {
        res.status(getStatusFromErrorCode(error.code)).json({
          code: error.code,
          message: error.message,
          details: error.details,
        });
        return;
      }
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });