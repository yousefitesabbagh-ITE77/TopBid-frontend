import useAuth from "../hooks/useAuth";

function ProfilePage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <section className="simple-page">
        <h2>جار تحميل الملف الشخصي...</h2>
      </section>
    );
  }

  return (
    <section className="simple-page">
      <h2>الملف الشخصي</h2>
      <div className="profile-grid">
        <div className="profile-item">
          <span className="profile-label">الاسم</span>
          <strong>{user?.name || "غير متوفر"}</strong>
        </div>

        <div className="profile-item">
          <span className="profile-label">البريد الإلكتروني</span>
          <strong>{user?.email || "غير متوفر"}</strong>
        </div>

        <div className="profile-item">
          <span className="profile-label">معرّف المستخدم</span>
          <strong>{user?.id || "غير متوفر"}</strong>
        </div>

        <div className="profile-item">
          <span className="profile-label">رقم الهاتف</span>
          <strong>{user?.phone_number || user?.phone || "غير متوفر"}</strong>
        </div>
      </div>
    </section>
  );
}

export default ProfilePage;