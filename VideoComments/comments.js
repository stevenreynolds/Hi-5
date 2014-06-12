var width;     // player width
var videoid;   // id of the video
var duration;  // duration of the video

var comments = []; // array of all comments that reference time

var container;  // container of the video info section
var panel;      // ui button panel, above which we insert the timeline
var timeline;   // the actual timeline
var comment;    // an element containing the author's name and the comment
var pointer;    // shows the time referenced in the comment in the player

var player = {};     // the player element, so we can control it

var getDurationInterval;



$(function(){
    var f = $('#video1'),
    url = f.attr('src').split('?')[0],
    action;

// Listen for messages from the player
if (window.addEventListener){
    window.addEventListener('message', onMessageReceived, false);
}
else {
    window.attachEvent('onmessage', onMessageReceived, false);
}

// Handle messages received from the player
function onMessageReceived(e) {
    var data = JSON.parse(e.data);
console.log(data)

    switch (data.event) {
        case 'ready':
        onReady();
        break;

        case 'playProgress':
        onPlayProgress(data.data);
        break;

        case 'pause':
        onPause();
        break;

        case 'finish':
        onFinish();
        break;
    }

    switch (data.method) {
        case 'getDuration':
            console.log(data.value);
        break;

    }
}

function onReady() {
    console.log('Vimeo reeeeeeady')
    post('getDuration');
}

// Helper function for sending a message to the player
function post(action, value) {
    var data = { method: action };

    if (value) {
        data.value = value;
    }

    f[0].contentWindow.postMessage(JSON.stringify(data), url);
}

});




/**
 * Sets up the timeline based on the current video
 */
function onYouTubeIframeAPIReady() {
    //player.video = new YT.Player('movie_player');

    player.video = new YT.Player('movie_player', {
      height: '390',
      width: '640',
      //videoId: 'M7lc1UVf-VE',
      events: {
        'onReady': onPlayerReady,
        //'onStateChange': onPlayerStateChange
      }
    });

}

function onPlayerReady() {
    container = document.getElementById("video-content");
    if (container !== null) {
        panel = container.firstChild;
        
        // get all necessart player data
        iframe = document.getElementById("movie_player");
        width = 570;
        videoid = player.video;

        getDurationInterval = setInterval(getDuration, 50);       
        getDuration();

        // the timeline element holds all the avatars
        timeline = document.createElement("div");
        timeline.id = "timeline";
        timeline.className = "timeline";
        timeline = container.insertBefore(timeline, iframe.nextSibling);

        // the comment element displays the author's name and the comment
        comment = document.createElement("div");
        comment.className = "comment";
        comment = container.insertBefore(comment, timeline);

        // the pointer shows exact time reference in the comment on the video
        pointer = document.createElement("div");
        pointer.className = "pointer";
        pointer = container.insertBefore(pointer, timeline);

        // start gathering comments
        getComments();
    }
}

function getDuration() {
    if ('getDuration' in player.video){
        //duration = ytTimeToSeconds(player.video.getDuration());
        duration = player.video.getDuration();
        if(duration != '') {
            clearInterval(getDurationInterval);
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

    if ('seekTo' in player.video){
        player.video.seekTo(time, true);
    }
}

/*
// add mouse event handlers for comment displaying
$(document).on("mousemove", ".avatar", function(e) {
    // get the comment which belongs to this avatar
    var c = comments[e.target.id.substr(6)];
    // position the comment, so that it is exactly aligned with the avatar
    $(".comment").css("left", (c.left < 600 ? c.left + 40: 640)) .css("top", 0)
        // and fill the content
        .html("<strong>" + c.author + "</strong><br> " + c.comment).show();
    // add pointer to the time which the comment references
    $(".pointer").css("left", c.left).css("top", -30).show();
    // when the mouse leaves the avatar hide the pointer and the comment
}).on("mouseleave", ".avatar", function(e) {
    $(".pointer").hide();
    $(".comment").hide();
});
*/

// add an onclick event to the avatar, so we can seek to the referenced time
$(document).on("click", ".avatar", function(e) {
    e.preventDefault();
    // get the comment to which this avatar is linked
    var c = comments[e.target.id.substr(6)];
    // move the video to the desired time
    player.video.seekTo(c.time, true);
});



/**
 * By scanning comments from newest to oldest, finds all comments, which
 * reference a time
 * @param  {Integer} start  number of the comment to begin at
 */
function getComments(start) {
    // save the comment's data for later use
    var comment = {};
        comment.comment = 'Youpi';
        comment.author = 'Jojo';
        comment.uri = 'http://google.fr';

        // time converted to seconds from the beginning
        var seconds = 300;
        // the x-position of the avatar
        var pos = width / duration * seconds;
        comment.time = seconds;
        comment.seconds = seconds;
        comment.left = pos;

        // generate an avatar link and put it in timeline
        generateAvatar("avatar" + comments.length, comment);
        // save the comment data for later use
        comments.push(comment);

    var comment = {};
        comment.comment = 'Test';
        comment.author = 'Lalilou';
        comment.uri = 'http://lalilouuuuuu.fr';

        // time converted to seconds from the beginning
        var seconds = 42;
        // the x-position of the avatar
        var pos = width / duration * seconds;
        comment.time = seconds;
        comment.seconds = seconds;
        comment.left = pos;

        // generate an avatar link and put it in timeline
        generateAvatar("avatar" + comments.length, comment);
        // save the comment data for later use
        comments.push(comment);
}

/**
 * Generates an avatar for the given id and comment, looks up the author's
 * avatar based on author's uri from the comment object
 * @param  {String} id      id of the avatar
 * @param  {Object} comment object containing comment data
 */
function generateAvatar (id, c) {

    // create the avatar element
    var link = document.createElement("a");
        link.className = "avatar";
        //link.href = "/watch?v=" + videoid + "&t=" + comment.time;
        link.id = id;
        link.innerHTML = "<span><strong>" + c.author + "</strong><br> " + c.comment + '</span>';

        link = timeline.appendChild(link);

        var image = 'https://creativecommons.org/images/deed/cc-logo.jpg';

            // offset the avatar, so that it is below its referenced time
        $("#" + id).css("left", (c.left < 600 ? c.left : 600))
            .css("background-image", "url('" + image + "')");
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
