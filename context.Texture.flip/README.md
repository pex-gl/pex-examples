# Textures in OpenGL/WebGL

## Texture2D


UV Coordinates:

```

  Most image                  WebGL
editing software          (upside down)

  0,0------1,0             0,1------0,1
   |        |               |        |
   |   ⇣    |               |    ⇡   |
   |        |               |        |
  0,1------1,1             0,0------1,0
```

Therefore:
- that's how you should assign texture coordinates to your quads
- this is how `gl.viewport` function works i.e. `gl.viewport(0,0,width/2,height/2)` is the bottom left quarter of the screen
- if you upload texture image (png,jpg) to a texture you need to **Y flip** the image on disk, during load or use `pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)` in `WebGL`
- if you render to texture using `FBO` you don't need to to anything but remember the image is *upside down* aka the `OpenGL/WebGL` way
- if you upload compressed data to the texture you need to **Y flip** the image before compression or in the shader e.g.

```glsl
vec2 uv = vec2(vTexCoord0.x, 1.0 - vTexCoord0.y);
```

## Cubemaps

Coordinate space:

```

   RenderMan / Direct X                WebGL
       Left-Handed                Right-Handed


       Y  Z                           Y
       | /                            |
       |/                             |
       o------X                       o------X
                                     /  
                                    /   
                                   Z    
```

Therefore:
- when using cubemaps not prepared for OpenGL (most of what you find on the web) you need to **negate X component** of the `R` vector that you use sample the cubemap e.g.
- when rendering to Cubemap using FBO you need to mirror your scene -1 * X and change cull face to the opposite winding order

```glsl
vec3 N = normalize(vNormal);
N.x *= -1.0;
vec4 color = textureCube(envMap, N);
```

## EnvMaps (LatLong Panoramas, Equirectangular panoramas)

Same issue with coordinate system like in Cubemaps

Therefore:
- you need to **negate X component** of your `R` vector
- you need to **negate Y component** of your `R` vector too if you upload 2D image flipped to match the WebGL texture coordinates (default behavior)

```glsl
vec4 texture2DEnvLatLong(sampler2D envMap, vec3 wcNormal, float flipEnvMap) {
    float phi = acos(-wcNormal.y);
    float theta = atan(flipEnvMap * wcNormal.x, wcNormal.z) + PI;
    vec2 texCoord = vec2(theta / TwoPI, phi / PI);
    return texture2D(envMap, texCoord);
}
```

## Notes

ThreeJS negates normal.X unless cubemap is a RenderTarget
https://github.com/mrdoob/three.js/blob/9ba60dacbde92500bea0e7a68fe5e24f3c323c1e/src/renderers/WebGLRenderer.js#L1864

PlayCanvas flips Y always for 2d textures and never for cubemaps
https://github.com/playcanvas/engine/blob/31343de447af50983921b600552df21271c48865/src/graphics/graphics_device.js#L788

PlayCanvas always negates normal.X for cubemap textures
https://github.com/guycalledfrank/engine/commit/55582908f8538c561b436874e0560e4e7aaa9d63

There is option to unflip the cubemap while convoluting
https://github.com/playcanvas/engine/blob/f7dfa19fb0f5a7966712f4f2e88cde566c5953d8/src/graphics/graphics_prefiltercubemap.js#L327

Rendering to Cubemap in PlayCanvas flips Y using camera up = -1 but doesn't flip X yet (as of 2015-10)
https://github.com/mrdoob/three.js/blob/17df4c44c2365ad7649f53e99734ae48848ab646/src/cameras/CubeCamera.js#L17
