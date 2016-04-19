#ifdef GL_ES
precision highp float;
#endif

uniform mat4 uInverseViewMatrix;
uniform samplerCube uReflectionMap;
uniform float uReflectionMapFlipEnvMap;
varying vec3 ecPosition;
varying vec3 ecNormal;

vec4 textureCubeEnvMap(samplerCube envMap, vec3 N, float flipEnvMap) {
    N.x *= flipEnvMap;
    return textureCube(uReflectionMap, N);
}

void main() {
    vec3 ecEyeDir = normalize(-ecPosition);
    vec3 wcEyeDir = vec3(uInverseViewMatrix * vec4(ecEyeDir, 0.0));
    vec3 wcNormal = vec3(uInverseViewMatrix * vec4(ecNormal, 0.0));

    vec3 reflectionWorld = reflect(-wcEyeDir, normalize(wcNormal)); //eye coordinates reflection vector

    vec4 color = textureCubeEnvMap(uReflectionMap, reflectionWorld, uReflectionMapFlipEnvMap);

    //gl_FragColor = vec4(ecNormal * 0.5 + 0.5, 1.0);
    gl_FragColor = color;
}
