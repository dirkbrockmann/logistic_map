import * as d3 from "d3"
import './style.css'

const width = 600, height = 400, padding=40;
const margin = {top:5, bottom:50,left:60,right:0};

let lambda_N = width;

const transient = 1000, record = 400;

var lambda0 = 2.8;
var lambda1 = 3.99;
var lambda = lambda0;

function f (x,lambda){ return lambda * x * (1 - x); };

var X = d3.scale.linear()
    .domain([lambda0,lambda1])
    .range([0, width]);

var Y = d3.scale.linear()
    .domain([0,1])
    .range([height,0]);

var xAxis = d3.svg.axis()
	.orient("bottom")
    .scale(X);

var yAxis = d3.svg.axis()
	.orient("left")
    .scale(Y);

var line = d3.svg.line()
    .x(function(d) { return X(d.x); })
    .y(function(d) { return Y(d.y); });

const svg1 = d3.select("#panel_1").append("svg")
	.attr("width", width+margin.left+margin.right)
	.attr("height", height+margin.top+margin.bottom)

const bifu = svg1.append("g")
	.attr("transform","translate("+margin.left+","+margin.top+")")
	.on("mouseover",function(){
		d3.selectAll(".fadenkreuz").transition().duration(100).style("opacity",1)
		d3.selectAll(".coord").transition().duration(100).style("opacity",1)
	})
	.on("mouseout",function(){
		d3.selectAll(".fadenkreuz").transition().duration(100).style("opacity",0)	
		d3.selectAll(".coord").transition().duration(100).style("opacity",0)
	})
	.on("mousemove",function(){
		let p = d3.mouse(this)
		d3.select("#vertical").attr("x1",p[0]).attr("x2",p[0])
		d3.select("#horizonal").attr("y1",p[1]).attr("y2",p[1])
		d3.select(".coord").datum(p).attr("transform",function(d){
				return "translate("+ (d[0]+5) +","+(d[1]-5)+")"
			})
			.text(function(d){
				return "("+d3.round(X.invert(d[0]),-Math.floor(Math.log10(X.domain()[1]-X.domain()[0]))+2)+","+d3.round(Y.invert(d[1]),-Math.floor(Math.log10(Y.domain()[1]-Y.domain()[0]))+2)+")"
			})
			
	});

var xa = bifu.append("g")
    .attr("class", "x axis")
	.attr("transform","translate(0,"+height+")")
    .call(xAxis);

var ya = bifu.append("g")
    .attr("class", "y axis")
    .call(yAxis);

const resetbutton = svg1.append("g").attr("transform","translate("+(width-50)+","+(height+30)+")");

bifu.append("text")
			.attr("class","axislabel")
            .attr("text-anchor", "middle")  
            .attr("transform", "translate("+ (-padding) +","+(height/2)+")rotate(-90)")
            .text("X");

bifu.append("text")
			.attr("class","axislabel")
			.attr("text-anchor", "middle")  
            .attr("transform", "translate("+ (width/2) +","+(height+(padding))+")")
            .text("\u03BB");

bifu.append("line").attr("class","fadenkreuz")
			.attr("id","vertical")
			.attr("x1",X.range()[0])
			.attr("x2",X.range()[0])
			.attr("y1",Y.range()[0])
			.attr("y2",Y.range()[1])
			.style("stroke-dasharray", ("3, 3"))
			
bifu.append("line").attr("class","fadenkreuz")
			.attr("id","horizonal")
			.attr("x1",X.range()[0])
			.attr("x2",X.range()[1])
			.attr("y1",Y.range()[0])
			.attr("y2",Y.range()[0]).style("stroke-dasharray", ("3, 3"))	

bifu.append("text").datum([0,0]).attr("class","coord")
			.attr("transform",function(d){
				return "translate("+ (d[0]) +","+(d[1])+")"
			})
			.text(function(d){
				return "("+X.invert(d[0])+","+Y.invert(d[1])+")"
			}).style("opacity",0)



resetbutton.append("rect").attr("class","buttonrect").attr("width", 50)
		.attr("height", 20)
		.attr("rx", 3)
		.attr("ry", 3)
		.on("mouseover",function(d){d3.select(this).style("fill","#FFFFDD")})
		.on("mouseout",function(d){d3.select(this).style("fill",null)})
		.on("click",function(){
			clearInterval(iterate)
			lambda0 = 2.8;
			lambda1 = 3.99;
			X.domain([lambda0,lambda1]);
			Y.domain([0,1]);
			dl = (lambda1-lambda0)/lambda_N;
			lambda=lambda0;
			xoft = [];
			let x0 = 0.5;
			d3.selectAll(".dot").data(xoft).exit().remove();
			xa.transition().call(xAxis);
			ya.transition().call(yAxis);
			iterate = setInterval(compute, 0)
		})
		
