// Navigasyon kontrol değişkenleri
let selectedPersonel = null;
let selectedFakulteGeometry = null;
let routeControl = null;

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

// JSON Veri Kaynakları
let bolumler = [], katlar = [], personeller = [], fakulteGeoJSON = null;

Promise.all([
  fetch('data/bolumler.json').then(res => res.json()),
  fetch('data/katlar.json').then(res => res.json()),
  fetch('data/personel.json').then(res => res.json())
]).then(([bolumData, katData, personelData]) => {
  bolumler = bolumData;
  katlar = katData;
  personeller = personelData;

  fetch('data/FAKULTE.json')
    .then(res => res.json())
    .then(fakulteData => {
      fakulteGeoJSON = fakulteData;
      const geojsonLayer = L.geoJSON(fakulteData, {
        onEachFeature: (feature, layer) => {
          const fakulteAdi = feature.properties.ADI || "Bilinmeyen Fakülte";
          const bolumlerInFakulte = bolumler.filter(b => b.FAKÜLTE_ADI === fakulteAdi);

          let content = `<div class='fakulte-title'>🏛️ ${fakulteAdi}</div>`;

          if (bolumlerInFakulte.length === 0) {
            content += "<p>Hiç bölüm kaydı yok.</p>";
          } else {
            bolumlerInFakulte.forEach(bolum => {
              const kat = katlar.find(k => k.KAT_ID === bolum.KAT_ID);
              const personelList = personeller.filter(p => p.BOLUM_ID === bolum.BOLUM_ID);
              content += `
                <div class='bolum-card'>
                  <strong>📚 Bölüm:</strong> ${bolum.BOLUM_ADI}<br>
                  <strong>🏢 Kat:</strong> ${kat ? kat.KAT_ADI : "Belirsiz"}<br>
                  <strong>👤 Bölüm Başkanı:</strong> ${bolum.BOLUM_BASKANI || "Yok"}<br>
                  <strong>👥 Personeller:</strong>
                  <ul class='personel-list'>
                    ${personelList.map(p => `<li onclick="showPersonelDetail('${p.AD_SOYAD}', '${p.UNVAN}', '${p.EMAIL}', '${p.TELEFON}')">${p.AD_SOYAD} (${p.UNVAN || 'Görevli'})</li>`).join("")}
                  </ul>
                </div>
              `;
            });
          }

          layer.on('click', () => {
            document.getElementById('infoContent').innerHTML = content;
          });

          layer.bindPopup(fakulteAdi);
        },
        style: {
          color: "#0066cc",
          weight: 2,
          fillOpacity: 0.3
        }
      }).addTo(map);
    });
});

// Personel Detaylarını Gösteren Açılır Pencere
function showPersonelDetail(adSoyad, unvan, email, telefon) {
  selectedPersonel = { adSoyad, unvan, email, telefon };
  document.getElementById("gotoBtn").disabled = false;

  const bolum = bolumler.find(b => b.BOLUM_BASKANI === adSoyad || b.BOLUM_ADI.includes(adSoyad.split(" ")[1]));
  if (bolum) {
    const fakulte = fakulteGeoJSON.features.find(f => f.properties.ADI === bolum.FAKÜLTE_ADI);
    if (fakulte) selectedFakulteGeometry = fakulte.geometry;
  }

  document.getElementById("gotoBtn").addEventListener("click", () => {
    if (!selectedFakulteGeometry) {
      alert("Fakülte konumu bulunamadı.");
      return;
    }

    if (routeControl) {
      map.removeControl(routeControl);
    }

    const targetCenter = L.geoJSON(selectedFakulteGeometry).getBounds().getCenter();

    routeControl = L.Routing.control({
      waypoints: [
        map.getCenter(),
        targetCenter
      ],
      routeWhileDragging: false,
      show: false,
      addWaypoints: false,
      draggableWaypoints: false
    }).addTo(map);
  });

  const popup = `
    <div class='personel-detail'>
      <strong>👤 Ad Soyad:</strong> ${adSoyad}<br>
      <strong>🎓 Unvan:</strong> ${unvan || 'Bilinmiyor'}<br>
      <strong>📧 Email:</strong> ${email || 'Yok'}<br>
      <strong>📞 Telefon:</strong> ${telefon || 'Yok'}
    </div>
  `;
  L.popup({ maxWidth: 300 })
    .setLatLng(map.getCenter())
    .setContent(popup)
    .openOn(map);
}
