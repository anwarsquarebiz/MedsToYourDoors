import { type SharedData } from '@/types';
import { router, usePage } from '@inertiajs/react';
import { useEffect } from 'react';

const GTM_SCRIPT_ID = 'google-tag-manager';

function pageViewParams(): { page_title: string; page_location: string; page_path: string } {
    return {
        page_title: document.title,
        page_location: window.location.href,
        page_path: `${window.location.pathname}${window.location.search}`,
    };
}

function loadGtm(containerId: string): void {
    if (typeof window === 'undefined') {
        return;
    }

    window.dataLayer = window.dataLayer ?? [];

    if (document.getElementById(GTM_SCRIPT_ID)) {
        return;
    }

    window.dataLayer.push({
        'gtm.start': Date.now(),
        event: 'gtm.js',
    });

    const script = document.createElement('script');
    script.id = GTM_SCRIPT_ID;
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(containerId)}`;
    document.head.appendChild(script);
}

/**
 * Loads the GTM container on the storefront (script + noscript iframe).
 */
export function GoogleTagManager() {
    const { google_tag_manager } = usePage<SharedData>().props;
    const containerId = google_tag_manager?.enabled ? google_tag_manager.container_id : null;

    useEffect(() => {
        if (!containerId) {
            return;
        }

        loadGtm(containerId);

        return router.on('navigate', () => {
            window.dataLayer = window.dataLayer ?? [];
            window.dataLayer.push({
                event: 'page_view',
                ...pageViewParams(),
            });
        });
    }, [containerId]);

    if (!containerId) {
        return null;
    }

    return (
        <noscript>
            <iframe
                title="Google Tag Manager"
                src={`https://www.googletagmanager.com/ns.html?id=${encodeURIComponent(containerId)}`}
                height={0}
                width={0}
                style={{ display: 'none', visibility: 'hidden' }}
            />
        </noscript>
    );
}

