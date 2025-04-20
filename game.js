const FLOOR_HEIGHT = 100;
const JUMP_FORCE = 1000;
const SPEED = 480;

// initialize context
kaboom({
    width: 1280,
    height: 720,
    letterbox: true
});

setBackground(141, 183, 255);

loadSprite("floor", "/sprites/floor.png"); 


// Load the frames for the animation
loadSprite("sprite", "/sprites/sprite.png", {
    sliceX: 5, // Number of frames in the sprite sheet
    anims: {
        run: {
            from: 0,
            to: 3,
            loop: true,
        },
        jump: {
            from: 4,
            to: 4,
            loop: false,
        },
    },
});

scene("game", () => {
    // define gravity
    setGravity(3000);

    // Add a game object to screen
    const player = add([
        sprite("sprite"),
        pos(80, 40),
        area(),
        body(),
        scale(0.3),
    ]);

    // Play the running animation
    player.play("run");

    // Track if the player is currently jumping
    let jumping = false;

    // Resume run animation when player lands
    player.onGround(() => {
        if (jumping) {
            player.play("run");
            jumping = false;
        }
    });

    // floor
     const floorWidth = 1280 * 0.05; 
    for (let i = 0; i < width()/floorWidth; i++) { 
     add([
      sprite("floor"), 
      pos(i * floorWidth, height() - FLOOR_HEIGHT),
       area(),
        body({ isStatic: true }), 
        scale(0.032), 
         ]); 
          }

    function jump() {
        if (player.isGrounded()) {
            jumping = true;
            player.jump(JUMP_FORCE);
            player.play("jump"); // Play jump animation
        }
    }

    // jump when user press space or clicks
    onKeyPress("space", jump);
    onClick(jump);

    function spawnTree() {
        // add tree obj
        add([
            rect(48, rand(32, 96)),
            area(),
            outline(4),
            pos(width(), height() - FLOOR_HEIGHT),
            anchor("botleft"),
            color(238, 143, 203),
            move(LEFT, SPEED),
            offscreen({ destroy: true }),
            "tree",
        ]);

        // wait a random amount of time to spawn next tree
        wait(rand(0.5, 1.5), spawnTree);
    }

    // start spawning trees
    spawnTree();

    // lose if player collides with any game obj with tag "tree"
    player.onCollide("tree", () => {
        // go to "lose" scene and pass the score
        go("lose", score);
        burp();
        addKaboom(player.pos);
    });

    // keep track of score
    let score = 0;

    const scoreLabel = add([
        text(score),
        pos(24, 24),
    ]);

    // increment score every frame
    onUpdate(() => {
        score++;
        scoreLabel.text = score;
    });
});

scene("lose", (score) => {
    add([
        sprite("sprite"),
        pos(width() / 2, height() / 2 - 64),
        scale(2),
        anchor("center"),
    ]);

    // display score
    add([
        text(score),
        pos(width() / 2, height() / 2 + 64),
        scale(2),
        anchor("center"),
    ]);

    // go back to game with space is pressed
    onKeyPress("space", () => go("game"));
    onClick(() => go("game"));
});

go("game");
	 
