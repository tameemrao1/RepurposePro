"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'dots' | 'pulse';
}

interface LoadingTextProps {
  className?: string;
  children: React.ReactNode;
}

interface LoadingSkeletonProps {
  className?: string;
  lines?: number;
}

// Modern inline spinner
export const LoadingSpinner = ({ 
  className, 
  size = 'md', 
  variant = 'default' 
}: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: 'h-4 w-4 border-[1.5px]',
    md: 'h-5 w-5 border-2',
    lg: 'h-6 w-6 border-2'
  };

  if (variant === 'dots') {
    const dotSizes = {
      sm: 'h-1 w-1',
      md: 'h-1.5 w-1.5',
      lg: 'h-2 w-2'
    };

    return (
      <div className={cn("flex space-x-1", className)}>
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className={cn("rounded-full bg-current", dotSizes[size])}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: i * 0.15,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
    );
  }

  if (variant === 'pulse') {
    return (
      <motion.div
        className={cn("rounded-full bg-current", sizeClasses[size].replace('border-2', '').replace('border-[1.5px]', ''))}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.5, 1, 0.5]
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    );
  }

  return (
    <motion.div
      className={cn(
        "rounded-full border-foreground/20",
        sizeClasses[size],
        className
      )}
      style={{ 
        borderTopColor: 'currentColor',
        borderRightColor: 'currentColor'
      }}
      animate={{ rotate: 360 }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: "linear"
      }}
    />
  );
};

// Loading text with fade animation
export const LoadingText = ({ className, children }: LoadingTextProps) => (
  <motion.span
    className={cn("inline-block", className)}
    animate={{ opacity: [0.5, 1, 0.5] }}
    transition={{
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut"
    }}
  >
    {children}
  </motion.span>
);

// Skeleton loader for content placeholders
export const LoadingSkeleton = ({ className, lines = 3 }: LoadingSkeletonProps) => (
  <div className={cn("space-y-2", className)}>
    {Array.from({ length: lines }, (_, i) => (
      <motion.div
        key={i}
        className={cn(
          "h-4 bg-foreground/10 rounded",
          i === lines - 1 ? "w-3/4" : "w-full"
        )}
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: i * 0.1
        }}
      />
    ))}
  </div>
);

// Button loading state
export const LoadingButton = ({ 
  children, 
  isLoading = false, 
  loadingText = "Loading...",
  className,
  ...props 
}: {
  children: React.ReactNode;
  isLoading?: boolean;
  loadingText?: string;
  className?: string;
  [key: string]: any;
}) => (
  <button
    className={cn(
      "relative transition-opacity",
      isLoading && "opacity-70 cursor-not-allowed",
      className
    )}
    disabled={isLoading}
    {...props}
  >
    {isLoading ? (
      <div className="flex items-center space-x-2">
        <LoadingSpinner size="sm" />
        <span>{loadingText}</span>
      </div>
    ) : (
      children
    )}
  </button>
);

// Full page loading overlay (lighter than main preloader)
export const LoadingOverlay = ({ 
  message = "Loading...",
  className 
}: {
  message?: string;
  className?: string;
}) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className={cn(
      "absolute inset-0 z-50 flex flex-col items-center justify-center",
      "bg-background/80 backdrop-blur-sm",
      className
    )}
  >
    <div className="flex flex-col items-center space-y-3">
      <LoadingSpinner size="md" />
      <p className="text-sm text-foreground/70">{message}</p>
    </div>
  </motion.div>
);