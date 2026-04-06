import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { resetPasswordWithToken } from "../lib/auth";

function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const initialEmail = location.state?.email || "";

  const [formData, setFormData] = useState({
    email: initialEmail,
    token: "",
    password: "",
    password_confirmation: "",
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
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
    setSuccessMessage("");
    setIsSubmitting(true);

    try {
      const response = await resetPasswordWithToken(formData);

      setSuccessMessage(
        response?.message || "تمت إعادة تعيين كلمة المرور بنجاح."
      );

      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 1200);
    } catch (error) {
      setErrorMessage(error.message || "تعذر إعادة تعيين كلمة المرور.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="auth-page">
      <div className="auth-card">
        <h2>إعادة تعيين كلمة المرور</h2>
        <p className="auth-subtitle">
          أدخل البريد الإلكتروني، والـ token الذي وصلك، ثم اختر كلمة مرور جديدة.
        </p>

        {errorMessage ? <div className="auth-alert error-alert">{errorMessage}</div> : null}
        {successMessage ? <div className="auth-alert success-alert">{successMessage}</div> : null}

        <form onSubmit={handleSubmit} className="auth-form">
          <label className="form-field">
            <span>البريد الإلكتروني</span>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </label>

          <label className="form-field">
            <span>Reset Token</span>
            <input
              type="text"
              name="token"
              value={formData.token}
              onChange={handleChange}
              placeholder="ألصق الـ token هنا"
              required
            />
          </label>

          <label className="form-field">
            <span>كلمة المرور الجديدة</span>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="أدخل كلمة المرور الجديدة"
              required
            />
          </label>

          <label className="form-field">
            <span>تأكيد كلمة المرور الجديدة</span>
            <input
              type="password"
              name="password_confirmation"
              value={formData.password_confirmation}
              onChange={handleChange}
              placeholder="أعد إدخال كلمة المرور الجديدة"
              required
            />
          </label>

          <button
            type="submit"
            className="primary-btn auth-submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? "جارٍ الحفظ..." : "حفظ كلمة المرور الجديدة"}
          </button>
        </form>

        <div className="welcome-actions">
          <Link to="/login" className="ghost-btn topbar-link-btn">
            العودة إلى تسجيل الدخول
          </Link>
        </div>
      </div>
    </section>
  );
}

export default ResetPasswordPage;