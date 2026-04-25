import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  fetchAuctionDetails,
  formatAuctionPrice,
  formatAuctionTimeLeft,
} from "../lib/auctions";
import { placeBid } from "../lib/bids";

function formatDateTime(value) {
  if (!value) {
    return "غير متوفر";
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return "غير متوفر";
  }

  return new Intl.DateTimeFormat("ar-EG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(parsedDate);
}

function getModerationStatusLabel(status) {
  switch (status) {
    case "approved":
      return "مقبول من الإدارة";
    case "pending":
      return "بانتظار المراجعة";
    case "flagged":
      return "معلّق للمراجعة";
    case "rejected":
      return "مرفوض";
    default:
      return "غير معروف";
  }
}

function AuctionDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [auction, setAuction] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [bidAmount, setBidAmount] = useState("");
  const [isSubmittingBid, setIsSubmittingBid] = useState(false);

  const loadAuctionDetails = useCallback(
    async ({ showLoader = true } = {}) => {
      try {
        if (showLoader) {
          setIsLoading(true);
        } else {
          setIsRefreshing(true);
        }

        setErrorMessage("");

        const loadedAuction = await fetchAuctionDetails(id);
        setAuction(loadedAuction);

        return loadedAuction;
      } catch (error) {
        setErrorMessage(error.message || "تعذر تحميل تفاصيل المزاد.");
        return null;
      } finally {
        if (showLoader) {
          setIsLoading(false);
        } else {
          setIsRefreshing(false);
        }
      }
    },
    [id]
  );

  useEffect(() => {
    loadAuctionDetails();
  }, [loadAuctionDetails]);

  const minimumBidValue = useMemo(() => {
    if (!auction) {
      return "1.00";
    }

    return (Number(auction.currentPrice || 0) + 1).toFixed(2);
  }, [auction]);

  useEffect(() => {
    if (auction) {
      setBidAmount(minimumBidValue);
    }
  }, [auction, minimumBidValue]);

  async function handleBidSubmit(event) {
    event.preventDefault();

    if (!auction) {
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");
    setIsSubmittingBid(true);

    try {
      const response = await placeBid({
        auctionId: auction.id,
        amount: bidAmount,
      });

      await loadAuctionDetails({ showLoader: false });

      setSuccessMessage(response?.message || "تمت إضافة المزايدة بنجاح.");
    } catch (error) {
      setErrorMessage(error.message || "تعذر إرسال المزايدة.");
    } finally {
      setIsSubmittingBid(false);
    }
  }

  if (isLoading) {
    return (
      <section className="status-box">
        <h4>جار تحميل تفاصيل المزاد...</h4>
        <p>نسترجع الآن التفاصيل الحقيقية من الباك.</p>
      </section>
    );
  }

  if (errorMessage && !auction) {
    return (
      <section className="status-box error">
        <h4>تعذر تحميل صفحة المزاد</h4>
        <p>{errorMessage}</p>

        <div className="auction-details-error-actions">
          <button
            type="button"
            className="ghost-btn"
            onClick={() => navigate("/home")}
          >
            العودة إلى الرئيسية
          </button>

          <button
            type="button"
            className="primary-btn"
            onClick={() => loadAuctionDetails()}
          >
            إعادة المحاولة
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="auction-details-page">
      <div className="auction-details-header">
        <div>
          <span className="hero-badge create-auction-badge">تفاصيل المزاد</span>
          <h2>{auction.title}</h2>
          <p>
            هذه الصفحة مربوطة الآن مع <code>GET /api/auctions/{id}</code> و
            <code>POST /api/bids</code>.
          </p>
        </div>

        <div className="auction-details-header-actions">
          <Link to="/home" className="ghost-btn topbar-link-btn">
            العودة إلى الرئيسية
          </Link>

          <button
            type="button"
            className="primary-btn"
            onClick={() => loadAuctionDetails({ showLoader: false })}
            disabled={isRefreshing}
          >
            {isRefreshing ? "جار التحديث..." : "تحديث التفاصيل"}
          </button>
        </div>
      </div>

      {errorMessage ? <div className="auth-alert error-alert">{errorMessage}</div> : null}
      {successMessage ? (
        <div className="auth-alert success-alert">{successMessage}</div>
      ) : null}

      <div className="auction-details-layout">
        <div className="auction-details-main">
          <div className="auction-details-card auction-details-hero">
            <div className="auction-details-image-wrapper">
              <img src={auction.imageUrl} alt={auction.title} className="auction-details-image" />
            </div>

            <div className="auction-details-content">
              <div className="auction-details-badges">
                <span className="auction-status">
                  {auction.isActive ? "مزاد نشط" : "مزاد غير نشط"}
                </span>

                <span className="auction-details-moderation">
                  {getModerationStatusLabel(auction.moderationStatus)}
                </span>
              </div>

              <h3>{auction.title}</h3>

              <p className="auction-details-description">{auction.description}</p>

              <div className="auction-details-meta-grid">
                <div className="auction-details-meta-item">
                  <span>الفئة</span>
                  <strong>{auction.categoryName}</strong>
                </div>

                <div className="auction-details-meta-item">
                  <span>البائع</span>
                  <strong>{auction.sellerName}</strong>
                </div>

                <div className="auction-details-meta-item">
                  <span>السعر الابتدائي</span>
                  <strong>{formatAuctionPrice(auction.startingPrice)} دولار</strong>
                </div>

                <div className="auction-details-meta-item">
                  <span>السعر الحالي</span>
                  <strong>{formatAuctionPrice(auction.currentPrice)} دولار</strong>
                </div>

                <div className="auction-details-meta-item">
                  <span>مدة المزاد</span>
                  <strong>{auction.durationHours || 0} ساعة</strong>
                </div>

                <div className="auction-details-meta-item">
                  <span>الوقت المتبقي</span>
                  <strong>{formatAuctionTimeLeft(auction.expiresAt)}</strong>
                </div>

                <div className="auction-details-meta-item">
                  <span>بداية المزاد</span>
                  <strong>{formatDateTime(auction.startedAt)}</strong>
                </div>

                <div className="auction-details-meta-item">
                  <span>نهاية المزاد</span>
                  <strong>{formatDateTime(auction.expiresAt)}</strong>
                </div>
              </div>
            </div>
          </div>

          <div className="auction-details-card">
            <div className="section-header auction-details-section-header">
              <h3>المواصفات</h3>
              <p>المواصفات الإضافية المرسلة من صفحة إنشاء المزاد.</p>
            </div>

            {auction.specs.length === 0 ? (
              <div className="status-box empty auction-details-inline-box">
                <h4>لا توجد مواصفات إضافية</h4>
                <p>لم تتم إضافة أي مواصفات لهذا المزاد.</p>
              </div>
            ) : (
              <div className="auction-specs-grid">
                {auction.specs.map((spec, index) => (
                  <div key={`${spec.key}-${index}`} className="auction-spec-item">
                    <span>{spec.key}</span>
                    <strong>{spec.value}</strong>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <aside className="auction-details-sidebar">
          <div className="auction-details-card auction-bid-card">
            <div className="section-header auction-details-section-header">
              <h3>ضع مزايدتك</h3>
              <p>
                المزايدة الفورية لاحقًا، لكن يمكنك الآن إرسال مزايدة عادية ثم تحديث
                الصفحة لرؤية السعر الجديد.
              </p>
            </div>

            <div className="auction-bid-summary">
              <p>
                <strong>السعر الحالي:</strong>{" "}
                {formatAuctionPrice(auction.currentPrice)} دولار
              </p>
              <p>
                <strong>أقل قيمة مقترحة:</strong> {minimumBidValue} دولار
              </p>
            </div>

            <form className="auction-bid-form" onSubmit={handleBidSubmit}>
              <label className="form-field">
                <span>قيمة المزايدة</span>
                <input
                  type="number"
                  min={minimumBidValue}
                  step="0.01"
                  value={bidAmount}
                  onChange={(event) => setBidAmount(event.target.value)}
                  required
                  disabled={!auction.isActive || isSubmittingBid}
                />
              </label>

              <button
                type="button"
                className="ghost-btn"
                onClick={() => setBidAmount(minimumBidValue)}
                disabled={!auction.isActive || isSubmittingBid}
              >
                استخدم أقل قيمة مقترحة
              </button>

              <button
                type="submit"
                className="primary-btn"
                disabled={!auction.isActive || isSubmittingBid}
              >
                {isSubmittingBid ? "جار إرسال المزايدة..." : "إرسال المزايدة"}
              </button>
            </form>

            {!auction.isActive ? (
              <div className="auth-alert info-alert auction-details-local-alert">
                لا يمكن إرسال مزايدة الآن لأن المزاد غير نشط أو انتهى.
              </div>
            ) : null}
          </div>

          <div className="auction-details-card">
            <div className="section-header auction-details-section-header">
              <h3>ملاحظات مهمة</h3>
            </div>

            <ul className="auction-details-notes">
              <li>صفحة التفاصيل الحالية تعتمد على endpoint التفاصيل الحالي من الباك.</li>
              <li>تاريخ كل المزايدات و realtime updates سنربطهما لاحقًا.</li>
              <li>بعد المزايدة يتم تحديث بيانات المزاد مرة أخرى من الخادم.</li>
            </ul>
          </div>
        </aside>
      </div>
    </section>
  );
}

export default AuctionDetailsPage;