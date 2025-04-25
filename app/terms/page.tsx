import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TermsOfUsePage() {
  return (
    <div className="container py-12 px-4 md:px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">Kullanım Şartları</h1>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Giriş</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Anında Ortak Yaşam platformuna hoş geldiniz. Bu Kullanım Şartları, platformumuzu kullanımınızı düzenleyen
              kuralları ve koşulları belirler. Platformumuzu kullanarak, bu şartları kabul etmiş olursunuz.
            </p>
            <p>
              Lütfen bu şartları dikkatlice okuyun. Eğer bu şartları kabul etmiyorsanız, platformumuzu kullanmayı
              bırakmanız gerekmektedir.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Hesap Oluşturma ve Güvenlik</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Platformumuzu kullanmak için bir hesap oluşturmanız gerekebilir. Hesap oluştururken doğru, güncel ve
              eksiksiz bilgiler sağlamayı kabul edersiniz. Hesap bilgilerinizi güncel tutmak sizin sorumluluğunuzdadır.
            </p>
            <p className="mb-4">
              Hesabınızın güvenliğini sağlamak ve hesabınızla ilgili tüm aktivitelerden sorumlu olmak sizin
              sorumluluğunuzdadır. Hesabınızla ilgili herhangi bir güvenlik ihlali veya yetkisiz kullanım durumunda bizi
              derhal bilgilendirmelisiniz.
            </p>
            <p>
              Hesabınızı başkalarıyla paylaşmamanız veya başkalarının hesabınızı kullanmasına izin vermemeniz
              gerekmektedir. 18 yaşından küçükseniz, platformumuzu ebeveyn veya yasal vasi gözetiminde
              kullanabilirsiniz.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Platform Kullanımı</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Platformumuzu kullanırken aşağıdaki kurallara uymayı kabul edersiniz:</p>
            <ul className="list-disc pl-5 space-y-2 mb-4">
              <li>Platformu yasa dışı amaçlarla kullanmamak</li>
              <li>Platformun güvenliğini tehlikeye atacak eylemlerde bulunmamak</li>
              <li>Diğer kullanıcıların platformu kullanmasını engelleyecek veya kısıtlayacak eylemlerde bulunmamak</li>
              <li>
                Yasa dışı, zararlı, tehditkar, taciz edici, iftira niteliğinde, müstehcen veya başka şekilde uygunsuz
                içerik paylaşmamak
              </li>
              <li>Başkalarının fikri mülkiyet haklarını ihlal eden içerik paylaşmamak</li>
              <li>Virüs veya diğer zararlı kodlar içeren dosyalar yüklememek</li>
              <li>Platformu spam veya istenmeyen mesajlar göndermek için kullanmamak</li>
              <li>Platformun normal işleyişini bozmamak veya aşırı yük bindirmemek</li>
            </ul>
            <p>
              Bu kuralları ihlal etmeniz durumunda, hesabınızı askıya alma veya sonlandırma hakkımızı saklı tutarız.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Eşya Paylaşımı ve Ödünç Alma</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Platformumuz, kullanıcıların eşyalarını paylaşmasını ve başkalarından eşya ödünç almasını sağlar. Eşya
              paylaşırken veya ödünç alırken aşağıdaki koşulları kabul edersiniz:
            </p>
            <ul className="list-disc pl-5 space-y-2 mb-4">
              <li>
                Paylaştığınız eşyaların size ait olduğunu veya paylaşma hakkına sahip olduğunuzu garanti edersiniz
              </li>
              <li>Eşyalarınızla ilgili doğru ve eksiksiz bilgi sağlamayı kabul edersiniz</li>
              <li>Ödünç aldığınız eşyaları anlaşılan süre içinde ve iyi durumda iade etmeyi kabul edersiniz</li>
              <li>Ödünç aldığınız eşyalara verdiğiniz zararlardan sorumlu olduğunuzu kabul edersiniz</li>
              <li>
                Platformumuz, kullanıcılar arasındaki eşya paylaşımı ve ödünç alma işlemlerinde sadece aracı rolü
                üstlenir ve bu işlemlerden doğabilecek anlaşmazlıklarda doğrudan sorumlu değildir
              </li>
            </ul>
            <p>
              Eşya paylaşımı ve ödünç alma işlemlerinde güvenliğiniz için, tanımadığınız kişilerle buluşurken dikkatli
              olmanızı ve güvenli buluşma noktaları seçmenizi öneririz.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Hukuki Meseleler ve Anlaşmazlık Çözümü</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Anında Ortak Yaşam platformu üzerinden ödünç alınan eşyaların iade edilmemesi veya zarar görmesi durumunda
              izlenecek hukuki süreçler aşağıda belirtilmiştir:
            </p>
            <h3 className="text-lg font-semibold mb-2">İade Edilmeyen Eşyalar</h3>
            <p className="mb-4">
              Ödünç alınan eşyanın anlaşılan süre içerisinde iade edilmemesi durumunda, platform öncelikle taraflar
              arasında uzlaşma sağlamaya çalışacaktır. Uzlaşma sağlanamaması halinde, eşya sahibi yasal yollara başvurma
              hakkına sahiptir. Bu durumda Anında Ortak Yaşam:
            </p>
            <ul className="list-disc pl-5 space-y-2 mb-4">
              <li>
                Eşya sahibinin talebi üzerine, platform üzerindeki tüm iletişim kayıtlarını ve işlem geçmişini yasal
                mercilere sunacaktır
              </li>
              <li>
                Mağdur kullanıcının yasal süreçlerde kullanabileceği gerekli belgeleri (kullanım kayıtları, sözleşme
                detayları, kimlik doğrulama bilgileri vb.) sağlayacaktır
              </li>
              <li>Gerekli durumlarda, mağdur kullanıcının yanında yer alarak hukuki süreçlerde destek olacaktır</li>
              <li>
                Eşyayı iade etmeyen kullanıcının platform üzerindeki hesabını askıya alacak ve gerekli durumlarda
                tamamen kapatacaktır
              </li>
            </ul>

            <h3 className="text-lg font-semibold mb-2">Zarar Gören Eşyalar</h3>
            <p className="mb-4">
              Ödünç alınan eşyanın zarar görmesi durumunda, zarar veren kullanıcı, eşyanın onarım masraflarını veya
              eşdeğer değerini karşılamakla yükümlüdür. Anlaşmazlık durumunda platform:
            </p>
            <ul className="list-disc pl-5 space-y-2 mb-4">
              <li>Taraflar arasında uzlaşma sağlamak için arabuluculuk yapacaktır</li>
              <li>
                Uzlaşma sağlanamaması halinde, eşya sahibinin talebi doğrultusunda gerekli belgeleri sağlayacaktır
              </li>
              <li>
                Eşyanın teslim alınmadan önceki ve sonraki durumunu gösteren fotoğraflar ve diğer kanıtlar platform
                tarafından saklanacak ve gerektiğinde yasal mercilere sunulacaktır
              </li>
            </ul>

            <h3 className="text-lg font-semibold mb-2">Kötü Niyetli Davalar ve Tazminat</h3>
            <p className="mb-4">
              Platform kullanıcıları arasındaki anlaşmazlıklarda kötü niyetli olarak açılan davalar veya asılsız
              iddialar söz konusu olduğunda:
            </p>
            <ul className="list-disc pl-5 space-y-2 mb-4">
              <li>
                Anında Ortak Yaşam, haksız yere dava açan veya asılsız iddialarda bulunan kullanıcılara karşı tazminat
                davası açma hakkını saklı tutar
              </li>
              <li>
                Haksız dava sonucunda mağdur olan kullanıcı, karşı tarafa maddi ve manevi tazminat davası açabilir
              </li>
              <li>
                Platform, haksız dava açan kullanıcının hesabını askıya alma veya tamamen kapatma hakkına sahiptir
              </li>
              <li>
                Kötü niyetli davranışlar sonucu platformun itibarının zedelenmesi durumunda, platform yönetimi ilgili
                kullanıcıya karşı yasal işlem başlatma hakkını saklı tutar
              </li>
            </ul>

            <h3 className="text-lg font-semibold mb-2">Yasal Yükümlülükler</h3>
            <p className="mb-4">Platform kullanıcıları, aşağıdaki yasal yükümlülükleri kabul etmiş sayılır:</p>
            <ul className="list-disc pl-5 space-y-2 mb-4">
              <li>Ödünç alınan eşyaların anlaşılan süre içinde ve anlaşılan koşullarda iade edilmesi</li>
              <li>Eşyalara verilen zararların tazmin edilmesi</li>
              <li>Platform üzerinden yapılan tüm işlemlerde dürüst ve şeffaf davranılması</li>
              <li>Yasal süreçlerde gerçeğe aykırı beyanda bulunulmaması</li>
              <li>Mahkeme kararlarına uyulması</li>
            </ul>

            <h3 className="text-lg font-semibold mb-2">Delil Sözleşmesi</h3>
            <p className="mb-4">
              Kullanıcılar, platform üzerindeki tüm işlemlerin, mesajlaşmaların, sistem kayıtlarının ve log
              bilgilerinin, anlaşmazlık durumunda delil teşkil edeceğini kabul eder. Bu kayıtlar, Türk Hukuk Sisteminde
              delil olarak kabul edilecektir.
            </p>

            <h3 className="text-lg font-semibold mb-2">Yetkili Mahkeme ve Uygulanacak Hukuk</h3>
            <p className="mb-4">
              Bu kullanım şartlarından doğan veya bu şartlarla ilgili tüm anlaşmazlıklarda Türkiye Cumhuriyeti kanunları
              uygulanacak olup, İstanbul Mahkemeleri ve İcra Daireleri yetkili olacaktır.
            </p>

            <h3 className="text-lg font-semibold mb-2">Cezai Sorumluluk</h3>
            <p>
              Kullanıcılar, platform üzerinden ödünç aldıkları eşyaları hile, dolandırıcılık veya başka bir suç teşkil
              eden yöntemlerle sahiplenmeye çalışmaları durumunda, Türk Ceza Kanunu hükümleri uyarınca cezai
              sorumlulukları doğacağını kabul eder. Anında Ortak Yaşam, bu tür durumlarda ilgili adli mercilere suç
              duyurusunda bulunma hakkını saklı tutar.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Fikri Mülkiyet Hakları</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Platform ve platformda yer alan tüm içerikler (metin, grafik, logo, simge, resim, ses, video, yazılım vb.)
              fikri mülkiyet hakları kapsamında korunmaktadır ve Anında Ortak Yaşam'a veya lisans verenlere aittir.
            </p>
            <p className="mb-4">
              Platformumuzu kullanarak, size platformu kişisel ve ticari olmayan amaçlarla kullanmanız için sınırlı,
              münhasır olmayan, devredilemez bir lisans veriyoruz. Bu lisans, platformun herhangi bir bölümünü
              kopyalama, değiştirme, dağıtma, satma, kiralama veya ters mühendislik yapma hakkını içermez.
            </p>
            <p>
              Platformda paylaştığınız içeriklerle ilgili olarak, bu içerikleri platformumuzda kullanmamız,
              kopyalamamız, değiştirmemiz, dağıtmamız ve görüntülememiz için bize dünya çapında, telifsiz, münhasır
              olmayan bir lisans vermiş olursunuz.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Sorumluluk Reddi</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Platformumuz "olduğu gibi" ve "mevcut olduğu şekliyle" sunulmaktadır. Platformun kesintisiz, hatasız veya
              güvenli olacağını garanti etmiyoruz. Platformun kullanımından doğabilecek herhangi bir zarar veya kayıptan
              sorumlu değiliz.
            </p>
            <p className="mb-4">
              Platformda yer alan diğer kullanıcıların içerikleri veya davranışları için sorumluluk kabul etmiyoruz.
              Diğer kullanıcılarla olan etkileşimlerinizde kendi takdirinizi kullanmanız ve gerekli önlemleri almanız
              gerekmektedir.
            </p>
            <p>
              Platformumuz aracılığıyla erişilebilen üçüncü taraf web siteleri veya hizmetleri için sorumluluk kabul
              etmiyoruz. Bu sitelerin veya hizmetlerin kullanımı, ilgili üçüncü tarafın kullanım şartlarına tabidir.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Şartlarda Değişiklik</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Bu Kullanım Şartlarını zaman zaman güncelleyebiliriz. Şartlarda önemli değişiklikler yaparsak,
              platformumuzda bir bildirim yayınlayarak veya size doğrudan bildirim göndererek sizi bilgilendireceğiz.
            </p>
            <p className="mb-4">
              Değişiklikler yayınlandıktan sonra platformu kullanmaya devam etmeniz, güncellenmiş şartları kabul
              ettiğiniz anlamına gelir. Güncellenmiş şartları kabul etmiyorsanız, platformumuzu kullanmayı bırakmanız
              gerekmektedir.
            </p>
            <p>Bu şartların en son güncellenme tarihi: 1 Mayıs 2023</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
