module.exports = {
  docs: [ {
      type: 'doc',
      id: 'index',
      label: 'Introduction',
    }, {
      type: 'doc',
      id: 'quick-start',
      label: 'Quick Start',
    }, {
      type: 'doc',
      id: 'configuration',
      label: 'Configuring',
    }, {
      type: 'category',
      label: 'Guides',
      collapsible: false,
      collapsed: false,
      items: [ {
        type: 'doc',
        id: 'guides/session',
        label: "Session"
      }, {
        collapsed: false,
        type: 'category',
        label: 'Entities',
        items: [ 
          'guides/entities/account', 
          'guides/entities/contract', 
          'guides/entities/json',
          'guides/entities/token' 
        ]
      }],
    }, {
      type: 'doc',
      id: 'playground',
      label: 'Playground',
    }
  ],
};