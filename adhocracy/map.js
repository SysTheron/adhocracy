/*
 * Two VectorLayers for each admin_level, one for simplified polygons
 and one for polygons in full complexity

 * BBox Strategy to fetch features dynamically by bounding box

 * Cluster-Strategy to simplify polygons on client additionally. The 
 Strategy replaces all features within a certain number of pixels with
 a new one.
 NOTE: check polygon support
 NOTE: tries to fetch "http://${base_url}/undefined"

 * configure admin_levels and different styles for each admin_level 
 on every zoom level. styles are 0 for hidden, 1 for borders and 
 2 for areas. configure baseurl.

 * requires openlayers/lib/OpenLayers.js at baseurl

 --
 * Die vom Server abgefragten Polygone können nur gefüllt werden, falls
 Geometrien mit Typ Polygon gesendet werden. LineStrings-Listen sind
 nicht in OpenLayers füllbar.

 * Den Features wird der Style bereits beim Laden gesetzt. Eine spätere
 Änderung in der StyleMap des Layers hat keine Auswirkungen auf bereits
 vorhandene Features. 
 * ( ) NOTE: extra layer für areas (simple/full x admin_levels)
 * ( ) NOTE: löschen der Features und neues fetchen der Daten
 * (x) NOTE: manuelles neuzeichnen mit 'drawFeature', 'cp,del,mod.add'
 --

 * TODO: config
 * TODO: capitols/proposals with popups, 
 click on capitol/proposal-polygon/marker opens 
 popup, link to capitol
 * TODO: list of search matches/proposals
 * TODO: hover (see cluster strategy example)

 * TODO: convert LineString features to Polygon features by using the 
 LineString for the coordinates of the polygon.
 * TODO: list of all open popups
 * TODO: query popup content from JSON
 * TODO: adjust proposal size
 */

var baseUrl = "/blub";
var adminLevels = [2,3,4,5,7];
var map;
var layers = new Array();
var propsLayer;
var styleBorder,styleArea,styleProps;

//Zoom 0 ... 15 -> 0=hidden,1=visibleByBorder,2=visibleByArea,3=both
var displayMap = [
    {styles: [1,0,0,0,2]},
    {styles: [1,0,0,0,2]},
    {styles: [1,0,0,0,2]},
    {styles: [1,0,0,0,2]},
    {styles: [1,1,0,0,2]},
    {styles: [1,1,0,0,2]},
    {styles: [1,1,1,0,2]},
    {styles: [1,1,1,0,2]},
    {styles: [1,1,1,0,2]},
    {styles: [1,1,1,1,2]},
    {styles: [1,1,1,1,2]},
    {styles: [1,1,1,1,1]},
    {styles: [1,1,1,1,1]},
    {styles: [1,1,1,1,1]},
    {styles: [1,1,1,1,1]},
    {styles: [1,1,1,1,1]},
    {styles: [1,1,1,1,1]},
    {styles: [1,1,1,1,1]},
    {styles: [1,1,1,1,1]}
];

function buildProposalPopup(attributes) {
    return "<div class='proposal_popup_title'>"+attributes.title+"</div>";
}


function addSingleProposalLayer(proposalId) {

    //layer for searching, proposals
    propsLayer = new OpenLayers.Layer.Vector("props", {
        displayInLayerSwitcher: false, 
               strategies: [new OpenLayers.Strategy.Fixed()],
               protocol: new OpenLayers.Protocol.HTTP({
                   url: ('/proposal/' + proposalId + '/get_geotag'),
               format: new OpenLayers.Format.GeoJSON({
                   ignoreExtraDims: true
               })
               }),
               projection: new OpenLayers.Projection("EPSG:4326")
        /* styleMap: new OpenLayers.StyleMap(styleProps)*/
    });

    propsLayer.events.on({
        'featureselected': function(feature) {
            //$('counter').innerHTML = this.selectedFeatures.length;
            popup = new OpenLayers.Popup.FramedCloud("chicken",
                //feature.geometry.getBounds().getCenterLonLat(),
                //feature.lonlat,
                feature.feature.geometry.getBounds().getCenterLonLat(),
                null,
                buildProposalPopup(feature.feature.attributes),
                //null,true,function(f) { 
                //            console.log('popup close'); 
                //	     propsLayer.events.triggerEvent("featureunselected", {feature: f})
                //         }
                null,false,null
                );
            //feature.popup = popup;
            this.map.addPopup(popup);
        },
        'featureunselected': onPopupClose,
        'featureadded': function(feature) {map.setCenter(feature.feature.geometry.getBounds().getCenterLonLat(), 10)}
    });

    //console.log(propsLayer != null);
    map.addLayer(propsLayer);
    drawControls = {
        select: new OpenLayers.Control.SelectFeature(
                        propsLayer,
                        {
                            clickout: true, toggle: false,
        multiple: false, hover: false,
        toggleKey: "ctrlKey", // ctrl key removes from selection
        multipleKey: "shiftKey", // shift key adds to selection
        box: false
                        }
                        )/*,
                           selecthover: new OpenLayers.Control.SelectFeature(
                           propsLayer,
                           {
                           multiple: false, hover: false,
                           toggleKey: "ctrlKey", // ctrl key removes from selection
                           multipleKey: "shiftKey" // shift key adds to selection
                           }
                           )
                           */            };

        for(var key in drawControls) {
            map.addControl(drawControls[key]);
        }
    var control = drawControls['select'];
    control.activate();

};

