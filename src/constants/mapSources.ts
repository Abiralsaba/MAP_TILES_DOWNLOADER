import { MapSource } from "../types";

export const GOOGLE_PROJECT_URL =
  "https://developers.google.com/maps/documentation/tile";

export const GOOGLE_SOURCES: Record<string, MapSource> = {
  googleSatellite: {
    id: "googleSatellite",
    name: "Google Satellite",
    type: "google",
    mapType: "satellite",
    projectUrl: GOOGLE_PROJECT_URL,
  },
  googleHybrid: {
    id: "googleHybrid",
    name: "Google Hybrid",
    type: "google",
    mapType: "hybrid",
    projectUrl: GOOGLE_PROJECT_URL,
  },
} as const;

export const SATELLITE_SOURCES: Record<string, MapSource> = {
  highSightSatellite: {
    id: "highSightSatellite",
    name: "HighSight Satellite",
    type: "raster",
    url: `https://api.highsight.dev/v1/satellite/{z}/{x}/{y}?date=latest&key=${import.meta.env.VITE_HIGHSIGHT_API_KEY || ""}`,
    attribution: "© HighSight - Satellite Imagery",
    projectUrl: "https://console.highsight.dev",
  },
  googleSatelliteNoApi: {
    id: "googleSatelliteNoApi",
    name: "Google Satellite (No API Key)",
    type: "raster",
    url: "https://mt0.google.com/vt/lyrs=s&hl=en&x={x}&y={y}&z={z}",
    attribution: "Map data © Google",
  },
  bingSatelliteNoApi: {
    id: "bingSatelliteNoApi",
    name: "Bing Satellite (No API Key)",
    type: "raster",
    url: "https://ecn.t3.tiles.virtualearth.net/tiles/a{quadkey}.jpeg?g=1",
    attribution: "Map data © Microsoft",
  },
  localOfflineSatellite: {
    id: "localOfflineSatellite",
    name: "Offline Local Map (Demo)",
    type: "raster",
    url: "/offline-tiles/satellite/{z}/{x}/{y}.jpg",
    attribution: "Local Data",
  },
  esriWorldImagery: {
    id: "esriWorldImagery",
    name: "ESRI Satellite",
    type: "raster",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "© Esri, Maxar, Earthstar Geographics, and the GIS User Community",
    projectUrl: "https://www.arcgis.com/home/item.html?id=10df2279f9684e4a9f6a7f08febac2a9",
  },
} as const;

export const DEFAULT_SOURCE_ID = "highSightSatellite";
