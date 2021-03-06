'use strict';

angular.module("PyPushApp", ["ngResource", 'ui.bootstrap', 'ui.bootstrap.tpls', 'xeditable'])
	.controller("PushList", function($scope, $resource, $timeout, $location, $browser){
		var Microbot = $resource($browser.baseHref() + '/api/microbots/:id', {id: '@id'}, {
		});

		var MicrobotAction = $resource(
			$browser.baseHref() + "/api/microbots/:id/:action",
			{id: "@id", action: "@action"}
		);
		
		$scope.microbots = {};
		$scope.collapseStatus = {};

		var mbById = (function(searchId)
		{
			console.log([searchId, $scope.microbots]);
			return $scope.microbots[searchId];
		});

		$scope.doAction = (function(uuid, action)
		{
			MicrobotAction.get({id: uuid, action: action});
		});

		$scope.updateName = (function(microbot, newName){
			microbot.name = newName;
			microbot.$save();
		});

		$scope.setButtonMode = (function(mbId, newMode){
			MicrobotAction.get({
				id: mbId, 
				action: "change_button_mode",
				args: [newMode],
			});
		});

		$scope.updateCalibration = (function(microbot, newValue){
			var value = parseFloat(newValue);
			if(!isFinite(value) || value > 1 || value < 0.1)
			{
				// Not a float
				return;
			}
			microbot.calibration = newValue;
			microbot.$save()
		});

		$scope.publicEndpointActions = (function(actions){
			var out = [];
			var hiddenActions = [
				"calibrate",
				"change_button_mode"
			];
			angular.forEach(actions, function(action){
				if(hiddenActions.indexOf(action) < 0)
				{
					out.push(action);
				}
			});
			return out;
		});

		$scope.actionUrl = (function(mb, action){
			var url = "/api/microbots/" + mb.id + "/" + action;
			return $location.protocol() + "://" + $location.host() + ":" + $location.port() + $browser.baseHref() + url;
		});
		
		function mergeBotList(newList)
		{
			angular.forEach(newList, function(value){
				var key = value.id;
				if($scope.microbots.hasOwnProperty(key))
				{
					angular.copy(value, $scope.microbots[value.id]);
				}
				else
				{
					$scope.microbots[value.id] = value;
				}				
			});
		}

		(function tick() {
	        Microbot.query(function(result){
	        	mergeBotList(result);
	            $timeout(tick, 5000);
	        });
	    })();
	});