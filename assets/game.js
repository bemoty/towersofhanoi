/**
 * THE TOWERS OF HANOI
 *
 * The Towers is a simple mathematical puzzle, which consists of three rods and a number of disks 
 * of different sizes which can slide on any rod, thus forming a conical shape.
 *
 * @file   A JavaScript HTML5 solution to the Towers of Hanoi
 * @author Joshua Winkler
 * @since  17.02.2019
 * @license MIT
 */

// Canvas context
var canvas;
var ctx;

// Game elements
var sticks = new Map();
var circles = [];
var lastStick;
var isWon = false;
var isStarted = false;

// Game entry point
(function () { // DOM ready
    canvas = document.getElementById('primaryCanvas');
    ctx = canvas.getContext('2d');

    // Start game button click listener
    document.getElementById('continueButton').addEventListener('click', (event) => {
        document.getElementById('mod').className += ' fadeOut-modal';
        setTimeout(() => {
            document.getElementById('mod').style = 'display: none;';
            document.getElementById('mod-ov').style = 'display: none;';
        }, 980);
        fadeOut('mod-ov', 0.02, 10, 0.7);
        isStarted = true;
    });

    /**
     * Draws a centered rectangle on the canvas context
     * 
     * @param x the center x coordinate of the object
     * @param y the bottom y coordinate of the object
     * @param width the width of the object
     * @param height the height of the object
     * @returns upper left x and y coordinates of the object
     */
    ctx.fillRectCenter = function (x, y, width, height) {
        let _x = x - (width / 2);
        let _y = y - height;
        ctx.fillRect(_x, _y, width, height);
        return [_x, _y];
    }

    // Better fillRect
    ctx.translate(0.5, 0.5);

    // Initialize sticks and disks
    var disks = [];
    for (let i = 0; i < 8; i++) {
        disks.push(new Disk(0, i, 110 - (10 * i), 20));
    }
    for (let i = 0; i < 3; i++) {
        // set disks to first stick on load
        sticks.set(i, new Stick(i, 15, i == 0 ? disks : []));
    }

    // Setup stage for the first time
    setupGameStage();

    console.log('%cTowers of Hanoi V1.1', 'font-size: 35pt; color: blue; text-stroke-width: 1px; text-stroke-color: black;');
    console.log('%c(No cheating!)', 'font-size: 8pt;');
})();

// On resize reset stage
window.onresize = function (event) {
    setupGameStage();
};

// Key handler (reset on esc)
window.onkeydown = function (event) {
    if (!isStarted) { // Key handler for intro modal
        switch (event.key) {
            case "Enter":
                document.getElementById('continueButton').click();
                break;
        }
    }
    if (isStarted && !isWon) { // Don't allow key input in intro or end stage
        switch (event.key) {
            case 'Escape':
                if (lastStick != undefined) {
                    sticks.get(lastStick).toggleCircle();
                    lastStick = undefined;
                    setupGameStage(); // reload game stage
                }
                break;
            case '1':
            case 'End':
                sticks.get(0).click(null, null);
                break;
            case '2':
            case 'ArrowDown':
                sticks.get(1).click(null, null);
                break;
            case '3':
            case 'PageDown':
                sticks.get(2).click(null, null);
                break;
        }
    }
}

// Canvas click listener
canvas.addEventListener('click', function (event) {
    for (let e of sticks) {
        if (e[1].checkClicked(event.clientX, event.clientY)) {
            e[1].click(event.clientX, event.clientY);
            break;
        }
    }
}, false);

/**
 * Generic fade out effect for HTML DOM elements
 * 
 * @param {string} id the id of the DOM element to be faded out
 * @param {number} delta the alpha to be taken away from the element every 'time's
 * @param {number} time the iteration time
 * @param {number} initOpacity the initial opacity of the element
 */
function fadeOut(id, delta, time, initOpacity) {
    var fadeTarget = document.getElementById(id);
    var fadeEffect = setInterval(function () {
        if (!fadeTarget.style.opacity) {
            fadeTarget.style.opacity = initOpacity;
        }
        if (fadeTarget.style.opacity > 0) {
            fadeTarget.style.opacity -= delta;
        } else {
            clearInterval(fadeEffect);
        }
    }, time);
}

/**
 * Sets up the game background & draws all game elements
 */
function setupGameStage() {
    if (!isWon) {
        // set canvas width and height
        var rect = canvas.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;

        // Clear canvas, move 0,0 to unblur rect
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.translate(-0.5, -0.5);

        // Background
        ctx.fillStyle = '#b8b8b8';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Floor
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, Math.max(500, canvas.height - 150), canvas.width, canvas.height);

        // Redraw all elements
        drawAll();
    }
}

/**
 * Draws all game elements (such as sticks, disks and circles)
 */
function drawAll() {
    sticks.forEach((stick) => {
        for (let i = 0; i < stick.disks.length; i++) {
            // only draw if disk is defined
            if (typeof stick.disks[i].draw === 'function') {
                stick.disks[i].draw();
            }
        }
        stick.draw();
    });
    circles.forEach((circle) => {
        circle.draw();
    });
}

