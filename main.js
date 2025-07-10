
const map = L.map('map').setView([39.75, 39.49], 17); // Erzincan örnek konum
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Katman listesi
const layers = [
    "FAKULTE.json",
    "CAMİ_Project_FeaturesToJSON.json",
    "KUTUPHANE_Project_FeaturesTo.json",
    "BANKAMATIK_Project_FeaturesT.json",
    "GUVENLIK_Project_FeaturesToJ.json",
    "KAPI_GIRIS_Project_FeaturesT.json",
    "LABORATUVAR_Project_Features.json",
    "SPOR_SALONU_Project_Features.json",
    "YEMEKHANE_Project_FeaturesTo.json",
    "YESILALAN_Project_FeaturesTo.json",
    "YOL_Project_FeaturesToJSON.json",
    "AGAC_Project_FeaturesToJSON.json",
    "LOJMAN_Project_FeaturesToJSO.json",
    "REKTORLUK_Project_FeaturesTo.json",
    "UNIVERSITE_BIRIMLER_Project_.json"
];

layers.forEach(file => {
    fetch("data/" + file)
        .then(res => res.json())
        .then(data => {
            L.geoJSON(data, {
                onEachFeature: function (feature, layer) {
                    let props = feature.properties;
                    let content = "<b>Bilgi:</b><br/>";
                    for (let key in props) {
                        content += `<b>${key}</b>: ${props[key]}<br/>`;
                    }
                    layer.bindPopup(content);
                },
                style: {
                    color: "#004466",
                    weight: 1,
                    fillColor: "#33aaff",
                    fillOpacity: 0.5
                },
                pointToLayer: function (feature, latlng) {
                    return L.circleMarker(latlng, {
                        radius: 5,
                        fillColor: "#ff6600",
                        color: "#000",
                        weight: 1,
                        opacity: 1,
                        fillOpacity: 0.8
                    });
                }
            }).addTo(map);
        });
});