resetbutton.append("text").text("reset").attr("class","buttontext")
		.attr("transform","translate(25,14)")
			
var rl=[{x:X.domain()[0],y:Y.domain()[0]},{x:X.domain()[0],y:Y.domain()[1]}];

bifu.append("path").datum(rl)
	.attr("d",line)
	.attr("id","redline")

var brush = d3.svg.brush().x(X).y(Y)
      	.on("brush",brushmove)
		.on("brushend",brushend)
		.on("brushstart",brushstart)

bifu.append("g")
      .attr("class", "brush")
		.call(brush);


var dl = (lambda1-lambda0)/lambda_N;
var xoft = [];
var x0 = 0.5;

var iterate = setInterval(compute, 0)


function compute(){
	var rl=[{x:X.domain()[0],y:Y.domain()[0]},{x:X.domain()[0],y:Y.domain()[1]}];
	
	lambda+=dl;

	x0 += 0.01* Math.random();
	var i = 0;
	let xr = Y.domain();
	while( i++ < transient ){ x0 = f(x0,lambda);}
	
	var wurst;
	lambda < 3 ? wurst = 2 : (lambda < 1+Math.sqrt(6) ? wurst = 4 : (lambda < 3.54409 ? wurst = 8 : wurst=record));
	
	var i = 0;
	while(i++<wurst){
		x0 = f(x0,lambda);
		if(x0 < xr[1] && x0 > xr[0]){
			xoft.push({y:x0,x:lambda});
		}

	}
	

	rl[0].x=lambda;
	rl[1].x=lambda;

	var dots = bifu.selectAll(".dot").data(xoft)
	dots.enter().append("circle")
		.attr("class","dot")
		.attr("r",.75)
		.attr("cx",function(d){return X(d.x)})
		.attr("cy",function(d){return Y(d.y)})
	
	d3.select("#redline").datum(rl).attr("d",line).style("opacity",1);
	
	if(lambda>lambda1){
				d3.select("#redline").transition().duration(100).style("opacity",0)
				clearInterval(iterate);
	};
}

function brushmove(){};

function brushstart(){
	d3.select(this).style("opacity",null)
}

function brushend(){
	clearInterval(iterate);
	var wurst = brush.extent();
	X.domain([wurst[0][0],wurst[1][0]]);
	Y.domain([wurst[0][1],wurst[1][1]]);
	lambda0=wurst[0][0];
	lambda1=wurst[1][0];
	dl = (lambda1-lambda0)/lambda_N;
	lambda=lambda0;
	xoft = [];
	x0 = 0.5;
	d3.selectAll(".dot").data(xoft).exit().remove();
	xa.transition().call(xAxis);
	ya.transition().call(yAxis);
	iterate = setInterval(compute, 0)
	d3.select(this).style("opacity",0)
};

var cw_width=500, cw_height=500;
var cw_margin = {top:5, bottom:100,left:60,right:110}
var xdata = d3.range(0,1+0.005,0.005);
var Lpos = {x:0,y:0,width:cw_width,height:10};	
var L = 2.7;


var K = 200;
var x01 = 0.1;
var x02 = 0.2;
var trace1 = compute_trace(x01,K).attractor;
var trace2 = compute_trace(x02,K).attractor;
var transient1 = compute_trace(x01,K).transient;
var transient2 = compute_trace(x02,K).transient;

var labels = [
	{selected:true,label:"f"},
	{selected:false,label:"f\u25CBf"},
	{selected:false,label:"f\u25CBf\u25CBf"},
	{selected:false,label:"f\u25CBf\u25CBf\u25CBf"}
]

var choices = [
	{selected:true,label:"attractor"},
	{selected:true,label:"transient"}
]

var orbits = [
	{selected:true,label:"orbit 1"},
	{selected:true,label:"orbit 2"}
]

function show(){
		d3.select("#Xoft1").style("opacity", (choices[0].selected && orbits[0].selected) ? 1 : 0)
		d3.select("#Xoft2").style("opacity", (choices[0].selected && orbits[1].selected) ? 1 : 0)
		d3.select("#Xtrans1").style("opacity", (choices[1].selected && orbits[0].selected) ? 1 : 0)
		d3.select("#Xtrans2").style("opacity", (choices[1].selected && orbits[1].selected) ? 1 : 0)
		X0slider.style("opacity", (orbits[0].selected) ? 1 : 0)
		X1slider.style("opacity", (orbits[1].selected) ? 1 : 0)
}

