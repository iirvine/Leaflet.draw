L.Polyline.addInitHook(function(){
	if (this.editing) {
		this.off('add', null, this);
		this.off('remove', null, this);
	}

	this.editing = new L.Edit.Poly.Custom(this);

	if (this.options.editable) {
		this.editing.enable();
	}
	this.on('add', function(){
		if (this.editing && this.editing.enabled()) {
			this.editing.addHooks();
		}
	})
	this.on('remove', function(){
		if (this.editing && this.editing.enabled()) {
			this.editing.removeHooks();
		}
	})
})

L.Edit.Poly.Custom = L.Edit.Poly.extend({
	options: {
		hidden: false,
	},

	initialize: function(poly, options) {
		L.Edit.Poly.prototype.initialize.call(this, poly, options);
		this._setPipes();
	},

	_setPipes: function() {
		this.onDragStartPipe = [this._logMarkersLength, this._doSomethingToFifthMarker, this._limitVertices, this._onMidMarkerDragStart];
		this.onDragEndPipe   = [this._exitIfHidden, this._onMidMarkerDragEnd];
	},

	pipe: function(){
		if (!arguments || (!Array.isArray(arguments[0]) && arguments.length < 2)) throw Error('you did it bad');
		var funcs = Array.isArray(arguments[0]) ? arguments[0] : arguments;
		return function() {
			// apply our arguments to the last function in our pipe...
			var args = arguments;
			args = [funcs[funcs.length - 1].apply(this, args)];
			for (var i = funcs.length - 2; i>= 0; i--) {
				args = [funcs[i].apply(this, args.concat([].slice.call(arguments)))];
			}
			return args[0];
		};
	},

	_bindMiddleMarker: function(marker, marker1, marker2) {
		var markers = [marker, marker1, marker2],
			onDragStartPipe = this.pipe(this.onDragStartPipe),
			onDragEndPipe = this.pipe(this.onDragEndPipe);

		var onDragStart = this._getHandler(onDragStartPipe, markers, marker.getLatLng());
		var onDragEnd = this._getHandler(onDragEndPipe, markers, onDragStart);
		var onClick = this._getHandler(this._onMidMarkerClick, onDragStart, onDragEnd);

		marker
		    .on('click', onClick, this)
		    .on('dragstart', onDragStart, this)
		    .on('dragend', onDragEnd, this);
	},

	_hideMiddleMarkers: function() {
		var middleMarkers = [];
		this._markers = [];
		this._markerGroup.eachLayer(function(marker){
			if (marker.options.opacity == 0.6) {
				middleMarkers.push(marker)
			}
		});

		middleMarkers.forEach(function(marker){ this._markerGroup.removeLayer(marker) }, this);
		this._markerGroup.eachLayer(function(marker) { this._markers.push(marker) }, this);
		this.hidden = true;
	},

	_doSomethingToFifthMarker: function(next) {
		var rest = Array.prototype.slice.call(arguments, 1);
		return function() {
			if (this._markers.length == 5) {
				console.log("hello from fifth marker aspec!");
				rest[0][0].test = true;
			}
			next.call(this);
		};
	},

	_exitIfHidden: function(next) {
		return function() {
			if (this.hidden) {
				return;
			}
			next.call(this);
		}
	},

	_logMarkersLength: function(next) {
		return function() {
			console.log(this._markers.length);
			next.call(this);
		}
	},

	_limitVertices: function(next) {
		var rest = Array.prototype.slice.call(arguments, 1);
		return function() {
			if (this._markers.length < 5) {
				console.log('okay, good to go');
				next.call(this);
			} else {
				console.log('uh oh, too many markers');
				next.call(this);
				this._hideMiddleMarkers();
			}
		}
	}
});
