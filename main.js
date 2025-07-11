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

// JSON veri kaynakları
let bolumler = [], katlar = [], personeller = [];

// Verileri sırayla oku
Promise.all([
  fetch('data/bolumler.json').then(res => res.json()),
  fetch('data/katlar.json').then(res => res.json()),
  fetch('data/personel.json').then(res => res.json())
]).then(([bolumData, katData, personelData]) => {
  bolumler = bolumData;
  katlar = katData;
  personeller = personelData;

  // FAKULTE katmanı
  fetch('data/FAKULTE.json')
    .then(res => res.json())
    .then(fakulteData => {
      const fakulteLayer = L.geoJSON(fakulteData, {
        onEachFeature: (feature, layer) => {
          const fakulteAdi = feature.properties.ADI || "Bilinmeyen Fakülte";
          const bolumlerInFakulte = bolumler.filter(b => b.FAKÜLTE_ADI === fakulteAdi);

          let content = `<h3>${fakulteAdi}</h3>`;
          if (bolumlerInFakulte.length === 0) {
            content += "<p>Hiç bölüm kaydı yok.</p>";
          } else {
            bolumlerInFakulte.forEach(bolum => {
              const kat = katlar.find(k => k.KAT_ID === bolum.KAT_ID);
              const personelList = personeller.filter(p => p.BOLUM_ID === bolum.BOLUM_ID);

              content += `
                <div style="margin-top:8px; padding:5px; border-top:1px solid #ccc;">
                  <strong>Bölüm:</strong> ${bolum.BOLUM_ADI}<br>
                  <strong>Kat:</strong> ${kat ? kat.KAT_ADI : "Belirsiz"}<br>
                  <strong>Bölüm Başkanı:</strong> ${bolum.BOLUM_BASKANI || "Yok"}<br>
