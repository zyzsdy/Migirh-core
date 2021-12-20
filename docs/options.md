## [Deprecation]系统设置

全局系统设置：指整个Migirh-core系统基本设置，需要`GlobalOption`权限才可修改。

预设：指传递给Minyami的设置参数的一组快速配置。有面向所有用户的预设和个人预设两种，面向所有用户的预设必须有`PresetOption`才可修改。

### 系统设置API

1. 获取全局系统设置

Endpoint: `option/global/get`

Permission: `[None]`

2. 更新全局系统设置

Endpoint: `option/global/update`

Permission: `GlobalOption` on `Global`

3. 获取当前预设列表

只有名字和ID

面向所有用户的预设 + 个人预设

Endpoint: `option/preset/list`

Permission: `[None]`

4. 获取预设详情

Endpoint: `option/preset/detail`

Permission: `[None]`

5. 新建预设

Endpoint: `option/preset/add`

Permission: `[None]` if type == `"personal"` \
            `PresetOption` on `Global` else

6. 修改预设

Endpoint: `option/preset/edit`

Permission: `[None]` if type == `"personal"` \
            `PresetOption` on `Global` else

7. 删除预设

Endpoint: `option/preset/del`

Permission: `[None]` if type == `"personal"` \
            `PresetOption` on `Global` else