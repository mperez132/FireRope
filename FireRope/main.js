// The title of the game to be displayed on the title screen
title = "FIRE ROPE";

// The description, which is also displayed on the title screen
description = `
[Tap] Jump
`;

// The array of custom sprites
characters = [
`
llllll
ll l l
ll l l
llllll
llllll
llllll
  
`
];

// Game design variable container
const G = {
	WIDTH: 100,
	HEIGHT: 150,
};

// Game runtime options
// Refer to the official documentation for all available options
options = {
    isCapturing: true,
    isCapturingGameCanvasOnly: true,
    theme: "dark",
    isPlayingBgm: true,
    isReplayEnabled: true,
    captureCanvasScale: 2,
    seed: 3,
};

// JSDoc comments for typing
/**
 * @typedef {{
 * pos: Vector,
 * speed: number
 * }} Star
 */

/**
 * @type { Star [] }
 */
let stars;

/** @type { { x: number, angle: number, radius: number, size: number, speed: number, count: number } } */
let rope;

/**
 * @typedef {{
 * pos: Vector, mode: "stand" | "jump"
 * }} Player
 */

/** @type { { pos: Vector, vy: number, mode: "stop" | "run" | "stand" | "jump",  } } */
let player;

let counter;

// The game loop function
function update() {
    // The init function running at startup
    let temp = rnd(0,100)
	if (!ticks) {
        // A CrispGameLib function
        // First argument (number): number of times to run the second argument
        // Second argument (function): a function that returns an object. This
        // object is then added to an array. This array will eventually be
        // returned as output of the times() function.
		stars = times(20, () => {
            // Random number generator function
            // rnd( min, max )
            const posX = rnd(0, G.WIDTH);
            const posY = rnd(0, G.HEIGHT);
            // An object of type Star with appropriate properties
            return {
                // Creates a Vector
                pos: vec(posX, posY),
                // More RNG
                speed: rnd(0.5, 1)
            };
        });

        rope = undefined;
        player = { pos: vec(0,75), vy: 0, mode: "stop" };
        // pos: vec(G.WIDTH * 0.5, G.HEIGHT * 0.85), mode: "stand"
	}
    if (temp > 50) {
        color("red")
    }
    else if (temp < 50) {
        color("yellow")
    }
    if (!rope) {
        rope = {
          x: 0,
          angle: 180,
          radius: rnd(30, 45),
          size: rnd(5, 10),
          speed: rnd(1, 1.2) * difficulty,
          count: !ticks ? 2 : rndi(2, 6),
        };
        if (rnd() < 0.2) { 
          rope.speed *= -1;
        }
    }
    rope.x -= (rope.x - 50) * 0.1;
    const pa = wrap(rope.angle - PI / 2, -PI, PI);
    rope.angle += rope.speed * (0.02);
    const a = wrap(rope.angle - PI / 2, -PI, PI);
    const ry = 91 - rope.size / 2 - rope.radius + sin(rope.angle) * rope.radius;
    box(rope.x + cos(rope.angle) * rope.radius, ry, rope.size, rope.size);
    particle(
      rope.x + cos(rope.angle) * rope.radius,
      ry,
      4,
      1,
      -PI,
      PI
    )
    color("red")
    text(`${rope.count}`, 50, 10);
    if (pa * a < 0 && abs(a) < PI / 2) {
        if (player.mode === "jump") {
          play("powerUp");
          rope.count--;
          let s = 85 - rope.size - player.pos.y;
          if (s < 0) {
            s = 1;
          }
          s = floor(100 / s);
          addScore(s, player.pos);
          if (rope.count === 0) {
            play("coin");
            rope = undefined;
            player.mode = "stop";
          }
        } else {
          play("hit");
        }
    }
    if (player.mode === "stop") {
        player.pos.x += (50 - player.pos.x) * 0.1;
        if (player.pos.y === 90 && input.isJustPressed) {
          play("select");
          player.mode = "run";
        }
    }
      if (player.mode === "run") {
        player.pos.x += difficulty * 2;
        if (player.pos.x > 50) {
          player.pos.x = 50;
          player.mode = "stand";
        }
    }
    if (player.mode === "stand") {
        if (input.isPressed) {
          play("jump");
          player.vy = -3;
          player.mode = "jump";
        }
    }
    if (player.mode === "jump" || player.mode === "stop") {
        player.vy += (input.isPressed ? 0.1 : 0.2) * sqrt(difficulty);
        player.pos.y += player.vy;
        if (player.pos.y > 90) {
          player.pos.y = 90;
          if (player.mode === "jump") {
            player.mode = "stand";
          }
        }
    }
    color("light_black");
    rect(0, 90, 110, 10);
    // color("cyan");
    color ("black");
    // box(player.pos, 4);
    const c1 = char("a", player.pos.x, player.pos.y - 3).isColliding.rect.yellow || char("a", player.pos.x, player.pos.y - 3).isColliding.rect.red;
    if (c1) {
      play("explosion");
      end();
    }
    // Update for Star
    stars.forEach((s) => {
        // Move the star downwards
        s.pos.y += s.speed;
        temp = rnd(90, 100)
        // Bring the star back to top once it's past the bottom of the screen
        if (s.pos.y > temp) s.pos.y = 0;

        // Choose a color to draw
        color("light_blue");
        // Draw the star as a square of size 1
        box(s.pos, 1);
    });


}