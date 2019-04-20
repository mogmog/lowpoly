import React, { Component, Fragment } from 'react';
import esriLoader from 'esri-loader';

import './MapHolder.css';

import * as THREE from 'three'; //leave this in?
import ImageRenderer from './Renderers/ImageRenderer';
import RouteRenderer from './Renderers/RouteRenderer';

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




                    const GreyLayer = BaseTileLayer.createSubclass({
                        properties: {
                            urlTemplate: null,
                        },

                        // generate the tile url for a given level, row and column
                        getTileUrl: function(level, row, col) {
                            return this.urlTemplate
                                .replace('{z}', level)
                                .replace('{x}', col)
                                .replace('{y}', row);
                        },

                        // This method fetches tiles for the specified level and size.
                        // Override this method to process the data returned from the server.
                        fetchTile: function(level, row, col) {
                            // call getTileUrl() method to construct the URL to tiles
                            // for a given level, row and col provided by the LayerView
                            var url = this.getTileUrl(level, row, col);

                            // request for tiles based on the generated url
                            return esriRequest(url, {
                                responseType: 'image',
                            }).then(
                                function(response) {
                                    // when esri request resolves successfully
                                    // get the image from the response
                                    var image = response.data;
                                    var width = this.tileInfo.size[0];
                                    var height = this.tileInfo.size[0];

                                    // create a canvas with 2D rendering context
                                    var canvas = document.createElement('canvas');
                                    var context = canvas.getContext('2d');
                                    canvas.width = width;
                                    canvas.height = height;

                                    context.fillStyle = 'rgba(255, 255, 255, 1)';
                                    //context.fillStyle = 'white';
                                    //context.globalAlpha = 0.5;
                                    context.fillRect(0, 0, width, height);
                                    context.globalCompositeOperation = 'luminosity';
                                    context.drawImage(image, 0, 0, width, height);

                                    return canvas;
                                }.bind(this)
                            );
                        },
                    });

                    // Create a new instance of the TintLayer and set its properties
                    const greyTileLayer = new GreyLayer({
                        opacity : 0.7,
                        urlTemplate:
                            'http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
                        title: 'Black and White',
                    });


                    var worldGround = new ElevationLayer({
                        url:
                            'http://elevation3d.arcgis.com/arcgis/rest/services/WorldElevation3D/Terrain3D/ImageServer',
                        visible: true,
                    });

                    const map = new WebMap({
                        basemap: 'satellite',
                        ground: 'world-elevation',
                        layers: [greyTileLayer],
                    });


                    const view = new SceneView({
                        map: map,

                        container: 'viewDiv',

                        alphaCompositingEnabled: false,

                        camera: {
                            position: [42.6210941952765, 42.06134876641631, 1600.7899992370605],
                            heading: 3.28,

                            tilt: -40.91
                        },

                        ui: {
                            components: []
                        },
                        environment: {


                            background: {
                                type: 'color', // autocasts as new ColorBackground()
                                // set the color alpha to 0 for full transparency
                                color: [0, 177, 244, 0.5],
                            },
                            // disable stars
                            starsEnabled: true,
                            //disable atmosphere
                            atmosphereEnabled: true,
                        },
                    });

                    view.when(x=> {

                        var camera = view.camera.clone();
                        self.originalCamera = view.camera.clone();
                        var center = view.center.clone();
                        var scale = view.scale;

                        var i = 0;

                        if (false) self.rotator = window.setInterval(d=> {

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

                    const images = [{"description":{"title":"Lagoon"},"id":1,"location":{"geometry":{"coordinates":[42,42,400.79999923706055],"type":"Point"},"properties":{},"type":"Feature"}},{"description":{"title":"church"},"id":2,"location":{"geometry":{"coordinates":[42,42.1,400.79999923706055],"type":"Point"},"properties":{},"type":"Feature"}}];
                    //const { images } = self.props;

                    self.routeRenderer = new RouteRenderer(self.esriLoaderContext);
                    self.imageRenderer = new ImageRenderer(self.esriLoaderContext, images);

                    externalRenderers.add(view, self.routeRenderer);
                    externalRenderers.add(view, self.imageRenderer);

                }
            )
            .catch(err => {
                console.error(err);
            });
    }

     getLoc =(longitude, latitude, zoom) => {

        //return this.originalCamera;

        var camera = this.originalCamera;
        camera.position.longitude = longitude;
        camera.position.latitude = latitude;
        camera.position.z = zoom;
        camera.tilt = -20;

        return camera;
    }

    componentDidUpdate(prevProps, prevState) {

        let that = this;
        const camera = this.props.card.camera;

        if (this.props.zoom !== prevProps.zoom) {

           console.log(this.props.zoom);

           if (this.esriLoaderContext && this.esriLoaderContext.view && this.esriLoaderContext.view.camera) {

               if (camera.style === 'followPath') {
                   this.rotator && window.clearInterval(this.rotator);

                   that.esriLoaderContext.view.goTo(this.getLoc(camera.destination[0], camera.destination[1] + this.props.zoom /20, 5705), {
                       animate : false
                   });

               }

           }
        }

        }


    componentDidMount() {
        this.esriLoad();
        //this.props.scrollToTop();
    }

    render() {
        return <Fragment><div id="viewDiv" className={'viewDiv'} /></Fragment>;
    }
}
