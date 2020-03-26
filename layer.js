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

const port = targePort;
log.info({app: 'this', phase: 'setup', id: id}, "This app target port : " + port);
log.info({app: 'this', phase: 'setup', id: id}, "This app ip address  : " + ip.address());

console.log("Application is starting......");
var counter = 0;

var nextServiceHost = "";

var serviceName = process.env.NEXT_LAYER_NAME;
console.log("Service name : " & serviceName);
console.log("Service name : " & typeof serviceName);


if (typeof serviceName == 'undefined') {
  nextServiceHost = "NONE";
} else {
  var nextServiceHostEnvName = serviceName.toUpperCase() & "_SERVICE_HOST";
  nextServiceHost = process.env[nextServiceHostEnvName];
}
var nextServicePort = targePort;

if (typeof nextServiceHost == 'undefined') {
  nextServiceHost = "NONE";
}

console.log("next interface service host : " + nextServiceHost);
console.log("next interface service port : " + nextServicePort);

log.info({phase: 'setup', id: id}, "next interface service host : " + nextServiceHost);
log.info({phase: 'setup', id: id}, "next interface service port : " + nextServicePort);

var options = {
  host: nextServiceHost,
  port: nextServicePort,
  path: '/call-layers',
  method: 'GET'
};

var optionsIgnore = {
  host: nextServiceHost,
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
  messageText = sprintfJS.sprintf("this ip address %-15s .... about to send next layer slave request", ip.address());
  var counterMessage = sprintfJS.sprintf("%04d", counter);
  log.info({app: 'this', phase: 'operational', id: id}, messageText);

  if (nextServiceHost != "NONE") {
    log.info({app: 'this', phase: 'operational', id: id}, "Sending next layer request for : " + nextServiceHost);
    sendSlaveRequest("live", function (valid, text) {
      if (valid == true) {
        text = text.replace(/"/g,"");
        messageText += sprintfJS.sprintf(" ----> next layer ip address %-15s", text);
        console.log(messageText);
        log.info({app: 'this', phase: 'operational', id: id, counter: counter, this_ip: ip.address(), slave_ip: text}, counterMessage + " " + messageText);
        response.json(messageText);
      }
    });
  } else {
    messageText = sprintfJS.sprintf("this ip address %-15s .... next layer message not sent - no more layers. ", ip.address());
    log.info({app: 'this', phase: 'operational', id: id}, messageText);
    response.send(messageText + "\n");
  }
});

app.get('/sendIgnore', (request, response) => {
  counter++;
  messageText = sprintfJS.sprintf("this ip address %-15s", ip.address());
  var counterMessage = sprintfJS.sprintf("%04d", counter);

  sendSlaveRequest("ignore", function (valid, text) {
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

function sendSlaveRequest(slave_control, cb) {
  if (slave_control == "live") {
    var slaveURL = "http://" + options.host + ":" + options.port + options.path;
  } else{
    var slaveURL = "http://" + optionsIgnore.host + ":" + optionsIgnore.port + optionsIgnore.path;
  }

  request = http.get(slaveURL, (res) => {
    let dataResponse = '';
    res.on('data', (chunk) => {
      dataResponse += chunk;
    });

    res.on('end', () => {
      cb(true, dataResponse);
    });

  }).on("error", (err) => {
    log.error("Error : " + err.message);
  });

  request.setTimeout( 1000, function( ) {
    log.error("Error : timeout");
});
}
