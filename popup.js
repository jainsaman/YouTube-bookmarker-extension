import { getCurrentTabURL } from "./utils.js";
var apiKey = "";
var baseUrl = "";

const cities = [
  "London",
  "New York",
  "Mumbai",
  "Tokyo",
  "Sydney",
  "Paris",
  "Berlin",
  "Moscow",
  "Cairo",
  "Jaipur",
  "Rome",
  "Beijing",
  "Mexico City",
  "Toronto",
  "Los Angeles",
  "Kolkata",
  "Las Vegas",
];

// adding a new bookmark row to the popup
const addNewBookmark = (bookmarksElement, bookmark) => {
  const bookmarkTiTleElement = document.createElement("div");
  const newBookmarkElement = document.createElement("div");
  const controlElements = document.createElement("div");

  bookmarkTiTleElement.textContent = bookmark.desc;
  bookmarkTiTleElement.className = "bookmark-title";

  controlElements.className = "bookmark-controls";

  newBookmarkElement.id = "bookmark-" + bookmark.time;
  newBookmarkElement.className = "bookmark";
  newBookmarkElement.setAttribute("timestamp", bookmark.time);

  setBookmarkAttributes("play", onPlay, controlElements);
  setBookmarkAttributes("delete", onDelete, controlElements);

  newBookmarkElement.appendChild(bookmarkTiTleElement);
  newBookmarkElement.appendChild(controlElements);
  bookmarksElement.appendChild(newBookmarkElement);
};

const viewBookmarks = (currentBookmarks = []) => {
  const bookmarksElement = document.getElementById("bookmarks");
  bookmarksElement.innerHTML = "";

  if (currentBookmarks.length > 0) {
    for (let i = 0; i < currentBookmarks.length; i++) {
      const bookmark = currentBookmarks[i];
      addNewBookmark(bookmarksElement, bookmark, i);
    }
  } else {
    const noBookmarks = document.createElement("i");
    noBookmarks.className = "row";
    noBookmarks.style.textAlign = "center";
    noBookmarks.style.marginBottom = "8px";
    noBookmarks.innerText = "No bookmarks found";
    bookmarksElement.appendChild(noBookmarks);
  }
};

const onPlay = async (e) => {
  const activeTab = await getCurrentTabURL();
  const bookmarkTime = e.target.parentNode.parentNode.getAttribute("timestamp");

  chrome.tabs.sendMessage(activeTab.id, {
    type: "PLAY",
    value: bookmarkTime,
  });
};

const onDelete = async (e) => {
  const activeTab = await getCurrentTabURL();
  const bookmarkTime = e.target.parentNode.parentNode.getAttribute("timestamp");

  const bookmarkElementToDelete = document.getElementById(
    "bookmark-" + bookmarkTime
  );

  bookmarkElementToDelete.parentNode.removeChild(bookmarkElementToDelete);

  chrome.tabs.sendMessage(
    activeTab.id,
    {
      type: "DELETE",
      value: bookmarkTime,
    },
    viewBookmarks
  );
};

const setBookmarkAttributes = (src, eventListener, controlParentElement) => {
  const controlElement = document.createElement("img");

  controlElement.src = "assets/" + src + ".png";
  controlElement.title = "Click to " + src + " the bookmark";
  controlElement.addEventListener("click", eventListener);
  controlParentElement.appendChild(controlElement);
};

const getWeatherData = async (cities) => {
  const getWeatherBtn = document.getElementById("getWeather");
  const cityData = document.getElementById("city");
  const temperatureData = document.getElementById("temperature");

  function selectRandomCity(array) {
    const randomIndex = Math.floor(Math.random() * array.length);
    return array[randomIndex];
  }

  getWeatherBtn.addEventListener("click", async () => {
    const randomCity = selectRandomCity(cities);

    cityData.innerText = "Loading...";
    temperatureData.innerText = "Loading...";

    const response = await fetch(
      `${baseUrl}?q=${randomCity}&appid=${apiKey}&units=metric`
    ).then((response) => response.json());

    console.log("City: ", randomCity);
    showWeatherData(response);
  });
};

const showWeatherData = async (weather) => {
  const cityData = document.getElementById("city");
  const temperatureData = document.getElementById("temperature");

  cityData.innerText = weather.name;
  temperatureData.innerText = Math.round(weather.main.temp) + "°C";
};

document.addEventListener("DOMContentLoaded", async () => {
  const activeTab = await getCurrentTabURL();
  const queryParameters = activeTab.url.split("?")[1];
  const urlParameters = new URLSearchParams(queryParameters);

  const currentVideo = urlParameters.get("v");

  const title = document.getElementsByClassName("title")[0];
  const errorTitle = document.getElementsByClassName("error-title")[0];

  chrome.storage.local.get(["apiKey", "apiBaseUrl"], (result) => {
    apiKey = result.apiKey;
    baseUrl = result.apiBaseUrl;
    getWeatherData(cities);
  });

  if (activeTab.url.includes("youtube.com/watch") && currentVideo) {
    title.style.display = "block";
    errorTitle.style.display = "none";

    chrome.storage.sync.get([currentVideo], (data) => {
      const currentVideoBookmarks = data[currentVideo]
        ? JSON.parse(data[currentVideo])
        : [];

      viewBookmarks(currentVideoBookmarks);
    });
  } else {
    title.style.display = "none";
    errorTitle.style.display = "block";
  }
});