function compute_trace(x0,steps){
	var xarr=[{x:x0,y:0}];
	var i=0;
	while(i++<steps){
		let x1 = L*x0*(1-x0);
		xarr.push({x:x0,y:x1});
		xarr.push({x:x1,y:x1});
		x0=x1;
	}
	return {transient:xarr.slice(0,K-1), attractor:xarr.slice(K,xarr.length)};
}


var svg2 = d3.select("#panel_2").append("svg")
	.attr("width", cw_width+cw_margin.left+cw_margin.right)
	.attr("height", cw_height+cw_margin.top+cw_margin.bottom)

var X1 = d3.scale.linear().domain([0,1]).range([0, cw_width]);
var Y1 = d3.scale.linear().domain([0,1]).range([cw_height,0]);

var xAxis1 = d3.svg.axis().orient("bottom").scale(X1);
var yAxis1 = d3.svg.axis().orient("left").scale(Y1);
	
var cobweb = svg2.append("g")
	.attr("transform","translate("+cw_margin.left+","+cw_margin.top+")")
	
var xa1 = cobweb.append("g")
    .attr("class", "x axis")
	.attr("transform","translate(0,"+cw_height+")")
    .call(xAxis1);

var ya1 = cobweb.append("g")
    .attr("class", "y axis")
    .call(yAxis1);
	
cobweb.append("text")
			.attr("class","axislabel")
            .attr("text-anchor", "middle")  
            .attr("transform", "translate("+ (-padding) +","+(cw_height/2)+")rotate(-90)")
            .text("X(n+1)");

cobweb.append("text")
			.attr("class","axislabel")
			.attr("text-anchor", "middle")  
            .attr("transform", "translate("+ (cw_width/2) +","+(cw_height+(padding))+")")
            .text("X(n)");


var DG = d3.svg.line()
    .x(function(x) { return X1(x); })
    .y(function(x) { return Y1(x); })

var F1 = d3.svg.line()
    .x(function(x) { return X1(x); })
    .y(function(x) { return Y1( f(x,L) ); })

var F2 = d3.svg.line()
    .x(function(x) { return X1(x); })
    .y(function(x) { return Y1( f(f(x,L),L) ); })

var F3 = d3.svg.line()
    .x(function(x) { return X1(x); })
    .y(function(x) { return Y1(f(f(f(x,L),L),L)); })

var F4 = d3.svg.line()
    .x(function(x) { return X1(x); })
    .y(function(x) { return Y1(f(f(f(f(x,L),L),L),L)); })

var Xoft = d3.svg.line()
    .x(function(d) { return X1(d.x); })
    .y(function(d) { return Y1(d.y); })

			

cobweb.append("path")
			.attr("id","DG")
			.attr("class","function")
			.attr("d",DG(xdata))
			.style("stroke","black")
			.style("stroke-width","1.5px")
			.style("stroke-dasharray", ("3, 3"))

var fc = d3.scale.category20c();			

for(let i=0;i<4;i++) {						
cobweb.append("path")
			.attr("id","F"+(i+1))
			.attr("class","function")
			.attr("d",F1(xdata))
			.style("stroke",fc(i))
			.style("opacity",labels[i].selected ? 1 : 0)

}

cobweb.append("path")
			.attr("id","Xtrans2")
			.attr("class","transient")
			.attr("d",Xoft(transient2))
			.style("stroke","#2ca02c")

cobweb.append("path")
			.attr("id","Xtrans1")
			.attr("class","transient")
			.attr("d",Xoft(transient1))
			.style("stroke","#d62728")

cobweb.append("path")
			.attr("id","Xoft2")
			.attr("class","trace")
			.attr("d",Xoft(trace2))
			.style("stroke","#2ca02c")

cobweb.append("path")
			.attr("id","Xoft1")
			.attr("class","trace")
			.attr("d",Xoft(trace1))
			.style("stroke","#d62728")



var label = svg2.selectAll(".flabel").data(labels).enter().append("g")
	.attr("class","flabel")
	.attr("transform",function(d,i){return "translate("+(20+cw_width+cw_margin.left)+","+(cw_margin.top+(i+1)*20)+")"})


var choice = svg2.selectAll(".clabel").data(choices).enter().append("g")
	.attr("class","clabel")
	.attr("transform",function(d,i){return "translate("+(20+cw_width+cw_margin.left)+","+(100+cw_margin.top+(i+1)*20)+")"})

