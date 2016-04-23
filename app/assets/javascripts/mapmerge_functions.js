var MERCATOR_RANGE = 256;

function bound(value, opt_min, opt_max) {
    if (opt_min != null) value = Math.max(value, opt_min);
    if (opt_max != null) value = Math.min(value, opt_max);
    return value;
}

function degreesToRadians(deg) {
    return deg * (Math.PI / 180);
}

function radiansToDegrees(rad) {
    return rad / (Math.PI / 180);
}

function MercatorProjection() {
    this.pixelOrigin_ = {
        x: MERCATOR_RANGE / 2,
        y: MERCATOR_RANGE / 2
    };
    this.pixelsPerLonDegree_ = MERCATOR_RANGE / 360;
    this.pixelsPerLonRadian_ = MERCATOR_RANGE / (2 * Math.PI);
}

MercatorProjection.prototype.fromLatLngToPoint = function(latLng) {
    var me = this;

    var point = {
        x: 0,
        y: 0
    };

    var origin = me.pixelOrigin_;
    point.x = origin.x + latLng.lng * me.pixelsPerLonDegree_;
    // NOTE(appleton): Truncating to 0.9999 effectively limits latitude to
    // 89.189. This is about a third of a tile past the edge of the world tile.
    var siny = bound(Math.sin(degreesToRadians(latLng.lat)), -0.9999, 0.9999);
    point.y = origin.y + 0.5 * Math.log((1 + siny) / (1 - siny)) * -me.pixelsPerLonRadian_;
    return point;
}

MercatorProjection.prototype.fromPointToLatLng = function(point) {
    var me = this;
    var origin = me.pixelOrigin_;
    var lng = (point.x - origin.x) / me.pixelsPerLonDegree_;
    var latRadians = (point.y - origin.y) / -me.pixelsPerLonRadian_;
    var lat = radiansToDegrees(2 * Math.atan(Math.exp(latRadians)) - Math.PI / 2);
    return {
        lat: lat,
        lng: lng
    };
};

function renderMap($image, LatLng, size , zoom ) {
    //var img_src =  "http:\/\/maps.google.com\/maps\/api\/staticmap?maptype=satellite&size="+size+"&sensor=false&zoom="+zoom+"&markers=" + LatLng.lat + "%2C" +LatLng.lng ;
    var img_src =  "https:\/\/maps.googleapis.com\/maps\/api\/staticmap?maptype=satellite&center=" + LatLng.lat + "," +LatLng.lng+"&zoom="+zoom+"&size="+size;
    $image.attr("src", img_src );

}

function GetTileDelta(center, zoom, mapWidth, mapHeight, delta) {
    var proj = new MercatorProjection();
    var scale = Math.pow(2, zoom);
    var centerPx = proj.fromLatLngToPoint(center);
    var DeltaPx = {
        x: (centerPx.x + ((mapWidth / scale) * delta.x)),
        y: (centerPx.y + ((mapHeight / scale) * delta.y))
    };
    var DeltaLatLon = proj.fromPointToLatLng(DeltaPx);
    return DeltaLatLon;
}

function map_setup(){
  $('#main_image').remove();
  var x = 0 ;
  for(var y = 0 ; y<= 23 ; y++){

    var $img = $( document.createElement('img') ,{
      id: 'img_'+y
    }).appendTo('#LargeMap');
    $img.attr('class' , 'pull-left');
    $img.attr('data-pos' , " pos-x: " + x + " pos-y: " + y)
      y = y - x  ;
      renderMap($img, GetTileDelta({lat: lat,lng: lng}, zoom, 400, 400, { x: x , y: y }), '400x400' , zoom);
        x = 1 - x;

  }
}
