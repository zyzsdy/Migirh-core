import { UserSession } from "./checkLogin";

/*
|UserLogin     |Global       |登录、注销登录
|UserEdit      |Global       |添加、删除、修改用户
|AuthGrant     |Global       |添加、删除、修改角色，授权和撤销授权给角色
|TaskInput     |Global       |执行新任务智能处理
|TaskAdd       |Scope        |添加任务
|TaskOperate   |Scope        |开始、暂停、恢复执行、停止和删除任务
|TaskList      |Scope        |读取任务列表
|DownloadFile  |Scope        |下载远程文件
|GlobalOption  |Global       |全局系统设置
|PresetOption  |Global       |预设管理
|PluginList    |Global       |显示插件列表
|PluginOperate |Global       |启用和停用插件
*/



export type GlobalAuthType = "UserLogin" | "UserEdit" | "AuthGrant" | 
    "TaskInput" | "GlobalOption" | "PresetOption" | "PluginList" |
    "PluginOperate";

export type ScopeAuthType = "TaskAdd" | "TaskOperate" | "TaskList" | "DownloadFile";

export type AuthType = GlobalAuthType | ScopeAuthType;

export function CheckAuthGlobal(user: UserSession, authType: GlobalAuthType) {
    if (user.isLocalAdmin) return true;

    return false;
}

export async function CheckAuthScope(user: UserSession, authType: ScopeAuthType, scopePath: string) {
    if (user.isLocalAdmin) return true;

    return false;
}