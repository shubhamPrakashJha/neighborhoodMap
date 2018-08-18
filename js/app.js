var map;
var markers = [];


function initMap() {

    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 25.594095,
            lng: 85.137566
        },
        zoom: 13,
        styles: styles
        // mapTypeControl: false
    });

    var bounds = new google.maps.LatLngBounds();
    var largeInfoWindow = new google.maps.InfoWindow();

    locations.forEach(function (place) {
        place.marker = new google.maps.Marker({
            title: place.title,
            map: map,
            animation: google.maps.Animation.DROP,
            position: place.location
        });

        markers.push({
            title: place.title,
            marker: place.marker
        });

        place.marker.addListener('click',function () {
            place.marker.setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(function () {
                place.marker.setAnimation(null);
            }, 1400);
            populateInfoWindow(this, largeInfoWindow)
        });

        bounds.extend(place.marker.position);
        map.fitBounds(bounds);
    });

    ko.applyBindings(new ViewModel());
}

function populateInfoWindow(marker, infowindow) {
    if (infowindow.marker !== marker) {
        infowindow.marker = marker;
        infowindow.setContent('');
        infowindow.addListener('click', function () {
            infowindow.setMarker(null);
        });
        var streetViewService = new google.maps.StreetViewService();
        var radius = 50;

        var wikiRequestTimeout = setTimeout(function () {
            infowindow.setContent('failed to load wikipedia resource');
        }, 8000);

        var wikiUrl = "https://en.wikipedia.org/w/api.php?action=opensearch&format=json&search="+marker.title;
        $.ajax({
            url: wikiUrl,
            dataType: 'jsonp',
            success: function(response) {
                console.log(response);
                var articleName = response[0];
                var articleBrief = response[2][0];
                var articleLink = response[3][0];
                infowindow.setContent('<h6>'+articleName+'</h6>'+'<p>'+articleBrief+'</p>' +
                    '<a href="'+ articleLink +'">'+'See more on en.wikipedia.org'+'</a><br><br>'+
                    '<div id="pano">');
                clearTimeout(wikiRequestTimeout);
                streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
            }
        });

        function getStreetView(data, status) {
            if (status === google.maps.StreetViewStatus.OK) {
                var nearStreetViewLocation = data.location.latLng;
                var heading = google.maps.geometry.spherical.computeHeading(
                    nearStreetViewLocation, marker.position);
                // infowindow.setContent('<div>' + marker.title + '</div><div id="pano"></div>');
                var panoramaOptions = {
                    position: nearStreetViewLocation,
                    pov: {
                        heading: heading,
                        pitch: 30
                    }
                };
                var panorama = new google.maps.StreetViewPanorama(
                    document.getElementById('pano'), panoramaOptions);
            } else {
                $('#pano').text('Street View Image Not Available')
            }
        }
        infowindow.open(map, marker);
    }
}

var ViewModel = function() {
    var self = this;
    this.filter = ko.observable('');

    this.animateMarker = function (location) {
        google.maps.event.trigger(location.marker, 'click');
    };

    this.filteredList = ko.computed(function () {
        var filter = self.filter().toLowerCase();
        if (filter === null) {
            locations.forEach(function (place) {
                place.marker.setVisible(true);
            });
            return locations;
        }
        else {
            var result = [];
            locations.forEach(function (place) {
                if(place.title.toLowerCase().startsWith(self.filter().toLowerCase())){
                    place.marker.setVisible(true);
                    result.push(place);
                }else {
                    place.marker.setVisible(false);
                }
            });
            return result;
        }
    });
};