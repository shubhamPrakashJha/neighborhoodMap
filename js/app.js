var map;
var markers = [];


function initMap() {

    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 25.594095,
            lng: 85.137566
        },
        zoom: 13
        // mapTypeControl: false
    });

    var bounds = new google.maps.LatLngBounds();

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

        bounds.extend(place.marker.position);
        map.fitBounds(bounds);
    });

    ko.applyBindings(new ViewModel());
}

var ViewModel = function() {
    var self = this;
    this.filter = ko.observable('');

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