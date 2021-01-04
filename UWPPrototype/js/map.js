let map, contextMenu, contextMenuPin, pin, position;

let directionsManager;

let spotifyRequestTime = 3240000;

// Transport mode buttons in the journey box on the map
/*var transportTypeCar = document.querySelector('[title="Driving"]');
var transportTypePublic = document.querySelector('[title="Public Transport"]');
var transportTypeWalk = document.querySelector('[title="Walking"]');*/

// Journey info displayed in the bottom section
//var displayTransportType = document.getElementById('display-transport-type');

// Journey time
var displayJourneyDuration = document.getElementById('display-journey-duration');

// Function called via callback from API
function initMap() {
    map = new Microsoft.Maps.Map('#mapatron', {});

    // Set up context menu using InfoBox
    contextMenu = new Microsoft.Maps.Infobox(map.getCenter(), {
        htmlContent:
            '<div class="context-menu-item">' +
            '<input type="button" value="Add destination" onclick="addPosition();"/>' +
            '</div>',
        visible: false
    });
    contextMenu.setMap(map);

    //Add a right click event to the map
    Microsoft.Maps.Events.addHandler(map, 'rightclick', function (e) {
        //Open context menu.
        contextMenu.setOptions({
            location: e.location,
            visible: true
        });

        // Update position (maybe there's a better way of doing this, get it from the
        // context menu? that seemed to be pretty damn annoying though and wouldnt work..)
        position = e.location;

        //Create a pushpin to show where the context menu is pointing from
        contextMenuPin = new Microsoft.Maps.Pushpin(e.location, {color: "#000"});
        map.entities.push(contextMenuPin);
    });

    // Load direction side panel
    loadMapScenario();

    //Close the context menu if the user presses the mouse down anywhere else on the screen.
    document.body.onmousedown = function () {
        closeContextMenu();
    };
}

// Direction side panel
function loadMapScenario() {
    Microsoft.Maps.loadModule('Microsoft.Maps.Directions', function () {
        directionsManager = new Microsoft.Maps.Directions.DirectionsManager(map);

        directionsManager.showInputPanel('directionsInputContainer');

        directionsManager.setRenderOptions({ itineraryContainer: '#directionsItinerary'});

        Microsoft.Maps.Events.addHandler(directionsManager, 'directionsUpdated', directionsUpdated);
    });
}

function directionsUpdated(e) {
    // get current route's index
    let routeIdx = directionsManager.getRequestOptions().routeIndex;
    let route = e.routeSummary[routeIdx];
    // Get the routes time
    let time = Math.round(route.timeWithTraffic / 60);
    if (time === 0) {
        // time 0 means transportation mode is public transport
        // get the first (fastest) option for public transport
        let timeElementParent = document.getElementsByClassName("drTitle selected")[0];
        let timeString = timeElementParent.getElementsByClassName("drTitleRight")[0].innerHTML;
        // convert time string into minutes, the same format at the time received from timeWithTraffic

        let hours = timeString.match(/([\d.]+) *hr/)[1];
        let minutes = parseInt(timeString.match(/([\d.]+) *min/)[1]);
        // convert hours to minutes
        minutes = minutes + (hours * 60);
        time = minutes;
    }

    // Multiply by 60000 to convert to ms (thats what spotifyRequests.js uses) (x1000 x60)
    spotifyRequestTime = time * 60000;
    
    updateJourneyInfo(time);
}

// TODO
function updateJourneyInfo(t) {
    /*console.log(" "+transportTypeCar);
    console.log(" " + transportTypePublic);
    if (transportTypeCar.getAttribute("aria-selected")) {
       displayTransportType.innerHTML = "Car";
    } else if (transportTypePublic.getAttribute("aria-selected")) {
       displayTransportType.innerHTML = "Public Transport";
    } else if (transportTypeWalk.getAttribute("aria-selected")) {
       displayTransportType.innerHTML = "Walking";
    }*/
    
    // display the time
    var durationString = "";
    var hours = Math.floor(t / 60);
    if (hours > 0) {
        t = t - (60 * hours);
        durationString += hours.toString() + " hours ";
    }
    // t = number of mins
    durationString += t.toString() + " minutes";
 
    displayJourneyDuration.innerHTML = durationString;
}

// Draw the lines on the map
function loadLocationInbox(address) {
    // Add the drop pin to the location box
    directionsManager.addWaypoint(new Microsoft.Maps.Directions.Waypoint({address: address, location: position}));
    // Load the location
    directionsManager.calculateDirections();
}

// Set the journey end point
function addPosition() {
    // Remove the old end pin if the user is placing a new one
    if (pin != null)
        map.entities.remove(pin);

    // Add the end pin
    pin = new Microsoft.Maps.Pushpin(position, {color: "#1DB954"});
    map.entities.push(pin);

    // Use the coordinates to find the address so it displays that in the info box instead
    var reverseGeocodeRequestOptions = {
        location: position,
        callback: function (answer, userData) {
            loadLocationInbox(answer.address.formattedAddress);
        }
    };
    let searchManager = new Microsoft.Maps.Search.SearchManager(map);
    searchManager.reverseGeocode(reverseGeocodeRequestOptions);

    closeContextMenu();

    setTimeout(function () {
        if (pin != null)
            map.entities.remove(pin);
    }, 2000);
}

// Context menu
function closeContextMenu() {
    contextMenu.setOptions({visible: false});

    // Remove the temporary pushpin to show where the context menu is focusing
    if (contextMenuPin != null)
        map.entities.remove(contextMenuPin);
}