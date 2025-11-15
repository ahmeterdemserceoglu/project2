import { Metadata } from "next";
import { Suspense } from "react";
import SearchPageClient from "./SearchPageClient";
import { generateSEOMetadata } from "@/lib/seo/generateMetadata";

export const metadata: Metadata = generateSEOMetadata({
  title: "3D Baskı Malzemeleri ve 3D Ürünler Arama - HD Ticaret | Profesyonel 3D Printing Çözümleri",
  description: "HD Ticaret'te 3D baskı malzemeleri, filamentler, 3D yazıcılar ve profesyonel 3D printing çözümlerini arayın. PLA, ABS, PETG filamentler ve daha fazlası.",
  keywords: "3D baskı malzemeleri arama, filament arama, 3D yazıcı arama, PLA filament, ABS filament, PETG, 3D printing çözümleri, HD Ticaret arama",
  url: "/search"
});

function SearchPageFallback() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Arama sayfası yükleniyor...</p>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchPageFallback />}>
      <SearchPageClient />
    </Suspense>
  );
}