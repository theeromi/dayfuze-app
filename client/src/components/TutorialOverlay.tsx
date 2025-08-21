import React, { useEffect, useState, useRef } from 'react';
import { useTutorial } from '@/contexts/TutorialContext';
import { useMobile } from '@/hooks/useMobile';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, ChevronLeft, ChevronRight, SkipForward, Star, CheckCircle2 } from 'lucide-react';

interface HighlightPosition {
  top: number;
  left: number;
  width: number;
  height: number;
}

export default function TutorialOverlay() {
  const { tutorialState, nextStep, prevStep, skipTutorial, completeTutorial } = useTutorial();
  const isMobile = useMobile();
  const [highlightPosition, setHighlightPosition] = useState<HighlightPosition | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const overlayRef = useRef<HTMLDivElement>(null);

  const currentStep = tutorialState.steps[tutorialState.currentStep];
  const isFirstStep = tutorialState.currentStep === 0;
  const isLastStep = tutorialState.currentStep === tutorialState.steps.length - 1;

  // Calculate highlight and tooltip positions
  useEffect(() => {
    if (!tutorialState.isActive || !currentStep) return;

    const updatePositions = () => {
      const targetElement = document.querySelector(currentStep.target);
      
      if (!targetElement || currentStep.target === 'body') {
        setHighlightPosition(null);
        setTooltipPosition({ top: window.innerHeight / 2, left: window.innerWidth / 2 });
        return;
      }

      const rect = targetElement.getBoundingClientRect();
      const padding = 8;

      // Highlight position
      setHighlightPosition({
        top: rect.top - padding,
        left: rect.left - padding,
        width: rect.width + padding * 2,
        height: rect.height + padding * 2
      });

      // Tooltip position based on step position preference
      let tooltipTop = 0;
      let tooltipLeft = 0;

      if (isMobile) {
        // On mobile, position tooltip at bottom with better safe area handling
        const safeAreaBottom = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--safe-area-inset-bottom') || '0px');
        const tooltipHeight = 200; // Estimated tooltip height
        const padding = 20;
        
        tooltipTop = Math.max(
          window.innerHeight - tooltipHeight - safeAreaBottom - padding,
          window.innerHeight * 0.7 // Don't go higher than 70% of screen
        );
        tooltipLeft = window.innerWidth / 2; // Center horizontally
      } else {
        switch (currentStep.position) {
          case 'top':
            tooltipTop = rect.top - 20;
            tooltipLeft = rect.left + rect.width / 2;
            break;
          case 'bottom':
            tooltipTop = rect.bottom + 20;
            tooltipLeft = rect.left + rect.width / 2;
            break;
          case 'left':
            tooltipTop = rect.top + rect.height / 2;
            tooltipLeft = rect.left - 20;
            break;
          case 'right':
            tooltipTop = rect.top + rect.height / 2;
            tooltipLeft = rect.right + 20;
            break;
          default: // center
            tooltipTop = window.innerHeight / 2;
            tooltipLeft = window.innerWidth / 2;
        }
      }

      setTooltipPosition({ top: tooltipTop, left: tooltipLeft });
    };

    updatePositions();
    
    // Update positions on resize or scroll
    const handleResize = () => updatePositions();
    const handleScroll = () => updatePositions();
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, true);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [tutorialState.isActive, currentStep]);

  // Enhanced auto-scroll with mobile optimization and touch handling
  useEffect(() => {
    if (!tutorialState.isActive || !currentStep || currentStep.target === 'body') return;

    const targetElement = document.querySelector(currentStep.target);
    if (targetElement) {
      // Improved mobile scroll handling without body lock issues
      if (isMobile) {
        // Store current scroll position
        const scrollY = window.scrollY;
        document.documentElement.style.setProperty('--scroll-y', `${scrollY}px`);
        
        // Apply mobile-friendly scroll prevention
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.top = `-${scrollY}px`;
        document.body.style.width = '100%';
      }

      // Enhanced mobile scrolling
      const scrollToTarget = () => {
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: isMobile ? 'start' : 'center',
          inline: 'center'
        });
        
        if (isMobile) {
          // Better mobile positioning with viewport consideration
          setTimeout(() => {
            const rect = targetElement.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            const targetCenter = rect.top + rect.height / 2;
            
            // Only adjust if element is too close to bottom
            if (targetCenter > viewportHeight * 0.6) {
              window.scrollBy({
                top: -Math.min(150, viewportHeight * 0.2),
                behavior: 'smooth'
              });
            }
          }, 200);
        }
      };

      scrollToTarget();
    }

    // Enhanced cleanup for mobile scroll restoration
    return () => {
      if (isMobile) {
        // Restore scroll position properly
        const scrollY = document.documentElement.style.getPropertyValue('--scroll-y');
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        
        // Restore scroll position
        if (scrollY) {
          window.scrollTo(0, parseInt(scrollY || '0') * -1);
        }
      }
    };
  }, [tutorialState.currentStep, tutorialState.isActive, currentStep, isMobile]);

  const handleNext = () => {
    if (isLastStep) {
      completeTutorial();
    } else {
      nextStep();
    }
  };

  const handleSkip = () => {
    skipTutorial();
  };

  if (!tutorialState.isActive || !currentStep) {
    return null;
  }

  const getTooltipTransform = () => {
    if (isMobile) {
      // On mobile, always position tooltip at bottom of screen for better UX
      return 'translate(-50%, 0)';
    }
    
    let transform = 'translate(-50%, -50%)';
    
    switch (currentStep.position) {
      case 'top':
        transform = 'translate(-50%, -100%)';
        break;
      case 'bottom':
        transform = 'translate(-50%, 0%)';
        break;
      case 'left':
        transform = 'translate(-100%, -50%)';
        break;
      case 'right':
        transform = 'translate(0%, -50%)';
        break;
    }
    
    return transform;
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 pointer-events-auto overflow-hidden"
      style={{ 
        zIndex: 9999,
        touchAction: 'none', // Prevent touch scrolling conflicts
        WebkitOverflowScrolling: 'touch' // iOS smooth scrolling
      }}
    >
      {/* Semi-transparent backdrop with mobile-safe touch handling */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
        style={{ 
          touchAction: 'manipulation',
          WebkitTouchCallout: 'none',
          WebkitUserSelect: 'none',
          userSelect: 'none'
        }}
      />
      
      {/* Highlight cutout */}
      {highlightPosition && (
        <div
          className="absolute pointer-events-none"
          style={{
            top: highlightPosition.top,
            left: highlightPosition.left,
            width: highlightPosition.width,
            height: highlightPosition.height,
            boxShadow: '0 0 0 4px rgba(59, 130, 246, 0.8), 0 0 0 9999px rgba(0, 0, 0, 0.6)',
            borderRadius: '8px',
            animation: 'pulse 2s infinite'
          }}
        />
      )}

      {/* Tutorial tooltip with mobile-optimized positioning */}
      <Card
        className={`absolute shadow-2xl border-2 border-blue-200 dark:border-blue-700 bg-white dark:bg-gray-900 ${
          isMobile ? 'mx-4' : ''
        }`}
        style={{
          top: tooltipPosition.top,
          left: tooltipPosition.left,
          transform: getTooltipTransform(),
          maxWidth: isMobile ? 'calc(100vw - 32px)' : '320px',
          minWidth: isMobile ? 'calc(100vw - 32px)' : '280px',
          maxHeight: isMobile ? 'calc(100vh - 40px)' : 'auto',
          zIndex: 10000,
          // Mobile-specific optimizations
          touchAction: 'manipulation',
          WebkitOverflowScrolling: 'touch',
          overflowY: isMobile ? 'auto' : 'visible'
        }}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              {currentStep.id === 'welcome' && <Star className="h-5 w-5 text-blue-500" />}
              {currentStep.id === 'complete' && <CheckCircle2 className="h-5 w-5 text-green-500" />}
              {currentStep.title}
            </CardTitle>
            <button
              onClick={handleSkip}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              data-testid="button-skip-tutorial"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </CardHeader>

        <CardContent className={`space-y-4 ${isMobile ? 'max-h-60 overflow-y-auto' : ''}`}>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {currentStep.content}
          </p>

          {/* Progress indicator */}
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${((tutorialState.currentStep + 1) / tutorialState.steps.length) * 100}%`
                }}
              />
            </div>
            <span className="text-xs text-gray-500">
              {tutorialState.currentStep + 1} of {tutorialState.steps.length}
            </span>
          </div>

          {/* Navigation buttons */}
          <div className={`flex gap-2 justify-between ${isMobile ? 'flex-col' : ''}`}>
            <div className={`flex gap-2 ${isMobile ? 'order-2' : ''}`}>
              {!isFirstStep && (
                <Button
                  onClick={prevStep}
                  variant="outline"
                  size={isMobile ? "default" : "sm"}
                  className="flex items-center gap-1 flex-1 sm:flex-none"
                  data-testid="button-tutorial-prev"
                >
                  <ChevronLeft className="h-3 w-3" />
                  Back
                </Button>
              )}
              <Button
                onClick={handleSkip}
                variant="ghost"
                size={isMobile ? "default" : "sm"}
                className="text-gray-500 flex-1 sm:flex-none"
                data-testid="button-tutorial-skip"
              >
                <SkipForward className="h-3 w-3 mr-1" />
                Skip Tour
              </Button>
            </div>

            <Button
              onClick={handleNext}
              size={isMobile ? "default" : "sm"}
              className={`bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-1 ${
                isMobile ? 'w-full order-1 mb-2' : ''
              }`}
              data-testid="button-tutorial-next"
            >
              {isLastStep ? (
                <>
                  <CheckCircle2 className="h-3 w-3" />
                  Complete Tutorial
                </>
              ) : (
                <>
                  Continue Tour
                  <ChevronRight className="h-3 w-3" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <style>{`
        @keyframes pulse {
          0%, 100% {
            box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.8), 0 0 0 9999px rgba(0, 0, 0, 0.6);
          }
          50% {
            box-shadow: 0 0 0 8px rgba(59, 130, 246, 0.4), 0 0 0 9999px rgba(0, 0, 0, 0.6);
          }
        }
      `}</style>
    </div>
  );
}