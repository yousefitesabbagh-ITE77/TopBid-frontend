import { useState } from "react";
import { Link, useNavigate } from "react-router";
import useAuth from "../hooks/useAuth";

function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
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
      const result = await register(formData);
      setSuccessMessage(result.response?.message || "تم إنشاء الحساب بنجاح");

      if (result.didLogin) {
        navigate("/profile", { replace: true });
        return;
      }

      navigate("/login", { replace: true });
    } catch (error) {
      setErrorMessage(error.message || "فشل إنشاء الحساب");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="auth-page">
      <div className="auth-card">
        <h2>إنشاء حساب</h2>
        <p className="auth-subtitle">
          أنشئ حسابك للبدء بإضافة المزادات أو المزايدة على العناصر المعروضة.
        </p>

        {errorMessage ? <div className="auth-alert error-alert">{errorMessage}</div> : null}
        {successMessage ? <div className="auth-alert success-alert">{successMessage}</div> : null}

        <form onSubmit={handleSubmit} className="auth-form">
          <label className="form-field">
            <span>الاسم</span>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="الاسم الكامل"
              required
            />
          </label>

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

          <label className="form-field">
            <span>تأكيد كلمة المرور</span>
            <input
              type="password"
              name="password_confirmation"
              value={formData.password_confirmation}
              onChange={handleChange}
              placeholder="أعد إدخال كلمة المرور"
              required
            />
          </label>

          <button type="submit" className="primary-btn auth-submit-btn" disabled={isSubmitting}>
            {isSubmitting ? "جار إنشاء الحساب..." : "إنشاء الحساب"}
          </button>
        </form>

        <p className="auth-footer">
          لديك حساب بالفعل؟ <Link to="/login">سجّل الدخول</Link>
        </p>
      </div>
    </section>
  );
}

export default RegisterPage;