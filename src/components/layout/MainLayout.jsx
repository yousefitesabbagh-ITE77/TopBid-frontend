import { Link, NavLink, Outlet } from "react-router";

function MainLayout() {
  const navClassName = ({ isActive }) =>
    isActive ? "nav-link active-link" : "nav-link";

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">🔨</div>
          <div>
            <h1>المزاد المتميز</h1>
            <p>TopBid</p>
          </div>
        </div>

        <nav className="nav-links">
          <NavLink to="/" end className={navClassName}>
            الرئيسية
          </NavLink>
          <NavLink to="/how-it-works" className={navClassName}>
            كيف يشتغل؟
          </NavLink>
          <NavLink to="/about" className={navClassName}>
            عن المنصة
          </NavLink>
        </nav>

        <div className="topbar-actions">
          <Link to="/login" className="ghost-btn topbar-link-btn">
            تسجيل الدخول
          </Link>
          <Link to="/create-auction" className="primary-btn topbar-link-btn">
            أنشئ مزادًا
          </Link>
        </div>
      </header>

      <main className="page-content">
        <Outlet />
      </main>
    </div>
  );
}

export default MainLayout;