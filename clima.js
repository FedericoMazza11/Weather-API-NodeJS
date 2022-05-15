const express = require("express");
const Handlebars = require("handlebars");
const request = require("request");
const path = require("path");
var bodyParser = require("body-parser");
const handlebars = require("express-handlebars");
const app = express();
app.set("views", path.join(__dirname, "views"));
app.engine(
  "hbs",
  handlebars({
    defaultLayout: "main",
    layoutsDir: __dirname + "/views",
    extname: ".hbs",
  })
);
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "hbs");
Handlebars.registerHelper("ifCond", function (v1, v2, options) {
  if (v1 === v2) {
    return options.fn(this);
  }
  return options.inverse(this);
});
app.get("/", (req, res) => {
  let city = req.query.city;
  var request = require("request");
  if (typeof city == "undefined") {
    res.render("inicio");
  } else if (typeof city == "string") {
    request(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=cca0614028b05d187af609a66f5844a9`,
      function (error, response, body) {
        let data = JSON.parse(body);
        if (typeof data.weather == "undefined") {
          res.render("inicioerror");
        } else {
          var ciudad = data["name"];
          app.locals.ciudad = ciudad;
          var url =
            "https://api.openweathermap.org/data/2.5/onecall?lat=" +
            data.coord["lat"] +
            "&lon=" +
            data.coord["lon"] +
            "&appid=cca0614028b05d187af609a66f5844a9";
          request(url, function (err, response, body) {
            var data1 = JSON.parse(body);
            var valuestemp = [];
            var temperaturamaxprom = 0;
            var values = [];
            var valuesViento = [];
            var vientoTiempo = [];
            var lluvia2 = "...";
            var lluvia = false;
            var varClima = [];
            app.locals.varClimaTemperatura = [];
            climaD = [];
            data1.daily.forEach((element) =>
              valuestemp.push(element.temp["max"] - 273.15)
            );
            valuestemp.forEach((element) => (temperaturamaxprom += element));
            app.locals.temperaturamaxprom = (temperaturamaxprom / 8).toFixed(2);
            app.locals.viento = data1.daily;
            data1.daily.forEach((element) =>
              values.push([element.wind_speed, new Date(element.dt * 1000)])
            );
            data1.daily.forEach((element) =>
              valuesViento.push(element.wind_speed)
            );
            var maxViento = 0;
            maxViento = Math.max.apply(Math, valuesViento);
            console.log(maxViento);

            for (var i = 0; i < values.length; i++) {
              if (maxViento == values[i][0]) {
                vientoTiempo.push(values[i]);
              }
              else {

              }
            }
            app.locals.vientoTiempo1 = vientoTiempo[0][1];
            app.locals.vientoTiempo2 = vientoTiempo[0][0];
            for (var i = 0; i < values.length; i++) {
              if (data1.daily[i].weather[0].main == "Rain") {
                lluvia = true;
              } else {
              }
            }
            if (lluvia == true) {
              lluvia2 = "Llovera";
            } else {
              lluvia2 = "No llovera";
            }
            app.locals.lluvia = lluvia2;
            data1.daily.forEach((item, i) => {
              varClima[i] = [
                (data1.daily[i].temp.day - 273.15).toFixed(2),
                (data1.daily[i].temp.min - 273.15).toFixed(2),
                (data1.daily[i].temp.max - 273.15).toFixed(2),
                (data1.daily[i].feels_like.day - 273.15).toFixed(2),
                new Date(data1.daily[i].dt * 1000),
                data1.daily[i].weather[0].main,
                ciudad,
              ];
              if (data1.daily[i].weather[0].main == "Clear") {
                varClima[i][5] = "despejado";
              } else if (data1.daily[i].weather[0].main == "Clouds") {
                varClima[i][5] = "nublado";
              } else if (data1.daily[i].weather[0].main == "Rain") {
                varClima[i][5] = "lloviendo";
              } else {
                varClima[i][5] = "test";
              }
              app.locals.varClimaTemperatura[i] = varClima[i];
            });
            res.render("clima");
          });
        }
      }
    );
  }
});
app.listen(3300, () => console.log("Server started on port 3000"));
