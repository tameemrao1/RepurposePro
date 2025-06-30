"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';
import { Preloader } from './preloader';
import { useRouter } from 'next/navigation';

interface LoadingContextType {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  loadingMessage: string;
  setLoadingMessage: (message: string) => void;
}

const LoadingContext = createContext<LoadingContextType>({
  isLoading: false,
  setIsLoading: () => {},
  loadingMessage: "",
  setLoadingMessage: () => {},
});

export const useLoading = () => useContext(LoadingContext);

function LoadingProviderContent({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Loading...");
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Ensure component is mounted before rendering animations
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Debounce loading state changes to prevent flashing
  const debouncedSetLoading = useCallback((value: boolean) => {
    if (!value) {
      // Add a small delay before hiding the loader
      setTimeout(() => setIsLoading(false), 300);
    } else {
      // Show loader immediately when needed
      setIsLoading(true);
    }
  }, []);

  // Update loading message based on the current route
  const updateLoadingMessage = useCallback((path: string) => {
    if (path.includes('/login')) {
      setLoadingMessage("Signing you in...");
    } else if (path.includes('/signup')) {
      setLoadingMessage("Creating your account...");
    } else if (path.includes('/dashboard')) {
      setLoadingMessage("Preparing your dashboard...");
    } else if (path.includes('/generator')) {
      setLoadingMessage("Loading content generator...");
    } else if (path.includes('/library')) {
      setLoadingMessage("Loading your content library...");
    } else if (path.includes('/settings')) {
      setLoadingMessage("Loading settings...");
    } else {
      setLoadingMessage("Loading...");
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      let navigationTimeout: NodeJS.Timeout;

      const handleStart = (url: string) => {
        // Clear any existing timeouts
        if (navigationTimeout) clearTimeout(navigationTimeout);

        updateLoadingMessage(url);
        debouncedSetLoading(true);

        // Set a maximum loading time
        navigationTimeout = setTimeout(() => {
          debouncedSetLoading(false);
        }, 8000); // 8 seconds maximum loading time
      };

      const handleComplete = () => {
        if (navigationTimeout) clearTimeout(navigationTimeout);
        debouncedSetLoading(false);
      };

      // Handle navigation start
      const handleBeforeNavigate = () => {
        handleStart(window.location.pathname);
      };

      // Watch for any clicks on links
      const handleClick = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        const link = target.closest('a');
        
        // Don't show loading for hash links or landing page internal navigation
        if (link && link.href) {
          const href = link.getAttribute('href');
          const isHashLink = href?.startsWith('#');
          const isInternalHashLink = link.hash && link.pathname === window.location.pathname;
          const isCurrentPageHashLink = href?.startsWith('#') && window.location.pathname === '/';
          
          // Skip loading for any hash links or internal page navigation
          if (isHashLink || isInternalHashLink || isCurrentPageHashLink) {
            return;
          }

          // Only show loading for actual page navigation
          if (!link.target && link.origin === window.location.origin && !link.hash) {
            handleStart(link.pathname);
          }
        }
      };

      // Handle soft navigation
      const mutationObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList' && document.querySelector('[data-nextjs-router-focus]')) {
            const pathname = window.location.pathname;
            const hasHash = window.location.hash.length > 0;
            
            // Don't show loading for hash navigation
            if (hasHash) {
              return;
            }
            
            handleStart(pathname);
          }
        });
      });

      mutationObserver.observe(document.body, {
        childList: true,
        subtree: true,
      });

      window.addEventListener('beforeunload', handleBeforeNavigate);
      window.addEventListener('popstate', handleBeforeNavigate);
      document.addEventListener('click', handleClick);

      // Cleanup
      return () => {
        if (navigationTimeout) clearTimeout(navigationTimeout);
        mutationObserver.disconnect();
        window.removeEventListener('beforeunload', handleBeforeNavigate);
        window.removeEventListener('popstate', handleBeforeNavigate);
        document.removeEventListener('click', handleClick);
      };
    }
  }, [debouncedSetLoading, updateLoadingMessage]);

  // Reset loading state on successful route change
  useEffect(() => {
    debouncedSetLoading(false);
  }, [pathname, searchParams, debouncedSetLoading]);

  return (
    <LoadingContext.Provider value={{ isLoading, setIsLoading: debouncedSetLoading, loadingMessage, setLoadingMessage }}>
      {isMounted && (
        <AnimatePresence mode="wait">
          {isLoading && <Preloader message={loadingMessage} />}
        </AnimatePresence>
      )}
      {children}
    </LoadingContext.Provider>
  );
}

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<Preloader message="Initializing..." variant="minimal" />}>
      <LoadingProviderContent>{children}</LoadingProviderContent>
    </Suspense>
  );
}