import type { Request, Response } from "express";
import {
  addExpense,
  getExpensesByRole,
  getManagerExpenses,
  getMyExpense,
  getMyExpenseById,
  reimburseExpense,
  reviewExpense,
} from "../services/expense.service.js";
import type { assert } from "node:console";

export async function createExpenseController(req: Request, res: Response) {
  try {
    const { amount, category, description, expenseDate } = req.body;

    if (amount === undefined || !category || !description || !expenseDate) {
      return res.status(400).json({
        message: "Missing required fields",
      });
    }

    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const expense = await addExpense({
      amount,
      category,
      description,
      expenseDate,
      submittedById: req.user.userId,
    });

    return res.status(201).json({
      message: "Expense created successfully",
      data: expense,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to create expense",
    });
  }
}

export async function getMyExpenseController(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }
    const expense = await getMyExpense(req.user?.userId);
    return res.status(200).json({
      message: "Get my expenses successfully",
      data: expense,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Failed to get expenses",
    });
  }
}

export async function getMyExpenseByIdController(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const { id } = req.params;

    if (!id || Array.isArray(id)) {
      return res.status(400).json({
        message: "Invalid expense id",
      });
    }

    const expense = await getMyExpenseById(id, req.user.userId);

    return res.status(200).json({
      message: "Get expense successfully",
      data: expense,
    });
  } catch (error) {
    console.error(error);

    if (error instanceof Error && error.message === "Expense not found") {
      return res.status(404).json({
        message: "Expense not found",
      });
    }

    return res.status(500).json({
      message: "Failed to get expense",
    });
  }
}

export async function reviewExpenseController(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const { id } = req.params;

    if (!id || Array.isArray(id)) {
      return res.status(400).json({
        message: "Invalid expense id",
      });
    }

    const { status, comment } = req.body;

    if (status !== "APPROVED" && status !== "REJECTED") {
      return res.status(400).json({
        message: "Status must be APPROVED or REJECTED",
      });
    }
    const result = await reviewExpense({
      expenseId: id,
      managerId: req.user.userId,
      status,
      comment,
    });

    return res.status(200).json({
      message:
        status === "APPROVED"
          ? "Expense approved successfully"
          : "Expense rejected successfully",
      data: result,
    });
  } catch (error) {
    console.error(error);

    if (error instanceof Error) {
      if (error.message === "Expense not found") {
        return res.status(404).json({
          message: error.message,
        });
      }

      if (error.message === "Expense has already been reviewed") {
        return res.status(400).json({
          message: error.message,
        });
      }
    }

    return res.status(500).json({
      message: "Failed to review expense",
    });
  }
}

export async function reimburseExpenseController(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const { id } = req.params;

    if (!id || Array.isArray(id)) {
      return res.status(400).json({
        message: "Invalid expense id",
      });
    }

    const { comment } = req.body;

    const result = await reimburseExpense({
      expenseId: id,
      financeId: req.user.userId,
      comment,
    });

    return res.status(200).json({
      message: "Expense reimbursed successfully",
      data: result,
    });
  } catch (error) {
    console.error(error);

    if (error instanceof Error) {
      if (error.message === "Expense not found") {
        return res.status(404).json({
          message: error.message,
        });
      }

      if (error.message === "Only manager approved expense can be reimbursed") {
        return res.status(400).json({
          message: error.message,
        });
      }
    }

    return res.status(500).json({
      message: "Failed to reimburse expense",
    });
  }
}

export async function getManagerExpensesController(
  req: Request,
  res: Response,
) {
  try {
    const expenses = await getManagerExpenses();

    return res.status(200).json({
      message: "Get manager expenses successfully",
      data: expenses,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to get manager expenses",
    });
  }
}
import { getFinanceExpenses } from "../services/expense.service.js";

export async function getFinanceExpensesController(
  req: Request,
  res: Response,
) {
  try {
    const expenses = await getFinanceExpenses();

    return res.status(200).json({
      message: "Get finance expenses successfully",
      data: expenses,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to get finance expenses",
    });
  }
}
export async function getOtherExpensesController(
  req: Request,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const expenses = await getExpensesByRole(
      req.user.userId,
      req.user.role
    );

    return res.status(200).json({
      message: "Get expenses successfully",
      data: expenses,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to get expenses",
    });
  }
}
