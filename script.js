// import APIKey  from "./config";
const APIKey = "4d8fb5b93d4af21d66a2948710284366";
const FormDiv = document.querySelector("form");
const errorMessage = document.querySelector("#errorMessage");

// const urlWeatherByLocation = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${APIKey}`;
// const urlWeatherByCity = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${APIKey}`;

// const urlLocationFromBigCity = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`;
/////////////////////////////////////////////////////////////////////////////////////////////////////
// Helper functions

// Get Current Date
function getFormattedDate() {
  const now = new Date();
  const options = {
    weekday: "long", // Tuesday
    year: "numeric", // 2025
    month: "long", // August
    day: "numeric", // 20
  };

  return new Intl.DateTimeFormat("en-US", options).format(now);
}

// Destructure Weather Data
function extractWeatherData(data) {
  const {
    weather: [{ description }],
    main: { temp, feels_like, humidity },
    wind: { speed: wind },
    rain: { "1h": precipitation } = { "1h": 0 }, // fallback if no rain
    name: city,
    sys: { country },
  } = data;

  const {
    coord: { lat, lon },
  } = data;

  // prettier-ignore
  return { description, temp, feels_like, humidity, wind, precipitation, lat, lon, city, country };
}

// Setting desc illustrations
const getDescription = function (desc) {
  const weatherGroups = {
    Thunderstorm: [
      "thunderstorm with rain",
      "thunderstorm",
      "heavy thunderstorm",
    ],
    Drizzle: ["light intensity drizzle", "drizzle", "shower drizzle"],
    Rain: [
      "light rain",
      "moderate rain",
      "heavy intensity rain",
      "very heavy rain",
      "extreme rain",
    ],
    Snow: ["light snow", "snow", "heavy snow", "sleet", "shower snow"],
    Atmosphere: [
      "mist",
      "smoke",
      "haze",
      "fog",
      "sand",
      "dust",
      "volcanic ash",
      "squalls",
      "tornado",
    ],
    Clear: ["clear sky"],
    Clouds: [
      "few clouds",
      "scattered clouds",
      "broken clouds",
      "overcast clouds",
    ],
  };

  desc = desc.toLowerCase();

  for (const [description, groups] of Object.entries(weatherGroups)) {
    if (groups.includes(desc)) {
      // console.log(description);
      return description;
    }
  }

  return null;
};

const illustration = function (desc) {
  const weatherIcons = {
    Thunderstorm: "⛈️",
    Drizzle: "🌦️",
    Rain: "🌧️",
    Snow: "❄️",
    Atmosphere: "🌫️",
    Clear: "☀️",
    Clouds: "☁️",
  };

  const group = getDescription(desc);
  if (group) {
    document.querySelector("#emoji").textContent = `${weatherIcons[group]}`;
    // console.log(weatherIcons[group]);
  }
};

//////////////////////////////////////////////////////////////////////////////

// 1. Get users location from browser
// 2. Load the lat and lang to get more data on country
// 3. Use city to get weather data
// 4. display data in UI
// 5. take input and repeat

// 1. Getting geolocation from browser

const getCurrentPosition = function () {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(successCallback, errorCallback);
  } else {
    alert("turn on notification or input");
  }
};

const errorCallback = function () {
  alert("Couldn't fetch current location");
};

// 2. Getting city with lan, lon
const successCallback = function (position) {
  alert("location found");
  const { latitude, longitude } = position.coords;
  console.log(latitude, longitude);
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${APIKey}`;

  startApp(url);
};

// Get the app started or get input city weather
const startApp = async function (url) {
  errorMessage.textContent = "";
  try {
    // Fetch weather and get an array of weather, coords, country
    const getWeatherResponse = await getWeather(url);
    console.log(getWeatherResponse);
    if (!getWeatherResponse) {
      console.log("closed app");
      return;
    }

    // Getting City and Country
    const [lat, lon] = getWeatherResponse.slice(7, 9);
    console.log(lat, lon);
    const bigDataUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`;
    const getCountryLocation = await GetCountry(bigDataUrl);
    let cityCountry = getCountryLocation;
    if (!getCountryLocation) {
      const [city, country] = getWeatherResponse.slice(-2);
      console.log(getWeatherResponse);
      // console.log("big data: country not found");
      cityCountry = `${city}, ${country}`;
    }
    console.log(`big data: ${cityCountry}`);

    // Display UI
    const Properties = [cityCountry, ...getWeatherResponse].slice(0, 8);
    console.log(Properties);
    selectDivs(Properties);

    return "Successful";
  } catch (error) {
    console.log("Something went wrong", error);
  }
};

// 3. Function to fetch Weather
const getWeather = async function (url) {
  try {
    const response = await fetch(url);
    // console.log(response);
    if (!response.ok) throw new Error("bad request");
    const data = await response.json();
    console.log("Weather gotten");
    // console.log(data);
    // console.log(data.weather);

    const newDate = getFormattedDate();
    const extract = [newDate, ...Object.values(extractWeatherData(data))];

    return extract;
  } catch (error) {
    console.error(`Error getting weather", ${error}`);
    errorMessage.textContent = `Couldn't fetch Weather`;
  }
};

const GetCountry = async function (url) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Couldn't get city with lan, lang");
    const data = await response.json();
    const { city, countryName } = data;
    console.log(city, countryName);

    const cityCountry = `${city}, ${countryName}`;
    return cityCountry;
  } catch (error) {
    console.log("failed to fetch:", error);
  }
};

// 4. display data in UI
const selectDivs = function (props) {
  // Example Data [cityCountry, dateNow, description, temp, feels_like, humidity, wind, precipitation]

  const cityCountry = document.querySelector("#cityCountry");
  const dateNow = document.querySelector("#dateNow");
  const weatherDesc = document.querySelector("#weatherDesc");
  const temperature = document.querySelector("#temperature");
  const feelsLike = document.querySelector("#feelsLike");
  const humidity = document.querySelector("#humidity");
  const wind = document.querySelector("#wind");
  const precipitation = document.querySelector("#precipitation");

  // prettier-ignore
  const elemenntsArray = [cityCountry, dateNow, weatherDesc, temperature, feelsLike, humidity, wind, precipitation]

  console.log("final result:", props);
  // console.log(elemenntsArray);

  props.forEach((data, index) => {
    // console.log(index);
    // console.log(elemenntsArray[index]);
    elemenntsArray[index].textContent = data;
  });

  console.log("emoji", props[2]);
  illustration(props[2]);
};

// 5. take input and repeat

// Next Steps
// 1. Get user input
// 2. user weather api via city
// 3. take lat, lon to get country
// 4. display data

FormDiv.addEventListener("submit", (e) => {
  e.preventDefault();
  const inputData = document.querySelector("input");
  if (!inputData.value) {
    const errorMessage = (document.querySelector("#errorMessage").textContent =
      "City Required");
    return;
  }

  getCityWeather(inputData.value);

  console.log(inputData.value);
  inputData.value = "";
  inputData.blur();
});

const getCityWeather = async function (city) {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${APIKey}`;

  const restartApp = await startApp(url);
  if (!restartApp) {
    alert("something went wrong");
  }
};

const Init = async function () {
  getCurrentPosition();
};

Init();
