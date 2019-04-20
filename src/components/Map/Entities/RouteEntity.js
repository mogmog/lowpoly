import * as THREE from 'three';
import MeshLine from 'three.meshline';

export default class RouteEntity extends THREE.Group {

  constructor () {
    super();
  }

  updateRoute(path, externalRenderers, view, SpatialReference, camera)
  {

    let geometry = new THREE.Geometry();

    path.forEach(x => {
      let pos = [0, 0, 0];
      externalRenderers.toRenderCoordinates(view, x, 0, SpatialReference.WGS84, pos, 0, 1);
      geometry.vertices.push(new THREE.Vector3(pos[0], pos[1], pos[2])); // we make all coords in global world coord sys !
      console.log(pos);
    });

    let line = new MeshLine.MeshLine();
    line.setGeometry( geometry );

    var resolution = new THREE.Vector2( window.innerWidth, window.innerHeight );

    var material = new MeshLine.MeshLineMaterial( {
      useMap: false,
      color: new THREE.Color( 0xed6a5a ),
      opacity: 1,
      resolution: resolution,
      sizeAttenuation: false,
      lineWidth: 10,
      near : camera.near,
      far : camera.far

    });

    this.add(new THREE.Mesh(line.geometry, material));


  }



}
