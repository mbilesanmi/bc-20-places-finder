// This example requires the Places library. Include the libraries=places
// parameter when you first load the API. For example:
// <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places">


// Note: This example requires that you consent to location sharing when
// prompted by your browser. If you see the error "The Geolocation service
// failed.", it means you probably did not give permission for the browser to
// locate you.

//  declare all global variables
var myLocation;
var map;
var byDistance;
var byInterest;
var byTextInput;
var infoWindow;
var markers = [];
var favorite = [];
var myStorage = localStorage;

/*  
*   On loading the page, run the initMap function.
*   This function will initialize the Google Maps
*/
window.onload = function() {
  //  Call the Map initialization and add to favorite functions
  initMap();
  addToFavPlacesList();
  checkClearFav()

  //  message to display if no query has been run
  document.getElementById('closeby').innerHTML = 'No location has been selected.';
  
  //  message to display indicating number of favorite places
  document.getElementById('info').innerHTML = 'There are '
                + myStorage.length + ' items in your favorite list.';
  
  //  Prevent default search form submission action
  document.getElementById('searchBtn').addEventListener('click', function(event){
    event.preventDefault()
  });
}

function initMap() {
  //  Try HTML5 geolocation.
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      
      //  set current user location
      myLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      //  initialize the map
      map = new google.maps.Map(document.getElementById('map'), {
        center: myLocation,
        zoom: 11,
        mapTypeId:google.maps.MapTypeId.ROADMAP
      });

      //  initialize the info window
      infoWindow = new google.maps.InfoWindow({map: map});
      infoWindow.setPosition(myLocation);
      infoWindow.setContent('Location found.');
      map.setCenter(myLocation);

      // THIS LINE IS CURRENTLY FOR DEBUGGING ERRORS WITH REGARD TO RETURNING THE CURRENT USER LOCATION
      // WILL BE FULLY EDITTED TO RESPOND AS IT SHOULD.
      if (position.vicinity === undefined) {
        var address = 'Address unknown';
      } else {
        var address = position.address;
      }

      document.getElementById('curLocation').innerHTML = '<b>Address</b>: ' +  address
          + '<br/><b>Latitude</b>: ' + myLocation.lat
          + ' & <b>Longitude</b>: ' + myLocation.lng;

    }, function() {

      //  display the map if it loaded successfully
      handleLocationError(true, infoWindow, map.getCenter());
    });

  } else {
    //  If browser doesn't support Geolocation, handle the error.
    handleLocationError(false, infoWindow, map.getCenter());
  }
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
  //  function to handle the check if browser supports HTML5 geolocation
  infoWindow.setPosition(pos);
  infoWindow.setContent(browserHasGeolocation ?
          'Error: The Geolocation service failed.' :
          'Error: Your browser doesn\'t support geolocation.');
}

function getTextLocation() {

  //  obtain the text-field user input and set to 'byTextInput'
  byTextInput = document.getElementById('placeToFind').value;

  //  empty the div to display the search result
  document.getElementById('placesList').innerHTML = '';

  //  call the function to obtain the nearby location
  var request = {
    location: myLocation,
    query: byTextInput
  }

  var service = new google.maps.places.PlacesService(map);
  service.textSearch(request, processRequest);
}

function getLocations() {

  //  obtain the select-box user inputs
  byInterest = document.getElementById('placeOfInterest').value;
  byDistance = document.getElementById('distance').value;

  //  empty the div to display the search result
  document.getElementById('placesList').innerHTML = '';

  //  call the function to obtain the nearby location
  if (byInterest !== '') {
    var request = {
      location: myLocation,
      radius: byDistance,
      type: [byInterest]
    }

    var service = new google.maps.places.PlacesService(map);
    service.nearbySearch(request, processRequest);
  } else {
    //  alert('No place of interest was selected.');
  }
}

function processRequest(response, status) {

  //  this function processes the get location requests from both getTextLocation() & getLocation

  var bounds = new google.maps.LatLngBounds();

  if (status === google.maps.places.PlacesServiceStatus.OK) {
    //  THIS LINE IS CURRENTLY FOR DEBUGGING ERRORS WITH REGARD TO RETURNING THE CURRENT USER LOCATION
    //  WILL BE FULLY EDITTED TO RESPOND AS IT SHOULD.
    //  console.table(response[i]);
    clearMarkers();
    
    for (var i = 0; i < response.length; i++) {
      createMarkers(response[i]);
      addFav();
      bounds.extend(response[i].geometry.location);
    }

    map.fitBounds(bounds);
    document.getElementById('closeby').innerHTML = 'Found ' + response.length + ' ' + byInterest + ' locations';
  } else {
    
    //  re-initialize the map to clear all markers and location data.
    initMap();

    //  message to display when location is not found
    document.getElementById('closeby').innerHTML = 'Location not found or out of range';
    //    return;
  }
}

