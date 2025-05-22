/*
ADDRESS SERACH FOR THE WEBSITE ROLLOUT FOR 2020
IFRAME IT IS BUILT TO WORK OUT OF THE BOX WITH IE 11
IE CAVEATS - 
NO CLASSLIST WHEN CREATING ELEMENTS
REM DOES NOT WORK - HARD CODED 'PX' IN STYLE AND JS IN KEY PLACES

THE GEOJSON THAT IS SEARCHED IS THE RESULT OF A VIEW UPDATED NIGHTLY IN POSTGRES
THE VIEW IS A SERIES OF SPATIAL AND FIELD JOINS TO FIND VARIOUS CITY SERVICES FOR AN ADDRESS
THIS IS STRAIGHT HTML CSS AND JAVASCRIPT, NO FRAMEWORKS
CHOTA CSS IS USED FOR THE MOBILE FRIENDLY COLUMNS
FLEXSEARCH ES5 IS USED FOR SEARCH

******** POSSIBLE ADDITIONS *****
//TODO ENCODE ALL INFORMATION IN URL SO THAT WHEN USER GOES BACK TO URL THEY SEE THEIR SEARCH RESULTS MAYBE JUST USE ID OF DATA IN URL
//TODO CLICK ON IMAGE AND LOAD IN NOT YET COMPLETED CITY WEBMAP
//TODO CLICK ON PARK AND LOAD IN PARK MAP OR PARK PAGE
//TODO CLICK ON WARD AND GOES TO WARD MAP OR CURRENT WARD REP PAGE
//TODO CREATE MAP STYLE SPECIFICALLY FOR THIS APP THAT HAS PARCELS
//TODO TRASH MAP LINK TO PDF VERSION OF TRASH DAYS (SANITATION SCHEDULE MAP - PDF)

**********************************
*/

//HARD CODED WARD REP NAMES

// var wards = {
//   1:,
//   2:,
//   3:,
//   4:,
//   5:,
//   6: ""
// }

// const FlexSearch = require("flexsearch") for parcel-bundler building

var app = document.getElementById("app");

//CREATE DOM ELEMENTS FOR APP
var input = document.createElement("input");
input.title = "Address Input"
input.type = "text";
input.id = "addressInfoInput"
input.placeholder = "Enter an Address or Parcel Number";
input.style.width = "100%";
input.style.borderRadius = "3px";
input.style.border = "solid 2px #203B50";
input.style.margin = "10px 0";
input.style.fontSize = "16px"
app.appendChild(input)

var results = document.createElement("ul");
results.id = "addressInfoInputResults";
results.style.listStyle = "none";
results.style.margin = "0"
results.style.padding = "0"
app.appendChild(results)

var cardContainer = document.createElement("div");
cardContainer.className = "row";
app.appendChild(cardContainer)

var col1 = document.createElement("div");
col1.className = "col";
cardContainer.appendChild(col1)

var col2 = document.createElement("div");
col2.className = "col";
cardContainer.appendChild(col2)


//--------------------------//

initData("https://311.coz.org/api/v1/feature-server/collections/public.eng_coz_ward_lookup_mview/items.json", function (data) {

  //EVENT LISTENERS ON LIST FOR KEYBOARD NAVIGATION
  handleListKeyboardActions("addressInfoInput", "addressInfoInputResults");

  //MAIN ADDRESS STORE
  var addresses = createPropertiesArray(data);
  console.log(addresses)

  //FLEXSEARCH INDEX
  var index = createIndex(addresses, "id", ["address", "parcel"])

  //SHOW PREVIOUS RESULT IF NAVIGATING BACK TO PAGE FROM ANOTHER PAGE
  if (window.location.hash) {
    console.log(window.location.hash, addresses[window.location.hash.substring(1,100) - 1])
    showResult(addresses[window.location.hash.substring(1,100) - 1])
  }

  //ADD LISTENER FOR HASHCHANGE
  window.onhashchange = function() {
    if (window.location.hash) showResult(addresses[window.location.hash.replace("#", "") - 1])
  }

  //MAIN EVENT LISTENERS
  app.addEventListener("click", function (e) {
    console.log(e.target.id)

    if (e.target.href) {
      e.preventDefault ? e.preventDefault() : (e.returnValue = false);
      window.top.location.href = e.target.href
      return
    }

    if (e.target.id === "addressInfoInput") {
      clear(results)
      clear(col1);
      clear(col2);
      col1.style.display = "none";
    }

    if (e.target.classList.contains("js-btn-results")) {
      var id = e.target.getAttribute("data-id");
      var result = addresses[id - 1];
      showResult(result)
    }
  })

  function showResult(result) {
    if (!result) return
    console.log(result)
    setHash(result.arrayIndex)

    //CLEAR PREVIOUS ELEMENTS
    clear(results);
    clear(col1);
    clear(col2)
    input.value = "";

    //GET LOCATION FOR FUTURE MAP
    col1.style.display = "block";
    
    var location = [Number(result.lng), Number(result.lat)];

    //ADDRESS PARCEL AND MAP
    createEl("Parcel", "<a href='https://muskingumoh-auditor-classic.ddti.net/Data.aspx?ParcelID=" + result.parcel + "' target='_blank'> " + result.parcel + "</a>", col1);
    createEl("Address", result.address, col1);
    createMapImage(location[0], location[1], col1)

    //OTHER INFORMATION
    createEl("Nearest Greenspace", result.closest_park + " (" + result.park_distance_mi.toFixed(2) + " miles)", col2);
    createEl("Nearest Little Free Library", result.closest_little_library + " (" + result.little_library_distance_mi.toFixed(2) + " miles)\n" + "<a href='https://www.google.com/maps/place/" + encodeURI(result.little_library_address) + "' target='_blank'> " + result.little_library_address + "</a>", col2);
    createEl("School District", ((result.school_district === "80-ZANESVILLE CORP ZANESVILLE SD") ? "80 - Zanesville SD" : result.school_district), col2);
    createEl("Trash Day", result.trash_day, col2);
    createEl("Ward", "<a href='https://coz.org/180/City-Council'>Ward " + result.ward + "</a>", col2);
    createEl("Zoning", "<a href='https://codelibrary.amlegal.com/codes/zanesville/latest/zanesville_oh/0-0-0-15382#JD_1125' target='_blank'>Zoned " + result.zoning + "</a>", col2);
    createEl("Special Zoning District", (result.zoning_special_district) ? "<a href='https://codelibrary.amlegal.com/codes/zanesville/latest/zanesville_oh/0-0-0-16147' target='_blank'>" + result.zoning_special_district + "</a>" : "This address is not in a special zoning district.", col2);
  }

  input.addEventListener("input", function () {
    var searchResults = index.search(this.value, {
      limit: 8
    });
    console.log(searchResults);
    if (searchResults.length > 0) {
      clear(results)
      for (var i = 0; i < searchResults.length; i++) {
        results.innerHTML += "<li style='margin:0 2px'><button class='js-btn-results' data-id='" + searchResults[i].arrayIndex + "' data-y='" +
          searchResults[i].lat +
          "' data-x='" +
          searchResults[i].lng + "'>" + searchResults[i].parcel + "<br />" + searchResults[i][
            "address"
          ] + "</button></li>";
      }
    } else {
      if (input.value.length > 0) {
        clear(results)
        results.innerText += "No results found. If you believe this is in error contact Public Service."
      }
    }
  });

  input.addEventListener("click", function() {
    window.location.hash = ""
  })

})

