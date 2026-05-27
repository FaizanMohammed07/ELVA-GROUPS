import { useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Instagram, Heart, MessageCircle, Send, Bookmark, ShoppingBag, Volume2, VolumeX } from 'lucide-react';
import { Link } from 'react-router-dom';

const POSTS = [
  { id: 1, type: 'video', src: '/instagram/reels/v-1.mp4', likes: '1,240', comments: '84', shopUrl: '/category/premium-candles', title: 'Luxury Candles' },
  { id: 2, type: 'image', src: '/instagram/images/IMG-4.jpg.jpeg', likes: '845', comments: '32', shopUrl: '/category/clay-art', title: 'Artisan Clay Art' },
  { id: 3, type: 'video', src: '/instagram/reels/v-2.mp4', likes: '5,602', comments: '412', shopUrl: '/category/premium-candles', title: 'Premium Candles' },
  { id: 4, type: 'image', src: '/instagram/images/IMG-5.jpg.jpeg', likes: '2,310', comments: '118', shopUrl: '/category/clay-art', title: 'Artisan Clay Art' },
  { id: 5, type: 'video', src: '/instagram/reels/v-3.mp4', likes: '4,109', comments: '230', shopUrl: '/category/premium-candles', title: 'Sculpted Scented Candle' },
  { id: 6, type: 'image', src: '/instagram/images/IMG-6.jpg.jpeg', likes: '1,844', comments: '76', shopUrl: '/category/luxury-hampers', title: 'Luxury Curated Hamper' },
  { id: 7, type: 'video', src: '/instagram/reels/v-4.mp4', likes: '10,234', comments: '890', shopUrl: '/category/premium-candles', title: 'Premium Beeswax Candle' },
  { id: 8, type: 'video', src: '/instagram/reels/img-2.mp4', likes: '2,011', comments: '145', shopUrl: '/category/personalized-gifts', title: 'Personalized Gift Set' },
];

const INSTAGRAM_IMAGES = [
  { id: 1, src: '/instagram/images/IMG-3.jpg.jpeg', alt: 'Handcrafted Premium Candle' },
  { id: 2, src: '/instagram/images/IMG-4.jpg.jpeg', alt: 'Bespoke Personalized Gifting' },
  { id: 3, src: '/instagram/images/IMG-5.jpg.jpeg', alt: 'Intricate Clay Masterpiece' },
  { id: 4, src: '/instagram/images/IMG-6.jpg.jpeg', alt: 'Luxury Gifting Hamper' },
  { id: 5, src: '/instagram/images/IMG-7.jpg.jpeg', alt: 'Exquisite Candle Collection' },
  { id: 6, src: '/instagram/images/IMG-20260522-WA0051.jpg.jpeg', alt: 'Signature Handcrafted Creation' },
];

