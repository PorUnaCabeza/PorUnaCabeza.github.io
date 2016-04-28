---
layout: post
title: 爬虫数据去重小记
date: 2016-04-28
categories: blog
header-color: "#678"
tags: [html,java]
---
>最近把之前写的知乎爬虫做了些调整，在数据去重这块遇到了点问题

写毕设之余将知乎爬虫算是重写了一遍，会依次抓取各用户关注的人信息，数据量呈指数级递增，因为用户的关注是交叉式的，不可避免的会遇到数据去重的问题

到目前为止，我抓取了15.8万条用户信息，1141.3万条用户之间关系信息，我只对这15.8万用户的url进行去重，按道理讲用一个HashSet就可以了，
无奈阿里云服务器内存是1G的，用HashSet加载后就报*CodeCache is full*错误，只好再研究别的去重方式喽

#### 哈希表

平常用的最多的就是它，没啥讲的，简单快速准确，缺点是比较废空间，当集合比较小时这个问题不显著，但是当集合巨大时，哈希表存储效率低的问题就显现出来了。

比如说，一个象 Yahoo,Hotmail 和 Gmai 那样的公众电子邮件（email）提供商，总是需要过滤来自发送垃圾邮件的人（spamer）的垃圾邮件。
一个办法就是记录下那些发垃圾邮件的 email 地址。由于那些发送者不停地在注册新的地址，全世界少说也有几十亿个发垃圾邮件的地址，
将他们都存起来则需要大量的网络服务器。如果用哈希表，每存储一亿 个 email 地址， 就需要 1.6GB 的内存（用哈希表实现的具体办法是将每一个 email 地址对应成一个八字节的信息指纹）
然后将这些信息指纹存入哈希表，由于哈希表的存储效率一般只有 50%，因此一个 email 地址需要占用十六个字节。一亿个地址大约要 1.6GB， 即十六亿字节的内存）。
因此存贮几十亿个邮件地址可能需要上百 GB 的内存。除非是超级计算机，一般服务器是无法存储的。


#### 布隆过滤器

它的优点是空间效率和查询时间都远远超过一般的算法，缺点是有一定的误识别率（Bloom Filter报告某一元素存在于某集合中，但是实际上该元素并不在集合中）
和删除困难，但是没有识别错误的情形（某个元素确实在该集合中，那么Bloom Filter 是不会报告该元素不存在于集合中的，所以不会漏报）。

直接上代码

	public class BloomFilter {

		private static final int DEFAULT_SIZE = 2 << 24;//比特长度
		private static final int[] seeds = {3,5,7, 11, 13, 31, 37, 61};
		private static BitSet bits = new BitSet(DEFAULT_SIZE);
		private static SimpleHash[] func = new SimpleHash[seeds.length];

		public static void add(String value)
		{
			if(value != null){
				for(SimpleHash f : func)
					bits.set(f.hash(value),true);
			}
		}

		public static boolean contains(String value)
		{
			if(value == null) return false;
			boolean ret = true;
			for(SimpleHash f : func){
				if(!bits.get(f.hash(value)))
					return false;
			}
			return true;
		}
	}

	class SimpleHash {

		private int cap;
		private int seed;

		public  SimpleHash(int cap, int seed) {
			this.cap = cap;
			this.seed = seed;
		}

		public int hash(String value) {
			int result = 0;
			int len = value.length();
			for (int i = 0; i < len; i++) {
				result = seed * result + value.charAt(i);
			}
			return (cap - 1) & result;
		}
	}
	
布隆过滤器需要的是一个位数组（这个和位图有点类似）和k个映射函数（和Hash表类似），在初始状态时，对于长度为m的位数组array，
它的所有位都被置为0。对于有n个元素的集合S={s1,s2......sn}，通过k个映射函数{f1,f2,......fk}，将集合S中的每个元素sj(1<=j<=n)映射为k个值{g1,g2......gk}，
然后再将位数组array中相对应的array[g1],array[g2]......array[gk]置为1；如果要查找某个元素item是否在S中，
则通过映射函数{f1,f2.....fk}得到k个值{g1,g2.....gk}，然后再判断array[g1],array[g2]......array[gk]是否都为1，若全为1，则item在S中，
否则item不在S中。这个就是布隆过滤器的实现原理。

#### redis去重

最近才尝试使用redis（以前项目都是玩具，也用不到），感觉真好用啊，现在新写东西都在想“这个要不要引入redis呢”哈哈

redis去重我是用的set数据格式，简单易懂，最常见，直接把要去重的数据sadd，需要计数就scard

简单的代码：

	 public static boolean put(String value){
        if(jedis.sismember(FILTER_NAME,value)){
            return true;//存在
        }else{
            jedis.sadd(FILTER_NAME,value);
            return false;//不存在并添加
        }
    }
	
因为我的爬虫里待爬取列表也是用的redis，这样就太方便后台做一些交集、差集的运算，用起来很爽

当然这是最简单的用法，还有基于zset、redis+lua脚本实现布隆过滤器等更强大的数据去重

可以翻阅  <a href="http://www.csdn.net/article/a/2016-03-16/15836359" target="_blank"><strong>漫谈redis在运维数据分析中的去重统计方式</strong></a>



