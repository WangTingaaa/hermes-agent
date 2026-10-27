import type { Translations } from './types'

export const zhConnectorAccounts: Translations['connectorsPage']['accounts'] = {
  heading: '账户',
  count: count => `${count} 个账户`,
  addAnother: '添加其他账户',
  aliasLabel: '账户名称',
  aliasHint: '最多 32 个小写字母、数字和连字符，例如 work 或 home。',
  aliasInvalid: '请使用小写字母、数字和连字符，并以字母或数字开头。',
  aliasTaken: '此名称已被使用。',
  add: '连接',
  rename: '重命名',
  renameLabel: name => `${name} 的新名称`,
  renameGone: '此账户已被移除，或在重新连接时被替换。',
  remove: '移除',
  removeTitle: (app, name) => `移除 ${app} 的 ${name} 账户？`,
  removeBody: 'Mira 将停止使用此账户。其他账户会保持连接。',
  retiredCount: count => `${count} 个已替换`,
  status: {
    expired: '授权已过期',
    failed: '连接失败',
    inactive: '未启用',
    pending: '等待登录',
    retired: '已在重新连接时替换',
    revoked: '授权已撤销'
  }
}
