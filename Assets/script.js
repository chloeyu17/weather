// variables
// api key from openweather
var apiKey = "f5134fd76606cba7978d5f2d96351255";
var citySearch = $("#city-search");
var historicalData = $("#search-history-list");
var searchBtn = $("#city-search-btn");
var clearButton = $("#clear-data-btn");
var currentWeather = $("#current-weather");
var currentCity = $("#current-city");
var tempCheck = $("#temp");
var humidity = $("#humidity");
var windSpeedCheck = $("#wind");
var weatherIcon = $('#icon')
var uvIndex = $('#uv-index');
var cities = JSON.parse(localStorage.getItem("cities")) || [];

$(document).ready(function () {

    //Checks search history when loading web app
    getHistory();

    //Fetches weather API
    function todaysWeather(city) {
    var weatherLink = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&appid=" + apiKey + "&units=imperial"
    
    //Fetches url from above, reruns if response is bad
    fetch(weatherLink)
        .then(function (response){
            if (!response.ok) {
                throw response.json();
            }
            return response.json();
        })
        //Pulls in location data and sends to the 5 day forecast function. Data functions pulled from oneweather api docs
        .then(function(data){
            weekForecast(data.coord.lat, data.coord.lon);
            currentCity.text(data.name + " ");
            var cityTemp = Math.round(data.main.temp)
            tempCheck.text(cityTemp);
            humidity.text(data.main.humidity + "%");
            windSpeedCheck.text(data.wind.speed + " MPH");
            weatherIcon.attr("src", "http://openweathermap.org/img/wn/" + data.weather[0].icon + ".png");
        })
        cities.push(city);
    };

    //5 day forecast API function. Pulled Lat and lon functions from onecall API
    function weekForecast (lat, lon) {
        var oneCallLink = "https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + lon + "&units=imperial&appid=" + apiKey;
        //Fetch url within function, same as earlier, reruns if response is bad
        fetch(oneCallLink)
            .then(function (response){
                if (!response.ok) {
                    throw response.json();
                }
                return response.json();
            })
            
            .then(function(data){

                uvIndex.text(data.current.uvi)

                //Changes UV badge color based on UV Index number
                if (data.current.uvi <= 4) {
                    uvIndex.addClass('badge badge-success');
                }
                else if (data.current.uvi > 4 && data.current.uvi <= 7) {
                    uvIndex.removeClass('badge badge-success');
                    uvIndex.addClass('badge badge-warning');
                }
                else {
                    uvIndex.removeClass('badge badge-success');
                    uvIndex.removeClass('badge badge-warning');
                    uvIndex.addClass('badge badge-danger');
                }
            
                $('#5day-forecast').empty();
                
                //Creates cards displaying weekly forecast
                for (let i = 1; i <= 5; i++) {
            
                //Adds a date to each card displayed
                var date = new Date(data.daily[i].dt * 1000);
                var formatDate = moment(date).format('L');
                var forecastDateString = formatDate
            
                //Weekly forecast variables, declared within scope
                var weekForecast = $('#5day-forecast');
                var forecastCard1 = $("<div class='col-12 col-md-6 col-lg mb-3'>");
                var forecastCard2 = $("<div class='card text-white forecast-day'>");
                var cardBody = $("<div class='card-body'>");
                var date = $("<h5 class='card-title'>");
                var icon = $("<img>");
                var weatherTemp = $("<p class='card-text mb-0'>");
                var weatherHumidity = $("<p class='card-text mb-0'>");
            
                //adds info to each card from api
                date.text(forecastDateString);
                icon.attr("src", "http://openweathermap.org/img/wn/" + data.daily[i].weather[0].icon + ".png");
                weatherTemp.text("Temp: " + data.daily[i].temp.day + String.fromCharCode(8457));
                weatherHumidity.text("Humidity: " + data.daily[i].humidity + "%");

                //create each card --> Adding Each Cards Content to the DOM
                weekForecast.append(forecastCard1);
                forecastCard1.append(forecastCard2);
                forecastCard2.append(cardBody);
                cardBody.append(date);
                cardBody.append(icon);
                cardBody.append(weatherTemp);
                cardBody.append(weatherHumidity);
            }
       });
    }
        //click search button, grabs value and sends text to currentWeather variable, history variable, then clears search bar
        searchBtn.on('click', renderWeather);

        $('#form-search').submit(renderWeather);

        function renderWeather(event){
            var input = citySearch.val().trim()
            todaysWeather(input);
            getHistory(input);
            citySearch.val("");
            event.preventDefault();
        };

    function cityArray() {
        console.log(cities);
        cities.forEach(function(city){
            var searchHistoryItem = $('<li type="button" class="list-group-item btn btn-warning btn-sm" id="city-btn">');
            searchHistoryItem.attr("data-value", city);
            searchHistoryItem.text(city);
            historicalData.prepend(searchHistoryItem);
            searchHistoryItem.on('click', function () {
                var input = searchHistoryItem.text()
        
                todaysWeather(input);
                getHistory(input);
            });
        });
    }

    function getHistory() {
        cityArray();
        cities = [];
    }

    $("#clear-data-btn").on("click", function () {
        localStorage.clear();
        cities = [];
        $('#city-btn').remove();
    });
});
