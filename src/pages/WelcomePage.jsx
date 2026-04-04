import { Link, useNavigate } from "react-router";

function WelcomePage() {
  const navigate = useNavigate();

  return (
    <section className="welcome-page">
      <div className="welcome-card">
        <span className="welcome-eyebrow">مرحبًا بك في TopBid</span>

        <h1>منصة مزادات عربية حديثة</h1>

        <p className="welcome-description">
          استكشف المزادات، أنشئ حسابك، وشارك في تجربة مزايدة واضحة وسهلة.
          هذه الصفحة هي أول محطة للمستخدم قبل الدخول إلى النظام.
        </p>

        <div className="welcome-actions">
          <button className="primary-btn" onClick={() => navigate("/login")}>
            ابدأ الآن
          </button>

          <Link to="/about" className="ghost-btn topbar-link-btn">
            تعرّف على المنصة
          </Link>
        </div>

        <div className="welcome-feature-grid">
          <article className="welcome-feature">
            <h3>مزايدات حيّة</h3>
            <p>تابع المزادات الحالية وتصفّح العناصر المتاحة بسهولة.</p>
          </article>

          <article className="welcome-feature">
            <h3>دخول آمن</h3>
            <p>تسجيل، OTP، ثم دخول منظم وواضح للمستخدم.</p>
          </article>

          <article className="welcome-feature">
            <h3>تصفّح كزائر</h3>
            <p>حتى بدون تسجيل دخول، يستطيع المستخدم استكشاف المنصة.</p>
          </article>
        </div>
      </div>
    </section>
  );
}

export default WelcomePage;