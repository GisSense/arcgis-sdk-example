# ArcGIS SDK Angular example

A small Angular 18 application that uses the ArcGIS Maps SDK for JavaScript to display the public **NWB - Hectopunten** feature layer.

## Run locally

```bash
npm install
npm start
```

Open <http://localhost:4200>.

## Production build

```bash
npm run build
```

The output is written to `dist/arcgis-sdk-example`.

## Layer configuration

Operational layers are configured in `public/config/layers.yaml`. Layers are added to the map in the order in which they appear in the file. Every setting other than `type` is passed directly to the corresponding ArcGIS layer constructor.

```yaml
layers:
  - type: ImageryLayer
    title: Example imagery
    url: https://example.com/arcgis/rest/services/example/ImageServer
    visible: true
    opacity: 0.7
```

Supported values for `type` are:

- `FeatureLayer`
- `GeoJSONLayer`
- `ImageryLayer`
- `MapImageLayer` (or the `MapLayer` alias)
- `TileLayer`
- `VectorTileLayer`
- `WMSLayer`

Configuration errors are validated and displayed in the application. YAML supports serializable ArcGIS properties such as `popupTemplate`, `renderer`, `definitionExpression`, `minScale`, and `maxScale`; callback functions must still be implemented in TypeScript.
