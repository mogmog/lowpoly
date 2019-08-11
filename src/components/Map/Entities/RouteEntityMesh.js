import * as THREE from 'three';

// import THREE_MeshLine from 'three.meshline';
import THREE_MeshLine from './THREE.MeshLine';

const MeshLine = THREE_MeshLine.MeshLine;
const MeshLineMaterial = THREE_MeshLine.MeshLineMaterial;

const max_trail_length = 2000;

export default class RouteEntityMesh extends THREE.Group {

  constructor(){

    super();

    this.trail_curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(),
      new THREE.Vector3()
    ]);

    this.trail_length = max_trail_length;
    this.trail_progress = 0;
    this.trail_glow = 0;
  }

  setProgress(value, bForce, speedFactor) {

    if (bForce === undefined) {

      bForce = true;
    }

    this.trail_progress = 0;

    if (bForce) {

      this.createMeshLine();
    }

    for (let i = 0; i < value; i += 0.001 ){

      this.trail_progress = i;
  
      const v = new THREE.Vector3();
  
      this.trail_curve.getPoint(i , v);

     // console.log(speedFactor);

      if (this.trail_line) {
  
        this.trail_line.advance( v  );
      }
    }

    this.trail_progress = value;
  }

  setTrailLength(value) { // 0 - 1

    this.trail_length = value * max_trail_length;

    this.setProgress(this.trail_progress);
  }

  setGlow(value) { // 0 - 1

    this.trail_glow = value;

    if (this.trail_material) {
      this.trail_material.glow = value;
    }
  }

  updateRoute(path, externalRenderers, view, SpatialReference)
  {
    const curve_path = [];

    path.forEach(x => {

      let pos = [0, 0, 0];

      externalRenderers.toRenderCoordinates(
        view, x, 0, SpatialReference.WGS84, pos, 0, 1);

      curve_path.push(
        new THREE.Vector3(pos[0], pos[1], pos[2] * 3.55));
        //console.log('added');
      });



    this.trail_curve = new THREE.CatmullRomCurve3(curve_path);

    this.setProgress(this.trail_progress);
  }

  createMeshLine() {

    while(this.children.length) {
      const obj = this.children[0];
      if (obj.geometry) {
        obj.geometry.dispose();
      }
  
      if (obj.material) {
        obj.material.dispose();
      }
      this.remove(obj);
    }

    this.trail_geometry = new THREE.Geometry();

    const start_v = new THREE.Vector3();

    this.trail_curve.getPoint(this.trail_progress, start_v);

    for (let i = 0; i < this.trail_length; i++) {

      this.trail_geometry.vertices.push(start_v.clone());
    }

    // Create the line mesh
    this.trail_line = new MeshLine();

    if (this.trail_length === max_trail_length) {

      this.trail_line.setGeometry( this.trail_geometry );
    }
    else {

      this.trail_line.setGeometry( this.trail_geometry,  function( p ) { return p; }  ); // makes width taper
    }
    
    this.trail_material = this.createMaterial();

    //this.setGlow(this.trail_glow);

    this.trail_mesh = new THREE.Mesh( this.trail_line.geometry, this.trail_material ); 

    this.trail_mesh.frustumCulled = false;

    const self = this;

    this.trail_mesh.onBeforeRender = (renderer, scene, camera, geometry, material, group) => {

      if (self.trail_material) {

        const context = renderer.context;

        const resolution = {
          width: context.drawingBufferWidth,
          height: context.drawingBufferHeight
        };

        const trail_material = self.trail_material;
  
        trail_material.uniforms.resolution.value.copy( new THREE.Vector2(resolution.width, resolution.height) );
  
        trail_material.uniforms.near.value = camera.near;
        trail_material.uniforms.far.value = camera.far;
      }
    };

    this.add(this.trail_mesh);
  }

  createMaterial() {

    const resolution = new THREE.Vector2( window.innerWidth, window.innerHeight );

    return new MeshLineMaterial( {
      resolution: resolution,
      map: null,
      useMap: false,
      color: new THREE.Color( 0xffd300 ),
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
      /*transparent: true,*/
      //depthWrite: false,
      //depthTest: true,
      depthFunc: THREE.NeverDepth,
      sizeAttenuation : 0, // makes the line width constant regardless distance (1 unit is 1px on screen) (0 - attenuate, 1 - don't attenuate)
      lineWidth: 10, // float defining width (if sizeAttenuation is true, it's world units; else is screen pixels)
      near : 1, //camera.near,
      far : 1000, // camera.far,
    });
  }

}
