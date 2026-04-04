import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import useAuth from "../hooks/useAuth";

function VerifyOtpPage() {
  const { verifyOtp, resendOtp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const initialEmail = location.state?.email || "";

  const [formData, setFormData] = useState({
    email: initialEmail,
    OTP: "",
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);

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
      await verifyOtp({
        email: formData.email,
        OTP: formData.OTP,
      });

      navigate("/", { replace: true });
    } catch (error) {
      setErrorMessage(error.message || "فشل التحقق من رمز OTP");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResendOtp() {
    if (!formData.email) {
      setErrorMessage("يرجى إدخال البريد الإلكتروني أولًا لإعادة إرسال الرمز.");
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");
    setIsResending(true);

    try {
      const response = await resendOtp(formData.email);
      setSuccessMessage(response?.message || "تم إرسال رمز جديد إلى بريدك الإلكتروني.");
    } catch (error) {
      setErrorMessage(error.message || "تعذر إعادة إرسال رمز OTP");
    } finally {
      setIsResending(false);
    }
  }

  return (
    <section className="auth-page">
      <div className="auth-card">
        <h2>تأكيد الحساب عبر OTP</h2>
        <p className="auth-subtitle">
          أدخل البريد الإلكتروني والرمز الذي وصلك على الإيميل لتفعيل الحساب.
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
              placeholder="example@email.com"
              required
            />
          </label>

          <label className="form-field">
            <span>رمز OTP</span>
            <input
              type="text"
              name="OTP"
              value={formData.OTP}
              onChange={handleChange}
              placeholder="أدخل الرمز المكون من 4 أرقام"
              required
            />
          </label>

          <button
            type="submit"
            className="primary-btn auth-submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? "جارٍ التحقق..." : "تأكيد الحساب"}
          </button>
        </form>

        <button
          type="button"
          className="ghost-btn auth-secondary-btn"
          onClick={handleResendOtp}
          disabled={isResending}
        >
          {isResending ? "جارٍ إعادة الإرسال..." : "إعادة إرسال الرمز"}
        </button>

        <p className="auth-footer">
          لديك حساب مفعّل بالفعل؟ <Link to="/login">سجّل الدخول</Link>
        </p>
      </div>
    </section>
  );
}

export default VerifyOtpPage;