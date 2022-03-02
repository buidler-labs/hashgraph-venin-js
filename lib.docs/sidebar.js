/* eslint-env node */

module.exports = {
  docs: [ {
    id: 'markdown/introduction',
    label: 'Introduction',
    type: 'doc',
  }, {
    id: 'markdown/quick-start',
    label: 'Quick Start',
    type: 'doc',
  }, {
    id: 'markdown/configuration',
    label: 'Configuring',
    type: 'doc',
  }, {
    collapsed: false,
    collapsible: false,
    items: [ {
      id: 'markdown/guides/bundling',
      label: "Bundling",
      type: 'doc',
    }, {
      id: 'markdown/guides/session',
      label: "Session",
      type: 'doc',
    }, {
      collapsed: false,
      items: [ 
        'markdown/guides/entities/account', 
        'markdown/guides/entities/contract', 
        'markdown/guides/entities/json',
        'markdown/guides/entities/token', 
      ],
      label: 'Entities',
      type: 'category',
    }],
    label: 'Guides',
    type: 'category',
  }, {
    id: 'markdown/changelog',
    label: 'Changelog',
    type: 'doc',
  }, {
    id: 'markdown/playground',
    label: 'Playground',
    type: 'doc',
  }],
};
