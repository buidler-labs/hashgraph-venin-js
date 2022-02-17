/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */

const path = require('path');
const remarkMermaid = require('mdx-mermaid');
const remarkNpm2Yarn = require('@docusaurus/remark-plugin-npm2yarn');
const remarkNumberedFootnoteLabels = require("remark-numbered-footnote-labels");

module.exports = async function () {
  const remarkGfm = (await import('remark-gfm')).default;

  return { 
    baseUrl: "/",
    deploymentBranch: "main",
    organizationName: "buidler-labs",
    plugins: [ 
      [ "@cmfcmf/docusaurus-search-local", {
        indexBlog: false,
      }], 
      '@docusaurus/theme-live-codeblock',
    ],
    presets: [
      [
        'classic', {
          blog: false,
          docs: {
            editUrl: 'https://github.com/buidler-labs/hedera-strato-js/edit/main/',
            exclude: [
              "**/src/**",
            ],
            remarkPlugins: [ 
              remarkGfm, 
              remarkMermaid,
              [ remarkNpm2Yarn, { sync: true } ],
              remarkNumberedFootnoteLabels,
            ],
            path: '.',
            routeBasePath: '/',
            showLastUpdateAuthor: true,
            showLastUpdateTime: true,
            sidebarPath: path.join(__dirname, './sidebar.js'),
          },
          googleAnalytics: false,
          gtag: false,
        },
      ],
    ],
    projectName: "hedera-strato-js",
    scripts: [ {
        async: true,
        src: './strato-loader.js',
      }, {
        async: true,
        src: './hedera-strato.js.map',
      },
    ],
    staticDirectories: [
      "src/strato/lib.esm",
      "src/strato/loaders",
    ],
    tagline: "Write Hedera dApps like a boss because why not?",
    themeConfig: {
      footer: {
        copyright: `Copyright © ${new Date().getFullYear()} <a href='https://github.com/buidler-labs'>BuiDler Labs</a>. Built with ❤️ in <a href='https://docusaurus.io/'>Docusaurus</a>.`,
        logo: {
          alt: 'BuiDler Labs Logo',
          src: 'img/logos/buidler-labs.png',
        },
        style: 'dark',
      },
      liveCodeBlock: {
        playgroundPosition: 'bottom',
      },
      navbar: {
        items: [ {
          href: 'https://github.com/buidler-labs/hedera-strato-js',
          label: 'GitHub',
          position: 'right',
        } ],
        title: 'Hedera Strato JS',
      },
      prism: {
        additionalLanguages: ['solidity'],
      },
    },
    title: "Hedera Strato JS",
    url: "https://hsj-docs.buidlerlabs.com/",
  }
};
