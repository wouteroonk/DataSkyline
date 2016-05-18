// Define the WeatherVis constructor
function WeatherVis(svg, woied) {
  // Call the parent constructor, making sure (using Function#call)
  // that "this" is set correctly during the call
  VisObject.call(this, svg, woied);
  this.unit = 'c';
    this.icons = {
      "tropical storm": "x",
      "hurricane": "x",
      "severe thunderstorms": "heavythunder",
      "thunderstorms": "thunder",
      "mixed rain and snow": "mixrainsnow",
      "mixed rain and sleet": "mixrainsnow",
      "mixed snow and sleet": "mixrainsnow",
      "freezing drizzle": "snow",
      "drizzle": "shower",
      "freezing rain": "mixrainsnow",
      "showers": "shower",
      "showers": "shower",
      "snow flurries": "snow",
      "light snow showers": "snow",
      "blowing snow": "snow",
      "snow": "snow",
      "hail": "snow",
      "sleet": "snow",
      "dust": "snow",
      "foggy": "cloudfog",
      "haze": "cloudfog",
      "smoky": "cloudfog",
      "blustery": "cloudfog",
      "windy": "arrow",
      "cold": "cold",
      "cloudy": "cold",
      "mostly cloudy (night)": "twincloud",
      "mostly cloudy (day)": "twincloud",
      "partly cloudy (night)": "darkcloud",
      "partly cloudy (day)": "cloud",
      "clear (night)": "moon",
      "sunny": "sun",
      "fair (night)": "moon",
      "fair (day)": "sun",
      "mixed rain and hail": "mixrainsnow",
      "hot": "sun",
      "isolated thunderstorms": "thunder",
      "scattered thunderstorms": "thunder",
      "scattered thunderstorms": "heavythunder",
      "scattered showers": "shower",
      "heavy snow": "snow",
      "scattered snow showers": "snow",
      "heavy snow": "snow",
      "partly cloudy": "suncloud",
      "thundershowers": "thunderrain",
      "snow showers": "snow",
      "isolated thundershowers": "thunderrain"
  };
}

// Create a WeatherVis.prototype object that inherits from VisObject.prototype.
// Note: A common error here is to use "new VisObject()" to create the
// WeatherVis.prototype. That's incorrect for several reasons, not least 
// that we don't have anything to give VisObject for the "firstName" 
// argument. The correct place to call VisObject is above, where we call 
// it from WeatherVis.
WeatherVis.prototype = Object.create(VisObject.prototype); // See note below

// Set the "constructor" property to refer to WeatherVis
WeatherVis.prototype.constructor = WeatherVis;



