#ifdef GL_ES
precision highp float;
#endif

varying vec3 vNormal;

uniform samplerCube uReflectionMap;
uniform float uFlipZ;

void main() {
    vec3 N = normalize(vNormal);
    if (uFlipZ != 0.0) {
        N.z *= uFlipZ;
    }
    gl_FragColor = textureCube(uReflectionMap, N);
}
