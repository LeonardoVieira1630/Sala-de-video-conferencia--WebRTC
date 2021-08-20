//Contem funções usadas para o teste do client

const fetch = require("node-fetch");
 
//Usada para configurar o browser
const getCapabilities = (browserName) => {
    switch (browserName) {
      case "chrome":
        return {
          browserName: "chrome",
          acceptInsecureCerts: true,
          "goog:chromeOptions": {
            args: [
              "--use-fake-ui-for-media-stream",
              "--use-fake-device-for-media-stream",
              //"--headless",
            ],
          },
        };
      case "firefox":
        return {
          browserName: "firefox",
          acceptInsecureCerts: true,
          "moz:firefoxOptions": {
            //args: ["-headless"],
            prefs: {
              "media.navigator.streams.fake": true,
              "media.navigator.permission.disabled": true,
            },
          },
        };
    }
};


//Func para pegar os dados de latência da url.
async function load_lat() {

    let url = 'http://localhost:3000/latencia';

    let obj = await (await fetch(url)).json();
    return obj
  
}


//Func para pegar os dados de stats da url.
async function load_stats() {

    let url = 'http://localhost:3000/stats';

    let obj = await (await fetch(url)).json();
    return obj
  
}


//Func fake de setTimeOut.
const sleep = (ms) => {
    return new Promise((resolve) => {
        setTimeout(() => resolve(), ms);
    });
};


exports.sleep = sleep;
exports.load_lat = load_lat
exports.load_stats = load_stats
exports.getCapabilities = getCapabilities;
