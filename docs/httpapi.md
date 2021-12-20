## HTTP API请求

### 发送请求

调用API时，请将参数组装成json格式，通过`POST`方法发送到API的Endpoint。

完整的URL形如`http://127.0.0.1:46014/api/user/checkLogin`。其中，`http://127.0.0.1:46014/api`称为`apiRoot`。`user/checkLogin`称为`Endpoint`。

在其他的API文档中，将仅列出Endpoint。

> 注意：即使没有任何需要发送的参数，也需要发送json空对象`{}`

除了登录API本身外，大部分API都需要登录，在这种情况下，需要在Header中增加`User-Token`和`X-Auth-Token`来鉴权。
其中`User-Token`是登录后获得的用户标识符。而`X-Auth-Token`是对发送内容经过sk签名后的消息摘要。

消息摘要的算法请见[用户系统](user.md)一节。

### 接收返回值

返回值也为json格式。

任何API都会返回`error`和`info`、`info_args`三个值。其中`error`表示该API调用中是否发生了错误，以及错误的基本类型。`info`表示应当显示给用户的信息。

`info_args`为`info`中存在需要插值的内容时的插值。当无需`info_args`时，会返回空对象。

error 值与含义的对照表

|Value of `error`  |Description
|:-----------------|:--------------
| 0                | Success
| 1                | Auth error
| 2                | DB error
| 3                | Request format error
