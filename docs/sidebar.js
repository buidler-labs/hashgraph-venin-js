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
      label: 'API',
      collapsible: false,
      collapsed: false,
      items: [ {
        type: 'doc',
        id: 'api/session',
        label: "Session"
      }, {
        type: 'category',
        label: 'Entities',
        items: [ 
          'api/entities/account', 
          'api/entities/contract', 
          'api/entities/json',
          'api/entities/token' 
        ]
      }],
    },
  ],
};