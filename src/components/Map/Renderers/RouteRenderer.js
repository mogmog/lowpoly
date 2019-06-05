//
//
//

import * as TWEEN from '@tweenjs/tween.js';

import AbstractRenderer from './AbstractRenderer';
import RouteEntity from '../Entities/RouteEntityMesh'; // import RouteEntity from '../Entities/RouteEntity';

const THREE = window.THREE = require('three');

require ('three/examples/js/postprocessing/EffectComposer');
require ('three/examples/js/postprocessing/RenderPass');
require ('three/examples/js/postprocessing/ShaderPass');

require ('three/examples/js/shaders/CopyShader');

require ('three/examples/js/shaders/LuminosityHighPassShader'); //  THREE.UnrealBloomPass relies on THREE.LuminosityHighPassShader
require ('three/examples/js/postprocessing/UnrealBloomPass');

export default class RouteRenderer extends AbstractRenderer {

  constructor(
    esriLoaderContext, 
    paths
  ) {
    super();

    this.esriLoaderContext = esriLoaderContext;

    this.renderer = null; // three.js renderer
    this.camera = null; // three.js camera
    this.scene = null; // three.js scene

    this.geo_curve_path = paths;

    this.extenalCanvas = null; // extenalCanvas;
  }

  /**
   * Setup function, called once
   */
  setup(context)
  {
    const externalRenderers = this.esriLoaderContext.externalRenderers;
    const SpatialReference = this.esriLoaderContext.SpatialReference;

    const view = context.view;

    // initialize the three.js renderer
    //////////////////////////////////////////////////////////////////////////////////////

    var params = {
      exposure: 1,
      bloomStrength: 5,
      bloomThreshold: 0,
      bloomRadius: 0
    };

    let canvas = null;

    if (true) {

      const canvas_parent = context.gl.canvas.parentElement;

      canvas = this.extenalCanvas = document.createElement('canvas');
      canvas.style.position = 'absolute';
      canvas.style.top = '0px';
      canvas.style.left = '0px';
      canvas.style.pointerEvents = "none";

      canvas_parent.appendChild(canvas);
    }

    const renderer = this.renderer = new THREE.WebGLRenderer(
      this.extenalCanvas ? 
      {
        canvas : canvas,
        alpha : true
        // premultipliedAlpha: false
      } : 
      {
        context: context.gl,
        // premultipliedAlpha: false
      }
    );

    if (this.extenalCanvas) {

      renderer.setClearColor(0xFF0000, 0);
    }

    const width = context.camera.fullWidth;
    const height = context.camera.fullHeight;

    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(width, height);

    // prevent three.js from clearing the buffers provided by the ArcGIS JS API.
    if (!this.extenalCanvas) {
      this.renderer.autoClear = false;
      this.renderer.autoClearDepth = false;
      this.renderer.autoClearStencil = false;
      this.renderer.autoClearColor = false;
    }

    this.renderer.localClippingEnabled = true; // need fo clipping plane usage

    // The ArcGIS JS API renders to custom offscreen buffers, and not to the default framebuffers.
    // We have to inject this bit of code into the three.js runtime in order for it to bind those
    // buffers instead of the default ones.

    var originalSetRenderTarget = this.renderer.setRenderTarget.bind(this.renderer);

    this.renderer.setRenderTarget = function(target) {
      originalSetRenderTarget(target);
      if (target == null) {
        context.bindRenderTarget();
      }
    };

    const scene = this.scene = new THREE.Scene();

    // setup the camera
    const cam = context.camera;

    const camera = this.camera = new THREE.PerspectiveCamera(cam.fov, cam.aspect, cam.near, cam.far);
    this.camera.position.set(cam.eye[0], cam.eye[1], cam.eye[2]);
    this.camera.up.set(cam.up[0], cam.up[1], cam.up[2]);
    this.camera.lookAt(new THREE.Vector3(cam.center[0], cam.center[1], cam.center[2]));
    // Projection matrix can be copied directly
    this.camera.projectionMatrix.fromArray(cam.projectionMatrix);

    // glow effect injection
    const renderScene = new THREE.RenderPass( scene, camera );
    const bloomPass = new THREE.UnrealBloomPass( new THREE.Vector2( width, height ), 1.5, 0.4, 0.85 );
    bloomPass.threshold = params.bloomThreshold;
    bloomPass.strength = params.bloomStrength;
    bloomPass.radius = params.bloomRadius;

    const bloomComposer = new THREE.EffectComposer( renderer );
    bloomComposer.renderToScreen = false;
    bloomComposer.addPass( renderScene );
    bloomComposer.addPass( bloomPass );
    bloomComposer.renderToScreen = true;
    bloomComposer.renderTarget1.format = THREE.RGBAFormat;
    bloomComposer.renderTarget2.format = THREE.RGBAFormat;

    const finalPass = new THREE.ShaderPass(
      new THREE.ShaderMaterial( {
        uniforms: {
          baseTexture: { value: null },
          bloomTexture: { value: bloomComposer.renderTarget2.texture }
        },
        vertexShader: _finalPass_vertexshader,
        fragmentShader: _finalPass_fragmentshader,
        defines: {}
      } ), "baseTexture"
    );
    finalPass.needsSwap = true;
    const finalComposer = new THREE.EffectComposer( renderer );
    finalComposer.addPass( renderScene );
    finalComposer.addPass( finalPass );

    finalComposer.renderTarget1.format = THREE.RGBAFormat;
    finalComposer.renderTarget2.format = THREE.RGBAFormat;
    //effectBloom.renderTargetX.format = THREE.RGBAFormat;
    //effectBloom.renderTargetY.format = THREE.RGBAFormat;

    this.composers = {
      camera : camera,
      size : {
        width : width,
        height : height
      },
      renderer : renderer,
      bloomComposer : bloomComposer,
      finalComposer : finalComposer
    };
    //

    this.init(
      this.geo_curve_path[0],
      externalRenderers, 
      view, 
      SpatialReference, 
      cam
    );

    // cleanup after ourselfs
    context.resetWebGLState();
  }

