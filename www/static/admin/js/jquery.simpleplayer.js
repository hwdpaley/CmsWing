/*
 * SimplePlayer - A jQuery Plugin
 * @requires jQuery v1.4.2 or later
 *
 * SimplePlayer is a html5 audio player
 *
 * Licensed under the MIT:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * Copyright (c) 2010-, Yuanhao Li (jay_21cn -[at]- hotmail [*dot*] com)
 */
(function ($) {
    $.fn.player = function (settings) {
        var config = {
            progressbarWidth: '200px',
            progressbarHeight: '5px',
            progressbarColor: '#22ccff',
            progressbarBGColor: '#eeeeee',
            defaultVolume: 0.8,
        };

        if (settings) {
            $.extend(config, settings);
        }

        var playControl = '<div class="simpleplayer-play-control"></div>';
        var stopControl = '<div class="simpleplayer-stop-control"></div>';

        var currentControl = '<span class="simpleplayer-current-time">00:00:00</span>';
        var totalControl = '<span class="simpleplayer-total-time">00:00:00</span>';

        this.each(function () {
            $(this).before('<div class="simple-player-container">');
            $(this).after('</div>');
            $(this).parent().find('.simple-player-container').prepend(
                '<ul style="width: 100%;margin: 0 auto;text-align: center;">' +
                '<li style="display: block;width: 50px; margin: 0 auto;height: 50px;">' +
                '<a class="start-button" href="javascript:void(0)">' + playControl + '</a>' +
                '</li>' +
                '<li>'+ currentControl +'</li>' +
                '<li class="progressbar-wrapper" style="width: ' + config.progressbarWidth + ';">' +
                '<span style="background-color: ' + config.progressbarBGColor + '; width: 100%;margin-bottom: 2px;">' +
                '<span class="progressbar"' + 'style="height:' + config.progressbarHeight + ';background-color:' + config.progressbarColor + ';width: 0%;">' + '</span></span>' +
                '</li>' +
                '<li>' + totalControl + '</li>' +
                '</ul>'
            );

            var auto_rotatepicture = $(".share_head");

            var simplePlayer = $(this).get(0);
            var button = $(this).parent().find('.start-button');
            var progressbarWrapper = $(this).parent().find('.progressbar-wrapper');
            var progressbar = $(this).parent().find('.progressbar');

            var current = $(this).parent().find('.simpleplayer-current-time');
            var total = $(this).parent().find('.simpleplayer-total-time');

            simplePlayer.volume = config.defaultVolume;

            button.click(function () {
                if (simplePlayer.paused) {
                    /*stop all playing songs*/
                    $.each($('audio'), function () {
                        this.pause();
                        $(this).parent().find('.simpleplayer-stop-control').addClass('simpleplayer-play-control').removeClass('simpleplayer-stop-control');
                    });
                    simplePlayer.play();
                    $(this).find('.simpleplayer-play-control').addClass('simpleplayer-stop-control').removeClass('simpleplayer-play-control');
                    auto_rotatepicture.addClass("autoRotate");
                } else {
                    simplePlayer.pause();
                    $(this).find('.simpleplayer-stop-control').addClass('simpleplayer-play-control').removeClass('simpleplayer-stop-control');
                    auto_rotatepicture.removeClass("autoRotate");
                }
            });

            progressbarWrapper.click(function (e) {
                if (simplePlayer.duration != 0) {
                    left = $(this).offset().left;
                    offset = e.pageX - left;
                    percent = offset / progressbarWrapper.width();
                    duration_seek = percent * simplePlayer.duration;
                    simplePlayer.currentTime = duration_seek;
                }
            });


            $(simplePlayer).bind('ended', function (evt) {
                simplePlayer.pause();
                button.find('.simpleplayer-stop-control').addClass('simpleplayer-play-control').removeClass('simpleplayer-stop-control');
                progressbar.css('width', '0%');
            });

            $(simplePlayer).bind('timeupdate', function (e) {
                duration = this.duration;
                time = this.currentTime;

                current.text(secondsTominutes(time));
                total.text(secondsTominutes(duration));

                fraction = time / duration;
                percent = fraction * 100;
                if (percent) progressbar.css('width', percent + '%');
            });

            if (simplePlayer.duration > 0) {
                $(this).parent().css('display', 'inline-block');
            }

            if ($(this).attr('autoplay') == 'autoplay') {
                button.click();
            }
        });

        return this;
    };

    //视频时长转换
    function secondsTominutes(str) {
        var time = parseInt(str);
        // console.log(time);
        // 超出一小时
        var hour = parseInt(time / 3600);
        var hourmore = parseInt(time % 3600);
        var min = parseInt(hourmore / 60);
        var seconds = parseInt(hourmore % 60);
        return caucleCount(hour) + ':' + caucleCount(min) + ':' + caucleCount(seconds);
    }

    function caucleCount(i) {
        if (i < 10)
            return '0' + i;
        return i;
    }

})(jQuery);
