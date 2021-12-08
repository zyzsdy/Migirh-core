## 用户系统

### 用户认证流程

取得Token后，在每次请求的时候都需要带上`User-Token` Header和`X-Auth-Token` Header。其中：

`User-Token`是登录Token。

`X-Auth-Token`形如`Migirh-Auth 1638806400000 bac3a12100000000000000000000000000`的字符串，分为三段。
第一段是固定字符串`Migirh-Auth`，第二段是请求时间戳，第三段是请求内容和时间戳，以Secret Key为关键字，使用HMACSha1算法计算的摘要。
（API如有特殊标明时不计算请求内容，如上传文件接口。）

算法如下伪代码实现：
```js
sign = hmac_sha1(`${body}&ts=${ts}`, sk);
```

Token来源有两种

1. 通过登录接口获取

2. 本地Token认证

程序运行后将会在`.migirh/localAdminToken.json`中生成随机Token和SecretKey，本地另一程序可以读取该文件直接获得最高权限。该文件格式如下所示：

```json
{
    "token": "Udfea123f",
    "sk": "Kuing======="
}
```

### 用户API

1. 用户列表

Endpoint: `/api/user/list`

Permission: `UserEdit` on `Global`

2. 添加用户

Endpoint: `/api/user/add`

Permission: `UserEdit` on `Global`

3. 修改用户

可以同时修改用户的密码

Endpoint: `/api/user/edit`

Permission: `UserEdit` on `Global`

4. 删除用户

Endpoint: `/api/user/del`

Permission: `UserEdit` on `Global`

5. 修改密码

只能修改自己的密码，需要验证原密码

Endpoint: `/api/user/repass`

Permission: `[None]`

6. 登录

Endpoint: `/api/user/login`

Permission: `UserLogin` on `Global`

7. 登出

Endpoint: `/api/user/logout`

Permission: `[None]`
