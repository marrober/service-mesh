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

var targePort = 8080;
var layerName = process.env.LAYER_NAME;

const port = targePort;
log.info({app: 'this', phase: 'setup', id: id}, "This app target port : " + port);
log.info({app: 'this', phase: 'setup', id: id}, "This app ip address  : " + ip.address());

console.log("Application is starting......");
var counter = 0;

var nextServiceHost = process.env.NEXT_LAYER_NAME;
var nextServicePort = targePort;

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
  messageText = sprintfJS.sprintf("this ip address %-15s", ip.address());
  var counterMessage = sprintfJS.sprintf("%04d", counter);

  if (nextServiceHost != "") {
    sendSlaveRequest("live", function (valid, text) {
      if (valid == true) {
        text = text.replace(/"/g,"");
        messageText += sprintfJS.sprintf(" ----> next interface ip address %-15s", text);
        console.log(messageText);
        log.info({app: 'this', phase: 'operational', id: id, counter: counter, this_ip: ip.address(), slave_ip: text}, counterMessage + " " + messageText);
        response.json(messageText);
      }
    });
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
