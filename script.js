const elements = {
  heroTextBox: document.querySelector(".hero__textbox"),
  heroButton: document.querySelector(".hero__button"),
};
const coordinates = [-23.5506507, -46.6333824];
const round = (value) => Math.round(value);

init();

async function init() {
  try {
    const weatherJson = await fetchWeatherAPI();
    const currentData = weatherJson.current;

    isDay(currentData);
    setDate(weatherJson);

    // seta a tempertarura do current
    document.querySelector('[data-condition="temp"]').textContent = round(weatherJson.current.temperature_2m) + "\u00B0";
    // seta o nome da cidade default
    document.querySelector(".current__city").textContent = "São Paulo, Brasil";
  } catch (error) {
    console.error(`Erro na API: ${error.message} `);
    errorPage(error);
  }
}

function setDate(weatherJson) {
  const now = new Date();
  const currentDateElement = document.querySelector(".current__date");

  const formattedDate = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: weatherJson.timezone,
  }).format(now);

  currentDateElement.textContent = formattedDate;
}

function isDay(currentData) {
  const imgElement = document.querySelector(".current__icon");

  currentData.is_day ? (imgElement.src = "assets/images/sunny.svg") : (imgElement.src = "assets/images/moon-svgrepo-com.svg");
}

// ============================= GEOLOCOCATION =======================================

elements.heroButton.addEventListener("click", loadGeolocation);

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
    errorPage(error);
  }
}

function errorPage(error) {
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

    updateWeatherUI(weatherJson);
  } catch (error) {
    console.log(error);
    showerror();
  }
}

function updateLocationInfo(rawData) {
  const addressData = rawData[0].address;

  const addressType = rawData[0].addresstype;
  const state = addressData.state;
  const country = addressData.country;
  const place = rawData[0].address[addressType];

  console.log("Has state: " + Object.hasOwn(addressData, "state"));
  console.log("Has country: " + Object.hasOwn(addressData, "country"));

  const location = document.querySelector(".current__city");

  // if (Object.hasOwn(addressData, "state")) {

  //   location.textContent = place + ", " + state;

  //   if(addressData.state === addressData.country)  {

  //   }
  // } else if (Object.hasOwn(addressData, "country")) {
  //   location.textContent = place + ", " + country;
  // }

  location.textContent = addressType === "state" ? `${place} , ${country}` : `${place} , ${state}`;
}

function updateWeatherUI(rawData) {
  // ========================================= CURRENT SECTION ========================================
  const currentData = formatCurrentData(rawData);
  renderCurrentData(currentData);
  //===================================== DAILY SECTION ============================================
  renderDailyData(rawData);
  // ===================================== HOURLY SECTION ============================================

  // const currentHour = new Date().getHours();
  // const hourlyData = rawData.hourly.temperature_2m;
  // const weatherCode = rawData.hourly.weather_code;

  // const hourly = [];

  // for (i = 0; i <= 24; i++) {
  //   hourly[i] = hourlyData[i + currentHour];
  // }

  // console.log(currentHour);
  // console.log(hourlyData);
  // console.log(hourly);

  renderHourlyData(rawData);
}

function formatCurrentData(rawData) {
  const currentData = {
    temperature: round(rawData.current.temperature_2m),
    feelsLike: round(rawData.current.apparent_temperature),
    humidity: rawData.current.relative_humidity_2m,
    wind: round(rawData.current.wind_speed_10m),
    precipitation: round(rawData.current.precipitation),
    is_day: rawData.current.is_day,
    timezone: rawData.timezone,
  };
  return currentData;
}

function renderCurrentData(currentData) {
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

  isDay(currentData);
  setDate(currentData);
}

function renderDailyData(rawData) {
  const daysArr = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const formattedDay = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    timeZone: rawData.timezone,
  }).format(new Date());

  let today;

  for (i = 0; i < daysArr.length; i++) {
    if (daysArr[i] === formattedDay) {
      today = i;
    }
  }

  console.log(today);
  const maxTempApi = rawData.daily.temperature_2m_max;
  const minTempApi = rawData.daily.temperature_2m_min;

  const daily = document.querySelector(".daily");

  const maxTempElements = daily.querySelectorAll("[data-maxTemp]");

  const minTempElements = daily.querySelectorAll("[data-minTemp]");

  const days = daily.querySelectorAll("[data-day]");

  for (let i = 0; i < 7; i++) {
    const indexHTML = (today + i) % 7;

    maxTempElements[i].textContent = Math.round(maxTempApi[i]) + "\u00B0";

    minTempElements[i].textContent = Math.round(minTempApi[i]) + "\u00B0";

    days[i].textContent = daysArr[indexHTML];
  }
}

function renderHourlyData(rawData) {
  const weatherCode = rawData.hourly.weather_code;
  const hourlyData = rawData.hourly.temperature_2m;

  const days = [
    { day: " ", temp: [], code: [] },
    { day: "tue", temp: [], code: [] },
    { day: "wed", temp: [], code: [] },
    { day: "thu", temp: [], code: [] },
    { day: "fry", temp: [], code: [] },
    { day: "sat", temp: [], code: [] },
    { day: "sun", temp: [], code: [] },
  ];

  let startPosition = 0;
  for (i = 0; i < 7; i++) {
    for (j = 0; j < 24; j++) {
      days[i].temp[j] = hourlyData[j + startPosition];
      days[i].code[j] = weatherCode[j + startPosition];
    }

    startPosition = startPosition + 24;
  }
}
