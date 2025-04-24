const FLOOR_HEIGHT = 64;
const JUMP_FORCE = 1000;
const SPEED = 480;

kaboom({
    width: 1280,
    height: 720,
    letterbox: true,
});

setBackground(141, 183, 255);

// Load sprites
loadSprite("sprite", "sprites/sprite.png", {
    sliceX: 5,
    anims: {
        run: { from: 0, to: 3, loop: true },
        jump: { from: 4, to: 4, loop: false },
    },
});
loadSprite("floor", "sprites/floor.png");

scene("game", () => {
    setGravity(3000);

    const player = add([
        sprite("sprite"),
        pos(80, 40),
        area(),
        body(),
        scale(0.3),
    ]);

    player.play("run");

    let jumping = false;

    player.onGround(() => {
        if (jumping) {
            player.play("run");
            jumping = false;
        }
    });

    // Invisible static floor for collision
    add([
        rect(width(), FLOOR_HEIGHT),
        pos(0, height()),
        anchor("botleft"),
        area(),
        body({ isStatic: true }),
        color(0, 0, 0, 0), // invisible
    ]);

    // Visual floor tiles (no body)
    const floorTiles = [];
    const tileSize = 64;
    const floorY = height() - FLOOR_HEIGHT;

    for (let x = 0; x < width() + tileSize; x += tileSize) {
        const tile = add([
            sprite("floor"),
            pos(x, floorY),
            area(),
            move(LEFT, SPEED),
            "floor-tile",
        ]);
        floorTiles.push(tile);
    }

    onUpdate(() => {
        for (const tile of floorTiles) {
            if (tile.pos.x < -tileSize) {
                tile.pos.x += (floorTiles.length) * tileSize;
            }
        }
    });

    function jump() {
        if (player.isGrounded()) {
            jumping = true;
            player.jump(JUMP_FORCE);
            player.play("jump");
        }
    }

    onKeyPress("space", jump);
    onClick(jump);

    function spawnTree() {
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
        wait(rand(0.5, 1.5), spawnTree);
    }

    spawnTree();

    player.onCollide("tree", () => {
        go("lose", score);
        burp();
        addKaboom(player.pos);
    });

    let score = 0;

    const scoreLabel = add([
        text(score),
        pos(24, 24),
    ]);

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

    add([
        text(score),
        pos(width() / 2, height() / 2 + 64),
        scale(2),
        anchor("center"),
    ]);

    onKeyPress("space", () => go("game"));
    onClick(() => go("game"));
});

go("game");
		
