## 权限系统

权限系统的内容不是关于API如何认证的，有关此内容请查看[用户系统](user.md)。

### 权限系统简介

每个用户都会绑定到一个角色上，角色拥有一些权限。

内置角色：

* `LocalAdmin`，无法绑定给用户，通过本地Token认证的用户自动获得，拥有全部权限。
* `Admin`，拥有全部权限。

在API的上下文中可能存在操作目录，称为Scope，每个Scope中权限是独立的，子目录会继承父目录的权限。
Scope有一个特殊取值为`*`，表示系统中任意目录，`LocalAdmin`和`Admin`自动绑定了`*`。
还有一些权限，比如添加修改用户的`UserEdit`，它们无关操作目录，此时Scope会被标记为`Global`。

在权限管理里，可为角色分配权限，当分配的权限是无关操作目录的权限，Scope会被自动填充为`Global`。但是，其他权限必须指定Scope。
若Scope不存在上下级关系，则必须重复分配相同权限。

Example:

若角色`VideoUser`，可以下载保存到`C:\Users\kani\Downloads\Video`和`D:\Downloads\Video`的任务文件。需要将`DownloadFile`权限分别在两个目录中授予这个角色。

|RoleId     |Auth          |Scope
|:----------|:-------------|:-----------------------------
| VideoUser | DownloadFile | C:\Users\kani\Downloads\Video
| VideoUser | DownloadFile | D:\Downloads\Video

### 系统权限列表

|Auth          |Type         |Description
|:-------------|:------------|:-----------------------------
|`[None]`      |-            |表示无需任何权限
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

### 角色与权限API

1. 角色列表

Endpoint: `role/list`

Permission: `AuthGrant` on `Global`

2. 添加角色

Endpoint: `role/add`

Permission: `AuthGrant` on `Global`

3. 显示角色详情

会同时查询并显示该角色绑定的权限列表

Endpoint: `role/detail`

Permission: `AuthGrant` on `Global`

4. 编辑角色

Endpoint: `role/edit`

Permission: `AuthGrant` on `Global`

5. 删除角色

Endpoint: `role/del`

Permission: `AuthGrant` on `Global`

6. 绑定权限

需要指定绑定的角色ID，已有权限的查找在`显示角色详情`API中。

Endpoint: `auth/add`

Permission: `AuthGrant` on `Global`

7. 删除权限

Endpoint: `auth/del`

Permission: `AuthGrant` on `Global`