function createMarkers(place) {
  
  //  function to display markers on the map
  var marker = new google.maps.Marker({
      map: map,
      title: place.name,
      position: place.geometry.location
    });

  //  add marker to the Markers array
  markers.push(marker);

  infowindow = new google.maps.InfoWindow();

  google.maps.event.addListener(marker, 'click', function() {
    infowindow.setContent('<div><strong>' + place.name + '</strong><br>' +
      place.vicinity + '</div>');
    infowindow.open(map, this);
  });

  //  Concatenate the placeName and placeId to pass into the checkFav function.
  //  var checkboxValue = place.name + 'andPlaceIdValue' + place.place_id;
  checkFav(place.name, place.place_id);
}

function clearMarkers() {
  //  function to clear markers when the map is reloaded
  if (markers) {
    for(i in markers) {
      markers[i].setMap(null);
    }
    markers = [];
  }
}

function addFav() {
  var checkBoxList = document.querySelectorAll('input[type=checkbox][name=searchRes]');
  for (var item of checkBoxList) {
    item.addEventListener('change', function(){

      //  check if the user has ticked any checkbox
      if (this.checked) {

        //  Insert place info into local storage
        insertFav(this.value, this.className);
      } else {
        removeFav(this.value, this.className);
      }
    });
  }
}

function checkClearFav() {
  var checkBoxList = document.querySelectorAll('input[type=checkbox][name=favRes]');
  for (var item of checkBoxList) {
    item.addEventListener('change', function(){

      //  check if the user has ticked any checkbox
      if (!this.checked) {
        removeFav(this.value, this.className);
      }
    });
  }
}

function insertFav(placeId, placeName) {
  if (typeof(Storage) !== 'undefined') {
          
    //  Add Key/Value Pair into myStorage.
    myStorage.setItem(placeId, placeName);
    console.log('Successfully added to favorite');

    /* 
    *   Call the function to display the newly added favorite place
    *   in the favPlace div on the front end
    */
    addToFavPlacesList();

    //  Display the number of favorite places the user has.
    document.getElementById('info').innerHTML = 'There are '
          + myStorage.length + ' items in your favorite list.';
  } else {
    /*
    *   Sorry! No Web Storage support..
    *   Write an error message here
    */
  }
}
function removeFav(placeId, placeName) {
  //  Remove item from the front-end Favorite list
  var row = document.getElementById(placeId);
  var table = row.parentNode;
  while ( table && table.tagName != 'TBODY' )
      table = table.parentNode;
  if ( !table )
      return;
  table.deleteRow(row.rowIndex);

  //  Remove item from myStorage
  myStorage.removeItem(placeId);
  console.log(placeName + ' has been removed from the myStorage');

  //  After deleting favPlace, display the number of favorite places the user has.
  document.getElementById('info').innerHTML = 'There are '
          + myStorage.length + ' items in your favorite list.';
}

function checkFav(placeName, placeId) {
  /*
  *   The checkFav function checks if the location has been marked as favorite
  *   If the location is marked favorite, the checkbox is checked
  */
  if (myStorage[placeId]) {
    document.getElementById('placesList').innerHTML += '<li>' + placeName +
        ' Unmark as Favourite: <input type="checkbox" name="searchRes" id="' + placeId +
        '" value="' + placeId + '" class="' + placeName + '" checked/></li><br/>';
  } else {
    document.getElementById('placesList').innerHTML += '<li>' + placeName + 
        ' Mark as Favourite: <input type="checkbox" name="searchRes" id="' + placeId +
        '" value="' + placeId + '" class="' + placeName + '"/></li><br/>';
  }
}

function addToFavPlacesList() {

  //  Display the favorite place in the favPlace div on the front end
  document.getElementById('favPlacesList').innerHTML = '';
  if (myStorage.length > 0) {
    for (var i = 0; i <= myStorage.length; i++) {

      //  If the placeId exists in the localStorage, then add it to the display
      if (myStorage.key(i) !== null) {
        
        var favKey = myStorage.key(i);
        var favValue = myStorage.getItem(myStorage.key(i));
        document.getElementById('favPlacesList').innerHTML += '<tr class="' + myStorage.key(i) +'"><td id="'
            + myStorage.key(i) + '">' + myStorage.getItem(myStorage.key(i)) + '</td><td>'
            +'<input type="checkbox" id="' + myStorage.key(i) + '" value="' + myStorage.key(i)
            + '" name="favRes" class="' + myStorage.getItem(myStorage.key(i)) + '" checked/>' + '</tr>';
      }
    };
  } else {

    //  If there is no placeId in the localStorage, then display this.
    document.getElementById('favPlacesList').innerHTML = 'You do not currently have any Favorite locations';
  }
}