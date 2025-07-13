// Giresun Üniversitesi Kampüs Bilgi Sistemi - Gelişmiş main.js

const map = L.map('map', {
  center: [40.915297, 38.321793],
  zoom: 18,
  maxBounds: [
    [40.912, 38.318],
    [40.918, 38.325]
  ],
  maxBoundsViscosity: 1.0
});

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 22,
  attribution: '© OpenStreetMap'
}).addTo(map);

let bolumler = [], katlar = [], personeller = [], geojsonLayer;

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
      geojsonLayer = L.geoJSON(fakulteData, {
        onEachFeature: (feature, layer) => {
          const fakulteAdi = feature.properties.ADI || feature.properties.FAKULTE_ADI || "Bilinmeyen Fakülte";
          const bolumlerInFakulte = bolumler.filter(b => b.FAKULTE_ADI === fakulteAdi);

          let content = `<h3>${fakulteAdi}</h3>`;

         let content = `<div class="fakulte-title">${fakulteAdi}</div>`;

if (bolumlerInFakulte.length === 0) {
  content += "<p>Hiç bölüm kaydı yok.</p>";
} else {
  bolumlerInFakulte.forEach(bolum => {
    const kat = katlar.find(k => k.KAT_ID === bolum.KAT_ID);
    const personelList = personeller.filter(p => p.BOLUM_ID === bolum.BOLUM_ID);
    content += `
      <div class="bolum-card">
        <strong>Bölüm:</strong> ${bolum.BOLUM_ADI}<br>
        <strong>Kat:</strong> ${kat ? kat.KAT_ADI : "Belirsiz"}<br>
        <strong>Bölüm Başkanı:</strong> ${bolum.BOLUM_BASKANI || "Yok"}<br>
        <strong>Personeller:</strong>
        <ul class="personel-list">
          ${personelList.map(p => `
            <li onclick="showPersonelDetail('${encodeURIComponent(JSON.stringify(p))}')">
              ${p.A

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

      map.fitBounds(geojsonLayer.getBounds());
    });
});

function zoomToFakulte(fakulteAdi) {
  if (!geojsonLayer) return;
  geojsonLayer.eachLayer(layer => {
    const ad = layer.feature.properties.ADI || layer.feature.properties.FAKULTE_ADI;
    if (ad === fakulteAdi) {
      map.fitBounds(layer.getBounds());
      layer.openPopup();
    }
  });
}

function showPersonelDetail(p) {
  const detailHTML = `
    <div class="personel-popup">
      <h3>${p.AD_SOYAD}</h3>
      <p><strong>Unvan:</strong> ${p.UNVAN || 'Bilinmiyor'}</p>
      <p><strong>Telefon:</strong> ${p.TELEFON || '-'}</p>
      <p><strong>E-posta:</strong> ${p.EMAIL || '-'}</p>
      <p><strong>Oda No:</strong> ${p.ODA_NO || '-'}</p>
      <p><strong>Ek Bilgi:</strong> ${p.EK_BILGI || '-'}</p>
    </div>
  `;
  document.getElementById('infoContent').innerHTML = detailHTML;
}
