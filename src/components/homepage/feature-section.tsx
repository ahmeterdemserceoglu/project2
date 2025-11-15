"use client";

import { FaShieldAlt, FaTruck, FaHeadphones, FaUndo } from 'react-icons/fa';
import { useRef, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface FeatureProps {
    icon: React.ReactNode;
    title: string;
    description: string;
}

const FeatureCard = ({ icon, title, description }: FeatureProps) => {
    return (
        <div className="group relative flex flex-col items-center text-center gap-3 bg-white rounded-2xl p-5 w-full ring-1 ring-black/5 shadow-[0_8px_30px_rgb(2,8,23,0.06)] transition-transform duration-300 hover:-translate-y-1">
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-1">
                {icon}
            </div>
            <h3 className="text-base font-semibold">{title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
            <div className="pointer-events-none absolute inset-0 rounded-2xl ring-0 ring-primary/0 group-hover:ring-2 group-hover:ring-primary/20 transition-[ring] duration-300" />
        </div>
    );
};

export function FeatureSection() {
    const sectionRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.unobserve(entry.target);
                }
            },
            { threshold: 0.2 }
        );

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => {
            if (sectionRef.current) {
                observer.unobserve(sectionRef.current);
            }
        };
    }, []);

    const features: FeatureProps[] = [
        {
            icon: <FaShieldAlt size={28} />,
            title: "Güvenli Ödeme",
            description: "%100 güvenli ödeme ve SSL koruması ile huzurlu alışveriş"
        },
        {
            icon: <FaTruck size={28} />,
            title: "Hızlı Teslimat",
            description: "Çoğu sipariş 24 saat içinde kargoda, özenli paketleme"
        },
        {
            icon: <FaUndo size={28} />,
            title: "Kolay İade",
            description: "14 gün koşulsuz iade ile içiniz rahat"
        },
        {
            icon: <FaHeadphones size={28} />,
            title: "Uzman Destek",
            description: "Sorularınıza hızlı çözüm, 7/24 destek"
        }
    ];

    return (
        <section
            id="features"
            className={cn(
                "py-16 md:py-24 bg-gradient-to-b from-white to-slate-50/60 transition-opacity duration-1000",
                isVisible ? "opacity-100" : "opacity-0"
            )}
            ref={sectionRef}
        >
            <div className="container mx-auto px-4">
                <div className="text-center mb-10 md:mb-14">
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Neden Bizi Tercih Etmelisiniz?</h2>
                    <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">Kaliteli ürünler, hızlı teslimat ve her adımda yanınızda uzman destek</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 max-w-5xl mx-auto">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className={cn(
                                "h-full transition-all duration-500",
                                isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
                            )}
                            style={{
                                transitionDelay: `${index * 150}ms`
                            }}
                        >
                            <FeatureCard {...feature} />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}