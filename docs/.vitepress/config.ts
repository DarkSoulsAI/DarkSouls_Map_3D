import { defineConfig } from 'vitepress'

// Project site is served at https://<owner>.github.io/DarkSouls_Map_3D/
export default defineConfig({
  base: '/DarkSouls_Map_3D/',
  lang: 'zh-CN',
  title: '罗德兰篝火图谱',
  description: 'Bonfires of Lordran — 开发文档',
  lastUpdated: true,
  cleanUrls: true,
  ignoreDeadLinks: true,
  themeConfig: {
    search: { provider: 'local' },
    nav: [
      { text: '指南', link: '/guide/getting-started' },
      { text: '数据', link: '/guide/data-model' },
      { text: '脚本', link: '/guide/scripts' },
      { text: 'Dev Log', link: '/devlog/' },
    ],
    sidebar: {
      '/guide/': [
        {
          text: '指南',
          items: [
            { text: '快速开始', link: '/guide/getting-started' },
            { text: '架构', link: '/guide/architecture' },
            { text: '数据模型', link: '/guide/data-model' },
            { text: '脚本与工具', link: '/guide/scripts' },
          ],
        },
      ],
      '/devlog/': [
        {
          text: 'Dev Log',
          items: [
            { text: '总览', link: '/devlog/' },
            { text: '篝火重定位 + Matcap', link: '/devlog/bonfire-matcap' },
          ],
        },
      ],
    },
    outline: { level: [2, 3], label: '本页目录' },
    docFooter: { prev: '上一页', next: '下一页' },
    footer: {
      message: 'Fan project · Not affiliated with FromSoftware or Bandai Namco.',
      copyright: '9S Lordran model: CC BY-NC 4.0',
    },
  },
})
