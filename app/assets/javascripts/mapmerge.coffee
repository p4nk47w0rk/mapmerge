MERCATOR_RANGE = 256

bound = (value, opt_min, opt_max) ->
    value = Math.max(value, opt_min) if opt_min != null
    value = Math.min(value, opt_max) if opt_max != null

degreesToRadians = (deg) ->
    deg * (Math.PI / 180)

radiansToDegrees = (rad) ->
    rad / (Math.PI / 180)

MercatorProjection = ->
    this.pixelOrigin_ =
        x: MERCATOR_RANGE / 2
        y: MERCATOR_RANGE / 2

    this.pixelsPerLonDegree_ = MERCATOR_RANGE / 360
    this.pixelsPerLonRadian_ = MERCATOR_RANGE / (2 * Math.PI)

MercatorProjection.prototype.fromLatLngToPoint = (latLng) ->
    me = this

    point = {
        x: 0,
        y: 0
    }
    origin = me.pixelOrigin_
    point.x = origin.x + latLng.lng * me.pixelsPerLonDegree_
    # NOTE(appleton): Truncating to 0.9999 effectively limits latitude to
    # 89.189. This is about a third of a tile past the edge of the world tile.
    siny = bound(Math.sin(degreesToRadians(latLng.lat)), -0.9999, 0.9999)
    point.y = origin.y + 0.5 * Math.log((1 + siny) / (1 - siny)) * -me.pixelsPerLonRadian_


MercatorProjection.prototype.fromPointToLatLng = (point) ->
    me = this
    origin = me.pixelOrigin_
    lng = (point.x - origin.x) / me.pixelsPerLonDegree_
    latRadians = (point.y - origin.y) / -me.pixelsPerLonRadian_
    lat = radiansToDegrees(2 * Math.atan(Math.exp(latRadians)) - Math.PI / 2)
    return {
        lat: lat,
        lng: lng
    }

renderMap = (context, x_counter,y_counter,LatLng, size , zoom ) ->

    imageObj = new Image()

    imageObj.onload = ->

        context.drawImage(imageObj,640*x_counter,620*y_counter)

    imageObj.src = "https:/maps.googleapis.com/maps/api/staticmap?maptype=satellite&center=#{LatLng.lat},#{LatLng.lng}&zoom=#{zoom}&size=#{size}"


GetTileDelta = (center, zoom, mapWidth, mapHeight, delta) ->
    proj = new MercatorProjection()
    scale = Math.pow(2, zoom)
    centerPx = proj.fromLatLngToPoint(center)
    DeltaPx = {
        x: (centerPx.x + ((mapWidth / scale) * delta.x)),
        y: (centerPx.y + ((mapHeight / scale) * delta.y))
    }
    DeltaLatLon = proj.fromPointToLatLng(DeltaPx)



tile_calculations = (tile_size) ->
    tile_sum = tile_size*tile_size - 1
    quadrant_sum = tile_sum / 4
    final_pos = quadrant_sum - (quadrant_sum - ( (tile_size-1)/ 2 ))

map_setup = (canvas, context)->

    final_pos = tile_calculations(tile_size)
    x_pos = final_pos * (-1)
    y_pos = x_pos
    y_positiv = y_pos*-1
    x_positiv = x_pos*-1
    x_counter = 0
    y_counter = 0

    y = y_pos
    while y <= y_positiv
        x_counter = 0
        x = x_pos
        while x <= x_positiv
            renderMap( context, x_counter, y_counter, GetTileDelta({lat: lat,lng: lng}, zoom, 640, 620,x: x,y: y), '640x680', zoom)
            x_counter++
            x++
        y_counter++
        y++

    $map = $('#MapContainer')
    $map.append(canvas).removeClass('hidden')
    $(canvas).css
        height: 'auto'
        width: '100%'

    $map.removeClass('hidden');

$ ->

    canvas = document.createElement('canvas')
    console.log canvas
    canvas.id = "LargeCanvasMap"

    $(canvas).attr
      'width' : (tile_size * 640) ,
      'height' : (tile_size * 640) - 100,
      'id': 'mapvas'

    context = canvas.getContext('2d')

    $('#main_image,#show_large_map').remove();

    map_setup(canvas, context)