var orbit = svg2.selectAll(".olabel").data(orbits).enter().append("g")
	.attr("class","olabel")
	.attr("transform",function(d,i){return "translate("+(20+cw_width+cw_margin.left)+","+(200+cw_margin.top+(i+1)*20)+")"})

label.append("circle")
	.attr("r",7)
	.style("fill",function(d,i){return d.selected ? fc(i): "white"})
	.on("mouseover",function(){
		d3.select(this).style("stroke","black").style("stroke-width","2px")
	})
	.on("mouseout",function(){
		d3.select(this).style("stroke",null).style("stroke-width",null)
	})
	.on("click",function(d,i){
		d.selected=!d.selected;
		d3.select(this).style("fill",d.selected ? fc(i): "white")
		d3.select("#F"+(i+1)).style("opacity",labels[i].selected ? 1 : 0)
	})
	
choice.append("circle")
	.attr("r",7)
	.style("fill",function(d,i){return d.selected ? fc(i+5): "white"})
	.on("mouseover",function(){
		d3.select(this).style("stroke","black").style("stroke-width","2px")
	})
	.on("mouseout",function(){
		d3.select(this).style("stroke",null).style("stroke-width",null)
	})
	.on("click",function(d,i){
		d.selected=!d.selected;
		d3.select(this).style("fill",d.selected ? fc(i+5): "white")
		choices[i].selected=d.selected;
				show();
	})

orbit.append("circle")
	.attr("r",7)
	.style("fill",function(d,i){return d.selected ? (i==0 ? "red" : "green"): "white"})
	.on("mouseover",function(){
		d3.select(this).style("stroke","black").style("stroke-width","2px")
	})
	.on("mouseout",function(){
		d3.select(this).style("stroke",null).style("stroke-width",null)
	})
	.on("click",function(d,i){
		d.selected=!d.selected;
		d3.select(this).style("fill",d.selected ? (i==0 ? "red" : "green"): "white")
				orbits[i].selected=d.selected;
		show();
	})	



label.append("text").text(function(d){return d.label})
	.style("fill",function(d,i){return fc(i)})
	.attr("transform","translate(20,6)")

choice.append("text").text(function(d){return d.label})
	.style("fill",function(d,i){return fc(i+5)})
	.attr("transform","translate(20,6)")
	
orbit.append("text").text(function(d){return d.label})
	.style("fill",function(d,i){return i==0 ? "red" : "green"})
	.attr("transform","translate(20,6)")	

var Lscale = d3.scale.linear()
    .domain([1,4])
	.range([0, cw_width])
    .clamp(true);

var Lbrush = d3.svg.brush()
    .x(Lscale)
    .extent([L, L])
    .on("brush", Lbrushed);
	
var L_axis = d3.svg.axis()
      .scale(Lscale)
      .orient("bottom")
      .tickFormat(function(d) { return d3.round(d,3); })
      .tickSize(0)
      .tickPadding(8)

var Laxis = svg2.append("g")
	.attr("transform","translate("+cw_margin.left+","+ (cw_height+cw_margin.top+cw_margin.bottom-30)+ ")")
    .attr("class", "x saxis")
    .call(L_axis)
  	.select(".domain")
  	.select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
    .attr("class", "halo");

var Lslider = svg2.append("g")
	.attr("transform","translate("+cw_margin.left+","+ (cw_height+cw_margin.top+cw_margin.bottom-30)+ ")")
    .attr("class", "slider")
    .call(Lbrush);

Lslider.selectAll(".extent,.resize").remove();

Lslider.select(".background")
    .attr("height", Lpos.height)
	.attr("transform", "translate(0," + ( -Lpos.height/2) + ")")


var Lhandle = Lslider.append("circle")
    .attr("class", "handle")
    .attr("r", 5)
	.style("fill","#1f77b4")


var Ltag = Lslider.append("text").text("")
		.attr("transform","translate(0,-15)").style("text-anchor","middle")
		.attr("class","tag")

