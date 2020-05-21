'use strict';

var variableMaps = require('./implementation/VariableMaps'),
    elementHelper = require('bpmn-js-properties-panel/lib/helper/ElementHelper'),
    cmdHelper = require('bpmn-js-properties-panel/lib/helper/CmdHelper');


module.exports = function(group, element, bpmnFactory, translate) {

  var variableMapsEntry = variableMaps(element, bpmnFactory, {
    id: 'variableMaps',
    modelProperties: [ 'name', 'value' ],
    labels: [ translate('VariableName'), translate('VariableType') ],

    getParent: function(element, node, bo) {
      return bo.variableMaps;
    },

    createParent: function(element, bo) {
      var parent = elementHelper.createElement('bpmn:VariableMaps', { values: [] }, bo, bpmnFactory);
      var cmd = cmdHelper.updateBusinessObject(element, bo, { variableMaps: parent });
      return {
        cmd: cmd,
        parent: parent
      };
    }
  }, translate);

  if (variableMapsEntry) {
    group.entries.push(variableMapsEntry);
  }

};
