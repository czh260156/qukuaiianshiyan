export const MOCK_PROFILE = {
  name: '孙同学',
  major: '商学院',
  studentId: '2024级',
  avatarColor: '#6558f5'
}

export const MOCK_PROJECTS = [
  {
    id: 'p_1',
    name: '金融数据上链存证系统',
    course: '区块链技术原理及应用',
    description: '基于智能合约实现金融流水与电子存证的不可篡改存储。',
    folderPath: 'D:\\USY-Projects\\finance-chain',
    createdAt: '2026-10-30',
    deadline: '2026-12-05',
    status: 'active',
    priority: 'high',
    coverColor: '#6558f5',
    tags: ['FISCO-BCOS', '智能合约', '数据存证'],
    tasks: [
      {
        id: 't_1',
        title: '撰写开题报告与需求分析说明书',
        completed: true,
        dueDate: '2026-11-02',
        completedAt: '2026-11-01',
        category: '文档',
        priority: 'high',
        estimate: 4
      },
      {
        id: 't_2',
        title: '搭建 FISCO BCOS 底层区块链网络',
        completed: true,
        dueDate: '2026-11-10',
        completedAt: '2026-11-09',
        category: '开发',
        priority: 'high',
        estimate: 8
      },
      {
        id: 't_3',
        title: '编写存证智能合约与单元测试',
        completed: false,
        dueDate: '2026-11-20',
        category: '开发',
        priority: 'high',
        estimate: 6
      },
      {
        id: 't_4',
        title: '开发前端可视化交互页面与接口联调',
        completed: false,
        dueDate: '2026-11-27',
        category: '开发',
        priority: 'medium',
        estimate: 8
      }
    ]
  },
  {
    id: 'p_2',
    name: '智能校园访客管理系统',
    course: '移动与桌面跨平台开发',
    description: '为高校保卫处打造的桌面访客登记与出入身份核验工具。',
    folderPath: 'D:\\USY-Projects\\campus-visitor',
    createdAt: '2026-10-31',
    deadline: '2026-12-12',
    status: 'active',
    priority: 'medium',
    coverColor: '#1f9d7a',
    tags: ['Electron', 'React', '访客管理'],
    tasks: [
      {
        id: 't_201',
        title: '保卫处需求调研与访客业务流程梳理',
        completed: true,
        dueDate: '2026-11-08',
        completedAt: '2026-11-07',
        category: '调研',
        priority: 'medium',
        estimate: 3
      },
      {
        id: 't_202',
        title: '桌面端人脸识别核验界面开发',
        completed: false,
        dueDate: '2026-11-19',
        category: '开发',
        priority: 'high',
        estimate: 8
      }
    ]
  }
]

export const MOCK_NOTES = [
  {
    id: 'n_1',
    title: '答辩结构备忘',
    content: '背景与问题 → 方案架构 → 链上合约演示 → 数据可信性验证 → 项目总结。',
    color: 'violet'
  },
  {
    id: 'n_2',
    title: '本周重点',
    content: '优先完成合约单元测试，同时补齐桌面端访客核验流程。',
    color: 'amber'
  }
]

export const createEmptyProject = (values = {}) => ({
  id: values.id || `p_${Date.now()}`,
  name: values.name?.trim() || '未命名项目',
  course: values.course?.trim() || '未设置课程',
  description: values.description?.trim() || '暂无简介描述',
  folderPath: values.folderPath?.trim() || '待关联本地文件夹',
  createdAt: values.createdAt || new Date().toISOString().slice(0, 10),
  deadline: values.deadline || null,
  status: values.status || 'active',
  priority: values.priority || 'medium',
  coverColor: values.coverColor || '#6558f5',
  tags: values.tags || [],
  tasks: values.tasks || []
})
