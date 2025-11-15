"use client";

import { useState } from "react";

interface ContractData {
  buyer: {
    name: string;
    address: string;
    phone: string;
    email: string;
  };
  seller: {
    name: string;
    address: string;
    phone: string;
    email: string;
    taxNumber: string;
    mersisNumber: string;
  };
  order: {
    id: string;
    date: string;
    items: Array<{
      name: string;
      quantity: number;
      price: number;
      total: number;
    }>;
    subtotal: number;
    shipping: number;
    total: number;
    paymentMethod: string;
  };
}

interface DistanceSalesContractProps {
  contractData: ContractData;
  onAccept: () => void;
  onReject: () => void;
}

export default function DistanceSalesContract({ contractData, onAccept }: DistanceSalesContractProps) {

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="text-center mb-8">
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg p-6 mb-6">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-white bg-opacity-20 rounded-full p-3">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-2">MESAFELİ SATIŞ SÖZLEŞMESİ</h1>
          <p className="text-green-100">6502 Sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği Gereğince</p>
        </div>
      </div>

      <div className="space-y-6 text-sm text-gray-700 max-h-96 overflow-y-auto border border-gray-200 p-4 rounded-lg mb-6">
        
        {/* 1. TARAFLAR */}
        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">1. TARAFLAR</h2>
          <p className="mb-4">
            İşbu Mesafeli Satış Sözleşmesi ("Sözleşme"), Alıcı ve Satıcı arasında aşağıda belirtilen hüküm ve şartlar 
            çerçevesinde elektronik ortamda kurulmuştur. Alıcı ve Satıcı, Sözleşme kapsamında birlikte "Taraflar", 
            ayrı ayrı "Taraf" olarak anılacaktır.
          </p>
        </section>

        {/* 2. TARAFLAR BİLGİLERİ */}
        <section>
          <div className="flex items-center mb-4">
            <div className="bg-purple-100 rounded-full p-2 mr-3">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-800">2. SÖZLEŞME TARAFLARI</h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-4">
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-6">
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 rounded-full p-2 mr-3">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-blue-800">ALICI BİLGİLERİ</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-start">
                  <span className="font-semibold text-blue-700 w-20 flex-shrink-0 text-sm">Ad Soyad:</span>
                  <span className="text-gray-700 text-sm">{contractData.buyer.name}</span>
                </div>
                <div className="flex items-start">
                  <span className="font-semibold text-blue-700 w-20 flex-shrink-0 text-sm">Adres:</span>
                  <span className="text-gray-700 text-sm">{contractData.buyer.address}</span>
                </div>
                <div className="flex items-start">
                  <span className="font-semibold text-blue-700 w-20 flex-shrink-0 text-sm">Telefon:</span>
                  <span className="text-gray-700 text-sm">{contractData.buyer.phone}</span>
                </div>
                <div className="flex items-start">
                  <span className="font-semibold text-blue-700 w-20 flex-shrink-0 text-sm">E-posta:</span>
                  <span className="text-gray-700 text-sm">{contractData.buyer.email}</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
              <div className="flex items-center mb-4">
                <div className="bg-green-100 rounded-full p-2 mr-3">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-green-800">SATICI BİLGİLERİ</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-start">
                  <span className="font-semibold text-green-700 w-20 flex-shrink-0 text-sm">Unvan:</span>
                  <span className="text-gray-700 text-sm">{contractData.seller.name}</span>
                </div>
                <div className="flex items-start">
                  <span className="font-semibold text-green-700 w-20 flex-shrink-0 text-sm">Adres:</span>
                  <span className="text-gray-700 text-sm">{contractData.seller.address}</span>
                </div>
                <div className="flex items-start">
                  <span className="font-semibold text-green-700 w-20 flex-shrink-0 text-sm">Telefon:</span>
                  <span className="text-gray-700 text-sm">{contractData.seller.phone}</span>
                </div>
                <div className="flex items-start">
                  <span className="font-semibold text-green-700 w-20 flex-shrink-0 text-sm">E-posta:</span>
                  <span className="text-gray-700 text-sm">{contractData.seller.email}</span>
                </div>
                <div className="flex items-start">
                  <span className="font-semibold text-green-700 w-20 flex-shrink-0 text-sm">Vergi No:</span>
                  <span className="text-gray-700 text-sm">{contractData.seller.taxNumber}</span>
                </div>
                <div className="flex items-start">
                  <span className="font-semibold text-green-700 w-20 flex-shrink-0 text-sm">MERSİS:</span>
                  <span className="text-gray-700 text-sm">{contractData.seller.mersisNumber}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. SİPARİŞ BİLGİLERİ */}
        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">3. SİPARİŞ BİLGİLERİ</h2>
          
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <p><span className="font-medium">Sipariş No:</span> {contractData.order.id}</p>
              <p><span className="font-medium">Sipariş Tarihi:</span> {contractData.order.date}</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Ürün</th>
                    <th className="text-center py-2">Adet</th>
                    <th className="text-right py-2">Birim Fiyat</th>
                    <th className="text-right py-2">Toplam</th>
                  </tr>
                </thead>
                <tbody>
                  {contractData.order.items.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-2">{item.name}</td>
                      <td className="text-center py-2">{item.quantity}</td>
                      <td className="text-right py-2">₺{item.price.toFixed(2)}</td>
                      <td className="text-right py-2">₺{item.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-b">
                    <td colSpan={3} className="text-right py-2 font-medium">Ara Toplam:</td>
                    <td className="text-right py-2">₺{contractData.order.subtotal.toFixed(2)}</td>
                  </tr>
                  <tr className="border-b">
                    <td colSpan={3} className="text-right py-2 font-medium">Kargo:</td>
                    <td className="text-right py-2">₺{contractData.order.shipping.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td colSpan={3} className="text-right py-2 font-bold">Genel Toplam:</td>
                    <td className="text-right py-2 font-bold">₺{contractData.order.total.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <p className="mt-4"><span className="font-medium">Ödeme Yöntemi:</span> {contractData.order.paymentMethod}</p>
          </div>
        </section>

        {/* 4. GENEL HÜKÜMLER */}
        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">4. GENEL HÜKÜMLER</h2>
          <div className="space-y-3">
            <p>
              4.1. Satıcı, ürünü eksiksiz, siparişte belirtilen niteliklere uygun ve varsa garanti belgeleri, 
              kullanım kılavuzları ile mevzuat gereği ürünle birlikte teslim etmesi gereken sair bilgi ve belgeler 
              ile teslim etmeyi kabul, beyan ve taahhüt eder.
            </p>
            <p>
              4.2. Ürün, Alıcı veya Alıcı tarafından belirlenen üçüncü kişiye, taahhüt edilen teslim süresi içerisinde 
              ve her halükârda 30 (otuz) günlük yasal süreyi aşmamak koşulu ile, Alıcının belirtmiş olduğu teslimat 
              adresine kargo şirketi tarafından teslim edilir.
            </p>
            <p>
              4.3. Alıcı, ürünü teslim almadan önce muayene edecek; ezik, kırık, ambalajı yırtılmış vb. hasarlı, 
              ayıplı veya eksik ürünü teslim almayacaktır.
            </p>
          </div>
        </section>

        {/* 5. CAYMA HAKKI */}
        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">5. CAYMA HAKKI</h2>
          <div className="space-y-3">
            <p>
              5.1. Alıcı, 14 (ondört) gün içinde herhangi bir gerekçe göstermeksizin ve cezai şart ödemeksizin 
              sözleşmeden cayma hakkına sahiptir.
            </p>
            <p>
              5.2. Cayma hakkı süresi, ürün için Alıcının veya Alıcı tarafından belirlenen üçüncü kişinin 
              ürünü teslim aldığı gün başlar.
            </p>
            <p>
              5.3. Cayma hakkının kullanılması halinde, Alıcı cayma hakkını kullanmasından itibaren 14 (ondört) 
              gün içerisinde ürünü Satıcıya kargo şirketiyle geri gönderir.
            </p>
            <p>
              5.4. Cayma hakkı kapsamında iade edilecek ürün kutusu, ambalajı, varsa standart aksesuarları 
              eksiksiz ve hasarsız olarak iade edilmesi gerekmektedir.
            </p>
          </div>
        </section>

        {/* 6. CAYMA HAKKININ KULLANILAMAYACAĞI HALLER */}
        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">6. CAYMA HAKKININ KULLANILAMAYACAĞI HALLER</h2>
          <div className="space-y-2">
            <p>Alıcı aşağıdaki sözleşmelerde cayma hakkını kullanamaz:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Tüketicinin istekleri veya kişisel ihtiyaçları doğrultusunda hazırlanan mallara ilişkin sözleşmeler</li>
              <li>Çabuk bozulabilen veya son kullanma tarihi geçebilecek malların teslimine ilişkin sözleşmeler</li>
              <li>Tesliminden sonra ambalaj, bant, mühür, paket gibi koruyucu unsurları açılmış olan mallardan; 
                  iadesi sağlık ve hijyen açısından uygun olmayanların teslimine ilişkin sözleşmeler</li>
              <li>Elektronik ortamda anında ifa edilen hizmetler ile Alıcıya anında teslim edilen gayri maddi mallara ilişkin sözleşmeler</li>
            </ul>
          </div>
        </section>

        {/* 7. UYUŞMAZLIKLARIN ÇÖZÜMÜ */}
        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">7. UYUŞMAZLIKLARIN ÇÖZÜMÜ</h2>
          <p>
            Sözleşmenin uygulanmasında, Ticaret Bakanlığınca ilan edilen değerlere uygun olarak Alıcının 
            ürünü satın aldığı ve ikametgahının bulunduğu yerdeki Tüketici Hakem Heyetleri ile Tüketici 
            Mahkemeleri yetkilidir.
          </p>
        </section>

        {/* 8. YÜRÜRLÜK */}
        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">8. YÜRÜRLÜK</h2>
          <p>
            İşbu sözleşme, Taraflarca okunarak, işlem tarihinde, Alıcı tarafından elektronik ortamda 
            onaylanmak suretiyle akdedilmiş ve yürürlüğe girmiştir.
          </p>
        </section>
      </div>

      {/* Bilgilendirme Notu */}
      <div className="border-t pt-6">
        <div className="bg-green-50 rounded-lg p-4 mb-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-green-800 font-medium">
              Bu sözleşme yasal gereklilik gereği hazırlanmıştır.
            </p>
          </div>
          <p className="text-xs text-green-600 mt-2 ml-7">
            Siparişinizi tamamladığınızda bu sözleşmeyi kabul etmiş sayılırsınız.
          </p>
        </div>

        <div className="flex justify-center">
          <button
            onClick={onAccept}
            className="py-3 px-8 rounded-lg font-medium bg-green-600 hover:bg-green-700 text-white transition-colors"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}