import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import RegisterForm from "../components/RegisterForm";
import { registerApi } from "../api/login-service";

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleRegister = async (data: {
    firstName: string;
    lastName?: string;
    email: string;
    password: string;
    isDifferentlyAbled: boolean;
  }) => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await registerApi({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        isDifferentlyAbled: data.isDifferentlyAbled,
      });

      setSuccessMessage("Account created successfully. Please login.");
      // redirect after a short delay or immediately:
      navigate("/login");
    } catch (err: any) {
      if (err.response?.status === 400) {
        setError(err.response.data ?? "Validation error");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-card-header">
          <h1>Create your Meetrix account</h1>
          <p>Get started with smarter meeting room scheduling</p>
        </div>

        <RegisterForm
          onSubmit={handleRegister}
          loading={loading}
          error={error}
        />

        {successMessage && (
          <div style={{ marginTop: 8, fontSize: 13, color: "#16a34a" }}>
            {successMessage}
          </div>
        )}

        <div
          style={{
            marginTop: 12,
            fontSize: 13,
            textAlign: "center",
            color: "#6b7280",
          }}
        >
          Already have an account?{" "}
          <Link to="/login" style={{ color: "#2563eb" }}>
            Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
