module.exports = {
  docs: [ {
      type: 'doc',
      id: 'markdown/introduction',
      label: 'Introduction',
    }, {
      type: 'doc',
      id: 'markdown/quick-start',
      label: 'Quick Start',
    }, {
      type: 'doc',
      id: 'markdown/configuration',
      label: 'Configuring',
    }, {
      type: 'category',
      label: 'Guides',
      collapsible: false,
      collapsed: false,
      items: [ {
        type: 'doc',
        id: 'markdown/guides/session',
        label: "Session"
      }, {
        collapsed: false,
        type: 'category',
        label: 'Entities',
        items: [ 
          'markdown/guides/entities/account', 
          'markdown/guides/entities/contract', 
          'markdown/guides/entities/json',
          'markdown/guides/entities/token' 
        ]
      }],
    }, {
      type: 'doc',
      id: 'markdown/playground',
      label: 'Playground',
    }
  ],
};