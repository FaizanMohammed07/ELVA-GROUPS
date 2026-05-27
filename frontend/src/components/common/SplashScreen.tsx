import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LETTERS = ['E', 'L', 'U', 'N', 'O', 'R', 'A'];

export const SplashScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [phase, setPhase] = useState<'letters' | 'tagline' | 'exit' | 'done'>('letters');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('tagline'), 1600);
    const t2 = setTimeout(() => setPhase('exit'), 3000);
    const t3 = setTimeout(() => {
      setPhase('done');
      onComplete();
    }, 4000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {phase !== 'done' && (
        <motion.div
          className="fixed inset-0 z-[9999] bg-charcoal-950 flex flex-col items-center justify-center overflow-hidden"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        >
          {/* Warm radial glow */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            animate={{ opacity: [0.25, 0.55, 0.25] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              background: 'radial-gradient(ellipse 70% 55% at 50% 52%, rgba(201,169,110,0.18) 0%, transparent 70%)',
            }}
          />

          {/* Dot grid */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.07]"
            style={{
              backgroundImage: 'radial-gradient(circle, #C9A96E 1px, transparent 1px)',
              backgroundSize: '36px 36px',
            }}
          />

          {/* Corner accents */}
          {[
            'top-6 left-6 border-t border-l',
            'top-6 right-6 border-t border-r',
            'bottom-6 left-6 border-b border-l',
            'bottom-6 right-6 border-b border-r',
          ].map((cls, i) => (
            <motion.div
              key={i}
              className={`absolute w-8 h-8 sm:w-10 sm:h-10 border-gold-600/40 ${cls}`}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + i * 0.08, duration: 0.5 }}
            />
          ))}

          {/* Letters */}
          <div className="flex items-end gap-[0.15em] sm:gap-[0.2em] mb-6 sm:mb-8 px-4">
            {LETTERS.map((letter, i) => (
              <motion.span
                key={letter + i}
                initial={{ y: 56, opacity: 0, filter: 'blur(10px)' }}
                animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
                transition={{
                  delay: i * 0.1,
                  duration: 0.72,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="font-display text-white leading-none select-none"
                style={{ fontSize: 'clamp(2.4rem, 10vw, 6rem)', letterSpacing: '0.06em' }}
              >
                {letter}
              </motion.span>
            ))}
          </div>

          {/* Gold line */}
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{
              scaleX: phase === 'tagline' || phase === 'exit' ? 1 : 0,
              opacity: phase === 'tagline' || phase === 'exit' ? 1 : 0,
            }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="h-px w-40 sm:w-56 bg-gradient-to-r from-transparent via-gold-400 to-transparent origin-center mb-5 sm:mb-6"
          />

          {/* Tagline */}
          <AnimatePresence>
            {(phase === 'tagline' || phase === 'exit') && (
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.55, ease: 'easeOut' }}
                className="flex flex-col items-center gap-1.5"
              >
                <p className="font-sans text-gold-400/80 text-[10px] sm:text-xs tracking-[0.55em] uppercase">
                  Premium Handcrafted Gifts
                </p>
                <p className="font-sans text-charcoal-500 text-[9px] sm:text-[10px] tracking-[0.35em] uppercase">
                  Made with Love in India
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Exit curtains */}
          <AnimatePresence>
            {phase === 'exit' && (
              <>
                <motion.div
                  initial={{ x: 0 }}
                  animate={{ x: '-100%' }}
                  transition={{ duration: 0.72, ease: [0.76, 0, 0.24, 1], delay: 0.12 }}
                  className="absolute inset-y-0 left-0 w-1/2 bg-charcoal-950 z-10"
                />
                <motion.div
                  initial={{ x: 0 }}
                  animate={{ x: '100%' }}
                  transition={{ duration: 0.72, ease: [0.76, 0, 0.24, 1], delay: 0.12 }}
                  className="absolute inset-y-0 right-0 w-1/2 bg-charcoal-950 z-10"
                />
              </>
            )}
          </AnimatePresence>

          {/* Loading dots */}
          <div className="absolute bottom-8 sm:bottom-10 flex gap-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-1 h-1 rounded-full bg-gold-500"
                animate={{ opacity: [0.25, 1, 0.25], scale: [0.8, 1.2, 0.8] }}
                transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.22 }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
