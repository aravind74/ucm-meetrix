import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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
      navigate("/rooms");
    } catch (err: any) {
      if (err.response?.status === 401) setError("Invalid credentials");
      else setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "50px auto" }}>
      <h1>Meetrix Login</h1>
      <LoginForm onSubmit={handleLogin} loading={loading} error={error} />
    </div>
  );
};

export default LoginPage;
