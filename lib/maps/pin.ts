/**
 * The Pickle map pin: the brand's glossy pickle PNG, shared by the Google Maps
 * markers (HTML content) and the illustrated fallback map.
 */
export const PICKLE_PIN_SRC = "/brand/pickle-icon.png";

export function picklePinHtml({ active = false }: { active?: boolean } = {}): string {
  return `<img src="${PICKLE_PIN_SRC}" alt="" draggable="false" class="gmap-pin-img${active ? " is-active" : ""}" />`;
}

/** DOM element for a Google AdvancedMarker. */
export function buildPickleMarker(mark: string): HTMLElement {
  const wrap = document.createElement("div");
  wrap.className = "gmap-pin";
  wrap.innerHTML = picklePinHtml() + `<span class="gmap-pin-mark">${mark}</span>`;
  return wrap;
}
