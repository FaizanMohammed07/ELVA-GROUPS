import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Star } from 'lucide-react';

interface Testimonial {
  name: string;
  city: string;
  rating: number;
  review: string;
  product: string;
  avatar?: string;
}

export const TestimonialCard = ({ testimonial, index = 0 }: { testimonial: Testimonial; index?: number }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="bg-white p-8 border border-charcoal-100"
    >
      <div className="flex gap-0.5 mb-4">
        {Array.from({ length: testimonial.rating }).map((_, i) => (
          <Star key={i} size={14} className="fill-gold-400 text-gold-400" />
        ))}
      </div>
      <p className="font-sans text-charcoal-700 text-sm leading-relaxed mb-6">"{testimonial.review}"</p>
      <div className="border-t border-charcoal-100 pt-4 flex items-center justify-between">
        <div>
          <p className="font-sans font-semibold text-charcoal-900 text-sm">{testimonial.name}</p>
          <p className="font-sans text-charcoal-400 text-xs">{testimonial.city}</p>
        </div>
        <p className="font-sans text-charcoal-400 text-xs text-right max-w-[120px]">{testimonial.product}</p>
      </div>
    </motion.div>
  );
};
