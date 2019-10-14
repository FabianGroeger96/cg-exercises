//
// DI Computer Graphics
//
// WebGL Exercises
//

// Register function to call after document has loaded
window.onload = startup;

// the gl object is saved globally
var gl;

// 2d context of the score text objects
var ctxTextGameState;
var ctxScoreLeft;
var ctxScoreRight;

// we keep all local parameters for the program in a single object
var ctx = {
    shaderProgram: -1,
    aVertexPositionId: -1,
    uColorId: -1,
    uProjectionMatId: -1,
    uModelMatId: -1
};

// we keep all the parameters for drawing a specific object together
var rectangleObject = {
    buffer: -1
};

const gameState = {"init": 0, "started": 1, "finished": 2};

var game = {
    lastDrawTimestamp: -1,
    drawInterval: 0,
    scorePlayerRight: 0,
    scorePlayerLeft: 0,
    state: gameState.init
};

/**
 * Startup function to be called when the body is loaded
 */
function startup() {
    "use strict";
    var canvas = document.getElementById("myCanvas");
    gl = createGLContext(canvas);

    var canvas = document.getElementById('scorePlayerLeft');
    ctxScoreLeft = canvas.getContext('2d');
    ctxScoreLeft.fillStyle = "#FFFFFF";
    ctxScoreLeft.textAlign = "center";
    ctxScoreLeft.textBaseline = "middle";
    ctxScoreLeft.font = "20px monospace";

    var canvas = document.getElementById('scorePlayerRight');
    ctxScoreRight = canvas.getContext('2d');
    ctxScoreRight.fillStyle = "#FFFFFF";
    ctxScoreRight.textAlign = "center";
    ctxScoreRight.textBaseline = "middle";
    ctxScoreRight.font = "20px monospace";

    var canvas = document.getElementById('gameStateLabel');
    ctxTextGameState = canvas.getContext('2d');
    ctxTextGameState.fillStyle = "#FFFFFF";
    ctxTextGameState.textAlign = "center";
    ctxTextGameState.textBaseline = "middle";
    ctxTextGameState.font = "30px monospace";

    initGL();
    window.addEventListener('keyup', onKeyup, false);
    window.addEventListener('keydown', onKeydown, false);
    draw();

    window.requestAnimationFrame(drawAnimated);
}

/**
 * InitGL should contain the functionality that needs to be executed only once
 */
function initGL() {
    "use strict";
    ctx.shaderProgram = loadAndCompileShaders(gl, 'VertexShader.glsl', 'FragmentShader.glsl');
    setUpAttributesAndUniforms();
    setUpBuffers();

    // Setup the world coordinates
    var projectionMat = mat3.create();
    mat3.fromScaling(projectionMat, [2.0 / gl.drawingBufferWidth, 2.0 / gl.drawingBufferHeight]);
    gl.uniformMatrix3fv(ctx.uProjectionMatId, false, projectionMat);

    gl.clearColor(0.1, 0.1, 0.1, 1);
}

/**
 * Setup all the attribute and uniform variables
 */
function setUpAttributesAndUniforms() {
    "use strict";
    ctx.aVertexPositionId = gl.getAttribLocation(ctx.shaderProgram, "aVertexPosition");
    ctx.uColorId = gl.getUniformLocation(ctx.shaderProgram, "uColor");
    ctx.uProjectionMatId = gl.getUniformLocation(ctx.shaderProgram, "uProjectionMat");
    ctx.uModelMatId = gl.getUniformLocation(ctx.shaderProgram, "uModelMat");
}

/**
 * Setup the buffers to use. If more objects are needed this should be split in a file per object.
 */