var alphaBG = 0;

/**
 * Checks if the game is won (8 disks on last stick)
 */
function checkWin() {
    if (sticks.get(2).disks.length === 8 && !isWon) {
        alphaBG = 0;
        drawWinAnimation();
    }
}

/**
 * Ends the game, only invoke if user has won game!
 */
function drawWinAnimation() {
    isWon = true;
    alphaBG += 0.01;
    ctx.fillStyle = '#000000';
    if (alphaBG >= 1) {
        document.getElementById('winTitle').className += 'display';
        document.getElementById('winHead').className += 'fadeIn';
        setTimeout(() => {
            document.getElementById('winSub').className += 'fadeIn';
        }, 1000);
        return;
    } else {
        ctx.globalAlpha = alphaBG;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    requestAnimationFrame(drawWinAnimation);
}

/**
 * Represents a stick (Hanoi Tower) – stores Hanoi disks
 * 
 * @param {number} position the position of the tower (0, 1, 2 ...)
 * @param {number} width the graphical width of the tower
 * @param {Disk[]} disks the initial disks of the tower
 */
function Stick(position, width, disks) {
    this.position = position;
    this.width = width;
    this.disks = disks;
    this.circled = false;

    /**
     * Draws the stick to the canvas
     */
    this.draw = function () {
        ctx.fillStyle = '#000000';
        let coords = ctx.fillRectCenter(canvas.width / 4 * (position + 1), 150,
            width, canvas.height * -1);
        this.x = coords[0];
        this.y = coords[1];
    }

    /**
     * Toggles the selection circle for this stick so it gets drawn on the next drawAll()
     */
    this.toggleCircle = function () {
        circles.pop();
        circles.push(new Circle(this, 60, 20, this.circled));
        this.circled = !this.circled;
    }

    /**
     * Checks if a disk can be added to the current stick disk stack
     * 
     * @param {Disk} disk the disk to be added
     * @returns {boolean} true if the disk can be added, false otherwise
     */
    this.canAdd = function (disk) {
        let upperDisk = this.disks[this.disks.length - 1];
        if (upperDisk === undefined || this === sticks.get(lastStick) || disk.width < this.disks[this.disks.length - 1].width) {
            return true;
        }
        return false;
    }

    /**
     * Called by the Canvas click event listener to check if this stick was clicked
     * 
     * @returns  {boolean} true if the stick was clicked, false otherwise
     */
    this.checkClicked = function (_x, _y) {
        return _x > this.x && _x < this.x + this.width && _y < this.y - 300 && _y > this.y + canvas.height * -1;
    }

    /**
     * Called by the Canvas click event listener if this stick was clicked
     */
    this.click = function (x, y) {
        if (typeof lastStick !== 'number') { // copy from
            if (this.disks.length != 0) { // can't move from empty sticks
                this.toggleCircle();
                lastStick = position;
            }
        } else { // copy to
            // Check if this turn is valid
            if (this.canAdd(sticks.get(lastStick).disks[sticks.get(lastStick).disks.length - 1])) {
                this.disks.push(sticks.get(lastStick).disks.pop());
                this.disks[this.disks.length - 1].stick = this.position;
                this.disks[this.disks.length - 1].position = this.disks.length - 1;
                sticks.get(lastStick).toggleCircle();
                lastStick = undefined;
            }
        }
        setupGameStage(); // refresh game stage
        checkWin();
    }
}

/**
 * Represents a Hanoi disk stored on a Hanoi tower
 * 
 * @param {number}} stick the tower on which the disk is stored
 * @param {number} position the position of the disk on the tower (0 is lowest)
 * @param {number} width the width of the disk
 * @param {number} height the height of the disk
 */
function Disk(stick, position, width, height) {
    this.stick = stick;
    this.position = position;
    this.width = width;
    this.height = height;

    /**
     * Draws the disk to the canvas
     */
    this.draw = function () {
        ctx.fillStyle = '#D80000';
        ctx.fillRectCenter(canvas.width / 4 * (this.stick + 1), Math.max(500, (canvas.height - 150)) - ((this.position + 1) * 25),
            this.width, this.height);
    }
}

/**
 * Represents a selection circle placed above a Hanoi tower on click
 * 
 * @param {Stick} x the stick the circle is hovering over
 * @param {number} y the Y coordinate of the circle
 * @param {number} radius the radius of the circle
 * @param {boolean} toggle whether the circle should be shown or not
 */
function Circle(stick, y, radius, toggle) {
    this.stick = stick;
    this.y = y;
    this.radius = radius;
    this.toggle = toggle;
    this.rgb = [155, 31, 76];

    /**
     * Draws the circle to the canvas
     */
    this.draw = function () {
        ctx.beginPath();
        ctx.arc(this.stick.x + this.stick.width / 2, this.y, this.radius, 0, 2 * Math.PI);
        if (!this.toggle) {
            ctx.fillStyle = `rgb(${this.rgb[0]}, ${this.rgb[1]}, ${this.rgb[2]})`;
        } else {
            ctx.fillStyle = '#b8b8b8';
        }
        ctx.fill();
    }
}