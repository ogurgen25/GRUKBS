const map = new maplibregl.Map({
  container: 'map',
  style: 'https://demotiles.maplibre.org/style.json',
  center: [38.3215, 40.915], // Giresun kampüsüne odak
  zoom: 17,
  pitch: 45,
  bearing: -17.6,
  antialias: true
});

map.on('load', () => {
  map.addSource('fakulte', {
    'type': 'geojson',
    'data': 'data/FAKULTE_3D.json'
  });

  map.addLayer({
    'id': 'fakulte-3d',
    'type': 'fill-extrusion',
    'source': 'fakulte',
    'paint': {
      'fill-extrusion-color': '#0074D9',
      'fill-extrusion-height': ['get', 'YUKSEKLIK'],
      'fill-extrusion-base': 0,
      'fill-extrusion-opacity': 0.85
    }
  });
});
