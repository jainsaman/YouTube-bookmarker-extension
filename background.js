const weatherApi = {
  key: "02c3269e35c84ce6e2352d44a2285289",
  base: "https://api.openweathermap.org/data/2.5/weather",
};

chrome.tabs.onUpdated.addListener((tabId, tab) => {
  if (tab.url && tab.url.includes("youtube.com/watch")) {
    const queryParameters = tab.url.split("?")[1];
    const urlParameters = new URLSearchParams(queryParameters);

    chrome.tabs.sendMessage(tabId, {
      type: "NEW",
      videoId: urlParameters.get("v"),
    });
  }
});

chrome.storage.local.set({
  apiKey: weatherApi.key,
  apiBaseUrl: weatherApi.base,
});
