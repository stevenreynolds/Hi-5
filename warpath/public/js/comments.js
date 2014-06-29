var width;     // player width
var videoid;   // id of the video
var duration;  // duration of the video

var comments = new Array(); // array of all comments that reference time

var container;  // container of the video info section
var panel;      // ui button panel, above which we insert the timeline
var timeline;   // the actual timeline
var comment;    // an element containing the author's name and the comment
var pointer;    // shows the time referenced in the comment in the player

var player = {};     // the player element, so we can control it
var videoType;

var getDurationInterval;

/**
 * Sets up the timeline based on the current video
 */
function onYouTubeIframeAPIReady() {

    $(function(){

    if( $("#video").hasClass('youtube') ) {
        videoType = 'youtube';
        console.log('Youtube reeeeeeady')

        player.video = new YT.Player('video', {
          height: '390',
          width: '640',
          //videoId: 'M7lc1UVf-VE',
          events: {
            'onReady': onPlayerReady,
            //'onStateChange': onPlayerStateChange
          }
        });
    }

    });

}

$(function(){
    if(localStorage && localStorage.length > 0 && localStorage.getItem('comments')){
        comments = JSON.parse(localStorage.getItem('comments'));
    } else {
        localStorage.setItem('comments', JSON.stringify(comments));
    }
    
    if ( $("#video").hasClass('vimeo') ){
        videoType = 'vimeo';

        //var vimeoPlayer = document.querySelector('iframe');
        var vimeoPlayer = $('#video')[0];

        $f(vimeoPlayer).addEvent('ready', ready);

        function ready(player_id) {

            player = $f(player_id);

            onPlayerReady();

            function setupEventListeners() {
                function onPlay() {
                    player.addEvent('play',
                    function(data) {
                        console.log('play event');
                    });
                }
                function onPause() {
                    player.addEvent('pause',
                    function(data) {
                        console.log('pause event');
                    });
                }
                function onFinish() {
                    player.addEvent('finish',
                    function(data) {
                        console.log('finish');
                    });
                }
                onPlay();
                onPause();
                onFinish();
            }
            setupEventListeners();
        }

    }

});


function onPlayerReady() {
    if(videoType === 'vimeo'){
        console.log('Vimeo reeeeeeady')
    }

    container = document.getElementById("video-content");
    if (container !== null) {
        panel = container.firstChild;
        
        // get all necessart player data
        iframe = document.getElementById("video");
        width = 570;
        videoid = $('#video-content').data('video');

        timeline = document.getElementById("timeline");

        getDurationInterval = setInterval(getDuration, 50);
        getDuration(function(val){
            if(val)
                duration = val;

            getComments();
        })
        
    }
}

function getDuration(callback) {
    if(videoType === 'vimeo'){
        clearInterval(getDurationInterval);

        player.api('getDuration', function(value) {
            duration = value;

            if(callback && value)
                callback(value);
            else
                return duration;
        });
    } else {
        if ('getDuration' in player.video){
            //duration = ytTimeToSeconds(player.video.getDuration());
            duration = player.video.getDuration();
            if(duration != '') {
                clearInterval(getDurationInterval);
            }
            if(callback)
                callback(value);
            else
                return duration;
        }
    }

}

function setCurrentTime(time) {
    // if ('getPlayerState' in player.video){
    //     var playerState = player.video.getPlayerState();
    //     alert(playerState)
    //     if(playerState == -1){
    //         player.video.playVideo();
    //     }
    // }
    if(videoType === 'vimeo'){
        player.api('seekTo', time);
    } 
    else {
        if ('seekTo' in player.video){
            player.video.seekTo(time, true);
        }
    }
    
}

function getCurrentTime(callback) {
    if(videoType === 'vimeo'){
        player.api('getCurrentTime', function(value) {
            callback(value);
        });
    } 
    else {
        if ('getCurrentTime' in player.video){
            callback(player.video.getCurrentTime());
        }
    }
}

// add an onclick event to the avatar, so we can seek to the referenced time
$(document).on("click", ".avatar", function(e) {
    e.preventDefault();
    // get the comment to which this avatar is linked
    var c = comments[e.target.id.substr(6)];
    // move the video to the desired time
    setCurrentTime(c.time);
});


