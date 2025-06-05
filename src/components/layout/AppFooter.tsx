import Link from "next/link";

const AppFooter = () => {
  return (
    <footer
      className="bg-white dark:bg-dark-light text-gray-700 dark:text-gray-300"
      data-oid="87sirbu"
    >
      {/* Newsletter */}
      <div
        className="bg-gradient-to-r from-primary/5 to-accent/5 dark:from-primary/10 dark:to-accent/10"
        data-oid="vuqqq_z"
      >
        <div className="container mx-auto px-4 py-12" data-oid="iw6cij:">
          <div
            className="flex flex-col md:flex-row items-center justify-between"
            data-oid="owbn_sy"
          >
            <div className="mb-8 md:mb-0" data-oid="-ji2qev">
              <h3
                className="text-2xl font-bold mb-4 text-gray-800 dark:text-white"
                data-oid="5et-uzq"
              >
                İndirimleri Kaçırmayın!
              </h3>
              <p
                className="text-gray-600 dark:text-gray-400 max-w-md"
                data-oid="07pjsd4"
              >
                Özel kampanyalar ve yeni ürünlerden haberdar olmak için e-posta
                listemize kaydolun.
              </p>
            </div>
            <div className="w-full md:w-auto" data-oid="yn8b-9h">
              <form
                className="flex flex-col sm:flex-row gap-4"
                data-oid="l041za4"
              >
                <input
                  type="email"
                  placeholder="E-posta adresiniz"
                  className="input min-w-[280px]"
                  required
                  data-oid="uouidh1"
                />

                <button
                  type="submit"
                  className="btn btn-primary"
                  data-oid="_ne95lm"
                >
                  Abone Ol
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12" data-oid="u2ln7dy">
        <div
          className="grid grid-cols-1 md:grid-cols-12 gap-8"
          data-oid=".-clx0-"
        >
          {/* Brand */}
          <div className="md:col-span-3" data-oid="1-osa:j">
            <Link href="/" className="inline-block mb-6" data-oid="gq:c_bv">
              <div className="flex items-center" data-oid="vxqycnf">
                <span
                  className="text-2xl font-bold tracking-tighter relative"
                  data-oid="xp2mmgi"
                >
                  <span
                    className="text-primary dark:text-accent"
                    data-oid="1649aw."
                  >
                    HD
                  </span>
                  <span
                    className="text-gray-800 dark:text-white"
                    data-oid="8gw:las"
                  >
                    Ticaret
                  </span>
                  <span
                    className="text-xs text-secondary ml-1 absolute -right-4 top-0"
                    data-oid="_r-tvl3"
                  >
                    .com
                  </span>
                </span>
              </div>
            </Link>
            <p
              className="text-gray-500 dark:text-gray-400 mb-6"
              data-oid="2q4-rte"
            >
              Premium ürünlerle online alışveriş deneyimi sunan Türkiye'nin en
              kaliteli e-ticaret sitesi.
            </p>
            <div className="flex space-x-4" data-oid="pigth:f">
              {/* Social Media Icons */}
              {["facebook", "twitter", "instagram", "youtube"].map((social) => (
                <Link
                  key={social}
                  href={`https://${social}.com/hdticaret`}
                  className="bg-gray-100 dark:bg-dark hover:bg-primary dark:hover:bg-accent hover:text-white transition-colors duration-200 w-10 h-10 rounded-full flex items-center justify-center"
                  aria-label={social}
                  data-oid="v.yap_2"
                >
                  <span className="sr-only" data-oid="_eda4ke">
                    {social}
                  </span>
                  <svg
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    data-oid="j7-1syr"
                  >
                    {/* Simple icon placeholders - would use actual SVGs in real implementation */}
                    <rect
                      width="20"
                      height="20"
                      x="2"
                      y="2"
                      rx="5"
                      ry="5"
                      data-oid="99n2oxi"
                    />
                  </svg>
                </Link>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-2" data-oid="5.uuy.f">
            <h3
              className="text-lg font-semibold mb-4 text-gray-800 dark:text-white"
              data-oid="07603d0"
            >
              Hızlı Erişim
            </h3>
            <ul className="space-y-3" data-oid="5cm4nwu">
              {[
                "Ürünler",
                "Kampanyalar",
                "Yeni Gelenler",
                "Çok Satanlar",
                "Outlet",
              ].map((item) => (
                <li key={item} data-oid="i22f0q3">
                  <Link
                    href={`/${item.toLowerCase().replace(" ", "-")}`}
                    className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-accent transition-colors"
                    data-oid="feylz6:"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div className="md:col-span-2" data-oid="8_1r2_m">
            <h3
              className="text-lg font-semibold mb-4 text-gray-800 dark:text-white"
              data-oid="4wcy.jj"
            >
              Kategoriler
            </h3>
            <ul className="space-y-3" data-oid="1q6i7-0">
              {[
                "Elektronik",
                "Giyim",
                "Ev & Yaşam",
                "Kozmetik",
                "Aksesuar",
              ].map((category) => (
                <li key={category} data-oid="jfwccw-">
                  <Link
                    href={`/category/${category.toLowerCase().replace(" & ", "-")}`}
                    className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-accent transition-colors"
                    data-oid="-qubv5_"
                  >
                    {category}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div className="md:col-span-2" data-oid="u3m1tt9">
            <h3
              className="text-lg font-semibold mb-4 text-gray-800 dark:text-white"
              data-oid="9qtgf_0"
            >
              Destek
            </h3>
            <ul className="space-y-3" data-oid="4nhfuly">
              {[
                "Yardım Merkezi",
                "Sipariş Takibi",
                "İade & Değişim",
                "Sıkça Sorulan Sorular",
                "İletişim",
              ].map((item) => (
                <li key={item} data-oid="gyp3z8u">
                  <Link
                    href={`/${item.toLowerCase().replace(" & ", "-").replace(" ", "-")}`}
                    className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-accent transition-colors"
                    data-oid="f0w99xg"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="md:col-span-3" data-oid="9spu:7l">
            <h3
              className="text-lg font-semibold mb-4 text-gray-800 dark:text-white"
              data-oid="lnczs_8"
            >
              İletişim
            </h3>
            <div className="space-y-4" data-oid="i4-5lvm">
              <div className="flex items-start" data-oid="ctopdql">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-3 text-primary dark:text-accent"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  data-oid="uv6dy66"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    data-oid="nput6da"
                  />

                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    data-oid="vjfnui1"
                  />
                </svg>
                <address
                  className="not-italic text-gray-600 dark:text-gray-400"
                  data-oid="hb-m-et"
                >
                  Atatürk Caddesi, No:123
                  <br data-oid="y8rfkem" />
                  Şişli, İstanbul 34349
                </address>
              </div>
              <div className="flex items-center" data-oid="syke9.h">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-3 text-primary dark:text-accent"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  data-oid="ij50z29"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    data-oid="upul1yw"
                  />
                </svg>
                <span
                  className="text-gray-600 dark:text-gray-400"
                  data-oid="3cr_rpj"
                >
                  0850 123 45 67
                </span>
              </div>
              <div className="flex items-center" data-oid="41ioj4t">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-3 text-primary dark:text-accent"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  data-oid="8vg4m2y"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    data-oid="b._4mm4"
                  />
                </svg>
                <span
                  className="text-gray-600 dark:text-gray-400"
                  data-oid="osijsu3"
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
        data-oid="eohrff5"
      >
        <div className="container mx-auto px-4 py-6" data-oid="lx6vtin">
          <div
            className="flex flex-col md:flex-row justify-between items-center"
            data-oid="476s41."
          >
            <div className="mb-4 md:mb-0" data-oid="wnklcno">
              <p
                className="text-gray-500 dark:text-gray-400 text-sm"
                data-oid="yl54wua"
              >
                &copy; {new Date().getFullYear()} HDTicaret.com - Tüm hakları
                saklıdır
              </p>
            </div>
            <div className="flex flex-wrap gap-4" data-oid="6uk8ex:">
              {/* Payment method icons */}
              <div className="flex gap-2" data-oid="m:x9gio">
                {["visa", "mastercard", "paypal", "troy"].map((payment) => (
                  <div
                    key={payment}
                    className="bg-gray-100 dark:bg-dark p-2 rounded-md h-8 w-12 flex items-center justify-center"
                    aria-label={payment}
                    data-oid="6nvwh2."
                  >
                    <span
                      className="text-xs text-gray-500 dark:text-gray-400"
                      data-oid="7x1hviy"
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
