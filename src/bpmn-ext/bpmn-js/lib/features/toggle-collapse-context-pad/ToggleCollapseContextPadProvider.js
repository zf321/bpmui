import inherits from 'inherits';
import ContextPadProvider from 'bpmn-js/lib/features/context-pad/ContextPadProvider';

import {
  isAny
} from 'bpmn-js/lib/features/modeling/util/ModelingUtil'; //'../modeling/util/ModelingUtil';

import {
  assign,
  bind
} from 'min-dash';


/**
 * A provider for BPMN 2.0 elements context pad
 */
export default function ToggleCollapseContextPadProvider(injector, contextPad, modeling, translate, canvas) {

  contextPad.registerProvider(this);
  this._contextPad = contextPad;
  this._modeling = modeling;
  this._translate = translate;
  this._canvas = canvas;
}

inherits(ToggleCollapseContextPadProvider, ContextPadProvider);

ToggleCollapseContextPadProvider.$inject = [
  'injector',
  'contextPad',
  'modeling',
  'translate',
  'canvas'
];

ToggleCollapseContextPadProvider.prototype.getContextPadEntries = function (element) {
  var contextPad = this._contextPad,
    modeling = this._modeling,
    translate = this._translate,
    canvas = this._canvas;

  var actions = {};
  var businessObject = element.businessObject;


  if (isAny(businessObject, ['bpmn:SubProcess'])) {
    if (element.collapsed) {
      assign(actions, {
        'action': {
          group: 'action',
          className: 'bpmn-icon-subprocess-expanded',
          title: '展开子流程',
          action: {
            click: function (e) {
              modeling.toggleCollapse(element);
            }
          }
        }
      });
    } else {
      assign(actions, {
        'action': {
          group: 'action',
          className: 'bpmn-icon-subprocess-collapsed',
          title: '折叠子流程',
          action: {
            click: function (e) {
              modeling.toggleCollapse(element);
            }
          }
        }
      });
    }
  }

  return actions;
}
