// Ana harita başlatma
const map = L.map('map', {
  center: [40.915297, 38.321793],
  zoom: 18,
  maxBounds: [
    [40.912, 38.318],
    [40.918, 38.325]
  ],
  maxBoundsViscosity: 1.0
});

// OSM katmanı
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 22,
  attribution: '© OpenStreetMap'
}).addTo(map);

// Veri tutucular
let bolumler = [], katlar = [], personeller = [], fakulteKatmani;

// Kat filtreleme dropdown
const katFilter = document.getElementById('katFilter');

// JSON verileri yükleniyor
Promise.all([
  fetch('data/bolumler.json').then(res => res.json()),
  fetch('data/katlar.json').then(res => res.json()),
  fetch('data/personel.json').then(res => res.json())
]).then(([bolumData, katData, personelData]) => {
  bolumler = bolumData;
  katlar = katData;
  personeller = personelData;

  // Kat filtrelerini doldur
  const uniqueKatlar = [...new Set(katlar.map(k => k.KAT_ADI))];
  uniqueKatlar.forEach(k => {
    const opt = document.createElement('option');
    opt.value = k;
    opt.textContent = k;
    katFilter.appendChild(opt);
  });

  // Fakülte katmanını yükle
  fetch('data/FAKULTE.json')
    .then(res => res.json())
    .then(fakulteData => {
      fakulteKatmani = L.geoJSON(fakulteData, {
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
                <div style="margin-top:10px; padding:8px; border:1px solid #ccc; border-radius:8px; background:#f9f9f9;">
                  <strong>Bölüm:</strong> <span class="clickable" onclick="highlightFakulte('${fakulteAdi}')">${bolum.BOLUM_ADI}</span><br>
                  <strong>Kat:</strong> ${kat ? kat.KAT_ADI : "Belirsiz"}<br>
                  <strong>Bölüm Başkanı:</strong> ${bolum.BOLUM_BASKANI || "Yok"}<br>
                  <strong>Personeller:</strong>
                  <ul style="margin-left:20px;">
                    ${personelList.map(p => `<li class="clickable" onclick="zoomToPersonel('${p.AD_SOYAD}', '${fakulteAdi}')">${p.AD_SOYAD} (${p.UNVAN || 'Görevli'})</li>`).join("")}
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

// Tema değiştirici
const themeToggle = document.getElementById('themeToggle');
themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
});

// Haritada fakülteyi öne çıkartma fonksiyonu
function highlightFakulte(fakulteAdi) {
  if (!fakulteKatmani) return;
  fakulteKatmani.eachLayer(layer => {
    const props = layer.feature.properties;
    const adi = props.ADI || props.FAKULTE_ADI;
    if (adi === fakulteAdi) {
      map.fitBounds(layer.getBounds());
      layer.openPopup();
    }
  });
}

// Personel tıklanınca haritada fakülteye gitme fonksiyonu
function zoomToPersonel(adSoyad, fakulteAdi) {
  highlightFakulte(fakulteAdi);
}
