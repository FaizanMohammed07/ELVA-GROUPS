import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LETTERS = ['E', 'L', 'V', 'A'];

export const SplashScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [phase, setPhase] = useState<'letters' | 'tagline' | 'exit' | 'done'>('letters');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('tagline'), 1200);
    const t2 = setTimeout(() => setPhase('exit'), 2600);
    const t3 = setTimeout(() => {
      setPhase('done');
      onComplete();
    }, 3600);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {phase !== 'done' && (
        <motion.div
          className="fixed inset-0 z-[9999] bg-charcoal-950 flex flex-col items-center justify-center overflow-hidden"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
        >
          {/* Warm radial glow */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(201,169,110,0.18) 0%, transparent 70%)',
            }}
          />

          {/* Dot grid */}
          <div
            className="absolute inset-0 pointer-events-none opacity-10"
            style={{
              backgroundImage: 'radial-gradient(circle, #C9A96E 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />

          {/* Letters */}
          <div className="flex items-end gap-1 sm:gap-2 mb-8">
            {LETTERS.map((letter, i) => (
              <motion.span
                key={letter}
                initial={{ y: 60, opacity: 0, filter: 'blur(8px)' }}
                animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
                transition={{
                  delay: i * 0.12,
                  duration: 0.7,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="font-display text-[clamp(4rem,15vw,9rem)] text-white leading-none tracking-[0.12em]"
              >
                {letter}
              </motion.span>
            ))}
          </div>

          {/* Gold line */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: phase === 'tagline' || phase === 'exit' ? 1 : 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="h-px w-48 bg-gradient-to-r from-transparent via-gold-400 to-transparent origin-center mb-6"
          />

          {/* Tagline */}
          <AnimatePresence>
            {(phase === 'tagline' || phase === 'exit') && (
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="font-sans text-charcoal-400 text-xs sm:text-sm tracking-[0.5em] uppercase"
              >
                Handcrafted with Love
              </motion.p>
            )}
          </AnimatePresence>

          {/* Exit curtains */}
          <AnimatePresence>
            {phase === 'exit' && (
              <>
                <motion.div
                  initial={{ x: 0 }}
                  animate={{ x: '-100%' }}
                  transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1], delay: 0.1 }}
                  className="absolute inset-y-0 left-0 w-1/2 bg-charcoal-950 z-10"
                />
                <motion.div
                  initial={{ x: 0 }}
                  animate={{ x: '100%' }}
                  transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1], delay: 0.1 }}
                  className="absolute inset-y-0 right-0 w-1/2 bg-charcoal-950 z-10"
                />
              </>
            )}
          </AnimatePresence>

          {/* Loading dots */}
          <div className="absolute bottom-10 flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-1 h-1 rounded-full bg-gold-500"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
