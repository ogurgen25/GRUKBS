// main.js

let map = L.map('map').setView([40.915297, 38.321793], 17);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 22,
  attribution: '© OpenStreetMap'
}).addTo(map);

let bolumler = [], katlar = [], personeller = [], fakulteLayer;
let lastFakulteBounds, lastBolumBounds, lastPersonelBounds;

Promise.all([
  fetch('data/bolumler.json').then(res => res.json()),
  fetch('data/katlar.json').then(res => res.json()),
  fetch('data/personel.json').then(res => res.json()),
  fetch('data/FAKULTE.json').then(res => res.json())
]).then(([bolumData, katData, personelData, fakulteData]) => {
  bolumler = bolumData;
  katlar = katData;
  personeller = personelData;

  fakulteLayer = L.geoJSON(fakulteData, {
    onEachFeature: (feature, layer) => {
      const fakulteAdi = feature.properties.ADI || feature.properties.FAKULTE_ADI || "Bilinmeyen Fakülte";
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
              <strong>Personeller:</strong>
              <ul>
                ${personelList.map(p => `<li class="clickable" data-personel='${JSON.stringify(p)}'>${p.AD_SOYAD} (${p.UNVAN || 'Görevli'})</li>`).join("")}
              </ul>
            </div>
          `;
        });
      }

      layer.on('click', () => {
        document.getElementById('infoContent').innerHTML = content;
        lastFakulteBounds = layer.getBounds();
      });

      layer.bindPopup(fakulteAdi);
    },
    style: {
      color: "#0066cc",
      weight: 2,
      fillOpacity: 0.3
    }
  }).addTo(map);

  lastFakulteBounds = fakulteLayer.getBounds();
  map.fitBounds(lastFakulteBounds);
});

// Tema değiştirme
const themeToggle = document.getElementById('themeToggle');
themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
});

// Sekmelere tıklayınca zoom
const tabs = document.querySelectorAll('.menu-tabs .tab');
tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const type = tab.dataset.type;
    if (type === 'fakulte' && lastFakulteBounds) map.fitBounds(lastFakulteBounds);
    else if (type === 'bolum' && lastBolumBounds) map.fitBounds(lastBolumBounds);
    else if (type === 'personel' && lastPersonelBounds) map.fitBounds(lastPersonelBounds);
  });
});

// Personel tıklama → haritada yakınlaştır
const infoPanel = document.getElementById('infoPanel');
infoPanel.addEventListener('click', e => {
  if (e.target.classList.contains('clickable')) {
    const personel = JSON.parse(e.target.dataset.personel);
    const bolum = bolumler.find(b => b.BOLUM_ID === personel.BOLUM_ID);
    if (bolum) {
      const fakulteAdi = bolum.FAKÜLTE_ADI;
      fakulteLayer.eachLayer(layer => {
        const adi = layer.feature.properties.ADI || layer.feature.properties.FAKULTE_ADI;
        if (adi === fakulteAdi) {
          map.fitBounds(layer.getBounds());
          lastPersonelBounds = layer.getBounds();
        }
      });
    }
  }
});
