---
layout: post
title: Datatables学习小记
date: 2016-02-28
categories: blog
header-color: "#678"
tags: [JavaScript,Datatables,html]
---
>最近在自己写的一些玩具内经常要用到表格，在用html+jquery实现了一些后，深感麻烦，于是便找了一个插件来用用

前段时间，写了几个统计游戏信息的网页：

<a href="http://cabeza.cn/pw.html" target="_blank"><strong>统计游戏内角色物品</strong></a>

<a href="http://cabeza.cn/tianzun.html"><strong>天尊区顶级角色统计</strong></a>

里面都涉及到很多表格的操作，我都是用jquery来简单操纵，对于这样功能不复杂的网页已经足够

但是最近写的几个页面要设计大量关于表格的操作，于是便找了个jquery表格插件Datatables来用用


### 关于Datatables

<a href="http://datatables.club/" target="_blank"><strong>Datatables中文网</strong></a>

<a href="http://datatables.net/" target="_blank"><strong>Datatables官网</strong></a>

### 起步

你需要

1. 引入Datatables的js和css文件
2. 在html内画一个table
3. 执行$('table的选择器').datatable();

参考：<a href="http://datatables.club/manual/install.html" target="_blank">Datatables的安装</a>

### 根据服务器返回的数据初始化表格

Datatables使用的数据源必须是一个数组，数组里的每一项将显示在你定义的行上面，
datatables可以使用三种基本的javascript数据类型来作为数据源：

1. 数组(Arrays [])
2. 对象(objects {})
3. 实例(new myclass())

下面说下用的比较多的从对象初始化

对象格式：

	var vehicleData=
		[
			{
				"id":"12",
				"plateNumber":"苏A0651",
				"ownerName":"张全蛋",
				"ownerTel":"233",
				"ownerIdNumber":"9527",
				"ownerAddress":"南京"
			},
			{
				"id":"13",
				"plateNumber":"苏B001",
				"ownerName":"唐马儒",
				"ownerTel":"344",
				"ownerIdNumber":"1234",
				"ownerAddress":"南京"
			}
		]

html：

	<table id="vehicleTable">
		<thead>
			<tr>
				<th></th>
				<th></th>
				<th></th>
				<th></th>
				<th></th>
				<th></th>
				<th></th>
			</tr>
		</thead>
		<tbody>

		</tbody>
	</table>
	
创建表格：

	$('#vehicleTable').dataTable({
        data:vehicleData,
        columnDefs: [
            {
                targets: 0,
                data:'id',
                title:'id'
            },
            {
                targets:1,
                data:'plateNumber',
                title:'车牌'
            },
            {
                targets:3,
                data:'ownerName',
                title:'车主'
            },
            {
                targets:4,
                data:'ownerTel',
                title:'电话'
            },
            {
                targets:5,
                data:'ownerIdNumber',
                title:'车主身份证'
            },
            {
                targets:6,
                data:'ownerAddress',
                title:'地址'
            }
        ]
    });

使用<kbd>columnDefs</kbd>参数给列定义，使用<kbd>targets</kbd>告诉这个定义是指向哪一列
<kbd>data</kbd>用来设置列的数据源，<kbd>title</kbd>设定该列的标题。

有些数据不希望显示在屏幕上，或者需要什么条件才会显示，可以使用<kbd>visible</kbd>选项来控制

如：

	{
		targets: 0,
		data:'id',
		title:'id',
		visible: false
    }

一般来讲，隐藏时也要禁止该数据参与排序与搜索：

	{
		targets: 0,
		data:'id',
		title:'id',
		visible: false,
		searchable: false，
		orderable: false
	}

这样，一张表格就会展示出来了

*此处仅展示外观仅是表格主体部分，因为一些原因不便于加载js，并不能实现全部功能，*

