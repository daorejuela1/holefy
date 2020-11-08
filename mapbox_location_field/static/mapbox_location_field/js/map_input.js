if (!mapboxgl.supported()) {
    alert('Your browser does not support Mapbox GL');
} else {
    $(document).ready(function () {
        var coordinatesGeocoder = function (query) {
// match anything which looks like a decimal degrees coordinate pair
            var matches = query.match(/^[ ]*(?:Lat: )?(-?\d+\.?\d*)[, ]+(?:Lng: )?(-?\d+\.?\d*)[ ]*$/i);
            if (!matches) {
                return null;
            }

            function coordinateFeature(lng, lat) {
                return {
                    center: [lng, lat],
                    geometry: {
                        type: "Point",
                        coordinates: [lng, lat]
                    },
                    place_name: 'Lat: ' + lat + ' Lng: ' + lng, // eslint-disable-line camelcase
                    place_type: ['coordinate'], // eslint-disable-line camelcase
                    properties: {},
                    type: 'Feature'
                };
            }

            var coord1 = Number(matches[1]);
            var coord2 = Number(matches[2]);
            var geocodes = [];

            if (coord1 < -90 || coord1 > 90) {
// must be lng, lat
                geocodes.push(coordinateFeature(coord1, coord2));
            }

            if (coord2 < -90 || coord2 > 90) {
// must be lat, lng
                geocodes.push(coordinateFeature(coord2, coord1));
            }

            if (geocodes.length === 0) {
// else could be either lng, lat or lat, lng
                geocodes.push(coordinateFeature(coord1, coord2));
                geocodes.push(coordinateFeature(coord2, coord1));
            }

            return geocodes;
        };

        function translate_to_string(obj) {
            var lat = obj.lat;
            var lng = obj.lng;
            return lng + "," + lat
        }

        function translate_to_reversed_string(obj) {
            var lat = obj.lat;
            var lng = obj.lng;
            return lat + "," + lng
        }

        function replace_order(array) {
            return [array[1], array[0]]
        }

        var geocoders = {};
        $(".js-mapbox-input-location-field").each(function () {
            var input = $(this);
            var id = input.attr("id");
            var map = new mapboxgl.Map({
                container: id + '-map-mapbox-location-field',
                style: map_attrs[id].style,
                center: map_attrs[id].center,
                zoom: map_attrs[id].zoom,
            });
            if (input.val()) {
                var marker = new mapboxgl.Marker({draggable: false, color: map_attrs[id].marker_color,});
                marker.setLngLat(map_attrs[id].center)
                    .addTo(map);
                input.val(replace_order(map_attrs[id].center));
            }

            var geocoder = new MapboxGeocoder({
                accessToken: mapboxgl.accessToken,
                mapboxgl: mapboxgl,
                localGeocoder: coordinatesGeocoder,

            });
            geocoders[id] = geocoder;
            map.getCanvas().style.cursor = map_attrs[id].cursor_style;
            if (!map_attrs[id].rotate) {
                map.dragRotate.disable();
                map.touchZoomRotate.disableRotation();
            }
            if (map_attrs[id].track_location_button) {
                map.addControl(new mapboxgl.GeolocateControl({
                    positionOptions: {
                        enableHighAccuracy: true
                    },
                    trackUserLocation: true,
                }));
            }
            if (map_attrs[id].geocoder) {
                map.addControl(geocoder, "top-left");
            }

            if (map_attrs[id].fullscreen_button) {
                map.addControl(new mapboxgl.FullscreenControl());
            }
            if (map_attrs[id].navigation_buttons) {
                map.addControl(new mapboxgl.NavigationControl());
            }
            geocoder.on("result", function (e) {
                $("div.mapboxgl-marker.mapboxgl-marker-anchor-center").not(".mapboxgl-user-location-dot").remove();
                input.val(replace_order(e.result.geometry.coordinates));
                var marker = new mapboxgl.Marker({draggable: false, color: map_attrs[id].marker_color,});
                marker.setLngLat(e.result.geometry.coordinates)
                    .addTo(map);

                $(document).trigger("reverse-geocode", [id, e.result.place_name,])
            });
            var HolesAPI = "http://127.0.0.1:8001/api/v1/holes/";
            $.getJSON( HolesAPI, {
            })
              .done(function( data ) {
                  //console.log(data);
                $.each(data, function( key, val ) {
                  var locpos = val.location.replace(/[()]/g,"").split(", ").map(Number);
                  console.log(val)
                  var Eu = {lng: locpos[0], lat:locpos[1]};
                  var popup = new mapboxgl.Popup({ offset: 25, maxWidth: "80px" }).setHTML(
                    '<a href="http://127.0.0.1:8001/places/'+val.id+'">Alertar</a><p><b>' + 'Hueco' + '</b> ' + val.name + '</p><b>Nacimiento:</b> ' + val.created_at.slice(0, 10) + '<p><b>Reportes:</b> ' + val.users.length + ' </p>'
                    );
                  var marker1 = new mapboxgl.Marker({draggable: false, color: "red"});
                marker1.setLngLat(Eu)
                .setPopup(popup)
                    .addTo(map);
                });
            })
            var onclickmarker = new mapboxgl.Marker({draggable: false, color: map_attrs[id].marker_color,});
            map.on("click", function (e) {
                //$("#" + id + "-map-mapbox-location-field .mapboxgl-marker.mapboxgl-marker-anchor-center").not(".mapboxgl-user-location-dot").remove();
                input.val(translate_to_reversed_string(e.lngLat));

                onclickmarker.setLngLat(e.lngLat)
                    .addTo(map);
                console.log(e.target)
                var url = "https://api.mapbox.com/geocoding/v5/mapbox.places/" + translate_to_string(e.lngLat) + ".json?access_token=" + mapboxgl.accessToken;
                $.get(url, function (data) {
                    try {
                        reverse_name = data.features[0].place_name;
                    }
                    catch
                        (e) {
                        reverse_name = "undefined address";
                    }
                    geocoder.setInput(reverse_name);
                    $(document).trigger("reverse-geocode", [id, reverse_name,]);
                });

            });
        });

        $(".js-mapbox-address-input-location-field").each(function () {
            var addressinput = $(this);
            if (addressinput.val()) {
                geocoders[addressinput.attr("id")].setInput(addressinput.val());
            }
        });
    });
}