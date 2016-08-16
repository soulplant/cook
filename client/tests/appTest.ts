/// <reference path="typings/tsd.d.ts" />

import '../src/app';

describe('AppCtrl', function() {
  beforeEach(() => angular.mock.module('app'));
  var $controller = null;
  var $rootScope = null;
  beforeEach(angular.mock.inject(function($injector) {
    $controller = $injector.get('$controller');
    $rootScope = $injector.get('$rootScope');
  }));

  it('loads the controller', () => {
    expect($controller).not.toBe(null);
    var scope = $rootScope.$new();
    var ctrl = $controller('AppCtrl', {$scope: scope});
    expect(scope.enabled.length).toBe(0);
  });
});
