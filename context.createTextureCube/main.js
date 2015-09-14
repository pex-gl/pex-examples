//Ported from https://github.com/glo-js/glo-demo-primitive

var Window      = require('pex-sys/Window');
var Mat4        = require('pex-math/Mat4');
var Vec3        = require('pex-math/Vec3');
var createTorus = require('primitive-torus');
var createCube  = require('./primitive-cube');
var glslify     = require('glslify-promise');
var parseDDS    = require('./parse-dds');
var loadBinary  = require('pex-io/loadBinary');

Window.create({
    settings: {
        width: 1280,
        height: 720,
        type: '3d'
    },
    resources: {
        skyboxVert: { glsl: glslify(__dirname + '/../assets/glsl/Skybox.vert') },
        skyboxFrag: { glsl: glslify(__dirname + '/../assets/glsl/Skybox.frag') },
        reflectionVert: { glsl: glslify(__dirname + '/../assets/glsl/CubemapReflection.vert') },
        reflectionFrag: { glsl: glslify(__dirname + '/../assets/glsl/CubemapReflection.frag') },
        //ddsCubemap: { binary: __dirname + '/../assets/cubemaps/ForestReflection.dds' }
        ddsCubemap: { binary: __dirname + '/../assets/cubemaps/hamarikyu_bridge_cube_pmrem32f.dds' }
    },
    init: function() {
        var ctx = this.getContext();

        this.model = Mat4.create();
        this.projection = Mat4.perspective(Mat4.create(), 60, this.getAspectRatio(), 0.001, 50.0);
        this.view = Mat4.lookAt([], [3, 2, 2], [0, 0, 0], [0, 1, 0]);
        this.invView = Mat4.create();

        ctx.setProjectionMatrix(this.projection);
        ctx.setViewMatrix(this.view);
        ctx.setModelMatrix(this.model);

        var res = this.getResources();

        this.skyboxProgram = ctx.createProgram(res.skyboxVert, res.skyboxFrag);
        ctx.bindProgram(this.skyboxProgram);
        this.skyboxProgram.setUniform('uReflectionMap', 0);

        this.reflectionProgram = ctx.createProgram(res.reflectionVert, res.reflectionFrag);
        ctx.bindProgram(this.reflectionProgram);
        this.reflectionProgram.setUniform('uReflectionMap', 0);

        var torus = createTorus({ majorRadius: 1, minorRadius: 0.5 });
        var torusAttributes = [
            { data: torus.positions, location: ctx.ATTRIB_POSITION },
            { data: torus.uvs, location: ctx.ATTRIB_TEX_COORD_0 },
            { data: torus.normals, location: ctx.ATTRIB_NORMAL }
        ];
        var torusIndices = { data: torus.cells };
        this.torusMesh = ctx.createMesh(torusAttributes, torusIndices);

        var skybox = createCube(30);
        var skyboxAttributes = [
            { data: skybox.positions, location: ctx.ATTRIB_POSITION },
            { data: skybox.uvs, location: ctx.ATTRIB_TEX_COORD_0 },
            { data: skybox.normals, location: ctx.ATTRIB_NORMAL }
        ];
        var skyboxIndices = { data: skybox.cells };
        this.skyboxMesh = ctx.createMesh(skyboxAttributes, skyboxIndices);

        var buf = res.ddsCubemap;
        var result = parseDDS(buf);
        if (result.format !== 'rgba32f') {
            throw new Error('Unsupported cubemap data format ' + result.format);
        }

        //dds images are orgianized by faces by mipmaps
        //so +x0 +x1 +x2 ... -x0 -x1 -x2 ... +y0..
        var levels = result.images.length / 6;
        var faces = result.images.map(function(img, imgIndex) {
            var faceData = new Float32Array(buf.slice(img.offset, img.offset + img.length))
            return {
                face: Math.floor(imgIndex / levels),
                lod: imgIndex % levels,
                width: img.shape[0],
                height: img.shape[1],
                data: faceData
            }
        })
        this.tex = ctx.createTextureCube(faces, faces[0].width, faces[0].height, { type: ctx.FLOAT });
    },
    seconds: 0,
    prevTime: Date.now(),
    draw: function() {
        var now = Date.now();
        this.seconds += (now - this.prevTime)/1000;
        this.prevTime = now;

        var ctx = this.getContext();
        ctx.setClearColor(0.2, 0.2, 0.2, 1);
        ctx.clear(ctx.COLOR_BIT | ctx.DEPTH_BIT);
        ctx.setDepthTest(true);

        var speed = 0.1;
        var time = speed * Date.now()/1000;

        Mat4.lookAt9(this.view,
            Math.cos(time * Math.PI) * 5,
            1 + Math.sin(time * 0.5) * 0,
            Math.sin(time * Math.PI) * 5,
            0,0,0,0,1,0
        );
        ctx.setViewMatrix(this.view);

        ctx.bindTexture(this.tex, 0);

        ctx.bindProgram(this.reflectionProgram);
        ctx.bindMesh(this.torusMesh);
        ctx.drawMesh();

        ctx.bindProgram(this.skyboxProgram);
        ctx.bindMesh(this.skyboxMesh);
        ctx.drawMesh();
    }
})
