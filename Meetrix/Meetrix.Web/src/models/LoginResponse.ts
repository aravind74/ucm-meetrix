export interface LoginResponse {
    token: string;
    userId: number;
    email: string;
    fullName: string;
    role: string;
    isDifferentlyAbled: boolean | null;
}