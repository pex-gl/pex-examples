#ifdef GL_ES
precision highp float;
#endif

uniform mat4 uInverseViewMatrix;
uniform sampler2D uReflectionMap;

varying vec3 ecPosition;
varying vec3 ecNormal;

//always flip equirect env map
const float flipEnvMap = -1.0;

#define PI 3.1415926
#define TwoPI (2.0 * PI)


vec4 texture2DEnvMap(sampler2D envMap, vec3 N, float flipEnvMap) {
  //I assume envMap texture has been flipped the WebGL way (pixel 0,0 is a the bottom)
  //therefore we flip wcNorma.y as acos(1) = 0
  float phi = acos(-N.y);
  float theta = atan(flipEnvMap * N.x, N.z) + PI;
  return texture2D(envMap, vec2(theta / TwoPI, phi / PI));
}

void main() {
    vec3 ecEyeDir = normalize(-ecPosition);
    vec3 wcEyeDir = vec3(uInverseViewMatrix * vec4(ecEyeDir, 0.0));
    vec3 wcNormal = vec3(uInverseViewMatrix * vec4(ecNormal, 0.0));

    vec3 reflectionWorld = reflect(-wcEyeDir, normalize(wcNormal)); //eye coordinates reflection vector

    vec4 color = texture2DEnvMap(uReflectionMap, reflectionWorld, flipEnvMap);

    //gl_FragColor = vec4(ecNormal * 0.5 + 0.5, 1.0);
    gl_FragColor = color;
}
