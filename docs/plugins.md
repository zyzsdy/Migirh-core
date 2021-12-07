## 插件系统

### 插件

很显然，我们的软件无法满足任何HLS网站上存在的潜在下载需求和个性化需求。所以我们使用插件系统来为整个系统添加和扩展功能。

插件系统将会在载入时主动向Migirh-core报告一些它自己的能力，然后Migirh-core会在适当的时间主动调用插件中注册的函数来完成扩展功能。

插件系统提供的功能：

* 智能处理：插件将主要在`/task/input`接口的处理中起作用。例如，你希望录制Bilibili的直播，你可能只想在系统键入类似`https://live.bilibili.com/12564`这样的地址。
  而Minyami需要一个完整的m3u8地址才能工作。此时一个声明了自己可以处理`live.bilibili.com`的插件就将起作用，它将以特定的方式访问B站API，获取实际的m3u8地址并传递给Minyami。

* 任务生命周期钩子：在任务新建、暂停、恢复、停止、删除的时候，都会执行插件的生命周期钩子。插件可在此进行一些动作来影响任务的执行。例如制作一个黑名单插件，满足条件的m3u8域名将不能新建任务。

* 内部API调用：通过内部调用创建和影响任务的执行。例如制作一个QQ机器人插件，可以通过QQ群聊天内容来创建任务和影响任务的执行。

* 数据库扩展：通过调用orm的接口为系统增加数据表（然而插件无法修改原有的数据表）

* 为系统扩展API和权限列表：插件可以提供扩展API和扩展的权限。需要在启动时注册进Migirh-core。例如制作一个定时任务插件，可以为系统扩展一个Type为Global的`ScheduleTask`权限，并添加一个`/scheduletask/schedule/add`接口。
  在这个接口中校验用户是否具有权限，如果具有的话，就可以在数据库中添加一个定时任务。另外一个计时器会定期检查定时任务并在计划中的时刻执行它们。
  当然，若需要通过GUI管理它们，也需要同时增加一个前端插件。由于Migirh-core的前后端分离设计，将前后端绑定的插件同时增加是一项挑战，因此很长一段时间内，这个可能都需要由插件使用者手工来完成。

* 内置插件：显然，Migirh-core的内核本身将要完成的是一个很少的功能集合。先前已经中止的项目biliroku-minyami中的很多设想都无法完成，为了在Electron版本中给用户一个开箱即用的体验，我们允许一部分插件成为内置插件。
  它们不需要通过插件管理API来启用，而是随着Migirh-electron的发行版同时发行，默认启用。而其他的插件必须进入插件管理页面手工启用，否则它们不会工作。

### 插件管理API

1. 已安装插件列表

Endpoint: `/api/plugin/list`

Permission: `PluginList` on `Global`

2. 启用插件

Endpoint: `/api/plugin/enable`

Permission: `PluginOperate` on `Global`

3. 停用插件

Endpoint: `/api/plugin/disable`

Permission: `PluginOperate` on `Global`