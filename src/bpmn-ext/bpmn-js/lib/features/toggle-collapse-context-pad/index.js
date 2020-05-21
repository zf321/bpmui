import DirectEditingModule from 'diagram-js-direct-editing';
import ContextPadModule from 'diagram-js/lib/features/context-pad';
import SelectionModule from 'diagram-js/lib/features/selection';
import ConnectModule from 'diagram-js/lib/features/connect';
import CreateModule from 'diagram-js/lib/features/create';

import ToggleCollapseContextPadProvider from './ToggleCollapseContextPadProvider';

export default {
  __depends__: [
    // DirectEditingModule,
    ContextPadModule//,
    // SelectionModule,
    // ConnectModule,
    // CreateModule
  ],
  __init__: ['toggleCollapseContextPadProvider'],
  toggleCollapseContextPadProvider: ['type', ToggleCollapseContextPadProvider]
};
