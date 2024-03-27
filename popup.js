import { getCurrentTabURL } from "./utils.js";
var apiKey = "";
var baseUrl = "";

// adding a new bookmark row to the popup
const addNewBookmark = (bookmarksElement, bookmark) => {
  const bookmarkTiTleElement = document.createElement("div");
  const bookmarkTimestamp = document.createElement("p");
  const bookmarkTitle = document.createElement("p");
  const bookmarkContentElement = document.createElement("div");
  const newBookmarkElement = document.createElement("div");
  const controlElements = document.createElement("div");

  bookmarkTitle.textContent = bookmark.title;
  bookmarkTimestamp.textContent = bookmark.desc;

  if (bookmark.title === "") {
    bookmarkTitle.display = "none";
    bookmarkTiTleElement.style.justifyContent = "center";
  } else {
    bookmarkTitle.style.fontWeight = "700";
    bookmarkTiTleElement.style.justifyContent = "space-between";
  }

  bookmarkTiTleElement.className = "bookmark-title";

  controlElements.className = "bookmark-controls";

  newBookmarkElement.id = "bookmark-" + bookmark.time;
  newBookmarkElement.className = "bookmark";
  newBookmarkElement.setAttribute("timestamp", bookmark.time);

  bookmarkContentElement.className = "bookmarkContent";

  setBookmarkAttributes("play", onPlay, controlElements);
  setBookmarkAttributes("delete", onDelete, controlElements);

  bookmarkTiTleElement.appendChild(bookmarkTitle);
  bookmarkTiTleElement.appendChild(bookmarkTimestamp);

  bookmarkContentElement.appendChild(bookmarkTiTleElement);
  bookmarkContentElement.appendChild(controlElements);

  newBookmarkElement.appendChild(bookmarkContentElement);

  bookmarksElement.appendChild(newBookmarkElement);
};

const viewBookmarks = (currentBookmarks = []) => {
  const bookmarksElement = document.getElementById("bookmarks");
  bookmarksElement.style.display = "block";
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
  const bookmarkTime =
    e.target.parentNode.parentNode.parentNode.getAttribute("timestamp");

  chrome.tabs.sendMessage(activeTab.id, {
    type: "PLAY",
    value: bookmarkTime,
  });
};

const onDelete = async (e) => {
  const activeTab = await getCurrentTabURL();
  const bookmarkTime =
    e.target.parentNode.parentNode.parentNode.getAttribute("timestamp");

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

const getWeatherData = async () => {
  const weatherData = document.getElementById("weather");
  const temperatureData = document.getElementById("temperature");
  const updateWeatherBtn = document.getElementById("updateWeather");

  updateWeatherBtn.addEventListener("click", async () => {
    updateWeatherBtn.classList.toggle("updating");
    const city = "Gwalior";
    console.log("hello");

    weatherData.innerText = "Loading...";
    temperatureData.innerText = "Loading...";

    const response = await fetch(
      `${baseUrl}?q=${city}&appid=${apiKey}&units=metric`
    ).then((response) => response.json());

    setTimeout(() => {
      showWeatherData(response);
      console.log(response);
    }, 2000);
  });
};

const showWeatherData = async (response) => {
  const weatherData = document.getElementById("weather");
  const temperatureData = document.getElementById("temperature");
  const imgSrc = document.getElementById("weatherImage");
  const weatherImage = document.querySelector(".weatherImage");
  const updateWeatherBtn = document.getElementById("updateWeather");

  weatherData.innerText = response.weather[0].main;
  imgSrc.setAttribute(
    "src",
    "https://openweathermap.org/img/wn/" + response.weather[0].icon + ".png"
  );

  weatherImage.style.display = "block";
  temperatureData.innerText = Math.round(response.main.temp) + "°C";
  updateWeatherBtn.classList.toggle("updating");
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
    getWeatherData();
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
