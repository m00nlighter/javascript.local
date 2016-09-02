 var myApp = angular.module('myApp', ['ui.router']);
 myApp.config(function($locationProvider, $urlRouterProvider, $stateProvider) {

    $urlRouterProvider.otherwise("/");
    $locationProvider.html5Mode(true);
    //
    // Now set up the states
    $stateProvider
      .state('welcome', {
          url: "/",
          templateUrl: "assets/pages/welcome.html"
      })
      .state('about', {
          url: "/about",
          templateUrl: "assets/pages/about.html",
      })
      .state('map', {
        abstract: true,
        templateUrl: "assets/pages/map-layout.html",
        resolve:{
          init: function(Places){
              return Places.getPlaces();
          }
        }
      })
      .state('map.list', {
        url: "/map",
        views: {
          'right@map': {
            template: "<div ng-places-list></div>"
          }
        }
      })
      .state('map.single', {
        url: "/map/single/:placeId",
        views: {
          'right@map': {
            template: "<div ng-place-edit></div>"
          }
        }
      });
});
myApp.controller('PlacesCtrl', function ($scope, $rootScope, Places){
    $scope.places = Places.getAll();
    $scope.delete = function (place){
        Places.delete(place);
    }
});
myApp.directive('ngPlacesList',function factory($rootScope) {
    return {
      restrict: 'A',
      templateUrl: 'assets/pages/places-list.html',
      controller: 'PlacesCtrl',

    }
});
myApp.directive('ngPlaceEdit',function factory($rootScope, $stateParams, Places) {
    return {
      restrict: 'A',
      templateUrl: 'assets/pages/place-edit.html',
      controller: 'PlacesCtrl',
      link: function(scope, element, attrs){
          scope.isNew = true;
          scope.place = {};
          scope.errors = {};
          scope.validating = false;
          if($stateParams.placeId)
          {
              scope.place = Places.get($stateParams.placeId);
              scope.isNew = false;
          }
          $rootScope.$on('map:pointSelected', function(event, data) {
              scope.place.lat = data.lat;
              scope.place.lng = data.lng;
              console.log('gocha')
          });
          scope.add = function(){
              Places.add(scope.place);
          }
          scope.update = function(){
              Places.update(scope.place);
          }
          $rootScope.$on('place:error', function(event, data) {
              scope.errors= {};
              scope.validating = true;
              for(i=0;i<data.length;i++){
                  scope.errors[data[i].field]=data[i].message;
              }
              console.log(scope.errors)
          });
          scope.hasErrors = function(item){
              if(scope.validating){
                  return scope.errors[item] ? 'has-error' : 'has-success';
              }
              return '';
          }

      }
    }
});

