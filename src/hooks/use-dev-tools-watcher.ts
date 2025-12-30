'use client';

import { useState, useEffect, useCallback } from 'react';

const DEVTOOLS_THRESHOLD = 160;

export function useDevToolsWatcher(onDevToolsOpen: () => void) {
  useEffect(() => {
    const handleDevToolsChange = () => {
      const widthThreshold = window.outerWidth - window.innerWidth > DEVTOOLS_THRESHOLD;
      const heightThreshold = window.outerHeight - window.innerHeight > DEVTOOLS_THRESHOLD;

      if (widthThreshold || heightThreshold) {
        onDevToolsOpen();
      }
    };

    const interval = setInterval(handleDevToolsChange, 1000);
    
    // Also add keyboard listener for common shortcuts
    const handleKeyDown = (event: KeyboardEvent) => {
        if (
            event.key === 'F12' ||
            (event.ctrlKey && event.shiftKey && (event.key === 'I' || event.key === 'J' || event.key === 'C')) ||
            (event.metaKey && event.altKey && (event.key === 'I' || event.key === 'J' || event.key === 'C'))
        ) {
            onDevToolsOpen();
        }
    };

    window.addEventListener('keydown', handleKeyDown);


    return () => {
      clearInterval(interval);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onDevToolsOpen]);
}
