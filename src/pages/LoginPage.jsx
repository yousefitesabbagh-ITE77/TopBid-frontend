import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import useAuth from "../hooks/useAuth";

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectTo = location.state?.from || "/";

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      await login(formData);
      navigate(redirectTo, { replace: true });
    } catch (error) {
      setErrorMessage(error.message || "فشل تسجيل الدخول");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="auth-page">
      <div className="auth-card">
        <h2>تسجيل الدخول</h2>
        <p className="auth-subtitle">
          أدخل بياناتك للوصول إلى حسابك والمشاركة في المزادات.
        </p>

        {errorMessage ? <div className="auth-alert error-alert">{errorMessage}</div> : null}

        <form onSubmit={handleSubmit} className="auth-form">
          <label className="form-field">
            <span>البريد الإلكتروني</span>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="example@email.com"
              required
            />
          </label>

          <label className="form-field">
            <span>كلمة المرور</span>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="أدخل كلمة المرور"
              required
            />
          </label>

          <button type="submit" className="primary-btn auth-submit-btn" disabled={isSubmitting}>
            {isSubmitting ? "جار تسجيل الدخول..." : "تسجيل الدخول"}
          </button>
        </form>

        <p className="auth-footer">
          ليس لديك حساب؟ <Link to="/register">أنشئ حسابًا الآن</Link>
        </p>
      </div>
    </section>
  );
}

export default LoginPage;