import * as THREE from 'three';
import THREE_MeshLine from 'three.meshline';

const MeshLine = THREE_MeshLine.MeshLine;
const MeshLineMaterial = THREE_MeshLine.MeshLineMaterial;

export default class RouteEntityMesh extends THREE.Group {

  constructor(){

    super();

    this.trail_curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(),
      new THREE.Vector3()
    ]);

    this.trail_length = 1900;

    this.trail_progress = 0;
  }

  setProgress(value) {

    this.trail_progress = value;
  
    const v = new THREE.Vector3();

    this.trail_curve.getPoint(value, v);

    if (this.trail_line) {

      this.trail_line.advance( v );
    }
  }

  setTrailLength(value) { // 100 - 500

    if (isNaN(value)) {
      value = 100;
    }

    if (value < 10) {
      value = 10;
    } else if (value > 500) {
      value = 500;
    }

    this.trail_length = value;
  
    this.createMeshLine();

    this.setProgress(this.trail_progress);
  }

  updateRoute(path, externalRenderers, view, SpatialReference)
  {
    const curve_path = [];

    const zAddition = 10;

    path.forEach(x => {

      let pos = [0, 0, 0];

      externalRenderers.toRenderCoordinates(
        view, x, 0, SpatialReference.WGS84, pos, 0, 1);

      curve_path.push(
        new THREE.Vector3(pos[0], pos[1], pos[2] + zAddition));
        // we make all coords in global world coord sys !
    });

    this.trail_curve = new THREE.CatmullRomCurve3(curve_path);

    this.createMeshLine();

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

    const trail_geometry = new THREE.Geometry();

    const start_v = new THREE.Vector3();

    this.trail_curve.getPoint(this.trail_progress, start_v);

    for (let i = 0; i < this.trail_length; i++) {

      trail_geometry.vertices.push(start_v.clone());
    }

    // Create the line mesh
    this.trail_line = new MeshLine();
    
    this.trail_line.setGeometry( trail_geometry,  function( p ) { return p; }  ); // makes width taper
    // this.trail_line.setGeometry( trail_geometry );
    
    this.trail_material = this.createMaterial();

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
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
			transparent: false,
      sizeAttenuation: true,
      depthWrite: false,
      depthTest: true,
      depthFunc: THREE.AlwaysDepth,
      lineWidth: 550,
      near : 1, //camera.near,
      far : 1000, // camera.far,
    });
  }

}