function loadMap(showControls, proposalId) {
    var lat=34.070;
    var lon=-118.73;
    var mapControls = [new OpenLayers.Control.Navigation()];
    if (showControls) {
        mapControls.push(new OpenLayers.Control.PanZoomBar());
        mapControls.push(new OpenLayers.Control.LayerSwitcher({'ascending':false}));
        mapControls.push(new OpenLayers.Control.MousePosition());
        mapControls.push(new OpenLayers.Control.KeyboardDefaults());
    }

    map = new OpenLayers.Map('map', {
        //                    restrictedExtent: new OpenLayers.Bounds(-180, -90, 180, 90),
        controls: mapControls, 
        //numZoomLevels: displayMap.length,
        maxExtent: new OpenLayers.Bounds(-20037508.34,-20037508.34,20037508.34,20037508.34),
        maxResolution: 156543.0399,
        numZoomLevels: displayMap.length,
        units: 'm',
        projection: new OpenLayers.Projection("EPSG:900913"),
        displayProjection: new OpenLayers.Projection("EPSG:4326"),
        moveTo: moveTo
    });


    map.addLayer(new OpenLayers.Layer.OSM("Transport Map",
                "http://otile1.mqcdn.com/tiles/1.0.0./osm/${z}/${x}/${y}.png"));
    //default Openstreetmap Baselayer
    map.addLayer(new OpenLayers.Layer.OSM("Open Street Map"));
    map.addLayer(new OpenLayers.Layer.OSM("&Ouml;pnv Deutschland", 
                "http://tile.xn--pnvkarte-m4a.de/tilegen/${z}/${x}/${y}.png"));

    var lonLat = new OpenLayers.LonLat(lon, lat).transform(new OpenLayers.Projection("EPSG:4326"), 
            new OpenLayers.Projection("EPSG:900913"));

    // Blank Baselayer
    var base = new OpenLayers.Layer("Blank",{isBaseLayer: true});
    map.addLayer(base);
    //some Google Baselayers
    //		map.addLayer(new OpenLayers.Layer.Google("Google", {"sphericalMercator": true})); 
    /*	
        map.addLayer(new OpenLayers.Layer.Google(
        "Google Physical",
        {type: G_PHYSICAL_MAP}
        ));
        var gmap = new OpenLayers.Layer.Google(
        "Google Streets", // the default
        {numZoomLevels: 20}
        );
        var ghyb = new OpenLayers.Layer.Google(
        "Google Hybrid",
        {type: G_HYBRID_MAP, numZoomLevels: 20}
        );
        var gsat = new OpenLayers.Layer.Google(
        "Google Satellite",
        {type: G_SATELLITE_MAP, numZoomLevels: 22}
        );
        */
    /*
       var wmsLayer = new OpenLayers.Layer.WMS(
       "OpenLayers WMS", 
       "http://vmap0.tiles.osgeo.org/wms/vmap0",
       {layers: 'basic'}
       ); 
       map.addLayer(wmslayer);
       */


    styleProps = new OpenLayers.Style({
        pointRadius: 2,
               fillColor: "#ffcc66",
               fillOpacity: 0.8,
               strokeColor: "#cc6633",
               strokeWidth: 2,
               strokeOpacity: 0.8
    });

    styleBorder = new OpenLayers.Style({
        fillColor: "#ffcc66",
                fillOpacity: 0.5,
                strokeColor: "#ff9933"
    });

    styleArea = new OpenLayers.Style({
        fillColor: "#66ccff",
              fillOpacity: 0.5,
              strokeColor: "#3399ff"
    });

    var layersIdx = 0;
    while (layersIdx < adminLevels.length) {
        var style = displayMap[map.getZoom()]['styles'][layersIdx];

        layers[layersIdx] = new Array(2);
        var complexity;
        for (complexity = 0; complexity < 2; complexity++) {
            var layername = "layer" + adminLevels[layersIdx] //or aname from config
                + (complexity == 0 ? 's' : 'c');
            //			var featureUrl = baseUrl + '/'
            //			          + (complexity == 0 ? 'simple' : 'full')
            //                                  + '.json';

            var featureUrl = baseUrl + '/' + adminLevels[layersIdx] + '/'
                + (complexity == 0 ? 'simple' : 'full')
                + '.json';

            layers[layersIdx][complexity] 
                = new OpenLayers.Layer.Vector(layername, {
                    displayInLayerSwitcher: false, 
                    strategies: [new OpenLayers.Strategy.BBOX()],
                    protocol: new OpenLayers.Protocol.HTTP({
                        url: featureUrl,
                    params: {
                        admin_level: adminLevels[layersIdx]
                    },
                    format: new OpenLayers.Format.GeoJSON({
                        ignoreExtraDims: true
                    })
                    }),
                    projection: new OpenLayers.Projection("EPSG:4326"),
                    styleMap: new OpenLayers.StyleMap({'default':(style < 2 ? styleBorder : styleArea)})
                });
            //console.log(layers[layersIdx][complexity] != null);
            map.addLayer(layers[layersIdx][complexity]);
        }
        layersIdx++;
    }



    //		map.addLayer(new OpenLayers.Layer.Text("Incidents", {location: "incidents.txt"} ));

    //map.setCenter(new OpenLayers.LonLat(0, 0), 0);
    // map.setCenter (lonLat, 0);

    center = addSingleProposalLayer(proposalId);
    //map.setCenter (center, 9);
}


