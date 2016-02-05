---
layout: post
title: jsoup学习笔记(三):模拟登录
date: 2016-01-23
categories: blog
header-color: "#678"
tags: [java,jsoup,html]
---
>如上文所述，未登录状态爬取信息时会有很多限制，那么就来看看如何模拟登录知乎

### 采用最暴力的方法：硬塞cookie

首先，在浏览器上登录帐号，然后提取到cookie

关于如何获取，各个浏览器不一样，可以针对自己的百度下

拿到cookie值后，在程序里硬编码写入
	
    Connection con = Jsoup.connect("https://www.zhihu.com");//获取连接
	con.header("User-Agent", "Mozilla/5.0 (Windows NT 6.1; WOW64; rv:29.0) Gecko/20100101 Firefox/29.0");//配置模拟浏览器
	Map<String, String> cookie = new HashMap<>();
	cookie.put("_xsrf", "af8cfcba675ae98ae5a6e238b2844238");
	cookie.put("_za", "7699d7fa-905b-44bf-9a08-583ca27692b3");
	cookie.put("__utma", "51854390.1095779136.1452616328.1452616328.1452616328.1");
	cookie.put("__utmb", "51854390.14.10.1452616328");
	cookie.put("__utmc", "51854390");
	//...许多cookie，省略
	con.cookies(cookie);
	Connection.Response rs = con.execute();
	Document doc = Jsoup.parse(rs.body());
	System.out.println(doc);

结果如之前所料，是已登录的状态

此方法只是权宜之计，比如临时写一个只会用几次的爬虫程序

### 模拟登录知乎

下面一步步分析

#### 1.请求地址
使用chrome开发者工具中的network功能抓取：

>Request URL:https://www.zhihu.com/login/email

#### 2.需要哪些字段

打开知乎首页，观察登录表单

帐号密码输入框、验证码输入框

随便填几个值，点登录，使用chrome开发者工具中的network功能抓取请求头form data：

	_xsrf:88d1ff7fd5a1f66f306b8f720a7322b8
	password:123456
	captcha:1234
	remember_me:true
	email:12345678

发现五个字段

* _xsrf，暂时不知道作用，猜测是一种验证机制
* email、password，见名知意，帐号密码
* remember，是否记住帐号
* captcha，验证码值

只有_xsrf不知其意，查看网页源代码，发现

	<input type="hidden" name="_xsrf" value="88d1ff7fd5a1f66f306b8f720a7322b8">
	
ok，管你是什么意思，我先发一次请求拿到你，第二次的时候直接塞进去不就得了
如码所示：

	public void getXsrf() {
			con = Jsoup.connect("http://www.zhihu.com");
			con.header("User-Agent", userAgent);
			try {
				rs = con.execute();
			} catch (Exception e) {
				log.info("获得Xsrf失败");
				return;
			}
			Document doc=Jsoup.parse(rs.body());
			_xsrf=doc.select(".view.view-signin [name=\"_xsrf\"]").attr("value");
			log.info("已获得xsrf");
		}

#### 3.如何获取验证码

查看网页源代码

	<img class="js-refresh-captcha captcha" width="120" height="30" data-tip="s$t$看不清楚？换一张" alt="验证码" src="/captcha.gif?r=1453549553883">
	
得到验证码地址：

>www.zhihu.com/captcha.gif?r=一些数字

很容易可以看出，r的值为Unix时间戳

下一步，代码实现下载验证码到本地，并保存该验证码的cookie，为后面登录做准备
	
	private Map<String,String> captchaCookies =new HashMap<>();
	....
	public void getCaptcha() {
			captchaCookies.clear();
			log.info(System.currentTimeMillis());
			con = Jsoup.connect("https://www.zhihu.com/captcha.gif?r=" + System.currentTimeMillis()).ignoreContentType(true);//获取连接
			con.header("User-Agent", userAgent);
			try {
				rs = con.execute();
			} catch (Exception e) {
				log.info("获得验证码cookie失败");
				return;
			}
			File file = new File("cabeza.gif");
			try {
				FileOutputStream out = (new FileOutputStream(file));
				out.write(rs.bodyAsBytes());
			} catch (IOException e) {
				e.printStackTrace();
			}
			captchaCookies.putAll(rs.cookies());
			log.info("验证码已保存" + ",路径为:" + file.getAbsolutePath());
		}
		
验证码和对应cookie拿到后，下面就是登录了

#### 4.根据上述五个字段，实现登录

	public void getLoginCookies() {
        loginCookies.clear();
        Scanner sc=new Scanner(System.in);
        getXsrf();	//获取_xsrf
        getCaptchaCookies();	//获取验证码和验证码cookie
        log.info("请输入帐号");
        String userName=sc.nextLine();
        log.info("请输入密码");
        String passWord=sc.nextLine();
        log.info("请打开工程路径查看验证码并输入");
        String captcha=sc.nextLine();
        con = Jsoup.connect("https://www.zhihu.com/login/email");
        con.header("User-Agent", userAgent);
        try {
            rs = con.ignoreContentType(true).method(Connection.Method.POST)
                    .data("_xsrf", _xsrf)
                    .data("email", userName)
                    .data("password", passWord)
                    .data("captcha", captcha).cookies(captchaCookies).execute();
        } catch (Exception e) {
            log.info("获得loginCookies失败");
            return;
        }
        loginCookies.putAll(rs.cookies());
    }
	
#### 5.一些后续工作
拿到登录cookie后，为了方便下次登录，可以将cookie保存到文件，下次先从文件读取cookie登录，若失败，再使用上文方法登录

	public void saveCookies(String fileName, Map<String, String> cookies) {
        FileOutputStream fos = null;
        try {
            fos = new FileOutputStream(fileName);
        } catch (IOException e) {
            e.printStackTrace();
        }
        BufferedOutputStream bos
                = new BufferedOutputStream(fos);
        PrintWriter pw = new PrintWriter(bos);
        for (Map.Entry<String, String> entry : cookies.entrySet()) {
            pw.println(entry.getKey() + "=" + entry.getValue().replace("\"",""));
        }
        pw.close();
        log.info("cookies已保存");
    }
	public void readCookies(String filename) {
        loginCookies.clear();
        try {
            FileInputStream fis
                    = new FileInputStream(filename);
            InputStreamReader isr
                    = new InputStreamReader(fis);
            BufferedReader br
                    = new BufferedReader(isr);
            String str = null;
            while ((str = br.readLine()) != null) {
                int index = str.indexOf("=");
                loginCookies.put(
                        str.substring(0, index),
                        str.substring(index + 1, str.length())
                );
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
        log.info(loginCookies);
    }

从文件读取cookie登录

	public boolean loginBySavedCookies() {
        readCookies("zhihu_cookies.txt");
        con = Jsoup.connect("https://www.zhihu.com");//获取连接
        con.header("User-Agent", userAgent);//配置模拟浏览器
        con.cookies(loginCookies);
        try {
            rs = con.execute();
        } catch (Exception e) {
            log.info("读取Cookie登录失败");
            return false;
        }
        Document doc = Jsoup.parse(rs.body());
        if (checkLogin(doc))
            return true;
        log.info("读取cookie登录失败,下面手动登录:");
        return login();
    }

至此，一个简单的模拟登录程序就完成了