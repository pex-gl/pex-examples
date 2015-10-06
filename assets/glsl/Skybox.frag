#ifdef GL_ES
precision highp float;
#endif

varying vec3 vNormal;

uniform samplerCube uReflectionMap;

vec4 textureCubeEnvMap(samplerCube envMap, vec3 N) {
    const float flipEnvMap = -1.0;
    N.x *= flipEnvMap;
    return textureCube(uReflectionMap, N);
}

void main() {
    vec3 N = normalize(vNormal);
    gl_FragColor = textureCubeEnvMap(uReflectionMap, N);
}
