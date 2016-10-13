$(document).ready(function() {
    // Handle dragging.
    var floated = false;

    var originalHeight;
    var originalWidth;
    var miniScreenLastTop;
    var miniScreenLastLeft;
    var miniScreenLastHeight;
    var miniScreenLastWidth;
    var start;
    var longpress = 100;
    var dragStartX, dragStartY, dragStartWidth, dragStartHeight, dragRatio;
    var maxWidth = 854;
    var minWidth = 310;
    var resizing = false;
    var flashAlertShown = false;
    var miniYouTubeActivated = true;

    // A list of predefined sizes of the screen
    var SMALL_WIDTH = 310;
    var SMALL_HEIGHT = 175;
    var MEDIUM_WIDTH = 475;
    var MEDIUM_HEIGHT = 268;
    var LARGE_WIDTH = 640;
    var LARGE_HEIGHT = 360;
    var EXTRA_LARGE_WIDTH = 854;
    var EXTRA_LARGE_HEIGHT = 480;

    // A list of constants
    var MINI_SCREEN_LAST_TOP = 'miniScreenLastTop';
    var MINI_SCREEN_LAST_LEFT = 'miniScreenLastLeft';
    var MINI_SCREEN_LAST_HEIGHT = 'miniScreenLastHeight';
    var MINI_SCREEN_LAST_WIDTH = 'miniScreenLastWidth';
    var MINI_YOUTUBE_ID = '#miniyoutube';
    var VIDEO_STREAM_CLASS = '.video-stream';

    // Preload images
    preloadImage("https://raw.githubusercontent.com/jianweichuah/miniyoutube/master/images/pin.png");
    preloadImage("https://raw.githubusercontent.com/jianweichuah/miniyoutube/master/brCorner.png");

    // Read from the storage to see if the settings exist.
    // If yes, populate the variables
    chrome.storage.sync.get([MINI_SCREEN_LAST_TOP, MINI_SCREEN_LAST_LEFT,
                             MINI_SCREEN_LAST_HEIGHT, MINI_SCREEN_LAST_WIDTH], function(items) {
        if (items[MINI_SCREEN_LAST_TOP])
            miniScreenLastTop = items[MINI_SCREEN_LAST_TOP];
        if (items[MINI_SCREEN_LAST_LEFT])
            miniScreenLastLeft = items[MINI_SCREEN_LAST_LEFT];
        if (items[MINI_SCREEN_LAST_HEIGHT])
            miniScreenLastHeight = items[MINI_SCREEN_LAST_HEIGHT];
        if (items[MINI_SCREEN_LAST_WIDTH])
            miniScreenLastWidth = items[MINI_SCREEN_LAST_WIDTH];
    });

    // Update activation status
    getActivationStatus(updateActivationStatus);

    // Add a listener for the activation status
    chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
        if ("update_activation_status" in message) {
            // 1. Update status
            updateActivationStatus(message["update_activation_status"]);
        }
    });

    (function($) {
        $.fn.drags = function(opt) {

            opt = $.extend({handle:"",cursor:"move"}, opt);

            if(opt.handle === "") {
                var $el = this;
            } else {
                var $el = this.find(opt.handle);
            }

            return $el.css('cursor', opt.cursor).on("mousedown", function(e) {
                // If the clicked div is resizer, don't make it draggable.
                if(e.target.className === "resizer" ||
                   e.target.className === "mnyt-size-button" ||
                   e.target.className === "mnyt-pin-img" ||
                   e.target.className === "mnyt-progress-area" ||
                   e.target.className === "mnyt-play-button" ||
                   e.target.className === "mnyt-play-button-play" ||
                   e.target.className === "mnyt-play-button-pause" ||
                   e.target.className === "mnyt-progress-area" ||
                   e.target.className === "mnyt-progress-bar mnyt-progress" ||
                   e.target.className === "mnyt-progress-wrap mnyt-progress" ||
                   e.target.className === "mnyt-progress-pointer")
                {
                    return false;
                }

                var $drag = $(this).addClass('draggable');

                var z_idx = $drag.css('z-index'),
                    drg_h = $drag.outerHeight(),
                    drg_w = $drag.outerWidth(),
                    pos_y = $drag.offset().top + drg_h - e.pageY,
                    pos_x = $drag.offset().left + drg_w - e.pageX;
                $drag.css('z-index', 1000);

                $(window).on("mousemove", function(e) {
                    // Prevent going out of screen horizontally.
                    var left = e.pageX + pos_x - drg_w;
                    if (left < 5) {
                        left = 5;
                    } else if (left > $(window).width() - drg_w - 5) {
                        left = $(window).width() - drg_w - 5;
                    }

                    // Prevent going out of screen vertically.
                    var top = e.pageY + pos_y - drg_h;
                    if (top < $(document).scrollTop() + 55) {
                        top = $(document).scrollTop() + 55;
                    } else if (top > $(document).scrollTop() + $(window).height() - drg_h - 5) {
                        top = $(document).scrollTop() + $(window).height() - drg_h - 5;
                    }

                    $('.draggable').offset({
                        top: top,
                        left: left
                    }).on("mouseup", function() {
                        $(this).removeClass('draggable').css('z-index', z_idx);
                    });
                }).on("mouseup", function() {
                    $(window).unbind('mousemove');
                    $(this).removeClass('draggable');
                });

                e.preventDefault(); // disable selection
            });
        }
    })(jQuery);

    // Keep track of the position of view and show small screen when original video div is out of view
    $(window).scroll(function() {
        // Do nothing if it's not activated
        if (miniYouTubeActivated) {
            // If this is a Flash video page, tell the user it's not supported.
            if ($('#movie_player').length && $('#movie_player').is('embed')) {
                // Only show the alert if it hasn't been shown before.
                if (!flashAlertShown) {
                    $flashNotSupportedAlert = $('<div style="width: 100%">\
                                                    <div class="alert alert-danger" role="alert">\
                                                        <img src="https://raw.githubusercontent.com/jianweichuah/miniyoutube/master/icon16.png" height="10px">\
                                                        Mini YouTube: Flash videos not currently supported!\
                                                    </div>\
                                                 </div>');
                    $('body').prepend($flashNotSupportedAlert);
                    // Show it for 5 seconds, fade it out and remove it.
                    $flashNotSupportedAlert.show().delay(5000).fadeOut(300, function() {
                        $(this).remove();
                    });
                    flashAlertShown = true;
                }
                return false;
            } else if ((floated == false && $('.ended-mode').length)) {
                // If the video has ended and there is no floating screen, do nothing
                return false;
            } else if ($('#player').length && $('#player').hasClass('off-screen')) {
                // Added to prevent the mini screen from showing up on the homepage for
                // the new YouTube interface.
                if (floated == false) {
                    return false;
                } else {
                    removeMiniScreen();
                }
            } else if (floated == false && $(document).scrollTop() > $('.html5-video-container').offset().top + $('.video-stream').height()) {
                // 1. Create the mini screen div to hold the video
                $miniScreen = $('<div id="miniyoutube"></div');

                // Put the screen back to its last position, if defined.
                // Else default to top right.
                var miniScreenTop = 55;
                var miniScreenHeight = 175;
                var miniScreenLeft = $(window).width() - 380;
                var miniScreenWidth = 310;

                if (miniScreenLastTop && miniScreenLastHeight &&
                    miniScreenLastLeft && miniScreenLastWidth &&
                    miniScreenLastLeft + miniScreenLastWidth <= $(window).width() &&
                    miniScreenLastTop + miniScreenLastHeight <= $(window).height()) {

                    miniScreenTop = miniScreenLastTop;
                    miniScreenHeight = miniScreenLastHeight;
                    miniScreenLeft = miniScreenLastLeft;
                    miniScreenWidth = miniScreenLastWidth;
                }

                $miniScreen.css('top', miniScreenTop);
                $miniScreen.css('left', miniScreenLeft);
                $miniScreen.height(miniScreenHeight);
                $miniScreen.width(miniScreenWidth);

                // 2. Grab the video element
                $video = $(VIDEO_STREAM_CLASS);
                $video.addClass('mnyt-video');
                // Bind the time update event to the video
                $video.bind('timeupdate', updateTime);

                // 3. Store the status of the video
                var videoPaused = $video.get(0).paused;

                // 4. Store the current width and height to restore later
                originalWidth = $video.width();
                originalHeight = $video.height();

                // 5. Wrap the video into the small element div
                $video.wrap($miniScreen);

                // Move the div to the top level body.
                // *This is needed in Chrome after the update on 9 October 2016.
                $(MINI_YOUTUBE_ID).appendTo('body');
                // Add resizers to the right corners of the div
                $(MINI_YOUTUBE_ID).append('<div class="mnyt-controls">\
                                                <div class="resizer" id="mnyt-br"></div>\
                                                <img class="resize-icon" src="https://raw.githubusercontent.com/jianweichuah/miniyoutube/master/brCorner.png" />\
                                                <div class="mnyt-control-icons">\
                                                    <button class="mnyt-size-button" id="mnyt-pin-button"><img class="mnyt-pin-img" src="https://raw.githubusercontent.com/jianweichuah/miniyoutube/master/images/pin.png" width="20px"/></button>\
                                                    <label class="mnyt-pin-label">Save screen settings.</label>\
                                                    <button class="mnyt-size-button" id="mnyt-small-button">S</button>\
                                                    <button class="mnyt-size-button" id="mnyt-medium-button">M</button>\
                                                    <button class="mnyt-size-button" id="mnyt-large-button">L</button>\
                                                    <button class="mnyt-size-button" id="mnyt-extra-large-button">XL</button>\
                                                </div>\
                                                <div class="mnyt-play-button" id="mnyt-play-button">\
                                                    <div class="mnyt-play-button-play"></div>\
                                                    <div class="mnyt-play-button-pause"></div>\
                                                </div>\
                                                <button class="mnyt-size-button" id="mnyt-close-button">X</button>\
                                                <div class="mnyt-progress-time" id="mnyt-progress-time">\
                                                    <span id="mnyt-progress-current-time"></span>\
                                                    /\
                                                    <span id="mnyt-progress-duration"></span>\
                                                </div>\
                                                <div class="mnyt-progress-area">\
                                                    <div class="mnyt-progress-wrap mnyt-progress">\
                                                        <div class="mnyt-progress-bar mnyt-progress"></div>\
                                                    </div>\
                                                </div>\
                                                <div class="mnyt-progress-pointer"></div>\
                                          </div>');

                // 6. Modify clicking to differentiate long vs short clicks.
                $(MINI_YOUTUBE_ID).on('mouseover', function(e) {
                    $('.mnyt-control-icons').show();
                    $('.mnyt-play-button').show();
                    $('#mnyt-close-button').show();
                    $('#mnyt-progress-time').show();
                });
                $(MINI_YOUTUBE_ID).on('mouseleave', function(e) {
                    start = 0;
                    $('.mnyt-control-icons').hide();
                    $('.mnyt-play-button').hide();
                    $('#mnyt-close-button').hide();
                    $('#mnyt-progress-time').hide();
                });
                $(MINI_YOUTUBE_ID).on('mouseup', function(e) {
                    if (resizing == true) {
                        stopDrag(e);
                    }
                    return false;
                });
                $(MINI_YOUTUBE_ID).click(function() {
                    return false;
                });
                // Disable double click to full screen.
                $(MINI_YOUTUBE_ID).dblclick(function() {
                    return false;
                });

                // 7. If the video was playing before, make sure it's not paused
                if (!videoPaused) {
                    $video.get(0).play();
                    $(".mnyt-play-button-pause").show();
                } else {
                    $(".mnyt-play-button-play").show();
                }

                // 8. Set the width and height of the video to fit the div
                $video.css('width', miniScreenWidth);
                $video.css('height', miniScreenHeight);

                // 9. Activate the draggable feature of the small screen
                $(MINI_YOUTUBE_ID).drags();

                // 10. Set flag to true
                floated = true;

                // Add listeners for the controls
                $('#mnyt-small-button').click(handleTransitionSmall);
                $('#mnyt-medium-button').click(handleTransitionMedium);
                $('#mnyt-large-button').click(handleTransitionLarge);
                $('#mnyt-extra-large-button').click(handleTransitionExtraLarge);
                $('#mnyt-play-button').click(toggleVideo);

                // Save the position and size of the screen if pin button is clicked
                $('#mnyt-pin-button').click(pinButtonClicked);
                $('#mnyt-close-button').click(closeButtonClicked);

                $('#mnyt-pin-button').on('mouseover', function(e) {
                    $('.mnyt-pin-label').show();
                });
                $('#mnyt-pin-button').on('mouseleave', function(e) {
                    $('.mnyt-pin-label').hide();
                });

                $('.mnyt-fastforward-icon').click(handleFastForward);

                // Add listener for the resizers
                $('.resizer').bind('mousedown.resizer', initDrag);
                $('.resize-icon').bind('mousedown.resizer', initDrag);

                // Add listener for the progress bar
                $('.mnyt-progress-area').hover(handleProgressHoverIn, handleProgressHoverOut);
                $('.mnyt-progress-area').click(handleVideoProgress);

            } else if (floated == true && $(document).scrollTop() <= $('.html5-video-container').offset().top + originalHeight) {
                putBackMiniScreen();
            }
        }
    });

    function handleProgressHoverIn() {
        $('.mnyt-progress-wrap').height(5);
        $('.mnyt-progress-bar').height(5);
        $('.mnyt-progress-pointer').show();
    }

    function handleProgressHoverOut() {
        $('.mnyt-progress-wrap').height(1);
        $('.mnyt-progress-bar').height(1);
        $('.mnyt-progress-pointer').hide();
    }

    function handleVideoProgress(e) {
        var clickedPositionX = e.offsetX;
        var totalWidth = $('.mnyt-progress-area').width();
        if (e.target.className === "mnyt-progress-bar mnyt-progress") {
            clickedPositionX = clickedPositionX + $('.mnyt-progress-bar').position().left;
        }
        var percent = clickedPositionX/totalWidth;
        var video = $(VIDEO_STREAM_CLASS).get(0);
        video.currentTime = percent * video.duration;
        updateTime();
    }

    function pinButtonClicked() {
        saveMiniYouTubeSettings();
        // Show settings saved alert
        $settingsSavedAlert = $('<div style="width: 100%">\
                                    <div class="alert alert-success" role="alert">\
                                        <img src="https://raw.githubusercontent.com/jianweichuah/miniyoutube/master/icon16.png" height="10px">\
                                        Mini YouTube: Screen settings saved!\
                                    </div>\
                                 </div>');
        $('body').prepend($settingsSavedAlert);
        // Show it for 5 seconds, fade it out and remove it.
        $settingsSavedAlert.show().delay(1000).fadeOut(100, function() {
            $(this).remove();
        });
    }

    function saveMiniYouTubeSettings() {
        // Save screen position and size
        miniScreenLastTop = $(MINI_YOUTUBE_ID).position().top;
        miniScreenLastLeft = $(MINI_YOUTUBE_ID).position().left;
        miniScreenLastHeight = $(MINI_YOUTUBE_ID).height();
        miniScreenLastWidth = $(MINI_YOUTUBE_ID).width();
        // Persist to browser storage
        chrome.storage.sync.set({"miniScreenLastTop": miniScreenLastTop,
                                 "miniScreenLastLeft": miniScreenLastLeft,
                                 "miniScreenLastHeight": miniScreenLastHeight,
                                 "miniScreenLastWidth": miniScreenLastWidth});
    }

    // Update the size of the screen to small
    function handleTransitionSmall() {
        resizeScreen(SMALL_WIDTH, SMALL_HEIGHT);
    }

    function handleTransitionMedium() {
        resizeScreen(MEDIUM_WIDTH, MEDIUM_HEIGHT);
    }

    function handleTransitionLarge() {
        resizeScreen(LARGE_WIDTH, LARGE_HEIGHT);
    }

    function handleTransitionExtraLarge() {
        resizeScreen(EXTRA_LARGE_WIDTH, EXTRA_LARGE_HEIGHT);
    }

    function resizeScreen(newWidth, newHeight) {
        if ($(MINI_YOUTUBE_ID).width() == newWidth) {
            return false;
        }

        $(MINI_YOUTUBE_ID).animate({'width':newWidth, 'height':newHeight}, 300);
        $(VIDEO_STREAM_CLASS).animate({'width':newWidth, 'height':newHeight}, 300);
    }

    function handleFastForward() {
        $video = $(VIDEO_STREAM_CLASS).get(0);
        var updatedRate = 1;
        switch ($video.playbackRate) {
            case 1:
                updatedRate = 1.25;
                break;
            case 1.25:
                updatedRate = 1.5;
                break;
            case 1.5:
                updatedRate = 2;
                break;
            default:
                updatedRate = 1;
                break;
        }
        $video.playbackRate = updatedRate;
        return false;
    }

    function updateTime() {
        // If video is not floated, do nothing.
        if (floated == false) {
            return false;
        }
        // Get the video player and calculate the progress
        $video = $(VIDEO_STREAM_CLASS).get(0);

        // If the video has ended and the screen is still around, clear it.
        if (floated == true && $video.currentTime == $video.duration) {
            putBackMiniScreen();
            return false;
        }

        var percent = $video.currentTime/$video.duration;
        var progressBarWidth = $(MINI_YOUTUBE_ID).width();
        var progressTotal = percent * progressBarWidth;

        $('.mnyt-progress-bar').stop().animate({
            left: progressTotal
        });
        $('.mnyt-progress-pointer').stop().animate({
            left: progressTotal - 5
        });

        // Update video duration
        $('#mnyt-progress-current-time').html(convertTime(Math.floor($video.currentTime)));
        if (!$('#mnyt-progress-duration').html())
            $('#mnyt-progress-duration').html(convertTime(Math.floor($video.duration)));
    }

    function convertTime(timeInSeconds) {
        var hours = Math.floor(timeInSeconds / 3600);
        timeInSeconds = timeInSeconds - hours * 3600;
        var minutes = Math.floor(timeInSeconds / 60);
        var seconds = timeInSeconds - minutes * 60;

        var timeStr = [];
        // Only put in hours if it's not 0
        if (hours > 0) {
            timeStr.push(hours);
        }
        // If hours > 0 but minutes == 0, put 00
        if (minutes > 0) {
            var minuteStr = minutes;
            if (hours > 0 && minutes < 10)
                minuteStr = "0".concat(minutes);
            timeStr.push(minuteStr);
        } else {
            timeStr.push("0");
        }

        if (seconds > 0) {
            var secondStr = seconds;
            if (seconds < 10)
                secondStr = "0".concat(seconds);
            timeStr.push(secondStr);
        } else {
            timeStr.push("00");
        }

        return timeStr.join(":");
    }

    function initDrag(e) {
        resizing = true;
        // Store the initial values to calculate new size later
        dragStartX = e.clientX;
        dragStartY = e.clientY;
        dragStartWidth = $(MINI_YOUTUBE_ID).width();
        dragStartHeight = $(MINI_YOUTUBE_ID).height();
        dragRatio = dragStartHeight/dragStartWidth;
        // Add event listeners to perform resize
        $(window).mousemove(doDrag);
        $(window).mouseup(stopDrag);
        e.preventDefault();

        return false;
    }

    function doDrag(e) {
        // if not resizing, do nothing
        if (resizing == false) {
            return false;
        }

        var newWidth = dragStartWidth + e.clientX - dragStartX;
        // Experimental: Allow manually resizing to bigger screen sizes.
        // Make sure the new width does not exceed the max width
        // if (newWidth > maxWidth) {
        //     newWidth = maxWidth;
        // }
        if (newWidth < minWidth) {
            newWidth = minWidth;
        }

        var newHeight = Math.round(newWidth * dragRatio);
        $(MINI_YOUTUBE_ID).width(newWidth);
        $(MINI_YOUTUBE_ID).height(newHeight);
        // Added to also resize the video after the YouTube update
        $(VIDEO_STREAM_CLASS).width(newWidth);
        $(VIDEO_STREAM_CLASS).height(newHeight);
        e.preventDefault();

        return false;
    }

    function stopDrag(e) {
        // Set the flag to false
        resizing = false;
        // Remove the listensers
        $(window).unbind('mousemove');
        return false;
    }

    function toggleVideo() {
        $vid = $(VIDEO_STREAM_CLASS).get(0);
        if ($vid.paused) {
            $vid.play();
            $(".mnyt-play-button-play").hide();
            $(".mnyt-play-button-pause").show();
        }
        else {
            $vid.pause();
            $(".mnyt-play-button-play").show();
            $(".mnyt-play-button-pause").hide();
        }
    }

    function preloadImage(url) {
        var img=new Image();
        img.src=url;
    }

    function getActivationStatus(callBack) {
        chrome.runtime.sendMessage({"get_activation_status": true}, function(response) {
            var activated = true;
            if ("is_active" in response) {
                activated = response["is_active"];
            }
            callBack(activated);
        });
    }

    function updateActivationStatus(activated) {
        miniYouTubeActivated = activated;
        // If it's deactivated, remove the mini screen
        if (!miniYouTubeActivated && floated) {
            putBackMiniScreen();
        }
    }

    function removeMiniScreen() {
        // 1. Grab the video element
        $video = $(VIDEO_STREAM_CLASS);

        // 2. Remove the resizers
        $video.next().remove();

        // 3. Take away the parent.
        $video.removeClass('mnyt-video');
        $video.unwrap();

        // 4. Set flag to false
        floated = false;
    }

    function putBackMiniScreen() {
        // Put back the screen when the user scrolls up to the original player
        // 1. Grab the video element
        $video = $(VIDEO_STREAM_CLASS);

        // 2. Store the status of the video
        var videoPaused = $video.get(0).paused;

        // 3. Save the current top and left of the mini screen.
        saveMiniYouTubeSettings();

        // Move the div back to 'html5-video-container'.
        // This is needed in Chrome after the update on 9 October 2016.
        $(MINI_YOUTUBE_ID).appendTo('.html5-video-container');

        // 4. Restore the width and heigh of the video
        $video.css('width', originalWidth);
        $video.css('height', originalHeight);

        // Remove the resizers
        $video.next().remove();

        // 5. Take away the parent.
        $video.removeClass('mnyt-video');
        $video.unwrap();

        // 6. Make the video status consistent
        if (!videoPaused) {
            $video.get(0).play();
        }

        // 7. Set flag to false
        floated = false;
    }

    function closeButtonClicked() {
        putBackMiniScreen();
        floated = false;
        // Send message to disable Mini YouTube
        chrome.runtime.sendMessage({"update_icon": false});
    }
});
