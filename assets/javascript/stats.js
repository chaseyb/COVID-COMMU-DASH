/* BEGIN NEWS, TESTING & STATS CARDS */

// Global var used in ajax calls and Select State Dropdown
let userState = "";

/* NovelCOV-19 API Calls */
// Global Stats
var settings = {
    "url": "https://disease.sh/v2/all",
    "method": "GET",
    "timeout": 0,
};

$.ajax(settings).done(function (response) {
    // console.log(response);
    // assign values to vars
    let globalActive = response.active;
    let globalRecovered = response.recovered;
    let globalDeaths = response.deaths;
    let globalToday = response.todayCases;
    // for small text timestamp (going to convert from UNIX)
    let globalUpdate = response.updated;
    // first convert moment Obj w/ .unix() method
    globalUpdate = moment.unix(globalUpdate / 1000);
    // extract human readable format
    globalUpdate = globalUpdate.format("dddd, MMM Do");
    // append to Data Cards, with hr above p's
    $("#global-cases").append("<p class='cards-p'>Active:</p><p class='cards-p'>" + globalActive + "</p>")
    $("#global-recovered").append("<p class='cards-p'>Recovered:</p><p class='cards-p'>" + globalRecovered + "</p>")
    $("#global-deaths").append("<p class='cards-p'>Deceased:</p><p class='cards-p'>" + globalDeaths + "</p>")
    $("#global-new").append("<p class='cards-p'>New Today:</p><p class='cards-p'>" + globalToday + "</p>")
    $("#global-time").text("Current as of " + globalUpdate);
});

// NovelCOV-19 Again, this time for State Stats
function stateStatsCall() {
    // plug userState into call
    let stateStatsURL = "https://disease.sh/v2/states/" + userState;
    var settings = {
        "url": stateStatsURL,
        "method": "GET",
        "timeout": 0,
    };

    $.ajax(settings).done(function (response) {
        console.log(response);
        // assign values to vars
        let stateName = response.state;
        let stateActive = response.active;
        let stateDeaths = response.deaths;
        let stateToday = response.todayCases;
        // for small text timestamp, same conversion as above
        let localUpdate = response.updated;
        localUpdate = moment.unix(localUpdate / 1000);
        localUpdate = localUpdate.format("dddd, MMM Do");
        // clear section in case this is not the first stateStatsCall()
        $(".wipe").empty();
        // .empty clears card-title, so refill it
        $("#state-stats").text("Local Statistics")
        // append to Data Cards, with hr above p's
        $("#state-name").append("<p class='cards-p wipe'>State:</p><p class='cards-p wipe'>" + stateName + "</p>")
        $("#state-cases").append("<p class='cards-p wipe'>Active:</p><p class='cards-p wipe'>" + stateActive + "</p>")
        $("#state-deaths").append("<p class='cards-p wipe'>Deceased:</p><p class='cards-p wipe'>" + stateDeaths + "</p>")
        $("#state-new").append("<p class='cards-p wipe'>New Today:</p><p class='cards-p wipe'>" + stateToday + "</p>")
        $("#state-time").text("Current as of " + localUpdate);
    });
}

/* NEWS SECTION */

// ajaxResource() gets userState for NewsAPI and Testing API below
function ajaxState() {
    // first, ipapi.co to get state (region) from user IP address
    $.get('https://ipapi.co/region/', function (data) {
        // need a var to hold value of data, in lower case
        userState = data.toLowerCase();
        console.log(userState);
    });
}

