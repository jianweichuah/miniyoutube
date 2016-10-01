var MINI_YOUTUBE_ACTIVATED = 'miniYouTubeActivated';
var miniYouTubeActivated = true;

// Check if Mini YouTube is enabled
browser.storage.local.get([MINI_YOUTUBE_ACTIVATED], function(items) {
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
    console.log(miniYouTubeActivated);
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
    browser.storage.local.set({"miniYouTubeActivated": miniYouTubeActivated});
    // Send message to each tab with youtube to update the status in the content script
    browser.tabs.query({url: "https://www.youtube.com/*"},function(tabs){
        tabs.forEach(function(tab){
            browser.tabs.sendMessage(tab.id, {"update_activation_status": miniYouTubeActivated});
        });
    });
}
