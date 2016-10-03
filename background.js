// Constants
var MINI_YOUTUBE_ACTIVATED = 'miniYouTubeActivated';
var MINI_SCREEN_LAST_TOP = 'miniScreenLastTop';
var MINI_SCREEN_LAST_LEFT = 'miniScreenLastLeft';
var MINI_SCREEN_LAST_HEIGHT = 'miniScreenLastHeight';
var MINI_SCREEN_LAST_WIDTH = 'miniScreenLastWidth';
var miniYouTubeActivated = true;

// Try if Edge browser object exists, else default to chrome
var browser = self.browser;
if (typeof browser === "undefined") {
    browser = self.chrome;
}

// Try cloud sync, else fallback to localstorage
var storage = browser.storage.sync;
if (typeof storage === "undefined") {
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
browser.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    for (var message in request) {
        switch (message) {
            case 'update_icon':
                // 1. Update status
                setActivationStatus(request[message]);
                // 2. Update icon
                updateIcon();
                break;

            case 'get_activation_status':
                sendResponse({"is_active": getActivationStatus()});
                break;

            case 'get_miniscreen_positions':
                getMiniScreenPositions(sendResponse);
                return true; // Keep channel open

            case 'update_miniscreen_positions':
                updateMiniScreenPositions(request[message]);
                break;

            default:
                break;
        }
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

function getMiniScreenPositions(sendResponse) {
    storage.get([MINI_SCREEN_LAST_TOP, MINI_SCREEN_LAST_LEFT,
                MINI_SCREEN_LAST_HEIGHT, MINI_SCREEN_LAST_WIDTH], function(items){
                    sendResponse({"positions": items});
                });
}

function updateMiniScreenPositions(positions) {
    storage.set(positions);
}
