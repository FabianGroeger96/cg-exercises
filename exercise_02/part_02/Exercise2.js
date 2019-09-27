//
// Computer Graphics
//
// WebGL Exercises
//

// Register function to call after document has loaded
window.onload = startup;

// the gl object is saved globally
var gl;

// we keep all local parameters for the program in a single object
var ctx = {
    shaderProgram: -1, //wird unten wieder überschrieben
    aVertexPositionId: -1,
    aVertexColorId: -1
};

// we keep all the parameters for drawing a specific object together
var rectangleObject = {
    positionBuffer: -1,
    colorBuffer: -1
};

/**
 * Startup function to be called when the body is loaded
 */
function startup() {
    "use strict";
    var canvas = document.getElementById("myCanvas");
    gl = createGLContext(canvas);
    initGL();
    draw();
}

/**
 * InitGL should contain the functionality that needs to be executed only once
 */
function initGL() {
    "use strict";
    ctx.shaderProgram = loadAndCompileShaders(gl, 'VertexShader.glsl', 'FragmentShader.glsl');
    setUpAttributesAndUniforms();
    setUpBuffers();

    // set the clear color here
    gl.clearColor(.4, .4, .4, 1); //-> damit wird alles übermalen (erst wenn clear)

    // add more necessary commands here
}

/**
 * Setup all the attribute and uniform variables
 */
function setUpAttributesAndUniforms() {
    "use strict";
    // finds the index of the variable in the program || überschreibt ctx.aVertexPositionId
    ctx.aVertexPositionId = gl.getAttribLocation(ctx.shaderProgram, "aVertexPosition");
    ctx.aVertexColorId = gl.getAttribLocation(ctx.shaderProgram, "aVertexColor");
}

/**
 * Setup the buffers to use. If more objects are needed this should be split in a file per object.
 */
function setUpBuffers() {
    "use strict";

    rectangleObject.positionBuffer = gl.createBuffer();

    var vertices = [
        -0.5, 0.5,
        0.5, 0.5,
        0.5, -0.5,
        -0.5, -0.5,
    ];

    gl.bindBuffer(gl.ARRAY_BUFFER, rectangleObject.positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    rectangleObject.colorBuffer = gl.createBuffer();

    var colors = [
        1, 0, 0, 1,
        0, 1, 0, 1,
        0, 0, 1, 1,
        1, 1, 1, 1,
    ];

    gl.bindBuffer(gl.ARRAY_BUFFER, rectangleObject.colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
}

/**
 * Draw the scene.
 */
function draw() {
    "use strict";

    console.log("Drawing");
    gl.clear(gl.COLOR_BUFFER_BIT);

    // add drawing routines here
    gl.bindBuffer(gl.ARRAY_BUFFER, rectangleObject.positionBuffer);
    gl.vertexAttribPointer(ctx.aVertexPositionId, 2, gl.FLOAT, false, 8, 0);
    gl.enableVertexAttribArray(ctx.aVertexPositionId);

    gl.bindBuffer(gl.ARRAY_BUFFER, rectangleObject.colorBuffer);
    // Berechnen der Blöcke 4 Werte im Array * 4 bytes pro Float
    // 4 bytes pro Float
    // 8 bytes pro Double
    // 1 bytes pro Byte
    // 2 bytes pro Short
    // 4 bytes pro Int
    // 8 bytes pro Long
    gl.vertexAttribPointer(ctx.aVertexColorId, 4, gl.FLOAT, false, 16, 0);
    gl.enableVertexAttribArray(ctx.aVertexColorId);

    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
    console.log("done");
}