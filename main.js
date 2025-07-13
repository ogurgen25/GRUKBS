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
  noWrap: true, // bu önemli
  maxZoom: 22,
  minZoom: 16
}).addTo(map);

// JSON Veri Kaynakları
let bolumler = [], katlar = [], personeller = [];

Promise.all([
  fetch('data/bolumler.json').then(res => res.json()),
  fetch('data/katlar.json').then(res => res.json()),
  fetch('data/personel.json').then(res => res.json())
]).then(([bolumData, katData, personelData]) => {
  bolumler = bolumData;
  katlar = katData;
  personeller = personelData;

  // Fakülte Katmanını Yükle
  fetch('data/FAKULTE.json')
    .then(res => res.json())
    .then(fakulteData => {
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

      map.fitBounds(geojsonLayer.getBounds());
    });
});

// Personel Detaylarını Gösteren Açılır Pencere
function showPersonelDetail(adSoyad, unvan, email, telefon) {
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



fetch("data/LABORATUVARR_FeaturesToJSON1.json")
  .then(response => response.json())
  .then(data => {
    L.geoJSON(data, {
      style: {
        color: "#1f77b4",
        weight: 2,
        fillOpacity: 0.6
      },
      onEachFeature: function (feature, layer) {
        let name = feature.properties.ADI || feature.properties.FAKULTE_ADI || feature.properties.BOLUM_ADI || "Yapı";
        layer.bindTooltip(name, {
          permanent: true,
          direction: 'center',
          className: 'label-inside'
        });
      }
    }).addTo(map);
  });


fetch("data/KAPI_GİRİS.json")
  .then(response => response.json())
  .then(data => {
    L.geoJSON(data, {
      style: {
        color: "#ff7f0e",
        weight: 2,
        fillOpacity: 0.6
      },
      onEachFeature: function (feature, layer) {
        let name = feature.properties.ADI || feature.properties.FAKULTE_ADI || feature.properties.BOLUM_ADI || "Yapı";
        layer.bindTooltip(name, {
          permanent: true,
          direction: 'center',
          className: 'label-inside'
        });
      }
    }).addTo(map);
  });


fetch("data/BANKAMATİK_FeaturesToJSON.json")
  .then(response => response.json())
  .then(data => {
    L.geoJSON(data, {
      style: {
        color: "#2ca02c",
        weight: 2,
        fillOpacity: 0.6
      },
      onEachFeature: function (feature, layer) {
        let name = feature.properties.ADI || feature.properties.FAKULTE_ADI || feature.properties.BOLUM_ADI || "Yapı";
        layer.bindTooltip(name, {
          permanent: true,
          direction: 'center',
          className: 'label-inside'
        });
      }
    }).addTo(map);
  });


fetch("data/katlar.json")
  .then(response => response.json())
  .then(data => {
    L.geoJSON(data, {
      style: {
        color: "#d62728",
        weight: 2,
        fillOpacity: 0.6
      },
      onEachFeature: function (feature, layer) {
        let name = feature.properties.ADI || feature.properties.FAKULTE_ADI || feature.properties.BOLUM_ADI || "Yapı";
        layer.bindTooltip(name, {
          permanent: true,
          direction: 'center',
          className: 'label-inside'
        });
      }
    }).addTo(map);
  });


fetch("data/LABORATUVARR_FeaturesToJSON.json")
  .then(response => response.json())
  .then(data => {
    L.geoJSON(data, {
      style: {
        color: "#9467bd",
        weight: 2,
        fillOpacity: 0.6
      },
      onEachFeature: function (feature, layer) {
        let name = feature.properties.ADI || feature.properties.FAKULTE_ADI || feature.properties.BOLUM_ADI || "Yapı";
        layer.bindTooltip(name, {
          permanent: true,
          direction: 'center',
          className: 'label-inside'
        });
      }
    }).addTo(map);
  });


fetch("data/LOJMANLAR_FeaturesToJSON.json")
  .then(response => response.json())
  .then(data => {
    L.geoJSON(data, {
      style: {
        color: "#8c564b",
        weight: 2,
        fillOpacity: 0.6
      },
      onEachFeature: function (feature, layer) {
        let name = feature.properties.ADI || feature.properties.FAKULTE_ADI || feature.properties.BOLUM_ADI || "Yapı";
        layer.bindTooltip(name, {
          permanent: true,
          direction: 'center',
          className: 'label-inside'
        });
      }
    }).addTo(map);
  });


fetch("data/KÜTÜPHANE_FeaturesToJSON.json")
  .then(response => response.json())
  .then(data => {
    L.geoJSON(data, {
      style: {
        color: "#e377c2",
        weight: 2,
        fillOpacity: 0.6
      },
      onEachFeature: function (feature, layer) {
        let name = feature.properties.ADI || feature.properties.FAKULTE_ADI || feature.properties.BOLUM_ADI || "Yapı";
        layer.bindTooltip(name, {
          permanent: true,
          direction: 'center',
          className: 'label-inside'
        });
      }
    }).addTo(map);
  });


fetch("data/bolumler.json")
  .then(response => response.json())
  .then(data => {
    L.geoJSON(data, {
      style: {
        color: "#7f7f7f",
        weight: 2,
        fillOpacity: 0.6
      },
      onEachFeature: function (feature, layer) {
        let name = feature.properties.ADI || feature.properties.FAKULTE_ADI || feature.properties.BOLUM_ADI || "Yapı";
        layer.bindTooltip(name, {
          permanent: true,
          direction: 'center',
          className: 'label-inside'
        });
      }
    }).addTo(map);
  });


fetch("data/REKTÖRLÜK_FeaturesToJSON.json")
  .then(response => response.json())
  .then(data => {
    L.geoJSON(data, {
      style: {
        color: "#bcbd22",
        weight: 2,
        fillOpacity: 0.6
      },
      onEachFeature: function (feature, layer) {
        let name = feature.properties.ADI || feature.properties.FAKULTE_ADI || feature.properties.BOLUM_ADI || "Yapı";
        layer.bindTooltip(name, {
          permanent: true,
          direction: 'center',
          className: 'label-inside'
        });
      }
    }).addTo(map);
  });


fetch("data/FAKULTE.json")
  .then(response => response.json())
  .then(data => {
    L.geoJSON(data, {
      style: {
        color: "#17becf",
        weight: 2,
        fillOpacity: 0.6
      },
      onEachFeature: function (feature, layer) {
        let name = feature.properties.ADI || feature.properties.FAKULTE_ADI || feature.properties.BOLUM_ADI || "Yapı";
        layer.bindTooltip(name, {
          permanent: true,
          direction: 'center',
          className: 'label-inside'
        });
      }
    }).addTo(map);
  });


fetch("data/ÜNİVERSİTE_BIRIMLER_Features.json")
  .then(response => response.json())
  .then(data => {
    L.geoJSON(data, {
      style: {
        color: "#a93226",
        weight: 2,
        fillOpacity: 0.6
      },
      onEachFeature: function (feature, layer) {
        let name = feature.properties.ADI || feature.properties.FAKULTE_ADI || feature.properties.BOLUM_ADI || "Yapı";
        layer.bindTooltip(name, {
          permanent: true,
          direction: 'center',
          className: 'label-inside'
        });
      }
    }).addTo(map);
  });


fetch("data/GÜVENLİK_FeaturesToJSON.json")
  .then(response => response.json())
  .then(data => {
    L.geoJSON(data, {
      style: {
        color: "#27ae60",
        weight: 2,
        fillOpacity: 0.6
      },
      onEachFeature: function (feature, layer) {
        let name = feature.properties.ADI || feature.properties.FAKULTE_ADI || feature.properties.BOLUM_ADI || "Yapı";
        layer.bindTooltip(name, {
          permanent: true,
          direction: 'center',
          className: 'label-inside'
        });
      }
    }).addTo(map);
  });


fetch("data/SPOR_SALONUU_FeaturesToJSON.json")
  .then(response => response.json())
  .then(data => {
    L.geoJSON(data, {
      style: {
        color: "#f39c12",
        weight: 2,
        fillOpacity: 0.6
      },
      onEachFeature: function (feature, layer) {
        let name = feature.properties.ADI || feature.properties.FAKULTE_ADI || feature.properties.BOLUM_ADI || "Yapı";
        layer.bindTooltip(name, {
          permanent: true,
          direction: 'center',
          className: 'label-inside'
        });
      }
    }).addTo(map);
  });


fetch("data/personel.json")
  .then(response => response.json())
  .then(data => {
    L.geoJSON(data, {
      style: {
        color: "#2980b9",
        weight: 2,
        fillOpacity: 0.6
      },
      onEachFeature: function (feature, layer) {
        let name = feature.properties.ADI || feature.properties.FAKULTE_ADI || feature.properties.BOLUM_ADI || "Yapı";
        layer.bindTooltip(name, {
          permanent: true,
          direction: 'center',
          className: 'label-inside'
        });
      }
    }).addTo(map);
  });


fetch("data/YESİLALAN_FeaturesToJSON.json")
  .then(response => response.json())
  .then(data => {
    L.geoJSON(data, {
      style: {
        color: "#1f77b4",
        weight: 2,
        fillOpacity: 0.6
      },
      onEachFeature: function (feature, layer) {
        let name = feature.properties.ADI || feature.properties.FAKULTE_ADI || feature.properties.BOLUM_ADI || "Yapı";
        layer.bindTooltip(name, {
          permanent: true,
          direction: 'center',
          className: 'label-inside'
        });
      }
    }).addTo(map);
  });


fetch("data/YOL_AGI.json")
  .then(response => response.json())
  .then(data => {
    L.geoJSON(data, {
      style: {
        color: "#ff7f0e",
        weight: 2,
        fillOpacity: 0.6
      },
      onEachFeature: function (feature, layer) {
        let name = feature.properties.ADI || feature.properties.FAKULTE_ADI || feature.properties.BOLUM_ADI || "Yapı";
        layer.bindTooltip(name, {
          permanent: true,
          direction: 'center',
          className: 'label-inside'
        });
      }
    }).addTo(map);
  });


fetch("data/YEMEKHANEE_FeaturesToJSON.json")
  .then(response => response.json())
  .then(data => {
    L.geoJSON(data, {
      style: {
        color: "#2ca02c",
        weight: 2,
        fillOpacity: 0.6
      },
      onEachFeature: function (feature, layer) {
        let name = feature.properties.ADI || feature.properties.FAKULTE_ADI || feature.properties.BOLUM_ADI || "Yapı";
        layer.bindTooltip(name, {
          permanent: true,
          direction: 'center',
          className: 'label-inside'
        });
      }
    }).addTo(map);
  });
