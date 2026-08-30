import type Layer from '@arcgis/core/layers/Layer';
import { parse } from 'yaml';

type LayerConstructor = new (properties?: Record<string, unknown>) => Layer;

const supportedLayerTypes = [
  'FeatureLayer',
  'GeoJSONLayer',
  'ImageryLayer',
  'MapImageLayer',
  'MapLayer',
  'TileLayer',
  'VectorTileLayer',
  'WMSLayer',
] as const;

type SupportedLayerType = (typeof supportedLayerTypes)[number];

interface LayerConfigDocument {
  layers: Array<Record<string, unknown> & { type: SupportedLayerType }>;
}

export async function loadLayersFromYaml(configUrl: string): Promise<Layer[]> {
  const response = await fetch(configUrl);

  if (!response.ok) {
    throw new Error(`Could not load layer configuration (${response.status} ${response.statusText}).`);
  }

  const config = validateConfig(parse(await response.text()));

  return Promise.all(
    config.layers.map(async ({ type, ...properties }, index) => {
      try {
        const LayerClass = await getLayerConstructor(type);
        return new LayerClass(properties);
      } catch (error) {
        const reason = error instanceof Error ? error.message : String(error);
        throw new Error(`Layer ${index + 1} (${type}) is invalid: ${reason}`);
      }
    }),
  );
}

function validateConfig(value: unknown): LayerConfigDocument {
  if (!isRecord(value) || !Array.isArray(value['layers'])) {
    throw new Error('The YAML configuration must contain a layers array.');
  }

  const layers = value['layers'].map((layer, index) => {
    if (!isRecord(layer) || typeof layer['type'] !== 'string') {
      throw new Error(`Layer ${index + 1} must be an object with a type.`);
    }

    if (!supportedLayerTypes.includes(layer['type'] as SupportedLayerType)) {
      throw new Error(
        `Layer ${index + 1} uses unsupported type "${layer['type']}". ` +
          `Supported types: ${supportedLayerTypes.join(', ')}.`,
      );
    }

    return layer as Record<string, unknown> & { type: SupportedLayerType };
  });

  return { layers };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

async function getLayerConstructor(type: SupportedLayerType): Promise<LayerConstructor> {
  let LayerClass: unknown;

  switch (type) {
    case 'FeatureLayer':
      LayerClass = (await import('@arcgis/core/layers/FeatureLayer')).default;
      break;
    case 'GeoJSONLayer':
      LayerClass = (await import('@arcgis/core/layers/GeoJSONLayer')).default;
      break;
    case 'ImageryLayer':
      LayerClass = (await import('@arcgis/core/layers/ImageryLayer')).default;
      break;
    case 'MapLayer':
    case 'MapImageLayer':
      LayerClass = (await import('@arcgis/core/layers/MapImageLayer')).default;
      break;
    case 'TileLayer':
      LayerClass = (await import('@arcgis/core/layers/TileLayer')).default;
      break;
    case 'VectorTileLayer':
      LayerClass = (await import('@arcgis/core/layers/VectorTileLayer')).default;
      break;
    case 'WMSLayer':
      LayerClass = (await import('@arcgis/core/layers/WMSLayer')).default;
      break;
  }

  return LayerClass as LayerConstructor;
}
