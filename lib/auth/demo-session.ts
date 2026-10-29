"use client";
import { updateDemo, getDemoState } from "@/lib/demo/store";

/**
 * Demo sign-in. There are no credentials: the visitor chooses a display
 * name and continues. Nothing is sent anywhere. Never collect PINs,
 * passwords or card details in this flow.
 */
export function demoSignIn(displayName: string) {
  const name = displayName.trim().slice(0, 40) || "Member";
  updateDemo({ signedIn: true, displayName: name });
}

export function demoSignOut() {
  updateDemo({ signedIn: false, onboarded: false });
}

export function completeOnboarding(prefs: { cardVariant: "green" | "black" | "reserve"; savedLocations: string[] }) {
  updateDemo({ onboarded: true, cardVariant: prefs.cardVariant, savedLocations: prefs.savedLocations });
}

export function isSignedIn() {
  return getDemoState().signedIn;
}
