var LINEBot = require('line-messaging');
var app = require('express')();
var server = require('http').Server(app);
var event_bot = require(__dirname + '/event_bot.js');

var bot = LINEBot.create({
  channelID: '1506633524',
  channelSecret: 'e4304fa6a3b31e15e4b00f305d0aa519' ,
  channelToken: '+1NpKNGga4gRRno+dndQSd+of/48iBhrSZWnSpszoNdrgh7Vg+1medn9gMFAFVQSwhj+E3Ohv8Ckxc1KuxbVDM4CbApRLTK7LACvE4C2vJbhz52OyrGv6qhNybf329SOoGaW5Ao6SjpXeZ9JIUqwZQdB04t89/1O/w1cDnyilFU='
}, server);


app.use(bot.webhook('/'));

bot.on(LINEBot.Events.MESSAGE, function(replyToken, incomingData) {
  	if(incomingData.getEvent().source.userId){
  		console.log('chat from user');
  		event_bot.processEvent(incomingData, bot);
	}
	else{
		console.log('chat from group');
	}
});

server.listen(process.env.PORT || 8080);

