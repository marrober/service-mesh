const http = require('http');
const express = require('express');
const sprintfJS = require('sprintf-js');
var ip = require("ip");
const app = express();

/* API endpoints ......
    /             - Get the IP address of the current layer.
    /call-layers  - Call the next layer microservice indicated by the environment variable NEXT_LAYER_NAME
    /sendIgnore   - Tell the receiving next layer container to ignore further requests (used for liveness and readiness testing)
    /ignore       - Receive a request to ignore further communication...
*/

var serviceNames = process.env.NEXT_LAYER_NAME;
var thisLayerName = process.env.THIS_LAYER_NAME;
var ignoreDelays = process.env.IGNORE_DELAYS;
var versionID = process.env.VERSION_ID;
var ignoreDelaysFlag = false;

if (typeof ignoreDelays != 'undefined') {
  if (ignoreDelays.toUpperCase() == "TRUE") {
    ignoreDelaysFlag = true;
  }
}

var targePort = 8080;
var nextServicePort = targePort;

const port = targePort;
console.log("phase: setup", "This app target port : " + port);
console.log("phase: setup", "This app ip address  : " + ip.address());

console.log("Application is starting......");
var counter = 0;

var nextServiceClusterIP = [];
var nextServiceClusterIPEnvName = "";

console.log("phase: setup", "This app name  : " + thisLayerName);
console.log("This app name  : " + thisLayerName);

if (typeof serviceNames != 'undefined') {
  if (serviceNames.length > 0) {
    var serviceNamesList = serviceNames.split(",");
    console.log("Number of downstream services " + serviceNamesList.length)
    var nextServiceList = "";

    serviceNamesList.forEach( service => {
      console.log("Processing service : " + service);
      service = service.trim();

      var nextServiceClusterIPEnvName = service.toUpperCase().concat("_SERVICE_HOST");
      nextServiceClusterIPEnvName = nextServiceClusterIPEnvName.replace('-', '_');

      console.log(" ... service name " + nextServiceClusterIPEnvName);
      nextServiceClusterIP.push(process.env[nextServiceClusterIPEnvName]);
      console.log("next service ip address : " + nextServiceClusterIP);
      console.log("phase: setup", "next interface service host : " + nextServiceClusterIP);
    });
  } 

  console.log("next interface service port : " + nextServicePort);
  console.log("phase: setup", "next interface service port : " + nextServicePort);
} else {
  console.log("Last node in the line");
  console.log("phase: setup", "Last node in the line");
}

var options = {
  host: nextServiceClusterIP,
  port: nextServicePort,
  path: "",
  method: 'GET',
  headers: ""  
};

var ip = require("ip");
var messageText = "";

app.get('/', (request, response) => {
  counter++;
  messageText = sprintfJS.sprintf("this ip address %-15s  %04d", ip.address(), counter);
  console.log("phase: root", messageText);
  response.send(messageText + "\n");
});

app.get('/call-layers', (request, response) => {
  counter++;
  messageText = thisLayerName + " (" + versionID + ") " +  "[" + ip.address() + "]";
  var counterMessage = sprintfJS.sprintf("%04d", counter);
  console.log("phase: /call-layers", messageText);
  console.log(JSON.stringify(request.headers));

  if (nextServiceClusterIP.length > 0) {
    var nextServiceClusterIPToUse = nextServiceClusterIP[getRandomIndex(nextServiceClusterIP.length)];
    options.path = "/call-layers";
    sendNextRequest(request.headers, function (valid, text, code ) {
      if (valid == true) {
        text = text.replace(/"/g,"");
        messageText += " ----> " + text;
        console.log("phase: status counter: " + counter + "this_ip: " + ip.address() +" "  + messageText + " " + code);
        if (code != 200) {
          response.code = code;
        }
        response.send(messageText);
      }
    });
  } else {
    response.send(messageText);
  }
});

app.get('/call-layers-sleep:sleepTime', (request, response) => {
  console.log("phase: run", "received incoming request on sleeper api");
  counter++;
  messageText = thisLayerName + " (" + versionID + ") " +  "[" + ip.address() + "]";
  var sleepTime = request.params.sleepTime;
  sleepTime = sleepTime.substr(1, sleepTime.length);
  var thisSleepTime = 0;
  if (ignoreDelaysFlag) {
    thisSleepTime = 0;
  } else {
    thisSleepTime = sleepTime;
  }
  console.log("phase: timing", "sleeping ... " + thisSleepTime);
  sleep(thisSleepTime).then(() => {
    messageText = thisLayerName + " (" + versionID + ") " +  "[" + ip.address() + "] sleep (" + thisSleepTime + " ms)";
    var counterMessage = sprintfJS.sprintf("%04d", counter);
    console.log("phase: run", messageText);

    if (nextServiceClusterIP.length > 0) {
      var nextServiceClusterIPToUse = nextServiceClusterIP[getRandomIndex(nextServiceClusterIP.length)];
      options.path = "/call-layers-sleep:" + sleepTime;
      console.log("phase: run", "Sending next layer request for : " + nextServiceClusterIPToUse + " with delay of " + sleepTime +" ms");

      sendNextRequest(request.headers, function (valid, text, code) {
        if (valid == true) {
          text = text.replace(/"/g,"");
          messageText += " ----> " + text;
          console.log("phase: status counter: " + counter + "this_ip: " + ip.address() +" "  + messageText + " " + code);
          if (code != 200) {
            response.code = code;
          }
          response.send(messageText);
        }
      });
    } else {
      response.send(messageText);
    }
  });
});

const sleep = (waitTimeInMs) => new Promise(resolve => setTimeout(resolve, waitTimeInMs));

app.get('/get-info', (request, response) => {
  counter++;
  messageText = thisLayerName + " (" + versionID + ") " +  "[" + ip.address() + "] hostname : " + process.env.HOSTNAME + " Build source : " + process.env.OPENSHIFT_BUILD_SOURCE + " GIT commit : " + process.env.OPENSHIFT_BUILD_COMMIT;
  var counterMessage = sprintfJS.sprintf("%04d", counter);
  console.log("phase: run", messageText);
  response.send(messageText);
});

console.log("Listening on port " + port);
app.listen(port, () => console.log("phase: setup", "Listening on port " + port));

function sendNextRequest(headers, cb) {
  var nextURL = "http://" + options.host + ":" + options.port + options.path;
  console.log("phase: run", "Sending message to next layer : " + nextURL);

  options.headers = headers;

  var request = http.request(options, (res) => {
    let dataResponse = '';
    res.on('data', (chunk) => {
      dataResponse += chunk;
      console.log("phase: run", "Got data back : " + dataResponse);
      console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
    });

    res.on('end', () => {
      console.log("phase: run", "Got data end : " + dataResponse);
      cb(true, dataResponse, res.statusCode);
    });
  });
  
  request.on("error", (err) => {
    console.log("Error : " + err.message);
  });

  request.setTimeout( 10000, function( ) {
    log.error("Error : timeout");
  });

  request.end();

  return request;
}

function getRandomIndex(max) {
  return Math.floor(Math.random() * Math.floor(max));
}
