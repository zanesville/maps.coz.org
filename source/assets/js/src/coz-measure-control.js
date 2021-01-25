var geomFN = {};
geomFN.area = require('@turf/area').default
geomFN.length = require('@turf/length').default

/**
 * Custom Mapbox measure control
 * @param {object} map mapbox map object
 */

function mapMeasureControl() {
  this.onAdd = function (map) {

    var measurement = document.createElement('div');
    measurement.className = 'measure-container';
    map.getContainer().appendChild(measurement);

    var draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        polygon: true,
        line_string: true,
        trash: true
      }
    });

    var measureResult = document.querySelector('.measure-container');

    function updateArea(action) {
      var data = draw.getAll();
      if (data.features.length > 0) {
     
        var totalpoly = 0;
        var totalline = 0;
        var totalacres = 0;
        var measured = {
          type: "FeatureCollection",
          features: []
        }
        data.features.map(function (f) {
          if (f.geometry.type === 'Point') {
          }
          if (f.geometry.type === 'Polygon') {
            var area = geomFN.area(f);
            var area_ft = area * 10.7639;
            totalpoly = totalpoly + area_ft;
            totalpoly = Math.round(totalpoly * 100) / 100;
            totalacres = Math.round((totalpoly / 43560) * 100) / 100;
          }
          if (f.geometry.type === 'LineString') {
            var dist = geomFN.length(f, {
              units: 'feet'
            });
            var rounded_dist = Math.round((dist) * 100) / 100;
            totalline = totalline + rounded_dist;
            f.properties.length = rounded_dist.toFixed(2);
            measured.features.push(f)
          };
        });;

        measureResult.innerHTML = '<p>Total Polygon Area: <strong>' + totalpoly + '</strong>&nbsp;square feet<br />' +
          'Total Acreage: <strong>&nbsp;' + totalacres + '&nbsp;acres</strong><br /><br />' +
          'Line Distance: <strong>&nbsp;' + data.features[data.features.length - 1].properties.length + '</strong>&nbsp;feet<br />' +
          'Total Line Distance: <strong>' + totalline.toFixed(2) + '</strong>&nbsp;feet</p>';
      } else {
        measureResult.innerHTML = '';
      }
    }

    this._map = map;
    this._btn = document.createElement('button');
    this._btn.innerHTML = '<svg style="height:25px;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M160 288h-56c-4.42 0-8-3.58-8-8v-16c0-4.42 3.58-8 8-8h56v-64h-56c-4.42 0-8-3.58-8-8v-16c0-4.42 3.58-8 8-8h56V96h-56c-4.42 0-8-3.58-8-8V72c0-4.42 3.58-8 8-8h56V32c0-17.67-14.33-32-32-32H32C14.33 0 0 14.33 0 32v448c0 2.77.91 5.24 1.57 7.8L160 329.38V288zm320 64h-32v56c0 4.42-3.58 8-8 8h-16c-4.42 0-8-3.58-8-8v-56h-64v56c0 4.42-3.58 8-8 8h-16c-4.42 0-8-3.58-8-8v-56h-64v56c0 4.42-3.58 8-8 8h-16c-4.42 0-8-3.58-8-8v-56h-41.37L24.2 510.43c2.56.66 5.04 1.57 7.8 1.57h448c17.67 0 32-14.33 32-32v-96c0-17.67-14.33-32-32-32z"/></svg>';
    // this._btn.className = 'fa fa-ruler-combined fa-2x';'
    this._btn.type = 'button';
    this._btn['aria-label'] = 'Toggle Pitch';
    this._btn.onclick = function () {

      if (!sessionStorage.getItem('cozShownMeasureAlert')) {
        var toast = document.createElement('div');
        toast.classList.add('toast');
        toast.classList.add('toast-measure-control');
        toast.innerText = "Feature highlighting and identifying are disabled when using the measure tool."
        document.body.appendChild(toast);
        sessionStorage.setItem('cozShownMeasureAlert', 1);
        setTimeout(function() {
          var toastMessage = document.getElementsByClassName('toast-measure-control');
          toastMessage[0].style.display = "none";
        }, 8000);
      }

      if (!document.querySelector('.mapbox-gl-draw_ctrl-draw-btn')) {
        console.log('drawing control not yet added');
        map.addControl(draw, 'top-right');
        var drawControl = document.querySelector('.mapbox-gl-draw_ctrl-draw-btn');

        // map.addSource("cozMeasureControlSource", {
        //   type: "geojson",
        //   data: {
        //     type: "FeatureCollection",
        //     features: []
        //   }
        // });

        // map.addLayer({
        //   id: "cozMeasureControlLabel",
        //   type: 'symbol',
        //   source: "cozMeasureControlSource",
        //   layout: {
        //     'text-field': '{length}',
        //     'text-font': ['Roboto Bold'],
        //     'text-anchor': 'center',
        //     'text-size': 12,
        //     'text-offset': [0, 1],
        //     "symbol-placement": "line-center"

        //   },
        //   paint: {
        //     'text-color': '#121212',
        //     'text-halo-color': '#fff',
        //     'text-halo-width': 1.2
        //   }
        // });

        map.on('draw.create', updateArea);
        map.on('draw.delete', updateArea);
        map.on('draw.update', updateArea);
        map.on('draw.render', function() {
          updateArea("render")
        });
        // map.on("draw.actionable", function() {console.log("actionable")})

        map.on('draw.create', function() {console.log("create")});
        map.on('draw.delete', function() {console.log("delete")});
        map.on('draw.update', function() {console.log("update")});
        map.on('draw.render', function() {console.log("render")});

        map.on('draw.selectionchange', function() {
          console.log("selectionchange")

          if (map.getPaintProperty("gl-draw-polygon-stroke-inactive.cold", "line-color")) {
            map.setPaintProperty("gl-draw-polygon-stroke-inactive.cold", "line-color", "red");
            map.setPaintProperty("gl-draw-polygon-stroke-inactive.cold", "line-width", 4);
            document.querySelector(".coz-measure-toggle").classList.remove("active")

          }

          if (map.getPaintProperty("gl-draw-polygon-fill-inactive.cold", "fill-color")) {
            map.setPaintProperty("gl-draw-polygon-fill-inactive.cold", "fill-opacity", 0.1);
            map.setPaintProperty("gl-draw-polygon-fill-inactive.cold", "fill-color", "red");
            document.querySelector(".coz-measure-toggle").classList.remove("active")

          }

          if (map.getPaintProperty("gl-draw-line-inactive.cold", "line-color")) {
            map.setPaintProperty("gl-draw-line-inactive.cold", "line-color", "red");
            map.setPaintProperty("gl-draw-line-inactive.cold", "line-width", 4);
            document.querySelector(".coz-measure-toggle").classList.remove("active")

          }

        })

        this.classList.add('active');
        this.style.color = "#33b5e5";
      } else {
        // map.removeLayer("cozMeasureControlLabel");
        // map.removeSource("cozMeasureControlSource");
        map.removeControl(draw);
        document.querySelector('.measure-container').innerHTML = "";
        this.classList.remove('active');
        this.style.color = "black";
      }
    }

    this._container = document.createElement('div');
    this._container.className = 'mapboxgl-ctrl mapboxgl-ctrl-group coz-measure-toggle';
    this._container.appendChild(this._btn);

    return this._container;
  }

  this.onRemove = function () {
    this._container.parentNode.removeChild(this._container);
    this._map = undefined;
  }
}

export {
  mapMeasureControl
};
