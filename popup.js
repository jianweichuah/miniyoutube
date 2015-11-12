document.addEventListener("DOMContentLoaded", function(event) {
    var miniYouTubeActivated = true;
    var onOffSwitch = document.getElementById('myonoffswitch');
    var enabledDescription = document.getElementById('mnyt-enabled');
    var disabledDescription = document.getElementById('mnyt-disabled');

    // Update the switch based on activation status
    getActivationStatus(updateSwitchState);

    // Add listener to the switch
    onOffSwitch.onclick = toggleSwitch;

    function getActivationStatus(callBack) {
        chrome.runtime.sendMessage({"get_activation_status": true}, function(response) {
            var activated = true;
            if ("is_active" in response) {
                activated = response["is_active"];
            }
            callBack(activated);
        });
    }

    function toggleSwitch() {
        miniYouTubeActivated = onOffSwitch.checked;
        // Send a message to background.js to save status and update icon
        chrome.runtime.sendMessage({"update_icon": miniYouTubeActivated});
        updateDescription();
    }

    function updateSwitchState(activated) {
        miniYouTubeActivated = activated;
        onOffSwitch.checked = miniYouTubeActivated;
        updateDescription();
    }

    function updateDescription() {
        if (miniYouTubeActivated) {
            enabledDescription.style.display = "block";
            disabledDescription.style.display = "none";
        } else {
            enabledDescription.style.display = "none";
            disabledDescription.style.display = "block";
        }
    }
});