// Encapsulated Reel Card component with sound controls
const ReelCard = ({ post }: { post: typeof POSTS[0] }) => {
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const toggleMute = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (videoRef.current) {
      const nextMuted = !videoRef.current.muted;
      videoRef.current.muted = nextMuted;
      setIsMuted(nextMuted);
    }
  };

  return (
    <div
      className="relative flex flex-col w-[300px] sm:w-[340px] bg-white rounded-[24px] overflow-hidden flex-shrink-0 border border-charcoal-100/50 shadow-[0_10px_40px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.08)] transition-shadow duration-500 group"
    >
      {/* Instagram Card Header */}
      <div className="flex items-center justify-between p-4 border-b border-charcoal-50/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#FFDC80] via-[#FD1D1D] to-[#833AB4] p-[2px]">
            <div className="w-full h-full rounded-full bg-white border-2 border-white overflow-hidden flex items-center justify-center">
              <img 
                src="/instagram/images/insta-profile-icon.jpeg" 
                alt="elvahandmade_28 Profile Picture" 
                className="w-full h-full object-cover" 
              />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-sans text-xs font-bold text-charcoal-900 leading-tight">elvahandmade_28</span>
            <span className="font-sans text-[10px] text-charcoal-400">Original Audio</span>
          </div>
        </div>
        <a 
          href="https://www.instagram.com/elvahandmade_28?igsh=MWRrdDQweDNwbGQ2bw==" 
          target="_blank" 
          rel="noreferrer"
          className="bg-[#0095F6] hover:bg-[#1877F2] text-white font-sans text-xs font-bold px-4 py-1.5 rounded-lg transition-colors animate-fade-in"
        >
          Follow
        </a>
      </div>

      {/* Media Content */}
      <div className="relative aspect-[4/5] bg-charcoal-950 overflow-hidden">
        {post.type === 'video' ? (
          <>
            <video 
              ref={videoRef}
              src={post.src}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-transform duration-[10s] group-hover:scale-105"
            />
            {/* Sound Icon Button Overlay */}
            <button
              onClick={toggleMute}
              className="absolute bottom-4 right-4 z-30 w-9 h-9 bg-black/60 hover:bg-black/80 backdrop-blur-md text-white rounded-full flex items-center justify-center border border-white/20 transition-all duration-300 hover:scale-105 shadow-md"
            >
              {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} className="text-[#D4A853] animate-pulse" />}
            </button>
          </>
        ) : (
          <img 
            src={post.src} 
            alt="Instagram Post" 
            className="w-full h-full object-cover transition-transform duration-[10s] group-hover:scale-105"
          />
        )}
        
        {/* Watch on Instagram Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-10">
          <a href="https://www.instagram.com/elvahandmade_28?igsh=MWRrdDQweDNwbGQ2bw==" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-white font-sans text-sm font-bold bg-white/20 backdrop-blur-md px-6 py-3 rounded-full hover:bg-white/30 transition-colors">
            <Instagram size={18} /> View on Instagram
          </a>
        </div>
      </div>

      {/* Instagram Card Footer */}
      <div className="p-4 bg-white">
        <div className="flex items-center justify-between mb-3 text-charcoal-900">
          <div className="flex items-center gap-4">
            <Heart size={24} className="hover:text-red-500 hover:fill-red-500 transition-colors cursor-pointer" />
            <MessageCircle size={24} className="hover:text-charcoal-500 transition-colors cursor-pointer" />
            <Send size={24} className="hover:text-charcoal-500 transition-colors cursor-pointer" />
          </div>
          <Bookmark size={24} className="hover:text-charcoal-500 transition-colors cursor-pointer" />
        </div>
        <p className="font-sans text-xs font-bold text-charcoal-900 mb-1">{post.likes} likes</p>
        <p className="font-sans text-xs text-charcoal-600 line-clamp-2">
          <span className="font-bold text-charcoal-900 mr-1">elvahandmade_28</span>
          {post.type === 'video' ? 'Handcrafting magic in the studio today ✨ Watch the process behind our bestselling pieces. #ElunoraGifts #Handcrafted #LuxuryGifts' : 'New arrivals are here! Discover the perfect curated pieces for your loved ones. 🎁✨'}
        </p>
        
        {/* Shop CTA Button */}
        <Link 
          to={post.shopUrl}
          className="my-3.5 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-[10px] font-sans font-bold tracking-widest uppercase bg-[#FAF7F2] hover:bg-[#D4A853] text-charcoal-900 hover:text-white transition-all duration-300 border border-charcoal-100/50 shadow-sm"
        >
          <ShoppingBag size={12} /> Shop {post.title}
        </Link>

        <p className="font-sans text-[10px] text-charcoal-400 mt-1 uppercase">View all {post.comments} comments</p>
      </div>
    </div>
  );
};

