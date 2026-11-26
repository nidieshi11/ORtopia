/* Five physical fulfillment processes. Camera movement and walking paths illustrate
   the handoffs; objective values and constraints are obtained from the bound instance. */
(() => {
'use strict';
const labs=window.ORTOPIA_LABS;
const limit=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const phase=(x,a,b)=>limit((x-a)/(b-a));
const mix=(a,b,t)=>a+(b-a)*limit(t);
const lerp=(a,b,t)=>[mix(a[0],b[0],t),mix(a[1],b[1],t)];
const smooth=t=>t*t*(3-2*t);
const num=(x,d=1)=>Number(x.toFixed(d)).toLocaleString('zh-CN');
const ink='#2d4747',cream='#fff8de',red='#ab533f',green='#337568',gold='#e3ac50',blue='#4a7e98';
function travel(pts,t){
 const sizes=pts.slice(1).map(([x,y],j)=>Math.hypot(x-pts[j][0],y-pts[j][1]));
 let remaining=limit(t)*sizes.reduce((a,b)=>a+b,0);
 for(let j=0;j<sizes.length;j++){
  if(remaining<=sizes[j]||j===sizes.length-1)return lerp(pts[j],pts[j+1],remaining/(sizes[j]||1));
  remaining-=sizes[j];
 }
 return pts[0];
}
function canvasPen(canvas,focus,view,bounds=1270,near=545){
 const c=canvas.getContext('2d'),w=canvas.width,h=canvas.height,ratio=w/h;
 const vh=ratio<1.3?near*.78:near, z=view?Math.min(w/(bounds+30),h/510):h/vh;
 const vx=Math.max(0,Math.min(bounds-w/z,focus[0]-w/(2*z))),vy=view?245:focus[1]-24;
 const offset=view?(w-bounds*z)/2:-vx*z;
 c.setTransform(1,0,0,1,0,0);c.fillStyle='#dce1cf';c.fillRect(0,0,w,h);
 c.setTransform(z,0,0,z,offset,h/2-vy*z);
 const rect=(x,y,ww,hh,fill)=>{c.fillStyle=fill;c.fillRect(x,y,ww,hh);};
 function poly(p,col){c.fillStyle=col;c.beginPath();p.forEach(([x,y],j)=>j?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();}
 function line(p,col,sw=2,dash=[]){c.strokeStyle=col;c.lineWidth=sw;c.lineJoin='round';c.lineCap='round';c.setLineDash(dash);c.beginPath();p.forEach(([x,y],j)=>j?c.lineTo(x,y):c.moveTo(x,y));c.stroke();c.setLineDash([]);}
 function oval(x,y,rx,ry,col){c.fillStyle=col;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fill();}
 function txt(t,x,y,size=14,col=ink,align='center'){c.fillStyle=col;c.font='650 '+size+'px system-ui, sans-serif';c.textAlign=align;c.textBaseline='middle';c.fillText(t,x,y);}
 function tag(t,x,y,bg=ink,sz=14){
  c.font='650 '+sz+'px system-ui, sans-serif';const width=c.measureText(t).width+14;
  rect(x-width/2,y-sz*.8,width,sz*1.65,bg);txt(t,x,y,sz,cream);
 }
 return {c,rect,poly,line,oval,txt,tag,w,h,z,vx,vw:w/z,bounds};
}
function block(g,x,y,w,h,d,col,roof='#dfd2b4',side='#a89d84'){
 g.poly([[x-1,y],[x+w,y],[x+w+d+13,y-d*.52+5],[x+d+9,y+4]],'#53644f26');
 g.rect(x,y-h,w,h,col);g.poly([[x+w,y-h],[x+w+d,y-h-d*.5],[x+w+d,y-d*.5],[x+w,y]],side);
 g.poly([[x,y-h],[x+d,y-h-d*.5],[x+w+d,y-h-d*.5],[x+w,y-h]],roof);
}
function road(g,p,width=40){g.line(p,'#bab8a0',width+12);g.line(p,'#ece2c9',width+8);g.line(p,'#85928b',width);g.line(p,'#ece1bc',2,[14,16]);}
function walk(g,p,width=17){g.line(p,'#bdaf91',width+3);g.line(p,'#e7d9b7',width);}
function tree(g,x,y,s=1){
 g.oval(x+4*s,y+1,14*s,3*s,'#60765945');g.line([[x,y],[x,y-22*s]],'#827359',4*s);
 g.oval(x-5*s,y-24*s,10*s,12*s,'#698c72');g.oval(x+4*s,y-28*s,11*s,14*s,'#90aa80');g.oval(x+5*s,y-32*s,7*s,9*s,'#afbe8e');
}
function house(g,x,y,w,h,col,name,kind='apart'){
 block(g,x,y,w,h,17,col,'#e0d9bc','#a7ad91');
 if(kind==='store'){
  g.rect(x+7,y-h+12,w-14,h-18,'#8eada0');
  for(let j=0;j<Math.floor(w/12);j++)g.poly([[x+12*j,y-h+12],[x+12*j+12,y-h+12],[x+12*j+17,y-h+21],[x+12*j+4,y-h+21]],j%2?'#f0d9b3':red);
 }else{
  for(let wy=y-h+8;wy<y-20;wy+=15)for(let wx=x+7;wx<x+w-10;wx+=17){g.rect(wx,wy,9,10,'#c1c5aa');g.rect(wx+1,wy+1,7,7,'#688887');}
  g.rect(x+w*.4,y-20,12,20,'#546d65');
 }
 if(name)g.tag(name,x+w/2,y-h-12,ink,13);
}
function warehouse(g,x,y,w,h,label,bay=2){
 block(g,x,y,w,h,20,'#c4baa0','#cfd1b9','#989c88');
 for(let j=0;j<4;j++){const xx=x+j*w/4;g.poly([[xx,y-h],[xx+w/4,y-h],[xx+w/4,y-h-12]],'#8ca19a');}
 for(let j=0;j<bay;j++){const xx=x+12+j*(w-18)/bay;g.rect(xx,y-39,(w-23)/bay-7,39,'#50635b');g.rect(xx+2,y-36,(w-23)/bay-11,9,'#8b9b8a');}
 if(label)g.tag(label,x+w/2,y-h+16,'#496b64',14);
}
function carton(g,x,y,color=gold,size=10){block(g,x-size/2,y,size,size*.76,size*.25,color,'#e9c98b','#ac7d45');g.rect(x-1,y-size*.72,2,size*.7,'#f3da9b');}
function person(g,x,y,shirt,walkPhase=0,parcel=false){
 const v=Math.sin(walkPhase)*3;g.oval(x+1,y+1,5.8,2,'#839280');g.line([[x-1,y-10],[x-3-v,y],[x-1,y-9],[x+4+v,y]],'#42545a',2.3);
 g.rect(x-3.6,y-18,7.2,9,shirt);g.oval(x,y-21,3.7,4.1,'#bc8b64');g.oval(x-.3,y-23.2,3.5,1.9,'#5b5344');if(parcel)carton(g,x+5,y-9,'#bd894c',6);
}
function truck(g,x,y,col,dir=1,type='box'){
 const c=g.c;c.save();c.translate(x,y);c.scale(dir,1);
 g.oval(-4,1,40,6,'#47594b52');g.rect(-37,-8,67,7,'#465658');block(g,-36,-7,41,type==='flat'?8:23,6,col,'#dbd3b1','#728982');
 g.poly([[8,-24],[22,-24],[32,-14],[32,-5],[8,-5]],col);g.poly([[14,-22],[21,-22],[28,-15],[14,-15]],'#c0d8cb');
 for(const k of [-24,19]){g.oval(k,-3,6,6,'#354547');g.oval(k,-3,2.8,2.8,'#c1c4af');}g.rect(28,-12,4,3,'#f7d98c');c.restore();
}
function rider(g,x,y,angle,parcel){
 g.oval(x-8,y,5,5,'#32494b');g.oval(x+8,y,5,5,'#32494b');g.line([[x-8,y],[x,y-8],[x+8,y],[x+4,y-11]],green,3);g.line([[x-2,y-15],[x+3,y-10],[x-2+Math.sin(angle)*2,y-3]],ink,3);g.oval(x-1,y-18,3.2,3.6,'#ba916d');g.oval(x-1,y-20,4,2,gold);if(parcel)carton(g,x-10,y-6,gold,8);
}
function grove(g,x,y,n=6){for(let j=0;j<n;j++)tree(g,x+42*j,y+Math.sin(j*1.7)*8,.75+(j%3)*.12);}
function water(g,p,w){
 g.line(p,'#acb898',w+13);g.line(p,'#a4cabb',w+5);g.line(p,'#82b4b0',w);
 for(let k=0;k<p.length-1;k++){const q=lerp(p[k],p[k+1],.53);g.line([[q[0]-14,q[1]],[q[0]+5,q[1]+1],[q[0]+13,q[1]-1]],'#bddecf',2);}
}
const chapter=(label,at)=>({label,at});
function boat(g,x,y,f){
 g.line([[x-10,y-9],[x-21,y-24]],'#b9dccb',2);g.poly([[x-10,y-17],[x+7,y-17],[x+12,y+4],[x+2,y+20],[x-9,y+5]],'#4c7779');
 g.rect(x-7,y-13,13,17,'#e8d3a0');g.rect(x-5,y-11,9,7,'#8baba1');g.line([[x+7,y-11],[x+9,y-25]],'#986c53',2);
}
function forklift(g,x,y,f,heading=1){
 const c=g.c;c.save();c.translate(x,y);c.scale(heading,1);
 g.oval(0,0,16,3,'#65776750');g.rect(-15,-11,21,10,'#c9994c');g.rect(-12,-21,3,13,ink);g.rect(-12,-22,16,3,ink);
 g.rect(5,-25,3,24,'#446662');g.rect(7,-2,13,2,'#446662');g.oval(-9,0,3.7,3.7,ink);g.oval(4,0,3.4,3.4,ink);
 g.oval(-3,-16,3.1,3.1,'#b78968');g.rect(-6,-13,7,6,green);c.restore();
}
function quayScene(g,t){
 walk(g,[[441,39],[473,103],[482,176],[501,232],[508,273]],15);
 house(g,390,93,45,40,'#b9b298','');g.rect(503,159,40,12,'#a8997c');
 for(let j=0;j<6;j++)g.line([[506+j*6,159],[506+j*6,171]],'#897960',1);
 g.line([[505,160],[505,132],[530,124],[530,145]],'#627e76',3);
 const q=travel([[35,386],[230,385],[439,368],[570,349],[690,341],[846,305],[1040,335],[1280,370]],t/5);
 rider(g,q[0],q[1]+9,t*6,false);boat(g,595+37*Math.sin(t*.8),-5+82*t,t);
 for(const [x,y] of [[721,194],[753,176],[1045,209],[217,296]])tree(g,x,y,.8);
 for(let i=0;i<3;i++){const x=58+i*29,y=173;g.rect(x,y,22,11,'#b18b5d');g.poly([[x-2,y],[x+12,y-13],[x+25,y]],i%2?gold:red);person(g,x+8,y+18,i%2?blue:green,0);}
}
function plantScenery(g,f){
 for(let j=0;j<3;j++){const x=796+47*j;g.rect(x,95,12,40,'#a59177');g.rect(x-2,90,15,6,'#bc9f81');g.line([[x+5,89],[x+15,67],[x+13,54]],'#c5c9b7',4);}
 for(let j=0;j<4;j++){const x=60+37*j;g.rect(x,287,26,13,'#728989');g.rect(x+2,289,21,4,'#acb5a1');}
 g.line([[369,206],[369,172],[389,163]],ink,2);g.oval(389,163,5,2,'#d7c393');
 const shuttle=travel([[1118,149],[1153,145],[1172,148],[1236,148]],f);g.rect(shuttle[0]-10,shuttle[1]-6,29,8,'#697f81');g.oval(shuttle[0]-5,shuttle[1]+4,4,4,ink);g.oval(shuttle[0]+15,shuttle[1]+4,4,4,ink);
 for(let j=0;j<3;j++){const p=travel([[1001+j*33,221],[1017+j*33,203],[1023+j*33,195]],phase(f,j*.11,j*.11+.54));person(g,...p,j%2?blue:red,f*30);}
 for(let j=0;j<4;j++){const x=345+26*j;block(g,x,340,19,10,7,'#a49268');}
}
const labbase={batch:'world20',views:['跟随作业','全景'],duration:45};

const relayBase=[590,375], shores=[[300,269],[263,173]], pads=[[908,231],[984,151]], homes=[[1085,291],[1131,100]];
function relayFrame(d,k,f){
 const t=5*f,p=shores[k],l=pads[k],home=homes[k],service=d.clock;
 const firstRoad=[relayBase,[439,368],[351,335],p],bikeBridge=[p,[342,330],[479,365],[690,341],[846,305],l];
 const drop=travel([l,[l[0]+85,l[1]+14],home],phase(t,3,4));
 const bike=t<1?travel(firstRoad,t):t<2?p:t<3?travel(bikeBridge,t-2):t<4?drop:travel([home,[1052,341],[868,364],[736,352],relayBase],t-4);
 const landing=travel([p,[527,p[1]-52],[756,l[1]-43],l],phase(t,2,3));
 const flight=t>=2&&t<3,focus=flight?landing:t>=4?home:bike;
 const status=t<service[0]?'骑手前往取件':t<service[1]?'骑手交件给无人机':flight?'包裹越过河道':t<service[3]?'落地接力送达':'收件人带包裹入内';
 return {t,k,bike,landing,focus,status,clock:'模型时刻 '+num(t,2)+' / 5',metrics:[['本单货值',String(d.values[k])],['同波次接单',String(d.accepted)],['订单状态',status],['全波次净收益',String(d.gross-d.expense+d.values[k]-d.values[0])]]};
}
labs.P0010={...labbase,title:'跨河接力的订单名额',action:'同一组骑手和无人机只能为本波次承接一笔替换订单。选择河岸货栈的 O4，或花市的 O17。',choices:['接 O4 · 归档','把 O4 名额给 O17'],
 scope:'在 24 笔订单的同步波次中互换两笔时间参数相同的任务，其余资源和接续固定。成本按原解骑手和飞机的执行时间计算。岸线、路网及人物为交接示意。',
 chapters:()=>[chapter('骑手取件',.17),chapter('交给无人机',.385),chapter('对岸收件',.59),chapter('顾客签收',.79)],frame:relayFrame,
 draw(c,s,d,k,f,v){const g=canvasPen(c,s.focus,v,1270,390);
  water(g,[[552,-80],[580,90],[637,164],[617,300],[645,449],[700,600]],112);
  for(const [x,y,col] of [[15,137,'#c7c6ad'],[94,126,'#d5b69e'],[714,105,'#c6beac'],[813,101,'#c6d1b9'],[1180,146,'#cdb9a2']])house(g,x,y,62,62,col,'');
  grove(g,22,339);grove(g,716,384,8);
  road(g,[[0,385],[439,368],[570,349],[690,341],[846,305],[1052,341],[1300,372]]);
  road(g,[[88,239],[263,173],[300,269],[351,335],[439,368]],22);
  road(g,[[846,305],[908,231],[984,151],[1131,100],[1280,139]],23);
  quayScene(g,s.t);
  g.line([[559,328],[625,320],[690,319]],'#577672',3);g.line([[569,368],[629,363],[703,361]],'#577672',3);
  warehouse(g,183,253,107,58,'货栈 O4');house(g,173,168,81,48,'#c19f8a','花市 O17','store');
  warehouse(g,527,416,117,42,'骑手调度亭',1);house(g,1061,282,84,73,'#d4c09e','东岸书社','store');house(g,1092,91,85,60,'#a6c0b4','北街公寓');
  pads.forEach(([x,y],j)=>{g.oval(x,y+1,23,9,'#c3c3a4');g.oval(x,y,17,6,'#688e89');g.txt('H',x,y,10,cream);walk(g,[[x+18,y+5],[x+65,y+18],homes[j]],10);});
  shores.forEach(([x,y],j)=>{if(j!==k||s.t<2)carton(g,x+5,y,gold,13);});
  rider(g,...s.bike,s.t*15,s.t>=3&&s.t<4);
  if(s.t<2||s.t>=3&&s.t<4)g.txt('R'+d.crew[0],s.bike[0],s.bike[1]+12,11,ink);
  if(s.t<3.6){const p=s.t<2?lerp([shores[k][0]-40,shores[k][1]-31],shores[k],phase(s.t,.2,1.6)):s.landing;
   const h=9+41*Math.sin(Math.PI*phase(s.t,2,3)),x=p[0],y=p[1]-h;g.oval(x,p[1],15,4,'#465e6245');g.line([[x-15,y-6],[x+15,y+6]],ink,3);g.line([[x-14,y+6],[x+15,y-6]],ink,3);
   for(const dx of [-14,14])for(const dy of [-6,6])g.oval(x+dx,y+dy,7,2.4,'#587775');g.oval(x,y,7,4.5,'#bf9c48');if(s.t>=2&&s.t<3){carton(g,x,y+8,gold,7);g.txt('D'+d.crew[2],x+24,y-12,11,ink);}
  }
  const q=homes[k];person(g,q[0]+mix(3,22,phase(s.t,4,4.7)),q[1]-6,'#a26e54',s.t*10,s.t>=4);
  const a=s.t>=4?q:s.focus;g.tag('O'+d.orders[k]+' · '+s.status,a[0],a[1]-(s.t>=2&&s.t<3?77:53),s.t>=4?green:ink,13);
 }};
const returnsPath=[[1116,244],[1151,332],[1010,363],[800,370],[661,342],[522,369],[292,376],[171,294]];
function factoryFrame(d,k,f){
 const inbound=k?[[171,294],[270,320],[474,305],[728,282],[945,298],[1099,254]]:[[171,294],[267,304],[376,202],[495,187],[609,221],[729,281],[944,298],[1099,254]];
 const loaded=travel(inbound,phase(f,.09,.51)),out=travel(returnsPath,phase(f,.7,.97));
 const forklift=travel([[1099,254],[1093,230],[1128,199],[1160,189]],phase(f,.51,.62));
 const focus=f<.51?loaded:f<.65?forklift:f<.7?lerp([1160,189],returnsPath[0],phase(f,.65,.7)):out;
 const status=f<.09?'供应商装入料箱':f<.51?k?'专车直达收货口':f<.29?'零担进入集配站':'拼车运往总装厂':f<.62?'叉车将零件送入线边':f<.7?'空箱送往返程月台':f<.97?'回送循环料箱':'空箱回到供应商';
 return {focus,loaded,out,forklift,status,f,k,clock:'第 1 日 · '+status,metrics:[['本批料箱',d.containers+' 箱'],['返程空箱折算重量',num(d.empty,2)],['全网每日零担车数',String(d.plans[k][2])],['四日总成本',num(d.plans[k][1],3)]]};
}
labs.P0183={...labbase,title:'汽车总装线的零件到厂与空箱回送',action:'给供应商 S6 选择运输方式，沿着同一批料箱看它们如何进厂并空箱返回。',choices:['零担集配 · 归档','改用整车直送'],
 scope:'使用原供应商数据展开器恢复 S6 的载重、箱量和运价。改变该供应商四日的运输模式，重算全网零担车数、费用和共用容量。镜头展示第一日的典型交接，站点位置和日内时间为示意。',
 chapters:()=>[chapter('供应商装箱',0),chapter('进厂卸料',.50),chapter('空箱交接',.66),chapter('返程到厂门',.94)],frame:factoryFrame,
 draw(c,s,d,k,f,v){const g=canvasPen(c,s.focus,v,1270,400);
  g.rect(0,37,1270,115,'#cbd5c3');for(let i=0;i<6;i++)warehouse(g,30+i*200,125,91,42,'',2);
  warehouse(g,64,281,130,79,'零件工厂 S6');warehouse(g,400,178,156,59,'零担集配站');warehouse(g,973,242,165,103,'总装厂入厂月台');
  g.rect(1125,150,113,56,'#7f9489');g.rect(1128,155,106,42,'#d9d4b8');for(let i=0;i<4;i++){g.oval(1139+i*26,191,7,4,'#42615e');g.rect(1132+i*26,172,16,12,blue);}g.txt('装配线',1184,161,11);
  road(g,[[30,308],[171,294],[270,320],[474,305],[728,282],[945,298],[1099,254],[1290,268]],37);
  road(g,[[267,304],[376,202],[495,187],[609,221],[729,281]],24);road(g,returnsPath,29);
  plantScenery(g,f);
  grove(g,44,395,6);grove(g,722,228,5);walk(g,[[1099,255],[1093,230],[1128,199],[1160,189]],12);
  for(let j=0;j<4;j++){block(g,369+j*15,182,12,10,2,'#81a499');}
  if(!k){const b=travel([[598,145],[537,170],[493,185]],phase(f,0,.26));truck(g,...b,'#ab8556',-1);}
  if(f<.51){truck(g,...s.loaded,k?blue:'#648e78');carton(g,s.loaded[0]-12,s.loaded[1]-16,'#c2a05d',13);}
  else if(f<.7){truck(g,1099,255,k?blue:'#648e78');forklift(g,s.forklift[0]-14,s.forklift[1],f);
   if(f<.63){for(let j=0;j<d.containers;j++)carton(g,s.forklift[0]-4+j%3*6,s.forklift[1]-2-Math.floor(j/3)*6,blue,7);}
   if(f>=.62){const pos=lerp([1160,190],returnsPath[0],phase(f,.62,.7));g.rect(pos[0]-8,pos[1]-8,16,8,'#58918a');g.rect(pos[0]-5,pos[1]-7,11,4,'#d0d8be');}}
  else{truck(g,...s.out,'#708e7b',f>.72?-1:1,'flat');for(let j=0;j<3;j++){const x=s.out[0]+j*9-4;g.rect(x,s.out[1]-19,9,7,'#588e83');g.rect(x+1,s.out[1]-18,7,3,'#c1d3bb');}}
  g.tag(s.status,s.focus[0],s.focus[1]-55,f>.61?green:ink);
 }};

// LIFO loading bay

function lifoTime(f){return f<.29?mix(0,30,f/.29):f<.64?mix(30,132,(f-.29)/.35):mix(132,159,(f-.64)/.36);}
const stopLifo=.64+.36*(142-132)/(159-132);
function palletFrame(d,k,f){
 const t=k?Math.min(lifoTime(f),d.times[1]+d.gate):lifoTime(f);
 const finishFirst=d.times[1]+d.gate+d.unload[1];
 const blocked=k&&t>=d.times[1]+d.gate-1e-8;
 const delivered=blocked?0:t<finishFirst?0:t<d.times[2]?d.qty[1]:d.qty[0]+d.qty[1];
 const pos=travel([[264,272],[318,311],[471,327],[630,298],[801,283],[936,302],[1030,267]],phase(t,30,132));
 const collection=t<10?'等待装货闸口':t<20?'10 号进入厢体深处':t<30?'19 号装在后门':t<132?'两托在途':blocked?'19 号挡住深处的 10 号':t<142?'进入东站卸货口':t<finishFirst?'卸出外侧 19 号':t<159?'卸出深处 10 号':'两托交付完成';
 const onboard=(t>=20?d.qty[0]:0)+(t>=30?d.qty[1]:0)-delivered;
 return {t,pos,blocked,delivered,collection,focus:t<10?[192,251]:t<132?pos:[990,239],clock:num(t,1)+' 秒',metrics:[['当前车载量',onboard+' / '+d.cap],['东站已卸数量',String(delivered)],['车辆位置',t>=132?'东站':t>30?'跨区通道':'始发码头'],['作业结果',blocked?'厢门阻挡':t===159?'159 秒完成':collection]]};
}
labs.P0278={...labbase,title:'一辆车、两托货与一扇后门',action:'西库先装 10 号、再装 19 号。到达东站时，选择先让叉车取哪一托。',choices:['先卸外侧 19 号','先卸内侧 10 号'],
 scope:'一号序列中的车辆 0、首个装运批次。归档路径从 h 到 e 共 3 公里，行车 102 秒，两端各有 10 秒闸口时间。切换卸货顺序时保留原装载顺序。显示本趟交付量及时间。',
 endAt:(d,k)=>k?stopLifo:1,chapters:(d,k)=>[chapter('装第一托',.095),chapter('关门发车',.285),chapter('进入东站',.635),chapter('后门开始卸货',stopLifo-.003)],frame:palletFrame,
 draw(c,s,d,k,f,v){const g=canvasPen(c,s.focus,v,1270,300);
  g.rect(0,0,1270,173,'#d7dbcf');for(let j=0;j<11;j++){g.rect(42+j*119,19,10,119,'#c2c9b8');g.line([[43+j*119,44],[80+j*119,22]],'#a3b2a5',3);}
  warehouse(g,45,226,251,94,'西库 H · 发车闸口',3);warehouse(g,912,224,278,99,'东站 E · 卸货闸口',3);
  for(let j=0;j<4;j++){block(g,682+j*31,181,28,17,9,'#a9b3a2');block(g,688+j*31,162,23,13,7,'#b2bdaf');}
  road(g,[[-25,259],[264,272],[318,311],[471,327],[630,298],[801,283],[936,302],[1030,267],[1300,272]],48);
  for(const off of [64,892]){g.rect(off,218,210,47,'#b1b7a4');for(let j=0;j<14;j++)g.line([[off+j*15,262],[off+j*15+8,255]],'#e9c16e',4);}
  for(const [off,active] of [[98,s.t<30],[929,s.t>=132]]){
   for(let j=0;j<3;j++){g.rect(off+j*67,225,8,15,'#a09a77');g.rect(off+j*67,226,8,4,gold);}
   g.rect(off+69,182,9,20,ink);g.oval(off+73.5,188,3,3,active?'#9dd19a':'#d3915e');
   for(let j=0;j<2;j++){const xx=off+93+j*24;block(g,xx,225,21,13,5,'#bd9b64');block(g,xx+3,211,15,9,4,'#bd9b64');}
   person(g,off+181,236,'#aa764c',0);
  }
  for(let j=0;j<3;j++){const xx=426+j*67;g.line([[xx,278],[xx,255],[xx+10,250]],'#718279',2);g.oval(xx+10,250,4,1.6,'#dac690');}
  for(let j=0;j<4;j++){tree(g,365+j*80,247+(j%2)*9,.85);tree(g,744+j*66,368+(j%2)*8,.7);}
  const [x,y]=s.pos;g.rect(x-51,y-11,84,7,'#455757');g.poly([[x+32,y-33],[x+47,y-33],[x+58,y-21],[x+58,y-6],[x+32,y-6]],blue);
  g.rect(x+38,y-30,10,9,'#c7dbd4');g.rect(x-48,y-49,78,3,'#769295');g.rect(x+27,y-46,4,36,'#91aaaa');
  for(const j of [-33,40]){g.oval(x+j,y-3,7,7,ink);g.oval(x+j,y-3,3,3,'#b8c0ac');}
  let fork;
  function pallet(id,start,loaded,from,finish){
   const i=d.ids.indexOf(id),tone=i?gold:blue,inVan=[x+(i?-28:6),y-13],origin=[115+42*i,243],dest=[924+42*i,237];
   const unloading=s.t>=from&&(!k||s.t<142);
   const where=s.t<start?origin:s.t<loaded?lerp(origin,inVan,phase(s.t,start,loaded)):!unloading?inVan:s.t<finish?lerp(inVan,dest,phase(s.t,from,finish)):dest;
   const [px,py]=where;block(g,px-11,py,22,20,4,tone,'#e7d8b6','#8a8167');g.rect(px-14,py,28,4,'#a38258');g.txt(id,px,py-9,12,cream);
   if((s.t>=start&&s.t<loaded)||(s.t>=from&&s.t<finish&&!k))fork=where;
  }
  pallet(d.ids[0],10,20,151,159);pallet(d.ids[1],20,30,142,151);
  if(!fork&&s.t>=132)fork=[x-65,y-10];if(fork)forklift(g,fork[0]-22,fork[1],f);
  if(s.blocked)g.line([[x-29,y-45],[x-29,y-19]],red,3);
  g.tag(s.collection,x,y-65,s.blocked?red:ink);
 }};
const robotLane=[[593,259],[653,247],[718,215],[764,180],[845,180],[887,198]];
const secondLane=[[887,198],[927,218],[976,216],[1020,201],[1097,173]];
const vehicleLane=[[593,259],[650,301],[753,337],[866,329],[917,278],[887,198]];
function robotFrame(d,k,f){
 const highway=[[132,320],[241,315],[361,293],[460,308],[542,286],[593,259]];
 const van=f<.30?travel(highway,phase(f,0,.30)):!k?[593,259]:f<.64?travel(vehicleLane,phase(f,.34,.62)):travel([[887,198],[917,278],[1012,270],[1117,243],[1097,173]],phase(f,.68,.92));
 const robot=f<.30?van:f<.65?travel(robotLane,phase(f,.33,.62)):travel(secondLane,phase(f,.67,.92));
 const focus=k?van:robot, delivered=f<.635?0:f<.935?1:2;
 const activity=f<.30?'货车运入东区':f<.34?k?'保留两件在车上':'放下搭载机器人':f<.62?k?'货车绕行至第一户':'机器人携两件穿过步道':f<.67?'第一户交接':f<.92?'余下一件送往第二户':'第二户接收';
 return {k,f,van,robot,focus,delivered,activity,clock:activity,metrics:[['两户已收',delivered+' / 2'],['全网机器人',String(d.plans[k][1])],['全网车直送件数',String(d.plans[k][0])],['全网分配成本',String(d.plans[k][3])]]};
}
labs.P0347={...labbase,title:'机器人搭车进社区后由谁送到门口',action:'东区机器人 r20 可以同送 p201 和 p53。也可以留下机器人，由货车负责最后两户。',choices:['搭载机器人 · 归档','货车直送两户'],
 scope:'按归档分区与匹配恢复同一机器人的两件货，东区位置 10 与 12 相差 2，在距离上限 27 内。保持其他分配，重新计入设备费、运输费和共享车容。行走顺序、街巷与时长用于展示。',
 chapters:()=>[chapter('东区出货',0),chapter('进入卸机坪',.29),chapter('第一户交接',.61),chapter('第二户交接',.91)],frame:robotFrame,
 draw(c,s,d,k,f,v){const g=canvasPen(c,s.focus,v,1270,365);
  g.rect(0,0,1270,190,'#cdddc5');warehouse(g,59,301,138,83,'东区包裹站');house(g,295,222,100,59,'#b5bbb0','', 'store');
  house(g,808,169,104,85,'#d2b9a7','10 号庭院');house(g,1048,150,94,94,'#acc3ba','12 号公寓');
  grove(g,225,366,6);grove(g,618,162,3);grove(g,766,386,8);
  road(g,[[0,337],[132,320],[241,315],[361,293],[460,308],[542,286],[593,259],[650,301],[753,337],[866,329],[917,278],[1012,270],[1117,243],[1240,267]],38);
  road(g,[[917,278],[887,198]],22);road(g,[[1117,243],[1097,173]],22);
  walk(g,robotLane,16);walk(g,secondLane,16);g.oval(585,258,37,15,'#9eac9a');g.tag('机器人卸机坪',577,222,green,13);
  for(let j=0;j<5;j++){
   const xx=689+j*28;g.rect(xx,273,16,6,'#a48a60');g.line([[xx+1,278],[xx+1,283]],ink,2);g.line([[xx+14,278],[xx+14,283]],ink,2);
   tree(g,xx+6,268,.6);
  }
  for(let j=0;j<3;j++){const p=travel([[1196,166+j*8],[1158,184+j*5],[1102,196+j*3]],phase(f,j*.08,.64+j*.11));person(g,...p,[blue,red,green][j],f*18);}
  g.line([[760,189],[758,156],[784,153]],'#8b8f78',3);g.poly([[755,155],[764,141],[783,140],[788,153]],'#b78c68');
  for(let j=0;j<6;j++)g.line([[898+j*2.8,207+j*2],[910+j*2.8,201+j*2]],'#e6dfc8',1.8);
  truck(g,...s.van,blue,1,k?'box':'flat');
  if(!k){
   const [rx,ry]=s.robot,yy=ry-(f<.30?14:0);block(g,rx-14,yy-3,24,13,4,'#d8b65b','#f3d290','#a48d53');g.rect(rx+6,yy-15,4,6,ink);
   for(const dd of [-9,8])g.oval(rx+dd,yy-1,3.4,3.4,ink);
   for(let j=s.delivered;j<2;j++)carton(g,rx-6+j*8,yy-14,j?blue:'#be8751',7);
  }
  const p1=lerp([894,190],[865,172],phase(f,.635,.74)),p2=lerp([1095,168],[1082,153],phase(f,.935,1));
  person(g,...p1,'#bd7c60',f*22,s.delivered>=1);person(g,...p2,'#6a8b91',f*18,s.delivered>=2);
  g.tag(s.activity,s.focus[0],s.focus[1]-51,ink);
 }};

// Refuse collection corridor

const refuseCache=new WeakMap();
function dayRuns(d){
 if(refuseCache.has(d))return refuseCache.get(d);
 const runs=[0,1].map(k=>{
  const stops=d.stops.slice();if(k)[stops[1],stops[2]]=[stops[2],stops[1]];
  let time=0,load=0,km=0,n=0;const events=[];
  for(let j=1;j<stops.length;j++){
   const to=stops[j],from=stops[j-1],dist=d.distances[k][j-1],early=j<5||j>=stops.length-4;
   const start=time,arrival=time+(early?1.8:.24),finish=arrival+(to===76?2.8:early?1.5:.10);
   events.push({from,to,start,arrival,finish,load,km,dist,n});
   time=finish;km+=dist;if(to===76)load=0;else if(to<76){load+=d.quantities[to];n++;}
  }
  return {events,time};
 });
 refuseCache.set(d,runs);return runs;
}
const refuseX=id=>id<0?104:id===76?6865:id===77?7140:235+id*82;
const streetY=x=>254+28*Math.sin(x/286)+11*Math.sin(x/109);
function refuseFrame(d,k,f){
 const run=dayRuns(d)[k],t=f*run.time,e=run.events.find(a=>t<a.finish)||run.events[run.events.length-1];
 const drive=phase(t,e.start,e.arrival),p=phase(t,e.arrival,e.finish),x=mix(refuseX(e.from),refuseX(e.to),drive);
 const passed=e.to<76&&p>=.7,load=e.to===76&&p>=.7?0:e.load+(passed?d.quantities[e.to]:0),n=e.n+Number(passed);
 const status=drive<1?'开往下一站':e.to===76?'处置场卸载':e.to===77?'回到终点车场':passed?'垃圾箱已收运':'举升垃圾箱';
 return {e,t,p,x,y:streetY(x),drive,load,n,status,f,k,done:run.events.filter(a=>a.to<76&&t>=a.arrival+.7*(a.finish-a.arrival)).map(a=>a.to),
  clock:'第 1 日 · '+status,metrics:[['已完成收运',n+' / 76'],['车载收运量',load+' / '+d.capacity],['累计路程',num(e.km+drive*e.dist)],['当日行车与作业成本',String(d.plans[k][1])]]};
}
function refuseOverview(c,s){
 const g=canvasPen(c,[610,235],1);g.rect(0,0,1270,495,'#d5dec9');
 water(g,[[70,0],[85,95],[260,205],[398,235],[492,341],[543,490]],37);
 const band=x=>[75+1125*x/7140,308-67*Math.sin(x/950)+17*Math.sin(x/390)];
 const pts=Array.from({length:70},(_,j)=>band(j*7140/69));road(g,pts,21);
 for(let id=0;id<76;id++){const [x,y]=band(refuseX(id));g.oval(x,y-16,3.8,3.8,s.done.includes(id)?green:gold);}
 for(const [i,label] of [[-1,'西区车场'],[1,'旧街收运区'],[26,'沿河住区'],[52,'东部商街'],[76,'末端处置场']]){const [x,y]=band(refuseX(i));g.tag(label,x+(i<0?5:0),y-(i===1?95:50),ink,14);}
 const [x,y]=band(s.x);truck(g,x,y,'#658c68',s.e.to<s.e.from?-1:1);g.tag(s.status,x,y+40,green);
}
labs.P0497={...labbase,title:'清运车从街巷垃圾箱到末端处置场',duration:62,action:'选择第一天从西区车场先去 C0 或 C1，随后执行相同的收运任务。观察有向道路成本和倾卸前的累计载量。',choices:['先 C0 再 C1 · 归档','先 C1 再 C0'],
 scope:'展示第一天的 76 个收运点、平均收运量与车辆容量。对照仅交换前两站，其余取量及日作业时长固定。成本按有向距离、时长和固定费用复算，采用当天运输部分。街区形状为示意，进度按站点变速。',
 chapters:(d,k)=>{const r=dayRuns(d)[k],go=i=>r.events[i].start/r.time;return [chapter('首站选择',0),chapter('第二个垃圾箱',go(1)),chapter('最后的收运点',go(75)),chapter('处置场卸料',go(76))];},frame:refuseFrame,
 draw(c,s,d,k,f,v){if(v){refuseOverview(c,s);return;}
  const g=canvasPen(c,[s.x,s.y],0,7250,395),lo=Math.max(-1,Math.floor((g.vx-390)/82)),hi=Math.min(75,Math.ceil((g.vx+g.vw+15)/82));
  const left=g.vx-120,right=g.vx+g.vw+110,roadline=[];
  g.rect(left,-140,right-left,835,'#d2dbbe');
  for(let ax=Math.floor(left/28)*28;ax<=right+28;ax+=28)roadline.push([ax,streetY(ax)]);
  const canal=roadline.map(([a,b])=>[a,b+117+Math.sin(a/117)*10]);water(g,canal,34);
  for(let id=Math.max(0,lo);id<=hi;id++){
   const x=refuseX(id),y=streetY(x),h=49+(id%3)*8;
   if(id%7===0)house(g,x-24,y-48,54,h,'#c2b89b',id<2?'沿河菜场':'','store');
   else if(id%5===0)warehouse(g,x-28,y-60,62,45,'',2);
   else house(g,x-20,y-57,52,h,['#d1baa3','#bac4a8','#b5c8ba'][id%3],id===1?'巷口公寓':'');
   if(id%2===0)tree(g,x+34,y-47,.72);
  }
  if(left<280)warehouse(g,36,streetY(100)-43,99,58,'西区车场',2);
  if(right>6640){warehouse(g,6755,streetY(6865)-47,167,87,'末端处置场',2);
   for(let n=0;n<4;n++)block(g,6790+n*32,streetY(6865)-10,25,17,9,'#899681');warehouse(g,7104,streetY(7140)-39,95,52,'终点车场',2);}
  road(g,roadline,42);
  for(let id=Math.max(0,lo);id<=hi;id++){
   const x=refuseX(id),y=streetY(x),here=s.e.to===id&&s.drive>=1,tilt=here?Math.sin(Math.PI*s.p):0,full=!s.done.includes(id);
   g.c.save();g.c.translate(x-8,y-27-tilt*14);g.c.rotate(-tilt*1.15);
   g.poly([[-7,-14],[8,-14],[5,1],[-4,1]],full?'#718a6a':'#a7b6a0');g.rect(-9,-16,19,3,full?'#bca65a':'#677f70');g.oval(-1,2,2.4,2.4,ink);g.c.restore();
   g.txt('C'+id,x+1,y-56,11,ink);
  }
  for(let xx=Math.floor(left/111)*111;xx<right;xx+=111)tree(g,xx,streetY(xx)+72,.8);
  truck(g,s.x,s.y,'#739366',s.e.to<s.e.from?-1:1);
  const level=s.load/d.capacity;g.rect(s.x-30,s.y-26,31,10,'#526d60');g.rect(s.x-29,s.y-25,29*level,8,'#e4bd69');
  if(s.drive===1&&s.e.to<76)g.line([[s.x-10,s.y-12],[s.x-17,s.y-22],[s.x-9,s.y-30-s.p*3]],'#d4b677',3);
  if(right>6730){
   const xx=6865,yy=streetY(xx);g.line([[xx-55,yy-2],[xx-93,yy+29],[xx-139,yy+40]],'#647b70',8);
   for(let j=0;j<5;j++){const p=travel([[xx-55,yy-2],[xx-93,yy+29],[xx-139,yy+40]],j/4);g.oval(p[0],p[1],3,3,'#a5aa91');}
   block(g,xx-161,yy+49,34,14,9,'#9f9274');
   if(s.e.to===76&&s.drive===1){g.line([[s.x-22,s.y-12],[s.x-40,s.y-6],[s.x-58,s.y+1]],'#84765e',5);
    for(let j=0;j<4;j++){const p=travel([[xx-35,yy-9],[xx-55,yy-2],[xx-93,yy+29],[xx-139,yy+40]],phase(s.p,.11*j,.43+.11*j));g.oval(...p,4,3,'#8a8064');}}
  }
  g.tag((s.e.to<76?'C'+s.e.to:s.e.to===76?'D0':'B')+' · '+s.status,s.x,s.y-76,green);
 }};
})();


