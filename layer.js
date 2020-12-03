const http = require('http');
const express = require('express');
const sprintfJS = require('sprintf-js');
var ip = require("ip");
var bunyan = require('bunyan');
const app = express();

var log = bunyan.createLogger({
      name: "layer-app",
      streams: [{
      path: './application-events.log',
    }]
  });

/* API endpoints ......
    /             - Get the IP address of the current layer.
    /call-layers  - Call the next layer microservice indicated by the environment variable NEXT_LAYER_NAME
    /sendIgnore   - Tell the receiving next layer container to ignore further requests (used for liveness and readiness testing)
    /ignore       - Receive a request to ignore further communication.
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
log.info({phase: 'setup'}, "This app target port : " + port);
log.info({phase: 'setup'}, "This app ip address  : " + ip.address());

console.log("Application is starting......");
var counter = 0;

var nextServiceClusterIP = [];
var nextServiceClusterIPEnvName = "";

log.info({phase: 'setup'}, "This app name  : " + thisLayerName);
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
      log.info({phase: 'setup'}, "next interface service host : " + nextServiceClusterIP);
    });
  } 

  console.log("next interface service port : " + nextServicePort);
  log.info({phase: 'setup'}, "next interface service port : " + nextServicePort);
} else {
  console.log("Last node in the line");
  log.info({phase: 'setup'}, "Last node in the line");
}

var options = {
  host: nextServiceClusterIP,
  port: nextServicePort,
  path: "",
  method: 'GET'
};

var ip = require("ip");
var messageText = "";

app.get('/', (request, response) => {
  counter++;
  messageText = sprintfJS.sprintf("this ip address %-15s  %04d", ip.address(), counter);
  log.info({phase: 'root'}, messageText);
  response.send(messageText + "\n");
});

app.get('/call-layers', (request, response) => {
  counter++;
  messageText = thisLayerName + " (" + versionID + ") " +  "[" + ip.address() + "]";
  var counterMessage = sprintfJS.sprintf("%04d", counter);
  log.info({phase: 'run'}, messageText);

  if (nextServiceClusterIP.length > 0) {
    var nextServiceClusterIPToUse = nextServiceClusterIP[getRandomIndex(nextServiceClusterIP.length)];
    options.host = nextServiceClusterIPToUse;
    options.path = "/call-layers";
    log.info({phase: 'run'}, "Sending next layer request for : " + nextServiceClusterIPToUse);
    sendNextRequest(function (valid, text, code ) {
      if (valid == true) {
        text = text.replace(/"/g,"");
        messageText += " ----> " + text;
        console.log(messageText);
        log.info({phase: 'status', counter: counter, this_ip: ip.address(), slave_ip: text}, counterMessage + " " + messageText + " " + code);
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
  log.info({phase: 'run'}, "recieved incoming request on sleeper api");
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
  log.info({phase: 'timing'}, "sleeping ... " + thisSleepTime);
  sleep(thisSleepTime).then(() => {
    messageText = thisLayerName + " (" + versionID + ") " +  "[" + ip.address() + "] sleep (" + thisSleepTime + " ms)";
    var counterMessage = sprintfJS.sprintf("%04d", counter);
    log.info({phase: 'run'}, messageText);

    if (nextServiceClusterIP.length > 0) {
      var nextServiceClusterIPToUse = nextServiceClusterIP[getRandomIndex(nextServiceClusterIP.length)];
      options.host = nextServiceClusterIPToUse;
      options.path = "/call-layers-sleep:" + sleepTime;
      log.info({phase: 'run'}, "Sending next layer request for : " + nextServiceClusterIPToUse + " with delay of " + sleepTime +" ms");

      sendNextRequest(function (valid, text, code) {
        if (valid == true) {
          text = text.replace(/"/g,"");
          messageText += " ----> " + text;
          console.log(messageText);
          log.info({phase: 'status', counter: counter, this_ip: ip.address(), slave_ip: text}, counterMessage + " " + messageText + " " + code);
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
  log.info({phase: 'run'}, messageText);
  response.send(messageText);
});

console.log("Listening on port " + port);
app.listen(port, () => log.info({phase: 'setup'}, "Listening on port " + port));

function sendNextRequest(cb) {
  var slaveURL = "http://" + options.host + ":" + options.port + options.path;
  log.info({phase: 'run'}, "Sending message to next layer : " + slaveURL);

  var request = http.get(slaveURL, (res) => {
    let dataResponse = '';
    res.on('data', (chunk) => {
      dataResponse += chunk;
      log.info({phase: 'run'}, "Got data back : " + dataResponse);
    });

    res.on('end', () => {
      log.info({phase: 'run'}, "Got data end : " + dataResponse);
      cb(true, dataResponse, res.statusCode);
    });
  });
  
  request.on("error", (err) => {
    log.error("Error : " + err.message);
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
