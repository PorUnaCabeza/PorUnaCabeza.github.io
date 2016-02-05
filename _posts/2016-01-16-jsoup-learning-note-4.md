---
layout: post
title: jsoup学习笔记(四):监控动态与爬取所有动态
date: 2016-01-30
categories: blog
header-color: "#678"
tags: [java,jsoup,html]
---
>今日公司年会，微醺

在成功登录后，就可以搞一些好玩的事情了

比如知乎没有提供特别关心某用户的功能，我们可以自己做一个，当关注的用户有新的动态时，发送邮件提醒我们

或者，爬取某用户的所有动态，来分析他的喜好习惯

###监控动态


####1、分析dom，提取信息

首先分析个人主页的dom结构
	
	<div class="zm-profile-section-list profile-feed-wrap">
		<div id="zh-profile-activity-page-list">
			<div class="zm-profile-section-item zm-item clearfix" data-time="1454573143" data-type="a" data-type-detail="member_voteup_answer">
			...
			</div>
		</div>
	</div>
	
具体的结构因为太长不太方便展现，可以到知乎去看下

经过观察，每一条动态都是在"zm-profile-section-item zm-item clearfix"类中的

其中data-time为unix时间戳

接着需要得到该动态的题目

	<div class="zm-profile-section-main zm-profile-section-activity-main zm-profile-activity-page-item-main">
		赞同了回答
		<a class="question_link" target="_blank" href="/question/36305720/answer/67332034">如果上古卷轴5成为中学必修课会怎样?</a>
	</div>
	
通过select('.zm-profile-activity-page-item-main').text()可以拿到

该动态的链接 select(".zm-profile-activity-page-item-main > a").last().attr("abs:href")

大概是这个样子：

	Elements elmts = doc.select(".zm-profile-section-item.zm-item.clearfix");
        for (Element elmt : elmts) {
			String time=elmt.attr("data-time");
			String name=elmt.select(".zm-profile-activity-page-item-main").text();
			String href=elmt.select(".zm-profile-activity-page-item-main > a").last().attr("abs:href");
        }

####2、判断最新动态

上面提到data-time内为该动态的unix时间戳，那么记录下当前最新的data-time，在下一次拉取时，用该次的
所有data-time与上一次的最新data-time进行比较，大于上一次的皆为新增动态

定义一个recentNewsTime记录当前最新data-time

	recentNewsTime=elmts.get(0).attr("data-time");

定义一个updateNews来记录最新动态列表
每次拉取时：
	
	if(elmt.attr("data-time").compareTo(recentNewsTime)>0)
		updateNews.put(...);
	
####3、发送邮件

使用javax.mail包来实现，没啥好讲的，看看api就行

	public void sendMail(Map<String,String> news) {
        Properties props=new Properties();
        try {
            ClassLoader loader = ZhihuUtil.class.getClassLoader();
            InputStream in = loader.getResourceAsStream("mailConfig.properties");
            props.load(in);
            System.out.println(props);
        } catch (FileNotFoundException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        }
        Session session = Session.getInstance(props);
        Transport ts = null;
        try {
            ts = session.getTransport();
            ts.connect(props.getProperty("mail.smtp.host"), props.getProperty("username"), props.getProperty("password"));
            MimeMessage message = new MimeMessage(session);
            //发件人
            message.setFrom(new InternetAddress("makpia@163.com"));
            //收件人
            message.setRecipient(Message.RecipientType.TO, new InternetAddress("makpia@163.com"));
            message.setSubject(sdf.format(System.currentTimeMillis()) + "有新动态");
            emailContent.setLength(0);
            for (Map.Entry<String, String> entry : news.entrySet()) {
                date.setTime(Long.parseLong(entry.getKey()) * 1000);
                emailContent.append(sdf.format(date)+entry.getValue()+"<br>");
            }
            message.setContent(emailContent.toString(), "text/html;charset=UTF-8");
            ts.sendMessage(message, message.getAllRecipients());
            log.info("邮件发送成功!");
        } catch (Exception e) {
            log.info("发送邮件失败,请检查邮件配置");
            e.printStackTrace();
        } finally {
            try {
                ts.close();
            } catch (MessagingException e) {
                e.printStackTrace();
            }
        }
    }
	
###爬取所有动态

待更	