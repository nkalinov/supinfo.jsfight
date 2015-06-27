window.onload = function () {

    // export
    window.game = {

        // Global variables
        socket: io(),
        c: document.getElementById("canvas").getContext("2d"),
        c_width: 880, // canvas width
        c_height: 400, // canvas height
        keys: {
            39: "front", // ->
            37: "back", // <-
            40: "crouch", // down
            38: "jump", // up
            49: "block", // 1
            81: "punch", // q
            87: "kick", // w
            69: "special" // e
        },
        keys_monitor: [], // currently pushed keys
        player1: null, // local player
        player2: null, // remote player
        speed: 44, // speed (px)
        jumping: false, // to check if player is jumping
        cooldown: 0, // attacks cooldown

        init: function () {

            // global styles
            this.c.lineWidth = 2;
            this.c.lineCap = "round";
            this.c.lineJoin = "round";
            this.c.strokeStyle = "#fff";

            // init events
            this.initEvents();

            // counter
            minutesLabel = document.getElementById("minutes");
            secondsLabel = document.getElementById("seconds");

            // accept or send invite
            if (invite_accept) {
                this.socket.emit('accept-invite', {
                    id: invite_user,
                    username: invite_username
                });
            }
            else {
                this.socket.emit('send-invite', {id: invite_user});
            }

            // waiting text
            this.c.font = "30px Georgia";
            this.c.fillStyle = "#fff";
            this.c.fillText("Waiting for remote player...", 250, 350);
        },

        initEvents: function () {

            // keyboard events
            window.addEventListener("keydown", this.keydown.bind(this));
            window.addEventListener("keyup", this.keyup.bind(this));

            // socket events

            // decline invite
            this.socket.on('decline-invite', function (data) {
                alert(data.username + ' rejected the challenge!');
                window.location = site_url + '/lobby';
            });

            // start the game
            this.socket.on('play', function (data) {

                cc(game.c);

                if (invite_accept) {

                    // the host is on the left
                    game.player1 = new Player(game.c, 17 * game.speed, game.socket.id, false);
                    game.player2 = new Player(game.c, 2 * game.speed, data.id, true);

                    document.getElementById('username1').innerHTML = data.username;
                    document.getElementById('username2').innerHTML = window.username;
                }
                else {

                    // i'm the host
                    game.player1 = new Player(game.c, 2 * game.speed, game.socket.id, true);
                    game.player2 = new Player(game.c, 17 * game.speed, data.id, false);

                    document.getElementById('username2').innerHTML = data.username;
                    document.getElementById('username1').innerHTML = window.username;
                }

                // play
                window.counter = setInterval(setTime, 1000);
                game.play();
            });

            // on player move
            this.socket.on('move', function (data) {

                game.player2.x = data.x;
                game.player2.y = data.y;
                game.player2.stick = standing(game.c);
                game.player2.action = 'standing';

                whichSide(game.player1, game.player2);
            });

            // on player action
            this.socket.on('action', function (data) {

                // if we have action
                if (data.action) {

                    game.player2.action = data.action;
                    game.player2.stick = window[data.action](game.c); // change stick
                }
                else {

                    // reset stick
                    game.player2.action = 'standing';
                    game.player2.stick = standing(game.c);
                }

                // if action took me health
                if (data.points)
                    updateHealth(data.points, game.player1);
            });
        },

        play: function () {

            // clear canvas
            cc(this.c);

            // put players
            this.c.putImageData(this.player1.stick, this.player1.x, this.player1.y);
            this.c.putImageData(this.player2.stick, this.player2.x, this.player2.y);

            // still alive ?
            if (!this.player1.dead && !this.player2.dead)
                window.requestAnimFrame(this.play.bind(this));

            else {

                // game over
                clearInterval(counter);

                if (this.player1.dead) {
                    alert('You lost!');
                }
                else if (this.player2.dead) {
                    alert('You won!');
                }

                window.location = site_url + '/lobby';
            }
        },

        actions: {
            front: function () {

                // check if on border
                if (this.player1.x + this.speed >= this.c_width)
                    return;

                // check if player2 is on the right
                if (this.player1.left && nextToOther(this.player1, this.player2))
                    return;

                // if not blocking
                if (this.player1.action != 'block') {

                    // move
                    if (this.jumping)
                        this.player1.x += 2 * this.speed;
                    else
                        this.player1.x += this.speed;

                    this.socket.emit('move', {id: this.player2.id, x: this.player1.x, y: this.player1.y});

                    this.player1.action = 'standing';

                    whichSide(this.player1, this.player2);
                }
            },
            back: function () {

                // check if on border
                if (this.player1.x - this.speed < 0)
                    return;

                // check if player2 is on the left
                if (!this.player1.left && nextToOther(this.player1, this.player2))
                    return;

                // if not blocking
                if (this.player1.action != 'block') {

                    // move
                    if (this.jumping)
                        this.player1.x -= 2 * this.speed;
                    else
                        this.player1.x -= this.speed;

                    this.socket.emit('move', {id: this.player2.id, x: this.player1.x, y: this.player1.y});

                    this.player1.action = 'standing';

                    whichSide(this.player1, this.player2);
                }
            },
            jump: function () {

                // if not blocking
                if (this.player1.action != 'block') {

                    var obj = this;
                    obj.jumping = true;

                    var jump = setInterval(function () {

                        obj.player1.y -= 6;
                        obj.socket.emit('move', {id: obj.player2.id, x: obj.player1.x, y: obj.player1.y});

                        if (obj.player1.y <= 50) {
                            clearInterval(jump);

                            // go down
                            var down = setInterval(function () {

                                obj.player1.y += 6;
                                obj.socket.emit('move', {id: obj.player2.id, x: obj.player1.x, y: obj.player1.y});

                                if (obj.player1.y >= 220) {
                                    obj.jumping = false;
                                    clearInterval(down);
                                    obj.keys_monitor.splice(obj.keys_monitor.indexOf('jump'));
                                }
                            }, 10);
                        }
                    }, 10);
                }
            },
            crouch: function () {

                this.player1.stick = crouch(this.c);
                this.socket.emit('action', {id: game.player2.id, action: 'crouch'});
            },
            block: function () {

                this.player1.action = 'block';
                this.player1.stick = block(this.c);
                this.socket.emit('action', {id: game.player2.id, action: 'block'});
            },
            punch: function () {

                var points = 3; // damage

                // if not blocking and cool
                if (this.player1.action != 'block' && this.cooldown == 0) {

                    this.player1.stick = punch(this.c, this.player1.left);

                    if (this.player2.action != 'block' && nextToOther(this.player1, this.player2)) {
                        updateHealth(points, this.player2);
                        this.socket.emit('action', {id: game.player2.id, action: 'punch', points: points});
                    }

                    // cooldown
                    this.cooldown = 1;
                    var cooldown = setInterval(function () {
                        game.cooldown -= 1;
                        if (game.cooldown == 0)
                            clearInterval(cooldown);
                    }, 400);
                }
            },
            kick: function () {

                var points = 4; // damage

                // if not blocking and cool
                if (this.player1.action != 'block' && this.cooldown == 0) {

                    this.player1.stick = kick(this.c, this.player1.left);

                    if (this.player2.action != 'block' && nextToOther(this.player1, this.player2)) {
                        updateHealth(points, this.player2);
                        this.socket.emit('action', {id: game.player2.id, action: 'kick', points: points});
                    }

                    // cooldown
                    this.cooldown = 1;
                    var cooldown = setInterval(function () {
                        game.cooldown -= 1;
                        if (game.cooldown == 0)
                            clearInterval(cooldown);
                    }, 400);
                }
            },
            special: function () {

                var points = 5; // damage

                // if not blocking and cool
                if (this.player1.action != 'block' && this.cooldown == 0) {

                    this.player1.stick = special(this.c, this.player1.left);

                    if (this.player2.action != 'block' && nextToOther(this.player1, this.player2)) {
                        updateHealth(points, this.player2);
                        this.socket.emit('action', {id: game.player2.id, action: 'special', points: points});
                    }

                    // cooldown
                    this.cooldown = 1;
                    var cooldown = setInterval(function () {
                        game.cooldown -= 1;
                        if (game.cooldown == 0)
                            clearInterval(cooldown);
                    }, 500);
                }
            }
        },

        keydown: function (event) {

            event.preventDefault();
            event.stopPropagation();

            var _action = this.keys[event.keyCode];

            // execute action if not in monitor
            if (this.keys_monitor.indexOf(_action) == -1) {

                this.keys_monitor.push(_action);
                this.actions[_action].bind(this).apply();
            }

            return false;
        },

        keyup: function (event) {

            event.preventDefault();
            event.stopPropagation();

            var _action = this.keys[event.keyCode];

            // jump is removed in the function itself
            if (_action != 'jump')
                this.keys_monitor.splice(this.keys_monitor.indexOf(_action));

            // if block is released
            if (_action == 'block') {

                this.socket.emit('action', {id: game.player2.id});
                this.player1.action = 'standing';
            }

            // reset stick only if block is released
            if (this.player1.action != 'block') {

                this.player1.stick = standing(this.c);
                this.socket.emit('action', {id: game.player2.id});
            }

            return false;
        }
    };

    game.init();
};