var Window      = require('pex-sys/Window');
var Mat4        = require('pex-math/Mat4');
var Vec3        = require('pex-math/Vec3');
var createTorus = require('primitive-torus');
var glslify     = require('glslify-promise');
var GUI         = require('pex-gui');

var State = {
    scale: 1,
    rotate: false,
    size: [1, 0.2],
    rotation: [0,0,0],
    bgColor: [0.92, 0.2, 0.2, 1.0],
    textures: [],
    currentTexture: 0,
    text: 'test message'
};

Window.create({
    settings: {
        type: '3d',
        width: 1280,
        height: 720
    },
    resources: {
        vert: { glsl: glslify(__dirname + '/../assets/glsl/RepeatedTexture.vert') },
        frag: { glsl: glslify(__dirname + '/../assets/glsl/RepeatedTexture.frag') },
        palette: { image: __dirname + '/../assets/palettes/rainbow.jpg'},
        plask: { image: __dirname + '/../assets/textures/plask.png'},
        opengl: { image: __dirname + '/../assets/textures/opengl.png'},
        test: { image: __dirname + '/../assets/textures/test.png'},
    },
    init: function() {
        var ctx = this.getContext();
        var res = this.getResources();

        this.gui = new GUI(ctx, this.getWidth(), this.getHeight());
        this.gui.addHeader('Settings');
        this.gui.addParam('Scale', State, 'scale', { min: 0.1, max: 2});
        this.gui.addParam('Rotate camera', State, 'rotate');
        this.gui.addParam('Size', State, 'size', { min: 0.1, max: 2 }, this.onTorusSizeChange.bind(this));
        this.gui.addParam('Rotation', State, 'rotation', { min: -Math.PI/2, max: Math.PI/2 });
        this.gui.addSeparator();
        this.gui.addHeader('Color');
        this.gui.addParam('BG Color [RGBA]', State, 'bgColor');
        this.gui.addParam('BG Color [HSB]', State, 'bgColor', { type: 'color', palette: res.palette });
        this.gui.addSeparator();
        this.gui.addParam('Test message', State, 'text', {}, function(e) {
            console.log('New text: ', e);
        }).setPosition(180, 10)

        this.addEventListener(this.gui);

        this.model = Mat4.create();
        this.projection = Mat4.perspective(Mat4.create(), 45, this.getAspectRatio(), 0.001, 10.0);
        this.view = Mat4.lookAt([], [3, 2, 2], [0, 0, 0], [0, 1, 0]);

        ctx.setProjectionMatrix(this.projection);
        ctx.setViewMatrix(this.view);
        ctx.setModelMatrix(this.model);



        this.program = ctx.createProgram(res.vert, res.frag);
        ctx.bindProgram(this.program);
        this.program.setUniform('uRepeat', [ 8, 8 ]);
        this.program.setUniform('uTexture', 0);

        var torus = createTorus();

        var attributes = [
            { data: torus.positions, location: ctx.ATTRIB_POSITION },
            { data: torus.uvs, location: ctx.ATTRIB_TEX_COORD_0 },
            { data: torus.normals, location: ctx.ATTRIB_NORMAL }
        ];
        var indices = { data: torus.cells, usage: ctx.STATIC_DRAW };
        this.mesh = ctx.createMesh(attributes, indices);

        var img = new Uint8Array([
            0xff, 0xff, 0xff, 0xff, 0xcc, 0xcc, 0xcc, 0xff,
            0xcc, 0xcc, 0xcc, 0xff, 0xff, 0xff, 0xff, 0xff
        ]);

        State.textures.push(ctx.createTexture2D(img, 2, 2, {
          repeat: true,
          minFilter: ctx.NEAREST,
          magFilter: ctx.NEAREST
        }))

        State.textures.push(ctx.createTexture2D(res.plask, res.plask.width, res.plask.height, { repeat: true }));
        State.textures.push(ctx.createTexture2D(res.opengl, res.opengl.width, res.opengl.height, { repeat: true }));
        State.textures.push(ctx.createTexture2D(res.test, res.test.width, res.test.height, { repeat: true }));

        this.gui.addSeparator();
        this.gui.addHeader('Texture');
        this.gui.addTexture2D('Default', State.textures[0]);
        this.gui.addTexture2DList('Default', State, 'currentTexture', State.textures.map(function(tex, index) {
            return { texture: tex, value: index }
        }));
    },
    onTorusSizeChange: function() {
        var ctx = this.getContext();
        var torus = createTorus({ majorRadius: State.size[0], minorRadius: State.size[1] });
        this.mesh.updateAttribute(ctx.ATTRIB_POSITION, torus.positions);
    },
    seconds: 0,
    prevTime: Date.now(),
    draw: function() {
        //if (!this.mesh) return;
        var now = Date.now();
        this.seconds += (now - this.prevTime)/1000;
        this.prevTime = now;

        var ctx = this.getContext();
        ctx.setClearColor(State.bgColor[0], State.bgColor[1], State.bgColor[2], State.bgColor[3]);
        ctx.clear(ctx.COLOR_BIT | ctx.DEPTH_BIT);
        ctx.setDepthTest(true);

        var time = Date.now()/1000;

        if (!State.rotate) time = 0;

        ctx.setViewMatrix(Mat4.lookAt9(this.view,
                Math.cos(time * Math.PI) * 5,
                Math.sin(time * 0.5) * 0,
                Math.sin(time * Math.PI) * 5,
                0,0,0,0,1,0
            )
        );

        ctx.bindTexture(State.textures[State.currentTexture], 0);
        ctx.bindProgram(this.program);

        ctx.setViewMatrix(this.view)

        ctx.bindMesh(this.mesh);
        ctx.pushModelMatrix();
            //Torus is by default at YZ axis so let's rotate it to YX
            ctx.rotateXYZ([0, Math.PI/2, 0]);
            ctx.rotateXYZ(State.rotation);
            ctx.scale([ State.scale, State.scale, State.scale ]);
            ctx.drawMesh();
        ctx.popModelMatrix();

        this.gui.draw();
    }
})
