import type { LoginRequest } from "../models/LoginRequest";
import type { LoginResponse } from "../models/LoginResponse";
import type { RegisterRequest } from "../models/RegisterRequest";
import api from "./client";

export async function loginApi(request: LoginRequest): Promise<LoginResponse> {
    const res = await api.post<LoginResponse>("/auth/login", request);
    return res.data;
}

export async function registerApi(req: RegisterRequest): Promise<number> {
    // expects backend to return { userId: number }
    const res = await api.post<{ userId: number }>("/auth/register", req);
    return res.data.userId;
}