function initData(url, callback) {
  var req = new XMLHttpRequest()
  req.overrideMimeType("application/json")
  req.open('GET', url, true)
  req.onload = function () {
    callback(JSON.parse(req.responseText));
  };
  req.send(null);
}

function createPropertiesArray(geojson) {
  // console.log("Searching on these properties \n", geojson.features[0].properties)

  propertiesArray = [];

  geojson.features.forEach(function (f,i) {
    f.properties.arrayIndex = i + 1
    f.properties.lng = f.geometry.coordinates[0]
    f.properties.lat = f.geometry.coordinates[1]
    propertiesArray.push(f.properties)
  })

  return propertiesArray
}

function createIndex(data, id, fields) {
  console.log('indexing data')

  this.index = new FlexSearch({
    tokenize: "full",
    threshold: 1,
    resolution: 9,
    depth: 4,
    doc: {
      id: id,
      field: fields
    }
  });
  this.index.add(data);
  console.log('indexing data complete')
  
  return this.index
}

function createMapImage(lng, lat, target) {
  var mapUrl = "https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/pin-l+A34E36(" + lng + "," + lat + ")/" + lng + "," + lat + ",17.5,0,0/420x350?access_token=pk.eyJ1IjoiY296Z2lzIiwiYSI6ImNrZGFrYXhjeTB2Y2IycXBteXVteXB2MmMifQ.rA1POQopdnnLBedxK31PLA"
  var mapImg = document.createElement("img");
  mapImg.src = mapUrl;
  mapImg.style.width = "100%";
  mapImg.style.borderRadius = "3px";
  mapImg.style.border = "solid thin lightgray";
  target.appendChild(mapImg)
}

function createEl(title, text, target) {
  var div = document.createElement("div");
  div.style.margin = "5px 0"

  var span = document.createElement("span");
  span.style.fontWeight = "bold"
  span.innerText = title;
  div.appendChild(span)

  var textDiv = document.createElement("div");
  textDiv.innerHTML = text
  div.appendChild(textDiv)

  var hr = document.createElement("hr")
  hr.style.border = "none";
  hr.style.borderBottom = "solid 1px lightgray"
  div.appendChild(hr)

  target.appendChild(div)
}

function clear(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

function handleListKeyboardActions(inputId, resultsId) {
  // targets the input, which triggers the functions populating the list
  var maininput = document.getElementById(
    inputId);
  // targets the <ul>
  var list = document.getElementById(resultsId);
  // console.log(list)

  document.onkeydown = function (e) { // listen to keyboard events
    var first = list.firstChild; // targets the first <li>
    switch (e.keyCode) {
      case 38: // if the UP key is pressed
        if (document.activeElement == (maininput || first)) {
          e.preventDefault();
          break;
        } // stop the script if the focus is on the input or first element
        else {
          e.preventDefault();
          if (document.activeElement.parentNode.previousSibling) {
            document.activeElement.parentNode.previousSibling.firstChild.focus();
          }
        } // select the element before the current, and focus it
        break;
      case 40: // if the DOWN key is pressed
        if (document.activeElement == maininput) {
          e.preventDefault();
          first.firstChild.focus();
        } // if the currently focused element is the main input --> focus the first <li>
        else {
          e.preventDefault();
          if (document.activeElement.parentNode.nextSibling) {
            document.activeElement.parentNode.nextSibling.firstChild.focus();
          }
        } // target the currently focused element -> <a>, go up a node -> <li>, select the next node, go down a node and focus it
        break;
      case 27:
        maininput.value = " ";
        maininput.dispatchEvent(new Event("input"))
        break;
    }
  }
}

function setHash(id) {
  history.replaceState(undefined, undefined, "#" + id)
}