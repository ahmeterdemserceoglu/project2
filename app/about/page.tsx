import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AboutPage() {
  return (
    <div className="container py-12 px-4 md:px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">Hakkımızda</h1>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Misyonumuz</CardTitle>
            <CardDescription>Paylaşım ekonomisini desteklemek</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Anında Ortak Yaşam, nadiren kullanılan eşyaların paylaşımını kolaylaştırarak sürdürülebilir bir toplum
              oluşturmayı hedefleyen bir platformdur. Misyonumuz, insanların ihtiyaç duydukları eşyalara erişimini
              kolaylaştırırken, aynı zamanda çevresel etkiyi azaltmak ve topluluk bağlarını güçlendirmektir.
            </p>
            <p>
              Platformumuz, kullanıcıların nadiren kullandıkları eşyaları paylaşmalarını ve ihtiyaç duydukları eşyaları
              ödünç almalarını sağlayarak, yeni eşya satın alma ihtiyacını azaltır ve kaynakların daha verimli
              kullanılmasına katkıda bulunur.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Hikayemiz</CardTitle>
            <CardDescription>Nasıl başladık?</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Anında Ortak Yaşam, 2023 yılında bir grup girişimci tarafından kuruldu. Kurucu ekibimiz, modern tüketim
              alışkanlıklarının çevresel etkisini azaltmak ve topluluk içinde paylaşımı teşvik etmek amacıyla bir araya
              geldi.
            </p>
            <p className="mb-4">
              Fikir, ekip üyelerimizden birinin komşusundan ödünç aldığı bir matkap ile başladı. Bu deneyim, insanların
              nadiren kullandıkları eşyaları satın almak yerine paylaşmanın ne kadar mantıklı olduğunu gösterdi. Bu
              basit fikir, zamanla Anında Ortak Yaşam platformuna dönüştü.
            </p>
            <p>
              Bugün, platformumuz Türkiye'nin dört bir yanındaki kullanıcılara hizmet veriyor ve her geçen gün büyümeye
              devam ediyor. Amacımız, paylaşım ekonomisini yaygınlaştırmak ve daha sürdürülebilir bir yaşam tarzını
              teşvik etmektir.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Ekibimiz</CardTitle>
            <CardDescription>Anında Ortak Yaşam'ı kimler oluşturuyor?</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Ekibimiz, paylaşım ekonomisi, teknoloji ve topluluk oluşturma konularında deneyimli profesyonellerden
              oluşmaktadır. Farklı geçmişlere ve becerilere sahip ekip üyelerimiz, platformumuzu geliştirmek ve
              kullanıcı deneyimini iyileştirmek için sürekli çalışmaktadır.
            </p>
            <p>
              Ekibimiz, yazılım geliştiricileri, tasarımcılar, pazarlama uzmanları ve müşteri hizmetleri
              temsilcilerinden oluşmaktadır. Hepimiz, paylaşım ekonomisinin gücüne ve topluluk bağlarını güçlendirmenin
              önemine inanıyoruz.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Değerlerimiz</CardTitle>
            <CardDescription>Bizi yönlendiren ilkeler</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Sürdürülebilirlik:</strong> Çevresel etkimizi azaltmak ve kaynakları verimli kullanmak için
                çalışıyoruz.
              </li>
              <li>
                <strong>Topluluk:</strong> Güçlü topluluk bağları oluşturmayı ve yerel etkileşimleri teşvik etmeyi
                amaçlıyoruz.
              </li>
              <li>
                <strong>Güven:</strong> Platformumuzda güven ve şeffaflık en önemli değerlerimizdir.
              </li>
              <li>
                <strong>Erişilebilirlik:</strong> Herkesin ihtiyaç duyduğu eşyalara kolayca erişebilmesini sağlamak için
                çalışıyoruz.
              </li>
              <li>
                <strong>Yenilikçilik:</strong> Sürekli olarak platformumuzu geliştirmek ve kullanıcı deneyimini
                iyileştirmek için yenilikçi çözümler arıyoruz.
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
