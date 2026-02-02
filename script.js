const elements = {
  heroTextBox: document.querySelector(".hero__textbox"),
  heroButton: document.querySelector(".hero__button"),
};

const round = (value) => Math.round(value);

// ============================= GEOLOCOCATION =======================================

elements.heroButton.addEventListener("click", loadGeolocation);

function buildGeolocationURL() {
  const params = new URLSearchParams({
    q: elements.heroTextBox.value,
    format: "jsonv2",
    limit: 1,
  });

  return `https://nominatim.openstreetmap.org/search?${params}`;
}

async function fetchGeolocation() {
  const geoData = await fetch(buildGeolocationURL());

  if (!geoData.ok) {
    throw new Error(`Erro HTTP ${geoData.status}`);
  }

  return geoData.json();
}

async function loadGeolocation() {
  try {
    const geoJson = await fetchGeolocation();
    console.log(geoJson);
    extractGeolocationData(geoJson);
  } catch (error) {
    console.error(`Erro na API: ${error.message} `);
    showerror(error);
  }
}

function showerror(error) {
  console.log("ERRO: " + error.message);
}

async function extractGeolocationData(rawData) {
  const lat = rawData[0].lat;
  const lon = rawData[0].lon;

  buildWeatherURL(lat, lon);
}

// =================================== WEATHER ========================================

function buildWeatherURL() {}
