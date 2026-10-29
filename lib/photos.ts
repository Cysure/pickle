/**
 * Lifestyle photography slots. Files live in public/photos; every entry
 * carries alt text and the credit its licence requires (shown in the footer).
 * A slot whose file fails to load falls back to generated art.
 */
export type PhotoKey = "hero" | "beach" | "spa" | "dining" | "bars" | "family";

export interface Photo {
  src: string;
  alt: string;
  /** licence attribution, e.g. "Photo: Name (CC BY)" */
  credit: string;
  /** source page for the attribution link */
  source: string;
  /** CSS object-position for cropped placements, e.g. "35% 70%" */
  position?: string;
}

export const PHOTOS: Record<PhotoKey, Photo> = {
  hero: { src: "/photos/hero.jpg", alt: "Friends toasting at a clifftop beach club at sunset, pool and bay behind them", credit: "Hero image supplied by Pickle", source: "/" },
  beach: { src: "/photos/beach.jpg", alt: "A woman with a cocktail on a daybed beside an infinity pool at a clifftop beach club", credit: "Image supplied by Pickle", source: "/", position: "38% 72%" },
  bars: { src: "/photos/bars.jpg", alt: "A crowd dancing with cocktails at a beach club by night, a DJ playing", credit: "Image supplied by Pickle", source: "/", position: "50% 55%" },
  dining: { src: "/photos/dining.jpg", alt: "Friends laughing over dinner on a terrace at sunset", credit: "Image supplied by Pickle", source: "/", position: "50% 62%" },
  family: { src: "/photos/family.jpg", alt: "A family laughing together in a resort pool with a water slide behind them", credit: "Image supplied by Pickle", source: "/", position: "50% 60%" },
  spa: { src: "/photos/spa.jpg", alt: "A woman receiving a massage in an open-air garden spa pavilion", credit: "Image supplied by Pickle", source: "/", position: "50% 55%" },
};

/** De-duplicated credit lines for the footer. */
export const PHOTO_CREDITS = Array.from(new Map(Object.values(PHOTOS).filter((p) => p.credit.startsWith("Photo:")).map((p) => [p.credit, p])).values());
