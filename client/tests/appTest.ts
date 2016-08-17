/// <reference path="../typings/tsd.d.ts" />

import { mergeQuantities, mergeIngredients } from '../src/app';

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

describe('mergeQuantities', function() {
  it('merges unnamed ingredients correctly', function() {
    expect(mergeQuantities([[2, '']])).toEqual([[2, '']]);
  });
});

describe('mergeIngredients', function() {
  it('merges ingredients correctly', function() {
    var eggs = {
      name: 'egg',
      quantity: [2, ''],
    };
    var il = mergeIngredients([eggs, eggs]);
    expect(il[0].quantities).toEqual([[4, '']]);
  })
});
