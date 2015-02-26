(function() {
  var picker;

  picker = angular.module('daterangepicker', []);

  picker.value('dateRangePickerConfig', {
    separator: ' - ',
    format: 'YYYY-MM-DD'
  });

  picker.directive('dateRangePicker', [
    '$compile', '$timeout', '$parse', 'dateRangePickerConfig', function($compile, $timeout, $parse, defaults) {
      return {
        require: 'ngModel',
        restrict: 'A',
        scope: {
          dateMin: '=min',
          dateMax: '=max',
          opts: '=options'
        },
        link: function($scope, element, attrs, modelCtrl) {
          var customOpts, el, opts, _formatted, _getPicker, _init, _validateMax, _validateMin;
          el = jQuery(element);
          customOpts = $parse(attrs.dateRangePicker)($scope, {});
          opts = angular.extend(defaults, customOpts);
          _formatted = function(viewVal) {
            var f;
            f = function(date) {
              if (!moment.isMoment(date)) {
                return moment(date).format(opts.format);
              }
              return date.format(opts.format);
            };
            return [f(viewVal.startDate), f(viewVal.endDate)].join(opts.separator);
          };
          _validateMin = function(min, start) {
            var valid;
            min = moment(min);
            start = moment(start);
            valid = min.isBefore(start) || min.isSame(start, 'day');
            modelCtrl.$setValidity('min', valid);
            return valid;
          };
          _validateMax = function(max, end) {
            var valid;
            max = moment(max);
            end = moment(end);
            valid = max.isAfter(end) || max.isSame(end, 'day');
            modelCtrl.$setValidity('max', valid);
            return valid;
          };
          modelCtrl.$formatters.unshift(function(val) {
            if (val && val.startDate && val.endDate) {
              picker = _getPicker();
              picker.setStartDate(val.startDate);
              picker.setEndDate(val.endDate);
              return val;
            }
            return '';
          });
          modelCtrl.$parsers.unshift(function(val) {
            if (!angular.isObject(val) || !(val.hasOwnProperty('startDate') && val.hasOwnProperty('endDate'))) {
              return modelCtrl.$modelValue;
            }
            if ($scope.dateMin && val.startDate) {
              _validateMin($scope.dateMin, val.startDate);
            } else {
              modelCtrl.$setValidity('min', true);
            }
            if ($scope.dateMax && val.endDate) {
              _validateMax($scope.dateMax, val.endDate);
            } else {
              modelCtrl.$setValidity('max', true);
            }
            return val;
          });
          modelCtrl.$isEmpty = function(val) {
            return !val || (val.startDate === null || val.endDate === null);
          };
          modelCtrl.$render = function() {
            if (!modelCtrl.$viewValue) {
              return el.val('');
            }
            if (modelCtrl.$viewValue.startDate === null) {
              return el.val('');
            }
            return el.val(_formatted(modelCtrl.$viewValue));
          };
          _init = function() {
            return el.daterangepicker(opts, function(start, end, label) {
              return $timeout(function() {
                return $scope.$apply(function() {
                  modelCtrl.$setViewValue({
                    startDate: start,
                    endDate: end
                  });
                  return modelCtrl.$render();
                });
              });
            });
          };
          _getPicker = function() {
            return el.data('daterangepicker');
          };
          _init();
          el.change(function() {
            if (jQuery.trim(el.val()) === '') {
              return $timeout(function() {
                return $scope.$apply(function() {
                  return modelCtrl.$setViewValue({
                    startDate: null,
                    endDate: null
                  });
                });
              });
            }
          });
          if (attrs.min) {
            $scope.$watch('dateMin', function(date) {
              if (date) {
                if (!modelCtrl.$isEmpty(modelCtrl.$viewValue)) {
                  _validateMin(date, modelCtrl.$viewValue.startDate);
                }
                opts['minDate'] = moment(date);
              } else {
                opts['minDate'] = false;
              }
              return _init();
            });
          }
          if (attrs.max) {
            $scope.$watch('dateMax', function(date) {
              if (date) {
                if (!modelCtrl.$isEmpty(modelCtrl.$viewValue)) {
                  _validateMax(date, modelCtrl.$viewValue.endDate);
                }
                opts['maxDate'] = moment(date);
              } else {
                opts['maxDate'] = false;
              }
              return _init();
            });
          }
          if (attrs.options) {
            return $scope.$watch('opts', function(newOpts) {
              opts = angular.extend(opts, newOpts);
              return _init();
            });
          }
        }
      };
    }
  ]);

}).call(this);