import { Link } from "react-router";

function NotFoundPage() {
  return (
    <section className="simple-page not-found-page">
      <h2>الصفحة غير موجودة</h2>
      <p>الرابط الذي فتحته غير موجود داخل التطبيق.</p>
      <Link to="/" className="primary-btn topbar-link-btn">
        العودة إلى الرئيسية
      </Link>
    </section>
  );
}

export default NotFoundPage;