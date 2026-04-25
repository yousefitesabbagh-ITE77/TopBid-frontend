import { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  fetchActiveAuctions,
  formatAuctionPrice,
  formatAuctionTimeLeft,
} from "../lib/auctions";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=1000&q=80";

function HomePage() {
  const [auctions, setAuctions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadAuctions() {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const loadedAuctions = await fetchActiveAuctions();

        if (isMounted) {
          setAuctions(loadedAuctions);
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(error.message || "تعذر تحميل المزادات الحالية.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadAuctions();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <>
      <section className="hero-section">
        <div className="hero-text">
          <span className="hero-badge">منصة مزادات عربية حديثة</span>
          <h2>اكتشف واقتنِ أندر المقتنيات بثقة وأناقة</h2>
          <p>
            صمّمنا هذه التجربة لتكون واضحة، فخمة، وسهلة الاستخدام سواء كنت
            بائعًا أو مزايدًا أو مجرد زائر يستكشف المزادات الحالية.
          </p>

          <div className="hero-actions">
            <Link to="/home" className="accent-btn topbar-link-btn">
              استكشف المزادات
            </Link>
            <Link to="/create-auction" className="ghost-btn dark-ghost topbar-link-btn">
              أنشئ مزادك الآن
            </Link>
          </div>
        </div>

        <div className="hero-card">
          <img src={HERO_IMAGE} alt="مزاد مميز" />
        </div>
      </section>

      <section className="section-header">
        <div className="section-header-row">
          <div>
            <h3>المزادات الحالية</h3>
            <p>يمكنك الآن الدخول إلى صفحة تفاصيل كل مزاد من هذه القائمة.</p>
          </div>

          {!isLoading && !errorMessage && auctions.length > 0 ? (
            <p className="auctions-count">عدد المزادات المعروضة: {auctions.length}</p>
          ) : null}
        </div>
      </section>

      {isLoading ? (
        <section className="status-box">
          <h4>جارٍ تحميل المزادات...</h4>
          <p>ننتظر الرد الحقيقي من الخادم.</p>
        </section>
      ) : errorMessage ? (
        <section className="status-box error">
          <h4>تعذر تحميل المزادات</h4>
          <p>{errorMessage}</p>
        </section>
      ) : auctions.length === 0 ? (
        <section className="status-box empty">
          <h4>لا توجد مزادات فعالة الآن</h4>
          <p>عندما يوافق الأدمن على مزادات جديدة وتكون فعالة ستظهر هنا.</p>
        </section>
      ) : (
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
                <span className="auction-status">
                  {auction.isActive ? "مزاد نشط" : "غير نشط"}
                </span>

                <h4>{auction.title}</h4>

                <p className="auction-description">{auction.description}</p>

                <div className="auction-meta">
                  <p>
                    <strong>الفئة:</strong> {auction.categoryName}
                  </p>
                  <p>
                    <strong>البائع:</strong> {auction.sellerName}
                  </p>
                </div>

                <p className="auction-price">
                  السعر الحالي: {formatAuctionPrice(auction.currentPrice)} دولار
                </p>

                <p className="auction-time">
                  ينتهي خلال: {formatAuctionTimeLeft(auction.expiresAt)}
                </p>

                <Link
                  to={`/auctions/${auction.id}`}
                  className="primary-btn topbar-link-btn card-btn"
                >
                  عرض التفاصيل والمزايدة
                </Link>
              </div>
            </article>
          ))}
        </section>
      )}
    </>
  );
}

export default HomePage;