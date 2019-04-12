import React, { Component, Fragment } from 'react';
import esriLoader from 'esri-loader';

import './MapHolder.css';

const options = {
    url: 'https://js.arcgis.com/4.9',
};

export default class MapHolder extends Component {

    state = {zoom : 0};

    constructor() {
        super();
    }

    esriLoad() {
        var self = this;

        return esriLoader
            .loadModules(
                [
                    'esri/core/declare',
                    'esri/request',
                    'esri/WebMap',
                    "esri/WebScene",
                    'esri/views/SceneView',
                    'esri/layers/BaseTileLayer',
                    'esri/layers/GraphicsLayer',
                    'esri/layers/ElevationLayer',
                    'esri/layers/MapImageLayer',
                    'esri/geometry/Extent',
                    'esri/geometry/Multipoint',
                    'esri/geometry/Point',
                    'esri/geometry/Polyline',
                    'esri/symbols/SimpleLineSymbol',
                    'esri/symbols/TextSymbol',
                    'esri/views/3d/externalRenderers',
                    'esri/geometry/SpatialReference',
                    'esri/geometry/support/webMercatorUtils',
                    'esri/geometry/geometryEngine',
                    'esri/Graphic',
                ],
                options
            )
            .then(
                ([
                     declare,
                     esriRequest,
                     WebMap,
                     WebScene,
                     SceneView,
                     BaseTileLayer,
                     GraphicsLayer,
                     ElevationLayer,
                     MapImageLayer,
                     Extent,
                     Multipoint,
                     Point,
                     Polyline,
                     SimpleLineSymbol,
                     TextSymbol,
                     externalRenderers,
                     SpatialReference,
                     webMercatorUtils,
                     geometryEngine,
                     Graphic,
                 ]) => {


                    var webscene = new WebScene({
                        portalItem: {
                            id: "d0580bb5df3840d384bda44b6ddeb54e"
                        }
                    });


                    //layer.when(e=> console.log(e))

                    var worldGround = new ElevationLayer({
                        url:
                            'http://elevation3d.arcgis.com/arcgis/rest/services/WorldElevation3D/Terrain3D/ImageServer',
                        visible: true,
                    });

                    const map = new WebMap({


                        logo: false,
                        ground: 'world-elevation',
                        layers: [],
                        slider: false
                    });

                    const view = new SceneView({
                        map: webscene,

                        container: 'viewDiv',

                        alphaCompositingEnabled: false,

                        camera: {
                            position: [-3.915, 13.529, 10139105.09],
                            heading: 3.28,

                            tilt: 1.91
                        },

                        ui: {
                            components: []
                        },
                        environment: {

                            lighting: {
                                // enable shadows for all the objects in a scene
                                directShadowsEnabled: false,
                                ambientOcclusionEnabled : false
                                // set the date and a time of the day for the current camera location

                            },
                            background: {
                                type: 'color', // autocasts as new ColorBackground()
                                // set the color alpha to 0 for full transparency
                                color: [0, 177, 244, 0.5],
                            },
                            // disable stars
                            starsEnabled: true,
                            //disable atmosphere
                            atmosphereEnabled: false,
                        },
                    });

                    view.when(x=> {

                        var camera = view.camera.clone();
                        var center = view.center.clone();
                        var scale = view.scale;

                        var i = 0;

                        self.rotator = window.setInterval(d=> {

                            var newCenter = center.clone();
                            newCenter.x -= i * scale /300 ;
                            i++;

                            view.goTo({
                                center: newCenter,
                                scale: scale,
                                heading: camera.heading,
                                tilt: camera.tilt
                            }, { animate: false });
                        }, 1/30);
                    })


                    self.esriLoaderContext = {
                        declare,
                        WebMap,
                        SceneView,
                        GraphicsLayer,
                        SpatialReference,
                        externalRenderers,
                        geometryEngine,
                        Graphic,
                        Point,
                        Polyline,
                        SimpleLineSymbol,
                        view,
                        webMercatorUtils,
                    };

                }
            )
            .catch(err => {
                console.error(err);
            });
    }

    componentDidUpdate(prevProps, prevState) {

        let that = this;

        function shiftCamera(deg) {
            var camera = that.esriLoaderContext.view.camera.clone();
            camera.position.longitude += deg;
            camera.position.latitude = 0;
            camera.position.x = 25512548;
            camera.position.z = 25512548;
            camera.tilt = 15;
            camera.heading = 0;
            console.log(camera);
            return camera;
        }

        function getLoc(longitude, latitude, zoom) {
            var camera = that.esriLoaderContext.view.camera.clone();
            camera.position.longitude = longitude;
            camera.position.latitude = latitude;
            camera.position.z = zoom;
            return camera;
        }


        if (this.props.zoom !== prevProps.zoom) {

          //  console.log(1243443);

           if (this.esriLoaderContext && this.esriLoaderContext.view && this.esriLoaderContext.view.camera) {

               if (this.props.zoom > 0.5) {
                   window.clearInterval(this.rotator);
                   that.esriLoaderContext.view.goTo(getLoc(42,42, 500500), {
                       duration : 1500
                   });
               }






           }
        }

        }


    componentDidMount() {
        this.esriLoad().then(d => {

            console.log(this.esriLoaderContext);
        });



    }

    render() {
        return <Fragment><div id="viewDiv" className={'viewDiv'} /></Fragment>;
    }
}
