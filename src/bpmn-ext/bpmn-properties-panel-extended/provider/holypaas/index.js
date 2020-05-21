module.exports = {
    __depends__: [
        require('bpmn-js-properties-panel/lib/provider/camunda/element-templates'),
        require('diagram-js/lib/i18n/translate')
    ],
    __init__: [ 'propertiesProvider' ],
    propertiesProvider: [ 'type', require('./HolyPaasPropertiesProvider') ]
};