WeatherVis.prototype.getData = function(){
    
    var vis = this;
    
    $.simpleWeather({
        location: '',
        woeid: this.url,
        unit: this.unit,
        success: function(weather) {
            vis.data = weather;
            vis.drawGraph();
        },
        error: function(error) {
           vis.data = {"title":"Conditions for Enschede, OV, NL at 03:00 PM CEST","temp":"11","code":"23","todayCode":"39","currently":"Breezy","high":"11","low":"6","text":"Scattered Showers","humidity":"64","pressure":"33931.63","rising":"0","visibility":"25.91","sunrise":"6:52 am","sunset":"8:18 pm","description":"<![CDATA[<img src=\"http://l.yimg.com/a/i/us/we/52/23.gif\"/>\n<BR />\n<b>Current Conditions:</b>\n<BR />Breezy\n<BR />\n<BR />\n<b>Forecast:</b>\n<BR /> Wed - Scattered Showers. High: 11Low: 6\n<BR /> Thu - Partly Cloudy. High: 10Low: 5\n<BR /> Fri - Partly Cloudy. High: 11Low: 4\n<BR /> Sat - Partly Cloudy. High: 12Low: 5\n<BR /> Sun - Mostly Cloudy. High: 15Low: 7\n<BR />\n<BR />\n<a href=\"http://us.rd.yahoo.com/dailynews/rss/weather/Country__Country/*https://weather.yahoo.com/country/state/city-729139/\">Full Forecast at Yahoo! Weather</a>\n<BR />\n<BR />\n(provided by <a href=\"http://www.weather.com\" >The Weather Channel</a>)\n<BR />\n]]>","city":"Enschede","country":"Netherlands","region":" OV","updated":"Wed, 06 Apr 2016 03:00 PM CEST","link":"http://us.rd.yahoo.com/dailynews/rss/weather/Country__Country/*https://weather.yahoo.com/country/state/city-729139/","units":{"temp":"C","distance":"km","pressure":"mb","speed":"km/h"},"wind":{"chill":"46","direction":"SW","speed":"46.67"},"heatindex":"11","thumbnail":"https://s.yimg.com/zz/combo?a/i/us/nws/weather/gr/23ds.png","image":"https://s.yimg.com/zz/combo?a/i/us/nws/weather/gr/23d.png","alt":{"temp":52,"high":52,"low":43,"unit":"f"},"forecast":[{"code":"39","date":"06 Apr 2016","day":"Wed","high":"11","low":"6","text":"Scattered Showers","alt":{"high":52,"low":43},"thumbnail":"https://s.yimg.com/zz/combo?a/i/us/nws/weather/gr/39ds.png","image":"https://s.yimg.com/zz/combo?a/i/us/nws/weather/gr/39d.png"},{"code":"30","date":"07 Apr 2016","day":"Thu","high":"10","low":"5","text":"Partly Cloudy","alt":{"high":50,"low":41},"thumbnail":"https://s.yimg.com/zz/combo?a/i/us/nws/weather/gr/30ds.png","image":"https://s.yimg.com/zz/combo?a/i/us/nws/weather/gr/30d.png"},{"code":"30","date":"08 Apr 2016","day":"Fri","high":"11","low":"4","text":"Partly Cloudy","alt":{"high":52,"low":39},"thumbnail":"https://s.yimg.com/zz/combo?a/i/us/nws/weather/gr/30ds.png","image":"https://s.yimg.com/zz/combo?a/i/us/nws/weather/gr/30d.png"},{"code":"30","date":"09 Apr 2016","day":"Sat","high":"12","low":"5","text":"Partly Cloudy","alt":{"high":54,"low":41},"thumbnail":"https://s.yimg.com/zz/combo?a/i/us/nws/weather/gr/30ds.png","image":"https://s.yimg.com/zz/combo?a/i/us/nws/weather/gr/30d.png"},{"code":"28","date":"10 Apr 2016","day":"Sun","high":"15","low":"7","text":"Mostly Cloudy","alt":{"high":59,"low":45},"thumbnail":"https://s.yimg.com/zz/combo?a/i/us/nws/weather/gr/28ds.png","image":"https://s.yimg.com/zz/combo?a/i/us/nws/weather/gr/28d.png"},{"code":"28","date":"11 Apr 2016","day":"Mon","high":"16","low":"9","text":"Mostly Cloudy","alt":{"high":61,"low":48},"thumbnail":"https://s.yimg.com/zz/combo?a/i/us/nws/weather/gr/28ds.png","image":"https://s.yimg.com/zz/combo?a/i/us/nws/weather/gr/28d.png"},{"code":"12","date":"12 Apr 2016","day":"Tue","high":"13","low":"8","text":"Rain","alt":{"high":55,"low":46},"thumbnail":"https://s.yimg.com/zz/combo?a/i/us/nws/weather/gr/12ds.png","image":"https://s.yimg.com/zz/combo?a/i/us/nws/weather/gr/12d.png"},{"code":"30","date":"13 Apr 2016","day":"Wed","high":"15","low":"7","text":"Partly Cloudy","alt":{"high":59,"low":45},"thumbnail":"https://s.yimg.com/zz/combo?a/i/us/nws/weather/gr/30ds.png","image":"https://s.yimg.com/zz/combo?a/i/us/nws/weather/gr/30d.png"},{"code":"28","date":"14 Apr 2016","day":"Thu","high":"15","low":"7","text":"Mostly Cloudy","alt":{"high":59,"low":45},"thumbnail":"https://s.yimg.com/zz/combo?a/i/us/nws/weather/gr/28ds.png","image":"https://s.yimg.com/zz/combo?a/i/us/nws/weather/gr/28d.png"},{"code":"12","date":"15 Apr 2016","day":"Fri","high":"12","low":"7","text":"Rain","alt":{"high":54,"low":45},"thumbnail":"https://s.yimg.com/zz/combo?a/i/us/nws/weather/gr/12ds.png","image":"https://s.yimg.com/zz/combo?a/i/us/nws/weather/gr/12d.png"}]};
           vis.drawGraph();
        }
      });
}