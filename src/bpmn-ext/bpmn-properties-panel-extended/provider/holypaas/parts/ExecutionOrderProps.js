'use strict';

var is = require('bpmn-js/lib/util/ModelUtil').is,
  isAny = require('bpmn-js/lib/features/modeling/util/ModelingUtil').isAny,
  getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject,
  cmdHelper = require('bpmn-js-properties-panel/lib/helper/CmdHelper'),
  elementHelper = require('bpmn-js-properties-panel/lib/helper/ElementHelper'),
  eventDefinitionHelper = require('bpmn-js-properties-panel/lib/helper/EventDefinitionHelper'),
  script = require('bpmn-js-properties-panel/lib/provider/camunda/parts/implementation/Script')('language', 'body', true);
var domQuery = require('min-dom').query,
  domClosest = require('min-dom').closest,
  domify = require('min-dom').domify,
  domClear = require('min-dom').clear,
  forEach = require('lodash/forEach');

var getBoundingBox = require('diagram-js/lib/util/Elements').getBBox;


function getSelectBox(node, id) {
  var currentTab = domClosest(node, 'div.bpp-properties-tab');
  var query = 'select[name=selectedGatewayOutgoing]' + (id ? '[id=cam-gateway-' + id + ']' : '');
  return domQuery(query, currentTab);
}

function getSelected(node, id) {
  var selectBox = getSelectBox(node, id);
  if (selectBox)
    return {
      box: selectBox,
      value: selectBox.value,
      idx: selectBox.selectedIndex,
      length: selectBox.options.length
    };
  return null;
}

function orderSelectBoxOptions(node, id, from, to) {
  var selectBox = getSelectBox(node, id);
  if (!selectBox)
    return;
  if (selectBox.selectedIndex == -1)
    return;
  if (from == to)
    return;
  var start = Math.min(from, to);
  var end = Math.max(from, to);

  var options = new Array(selectBox.options.length);
  if (from > to) {
    for (var i = 0; i < selectBox.options.length; i++) {
      if (i < start)
        options[i] = selectBox.options[i];
      else if (i == start)
        options[i] = selectBox.options[end];
      else if (i <= end)
        options[i] = selectBox.options[i - 1];
      else
        options[i] = selectBox.options[i];

    }
  } else {
    for (var i = selectBox.options.length - 1; i >= 0; i--) {
      if (i > end)
        options[i] = selectBox.options[i];
      else if (i == end)
        options[i] = selectBox.options[start];
      else if (i >= start)
        options[i] = selectBox.options[i + 1];
      else
        options[i] = selectBox.options[i];
    }
  }

  domClear(selectBox);
  forEach(options, (o) => {
    selectBox.appendChild(o);
  });
}

function orderedOutgoing(bo, from, to) {
  if (!bo)
    return;
  if (from == to)
    return;
  var start = Math.min(from, to);
  var end = Math.max(from, to);
  var outgoing = bo.outgoing;
  if (!outgoing)
    return;
  if (from > to) {
    while (end > start) {
      var tmp = outgoing[end - 1];
      outgoing[end - 1] = outgoing[end];
      outgoing[end] = tmp;
      end = end - 1;
    }
  } else {
    while (start < end) {
      var tmp = outgoing[start + 1];
      outgoing[start + 1] = outgoing[start];
      outgoing[start] = tmp;
      start = start + 1;
    }
  }
}

function clearOverlays(overlays) {
  overlays.remove({
    type: 'exclusivegateway-outgoing'
  });
}

