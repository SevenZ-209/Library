import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export function useViewTransition() {
  const navigate = useNavigate();

  const transitionTo = useCallback(
    (path: string) => {
      if (!document.startViewTransition) {
        navigate(path);
        return;
      }

      document.startViewTransition(() => {
        navigate(path);
      });
    },
    [navigate]
  );

  return { transitionTo };
}
