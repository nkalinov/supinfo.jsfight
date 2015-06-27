var minutesLabel;
var secondsLabel;
var totalSeconds = 0;
var site_url = 'http://localhost:3000';

// time count-up
function setTime() {
    ++totalSeconds;
    secondsLabel.innerHTML = pad(totalSeconds % 60);
    minutesLabel.innerHTML = pad(parseInt(totalSeconds / 60));
}

// pad values
function pad(val) {
    var valString = val + "";
    if (valString.length < 2) {
        return "0" + valString;
    }
    else {
        return valString;
    }
}

// shim layer with setTimeout fallback
window.requestAnimFrame = (function () {
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function (callback) {
            window.setTimeout(callback, 1000 / 60);
        };
})();