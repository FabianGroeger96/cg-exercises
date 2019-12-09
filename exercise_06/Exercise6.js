//
// Computer Graphics
//
// WebGL Exercises
//

// Turn Texture Mapping on and off
// Add Transformation
// Add 3D functionality
// Add shading

// Register function to call after document has loaded
window.onload = startup;

// the gl object is saved globally
var gl;

// all parameters associated with the shader program
var ctx = {
    shaderProgram: -1,
    aVertexPositionId: -1,
    aVertexColorId: -1,
    aVertexTextureCoordId: -1,
    aVertexNormalId: -1,
    uModelViewMatrixId: -1,
    uProjectionMatrixId: -1,
    uNormalMatrixId: -1,
    uTextureMatrixId: -1,
    uSamplerId: -1,
    uEnableTextureId: -1,
    uLightPositionId: -1,
    uLightColorId: -1,
    uEnableLightingId: -1
};

// loaded textures
// keep texture parameters in an object so we can mix textures and objects
var textures = {
    textureObject: {}
};

// parameters that define the scene
var scene = {
    eyePosition: [0, 3, -4],
    lookAtPosition: [0, 0, 0],
    upVector: [0, 1, 0],
    nearPlane: 0.1,
    farPlane: 30.0,
    fov: 40,
    lightPosition: [-20, 20, 0],
    lightColor: [1, 1, 1],
    rotateObjects: true,
    angle: 0,
    angularSpeed: 0.1 * 1.5 * Math.PI / 360.0
};

// defined object
var drawingObjects = {
    solidCube: null,
    solidSphere: null
};

/**
 * Startup function to be called when the body is loaded
 */
function startup() {
    "use strict";
    var canvas = document.getElementById("myCanvas");
    gl = createGLContext(canvas);
    initGL();

    window.requestAnimationFrame(drawAnimated);
}

/**
 * InitGL should contain the functionality that needs to be executed only once
 */
function initGL() {
    "use strict";
    ctx.shaderProgram = loadAndCompileShaders(gl, 'VertexShader.glsl', 'FragmentShader.glsl');
    setUpAttributesAndUniforms();

    gl.enable(gl.DEPTH_TEST);
    gl.clearColor(0.8, 0.8, 0.8, 1);

    defineObjects();
    loadTexture();
}

/**
 * Load an solid color as a texture
 */
function loadTexture() {
    textures.textureObject = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, textures.textureObject);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([10, 100, 40, 255]));
}

function defineObjects() {
    drawingObjects.solidCube = new SolidCube(gl,
        [1.0, 0.0, 0.0],
        [0.0, 1.0, 0.0],
        [0.0, 0.0, 1.0],
        [1.0, 1.0, 0.0],
        [0.0, 1.0, 1.0],
        [1.0, 0.0, 1.0]);
    drawingObjects.solidSphere = new SolidSphere(gl, 40, 40);
}

/**
 * Setup all the attribute and uniform variables
 */
function setUpAttributesAndUniforms() {
    "use strict";
    ctx.aVertexPositionId = gl.getAttribLocation(ctx.shaderProgram, "aVertexPosition");
    ctx.aVertexColorId = gl.getAttribLocation(ctx.shaderProgram, "aVertexColor");
    ctx.aVertexTextureCoordId = gl.getAttribLocation(ctx.shaderProgram, "aVertexTextureCoord");
    ctx.aVertexNormalId = gl.getAttribLocation(ctx.shaderProgram, "aVertexNormal");

    ctx.uModelViewMatrixId = gl.getUniformLocation(ctx.shaderProgram, "uModelViewMatrix");
    ctx.uProjectionMatrixId = gl.getUniformLocation(ctx.shaderProgram, "uProjectionMatrix");
    ctx.uNormalMatrixId = gl.getUniformLocation(ctx.shaderProgram, "uNormalMatrix");
    ctx.uTextureMatrixId = gl.getUniformLocation(ctx.shaderProgram, "uTextureMatrix");

    ctx.uSamplerId = gl.getUniformLocation(ctx.shaderProgram, "uSampler");
    ctx.uEnableTextureId = gl.getUniformLocation(ctx.shaderProgram, "uEnableTexture");

    ctx.uLightPositionId = gl.getUniformLocation(ctx.shaderProgram, "uLightPosition");
    ctx.uLightColorId = gl.getUniformLocation(ctx.shaderProgram, "uLightColor");
    ctx.uEnableLightingId = gl.getUniformLocation(ctx.shaderProgram, "uEnableLighting");
}

