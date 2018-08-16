var map;
var markers = [];
var polygon = null;
var placeMarkers = [];

function initMap() {

    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 25.594095,
            lng: 85.137566
        },
        zoom: 13
        // mapTypeControl: false
    });
}

var ViewModel = function() {
    var self = this;
    this.filter = ko.observable('');

    this.filteredList = ko.computed(function () {
        var result = [];
        locations.forEach(function (location) {
            if(self.filter() === null){
                result.push(location)
            }
            else if(location.title.toLowerCase().startsWith(self.filter().toLowerCase())){
                result.push(location)
            }
        });
        return result;
    })
};

ko.applyBindings(new ViewModel());