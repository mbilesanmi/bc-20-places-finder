// This example requires the Places library. Include the libraries=places
// parameter when you first load the API. For example:
// <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places">


// Note: This example requires that you consent to location sharing when
// prompted by your browser. If you see the error "The Geolocation service
// failed.", it means you probably did not give permission for the browser to
// locate you.
var map;

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: -34.397, lng: 150.644},
    zoom: 6
  });

  var infoWindow = new google.maps.InfoWindow({map: map});

  // Try HTML5 geolocation.
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      infoWindow.setPosition(pos);
      infoWindow.setContent('Location found.');
      map.setCenter(pos);

      // THIS LINE IS CURRENTLY FOR DEBUGGING ERRORS WITH REGARD TO RETURNING THE CURRENT USER LOCATION
      // WILL BE FULLY EDITTED TO RESPOND AS IT SHOULD.
      document.getElementById("demo").innerHTML = "Latitude: " + pos.lat + "<br>Longitude: " + pos.lng;
    }, function() {
      handleLocationError(true, infoWindow, map.getCenter());
    });
  } else {
    // Browser doesn't support Geolocation
    handleLocationError(false, infoWindow, map.getCenter());
  }
}

function searchQuery() {
	// document.getElementById('searchBtn').onclick = function() {
	// 	var submitted = true;
	// 	alert(submitted);
	// };

  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: -34.397, lng: 150.644},
    zoom: 6
  });
  var infoWindow = new google.maps.InfoWindow({map: map});

  /*	
  *		If a user inputs a location into the search box, run a Google Places text_search using the specified parameters
  *		Else, if the user selects a category from the dropdown, run a nearbySearch using the categories box value as parameter. 
  *		Try to implement an AUTO-COMPLETE feature.

  *		1. Display current users location on the map
  *		2. onClick('submit'), display the nearby locations as specified by the query string.
  */
  
  // Try HTML5 geolocation.
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      infoWindow.setPosition(pos);
      infoWindow.setContent('Location found.');
      map.setCenter(pos);

      var service = new google.maps.places.PlacesService(map);

      document.getElementById('placesList').innerHTML = '';

      var placeToFind = document.getElementById('placeToFind').value;
			var categoryToFind = document.getElementById('categoryToFind').value;

			if ((placeToFind !== "") && (categoryToFind !== "")) {
				var queryString = placeToFind + ' in ' + categoryToFind;
				service.textSearch({
					location: pos,
					radius: 500,
					query: queryString
				}, processResults);

				alert(placeToFind + " in " + categoryToFind);
			} else if ((placeToFind === "") && (categoryToFind !== "")) {
			  service.nearbySearch({
			    location: pos,
			    radius: 5000,
			    type: [categoryToFind]
			  }, processResults);
				  
				alert(categoryToFind);
			} else if ((placeToFind !== "") && (categoryToFind === "")) {
			  service.textSearch({
			    location: pos,
			    radius: 5000,
			    query: placeToFind
			  }, processResults);				
				alert(placeToFind);
			} else {
				alert('No parameters selected.');
			}

      // THIS LINE IS CURRENTLY FOR DEBUGGING ERRORS WITH REGARD TO RETURNING THE CURRENT USER LOCATION
      // WILL BE FULLY EDITTED TO RESPOND AS IT SHOULD.
      document.getElementById("demo").innerHTML = "Latitude: " + pos.lat + "<br>Longitude: " + pos.lng;

    }, function() {
      handleLocationError(true, infoWindow, map.getCenter());
    });
  } else {
    // Browser doesn't support Geolocation
    handleLocationError(false, infoWindow, map.getCenter());
  }
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(browserHasGeolocation ?
                        'Error: The Geolocation service failed.' :
                        'Error: Your browser doesn\'t support geolocation.');
}

function processResults(results, status, pagination) {
  if (status !== google.maps.places.PlacesServiceStatus.OK) {
    return;
  } else {

  	//	THIS LINE IS CURRENTLY FOR DEBUGGING ERRORS WITH REGARD TO RETURNING THE CURRENT USER LOCATION
    //	WILL BE FULLY EDITTED TO RESPOND AS IT SHOULD.
  	console.table(results);
    createMarkers(results);

    if (pagination.hasNextPage) {
      var moreButton = document.getElementById('more');

      moreButton.disabled = false;

      moreButton.addEventListener('click', function() {
        moreButton.disabled = true;
        pagination.nextPage();
      });
    }
  }
}

function createMarkers(places) {
  var bounds = new google.maps.LatLngBounds();
  var placesList = document.getElementById('placesList');

  for (var i = 0, place; place = places[i]; i++) {
    var image = {
      url: place.icon,
      size: new google.maps.Size(71, 71),
      origin: new google.maps.Point(0, 0),
      anchor: new google.maps.Point(17, 34),
      scaledSize: new google.maps.Size(25, 25)
    };

    var marker = new google.maps.Marker({
      map: map,
      icon: image,
      title: place.name,
      position: place.geometry.location
    });

    placesList.innerHTML += '<li>' + place.name + '</li>';

    bounds.extend(place.geometry.location);
  }
  map.fitBounds(bounds);
}