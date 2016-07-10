---
layout: post
title: 自己搭建服务器造梯子的小记
date: 2016-07-10
categories: blog
header-color: "#678"
tags: [vps]
---

>在学校时曾申请过github education pack，前段时间收到成功的邮件，仔细看了下，学生礼包里包含DigitalOcean的50刀代金券，拿来搞个VPS装上shadowsocks是极好的


#### Github education

在填写一些个人信息、申请理由，上传学生证明（如学生证）后，将会得到一个Student Developer大礼包，其中包括aws、digitalocean等的代金券


#### Digital Ocean

注册账号并登录后，切换到billing界面，在此处即可使用学生礼包里提供的DigitalOcean 50美刀代金券，需要注意的是，需要绑定信用卡或者先向账户里充值5美刀
才可以激活账号，我是选择使用Paypal充了5美刀。

激活后，使用代金券，账户内余额变成了55美刀，搭建5美刀的vps话，够用11个月了

在创建vps时选择5$/month的那款，机房建议选择旧金山或者纽约，系统的话建议选择Centos（6版本），为之后的安装加速工具提供方便

#### Shadowsocks

远程登陆上主机后，便可以进行配置了
(需要一定linux基础)

##### 安装

Debian / Ubuntu:

	apt-get install python-pip
	pip install shadowsocks
	
CentOS:
	
	yum install python-setuptools && easy_install pip
	pip install shadowsocks

	
##### 配置

新建一个json文件，如/etc/shadowsocks.json

内容为：
	
	{
		"server":"你的服务器ip地址",
		"server_port":8388,
		"local_address": "127.0.0.1",
		"local_port":1080,
		"password":"你设置的密码",
		"timeout":300,
		"method":"aes-256-cfb",
		"fast_open": false
	}
	
##### 启动

	ssserver -c /etc/shadowsocks.json
	#或者在后台运行
	ssserver -c /etc/shadowsocks.json -d start
	ssserver -c /etc/shadowsocks.json -d stop

#### 锐速

我的服务器是选择在旧金山，在没装加速软件的情况下，看youtube480p卡顿，经测试网速在100k左右，实在不能忍。

不同于finalspeed，锐速是一款单边加速工具，具体细节可以google

##### 安装

**以下背景均是Centos6，ubuntu自行google**

1、更换内核版本

在DigitalOcean后台，将内核更换为2.6.32-504.3.3.el6.x86_64

	如果不是DigitalOcean的服务器，使用
	rpm -ivh http://soft.91yun.org/ISO/Linux/CentOS/kernel/kernel-firmware-2.6.32-504.3.3.el6.noarch.rpm
	rpm -ivh http://soft.91yun.org/ISO/Linux/CentOS/kernel/kernel-2.6.32-504.3.3.el6.x86_64.rpm --force
	来更换，重启，执行uname -r命令查看结果

2、安装锐速破解版
	
	wget -N --no-check-certificate https://raw.githubusercontent.com/91yun/serverspeeder/master/serverspeeder-all.sh && bash serverspeeder-all.sh

卸载方法：
	
	chattr -i /serverspeeder/etc/apx* && /serverspeeder/bin/serverSpeeder.sh uninstall -f

至此，基本结束

#### 一些常用命令

	#查看锐速状态
	/serverspeeder/bin/serverSpeeder.sh status
	#查看当前使用本机shadosocks服务的ip
	netstat -an | grep 8388（你的端口） | grep ESTABLISHED
	
	
**粗略的做了下记录，以后有空再补充**
