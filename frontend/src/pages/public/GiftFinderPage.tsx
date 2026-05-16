import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, ArrowRight, RotateCcw } from 'lucide-react';

const questions = [
  {
    id: 'occasion',
    question: 'What\'s the occasion?',
    options: ['Birthday', 'Wedding', 'Anniversary', 'Festival', 'Corporate', 'Just Because'],
  },
  {
    id: 'recipient',
    question: 'Who is it for?',
    options: ['Partner', 'Parents', 'Friends', 'Colleagues', 'Kids', 'Myself'],
  },
  {
    id: 'budget',
    question: 'What\'s your budget?',
    options: ['Under ₹500', '₹500 - ₹1500', '₹1500 - ₹5000', 'Above ₹5000'],
  },
  {
    id: 'style',
    question: 'What style do they prefer?',
    options: ['Minimalist', 'Traditional', 'Luxury', 'Quirky & Fun'],
  },
];

const categoryMap: Record<string, Record<string, string>> = {
  'Birthday-Partner': 'couple-collections',
  'Birthday-Friends': 'personalized-gifts',
  'Wedding-Colleagues': 'luxury-hampers',
  'Corporate-Colleagues': 'corporate-gifting',
  'Festival-Parents': 'festival-collections',
};

function getRecommendedCategory(answers: Record<string, string>): string {
  const key = `${answers.occasion}-${answers.recipient}`;
  return categoryMap[key] || (answers.budget?.includes('5000') ? 'luxury-hampers' : 'personalized-gifts');
}

export default function GiftFinderPage() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);

  const handleAnswer = (value: string) => {
    const q = questions[step];
    const newAnswers = { ...answers, [q.id]: value };
    setAnswers(newAnswers);
    if (step < questions.length - 1) {
      setStep(s => s + 1);
    } else {
      setDone(true);
    }
  };

  const reset = () => {
    setStep(0);
    setAnswers({});
    setDone(false);
  };

  const recommendedCategory = getRecommendedCategory(answers);

  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="max-w-2xl mx-auto px-4 text-center">
        <div className="mb-10">
          <Gift size={48} className="text-gold-500 mx-auto mb-4" />
          <p className="text-gold-600 text-xs tracking-[0.4em] uppercase font-sans mb-3">Personalised for You</p>
          <h1 className="font-serif text-4xl text-charcoal-950">Gift Finder</h1>
          <p className="font-sans text-charcoal-500 mt-3">Answer a few questions and we'll find the perfect gift.</p>
        </div>

        {/* Progress */}
        {!done && (
          <div className="flex gap-2 justify-center mb-10">
            {questions.map((_, i) => (
              <div key={i} className={`h-1 flex-1 rounded-full transition-colors duration-300 ${i <= step ? 'bg-charcoal-950' : 'bg-charcoal-200'}`} />
            ))}
          </div>
        )}

        <AnimatePresence mode="wait">
          {!done ? (
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="font-serif text-2xl text-charcoal-950 mb-8">{questions[step].question}</h2>
              <div className="grid grid-cols-2 gap-3">
                {questions[step].options.map(opt => (
                  <button
                    key={opt}
                    onClick={() => handleAnswer(opt)}
                    className="border border-charcoal-200 hover:border-charcoal-950 hover:bg-charcoal-950 hover:text-white transition-all duration-200 py-4 px-5 font-sans text-sm text-charcoal-700 rounded-sm"
                  >
                    {opt}
                  </button>
                ))}
              </div>
              {step > 0 && (
                <button onClick={() => setStep(s => s - 1)} className="mt-6 text-sm font-sans text-charcoal-400 hover:text-charcoal-950 transition-colors">
                  ← Back
                </button>
              )}
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
              <div className="bg-cream-50 p-8 mb-8">
                <p className="text-gold-600 text-xs tracking-[0.4em] uppercase font-sans mb-3">Your Perfect Gift</p>
                <h2 className="font-serif text-3xl text-charcoal-950 mb-3">We Found It!</h2>
                <p className="font-sans text-charcoal-600 mb-6">
                  Based on your answers, we recommend exploring our curated selection.
                </p>
                <div className="text-left space-y-2 mb-6">
                  {Object.entries(answers).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-sm font-sans">
                      <span className="text-charcoal-500 capitalize">{key}</span>
                      <span className="text-charcoal-950 font-medium">{value}</span>
                    </div>
                  ))}
                </div>
                <Link
                  to={`/collections/${recommendedCategory}`}
                  className="btn-primary inline-flex items-center gap-2 px-8 py-3"
                >
                  View Recommendations <ArrowRight size={16} />
                </Link>
              </div>
              <button onClick={reset} className="flex items-center gap-2 text-sm font-sans text-charcoal-500 hover:text-charcoal-950 transition-colors mx-auto">
                <RotateCcw size={14} /> Start Over
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
