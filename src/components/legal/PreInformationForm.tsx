"use client";

interface PreInformationData {
  seller: {
    name: string;
    address: string;
    phone: string;
    email: string;
    taxNumber: string;
    mersisNumber: string;
  };
  products: Array<{
    name: string;
    description: string;
    price: number;
    quantity: number;
    features: string[];
  }>;
  delivery: {
    method: string;
    cost: number;
    timeframe: string;
    address: string;
  };
  payment: {
    methods: string[];
    totalAmount: number;
  };
  withdrawal: {
    period: number;
    conditions: string[];
    address: string;
    phone: string;
    email: string;
  };
  buyer?: {
    name: string;
    address: string;
    phone: string;
    email: string;
  };
}

interface PreInformationFormProps {
  data: PreInformationData;
  onAccept: () => void;
  onReject: () => void;
}

export default function PreInformationForm({ data, onAccept }: PreInformationFormProps) {
  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">ÖN BİLGİLENDİRME FORMU</h1>
        <p className="text-sm text-gray-600">6502 Sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği Gereğince</p>
      </div>

      <div className="space-y-6 text-sm text-gray-700 max-h-96 overflow-y-auto border border-gray-200 p-4 rounded-lg mb-6">

        {/* 1. TARAFLAR VE KONU */}
        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">1. TARAFLAR VE KONU</h2>
          <div className="space-y-3">
            <p>
              İşbu Ön Bilgilendirme Formu'nun konusu, Alıcı ve Satıcı arasındaki Sözleşme'ye ilişkin
              6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği
              hükümleri uyarınca bilgilendirilmesidir.
            </p>
            <p>
              ALICI, Ön Bilgilendirme Formu ve Sözleşme'ye ilişkin bilgileri hesabından takip edebilecek
              olup değişen bilgilerini güncelleyebilecektir. Ön Bilgilendirme Formu ve Sözleşme'nin bir
              nüshası Alıcı'nın hesabında mevcuttur ve talep edilmesi halinde elektronik posta ile de gönderilebilecektir.
            </p>
          </div>
        </section>

        {/* 2. TANIMLAR */}
        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">2. TANIMLAR</h2>
          <div className="space-y-2 text-sm">
            <p><span className="font-medium">ALICI:</span> Bir Mal veya Hizmet'i ticari veya mesleki olmayan amaçlarla edinen, kullanan veya yararlanan gerçek kişiyi,</p>
            <p><span className="font-medium">Bakanlık:</span> Türkiye Cumhuriyeti Ticaret Bakanlığı'nı,</p>
            <p><span className="font-medium">Banka:</span> 5411 sayılı Bankacılık Kanunu uyarınca kurulan lisanslı kuruluşları,</p>
            <p><span className="font-medium">Hizmet:</span> Bir ücret veya menfaat karşılığında yapılan ya da yapılması taahhüt edilen Ürün sağlama dışındaki her türlü tüketici işleminin konusunu,</p>
            <p><span className="font-medium">Kanun:</span> 6502 sayılı Tüketicinin Korunması Hakkında Kanun'u,</p>
            <p><span className="font-medium">Kargo Şirketi:</span> Ürün'ün Alıcı'ya ulaştırılmasını, iade süreçlerinde Alıcı'dan alınarak Satıcı'ya ulaştırılmasını sağlayan anlaşmalı kargo veya lojistik şirketini,</p>
            <p><span className="font-medium">Ön Bilgilendirme Formu:</span> Sözleşme kurulmadan ya da buna karşılık herhangi bir teklif Alıcı tarafından kabul edilmeden önce Alıcı'yı Yönetmelik'te belirtilen asgari hususlar konusunda bilgilendirmek için hazırlanan formu,</p>
            <p><span className="font-medium">Platform:</span> E-ticaret sitesini ve mobil uygulamasını,</p>
            <p><span className="font-medium">Satıcı:</span> Kamu tüzel kişileri de dahil olmak üzere ticari veya mesleki amaçlarla tüketiciye Ürün/Hizmet sunan gerçek ve/veya tüzel kişiyi,</p>
            <p><span className="font-medium">Ürün:</span> Alışverişe konu olan taşınır eşya ile elektronik ortamda kullanılmak üzere hazırlanan yazılım, ses, görüntü ve benzeri her türlü gayri maddi malı,</p>
            <p><span className="font-medium">Yönetmelik:</span> Mesafeli Sözleşmeler Yönetmeliği'ni ifade eder.</p>
          </div>
        </section>

        {/* 3. ALICI, SATICI BİLGİLERİ */}
        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">3. ALICI, SATICI BİLGİLERİ</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">ALICI BİLGİLERİ</h3>
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">Teslim Edilecek Kişi:</span> {data.buyer?.name || 'Alıcı Adı'}</p>
                <p><span className="font-medium">Teslimat Adresi:</span> {data.buyer?.address || 'Teslimat Adresi'}</p>
                <p><span className="font-medium">Telefon:</span> {data.buyer?.phone || 'Telefon Numarası'}</p>
                <p><span className="font-medium">E-posta:</span> {data.buyer?.email || 'E-posta Adresi'}</p>
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">SATICI BİLGİLERİ</h3>
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">Ticaret Unvanı:</span> {data.seller.name}</p>
                <p><span className="font-medium">Adres:</span> {data.seller.address}</p>
                <p><span className="font-medium">Telefon:</span> {data.seller.phone}</p>
                <p><span className="font-medium">E-posta:</span> {data.seller.email}</p>
                <p><span className="font-medium">Vergi Kimlik No:</span> {data.seller.taxNumber}</p>
                <p><span className="font-medium">MERSİS No:</span> {data.seller.mersisNumber}</p>
              </div>
            </div>
          </div>
        </section>

        {/* 4. ÜRÜN/HİZMET BİLGİLERİ */}
        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">4. ÜRÜN/HİZMET BİLGİLERİ</h2>
          <div className="space-y-3">
            <p className="text-sm">
              4.1. Ürün/Hizmet'in temel özellikleri (türü, miktarı, marka/modeli, rengi, adedi, fiyatı)
              Platform'da yer almakta olup Platform üzerinden detaylı şekilde incelenebilecektir.
            </p>

            <p className="text-sm">
              4.2. Ürün/Hizmet karşılığında ödenecek tüm tutarlar (tüm vergiler dahil satış fiyatı,
              kargo bedeli, taksit farkı tutarı vb.) aşağıdaki tabloda gösterilmiştir.
            </p>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Ürün/Hizmet Açıklaması</th>
                      <th className="text-center py-2">Adet</th>
                      <th className="text-right py-2">Peşin Fiyatı</th>
                      <th className="text-right py-2">Ara Toplam (KDV Dahil)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.products.map((product, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-2">{product.name}</td>
                        <td className="text-center py-2">{product.quantity}</td>
                        <td className="text-right py-2">₺{product.price.toFixed(2)}</td>
                        <td className="text-right py-2">₺{(product.price * product.quantity).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Kargo Hariç Toplam Ürün Bedeli:</span>
                  <span>₺{(data.payment.totalAmount - data.delivery.cost).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Kargo Ücreti:</span>
                  <span>{data.delivery.cost === 0 ? 'Ücretsiz' : `₺${data.delivery.cost.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between font-bold border-t pt-2">
                  <span>Toplam Sipariş Bedeli:</span>
                  <span>₺{data.payment.totalAmount.toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p><span className="font-medium">Ödeme Şekli:</span> {data.payment.methods.join(', ')}</p>
                  <p><span className="font-medium">Teslimat Adresi:</span> {data.delivery.address}</p>
                  <p><span className="font-medium">Sipariş Tarihi:</span> {new Date().toLocaleDateString('tr-TR')}</p>
                </div>
                <div>
                  <p><span className="font-medium">Teslim Şekli:</span> {data.delivery.method}</p>
                  <p><span className="font-medium">Teslimat Süresi:</span> {data.delivery.timeframe}</p>
                  <p><span className="font-medium">Kargo Şirketi'ne Teslim:</span> 1-2 iş günü</p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 p-3 rounded border-l-4 border-yellow-400">
              <p className="text-sm">
                <span className="font-medium">Önemli:</span> Belirtilen süre teslimatın taahhüdü değildir,
                satıcı tarafından kargo şirketine teslim edilme süresini ifade eder. Sözleşme ve ilgili
                mevzuat hükümlerinde yer alan istisnalar saklıdır.
              </p>
            </div>
          </div>
        </section>

        {/* 5. GENEL HÜKÜMLER */}
        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">5. GENEL HÜKÜMLER</h2>
          <div className="space-y-3 text-sm">
            <p>
              5.1. Satıcı, Ürün/Hizmet'i eksiksiz, siparişte belirtilen niteliklere uygun ve varsa
              garanti belgeleri, kullanım kılavuzları ile mevzuat gereği Ürün/Hizmet'le birlikte
              teslim etmesi gereken sair bilgi ve belgeler ile teslim etmeyi kabul, beyan ve taahhüt eder.
            </p>
            <p>
              5.2. Ürün, Alıcı veya Alıcı tarafından belirlenen üçüncü kişiye, taahhüt edilen teslim
              süresi içerisinde ve her halükârda 30 (otuz) günlük yasal süreyi aşmamak koşulu ile,
              Alıcı'nın belirtmiş olduğu teslimat adresine Kargo Şirketi tarafından teslim edilir.
            </p>
            <p>
              5.3. Alıcı, Ürün'ü teslim almadan önce muayene edecek; ezik, kırık, ambalajı yırtılmış
              vb. hasarlı, ayıplı veya eksik Ürün/Hizmet'i teslim almayacaktır. Teslim alınan
              Ürün/Hizmet'in hasarsız ve sağlam olduğu kabul edilecektir.
            </p>
            <p>
              5.4. Ürün/Hizmet'in teslimat masrafları aksine bir hüküm yoksa Alıcı'ya aittir.
              Satıcı, Platform'da teslimat ücretinin kendisince karşılanacağını beyan etmişse
              teslimat masrafları Satıcı'ya ait olacaktır.
            </p>
          </div>
        </section>

        {/* 6. CAYMA HAKKI */}
        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">6. CAYMA HAKKI</h2>
          <div className="space-y-3 text-sm">
            <p>
              6.1. Alıcı, 14 (ondört) gün içinde herhangi bir gerekçe göstermeksizin ve cezai şart
              ödemeksizin Sözleşme'den cayma hakkına sahiptir.
            </p>
            <p>
              6.2. Cayma hakkı süresi, Ürün için Alıcı'nın veya Alıcı tarafından belirlenen üçüncü
              kişinin Ürün'ü teslim aldığı gün başlar.
            </p>
            <p>
              6.3. Cayma hakkının kullanılması halinde, Alıcı cayma hakkını kullanmasından itibaren
              14 (ondört) gün içerisinde Ürün'ü Satıcı'ya Kargo Şirketi'yle geri gönderir.
            </p>

            <div className="bg-red-50 p-4 rounded-lg">
              <h4 className="font-medium text-red-800 mb-2">Cayma Hakkının Kullanılamayacağı Haller:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-red-700">
                <li>Tüketicinin istekleri veya kişisel ihtiyaçları doğrultusunda hazırlanan mallara ilişkin sözleşmeler</li>
                <li>Çabuk bozulabilen veya son kullanma tarihi geçebilecek malların teslimine ilişkin sözleşmeler</li>
                <li>Tesliminden sonra ambalaj, bant, mühür, paket gibi koruyucu unsurları açılmış olan mallardan; iadesi sağlık ve hijyen açısından uygun olmayanların teslimine ilişkin sözleşmeler</li>
                <li>Elektronik ortamda anında ifa edilen hizmetler ile Alıcı'ya anında teslim edilen gayri maddi mallara ilişkin sözleşmeler</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 7. KİŞİSEL VERİLERİN KORUNMASI */}
        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">7. KİŞİSEL VERİLERİN KORUNMASI</h2>
          <div className="space-y-3 text-sm">
            <p>
              7.1. Satıcı, işbu sözleşme kapsamındaki kişisel verileri sadece Ürün/Hizmet'in sunulması
              amacıyla sınırlı olarak ve 6698 sayılı Kişisel Verilerin Korunması Kanunu'na uygun olarak işleyecektir.
            </p>
            <p>
              7.2. Alıcı, işbu Sözleşme kapsamında sağladığı kişisel verilerin doğru, eksiksiz ve güncel
              olduğunu kontrol etmekle, bu bilgileri üçüncü kişilerle paylaşmamak ve söz konusu kişisel
              verilerin güvenliğini sağlamakla yükümlü olduğunu kabul eder.
            </p>
          </div>
        </section>

        {/* 8. UYUŞMAZLIKLARIN ÇÖZÜMÜ */}
        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">8. UYUŞMAZLIKLARIN ÇÖZÜMÜ</h2>
          <p className="text-sm">
            Sözleşme'nin uygulanmasında, Bakanlık'ça ilan edilen değerlere uygun olarak Alıcı'nın
            Ürün/Hizmet'i satın aldığı ve ikametgahının bulunduğu yerdeki Tüketici Hakem Heyetleri
            ile Tüketici Mahkemeleri yetkilidir.
          </p>
        </section>
      </div>

      {/* Bilgilendirme Notu */}
      <div className="border-t pt-6">
        <div className="bg-blue-50 rounded-lg p-4 mb-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-blue-800 font-medium">
              Bu bilgilendirme formu yasal gereklilik gereği hazırlanmıştır.
            </p>
          </div>
          <p className="text-xs text-blue-600 mt-2 ml-7">
            Siparişinizi tamamladığınızda bu bilgilendirmeyi okumuş ve anlamış sayılırsınız.
          </p>
        </div>

        <div className="flex justify-center">
          <button
            onClick={onAccept}
            className="py-3 px-8 rounded-lg font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors"
          >
            İleri
          </button>
        </div>
      </div>
    </div>
  );
}