import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function PrivacyPolicyPage() {
  return (
    <div className="container py-12 px-4 md:px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">Gizlilik Politikası</h1>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Giriş</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Anında Ortak Yaşam olarak, kişisel verilerinizin gizliliğini korumayı taahhüt ediyoruz. Bu Gizlilik
              Politikası, platformumuzu kullanırken topladığımız, kullandığımız ve paylaştığımız kişisel verilerinizle
              ilgili uygulamalarımızı açıklamaktadır.
            </p>
            <p>
              Platformumuzu kullanarak, bu politikada belirtilen uygulamaları kabul etmiş olursunuz. Herhangi bir
              sorunuz veya endişeniz varsa, lütfen bizimle iletişime geçmekten çekinmeyin.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Topladığımız Bilgiler</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Platformumuzu kullanırken aşağıdaki bilgileri toplayabiliriz:</p>
            <ul className="list-disc pl-5 space-y-2 mb-4">
              <li>
                <strong>Hesap Bilgileri:</strong> Ad, e-posta adresi, şifre, profil fotoğrafı gibi hesap oluşturma ve
                yönetme ile ilgili bilgiler.
              </li>
              <li>
                <strong>İletişim Bilgileri:</strong> Telefon numarası, adres, konum bilgileri gibi iletişim kurma
                amacıyla kullanılan bilgiler.
              </li>
              <li>
                <strong>Eşya Bilgileri:</strong> Platformda paylaştığınız eşyalarla ilgili başlık, açıklama, fotoğraf,
                konum gibi bilgiler.
              </li>
              <li>
                <strong>İşlem Bilgileri:</strong> Platformdaki etkileşimleriniz, mesajlaşmalarınız, değerlendirmeleriniz
                ve diğer kullanıcılarla olan işlemleriniz hakkında bilgiler.
              </li>
              <li>
                <strong>Cihaz ve Kullanım Bilgileri:</strong> IP adresi, tarayıcı türü, cihaz bilgileri, platformu nasıl
                kullandığınıza dair bilgiler.
              </li>
            </ul>
            <p>
              Bu bilgileri doğrudan sizden (örneğin, hesap oluşturma sırasında) veya platformumuzu kullanımınız
              sırasında otomatik olarak toplayabiliriz.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Bilgilerin Kullanımı</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Topladığımız bilgileri aşağıdaki amaçlarla kullanabiliriz:</p>
            <ul className="list-disc pl-5 space-y-2 mb-4">
              <li>Platformumuzu sağlamak, yönetmek ve geliştirmek</li>
              <li>Hesabınızı oluşturmak ve yönetmek</li>
              <li>Eşya paylaşımı ve ödünç alma işlemlerini kolaylaştırmak</li>
              <li>Kullanıcılar arasında iletişimi sağlamak</li>
              <li>Güvenlik ve doğrulama işlemlerini gerçekleştirmek</li>
              <li>Platformla ilgili güncellemeler ve bildirimler göndermek</li>
              <li>Kullanıcı deneyimini kişiselleştirmek ve iyileştirmek</li>
              <li>Yasal yükümlülüklerimizi yerine getirmek</li>
            </ul>
            <p>
              Kişisel verilerinizi, açık rızanız olmadan veya yasal bir zorunluluk bulunmadığı sürece üçüncü taraflarla
              paylaşmayacağız.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Veri Güvenliği</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Kişisel verilerinizin güvenliğini sağlamak için uygun teknik ve organizasyonel önlemler alıyoruz.
              Verilerinizi yetkisiz erişime, değiştirilmeye, ifşa edilmeye veya imha edilmeye karşı korumak için çeşitli
              güvenlik teknolojileri ve prosedürleri kullanıyoruz.
            </p>
            <p>
              Ancak, internet üzerinden hiçbir veri iletiminin veya elektronik depolamanın %100 güvenli olmadığını
              unutmayın. Bu nedenle, kişisel verilerinizin mutlak güvenliğini garanti edemeyiz.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Çerezler ve Benzer Teknolojiler</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Platformumuzda çerezler ve benzer teknolojiler kullanarak kullanıcı deneyimini iyileştirmeye, platformun
              kullanımını analiz etmeye ve hizmetlerimizi geliştirmeye çalışıyoruz. Bu teknolojiler, tarayıcınıza veya
              cihazınıza bilgi depolayabilir ve daha sonra bu bilgileri okuyabilir.
            </p>
            <p>
              Çerezleri kabul etmek istemiyorsanız, tarayıcı ayarlarınızı değiştirerek çerezleri reddedebilir veya çerez
              kullanıldığında uyarı alabilirsiniz. Ancak, çerezleri devre dışı bırakırsanız, platformumuzun bazı
              özellikleri düzgün çalışmayabilir.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Haklarınız</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Kişisel verilerinizle ilgili olarak aşağıdaki haklara sahipsiniz:</p>
            <ul className="list-disc pl-5 space-y-2 mb-4">
              <li>Kişisel verilerinize erişme ve bunların bir kopyasını alma hakkı</li>
              <li>Yanlış veya eksik kişisel verilerin düzeltilmesini isteme hakkı</li>
              <li>Belirli koşullar altında kişisel verilerinizin silinmesini isteme hakkı</li>
              <li>Kişisel verilerinizin işlenmesini kısıtlama hakkı</li>
              <li>Kişisel verilerinizin başka bir veri sorumlusuna aktarılmasını isteme hakkı</li>
              <li>Kişisel verilerinizin işlenmesine itiraz etme hakkı</li>
            </ul>
            <p>
              Bu haklarınızı kullanmak için lütfen bizimle iletişime geçin. Talebinizi en kısa sürede değerlendireceğiz
              ve yasal yükümlülüklerimize uygun olarak yanıt vereceğiz.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Politika Değişiklikleri</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Bu Gizlilik Politikasını zaman zaman güncelleyebiliriz. Politikada önemli değişiklikler yaparsak,
              platformumuzda bir bildirim yayınlayarak veya size doğrudan bildirim göndererek sizi bilgilendireceğiz.
            </p>
            <p>Bu politikanın en son güncellenme tarihi: 1 Mayıs 2023</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
