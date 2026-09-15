"use client";

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import type {
  Step,
  CallBackProps,
  TooltipRenderProps,
  Styles
} from 'react-joyride';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useAtom } from 'jotai';
import { tourRunAtom } from './tour-atom';

// Properly load Joyride with SSR disabled to avoid "window is not defined"
// and handle the export default issue in Turbopack.
const Joyride = dynamic(() => import('react-joyride').then(mod => {
  // If the module has a default export, use it. Otherwise, use the module itself.
  return (mod.default || mod) as any;
}), {
  ssr: false,
  loading: () => null
});

// Access STATUS from the module via dynamic import or constant if available.
// Since STATUS is a constant, we can define it locally or import it normally.
const STATUS = {
  IDLE: 'idle',
  ACTION: 'action',
  READY: 'ready',
  RUNNING: 'running',
  PAUSED: 'paused',
  SKIPPED: 'skipped',
  FINISHED: 'finished',
  ERROR: 'error',
} as const;

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
      className="max-w-xs md:max-w-sm bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden font-sans"
    >
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <span className="text-[10px] font-bold uppercase tracking-tight text-indigo-600/60">
            Step {index + 1} of {stepCount}
          </span>
          <button {...closeProps} className="text-slate-400 hover:text-slate-900 transition-colors">
            <X size={16} />
          </button>
        </div>

        {step.title && (
          <h3 className="text-lg font-bold mb-2 tracking-tight text-slate-900">
            {step.title}
          </h3>
        )}

        <div className="text-sm text-slate-500 leading-relaxed font-medium">
          {step.content}
        </div>
      </div>

      <div className="px-5 py-4 bg-slate-50/50 flex items-center justify-between border-t border-slate-100">
        <div className="flex gap-1">
          {Array.from({ length: stepCount }).map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all duration-300 ${
                i === index ? 'w-4 bg-indigo-600' : 'w-1 bg-indigo-200'
              }`}
            />
          ))}
        </div>

        <div className="flex gap-2">
          {index > 0 && (
            <Button variant="ghost" size="sm" {...backProps} className="h-8 px-3 text-xs font-bold text-slate-600">
              <ChevronLeft className="mr-1 h-3 w-3" /> Back
            </Button>
          )}

          <Button size="sm" {...primaryProps} className="h-8 px-3 text-xs font-bold bg-indigo-600 text-white rounded-xl">
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
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);

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

  if (!mounted) return null;

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
