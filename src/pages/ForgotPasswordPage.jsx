import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { requestPasswordReset } from "../lib/auth";

function ForgotPasswordPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setIsSubmitting(true);

    try {
      const response = await requestPasswordReset(email);

      setSuccessMessage(
        response?.message ||
          "إذا كان البريد موجودًا، فسيتم إرسال token إعادة تعيين كلمة المرور."
      );

      navigate("/reset-password", {
        replace: false,
        state: { email },
      });
    } catch (error) {
      setErrorMessage(error.message || "تعذر إرسال طلب إعادة تعيين كلمة المرور.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="auth-page">
      <div className="auth-card">
        <h2>نسيت كلمة المرور؟</h2>
        <p className="auth-subtitle">
          أدخل بريدك الإلكتروني، ثم استخدم الـ token الذي يصلك لإعادة تعيين كلمة المرور.
        </p>

        {errorMessage ? <div className="auth-alert error-alert">{errorMessage}</div> : null}
        {successMessage ? <div className="auth-alert success-alert">{successMessage}</div> : null}

        <form onSubmit={handleSubmit} className="auth-form">
          <label className="form-field">
            <span>البريد الإلكتروني</span>
            <input
              type="email"
              name="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="example@email.com"
              required
            />
          </label>

          <button
            type="submit"
            className="primary-btn auth-submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? "جارٍ الإرسال..." : "إرسال طلب إعادة التعيين"}
          </button>
        </form>

        <div className="reset-help-box">
          <p>
            في بيئة التطوير المحلية قد لا يصلك البريد فعليًا. وقتها خذ الـ token
            من الرسالة المرسلة عبر mail log أو من آلية الإرسال المحلية عندكم،
            ثم أدخله في صفحة إعادة التعيين.
          </p>
        </div>

        <div className="welcome-actions">
          <Link to="/login" className="ghost-btn topbar-link-btn">
            العودة إلى تسجيل الدخول
          </Link>
        </div>
      </div>
    </section>
  );
}

export default ForgotPasswordPage;