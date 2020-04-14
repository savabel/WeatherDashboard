// Easy access to elements
let searchHistoryList = $('#search-history-list');
let searchCityInput = $("#search-city");
let searchCityButton = $("#search-city-button");
let clearHistoryButton = $("#clear-history");

let setCity = $("#current-city");
let setTemp = $("#current-temp");
let setHumidity = $("#current-humidity");
let setWindSpeed = $("#current-wind-speed");
let setUVindex = $("#uv-index");

let weatherContent = $("#weather-content");

// Get access to the OpenWeather API
let APIkey = "44d516f4fd5b381f85e9ed511a424dba";

// Easy access to data
let cityList = [];

// Find current date and display in title
let setDate = moment().format('L');
$("#current-date").text("(" + setDate + ")");

// Check if search history exists when page loads
initalizeHistory();
showClear();

// Hitting enter while input is focused will trigger value added to search history
$(document).on("submit", function(){
    event.preventDefault();

    // Grab value entered into search bar 
    let searchValue = searchCityInput.val().trim();

    currentConditionsRequest(searchValue)
    searchHistory(searchValue);
    searchCityInput.val(""); 
});

// Clicking the search button will trigger value added to search history
searchCityButton.on("click", function(event){
    event.preventDefault();

    // Grab value entered into search bar 
    let searchValue = searchCityInput.val().trim();

    currentConditionsRequest(searchValue)
    searchHistory(searchValue);    
    searchCityInput.val(""); 
});

// Clear the sidebar of past cities searched
clearHistoryButton.on("click", function(){
    // Empty out the  city list array
    cityList = [];
    // Update city list history in local storage
    listArray();
    
    $(this).addClass("hide");
});

// Clicking on a button in the search history sidebar will populate the dashboard with weather info on that city
searchHistoryList.on("click","li.city-btn", function(event) {

    let value = $(this).data("value");
    currentConditionsRequest(value);
    searchHistory(value); 

});



// Request Open Weather API based on user input
function currentConditionsRequest(searchValue) {
    
    // Formulate URL for AJAX api call
    let queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + searchValue + "&units=imperial&appid=" + APIkey;
    

    // Make AJAX call
    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function(response){
        console.log(response);
        setCity.text(response.name);
        setCity.append("<small class='text-muted' id='current-date'>");
        $("#current-date").text("(" + setDate + ")");
        setCity.append("<img src='https://openweathermap.org/img/w/" + response.weather[0].icon + ".png' alt='" + response.weather[0].main + "' />" )
        setTemp.text(response.main.temp);
        setTemp.append("&deg;F");
        setHumidity.text(response.main.humidity + "%");
        setWindSpeed.text(response.wind.speed + "MPH");

        let lat = response.coord.lat;
        let lon = response.coord.lon;
        

        let UVurl = "https://api.openweathermap.org/data/2.5/uvi?&lat=" + lat + "&lon=" + lon + "&appid=" + APIkey;
        // AJAX Call for UV index
        $.ajax({
            url: UVurl,
            method: "GET"
        }).then(function(response){
   
            setUVindex.text(response.value);
        });

        let countryCode = response.sys.country;
        let forecastURL = "https://api.openweathermap.org/data/2.5/forecast?&units=imperial&appid=" + APIkey + "&lat=" + lat +  "&lon=" + lon;
        
        // AJAX call for 5-day forecast
        $.ajax({
            url: forecastURL,
            method: "GET"
        }).then(function(response){
            console.log(response);
            $('#five-day-forecast').empty();
            for (let i = 1; i < response.list.length; i+=8) {

                let forecastDateString = moment(response.list[i].dt_txt).format("L");
                console.log(forecastDateString);

                let forecastCol = $("<div class='col-12 col-md-6 col-lg forecast-day mb-3'>");
                let forecastCard = $("<div class='card'>");
                let forecastCardBody = $("<div class='card-body'>");
                let forecastDate = $("<h5 class='card-title'>");
                let forecastIcon = $("<img>");
                let forecastTemp = $("<p class='card-text mb-0'>");
                let forecastHumidity = $("<p class='card-text mb-0'>");


                $('#five-day-forecast').append(forecastCol);
                forecastCol.append(forecastCard);
                forecastCard.append(forecastCardBody);

                forecastCardBody.append(forecastDate);
                forecastCardBody.append(forecastIcon);
                forecastCardBody.append(forecastTemp);
                forecastCardBody.append(forecastHumidity);
                
                forecastIcon.attr("src", "https://openweathermap.org/img/w/" + response.list[i].weather[0].icon + ".png");
                forecastIcon.attr("alt", response.list[i].weather[0].main)
                forecastDate.text(forecastDateString);
                forecastTemp.text(response.list[i].main.temp);
                forecastTemp.prepend("Temp: ");
                forecastTemp.append("&deg;F");
                forecastHumidity.text(response.list[i].main.humidity);
                forecastHumidity.prepend("Humidity: ");
                forecastHumidity.append("%");

            }
        });

    });

    

};

// Display and save the search history of cities
function searchHistory(searchValue) {
   
    // If there are characters entered into the search bar
    if (searchValue) {
        // Place value in the array of cities if it is a new entry
        if (cityList.indexOf(searchValue) === -1) {
            cityList.push(searchValue);

            // List all of the cities in user history
            listArray();
            clearHistoryButton.removeClass("hide");
            weatherContent.removeClass("hide");
        } else {
            // Remove the existing value from the array
            let removeIndex = cityList.indexOf(searchValue);
            cityList.splice(removeIndex, 1);

            // Push the value again to the array
            cityList.push(searchValue);

            // list all of the cities in user history so the old entry appears at the top of the search history
            listArray();
            clearHistoryButton.removeClass("hide");
            weatherContent.removeClass("hide");
        }
    }
}

// List the array into the search history sidebar
function listArray() {
    // Empty out the elements in the sidebar
    searchHistoryList.empty();
    // Repopulate the sidebar with each city in the array
    cityList.forEach(function(city){
        let searchHistoryItem = $('<li class="list-group-item city-btn">');
        searchHistoryItem.attr("data-value", city);
        searchHistoryItem.text(city);
        searchHistoryList.prepend(searchHistoryItem);
    });
    // Update city list history in local storage
    localStorage.setItem("cities", JSON.stringify(cityList));
    
}

// Display city list string from local storage and update the city list array for the search history sidebar
function initalizeHistory() {
    if (localStorage.getItem("cities")) {
        cityList = JSON.parse(localStorage.getItem("cities"));
        let lastIndex = cityList.length - 1;
         listArray();
        // Display the last city viewed if page is refreshed
        if (cityList.length !== 0) {
            currentConditionsRequest(cityList[lastIndex]);
            weatherContent.removeClass("hide");
        }
    }
}

// Check to see if there are elements in search history sidebar in order to show clear history btn
function showClear() {
    if (searchHistoryList.text() !== "") {
        clearHistoryButton.removeClass("hide");
    }
}

