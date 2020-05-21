const $ = require('jquery');
import BpmnModeler from 'bpmn-js/lib/Modeler';

import propertiesPanelModule from 'bpmn-js-properties-panel';
import propertiesProviderModule from 'bpmn-js-properties-panel/lib/provider/camunda';


const holypaasModdleDescriptor = require('./bpmn-ext/bpmn-properties-panel-extended/descriptors/bpmn.json');
const camundaModdleDescriptor = require('camunda-bpmn-moddle/resources/camunda.json');
import camundaExtensionModule from 'camunda-bpmn-moddle/lib';
import customTranslate from './bpmn-ext/bpmn-properties-panel-extended/i18n/customTranslate';
const customTranslateModule = {
  translate: ['value', customTranslate]
};

import minimapModule from 'diagram-js-minimap';
import bpmnRules from 'bpmn-js/lib/features/rules';
import ContextPadModule from './bpmn-ext/bpmn-js/lib/features/context-pad';
import PaletteModule from './bpmn-ext/bpmn-js/lib/features/palette';
import BpmnRulesModule from './bpmn-ext/bpmn-js/lib/features/rules';


import {
  debounce
} from 'min-dash';

// import diagramXML from '../resources/newDiagram.bpmn';
const diagramXML = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn2:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:bpmn2="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" id="sample-diagram" targetNamespace="http://bpmn.io/schema/bpmn" xsi:schemaLocation="http://www.omg.org/spec/BPMN/20100524/MODEL BPMN20.xsd">
  <bpmn2:process id="Process_1" isExecutable="true">
    <bpmn2:startEvent id="StartEvent_1">
      <bpmn2:outgoing>Flow_0t5vfdy</bpmn2:outgoing>
    </bpmn2:startEvent>
    <bpmn2:task id="Activity_1wddx5t">
      <bpmn2:incoming>Flow_0t5vfdy</bpmn2:incoming>
    </bpmn2:task>
    <bpmn2:sequenceFlow id="Flow_0t5vfdy" sourceRef="StartEvent_1" targetRef="Activity_1wddx5t" />
  </bpmn2:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
      <bpmndi:BPMNEdge id="Flow_0t5vfdy_di" bpmnElement="Flow_0t5vfdy">
        <di:waypoint x="448" y="258" />
        <di:waypoint x="500" y="258" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNShape id="_BPMNShape_StartEvent_2" bpmnElement="StartEvent_1">
        <dc:Bounds x="412" y="240" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_1wddx5t_di" bpmnElement="Activity_1wddx5t">
        <dc:Bounds x="500" y="218" width="100" height="80" />
      </bpmndi:BPMNShape>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn2:definitions>`;

var container = $('#js-drop-zone');

var canvas = $('#js-canvas');

var bpmnModeler = new BpmnModeler({
  container: canvas,
  propertiesPanel: {
    parent: '#js-properties-panel'
  },
  additionalModules: [
    bpmnRules,
    propertiesPanelModule,
    propertiesProviderModule,
    customTranslateModule,
    camundaExtensionModule,
    minimapModule,
    // ContextPadModule,
    PaletteModule,
    BpmnRulesModule
  ],
  moddleExtensions: {
    camunda: camundaModdleDescriptor
  }
});
container.removeClass('with-diagram');

function createNewDiagram() {
  openDiagram(diagramXML);
}
function openXml(e) {

  const curFiles = e.target.files;
  const file = curFiles[0];
  if (file) {
    var reader = new FileReader();

    reader.readAsText(file, 'UTF-8');
    reader.onload = function (e) {
      var xml = this.result;
      openDiagram(xml);
    };
  }

}
function openDiagram(xml) {

  bpmnModeler.importXML(xml, function (err) {

    if (err) {
      container
        .removeClass('with-diagram')
        .addClass('with-error');

      container.find('.error pre').text(err.message);

      console.error(err);
    } else {
      container
        .removeClass('with-error')
        .addClass('with-diagram');
    }
  });
}

function saveSVG(done) {
  bpmnModeler.saveSVG(done);
}

function saveDiagram(done) {

  bpmnModeler.saveXML({ format: true }, function (err, xml) {
    done(err, xml);
  });
}

function registerFileDrop(container, callback) {

  function handleFileSelect(e) {
    e.stopPropagation();
    e.preventDefault();

    var files = e.dataTransfer.files;

    var file = files[0];

    var reader = new FileReader();

    reader.onload = function (e) {

      var xml = e.target.result;

      callback(xml);
    };

    reader.readAsText(file);
  }

  function handleDragOver(e) {
    e.stopPropagation();
    e.preventDefault();

    e.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
  }

  container.get(0).addEventListener('dragover', handleDragOver, false);
  container.get(0).addEventListener('drop', handleFileSelect, false);
}


////// file drag / drop ///////////////////////

// check file api availability
if (!window.FileList || !window.FileReader) {
  window.alert(
    'Looks like you use an older browser that does not support drag and drop. ' +
    'Try using Chrome, Firefox or the Internet Explorer > 10.');
} else {
  registerFileDrop(container, openDiagram);
}

// bootstrap diagram functions

$(function () {

  $('.js-create-diagram').click(function (e) {
    e.stopPropagation();
    e.preventDefault();

    createNewDiagram();
  });

  var downloadLink = $('#js-download-diagram');
  var downloadSvgLink = $('#js-download-svg');
  var openLink = $('#js-open-diagram');
  openLink.get(0).addEventListener('change', openXml);

  $('.buttons a').click(function (e) {
    if (!$(this).is('.active')) {
      e.preventDefault();
      e.stopPropagation();
    }
  });

  function setEncoded(link, name, data) {
    var encodedData = encodeURIComponent(data);

    if (data) {
      link.addClass('active').attr({
        'href': 'data:application/bpmn20-xml;charset=UTF-8,' + encodedData,
        'download': name
      });
    } else {
      link.removeClass('active');
    }
  }

  var exportArtifacts = debounce(function () {

    saveSVG(function (err, svg) {
      setEncoded(downloadSvgLink, getProcessId()+'.svg', err ? null : svg);
    });

    saveDiagram(function (err, xml) {
      setEncoded(downloadLink, getProcessId()+'.bpmn', err ? null : xml);
    });
  }, 500);

  bpmnModeler.on('commandStack.changed', exportArtifacts);


  function getProcessId() {
    let elementRegistry = bpmnModeler.get('elementRegistry');
    let process = elementRegistry.filter(function (s, gfx) {
      return s.type.toLowerCase() === 'bpmn:process';
    });
    return process[0].id;
  }
});
