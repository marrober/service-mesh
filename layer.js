const http = require('http');
const express = require('express');
const sprintfJS = require('sprintf-js');
var ip = require("ip");
const app = express();

/* API endpoints ......
    /             - Get the IP address of the current layer.
    /call-layers  - Call the next layer microservice indicated by the environment variable NEXT_LAYER_NAME
    /sendIgnore   - Tell the receiving next layer container to ignore further requests (used for liveness and readiness testing)
    /ignore       - Receive a request to ignore further communication.
*/

var serviceNames = process.env.NEXT_LAYER_NAME;
var serviceNamespace = process.env.NEXT_LAYER_NAMESPACE;
var thisLayerName = process.env.THIS_LAYER_NAME;
var ignoreDelays = process.env.IGNORE_DELAYS;
var versionID = process.env.VERSION_ID;
var ignoreDelaysFlag = false;
var timeout = 3000;

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

var serviceClusterAddressList = [];

console.log("phase: setup", "This app name  : " + thisLayerName);

if (typeof serviceNames != 'undefined') {
  if (serviceNames.length > 0) {
    var serviceNamesList = serviceNames.split(",");
    console.log("Number of downstream services " + serviceNamesList.length)
    var nextServiceList = "";

    serviceNamesList.forEach( service => {
      console.log("Processing service : " + service);
      service = service.trim();

      var nextServiceClusterAddress = service.concat(".").concat(serviceNamespace).concat(".svc.cluster.local");

      console.log("phase: setup", " ... service name " + nextServiceClusterAddress);
      serviceClusterAddressList.push(nextServiceClusterAddress);
      console.log("phase: setup", "next interface service host : " + nextServiceClusterAddress);
    });
  }

} else {
  console.log("phase: setup", "Last node in the line");
}

var options = {
  host: "",
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
  console.log("phase: /", messageText);

  response.send(messageText + "\n");
});

app.get('/call-layers', (request, response) => {
  counter++;
  messageText = thisLayerName + " (" + versionID + ") " +  "[" + ip.address() + "]";
  var counterMessage = sprintfJS.sprintf("%04d", counter);
  console.log("phase: /call-layers", messageText);
  console.log(JSON.stringify(request.headers));

  if (serviceClusterAddressList.length > 0) {
    var nextServiceClusterAddressToUse = serviceClusterAddressList[getRandomIndex(serviceClusterAddressList.length)];
    options.host = nextServiceClusterAddressToUse;
    options.path = "/call-layers";
    console.log("phase: /call-layers", "Sending next layer request for : " + nextServiceClusterAddressToUse);
    sendNextRequest(request.headers, function (valid, text, code ) {
      if (valid == true) {
        text = text.replace(/"/g,"");
        textSplit = text.split(" ");
        next_name = textSplit[0];
        next_version = textSplit[1].replace("(", "");
        next_version = next_version.replace(")", "");
        next_ip = textSplit[2].replace("[", "");
        next_ip = next_ip.replace("]", "");

        messageText += " ----> " + text;
        // console.log("phase: /call-layers, counter: counter, this_ip: ip.address(), this_name: thisLayerName, this_version: versionID, next_ip: next_ip, next_name: next_name, next_version: next_version");
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
  console.log("phase: /call-layers-sleep", "recieved incoming request on sleeper api");
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
  console.log("phase: /call-layers-sleep", "sleeping ... " + thisSleepTime);
  sleep(thisSleepTime).then(() => {
    messageText = thisLayerName + " (" + versionID + ") " +  "[" + ip.address() + "] sleep (" + thisSleepTime + " ms)";
    var counterMessage = sprintfJS.sprintf("%04d", counter);
    console.log("phase: /call-layers-sleep", messageText);

    if (serviceClusterAddressList.length > 0) {
      var nextServiceClusterAddressToUse = serviceClusterAddressList[getRandomIndex(serviceClusterAddressList.length)];
      options.host = nextServiceClusterAddressToUse;
      options.path = "/call-layers-sleep:" + sleepTime;
      console.log("phase: /call-layers-sleep", "Sending next layer request for : " + nextServiceClusterAddressToUse + " with delay of " + sleepTime +" ms");

      sendNextRequest(function (valid, text, code) {
        if (valid == true) {
          text = text.replace(/"/g,"");
          messageText += " ----> " + text;
          //console.log("phase: /call-layers-sleep, counter: counter, this_ip: ip.address(), next_ip: text, counterMessage" + " " + messageText + " " + code);
          if (code != 200) {
            response.code = code;
          }
          response.send(messageText);
        } else {
          //console.log("phase: /call-layers-sleep, counter: counter, this_ip: ip.address()", "Error : no response ...");
          response.send("Error : no response ...");
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
  console.log("phase: /get-info", messageText);
  response.send(messageText);
});

app.listen(port, () => console.log("phase: setup", "Listening on port " + port));

function sendNextRequest(headers, cb) {
  var nextURL = "http://" + options.host + ":" + options.port + options.path;
  console.log("phase: sendNextRequest()", "Sending message to next layer : " + nextURL);

  console.log("phase: sendNextRequest()", "Headers : " + headers);

  options.headers = headers;

  var request = http.request(options, (res) => {
    let dataResponse = '';
    res.on('data', (chunk) => {
      dataResponse += chunk;
      console.log("phase: sendNextRequest()", "Got data back : " + dataResponse);
    });

    res.on('end', () => {
      console.log("phase: sendNextRequest()", "Got data end : " + dataResponse);
      cb(true, dataResponse, res.statusCode);
    });
  });

  request.on("error", (err) => {
    console.log("Error : " + err.message);
  });

  request.setTimeout( 2000, function( ) {
    console.log("Error : timeout");
    cb(false, '', 500);
  });

  request.end();

  return request;
}

function getRandomIndex(max) {
  return Math.floor(Math.random() * Math.floor(max));
}
