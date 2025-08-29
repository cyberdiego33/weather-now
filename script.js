// import APIKey  from "./config";
const APIKey = "4d8fb5b93d4af21d66a2948710284366";

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

const FormDiv = document.querySelector("form");

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
const successCallback = async function (position) {
  alert("location found");
  const { latitude, longitude } = position.coords;
  console.log(latitude, longitude);

  try {
    const response = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
    );
    if (!response.ok) throw new Error("Couldn't get city with lan, lang");
    const data = await response.json();
    // console.log(data);
    const { city, countryName } = data;
    console.log(city, countryName);

    const cityCountry = `${city}, ${countryName}`;

    getWeather({ latitude, longitude, cityCountry });
  } catch (error) {
    console.log("failed to fetch:", error);
  }
};

// 3. Using city to fetch weather
const getWeather = async function (coords) {
  const { latitude, longitude, cityCountry } = coords;

  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${APIKey}`;
  // const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${APIKey}`;

  try {
    const response = await fetch(url);
    // console.log(response);
    if (!response.ok) throw new Error("bad request");
    const data = await response.json();
    console.log("Weather gotten");

    const newDate = getFormattedDate();
    const extract = [
      cityCountry,
      newDate,
      ...Object.values(extractWeatherData(data)),
    ];
    selectDivs(extract);
  } catch (error) {
    console.log("Error getting weather", error);
  }
};

function extractWeatherData(data) {
  const {
    weather: [{ description }],
    main: { temp, feels_like, humidity },
    wind: { speed: wind },
    rain: { "1h": precipitation } = { "1h": 0 }, // fallback if no rain
  } = data;

  return { description, temp, feels_like, humidity, wind, precipitation };
}

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

  console.log("final result", props);
  console.log(elemenntsArray);

  props.forEach((data, index) => {
    elemenntsArray[index].textContent = data;
  });
};

// 5. take input and repeat

// getCurrentPosition();

FormDiv.addEventListener("submit", (e) => {
  e.preventDefault();
  const inputData = document.querySelector("input");
  if (!inputData.value) {
    const noInput = document.querySelector("#noInput").textContent = "City Required";
    return;
  }

  console.log(inputData.value);
  inputData.value = "";
  inputData.blur();
});
