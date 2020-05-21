'use strict';

var entryFactory = require('bpmn-js-properties-panel/lib/factory/EntryFactory'),
  getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject,
  utils = require('bpmn-js-properties-panel/lib/Utils'),
  cmdHelper = require('bpmn-js-properties-panel/lib/helper/CmdHelper'),
  is = require('bpmn-js/lib/util/ModelUtil').is;


module.exports = function (group, element, translate, options) {

  var description = options && options.description;

  // Id
  group.entries.push(entryFactory.validationAwareTextField({
    id: 'id',
    label: translate('Id'),
    description: description && translate(description),
    modelProperty: 'id',
    disabled: function (element) {
      if (is(element, 'bpmn:Process'))
        return true;
      return false;
    },
    getProperty: function (element) {
      return getBusinessObject(element).id;
    },
    setProperty: function (element, properties) {

      element = element.labelTarget || element;

      return cmdHelper.updateProperties(element, properties);
    },
    validate: function (element, values) {
      var idValue = values.id;

      var bo = getBusinessObject(element);

      var idError = utils.isIdValid(bo, idValue);

      return idError ? {
        id: idError
      } : {};
    }
  }));

};
