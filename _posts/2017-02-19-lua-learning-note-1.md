---
layout: post
title: lua学习笔记（一）:根据user-agent展示不同网页
date: 2017-02-19
categories: blog
header-color: "#678"
tags: [linux,lua]
---

>同一个url，https://www.baidu.com/，在电脑上打开，展示pc页面，在手机上打开，则显示移动端页面，对此很是好奇,
如何才能实现这功能呢？


#### js去控制？

遇到这个问题，首先想到的思路是根据浏览器内的user-agent属性去区分pc端和移动端，继而很自然的想到，
在js里使用<kbd>navigator.userAgent</kbd>获得user-agent，并直接在js里做跳转

比如：访问mattina.cn，默认展示pc.html

在pc.html内:

	var ua = navigator.userAgent.toLowerCase(); 
	if(ua.match(/regexHere/))
		location.href= 'mobile.html';

这样可以打到文章开头提到的效果，但是会有一个弊端，移动端访问，页面势必会再刷新一次，对用户体验很不好

js中转页面跳转，放弃！


#### nginx+lua

在学习了一段时间的openresty后，准备用lua来实现同一个url，pc和移动端定向到不同页面

openresty的基础知识就不赘述了，这里主要提几个相关指令

##### ngx.req.set_uri

语法:
 
	ngx.req.set_uri(uri, [jump])
	
重写当前的请求至uri，jump非必填，默认为false，如果为true，则表示重写后的uri会重新匹配nginx里的location，如果为false，则不会。

##### ngx.redirect

语法：
	
	ngx.redirect(uri, [status])

该方法会给客户端返回一个301/302重定向，具体是301还是302取决于设定的status值，如果不指定status值，默认是返回302 (ngx.HTTP_MOVED_TEMPORARILY)

301重定向不仅能使页面实现自动跳转，对于搜索引擎来说，也可能可以传递PR值。

下面，开始做测试！

##### 一些前期准备工作

在搭建好openresty环境后，配置了两个location，用来测试

	server{
		listen 80;
		server_name mattina.cn;
		location /mobile {
			root   html;    
			index  mobile.html;
		}
		location /pc {
			root   html;
			index  pc.html;
		}
	}

<a href='http://mattina.cn/pc' target='_blank'>mattina.cn/pc</a>,代表pc页面

<a href='http://mattina.cn/mobile' target='_blank'>mattina.cn/mobile</a>,代表移动页面

我们用主域名mattina.cn来做起始页面
	
	location / {
        rewrite_by_lua '
            require("ua.ua").redirect_by_user_agent()
       ';
    }

这里使用的‘rewrite_by_lua’，是lua模块里的常用命令，具体可以翻阅[OpenResty最佳实践](http://xuewb.com/index.html)

万事俱备，只欠lua脚本了

##### lua脚本

为了根据user-agent区分pc还是移动端，需要定义好匹配规则

	mobileUserAgent = {
                        "mobile","android","iphone",
                        "blackberry", "webos", "ipod", "lge vx", "midp", "maemo", "mmp", "mobile",
                        "netfront", "hiptop", "nintendo DS", "novarra", "openweb", "opera mobi",
                        "opera mini", "palm", "psp", "phone", "smartphone", "symbian", "up.browser",
                        "up.link", "wap", "windows ce"
                     }


在redirect_by_user_agent函数中，首先需要获取请求携带的user-agent信息

    local userAgent = string.lower(ngx.req.get_headers().user_agent)
	
这里转换为小写，是为了后续正则匹配方便

这里仅仅做一个例子，根据自己的需求增删

在拿到user-agent之后，便开始匹配：


	local matchUa
	for i,v in ipairs(mobileUserAgent) do
        matchUa=string.match(userAgent,v)
        if matchUa then
            return ngx.req.set_uri("/mobile", true)
        end
    end
	return ngx.req.set_uri("/pc", true)
	
如果想跳转到其他域名，可以使用
	
	ngx.redirect(target,ngx.HTTP_MOVED_TEMPORARILY)
	
比如判断该url是微信浏览器访问，则调转微信oauth链接：

	 if matchUa then
         local fullUrl = ngx.var.scheme.."://"..ngx.var.host..ngx.var.request_uri
         local encodeUrl = urlcodec.encodeURI(fullUrl)    // url编码
         local target = ouathPrefix .. encodeUrl
         return ngx.redirect(target,ngx.HTTP_MOVED_TEMPORARILY)
    end

#### 存在问题:静态资源

如果单纯用上述lua脚本去控制跳转，会存在这样一个问题：页面内的静态资源也被lua重定向，导致获取不到

需要在lua里对静态资源单独判断并跳转到静态资源的location

#### 成果

访问

<a href='http://mattina.cn' target='_blank'>mattina.cn</a>

在电脑端浏览器里打开，展示“PC PAGE”

在手机里，或者chrome审查模式里模拟移动端访问，展示“MOBILE PAGE”

> chrome里ctrl+shift+i 调出审查模式，然后ctrl+shift+m切换成移动端模拟器
