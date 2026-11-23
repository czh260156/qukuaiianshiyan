import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { MOCK_PROJECTS } from '../src/renderer/src/data/mockData.js'
import { createInitialData, getMockDataSummary } from '../src/renderer/src/utils/appData.js'

const expected = {
  projectCount: 2,
  taskCount: 6,
  done: 3,
  pending: 3,
  percent: 50,
  projects: [
    { id: 'p_1', taskCount: 4, doneCount: 2, percent: 50 },
    { id: 'p_2', taskCount: 2, doneCount: 1, percent: 50 }
  ]
}

const actual = getMockDataSummary(MOCK_PROJECTS)
const profile = createInitialData().profile
assert.deepEqual(
  { name: profile.name, major: profile.major, studentId: profile.studentId },
  { name: '孙同学', major: '商学院', studentId: '2024级' },
  '默认学生身份必须为 2024 级商学院孙同学'
)

assert.deepEqual(
  {
    projectCount: actual.projectCount,
    taskCount: actual.taskCount,
    done: actual.done,
    pending: actual.pending,
    percent: actual.percent,
    projects: actual.projects.map(({ id, taskCount, doneCount, percent }) => ({
      id,
      taskCount,
      doneCount,
      percent
    }))
  },
  expected,
  '模拟数据、统计工具与页面预期指标不一致'
)

const appSource = readFileSync(new URL('../src/renderer/src/App.jsx', import.meta.url), 'utf8')
assert.match(
  appSource,
  /window\.api\?\.(loadData|saveData)/,
  'App 必须连接 Electron 持久化数据接口'
)
assert.doesNotMatch(
  appSource,
  /const \[projects, setProjects\] = useState\(\[\s*\{/,
  'App 不应重复硬编码项目数据'
)

for (const file of ['Dashboard', 'Projects', 'Tasks', 'Calendar', 'Analytics']) {
  const source = readFileSync(
    new URL(`../src/renderer/src/pages/${file}.jsx`, import.meta.url),
    'utf8'
  )
  assert.doesNotMatch(
    source,
    /<(div|span|button|section|article|p|h[1-6])\b/,
    `${file} 必须使用 Ant Design 组件`
  )
}

console.log('模拟数据与 UI 绑定验证通过')
console.log(
  `项目 ${actual.projectCount} 个 · 任务 ${actual.taskCount} 项 · 已完成 ${actual.done} 项 · 完成率 ${actual.percent}%`
)
actual.projects.forEach((project) => {
  console.log(
    `- ${project.id}: ${project.doneCount}/${project.taskCount} 个任务，${project.percent}%`
  )
})
