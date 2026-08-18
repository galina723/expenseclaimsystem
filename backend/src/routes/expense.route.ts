import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import {
  createExpenseController,
  getFinanceExpensesController,
  getManagerExpensesController,
  getMyExpenseByIdController,
  getMyExpenseController,
  getOtherExpensesController,
  reimburseExpenseController,
  reviewExpenseController,
} from "../controllers/expense.controller.js";
import { authorize } from "../middlewares/role.middleware.js";

const router = Router();

router.post("/create-expense", authenticate, createExpenseController);
router.get("/my-expense", authenticate, getMyExpenseController);
router.get("/my-expense/:id", authenticate, getMyExpenseByIdController);
router.post(
  "/review-expense/:id",
  authenticate,
  authorize("MANAGER"),
  reviewExpenseController,
);
router.post(
  "/reimburse-expense/:id",
  authenticate,
  authorize("FINANCE"),
  reimburseExpenseController,
);
router.get(
  "/manager-expenses",
  authenticate,
  authorize("MANAGER"),
  getManagerExpensesController,
);
router.get(
  "/finance-expenses",
  authenticate,
  authorize("FINANCE"),
  getFinanceExpensesController,
);
router.get(
  "/other-expense",
  authenticate,
  getOtherExpensesController,
);
export default router;
