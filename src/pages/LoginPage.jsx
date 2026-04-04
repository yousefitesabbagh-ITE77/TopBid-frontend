import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import useAuth from "../hooks/useAuth";
import { AUTH_NOTICE_KEY } from "../lib/api";

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectTo = location.state?.from || "/home";

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [noticeMessage, setNoticeMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const savedNotice = sessionStorage.getItem(AUTH_NOTICE_KEY);

    if (savedNotice) {
      setNoticeMessage(savedNotice);
      sessionStorage.removeItem(AUTH_NOTICE_KEY);
    }
  }, []);

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
    setNoticeMessage("");
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

  function handleEnterAsVisitor() {
    navigate("/home");
  }

  return (
    <section className="auth-page">
      <div className="auth-card">
        <h2>تسجيل الدخول</h2>
        <p className="auth-subtitle">
          أدخل بياناتك للوصول إلى حسابك والمشاركة في المزادات.
        </p>

        {noticeMessage ? <div className="auth-alert info-alert">{noticeMessage}</div> : null}
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

          <div className="auth-inline-row">
            <Link to="/forgot-password" className="auth-text-link">
              نسيت كلمة المرور؟
            </Link>
          </div>

          <button type="submit" className="primary-btn auth-submit-btn" disabled={isSubmitting}>
            {isSubmitting ? "جار تسجيل الدخول..." : "تسجيل الدخول"}
          </button>
        </form>

        <button
          type="button"
          className="ghost-btn auth-secondary-btn"
          onClick={handleEnterAsVisitor}
        >
          الدخول كزائر
        </button>

        <p className="auth-footer">
          ليس لديك حساب؟ <Link to="/register">أنشئ حسابًا الآن</Link>
        </p>
      </div>
    </section>
  );
}

export default LoginPage;