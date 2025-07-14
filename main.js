// 1. Harita Kurulumu
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

// 2. Katmanların hepsini ayarla
const layersConfig = [
  { name: "Kütüphane",        url: "data/KÜTÜPHANE_FeaturesToJSON.json",     color: "#673ab7" },
  { name: "Laboratuvar",      url: "data/LABORATUVARR_FeaturesToJSON.json",  color: "#e91e63" },
  { name: "Laboratuvar-2",    url: "data/LABORATUVARR_FeaturesToJSON1.json", color: "#f44336" },
  { name: "Lojmanlar",        url: "data/LOJMANLAR_FeaturesToJSON.json",     color: "#009688" },
  { name: "Rektörlük",        url: "data/REKTÖRLÜK_FeaturesToJSON.json",     color: "#3f51b5" },
  { name: "Spor Salonu",      url: "data/SPOR_SALONUU_FeaturesToJSON.json",  color: "#4caf50" },
  { name: "Üniversite Birimleri", url: "data/ÜNİVERSİTE_BİRİMLER_Features.json", color: "#ffc107" },
  { name: "Yemekhane",        url: "data/YEMEKHANEE_FeaturesToJSON.json",    color: "#ff9800" },
  { name: "Yeşil Alan",       url: "data/YESİLALAN_FeaturesToJSON.json",     color: "#8bc34a" },
  { name: "Yol Ağı",          url: "data/YOL_AGI.json",                      color: "#212121", type: "line" },
  { name: "Kapı / Giriş",     url: "data/KAPI_GİRİS.json",                   color: "#d84315", type: "point" },
  { name: "Bankamatik",       url: "data/BANKAMATİK_FeaturesToJSON.json",    color: "#00796b" },
  { name: "Güvenlik",         url: "data/GÜVENLİK_FeaturesToJSON.json",      color: "#000000" },
  { name: "Fakülteler",       url: "data/FAKULTE.json",                      color: "#1a138e" } // En üste alırsan önde görünür
];

// 3. Katmanları haritaya ekle
let overlayLayers = {};
layersConfig.forEach(layer => {
  fetch(layer.url).then(res => res.json()).then(data => {
    let leafletLayer;
    if (layer.type === "line") {
      leafletLayer = L.geoJSON(data, {
        style: { color: layer.color, weight: 4, dashArray: "8, 8" }
      }).bindPopup(layer.name);
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
          if (feature.properties.ADI) info += `<br>${feature.properties.ADI}`;
          l.bindPopup(info);
        }
      });
    } else {
      leafletLayer = L.geoJSON(data, {
        style: { color: layer.color, fillOpacity: 0.5, weight: 2 },
        onEachFeature: (feature, l) => {
          let info = `<b>${layer.name}</b>`;
          if (feature.properties.ADI) info += `<br>${feature.properties.ADI}`;
          if (feature.properties.FAKULTE_ADI) info += `<br>${feature.properties.FAKULTE_ADI}`;
          l.bindPopup(info);
        }
      });
    }
    leafletLayer.addTo(map);
    overlayLayers[layer.name] = leafletLayer;
    if (Object.keys(overlayLayers).length === layersConfig.length) {
      L.control.layers(null, overlayLayers, { collapsed: false }).addTo(map);
    }
  });
});

// 4. Fakülte-bölüm-personel dropdown ve highlight
let fakulteGeoJSON, bolumler, personeller;
let highlightLayer;

Promise.all([
  fetch("data/FAKULTE.json").then(res => res.json()),
  fetch("data/bolumler.json").then(res => res.json()),
  fetch("data/personel.json").then(res => res.json())
]).then(([fakulteData, bolumData, personelData]) => {
  fakulteGeoJSON = fakulteData;
  bolumler = bolumData;
  personeller = personelData;
  initializeFakulteDropdown();
});

function initializeFakulteDropdown() {
  const fakulteDropdown = document.getElementById("fakulteSec");
  fakulteDropdown.innerHTML = "<option value=''>Fakülte Seç</option>";
  fakulteGeoJSON.features.forEach(f => {
    fakulteDropdown.add(new Option(f.properties.FAKULTE_ADI, f.properties.FAKULTE_ID));
  });
  fakulteDropdown.disabled = false;
  fakulteDropdown.addEventListener("change", e => {
    triggerBolumDropdown(e.target.value);
    highlightFakulte(e.target.value);
  });
}

function triggerBolumDropdown(fakulteID) {
  const bolumDropdown = document.getElementById("bolumSec");
  bolumDropdown.innerHTML = "<option value=''>Bölüm Seç</option>";
  document.getElementById("personelSec").innerHTML = "<option value=''>Personel Seç</option>";
  bolumDropdown.disabled = false;
  bolumler.filter(b => b.FAKULTE_ID === fakulteID).forEach(b => {
    bolumDropdown.add(new Option(b.BOLUM_ADI, b.BOLUM_ID));
  });
  bolumDropdown.addEventListener("change", e => {
    triggerPersonelDropdown(fakulteID, e.target.value);
  });
}

function triggerPersonelDropdown(fakulteID, bolumID) {
  const personelDropdown = document.getElementById("personelSec");
  personelDropdown.innerHTML = "<option value=''>Personel Seç</option>";
  personelDropdown.disabled = false;
  personeller.filter(p => p.FAKULTE_ID === fakulteID && p.BOLUM_ID === bolumID).forEach(p => {
    personelDropdown.add(new Option(p.AD_SOYAD, p.PERSONEL_ID));
  });
  personelDropdown.addEventListener("change", e => {
    const secilenID = e.target.value;
    const personel = personeller.find(p => p.PERSONEL_ID === secilenID);
    if (personel) {
      highlightFakulte(fakulteID, true, personel);
    }
  });
}

function highlightFakulte(fakulteID, zoom = true, personel = null) {
  if (highlightLayer) {
    map.removeLayer(highlightLayer);
  }
  const fakulte = fakulteGeoJSON.features.find(f => f.properties.FAKULTE_ID === fakulteID);
  if (fakulte) {
    highlightLayer = L.geoJSON(fakulte, {
      style: { color: "#ff5722", fillColor: "#ffd180", weight: 5, fillOpacity: 0.6 }
    }).addTo(map);
    if (zoom) map.fitBounds(highlightLayer.getBounds());
    if (personel) {
      const bounds = highlightLayer.getBounds();
      L.popup()
        .setLatLng(bounds.getCenter())
        .setContent(`<b>${personel.AD_SOYAD}</b><br>${personel.UNVAN}`)
        .openOn(map);
    }
  }
}
