import Link from "next/link";

const AppFooter = () => {
  return (
    <footer
      className="bg-white dark:bg-dark-light text-gray-700 dark:text-gray-300"
      data-oid="d1_6vow"
    >
      {/* Newsletter */}
      <div
        className="bg-gradient-to-r from-primary/5 to-accent/5 dark:from-primary/10 dark:to-accent/10"
        data-oid=":rcvixa"
      >
        <div className="container mx-auto px-4 py-12" data-oid="16qgb8d">
          <div
            className="flex flex-col md:flex-row items-center justify-between"
            data-oid=".a7ke25"
          >
            <div className="mb-8 md:mb-0" data-oid="v7pynpt">
              <h3
                className="text-2xl font-bold mb-4 text-gray-800 dark:text-white"
                data-oid="i6ee5zc"
              >
                İndirimleri Kaçırmayın!
              </h3>
              <p
                className="text-gray-600 dark:text-gray-400 max-w-md"
                data-oid="tzp54p_"
              >
                Özel kampanyalar ve yeni ürünlerden haberdar olmak için e-posta
                listemize kaydolun.
              </p>
            </div>
            <div className="w-full md:w-auto" data-oid="tl7f4wc">
              <form
                className="flex flex-col sm:flex-row gap-4"
                data-oid="0jf9dws"
              >
                <input
                  type="email"
                  placeholder="E-posta adresiniz"
                  className="input min-w-[280px]"
                  required
                  data-oid="tsh5gtb"
                />

                <button
                  type="submit"
                  className="btn btn-primary"
                  data-oid="7m2cb_7"
                >
                  Abone Ol
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12" data-oid="pgy8ok3">
        <div
          className="grid grid-cols-1 md:grid-cols-12 gap-8"
          data-oid="0bvr969"
        >
          {/* Brand */}
          <div className="md:col-span-3" data-oid="c30mk2v">
            <Link href="/" className="inline-block mb-6" data-oid="u.zs6qb">
              <div className="flex items-center" data-oid="2o5u0wb">
                <span
                  className="text-2xl font-bold tracking-tighter relative"
                  data-oid="9v02wzq"
                >
                  <span
                    className="text-primary dark:text-accent"
                    data-oid="1il20.m"
                  >
                    HD
                  </span>
                  <span
                    className="text-gray-800 dark:text-white"
                    data-oid="b2i.zn0"
                  >
                    Ticaret
                  </span>
                  <span
                    className="text-xs text-secondary ml-1 absolute -right-4 top-0"
                    data-oid="d5kgqpj"
                  >
                    .com
                  </span>
                </span>
              </div>
            </Link>
            <p
              className="text-gray-500 dark:text-gray-400 mb-6"
              data-oid="_h99ufk"
            >
              Premium ürünlerle online alışveriş deneyimi sunan Türkiye'nin en
              kaliteli e-ticaret sitesi.
            </p>
            <div className="flex space-x-4" data-oid="wn85c1z">
              {/* Social Media Icons */}
              {["facebook", "twitter", "instagram", "youtube"].map((social) => (
                <Link
                  key={social}
                  href={`https://${social}.com/hdticaret`}
                  className="bg-gray-100 dark:bg-dark hover:bg-primary dark:hover:bg-accent hover:text-white transition-colors duration-200 w-10 h-10 rounded-full flex items-center justify-center"
                  aria-label={social}
                  data-oid="r.u1o1a"
                >
                  <span className="sr-only" data-oid="a4_p3ub">
                    {social}
                  </span>
                  <svg
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    data-oid="z15qj6-"
                  >
                    {/* Simple icon placeholders - would use actual SVGs in real implementation */}
                    <rect
                      width="20"
                      height="20"
                      x="2"
                      y="2"
                      rx="5"
                      ry="5"
                      data-oid="iwgp610"
                    />
                  </svg>
                </Link>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-2" data-oid="-4m4emm">
            <h3
              className="text-lg font-semibold mb-4 text-gray-800 dark:text-white"
              data-oid="lp95iaf"
            >
              Hızlı Erişim
            </h3>
            <ul className="space-y-3" data-oid="wsyao82">
              {[
                "Ürünler",
                "Kampanyalar",
                "Yeni Gelenler",
                "Çok Satanlar",
                "Outlet",
              ].map((item) => (
                <li key={item} data-oid="9fcjrkn">
                  <Link
                    href={`/${item.toLowerCase().replace(" ", "-")}`}
                    className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-accent transition-colors"
                    data-oid="e8h8bad"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div className="md:col-span-2" data-oid="96kwmd-">
            <h3
              className="text-lg font-semibold mb-4 text-gray-800 dark:text-white"
              data-oid="_-hn9:k"
            >
              Kategoriler
            </h3>
            <ul className="space-y-3" data-oid="dd7:bqo">
              {[
                "Elektronik",
                "Giyim",
                "Ev & Yaşam",
                "Kozmetik",
                "Aksesuar",
              ].map((category) => (
                <li key={category} data-oid="wmaw9ce">
                  <Link
                    href={`/category/${category.toLowerCase().replace(" & ", "-")}`}
                    className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-accent transition-colors"
                    data-oid="bmv3_xn"
                  >
                    {category}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div className="md:col-span-2" data-oid="g43e:93">
            <h3
              className="text-lg font-semibold mb-4 text-gray-800 dark:text-white"
              data-oid=".t82au-"
            >
              Destek
            </h3>
            <ul className="space-y-3" data-oid="o7850-3">
              {[
                "Yardım Merkezi",
                "Sipariş Takibi",
                "İade & Değişim",
                "Sıkça Sorulan Sorular",
                "İletişim",
              ].map((item) => (
                <li key={item} data-oid="-:c10zi">
                  <Link
                    href={`/${item.toLowerCase().replace(" & ", "-").replace(" ", "-")}`}
                    className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-accent transition-colors"
                    data-oid="f3:d.-d"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="md:col-span-3" data-oid="1.h8wm8">
            <h3
              className="text-lg font-semibold mb-4 text-gray-800 dark:text-white"
              data-oid="42ddjwl"
            >
              İletişim
            </h3>
            <div className="space-y-4" data-oid="dvfodq.">
              <div className="flex items-start" data-oid="j7n6t4:">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-3 text-primary dark:text-accent"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  data-oid="wo8yw5o"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    data-oid="4.ivcha"
                  />

                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    data-oid="583yql2"
                  />
                </svg>
                <address
                  className="not-italic text-gray-600 dark:text-gray-400"
                  data-oid="zyvd2aj"
                >
                  Atatürk Caddesi, No:123
                  <br data-oid="jt8dc-a" />
                  Şişli, İstanbul 34349
                </address>
              </div>
              <div className="flex items-center" data-oid="j8ydf47">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-3 text-primary dark:text-accent"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  data-oid="2r3:d26"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    data-oid="yl5fv0-"
                  />
                </svg>
                <span
                  className="text-gray-600 dark:text-gray-400"
                  data-oid="ls7h901"
                >
                  0850 123 45 67
                </span>
              </div>
              <div className="flex items-center" data-oid="3z8h1em">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-3 text-primary dark:text-accent"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  data-oid="7i8ggs:"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    data-oid="3-m:r24"
                  />
                </svg>
                <span
                  className="text-gray-600 dark:text-gray-400"
                  data-oid="wudqtaq"
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
        data-oid="z7odmf2"
      >
        <div className="container mx-auto px-4 py-6" data-oid="thmcfji">
          <div
            className="flex flex-col md:flex-row justify-between items-center"
            data-oid="nies1u:"
          >
            <div className="mb-4 md:mb-0" data-oid="3ct68dk">
              <p
                className="text-gray-500 dark:text-gray-400 text-sm"
                data-oid="5o0hjko"
              >
                &copy; {new Date().getFullYear()} HDTicaret.com - Tüm hakları
                saklıdır
              </p>
            </div>
            <div className="flex flex-wrap gap-4" data-oid="hw9_850">
              {/* Payment method icons */}
              <div className="flex gap-2" data-oid="_5t3zqn">
                {["visa", "mastercard", "paypal", "troy"].map((payment) => (
                  <div
                    key={payment}
                    className="bg-gray-100 dark:bg-dark p-2 rounded-md h-8 w-12 flex items-center justify-center"
                    aria-label={payment}
                    data-oid="q:4-hgq"
                  >
                    <span
                      className="text-xs text-gray-500 dark:text-gray-400"
                      data-oid="mupx87."
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
