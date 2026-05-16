export const PageLoader = () => (
  <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
    <div className="flex flex-col items-center gap-6">
      <div className="relative">
        <div className="w-16 h-16 border-2 border-charcoal-100 rounded-full" />
        <div className="absolute inset-0 w-16 h-16 border-2 border-t-charcoal-950 rounded-full animate-spin" />
      </div>
      <p className="font-display text-2xl text-charcoal-950 tracking-[0.3em] uppercase">
        ELVA
      </p>
    </div>
  </div>
);
