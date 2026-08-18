import type { Request, Response } from "express";
import { LoginUser, registerUser } from "../services/auth.service.js";

// register
export async function register(req: Request, res: Response) {
  try {
    const { name, email, password, role } = req.body;

    console.log("BODY:", req.body);

    const user = await registerUser({
      name,
      email,
      password,
      role,
    });

    return res.status(201).json({
      message: "User registered successfully",
      data: user,
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);

    if (error instanceof Error && error.message === "Email already exists") {
      return res.status(409).json({
        message: "Email already exists",
      });
    }

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

//login
export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    const result = await LoginUser({
      email,
      password,
    });

    return res.status(200).json({
      message: "Login successful",
      data: result,
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    if (
      error instanceof Error &&
      error.message === "Invalid email or password"
    ) {
      return res.status(401).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}
