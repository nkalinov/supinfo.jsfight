/**
 * Player class
 * @param c
 * @param x
 * @param id
 * @param left
 * @constructor
 */
var Player = function (c, x, id, left) {
    this.id = id;
    this.stick = standing(c);
    this.x = x; // x position
    this.y = 220; // y position
    this.left = left; // on the left side
    this.life = 100; // health
    this.dead = false; // dead status
    this.action = 'standing'; // current action
};

/**
 * Check on which side the players are
 * @param p1
 * @param p2
 */
function whichSide(p1, p2) {

    // p1 is on the right
    if (p1.x > p2.x) {

        p1.left = false;
        p2.left = true;
    }
    else {

        p1.left = true;
        p2.left = false;
    }
}

/**
 * Check if p1 is next to p2
 * @param p1
 * @param p2
 * @returns {boolean}
 */
function nextToOther(p1, p2) {

    return ((p1.x + p1.stick.width) + 1 > p2.x &&
    (p2.x + p2.stick.width) + 1 > p1.x &&
    p1.y < p2.y + p2.stick.height &&
    p1.stick.height + p1.y > p2.y);
}

/**
 * Update player's health
 * @param points
 * @param player
 */
function updateHealth(points, player) {

    var bar = null;
    player.life = player.life - points;

    // update my bar
    if (player.id == game.player1.id) {

        if (invite_accept)
            bar = document.getElementById('bar2').firstChild;
        else
            bar = document.getElementById('bar1').firstChild;
    }
    // update remote player's bar
    else if (player.id == game.player2.id) {

        if (invite_accept)
            bar = document.getElementById('bar1').firstChild;
        else
            bar = document.getElementById('bar2').firstChild;
    }

    bar.style.width = player.life + '%';

    checkDead();
}

function checkDead() {
    if (game.player1.life <= 0)
        game.player1.dead = true;
    else if (game.player2.life <= 0)
        game.player2.dead = true;
}