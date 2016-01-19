---
layout: post
title: jsoup学习笔记(二):读取知乎个人首页动态
date: 2016-01-19
categories: blog
header-color: "#678"
tags: [java,jsoup,html]
---

>在使用一段时间jsoup后，不满足仅仅处理一些本地文件，因知乎上不提供特别关注某位答主的功能，所以准备慢慢写一个监控动态的工具

#### jsoup从url加载网页

使用jsoup的connect方法，但注意

+ 要在消息头内添加user-agent信息，用来模拟浏览器
+ 合理设置timeout数值，防止异常

如:
<pre><code>Connection con = Jsoup.connect("https://www.zhihu.com/people/rednaxelafx");//获取连接
con.header("User-Agent", "Mozilla/5.0 (Windows NT 6.1; WOW64; rv:29.0) Gecko/20100101 Firefox/29.0");//配置模拟浏览器
con.timeout(3000);
Connection.Response rs = con.execute();//拿到返回的response信息
Document doc = Jsoup.parse(rs.body());//得到目标url的dom结构</code></pre>