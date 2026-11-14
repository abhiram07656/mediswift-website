import React, { useState, useEffect } from 'react';
import { Mic, X, Volume2, Sparkles } from 'lucide-react';

interface VoiceSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectQuery: (query: string) => void;
}

export const VoiceSearchModal: React.FC<VoiceSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectQuery
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');

  const demoPhrases = ['Paracetamol 650mg', 'Dolo 650', 'Crocin Advance', 'Becosules Capsules', 'Amoxyclav 625'];

  useEffect(() => {
    if (isOpen) {
      setIsListening(true);
      setTranscript('Listening for medicine name...');

      // Simulate voice recognition picks a random sample after 2.5s
      const timer = setTimeout(() => {
        const randomPhrase = demoPhrases[Math.floor(Math.random() * demoPhrases.length)];
        setTranscript(`"${randomPhrase}"`);
        setIsListening(false);

        setTimeout(() => {
          onSelectQuery(randomPhrase);
          onClose();
        }, 1200);
      }, 2200);

      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-sm overflow-hidden p-6 text-center relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:bg-slate-100"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="my-6">
          <div className="relative inline-flex items-center justify-center">
            {isListening && (
              <>
                <span className="animate-ping absolute inline-flex h-24 w-24 rounded-full bg-emerald-400 opacity-75"></span>
                <span className="animate-pulse absolute inline-flex h-20 w-20 rounded-full bg-emerald-200"></span>
              </>
            )}
            <div className="relative w-16 h-16 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-200">
              <Mic className={`w-8 h-8 ${isListening ? 'animate-bounce' : ''}`} />
            </div>
          </div>

          <h3 className="font-extrabold text-slate-800 text-lg mt-5">
            {isListening ? 'Speak Now...' : 'Search Identified!'}
          </h3>
          <p className="text-xs text-slate-500 mt-1 font-medium">{transcript}</p>
        </div>

        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Try Saying</p>
          <div className="flex flex-wrap justify-center gap-1.5">
            {demoPhrases.map(phrase => (
              <button
                key={phrase}
                onClick={() => {
                  onSelectQuery(phrase);
                  onClose();
                }}
                className="px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-700 text-xs font-medium hover:border-emerald-500 hover:text-emerald-700 transition-colors"
              >
                {phrase}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
