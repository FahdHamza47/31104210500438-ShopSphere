import api from "./api";
import type { User } from "../types";

export const registerUser = async (
  name: string,
  email: string,
  password: string,
): Promise<User> => {
  const { data } = await api.post<User>("/auth/register", {
    name,
    email,
    password,
  });
  return data;
};

export const loginUser = async (
  email: string,
  password: string,
): Promise<User> => {
  const { data } = await api.post<User>("/auth/login", { email, password });
  return data;
};
