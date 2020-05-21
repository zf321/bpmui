'use strict';

var is = require('bpmn-js/lib/util/ModelUtil').is,
  getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject,
  entryFactory = require('bpmn-js-properties-panel/lib/factory/EntryFactory');

var domClasses = require('min-dom').classes;


module.exports = function (group, element, translate, eventBus) {
  if (is(element, 'camunda:Assignable')) {

    // error message /////////////////////////////////////////
    group.entries.push({
      id: 'userTask-errorMessage',
      html: '<div data-show="isValid">' +
        '<span class="bpp-icon-warning"></span> ' +
        translate('Must provide either Assignee or Candidate Users') +
        '</div>',

      isValid: function (element, node, notification, scope) {
        var bo = getBusinessObject(element);
        var assignee = bo.assignee;
        var candidateUsers = bo.candidateUsers;

        var isValid = (!assignee || assignee.replace(/^(\s|\u00A0)+/,'').replace(/(\s|\u00A0)+$/,'').length === 0) 
          && (!candidateUsers || candidateUsers.replace(/^(\s|\u00A0)+/,'').replace(/(\s|\u00A0)+$/,'').length === 0);


        domClasses(node).toggle('bpp-hidden', !isValid);
        domClasses(notification).toggle('bpp-error-message', isValid);

        return isValid;
      }
    });


    // Assignee
    group.entries.push(entryFactory.textField({
      id: 'assignee',
      label: translate('Assignee'),
      modelProperty: 'assignee',

      buttonAction: {
        name: 'add',
        method: function (element, inputNode) {
          var bo = getBusinessObject(element);
          eventBus.fire('extended.expression.edit', {
            type: 'assignee',
            data: {
              element,
              expression: {
                value: bo.assignee
              }
            }
          });
        }
      },

      buttonShow: {
        name: 'show',
        method: function (element, inputNode) {
          return true;
        }
      }
    }));

    // Candidate Users
    group.entries.push(entryFactory.textField({
      id: 'candidateUsers',
      label: translate('Candidate Users'),
      modelProperty: 'candidateUsers',

      buttonAction: {
        name: 'add',
        method: function (element, inputNode) {
          var bo = getBusinessObject(element);
          eventBus.fire('extended.expression.edit', {
            type: 'candidateUsers',
            data: {
              element,
              expression: {
                value: bo.candidateUsers
              }
            }
          });
        }
      },

      buttonShow: {
        name: 'show',
        method: function (element, inputNode) {
          return true;
        }
      }
    }));

    // // Candidate Groups
    // group.entries.push(entryFactory.textField({
    //   id : 'candidateGroups',
    //   label : translate('Candidate Groups'),
    //   modelProperty : 'candidateGroups'
    // }));

    // // Due Date
    // group.entries.push(entryFactory.textField({
    //   id : 'dueDate',
    //   description : translate('The due date as an EL expression (e.g. ${someDate} or an ISO date (e.g. 2015-06-26T09:54:00)'),
    //   label : translate('Due Date'),
    //   modelProperty : 'dueDate'
    // }));

    // // FollowUp Date
    // group.entries.push(entryFactory.textField({
    //   id : 'followUpDate',
    //   description : translate('The follow up date as an EL expression (e.g. ${someDate} or an ' +
    //                 'ISO date (e.g. 2015-06-26T09:54:00)'),
    //   label : translate('Follow Up Date'),
    //   modelProperty : 'followUpDate'
    // }));

    // // priority
    // group.entries.push(entryFactory.textField({
    //   id : 'priority',
    //   label : translate('Priority'),
    //   modelProperty : 'priority'
    // }));
  }
};
