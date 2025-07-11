// main.js

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

let bolumler = [], katlar = [], personeller = [], fakulteLayer;

Promise.all([
  fetch('data/bolumler.json').then(res => res.json()),
  fetch('data/katlar.json').then(res => res.json()),
  fetch('data/personel.json').then(res => res.json())
]).then(([bolumData, katData, personelData]) => {
  bolumler = bolumData;
  katlar = katData;
  personeller = personelData;

  // Kat filtresi oluştur
  katlar.forEach(k => {
    const option = document.createElement('option');
    option.value = k.KAT_ID;
    option.textContent = k.KAT_ADI;
    document.getElementById('katFilter').appendChild(option);
  });

  fetch('data/FAKULTE.json')
    .then(res => res.json())
    .then(fakulteData => {
      fakulteLayer = L.geoJSON(fakulteData, {
        onEachFeature: (feature, layer) => {
          const fakulteAdi = feature.properties.ADI || feature.properties.FAKULTE_ADI || "Bilinmeyen Fakülte";
          const bolumlerInFakulte = bolumler.filter(b => b.FAKÜLTE_ADI === fakulteAdi);

          let content = `<h3>${fakulteAdi}</h3>`;
          bolumlerInFakulte.forEach(bolum => {
            const kat = katlar.find(k => k.KAT_ID === bolum.KAT_ID);
            const personelList = personeller.filter(p => p.BOLUM_ID === bolum.BOLUM_ID);
            content += `
              <div style="margin-top:8px; padding:5px; border-top:1px solid #ccc;">
                <strong>Bölüm:</strong> <span class="clickable" onclick="showBolum('${bolum.BOLUM_ID}')">${bolum.BOLUM_ADI}</span><br>
                <strong>Kat:</strong> ${kat ? kat.KAT_ADI : "Belirsiz"}<br>
                <strong>Bölüm Başkanı:</strong> ${bolum.BOLUM_BASKANI || "Yok"}
              </div>
            `;
          });

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

      map.fitBounds(fakulteLayer.getBounds());
    });

  // Arama
  document.getElementById('searchInput').addEventListener('input', function () {
    const term = this.value.toLowerCase();
    fakulteLayer.eachLayer(layer => {
      const adi = layer.feature.properties.ADI || "";
      if (adi.toLowerCase().includes(term)) {
        layer.setStyle({ color: '#ff6600' });
        layer.openPopup();
      } else {
        layer.setStyle({ color: '#0066cc' });
      }
    });
  });

  // Kat Filtresi
  document.getElementById('katFilter').addEventListener('change', function () {
    const selectedKat = this.value;
    let content = '<h3>Kat Filtresi</h3>';
    const bolumFiltered = selectedKat ? bolumler.filter(b => b.KAT_ID == selectedKat) : bolumler;
    content += '<ul>' + bolumFiltered.map(b => `<li class="clickable" onclick="showBolum('${b.BOLUM_ID}')">${b.BOLUM_ADI}</li>`).join('') + '</ul>';
    document.getElementById('infoContent').innerHTML = content;
  });

  // Menü Sekmeleri
  document.querySelectorAll('.menu-tabs .tab').forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.dataset.type;
      let content = '';
      if (type === 'fakulte') {
        const fakulteList = [...new Set(bolumler.map(b => b.FAKÜLTE_ADI))];
        content = '<h3>Fakülteler</h3><ul>' + fakulteList.map(f => `<li>${f}</li>`).join('') + '</ul>';
      } else if (type === 'bolum') {
        content = '<h3>Bölümler</h3><ul>' + bolumler.map(b => `<li class="clickable" onclick="showBolum('${b.BOLUM_ID}')">${b.BOLUM_ADI}</li>`).join('') + '</ul>';
      } else if (type === 'personel') {
        content = '<h3>Personeller</h3><ul>' + personeller.map(p => `<li class="clickable" onclick="showPersonel('${p.PERSONEL_ID}')">${p.AD_SOYAD} (${p.UNVAN || 'Görevli'})</li>`).join('') + '</ul>';
      }
      document.getElementById('infoContent').innerHTML = content;
    });
  });

  // Tema Değiştirici
  document.getElementById('themeToggle').addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
  });
});

// Harici Fonksiyonlar

window.showBolum = function (bolumId) {
  const bolum = bolumler.find(b => b.BOLUM_ID == bolumId);
  if (!bolum) return;
  const kat = katlar.find(k => k.KAT_ID === bolum.KAT_ID);
  const personelList = personeller.filter(p => p.BOLUM_ID === bolum.BOLUM_ID);

  let content = `<h3>${bolum.BOLUM_ADI}</h3>`;
  content += `<strong>Kat:</strong> ${kat ? kat.KAT_ADI : "Belirsiz"}<br>`;
  content += `<strong>Bölüm Başkanı:</strong> ${bolum.BOLUM_BASKANI || "Yok"}<br>`;
  content += `<strong>Personeller:</strong><ul>` + personelList.map(p => `<li class="clickable" onclick="showPersonel('${p.PERSONEL_ID}')">${p.AD_SOYAD}</li>`).join('') + '</ul>';

  document.getElementById('infoContent').innerHTML = content;
};

window.showPersonel = function (personelId) {
  const personel = personeller.find(p => p.PERSONEL_ID == personelId);
  if (!personel) return;

  let content = `<h3>${personel.AD_SOYAD}</h3>`;
  content += `<strong>Ünvan:</strong> ${personel.UNVAN || "Belirsiz"}<br>`;
  content += `<strong>E-posta:</strong> ${personel.EMAIL || "-"}<br>`;
  content += `<strong>Telefon:</strong> ${personel.TELEFON || "-"}<br>`;
  content += `<strong>Oda No:</strong> ${personel.ODA_NO || "-"}<br>`;

  document.getElementById('infoContent').innerHTML = content;
};
