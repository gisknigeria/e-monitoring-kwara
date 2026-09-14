import { createAreaOperationsRouter } from "../../routes/area-operations.js";
import { normalizeSourceClassification } from "../foundation/provenance.js";

const normaliseGeometryCoordinates = (geometry) => {
  if (!geometry || typeof geometry !== 'object') return geometry;
  if (Array.isArray(geometry.coordinates)) {
    return geometry.coordinates.map((value) => {
      if (Array.isArray(value) && value.length === 2 && (value[0] === null || value[1] === null)) {
        return [null, null];
      }
      return value;
    });
  }
  return geometry;
};

const enrichGeojson = (geojson, classification, sourceCertainty, sourceVersion) => ({
  ...geojson,
  metadata: {
    classification,
    canonicalClassification: normalizeSourceClassification(classification),
    sourceCertainty,
    sourceVersion,
    sourceLabel: classification,
    fetchedAt: new Date().toISOString(),
  },
  features: Array.isArray(geojson.features)
    ? geojson.features.map((feature) => ({
        ...feature,
        properties: {
          ...(feature.properties || {}),
          sourceClassification: classification,
          canonicalSourceClassification: normalizeSourceClassification(classification),
          sourceCertainty,
          sourceVersion,
        },
        geometry: feature.geometry
          ? { ...feature.geometry, coordinates: normaliseGeometryCoordinates(feature.geometry) }
          : feature.geometry,
      }))
    : [],
});

export function registerBoundaryRoutes({ app, auth, adminOnly, rateLimit, asyncRoute, store }) {
  let kwaraBoundaryCache = null;
  app.use('/api/area-operations', createAreaOperationsRouter({ auth, adminOnly, rateLimit, asyncRoute, store }));
  const kwaraWardBoundaryCache = new Map();
  app.get(
    "/api/boundaries/kwara",
    rateLimit,
    asyncRoute(async (_req, res) => {
      if (kwaraBoundaryCache?.expiresAt > Date.now())
        return res.json(kwaraBoundaryCache.data);
      const base =
        "https://services3.arcgis.com/7J7WB6yJX0pYke9q/ArcGIS/rest/services/NCO_Security_Database_WFL1/FeatureServer";
      const queryLayer = async (layer, where) => {
        const params = new URLSearchParams({
          where,
          outFields: "*",
          returnGeometry: "true",
          outSR: "4326",
          f: "geojson",
        });
        const response = await fetch(`${base}/${layer}/query?${params}`, {
          headers: { "User-Agent": "Election-Monitor/1.0 boundary service" },
          signal: AbortSignal.timeout(12_000),
        });
        if (!response.ok)
          throw new Error(`Boundary provider returned ${response.status}`);
        const geojson = await response.json();
        if (!Array.isArray(geojson.features))
          throw new Error("Boundary provider returned invalid GeoJSON");
        return geojson;
      };
      try {
        const [states, lgas] = await Promise.all([
          queryLayer("2", "ADM1_EN = 'Kwara'"),
          queryLayer("1", "ADM1_EN = 'Kwara'"),
        ]);
        const officialState = enrichGeojson(states, 'official-electoral', 'authoritative', 'kwara-official-boundaries-v1');
        const officialLgas = enrichGeojson(lgas, 'official-electoral', 'authoritative', 'kwara-official-boundaries-v1');
        const data = {
          state: officialState,
          lgas: officialLgas,
          metadata: {
            classification: 'official-electoral',
            sourceCertainty: 'authoritative',
            sourceVersion: 'kwara-official-boundaries-v1',
            sourceType: 'official-boundary',
            attribution: 'Administrative boundaries: ArcGIS feature service',
          },
          attribution: 'Administrative boundaries: ArcGIS feature service',
          fetchedAt: new Date().toISOString(),
        };
        kwaraBoundaryCache = { data, expiresAt: Date.now() + 24 * 60 * 60 * 1000 };
        res.set(
          "Cache-Control",
          "public, max-age=3600, stale-while-revalidate=86400",
        );
        return res.json(data);
      } catch (error) {
        console.error("[boundaries] Kwara boundary fetch failed:", error.message);
        return res
          .status(503)
          .json({ message: "Kwara boundary data is temporarily unavailable." });
      }
    }),
  );
  app.get(
    "/api/boundaries/kwara/wards",
    rateLimit,
    asyncRoute(async (req, res) => {
      const lga = String(req.query.lga || "").trim();
      if (lga && !/^[A-Za-z][A-Za-z .'-]{1,60}$/.test(lga))
        return res
          .status(400)
          .json({ message: "A valid Kwara LGA name is required." });
      const cacheKey = lga.toLowerCase() || "all-kwara";
      const cached = kwaraWardBoundaryCache.get(cacheKey);
      if (cached?.expiresAt > Date.now()) return res.json(cached.data);
      const params = new URLSearchParams({
        where: lga
          ? `state = 'Kwara' AND lga = '${lga.replaceAll("'", "''")}'`
          : "state = 'Kwara'",
        outFields:
          "OBJECTID,state,lga,lga_alt_names,ward,ward_alt_names,source,date",
        returnGeometry: "true",
        outSR: "4326",
        maxAllowableOffset: "0.0005",
        geometryPrecision: "5",
        f: "geojson",
      });
      try {
        const response = await fetch(
          `https://services3.arcgis.com/BU6Aadhn6tbBEdyk/arcgis/rest/services/GRID3_NGA_operational_wards_v3_0/FeatureServer/0/query?${params}`,
          {
            headers: {
              "User-Agent": "Election-Monitor/1.0 GRID3 ward boundary service",
            },
            signal: AbortSignal.timeout(35_000),
          },
        );
        if (!response.ok) throw new Error(`GRID3 returned ${response.status}`);
        const geojson = await response.json();
        if (!Array.isArray(geojson.features))
          throw new Error("GRID3 returned invalid GeoJSON");
        const data = {
          wards: enrichGeojson(geojson, 'operational-boundary', 'estimated', 'grid3-operational-wards-v3'),
          lga: lga || "Kwara State",
          metadata: {
            classification: 'operational-boundary',
            sourceCertainty: 'estimated',
            sourceVersion: 'grid3-operational-wards-v3',
            sourceType: 'operational-boundary',
            attribution: 'GRID3 NGA - Operational Wards v3.0, CIESIN Columbia University (CC BY-SA 4.0)',
          },
          attribution:
            "GRID3 NGA - Operational Wards v3.0, CIESIN Columbia University (CC BY-SA 4.0)",
          notice:
            "Operational ward boundaries are not authoritative and have not been fully validated by government officials.",
          fetchedAt: new Date().toISOString(),
        };
        kwaraWardBoundaryCache.set(cacheKey, {
          data,
          expiresAt: Date.now() + 24 * 60 * 60 * 1000,
        });
        res.set(
          "Cache-Control",
          "public, max-age=3600, stale-while-revalidate=86400",
        );
        return res.json(data);
      } catch (error) {
        console.error(
          "[boundaries] Kwara ward boundary fetch failed:",
          error.message,
        );
        return res
          .status(503)
          .json({ message: "Kwara ward boundaries are temporarily unavailable." });
      }
    }),
  );

}
