import React, { useState } from "react";

interface RegisterFormProps {
  onSubmit: (data: {
    firstName: string;
    lastName?: string;
    email: string;
    password: string;
    isDifferentlyAbled: boolean;
  }) => void;
  loading?: boolean;
  error?: string | null;
}

const RegisterForm: React.FC<RegisterFormProps> = ({
  onSubmit,
  loading,
  error,
}) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState<string>("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isDifferentlyAbled, setIsDifferentlyAbled] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setLocalError("Passwords do not match");
      return;
    }
    setLocalError(null);

    onSubmit({
      firstName,
      lastName,
      email,
      password,
      isDifferentlyAbled,
    });
  };

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <div className="form-field">
        <label>First name</label>
        <input
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
        />
      </div>

      <div className="form-field">
        <label>Last name (optional)</label>
        <input
          type="text"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />
      </div>

      <div className="form-field">
        <label>Email</label>
        <input
          type="email"
          value={email}
          autoComplete="email"
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="form-field">
        <label>Password</label>
        <input
          type="password"
          value={password}
          autoComplete="new-password"
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      <div className="form-field">
        <label>Confirm password</label>
        <input
          type="password"
          value={confirmPassword}
          autoComplete="new-password"
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
      </div>

      <div className="form-field" style={{ flexDirection: "row", gap: 8 }}>
        <input
          id="isDifferentlyAbled"
          type="checkbox"
          checked={isDifferentlyAbled}
          onChange={(e) => setIsDifferentlyAbled(e.target.checked)}
        />
        <label htmlFor="isDifferentlyAbled" style={{ margin: 0 }}>
          I need accessible rooms
        </label>
      </div>

      {localError && <div className="form-error">{localError}</div>}
      {error && <div className="form-error">{error}</div>}

      <button
        type="submit"
        disabled={loading}
        className="login-button"
        style={{ marginTop: 10 }}
      >
        {loading ? "Creating account..." : "Register"}
      </button>
    </form>
  );
};

export default RegisterForm;
