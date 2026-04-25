import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import {
  fetchMyAuctions,
  formatAuctionPrice,
  formatAuctionTimeLeft,
} from "../lib/auctions";

const STATUS_TABS = [
  {
    key: "active",
    label: "النشطة",
    emptyTitle: "لا توجد مزادات نشطة",
    emptyDescription:
      "عندما يصبح لديك مزادات فعالة ومقبولة من الإدارة ستظهر هنا.",
  },
  {
    key: "pending",
    label: "قيد المراجعة",
    emptyTitle: "لا توجد مزادات قيد المراجعة",
    emptyDescription:
      "أي مزاد جديد بانتظار مراجعة الإدارة سيظهر هنا مباشرة.",
  },
  {
    key: "approved",
    label: "المقبولة",
    emptyTitle: "لا توجد مزادات مقبولة",
    emptyDescription:
      "المزادات التي تمت الموافقة عليها من الإدارة ستظهر هنا.",
  },
  {
    key: "expired",
    label: "المنتهية",
    emptyTitle: "لا توجد مزادات منتهية",
    emptyDescription:
      "عندما تنتهي مدة مزاداتك ستظهر في هذا التبويب.",
  },
  {
    key: "rejected",
    label: "المرفوضة",
    emptyTitle: "لا توجد مزادات مرفوضة",
    emptyDescription:
      "إذا رُفض أي مزاد من الإدارة سيظهر هنا مع حالته الحالية.",
  },
];

const DEFAULT_STATUS = "active";
const DEFAULT_PER_PAGE = 10;

function getValidatedStatus(status) {
  const availableStatuses = STATUS_TABS.map((tab) => tab.key);
  return availableStatuses.includes(status) ? status : DEFAULT_STATUS;
}

function getValidatedPage(pageValue) {
  const parsedPage = Number(pageValue);
  return Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;
}

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

function getAuctionLifecycleLabel(auction) {
  if (auction.moderationStatus === "pending") {
    return "قيد المراجعة";
  }

  if (auction.moderationStatus === "rejected") {
    return "مرفوض";
  }

  if (!auction.isActive) {
    return "غير نشط";
  }

  const expiresAt = auction.expiresAt ? new Date(auction.expiresAt).getTime() : null;

  if (expiresAt && expiresAt <= Date.now()) {
    return "منتهي";
  }

  return "مزاد نشط";
}

function getVisiblePages(currentPage, lastPage) {
  const pages = new Set([1, lastPage, currentPage - 1, currentPage, currentPage + 1]);

  return Array.from(pages)
    .filter((page) => page >= 1 && page <= lastPage)
    .sort((first, second) => first - second);
}

function MyAuctionsPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const [auctions, setAuctions] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    perPage: DEFAULT_PER_PAGE,
    total: 0,
    from: 0,
    to: 0,
    hasPreviousPage: false,
    hasNextPage: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const selectedStatus = getValidatedStatus(searchParams.get("status"));
  const currentPage = getValidatedPage(searchParams.get("page"));

  const currentTab = useMemo(
    () => STATUS_TABS.find((tab) => tab.key === selectedStatus) || STATUS_TABS[0],
    [selectedStatus]
  );

  const loadMyAuctions = useCallback(
    async ({ silent = false } = {}) => {
      try {
        if (silent) {
          setIsRefreshing(true);
        } else {
          setIsLoading(true);
        }

        setErrorMessage("");

        const result = await fetchMyAuctions({
          status: selectedStatus,
          perPage: DEFAULT_PER_PAGE,
          page: currentPage,
        });

        setAuctions(result.items);
        setPagination(result.pagination);
      } catch (error) {
        setErrorMessage(error.message || "تعذر تحميل مزاداتك.");
      } finally {
        if (silent) {
          setIsRefreshing(false);
        } else {
          setIsLoading(false);
        }
      }
    },
    [selectedStatus, currentPage]
  );

  useEffect(() => {
    loadMyAuctions();
  }, [loadMyAuctions]);

  function updateQuery(nextStatus, nextPage = 1) {
    const params = new URLSearchParams();

    if (nextStatus && nextStatus !== DEFAULT_STATUS) {
      params.set("status", nextStatus);
    }

    if (nextPage > 1) {
      params.set("page", String(nextPage));
    }

    const search = params.toString();
    navigate(
      {
        pathname: "/my-auctions",
        search: search ? `?${search}` : "",
      },
      { replace: false }
    );
  }

  function handleTabChange(status) {
    if (status === selectedStatus) {
      return;
    }

    updateQuery(status, 1);
  }

  function handlePageChange(page) {
    if (page === currentPage) {
      return;
    }

    updateQuery(selectedStatus, page);
  }

  const visiblePages = useMemo(
    () => getVisiblePages(pagination.currentPage, pagination.lastPage),
    [pagination.currentPage, pagination.lastPage]
  );

  return (
    <section className="my-auctions-page">
      <div className="my-auctions-header">
        <div>
          <span className="hero-badge create-auction-badge">مزاداتي</span>
          <h2>إدارة ومتابعة مزاداتك</h2>
          <p>
            هذه الصفحة مربوطة الآن مع <code>GET /api/my-auctions</code> وتعرض مزادات
            المستخدم الحالي فقط حسب التبويب المختار.
          </p>
        </div>

        <div className="my-auctions-header-actions">
          <Link to="/create-auction" className="primary-btn topbar-link-btn">
            أنشئ مزادًا جديدًا
          </Link>

          <button
            type="button"
            className="ghost-btn"
            onClick={() => loadMyAuctions({ silent: true })}
            disabled={isRefreshing}
          >
            {isRefreshing ? "جار التحديث..." : "تحديث القائمة"}
          </button>
        </div>
      </div>

      <div className="my-auctions-tabs-wrapper">
        <div className="my-auctions-tabs">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={
                tab.key === selectedStatus
                  ? "my-auctions-tab active"
                  : "my-auctions-tab"
              }
              onClick={() => handleTabChange(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {!isLoading && !errorMessage ? (
          <div className="my-auctions-summary">
            <p>
              التبويب الحالي: <strong>{currentTab.label}</strong>
            </p>
            <p>
              عدد النتائج: <strong>{pagination.total}</strong>
            </p>
            {pagination.total > 0 ? (
              <p>
                المعروض الآن: <strong>{pagination.from}</strong> إلى{" "}
                <strong>{pagination.to}</strong>
              </p>
            ) : null}
          </div>
        ) : null}
      </div>

      {errorMessage ? <div className="auth-alert error-alert">{errorMessage}</div> : null}

      {isLoading ? (
        <section className="status-box">
          <h4>جار تحميل مزاداتك...</h4>
          <p>نقرأ الآن بياناتك الحقيقية من الخادم حسب التبويب المختار.</p>
        </section>
      ) : auctions.length === 0 ? (
        <section className="status-box empty">
          <h4>{currentTab.emptyTitle}</h4>
          <p>{currentTab.emptyDescription}</p>

          <div className="my-auctions-empty-actions">
            <Link to="/create-auction" className="primary-btn topbar-link-btn">
              أنشئ أول مزاد الآن
            </Link>
          </div>
        </section>
      ) : (
        <>
          <section className="cards-grid">
            {auctions.map((auction) => (
              <article key={auction.id} className="auction-card">
                <div className="auction-image-wrapper">
                  <img
                    src={auction.imageUrl}
                    alt={auction.title}
                    className="auction-image"
                  />
                </div>

                <div className="auction-content">
                  <div className="my-auctions-card-badges">
                    <span className="auction-status">
                      {getAuctionLifecycleLabel(auction)}
                    </span>
                    <span className="my-auctions-moderation-badge">
                      {getModerationStatusLabel(auction.moderationStatus)}
                    </span>
                  </div>

                  <h4>{auction.title}</h4>

                  <p className="auction-description">{auction.description}</p>

                  <div className="auction-meta">
                    <p>
                      <strong>الفئة:</strong> {auction.categoryName}
                    </p>
                    <p>
                      <strong>البائع:</strong> {auction.sellerName}
                    </p>
                    <p>
                      <strong>السعر الحالي:</strong>{" "}
                      {formatAuctionPrice(auction.currentPrice)} دولار
                    </p>
                    <p>
                      <strong>السعر الابتدائي:</strong>{" "}
                      {formatAuctionPrice(auction.startingPrice)} دولار
                    </p>
                    <p>
                      <strong>يبدأ من:</strong> {formatDateTime(auction.startedAt)}
                    </p>
                    <p>
                      <strong>ينتهي في:</strong> {formatDateTime(auction.expiresAt)}
                    </p>
                  </div>

                  <p className="auction-time">
                    الحالة الزمنية: {formatAuctionTimeLeft(auction.expiresAt)}
                  </p>

                  <Link
                    to={`/auctions/${auction.id}`}
                    className="primary-btn topbar-link-btn card-btn"
                  >
                    عرض التفاصيل
                  </Link>
                </div>
              </article>
            ))}
          </section>

          {pagination.lastPage > 1 ? (
            <div className="my-auctions-pagination">
              <button
                type="button"
                className="ghost-btn"
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={!pagination.hasPreviousPage}
              >
                الصفحة السابقة
              </button>

              <div className="my-auctions-page-numbers">
                {visiblePages.map((page) => (
                  <button
                    key={page}
                    type="button"
                    className={
                      page === pagination.currentPage
                        ? "my-auctions-page-number active"
                        : "my-auctions-page-number"
                    }
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                type="button"
                className="ghost-btn"
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={!pagination.hasNextPage}
              >
                الصفحة التالية
              </button>
            </div>
          ) : null}
        </>
      )}
    </section>
  );
}

export default MyAuctionsPage;