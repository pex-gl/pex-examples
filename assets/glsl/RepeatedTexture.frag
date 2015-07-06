#ifdef GL_ES
precision highp float;
#endif

varying vec2 vTexCoord0;
uniform sampler2D uTexture;
uniform vec2 uRepeat;
void main() {
  gl_FragColor = texture2D(uTexture, vTexCoord0 * uRepeat);
}
