import {
  ExpenseStatus,
  Role,
  ApprovalStatus,
} from "../generated/prisma/enums.js";
import prisma from "../lib/prisma.js";

interface ExpenseInput {
  amount: number;
  category: string;
  description: string;
  expenseDate: string;
  submittedById: string;
}

export async function addExpense(input: ExpenseInput) {
  const expense = await prisma.expense.create({
    data: {
      amount: input.amount,
      category: input.category,
      description: input.description,
      expenseDate: new Date(input.expenseDate),
      submittedById: input.submittedById,
    },
  });
  console.log("Expense created: " + expense);
  return expense;
}

export async function getMyExpense(userId: string) {
  const expense = await prisma.expense.findMany({
    where: {
      submittedById: userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return expense;
}

export async function getMyExpenseById(expenseId: string, userId: string) {
  const expense = await prisma.expense.findFirst({
    where: {
      id: expenseId,
      submittedById: userId,
    },
  });
  if (!expense) {
    throw new Error("Expense not found");
  }
  return expense;
}

interface ReviewExpenseInput {
  expenseId: string;
  managerId: string;
  status: "APPROVED" | "REJECTED";
  comment?: string;
}

export async function reviewExpense(input: ReviewExpenseInput) {
  const expense = await prisma.expense.findUnique({
    where: {
      id: input.expenseId,
    },
  });

  if (!expense) {
    throw new Error("Expense not found");
  }

  if (expense.status !== "SUBMITTED") {
    throw new Error("Expense has already been reviewed");
  }

  const expenseStatus =
    input.status === "APPROVED" ? "MANAGER_APPROVED" : "REJECTED";
  const approval = await prisma.approval.create({
    data: {
      expenseId: expense.id,
      approverId: input.managerId,
      role: "MANAGER",
      status: input.status,
      comment: input.comment ?? null,
    },
  });

  const updatedExpense = await prisma.expense.update({
    where: {
      id: expense.id,
    },
    data: {
      status: expenseStatus,
    },
  });

  return {
    expense: updatedExpense,
    approval,
  };
}

interface ReimburseExpenseInput {
  expenseId: string;
  financeId: string;
  comment?: string;
}

export async function reimburseExpense(input: ReimburseExpenseInput) {
  const expense = await prisma.expense.findUnique({
    where: {
      id: input.expenseId,
    },
  });

  if (!expense) {
    throw new Error("Expense not found");
  }

  if (expense.status !== "MANAGER_APPROVED") {
    throw new Error("Only manager approved expense can be reimbursed");
  }

  const approval = await prisma.approval.create({
    data: {
      expenseId: expense.id,
      approverId: input.financeId,
      role: "FINANCE",
      status: "APPROVED",
      comment: input.comment ?? null,
    },
  });

  const updatedExpense = await prisma.expense.update({
    where: {
      id: expense.id,
    },
    data: {
      status: "REIMBURSED",
    },
  });

  return {
    expense: updatedExpense,
    approval,
  };
}

export async function getManagerExpenses() {
  return prisma.expense.findMany({
    where: {
      status: "SUBMITTED",
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}
export async function getFinanceExpenses() {
  return prisma.expense.findMany({
    where: {
      status: "MANAGER_APPROVED",
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}
export async function getExpensesByRole(
  userId: string,
  role: "EMPLOYEE" | "MANAGER" | "FINANCE",
) {
  if (role === "EMPLOYEE") {
    return prisma.expense.findMany({
      where: {
        submittedById: userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  if (role === "MANAGER") {
    return prisma.expense.findMany({
      where: {
        submittedBy: {
          role: {
            in: ["EMPLOYEE", "MANAGER"],
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  return prisma.expense.findMany({
    where: {
      submittedBy: {
        role: {
          in: ["EMPLOYEE", "MANAGER", "FINANCE"],
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}