var moveTo = function(bounds, zoomChanged, dragging) {
    var zoom = map.getZoom();
    //console.log('zoom: ' + zoom)
    //console.log('zoomChanged: ' + zoomChanged)

    if (zoomChanged != null) {
        //use jquery for this
        var list = document.getElementById('zoom'); 
        if (list.hasChildNodes() == true) {
            var litext2 = list.firstChild;
            litext2.data = 'zoom: ' + zoomChanged; 
        } else {
            var litext = document.createTextNode('zoom: ' + zoomChanged);	
            list.appendChild(litext);
        }
        var i=0;
        while (i<adminLevels.length) {
            var styleChanged = displayMap[zoomChanged]['styles'][i];
            var style = displayMap[zoom]['styles'][i];
            //console.log('style: ' + style);
            //console.log('styleChanged: ' + styleChanged);
            if (styleChanged == 0) {
                //     console.log('not visible');
                layers[i][0].setVisibility(false);
                layers[i][1].setVisibility(false);
            } else {
                if (zoomChanged < 8) {
                    layers[i][0].setVisibility(true);
                    layers[i][1].setVisibility(false);
                } else {
                    layers[i][0].setVisibility(false);
                    layers[i][1].setVisibility(true);
                }
                if (style != styleChanged) {
                    if (styleChanged < 2) {
                        //  console.log('border');
                        layers[i][0].styleMap['default'] = styleBorder//;
                        //	  layers[i][0].removeAllFeatures();
                        //layers[i][0].refresh();	layers[i][0].redraw();
                        layers[i][1].styleMap['default'] = styleBorder;	
                        //	  layers[i][1].removeAllFeatures();
                        //layers[i][1].refresh(); layers[i][1].redraw();

                        redrawFeatures(layers[i][0],{fillColor: "#ffcc66",
                            fillOpacity: 0.5,
                            strokeColor: "#ff9933"});
                        redrawFeatures(layers[i][1],{fillColor: "#ffcc66",
                            fillOpacity: 0.5,
                            strokeColor: "#ff9933"});
                        //redrawFeatures(layers[i][0],{fillColor:"yellow"});
                        //redrawFeatures(layers[i][1],{fillColor:"yellow"});

                    } else {
                        //	  console.log('area');
                        layers[i][0].styleMap['default'] = styleArea;	
                        //	  layers[i][0].removeAllFeatures();
                        //layers[i][0].refresh();	layers[i][0].redraw();

                        layers[i][1].styleMap['default'] = styleArea;	
                        //	  layers[i][1].removeAllFeatures();
                        //layers[i][1].refresh();	layers[i][1].redraw();


                        redrawFeatures(layers[i][0],{fillColor: "#66ccff",
                            fillOpacity: 0.5,
                            strokeColor: "#3399ff"});
                        redrawFeatures(layers[i][1],{fillColor: "#66ccff",
                            fillOpacity: 0.5,
                            strokeColor: "#3399ff"});
                        //redrawFeatures(layers[i][0],{fillColor:'purple'});
                        //redrawFeatures(layers[i][1],{fillColor:'purple'});
                    }
                }

            }
            i++;
        }
    }

    OpenLayers.Map.prototype.moveTo.apply(this, arguments);
}

function redrawFeatures(thelayer,thestyle) {
    var i=0;

    //console.log('#features: ' + thelayer.features.length);
    for (i=0; i<thelayer.features.length;i++) {
        //console.log('draw feature ' + i
        //             + ' style: ' + thestyle.fillColor);
        if (false) {
            //thelayer.events.triggerEvent("afterfeaturemodified", {feature: thelayer.features[i]});
            thelayer.drawFeature(thelayer.features[i],thestyle);
        } else {
            var oldfeature = thelayer.features[i];
            var feature = oldfeature.clone();
            feature.style = thestyle;
            oldfeature.state = OpenLayers.State.DELETE;
            thelayer.removeFeatures([oldfeature]);
            thelayer.addFeatures([feature],{style: thestyle});
        }
    } 
}

function onPopupClose(feature) {
    console.log('unselect');    
    //$('counter').innerHTML = this.selectedFeatures.length;
    this.map.removePopup(popup);
    //feature.popup.destroy();
    //feature.popup = null;
}

//jQuery(window).load(loadMap(true));
