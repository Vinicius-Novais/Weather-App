const elements = {
  heroTextBox: document.querySelector(".hero__textbox"),
  heroButton: document.querySelector(".hero__button"),
};
const coordinates = [-23.5506507, -46.6333824];
const round = (value) => Math.round(value);

const icons = [
  { weather: "/assets/images/icon-sunny.webp", codes: [0, 1] },
  { weather: "/assets/images/icon-partly-cloudy.webp", codes: [2] },
  { weather: "/assets/images/icon-overcast.webp", codes: [3] },
  { weather: "/assets/images/icon-fog.webp", codes: [45, 48] },
  { weather: "/assets/images/icon-drizzle.webp", codes: [51, 53, 55] },
  { weather: "/assets/images/icon-rain.webp", codes: [61, 63, 65, 66, 67, 80, 81, 82] },
  { weather: "/assets/images/icon-snow.webp", codes: [71, 73, 75, 77, 85, 86] },
  { weather: "/assets/images/icon-storm.webp", codes: [95, 96, 99] },
];

const weatherGroups = {};

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
  updateHourlySection(rawData);
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

  for (let i = 0; i < daysArr.length; i++) {
    if (daysArr[i] === formattedDay) {
      today = i;
    }
  }

  const maxTempAPI = rawData.daily.temperature_2m_max;
  const minTempAPI = rawData.daily.temperature_2m_min;

  const daily = document.querySelector(".daily");

  const maxTempElements = daily.querySelectorAll("[data-maxTemp]");

  const minTempElements = daily.querySelectorAll("[data-minTemp]");

  const dayName = daily.querySelectorAll("[data-day]");
  const dayIcon = daily.querySelectorAll(".daily__icon");

  for (let i = 0; i < 7; i++) {
    const indexHTML = (today + i) % 7;

    maxTempElements[i].textContent = round(maxTempAPI[i]) + "\u00B0";

    minTempElements[i].textContent = round(minTempAPI[i]) + "\u00B0";

    dayName[i].textContent = daysArr[indexHTML];
  }

  //======================== ICONES
  const weatherCodeAPI = rawData.daily.weather_code;
  console.log(weatherCodeAPI);

  //
  //   for (let i = 0; i < icons.length; i++) {
  //     console.log(`============================== ${i}`);
  //     for (let j = 0; j < icons[i].codes.length; j++) {
  //       console.log(icons[i].codes[j]);
  //       if (icons[i].codes[j] === weatherCodeAPI[k]) {
  //         dayIcon[k].src = icons[i].weather;
  //       }
  //     }
  //   }}
  // }

  for (let i = 0; i < weatherCodeAPI.length; i++) {
    for (let j = 0; j < icons.length; j++) {
      console.log(`============================== ${j}`);

      if (icons[j].codes.includes(weatherCodeAPI[i])) {
        dayIcon[i].src = icons[j].weather;
      }
    }
  }
}

const weeklyHourlyData = [
  { day: "", temp: [], code: [] },
  { day: "", temp: [], code: [] },
  { day: "", temp: [], code: [] },
  { day: "", temp: [], code: [] },
  { day: "", temp: [], code: [] },
  { day: "", temp: [], code: [] },
  { day: "", temp: [], code: [] },
];

function updateHourlySection(rawData) {
  configureWeekOrder(rawData, weeklyHourlyData);
  populateHourlyData(rawData, weeklyHourlyData);
  renderHourlySection(weeklyHourlyData);
}

function configureWeekOrder(rawData, weeklyHourlyData) {
  const daysArr = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  // Formatar a data de acordo com timezone
  const formattedDay = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    timeZone: rawData.timezone,
  }).format(new Date());

  // Encontrando que dia é hoje com o formattedDay
  let today;

  for (let i = 0; i < daysArr.length; i++) {
    if (daysArr[i] === formattedDay) {
      today = i;
    }
  }

  // Colocando os dias no array de objetos Days começando pelo dia de hoje de acordo com o timezone
  for (let i = 0; i < daysArr.length; i++) {
    const indexHTML = (today + i) % 7;

    weeklyHourlyData[i].day = daysArr[indexHTML];
  }
}

function populateHourlyData(rawData, weeklyHourlyData) {
  const hourlyWeatherCode = rawData.hourly.weather_code;
  const hourlyTemp = rawData.hourly.temperature_2m;

  let dayStartIndex = 0;
  const HOURS_PER_DAY = 24;
  for (let i = 0; i < 7; i++) {
    for (let j = 0; j < 24; j++) {
      weeklyHourlyData[i].temp[j] = hourlyTemp[j + dayStartIndex];
      weeklyHourlyData[i].code[j] = hourlyWeatherCode[j + dayStartIndex];
    }

    // adicionando 24 posições (0-23)
    dayStartIndex = dayStartIndex + HOURS_PER_DAY;
  }
}

function renderHourlySection(weeklyHourlyData) {
  for (let i = 0; i < weeklyHourlyData.length; i++) {
    console.log(`renderHourlyDate: ${weeklyHourlyData[i].day}`);
  }

  // Renderizando DropDown
  let optionsElements = document.querySelectorAll("#ddlDays  option");

  weeklyHourlyData.forEach((element, index) => {
    optionsElements[index].textContent = element.day;
  });

  // Renderizando Temp do dia inicial do array
  const hourlyTemp = document.querySelectorAll(".hourly__temp");

  weeklyHourlyData[0].temp.forEach((element, index) => {
    hourlyTemp[index].textContent = round(element) + "\u00B0";
  });
}

const select = document.getElementById("ddlDays");
select.addEventListener("change", () => updateHourlyByDay(weeklyHourlyData));

function updateHourlyByDay(weeklyHourlyData) {
  console.log(weeklyHourlyData);

  const select = document.getElementById("ddlDays");
  const hourlyTemp = document.querySelectorAll(".hourly__temp");

  // organizando o value do selct com os days
  for (let i = 0; i < 7; i++) {
    select.options[i].value = weeklyHourlyData[i].day;
  }

  for (let i = 0; i < 7; i++) {
    if (select.value === weeklyHourlyData[i].day) {
      for (let j = 0; j < 24; j++) {
        hourlyTemp[j].textContent = round(weeklyHourlyData[i].temp[j]) + "\u00B0";
      }
    }
  }
}
