"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from "@/lib/utils";

interface PreloaderProps {
  message?: string;
  className?: string;
  variant?: 'default' | 'minimal' | 'dots' | 'pulse';
}

// Modern minimal spinner component
const ModernSpinner = () => (
  <div className="relative">
    <motion.div
      className="h-6 w-6 rounded-full border-2 border-foreground/10"
      style={{ 
        borderTopColor: 'hsl(var(--primary))',
        borderRightColor: 'hsl(var(--primary))'
      }}
      animate={{ rotate: 360 }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: "linear"
      }}
    />
  </div>
);

// Dots loading animation
const DotsSpinner = () => (
  <div className="flex space-x-1">
    {[0, 1, 2].map((i) => (
      <motion.div
        key={i}
        className="h-2 w-2 rounded-full bg-primary"
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

// Pulse animation
const PulseSpinner = () => (
  <div className="relative">
    <motion.div
      className="absolute h-8 w-8 rounded-full bg-primary/20"
      animate={{
        scale: [1, 1.5, 1],
        opacity: [0.8, 0, 0.8]
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
    <motion.div
      className="h-8 w-8 rounded-full bg-primary/40"
      animate={{
        scale: [1, 1.2, 1],
        opacity: [1, 0.6, 1]
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
        delay: 0.3
      }}
    />
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="h-2 w-2 rounded-full bg-primary" />
    </div>
  </div>
);

// Progress bar component
const ProgressBar = () => (
  <div className="w-32 h-0.5 bg-foreground/10 rounded-full overflow-hidden">
    <motion.div
      className="h-full bg-primary rounded-full"
      initial={{ x: "-100%" }}
      animate={{ x: "100%" }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
  </div>
);

export const Preloader = ({ 
  message = "Loading...", 
  className,
  variant = 'minimal'
}: PreloaderProps) => {
  const renderSpinner = () => {
    switch (variant) {
      case 'dots':
        return <DotsSpinner />;
      case 'pulse':
        return <PulseSpinner />;
      case 'minimal':
      default:
        return <ModernSpinner />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ 
        duration: 0.15,
        ease: "easeOut"
      }}
      className={cn(
        "fixed inset-0 z-[9999] flex flex-col items-center justify-center",
        "bg-background/95 backdrop-blur-sm",
        "supports-[backdrop-filter]:bg-background/60",
        className
      )}
    >
      {/* Main loader container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: -10 }}
        transition={{ 
          duration: 0.2,
          ease: "easeOut"
        }}
        className="flex flex-col items-center space-y-4"
      >
        {/* Spinner */}
        <div className="flex items-center justify-center">
          {renderSpinner()}
        </div>

        {/* Loading text */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.2 }}
            className="text-center"
          >
            <p className="text-sm font-medium text-foreground/80 tracking-tight">
              {message}
            </p>
            
            {/* Progress bar */}
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ delay: 0.3, duration: 0.3 }}
              className="mt-3 flex justify-center"
            >
              <ProgressBar />
            </motion.div>
          </motion.div>
        )}
      </motion.div>

      {/* Ambient background effect */}
      <motion.div
        className="absolute inset-0 -z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5" />
      </motion.div>
    </motion.div>
  );
}; 