export const InstagramReels = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], ['-20%', '20%']);

  return (
    <section ref={containerRef} className="relative py-10 sm:py-14 overflow-hidden bg-[#FAF7F2]">
      {/* Background Decorative Text */}
      <motion.div style={{ y }} className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] overflow-hidden">
        <h2 className="font-display text-[15vw] leading-none whitespace-nowrap text-charcoal-900">
          @ELUNORAHANDMADE_28
        </h2>
      </motion.div>

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 mb-8 sm:mb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 text-center md:text-left">
          <div className="max-w-2xl mx-auto md:mx-0">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full border border-charcoal-100 bg-white shadow-sm"
            >
              <Instagram size={14} className="text-[#E1306C]" />
              <span className="text-[10px] sm:text-xs font-sans tracking-[0.2em] uppercase text-charcoal-600 font-bold">As Seen On Instagram</span>
            </motion.div>
            
            <motion.h2 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="font-display text-4xl sm:text-5xl lg:text-6xl text-charcoal-950 leading-[1.1]"
            >
              Follow Our <span className="italic text-[#D4A853]">Journey</span>
            </motion.h2>

            {/* Small Instagram Profile Glimpse Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-3.5 mt-4 p-2.5 bg-white/60 backdrop-blur-md rounded-2xl border border-charcoal-100/50 shadow-sm w-max mx-auto md:mx-0"
            >
              {/* Mini Profile Picture */}
              <div className="relative">
                <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#FFDC80] via-[#FD1D1D] to-[#833AB4] p-[2px] shadow-sm">
                  <div className="w-full h-full rounded-full bg-white border-2 border-white overflow-hidden flex items-center justify-center">
                    <img 
                      src="/instagram/images/insta-profile-icon.jpeg" 
                      alt="elvahandmade_28 Profile Picture" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full shadow-sm animate-pulse" />
              </div>
              
              <div className="flex flex-col text-left">
                <div className="flex items-center gap-1">
                  <span className="font-sans text-xs sm:text-sm font-black text-charcoal-950 leading-none">elvahandmade_28</span>
                  {/* Verified Icon */}
                  <span className="w-3.5 h-3.5 bg-[#0095F6] rounded-full flex items-center justify-center text-white text-[8px] font-black shadow-sm">✓</span>
                </div>
                <span className="font-sans text-[10px] text-charcoal-500 font-medium mt-1 block">
                  ✨ Luxury Handcrafted Gifts & Custom Creations
                </span>
              </div>
            </motion.div>
          </div>

          <motion.a 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            href="https://www.instagram.com/elvahandmade_28?igsh=MWRrdDQweDNwbGQ2bw=="
            target="_blank"
            rel="noopener noreferrer"
            className="group relative inline-flex items-center gap-3 px-8 py-4 sm:py-5 rounded-full overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F56040] opacity-90 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="relative z-10 text-xs sm:text-sm font-bold tracking-[0.2em] uppercase text-white">Follow @elvahandmade_28</span>
            <Instagram size={16} className="relative z-10 text-white group-hover:scale-110 transition-transform duration-300" />
          </motion.a>
        </div>
      </div>

      {/* Infinite Continuous Reels Marquee */}
      <div className="relative w-full overflow-hidden py-4 sm:py-8" style={{ maskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)' }}>
        <div className="flex gap-6 sm:gap-8 w-max animate-marquee hover:[animation-play-state:paused]">
          {[...POSTS, ...POSTS].map((post, idx) => (
            <ReelCard key={`${post.id}-${idx}`} post={post} />
          ))}
        </div>
      </div>

      {/* Spacing Separator */}
      <div className="h-8 sm:h-12" />

      {/* Auto-Scrolling Product Image Carousel (Marquee-Reverse) */}
      <div className="relative w-full overflow-hidden py-4 sm:py-6 bg-[#FAF7F2]" style={{ maskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)' }}>
        <div className="flex gap-6 sm:gap-8 w-max animate-marquee-reverse hover:[animation-play-state:paused]">
          {[...INSTAGRAM_IMAGES, ...INSTAGRAM_IMAGES].map((img, idx) => (
            <div 
              key={`product-img-${img.id}-${idx}`}
              className="relative w-[260px] sm:w-[300px] aspect-square rounded-[24px] overflow-hidden border border-white/80 shadow-[0_8px_30px_rgba(0,0,0,0.02)] group flex-shrink-0 cursor-pointer"
            >
              <img 
                src={img.src} 
                alt={img.alt} 
                className="w-full h-full object-cover transition-transform duration-[8s] group-hover:scale-105" 
              />
              
              {/* Instagram Hover Overlay styled beautifully */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-6">
                <div className="flex items-center justify-between text-white">
                  <span className="text-[10px] font-sans font-bold tracking-widest uppercase bg-white/20 backdrop-blur-md px-3 py-1 rounded-full">
                    Shop Feed
                  </span>
                  <Instagram size={16} />
                </div>
                <div className="flex flex-col text-white">
                  <p className="font-sans text-sm font-black mb-1 line-clamp-1">{img.alt}</p>
                  <p className="font-sans text-[10px] text-white/70">Click to view post details</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
