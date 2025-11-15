"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaYoutube,
  FaEyeSlash,
  FaEye,
} from "react-icons/fa";
import { HiOutlineLocationMarker, HiOutlinePhone, HiOutlineMail } from "react-icons/hi";

const AppFooter = () => {
  const [isFooterVisible, setIsFooterVisible] = useState(true);

  // Load footer visibility from localStorage
  useEffect(() => {
    const savedVisibility = localStorage.getItem('footerVisible');
    if (savedVisibility !== null) {
      setIsFooterVisible(JSON.parse(savedVisibility));
    }
  }, []);

  // Toggle footer visibility
  const toggleFooterVisibility = () => {
    const newVisibility = !isFooterVisible;
    setIsFooterVisible(newVisibility);
    localStorage.setItem('footerVisible', JSON.stringify(newVisibility));
  };

  if (!isFooterVisible) {
    // Footer gizliyken mouse scroll benzeri indicator göster
    return (
      <div className="bg-white dark:bg-dark-light flex justify-center py-6">
        <button
          onClick={toggleFooterVisibility}
          className="group flex flex-col items-center space-y-2 animate-bounce-slow hover:animate-none transition-all duration-300"
          title="Footer'ı Göster"
          style={{ animationDuration: '3s' }}
        >
          <div className="text-xs text-gray-400 font-light tracking-wider">FOOTER</div>
          <div className="w-6 h-10 border-2 border-gray-300 rounded-full flex justify-center hover:border-blue-400 transition-colors duration-300">
            <div className="w-1 h-3 bg-gray-400 rounded-full mt-2 animate-pulse group-hover:bg-blue-400 transition-colors duration-300"></div>
          </div>
          <svg
            className="w-4 h-4 text-gray-400 group-hover:text-blue-400 transition-colors duration-3000"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 10l7-7m0 0l7 7m-7-7v18"
            />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Footer Toggle Button - Footer görünürken */}
      <div className="bg-white dark:bg-dark-light flex justify-center py-2">
        <button
          onClick={toggleFooterVisibility}
          className="group flex flex-col items-center space-y-1 hover:animate-pulse transition-all duration-300"
          title="Footer'ı Gizle"
        >
          <div className="text-xs text-gray-400 font-light tracking-wider">GİZLE</div>
          <div className="w-5 h-8 border-2 border-gray-300 rounded-full flex justify-center hover:border-red-400 transition-colors duration-300">
            <div className="w-0.5 h-2 bg-gray-400 rounded-full mt-1.5 group-hover:bg-red-400 transition-colors duration-300"></div>
          </div>
          <svg
            className="w-3 h-3 text-gray-400 group-hover:text-red-400 transition-colors duration-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </button>
      </div>

      {/* Footer Content */}
      <footer
        className="bg-white dark:bg-dark-light text-gray-700 dark:text-gray-300"
        data-oid="n14m.jw"
      >
        {/* Newsletter */}
        <div
          className="bg-gradient-to-r from-primary/5 to-accent/5 dark:from-primary/10 dark:to-accent/10"
          data-oid="m1dzm.7"
        >

        </div>

        {/* Main Footer */}
        <div className="container mx-auto px-4 py-12" data-oid="ecwbfyp">
          <div
            className="grid grid-cols-1 md:grid-cols-12 gap-8"
            data-oid="n56290s"
          >
            {/* Brand */}
            <div className="md:col-span-3" data-oid="7hircff">
              <Link href="/" className="inline-block mb-6" data-oid="2oi90sr">
                <div className="flex items-center" data-oid="x-0rq.o">
                  <span
                    className="text-2xl font-bold tracking-tighter relative"
                    data-oid="whgr1yo"
                  >
                    <span
                      className="text-primary dark:text-accent"
                      data-oid="m1.pjh0"
                    >
                      HD
                    </span>
                    <span
                      className="text-gray-800 dark:text-white"
                      data-oid="0eirfq4"
                    >
                      Ticaret
                    </span>
                    <span
                      className="text-xs text-secondary ml-1 absolute -right-4 top-0"
                      data-oid="g.5hlfc"
                    >
                      .com
                    </span>
                  </span>
                </div>
              </Link>
              <p
                className="text-gray-500 dark:text-gray-400 mb-6"
                data-oid="pgu5s6e"
              >
                Profesyonel 3D printing çözümleri, filamentler ve 3D yazıcılar
              </p>
              <div className="flex space-x-4" data-oid="iispji-">
                {/* Social Media Icons */}
                {[
                  { name: "Facebook", icon: <FaFacebookF size={18} /> },
                  { name: "Twitter", icon: <FaTwitter size={18} /> },
                  { name: "Instagram", icon: <FaInstagram size={18} /> },
                  { name: "YouTube", icon: <FaYoutube size={18} /> }
                ].map((social) => (
                  <Link
                    key={social.name}
                    href={`https://${social.name.toLowerCase()}.com/hdticaret`}
                    className="bg-gray-100 dark:bg-dark hover:bg-primary dark:hover:bg-accent hover:text-white transition-colors duration-200 w-10 h-10 rounded-full flex items-center justify-center"
                    aria-label={social.name}
                    data-oid="8_fa984"
                  >
                    <span className="sr-only">{social.name}</span>
                    {social.icon}
                  </Link>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div className="md:col-span-2" data-oid="-r27xx_">
              <h3
                className="text-lg font-semibold mb-4 text-gray-800 dark:text-white"
                data-oid="i51g965"
              >
                Hızlı Erişim
              </h3>
              <ul className="space-y-3" data-oid="xs:69-x">
                {[
                  "Ürünler",
                  "Kampanyalar",
                  "Yeni Gelenler",
                  "Çok Satanlar",
                  "Outlet",
                ].map((item) => (
                  <li key={item} data-oid="jefg:j3">
                    <Link
                      href={`/${item.toLowerCase().replace(" ", "-")}`}
                      className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-accent transition-colors"
                      data-oid="v3pfhbv"
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Categories */}
            <div className="md:col-span-2" data-oid="q.31.0l">
              <h3
                className="text-lg font-semibold mb-4 text-gray-800 dark:text-white"
                data-oid="jj1ghbm"
              >
                Kategoriler
              </h3>
              <ul className="space-y-3" data-oid="t_duapf">
                {[
                  "Elektronik",
                  "Giyim",
                  "Ev & Yaşam",
                  "Kozmetik",
                  "Aksesuar",
                ].map((category) => (
                  <li key={category} data-oid="xl:1zmx">
                    <Link
                      href={`/category/${category.toLowerCase().replace(" & ", "-")}`}
                      className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-accent transition-colors"
                      data-oid="q.pl83."
                    >
                      {category}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div className="md:col-span-2" data-oid="1ayavp2">
              <h3
                className="text-lg font-semibold mb-4 text-gray-800 dark:text-white"
                data-oid="-zlvgr4"
              >
                Destek
              </h3>
              <ul className="space-y-3" data-oid="w4xiqlh">
                {[
                  "Yardım Merkezi",
                  "Sipariş Takibi",
                  "İade & Değişim",
                  "Sıkça Sorulan Sorular",
                  "İletişim",
                ].map((item) => (
                  <li key={item} data-oid="e8_h9.2">
                    <Link
                      href={`/${item.toLowerCase().replace(" & ", "-").replace(" ", "-")}`}
                      className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-accent transition-colors"
                      data-oid="5_mai.m"
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div className="md:col-span-3" data-oid="8a7uh26">
              <h3
                className="text-lg font-semibold mb-4 text-gray-800 dark:text-white"
                data-oid="v778d2g"
              >
                İletişim
              </h3>
              <div className="space-y-4" data-oid="_g-lnc2">
                <div className="flex items-start" data-oid="ft_nwdw">
                  <HiOutlineLocationMarker className="h-5 w-5 mr-3 text-primary dark:text-accent" />
                  <address
                    className="not-italic text-gray-600 dark:text-gray-400"
                    data-oid="toetrii"
                  >
                    Atatürk Caddesi, No:123
                    <br data-oid="08rvbpr" />
                    Şişli, İstanbul 34349
                  </address>
                </div>
                <div className="flex items-center" data-oid="25ylfsc">
                  <HiOutlinePhone className="h-5 w-5 mr-3 text-primary dark:text-accent" />
                  <span
                    className="text-gray-600 dark:text-gray-400"
                    data-oid="bv:.5xx"
                  >
                    0850 123 45 67
                  </span>
                </div>
                <div className="flex items-center" data-oid="vzsntc:">
                  <HiOutlineMail className="h-5 w-5 mr-3 text-primary dark:text-accent" />
                  <span
                    className="text-gray-600 dark:text-gray-400"
                    data-oid="zt.xe49"
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
          data-oid="lnwj0vd"
        >
          <div className="container mx-auto px-4 py-6" data-oid="172tv2y">
            <div
              className="flex flex-col md:flex-row justify-between items-center"
              data-oid="vopyq2y"
            >
              <div className="mb-4 md:mb-0" data-oid="ymmjieg">
                <p
                  className="text-gray-500 dark:text-gray-400 text-sm"
                  data-oid="8f.bas8"
                >
                  &copy; {new Date().getFullYear()} HDTicaret.com - Tüm hakları
                  saklıdır
                </p>
              </div>
              <div className="flex flex-wrap gap-3" data-oid="43fbjcg">
                {/* Payment method icons */}
                <div className="flex gap-2" data-oid="mm:_40l">
                  {[
                    { name: "Troy", filename: "troy.png" },
                    { name: "Apple Pay", filename: "applepay.png" },
                    { name: "Mastercard", filename: "mastercard.png" },
                    { name: "Visa", filename: "visa.png" },
                    { name: "PayPal", filename: "paypal.png" },
                  ].map((payment) => (
                    <div
                      key={payment.name}
                      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-2 rounded-lg h-12 min-w-[60px] flex items-center justify-center shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105"
                      aria-label={payment.name}
                      data-oid="z27eixw"
                    >
                      <Image
                        src={`/images/paymentmethods/${payment.filename}`}
                        alt={payment.name}
                        width={40}
                        height={24}
                        className="object-contain max-h-6"
                      />
                      <span className="sr-only">{payment.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AppFooter;