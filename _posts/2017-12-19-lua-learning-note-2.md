---
layout: post
title: lua学习笔记（二）:常用类库
date: 2017-12-19
categories: blog
header-color: "#678"
tags: [linux,lua]
---

>很久没有玩lua了，和上次的小打小闹不同，这次要写一个更复杂的部署到真实环境的lua脚本

#### 背景

最近遇到一个需求，用户扫描我们提供的二维码，如果是已经绑定过的用户，那么直接跳转到目标页面target.html，
如果用户为注册，那么需要根据携带的信息，为他绑定，然后跳转到target.html。

最初的想法当然是，二维码指向一个中间页面temp.html，在temp.hmtl里发送ajax请求查询用户是否绑定，如果已经绑定那么直接跳转到target.html，如果没有再发送一个绑定的ajax，最后跳转到target.html。

如我在[lua学习笔记一](/blog/2017/02/19/lua-learning-note-1/)里提到的一样，这样会造成页面的二次刷新，会有长时间的白屏，对用户很不友好。

这次决定用lua实现这个功能，将查询用户是否绑定、绑定用户这两个请求放在lua里去处理，处理完成后直接返回一个302重定向，这样用户端感受不到页面刷新的。

在我们系统内，获取用户信息也是封装成的一个lua，因此流程大致是：

>二维码 -> 获取用户信息的lua -> 判断是否绑定的lua -> target.html

为了实现这个功能，首先需要写的就是在lua里发送请求的功能，这里引入第一个类库：lua-resty-http

#### lua-resty-http

[lua-resty-http的主页](https://github.com/pintsized/lua-resty-http)

先看一个小demo：

```lua
local http = require("resty.http")
local function get_relation(encrypt_id)
    local param = {
        method = "GET",
        query = {
            auth = encrypt_id
        },
        ssl_verify = false,
        headers = { ["Content-Type"] = "application/x-www-form-urlencoded" }
    }
    local res, err = http.new():request_uri(config.get_relation_addr, param)
    if not res or err or tostring(res.status) ~= "200" then
        return false, err or tostring(res.status)
    end
    local resbody = cjson.decode(res.body)

    if resbody.code ~= "0" then
        return false, res.body
    end
    return true, res.body
end
```

http.new()构建一个http对象，之后可以进行一些设置，如设置超时时间（set_timeout）等

常用的发送请求的api有request、request_uri

他们都需要提前准备好一个请求参数table
接受这些选项：

* version: http协议的版本号，目前支持1.0或者1.1
* method:  请求类型，如get post put等
* path:    路径
* query:   我的理解是在x-www-form-urlencoded形式下这个字段才起作用，传递的是键值对形式的请求参数
* headers: 请求头，注意是table类型
* body:    请求体，String类型
* ssl_verify: https相关配置

> local res, err = http.new():request_uri(config.get_relation_addr, param)

request_uri如果请求成功，则返回结果res，如果失败则res为nil，err为失败信息。

在res中包含以下信息

* status: http状态码，如能让后端头疼死的502、500
* headers: response的header
* body: response的body，注意是string形式

在写好两个请求过程后，我的lua脚本大致长这个样子：

```lua
function _M.redirect() {
    local userid = ngx.var.arg_userid
    local exist_relation = get_relation(encrypt_openid)  --发送查询是否绑定请求
    if exist_relation then
        return ngx.redirect(target_html, ngx.HTTP_MOVED_TEMPORARILY) -- 302重定向
    end
    -- 若未绑定
    local user_info = get_user_info()
    local bind_success = bind_relation(userid, user_info)  --发送绑定请求
    if not bind_success then
        ngx.print("can't bind relation")
        ngx.exit(502)
    else
        return ngx.redirect(target_html, ngx.HTTP_MOVED_TEMPORARILY)
    end
}
```

在写完上述代码后，部署到服务器，以为已经万事大吉。哪料在真实环境中出现了意想不到的状况

上文提到过，需要先获取用户信息，然后跳转到我写的lua，获取用户信息这一块是调用的微信授权流程，因为种种原因，需要将二维码上携带的参数放置在微信回调的state参数内，但是微信对state参数的长度做了限制，最大为128字节，我们的业务逻辑需要的参数远远超过了这个长度，因此

>获取用户信息的lua -> 判断是否绑定的lua

这一步就无法通过，绝望了。

- - -

经历短暂的慌张，很快理清思路：将过长的参数先存下来，到第二个lua中再捞出来

这又涉及到第二个问题：选用哪种缓存中间件呢？

可以使用ngx_lua模块中的共享内存ngx shared dict cache，但这个cache是nginx所有worker之间共享的，内部使用的LRU算法（最近经常使用）来判断缓存是否在内存占满时被清除。

当然，也可以使用redis

#### lua-resty-reids

[lua-resty-redis的主页](https://github.com/openresty/lua-resty-redis)


#### lua-resty-lrucache

[lua-resty-lrucache](https://github.com/openresty/lua-resty-lrucache)

