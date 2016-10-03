var MINI_YOUTUBE_ACTIVATED = 'miniYouTubeActivated';
var miniYouTubeActivated = true;

// Try if Edge browser object exists, else default to chrome
var browser = self.browser;
if (typeof browser === "undefined") {
    var browser = self.chrome;
}

// Try cloud sync, else fallback to localstorage
var storage = browser.storage.sync;
if (typeof storage !== "undefined") {
    storage = browser.storage.local;
}

// Check if Mini YouTube is enabled
storage.get([MINI_YOUTUBE_ACTIVATED], function(items) {
    if (items[MINI_YOUTUBE_ACTIVATED])
        miniYouTubeActivated = items[MINI_YOUTUBE_ACTIVATED];
});

// Update the icon according to the status
updateIcon();

// Receive and handle message from popup
browser.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    // The message is to update icon
    if ("update_icon" in message) {
        // 1. Update status
        setActivationStatus(message["update_icon"]);
        // 2. Update icon
        updateIcon();
    } else if ("get_activation_status" in message) {
        // Message is to get activation status
        sendResponse({"is_active": getActivationStatus()});
    }
});

function updateIcon() {
    var iconPath = "icon128.png";
    if (!miniYouTubeActivated)
        iconPath = "icon128_grey.png";

    browser.browserAction.setIcon({
        path : {
          "19": iconPath,
          "38": iconPath
        }
    });
}

function getActivationStatus() {
    return miniYouTubeActivated;
}

function setActivationStatus(isActive) {
    miniYouTubeActivated = isActive;
    storage.set({"miniYouTubeActivated": miniYouTubeActivated});
    // Send message to each tab with youtube to update the status in the content script
    browser.tabs.query({url: "https://www.youtube.com/*"},function(tabs){
        tabs.forEach(function(tab){
            browser.tabs.sendMessage(tab.id, {"update_activation_status": miniYouTubeActivated});
        });
    });
}
