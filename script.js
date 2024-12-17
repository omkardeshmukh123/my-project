// API key from OpenWeatherMap
const apiKey = "b88cbdebd55c50ead7253dd695fa026b"; // Replace with your API key

// DOM Elements
const cityInput = document.getElementById("cityInput");
const getWeatherButton = document.getElementById("getWeather");
const geoLocationButton = document.getElementById("geoLocation");
const themeToggleButton = document.getElementById("themeToggle");
const weatherResult = document.getElementById("weatherResult");
const additionalInfo = document.getElementById("additionalInfo");
const loading = document.getElementById("loading");
const weatherJoke = document.getElementById("weatherJoke");
const mapContainer = document.getElementById("map");

let map = null; // Holds the Leaflet map instance

// Helper function to convert UNIX time to human-readable format
const unixToTime = (unix) => {
  const date = new Date(unix * 1000);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

// Event Listener: Fetch weather data by city name
getWeatherButton.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (city === "") {
    weatherResult.innerHTML = "<p>Please enter a city name.</p>";
    return;
  }
  fetchWeatherByCity(city);
});

// Event Listener: Fetch weather data using geolocation
geoLocationButton.addEventListener("click", () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        fetchWeatherByLocation(latitude, longitude);
      },
      () => {
        alert("Unable to retrieve your location.");
      }
    );
  } else {
    alert("Geolocation is not supported by your browser.");
  }
});

// Fetch weather data by city
const fetchWeatherByCity = (city) => {
  const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
  fetchWeather(apiUrl);
};

// Fetch weather data by coordinates
const fetchWeatherByLocation = (lat, lon) => {
  const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
  fetchWeather(apiUrl);
};

// Generic fetch function
const fetchWeather = (apiUrl) => {
  loading.style.display = "block"; // Show loading indicator
  fetch(apiUrl)
    .then((response) => {
      loading.style.display = "none"; // Hide loading
      if (!response.ok) throw new Error("City not found or invalid API response");
      return response.json();
    })
    .then((data) => displayWeather(data))
    .catch((error) => {
      weatherResult.innerHTML = `<p>${error.message}</p>`;
    });
};

// Display weather data
const displayWeather = (data) => {
  const { name, main, weather, sys, coord } = data;
  const sunrise = unixToTime(sys.sunrise);
  const sunset = unixToTime(sys.sunset);

  weatherResult.innerHTML = `
    <h3>${name}</h3>
    <p>Temperature: ${main.temp}°C</p>
    <p>Weather: ${weather[0].description}</p>
    <p>Humidity: ${main.humidity}%</p>
  `;
  additionalInfo.innerHTML = `
    <p>Sunrise: ${sunrise}</p>
    <p>Sunset: ${sunset}</p>
  `;
  showMap(coord.lat, coord.lon);

  // Fun weather-related joke or fact
  displayWeatherJoke();
};

// Show map with a marker (optimized to prevent multiple maps)
const showMap = (lat, lon) => {
  if (map) {
    map.remove(); // Remove previous map instance
  }

  map = L.map(mapContainer).setView([lat, lon], 13);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  L.marker([lat, lon]).addTo(map).bindPopup("Weather Location").openPopup();
};

// Display Weather Joke or Fun Fact
const displayWeatherJoke = () => {
  const jokes = [
    "Did you know? The coldest temperature ever recorded on Earth was −128.6°F (−89.2°C) in Antarctica in 1983!",
    "Why don’t skeletons fight each other? They don’t have the guts!",
    "What’s a tornado’s favorite type of music? Anything with a good twister beat!",
  ];
  const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];
  weatherJoke.innerHTML = `<p>${randomJoke}</p>`;
};

// Theme Toggle with Local Storage
themeToggleButton.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  const isDarkMode = document.body.classList.contains("dark-mode");
  localStorage.setItem("darkMode", isDarkMode ? "enabled" : "disabled");
});

// Load theme preference on page load
window.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem("darkMode");
  if (savedTheme === "enabled") {
    document.body.classList.add("dark-mode");
  }
});