function setUpBuffers() {
    "use strict";
    rectangleObject.buffer = gl.createBuffer();
    var vertices = [
        -0.5, -0.5,
        0.5, -0.5,
        0.5, 0.5,
        -0.5, 0.5];
    gl.bindBuffer(gl.ARRAY_BUFFER, rectangleObject.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
}

/**
 * Draw the scene.
 */
function draw() {
    "use strict";
    gl.clear(gl.COLOR_BUFFER_BIT);
    // clear the 2d contexts for the text label
    ctxScoreLeft.clearRect(0, 0, ctxScoreLeft.canvas.width, ctxScoreLeft.canvas.height);
    ctxScoreRight.clearRect(0, 0, ctxScoreRight.canvas.width, ctxScoreRight.canvas.height);
    ctxTextGameState.clearRect(0, 0, ctxTextGameState.canvas.width, ctxTextGameState.canvas.height);

    gl.bindBuffer(gl.ARRAY_BUFFER, rectangleObject.buffer);
    gl.vertexAttribPointer(ctx.aVertexPositionId, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(ctx.aVertexPositionId);

    gl.uniform4f(ctx.uColorId, 1, 1, 1, 1);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

    ctxScoreLeft.fillText("Player Left: " + game.scorePlayerLeft, 200, 50);
    ctxScoreRight.fillText("Player Right: " + game.scorePlayerRight, 200, 50);

    if (game.state === gameState.init) {
        ctxTextGameState.fillText("Press ENTER to start the game", 400, 300);
        drawGameElement(player_left);
        drawGameElement(player_right);
        drawGameElement(middle_line);
    } else if (game.state === gameState.started) {
        drawGameElement(player_left);
        drawGameElement(player_right);
        drawGameElement(middle_line);
        drawGameElement(ball)
    } else if (game.state === gameState.finished) {
        ctxTextGameState.fillText("Game Over, ENTER to restart the game", 400, 300);
        drawGameElement(player_left);
        drawGameElement(player_right);
        drawGameElement(middle_line);
        drawGameElement(ball)
    }
}

function drawAnimated(timeStamp) {
    if (game.state === gameState.init) {
        if (isDown(key.ENTER)) {
            game.state = gameState.started;
        }
    } else if (game.state === gameState.started) {
        // calculate time since last call
        if (game.lastDrawTimestamp === -1 || (timeStamp - game.lastDrawTimestamp) > game.drawInterval) {
            var elapsedTime = (timeStamp - game.lastDrawTimestamp) / 1000;
            game.lastDrawTimestamp = timeStamp;

            // move or change objects
            // player right
            if (isDown(key.UP)) {
                if (player_right.position[1] < 245) {
                    player_right.position[1] += 5;
                } else {
                    player_right.position[1] = 250;
                }
            }

            if (isDown(key.DOWN)) {
                if (player_right.position[1] > -245) {
                    player_right.position[1] -= 5;
                } else {
                    player_right.position[1] = -250;
                }
            }

            // player left
            if (isDown(key.W)) {
                if (player_left.position[1] < 245) {
                    player_left.position[1] += 5;
                } else {
                    player_left.position[1] = 250;
                }
            }

            if (isDown(key.S)) {
                if (player_left.position[1] > -245) {
                    player_left.position[1] -= 5;
                } else {
                    player_left.position[1] = -250;
                }
            }

            // Collision with wall on top and on bottom
            if (Math.abs(ball.position[1]) >= (game_field.size[1] / 2) - (ball.size[1] / 2)) {
                ball.movement[1] *= -1;
            }

            if (ball.position[0] >= player_right.position[0] - player_right.size[0] && ball.position[0] <= player_right.position[0]) {
                if (ball.position[1] >= player_right.position[1] - (player_right.size[1] / 2) && ball.position[1] <= player_right.position[1] + (player_right.size[1] / 2)) {
                    ball.movement[0] *= -1;
                }
            }

            if (ball.position[0] >= player_left.position[0] && ball.position[0] <= player_left.position[0] + player_left.size[0]) {
                if (ball.position[1] >= player_left.position[1] - (player_left.size[1] / 2) && ball.position[1] <= player_left.position[1] + (player_left.size[1] / 2)) {
                    ball.movement[0] *= -1;
                }
            }

            if (ball.position[0] >= (game_field.size[0] / 2) - (ball.size[0] / 2)) {
                if (game.scorePlayerLeft === 4) {
                    game.state = gameState.finished;
                } else {
                    game.scorePlayerLeft += 1;

                    ball.position = [0, 0];
                    if (Math.round(Math.random()) === 1) {
                        ball.movement[0] = Math.round(Math.random() * 5);
                        ball.movement[1] = Math.round(Math.random() * 5);
                        if (Math.abs(ball.movement[0]) === 0) {
                            ball.movement[0] = 1;
                        }
                    } else {
                        ball.movement[0] = -Math.round(Math.random() * 5);
                        ball.movement[1] = -Math.round(Math.random() * 5);
                        if (Math.abs(ball.movement[0]) === 0) {
                            ball.movement[0] = -1;
                        }
                    }
                }
            } else if (ball.position[0] <= -((game_field.size[0] / 2) + (ball.size[0] / 2))) {
                if (game.scorePlayerRight === 4) {
                    game.state = gameState.finished;
                } else {
                    game.scorePlayerRight += 1;

                    ball.position = [0, 0];
                    if (Math.round(Math.random()) === 1) {
                        ball.movement[0] = Math.round(Math.random() * 5);
                        ball.movement[1] = Math.round(Math.random() * 5);
                        if (Math.abs(ball.movement[0]) === 0) {
                            ball.movement[0] = 1;
                        }
                    } else {
                        ball.movement[0] = -Math.round(Math.random() * 5);
                        ball.movement[1] = -Math.round(Math.random() * 5);
                        if (Math.abs(ball.movement[0]) === 0) {
                            ball.movement[0] = -1;
                        }
                    }
                }
            }
            vec2.multiply(ball.movement, ball.movement, [1.001, 1.001]);
            vec2.add(ball.position, ball.position, ball.movement);

        }

    } else if (game.state === gameState.finished) {
        if (isDown(key.ENTER)) {
            game.state = gameState.started;
            game.scorePlayerRight = 0;
            game.scorePlayerLeft = 0;
        }
    }

    draw();
    // request the next frame
    window.requestAnimationFrame(drawAnimated);
}

function drawGameElement(gameElement) {
    var modelMat = mat3.create();
    mat3.fromTranslation(modelMat, gameElement.position);
    mat3.scale(modelMat, modelMat, gameElement.size);
    gl.uniformMatrix3fv(ctx.uModelMatId, false, modelMat);
    gl.uniform4f(ctx.uColorId, gameElement.color[0], gameElement.color[1], gameElement.color[2], gameElement.color[3]);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
}

// Game Field
var game_field = {
    size: [800, 600]
};

// First Player
var player_left = {
    position: [-350, 0],
    size: [20, 100],
    color: [1, 1, 1, 1]
};

// Second Player
var player_right = {
    position: [350, 0],
    size: [20, 100],
    color: [1, 1, 1, 1]
};

// middle-line
var middle_line = {
    position: [0, 0],
    size: [1, 6000],
    color: [1, 1, 1, 1]
};

// Ping Pong ball
var ball = {
    position: [0, 0],
    size: [20, 20],
    movement: [4, 4],
    color: [1, 0, 0, 1]
};

// Key Handling
var key = {
    _pressed: {},

    ENTER: 13,

    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,

    W: 87,
    S: 83
};

function isDown(keyCode) {
    return key._pressed[keyCode];
}

function onKeydown(event) {
    key._pressed[event.keyCode] = true;
}

function onKeyup(event) {
    delete key._pressed[event.keyCode];
}
