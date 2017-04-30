var recast = require('recastai');
var async = require('async');
var request = require('request');
exports.request = request;
var q = require('q');
var mysql = require('mysql');
var LINEBot = require('line-messaging');

var data = require(__dirname + '/data.js');
var messageConst = require(__dirname + '/message_const.js');
var utilities = require(__dirname + '/utilities.js');
var sequelize = require(__dirname + '/models/index.js');

var recastClient = new recast.Client('25693268556510176def916d35aad72e');

var categories = data.categories;
var listOfCategories = data.listOfCategories;

var answerGreeting = messageConst.answerGreeting;
var curseAnswer = messageConst.curseAnswer;
var notValidAnswer = messageConst.notValidAnswer;

var listCititesofIndonesian = data.listCititesofIndonesian;
var listCountry = data.listCountry;
var invalidMonth = data.invalidMonth;
var month = data.validMonth;


exports.processEvent = function(incomingData, bot) {  
  console.log("There's incoming message");
  console.log("MESSAGE = "+ incomingData.getEvent().message.text);
  if(incomingData.getEvent().type == "message"){
    var message = incomingData.getEvent().message;
    var messageText = message.text;
    var replyToken = incomingData.getReplyToken();
    var userId = incomingData.getEvent().source.userId;
    sequelize.sequelize.query("SELECT * FROM users WHERE name = '"+incomingData.getEvent().source.userId+"'", {raw: true})
    .then(function (userData) {
        if(messageText == 'help' || messageText.toLowerCase().includes('help'.toLowerCase())){
          var msg = "There are few of event categories, here they are :\n"+listOfCategories;
          msg += "\nIf i cannot understand your request it means there's something wrong in your sentences"
          bot.pushTextMessage(userId, msg);
        } else {
          async.series([
            function(callback){
              if(userData[0].length > 0){
                async.each(invalidMonth, function (month, callback) {
                  async.series([
                    function(callback){
                      if(messageText.toLowerCase().includes(month.toLowerCase())){
                        bot.pushTextMessage(userId, messageConst.invalidDateMessage)
                        .then(function(data){
                          callback(null);     
                        }).catch(function(error){
                           callback(null);
                        });
                      } else {
                        callback(null);
                      }
                    },
                  ],
                  function (err, results) {
                    callback(null);    
                  });
                }, function (err) {    
                  callback(null);            
                });
              } else {
                callback(null);
              }
            },
            function(callback){
              recastClient.textRequest(messageText)
              .then(function (result) {
                console.log("messageText = "+ messageText);
                if(result.intents.length > 0){
                  if(userData[0].length <= 0 && result.intents[0].slug != 'introduction'){
                    bot.pushTextMessage(userId, messageConst.askingNation)
                    .then(function(data){
                          
                    }).catch(function(error){
                        console.log("error = "+JSON.stringify(error));
                    });
                  } else {
                    if(result.intents[0].slug == 'greetings'){
                      var msg = "";
                      msg = answerGreeting[Math.floor(Math.random() * ((answerGreeting.length-1) - 0 + 1) + 0)];
                      bot.pushTextMessage(userId, msg);
                    } else if(result.intents[0].slug == 'curse-word'){
                      var msg = "";
                      msg = curseAnswer[Math.floor(Math.random() * ((curseAnswer.length-1) - 0 + 1) + 0)];
                      bot.pushTextMessage(userId, msg);
                    } else if(result.intents[0].slug == 'introduction'){
                        if(userData[0].length > 0){
                          bot.pushTextMessage(userId, "Hmmm")
                          .then(function(data){
                                
                          }).catch(function(error){
                              console.log("error = "+JSON.stringify(error));
                          });
                        } else if(userData[0].length <= 0){
                          var locations = [];
                          async.series([
                            function(callback){
                              async.each(result.entities, function (entity, callback) {
                                async.series([
                                  function(callback){
                                    if(entity.name == 'location'){
                                      locations.push(entity.raw);
                                      callback(null);
                                    } else {
                                      callback(null);
                                    }
                                  },
                                ],
                                function (err, results) {
                                  callback(null);
                                });
                              }, function (err) {    
                                  callback(null);       
                              });
                            },
                            function(callback){
                              async.each(listCountry, function (country, callback) {
                                async.series([
                                  function(callback){
                                    if(messageText.toLowerCase().includes(country.toLowerCase())){
                                      locations.push(country);
                                      callback(null);
                                    } else {
                                      callback(null);
                                    }
                                  },
                                ],
                                function (err, results) {
                                  callback(null);    
                                });
                              }, function (err) {    
                                callback(null);            
                              });
                            },
                            function(callback){
                              if(locations[0] != null && locations[0] != 'undefined'){
                                sequelize.sequelize.query("INSERT INTO users (name, nation) VALUES('"+incomingData.getEvent().source.userId+"','"+locations[0]+"')", {raw: true})
                                .then(function (userData) {
                                  bot.pushTextMessage(userId, messageConst.savedData)
                                  .then(function(data){
                                    callback(null);          
                                  }).catch(function(error){
                                    console.log("error = "+JSON.stringify(error));
                                  });
                                }).catch(function(err){
                                  console.log("error = "+ err);
                                });
                              } else {
                                  bot.pushTextMessage(userId, messageConst.validateNation)
                                  .then(function(data){
                                    callback(null);          
                                  }).catch(function(error){
                                    console.log("error = "+JSON.stringify(error));
                                  });
                              }
                            },
                          ],
                          function (err, results) {
                            callback(null);
                          });
                        }
                    } else if (result.intents[0].slug == 'profiling_age'){
                      bot.pushTextMessage(userId, "I'm 21 years old :)");
                    } else if (result.intents[0].slug == 'get_bot_name'){ 
                      bot.pushTextMessage(userId, "I'm your event assistant. \nYou can ask me any event that you want. \nI try to be helpful!");
                    } else if (result.intents[0].slug == 'thanks-response'){
                      var msg = "";
                      msg = messageConst.answerThanksResponse[Math.floor(Math.random() * ((messageConst.answerThanksResponse.length-1) - 0 + 1) + 0)];
                      bot.pushTextMessage(userId, msg);
                    } else if (result.intents[0].slug == 'dislike') {
                      var msg = "";
                      msg = messageConst.dislikeAnswer[Math.floor(Math.random() * ((messageConst.dislikeAnswer.length-1) - 0 + 1) + 0)];
                      bot.pushTextMessage(userId, msg);
                    } else {
                      if(result.entities.length > 0){
                        var url = "https://www.eventbriteapi.com/v3/events/search/?token=JX4YZXZ7AAOFUGXEVB6C";
                        var events = [];
                        var message = "";
                        async.series([
                          function(callback){
                            async.each(result.entities, function (entity, callback) {
                              async.series([
                                function(callback){
                                  if(entity.name == 'event_type' || entity.name == 'adverb'){
                                    async.each(categories, function (category, callback2) {
                                      if(category.name.toLowerCase().includes(entity.raw.toLowerCase())){
                                        url += "&categories="+category.id;
                                      } 
                                    }, function (err) {  
                                      callback2(null);              
                                    });
                                  } 
                                    callback(null);
                                  
                                },
                                function(callback){
                                  if(entity.name == 'location'){
                                    url += "&location.address="+entity.raw;
                                    callback(null);
                                  } else {
                                    callback(null);
                                  }
                                },
                                function(callback){
                                  if(!url.includes("start_date.range_start") && !url.includes("start_date.keyword")){
                                    if(entity.name == 'month'){
                                      url += utilities.setDateParamByMonthName(entity.raw);
                                      callback(null);
                                    } else {
                                      callback(null);
                                    }
                                  } else {
                                    callback(null);
                                  }
                                },
                                function(callback){
                                  var temp = utilities.setDateParam(url, entity, messageText);
                                  url += temp;
                                  callback(null);
                                },
                              ],
                              function (err, results) {
                                callback(null);
                              });
                            }, function (err) {  
                              callback(null);              
                            });
                          },
                          function(callback){
                            if(!url.includes("location.address")){
                              url += utilities.searchData(messageText, listCititesofIndonesian, "&location.address=");
                              callback(null);
                            } else {
                              callback(null);
                            }
                          },
                          function(callback){
                            if(!url.includes("location.address")){
                              url += utilities.searchData(messageText, listCountry, "&location.address=");
                              callback(null);
                            } else {
                              callback(null);
                            }
                          },
                          function(callback){
                            if(!url.includes("location.address")){
                              message = "You haven't specify any specific location keyword so i will send you some event in your location "+ userData[0][0].nation + "\n\n";
                              bot.pushTextMessage(userId, message);
                              url += "&location.address="+userData[0][0].nation;
                              callback(null);
                            } else {
                              bot.pushTextMessage(userId, "Please wait..");
                              callback(null);
                            }
                          },
                          function(callback){
                            console.log(url);
                            request({
                              url: url,
                              method: 'GET'
                            }, function(error, response, body) {
                              var temp = JSON.parse(body); 
                              events = temp.events;
                              callback(null);
                            });
                          },
                          function(callback){
                            var counter = 0;
                              async.each(events, function (event, callback) {
                                var text;
                                var image;
                                async.series([
                                  function(callback){
                                    counter++;
                                    if(counter <= 7){
                                      var startDate = new Date(event.start.utc);
                                      var endDate = new Date(event.end.utc);
                                      var date = "";
                                      if(endDate.getMonth() > startDate.getMonth() || endDate.getDate() > startDate.getDate()){
                                        date += startDate.getFullYear() + " " + month[startDate.getMonth()] + " " + startDate.getDate() + ", " + startDate.getHours() + ":" + startDate.getMinutes() + " WIB";
                                        date += " - ";
                                        date += endDate.getFullYear() + " " + month[endDate.getMonth()] + " " + endDate.getDate() + ", " + endDate.getHours() + ":" + endDate.getMinutes() + " WIB";
                                      } else {
                                        date += startDate.getFullYear() + " " + month[startDate.getMonth()] + " " + startDate.getDate() + ", " + startDate.getHours() + ":" + startDate.getMinutes() + " WIB";
                                        date += " - ";
                                        date += endDate.getHours() + ":" + endDate.getMinutes() + " WIB";
                                      }
                                      //message += counter+"."+event.name.text + "\n" + event.url + "\n" + "Date and Time :\n" + date +"\n\n";
                                      message = event.name.text + "\n" + event.url + "\n" + "Date and Time :\n" + date +"";
                                      //text = new LINEBot.TextMessageBuilder(message);
                                      //image = new LINEBot.ImageMessageBuilder(event.logo.url, event.logo.url);
                                    }
                                    callback(null);
                                  },
                                  function(callback){
                                    if(counter <= 7){
                                     bot.pushTextMessage(userId, message);
                                     //bot.pushImageMessage(userId, event.logo.url, event.logo.url);
                                      /*var multiMessageBuilder = new LINEBot.MultiMessageBuilder([
                                        text,
                                        image
                                      ]);*/
                                      //bot.pushMultiMessage(userId, [new LINEBot.TextMessageBuilder(message), new LINEBot.ImageMessageBuilder(event.logo.url, event.logo.url)]);
                                    }
                                    callback(null);
                                  }
                                ],
                                function (err, results) {
                                  callback(null);
                                });
                              }, function (err) {
                                callback(null);
                              });
                          },
                          /*function(callback){
                            console.log("Send back to requester");
                            if(events.length <= 0){
                              message = "I'm sorry there's no Events";
                            }
                            bot.pushTextMessage(userId, message).then(function(data){
                              console.log('success');
                              callback(null);
                            }).catch(function(error){
                              console.log("error = "+JSON.stringify(error));
                            });
                          },*/
                        ],
                        function (err, results) {
                        });
                      } else {
                        bot.pushTextMessage(userId, messageConst.invalidCommand);
                      }
                    } 
                  }
                } else {
                  if(userData[0].length <= 0){
                    var locations = [];
                    async.series([
                      function(callback){
                        var found;
                        for(var k = 0;k<listCountry.length;k++){
                          if(messageText.toString().toLowerCase().includes(listCountry[k].toString().toLowerCase())){
                            locations.push(listCountry[k]);
                            found = true;
                            callback(null);
                            break;
                          } else {
                            found =  false;
                          }
                        }
                        if(found == false){
                          callback(null);
                        }
                      },
                      function(callback){
                        if(locations.length > 0){
                          sequelize.sequelize.query("INSERT INTO users (name, nation) VALUES('"+incomingData.getEvent().source.userId+"','"+locations[0]+"')", {raw: true})
                          .then(function (userData) {
                            bot.pushTextMessage(userId, messageConst.savedData)
                            .then(function(data){
                              callback(null);          
                            }).catch(function(error){
                              console.log("error = "+JSON.stringify(error));
                            });
                          }).catch(function(err){
                            console.log("error = "+ err);
                          });
                        } else {
                          bot.pushTextMessage(userId, messageConst.askingNation)
                          .then(function(data){
                            callback(null);      
                          }).catch(function(error){
                              console.log("error = "+JSON.stringify(error));
                          });
                        }
                      },
                    ],
                    function (err, results) {
                    });
                  } else {
                    /*if(result.entities.length > 0){
                      var url = "https://www.eventbriteapi.com/v3/events/search/?token=JX4YZXZ7AAOFUGXEVB6C";
                      var events = [];
                      var message = "";
                      async.series([
                        function(callback){
                          async.each(result.entities, function (entity, callback) {
                            async.series([
                              function(callback){
                                if(entity.name == 'event_type' || entity.name == 'adverb'){
                                  async.each(categories, function (category, callback2) {
                                    if(category.name.toLowerCase().includes(entity.raw.toLowerCase())){
                                      url += "&categories="+category.id;
                                    } 
                                  }, function (err) {  
                                    callback2(null);              
                                  });
                                } 
                                  callback(null);
                                
                              },
                              function(callback){
                                if(entity.name == 'location'){
                                  url += "&location.address="+entity.raw;
                                  callback(null);
                                } else {
                                  callback(null);
                                }
                              },
                              function(callback){
                                if(!url.includes("start_date.range_start") && !url.includes("start_date.keyword")){
                                  if(entity.name == 'month'){
                                    url += utilities.setDateParamByMonthName(entity.raw);
                                    callback(null);
                                  } else {
                                    callback(null);
                                  }
                                } else {
                                  callback(null);
                                }
                              },
                              function(callback){
                                url += utilities.setDateParam(url, entity, messageText);
                                callback(null);
                              },
                            ],
                            function (err, results) {
                              callback(null);
                            });
                          }, function (err) {  
                            callback(null);              
                          });
                        },
                        function(callback){
                          if(!url.includes("location.address")){
                            url += utilities.searchData(messageText, listCititesofIndonesian, "&location.address=");
                            callback(null);
                          } else {
                            callback(null);
                          }
                        },
                        function(callback){
                          if(!url.includes("location.address")){
                            url += utilities.searchData(messageText, listCountry, "&location.address=");
                            callback(null);
                          } else {
                            callback(null);
                          }
                        },
                        function(callback){
                          if(!url.includes("location.address")){
                            message += "You haven't specify any specific location keyword so i will send you some event in your location "+ userData[0][0].nation + "\n\n";
                            url += "&location.address="+userData[0][0].nation;
                            callback(null);
                          } else {
                            callback(null);
                          }
                        },
                        function(callback){
                          console.log(url);
                          request({
                            url: url,
                            method: 'GET'
                          }, function(error, response, body) {
                            var temp = JSON.parse(body); 
                            events = temp.events;
                            callback(null);
                          });
                        },
                        function(callback){
                          var counter = 0;
                          if(events.length > 0){
                            async.each(events, function (event, callback) {
                              async.series([
                                function(callback){
                                  counter++;
                                  if(counter <= 7){
                                      var startDate = new Date(event.start.utc);
                                      var endDate = new Date(event.end.utc);
                                      var date = "";
                                      if(endDate.getMonth() > startDate.getMonth() || endDate.getDate() > startDate.getDate()){
                                        date += startDate.getFullYear() + " " + month[startDate.getMonth()] + " " + startDate.getDate() + ", " + startDate.getHours() + ":" + startDate.getMinutes() + " WIB";
                                        date += " - ";
                                        date += endDate.getFullYear() + " " + month[endDate.getMonth()] + " " + endDate.getDate() + ", " + endDate.getHours() + ":" + endDate.getMinutes() + " WIB";
                                      } else {
                                        date += startDate.getFullYear() + " " + month[startDate.getMonth()] + " " + startDate.getDate() + ", " + startDate.getHours() + ":" + startDate.getMinutes() + " WIB";
                                        date += " - ";
                                        date += endDate.getHours() + ":" + endDate.getMinutes() + " WIB";
                                      }
                                      message += counter+"."+event.name.text + "\n" + event.url + "\n" + "DATE AND TIME :\n" + date +"\n\n";
                                  }
                                  callback(null);
                                },
                              ],
                              function (err, results) {
                                callback(null);
                              });
                            }, function (err) {
                              callback(null);
                            });
                          } else {
                            callback(null);
                          }
                        },
                        function(callback){
                          console.log("Send back to requester");
                          if(events.length <= 0){
                            message = "I'm sorry there's no Events";
                          }
                          bot.pushTextMessage(userId, message).then(function(data){
                            console.log('success');
                            callback(null);
                          }).catch(function(error){
                            console.log("error = "+JSON.stringify(error));
                          });
                        },
                      ],
                      function (err, results) {
                      });
                    } else {*/
                      //bot.pushTextMessage(userId, messageConst.invalidCommand);
                      bot.pushTextMessage(userId,"I'm sorry, I don't understand! Sometimes I have an easier time with a few simple words.").then(function(data){
                          bot.pushTextMessage(userId,"Like Show me any event today").then(function(data){
                            bot.pushTextMessage(userId,"Or Please tell me music event in Jakarta today").then(function(data){
                              bot.pushTextMessage(userId,"You can head to our event categories list by typing help").then(function(data){
                                bot.pushTextMessage(userId,"Please remember now i'm in study phase");
                              });
                            });
                          });
                      });
                      
                    //}
                  }
                }
              }).catch(function (err) {
                console.log("error = "+ err);
              });
            },
          ],
          function (err, results) {
          });
        }
    }).catch(function (err) {
      console.log("error = "+ err);
    });
  }
}