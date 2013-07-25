define(["json2"], function() {

	return {

		createChannel: function(opts) {
			var target = opts.target.postMessage ? opts.target : (opts.target.contentWindow || opts.target);
			var channel = {

				target: target,
				allowedDomain: opts.domain,
				receiveCallback: opts.receiveCallback,
				cbScope: opts.recieveCallbackScope || this,
				targetUrl: opts.targetUrl,
				pollInterval: opts.pollInterval || 100,
				_hasPostMessage: false,
				_lastHash: "",

				init: function() {
					if (window.postMessage) {
						this._hasPostMessage = true;
					}
					if (this.receiveCallback) {
						this._cb = this.receive.bind(this);
						this.receiveCallback.bind(this.cbScope);
						if (this._hasPostMessage) {
							if (window["addEventListener"]) {
								window["addEventListener"]("message", this._cb, false);
							} else {
								window["attachEvent"]("onmessage", this._cb);
							}
						} else {
							this._pollTimer = setInterval(this._pollMessage.bind(this), this.pollInterval);
						}
					}
				},

				_pollMessage: function() {
					var hash = document.location.hash;
					if (this._lastHash !== hash) {
						var url = document.location.href,
							cachebuster = /^#?\d+&/;
						url = url.replace(/#.*$/, "");
						if (!hash || hash.length === 0) {
							return;
						}
						this._lastHash = hash;
						document.location = url + "#";
						var msg = decodeURIComponent(hash.replace(cachebuster, ""));
						var data = msg;
						try {
							data = JSON.parse(msg);
						} catch (e) {}
						this.receive({
							data: data,
							origin: this.allowedDomain
						});
					}
				},

				destroy: function() {
					if (window["removeEventListener"]) {
						window["removeEventListener"]("message", this._cb, false);
					} else {
						window["detachEvent"]("onmessage", this._cb);
					}
					if (this._pollTimer) {
						clearInterval(this._pollTimer);
					}
				},

				post: function(data) {
					console.debug("post message to domain " + this.allowedDomain, data);
					if (this._hasPostMessage) {
						this.target.postMessage(data, this.allowedDomain || "*");
					} else {
						var targetUrl = this.allowedDomain + this.targetUrl;
						if (data instanceof Object) {
							data = JSON.stringify(data);
						}
						this.target.location = targetUrl.replace(/#.*$/, '') + "#" + (new Date().getTime() + "&" + encodeURIComponent(data));
					}
				},

				receive: function(evt) {
					console.debug("received message from " + evt.origin, evt.data);
					//todo check domains
					if (evt.origin && evt.origin === this.allowedDomain) {
						this.receiveCallback(evt);
					}
				}

			};

			channel.init();
			return channel;

		}

	};

});