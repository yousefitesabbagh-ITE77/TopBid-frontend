import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import useAuth from "../hooks/useAuth";
import { AUTH_NOTICE_KEY } from "../lib/api";
import { clearToken } from "../lib/auth";
import {
  changeCurrentPassword,
  toProfileFormValues,
  updateCurrentProfile,
} from "../lib/profile";

const INITIAL_PASSWORD_FORM = {
  old_password: "",
  password: "",
  password_confirmation: "",
};

function ProfilePage() {
  const { user, isLoading, refreshProfile, logout } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState(toProfileFormValues(null));
  const [passwordFormData, setPasswordFormData] = useState(INITIAL_PASSWORD_FORM);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [passwordErrorMessage, setPasswordErrorMessage] = useState("");

  useEffect(() => {
    setFormData(toProfileFormValues(user));
  }, [user]);

  function handleChange(event) {
    const { name, value } = event.target;

    setErrorMessage("");
    setSuccessMessage("");

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handlePasswordChange(event) {
    const { name, value } = event.target;

    setPasswordErrorMessage("");

    setPasswordFormData((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleStartEditing() {
    setErrorMessage("");
    setSuccessMessage("");
    setFormData(toProfileFormValues(user));
    setIsEditing(true);
  }

  function handleCancelEditing() {
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

  async function handlePasswordSubmit(event) {
    event.preventDefault();
    setPasswordErrorMessage("");
    setIsChangingPassword(true);

    try {
      await changeCurrentPassword(passwordFormData);

      setPasswordFormData(INITIAL_PASSWORD_FORM);

      sessionStorage.setItem(
        AUTH_NOTICE_KEY,
        "تم تغيير كلمة المرور بنجاح. سجّل الدخول مرة أخرى باستخدام كلمة المرور الجديدة."
      );

      clearToken();
      window.location.assign("/login");
    } catch (error) {
      setPasswordErrorMessage(error.message || "تعذر تغيير كلمة المرور.");
    } finally {
      setIsChangingPassword(false);
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
                وتغيير كلمة المرور عبر
                <code> PUT /api/me/password </code>
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

      <div className="profile-page-card profile-password-card">
        <div className="profile-password-header">
          <div>
            <h3>تغيير كلمة المرور</h3>
            <p className="profile-password-subtitle">
              أدخل كلمة المرور الحالية، ثم اختر كلمة مرور جديدة وأكدها. بعد النجاح
              سيطلب منك النظام تسجيل الدخول مرة أخرى لحماية الحساب.
            </p>
          </div>
        </div>

        {passwordErrorMessage ? (
          <div className="auth-alert error-alert">{passwordErrorMessage}</div>
        ) : null}

        <form onSubmit={handlePasswordSubmit} className="auth-form">
          <div className="profile-password-grid">
            <label className="form-field profile-password-field-wide">
              <span>كلمة المرور الحالية</span>
              <input
                type="password"
                name="old_password"
                value={passwordFormData.old_password}
                onChange={handlePasswordChange}
                placeholder="أدخل كلمة المرور الحالية"
                required
              />
            </label>

            <label className="form-field">
              <span>كلمة المرور الجديدة</span>
              <input
                type="password"
                name="password"
                value={passwordFormData.password}
                onChange={handlePasswordChange}
                placeholder="8 أحرف على الأقل"
                minLength="8"
                required
              />
            </label>

            <label className="form-field">
              <span>تأكيد كلمة المرور الجديدة</span>
              <input
                type="password"
                name="password_confirmation"
                value={passwordFormData.password_confirmation}
                onChange={handlePasswordChange}
                placeholder="أعد كتابة كلمة المرور الجديدة"
                minLength="8"
                required
              />
            </label>
          </div>

          <div className="profile-password-help-box">
            <p>
              لأسباب أمنية، بعد تغيير كلمة المرور سيُبطل الباك الجلسة الحالية، ثم
              سيتم تحويلك مباشرة إلى صفحة تسجيل الدخول.
            </p>
          </div>

          <div className="profile-form-actions">
            <button type="submit" className="primary-btn" disabled={isChangingPassword}>
              {isChangingPassword ? "جار تغيير كلمة المرور..." : "تغيير كلمة المرور"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

export default ProfilePage;