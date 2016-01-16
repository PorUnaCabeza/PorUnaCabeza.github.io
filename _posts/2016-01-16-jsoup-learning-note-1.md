---
layout: post
title: jsoup学习笔记(一):一个简单的html处理工具
date: 2016-01-14
categories: blog
header-color: "#678"
tags: [java,jsoup,html]
---

>因最近在开发中需要对网页做特定处理，如px转为rem、类名的替换、class转为id、对某class进行排序等。
虽然用java里String的一些方法如正则替换等也能做到，但是会非常繁琐，所以抽出时间学习一下html解析器:jsoup，
然后写了一个小小的工具


### 什么是jsoup
jsoup 是一款Java 的HTML解析器，可直接解析某个URL地址、HTML文本内容。它提供了一套非常省力的API，可通过DOM，CSS以及类似于jQuery的操作方法来取出和操作数据。

[jsoup的github地址](https://github.com/jhy/jsoup)

### 如何使用
*使用jsoup要求你有一定的html、css知识*

##### 1、从文件解析一个页面
<pre><code>Document doc=Jsoup.parse(new File("something"),"utf-8");//Document是一个装载html的文档类
</code></pre>

##### 2、选择器
<pre><code>Elements elmt=doc.select("selector"); //与css选择器语法一致
</code></pre>

##### 3、常用方法
<pre><code>elmt.removeClass("className");   //删除指定的class
elmt.attr("id","wtf");           //添加属性
elmt.removeAttr("class");        //删除属性
</code></pre>

有时候我们需要对整个dom树做一次遍历，这时候可以通过NodeVisitor来遍历
<pre><code>public interface NodeVisitor {
    //遍历到节点开始时，调用此方法
    public void head(Node node, int depth);
    //遍历到节点结束时(所有子节点都已遍历完)，调用此方法
    public void tail(Node node, int depth);
}
</code></pre>
方法还有很多，大多数都能见名知意，就不一一列举了
**[jsoup的api](http://jsoup.org/apidocs/)**
具体例子见下文我的小demo

### 一个简单的小demo
**最近在调整html模版中遇到了这么几个需求**

##### 需求一：将指定的class属性替换为id属性,若替换后class属性为空，将class属性删除
一个很简单的功能，但如果纯用java String来做的话会相对很繁琐

用jsoup就很方便了，先用选择器选出指定的class组，对其遍历，删除原class，再添加同名的id属性即可
<pre><code>public void classConvertToId(String className,String idName){
        Elements elmts=doc.select(className);
        for(Element elmt:elmts){
            elmt.removeClass(className.replaceAll("\\.|#",""));
            elmt.attr("id",idName.replaceAll("\\.|#",""));
            if(elmt.attr("class").isEmpty())
                elmt.removeAttr("class");
        }
    }
</code></pre>
是不是很简单呢，有点类似js的风格了

##### 需求二：将页面内所有元素style属性内长度单位px转换为rem
>因美工给我们的页面是以px为单位，而为了适配页面在不同尺寸设备上的效果，需要使用rem单位，因此产生此需求

这里就要用到上文提到的NodeVisitor了

使用NodeVisitor和NodeTraversor进行遍历

<pre><code>NodeVisitor visitor=new NodeVisitor() {
            @Override
            public void head(Node node, int i) {
                if (node.attr("style") != null && !node.attr("style").isEmpty()) {
                    StringBuffer sb = new StringBuffer(node.attr("style"));
			//doSomething here
                }
            }
        };
NodeTraversor tarversor=new NodeTraversor(visitor);
tarversor.traverse(doc);
		
</code></pre>

顺便提一下，NodeTraversor的遍历是深度优先，核心代码如下
<pre><code>
public void traverse(Node root) {
    Node node = root;
    int depth = 0;
    while (node != null) {
        visitor.head(node, depth);
        if (node.childNodeSize() > 0) {
            node = node.childNode(0);
            depth++;
        } else {
            //退栈
            while (node.nextSibling() == null && depth > 0) {
                visitor.tail(node, depth);
                node = node.parent();
                depth--;
            }
            //结束遍历
            visitor.tail(node, depth);
            if (node == root)
                break;
            node = node.nextSibling();
        }
    }
}
</code></pre>

好了扯回来，在遍历的过程中拿到元素style属性的内容(如果有的话)，然后查找内容中是否存在需要转换的值

替换函数:
<pre><code>public void replaceByTarget(String startTarget,String endTarget,StringBuffer sb){
                pxStartIndex=0;
                pxEndIndex=0;
                while(pxEndIndex!=-1){
                    pxEndIndex=sb.indexOf(endTarget,pxEndIndex+1);
                    pxStartIndex=sb.lastIndexOf(startTarget,pxEndIndex)+1;
                    if(pxEndIndex!=-1){
                        try{
                            pxNum = Double.parseDouble(sb.substring(pxStartIndex, pxEndIndex).trim());
                        }catch(NumberFormatException e){
                            continue;
                        }
                        double remNum=pxNum/multiple;	//将px转换为rem，multiple为转换系数
                        sb.replace(pxStartIndex, pxEndIndex+2, remNum+"rem");
                        pxStartIndex=0;
                        pxEndIndex=0;
                    }
                }
            }
</code></pre>

至此，这个需求功能基本就实现了

完整代码可以移步到我的github上:
**[cabezaUtil](https://github.com/PorUnaCabeza/CabezaUtil/blob/master/src/util/HtmlModelUtil.java)**





