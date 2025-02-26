import "ol/ol.css";
import Map from "ol/Map";
import View from "ol/View";
import TileState from "ol/TileState";
import { OSM } from "ol/source";
import { transformExtent } from "ol/proj";
import { getCenter } from "ol/extent";
import TileLayer from "ol/layer/Tile";
import { Style, Fill, Stroke } from "ol/style";
import VectorTileLayer from "ol/layer/VectorTile";
import VectorTileSource from "ol/source/VectorTile";
import MVT from "ol/format/MVT";
import type VectorTile from "ol/VectorTile";

import RenderFeature from "ol/render/Feature";

interface Credentials {
  login: string;
  password: string;
}

function getAuthorizationHeaders(credentials: Credentials) {
  const client = makeClientId(credentials);
  if (client) {
    return {
      Authorization: "Basic " + client,
    };
  }
}

function makeClientId(credentials: Credentials) {
  if (credentials) {
    const { login, password } = credentials;
    const encodedStr = [login, password].map(encodeURIComponent).join(":");
    return btoa(encodedStr);
  }
}

const credentials = {
  login: "ngf_test",
  password: "ngf_test",
};

const basemap = new TileLayer({
  source: new OSM(),
});

const layerStyle = new Style({
  fill: new Fill({
    color: "rgba(0, 255, 0, 0.4)",
  }),
  stroke: new Stroke({
    color: "#0000FF",
    width: 1,
  }),
});

const vectorLayer = new VectorTileLayer({
  declutter: true,
  source: new VectorTileSource({
    format: new MVT(),
    url: "https://demo.nextgis.com/api/component/feature_layer/mvt?resource=4222&z={z}&x={x}&y={y}",
    tileLoadFunction: (t, src) => {
      const tile = t as VectorTile<RenderFeature>;
      tile.setLoader((extent, _resolution, projection) => {
        fetch(src, {
          method: "GET",
          headers: getAuthorizationHeaders(credentials),
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error("Network response was not ok");
            }
            return response.arrayBuffer();
          })
          .then((data) => {
            if (data !== undefined) {
              const format = new MVT();
              const features = format.readFeatures(data, {
                extent: extent,
                featureProjection: projection,
              });
              tile.setFeatures(features);
            } else {
              tile.setState(TileState.ERROR);
            }
          })
          .catch(() => {
            tile.setState(TileState.ERROR);
          });
      });
    },
  }),
  style: layerStyle,
});

const extent = transformExtent(
  [-124.772, 45.544, -116.917, 49.002],
  "EPSG:4326",
  "EPSG:3857"
);

new Map({
  target: "map",
  layers: [basemap, vectorLayer],
  view: new View({
    projection: "EPSG:3857",
    center: getCenter(extent),
    zoom: 7,
  }),
});
