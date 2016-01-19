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

>execute方法会抛出IOException，注意用try-catch语句包住或throws掉

#### 分析网页dom结构，编写对应的解析方法

首先观察dom结构
![知乎个人动态的dom结构](http://7xq9w1.com1.z0.glb.clouddn.com/2016-01-16-jsoup-learning-note-2-1.jpg)

发现个人动态都是包裹在 *class="zm-profile-section-item zm-item clearfix"* 的div内的

而 *data-time* 属性内的值稍有编程经验的人都可看出是unix时间戳，分析其是该条动态的时间信息

据此可以拿到当前页的个人动态的dom集合
<pre><code>Elements elmts = doc.select(".zm-profile-section-item.zm-item.clearfix");
</code></pre>

进行遍历后遍可输出本次请求获取的所有个人动态
<pre><code>//使用SimpleDateFormat格式化unix时间戳
SimpleDateFormat sdf = new SimpleDateFormat("yyyy/MM/dd HH:mm:ss");
for (Element elmt : elmts) {
	System.out.println(sdf.format(new java.util.Date(Long.parseLong(elmt.attr("data-time")) * 1000)));
	System.out.println(elmt.select(".zm-profile-activity-page-item-main").text() + "www.zhihu.com" + elmt.select(".question_link").attr("href"));
}</code></pre>

上面代码块内，个人动态的url是使用 *baseUrl+quetion_link* 形式拼起来的，也可以使用:
<pre><code>elmt.select(".question_link").attr("abs:href");</code></pre>

有的时候直接使用 *abs:href* 读取不到正确的绝对地址，这时候需要在document处指定baseUrl:
<pre><code>doc.setBaseUri("https://www.zhihu.com");
...
elmt.select(".question_link").attr("abs:href");//这时候读取到的就是正确的url了
</code></pre>

现在就可以读取某人首页地址并输出他的动态信息了

但是会发现一个问题，未登录用户（显然上文用jsoup访问url属于未登录）在访问某人首页时会存在延迟（即他的最新动态不能及时获取），延迟时间大概是10~20分钟

而已登录用户（如在浏览器内登录）刷新某人首页则是实时显示他的动态

推测是知乎为了防止爬虫频繁刷取页面

下一步就是用jsoup模拟登录了！

