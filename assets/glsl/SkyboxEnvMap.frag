#ifdef GL_ES
precision highp float;
#endif

varying vec3 vNormal;

uniform sampler2D uReflectionEnvMap;
uniform float uFlipZ;

#define PI 3.1415926
#define TwoPI (2.0 * PI)

/**
 * Samples equirectangular (lat/long) panorama environment map
 * @param  {sampler2D} envMap - equirectangular (lat/long) panorama texture
 * @param  {vec3} wcNormal - normal in the world coordinate space
 * @param  {float} - flipEnvMap    -1.0 for left handed coorinate system oriented texture (usual case)
 *                                  1.0 for right handed coorinate system oriented texture
 * @return {vec4} - sampledColor
 * @description Based on http://http.developer.nvidia.com/GPUGems/gpugems_ch17.html and http://gl.ict.usc.edu/Data/HighResProbes/
 */
vec4 texture2DEnvLatLong(sampler2D envMap, vec3 wcNormal, float flipEnvMap) {
    //I assume envMap texture has been flipped the WebGL way (pixel 0,0 is a the bottom)
    //So top was at 0,0 and now is at 0,1 therefore we flip wcNorma.y as acos(1) = 0 but we want 1
    float phi = acos(-wcNormal.y);
    float theta = atan(wcNormal.x, flipEnvMap * wcNormal.z) + PI;
    vec2 texCoord = vec2(theta / TwoPI, phi / PI);
    return texture2D(envMap, texCoord);
}

void main() {
    vec3 N = normalize(vNormal);
    float flipEnvMap = 1.0;
    if (uFlipZ != 0.0) {
        flipEnvMap = uFlipZ;
    }
    gl_FragColor = texture2DEnvLatLong(uReflectionEnvMap, N, flipEnvMap);
}
