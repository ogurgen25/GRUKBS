
const map = L.map('map').setView([39.750, 39.500], 17);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 22,
  attribution: '© OpenStreetMap'
}).addTo(map);

// JSON veri kaynakları
let bolumler = [], katlar = [], personeller = [];

// JSON verilerini oku
Promise.all([
  fetch('data/bolumler.json').then(res => res.json()),
  fetch('data/katlar.json').then(res => res.json()),
  fetch('data/personel.json').then(res => res.json())
]).then(([bolumData, katData, personelData]) => {
  bolumler = bolumData;
  katlar = katData;
  personeller = personelData;

  // FAKULTE GeoJSON'u yükle
 fetch('data/FAKULTE.json')
  .then(res => res.json())
  .then(fakulteData => {
    const fakulteLayer = L.geoJSON(fakulteData);
    map.fitBounds(fakulteLayer.getBounds()); // 🔥 HARİTA FAKÜLTE ÜZERİNDE AÇILIR

    fakulteLayer.eachLayer(layer => {
      const fakulteAdi = layer.feature.properties.ADI || "Bilinmeyen Fakülte";
      ...
      layer.bindPopup(fakulteAdi);
    });

    fakulteLayer.addTo(map);
  });

          // Bu fakülteye ait bölümler
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
                    ${personelList.map(p => `<li>${p.AD_SOYAD} (${p.UNVAN || 'Görevli'})</li>`).join("")}
                  </ul>
                </div>
              `;
            });
          }

          layer.bindPopup(content, { maxHeight: 300 });
        },
        style: {
          color: "#0066cc",
          weight: 2,
          fillOpacity: 0.3
        }
      }).addTo(map);

      // Tüm fakülteleri kapsayacak şekilde haritayı otomatik yakınlaştır
      map.fitBounds(geojsonLayer.getBounds());
    });
});
