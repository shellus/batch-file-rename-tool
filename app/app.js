'use strict';
const require = module.require('electron').remote.require;
const electron = require('electron');
const fs = require('fs');
const dialog = require('electron').dialog;

var app = angular.module('app', [
    'ui.bootstrap'
]);
app.controller('IndexController', function ($scope, $sce) {

    //$scope.path = 'C:\\Users\\shellus\\Documents\\txt';
    $scope.path = '';
    $scope.files = [];
    $scope.regexp_content = '';
    $scope.replace_content = '';


    $scope.selectPath = function () {
        dialog.showOpenDialog(null, {
            title: '选择文件夹',
            properties: ['openDirectory', 'multiSelections']
        }, function (optional) {
            $scope.$apply(function () {
                $scope.path = optional ? optional[0] : '';
                if(optional){
                    $scope.findFile();
                }
            });

        });
    };
    $scope.findFile = function () {

        try {
            var stat = fs.lstatSync($scope.path);
        }catch (e){
            return ;
        }

        if(!stat.isDirectory()) return ;


        fs.readdir($scope.path, function (err, paths) {
            paths.filter(function (path) {
                path = $scope.path + '\\' + path;
                return fs.lstatSync(path).isFile();
            });
            paths = paths.map(function (path) {
                return {
                    origin_filename: $sce.trustAsHtml(path),
                    filename: $sce.trustAsHtml(path),
                    display_name:$sce.trustAsHtml(path),
                    path: $sce.trustAsHtml($scope.path + '\\' + path)
                };
            });

            $scope.$apply(function () {

                $scope.files = paths
            });
        })
    };
    $scope.regexpChange = function(){
        var regexp = $scope.regexp_content;


        $scope.files.map(function (file) {
            file.display_name = $sce.trustAsHtml(file.filename.valueOf().replace(new RegExp(regexp,'g'), '<span style=\"color: red;\">'+regexp+'</span>'));
            return file;
        });
    };
    $scope.replace = function () {
        var replace = $scope.replace_content;
        var regexp = $scope.regexp_content;
        if(regexp === '')return;

        $scope.files.map(function (file) {
            file.filename = $sce.trustAsHtml(file.filename.valueOf().replace(new RegExp(regexp,'g'), replace));
            if(file.filename.valueOf() !== file.origin_filename.valueOf()){
                fs.rename($scope.path + '\\' + file.origin_filename.valueOf(),
                    $scope.path + '\\' + file.filename.valueOf(),
                    function (err) {
                        if(err===null){
                            file.origin_filename = file.filename;
                        }else{
                            alert(err);
                        }

                    })
            }
            return file;
        });
        $scope.regexpChange();
    }

});
