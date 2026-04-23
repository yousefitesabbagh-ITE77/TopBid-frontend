import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import useAuth from "../hooks/useAuth";
import { toProfileFormValues, updateCurrentProfile } from "../lib/profile";

function ProfilePage() {
  const { user, isLoading, refreshProfile, logout } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState(toProfileFormValues(null));
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    setFormData(toProfileFormValues(user));
  }, [user]); // تحديث بيانات النموذج كلما تغيرت بيانات المستخدم في السياق (مثل بعد تحميل البيانات أو تحديثها)

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleStartEditing() {
    setErrorMessage("");
    setSuccessMessage("");
    setFormData(toProfileFormValues(user));  // إعادة تعيين بيانات النموذج إلى القيم الحالية للمستخدم من السياق عند بدء التعديل، لضمان أن المستخدم يبدأ بالتعديل على أحدث البيانات
    setIsEditing(true);
  }

  function handleCancelEditing() {  // عند إلغاء التعديل، نعيد تعيين بيانات النموذج إلى القيم الحالية للمستخدم من السياق مرة أخرى، مما يلغي أي تغييرات غير محفوظة
    setErrorMessage("");
    setSuccessMessage("");
    setFormData(toProfileFormValues(user));
    setIsEditing(false);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setIsSaving(true);

    try {
      const response = await updateCurrentProfile(formData);
      await refreshProfile();

      setSuccessMessage(response?.message || "تم تحديث الملف الشخصي بنجاح.");
      setIsEditing(false);
    } catch (error) {
      setErrorMessage(error.message || "تعذر تحديث الملف الشخصي.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleLogout() {
    setErrorMessage("");
    setSuccessMessage("");
    setIsLoggingOut(true);

    try {
      await logout();
      navigate("/login", { replace: true });
    } catch (error) {
      setErrorMessage(error.message || "تعذر تسجيل الخروج.");
    } finally {
      setIsLoggingOut(false);
    }
  }

  if (isLoading) {
    return (
      <section className="simple-page">
        <h2>جار تحميل الملف الشخصي...</h2>
      </section>
    );
  }

  return (
    <section className="profile-page-shell">
      <div className="profile-page-card">
        <div className="profile-header">
          <div className="profile-header-main">
            <div className="profile-avatar-wrapper">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user?.name || "صورة المستخدم"}
                  className="profile-avatar-image"
                />
              ) : (
                <div className="profile-avatar-placeholder">
                  {(user?.name || "U").charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <div>
              <h2>الملف الشخصي</h2>
              <p className="profile-subtitle">
                هنا نعرض بيانات المستخدم الحقيقية القادمة من
                <code> GET /api/me </code>
                ويمكن تعديل البيانات الأساسية عبر
                <code> PUT /api/me </code>
              </p>
            </div>
          </div>

          <div className="profile-actions">
            {!isEditing ? (
              <button type="button" className="primary-btn" onClick={handleStartEditing}>
                تعديل البيانات
              </button>
            ) : (
              <button type="button" className="ghost-btn" onClick={handleCancelEditing}>
                إلغاء التعديل
              </button>
            )}

            <button
              type="button"
              className="ghost-btn"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? "جار تسجيل الخروج..." : "تسجيل الخروج"}
            </button>
          </div>
        </div>

        {errorMessage ? <div className="auth-alert error-alert">{errorMessage}</div> : null}
        {successMessage ? <div className="auth-alert success-alert">{successMessage}</div> : null}

        {!isEditing ? (
          <>
            <div className="profile-summary-grid">
              <div className="profile-summary-item">
                <span className="profile-label">الاسم</span>
                <strong>{user?.name || "غير متوفر"}</strong>
              </div>

              <div className="profile-summary-item">
                <span className="profile-label">البريد الإلكتروني</span>
                <strong>{user?.email || "غير متوفر"}</strong>
              </div>

              <div className="profile-summary-item">
                <span className="profile-label">رقم الهاتف</span>
                <strong>{user?.phone_number || "غير متوفر"}</strong>
              </div>

              <div className="profile-summary-item">
                <span className="profile-label">المدينة</span>
                <strong>{user?.city || "غير متوفر"}</strong>
              </div>

              <div className="profile-summary-item profile-summary-item-wide">
                <span className="profile-label">العنوان</span>
                <strong>{user?.address || "غير متوفر"}</strong>
              </div>

              <div className="profile-summary-item profile-summary-item-wide">
                <span className="profile-label">نبذة شخصية</span>
                <strong>{user?.bio || "غير متوفرة"}</strong>
              </div>

              <div className="profile-summary-item">
                <span className="profile-label">نشاطات فعالة</span>
                <strong>{user?.has_active_activity || "غير متوفر"}</strong>
              </div>
            </div>

            <p className="profile-note">
              ملاحظة: الباك الحالي لا يرجع <strong>id</strong> داخل
              <code> GET /api/me </code>
              ، لذلك لم نعد نعرضه هنا.
            </p>
          </>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="profile-form-grid">
              <label className="form-field">
                <span>الاسم</span>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
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
                  required
                />
              </label>

              <label className="form-field">
                <span>رقم الهاتف</span>
                <input
                  type="text"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  required
                />
              </label>

              <label className="form-field">
                <span>المدينة</span>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                />
              </label>

              <label className="form-field profile-field-wide">
                <span>العنوان</span>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                />
              </label>

              <label className="form-field profile-field-wide">
                <span>نبذة شخصية</span>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows="5"
                />
              </label>
            </div>

            <div className="profile-form-actions">
              <button type="submit" className="primary-btn" disabled={isSaving}>
                {isSaving ? "جار حفظ التعديلات..." : "حفظ التعديلات"}
              </button>

              <button
                type="button"
                className="ghost-btn"
                onClick={handleCancelEditing}
                disabled={isSaving}
              >
                إلغاء
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}

export default ProfilePage;