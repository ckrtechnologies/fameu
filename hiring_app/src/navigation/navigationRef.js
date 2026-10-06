import { createNavigationContainerRef, CommonActions } from '@react-navigation/native';
import { ROUTES, TABS } from './routes';

export const navigationRef = createNavigationContainerRef();

/**
 * Navigate to a specific route outside React components (e.g. push notification, socket event, 401 interceptor).
 */
export function navigate(name, params) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  }
}

/**
 * Reset root navigation stack back to the main home dashboard tab.
 */
export function resetToHome() {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: ROUTES.DRAWER, state: { routes: [{ name: ROUTES.TABS, state: { routes: [{ name: TABS.HOME }] } }] } }],
      })
    );
  }
}
