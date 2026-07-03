$(function () {
	var showCoordinations = true;

	// Eliminado el chequeo de protocolo HTTP para compatibilidad con HTTPS en Vercel

	var $types = $('.types');

	var onResize = function () {
		$types.css({
			maxHeight: $(window).height() - parseInt($types.css('marginTop'), 10) - parseInt($types.css('marginBottom'), 10) - parseInt($('header').height()) + 6
		});
	};

	onResize();

	$(window).resize(onResize);


	// window.isTourMode = false;

	// if (window.location.hash == '#tour') {
	// 	$('body').addClass('tour');
	// 	window.isTourMode = true;
	// }
	// else {
	// 	$('body').removeClass('tour');
	// 	window.isTourMode = false;
	// 	// $('#map').css({position:'absolute'});
	// }

	// $(window).on('hashchange', function() {
	// 	if (window.location.hash == '#tour') {
	// 		$('body').addClass('tour');
	// 		$('#map').css({position:'relative'});
	// 		window.isTourMode = true;
	// 		var x = locations.findWhere({ type: 'Nuclear Waste' }); 
	// 		Vent.trigger('location:clicked', x, true);
	// 	}
	// 	else {
	// 		$('body').removeClass('tour');	
	// 		$('#map').css({position:'absolute'});
	// 		window.isTourMode = false;
	// 	}
	// });

	var currentMarker;

	var assetsUrl = function () {
		// Siempre usar assets del repositorio original de GTA V
		return 'https://gta5-map.github.io/';
	};

	Handlebars.registerHelper('assetsUrl', assetsUrl);

	var timestampToSeconds = function (stamp) {
		stamp = stamp.split(':');
		return (parseInt(stamp[0], 10) * 60) + parseInt(stamp[1], 10);
	};

	Handlebars.registerHelper('timestampToSeconds', timestampToSeconds);

	var Vent = _.extend({}, Backbone.Events);
	// Exponer Vent globalmente para que React pueda acceder
	window.Vent = Vent;
	console.log('✅ Vent expuesto globalmente:', window.Vent);

	var LocationModel = Backbone.Model.extend({
		initialize: function () {
			var markerIcon;

			// Check if new SVG generator is available
			if (typeof window.getMarkerIconSvg === 'function') {
				var type = this.get('type');
				// Generate SVG Data URI
				var svgUrl = window.getMarkerIconSvg(type);

				markerIcon = {
					url: svgUrl,
					scaledSize: new google.maps.Size(64, 64),
					anchor: new google.maps.Point(32, 32) // Center anchor for circle icons
				};
			} else {
				// Legacy Fallback
				var iconPath = categories.getIcon(this.get('type'));
				var iconUrl = iconPath.includes('/') ? iconPath : assetsUrl() + 'icons/' + iconPath;
	
				markerIcon = {
					url: iconUrl,
					scaledSize: new google.maps.Size(64, 64)
				};
			}

			var marker = new google.maps.Marker({
				position: new google.maps.LatLng(this.get('lat'), this.get('lng')),
				icon: markerIcon
			});

			_.bindAll(this, 'markerClicked', 'markerRightClicked');
			google.maps.event.addListener(marker, 'click', this.markerClicked);
			google.maps.event.addListener(marker, 'rightclick', this.markerRightClicked);

			this.set({ marker: marker });
		},

		markerRightClicked: function () {
			console.log('? markerRightClicked - Disparando evento location:rightclicked', this);
			window.Vent.trigger('location:rightclicked', this);
		},

		markerClicked: function () {
			console.log('? markerClicked - Disparando evento location:clicked', this);
			// Apply selected glow effect
			this.highlightMarker();
			Vent.trigger('location:clicked', this);
		},

		removeHighlight: function () {
			// Stop breathing animation
			if (this._breathInterval) {
				clearInterval(this._breathInterval);
				this._breathInterval = null;
			}
			// Restore normal icon
			var type = this.get('type');
			if (typeof window.getMarkerIconSvg === 'function') {
				var zoom = window.map ? window.map.getZoom() : 4;
				var size = zoom >= 7 ? 32 : 64;
				var anchor = zoom >= 7 ? 16 : 32;
				this.get('marker').setIcon({
					url: window.getMarkerIconSvg(type),
					scaledSize: new google.maps.Size(size, size),
					anchor: new google.maps.Point(anchor, anchor)
				});
			}
		},

		highlightMarker: function () {
			// Remove highlight from previous marker
			if (currentMarker && currentMarker !== this) {
				currentMarker.removeHighlight();
			}
			currentMarker = this;

			// Apply selected glow icon with breathing animation
			var type = this.get('type');
			var marker = this.get('marker');
			var self = this;

			if (typeof window.getSelectedMarkerIconSvg === 'function') {
				var breathPhase = 0; // Continuous phase in radians

				// Stop any existing interval
				if (this._breathInterval) {
					clearInterval(this._breathInterval);
				}

				// Fixed icon size - only glow intensity changes
				var zoom = window.map ? window.map.getZoom() : 4;
				var iconSize = zoom >= 7 ? 32 : 64;
				var iconAnchor = zoom >= 7 ? 16 : 32;

				// Set initial icon
				marker.setIcon({
					url: window.getSelectedMarkerIconSvg(type, 0.5),
					scaledSize: new google.maps.Size(iconSize, iconSize),
					anchor: new google.maps.Point(iconAnchor, iconAnchor)
				});

				// Ultra-smooth glow breathing - only SVG changes, size stays fixed
				this._breathInterval = setInterval(function () {
					// Continuous sine wave for perfectly smooth glow breathing
					breathPhase += 0.05; // Speed of breathing cycle
					var glowIntensity = 0.5 + 0.5 * Math.sin(breathPhase); // 0.0 to 1.0

					marker.setIcon({
						url: window.getSelectedMarkerIconSvg(type, glowIntensity),
						scaledSize: new google.maps.Size(iconSize, iconSize),
						anchor: new google.maps.Point(iconAnchor, iconAnchor)
					});
				}, 30); // 30ms = ~33fps ultra-smooth animation
			}
		}
	});
	var LocationsCollection = Backbone.Collection.extend({
		model: LocationModel,
		url: 'data/locations.json'
	});

	var locations = window.locations = new LocationsCollection();

	var CategoryModel = Backbone.Model.extend({});
	var CategoriesCollection = Backbone.Collection.extend({

		model: CategoryModel,

		getIcon: function (type) {
			var o = this.findWhere({ name: type });
			if (o) {
				return o.get('icon');
			}

			return assetsUrl() + (o ? o.get('icon') : 'blank.png');
		},

		forView: function (type) {
			var g = this.groupBy('type');
			return _(g).map(function (categories, type) {
				return {
					name: type,
					types: _.map(categories, function (category) { return category.toJSON(); })
				}
			});
		}

	});

	// Cargar categorías desde JSON
	var categories = window.cats = new CategoriesCollection();

	var CategoriesView = Backbone.View.extend({

		initialize: function () {
			this.template = Handlebars.compile($('#categoriesTemplate').html());
		},

		render: function () {
			this.$el.html(this.template({
				categories: categories.forView()
			}));
			$('#typeDetails').hide();
			return this;
		},

		events: {
			'change input': 'toggleLocations',
			'click .details': 'showDetails'
		},

		toggleLocations: function (e) {
			var $e = $(e.currentTarget),
				type = $e.val(),
				showLocations = $e.is(':checked'),
				models = locations.where({ type: type });

			if (showLocations) {
				Vent.trigger('locations:visible', models);
			}
			else {
				Vent.trigger('locations:invisible', models);
			}
		},

		showDetails: function (e) {
			e.preventDefault();
			var typeName = $(e.currentTarget).data('name');
			this.$el.find('input[value="' + typeName + '"]').prop('checked', true).trigger('change');

			var type = categories.findWhere({ name: typeName });

			var details = new CategoryDetailsView({
				el: '#typeDetails',
				type: type
			});
			details.render();

		}

	});

	var CategoryDetailsView = Backbone.View.extend({

		initialize: function () {
			this.template = Handlebars.compile($('#categoryDetailsTemplate').html());
		},

		events: {
			'click a.back': 'goBack',
			'click li': 'showMarker'
		},

		goBack: function (e) {
			e.preventDefault();
			this.$el.empty();
			this.off();
			$('#types').show();
		},

		showMarker: function (e) {
			var location = locations.get($(e.currentTarget).data('id'));
			location.highlightMarker();
			map.panTo(location.get('marker').getPosition());
			map.setZoom(5);
		},

		render: function () {
			var name = this.options.type.get('name');
			var locs = locations.where({ type: name });
			this.$el.html(this.template({
				type: this.options.type.toJSON(),
				locations: _(locs).map(function (x) {
					var d = x.toJSON();
					if (name == 'Money') name = 'Hidden Package';
					d.title = d.title.replace(name + ' ', '');
					return d;
				})
			}));
			$('#types').hide();
			this.$el.show();
			return this;
		}

	});

	var MapView = Backbone.View.extend({

		initialize: function () {
			this.mapType = 'Atlas';
			this.mapDetails = { 'Atlas': '#0fa8d2', 'Satellite': '#143d6b', 'Road': '#1862ad' };
			this.mapOptions = {
				center: new google.maps.LatLng(66, -125),
				zoom: 4,
				disableDefaultUI: true,
				mapTypeControl: true,
				mapTypeControlOptions: { mapTypeIds: _.keys(this.mapDetails) },
				mapTypeId: this.mapType
			};

			_.bindAll(this, 'getTileImage', 'updateMapBackground');

			this.popupTemplate = Handlebars.compile($('#markerPopupTemplate2').html());

			this.listenTo(Vent, 'locations:visible', this.showLocations);
			this.listenTo(Vent, 'locations:invisible', this.hideLocations);

			this.listenTo(Vent, 'location:clicked', this.popupLocation);
		},

		render: function () {

			// Function to update coordination info windows
			function updateCoordinationWindow(markerobject) {
				// Create new info window
				var infoWindow = new google.maps.InfoWindow;

				// onClick listener
				google.maps.event.addListener(markerobject, 'click', function (evt) {
					// Set content
					infoWindow.setOptions({
						content: '<p>' + 'Current Lat: ' + evt.latLng.lat().toFixed(6) + '<br>' + 'Current Lng: ' + evt.latLng.lng().toFixed(6) + '<br>' + 'Zoom Level: ' + map.getZoom() + '</p>'
					});

					// Open the info window
					infoWindow.open(map, markerobject);
				});

				// onDrag listener
				google.maps.event.addListener(markerobject, 'drag', function (evt) {
					// Set content
					infoWindow.setOptions({
						content: '<p>' + 'Current Lat: ' + evt.latLng.lat().toFixed(6) + '<br>' + 'Current Lng: ' + evt.latLng.lng().toFixed(6) + '<br>' + 'Zoom Level: ' + map.getZoom() + '</p>'
					});
				});
			}

			var map = this.map = window.map = new google.maps.Map(this.el, this.mapOptions);

			this.initMapTypes(map, _.keys(this.mapDetails));

			google.maps.event.addListener(map, 'maptypeid_changed', this.updateMapBackground);

			google.maps.event.addDomListener(map, 'tilesloaded', function () {
				if ($('#mapControlWrap').length == 0) {
					$('div.gmnoprint').last().wrap('<div id="mapControlWrap" />');
				}
			});

			window.locs = [];
	
			// Listener de zoom: cambiar tamaño de iconos según nivel de zoom
				google.maps.event.addListener(map, 'zoom_changed', function () {
					var zoom = map.getZoom();
					var isMaxZoom = zoom >= 7;
					var iconSize = isMaxZoom ? 32 : 64;
					var anchorPoint = isMaxZoom ? 16 : 32;
					var selectedSize = isMaxZoom ? 40 : 80;
					var selectedAnchor = isMaxZoom ? 20 : 40;
		
					locations.each(function (location) {
						var marker = location.get('marker');
						if (marker && typeof window.getMarkerIconSvg === 'function') {
							var type = location.get('type');
							var isSelected = (currentMarker === location);
							if (isSelected && typeof window.getSelectedMarkerIconSvg === 'function') {
								marker.setIcon({
									url: window.getSelectedMarkerIconSvg(type),
									scaledSize: new google.maps.Size(selectedSize, selectedSize),
									anchor: new google.maps.Point(selectedAnchor, selectedAnchor)
								});
							} else {
								marker.setIcon({
									url: window.getMarkerIconSvg(type),
									scaledSize: new google.maps.Size(iconSize, iconSize),
									anchor: new google.maps.Point(anchorPoint, anchorPoint)
								});
							}
						}
					});
				});
	
			google.maps.event.addListener(map, 'rightclick', function (e) {
				var marker = new google.maps.Marker({
					map: map,
					moveable: true,
					draggable: true,
					position: e.latLng
				});
				window.locs.push(marker);

				// Check if coords mode is enabled
				if (showCoordinations) {
					// Update/create info window
					updateCoordinationWindow(marker);
				};
			});

			return this;
		},

		getMap: function () {
			return this.map;
		},

		initMapTypes: function (map, types) {
			_.each(types, function (type) {
				var mapTypeOptions = {
					maxZoom: 7,
					minZoom: 3,
					name: type,
					tileSize: new google.maps.Size(256, 256),
					getTileUrl: this.getTileImage
				};
				map.mapTypes.set(type, new google.maps.ImageMapType(mapTypeOptions));
			}, this);
		},

		updateMapBackground: function () {
			this.mapType = this.map.getMapTypeId();
			this.$el.css({
				backgroundColor: this.mapDetails[this.mapType]
			});
		},

		getTileImage: function (rawCoordinates, zoomLevel) {
			var coord = this.normalizeCoordinates(rawCoordinates, zoomLevel);
			if (!coord) {
				return null;
			}

			return assetsUrl() + 'tiles/' + this.mapType.toLowerCase() + '/' + zoomLevel + '-' + coord.x + '_' + coord.y + '.png';
		},

		normalizeCoordinates: function (coord, zoom) {
			var y = coord.y;
			var x = coord.x;

			// tile range in one direction range is dependent on zoom level
			// 0 = 1 tile, 1 = 2 tiles, 2 = 4 tiles, 3 = 8 tiles, etc
			var tileRange = 1 << zoom;

			// don't repeat across y-axis (vertically)
			if (y < 0 || y >= tileRange) {
				return null;
			}

			// repeat across x-axis
			if (x < 0 || x >= tileRange) {
				x = (x % tileRange + tileRange) % tileRange;
			}

			return {
				x: x,
				y: y
			};
		},

		showLocations: function (locations) {
			_.each(locations, function (location) {
				var marker = location.get('marker');
				if (!marker.getMap()) {
					marker.setMap(this.map);
				}
				marker.setVisible(true);
			}, this);
		},

		hideLocations: function (locations) {
			_.each(locations, function (location) {
				location.get('marker').setVisible(false);
			});
		},

		popupLocation: function (location, panTo) {
			// Always defer to React/Cyberpunk UI for popup
			console.log('✨ popupLocation triggered - Deferring to CyberpunkLocationPopup (React)');

			// Optional: Pan to location if needed here, but React handles it too.
			// Keeping pan logic if explicitly requested just in case
			if (panTo) {
				this.map.panTo(location.get('marker').getPosition());
				this.map.setZoom(5);
			}
		},

		closePopupLocation: function () {
			// No-op: React handles popup state
			if (this.currentInfoWindow) {
				this.currentInfoWindow.close();
				this.currentInfoWindow = null;
			}
		}

	});

	var mapView = new MapView({
		el: '#map'
	});

	var categoriesView = new CategoriesView({
		el: '#types',
		map: mapView.getMap()
	});

	// Cargar categorías desde JSON, luego ubicaciones, y finalmente renderizar
	$.getJSON('data/categories.json', function (categoriesData) {
		// Agregar categorías a la colección
		categories.reset(categoriesData);

		// Cargar ubicaciones
		locations.fetch().done(function () {
			mapView.render();
			categoriesView.render();

			categories.chain()
				.filter(function (c) { return c.get('enabled'); })
				.map(function (c) { return c.get('name'); })
				.map(function (name) {
					return locations.where({ type: name })
				})
				.each(function (locs) {
					Vent.trigger('locations:visible', locs);
				})
				.value();

			// Cargar y renderizar zonas
			$.getJSON('data/zones.json', function (zonesData) {
				console.log('🗺️ Cargando zonas:', zonesData.length);
				_.each(zonesData, function (zone) {
					if (zone.coordinates && zone.coordinates.length > 0) {
						var polygon = new google.maps.Polygon({
							paths: zone.coordinates,
							strokeColor: zone.color || '#FF0000',
							strokeOpacity: 0.8,
							strokeWeight: 2,
							fillColor: zone.color || '#FF0000',
							fillOpacity: 0.35,
							map: mapView.getMap()
						});

						// Agregar listener para clicks en zonas (opcional)
						google.maps.event.addListener(polygon, 'click', function (event) {
							console.log('Zone clicked:', zone.name);

							var contentString = '<div style="font-family: Inter, sans-serif; padding: 10px; max-width: 250px;">' +
								'<h3 style="margin: 0 0 10px 0; font-size: 18px; font-weight: 700; color: #333;">' + zone.name + '</h3>';

							if (zone.strains && zone.strains.length > 0) {
								contentString += '<div style="margin-top: 5px;">' +
									'<h4 style="margin: 0 0 5px 0; font-size: 14px; font-weight: 600; color: #666;">Sepas Disponibles:</h4>' +
									'<ul style="margin: 0; padding-left: 20px; color: #444;">';

								_.each(zone.strains, function (strain) {
									contentString += '<li style="margin-bottom: 2px;">' + strain + '</li>';
								});

								contentString += '</ul></div>';
							} else {
								contentString += '<p style="color: #666; font-style: italic; font-size: 12px;">Sin información de sepas.</p>';
							}

							contentString += '</div>';

							var infoWindow = new google.maps.InfoWindow({
								content: contentString,
								position: event.latLng // Posición donde se hizo click
							});

							infoWindow.open(mapView.getMap());
						});
					}
				});
			}).fail(function () {
				console.error('❌ Error al cargar zones.json');
			});
		});
	});

	$('#tour-prev, #tour-next').click(function (e) {
		e.preventDefault();
		var navTo = $(this).text();
		var x = locations.findWhere({ title: navTo });
		if (x) Vent.trigger('location:clicked', x, true);
	});

});