*一个完整的Datatables表格 [**例子**](http://datatables.club/example/basic_init/flexible_width.html)*
	
<table id="vehicleTable" class="table">
	<thead>
		<tr role="row">
			<th class="sorting" rowspan="1" colspan="1">车牌</th>
			<th class="sorting" rowspan="1" colspan="1">车主</th>
			<th class="sorting" rowspan="1" colspan="1">电话</th>
			<th class="sorting" rowspan="1" colspan="1">车主身份证</th>
			<th class="sorting" rowspan="1" colspan="1">地址</th>
		</tr>
	</thead>
	<tbody>
		<tr role="row" class="odd">
			<td>苏A0651</td>
			<td>张全蛋</td>
			<td>233</td>
			<td>9527</td>
			<td>南京</td>
		</tr>
		<tr role="row" class="odd">
			<td>苏B001</td>
			<td>唐马儒</td>
			<td>344</td>
			<td>1234</td>
			<td>南京</td>
		</tr>
	</tbody>
</table>

如果想给每一行增加几个操作按钮,使用<kbd>defaultContent</kbd>:

	columnDefs: 
		[
			//前面的省略
			{
				targets:7,
				data:null,
				searchable:false,
				orderable:false，
				defaultContent:'<button type="button" class="btn btn-danger btn-sm vehicle-del">删除</button>' +
				'<button type="button" class="btn btn-primary btn-sm vehicle-update">更改</button>'
			}
		]

结果：
		
<table id="vehicleTable" class="table">
	<thead>
		<tr role="row">
			<th class="sorting" rowspan="1" colspan="1">车牌</th>
			<th class="sorting" rowspan="1" colspan="1">车主</th>
			<th class="sorting" rowspan="1" colspan="1">电话</th>
			<th class="sorting" rowspan="1" colspan="1">车主身份证</th>
			<th class="sorting" rowspan="1" colspan="1">地址</th>
			<th class="sorting" rowspan="1" colspan="1">操作</th>
		</tr>
	</thead>
	<tbody>
		<tr role="row" class="odd">
			<td>苏A0651</td>
			<td>张全蛋</td>
			<td>233</td>
			<td>9527</td>
			<td>南京</td>
			<td>
				<button type="button" class="btn btn-danger btn-sm vehicle-del" vehicleid="12" index="0">删除</button>
				<button type="button" class="btn btn-primary btn-sm vehicle-update" vehicleid="12" index="0">更改</button>
			</td>
		</tr>
		<tr role="row" class="odd">
			<td>苏B001</td>
			<td>唐马儒</td>
			<td>344</td>
			<td>1234</td>
			<td>南京</td>
			<td>
				<button type="button" class="btn btn-danger btn-sm vehicle-del" vehicleid="12" index="0">删除</button>
				<button type="button" class="btn btn-primary btn-sm vehicle-update" vehicleid="12" index="0">更改</button>
			</td>
		</tr>
	</tbody>
</table>

我们是需要根据按钮执行一些操作的，因为按钮是动态添加上的，所以监听的绑定要放在回调函数里

	
#### 通过rowCallback回调函数为每一个button添加数据的id

在每一行绘制后，会调用该函数，其包含三个参数：

* row：该行的dom元素
* data：该行的源数据
* index: 该行的序列

在dataTable方法内可以这样写：

	columnDefs: [
		//前面的省略
		rowCallback:function( row, data, index ){
			var id=data.id;
			$('td',row).last().find('button').attr('vehicleId',id).attr("index",index);
		}
	]

#### 在drawCallback回调函数内绑定监听

当每次表格重绘的时候触发drawCallback，比如更新数据后或者创建新的元素

	drawCallback:function(){
            $('.vehicle-del').click(function(){
               dosomethig
            });
            $('.vehicle-update').click(function(){
               dosomethig 
            });
        }

### 进阶：使用api内提供的row()与row().data()实现上文功能

使用两个回调函数来实现一个简单的功能看起来实在是太蠢了，于是遍访api后我发现了这样一个函数

	row()：Working with rows is a fundamental part of DataTables, and you want to be able to easily select the rows that you want from the table.
	
简单来讲，使用row()得到点击事件所发生的行，然后使用row().data()函数拿到该行数据

例子：

	$('#vehicleTable tbody').on('click','button',function(){
		var tr=$(this).parents('tr');
		var rowData=table.api().row(tr).data();
		//此处rowData即该行数据
		dosomethig
	}

