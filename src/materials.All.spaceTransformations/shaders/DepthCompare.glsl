#ifdef VERT

attribute vec2 position;
attribute vec2 texCoord;
uniform vec2 screenSize;
uniform vec2 pixelPosition;
uniform vec2 pixelSize;
varying vec2 vTexCoord;

void main() {
  float tx = position.x * 0.5 + 0.5; //-1 -> 0, 1 -> 1
  float ty = -position.y * 0.5 + 0.5; //-1 -> 1, 1 -> 0
  //(x + 0)/sw * 2 - 1, (x + w)/sw * 2 - 1
  float x = (pixelPosition.x + pixelSize.x * tx)/screenSize.x * 2.0 - 1.0;  //0 -> -1, 1 -> 1
  //1.0 - (y + h)/sh * 2, 1.0 - (y + h)/sh * 2
  float y = 1.0 - (pixelPosition.y + pixelSize.y * ty)/screenSize.y * 2.0;  //0 -> 1, 1 -> -1
  gl_Position = vec4(x, y, 0.0, 1.0);
  vTexCoord = texCoord;
}

#endif

#ifdef FRAG

varying vec2 vTexCoord;
uniform sampler2D depthBuf;
uniform sampler2D depthTex;

void main() {
  //depths are in normalized device coordinates -1 towards you, 1 away from you. So opposite to view space.
  float depth1 = texture2D(depthBuf, vTexCoord).r;
  float depth2 = texture2D(depthTex, vTexCoord).r;

  float diff = (depth1 - depth2);
  diff *= 2.0;

  if (diff < 0.0) {
    gl_FragColor = vec4(-diff, 0.0, 0.0, 1.0);
  }
  else {
    gl_FragColor = vec4(0.0, diff, 0.0, 1.0);
  }

  //if (depth2 > 0.85) {
  //  gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0);
  //}
  //else if (depth2 < 0.1) {
  //  gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
  //}
  //else {
  //  gl_FragColor = vec4(depth1);
  //}
}

#endif