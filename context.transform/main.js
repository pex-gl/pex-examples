var Window      = require('pex-sys/Window');
var PerspCamera = require('pex-cam/PerspCamera');
var Draw        = require('pex-draw');
var Vec3        = require('pex-math/Vec3');
var Mat4        = require('pex-math/Mat4');
var Quat        = require('pex-math/Quat');

var CUBE_SCALE   = [0.5,0.5,0.5];
var OFFSET_X     = [1,0,0];
var OFFSET_Z     = [0,0,1];
var OFFSET_Y     = [0,0.25,0];
var OFFSET       = [-1.5,0,-1.5];

Window.create({
    settings : {
        width : 800,
        height : 600
    },
    resources : {
        vert : {text : __dirname + '/../assets/glsl/ShowColors.vert'},
        frag : {text : __dirname + '/../assets/glsl/ShowColors.frag' }
    },
    init : function(){
        var ctx = this.getContext();
        var resources = this.getResources();

        this._program = ctx.createProgram(resources.vert,resources.frag);
        this._draw = new Draw(this.getContext());

        this._camera = new PerspCamera(45,this.getAspectRatio(),0.001,20.0);

        ctx.bindProgram(this._program);
        ctx.setDepthTest(true);
        ctx.setClearColor(0.125,0.125,0.125,1);
        ctx.setProjectionMatrix(this._camera.getProjectionMatrix());

        this._t = 0;
    },
    draw : function(){
        var ctx    = this.getContext();
        var draw   = this._draw;
        var time   = this._t;
        var camera = this._camera;

        camera.lookAt(
            [Math.cos(time * 0.05 * Math.PI) * 5, 5, Math.sin(time * 0.05 * Math.PI) * 5],
            [0,0,0],
            [0,1,0]
        );
        camera.updateViewMatrix();
        ctx.setViewMatrix(camera.getViewMatrix());

        ctx.clear(ctx.COLOR_BIT | ctx.DEPTH_BIT);

        function drawCube(){
            ctx.pushModelMatrix();
                ctx.scale(CUBE_SCALE);
                draw.drawPivotAxes();
                draw.drawCubeColored();
            ctx.popModelMatrix();
        }

        function drawPosition(position){
            ctx.pushModelMatrix();
                ctx.translate(position);
                draw.drawCube(0.025);
            ctx.popModelMatrix();
        }

        function drawPivotSmall(){
            ctx.pushModelMatrix();
                ctx.scale([0.5,0.5,0.5]);
                draw.drawPivotAxes();
            ctx.popModelMatrix();
        }

        //draw grid
        draw.setLineWidth(1.5);
        draw.setColor4(0.15,0.15,0.15,1.0);
        draw.drawGrid([20,20],40);
        draw.setLineWidth(1);
        draw.setColor4(0.145,0.145,0.145,1.0);
        draw.drawGrid([20,20],80);

        //draw pivot
        ctx.pushModelMatrix();
            ctx.translate([0,0.125,0]);
            draw.drawPivotAxes();
        ctx.popModelMatrix();

        //transform model with matrix stack
        ctx.pushModelMatrix();
            ctx.translate(OFFSET_Y);
            ctx.pushModelMatrix();
                ctx.translate(OFFSET);

                //rotation
                ctx.pushModelMatrix();
                    //rotate by axis angle
                    ctx.pushModelMatrix();
                        var rotationAngle = time * Math.PI;
                        var rotationAxis  = [0,1,0];
                        drawPivotSmall();
                        ctx.rotate(rotationAngle,rotationAxis);
                        drawCube();
                    ctx.popModelMatrix();

                    //rotate by angle per axis
                    ctx.translate(OFFSET_X);
                    ctx.pushModelMatrix();
                        var rotationPerAxis = [0,rotationAngle,0];
                        drawPivotSmall();
                        ctx.rotateXYZ(rotationPerAxis);
                        drawCube();
                    ctx.popModelMatrix();

                    //rotate manual by rotation matrix mult
                    ctx.translate(OFFSET_X);
                    ctx.pushModelMatrix();
                        //need to rotate counter clockwise to match default matrix rotation direction
                        var target = [Math.cos(-rotationAngle),0,Math.sin(-rotationAngle)];
                        var origin = [0,0,0];

                        var tangent   = Vec3.create();
                        var normal    = Vec3.create();
                        var bitangent = Vec3.create();

                        Vec3.normalize(Vec3.sub(Vec3.set(tangent,target),origin));
                        Vec3.cross(Vec3.set(bitangent,tangent),Vec3.yAxis());
                        Vec3.cross(Vec3.set(normal,bitangent),tangent);

                        //var rotation = Mat4.createFromOnB(tangent,normal,bitangent);
                        var rotation = Mat4.lookAt(Mat4.create(),origin,target,[0,1,0]);

                        //var rotation = Mat4.createFromRotation(rotationAngle,rotationAxis);

                        drawPivotSmall();
                        draw.setColor4(1,1,1,1);
                        drawPosition(Vec3.scale(Vec3.copy(target),0.55));
                        ctx.multMatrix(rotation);
                        //ctx.setModelMatrix(rotation);
                        drawCube();
                    ctx.popModelMatrix();

                    //rotate by quaternion
                    ctx.translate(OFFSET_X);
                    ctx.pushModelMatrix();
                        var orientation = Quat.fromMat4(Quat.create(),rotation);
                        var orientation = Quat.lookAt(Quat.create(),origin,target,Vec3.yAxis());
                        //var orientation = Quat.setAxisAngle(Quat.create(),rotationAngle,[0,1,0]);

                        drawPivotSmall();
                        draw.setColor4(1,1,1,1);
                        drawPosition(Vec3.scale(Vec3.copy(target),0.55));
                        ctx.rotateQuat(orientation);
                        drawCube();
                    ctx.popModelMatrix();
                ctx.popModelMatrix();

                //translation
                ctx.translate(OFFSET_Z);
                ctx.pushModelMatrix();
                    //translate by vector
                    ctx.pushModelMatrix();
                        var translationXYZ = [0,Math.sin(time * Math.PI) * 0.5,0];
                        ctx.translate(translationXYZ);
                        drawCube();
                    ctx.popModelMatrix();

                    //translate manual by translation matrix
                    ctx.translate(OFFSET_X);
                    ctx.pushModelMatrix();
                        var translation = Mat4.translate(Mat4.create(),translationXYZ);
                        ctx.multMatrix(translation);
                        drawCube();
                    ctx.popModelMatrix();
                ctx.popModelMatrix();

                //scale
                ctx.translate(OFFSET_Z);
                ctx.pushModelMatrix();
                    ctx.translate(OFFSET_X);
                    ctx.translate(OFFSET_X);
                    //scale xyz
                    ctx.pushModelMatrix();
                        var scaleXYZ = Vec3.create();
                        scaleXYZ[0] = scaleXYZ[1] = scaleXYZ[2] = 0.5 + (0.5 + Math.sin(-time * Math.PI) * 0.5) * 0.5;
                        ctx.scale(scaleXYZ);
                        drawCube();
                    ctx.popModelMatrix();

                    //scale manual by scale matrix
                    ctx.translate(OFFSET_X);
                    ctx.pushModelMatrix();
                        var scale = Mat4.scale(Mat4.create(),scaleXYZ);
                        ctx.multMatrix(scale);
                        drawCube();
                    ctx.popModelMatrix();
                ctx.popModelMatrix();

                //translate + scale + rotate
                ctx.translate(OFFSET_Z);
                ctx.pushModelMatrix();
                    //translate by position + scale xyz + rotate by axis angle
                    ctx.pushModelMatrix();
                        ctx.translate(translationXYZ);
                        ctx.scale(scaleXYZ);
                        ctx.rotate(time * Math.PI,[0,1,0]);
                        drawCube();
                    ctx.popModelMatrix();
                ctx.popModelMatrix();

                ctx.translate(OFFSET_X);
                ctx.pushModelMatrix();
                    //manual translate by translation matrix + manual scale by scale matrix + manual rotation by rotation matrix
                    ctx.pushModelMatrix();
                        ctx.multMatrix(translation);
                        ctx.multMatrix(scale);
                        ctx.multMatrix(rotation);
                        drawCube();
                    ctx.popModelMatrix();
                ctx.popModelMatrix();

                ctx.translate(OFFSET_X);
                ctx.pushModelMatrix();
                    //translate by position + scale xyz + rotate by rotation per axis
                    ctx.pushModelMatrix();
                        ctx.translate(translationXYZ);
                        ctx.scale(scaleXYZ);
                        ctx.rotateXYZ(rotationPerAxis);
                        drawCube();
                    ctx.popModelMatrix();
                ctx.popModelMatrix();

                ctx.translate(OFFSET_X);
                ctx.pushModelMatrix();
                    //manual translate by translation matrix + manual scale by scale matrix + rotation by quaternion
                    ctx.pushModelMatrix();
                        ctx.multMatrix(translation);
                        ctx.multMatrix(scale);
                        ctx.rotateQuat(orientation);
                        drawCube();
                    ctx.popModelMatrix();
                ctx.popModelMatrix();

            ctx.popModelMatrix();
        ctx.popModelMatrix();

        this._t += 1.0 / 60.0;
    }
});