myApp.directive('ngMap', function factory($window, $rootScope, Places) {
    return {
        restrict: 'A',
        controller: 'PlacesCtrl',
        link: function(scope, element, attrs) {
          function setMapHeight() {
              var mapHeight =  $('.content-wrapper').height() - $('.content-header').height() - $('footer').height()-25;
              element.css('height', mapHeight);
          }
          setMapHeight();

          scope.map = null;

          function initialize() {
              var defaults = {
                  center: new google.maps.LatLng(49.8247973,24.0238643),
                  zoom: 11,
                  panControl: true,
                  zoomControl: true,
                  scaleControl: true,
                  mapTypeId: google.maps.MapTypeId.ROADMAP
              };
              scope.map = new google.maps.Map(element[0], defaults);
          }
          if (scope.map === null) {
              initialize();
          }
          scope.markers = [];
          var infoBox = new google.maps.InfoWindow();
          function getDescription(place) {
                return '<h4>' + place.title + '</h4>' + place.description;
          }
          function setMarkerOnClickEvent(marker) {
                google.maps.event.addListener(marker, 'click', function(event) {
                    var place = Places.get(marker.pid);
                    var latlng = new google.maps.LatLng(place.lat, place.lng);
                    infoBox.setContent(getDescription(place));
                    infoBox.setPosition(latlng);
                    infoBox.open(scope.map);
                });
            }
          (function(){
                scope.markers = [];
                var bounds = new google.maps.LatLngBounds();
                angular.forEach(scope.places, function(place) {
                    var latlng = new google.maps.LatLng(place.lat, place.lng);
                    var marker = new google.maps.Marker({
                        position: latlng,
                        map: scope.map,
                        title: place.title,
                        pid: place.id
                    });
                    setMarkerOnClickEvent(marker);
                    scope.markers.push(marker);
                });

          })();
           //////////////////
          google.maps.event.addListener(scope.map, 'click', function(event) {
                // $apply explanation http://jimhoskins.com/2012/12/17/angularjs-and-apply.html
                console.log('click point : '+ event.latLng.lat() + ' ' + event.latLng.lng() );
                scope.$apply(function() {
                    $rootScope.$broadcast('map:pointSelected', {
                        lat: event.latLng.lat(),
                        lng: event.latLng.lng()
                    });
                });
            });
          //////////////////////
          $rootScope.$on('place:added', function(event, place) {
                var latlng = new google.maps.LatLng(place.lat, place.lng);
                var marker = new google.maps.Marker({
                    position: latlng,
                    map: scope.map,
                    title: place.title,
                    pid: place.id
                });
                setMarkerOnClickEvent(marker);
                scope.markers.push(marker);
                infoBox.setContent(getDescription(place));
                infoBox.setPosition(latlng);
                infoBox.open(scope.map);
            });
            $rootScope.$on('place:updated', function(event, place) {
                infoBox.close();
                angular.forEach(scope.markers, function(marker) {
                    if (marker.pid == place.id) {
                        var latlng = new google.maps.LatLng(place.lat, place.lng);
                        marker.setTitle(place.title);
                        marker.setPosition(latlng);
                        infoBox.setContent(getDescription(place));
                        infoBox.setPosition(latlng);
                        infoBox.open(scope.map);
                        return false;
                    }
                });
            });
            $rootScope.$on('place:deleted', function(event, place) {
                infoBox.close();
                angular.forEach(scope.markers, function(marker, i) {
                    if (marker.pid == place.id) {
                        marker.setMap(null);//Delete marker from map
                        scope.markers.splice(i, 1);
                        return false;
                    }
                });
            });

      }
    }
});

myApp.factory('Places', function($http, $rootScope, $state, $timeout) {
    var apiUrl = "http://api.javascript.local/places";
    ////////////////////////////////
    var places = [];
    return {
        getPlaces: function(){
            return $http({method: 'GET', url: apiUrl})
                .success(function(data, status, headers, config) {
                    places = data;
                })
                .error(function(data, status, headers, config) {
                    console.log("Error getPlaces promise");
                    console.log(data);
                })
        },
        getAll(){
          return places;
        },
        get(id){
            var place = null;
            angular.forEach(places, function(value) {
                if (parseInt(value.id) === parseInt(id)) {
                    place = value;
                    return false;
                }
            });
            return place;
      },
      add(place){
          $http({method: 'POST', url: apiUrl, data: place})
              .success(function(data, status, headers, config) {
                  places.push(data);
                  $rootScope.$broadcast('place:added', data);
                  $state.go('map.list');
              })
              .error(function(data, status, headers, config) {
                  $rootScope.$broadcast('place:error', data);
              });
      },
      update(place){
          $http({method: 'PUT', url: apiUrl+'/'+place.id, data: place})
              .success(function(data, status, headers, config) {
                  $rootScope.$broadcast('place:updated', data);
                  $state.go('map.list');
              })
              .error(function(data, status, headers, config) {
                  $rootScope.$broadcast('place:error', data);
              });
      },
      delete(place){
            $http({method: 'DELETE', url: apiUrl+'/'+ place.id})
              .success(function(data, status, headers, config) {
                  angular.forEach(places, function(value, i) {
                      if (parseInt(value.id) === parseInt(place.id)) {
                          places.splice(i, 1);
                          return false;
                      }
                  });
                  $rootScope.$broadcast('place:deleted', data);
              })
              .error(function(data, status, headers, config) {
                  $rootScope.$broadcast('place:error', data);
              });
      },
      //////////////////////////
  }
    /////////////////////////////////
});
