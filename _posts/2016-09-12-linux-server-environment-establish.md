---
layout: post
title: linux环境搭建的一些记录
date: 2016-09-12
categories: blog
header-color: "#678"
tags: [linux]
---

>最近搞到了两台腾讯云学生特惠主机，将搭建服务器环境的过程做一些记录(均是Ubuntu12.04)


#### mysql

直接使用apt-get来进行安装

	apt-get install mysql-server
	
设置好密码后便可以使用

#### Nginx

访问[nginx官网](http://nginx.org/)挑选合适的版本载到服务器

解压后cd到解压目录内配置安装路径，如
	
	./configure --prefix=/home/ubuntu/tools/nginx
	
这时候很大几率会提示缺少一些库，按照提示安装即可，如我需要安装

	apt-get install libpcre3 libpcre3-dev
	apt-get install zlib1g-dev

安装必要的库后，便可以进行make了

	make
	make install

安装后，nginx的启动文件在 nginx/sbin下，启动和停止等命令如下

	#启动
	./nginx
	#重载配置文件
	./nginx -s reload
	#停止
	./nginx -s stop

#### jdk、maven

到[oracle官网](http://www.oracle.com/technetwork/java/javase/downloads/index.html)和[maven官网](http://maven.apache.org/)
下载合适的版本，解压。

环境变量的配置举个例子

	export JAVA_HOME=/home/ubuntu/tools/jdk1.8.0_101
	export JRE_HOME=$JAVA_HOME/jre
	export CLASSPATH=.:$JAVA_HOME/lib:$JRE_HOME/lib:$CLASSPATH
	export M2_HOME=/home/ubuntu/tools/apache-maven-3.3.9
	export PATH=$JAVA_HOME/bin:$JRE_HOME/bin:$JAVA_HOME:$M2_HOME/bin:$PATH

配置完后使用
	
	java -version
	mvn -version

来进行检查是否成功
	
##### tomcat

下载、解压，执行bin目录下的startup.sh和shutdown.sh来进行开启关闭，没啥讲的

我本来也是这么认为，直到遇到一个坑....

tomcat启动后，卡在了

	INFO: Deploying web application directory
	
在查阅资料后，发现oracle的这一篇文档 :[Avoiding JVM Delays Caused by Random Number Generation](http://docs.oracle.com/cd/E13209_01/wlcp/wlss30/configwlss/jvmrand.html)

里面提到

	1. Open the $JAVA_HOME/jre/lib/security/java.security file in a text editor.

	2. Change the line:
		securerandom.source=file:/dev/random
		to read:
		securerandom.source=file:/dev/urandom
		
	3. Save your change and exit the text editor.
	
按文档更改后，搞定

##### git

生成ssh密钥

	ssh-keygen -t rsa -C "你的注册邮箱"

一路回车

	vim ~/.ssh/id_rsa.pub
	
复制粘贴到相应git服务器的SSH Keys列表中
	
##### jenkins

搭建一个jenkins，以后的发布代码会很省事

下载jenkins的war包后，使用命令

	java -jar jenkins.war --httpPort=端口号 &
	
启动，其中&是后台执行的意思

第一次运行，会安装一些插件，等待即可，关于jenkins的配置，又可以写一篇文章了，这里简单记录下自己的构建shell

	ssh -tt root@123.207.241.*** > /home/ubuntu/tools/bai.log 2>&1 << eeooff 
	cd /home/ubuntu/github/Hermes/
	git pull
	mvn clean
	mvn package -DskipTests
	sh /home/ubuntu/tools/apache-tomcat-8.5.4/bin/shutdown.sh
	cp /home/ubuntu/github/Hermes/target/cabeza-hermes.war /home/ubuntu/tools/apache-tomcat-8.5.4/webapps/hermes.war
	sh /home/ubuntu/tools/apache-tomcat-8.5.4/bin/startup.sh
	exit
	eeooff
	more /home/ubuntu/tools/bai.log
	
我是将jenkins单独放在一台服务器上，发布的项目在另一台服务器上，需要先建立远程互信，有时间写写。
	
##### 一些小工具

* screen

	参阅[linux screen 命令详解](http://www.cnblogs.com/mchina/archive/2013/01/30/2880680.html)

* lszrz

	用来上传下载文件的，用ftp也可以

* axel、aria2

	下载文件时，ubuntu自带的wget总觉得太慢，可以试试这两个下载工具



**粗略的做了下记录，以后有空再补充**
