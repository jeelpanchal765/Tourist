const API_KEY = "5ae2e3f221c38a28845f05b6e1f400c5ecb87276ab06d8ed45db371d";

let map;
let markers = [];


// SEARCH CITY
async function searchPlace(){

let city = document.getElementById("searchInput").value;

if(city === ""){
alert("Please enter city name");
return;
}

let geo = await fetch(
`https://api.opentripmap.com/0.1/en/places/geoname?name=${city}&apikey=${API_KEY}`
);

let cityData = await geo.json();

let lat = cityData.lat;
let lon = cityData.lon;


// move map
if(!map){
initMap(lat,lon);
}else{
map.setView([lat,lon],10);
}


// load tourist places
addTouristPlaces(lat,lon);

}



// INITIAL MAP
function initMap(lat,lon){

map = L.map('map').setView([lat,lon],5);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
attribution:'© OpenStreetMap'
}).addTo(map);

}



// DETECT USER LOCATION
function getLocation(){

if(navigator.geolocation){

navigator.geolocation.getCurrentPosition(function(position){

let lat = position.coords.latitude;
let lon = position.coords.longitude;

document.getElementById("locationText").innerHTML =
"Latitude: "+lat+"<br>Longitude: "+lon;


// create map first time
if(!map){
initMap(lat,lon);
}
else{
map.setView([lat,lon],8);
}


// user marker
let userMarker = L.marker([lat,lon])
.addTo(map)
.bindPopup("You are here")
.openPopup();

markers.push(userMarker);


// load tourist places
addTouristPlaces(lat,lon);

});

}else{

alert("Geolocation not supported");

}

}



// LOAD TOURIST PLACES FROM API
async function addTouristPlaces(lat,lon){

// remove old markers
markers.forEach(m => map.removeLayer(m));
markers = [];

let res = await fetch(
`https://api.opentripmap.com/0.1/en/places/radius?radius=5000&lon=${lon}&lat=${lat}&apikey=${API_KEY}`
);

let data = await res.json();

data.features.forEach(place=>{

let coord = place.geometry.coordinates;
let name = place.properties.name || "Tourist Place";

let marker = L.marker([coord[1],coord[0]])
.addTo(map)
.bindPopup(name);

markers.push(marker);

});

}



// SHOW PLACE FROM CARD CLICK
function showPlace(lat,lon,name){

if(!map){
initMap(lat,lon);
}
else{
map.setView([lat,lon],10);
}

let marker = L.marker([lat,lon])
.addTo(map)
.bindPopup("<b>"+name+"</b><br>Popular Tourist Place")
.openPopup();

markers.push(marker);

}