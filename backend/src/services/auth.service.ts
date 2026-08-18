import bcrypt from "bcrypt";
import jwt, { type SignOptions } from "jsonwebtoken";
import prisma from "../lib/prisma.js";

//register
interface RegisterInput {
  name: string;
  email: string;
  password: string;
  role: "EMPLOYEE" | "MANAGER" | "FINANCE";
}
export async function registerUser(input: RegisterInput) {
  const { name, email, password, role } = input;
  const existingUser = await prisma.user.findUnique({
    where: {
      email,
    },
  });
  console.log("EXISTING USER:", existingUser);
  if (existingUser !== null) {
    throw new Error("Email already exists");
  }
  const hashedPass = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPass,
      role,
    },
  });
  console.log("USER CREATED:", user);
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    password: user.password,
    role: user.role,
  };
}

//login
interface LoginInput {
  email: string;
  password: string;
}
export async function LoginUser(input: LoginInput) {
  const { email, password } = input;
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });
  console.log("LOGIN EMAIL:", email);
  console.log("LOGIN USER:", user);
  if (!user) {
    throw new Error("Invalid user");
  }
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error("Invalid email or password");
  }
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }

  const token = jwt.sign(
    {
      userId: user.id,
      role: user.role,
    },
    secret,
    {
      expiresIn: "1d",
    },
  );
  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
}
