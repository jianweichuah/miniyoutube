$(document).ready(function() {
    // Handle dragging.
    var floated = false;
    var originalHeight;
    var originalWidth;

    (function($) {
        $.fn.drags = function(opt) {

            opt = $.extend({handle:"",cursor:"move"}, opt);

            if(opt.handle === "") {
                var $el = this;
            } else {
                var $el = this.find(opt.handle);
            }

            return $el.css('cursor', opt.cursor).on("mousedown", function(e) {
                if(opt.handle === "") {
                    var $drag = $(this).addClass('draggable');
                } else {
                    var $drag = $(this).addClass('active-handle').parent().addClass('draggable');
                }
                var z_idx = $drag.css('z-index'),
                    drg_h = $drag.outerHeight(),
                    drg_w = $drag.outerWidth(),
                    pos_y = $drag.offset().top + drg_h - e.pageY,
                    pos_x = $drag.offset().left + drg_w - e.pageX;
                $drag.css('z-index', 1000).parents().on("mousemove", function(e) {
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
                });
                e.preventDefault(); // disable selection
            }).on("mouseup", function() {
                if(opt.handle === "") {
                    $(this).removeClass('draggable');
                } else {
                    $(this).removeClass('active-handle').parent().removeClass('draggable');
                }
            });

        }
    })(jQuery);

    // Keep track of the position of view and show small screen when original video div is out of view
    $(window).scroll(function() {
        if (floated == false && $(document).scrollTop() > $('.html5-video-container').offset().top + $('.html5-video-container').height()) {
            // 1. Create the mini screen div to hold the video
            $miniScreen = $('<div id="miniyoutube"></div');
            $miniScreen.css('top', 55);
            $miniScreen.css('left', $(window).width() - 380);

            // 2. Grab the video element
            $video = $('.video-stream');

            // 3. Store the current width and height to restore later
            originalWidth = $video.width();
            originalHeight = $video.height();

            // 4. Wrap the video into the small element div
            $video.wrap($miniScreen);
            // If video is paused after wrapping, play it!
            if ($video.get(0).paused) {
                $video.get(0).play();
            }

            // var player = document.getElementsByClassName("video-stream")[0];
            // $video.get(0).play();
            // 5. Set the width and height of the video to fit the div
            $video.css('width', '100%');
            $video.css('height', '100%');

            // 6. Activate the draggable feature of the small screen
            $('#miniyoutube').drags();

            // 7. Set flag to true
            floated = true;
        } else if (floated == true && $(document).scrollTop() <= $('.html5-video-container').offset().top + $('.html5-video-container').height()) {
            // Put back the screen when the user scrolls up to the original player
            // 1. Grab the video element
            $video = $('.video-stream');

            // 2. Restore the width and heigh of the video
            $video.css('width', originalWidth);
            $video.css('height', originalHeight);

            // 3. Take away the parent.
            $video.unwrap();
            // If video is paused after unwrapping, play it!
            if ($video.get(0).paused) {
                $video.get(0).play();
            }

            // 4. Set flag to false
            floated = false;
        }
    });
});