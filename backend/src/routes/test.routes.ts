import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";

const router = Router();

router.get("/test-auth", authenticate, (req, res) => {
  return res.status(200).json({
    message: "Authentication successful",
    user: req.user,
  });
});
router.get("/test-finance", authenticate, authorize("FINANCE"), (req, res) => {
  res.json({
    message: "You are Finance",
    user: req.user,
  });
});

export default router;
