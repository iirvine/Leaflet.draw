describe("L.Edit.Poly", function(){
	beforeEach(function(){
		var c = document.createElement('div');
		var map = new L.Map(c);
		map.setView(new L.LatLng(55.8,37.6), 6);
		var poly = new L.Polygon([[1,2],[3,4]]).addTo(map);
		handler = poly.editing;
		handler.enable();
	});
	describe("#createMiddleMarker", function(){
		it('does some stuff', function(){
			marker1 = L.marker([0,0]);
			marker2 = L.marker([1,1]);
			handler._createMiddleMarker(marker1, marker2);
		});
	});
});