const map = L.map("map", {
  center: [40.915297, 38.321793],
  zoom: 18,
  maxBounds: [
    [40.912, 38.318],
    [40.918, 38.325],
  ],
  maxBoundsViscosity: 1.0,
});

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 22,
  attribution: "© OpenStreetMap",
}).addTo(map);

let bolumler = [],
  katlar = [],
  personeller = [],
  fakulteLayer;

const infoContent = document.getElementById("infoContent");

// Tema Değişimi
document.getElementById("themeToggle").addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
});

// JSON'ları Yükle
Promise.all([
  fetch("data/bolumler.json").then((res) => res.json()),
  fetch("data/katlar.json").then((res) => res.json()),
  fetch("data/personel.json").then((res) => res.json()),
  fetch("data/FAKULTE.json").then((res) => res.json()),
]).then(([bolumData, katData, personelData, fakulteData]) => {
  bolumler = bolumData;
  katlar = katData;
  personeller = personelData;

  fakulteLayer = L.geoJSON(fakulteData, {
    onEachFeature: (feature, layer) => {
      const fakulteAdi = feature.properties.ADI || "Bilinmeyen Fakülte";
      const bolumlerInFakulte = bolumler.filter(
        (b) => b.FAKÜLTE_ADI === fakulteAdi
      );

      let html = `<h3>${fakulteAdi}</h3>`;

      bolumlerInFakulte.forEach((bolum) => {
        const kat = katlar.find((k) => k.KAT_ID === bolum.KAT_ID);
        const personelList = personeller.filter(
          (p) => p.BOLUM_ID === bolum.BOLUM_ID
        );

        html += `
          <div style="margin-top:10px; padding:10px; border-left:4px solid #007bff; background:#f9f9f9; border-radius:6px;">
            <strong>Bölüm:</strong> <span class="clickable" onclick="zoomToFakulte('${fakulteAdi}')">${bolum.BOLUM_ADI}</span><br>
            <strong>Kat:</strong> ${kat ? kat.KAT_ADI : "Bilinmiyor"}<br>
            <strong>Başkan:</strong> ${bolum.BOLUM_BASKANI || "Yok"}
            <ul style="margin-top:5px;">
              ${personelList
                .map(
                  (p) =>
                    `<li class="clickable" onclick="showPersonel('${p.AD_SOYAD}', '${p.UNVAN}', '${fakulteAdi}')">${p.AD_SOYAD}</li>`
                )
                .join("")}
            </ul>
          </div>
        `;
      });

      layer.on("click", () => {
        infoContent.innerHTML = html;
      });

      layer.bindPopup(fakulteAdi);
    },
    style: {
      color: "#0066cc",
      weight: 2,
      fillOpacity: 0.3,
    },
  }).addTo(map);

  map.fitBounds(fakulteLayer.getBounds());

  // Kat filtrele
  const katSelect = document.getElementById("katFilter");
  katlar.forEach((k) => {
    const opt = document.createElement("option");
    opt.value = k.KAT_ID;
    opt.textContent = k.KAT_ADI;
    katSelect.appendChild(opt);
  });
});

// Filtre ile arama
document.getElementById("searchInput").addEventListener("input", function () {
  const val = this.value.toLowerCase();
  const results = [];

  bolumler.forEach((b) => {
    if (b.BOLUM_ADI.toLowerCase().includes(val)) {
      results.push(b);
    }
  });

  const html = results
    .map((b) => {
      const fakulte = b.FAKÜLTE_ADI;
      return `<div class="person-card" onclick="zoomToFakulte('${fakulte}')">
        <strong>${b.BOLUM_ADI}</strong><br>
        Fakülte: ${fakulte}
      </div>`;
    })
    .join("");

  infoContent.innerHTML = html || "Eşleşme bulunamadı.";
});

// Zoom için dış fonksiyon
function zoomToFakulte(fakulteAdi) {
  fakulteLayer.eachLayer((layer) => {
    const adi = layer.feature.properties.ADI;
    if (adi === fakulteAdi) {
      map.fitBounds(layer.getBounds());
      layer.openPopup();
    }
  });
}

// Personel Detayı Göster
function showPersonel(adSoyad, unvan, fakulteAdi) {
  infoContent.innerHTML = `
    <div class="person-card">
      <h3>${adSoyad}</h3>
      <p><strong>Unvan:</strong> ${unvan}</p>
      <p><strong>Fakülte:</strong> ${fakulteAdi}</p>
    </div>
  `;
  zoomToFakulte(fakulteAdi);
}
