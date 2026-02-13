import { useLiveData } from '@toeverything/infra';
import type { Location } from 'history';
import { useEffect } from 'react';
// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import { useLocation, useNavigate } from 'react-router-dom';

import type { Workbench } from '../entities/workbench';


export function useBindWorkbenchToBrowserRouter(
  workbench: Workbench,
  basename: string
) {
  const navigate = useNavigate();
  const browserLocation = useLocation();

  const view = useLiveData(workbench.activeView$);

  useEffect(() => {
    return view.history.listen(update => {
      if (update.action === 'POP') {
        // This is because the history of view and browser are two different stacks,
        // the POP action cannot be synchronized.
        return;
      }

      const newBrowserLocation = viewLocationToBrowserLocation(
        update.location,
        basename
      );

      navigate(newBrowserLocation, {
        state: 'fromView,' + newBrowserLocation.key,
        replace:
          update.action === 'REPLACE' ||
          newBrowserLocation.state === 'fromBrowser',
      });
    });
  }, [basename, browserLocation, navigate, view]);

  useEffect(() => {
    const newLocation = browserLocationToViewLocation(
      browserLocation,
      basename
    );
    if (newLocation === null) {
      return;
    }
    if (
      typeof newLocation.state === 'string' &&
      newLocation.state.startsWith('fromView')
    ) {
      const fromViewKey = newLocation.state.substring('fromView,'.length);
      if (fromViewKey === view.location$.value.key) {
        return;
      } else {
        const target = view.history.entries.findIndex(
          entry => entry.key === fromViewKey
        );
        if (target !== -1) {
          const now = view.history.index;
          const delta = target - now;
          view.history.go(delta);
          return;
        }
      }
    }
    view.history.push(newLocation, 'fromBrowser');
  }, [basename, browserLocation, view]);
}

function browserLocationToViewLocation(
  location: Location,
  basename: string
): Location | null {
  if (!location.pathname.startsWith(basename)) {
    return null;
  }
  return {
    ...location,
    pathname: location.pathname.slice(basename.length),
  };
}

function viewLocationToBrowserLocation(
  location: Location,
  basename: string
): Location {
  return {
    ...location,
    pathname: `${basename}${location.pathname}`,
  };
}
