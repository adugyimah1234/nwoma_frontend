'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Type, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function DisplaySettings() {
  const [fontSize, setFontSize] = useState(100);

  useEffect(() => {
    const saved = localStorage.getItem('app-font-size');
    if (saved) {
      const size = parseInt(saved);
      setFontSize(size);
      document.documentElement.style.fontSize = `${(size / 100) * 16}px`;
    }
  }, []);

  const handleFontSizeChange = (value: number[]) => {
    const newSize = value[0];
    setFontSize(newSize);
    document.documentElement.style.fontSize = `${(newSize / 100) * 16}px`;
    localStorage.setItem('app-font-size', newSize.toString());
  };

  const resetFontSize = () => {
    handleFontSizeChange([100]);
  };

  return (
    <Card className="border-none shadow-sm bg-card/50 overflow-hidden">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold tracking-tight">Display & Accessibility</CardTitle>
        <CardDescription>
          Customize your viewing experience and adjust interface scaling.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base font-semibold flex items-center gap-2">
                <Type className="size-4 text-primary" /> Font Size Scaling
              </Label>
              <p className="text-sm text-muted-foreground italic">
                Adjust the overall scale of the application text and elements.
              </p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full border border-primary/20">
              <span className="text-sm font-bold text-primary">{fontSize}%</span>
            </div>
          </div>

          <div className="flex items-center gap-6 p-6 rounded-2xl bg-muted/30 border border-border/50">
            <ZoomOut className="size-5 text-muted-foreground shrink-0" />
            <Slider
              value={[fontSize]}
              min={80}
              max={120}
              step={5}
              onValueChange={handleFontSizeChange}
              className="flex-1 cursor-pointer"
            />
            <ZoomIn className="size-5 text-muted-foreground shrink-0" />
          </div>

          <div className="flex justify-between items-center text-[10px] text-muted-foreground font-bold uppercase tracking-tight px-1">
            <span>Compact</span>
            <span>Default</span>
            <span>Comfortable</span>
          </div>
        </div>

        <div className="p-6 rounded-2xl border-2 border-dashed border-muted flex flex-col items-center justify-center text-center gap-4">
          <div className="size-12 rounded-full bg-primary/5 flex items-center justify-center">
            <Type className="size-6 text-primary/40" />
          </div>
          <div>
            <h4 className="text-sm font-bold mb-1">Interface Preview</h4>
            <p className="text-xs text-muted-foreground max-w-[280px]">
              The changes are applied instantly across the entire application workspace.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={resetFontSize}
            className="rounded-xl font-bold uppercase tracking-wider text-[10px]"
          >
            Reset to Default
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

