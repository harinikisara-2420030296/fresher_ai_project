import React, { useState } from 'react';
import { X, Sparkles, Check, Loader2 } from 'lucide-react';
import { addInterviewCoins } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from './Toast';

export default function AddCoinsModal({ isOpen, onClose }) {
  const { user, setUser, refreshUser } = useAuth();
  const { success, error } = useToast();
  const [selectedPack, setSelectedPack] = useState(500);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const coinPackages = [
    { amount: 200, label: 'Starter', desc: '4 Full Mock Interviews', tag: 'Fast' },
    { amount: 500, label: 'Pro Pack', desc: '10 Full Mock Interviews', tag: 'Most Popular', popular: true },
    { amount: 1000, label: 'Unlimited Prep', desc: '20 Full Mock Interviews', tag: 'Best Value' },
  ];

  const handleAddCoins = async () => {
    setIsSubmitting(true);
    try {
      const res = await addInterviewCoins(selectedPack);
      if (res?.success) {
        if (user) {
          setUser({ ...user, coins: res.data.newBalance });
        }
        await refreshUser();
        success(`Successfully added ${selectedPack} coins to your balance!`);
        onClose();
      }
    } catch (err) {
      error(err.message || 'Failed to add coins. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-[440px] bg-[#0E0E12] border border-white/10 rounded-3xl shadow-2xl overflow-hidden p-6">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-purple-950/60 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">Top Up Coins</h3>
            <p className="text-xs text-gray-400">Current balance: <span className="font-semibold text-white">{user?.coins ?? 1000}</span> coins</p>
          </div>
        </div>

        <p className="text-xs text-gray-400 mb-5">
          Each realistic AI mock interview costs 50 coins. Choose a demo package below to immediately recharge your account:
        </p>

        {/* Packages List */}
        <div className="space-y-3 mb-6">
          {coinPackages.map((pack) => {
            const isSelected = selectedPack === pack.amount;
            return (
              <div
                key={pack.amount}
                onClick={() => setSelectedPack(pack.amount)}
                className={`cursor-pointer p-4 rounded-2xl border transition-all flex items-center justify-between ${
                  isSelected
                    ? 'bg-[#1C1A29] border-purple-500/60 shadow-lg shadow-purple-950/30 ring-1 ring-purple-500/50'
                    : 'bg-[#14141A] border-white/5 hover:border-white/15'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-white">+{pack.amount} Coins</span>
                    {pack.tag && (
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        pack.popular ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-gray-800 text-gray-300'
                      }`}>
                        {pack.tag}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{pack.desc}</p>
                </div>

                <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                  isSelected ? 'border-purple-500 bg-purple-500 text-white' : 'border-gray-600'
                }`}>
                  {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </div>
            );
          })}
        </div>

        {/* Submit Button */}
        <button
          onClick={handleAddCoins}
          disabled={isSubmitting}
          className="w-full py-3.5 px-4 bg-white hover:bg-gray-100 text-[#121216] font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 animate-spin text-black" />
          ) : (
            <Sparkles className="w-4 h-4 text-purple-600" />
          )}
          <span>Add +{selectedPack} Coins (Free Academic Demo)</span>
        </button>
      </div>
    </div>
  );
}

