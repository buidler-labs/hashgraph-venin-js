/* eslint-env node */

module.exports = {
  docs: [
    {
      id: "markdown/introduction",
      label: "Introduction",
      type: "doc",
    },
    {
      collapsible: true,
      items: [
        {
          id: "markdown/quick-start",
          label: "Quick Start",
          type: "doc",
        },
        {
          id: "markdown/configuration",
          label: "Configuring",
          type: "doc",
        },
        {
          id: "markdown/playground",
          label: "Playground",
          type: "doc",
        },
      ],
      label: "Getting Started",
      type: "category",
    },
    {
      collapsible: true,
      items: [
        {
          id: "markdown/guides/bundling",
          label: "Bundling",
          type: "doc",
        },
        {
          id: "markdown/guides/wallet",
          label: "Wallet",
          type: "doc",
        },
        {
          id: "markdown/guides/session",
          label: "Session",
          type: "doc",
        },
        {
          collapsed: false,
          items: [
            "markdown/guides/entities/account",
            "markdown/guides/entities/contract",
            "markdown/guides/entities/file",
            "markdown/guides/entities/json",
            "markdown/guides/entities/token",
            "markdown/guides/entities/topic",
          ],
          label: "Entities",
          type: "category",
        },
      ],
      label: "Guides",
      type: "category",
    },
    {
      id: "markdown/changelog",
      label: "Changelog",
      type: "doc",
    },
  ],
};
