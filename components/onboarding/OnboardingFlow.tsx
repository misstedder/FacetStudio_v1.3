import React, { useState } from 'react';
import { Sparkles, Camera, BookOpen, MessageCircle, X } from 'lucide-react';
import { Button } from '../Button';

interface OnboardingFlowProps {
  onComplete: () => void;
}

interface Step {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const steps: Step[] = [
  {
    icon: <Sparkles size={64} className="text-aura-500" />,
    title: 'Welcome to FacetStudio',
    description:
      'Your AI-powered makeup coach for personalized, skill-building education. Discover your unique facets and learn techniques that work for you.',
  },
  {
    icon: <Camera size={64} className="text-aura-500" />,
    title: 'Capture & Analyze',
    description:
      'Take a selfie and our AI analyzes your unique facial structure, skin characteristics, and undertones with precision.',
  },
  {
    icon: <BookOpen size={64} className="text-aura-500" />,
    title: 'Your Personalized Guide',
    description:
      'Get custom color palettes, product recommendations, and placement techniques tailored just for you. Learn Seint HAC methods.',
  },
  {
    icon: <MessageCircle size={64} className="text-aura-500" />,
    title: 'Ask Your Coach',
    description:
      'Chat with AI to learn techniques, understand color theory, and build your makeup skills with expert guidance.',
  },
];

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setDirection('forward');
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setDirection('backward');
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    localStorage.setItem('facetStudioOnboardingComplete', 'true');
    onComplete();
  };

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-aura-50 via-aura-100 to-aura-200 flex items-center justify-center p-4">
      {/* Skip Button */}
      <button
        onClick={handleSkip}
        className="absolute top-4 right-4 p-2 text-gray-600 hover:text-aura-600 transition-colors rounded-full hover:bg-white/50"
        aria-label="Skip onboarding"
      >
        <X size={24} />
      </button>

      {/* Content Card */}
      <div className="w-full max-w-md">
        <div
          key={currentStep}
          className={`bg-white rounded-3xl shadow-2xl p-8 text-center ${
            direction === 'forward' ? 'animate-slide-left' : 'animate-slide-right'
          }`}
        >
          {/* Icon */}
          <div className="mb-6 flex justify-center">{currentStepData.icon}</div>

          {/* Title */}
          <h2 className="text-3xl font-bold text-aura-900 mb-4">{currentStepData.title}</h2>

          {/* Description */}
          <p className="text-gray-600 mb-8 leading-relaxed">{currentStepData.description}</p>

          {/* Progress Dots */}
          <div className="flex justify-center gap-2 mb-8">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentStep
                    ? 'w-8 bg-aura-600'
                    : index < currentStep
                    ? 'w-2 bg-aura-400'
                    : 'w-2 bg-gray-300'
                }`}
                aria-label={`Step ${index + 1} of ${steps.length}`}
              />
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-3">
            {currentStep > 0 && (
              <Button onClick={handleBack} variant="secondary" className="flex-1">
                Back
              </Button>
            )}
            <Button onClick={handleNext} variant="primary" className="flex-1">
              {isLastStep ? 'Get Started' : 'Next'}
            </Button>
          </div>
        </div>

        {/* Step Counter */}
        <p className="text-center mt-4 text-sm text-gray-600">
          {currentStep + 1} of {steps.length}
        </p>
      </div>
    </div>
  );
};
