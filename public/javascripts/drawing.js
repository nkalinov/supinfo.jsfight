// clear canvas
function cc(c) {
    c.clearRect(0, 0, 900, 400);
}

// The stick (44 x 112)
function standing(c) {

    drawLimbs(c, 22, 112, 5); // legs
    drawLimbs(c, 22, 72, 5); // arms

    // body
    line(c, 22, 72, 22, 32);

    // head
    circle(c, 22, 17, 15);

    return c.getImageData(0, 0, 44, 112);
}

function crouch(c) {

    drawLimbs(c, 22, 122);
    drawLimbs(c, 22, 92);

    line(c, 22, 82, 22, 62);

    circle(c, 22, 47, 15);

    return c.getImageData(0, 0, 44, 112);
}

function punch(c, right) {

    drawLimbs(c, 22, 112, 5);

    if(right) {
        line(c, 22, 32, 44, 42);
        line(c, 22, 32, 6, 72);
    }
    else {
        line(c, 22, 32, 40, 72);
        line(c, 22, 32, 0, 42);
    }

    line(c, 22, 72, 22, 32);

    circle(c, 22, 17, 15);

    return c.getImageData(0, 0, 44, 112);
}

function kick(c, right) {

    drawLimbs(c, 22, 72, 2); // arms

    if(right) {
        line(c, 22, 72, 54, 82);
        line(c, 22, 72, 6, 112);
    }
    else {
        line(c, 22, 72, 44, 112);
        line(c, 22, 72, 0, 82);
    }

    line(c, 22, 72, 22, 32);

    circle(c, 22, 17, 15);

    return c.getImageData(0, 0, 44, 112);
}

function block(c) {

    drawLimbs(c, 22, 112, 5); // legs

    line(c, 22, 42, 40, 42);
    line(c, 22, 42, 0, 42);

    line(c, 22, 72, 22, 32);
    circle(c, 22, 17, 15);

    return c.getImageData(0, 0, 44, 112);
}

function special(c, right) {

    drawLimbs(c, 22, 112, 5); // legs
    drawLimbs(c, 22, 72, 5); // arms

    // body
    line(c, 22, 72, 22, 32);

    // head
    if(right)
        circle(c, 30, 21, 15);
    else
        circle(c, 14, 21, 15);


    return c.getImageData(0, 0, 44, 112);
}

// limbs. distance for the steps
function drawLimbs(c, x, y, distance) {

    // at rest, the legs are spread by 2*20 pixels
    var spread = 20;

    // if we have a distance parameter, we are moving (otherwise we are at rest)
    if (distance !== undefined) {

        if (distance < 0)
            distance = -distance;

        // compute where in a step we are
        var thisStep = distance % 40;

        spread = 20 - thisStep;
    }

    line(c, x - spread, y, x, y - 40);
    line(c, x + spread, y, x, y - 40);
}

function line(c, x1, y1, x2, y2) {
    c.beginPath();
    c.moveTo(x1, y1);
    c.lineTo(x2, y2);
    c.stroke();
}

function circle(c, x, y, r) {
    c.beginPath();
    c.fillStyle = "#000";
    c.arc(x, y, r, 0, Math.PI * 2, false); // 6.3 is bigger than 2π so the arc will be a whole circle
    c.fill();
    c.stroke();
}