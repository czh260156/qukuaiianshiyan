# USY Studio · 项目制学习桌面工作平台

基于 Electron、React 与 Ant Design 的课程项目管理工作台。项目、任务、学习日历和数据分析统一使用 `src/renderer/src/data/mockData.js` 中的模拟数据，并通过本地存储保留新增与修改。

## 目录职责

```text
src/
├─ main/                    Electron 主进程与窗口配置
├─ preload/                 预加载桥接
└─ renderer/src/
   ├─ data/                 唯一项目模拟数据源
   ├─ hooks/                项目状态与持久化操作
   ├─ utils/                统计、日期、存储与展示元数据
   ├─ components/           顶栏、侧栏、页面标题、设置弹窗
   ├─ pages/                工作台、项目、任务、日历、分析页面
   ├─ App.jsx               页面装配与界面状态
   └─ App.css               全局主题和响应式样式
scripts/
└─ verify-mock-data.mjs     模拟数据与页面绑定验证
```

## 数据流

`mockData.js` → `useProjectStore` → 页面组件。工作台、项目页、任务中心、学习日历和数据分析均从同一个 `projects` 状态计算，不重复定义业务数据。

当前模拟数据预期：2 个项目、6 个任务、3 个已完成任务、总体完成率 50%。两个项目分别完成 2/4 和 1/2。

## 开发与验证

```bash
npm install
npm run dev
npm run test:data
npm run lint
npm run build
```

执行 `npm run test:data` 可验证模拟数据总数、完成率、项目明细、统一状态仓库接入情况，以及五个页面不存在原生 UI 标签。

## 技术约束

- UI 组件统一使用 Ant Design。
- 图标统一使用 `@ant-design/icons`。
- 页面组件只负责展示和交互，数据统计集中在工具层，状态变更集中在 Hook 中。
