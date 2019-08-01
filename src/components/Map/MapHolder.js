import React, { Component, Fragment } from 'react';
import esriLoader from 'esri-loader';
import TWEEN from '@tweenjs/tween.js';
import './MapHolder.css';

import * as THREE from 'three'; //leave this in?
import ImageRenderer from './Renderers/ImageRenderer';
import RouteRenderer from './Renderers/RouteRenderer';

const options = {
    url: 'https://js.arcgis.com/4.9',
};


export default class MapHolder extends Component {

    state = {
        zoom : 0, 
        currentCard : {camera : null},
        routeTailPercentage : 1,
        routeLengthPercentage : 0
    };

    constructor() {
        super();
        this.needsRedraw = true;
        this.animate = this.animate.bind(this);
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
                    'esri/layers/BaseElevationLayer',

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
                     BaseElevationLayer,
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

                    const ExaggeratedElevationLayer = BaseElevationLayer.createSubclass({
                        properties: {
                            // exaggerates the actual elevations by 100x
                            exaggeration: 1.2
                        },

                        load: function() {
                            this._elevation = new ElevationLayer({
                                url: "//elevation3d.arcgis.com/arcgis/rest/services/WorldElevation3D/Terrain3D/ImageServer"
                            });

                            // wait for the elevation layer to load before resolving load()
                            this.addResolvingPromise(this._elevation.load());
                        },

                        // Fetches the tile(s) visible in the view
                        fetchTile: function(level, row, col) {
                            return this._elevation.fetchTile(level, row, col).then(
                                function(data) {
                                    var exaggeration = this.exaggeration;
                                    for (var i = 0; i < data.values.length; i++) {
                                        data.values[i] = data.values[i] * exaggeration;
                                    }

                                    return data;
                                }.bind(this)
                            );
                        }
                    });

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

                                    context.fillStyle = 'rgba(240, 240, 240, 0.7)';

                                    context.globalAlpha = 1;
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
                        opacity : 1,
                        urlTemplate:
                            'http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
                        title: 'Black and White',
                    });

                    var worldGround = new ElevationLayer({
                        url:
                            'http://elevation3d.arcgis.com/arcgis/rest/services/WorldElevation3D/Terrain3D/ImageServer',
                        visible: false,
                    });

                    const map = new WebMap({

                        ground: {
                            layers: [new ExaggeratedElevationLayer()]
                        },
                        layers: [greyTileLayer],
                    });

                    const view = new SceneView({
                        map: map,

                        // center : [20.438086772337208, 42.389699080958245],
                        container: 'viewDiv',

                        alphaCompositingEnabled: true,

                        camera : {"position":{"spatialReference":{"latestWkid":3857,"wkid":102100},"x":-307391.4364895002,"y":7216826.400379283,"z":11583.47221267689},"heading":326.65066251089536,"tilt":60.95428259540638},

                        Xcamera: {"position": {"spatialReference":{"latestWkid":3857,"wkid":102100},"x":2277974.911703386,"y":5215285.135338508,"z":2399.7157164365053}},

                        ui: {
                            components: []
                        },
                        environment: {

                            background: {
                                type: "color",
                                color: [255, 252, 244, 0]
                            },

                            // disable stars
                            starsEnabled: false,
                            //disable atmosphere
                            atmosphereEnabled: true,
                        },
                    });

                    view.watch('camera', function(newValue, oldValue, property, object) {
                        if (!self.props.showCards) {
                            self.props.updateCamera(newValue);
                            console.log(newValue);
                        }

                    });

                    view.when(x=> {

                        var camera = view.camera.clone();
                        self.originalCamera = view.camera.clone();
                        var center = view.center.clone();
                        var scale = view.scale;

                        var i = 0;

                        if (false) self.rotator = window.setInterval(d=> {

                            var newCenter = center.clone();
                            newCenter.x -= i * scale /3000 ;
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

                    //const geojson = [[20.438086772337556,42.38969908095896],[20.438086772337556,42.38969908095896],[20.43794226832688,42.38961995579302],[20.43774831108749,42.38950026221573],[20.437531303614378,42.38936925306916],[20.437325024977326,42.38925936631858],[20.437115225940943,42.38913170993328],[20.436894865706563,42.389007238671184],[20.43665095232427,42.388880252838135],[20.43640469200909,42.38874999806285],[20.436155749484897,42.3886195756495],[20.43591401539743,42.388480100780725],[20.435674712061882,42.388353534042835],[20.435431636869907,42.38822327926755],[20.435225777328014,42.388113057240844],[20.434979014098644,42.388055389747024],[20.43476183898747,42.38799520768225],[20.434712301939726,42.38780762068927],[20.43493333272636,42.3876475263387],[20.435091415420175,42.387540992349386],[20.43525192886591,42.38738475367427],[20.435392074286938,42.387228263542056],[20.43555250391364,42.38706766627729],[20.435722237452865,42.386905727908015],[20.43588283471763,42.3867389280349],[20.436044773086905,42.386580342426896],[20.436230096966028,42.3864230979234],[20.436406703665853,42.38623844459653],[20.436592614278197,42.38604482263327],[20.43676813133061,42.385852206498384],[20.43694708496332,42.38566009327769],[20.437096199020743,42.38550586625934],[20.43725143186748,42.385350381955504],[20.437411107122898,42.385177882388234],[20.437581427395344,42.38500630483031],[20.43774688616395,42.38483841530979],[20.437918547540903,42.38467278890312],[20.438116192817688,42.38450582139194],[20.438319873064756,42.38432804122567],[20.438520703464746,42.38414405845106],[20.43871432542801,42.383948089554906],[20.43890249915421,42.383755473420024],[20.439054714515805,42.38356679677963],[20.4391810297966,42.38338113762438],[20.439300974830985,42.383194137364626],[20.439410274848342,42.382998587563634],[20.439505241811275,42.38281183876097],[20.43958361260593,42.38262710161507],[20.439674640074372,42.382445046678185],[20.43975862674415,42.38225653767586],[20.439842445775867,42.38207163289189],[20.43992425315082,42.38188773393631],[20.440015783533454,42.381702829152346],[20.440103793516755,42.3815153259784],[20.440192222595215,42.38132664933801],[20.440286099910736,42.38113705068827],[20.44037721119821,42.380949882790446],[20.440469244495034,42.3807658161968],[20.440559601411223,42.38057982176542],[20.44065029360354,42.38039298914373],[20.440732771530747,42.38021613098681],[20.440838299691677,42.379995519295335],[20.440940223634243,42.37978572025895],[20.44104809872806,42.37955731339753],[20.441145664080977,42.379364194348454],[20.441248510032892,42.379162944853306],[20.44134506955743,42.378955660387874],[20.44144540093839,42.37875659018755],[20.441577835008502,42.378536062315106],[20.441677663475275,42.378287287428975],[20.441777324303985,42.37804479897022],[20.44189282692969,42.377805998548865],[20.441999025642872,42.37757625058293],[20.44210203923285,42.3773536272347],[20.44220413081348,42.37713636830449],[20.442307563498616,42.37692413851619],[20.442410241812468,42.376709980890155],[20.442502945661545,42.37649573944509],[20.44258089736104,42.376281498000026],[20.442645270377398,42.376063568517566],[20.442703189328313,42.375857876613736],[20.442768819630146,42.37566601485014],[20.44280167669058,42.375485468655825],[20.44279689900577,42.37542939372361],[20.44272070750594,42.37521850503981],[20.442839479073882,42.37503913231194],[20.44308909215033,42.37499563023448],[20.443183137103915,42.374988589435816],[20.44336125254631,42.37495791167021],[20.443613715469837,42.374886916950345],[20.443858047947288,42.37480510957539],[20.44409609399736,42.3747321870178],[20.444336235523224,42.374659264460206],[20.444576628506184,42.37458282150328],[20.444736555218697,42.37453328445554],[20.44497183524072,42.374468659982085],[20.445269979536533,42.37437168136239],[20.445504002273083,42.37428744323552],[20.44572905637324,42.37420639023185],[20.44600415043533,42.37410387955606],[20.446258541196585,42.37399793229997],[20.44652223587036,42.37388930283487],[20.446795066818595,42.37379492260516],[20.447053983807564,42.373686293140054],[20.447293035686016,42.373577328398824],[20.4475200176239,42.37346920184791],[20.447735767811537,42.373366355895996],[20.447968365624547,42.37325009889901],[20.448194090276957,42.37314079888165],[20.44842727482319,42.37303426489234],[20.448640510439873,42.372927647084],[20.448865396901965,42.37281390465796],[20.449084667488933,42.37270452082157],[20.449308631941676,42.3725994117558],[20.44952622614801,42.37248801626265],[20.44974759221077,42.372379302978516],[20.45000122860074,42.372269835323095],[20.450217481702566,42.372178975492716],[20.45045116916299,42.37208493053913],[20.450697261840105,42.371993316337466],[20.450943019241095,42.37189340405166],[20.45121056959033,42.37178687006235],[20.451468396931887,42.37167832441628],[20.45172027312219,42.371579920873046],[20.451974999159575,42.371480260044336],[20.452233161777258,42.37137733027339],[20.452495850622654,42.37127708271146],[20.45278393663466,42.37116334028542],[20.45301452279091,42.37107683904469],[20.45324368402362,42.37099033780396],[20.453480640426278,42.37089210189879],[20.45372254215181,42.370789255946875],[20.453984728083014,42.37067844718695],[20.454259235411882,42.370571410283446],[20.45453231781721,42.370459511876106],[20.45480640605092,42.37035163678229],[20.455080829560757,42.3702440969646],[20.455361707136035,42.3701386526227],[20.455636465921998,42.3700297717005],[20.455902675166726,42.36991846002638],[20.456165364012122,42.36980966292322],[20.456427969038486,42.3697001952678],[20.456686802208424,42.36959039233625],[20.456944378092885,42.369483690708876],[20.457196421921253,42.36937690526247],[20.45745525509119,42.369277998805046],[20.457711908966303,42.36918060109019],[20.457975352182984,42.36907113343477],[20.458243489265442,42.36896635964513],[20.458528976887465,42.368858233094215],[20.45882142148912,42.36875111237168],[20.45913029462099,42.36865094862878],[20.45943908393383,42.36855698749423],[20.459751896560192,42.36847065389156],[20.460085663944483,42.368370573967695],[20.460320860147476,42.3682979028672],[20.460559828206897,42.36823017708957],[20.460798293352127,42.36816504970193],[20.461034160107374,42.36809673719108],[20.461273044347763,42.36802532337606],[20.46151335351169,42.367955250665545],[20.46175517141819,42.36788207665086],[20.461999168619514,42.36781166866422],[20.462250541895628,42.36774201504886],[20.46250183135271,42.36767336726189],[20.462751276791096,42.36760262399912],[20.463000554591417,42.36753229983151],[20.463251173496246,42.367461724206805],[20.463509168475866,42.367382599040866],[20.463783591985703,42.367302384227514],[20.464064553380013,42.36722049303353],[20.464330343529582,42.36713156104088],[20.46460149809718,42.36703625880182],[20.464853793382645,42.36693961545825],[20.465079937130213,42.36684079281986],[20.465288646519184,42.366741467267275],[20.465490566566586,42.36663853749633],[20.465776724740863,42.36647542566061],[20.466026170179248,42.36630745232105],[20.466263545677066,42.366135623306036],[20.466510895639658,42.36596169881523],[20.46674156561494,42.365788109600544],[20.46695857308805,42.365617621690035],[20.467170970514417,42.365452917292714],[20.467387391254306,42.365279998630285],[20.46761194244027,42.36511453986168],[20.467835906893015,42.36495033837855],[20.46806339174509,42.36479024402797],[20.46829883940518,42.364623779430985],[20.46853043138981,42.36444666981697],[20.46878205612302,42.36426964402199],[20.469032172113657,42.36408909782767],[20.469287652522326,42.363903019577265],[20.46953952871263,42.363721719011664],[20.469781262800097,42.36354259774089],[20.47002819366753,42.36336473375559],[20.47027445398271,42.36318510957062],[20.47051920555532,42.363011268898845],[20.470754150301218,42.362838266417384],[20.470980629324913,42.362673645839095],[20.471197720617056,42.36251832917333],[20.471417913213372,42.36236326396465],[20.471645146608353,42.362210378050804],[20.471874978393316,42.36205372028053],[20.472103469073772,42.361913826316595],[20.47234126366675,42.361786756664515],[20.472585512325168,42.36166773363948],[20.4728342872113,42.36155508086085],[20.473086582496762,42.361452989280224],[20.473335273563862,42.361364560201764],[20.47359712421894,42.361287865787745],[20.47385369427502,42.36122030764818],[20.474114455282688,42.36116414889693],[20.4743729531765,42.36111628822982],[20.474461382254958,42.36109960824251]];

                    const geojson = this.props.locations.map(d=> [d.longitude, d.latitude])
                    var polyline = {
                        type: 'polyline',
                        paths: geojson,
                    };

                    worldGround.queryElevation(new Polyline(polyline)).then(result => {
                        console.log("result");
                        console.log(result);

                        self.routeRenderer = new RouteRenderer(self.esriLoaderContext, result.geometry.paths);

                        externalRenderers.add(view, self.routeRenderer);

                    }).catch(d=> {
                        console.log(d);
                    });

                    const images = [{"description":{"title":"Lagoon"},"id":1,"location":{"geometry":{"coordinates":[42,42,400.79999923706055],"type":"Point"},"properties":{},"type":"Feature"}},{"description":{"title":"church"},"id":2,"location":{"geometry":{"coordinates":[42,42.1,400.79999923706055],"type":"Point"},"properties":{},"type":"Feature"}}];
                    //const { images } = self.props;

                    //self.routeRenderer = new RouteRenderer(self.esriLoaderContext);
                    //self.imageRenderer = new ImageRenderer(self.esriLoaderContext, images);

                    //externalRenderers.add(view, self.routeRenderer);
                    //externalRenderers.add(view, self.imageRenderer);

                    window.requestAnimationFrame(self.animate);

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
        const camera = this.props.card && this.props.card.camera;

        if (this.props.currentCard !== this.state.currentCard && that.esriLoaderContext) {

            var cam = that.esriLoaderContext.view.camera.clone();

            this.setState({currentCard : this.props.currentCard})

            if (this.props.currentCard && this.props.currentCard.camera) {
                that.esriLoaderContext.view.goTo(this.props.currentCard.camera, { duration: 1600});
            }
        }
    }

    componentDidMount() {
        this.esriLoad();
        //this.props.scrollToTop();
    }

    animate(time) {

        window.requestAnimationFrame(this.animate);

        if (!this.animate.last_tweens_count) this.animate.last_tweens_count = 0;

        let tweens_count = Object.keys(TWEEN._tweens).length;

        if (this.needsRedraw || tweens_count || this.animate.last_tweens_count != tweens_count) {

            if (tweens_count || this.animate.last_tweens_count != tweens_count) {

                TWEEN.update(time);
            }

            if (
                this.esriLoaderContext &&
                this.esriLoaderContext.externalRenderers &&
                this.esriLoaderContext.view &&
                this.esriLoaderContext.view._stage
            ) {
                this.esriLoaderContext.externalRenderers.requestRender(this.esriLoaderContext.view);

                this.needsRedraw = false;
            }
        }

        this.animate.last_tweens_count = tweens_count;
    }

    onTailLengthInputChange(event) {

        const value = parseFloat(event.target.value) || 0.0;

        this.setState({routeTailPercentage: value});

        if (this.routeRenderer) {

            this.routeRenderer.setTrailLength(value);

            this.needsRedraw = true;
        }
    }

    onRouteLengthInputChange(event) {

        const value = parseFloat(event.target.value) || 0.0;

        this.setState({routeLengthPercentage: value});

        if (this.routeRenderer) {

            this.routeRenderer.setProgress(value);

            this.needsRedraw = true;
        }
    }

    render() {

        const self = this;
        return (
        <Fragment>

            <div 
                id="viewDiv" 
                className={'viewDiv'} />

            <input 
                style = {{position:'fixed', top:'10px', left: '120px', zIndex : 999999, width:'300px'}}
                type="range" 
                min="0" max="1"
                value={self.state.routeLengthPercentage} 
                onChange={(event) => {self.onRouteLengthInputChange(event);}}
                step="0.005"/>

        </Fragment>);

        /*<input 
        style = {{position:'fixed', top:'10px', left: '120px', zIndex : 999999, width:'300px'}}
        type="range" 
        min="0" max="1"
        value={self.state.routeTailPercentage} 
        onChange={(event) => {self.onTailLengthInputChange(event);}}
        step="0.005"/>*/
    }
}
