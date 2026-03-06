import { Keyboard } from 'react-native';
import type { Href, Router } from 'expo-router';

/**
 * Dismiss keyboard then push after the next frame to avoid layout/transition conflicts
 * (flickering or jumping) when navigating from screens with focused TextInput.
 */
export function safePush(router: Router, href: Href): void {
  Keyboard.dismiss();
  requestAnimationFrame(() => {
    router.push(href);
  });
}

/**
 * Dismiss keyboard then replace after the next frame.
 */
export function safeReplace(router: Router, href: Href): void {
  Keyboard.dismiss();
  requestAnimationFrame(() => {
    router.replace(href);
  });
}

/**
 * Dismiss keyboard then go back after the next frame.
 */
export function safeBack(router: Router): void {
  Keyboard.dismiss();
  requestAnimationFrame(() => {
    router.back();
  });
}
