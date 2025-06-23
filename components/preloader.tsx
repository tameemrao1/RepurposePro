"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from "@/lib/utils";

interface PreloaderProps {
  message?: string;
  className?: string;
}

export const Preloader = ({ message = "Loading...", className }: PreloaderProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm",
        className
      )}
    >
      <div className="relative flex flex-col items-center">
        {/* Main spinner */}
        <motion.div
          className="h-16 w-16 rounded-full border-4 border-primary/20"
          style={{ borderTopColor: 'var(--primary)' }}
          animate={{ rotate: 360 }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        
        {/* Inner dot with pulse effect */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={[
            { scale: 1, opacity: 1 },
            { scale: 0.8, opacity: 0.5 }
          ]}
          transition={{
            duration: 1,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut"
          }}
        >
          <div className="h-4 w-4 rounded-full bg-primary" />
        </motion.div>
      </div>

      {/* Loading text with shimmer effect */}
      <motion.div
        className="relative mt-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <motion.p
          className="text-sm font-medium text-foreground"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          {message}
        </motion.p>
      </motion.div>
    </motion.div>
  );
}; 