import React, { useEffect, useState } from 'react';
import { CheckCircle, Star, Sparkles } from 'lucide-react';

interface CelebrationAnimationProps {
  isVisible: boolean;
  onComplete: () => void;
}

export const CelebrationAnimation: React.FC<CelebrationAnimationProps> = ({
  isVisible,
  onComplete
}) => {
  const [confetti, setConfetti] = useState<Array<{ id: number; x: number; y: number; color: string; delay: number }>>([]);

  useEffect(() => {
    if (isVisible) {
      // Generate confetti particles
      const particles = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        color: ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'][Math.floor(Math.random() * 6)],
        delay: Math.random() * 0.5
      }));
      setConfetti(particles);

      // Auto-hide after animation
      const timer = setTimeout(() => {
        onComplete();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-20 animate-fade-in" />
      
      {/* Confetti */}
      {confetti.map((particle) => (
        <div
          key={particle.id}
          className="absolute w-2 h-2 animate-confetti"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            backgroundColor: particle.color,
            animationDelay: `${particle.delay}s`,
            animationDuration: '1.5s'
          }}
        />
      ))}

      {/* Main celebration message */}
      <div className="relative z-10 text-center animate-celebration-bounce">
        <div className="bg-white rounded-2xl shadow-2xl p-8 mx-4 max-w-sm">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <CheckCircle className="w-16 h-16 text-green-500 animate-scale-in" />
              <div className="absolute -top-2 -right-2">
                <Sparkles className="w-6 h-6 text-yellow-400 animate-spin-slow" />
              </div>
              <div className="absolute -bottom-1 -left-2">
                <Star className="w-5 h-5 text-blue-500 animate-pulse" />
              </div>
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-800 mb-2 animate-slide-up">
            잘했어요! 🎉
          </h2>
          <p className="text-gray-600 animate-slide-up-delay">
            또 하나의 목표를 달성했습니다!
          </p>
        </div>
      </div>
    </div>
  );
};