## 任务系统

### 任务系统简介

可以通过前端直接发送下载任务，任务开始后就会在远程服务器下载。可以将已完成任务得到的文件下载回本地（通过Electon本地使用时本功能将会被屏蔽）。

### 任务系统API

1. 智能处理

填写一个字符串，可能是URL，比如B站直播间地址。也可能是Minyami Chrome Extension生成的命令，Migirh-core或是已安装的插件将智能处理这个字符串并打开新建任务窗口。

Endpoint: `/api/task/input`

Permission: `TaskInput` on `Global`

2. 新建任务

Endpoint: `/api/task/add`

Permission: `TaskAdd` on `Scope`

Parameters:

|Name         |Type      |Desc
|:------------|:---------|:---------------
|url          |string    |待下载的m3u8地址
|live         |boolean   |是否为直播
|output       |string    |保存路径（服务器远程路径，所在目录必须为有权限的Scope）
|category     |string    |分类
|description  |string    |描述（或备注）
|options      |MinyamiOptions|传递给Minyami的参数

MinyamiOptions:

|Name         |Type      |Desc
|:------------|:---------|:---------------
|threads      |number    |Threads limit (Default: 5)
|retries      |number    |Retry limit
|key          |string    |Key for decrypt video
|cookies      |string    |Cookies used to download
|headers      |string    |Custom header used to download
|format       |string    |Output format (Default: ts)
|slice        |string    |Set a time range then download specified part of the stream. eg. "45:00-53:00"
|nomerge      |boolean   |Do not merge m3u8 chunks after finished download

3. 暂停任务

Endpoint: `task/pause`

Permission: `TaskOperate` on `Scope`

4. 继续任务

Endpoint: `task/resume`

Permission: `TaskOperate` on `Scope`

5. 终止任务

Endpoint: `task/stop`

Permission: `TaskOperate` on `Scope`

6. 删除任务

Endpoint: `task/del`

Permission: `TaskOperate` on `Scope`

7. 任务列表

Endpoint: `task/list`

Permission: `TaskList` on `Scope`

8. 搜索任务

Endpoint: `task/search`

Permission: `TaskList` on `Scope`

9. 下载完成后的文件

注意本功能使用Nginx的`X-Accel-Redirect`功能，在简单鉴权后将请求重定向至Nginx完成后续下载。所以必须配置好Nginx才能使用。

Endpoint: `task/search`

Permission: `DownloadFile` on `Scope`