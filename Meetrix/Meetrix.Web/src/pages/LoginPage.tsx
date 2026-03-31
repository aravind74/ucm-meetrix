import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import LoginForm from "../components/LoginForm";
import { useAuth } from "../auth/AuthContext";
import { loginApi } from "../api/login-service";
import logo from "../assets/logo.png";

type LocationState = {
  from?: {
    pathname?: string;
    search?: string;
  };
};

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const state = location.state as LocationState | null;
  const redirectTo = state?.from
    ? `${state.from.pathname ?? ""}${state.from.search ?? ""}`
    : null;

  const handleLogin = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const res = await loginApi({ email, password });
      login(res);

      if (redirectTo) {
        navigate(redirectTo, { replace: true });
        return;
      }

      const role = res.role?.trim().toLowerCase();
      if (role === "admin") navigate("/admin/dashboard", { replace: true });
      else navigate("/rooms", { replace: true });
    } catch (err: any) {
      if (err.response?.status === 401) setError("Invalid credentials");
      else setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-card-header">
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
              marginBottom: 20,
            }}
          >
            <img
              src={logo}
              alt="Meetrix logo"
              style={{
                width: 110,
                height: "auto",
                objectFit: "contain",
                userSelect: "none",
              }}
            />
            <h1
              style={{
                margin: 0,
                fontSize: 22,
                fontWeight: 700,
                color: "#08185c",
              }}
            >
              Welcome to Meetrix
            </h1>
          </div>
        </div>

        <LoginForm onSubmit={handleLogin} loading={loading} error={error} />

        <div
          style={{
            marginTop: 12,
            fontSize: 13,
            textAlign: "center",
            color: "#6b7280",
          }}
        >
          Don&apos;t have an account?{" "}
          <Link to="/register" style={{ color: "#2563eb" }}>
            Register
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;