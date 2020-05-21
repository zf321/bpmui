'use strict';

var is = require('bpmn-js/lib/util/ModelUtil').is,
  getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject;

var extensionElementsEntry = require('bpmn-js-properties-panel/lib/provider/camunda/parts/implementation/ExtensionElements'),
  extensionElementsHelper = require('bpmn-js-properties-panel/lib/helper/ExtensionElementsHelper'),
  cmdHelper = require('bpmn-js-properties-panel/lib/helper/CmdHelper'),
  elementHelper = require('bpmn-js-properties-panel/lib/helper/ElementHelper'),
  ImplementationTypeHelper = require('bpmn-js-properties-panel/lib/helper/ImplementationTypeHelper'),
  entryFactory = require('bpmn-js-properties-panel/lib/factory/EntryFactory');


var domQuery = require('min-dom').query,
  domClosest = require('min-dom').closest,
  domify = require('min-dom').domify,
  domClear = require('min-dom').clear,
  forEach = require('lodash/forEach');



module.exports = function (group, element, bpmnFactory, elementRegistry, translate, eventBus, canvas, overlays, selection, modeling, bpmnRules) {

  var bo = getBusinessObject(element);
  var id = "sequence-target";
  var defaultSize = 5;

  if (!is(element, 'bpmn:SequenceFlow')) {
    return;
  }

  var initSelectionSize = function (selectBox, optionsLength) {
    selectBox.size = optionsLength > defaultSize ? optionsLength : defaultSize;
  };

  var createOption = function (value) {
    return '<option value="' + value.gatewayOutgoingValue + '" data-value data-name="gatewayOutgoingValue">' + '[' + value.text + ']' + value.gatewayOutgoingValue + '</option>';
  };


  group.entries.push(entryFactory.selectBox({
    id: 'sequence-target',
    label: translate('Target'),
    modelProperty: 'sequenceTarget',
    emptyParameter: false,

    get: function (element, node) {
      bo = bo || getBusinessObject(element);
      return {
        sequenceTarget: bo.targetRef.id
      };
    },

    set: function (element, values, node) {
      bo = bo || getBusinessObject(element);

      var targetRef = elementRegistry.get(values.sequenceTarget);

      if (targetRef) {
        var newWaypoints = [element.waypoints[0], {
          x: targetRef.x,
          y: targetRef.y
        }];
        modeling.reconnectEnd(element, targetRef, newWaypoints);
      }
    },

    selectOptions: function (element, node) {
      var connection = elementRegistry.get(element.id);
      var source = elementRegistry.get(connection.businessObject.sourceRef.id);
      return elementRegistry.filter((e) => {
          var target = elementRegistry.get(e.id);
          var result = bpmnRules.canConnect(source, target, connection);
          return result;
        })
        .map(e => {
          return {
            name: '[' + (e.businessObject.name || e.businessObject.id) + ']' + e.businessObject.id,
            value: e.businessObject.id
          };
        });
    }
  }));

  group.entries.push(entryFactory.selectBox({
    id: 'sequence-source',
    label: translate('Source'),
    modelProperty: 'sequenceSource',
    emptyParameter: false,

    get: function (element, node) {
      bo = bo || getBusinessObject(element);
      return {
        sequenceSource: bo.sourceRef.id
      };
    },

    set: function (element, values, node) {
      bo = bo || getBusinessObject(element);

      var sourceRef = elementRegistry.get(values.sequenceSource);

      if (sourceRef) {
        var newWaypoints = [{
          x: sourceRef.x,
          y: sourceRef.y
        }, element.waypoints[element.waypoints.length - 1]];
        modeling.reconnectStart(element, sourceRef, newWaypoints);
      }
    },

    selectOptions: function (element, node) {
      var connection = elementRegistry.get(element.id);
      var target = elementRegistry.get(connection.businessObject.targetRef.id);
      return elementRegistry.filter((e) => {
          var source = elementRegistry.get(e.id);
          var result = bpmnRules.canConnect(source, target, connection);
          return result;
        })
        .map(e => {
          return {
            name: '[' + (e.businessObject.name || e.businessObject.id) + ']' + e.businessObject.id,
            value: e.businessObject.id
          };
        });
    }

  }));
}
