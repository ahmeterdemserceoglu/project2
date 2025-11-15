import { notFound } from "next/navigation";
import { Metadata } from "next";
import ProductClient from "./client";
import { createServerComponentClient } from "@/lib/supabase";
import { generateSEOMetadata, generateProductSchema } from "@/lib/seo/generateMetadata";

export const revalidate = 60; // Revalidate every 60 seconds

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    try {
        const { slug } = await params;
        const supabase = await createServerComponentClient();

        const { data: product, error } = await supabase
            .from('products')
            .select(`
                *,
                category:category_id (name)
            `)
            .eq('slug', slug)
            .eq('is_active', true)
            .single();

        if (error || !product) {
            return generateSEOMetadata({
                title: 'Ürün Bulunamadı',
                description: 'Aradığınız ürün bulunamadı.',
                noIndex: true
            });
        }

        const price = product.sale_price || product.base_price;
        const availability = product.stock_quantity > 0 ? 'in_stock' : 'out_of_stock';
        
        return generateSEOMetadata({
            title: `${product.name} - ${product.category?.name || 'Ürün'}`,
            description: product.description || `${product.name} ürününü HD Ticaret'ten satın alın. ${price} TL fiyatıyla, hızlı teslimat ve güvenli ödeme seçenekleri.`,
            keywords: `${product.name}, ${product.category?.name || ''}, online alışveriş, HD Ticaret`,
            image: product.primary_image_url,
            url: `/products/${slug}`,
            type: 'product',
            price,
            currency: 'TRY',
            availability,
            brand: 'HD Ticaret',
            category: product.category?.name
        });
    } catch (error) {
        return generateSEOMetadata({
            title: 'Ürün Bulunamadı',
            description: 'Aradığınız ürün bulunamadı.',
            noIndex: true
        });
    }
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
    try {
        const { slug } = await params;
        const supabase = await createServerComponentClient();

        // Önce products-with-flash-deals API'sinden ürünü bul
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
        const response = await fetch(`${baseUrl}/api/products-with-flash-deals?limit=1000`);
        
        let productFromAPI = null;
        if (response.ok) {
            const apiData = await response.json();
            productFromAPI = apiData.data?.find((p: any) => p.slug === slug);
        }

        // Eğer API'den bulunamazsa, direkt veritabanından çek
        const { data: product, error } = await supabase
            .from('products')
            .select(`
                *,
                category:category_id (name),
                product_images (*),
                product_variants (*)
            `)
            .eq('slug', slug)
            .eq('is_active', true)
            .single();

        if (error || !product) {
            notFound();
        }

        // API'den gelen veri varsa onu kullan, yoksa veritabanından gelen veriyi formatla
        let finalSalePrice = product.sale_price;
        let isFlashDeal = false;
        let flashDealInfo = null;

        if (productFromAPI) {
            finalSalePrice = productFromAPI.salePrice;
            isFlashDeal = productFromAPI.isFlashDeal || false;
            flashDealInfo = productFromAPI.flashDeal || null;
        }

        // Ürün verilerini formatla
        const formattedProduct = {
            id: product.id,
            name: product.name,
            slug: product.slug,
            description: product.description,
            base_price: product.base_price || 0,
            sale_price: finalSalePrice,
            stock_quantity: product.stock_quantity || 0,
            primary_image_url: product.primary_image_url,
            category_name: product.category?.name,
            category_id: product.category_id || undefined,
            is_flash_deal: isFlashDeal,
            flash_deal_info: flashDealInfo,
            images: Array.isArray(product.product_images) ? product.product_images.map(img => ({
                id: img.id,
                image_url: img.image_url,
                alt_text: img.alt_text,
                is_primary: img.is_primary
            })) : [],
            variants: Array.isArray(product.product_variants) ? product.product_variants.map(variant => ({
                id: variant.id,
                price: variant.price,
                stock: variant.stock
            })) : [],
            price: Array.isArray(product.product_variants) && product.product_variants.length > 0
                ? product.product_variants[0].price
                : (product.base_price || 0),
            stock: Array.isArray(product.product_variants) && product.product_variants.length > 0
                ? product.product_variants[0].stock
                : (product.stock_quantity || 0),
        };

        return <ProductClient slug={slug} initialProduct={formattedProduct} />;
    } catch (error) {
        notFound();
    }
} 