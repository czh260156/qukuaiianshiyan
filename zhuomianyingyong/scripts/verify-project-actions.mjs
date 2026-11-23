import assert from 'node:assert/strict'
import { MOCK_PROJECTS } from '../src/renderer/src/data/mockData.js'

const clone = (value) => structuredClone(value)

const updateProject = (projects, projectId, changes) =>
  projects.map((project) =>
    project.id === projectId
      ? {
          ...project,
          ...changes,
          id: project.id,
          createdAt: project.createdAt,
          tasks: project.tasks || []
        }
      : project
  )

const deleteProject = (projects, projectId) =>
  projects.filter((project) => project.id !== projectId)

const original = clone(MOCK_PROJECTS)
const first = original[0]
const edited = updateProject(original, first.id, {
  name: '编辑后的金融存证项目',
  description: '编辑后的项目描述',
  folderPath: 'D:\\USY-Projects\\edited-project'
})

assert.notEqual(edited, original, '编辑必须生成新数组，避免原地修改旧状态')
assert.equal(edited[0].name, '编辑后的金融存证项目')
assert.equal(edited[0].createdAt, first.createdAt, '编辑不能改变项目创建时间')
assert.deepEqual(edited[0].tasks, first.tasks, '编辑不能丢失已有任务')
assert.deepEqual(original, MOCK_PROJECTS, '编辑不能污染原始模拟数据')

const afterDelete = deleteProject(edited, first.id)
assert.equal(afterDelete.length, original.length - 1, '删除应只移除目标项目')
assert.equal(afterDelete[0].id, original[1].id, '其他项目必须保留')
assert.ok(afterDelete[0].tasks.length > 0, '其他项目任务必须保留')

console.log('项目编辑与删除逻辑验证通过')
console.log('编辑保留任务：是；删除仅影响目标项目：是')