/**
 * Draw the scene.
 */
function draw() {
    "use strict";
    var modelViewMatrix = mat4.create();
    var viewMatrix = mat4.create();
    var projectionMatrix = mat4.create();
    var textureMatrix = mat3.create();
    var normalMatrix = mat3.create();

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // set the matrices from the scene
    mat4.lookAt(viewMatrix, scene.eyePosition, scene.lookAtPosition, scene.upVector);

    mat4.perspective(projectionMatrix,
        glMatrix.toRadian(66),
        gl.drawingBufferWidth / gl.drawingBufferHeight,
        scene.nearPlane, scene.farPlane);

    // enable the texture mapping
    // Tell WebGL we want to affect texture unit 0
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textures.textureObject);
    gl.uniform1i(ctx.uSamplerId, 0);
    gl.uniformMatrix3fv(ctx.uTextureMatrixId, false, textureMatrix);

    // tell the fragment shader to use the texture
    // 1 = texture is active
    // 0 = texture is inactive
    gl.uniform1i(ctx.uEnableTextureId, 1);
    gl.uniformMatrix3fv(ctx.uTextureMatrixId, false, textureMatrix);

    // set the light
    // tell the fragment shader to use the lighting
    // 1 = lightning is active
    // 0 = lightning is inactive
    gl.uniform1i(ctx.uEnableLightingId, 1);
    gl.uniform3fv(ctx.uLightPositionId, scene.lightPosition);
    gl.uniform3fv(ctx.uLightColorId, scene.lightColor);

    // same projection matrix for all drawings, so it can be specified here
    gl.uniformMatrix4fv(ctx.uProjectionMatrixId, false, projectionMatrix);

    // translate and rotate objects
    mat4.translate(modelViewMatrix, viewMatrix, [-1.5, 0, 0]);
    mat4.rotate(modelViewMatrix, modelViewMatrix, scene.angle, [0, 1, 0]);
    mat4.scale(modelViewMatrix, modelViewMatrix, [1.5, 1.5, 1.5]);
    gl.uniformMatrix4fv(ctx.uModelViewMatrixId, false, modelViewMatrix);
    mat3.normalFromMat4(normalMatrix, modelViewMatrix);
    gl.uniformMatrix3fv(ctx.uNormalMatrixId, false, normalMatrix);
    drawingObjects.solidCube.draw(gl, ctx.aVertexPositionId, ctx.aVertexColorId, ctx.aVertexNormalId, ctx.aVertexTextureCoordId, textures.textureObject);

    // draw sphere
    mat4.translate(modelViewMatrix, viewMatrix, [1.5, 0.0, 0.0]);
    mat4.rotate(modelViewMatrix, modelViewMatrix, scene.angle, [0, 1, 0]);
    gl.uniformMatrix4fv(ctx.uModelViewMatrixId, false, modelViewMatrix);
    mat3.normalFromMat4(normalMatrix, modelViewMatrix);
    gl.uniformMatrix3fv(ctx.uNormalMatrixId, false, normalMatrix);
    drawingObjects.solidSphere.drawWithColor(gl, ctx.aVertexPositionId, ctx.aVertexColorId, ctx.aVertexNormalId, [1, 0, 0]);
}

var first = true;
var lastTimeStamp = 0;

function drawAnimated(timeStamp) {
    var timeElapsed = 0;
    if (first) {
        lastTimeStamp = timeStamp;
        first = false;
    } else {
        timeElapsed = timeStamp - lastTimeStamp;
        lastTimeStamp = timeStamp;
    }
    // calculate time since last call
    // move or change objects
    scene.angle += timeElapsed * scene.angularSpeed;
    if (scene.angle > 2.0 * Math.PI) {
        scene.angle -= 2.0 * Math.PI;
    }
    draw();
    // request the next frame
    window.requestAnimationFrame(drawAnimated);
}