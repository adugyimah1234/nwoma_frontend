"use client";

import React, { useEffect, useState } from 'react';
import Joyride, {
  Step,
  CallBackProps,
  STATUS,
  TooltipRenderProps,
  Styles
} from 'react-joyride';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useAtom } from 'jotai';
import { tourRunAtom } from './tour-atom';

const TOUR_STYLES: Styles = {
  options: {
    zIndex: 10000,
    primaryColor: 'hsl(var(--primary))',
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    backdropFilter: 'blur(2px)',
  },
  spotlight: {
    borderRadius: 8,
  },
};

const CustomTooltip = ({
  continuous,
  index,
  step,
  backProps,
  closeProps,
  primaryProps,
  stepCount,
  isLastStep,
}: TooltipRenderProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 10 }}
      className="max-w-xs md:max-w-sm bg-background border rounded-2xl shadow-2xl overflow-hidden"
    >
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary/60">
            Step {index + 1} of {stepCount}
          </span>
          <button {...closeProps} className="text-muted-foreground hover:text-foreground transition-colors">
            <X size={16} />
          </button>
        </div>

        {step.title && (
          <h3 className="text-lg font-bold mb-2 tracking-tight">
            {step.title}
          </h3>
        )}

        <div className="text-sm text-muted-foreground leading-relaxed">
          {step.content}
        </div>
      </div>

      <div className="px-5 py-4 bg-muted/30 flex items-center justify-between border-t">
        <div className="flex gap-1">
          {Array.from({ length: stepCount }).map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all duration-300 ${
                i === index ? 'w-4 bg-primary' : 'w-1 bg-primary/20'
              }`}
            />
          ))}
        </div>

        <div className="flex gap-2">
          {index > 0 && (
            <Button variant="ghost" size="sm" {...backProps} className="h-8 px-3 text-xs">
              <ChevronLeft className="mr-1 h-3 w-3" /> Back
            </Button>
          )}

          <Button size="sm" {...primaryProps} className="h-8 px-3 text-xs font-semibold">
            {isLastStep ? (
              <span className="flex items-center"><Check className="mr-1 h-3 w-3" /> Finish</span>
            ) : (
              <span className="flex items-center">Next <ChevronRight className="ml-1 h-3 w-3" /></span>
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

interface GuidedTourProps {
  steps: Step[];
  run?: boolean;
  onFinish?: () => void;
}

export const GuidedTour = ({ steps, run = false, onFinish }: GuidedTourProps) => {
  const [tourRun, setTourRun] = useAtom(tourRunAtom);
  const pathname = usePathname();

  useEffect(() => {
    // We can auto-start based on path or localStorage
    const hasSeenTour = localStorage.getItem(`tour_seen_${pathname}`);
    if (!hasSeenTour && run) {
      const timer = setTimeout(() => setTourRun(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [pathname, run, setTourRun]);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      setTourRun(false);
      localStorage.setItem(`tour_seen_${pathname}`, 'true');
      onFinish?.();
    }
  };

  return (
    <Joyride
      steps={steps}
      run={tourRun}
      callback={handleJoyrideCallback}
      continuous
      showProgress
      showSkipButton
      tooltipComponent={CustomTooltip}
      styles={TOUR_STYLES}
      locale={{
        last: 'Finish',
        next: 'Next',
        skip: 'Skip tour',
        back: 'Back',
      }}
    />
  );
};
