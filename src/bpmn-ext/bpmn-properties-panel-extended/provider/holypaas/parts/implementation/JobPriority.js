'use strict';

var entryFactory = require('bpmn-js-properties-panel/lib/factory/EntryFactory');

var cmdHelper = require('bpmn-js-properties-panel/lib/helper/CmdHelper');

module.exports = function (element, bpmnFactory, options, translate) {

    var getBusinessObject = options.getBusinessObject;

    var jobPriorityEntry = entryFactory.textField({
        id: 'jobPriority',
        label: translate('Job Priority'),
        modelProperty: 'jobPriority',

        get: function (element, node) {
            var bo = getBusinessObject(element);
            return {
                jobPriority: bo.get('camunda:jobPriority')
            };
        },

        set: function (element, values) {
            var bo = getBusinessObject(element);
            return cmdHelper.updateBusinessObject(element, bo, {
                'camunda:jobPriority': values.jobPriority || undefined
            });
        },

        validate: function (element, values, node) {
            if (!values.jobPriority)
                return {};
            if (!Number.isInteger(Number(values.jobPriority)))
                return { jobPriority: translate('Must be a positive integer') };
            else
                return {};
        }

    });

    return [jobPriorityEntry];

};
