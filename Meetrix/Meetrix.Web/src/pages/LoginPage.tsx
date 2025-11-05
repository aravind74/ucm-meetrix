import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import LoginForm from "../components/LoginForm";
import { useAuth } from "../auth/AuthContext";
import { loginApi } from "../api/login-service";

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await loginApi({ email, password });
      login(res);

      const role = res.role?.trim().toLowerCase();
      if (role === "admin") navigate("/admin");
      else navigate("/rooms");
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
          <h1>Meetrix</h1>
          <p>Smart meeting scheduler</p>
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
