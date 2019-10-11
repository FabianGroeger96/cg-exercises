attribute vec2 aVertexPosition;

uniform mat3 uProjectionMat;
uniform mat3 uModelMat;

void main() {
    gl_Position = vec4((uProjectionMat * uModelMat) * vec3(aVertexPosition, 1), 1);
}