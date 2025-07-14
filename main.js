// Harita Oluşturma
const map = L.map("map", {
  center: [40.915, 38.321],
  zoom: 17,
  minZoom: 16,
  maxZoom: 22,
  maxBounds: [
    [40.912, 38.317],
    [40.918, 38.326]
  ],
  maxBoundsViscosity: 1.0
});

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap',
  noWrap: true,
  maxZoom: 22,
  minZoom: 16
}).addTo(map);

// Katmanları tanımla
const layersConfig = [
  // POLİGON KATMANLAR
  { name: "Fakülteler",       url: "data/FAKULTE.json",                     color: "#1a237e" },
  { name: "Kütüphane",        url: "data/KÜTÜPHANE_FeaturesToJSON.json",     color: "#673ab7" },
  { name: "Laboratuvar",      url: "data/LABORATUVARR_FeaturesToJSON.json",  color: "#e91e63" },
  { name: "Laboratuvar-2",    url: "data/LABORATUVARR_FeaturesToJSON1.json", color: "#f44336" },
  { name: "Lojmanlar",        url: "data/LOJMANLAR_FeaturesToJSON.json",     color: "#009688" },
  { name: "Rektörlük",        url: "data/REKTÖRLÜK_FeaturesToJSON.json",     color: "#3f51b5" },
  { name: "Spor Salonu",      url: "data/SPOR_SALONUU_FeaturesToJSON.json",  color: "#4caf50" },
  { name: "Üniversite Birimleri", url: "data/ÜNİVERSİTE_BIRİMLER_Features.json", color: "#ffc107" },
  { name: "Yemekhane",        url: "data/YEMEKHANEE_FeaturesToJSON.json",    color: "#ff9800" },
  { name: "Yeşil Alan",       url: "data/YESİLALAN_FeaturesToJSON.json",     color: "#8bc34a" },
  { name: "Güvenlik",         url: "data/GÜVENLİK_FeaturesToJSON.json",      color: "#000000" },
  { name: "Bankamatik",       url: "data/BANKAMATİK_FeaturesToJSON.json",    color: "#00796b" },

  // ÇİZGİ KATMANLAR
  { name: "Yol Ağı",          url: "data/YOL_AGI.json",                      color: "#212121", type: "line" },

  // NOKTA KATMANLAR
  { name: "Kapı / Giriş",     url: "data/KAPI_GİRİS.json",                   color: "#d84315", type: "point" }
];

// Katmanları burada tut
let overlayLayers = {};
let loadedCount = 0;

// Katmanları sırayla yükle
layersConfig.forEach(layer => {
  fetch(layer.url).then(res => res.json()).then(data => {
    let leafletLayer;

    // Çizgi (LineString) ise
    if (layer.type === "line") {
      leafletLayer = L.geoJSON(data, {
        style: { color: layer.color, weight: 4, dashArray: "8, 8" }
      }).bindPopup(layer.name);

    // Nokta ise (Kapı/Giriş gibi)
    } else if (layer.type === "point") {
      leafletLayer = L.geoJSON(data, {
        pointToLayer: (feature, latlng) => L.circleMarker(latlng, {
          radius: 7,
          fillColor: layer.color,
          color: "#222",
          weight: 2,
          opacity: 1,
          fillOpacity: 0.9
        }),
        onEachFeature: (feature, l) => {
          let info = `<b>${layer.name}</b>`;
          if (feature.properties.KAPI_ADI) info += `<br>${feature.properties.KAPI_ADI}`;
          l.bindPopup(info);
        }
      });

    // Poligon ise
    } else {
      leafletLayer = L.geoJSON(data, {
        style: { color: layer.color, fillOpacity: 0.5, weight: 2 },
        onEachFeature: (feature, l) => {
          let info = `<b>${layer.name}</b>`;
          if (feature.properties.ADI) info += `<br>${feature.properties.ADI}`;
          if (feature.properties.FAKULTE_ADI) info += `<br>${feature.properties.FAKULTE_ADI}`;
          if (feature.properties.OBJECTID && !feature.properties.ADI && !feature.properties.FAKULTE_ADI)
            info += `<br>ID: ${feature.properties.OBJECTID}`;
          l.bindPopup(info);
        }
      });
    }

    leafletLayer.addTo(map);
    overlayLayers[layer.name] = leafletLayer;
    loadedCount++;
    // Son katman da yüklendiğinde katman kontrolünü ekle
    if (loadedCount === layersConfig.length) {
      L.control.layers(null, overlayLayers, { collapsed: false }).addTo(map);
    }
  });
});

// Haritayı sınıra oturt
setTimeout(() => {
  map.fitBounds([
    [40.912, 38.317],
    [40.918, 38.326]
  ]);
}, 1000);
