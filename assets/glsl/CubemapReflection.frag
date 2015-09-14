#ifdef GL_ES
precision highp float;
#endif

uniform mat4 uInverseViewMatrix;
uniform samplerCube uReflectionMap;

varying vec3 ecPosition;
varying vec3 ecNormal;

void main() {
    vec3 ecEyeDir = normalize(-ecPosition);
    vec3 wcEyeDir = vec3(uInverseViewMatrix * vec4(ecEyeDir, 0.0));
    vec3 wcNormal = vec3(uInverseViewMatrix * vec4(ecNormal, 0.0));

    vec3 reflectionWorld = reflect(-wcEyeDir, normalize(wcNormal)); //eye coordinates reflection vector

    vec4 color = textureCube(uReflectionMap, reflectionWorld);

    //gl_FragColor = vec4(ecNormal * 0.5 + 0.5, 1.0);
    gl_FragColor = color;
}