/**
 * By scanning comments from newest to oldest, finds all comments, which
 * reference a time
 * @param  {Integer} start  number of the comment to begin at
 */
function getComments(start) {

    $.getJSON('/comments/' + videoid, function(data) {
        $.each( data, function( index, comment ){
            generateAvatar("avatar" + index, comment);
        });
    });

}

$(document).on('submit','#comment-form',function(e){
    e.preventDefault();

    getCurrentTime(function(seconds){

        var comment = {};
        comment.id = $('#video-content').data('video');
        comment.body = $('#comment').val();
        comment.timestamp = seconds;

        console.log(comment)

        $.post("/comments", comment, function(data) {
            console.log(data)

            getComments();
        });

    });

});

/**
 * Generates an avatar for the given id and comment, looks up the author's
 * avatar based on author's uri from the comment object
 * @param  {String} id      id of the avatar
 * @param  {Object} comment object containing comment data
 */
function generateAvatar(id, c) {

    // create the avatar element
    var link = document.createElement("a");
        link.className = "avatar";
        //link.href = "/watch?v=" + videoid + "&t=" + comment.time;
        link.id = id;
        //link.innerHTML = "<span><strong>" + c.author + "</strong><br> " + c.comment + '</span>';
        link.innerHTML = "<div><span>" + c.body + '</span></div>';
        link = timeline.appendChild(link);

        var pos = 100 / duration * c.timestamp;
        $("#" + id).css({"left":pos+'%', "background-image":"url('" + c.image + "')"});
}

/**
 * Converts the given time string in hh:mm:ss or mm:ss into seconds
 * @param  {String} time  string in the format hh:mm:ss or mm:ss
 * @return {Integer}      time converted into seconds
 */
function toSeconds (time) {
    // if the time is undefined, get out
    if (typeof time === "undefined") return 0;

    // split the time string into hours, minutes, seconds or minutes, seconds
    timeArray = time.split(":");
    var hrs, mins, secs;

    // the format is hh:mm:ss
    if (timeArray.length === 3) {
        hrs = parseInt(timeArray[0], 10);
        mins = parseInt(timeArray[1], 10);
        secs = parseInt(timeArray[2], 10);
    }

    // the format is mm:ss
    if (timeArray.length === 2) {
        hrs = 0;
        mins = parseInt(timeArray[0], 10);
        secs = parseInt(timeArray[1], 10);
    }

    return hrs * 3600 + mins * 60 + secs;
}

/**
 * converts the given time string in hh:mm:ss or mm:ss into seconds
 * @param  {String} time  string in the format hh:mm:ss or mm:ss
 * @return {String}      time converted into "youtube" link time
 */
function toHms (time) {
    // if the time is undefined, get out
    if (typeof time === "undefined") return "";

    // split the time string into hours, minutes, seconds or minutes, seconds
    timeArray = time.split(":");
    var hrs, mins, secs;

    // the format is hh:mm:ss
    if (timeArray.length === 3) {
        return  timeArray[0] + "h" +
                timeArray[1] + "m" +
                timeArray[2] + "s";
    }

    // the format is mm:ss
    if (timeArray.length === 2) {
        return  timeArray[0] + "m" +
                timeArray[1] + "s";
    }

    // there must have been an errorx
    return "";
}

/**
 * Converts the given youtube time string in 11m22s into seconds
 * @param  {String} time   time in the format 11m22s or 22s
 * @return {Integer}       time converted in seconds
 */
function ytTimeToSeconds (time) {
    // if the time is undefined, get out
    if (typeof time === "undefined") return 0;
    // get rid of the PT prefix
    time = time.substr(2);

    // find where minutes and and seconds end
    var m = time.indexOf("M");
    var s = time.indexOf("S");
    var mins = 0;
    var secs = 0;

    // if there are any minutes
    if (m > 0) {
        mins = time.substring(0, m);
        secs = time.substring(m + 1, s);
    // there are no minutes
    } else {
        secs = time.substring(0, s);
    }

    return parseInt(mins, 10) * 60 + parseInt(secs, 10);
}
