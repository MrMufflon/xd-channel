xd-channel
==========

Communication between cross domain iframes in javascript based  on window.postMessage(). If not supported by browser a fallback through hashtag communication is used.

Using [JSON-js](https://github.com/douglascrockford/JSON-js) for cross-browser JSON parsing.

Supported data types:
- String
- JSON object

### Usage
```javascript
Create a channel to the given target and domain. 
Define a callback function to receive messages from that target (optional).
Invoke channel.post() to post data to target.
require(["xd-channel"], function(channel) {
var c = channel.createChannel({
	//target, optional, default window.parent
	target:document.getElementById("iframe"),
	//allowed domain for communication in this channel
	domain:"http://localhost:8081",
	//complete communication target url (used for #-fallback)
	targetUrl:"/xd-channel/test/child.html",
	//callback to invoke on message
	receiveCallback:function(evt){
		//evt.data contains the received data
	}
});
c.post({value:"some message", something:["a","b"]});
});
```
	