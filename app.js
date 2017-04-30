/**********************************************************************
 * File: app.js
 * Module: Dhoni
 * 
 * Description:
 * Chatbot Engine dedicated for Quiz
 * 
 **********************************************************************/


/***********************************************************************
 * Clusters
 ***********************************************************************/
var cluster = require('cluster');


/***********************************************************************
 * OS
 ***********************************************************************/
var os = require('os');

if (cluster.isMaster) {
  for (var i = 0; i < 1; i++) {
      cluster.fork();
  }

  Object.keys(cluster.workers).forEach(function(id) {
    console.log("Worker: " + cluster.workers[id].process.pid + " started");
  });

  cluster.on('exit', function(worker, code, signal) {
    console.log('Worker:' + worker.process.pid + ' died');
    cluster.fork();
  });
}
else {
  var expressApp = require(__dirname + '/expressApp.js');
}