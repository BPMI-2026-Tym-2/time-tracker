'use client';

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

type PasswordVisibilityFieldProps = {
  id: string;
  value: string;
};

export function PasswordVisibilityField({
  id,
  value,
}: PasswordVisibilityFieldProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative flex h-10 w-full items-center justify-end">
      <output
        id={id}
        className="absolute top-1/2 left-1/2 flex h-10 w-full max-w-xs -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-lg border border-black/50 bg-muted px-4 py-2 text-center text-sm text-foreground shadow-sm"
      >
        {isVisible ? value : '••••••••'}
      </output>
      <Button
        className="z-10 translate-x-1"
        type="button"
        variant="ghost"
        size="icon"
        aria-label={isVisible ? 'Hide password' : 'Show password'}
        aria-pressed={isVisible}
        onClick={() => setIsVisible((visible) => !visible)}
      >
        {isVisible ? (
          <EyeOff className="size-5" aria-hidden="true" />
        ) : (
          <Eye className="size-5" aria-hidden="true" />
        )}
      </Button>
    </div>
  );
}