// ajaxNews() fills News Section
function ajaxNews() {
    // developer.nytimes.com Article Search API
    let newsURL = `https://api.nytimes.com/svc/search/v2/articlesearch.json?q=coronavirus&` +
        `api-key=06RnZqeJw8n5FJNG9657OXR22GDoKKwm`;
    $.ajax({
        url: newsURL,
        method: "GET"
    }).then(function (response) {
        console.log(response);

        // array to hold titles
        let newsTitles = [];
        // array to hold urls
        let newsLinks = [];
        // loop through response, grab article titles & urls
        for (i = 0; i < response.response.docs.length; i++) {
            newsTitles[i] = response.response.docs[i].headline.main;
            newsLinks[i] = response.response.docs[i].web_url;
        }
        // Shuffling the two arrays: Fisher-Yates Algorithm
        for (i = newsTitles.length - 1; i > 0; i--) {
            // generate random number from 0 to last index, first pass is 0 to 4,
            // with each pass of loop, decrement highest possible value for j
            // we're going to swap the value in index i for the value at the randomly
            // generated number j, using a pass through var called tempTitles
            let j = Math.floor(Math.random() * i);
            // first the newsTitles[]
            // tempTitles holds value of i
            let tempTitles = newsTitles[i];
            // newsTitles[i] now takes value at random index j
            newsTitles[i] = newsTitles[j];
            // index j now takes tempTitles value, which is original value of i
            newsTitles[j] = tempTitles;
            // repeat these steps for newsLinks[] using same random number
            let tempLinks = newsLinks[i];
            newsLinks[i] = newsLinks[j];
            newsLinks[j] = tempLinks;
        }
        // arrays are now shuffled in the same manner,
        // display in html, set link attributes
        for (i = 0; i < newsTitles.length; i++) {
            $("#news-list").append("<li><a href=" + newsLinks[i] + " target='_blank'>" + newsTitles[i] + "</a></li>");
        }
    });
}

/* TESTING SECTION */

// ajaxTesting() fills Testing Section
function ajaxTesting() {
    // Crowdsourced API for local testing resources. Responses are statewide.
    let localTesting = "https://covid-19-testing.github.io/locations/" + userState + "/complete.json";
    $.ajax({
        url: localTesting,
        method: "GET"
    }).then(function (response) {
        console.log(response);

        // array to hold listing names
        let testingSites = [];
        // array for their phone numbers
        let testingNumbers = [];
        // clear section & state in case this is not the first ajaxTesting() call
        $("#test-list").empty();
        $("#your-state").empty();
        // display state in card-title
        $("#your-state").text(" - " + userState);
        // loop to fill listings from response, display if valid
        for (i = 0; i < response.length; i++) {
            // fill sites & numbers arrays
            testingSites[i] = response[i].name;
            testingNumbers[i] = response[i].phones[0].number;
            // some entries have no phone number, so skip those
            // some states have no information, so display alternate message
            if (response[i].name === "No Locations Yet") {
                $("#test-list").append("<li style='font-weight: 500'>No current" +
                    " information is available. <p>Please visit the CDC website. " +
                    "<a href='https://www.cdc.gov/coronavirus/2019-nCoV/index.html'" +
                    " target='_blank'>www.cdc.gov</a></p></li>");
            }
            // some entries have no phone number, so skip those
            else if (testingNumbers[i] !== "None") {
                // append li's from arrays with some styling
                $("#test-list").append("<li><span style='font-weight: 500'>" + testingSites[i] +
                    ": </span>" + testingNumbers[i] + "</li>");
            }
            else {
                console.log("No Phone Available");
            }
        }
    });
}


// Select State button captures state name
$(".dropdown-item").click(function () {
    // capture value in Global userState
    userState = $(this).attr("value");
    console.log(userState);
    ajaxTesting();
    stateStatsCall();
});

// News Section Show More button listener toggles .hide, 
// creating animation effect (jQuery UI)
$("#more-news").click(function () {
    // add/remove .hide, sliding info in/out of view
    $("#news-list").toggleClass("hide", 800);
    if ($("#news-list").hasClass("hide")) {
        // conditional to change button text based on .hide
        $(this).text("Show Less");
    }
    else {
        $(this).text("Show More");
    }
});

// Show More button listener toggles .hide,
$("#more-tests").click(function () {
    $("#test-list").toggleClass("hide", 800);
    if ($("#test-list").hasClass("hide")) {
        $(this).text("Show Less");
    }
    else {
        $(this).text("Show More");
    }
});