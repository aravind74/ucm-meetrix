import type { LoginRequest } from "../models/LoginRequest";
import type { LoginResponse } from "../models/LoginResponse";
import api from "./client";

export async function loginApi(request: LoginRequest): Promise<LoginResponse> {
    const res = await api.post<LoginResponse>("/auth/login", request);
    return res.data;
  }