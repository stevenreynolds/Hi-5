$(function(){

    var vimeoPlayer = document.querySelector('iframe');

    $f(vimeoPlayer).addEvent('ready', ready);

    function ready(player_id) {

        froogaloop = $f(player_id);

        function setupEventListeners() {
            function onPlay() {
                froogaloop.addEvent('play',
                function(data) {

                    froogaloop.api('getCurrentTime', function(value) {
                        console.log(value)
                    });
                    
                    console.log('play event');
                });
            }

            function onPause() {

                froogaloop.addEvent('pause',
                function(data) {
                    console.log('pause event');
                });
            }

            function onFinish() {
                froogaloop.addEvent('finish',
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

})