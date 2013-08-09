'use strict';

/* Controllers */

angular.module('myApp.controllers', ['ui.bootstrap'])
    .controller('TreeContoller', ['$scope', '$http', 'workspaceFactory', function($scope, $http, workspaceFactory) {

        $scope.loader = null;
        $scope.isCollapsed = false;
        $scope.clipboard = null;
        $scope.history = null;
        $scope.redoDisabled = true;
        $scope.undoDisabled = true;

        $scope.update = function() {
          var e, i, _i, _len, _ref;
          _ref = $scope.path;
          for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
            e = _ref[i];
            e.pos = i;
          }
          return console.log(['Updated', $scope.path]);
        };

        $scope.sortableOptions = {
            update: $scope.update,
            axis: 'y',
            connectWith: '.ui-sortable'
        };

        $scope.init = function() {
            $http.get('../api/index.php/pathversions/init')
                .success(function() {
                    $http.get('tree.json')
                        .success(function(data) {
                            $scope.json = data;
                            updateDB(data);
                        }
                    );
                }
            );

        };

        $scope.undo = function(id) {
            $http.get('../api/index.php/pathversions/undo/' + id) //TODO prefix path comme dans la video d'angular
                .success(function(data) {
                    if(data != 'end') {
                        workspaceFactory.setWorkspace(data);
                        $scope.json = workspaceFactory.getWorkspace();
                    } else {
                        $scope.undoDisabled = true;
                    }

                    $scope.redoDisabled = false;
                }
            );
        };

        $scope.redo = function(id) {
            $http.get('../api/index.php/pathversions/redo/' + id) //TODO prefix path comme dans la video d'angular
                .success(function(data) {
                    if(data != 'end') {
                        workspaceFactory.setWorkspace(data);
                        $scope.json = workspaceFactory.getWorkspace();
                    } else {
                        $scope.redoDisabled = true;
                    }
                    $scope.undoDisabled = false;
                }
            );
        };

        $scope.rename = function() {
            updateDB($scope.json);
        };

        $scope.remove = function(step) {
            function walk(path) {
                var children = path.children,
                    i;

                if (children) {
                    i = children.length;
                    while (i--) {
                        if (children[i] === step) {
                            return children.splice(i, 1);
                        } else {
                            walk(children[i]);
                        }
                    }
                }
            }

            walk($scope.json.workspace.path.steps[0]);

            updateDB($scope.json);
        };

        $scope.removeChildren = function(activity) {
            activity.children = [];

            updateDB($scope.json);
        };

        $scope.copy = function(activity) {
            $scope.clipboard = activity;
        };

        $scope.paste = function(activity) {
            $scope.loader = 'Loading...';
            // Clone voir : http://stackoverflow.com/questions/122102/most-efficient-way-to-clone-an-object
            var activityCopy = jQuery.extend(true, {}, $scope.clipboard);

            activityCopy.name = activityCopy.name + '_copy';

            activity.children.push(activityCopy);
            updateDB($scope.json);
        };

        $scope.addChild = function(activity) {
            var post = activity.children.length + 1;
            var newName = activity.name + '-' + post;

            activity.children.push(
                {
                    id         : null,
                    name       : 'Step',
                    parentId   : null,
                    type       : 'seq',
                    expanded   : true,
                    dataType   : null,
                    dataId     : null,
                    templateId : null,
                    children   : []
                }
            );

            updateDB($scope.json);
        };

        $scope.saveTemplate = function(activity) {
            // TODO
            // $http ... etc
        };

        var updateDB = function(workspace) {
            $http
                .post('../api/index.php/pathversions', workspace) //TODO prefix path comme dans la video d'angular
                .success(
                    function(data) {
                        console.log(data);
                        workspaceFactory.setWorkspace(data);
                        $scope.json = workspaceFactory.getWorkspace();
                        $scope.undoDisabled = false;
                        $scope.redoDisabled = true;
                        $scope.loader = null; //TODO boolean
                    }
                );
        };

    }]
);