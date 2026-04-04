import { Link } from "react-router";

function ForgotPasswordPage() {
  return (
    <section className="auth-page">
      <div className="auth-card">
        <h2>نسيت كلمة المرور؟</h2>
        <p className="auth-subtitle">
          أضفنا الآن الصفحة والرابط داخل تسجيل الدخول. في الخطوة التالية سنربط
          هذا المسار مع API الخاصة بإرسال OTP وإعادة تعيين كلمة المرور.
        </p>

        <div className="auth-alert info-alert">
          هذه الصفحة جاهزة الآن من ناحية التنقل والواجهة، وسنحوّلها في المرحلة
          القادمة إلى flow حقيقي.
        </div>

        <div className="welcome-actions">
          <Link to="/login" className="primary-btn topbar-link-btn">
            العودة إلى تسجيل الدخول
          </Link>

          <Link to="/" className="ghost-btn topbar-link-btn">
            العودة إلى صفحة الترحيب
          </Link>
        </div>
      </div>
    </section>
  );
}

export default ForgotPasswordPage;