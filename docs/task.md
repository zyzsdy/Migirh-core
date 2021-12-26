## 任务系统

### 任务系统简介

可以通过前端直接发送下载任务，任务开始后就会在远程服务器下载。可以将已完成任务得到的文件下载回本地（通过Electon本地使用时本功能将会被屏蔽）。

### 任务系统API

1. 智能处理

填写一个字符串，可能是URL，比如B站直播间地址。也可能是Minyami Chrome Extension生成的命令，Migirh-core或是已安装的插件将智能处理这个字符串并打开新建任务窗口。

Endpoint: `task/input`

Permission: `TaskInput` on `Global`

Parameters:

|Name         |Type          |Desc
|:------------|:-------------|:---------------
|content      |string        |待处理的字符串

Returns:

|Name         |Type          |Desc
|:------------|:-------------|:---------------
|error        |number        |0-Ok
|info         |string        |Extra information
|info_args    |object        |Supplement of extra information
|result       |InputResult[] |分析结果

- InputResult:
    |Name         |Type          |Desc
    |:------------|:-------------|:---------------
    |label        |string        |结果标签
    |info         |PreaddInfo    |预解析参数

2. 预新建任务

在直接单击页面上的“新建任务”按钮时，从系统中读取上一次用户配置以方便用户使用。

Endpoint: `task/preadd`

Permission: `TaskInput` on `Global`

Parameters: 无

Returns:

|Name         |Type          |Desc
|:------------|:-------------|:---------------
|error        |number        |0-Ok
|info         |string        |Extra information
|info_args    |object        |Supplement of extra information
|cache        |PreaddInfo    |用户缓存

- PreaddInfo:
    |Name         |Type      |Desc
    |:------------|:---------|:---------------
    |url          |string    |待下载的m3u8地址
    |live         |boolean   |是否为直播
    |output       |string    |保存路径（服务器远程路径，所在目录必须为有权限的Scope）
    |category     |string    |分类
    |description  |string    |描述（或备注）
    |threads      |number    |Threads limit (Default: 5)
    |retries      |number    |Retry limit
    |key          |string    |Key for decrypt video
    |cookies      |string    |Cookies used to download
    |headers      |string    |Custom header used to download
    |format       |string    |Output format (Default: ts)
    |slice        |string    |Set a time range then download specified part of the stream. eg. "45:00-53:00"
    |nomerge      |boolean   |Do not merge m3u8 chunks after finished download
    |proxy        |string    |Use the specified HTTP/HTTPS/SOCKS5 proxy. eg. "socks5://127.0.0.1:7890"
    |verbose      |boolean   |Output debug information to log


3. 新建任务

Endpoint: `task/add`

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
|proxy        |string    |Use the specified HTTP/HTTPS/SOCKS5 proxy. eg. "socks5://127.0.0.1:7890"
|verbose      |boolean   |Output debug information to log

4. 暂停任务

Endpoint: `task/pause`

Permission: `TaskOperate` on `Scope`

5. 继续任务

Endpoint: `task/resume`

Permission: `TaskOperate` on `Scope`

6. 终止任务

Endpoint: `task/stop`

Permission: `TaskOperate` on `Scope`

Parameters:

|Name         |Type      |Desc
|:------------|:---------|:---------------
|task_id      |string    |待终止任务的task_id

7. 删除任务

Endpoint: `task/del`

Permission: `TaskOperate` on `Scope`

8. 任务列表

Endpoint: `task/list`

Permission: `TaskList` on `Scope`

9. 正在进行中的任务列表

Endpoint: `task/now`

Permission: `TaskList` on `Scope`

Parameters: 无

Returns:

|Name         |Type          |Desc
|:------------|:-------------|:---------------
|error        |number        |0-Ok
|info         |string        |Extra information
|info_args    |object        |Supplement of extra information
|data         |TaskInfo[]    |任务信息

- TaskInfo:
    |Name         |Type      |Desc
    |:------------|:---------|:---------------
    |task_id      |string    |任务ID
    |status       |number    |下载状态（0-Init 1-Downloading 2-Paused 3-Merging 4-Completed 5-Error）
    |is_live      |boolean   |是否为直播
    |filename     |string    |任务名称
    |output_path  |string    |保存路径
    |source_url   |string    |M3U8 URL
    |category     |string    |分类
    |date_create  |Date      |创建时间
    |date_update  |Date      |最后更新时间
    |description  |string    |描述
    |finished_chunk_count|number|已完成的区块数
    |total_chunk_count|number|总区块数
    |chunk_speed  |string    |区块速度
    |ratio_speed  |string    |比例速度
    |eta          |string    |剩余完成时间

10. 下载完成后的文件

注意本功能使用Nginx的`X-Accel-Redirect`功能，在简单鉴权后将请求重定向至Nginx完成后续下载。所以必须配置好Nginx才能使用。

Endpoint: `task/search`

Permission: `DownloadFile` on `Scope`