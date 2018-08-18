// variable storing google Maps Mao object
var map;
// List of markers stored during map initialization
var markers = [];

//handle error if map does not load
function mapInitError() {
    window.alert("Error occurred while loading google maps... ");
}

// Initializes google Maps API
function initMap() {

    // create Map having center as 'Patna' and Having custom style
    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 25.594095,
            lng: 85.137566
        },
        zoom: 13,
        styles: styles
        // mapTypeControl: false
    });

    // create boundaries to store all markers inside the display area
    var bounds = new google.maps.LatLngBounds();
    //create info window having width 300
    var largeInfoWindow = new google.maps.InfoWindow({
        maxWidth: 300
    });

    //image of marker icons used to highliht markers when hovering
    var defaultIcon = makeMarkerIcon('red-dot');
    var highlightedIcon = makeMarkerIcon('blue-dot');

    // Create Markers foe Each Location
    locations.forEach(function (place) {
        place.marker = new google.maps.Marker({
            title: place.title,
            map: map,
            animation: google.maps.Animation.DROP,
            position: place.location
        });

        // push each marker to markers array
        markers.push({
            title: place.title,
            marker: place.marker
        });

        // when markers is clicked call funtion to display info window while animating
        place.marker.addListener('click',function () {
            place.marker.setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(function () {
                place.marker.setAnimation(null);
            }, 1400);
            populateInfoWindow(this, largeInfoWindow)
        });

        //  call function to change default icon and highlight marker while hovering
        place.marker.setIcon(defaultIcon);
        place.marker.addListener('mouseover', function () {
            this.setIcon(highlightedIcon);
        });
        place.marker.addListener('mouseout', function () {
            this.setIcon(defaultIcon);
        });

        // Extend bound so that all markers fit inside the boundaries
        bounds.extend(place.marker.position);
        map.fitBounds(bounds);
    });

    // lastly apply Knockout View Model Bindings
    ko.applyBindings(new ViewModel());
}


// function to set up info window when marker is clicked
function populateInfoWindow(marker, infowindow) {
    // map infowindow to clicked marker if not already connected
    if (infowindow.marker !== marker) {
        infowindow.marker = marker;
        // delete previous markers content
        infowindow.setContent('');
        // disconnect info window from marker if user clicks X
        infowindow.addListener('click', function () {
            infowindow.setMarker(null);
        });
        // create StreetViewService object to get use street view image for places
        var streetViewService = new google.maps.StreetViewService();
        //set radius of location of street image from the clicked places
        var radius = 50;

        // if wikipedia content failed to load within 8 sec, display error
        var wikiRequestTimeout = setTimeout(function () {
            infowindow.setContent('failed to load wikipedia resource');
        }, 8000);

        // ajax call to mediawiki API to fetch info from wikipedia and
        // attach it to infowindow of the clicked marker.
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

        // function to fetch street view image from google maps
        function getStreetView(data, status) {
            if (status === google.maps.StreetViewStatus.OK) {
                //nearest location of street view image from the site
                var nearStreetViewLocation = data.location.latLng;
                // compute heading to point the image in the direction of monuments
                var heading = google.maps.geometry.spherical.computeHeading(
                    nearStreetViewLocation, marker.position);
                // settings for  panorama options
                var panoramaOptions = {
                    position: nearStreetViewLocation,
                    pov: {
                        heading: heading,
                        pitch: 30
                    }
                };

                //obtain panorama image and appending it to '#pano' element
                var panorama = new google.maps.StreetViewPanorama(
                    document.getElementById('pano'), panoramaOptions);
            } else {
                // catch error if street view image is not displayed
                $('#pano').text('Street View Image Not Available')
            }
        }

        // now after attaching wiki info and panorama image to infowindow
        // open infowindow in the map near the clicked marker
        infowindow.open(map, marker);
    }
}

// function to change marker icon
function makeMarkerIcon(markerColor) {
    var markerImage = {
        url: "http://maps.google.com/mapfiles/ms/icons/"+markerColor+".png",
        size: new google.maps.Size(71,71),
        origin: new google.maps.Point(0,0),
        anchor: new google.maps.Point(17,34),
        scaledSize: new google.maps.Size(50,50)
    };
    return markerImage;
}

// knockout View Model
var ViewModel = function() {
    // store this in a var to refer to ViewModel Observables
    // when context changed while using with or foreach in the view
    var self = this;
    // stores keyword entered by the user in the input box
    this.filter = ko.observable('');

    // when a place in list is clicked
    //trigger a click event as if its corrosponding marker is clicked
    this.animateMarker = function (location) {
        google.maps.event.trigger(location.marker, 'click');
    };

    // compute the list of markers matching user input in the filter
    // and make them visible
    this.filteredList = ko.computed(function () {
        // convert keyword to lowercase
        var filter = self.filter().toLowerCase();
        //if filter is empty make all the markers visible
        //and return the entire lost of location to html view
        if (filter === null) {
            locations.forEach(function (place) {
                place.marker.setVisible(true);
            });
            return locations;
        }
        // if filter is present filterout location which includes filter keyword
        //    store it in an array and return this new array
        //    containing list of keyword matched location to the html view
        else {
            var result = [];
            locations.forEach(function (place) {
                if(place.title.toLowerCase().includes(self.filter().toLowerCase())){
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