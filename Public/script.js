let map;
let markers = [];
const NEAREST_MAX_DISTANCE_KM = 250;
const popularPlaces = [
  { name: "Taj Mahal", city: "Agra", lat: 27.1751, lon: 78.0421 },
  { name: "Goa Beach", city: "Goa", lat: 15.2993, lon: 74.1240 },
  { name: "Hawa Mahal", city: "Jaipur", lat: 26.9239, lon: 75.8267 },
  { name: "India Gate", city: "Delhi", lat: 28.6129, lon: 77.2295 },
  { name: "Golden Temple", city: "Amritsar", lat: 31.6200, lon: 74.8765 },
  { name: "Kashi Vishwanath Temple", city: "Varanasi", lat: 25.3176, lon: 82.9739 },
  { name: "Gateway of India", city: "Mumbai", lat: 18.9220, lon: 72.8347 },
  { name: "City Palace", city: "Udaipur", lat: 24.5760, lon: 73.6831 },
  { name: "Sabarmati Riverfront", city: "Ahmedabad", lat: 23.0225, lon: 72.5714 },
  { name: "Charminar", city: "Hyderabad", lat: 17.3616, lon: 78.4747 },
  { name: "Mysore Palace", city: "Mysore", lat: 12.3052, lon: 76.6552 },
  { name: "Hampi", city: "Karnataka", lat: 15.3350, lon: 76.4600 },
  { name: "Fort Kochi", city: "Kochi", lat: 9.9312, lon: 76.2673 },
  { name: "Marina Beach", city: "Chennai", lat: 13.0475, lon: 80.2824 },
  { name: "Victoria Memorial", city: "Kolkata", lat: 22.5448, lon: 88.3426 },
  { name: "Lingaraj Temple", city: "Bhubaneswar", lat: 20.2380, lon: 85.8338 },
  { name: "Darjeeling", city: "West Bengal", lat: 27.0360, lon: 88.2627 },
  { name: "Tsomgo Lake", city: "Sikkim", lat: 27.3389, lon: 88.6065 },
  { name: "Shillong Peak", city: "Meghalaya", lat: 25.5788, lon: 91.8933 },
  { name: "MG Marg", city: "Gangtok", lat: 27.3314, lon: 88.6138 },
  { name: "Upper Lake", city: "Bhopal", lat: 23.2599, lon: 77.4126 },
  { name: "Khajuraho Temples", city: "Madhya Pradesh", lat: 24.8318, lon: 79.9199 },
  { name: "Nandan Van", city: "Raipur", lat: 21.2514, lon: 81.6296 }
];


// SEARCH CITY
async function searchPlace(){

let city = document.getElementById("searchInput").value;

if(city === ""){
alert("Please enter city name");
return;
}

let geo = await fetch(
`/api/geoname?name=${encodeURIComponent(city)}`
);

let cityData = await geo.json();
if(!geo.ok){
alert(cityData.error || "Search failed. Please try again.");
return;
}
if(!cityData || cityData.lat === undefined || cityData.lon === undefined){
alert("City not found. Please try another search.");
return;
}

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
showNearestPopularPlaces(lat, lon, city);

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
`/api/places-radius?lat=${lat}&lon=${lon}`
);

let data = await res.json();
if(!res.ok || !Array.isArray(data.features)){
alert(data.error || "Unable to load nearby places right now.");
return;
}

data.features.forEach(place=>{

let coord = place.geometry.coordinates;
let name = place.properties.name || "Tourist Place";

let marker = L.marker([coord[1],coord[0]])
.addTo(map)
.bindPopup(name);

markers.push(marker);

});

}

function toRadians(deg){
return deg * (Math.PI / 180);
}

function calculateDistanceKm(lat1, lon1, lat2, lon2){
const earthRadiusKm = 6371;
const dLat = toRadians(lat2 - lat1);
const dLon = toRadians(lon2 - lon1);
const a =
Math.sin(dLat / 2) * Math.sin(dLat / 2) +
Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
Math.sin(dLon / 2) * Math.sin(dLon / 2);
const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
return earthRadiusKm * c;
}

function showNearestPopularPlaces(lat, lon, searchedCity){
const nearestContainer = document.getElementById("nearestPlaces");
if(!nearestContainer){
return;
}

const nearest = popularPlaces
.map(place => {
return {
...place,
distance: calculateDistanceKm(lat, lon, place.lat, place.lon)
};
})
.filter(place => place.distance <= NEAREST_MAX_DISTANCE_KM)
.sort((a, b) => a.distance - b.distance)
.slice(0, 5);

if(nearest.length === 0){
nearestContainer.innerHTML =
`<h3>Nearest Popular Places for "${searchedCity}"</h3>` +
`<p>No popular places found within ${NEAREST_MAX_DISTANCE_KM} km.</p>`;
return;
}

nearestContainer.innerHTML =
`<h3>Nearest Popular Places for "${searchedCity}"</h3>` +
`<p>Showing places within ${NEAREST_MAX_DISTANCE_KM} km</p>` +
`<ul>${nearest.map(place =>
`<li><strong>${place.name}</strong> - ${place.city} (${place.distance.toFixed(1)} km)</li>`
).join("")}</ul>`;

nearest.forEach(place => {
let marker = L.marker([place.lat, place.lon])
.addTo(map)
.bindPopup(`<b>${place.name}</b><br>${place.city}<br>${place.distance.toFixed(1)} km away`);
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