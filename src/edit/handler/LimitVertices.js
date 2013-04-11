
L.Edit.Poly.prototype.limitVertices = function(fn) {
	return function() {
		var handler = L.bind(fn.apply(this, arguments), this);
		var aspect = function(){
			if (this._markers.length < 5) {
				console.log('okay, good to go');
				handler();
			} else {
				console.log('uh oh, too many markers');
				handler();
			}
		}
		return aspect;
	};
};

L.Edit.Poly.prototype.doSomethingToFifthMarker = function(fn) {
	return function() {
		var handler = L.bind(fn.apply(this, arguments), this);
		var aspect = function(markers) {
			if (this._markers.length == 5) {
				console.log("hello from fifth marker aspec!");
			}
			handler();
		};
		return aspect
	}
}

L.Edit.Poly.prototype._createMiddleMarker = function (marker1, marker2) {
	var latlng = this._getMiddleLatLng(marker1, marker2),
	    marker = this._createMarker(latlng),
	    onClick,
	    onDragStart,
	    onDragEnd;

	markers = [marker, marker1, marker2];

	marker.setOpacity(0.6);
	marker1._middleRight = marker2._middleLeft = marker;

	var pipeline = this.doSomethingToFifthMarker(this.limitVertices(this._onMidMarkerDragStart));

	onDragStart = this._getHandler(pipeline, markers, latlng);
	onDragEnd = this._getHandler(this._onMidMarkerDragEnd, markers, onDragStart);
	onClick = this._getHandler(this._onMidMarkerClick, onDragStart, onDragEnd);

	marker
	    .on('click', onClick, this)
	    .on('dragstart', onDragStart, this)
	    .on('dragend', onDragEnd, this);
;}