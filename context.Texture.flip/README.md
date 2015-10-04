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
- when using cubemaps not prepared for OpenGL (most of what you find on the web) you need to **negate Z component** of the `R` vector that you use sample the cubemap e.g.

```glsl
vec3 N = normalize(vNormal);
N.z *= -1.0;
vec4 color = textureCube(envMap, N);
```

## EnvMaps (LatLong Panoramas, Equirectangular panoramas)

Same issue with coordinate system like in Cubemaps

Therefore:
- you probably need to **negate Z component** of your `R` vector
- you probably need to **negate Y component** of your `R` vector too if you upload 2D image flipped to match the WebGL texture coordinates

```glsl
vec4 texture2DEnvLatLong(sampler2D envMap, vec3 wcNormal, float flipZ) {
    float phi = acos(-wcNormal.y);
    float theta = atan(wcNormal.x, flipZ * wcNormal.z) + PI;
    vec2 texCoord = vec2(theta / TwoPI, phi / PI);
    return texture2D(envMap, texCoord);
}
```
