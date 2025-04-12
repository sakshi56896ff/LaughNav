const landmarkLocations = [
  { name: 'Home', label: 'Snore Castle', coords: [28.6139, 77.2090] },
  { name: 'Hospital', label: 'Ouch Palace', coords: [28.6166, 77.2100] },
  { name: 'School', label: 'Mini Human Zoo', coords: [28.6180, 77.2120] },
  { name: 'Mall', label: 'Retail Kingdom', coords: [28.6145, 77.2150] },
  { name: 'Park', label: 'Green Laughterland', coords: [28.6120, 77.2180] },
  { name: 'Market', label: 'Yelling & Smelling Arena', coords: [28.6170, 77.2170] }
];

const landmarkImages = {
  'snorecastle': 'https://via.placeholder.com/40?text=🏠',
  'ouchpalace': 'https://via.placeholder.com/40?text=🏥',
  'minihumanzoo': 'https://via.placeholder.com/40?text=🏫',
  'retailkingdom': 'https://via.placeholder.com/40?text=🛍',
  'greenlaughterland': 'https://via.placeholder.com/40?text=🌳',
  'yelling&smellingarena': 'https://via.placeholder.com/40?text=🛒',
  'theunknownlaughterland': 'https://via.placeholder.com/40?text=❓'
};

const map = L.map('map').setView([28.6139, 77.2090], 14);

L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

landmarkLocations.forEach(({ name, label, coords }) => {
  const key = label.toLowerCase().replace(/\s+/g, '').replace(/[^\w]/g, '');
  const image = landmarkImages[key] || landmarkImages['theunknownlaughterland'];
  L.marker(coords)
    .addTo(map)
    .bindPopup(`<div class="flex items-center">
        <img src="${image}" class="landmark-img" alt="Landmark" />
        <div>${label}</div>
      </div>`)
    .bindTooltip(label, { permanent: true, direction: 'top', offset: [0, -10] });
});

let control = null;

function getFunnyName(place) {
  const lower = place.toLowerCase();
  if (lower.includes('camp')) return 'Snore Castle';
  if (lower.includes('hospital')) return 'Ouch Palace';
  if (lower.includes('school')) return 'Mini Human Zoo';
  if (lower.includes('mall')) return 'Retail Kingdom';
  if (lower.includes('park')) return 'Green Laughterland';
  if (lower.includes('market')) return 'Yelling & Smelling Arena';
  return 'The Unknown Laughter Land';
}

function getFunnyQuote(start, end) {
  const s = getFunnyName(start);
  const e = getFunnyName(end);
  const lines = [
    `From ${s} to ${e} — a journey of giggles awaits! 🤣`,
    `You're off from ${s} to ${e}. Pack your jokes! 🎒😜`,
    `Leaving ${s}? Buckle up, you're heading toward hilarity at ${e}! 😂`
  ];
  return lines[Math.floor(Math.random() * lines.length)];
}

async function geocode(place) {
  const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(place)}`);
  const data = await response.json();
  if (data.length === 0) throw new Error("Location not found");
  return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
}

async function searchRoute() {
  const startPlace = document.getElementById('start').value;
  const endPlace = document.getElementById('end').value;

  if (!startPlace || !endPlace) {
    alert("Please enter both start and end locations 😄");
    return;
  }

  try {
    const [startCoords, endCoords] = await Promise.all([
      geocode(startPlace),
      geocode(endPlace)
    ]);

    if (control !== null) {
      map.removeControl(control);
    }

    control = L.Routing.control({
      waypoints: [
        L.latLng(startCoords[0], startCoords[1]),
        L.latLng(endCoords[0], endCoords[1])
      ],
      createMarker: function(i, waypoint) {
        const place = i === 0 ? startPlace : endPlace;
        const label = getFunnyName(place);
        const imageKey = label.toLowerCase().replace(/\s+/g, '').replace(/[^\w]/g, '');
        const image = landmarkImages[imageKey] || landmarkImages['theunknownlaughterland'];

        return L.marker(waypoint.latLng).bindPopup(`
          <div class="flex items-center">
            <img src="${image}" class="landmark-img" alt="Landmark">
            <div>${i === 0 ? 'Start' : 'End'}: ${label}</div>
          </div>
        `);
      },
      show: false
    }).addTo(map);

    document.getElementById("funnyQuote").innerText = getFunnyQuote(startPlace, endPlace);

  } catch (error) {
    alert("Oops! Couldn't find that place. Try something else 😅");
  }
}
