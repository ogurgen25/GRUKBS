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
          const bolumlerInFakulte = bolumler.filter(b => b.FAKÜLTE_ADI === fakulteAdi);

          let content = `<h3>${fakulteAdi}</h3>`;

          if (bolumlerInFakulte.length === 0) {
            content += "<p>Hiç bölüm kaydı yok.</p>";
          } else {
            bolumlerInFakulte.forEach(bolum => {
              const kat = katlar.find(k => k.KAT_ID === bolum.KAT_ID);
              const personelList = personeller.filter(p => p.BOLUM_ID === bolum.BOLUM_ID);
              content += `
                <div class="person-card">
                  <strong>Bölüm:</strong> <span class="clickable" onclick="zoomToFakulte('${fakulteAdi}')">${bolum.BOLUM_ADI}</span><br>
                  <strong>Kat:</strong> ${kat ? kat.KAT_ADI : "Belirsiz"}<br>
                  <strong>Bölüm Başkanı:</strong> ${bolum.BOLUM_BASKANI || "Yok"}<br>
                  <strong>Personeller:</strong>
                  <ul>
                    ${personelList.map(p => `<li class="clickable" onclick="showPersonelDetail(${p.PERSONEL_ID})">${p.AD_SOYAD} (${p.UNVAN || 'Görevli'})</li>`).join("")}
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

      map.fitBounds(geojsonLayer.getBounds());

      // Kat filtreleri
      const katSelect = document.getElementById('katFilter');
      const uniqueKatlar = [...new Set(katlar.map(k => k.KAT_ADI))];
      uniqueKatlar.forEach(kat => {
        const opt = document.createElement('option');
        opt.value = kat;
        opt.textContent = kat;
        katSelect.appendChild(opt);
      });

      katSelect.addEventListener('change', () => {
        const selectedKat = katSelect.value;
        if (!selectedKat) return geojsonLayer.setStyle({ fillOpacity: 0.3 });

        geojsonLayer.setStyle(feature => {
          const fakulteAdi = feature.properties.ADI || feature.properties.FAKULTE_ADI;
          const ilgiliBolumler = bolumler.filter(b => b.FAKÜLTE_ADI === fakulteAdi);
          const katUyumlu = ilgiliBolumler.some(b => {
            const katObj = katlar.find(k => k.KAT_ID === b.KAT_ID);
            return katObj && katObj.KAT_ADI === selectedKat;
          });
          return {
            fillOpacity: katUyumlu ? 0.5 : 0.1,
            color: katUyumlu ? '#0099ff' : '#999'
          };
        });
      });
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

function showPersonelDetail(id) {
  const personel = personeller.find(p => p.PERSONEL_ID === id);
  if (!personel) return alert("Personel bilgisi bulunamadı.");

  const content = `
    <div style="font-family:sans-serif;">
      <h3>${personel.AD_SOYAD}</h3>
      <p><strong>Unvan:</strong> ${personel.UNVAN || 'Bilinmiyor'}</p>
      <p><strong>E-posta:</strong> ${personel.EMAIL || '-'}</p>
      <p><strong>Telefon:</strong> ${personel.TELEFON || '-'}</p>
      <p><strong>Oda No:</strong> ${personel.ODA_NO || '-'}</p>
      <p><strong>Durum:</strong> ${personel.DURUM || '-'}</p>
    </div>
  `;
  L.popup()
    .setLatLng(map.getCenter())
    .setContent(content)
    .openOn(map);
}
