import Link from "next/link";

const AppFooter = () => {
  return (
    <footer
      className="bg-white dark:bg-dark-light text-gray-700 dark:text-gray-300"
      data-oid="gs0zaav"
    >
      {/* Newsletter */}
      <div
        className="bg-gradient-to-r from-primary/5 to-accent/5 dark:from-primary/10 dark:to-accent/10"
        data-oid="51::k78"
      >
        <div className="container mx-auto px-4 py-12" data-oid="www:9yb">
          <div
            className="flex flex-col md:flex-row items-center justify-between"
            data-oid="i_.nkme"
          >
            <div className="mb-8 md:mb-0" data-oid="ayt-ww9">
              <h3
                className="text-2xl font-bold mb-4 text-gray-800 dark:text-white"
                data-oid="j47roi5"
              >
                İndirimleri Kaçırmayın!
              </h3>
              <p
                className="text-gray-600 dark:text-gray-400 max-w-md"
                data-oid="plyr:o6"
              >
                Özel kampanyalar ve yeni ürünlerden haberdar olmak için e-posta
                listemize kaydolun.
              </p>
            </div>
            <div className="w-full md:w-auto" data-oid="-x489sm">
              <form
                className="flex flex-col sm:flex-row gap-4"
                data-oid="dgso72o"
              >
                <input
                  type="email"
                  placeholder="E-posta adresiniz"
                  className="input min-w-[280px]"
                  required
                  data-oid="o0taw7r"
                />

                <button
                  type="submit"
                  className="btn btn-primary"
                  data-oid="8uqeuxa"
                >
                  Abone Ol
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12" data-oid="ca_bjv_">
        <div
          className="grid grid-cols-1 md:grid-cols-12 gap-8"
          data-oid="tzbknro"
        >
          {/* Brand */}
          <div className="md:col-span-3" data-oid="jpqu0p:">
            <Link href="/" className="inline-block mb-6" data-oid="l8s22u6">
              <div className="flex items-center" data-oid="rb8su2u">
                <span
                  className="text-2xl font-bold tracking-tighter relative"
                  data-oid="iziyuwb"
                >
                  <span
                    className="text-primary dark:text-accent"
                    data-oid="g4du0qm"
                  >
                    HD
                  </span>
                  <span
                    className="text-gray-800 dark:text-white"
                    data-oid="3.fl6.c"
                  >
                    Ticaret
                  </span>
                  <span
                    className="text-xs text-secondary ml-1 absolute -right-4 top-0"
                    data-oid=".bmjrgr"
                  >
                    .com
                  </span>
                </span>
              </div>
            </Link>
            <p
              className="text-gray-500 dark:text-gray-400 mb-6"
              data-oid="u1u_xhy"
            >
              Premium ürünlerle online alışveriş deneyimi sunan Türkiye'nin en
              kaliteli e-ticaret sitesi.
            </p>
            <div className="flex space-x-4" data-oid="738jk8u">
              {/* Social Media Icons */}
              {["facebook", "twitter", "instagram", "youtube"].map((social) => (
                <Link
                  key={social}
                  href={`https://${social}.com/hdticaret`}
                  className="bg-gray-100 dark:bg-dark hover:bg-primary dark:hover:bg-accent hover:text-white transition-colors duration-200 w-10 h-10 rounded-full flex items-center justify-center"
                  aria-label={social}
                  data-oid="ly9cyid"
                >
                  <span className="sr-only" data-oid="unn-7qd">
                    {social}
                  </span>
                  <svg
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    data-oid="zvsikj."
                  >
                    {/* Simple icon placeholders - would use actual SVGs in real implementation */}
                    <rect
                      width="20"
                      height="20"
                      x="2"
                      y="2"
                      rx="5"
                      ry="5"
                      data-oid="qsq8u4l"
                    />
                  </svg>
                </Link>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-2" data-oid="2d0456k">
            <h3
              className="text-lg font-semibold mb-4 text-gray-800 dark:text-white"
              data-oid="omoy:xk"
            >
              Hızlı Erişim
            </h3>
            <ul className="space-y-3" data-oid="ok_8hes">
              {[
                "Ürünler",
                "Kampanyalar",
                "Yeni Gelenler",
                "Çok Satanlar",
                "Outlet",
              ].map((item) => (
                <li key={item} data-oid="cm39-h0">
                  <Link
                    href={`/${item.toLowerCase().replace(" ", "-")}`}
                    className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-accent transition-colors"
                    data-oid="q_fdq_p"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div className="md:col-span-2" data-oid="_n6gq:v">
            <h3
              className="text-lg font-semibold mb-4 text-gray-800 dark:text-white"
              data-oid="tehceg1"
            >
              Kategoriler
            </h3>
            <ul className="space-y-3" data-oid="xa:a-64">
              {[
                "Elektronik",
                "Giyim",
                "Ev & Yaşam",
                "Kozmetik",
                "Aksesuar",
              ].map((category) => (
                <li key={category} data-oid="3irki2e">
                  <Link
                    href={`/category/${category.toLowerCase().replace(" & ", "-")}`}
                    className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-accent transition-colors"
                    data-oid="li2q2_z"
                  >
                    {category}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div className="md:col-span-2" data-oid="zv2_zti">
            <h3
              className="text-lg font-semibold mb-4 text-gray-800 dark:text-white"
              data-oid="8jylh_."
            >
              Destek
            </h3>
            <ul className="space-y-3" data-oid="vt3kq42">
              {[
                "Yardım Merkezi",
                "Sipariş Takibi",
                "İade & Değişim",
                "Sıkça Sorulan Sorular",
                "İletişim",
              ].map((item) => (
                <li key={item} data-oid="nehyki0">
                  <Link
                    href={`/${item.toLowerCase().replace(" & ", "-").replace(" ", "-")}`}
                    className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-accent transition-colors"
                    data-oid="6a-8r1_"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="md:col-span-3" data-oid="fs2agcm">
            <h3
              className="text-lg font-semibold mb-4 text-gray-800 dark:text-white"
              data-oid="9owlpf:"
            >
              İletişim
            </h3>
            <div className="space-y-4" data-oid="as:u_j.">
              <div className="flex items-start" data-oid=":7bsulu">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-3 text-primary dark:text-accent"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  data-oid="3eorq7-"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    data-oid="njdp66:"
                  />

                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    data-oid="kkuyjvi"
                  />
                </svg>
                <address
                  className="not-italic text-gray-600 dark:text-gray-400"
                  data-oid="m_ym:.s"
                >
                  Atatürk Caddesi, No:123
                  <br data-oid="01hj0kf" />
                  Şişli, İstanbul 34349
                </address>
              </div>
              <div className="flex items-center" data-oid=".4zie2_">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-3 text-primary dark:text-accent"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  data-oid="46-7c5c"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    data-oid="0ssrf5a"
                  />
                </svg>
                <span
                  className="text-gray-600 dark:text-gray-400"
                  data-oid="pf5cv4p"
                >
                  0850 123 45 67
                </span>
              </div>
              <div className="flex items-center" data-oid="llag_ag">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-3 text-primary dark:text-accent"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  data-oid="ohybsbd"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    data-oid="qtdq4_x"
                  />
                </svg>
                <span
                  className="text-gray-600 dark:text-gray-400"
                  data-oid="jzzv716"
                >
                  info@hdticaret.com
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Methods + Copyright */}
      <div
        className="border-t border-gray-200 dark:border-dark-lighter"
        data-oid="ng9_x:k"
      >
        <div className="container mx-auto px-4 py-6" data-oid="6adsda9">
          <div
            className="flex flex-col md:flex-row justify-between items-center"
            data-oid="nz97zri"
          >
            <div className="mb-4 md:mb-0" data-oid="br0y:8e">
              <p
                className="text-gray-500 dark:text-gray-400 text-sm"
                data-oid="e.i6al4"
              >
                &copy; {new Date().getFullYear()} HDTicaret.com - Tüm hakları
                saklıdır
              </p>
            </div>
            <div className="flex flex-wrap gap-4" data-oid="bu9mrhn">
              {/* Payment method icons */}
              <div className="flex gap-2" data-oid="y4gi15u">
                {["visa", "mastercard", "paypal", "troy"].map((payment) => (
                  <div
                    key={payment}
                    className="bg-gray-100 dark:bg-dark p-2 rounded-md h-8 w-12 flex items-center justify-center"
                    aria-label={payment}
                    data-oid="4-c9b02"
                  >
                    <span
                      className="text-xs text-gray-500 dark:text-gray-400"
                      data-oid="s616x1g"
                    >
                      {payment}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default AppFooter;