module.exports = function (group, element, bpmnFactory, elementRegistry, translate, eventBus, canvas, overlays,selection) {

  var bo = getBusinessObject(element);
  var id = "outgoing";
  var label = translate('Outgoing');
  var defaultSize = 5;
  var overlayId = null;

  if (!bo) {
    clearOverlays(overlays);
    return;
  }

  if (!is(element, 'bpmn:ExclusiveGateway')) {
    clearOverlays(overlays);
    return;
  }


  var initSelectionSize = function (selectBox, optionsLength) {
    selectBox.size = optionsLength > defaultSize ? optionsLength : defaultSize;
  };

  var createOption = function (value) {
    return '<option value="' + value.gatewayOutgoingValue + '" data-value data-name="gatewayOutgoingValue">' + '[' + value.text + ']' + value.gatewayOutgoingValue + '</option>';
  };

  var selectionChanged = function (element, node, event, scope) {
    var box = getSelected(node, id);
    var seq = elementRegistry.get(box.value);
    resetOverlay(seq);
    centerViewbox(seq);
  };

  var resetOverlay = function (element) {
    overlays.remove({
      type: 'exclusivegateway-outgoing'
    });

    if (element) {
      var box = getBoundingBox(element);
      var overlay = constructOverlay(box);
      overlayId = overlays.add(element, 'exclusivegateway-outgoing', overlay);
    }
  };

  var centerViewbox = function (element) {
    var viewbox = canvas.viewbox();

    var box = getBoundingBox(element);

    var newViewbox = {
      x: (box.x + box.width / 2) - viewbox.outer.width / 2,
      y: (box.y + box.height / 2) - viewbox.outer.height / 2,
      width: viewbox.outer.width,
      height: viewbox.outer.height
    };

    canvas.viewbox(newViewbox);

    canvas.zoom(viewbox.scale);
  };

  var constructOverlay = function (box) {

    var offset = 6;
    var w = box.width + offset * 2;
    var h = box.height + offset * 2;

    var styles = [
      'width: ' + w + 'px',
      'height: ' + h + 'px'
    ].join('; ');

    return {
      position: {
        bottom: h - offset,
        right: w - offset
      },
      show: true,
      html: '<div style="' + styles + '" class="djs-search-overlay"></div>'
    };
  };


  group.entries.push({
    id: id,
    label: label,
    modelProperty: '',
    html: '<div class="bpp-row bpp-element-list" ' + '>' +
      '<label for="cam-gateway-' + id + '">' + label + '</label>' +
      '<div class="bpp-field-wrapper">' +
      '<select id="cam-gateway-' + id + '"' +
      'name="selectedGatewayOutgoing" ' +
      'size="' + defaultSize + '" ' +
      'data-list-entry-container ' +
      'data-on-change="selectElement" >' +
      '</select>' +
      '<button class="top" ' +
      'id="cam-gateway-top-' + id + '" ' +
      'data-action="topElement" >' +
      '<span class="fa fa-angle-double-up top"></span>' +
      '</button>' +
      '<button class="up" ' +
      'id="cam-gateway-up-' + id + '" ' +
      'data-action="upElement" >' +
      '<span class="fa fa-angle-up"></span>' +
      '</button>' +
      '<button class="down" ' +
      'id="cam-gateway-down-' + id + '" ' +
      'data-action="downElement" >' +
      '<span class="fas fa-angle-down"></span>' +
      '</button>' +
      '<button class="bottom" ' +
      'id="cam-gateway-bottom-' + id + '" ' +
      'data-action="bottomElement" >' +
      '<span class="fas fa-angle-double-down"></span>' +
      '</button>' +
      '<button class="crosshairs" ' +
      'id="cam-gateway-crosshairs-' + id + '" ' +
      'data-action="crosshairsElement" >' +
      '<span class="fas fa-crosshairs"></span>' +
      '</button>' +
      '</div>' +
      '</div>',

    get: function (element, node) {

      var result = [];
      forEach(bo.outgoing, function (elem) {
        result.push({
          gatewayOutgoingValue: elem.id,
          text: elem.name ? elem.name : ''
        });
      });

      var selectBox = getSelectBox(node.parentNode, id);
      initSelectionSize(selectBox, result.length);

      return result;

    },

    set: function (element, values, containerElement) {

      bo = bo || getBusinessObject(element);
      var commands = [];
      var outgoing = bo.outgoing;
      if (!outgoing)
        commands.push(cmdHelper.updateBusinessObject(element, bo, {
          outgoing: outgoing
        }));
      return commands;
    },

    createListEntryTemplate: function (value, index, selectBox) {
      initSelectionSize(selectBox, selectBox.options.length + 1);
      // return createOption(value.extensionElementValue);
      return createOption(value);
    },


    topElement: function (element, node) {
      var box = getSelected(node, id);
      if (!box)
        return false;
      if (box.idx <= 0)
        return false;
      orderSelectBoxOptions(node, id, box.idx, 0);
      orderedOutgoing(bo, box.idx, 0);
      return true;
    },

    upElement: function (element, node) {
      var box = getSelected(node, id);
      if (!box)
        return false;
      if (box.idx <= 0)
        return false;
      orderSelectBoxOptions(node, id, box.idx, box.idx - 1);
      orderedOutgoing(bo, box.idx, box.idx - 1);
      return true;
    },

    downElement: function (element, node) {
      var box = getSelected(node, id);
      if (!box)
        return false;
      if (box.idx < 0 || box.idx >= box.length - 1)
        return false;
      orderSelectBoxOptions(node, id, box.idx, box.idx + 1);
      orderedOutgoing(bo, box.idx, box.idx + 1);
      return true;
    },

    bottomElement: function (element, node) {
      var box = getSelected(node, id);
      if (!box)
        return false;
      if (box.idx < 0 || box.idx >= box.length - 1)
        return false;
      orderSelectBoxOptions(node, id, box.idx, box.length - 1);
      orderedOutgoing(bo, box.idx, box.length - 1);
      return true;
    },

    crosshairsElement: function (element, node) {
      var box = getSelected(node, id);
      if (!box)
        return false;
      if (box.idx < 0)
        return false;
      var seq = elementRegistry.get(box.value);      
      selection.select(seq);
    },

    selectElement: selectionChanged

  });
};
