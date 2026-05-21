import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Upload, X, ChevronRight, CheckCircle, Sparkles, Clock, IndianRupee, Heart } from 'lucide-react';
import { apiClient } from '@api/client';
import { useAuthStore } from '@store/authStore';
import toast from 'react-hot-toast';

const CATEGORIES = [
  { id: 'candles', label: 'Luxury Candles', emoji: '🕯️', desc: 'Personalized scents & labels' },
  { id: 'clay-art', label: 'Clay Art', emoji: '🏺', desc: 'Handcrafted sculptures' },
  { id: 'hampers', label: 'Gift Hampers', emoji: '🎁', desc: 'Curated luxury boxes' },
  { id: 'jewellery', label: 'Jewellery', emoji: '💎', desc: 'Artisan-made pieces' },
  { id: 'home-decor', label: 'Home Decor', emoji: '🏡', desc: 'Handcrafted accents' },
  { id: 'couple', label: 'Couple Gifts', emoji: '💑', desc: 'For anniversaries & love' },
  { id: 'corporate', label: 'Corporate', emoji: '🤝', desc: 'Branded gifting at scale' },
  { id: 'festival', label: 'Festival Gifts', emoji: '🪔', desc: 'Diwali, Eid, Holi & more' },
];

const INTRO_SLIDES = [
  { title: 'Something Truly Yours', sub: 'Every ELVA custom piece begins with your story.' },
  { title: 'Handcrafted by Artisans', sub: 'Skilled hands bring your vision to life.' },
  { title: 'Made with Pure Love', sub: 'No machine can replicate what a craftsperson gives.' },
  { title: "Let's Create Together", sub: 'Tell us what you have in mind.' },
];

const STEPS = ['Category', 'Description', 'Details', 'Submit'];

