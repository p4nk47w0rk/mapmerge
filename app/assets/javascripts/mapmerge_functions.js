
var MERCATOR_RANGE = 256;
var $myCanvas;
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

function renderMap($image, x_counter,y_counter,LatLng, size , zoom ) {
    //var img_src =  "http:\/\/maps.google.com\/maps\/api\/staticmap?maptype=satellite&size="+size+"&sensor=false&zoom="+zoom+"&markers=" + LatLng.lat + "%2C" +LatLng.lng ;
    //var img_src =  "https:\/\/maps.googleapis.com\/maps\/api\/staticmap?maptype=satellite&center=" + LatLng.lat + "," +LatLng.lng+"&zoom="+zoom+"&size="+size;
    //$image.attr("src", img_src );


    var canvas = document.getElementById('LargeCanvasMap');
    var context = canvas.getContext('2d');
    var imageObj = new Image();

    imageObj.onload = function() {
      console.log(x_counter  + "  ::  " + y_counter)
        context.drawImage(imageObj,640*x_counter,620*y_counter);
    };
    imageObj.src = "https:\/\/maps.googleapis.com\/maps\/api\/staticmap?maptype=satellite&center=" + LatLng.lat + "," +LatLng.lng+"&zoom="+zoom+"&size="+size;
    //var img = document.getElementById('img_'+ x_counter+'_'+y_counter)

      //console.log(640*x_counter  + "  :  " + 620*y_counter )
      //ctx.drawImage(img,640*x_counter,620*y_counter);



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

function tile_calculations(tile_size){
  var tile_sum = tile_size*tile_size - 1 ;
  var quadrant_sum = tile_sum / 4;
  var final_pos = quadrant_sum - (quadrant_sum - ( (tile_size-1)/ 2 ))
  return final_pos
}

function map_setup(){

  $('#main_image,#show_large_map').remove();


  $('#LargeMap').css({
    'width' : (tile_size * 640) + 100
  })
  $('#LargeCanvasMap').attr({
    'width' : (tile_size * 640) ,
    'height' : (tile_size * 640) - 100
  })




  var final_pos = tile_calculations(tile_size);

  var x_pos = final_pos * (-1);
  var y_pos = x_pos;
  var y_positiv = y_pos*-1;
  var x_positiv = x_pos*-1;
  var x_counter = 0;
  var y_counter = 0;



  for( var y = y_pos ; y <= y_positiv ; y++){
    x_counter = 0 ;
    for( var x = x_pos ; x <= x_positiv ; x++){

      var $img = $( "<img />" );//.appendTo('#LargeMap');

      // $img
      //   .css({
      //     margin: "-20px 0 0 0",
      //   })
      //   .attr('id' , 'img_'+ x_counter+'_'+y_counter)
      // $img.attr('class' , 'pull-left');



      renderMap($img, x_counter,y_counter, GetTileDelta({lat: lat,lng: lng}, zoom, 640, 620, { x: x , y: y }), '640x680' , zoom);
      console.log(x +"::" +  y)
      x_counter++;
    }
    y_counter++;
  }

  $("#LargeCanvasMap").show();
}

$(function () {
    $(document).on('click' , '#show_large_map' , function(){
      map_setup();
    })
});
