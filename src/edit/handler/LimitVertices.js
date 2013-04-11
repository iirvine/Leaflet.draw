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
	_compose: function(){
		if (!arguments) return;
		var funcs = arguments;
		return function() {
			var args = arguments;
	      	for (var i = funcs.length - 1; i >= 0; i--) {
        		args = [funcs[i].apply(this, args)];
      		}
      		return args[0];
		};
	},

	_bindMiddleMarker: function(marker, marker1, marker2) {
		var markers = [marker, marker1, marker2];
		var pipeline = this._compose(this._logMarkersLength, this._doSomethingToFifthMarker, this._limitVertices, this._onMidMarkerDragStart)

		var onDragStart = this._getHandler(pipeline, markers, marker.getLatLng());
		var onDragEnd = this._getHandler(this._onMidMarkerDragEnd, markers, onDragStart);
		var onClick = this._getHandler(this._onMidMarkerClick, onDragStart, onDragEnd);

		marker
		    .on('click', onClick, this)
		    .on('dragstart', onDragStart, this)
		    .on('dragend', onDragEnd, this);
	},

	_doSomethingToFifthMarker: function(next) {
		var aspect = function(markers) {
			if (this._markers.length == 5) {
				console.log("hello from fifth marker aspec!");
			}
			next.call(this);
		};
		return aspect
	},

	_logMarkersLength: function(next) {
		var aspect = function() {
			console.log(this._markers.length);
			next.call(this);
		}
		return aspect;
	},

	_limitVertices: function(next) {
		var aspect = function() {
			if (this._markers.length < 5) {
				console.log('okay, good to go');
				next.call(this);
			} else {
				console.log('uh oh, too many markers');
				next.call(this);
			}
		}
		return aspect;
	}
});
