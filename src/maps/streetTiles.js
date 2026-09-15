const MAPTILER_ATTRIBUTION = '&copy; MapTiler &copy; OpenStreetMap contributors';
const ESRI_ATTRIBUTION = 'Tiles &copy; Esri';
const ESRI_STREET_URL = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}';

/**
 * Creates the shared street basemap without sending production traffic to
 * OpenStreetMap's donation-funded standard tile servers. MapTiler remains the
 * preferred configured provider; Esri is the no-key fallback.
 */
export function createStreetTileLayer(L, { maxZoom = 19, crossOrigin = true } = {}) {
  const maptilerKey = String(import.meta.env.VITE_MAPTILER_KEY || '').trim();
  if (maptilerKey) {
    return L.tileLayer(
      `https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=${encodeURIComponent(maptilerKey)}`,
      { crossOrigin, maxZoom, attribution: MAPTILER_ATTRIBUTION },
    );
  }
  return L.tileLayer(ESRI_STREET_URL, {
    crossOrigin,
    maxZoom,
    attribution: ESRI_ATTRIBUTION,
  });
}
