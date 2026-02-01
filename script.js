const elements = {
  heroTextBox: document.querySelector(".hero__textbox"),
  heroButton: document.querySelector(".hero__button"),
};

const round = (value) => Math.round(value);

// ============================= GEOLOCOCATION =======================================

elements.heroButton.addEventListener("click", handleSearch);

function buildGeolocationURL() {
  const params = new URLSearchParams({ q: elements.heroTextBox.value, format: "jsonv2", limit: 1 });

  console.log(`https://nominatim.openstreetmap.org/search?${params}`);
  return `https://nominatim.openstreetmap.org/search?${params}`;
}

async function fetchGeolocation() {
  const geolocationData = await fetch(buildGeolocationURL());

  if (!geolocationData.ok) {
    throw new Error(`Erro HTTP ${geolocationData.status}`);
  }

  return geolocationData.json();
}

async function handleSearch() {
  try {
    const result = await fetchGeolocation();
    console.log(result);
    extractData(result);
  } catch (error) {
    console.error(`Erro na API: ${error.message} `);
    // SHOW PAGE ERROR
  }
}

async function extractData() {
  const rawData = await fetchGeolocation();
}
