import "ol/ol.css";
import Map from "ol/Map";
import View from "ol/View";
import { OSM } from "ol/source";
import { transformExtent } from "ol/proj";
import { getCenter } from "ol/extent";
import TileLayer from "ol/layer/Tile";
import { Style, Fill, Stroke, Circle as CircleStyle, Text } from "ol/style";
import VectorTileLayer from "ol/layer/VectorTile";
import VectorTileSource from "ol/source/VectorTile";
import MVT from "ol/format/MVT";

const basemap = new TileLayer({
  source: new OSM(),
});

const settlementsPolygonStyle = new Style({
  fill: new Fill({
    color: "rgba(0, 255, 0, 0.1)",
  }),
  stroke: new Stroke({
    color: "#0000FF",
    width: 1,
    lineDash: [4, 8],
  }),
});

const adminBoundariesLayer = new VectorTileLayer({
  declutter: true,
  source: new VectorTileSource({
    format: new MVT(),
    url: "https://demo.nextgis.com/api/component/feature_layer/mvt?resource=4224&z={z}&x={x}&y={y}",
  }),
  style: (feature) => {
    return new Style({
      stroke: new Stroke({
        color: "purple",
        width: 2,
      }),
      text: new Text({
        font: "12px Calibri,sans-serif",
        text: feature.get("NAME") || "",
        fill: new Fill({ color: "purple" }),
        stroke: new Stroke({
          color: "#ffffff",
          width: 3,
        }),
      }),
    });
  },
});

const settlementsPolygonLayer = new VectorTileLayer({
  declutter: true,
  source: new VectorTileSource({
    format: new MVT(),
    url: "https://demo.nextgis.com/api/component/feature_layer/mvt?resource=4222&z={z}&x={x}&y={y}",
  }),
  style: settlementsPolygonStyle,
});

const settlementsPointLayer = new VectorTileLayer({
  declutter: true,
  source: new VectorTileSource({
    format: new MVT(),
    url: "https://demo.nextgis.com/api/component/feature_layer/mvt?resource=4220&z={z}&x={x}&y={y}",
  }),
  style: (feature) => {
    const population = feature.get("POPULATION");
    let radius;

    if (population > 100000) {
      radius = 8;
    } else if (population >= 10000) {
      radius = 7;
    } else if (population >= 1000) {
      radius = 6;
    } else if (population > 0) {
      radius = 5;
    } else {
      radius = 3;
    }

    return new Style({
      image: new CircleStyle({
        radius: radius,
        fill: new Fill({ color: "#000000" }),
        stroke: new Stroke({
          color: "#FFFFFF",
          width: 1,
        }),
      }),
    });
  },
});

const extent = transformExtent(
  [-124.772, 45.544, -116.917, 49.002],
  "EPSG:4326",
  "EPSG:3857"
);

new Map({
  target: "map",
  layers: [
    basemap,
    adminBoundariesLayer,
    settlementsPolygonLayer,
    settlementsPointLayer,
  ],
  view: new View({
    projection: "EPSG:3857",
    center: getCenter(extent),
    zoom: 7,
  }),
});