export default function CustomOrderPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '25%']);

  const [showIntro, setShowIntro] = useState(!sessionStorage.getItem('custom-order-intro-seen'));
  const [introSlide, setIntroSlide] = useState(0);
  const [step, setStep] = useState(0);
  const [category, setCategory] = useState('');
  const [form, setForm] = useState({ description: '', colorPreference: '', size: '', budget: '', deadline: '', quantity: '1', contactName: '', contactPhone: '', specialInstructions: '' });
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const submitMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      return apiClient.post('/custom-orders', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    },
    onSuccess: () => {
      setSuccess(true);
      toast.success('Custom order request submitted!');
    },
    onError: () => toast.error('Failed to submit. Please try again.'),
  });

  const dismissIntro = useCallback(() => {
    sessionStorage.setItem('custom-order-intro-seen', '1');
    setShowIntro(false);
  }, []);

  const handleIntroNext = useCallback(() => {
    if (introSlide < INTRO_SLIDES.length - 1) { setIntroSlide(i => i + 1); }
    else { dismissIntro(); }
  }, [introSlide, dismissIntro]);

  const addImages = (files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files).slice(0, 3 - images.length);
    setImages(prev => [...prev, ...newFiles]);
    newFiles.forEach((f) => {
      const reader = new FileReader();
      reader.onload = (e) => setPreviews(prev => [...prev, e.target?.result as string]);
      reader.readAsDataURL(f);
    });
  };

  const removeImage = (i: number) => {
    setImages(prev => prev.filter((_, idx) => idx !== i));
    setPreviews(prev => prev.filter((_, idx) => idx !== i));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) { toast.error('Please login to submit a custom order'); navigate('/login'); return; }
    const fd = new FormData();
    fd.append('category', category);
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    images.forEach((img) => fd.append('images', img));
    submitMutation.mutate(fd);
  };

  const canNextStep = () => {
    if (step === 0) return !!category;
    if (step === 1) return form.description.length >= 20;
    if (step === 2) return !!form.contactName && !!form.contactPhone;
    return true;
  };

  if (success) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center px-4">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center max-w-md">
          <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ delay: 0.5, duration: 0.5 }}>
            <CheckCircle size={64} className="mx-auto mb-6 text-gold-500" />
          </motion.div>
          <h1 className="font-display text-4xl text-charcoal-950 mb-4">Request Received!</h1>
          <p className="text-charcoal-500 leading-relaxed mb-8">Our artisan team will review your request and get back to you within 24–48 hours with a quote and timeline.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={() => navigate('/account/custom-orders')} className="btn-primary text-sm py-3 px-6">View My Requests</button>
            <button onClick={() => navigate('/products')} className="btn-outline text-sm py-3 px-6">Continue Shopping</button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="overflow-x-hidden">
      {/* Cinematic Intro */}
      <AnimatePresence>
        {showIntro && (
          <motion.div initial={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} className="fixed inset-0 bg-charcoal-950 z-[100] flex items-center justify-center overflow-hidden">
            {/* Dot grid */}
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #C9A96E 1px, transparent 1px)', backgroundSize: '36px 36px' }} />
            {/* Floating orbs */}
            {[...Array(4)].map((_, i) => (
              <motion.div key={i} className="absolute rounded-full mix-blend-screen pointer-events-none" style={{ width: 200 + i * 80, height: 200 + i * 80, background: `radial-gradient(circle, rgba(201,169,110,${0.12 - i * 0.02}) 0%, transparent 70%)`, left: `${20 + i * 20}%`, top: `${20 + i * 15}%` }} animate={{ y: [0, -20, 0] }} transition={{ duration: 3 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 0.5 }} />
            ))}
            <AnimatePresence mode="wait">
              <motion.div key={introSlide} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.5 }} className="text-center px-6 max-w-xl relative z-10">
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-gold-400 text-xs tracking-[0.5em] uppercase mb-6">Custom Order</motion.p>
                <h2 className="font-display text-5xl md:text-6xl text-white leading-tight mb-4">{INTRO_SLIDES[introSlide].title}</h2>
                <p className="text-charcoal-300 text-lg">{INTRO_SLIDES[introSlide].sub}</p>
              </motion.div>
            </AnimatePresence>
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-6">
              <div className="flex gap-2">
                {INTRO_SLIDES.map((_, i) => <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all ${i === introSlide ? 'bg-gold-400 w-6' : 'bg-charcoal-600'}`} />)}
              </div>
              <div className="flex gap-3">
                <button onClick={dismissIntro} className="text-charcoal-400 text-sm hover:text-charcoal-200">Skip</button>
                <button onClick={handleIntroNext} className="flex items-center gap-2 bg-gold-500 text-white px-6 py-2.5 text-sm font-medium hover:bg-gold-600 transition-colors">
                  {introSlide < INTRO_SLIDES.length - 1 ? 'Next' : "Let's Begin"} <ChevronRight size={15} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero */}
      <section ref={heroRef} className="relative h-[60vh] min-h-[400px] bg-charcoal-950 flex items-center overflow-hidden">
        <motion.div style={{ y: heroY }} className="absolute inset-0">
          {[...Array(4)].map((_, i) => (
            <motion.div key={i} className="absolute rounded-full pointer-events-none" style={{ width: 300 + i * 100, height: 300 + i * 100, background: `radial-gradient(circle, rgba(201,169,110,${0.08 - i * 0.015}) 0%, transparent 70%)`, left: `${10 + i * 25}%`, top: `${20 + i * 10}%` }} animate={{ y: [0, -15, 0] }} transition={{ duration: 4 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 0.8 }} />
          ))}
          <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle, #C9A96E 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
        </motion.div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-gold-400 text-xs tracking-[0.5em] uppercase mb-4">Custom Order</motion.p>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="font-display text-5xl md:text-7xl text-white leading-tight mb-6">
            Made Just<br />for You
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-charcoal-300 text-lg max-w-lg">
            Tell us what you have in mind. Our artisans will craft something extraordinary, just for you.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex flex-wrap gap-4 mt-8">
            {[['24-48h', 'Quote in', Clock], ['₹500+', 'Starting from', IndianRupee], ['100%', 'Handcrafted', Heart], ['Unlimited', 'Customizations', Sparkles]].map(([val, label, Icon]) => (
              <div key={val as string} className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2">
                {/*@ts-ignore*/}
                <Icon size={14} className="text-gold-400" />
                <span className="text-white text-sm font-medium">{val as string}</span>
                <span className="text-charcoal-400 text-xs">{label as string}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-cream-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="font-display text-3xl text-center text-charcoal-950 mb-10">How It Works</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[['01', 'Choose Category', 'Pick what type of product you want crafted.'], ['02', 'Describe Your Vision', 'Tell us the story, occasion, and preferences.'], ['03', 'Get a Quote', 'We send a price and timeline within 48 hours.'], ['04', 'We Craft It', 'Your artisan brings it to life with love.']].map(([num, title, desc]) => (
              <motion.div key={num as string} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center">
                <div className="font-display text-5xl text-gold-200 mb-3">{num}</div>
                <h3 className="font-serif text-sm font-semibold text-charcoal-900 mb-1">{title}</h3>
                <p className="text-xs text-charcoal-400 leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          {/* Step Indicator */}
          <div className="flex items-center mb-12">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${i < step ? 'bg-gold-500 text-white' : i === step ? 'bg-charcoal-950 text-white' : 'bg-charcoal-100 text-charcoal-400'}`}>
                  {i < step ? <CheckCircle size={16} /> : i + 1}
                </div>
                {i < STEPS.length - 1 && <div className={`flex-1 h-px mx-2 transition-all ${i < step ? 'bg-gold-400' : 'bg-charcoal-100'}`} />}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            <AnimatePresence mode="wait">
              {/* Step 0: Category */}
              {step === 0 && (
                <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h2 className="font-display text-3xl text-charcoal-950 mb-2">What would you like?</h2>
                  <p className="text-charcoal-400 text-sm mb-8">Select the type of product you want customized.</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {CATEGORIES.map((cat) => (
                      <button key={cat.id} type="button" onClick={() => setCategory(cat.id)} className={`p-4 border-2 text-left transition-all hover:border-gold-300 ${category === cat.id ? 'border-gold-500 bg-gold-50' : 'border-charcoal-100 bg-white'}`}>
                        <div className="text-3xl mb-2">{cat.emoji}</div>
                        <p className={`text-sm font-medium ${category === cat.id ? 'text-gold-700' : 'text-charcoal-900'}`}>{cat.label}</p>
                        <p className="text-xs text-charcoal-400 mt-0.5">{cat.desc}</p>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Step 1: Description */}
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                  <div>
                    <h2 className="font-display text-3xl text-charcoal-950 mb-2">Describe your vision</h2>
                    <p className="text-charcoal-400 text-sm mb-6">The more detail, the better we can craft it for you.</p>
                  </div>
                  <div>
                    <label className="label-xs">Describe what you want *</label>
                    <textarea rows={5} value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} placeholder="E.g. I want a personalized candle set for my best friend's wedding. She loves lavender scent and the theme is blush pink. I need 5 candles with custom labels saying 'Priya & Rahul — 12.11.2025'..." className="input-field resize-none text-sm" />
                    <p className="text-xs text-charcoal-400 mt-1">{form.description.length}/20 minimum characters</p>
                  </div>
                  <div><label className="label-xs">Color / Theme Preference</label><input value={form.colorPreference} onChange={(e) => setForm(f => ({ ...f, colorPreference: e.target.value }))} placeholder="Blush pink, ivory and gold, earthy tones…" className="input-field" /></div>
                  <div>
                    <label className="label-xs">Reference Images (up to 3)</label>
                    <div className="flex gap-3 flex-wrap mt-2">
                      {previews.map((preview, i) => (
                        <div key={i} className="relative w-24 h-24 bg-cream-100">
                          <img src={preview} alt="" className="w-full h-full object-cover" />
                          <button type="button" onClick={() => removeImage(i)} className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center"><X size={10} /></button>
                        </div>
                      ))}
                      {images.length < 3 && (
                        <button type="button" onClick={() => fileInputRef.current?.click()} className="w-24 h-24 border-2 border-dashed border-charcoal-200 flex flex-col items-center justify-center gap-1 hover:border-charcoal-400 transition-colors">
                          <Upload size={18} className="text-charcoal-300" />
                          <span className="text-xs text-charcoal-400">Upload</span>
                        </button>
                      )}
                    </div>
                    <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => addImages(e.target.files)} />
                    <p className="text-xs text-charcoal-400 mt-2">Inspiration images, colour swatches, design references — anything helps!</p>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Details */}
              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                  <div>
                    <h2 className="font-display text-3xl text-charcoal-950 mb-2">A few more details</h2>
                    <p className="text-charcoal-400 text-sm mb-6">Help us get this exactly right.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="label-xs">Your Name *</label><input required value={form.contactName} onChange={(e) => setForm(f => ({ ...f, contactName: e.target.value }))} className="input-field" /></div>
                    <div><label className="label-xs">Phone Number *</label><input required type="tel" value={form.contactPhone} onChange={(e) => setForm(f => ({ ...f, contactPhone: e.target.value }))} placeholder="+91 98765 43210" className="input-field" /></div>
                    <div><label className="label-xs">Quantity</label><input type="number" min="1" value={form.quantity} onChange={(e) => setForm(f => ({ ...f, quantity: e.target.value }))} className="input-field" /></div>
                    <div><label className="label-xs">Budget (₹, optional)</label><input type="number" min="0" value={form.budget} onChange={(e) => setForm(f => ({ ...f, budget: e.target.value }))} placeholder="5000" className="input-field" /></div>
                    <div><label className="label-xs">Size / Dimensions</label><input value={form.size} onChange={(e) => setForm(f => ({ ...f, size: e.target.value }))} placeholder="Small, Medium, 6 inches tall…" className="input-field" /></div>
                    <div><label className="label-xs">Needed By</label><input type="date" value={form.deadline} onChange={(e) => setForm(f => ({ ...f, deadline: e.target.value }))} min={new Date().toISOString().split('T')[0]} className="input-field" /></div>
                  </div>
                  <div><label className="label-xs">Special Instructions</label><textarea rows={3} value={form.specialInstructions} onChange={(e) => setForm(f => ({ ...f, specialInstructions: e.target.value }))} placeholder="Any packaging preferences, personal messages to include, allergies for candles…" className="input-field resize-none" /></div>
                </motion.div>
              )}

              {/* Step 3: Review */}
              {step === 3 && (
                <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h2 className="font-display text-3xl text-charcoal-950 mb-2">Review & Submit</h2>
                  <p className="text-charcoal-400 text-sm mb-6">Take a moment to review your request before we send it to our artisans.</p>
                  <div className="bg-cream-50 p-6 space-y-4">
                    {[['Category', CATEGORIES.find(c => c.id === category)?.label || category], ['Description', form.description], ['Color Preference', form.colorPreference || '—'], ['Quantity', form.quantity], ['Budget', form.budget ? `₹${form.budget}` : '—'], ['Needed By', form.deadline || '—'], ['Contact', `${form.contactName}, ${form.contactPhone}`]].map(([label, value]) => (
                      <div key={label as string} className="flex gap-4">
                        <span className="text-xs text-charcoal-400 uppercase tracking-wide font-medium w-28 flex-shrink-0 pt-0.5">{label}</span>
                        <span className="text-sm text-charcoal-800 flex-1">{value}</span>
                      </div>
                    ))}
                    {previews.length > 0 && (
                      <div className="flex gap-4">
                        <span className="text-xs text-charcoal-400 uppercase tracking-wide font-medium w-28 flex-shrink-0 pt-0.5">Images</span>
                        <div className="flex gap-2">
                          {previews.map((p, i) => <img key={i} src={p} alt="" className="w-12 h-12 object-cover" />)}
                        </div>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-charcoal-400 mt-4">After submission, our team will reach out within 24–48 hours with a custom quote and estimated timeline.</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-10 pt-6 border-t border-charcoal-100">
              {step > 0 ? (
                <button type="button" onClick={() => setStep(s => s - 1)} className="btn-outline py-3 px-6 text-sm">← Back</button>
              ) : <div />}
              {step < STEPS.length - 1 ? (
                <button type="button" disabled={!canNextStep()} onClick={() => setStep(s => s + 1)} className="btn-primary py-3 px-8 text-sm disabled:opacity-40">
                  Continue →
                </button>
              ) : (
                <button type="submit" disabled={submitMutation.isPending} className="btn-primary py-3 px-8 text-sm flex items-center gap-2 disabled:opacity-60">
                  {submitMutation.isPending ? 'Submitting…' : <><Sparkles size={15} /> Submit Request</>}
                </button>
              )}
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
