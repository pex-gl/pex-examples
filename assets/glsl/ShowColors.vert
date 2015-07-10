attribute vec4 aColor;
attribute vec4 aPosition;
uniform mat4 uProjectionMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uModelMatrix;
varying vec4 vColor;
void main() {
  vColor = aColor;
  gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * aPosition;
}
