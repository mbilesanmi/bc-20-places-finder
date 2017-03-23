// This example requires the Places library. Include the libraries=places
// parameter when you first load the API. For example:
// <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places">


// Note: This example requires that you consent to location sharing when
// prompted by your browser. If you see the error "The Geolocation service
// failed.", it means you probably did not give permission for the browser to
// locate you.


var myLocation;
var map;
var byDistance;
var byInterest;
var byTextInput;
var infoWindow;
var markers = [];
var favorite = [];

//  var markers = new Array();

/*  
*   On loading the page, run the initMap function.
*   This function will initialize the Google Maps
*/
window.onload = function() {
  //  Call the Map initialization function
  initMap();
  
  //  Prevent default form submission action
  document.getElementById("searchBtn").addEventListener("click", function(event){
    event.preventDefault()
  });
}

function initMap() {

  // Try HTML5 geolocation.
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      myLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      map = new google.maps.Map(document.getElementById('map'), {
        center: myLocation,
        zoom: 11,
        mapTypeId:google.maps.MapTypeId.ROADMAP
      });

      infoWindow = new google.maps.InfoWindow({map: map});

      infoWindow.setPosition(myLocation);
      infoWindow.setContent('Location found.');
      map.setCenter(myLocation);

      // THIS LINE IS CURRENTLY FOR DEBUGGING ERRORS WITH REGARD TO RETURNING THE CURRENT USER LOCATION
      // WILL BE FULLY EDITTED TO RESPOND AS IT SHOULD.
      document.getElementById("demo").innerHTML = "You are currently at Latitude: "
            + myLocation.lat + " & Longitude: " + myLocation.lng;
    }, function() {
      
      //            CRITICAL CODE DEBUG NEEDED HERE
      //            DEBUG THIS CODE ERROR
      //  Uncaught TypeError: Cannot read property 'getCenter' of undefined
      handleLocationError(true, infoWindow, map.getCenter());
    });
  } else {
    // If browser doesn't support Geolocation, handle the error.
    handleLocationError(false, infoWindow, map.getCenter());
  }
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(browserHasGeolocation ?
                        'Error: The Geolocation service failed.' :
                        'Error: Your browser doesn\'t support geolocation.');
}

function getTextLocation() {
  byTextInput = document.getElementById('placeToFind').value;
  //byDistance = document.getElementById('distance').value;

  document.getElementById('placesList').innerHTML = '';

  var request = {
    location: myLocation,
    query: byTextInput
  }

  var service = new google.maps.places.PlacesService(map);
  service.textSearch(request, processRequest);
}

function getLocations() {
  byInterest = document.getElementById('placeOfInterest').value;
  byDistance = document.getElementById('distance').value;

  document.getElementById('placesList').innerHTML = '';

  if (byInterest !== "") {
    findLocation();
    //alert('Place of Interest is ' + byInterest);
  } else {
    //alert('No place of interest was selected.');
  }
}

function findLocation() {
  var request = {
    location: myLocation,
    radius: byDistance,
    type: [byInterest]
  }
  var service = new google.maps.places.PlacesService(map);
  service.nearbySearch(request, processRequest);
}

function processRequest(response, status) {
  var bounds = new google.maps.LatLngBounds();
  //var placesList = document.getElementById('placesList');

  if (status === google.maps.places.PlacesServiceStatus.OK) {
    //document.getElementById('closeby').innerHTML = 'Found locations';

    //  THIS LINE IS CURRENTLY FOR DEBUGGING ERRORS WITH REGARD TO RETURNING THE CURRENT USER LOCATION
    //  WILL BE FULLY EDITTED TO RESPOND AS IT SHOULD.
    //console.table(response[i]);
    clearMarkers();
    for (var i = 0; i < response.length; i++) {
      createMarkers(response[i]);
      addFav(response[i]);
      bounds.extend(response[i].geometry.location);

      //console.log(response[i]);
    }
    map.fitBounds(bounds);
    document.getElementById("closeby").innerHTML = 'Found ' + response.length + ' ' + byInterest + ' locations';
  } else {
    initMap();
    document.getElementById("closeby").innerHTML = 'Location not found or out of range';
    return;
  }
}

function createMarkers(place) {
  var marker = new google.maps.Marker({
      map: map,
      title: place.name,
      position: place.geometry.location
    });

  markers.push(marker);

  infoWindow = new google.maps.InfoWindow({
    content: '<img src="' + place.icon + '"/><font style="color:gray">' +
    place.name + '<br />Vicinity: ' + place.vicinity + '</font>'
  });

  var checkboxValue = place.name + 'andPlaceIdValue' + place.place_id;
  checkFav(checkboxValue);

  google.maps.event.addListener(marker, 'click', function(){
    infoWindow.open(map, this);
  });
}

function clearMarkers() {
  if (markers) {
    for(i in markers) {
      markers[i].setMap(null);
    }
    markers = [];
  }
}

function addFav(place) {
  var checkBoxList = document.querySelectorAll('input[type=checkbox]');
  for (var item of checkBoxList) {
    item.addEventListener('change', function(){
      var splitName = this.value.split("andPlaceIdValue");
      var favKey = splitName[1];
      var favValue = splitName[0];
      if (this.checked) {
        console.log("Favkey " + favKey);
        console.log("splitname " + splitName);
        console.log("FavValue " + favValue);
        favorite.push(this.value);

        //  Implement local storage
        if (typeof(Storage) !== "undefined") {
          // Code for localStorage.
          localStorage.setItem(favKey, favValue);
          var myStorage = localStorage.getItem(favKey);
          console.log("Value is " + myStorage);
          //console.log(localStorage.favValue);
        } else {
          // Sorry! No Web Storage support..
          console.log("This is undefined.");
        }

        // if (myStorage.favKey) {
        //   myStorage.favKey = Number(myStorage.favKey) + 1;
        //   // Retrieve
        //   document.getElementById("result").innerHTML = "There are "
        //         + myStorage.favKey + " items in your favorite list.";
        // } else {
        //   myStorage.favKey = 1;
        // }

        document.getElementById('favPlacesList').innerHTML += '<li id="' + favValue + '">' + favValue + '</li>';

        console.log(favValue + " has been added to favorite");
      } else {
        var parent = document.getElementById('favPlacesList');
        var child = document.getElementById(favValue);
        parent.removeChild(child);

        favorite.pop(this.value);
        console.log(favValue + " has been removed from favorite");
      }
    });
  }
}

function checkFav(place) {
  var splitName = place.split("andPlaceIdValue");
  var placeName = splitName[0];
  var placeId = splitName[1];

  var fav = favorite.indexOf(place);

  if (fav === -1) {
    console.log('not ' + place);
    document.getElementById('placesList').innerHTML += '<li>' + placeName +
        ' Mark as Favourite: <input type="checkbox" id="favorite' + placeId +
        '" value="' + place + '"/></li><br/>';
  } else {
    console.log(place);
    document.getElementById('placesList').innerHTML += '<li>' + placeName + 
        ' Mark as Favourite: <input type="checkbox" id="favorite' + placeId +
        '" value="' + place + '" checked/></li><br/>';
  }
}
