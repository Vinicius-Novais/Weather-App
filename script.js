const elements = {
  heroTextBox: document.querySelector(".hero__textbox"),
  heroButton: document.querySelector(".hero__button"),
};
const coordinates = [];
const round = (value) => Math.round(value);

// ============================= GEOLOCOCATION =======================================

elements.heroButton.addEventListener("click", loadGeolocation);
// elements.heroButton.addEventListener("click", loadWeather);

function buildGeolocationURL() {
  const params = new URLSearchParams({
    q: elements.heroTextBox.value,
    format: "jsonv2",
    limit: 1,
    addressdetails: 1,
  });

  return `https://nominatim.openstreetmap.org/search?${params}`;
}

async function fetchGeolocationAPI() {
  const geoData = await fetch(buildGeolocationURL());

  if (!geoData.ok) {
    throw new Error(`Erro HTTP ${geoData.status}`);
  }

  return geoData.json();
}

async function loadGeolocation() {
  try {
    const geoJson = await fetchGeolocationAPI();
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

function extractGeolocationData(rawData) {
  const lat = rawData[0].lat;
  const lon = rawData[0].lon;
  const place = rawData[0].name;

  coordinates[0] = lat;
  coordinates[1] = lon;

  loadWeather();
  updateLocationInfo(rawData);
}

// =================================== WEATHER ========================================

function buildWeatherURL(lat, lon) {
  const params = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    daily: "weather_code,temperature_2m_max,temperature_2m_min",
    hourly: "temperature_2m,weather_code",
    current: "temperature_2m,weather_code,relative_humidity_2m,apparent_temperature,is_day,precipitation,wind_speed_10m",
    timezone: "auto",
  });

  console.log(`Passando URL com a lat e lon: https://api.open-meteo.com/v1/forecast?${params}`);
  return `https://api.open-meteo.com/v1/forecast?${params}`;
}

async function fetchWeatherAPI() {
  const weatherData = await fetch(buildWeatherURL(coordinates[0], coordinates[1]));

  if (!weatherData.ok) {
    throw Error("Erro HTTP: " + weatherData.status);
  }

  return weatherData.json();
}

async function loadWeather() {
  try {
    const weatherJson = await fetchWeatherAPI();

    extractWeatherData(weatherJson);
  } catch (error) {
    console.log(error);
    showerror();
  }
}

function updateLocationInfo(rawData) {
  const city = rawData[0].address.municipality;
  const state = rawData[0].address.state;
  const country = rawData[0].address.country;
  const hamlet = rawData[0].address.hamlet;

  console.log(city);
  console.log(state);
  console.log(country);

  const location = document.querySelector(".current__city");

  location.textContent = hamlet ? `${hamlet}, ${state}` : `${city}, ${state}`;

  if (hamlet) {
    return `${hamlet}, ${state}`;
  }
}
function extractWeatherData(rawData) {
  // ========================================= CURRENT SECTION ========================================
  const currentData = {
    temperature: round(rawData.current.temperature_2m),
    feelsLike: round(rawData.current.apparent_temperature),
    humidity: rawData.current.relative_humidity_2m,
    wind: round(rawData.current.wind_speed_10m),
    precipitation: round(rawData.current.precipitation),
    isDay: rawData.current.is_day,
  };

  const current = document.querySelector(".current");

  const currentElements = {
    temperature: current.querySelector('[data-condition="temp"]'),
    feelsLike: current.querySelector('[data-condition="feelsLike"]'),
    humidity: current.querySelector('[data-condition="humidity"]'),
    wind: current.querySelector('[data-condition="wind"]'),
    precipitation: current.querySelector('[data-condition="precipitation"]'),
  };

  currentElements.temperature.textContent = currentData.temperature + "\u00B0";
  currentElements.feelsLike.textContent = currentData.feelsLike + "\u00B0";
  currentElements.humidity.textContent = currentData.humidity + "%";
  currentElements.wind.textContent = currentData.wind + " km/h";
  currentElements.precipitation.textContent = currentData.precipitation + " mm";

  //===================================== DAILY SECTION ============================================

  const today = new Date().getDay();
  const maxTempApi = rawData.daily.temperature_2m_max;
  const minTempApi = rawData.daily.temperature_2m_min;

  const daily = document.querySelector(".daily");

  const maxTempElements = daily.querySelectorAll("[data-maxTemp]");

  const minTempElements = daily.querySelectorAll("[data-minTemp]");

  const days = daily.querySelectorAll("[data-day]");

  const daysArr = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  for (let i = 0; i < 7; i++) {
    const indexHTML = (today + i) % 7;

    maxTempElements[i].textContent = Math.round(maxTempApi[i]) + "\u00B0";

    minTempElements[i].textContent = Math.round(minTempApi[i]) + "\u00B0";

    days[i].textContent = daysArr[indexHTML];
  }
}
