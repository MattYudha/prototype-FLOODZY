'use client';

import Image from 'next/image';
import { Shield, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SplashScreenProps {
  isFadingOut: boolean;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const logoVariants = {
    hidden: { scale: 0.5, opacity: 0 },
    visible: { 
        scale: 1, 
        opacity: 1, 
        transition: { damping: 15, stiffness: 100 }
    },
};

const titleLetterVariants = {
    hidden: { y: 40, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { damping: 12, stiffness: 100 } },
}

const subtitleVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { delay: 0.8, duration: 0.8 } },
}

export function SplashScreen({ isFadingOut }: SplashScreenProps) {
  return (
    <AnimatePresence>
      {!isFadingOut && (
        <motion.div
          className={`fixed inset-0 z-[200] flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-gray-900 text-white`}
          exit={{ opacity: 0, transition: { duration: 0.8 } }}
        >
          <motion.div
            className="text-center"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={logoVariants}>
              <Shield className="h-12 w-12 sm:h-16 sm:w-16 text-secondary mx-auto mb-4 sm:mb-6" />
            </motion.div>

            <motion.h1
              className="text-5xl sm:text-6xl font-bold tracking-wider flex justify-center"
              aria-label="Floodzie"
            >
              {'Flood'.split('').map((char, index) => (
                <motion.span key={index} variants={titleLetterVariants} className="inline-block">
                  {char}
                </motion.span>
              ))}
              <motion.span variants={titleLetterVariants} className="text-secondary inline-block">
                zie
              </motion.span>
            </motion.h1>

            <motion.p
              className="text-base sm:text-lg text-white/70 mt-4 px-4 sm:px-0"
              variants={subtitleVariants}
            >
              Sistem Peringatan Dini Banjir Berbasis Komunitas
            </motion.p>

            <motion.div
              className="absolute bottom-10 sm:bottom-16 left-1/2 -translate-x-1/2 flex items-center space-x-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5, duration: 0.8 }}
            >
              <Loader className="h-5 w-5 animate-spin text-secondary" />
              <span className="text-sm text-white/60">Memuat data...</span>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
