import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { fetchCategories } from "../lib/categories";
import { createAuction } from "../lib/auctions";

const INITIAL_FORM_STATE = {
  title: "",
  description: "",
  categoryId: "",
  startingPrice: "",
  durationHours: "24",
  image: null,
};

const INITIAL_SPEC_ROW = { key: "", value: "" };
const MAX_SPECS = 3;

function CreateAuctionPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [specs, setSpecs] = useState([INITIAL_SPEC_ROW]);
  const [categories, setCategories] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadCategories() {
      try {
        setIsLoadingCategories(true);
        const loadedCategories = await fetchCategories();

        if (!isMounted) {
          return;
        }

        setCategories(loadedCategories);
        setFormData((current) => ({
          ...current,
          categoryId: current.categoryId || loadedCategories[0]?.id?.toString() || "",
        }));
      } catch (error) {
        if (isMounted) {
          setErrorMessage(error.message || "تعذر تحميل الفئات من الخادم.");
        }
      } finally {
        if (isMounted) {
          setIsLoadingCategories(false);
        }
      }
    }

    loadCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!formData.image) {
      setImagePreviewUrl("");
      return undefined;
    }

    const objectUrl = URL.createObjectURL(formData.image);
    setImagePreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [formData.image]);

  const filledSpecsCount = useMemo(
    () => specs.filter((spec) => spec.key.trim() && spec.value.trim()).length,
    [specs]
  );

  const isSubmitDisabled =
    isSubmitting || isLoadingCategories || categories.length === 0;

  function handleChange(event) {
    const { name, value, files } = event.target;

    setErrorMessage("");
    setSuccessMessage("");

    if (name === "image") {
      setFormData((current) => ({
        ...current,
        image: files?.[0] || null,
      }));

      return;
    }

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleSpecChange(index, field, value) {
    setErrorMessage("");
    setSuccessMessage("");

    setSpecs((currentSpecs) =>
      currentSpecs.map((spec, currentIndex) =>
        currentIndex === index ? { ...spec, [field]: value } : spec
      )
    );
  }

  function handleAddSpec() {
    if (specs.length >= MAX_SPECS) {
      return;
    }

    setSpecs((currentSpecs) => [...currentSpecs, { ...INITIAL_SPEC_ROW }]);
  }

  function handleRemoveSpec(index) {
    setSpecs((currentSpecs) => {
      if (currentSpecs.length === 1) {
        return [{ ...INITIAL_SPEC_ROW }];
      }

      return currentSpecs.filter((_, currentIndex) => currentIndex !== index);
    });
  }

  function resetForm() {
    setFormData({
      ...INITIAL_FORM_STATE,
      categoryId: categories[0]?.id?.toString() || "",
    });
    setSpecs([{ ...INITIAL_SPEC_ROW }]);
    setImagePreviewUrl("");
    setErrorMessage("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (categories.length === 0) {
      setErrorMessage(
        "لا يمكن إنشاء مزاد الآن لأنه لا توجد فئات متاحة من الباك. أضف فئات تجريبية أولًا ثم جرّب مرة أخرى."
      );
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");
    setIsSubmitting(true);

    try {
      const response = await createAuction({
        title: formData.title,
        description: formData.description,
        categoryId: formData.categoryId,
        startingPrice: formData.startingPrice,
        durationHours: formData.durationHours,
        image: formData.image,
        specs,
      });

      resetForm();
      setSuccessMessage(
        response?.message ||
        "تم إرسال المزاد بنجاح، وهو الآن بانتظار موافقة الإدارة قبل ظهوره في الصفحة الرئيسية."
      );
    } catch (error) {
      setErrorMessage(error.message || "تعذر إنشاء المزاد.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="create-auction-page">
      <div className="create-auction-header">
        <div>
          <span className="hero-badge create-auction-badge">إنشاء مزاد جديد</span>
          <h2>أضف مزادك وارفع تفاصيله الحقيقية</h2>
          <p>
            هذه الصفحة مربوطة الآن مع <code>POST /api/auctions</code> وتقوم بإرسال
            البيانات الحقيقية إلى الباك. بعد الإنشاء سيبقى المزاد بانتظار المراجعة.
          </p>
        </div>

        <div className="create-auction-header-actions">
          <button type="button" className="ghost-btn" onClick={() => navigate("/home")}>
            العودة إلى الرئيسية
          </button>
        </div>
      </div>

      {errorMessage ? <div className="auth-alert error-alert">{errorMessage}</div> : null}
      {successMessage ? <div className="auth-alert success-alert">{successMessage}</div> : null}

      <div className="create-auction-layout">
        <form className="create-auction-card create-auction-form" onSubmit={handleSubmit}>
          <div className="section-header create-auction-section-header">
            <h3>بيانات المزاد الأساسية</h3>
            <p>املأ الحقول المطلوبة كما يتوقعها الباك تمامًا.</p>
          </div>

          <div className="create-auction-grid">
            <label className="form-field create-auction-field-wide">
              <span>عنوان المزاد</span>
              <input
                type="text"
                name="title"
                placeholder="مثال: ساعة رولكس أصلية نادرة"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </label>

            <label className="form-field create-auction-field-wide">
              <span>وصف المزاد</span>
              <textarea
                name="description"
                rows="6"
                placeholder="اكتب وصفًا واضحًا للحالة، الموديل، سنة الصنع، وأي تفاصيل مهمة للمزايدين."
                value={formData.description}
                onChange={handleChange}
                required
              />
            </label>

            <label className="form-field">
              <span>الفئة</span>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                required
                disabled={isLoadingCategories || categories.length === 0}
              >
                {isLoadingCategories ? <option value="">جار تحميل الفئات...</option> : null}
                {!isLoadingCategories && categories.length === 0 ? (
                  <option value="">لا توجد فئات متاحة</option>
                ) : null}
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="form-field">
              <span>السعر الابتدائي</span>
              <input
                type="number"
                name="startingPrice"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={formData.startingPrice}
                onChange={handleChange}
                required
              />
            </label>

            <label className="form-field">
              <span>مدة المزاد بالساعات</span>
              <input
                type="number"
                name="durationHours"
                min="1"
                max="168"
                value={formData.durationHours}
                onChange={handleChange}
                required
              />
            </label>

            <label className="form-field">
              <span>صورة المزاد</span>
              <input
                type="file"
                name="image"
                accept="image/png,image/jpeg,image/jpg"
                onChange={handleChange}
              />
            </label>
          </div>

          <div className="create-auction-specs-section">
            <div className="create-auction-specs-header">
              <div>
                <h3>المواصفات الإضافية</h3>
                <p>
                  يمكنك إضافة حتى {MAX_SPECS} أسطر فقط من المواصفات مثل الماركة، الحالة،
                  اللون، أو سنة الصنع.
                </p>
              </div>

              <button
                type="button"
                className="ghost-btn"
                onClick={handleAddSpec}
                disabled={specs.length >= MAX_SPECS}
              >
                {specs.length >= MAX_SPECS
                  ? "وصلت للحد الأقصى"
                  : "إضافة سطر مواصفات"}
              </button>
            </div>

            <div className="create-auction-specs-list">
              {specs.map((spec, index) => (
                <div key={`spec-${index}`} className="create-auction-spec-row">
                  <label className="form-field">
                    <span>اسم الخاصية</span>
                    <input
                      type="text"
                      placeholder="مثال: الماركة"
                      value={spec.key}
                      onChange={(event) =>
                        handleSpecChange(index, "key", event.target.value)
                      }
                    />
                  </label>

                  <label className="form-field">
                    <span>القيمة</span>
                    <input
                      type="text"
                      placeholder="مثال: Rolex"
                      value={spec.value}
                      onChange={(event) =>
                        handleSpecChange(index, "value", event.target.value)
                      }
                    />
                  </label>

                  <button
                    type="button"
                    className="ghost-btn create-auction-remove-btn"
                    onClick={() => handleRemoveSpec(index)}
                  >
                    حذف
                  </button>
                </div>
              ))}
            </div>
          </div>

          {categories.length === 0 && !isLoadingCategories ? (
            <div className="auth-alert error-alert">
              لا يمكنك إرسال المزاد الآن لأن الباك لا يرجّع أي فئات. أضف Categories
              تجريبية أولًا ثم أعد المحاولة.
            </div>
          ) : null}

          <div className="profile-form-actions create-auction-actions">
            <button
              type="submit"
              className="primary-btn"
              disabled={isSubmitDisabled}
            >
              {isSubmitting ? "جار إنشاء المزاد..." : "إنشاء المزاد الآن"}
            </button>

            <button
              type="button"
              className="ghost-btn"
              onClick={resetForm}
              disabled={isSubmitting}
            >
              إعادة تعيين الحقول
            </button>
          </div>
        </form>

        <aside className="create-auction-card create-auction-sidebar">
          <div className="section-header create-auction-section-header">
            <h3>معاينة سريعة</h3>
            <p>هذه المعاينة تساعدك قبل الإرسال، وليست قادمة من الباك.</p>
          </div>

          <div className="create-auction-preview-card">
            <div className="create-auction-preview-image-wrapper">
              {imagePreviewUrl ? (
                <img
                  src={imagePreviewUrl}
                  alt="معاينة صورة المزاد"
                  className="create-auction-preview-image"
                />
              ) : (
                <div className="create-auction-preview-placeholder">
                  لم يتم اختيار صورة بعد
                </div>
              )}
            </div>

            <div className="create-auction-preview-content">
              <span className="auction-status">بانتظار المراجعة بعد الإرسال</span>
              <h4>{formData.title || "عنوان المزاد سيظهر هنا"}</h4>
              <p className="auction-description create-auction-preview-description">
                {formData.description || "وصف المزاد سيظهر هنا بعد أن تبدأ بكتابة التفاصيل."}
              </p>

              <div className="auction-meta create-auction-preview-meta">
                <p>
                  <strong>الفئة:</strong>{" "}
                  {categories.find((category) => String(category.id) === formData.categoryId)?.name ||
                    "غير محددة بعد"}
                </p>
                <p>
                  <strong>السعر الابتدائي:</strong>{" "}
                  {formData.startingPrice ? `${formData.startingPrice} دولار` : "غير محدد بعد"}
                </p>
                <p>
                  <strong>مدة المزاد:</strong>{" "}
                  {formData.durationHours ? `${formData.durationHours} ساعة` : "غير محددة بعد"}
                </p>
                <p>
                  <strong>عدد المواصفات الجاهزة:</strong> {filledSpecsCount} / {MAX_SPECS}
                </p>
              </div>
            </div>
          </div>

          <div className="create-auction-tips">
            <h3>ملاحظات مهمة</h3>
            <ul>
              <li>الحد الأدنى لمدة المزاد ساعة واحدة، والحد الأقصى 168 ساعة.</li>
              <li>الصورة اختيارية، لكن إضافتها تجعل العرض أفضل بكثير.</li>
              <li>يمكنك إضافة 3 أسطر مواصفات كحد أقصى.</li>
              <li>
                بعد الإرسال سيعود الباك برسالة نجاح، لكن المزاد لن يظهر مباشرة لأنه ينتظر
                موافقة الإدارة.
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </section>
  );
}

export default CreateAuctionPage;