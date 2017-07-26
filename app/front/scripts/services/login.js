'use strict';

var _ = require('lodash');

angular.module('Application')
  .factory('LoginService', [
    'authenticate', 'authorize', '$window', '$location', '$q',
    function(authenticate, authorize, $window, $location, $q) {
      var that = this;

      $window.addEventListener('message', function(event) {
        if (_.isObject(event.data)) {
          if (event.data.message == 'OSLoginWindow.LoginFinished') {
            var query = event.data.query;
            $location.search(query);
            that.check();
          }
        }
      }, false);

      this.reset = function() {
        that.isLoggedIn = false;
        that.name = null;
        that.userId = null;
        that.email = null;
        that.avatar = null;
        that.permissions = null;
        that.permissionToken = null;
      };
      this.reset();

      var token = null;
      var isEventRegistered = false;
      var attempting = false;
      var href = null;

      this.check = function() {
        var protocol = $location.protocol() + '://';
        var host = $location.host();
        var port =
          $location.port() == '80' ? '' : ':' + $location.port();
        var path = window.location.pathname;
        if (path[path.length - 1] == '/') {
          path += 'dummy';
        }
        var urlParts = path.split('/');
        urlParts[urlParts.length - 1] = 'logged-in';
        var url = urlParts.join('/');

        var next = protocol + host + port + url;

        var check = authenticate.check(next);
        check.then(function(response) {
          attempting = false;
          token = response.token;
          that.authToken = token;
          that.isLoggedIn = true;
          that.name = response.profile.name;
          that.email = response.profile.email;
          that.avatar = response.profile.avatar_url;
          that.userId = response.profile.idhash;

          authorize.check(token, 'os.datastore')
            .then(function(permissionData) {
              that.permissionToken = permissionData.token;
              that.permissions = permissionData.permissions;
            })
            .catch(function(error) {
              return error;
            });
        })
        .catch(function(providers) {
          if (!isEventRegistered) {
            $window.addEventListener('focus', function() {
              if (!that.isLoggedIn && attempting) {
                that.check();
              }
            });
            isEventRegistered = true;
          }
          href = providers.google.url;
        });
      };
      this.check();

      this.login = function() {
        if (that.isLoggedIn || (href === null)) {
          return true;
        }
        attempting = true;
        authenticate.login(href, 'OS_Login');
      };

      this.logout = function() {
        if (that.isLoggedIn) {
          that.reset();
          authenticate.logout();
          if (href === null) {
            that.check();
          }
        }
      };

      return this;
    }
  ]);
