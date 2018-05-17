'use strict';

var _ = require('lodash');
var Papa = require('papaparse');
var goodtablesUI = require('goodtables-ui');

angular.module('Application')
  .controller('UploadFileController', [
    '$scope', 'UploadFileService', 'ApplicationLoader',
    function($scope, UploadFileService, ApplicationLoader) {
      $scope.model = {
        file: null,
        url: null
      };

      ApplicationLoader.then(function() {
        function reloadState() {
          $scope.state = UploadFileService.getState();

          if ($scope.state.isUrl) {
            $scope.model.url = $scope.state.url;
          }
          if ($scope.state.isFile) {
            $scope.model.file = $scope.state.file.name;
          }
          $scope.isFileSelected = $scope.state.isFile;
          $scope.isUrlSelected = $scope.state.isUrl;
        }
        reloadState();

        UploadFileService.onReset(reloadState);

        $scope.$watch('model.url', function(newValue, oldValue) {
          if (newValue !== oldValue) {
            $scope.resetFromCurrentStep();
            $scope.state = UploadFileService.resourceChanged(null,
              $scope.model.url);
            $scope.isFileSelected = false;
            $scope.isUrlSelected = !!$scope.model.url || $scope.state.isUrl;
          }
        });

        $scope.onFileSelected = function() {
          var file = _.first(this.files);
          Papa.parse(file, {
              complete: function(results){
                for (var i=1; i<results.data.length; i++){
                    for (var j=0; j<results.data[i].length; j++){
                      var result = results.data[i][j].replace(/['",]+/g, '');
                      results.data[i][j] = result;
                    }
                }
                $scope.model.file = file.name;
                $scope.resetFromCurrentStep();
                $scope.state = UploadFileService.resourceChanged(new File([Papa.unparse(results)], file.name), null);
                $scope.isFileSelected = $scope.state.isFile;
                $scope.isUrlSelected = false;
              }
          });
        };

        $scope.onClearSelectedResource = function() {
          $scope.model.file = null;
          $scope.model.url = null;
          $scope.isFileSelected = false;
          $scope.isUrlSelected = false;
          UploadFileService.resourceChanged(null, null);
          $scope.resetFromCurrentStep();
          $scope.state = UploadFileService.getState();
        };

        $scope.onShowValidationResults = function() {
          $scope.bootstrapModal().show('validation-results');
          goodtablesUI.render(
            goodtablesUI.Report,
            {report: $scope.state.status.report},
            document.getElementById('validation-report'));
        };
      });
    }
  ]);
