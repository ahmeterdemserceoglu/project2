"use client";

import React, { useState } from 'react';
import Image from 'next/image';

interface SimplifiedImageProps {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    fill?: boolean;
    className?: string;
    fallbackSrc?: string;
    priority?: boolean;
    quality?: number;
    sizes?: string;
}

// Utility function to sanitize image URLs
function sanitizeImageUrl(url: string): string {
    if (!url) return '/images/placeholder.png';

    // If it's already a local path, return as is
    if (url.startsWith('/')) return url;

    // Check for duplicate URLs (common error with Supabase)
    if (url.includes('supabase.co') && url.indexOf('https://') !== url.lastIndexOf('https://')) {
        // Extract the actual image path from the duplicated URL
        const parts = url.split('public/');
        if (parts.length > 2) {
            const actualPath = parts[parts.length - 1];
            const baseUrl = url.substring(0, url.indexOf('/storage/v1/object/public/') + '/storage/v1/object/public/'.length);
            return `${baseUrl}${actualPath}`;
        }
    }

    return url;
}

export function SimplifiedImage({
    src,
    alt,
    width,
    height,
    fill = false,
    className = '',
    fallbackSrc = '/images/placeholder.png',
    priority = false,
    quality = 80,
    sizes,
    ...props
}: SimplifiedImageProps) {
    const [imgSrc, setImgSrc] = useState<string>(sanitizeImageUrl(src));
    const [hasError, setHasError] = useState(false);

    const handleError = () => {
        if (!hasError) {
            console.warn(`Image load error for: ${imgSrc}`);
            setImgSrc(fallbackSrc);
            setHasError(true);
        }
    };

    // Handle aspect ratio properly
    let imageWidth = width;
    let imageHeight = height;

    // If only one dimension is provided, set the other to "auto"
    if ((width && !height) || (!width && height)) {
        imageWidth = width || undefined;
        imageHeight = height || undefined;
    }

    return (
        <Image
            src={imgSrc}
            alt={alt}
            width={fill ? undefined : imageWidth}
            height={fill ? undefined : imageHeight}
            fill={fill}
            className={`${className} ${hasError ? 'error-image' : ''}`}
            onError={handleError}
            priority={priority}
            quality={quality}
            sizes={
                sizes ||
                (fill
                    ? "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    : undefined)
            }
            style={{
                // Auto width/height when one dimension is specified
                width: !fill && height && !width ? "auto" : undefined,
                height: !fill && width && !height ? "auto" : undefined
            }}
            {...props}
        />
    );
} 