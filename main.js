
let map = L.map("map").setView([40.915, 38.321], 18);

// Tile katmanı
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: '&copy; OpenStreetMap katkıcıları',
  maxZoom: 20,
}).addTo(map);

// Harita sınırlarını belirle
const bounds = L.latLngBounds(
  L.latLng(40.913, 38.319),
  L.latLng(40.917, 38.323)
);
map.setMaxBounds(bounds);
map.on("drag", function () {
  map.panInsideBounds(bounds, { animate: false });
});

// Fakülte GeoJSON verisini yükle
let fakulteLayer;
fetch("FAKULTE.json")
  .then((res) => res.json())
  .then((data) => {
    fakulteGeoJSON = data;
    fakulteLayer = L.geoJSON(data, {
      style: {
        color: "#003366",
        weight: 2,
        fillOpacity: 0.4,
      },
      onEachFeature: function (feature, layer) {
        layer.on("click", function () {
          const props = feature.properties;
          const html = `
            <strong>${props.FAKULTE_ADI}</strong><br>
            Kat: ${props.ZEMINUSTUKAT}<br>
            Bölüm Sayısı: ${props.BOLUM_SAYISI || "-"}<br>
            Tel: ${props.TELEFON_NO || "-"}<br>
            Web: ${props.WEB_ADRESI || "-"}
          `;
          L.popup().setLatLng(layer.getBounds().getCenter()).setContent(html).openOn(map);
        });
      },
    }).addTo(map);

    initializeFakulteDropdown(); // Dropdown ilk yüklenince doldur
  });

// Bölüm ve personel verilerini yükle
let bolumler = [];
let personeller = [];

fetch("bolumler.json")
  .then((res) => res.json())
  .then((data) => {
    bolumler = data;
  });

fetch("personel.json")
  .then((res) => res.json())
  .then((data) => {
    personeller = data;
  });

// Fakülte dropdown doldurma
function initializeFakulteDropdown() {
  const fakulteDropdown = document.getElementById("fakulteSec");

  const fakulteIDs = [...new Set(bolumler.map(b => b.FAKULTE_ID))];

  fakulteIDs.forEach(id => {
    const fakulte = fakulteGeoJSON.features.find(f => f.properties.FAKULTE_ID === id);
    if (fakulte) {
      fakulteDropdown.add(new Option(fakulte.properties.FAKULTE_ADI, id));
    }
  });

  fakulteDropdown.addEventListener("change", e => {
    triggerBolumDropdown(e.target.value);
  });
}

function triggerBolumDropdown(fakulteID) {
  const bolumDropdown = document.getElementById("bolumSec");
  bolumDropdown.innerHTML = "<option value=''>Bölüm Seç</option>";
  document.getElementById("personelSec").innerHTML = "<option value=''>Personel Seç</option>";

  const bolumlerFiltresi = bolumler.filter(b => b.FAKULTE_ID === fakulteID);
  bolumlerFiltresi.forEach(b => {
    bolumDropdown.add(new Option(b.BOLUM_ADI, b.BOLUM_ID));
  });

  bolumDropdown.disabled = false;

  bolumDropdown.addEventListener("change", e => {
    triggerPersonelDropdown(fakulteID, e.target.value);
  });
}

function triggerPersonelDropdown(fakulteID, bolumID) {
  const personelDropdown = document.getElementById("personelSec");
  personelDropdown.innerHTML = "<option value=''>Personel Seç</option>";

  const personelListesi = personeller.filter(p => p.FAKULTE_ID === fakulteID && p.BOLUM_ID === bolumID);
  personelListesi.forEach(p => {
    personelDropdown.add(new Option(p.PERSONEL_ADI, p.PERSONEL_ID));
  });

  personelDropdown.disabled = false;

  personelDropdown.addEventListener("change", (e) => {
    const secilenID = e.target.value;
    const personel = personeller.find(p => p.PERSONEL_ID === secilenID);

    if (!personel) return;

    const fakulte = fakulteGeoJSON.features.find(f => f.properties.FAKULTE_ID === personel.FAKULTE_ID);
    const bolum = bolumler.find(b => b.BOLUM_ID === personel.BOLUM_ID);

    const html = `
      <h3>${personel.PERSONEL_ADI}</h3>
      <p><strong>Fakülte:</strong> ${fakulte?.properties?.FAKULTE_ADI || "-"}</p>
      <p><strong>Bölüm:</strong> ${bolum?.BOLUM_ADI || "-"}</p>
      <button id="gotoBtn">Konuma Git</button>
    `;

    const panel = document.getElementById("personelDetay");
    panel.innerHTML = html;

    document.getElementById("gotoBtn").addEventListener("click", () => {
      if (fakulte) {
        const center = L.geoJSON(fakulte.geometry).getBounds().getCenter();
        map.setView(center, 19);
      }
    });
  });
}
