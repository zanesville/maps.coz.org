const layer = process.argv.slice(2);
const type = process.argv.slice(3);

/* we are building a function that will export a json like this - with the name, source, etc all being based on the layer, and the type of visual layer based on the type

the json looks like this -   {
    "id": "wMainInner",
    "name": "Water Mains",
    "type": "line",
    "directory": "City Water System",
    "children": true,
    "legend": "<div><span class='fa fa-minus' style='color:#0062ff;'></span> High Pressure System<br><span class='fa fa-minus' style='color:#26d9d0;'></span> Low Pressure System</div>",
    "group": "Water Layers",
    "source": "wMainSource",
    "sourceType": {
      "type": "vector",
      "tiles": [
        "https://311.coz.org/static/data/vector-tiles/utl_water_agol_main/{z}/{x}/{y}.mvt"
      ],
      "maxzoom": 17
    },
    "source-layer": "utl_water_agol_main",
    "paint": {
      "line-width": [
        "case",
        [
          ">",
          [
            "get",
            "DIAMETER"
          ],
          19
        ],
        7,
        [
          ">",
          [
            "get",
            "DIAMETER"
          ],
          11
        ],
        5,
        3
      ],
      "line-color": [
        "case",
        ["==", ["get","SYSTEM"], "High Pressure"],"#0062ff",
        ["==", ["get","SYSTEM"], "Low Pressure"],"#26d9d0",
        "deeppink"
      ]
    },
    "layout": {
      "visibility": "none"
    },
    "metadata": {
      "popup": true
    }
  },
  */

  class Layer {
    constructor({layer, type, directory, sourceType, sourceLayer, paint, layout, metadata, children, legend}) {
      this.id = layer;
      this.name = layer.replace(/_/g, " ").toUpperCase();
      this.type = type;
      this.directory = directory || "Map Layers";
      this.children = children || false;
      this.legend = legend || "";
      this.group = group || "Layer Group";
      this.sourceType = sourceType || {
        "type": "vector",
        "tiles": [
          "https://311.coz.org/static/data/vector-tiles/utl_water_agol_main/{z}/{x}/{y}.mvt"
        ],
        "maxzoom": 17
      }
    }
  }

  const createLayer = (layer, type) => {
    "id": "utl_water_lsli",
    "name": "Water Lead Service Lines",
    "directory": "City Water System",
    "group": "Water Layers",
    "source": "utl_water_lsli",
    "sourceType": {
      "type": "vector",
      "tiles": [
        "https://311.coz.org/api/v1/vector-tiles/public.utl_water_lsli/{z}/{x}/{y}.pbf"
      ]
    },
    "source-layer": "public.utl_water_lsli",
    "type": "line",
    "paint": {
      "line-width": 4,
      "line-color": "red"
    },
    "layout": {
      "visibility": "none"
    },
    "metadata": {
      "popup": true
    }