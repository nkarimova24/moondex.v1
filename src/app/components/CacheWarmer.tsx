"use client";

import { useEffect } from 'react';
import { fetchPokemonSets } from '@/app/lib/api/pokemon';

/**
 * Cache Warmer Component
 * Preloads frequently accessed data in the background to improve performance
 */
export default function CacheWarmer() {
    useEffect(() => {
        // Only run in browser
        if (typeof window === 'undefined') return;

        // Warm up the cache after a short delay (don't block initial page load)
        const warmUpCache = async () => {
            try {
                console.log('🔥 Warming up cache...');

                // Preload Pokemon sets (most commonly accessed)
                await fetchPokemonSets();

                console.log('✅ Cache warmed up successfully');
            } catch (error) {
                console.warn('Cache warm-up failed (non-critical):', error);
            }
        };

        // Wait 2 seconds after page load to warm up cache
        const timer = setTimeout(warmUpCache, 2000);

        return () => clearTimeout(timer);
    }, []);

    // This component doesn't render anything
    return null;
}
