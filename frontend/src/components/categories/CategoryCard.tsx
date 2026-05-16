import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';

interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
  productCount?: number;
}

export const CategoryCard = ({ category, index = 0 }: { category: Category; index?: number }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={inView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.4, delay: index * 0.06 }}
    >
      <Link to={`/category/${category.slug}`} className="group block relative overflow-hidden bg-cream-50 aspect-square">
        {category.image && (
          <img
            src={category.image}
            alt={category.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="font-serif text-white text-lg font-medium leading-tight">{category.name}</h3>
          {category.productCount !== undefined && (
            <p className="text-white/70 text-xs font-sans mt-0.5">{category.productCount} products</p>
          )}
        </div>
      </Link>
    </motion.div>
  );
};