function Lbrushed() {
	  var value = Lbrush.extent()[0];

	  if (d3.event.sourceEvent) { // not a programmatic event
	    value = Lscale.invert(d3.mouse(this)[0]);
	    Lbrush.extent([value, value]);
	  }

	  Lhandle.attr("cx", Lscale(value));
	  Ltag.attr("x",Lscale(value)).text("\u03BB = "+d3.round(value,3))

	  L = value;

	  d3.select("#F1")
	  	  .attr("d",F1(xdata))
	  d3.select("#F2")
	  	  .attr("d",F2(xdata))
	  d3.select("#F3")
	  	  .attr("d",F3(xdata))
	  d3.select("#F4")
	  	  .attr("d",F4(xdata))
	  d3.select("#Xoft1")
	  	  .attr("d",Xoft(compute_trace(x01,K).attractor))
	  d3.select("#Xoft2")
	  	  .attr("d",Xoft(compute_trace(x02,K).attractor))
	  d3.select("#Xtrans1")
	  	  .attr("d",Xoft(compute_trace(x01,K).transient))
	  d3.select("#Xtrans2")
	  	  .attr("d",Xoft(compute_trace(x02,K).transient))

	}
	
	
Lslider.call(Lbrush.event)
	.transition() // gratuitous intro!
	.duration(750)
	.call(Lbrush.extent([L, L]))
	.call(Lbrush.event);
    
	
var X0scale = d3.scale.linear()
    .domain([0.001,0.999])
	.range([0, cw_width])
    .clamp(true);

var X0brush = d3.svg.brush()
    .x(X0scale)
    .extent([x01, x01])
    .on("brush", X0brushed);
	
var X0slider = svg2.append("g")
	.attr("transform","translate("+cw_margin.left+","+ (cw_height+cw_margin.top)+ ")")
    .attr("class", "slider")
    .call(X0brush);

X0slider.selectAll(".extent,.resize").remove();

X0slider.select(".background")
    .attr("height", Lpos.height)
	.attr("transform", "translate(0," + ( -Lpos.height/2) + ")")

var X0handle = X0slider.append("circle")
    .attr("class", "handle")
    .attr("r", 5)
	.style("fill","red");

var X0tag = X0slider.append("text").text("x0")
	.attr("transform","translate(5,-10)")//.style("text-anchor","middle")
	.attr("class","tag")

function X0brushed() {
	  var value = X0brush.extent()[0];

	  if (d3.event.sourceEvent) { // not a programmatic event
	    value = X0scale.invert(d3.mouse(this)[0]);
	    X0brush.extent([value, value]);
	  }

	  X0handle.attr("cx", X0scale(value));
	  X0tag.attr("x",X0scale(value)).text("x0 = "+d3.round(value,3))

	  x01 = value;
	  d3.select("#Xoft1")
	  	  .attr("d",Xoft(compute_trace(x01,K).attractor))
	  d3.select("#Xtrans1")
	  	  .attr("d",Xoft(compute_trace(x01,K).transient))	  

	}
	
	
X0slider.call(X0brush.event)
	.transition() // gratuitous intro!
	.duration(750)
	.call(X0brush.extent([x01, x01]))
	.call(X0brush.event);
    


var X1scale = d3.scale.linear()
    .domain([0.001,0.999])
	.range([0, cw_width])
    .clamp(true);

var X1brush = d3.svg.brush()
    .x(X1scale)
    .extent([x02, x02])
    .on("brush", X1brushed);
	
var X1slider = svg2.append("g")
	.attr("transform","translate("+cw_margin.left+","+ (cw_height+cw_margin.top-15)+ ")")
    .attr("class", "slider")
    .call(X1brush);

X1slider.selectAll(".extent,.resize").remove();

X1slider.select(".background")
    .attr("height", Lpos.height)
	.attr("transform", "translate(0," + ( -Lpos.height/2) + ")")

var X1handle = X1slider.append("circle")
    .attr("class", "handle")
    .attr("r", 5)
	.style("fill","green");

var X1tag = X1slider.append("text").text("x0")
	.attr("transform","translate(5,-10)")//.style("text-anchor","middle")
	.attr("class","tag")

function X1brushed() {
	  var value = X1brush.extent()[0];

	  if (d3.event.sourceEvent) { // not a programmatic event
	    value = X1scale.invert(d3.mouse(this)[0]);
	    X1brush.extent([value, value]);
	  }

	  X1handle.attr("cx", X1scale(value));
	  X1tag.attr("x",X1scale(value)).text("x0 = "+d3.round(value,3))

	  x02 = value;
	  d3.select("#Xoft2")
	  	  .attr("d",Xoft(compute_trace(x02,K).attractor))
	  d3.select("#Xtrans2")
	  	  .attr("d",Xoft(compute_trace(x02,K).transient))
	  

	}
	
	
X1slider.call(X1brush.event)
	.transition() // gratuitous intro!
	.duration(750)
	.call(X1brush.extent([x02, x02]))
	.call(X1brush.event);
    

	

	
