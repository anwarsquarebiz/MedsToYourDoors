import { newMetaEventId, trackMetaEvent } from '@/lib/meta-pixel';
import { type SharedData } from '@/types';
import { router, usePage } from '@inertiajs/react';
import { useEffect, useRef } from 'react';

const PIXEL_SCRIPT_ID = 'meta-pixel-sdk';

type FbqFn = ((...args: unknown[]) => void) & { queue: unknown[]; loaded: boolean; version: string };

function loadPixel(pixelId: string): void {
    if (typeof window === 'undefined') {
        return;
    }

    if (typeof window.fbq === 'function') {
        window.fbq('init', pixelId);

        return;
    }

    const fbq = ((...args: unknown[]) => {
        fbq.queue.push(args);
    }) as FbqFn;

    fbq.queue = [];
    fbq.loaded = true;
    fbq.version = '2.0';

    window.fbq = fbq;
    window._fbq = fbq;

    if (!document.getElementById(PIXEL_SCRIPT_ID)) {
        const script = document.createElement('script');
        script.id = PIXEL_SCRIPT_ID;
        script.async = true;
        script.src = 'https://connect.facebook.net/en_US/fbevents.js';
        document.head.appendChild(script);
    }

    window.fbq('init', pixelId);
}

/**
 * Loads the Meta Pixel once on the storefront and fires PageView on every Inertia visit.
 */
export function MetaPixel() {
    const { meta_pixel } = usePage<SharedData>().props;
    const pixelId = meta_pixel?.enabled ? meta_pixel.pixel_id : null;
    const initialisedFor = useRef<string | null>(null);

    useEffect(() => {
        if (!pixelId) {
            return;
        }

        loadPixel(pixelId);

        if (initialisedFor.current !== pixelId) {
            initialisedFor.current = pixelId;
            trackMetaEvent('PageView', undefined, newMetaEventId());
        }

        return router.on('navigate', () => {
            trackMetaEvent('PageView', undefined, newMetaEventId());
        });
    }, [pixelId]);

    if (!pixelId) {
        return null;
    }

    return (
        <noscript>
            <img
                height={1}
                width={1}
                className="hidden"
                alt=""
                src={`https://www.facebook.com/tr?id=${encodeURIComponent(pixelId)}&ev=PageView&noscript=1`}
            />
        </noscript>
    );
}
