const featuredAuctions = [
  {
    id: 1,
    title: "ساعة فاخرة إصدار محدود",
    price: "12,500",
    timeLeft: "2 يوم 5 ساعات",
    image:
      "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 2,
    title: "سيارة كلاسيكية نادرة",
    price: "900,000",
    timeLeft: "1 يوم 8 ساعات",
    image:
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 3,
    title: "مزهرية أثرية مزخرفة",
    price: "24,000",
    timeLeft: "3 أيام 2 ساعة",
    image:
      "https://images.unsplash.com/photo-1578500351865-2de31d2a5a07?auto=format&fit=crop&w=800&q=80",
  },
];

function HomePage() {
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
            <button className="accent-btn">ابدأ المزايدة الآن</button>
            <button className="ghost-btn dark-ghost">استكشف المزادات</button>
          </div>
        </div>

        <div className="hero-card">
          <img
            src="https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=1000&q=80"
            alt="مزاد مميز"
          />
        </div>
      </section>

      <section className="section-header">
        <div>
          <h3>مزادات مميزة</h3>
          <p>هذه بيانات ثابتة مؤقتًا إلى أن نربط القائمة الحقيقية من الباك.</p>
        </div>
      </section>

      <section className="cards-grid">
        {featuredAuctions.map((auction) => (
          <article key={auction.id} className="auction-card">
            <div className="auction-image-wrapper">
              <img src={auction.image} alt={auction.title} className="auction-image" />
            </div>

            <div className="auction-content">
              <h4>{auction.title}</h4>
              <p className="auction-price">{auction.price} دولار</p>
              <p className="auction-time">{auction.timeLeft}</p>
              <button className="accent-btn card-btn">زايد الآن</button>
            </div>
          </article>
        ))}
      </section>
    </>
  );
}

export default HomePage;