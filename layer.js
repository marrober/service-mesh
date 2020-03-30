const http = require('http');
const express = require('express');
const sprintfJS = require('sprintf-js');
var ip = require("ip");
var bunyan = require('bunyan');
const app = express();

const uuid = require('uuid')
const id = uuid.v1()

var log = bunyan.createLogger({
      name: "layer-app",
      streams: [{
      path: './application-events.log',
    }]
  });

/* API endpoints ....
    /             - Get the IP address of the current layer.
    /call-layers  - Call the next layer microservice indicated by the environment variable NEXT_LAYER_NAME
    /sendIgnore   - Tell the receiving next layer container to ignore further requests (used for liveness and readiness testing)
    /ignore       - Receive a request to ignore further communication.
*/


var targePort = 8080;
var nextServicePort = targePort;

const port = targePort;
log.info({app: 'this', phase: 'setup', id: id}, "This app target port : " + port);
log.info({app: 'this', phase: 'setup', id: id}, "This app ip address  : " + ip.address());

console.log("Application is starting......");
var counter = 0;

var nextServiceClusterIP = [];
var nextServiceClusterIPEnvName = "";

var routeNames = process.env.NEXT_ROUTES;
var thisLayerName = process.env.THIS_LAYER_NAME;
var versionID = process.env.VERSION_ID;

log.info({app: 'this', phase: 'setup', id: id}, "This app name  : " + thisLayerName);
console.log("This app name  : " + thisLayerName);

if (typeof routeNames != 'undefined') {
  if (routeNames.length > 0) {
    var routeNamesList = routeNames.split(",");
    console.log("Number of downstream routes " + routeNamesList.length)
  } 

  console.log("next interface service port : " + nextServicePort);
  log.info({phase: 'setup', id: id}, "next interface service port : " + nextServicePort);
} else {
  console.log("Last node in the line");
  log.info({phase: 'setup', id: id}, "Last node in the line");
}

var options = {
  host: "",
  port: nextServicePort,
  path: '/call-layers',
  method: 'GET'
};

var optionsIgnore = {
  host: nextServiceClusterIP,
  port: nextServicePort,
  path: '/ignore',
  method: 'GET'
};

var ip = require("ip");
var messageText = "";

app.get('/', (request, response) => {
  counter++;
  messageText = sprintfJS.sprintf("this ip address %-15s  %04d", ip.address(), counter);
  log.info({app: 'this', phase: 'root', id: id}, messageText);
  response.send(messageText + "\n");
});

app.get('/call-layers', (request, response) => {
  counter++;
  messageText = thisLayerName + " (" + versionID + ") " +  "[" + ip.address() + "]";
  var counterMessage = sprintfJS.sprintf("%04d", counter);
  log.info({app: 'this', phase: 'operational', id: id}, messageText);

  if (typeof routeNames != 'undefined') {
    if (routeNames.length > 0) {
      var nextServiceRoute = routeNames[getRandomIndex(routeNames.length)];
      options.host = nextServiceRoute;
      log.info({app: 'this', phase: 'operational', id: id}, "Sending next layer request for : " + nextServiceRoute);
      sendNextRequest("live", function (valid, text) {
        if (valid == true) {
          text = text.replace(/"/g,"");
          messageText += " ----> " + text;
          console.log(messageText);
          log.info({app: 'this', phase: 'operational', id: id, counter: counter, this_ip: ip.address(), slave_ip: text}, counterMessage + " " + messageText);
          response.json(messageText);
        }
      });
    } else {
      log.info({app: 'this', phase: 'operational', id: id}, messageText);
      response.send(messageText);
    }
  }
});

app.get('/sendIgnore', (request, response) => {
  counter++;
  messageText = sprintfJS.sprintf("this ip address %-15s", ip.address());
  var counterMessage = sprintfJS.sprintf("%04d", counter);

  sendNextRequest("ignore", function (valid, text) {
    if (valid == true) {
      text = text.replace(/"/g,"");
      messageText += sprintfJS.sprintf(" ----> slave response %-15s", text);
      console.log(messageText);
      log.info({app: 'this', phase: 'operational', id: id, counter: counter, this_ip: ip.address(), slave_ip: text}, counterMessage + " " + messageText);
      response.json(messageText);
    }
  });
});

app.listen(port, () => log.info({app: 'this', phase: 'setup', id: id}, "Listening on port " + port));

function sendNextRequest(slave_control, cb) {
  if (slave_control == "live") {
    var slaveURL = "http://" + options.host + ":" + options.port + options.path;
  } else{
    var slaveURL = "http://" + optionsIgnore.host + ":" + optionsIgnore.port + optionsIgnore.path;
  }

  var request = http.get(slaveURL, (res) => {
    let dataResponse = '';
    res.on('data', (chunk) => {
      dataResponse += chunk;
    });

    res.on('end', () => {
      cb(true, dataResponse);
    });

  });
  
  request.on("error", (err) => {
    log.error("Error : " + err.message);
  });

  request.setTimeout( 1000, function( ) {
    log.error("Error : timeout");
  });

  request.end();

  return request;
}

function getRandomIndex(max) {
  return Math.floor(Math.random() * Math.floor(max));
}
