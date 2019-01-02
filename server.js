// Dependencies 
var express = require("express");
var exphbs = require('express-handlebars');
var logger = require("morgan");
var mongoose = require("mongoose");

// Scraping Tools
var axios = require("axios");
var cheerio = require("cheerio");

// Require models
var db = require("./models");

var PORT = process.env.PORT || 3000;

// Initialize Express
var app = express();

// Middleware
app.use(logger("dev"));

// Parse as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static("public"));

app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

// Connect to Mongo DB
mongoose.connect("mongodb://localhost/onionscrape", { useNewUrlParser: true });

/*var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

mongoose.connect(MONGODB_URI); */

// Routes
var routes = require("/routes");

app.use(routes);

// Scrape the Onion's website 
app.get("/scrape", function(req, res) {
    axios.get("https://www.theonion.com/").then(function(response) {
        var $ = cheerio.load(response.data);

        $("js_curation-click").each(function(i, element) {

            var news= {};

            news.headline = $(this)
                .children("a")
                .text();
            news.summary = $(this)
                .children("p")
                .attr();

            news.url = $(this)
                .children("a")
                .attr("href");

            db.Article.create(news)
                .then(function(dbNews) {
                    console.log(db.Article);
                })
                .catch(function(err) {
                    return res.json(err);
                });
        });
    res.send("Scrape Complete");
    });
});

// While developing, log scraped information to console
console.log(news);

//Start server
app.listen(PORT, function() {
    console.log("App running on port" + PORT + ".");
});

