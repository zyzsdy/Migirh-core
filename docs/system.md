## 系统


### 系统API


1. 获取初始化必要信息

检查登录状态，并返回初始化所需信息。
如果返回error为1，表示未登录。

Endpoint: `system/init`

Permission: `[None]`

Parameters:

None

Returns:

|Name         |Type      |Desc
|:------------|:---------|:---------------
|error        |number    |0-Ok 1-Not logged in
|info         |string    |Extra information
|info_args    |object    |Supplement of extra information
|lang         |string    |System language setting

2. 获取全局系统设置

Endpoint: `system/get_config`

Permission: `[None]`

Parameters:

|Name         |Type          |Desc
|:------------|:-------------|:---------------
|config_key   |string[]      |待查询的key，留空为返回全部

Returns:

|Name         |Type          |Desc
|:------------|:-------------|:---------------
|error        |number        |0-Ok
|info         |string        |Extra information
|info_args    |object        |Supplement of extra information
|data         |SystemConfig[]|System Config

- SystemConfig:
    |Name         |Type      |Desc
    |:------------|:---------|:---------------
    |config_key   |string    |Key
    |config_value |string    |Value

3. 更新全局系统设置

Endpoint: `system/update_config`

Permission: `GlobalOption` on `Global`

Parameters:

|Name         |Type          |Desc
|:------------|:-------------|:---------------
|data         |SystemConfig[]|待更新的设置

Returns:

|Name         |Type          |Desc
|:------------|:-------------|:---------------
|error        |number        |0-Ok
|info         |string        |Extra information
|info_args    |object        |Supplement of extra information