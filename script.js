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

  // const placeElement = document.querySelector(".current__city");

  // placeElement.textContent = place;
  // console.log(coordinates);
  loadWeather();
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

function extractWeatherData(rawData) {
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

  const date = new Date();

  // const API = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

  const maxTemp = rawData.daily.temperature_2m_max;

  console.log(maxTemp);

  const dailyData = {};

  const daily = document.querySelector(".daily");

  const daysOftheWeek = [
    { 1: daily.querySelector('[data-day="mon"]') },
    { 2: daily.querySelector('[data-day="tue"]') },
    { 3: daily.querySelector('[data-day="wed"]') },
    { 4: daily.querySelector('[data-day="thu"]') },
    { 5: daily.querySelector('[data-day="fri"]') },
    { 6: daily.querySelector('[data-day="sat"]') },
    { 7: daily.querySelector('[data-day="sun"]') },
  ];

  console.log(daysOftheWeek[0]);

  const arr = [];
  for (let i = 0; i < rawData.daily.temperature_2m_max.length; i++) {
    arr.push((date.getDay() + i) % 7);
  }
  console.log(arr);

  daysOftheWeek.mon;
}
