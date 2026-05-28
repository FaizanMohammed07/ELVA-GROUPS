import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@api/client';
import { Mail, Phone, MapPin, Instagram, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { SEOHead } from '@components/seo/SEOHead';

const contactSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email required'),
  subject: z.string().min(3, 'Subject is required'),
  message: z.string().min(20, 'Please write at least 20 characters'),
  orderNumber: z.string().optional(),
});

type ContactForm = z.infer<typeof contactSchema>;

export default function ContactPage() {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: ContactForm) => apiClient.post('/contact', data),
    onSuccess: () => {
      toast.success('Message sent! We\'ll get back to you within 24 hours.');
      reset();
    },
    onError: () => toast.error('Failed to send. Please try again or email us directly.'),
  });

  return (
    <>
      <SEOHead
        title="Contact ELUNORA — Get in Touch"
        description="Have a question or need help? Contact ELUNORA's customer support. We respond within 24 hours. Reach us via email, phone, or our contact form."
        keywords="contact ELUNORA, customer support, ELUNORA help, gift inquiry"
      />
    <div className="min-h-screen pt-32 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-gold-600 text-xs tracking-[0.4em] uppercase font-sans mb-3">Get in Touch</p>
          <h1 className="font-serif text-5xl text-charcoal-950 mb-4">Contact Us</h1>
          <p className="font-sans text-charcoal-500 max-w-md mx-auto">
            Have a question, need help with your order, or want to place a bulk order? We're here to help.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-12">
          {/* Contact Info */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h2 className="font-sans font-semibold text-charcoal-950 uppercase tracking-wider text-sm mb-6">Reach Out</h2>
              <div className="space-y-5">
                {[
                  { icon: Mail, label: 'Email', value: 'hello@elvagroup.in', href: 'mailto:hello@elvagroup.in' },
                  { icon: Phone, label: 'WhatsApp', value: '+91 98765 43210', href: 'https://wa.me/919876543210' },
                  { icon: MapPin, label: 'Location', value: 'Bangalore, Karnataka, India', href: null },
                ].map(({ icon: Icon, label, value, href }) => (
                  <div key={label} className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-cream-100 flex items-center justify-center flex-shrink-0">
                      <Icon size={16} className="text-charcoal-700" />
                    </div>
                    <div>
                      <p className="font-sans text-xs text-charcoal-500 uppercase tracking-wider mb-0.5">{label}</p>
                      {href ? (
                        <a href={href} className="font-sans text-charcoal-950 text-sm hover:text-gold-600 transition-colors">{value}</a>
                      ) : (
                        <p className="font-sans text-charcoal-950 text-sm">{value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="font-sans font-semibold text-charcoal-950 uppercase tracking-wider text-sm mb-4">Follow Us</h2>
              <div className="flex gap-3">
                <a href="https://instagram.com/elvagroup.in" target="_blank" rel="noopener noreferrer" className="w-10 h-10 border border-charcoal-200 flex items-center justify-center hover:border-charcoal-950 hover:bg-charcoal-950 hover:text-white transition-all group">
                  <Instagram size={16} className="text-charcoal-700 group-hover:text-white" />
                </a>
                <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer" className="w-10 h-10 border border-charcoal-200 flex items-center justify-center hover:border-charcoal-950 hover:bg-charcoal-950 hover:text-white transition-all group">
                  <MessageCircle size={16} className="text-charcoal-700 group-hover:text-white" />
                </a>
              </div>
            </div>

            <div className="bg-cream-50 p-5">
              <p className="font-sans font-semibold text-charcoal-950 text-sm mb-2">Business Hours</p>
              <p className="font-sans text-charcoal-600 text-sm">Monday – Saturday: 10 AM – 7 PM IST</p>
              <p className="font-sans text-charcoal-600 text-sm">Sunday: Closed</p>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit(d => mutate(d))} className="space-y-5">
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <input {...register('name')} placeholder="Your Name" className="input-luxury" />
                  {errors.name && <p className="text-red-500 text-xs mt-1 font-sans">{errors.name.message}</p>}
                </div>
                <div>
                  <input {...register('email')} type="email" placeholder="Email Address" className="input-luxury" />
                  {errors.email && <p className="text-red-500 text-xs mt-1 font-sans">{errors.email.message}</p>}
                </div>
              </div>
              <div>
                <input {...register('subject')} placeholder="Subject" className="input-luxury" />
                {errors.subject && <p className="text-red-500 text-xs mt-1 font-sans">{errors.subject.message}</p>}
              </div>
              <div>
                <input {...register('orderNumber')} placeholder="Order Number (if applicable)" className="input-luxury" />
              </div>
              <div>
                <textarea {...register('message')} placeholder="Your message..." rows={6} className="input-luxury w-full resize-none" />
                {errors.message && <p className="text-red-500 text-xs mt-1 font-sans">{errors.message.message}</p>}
              </div>
              <button type="submit" disabled={isPending} className="btn-primary px-10 py-4 w-full">
                {isPending ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
