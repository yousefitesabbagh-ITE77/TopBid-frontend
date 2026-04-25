import { Link, NavLink, Outlet, useNavigate } from "react-router";
import useAuth from "../../hooks/useAuth";

function MainLayout() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const navClassName = ({ isActive }) =>
    isActive ? "nav-link active-link" : "nav-link";

  async function handleLogout() {
    await logout();
    navigate("/");
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <Link to="/home" className="brand brand-link">
          <div className="brand-mark">🔨</div>
          <div>
            <h1>المزاد المتميز</h1>
            <p>TopBid</p>
          </div>
        </Link>

        <nav className="nav-links">
          <NavLink to="/home" end className={navClassName}>
            الرئيسية
          </NavLink>
          {isAuthenticated ? (
            <NavLink to="/my-auctions" className={navClassName}>
              مزاداتي
            </NavLink>
          ) : null}
          <NavLink to="/how-it-works" className={navClassName}>
            كيف يشتغل؟
          </NavLink>
          <NavLink to="/about" className={navClassName}>
            عن المنصة
          </NavLink>
        </nav>

        <div className="topbar-actions">
          {isAuthenticated ? (
            <>
              <Link to="/profile" className="ghost-btn topbar-link-btn">
                {user?.name || "الملف الشخصي"}
              </Link>
              <button className="ghost-btn" onClick={handleLogout}>
                تسجيل الخروج
              </button>
              <Link to="/create-auction" className="primary-btn topbar-link-btn">
                أنشئ مزادًا
              </Link>
            </>
          ) : (
            <>
              <Link to="/login" className="ghost-btn topbar-link-btn">
                تسجيل الدخول
              </Link>
              <Link to="/register" className="ghost-btn topbar-link-btn">
                إنشاء حساب
              </Link>
              <Link to="/create-auction" className="primary-btn topbar-link-btn">
                أنشئ مزادًا
              </Link>
            </>
          )}
        </div>
      </header>

      <main className="page-content">
        <Outlet />
      </main>
    </div>
  );
}

export default MainLayout;