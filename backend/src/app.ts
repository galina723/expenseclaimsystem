import express from "express";
import cors from "cors";
import authRoute from "./routes/auth.route.js";
import testRoutes from "./routes/test.routes.js";
import expenseRoute from "./routes/expense.route.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    message: "Expense Claim API is running 🚀",
  });
});

app.use("/api/auth", authRoute);
app.use("/api", testRoutes);
app.use("/api/expense", expenseRoute);

export default app;
