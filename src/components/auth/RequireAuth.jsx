import { Navigate, useLocation } from "react-router";
import useAuth from "../../hooks/useAuth";

function RequireAuth({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <section className="simple-page">
        <h2>جار التحقق من الجلسة...</h2>
        <p>انتظر قليلًا ريثما نتحقق من حالة تسجيل الدخول.</p>
      </section>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}

export default RequireAuth;