  init( 
    path,
    externalRenderers, 
    view, 
    SpatialReference, 
    cam
    ) {

    const meshline = this.meshline = new RouteEntity();

    this.meshline.updateRoute(path, externalRenderers, view, SpatialReference, cam);

    meshline.setProgress(0);

    this.scene.add(meshline);

    this.scene.add(new THREE.AmbientLight(0xeeeeee));

    if (true) {
      
      meshline.tween = new TWEEN.Tween(
      {
        persent: 0,
      })
      .to(
          {
            persent : 1
          },
          150000)
      .onUpdate(
        obj =>
        { 
          meshline.setProgress(obj.persent);
        })
      .onComplete(
        () => {

          delete meshline.tween;
        })
      .delay(2000)
      .start();
    }
  }


  setTrailLength(value) {

    if (this.meshline && this.meshline.setTrailLength) {

      this.meshline.setTrailLength(value);
    }
  }

  render(context) {

    this.renderContext = context;

    if (context.gl.drawingBufferWidth !== this.composers.size.width || 
      context.gl.drawingBufferHeight !== this.composers.size.height ) {

        const width = context.gl.drawingBufferWidth;
        const height = context.gl.drawingBufferHeight;

        this.composers.size.width = width;
        this.composers.size.height = height;

        this.composers.renderer.setSize( width, height );
				this.composers.bloomComposer.setSize( width, height );
				this.composers.finalComposer.setSize( width, height );
    }

    // update camera parameters
    ///////////////////////////////////////////////////////////////////////////////////
    const cam = context.camera;
    this.camera.fov = cam.fov;
    this.camera.aspect = cam.aspect;
    this.camera.near = cam.near;
    this.camera.far = cam.far;
    this.camera.position.set(cam.eye[0], cam.eye[1], cam.eye[2]);
    this.camera.up.set(cam.up[0], cam.up[1], cam.up[2]);
    this.camera.lookAt(new THREE.Vector3(cam.center[0], cam.center[1], cam.center[2]));
    // Projection matrix can be copied directly
    this.camera.projectionMatrix.fromArray(cam.projectionMatrix);

    // draw the scene
    /////////////////////////////////////////////////////////////////////////////////////////////////////

    this.renderer.state.reset();

    this.renderer.state.setBlending(THREE.NoBlending); // 0.97 fix !

    // this.composers.renderer.render(this.scene, this.camera);

    this.composers.bloomComposer.render();

    // this.composers.finalComposer.render();

    // cleanup
    context.resetWebGLState();
  }


  afterRender (view) {
  }
}

const _finalPass_vertexshader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`;

const _finalPass_fragmentshader = `
uniform sampler2D baseTexture;
uniform sampler2D bloomTexture;
varying vec2 vUv;
vec4 getTexture( sampler2D texture ) {
  return mapTexelToLinear( texture2D( texture , vUv ) );
}
void main() {
  gl_FragColor = ( getTexture( baseTexture ) + vec4( 1.0 ) * getTexture( bloomTexture ) );
}`;
