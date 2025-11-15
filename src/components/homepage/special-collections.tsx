"use client";

import { useRef } from "react";
import Link from "next/link";
import { ArrowRight, Star, TrendingUp, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SimplifiedImage } from "@/components/ui/simplified-image";
import { cn } from "@/lib/utils";
import { Collection } from "@/app/page";

// Icon mapping
const iconMap: Record<string, React.ReactNode> = {
    "TrendingUp": <TrendingUp className="w-4 h-4" />,
    "Sparkles": <Sparkles className="w-4 h-4" />,
    "Star": <Star className="w-4 h-4" />,
};

interface SpecialCollectionsProps {
    collections: Collection[];
    isLoading: boolean;
}

export function SpecialCollections({ collections, isLoading }: SpecialCollectionsProps) {
    const sectionRef = useRef<HTMLDivElement>(null);

    if (isLoading) {
        return (
            <section className="py-20 md:py-32 relative overflow-hidden">
                <div className="container mx-auto px-4 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-slate-600 mx-auto"></div>
                </div>
            </section>
        );
    }

    if (collections.length === 0) {
        return (
            <section className="py-20 md:py-32 relative overflow-hidden">
                <div className="container mx-auto px-4 text-center">
                    <p className="text-xl text-gray-600">Özel koleksiyon bulunamadı</p>
                </div>
            </section>
        );
    }

    return (
        <section
            ref={sectionRef}
            // py-24 md:py-32 yerine py-32 md:py-48 yaparak boşlukları artırıyoruz.
            className="py-32 md:py-48 relative overflow-hidden" 
        >
            {/* Modern gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-slate-50">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23475569%22 fill-opacity=%220.02%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50"></div>
            </div>

            {/* Animated gradient orbs */}
            <div className="absolute -top-32 -left-32 w-64 h-64 bg-gradient-to-br from-slate-400/20 to-gray-400/20 rounded-full blur-3xl animate-float"></div>
            <div className="absolute -bottom-32 -right-32 w-72 h-72 bg-gradient-to-tr from-zinc-400/20 to-slate-400/20 rounded-full blur-3xl animate-float animation-delay-2000"></div>

            <div className="container mx-auto px-4 relative z-10">
                {/* Section header */}
                <div className="text-center mb-16 space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-slate-100 to-gray-100 rounded-full mb-4">
                        <Sparkles className="w-5 h-5 text-slate-600" />
                        <span className="text-sm font-semibold text-slate-700">Özel Seçkimler</span>
                    </div>

                    <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
                        <span className="inline-block bg-gradient-to-r from-slate-600 via-gray-600 to-zinc-600 bg-clip-text text-transparent animate-gradient bg-300%">
                            Özel Koleksiyonlar
                        </span>
                    </h2>

                    <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                        Özenle hazırlanmış koleksiyonlarımızı keşfedin
                    </p>
                </div>

                {/* Collections grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {collections.map((collection, index) => (
                        <Link
                            href={`/${collection.slug}`}
                            key={collection.id}
                            className="block group animate-fade-in-up"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            <div className="relative h-full overflow-hidden rounded-3xl bg-white shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-500">
                                {/* Badge */}
                                {collection.badge && (
                                    <div className={cn(
                                        "absolute top-4 left-4 z-20 px-4 py-2 rounded-full text-white text-sm font-bold flex items-center gap-2 shadow-lg",
                                        collection.badge_color || "bg-gradient-to-r from-blue-500 to-purple-500"
                                    )}>
                                        {collection.icon_name && iconMap[collection.icon_name]}
                                        {collection.badge}
                                    </div>
                                )}

                                {/* Image container */}
                                <div className="aspect-[4/3] relative overflow-hidden">
                                    <SimplifiedImage
                                        src={collection.image_url || "/images/placeholder.jpg"}
                                        alt={collection.title}
                                        fill
                                        className="object-cover w-full h-full transition-all duration-700 group-hover:scale-110 group-hover:rotate-1"
                                        priority={index === 0}
                                        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                                    />

                                    {/* Gradient overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                                    {/* Content */}
                                    <div className="absolute inset-0 flex flex-col justify-end p-8">
                                        <h3 className="text-3xl font-bold text-white mb-2 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                                            {collection.title}
                                        </h3>
                                        <p className="text-lg text-white/90 mb-6 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300 delay-75">
                                            {collection.description}
                                        </p>

                                        <Button
                                            size="lg"
                                            className="bg-white/20 backdrop-blur-sm border-2 border-white text-white hover:bg-white hover:text-gray-900 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 delay-150 w-fit"
                                        >
                                            Koleksiyonu Keşfet
                                            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                        </Button>
                                    </div>
                                </div>

                                {/* Decorative elements */}
                                <div className="absolute -bottom-2 -right-2 w-24 h-24 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Bottom CTA */}
                {collections.length > 0 && (
                    <div className="mt-16 text-center">
                        <Link href="/collections">
                            <Button
                                size="lg"
                                className="bg-white text-gray-900 hover:bg-gray-100 transform hover:scale-105 transition-all duration-300 shadow-md px-8 py-3 rounded-full font-medium group"
                            >
                                Tüm Koleksiyonları Görüntüle
                                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </Link>
                    </div>
                )}
            </div>
        </section>
    );
}