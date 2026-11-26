/* Medium-instance road-control replays. Replay clocks are separate from animation speed. */
(() => {
'use strict';
const cfg={
 P0364:['路网信号联控','同一批车辆，两种配时策略',['归档协同策略','固定相位轮转'],'区域排队总数','辆','8 个路口、4 个区域。两次回放使用相同的随机需求与原环境逐秒执行，排队车辆在各自路段内按先后顺序示意排列。'],
 P0442:['混合车流跟驰','两组车辆如何共享前车速度预测',['归档预测','历史路测 · 8 秒','首车试加速 +0.5'],'受控车 1 间距偏差','厘米','在线解只有一个 0.25 秒预测步。首车试加速方案将网联车 1 的控制指令固定为 +0.5 m/s²，其他决策按原目标重新求解。两组均含一辆网联车和一辆人工车；历史片段取自同实例的离线数据。先导车和人工车按样本速度积分，网联车按跟驰间距定位。单步慢放分解观测、共享预测和执行指令。'],
 P0476:['公交站间速度规划','对照时刻表行驶，抵达终点停车',['驶过信号灯','途中调速','进站停车'],'相对时刻表的位置偏差','米','三个片段取自同一条 10,021 步预测轨迹，每步 2 秒。蓝色虚线标记计划位置。该实例时域内未进入红灯区间。'],
 P0477:['信号干道节能跟车','同一前车预测下，比较加速度指令',['归档减速指令','试用加速度上界'],'本车相对初速变化','米/秒','本次预测约 2.64 秒。前车按预测位置均值显示，信号按输入阶段切换。红灯时额外检查停车间距；两种指令的全时域目标按本实例的松弛模型计算，成本单位为模型目标值。'],
 P0479:['混合车队安全跟驰','在 432 辆自动车中切换观察位置',['队尾与人工车','车队前端','车队中段'],'相邻车辆的最小安全余量','米','在同一段 6 秒预测内切换车队位置。队尾的人工车使用位置均值和方差，安全距离加入实例指定的单侧概率裕量。'],
 P0480:['云端车队区间控制','观察两步指令如何改变首个间距预测',['归档指令','首步不干预','首步最大输入'],'首个间距预测相对目标的偏差','模型单位','本实例记录间距和速度偏差，没有绝对车速与行驶里程。以先导车为参照压缩显示间距偏差。步间补间用于慢放；两个对照在各自可达区间内选取最接近目标的状态，三种方案均经实例检查器验证。滑杆对照在输入限值内调整第一步指令，第二步输入为零，按实例的可达区间重新计算跟踪成本和控制成本。其余车辆状态偏差均为零。'],
 P0482:['联网车队反馈纠偏','微小初始扰动会被消除还是积累',['启用反馈','关闭反馈对照'],'实际位置相对标称轨迹的偏差','厘米','跟随车每 0.3 秒根据位置与速度误差更新控制。前 6 秒慢放，随后压缩至第 925 步终点。对照方案沿用相同初态并关闭误差反馈。']
};
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v)),lerp=(a,b,f)=>a+(b-a)*f;
const fmt=(v,n=2)=>Number(v).toLocaleString('zh-CN',{maximumFractionDigits:n});
const mix=(rows,u)=>{const j=Math.min(rows.length-2,Math.floor(u)),f=u-j;return rows[j].map((v,k)=>lerp(v,rows[j+1][k],f));};
const car=(label,x,color='green',type='car')=>({label,x,color,type});
const green='#176c60',blue='#376b9a',amber='#b87232',rose='#ae5357';
function episode(id,d,mode,view){
 if(id==='P0364'){
  const run=d.runs[mode];return f=>{
   const t=f*(run.length-1),j=Math.floor(t),r=run[j],sum=r[2].reduce((a,b)=>a+b,0);
   return {t,unit:'秒',plot:sum,network:[r,run[Math.min(j+1,run.length-1)],t-j],metrics:[['路内排队',sum+' 辆'],['已完成行程',r[3]+' 辆'],['起点积压',r[4]+' 辆'],['下游满载阻滞',r[5]+' 次']]};
  };
 }
 if(id==='P0442'){
  const data=mode===2?[d.forecast[0],d.trial]:mode===1?d.history:d.forecast;return f=>{
   const u=f*(data.length-1),j=Math.min(data.length-2,Math.floor(u)),v=[0,1].map(k=>data[j][k].map((x,l)=>lerp(x,data[j+1][k][l],u-j)));
   const [a,b]=v,commands=mode===1?v:data[1],t=u*d.dt,lead=d.base*t,first=lead-d.base-a[3],human=first-d.base,second=human-d.base-b[3];
   return {t,unit:'秒',plot:v[view.focus][3]*100,camera:human-3,scale:7.65,cars:[car('先导车',lead,amber),car('网联 1',first,green),car('人工 1',human,blue),car('网联 2',second,green),car('人工 2',second-d.base,blue)],radio:[2,3],ruler:[2,3,'跟驰间距 '+fmt(d.base+b[3],4)+' m'],metrics:[['网联 1 加速度',fmt(commands[0][4],5)+' m/s²'],['网联 2 加速度',fmt(commands[1][4],5)+' m/s²'],['人工 1 速度',fmt(d.base+a[2],4)+' m/s'],['网联 1 间距',fmt(d.base+a[3],4)+' m']]};
  };
 }
 if(id==='P0476'){
  const rows=d.windows[mode];return f=>{
   const u=f*(rows.length-1),r=mix(rows,u),[step,x,ref,v]=r,t=step*d.dt;
   const camera=x+9,stop=d.terminal[0];
   return {t,unit:'秒',plot:x-ref,camera,scale:5,cars:[car('公交车',x,green,'bus')],ghost:ref,light:d.light,red:t>=d.red[0]&&t<=d.red[1],stop,metrics:[['实际车速',fmt(v,3)+' m/s'],['时间表偏差',fmt(x-ref,3)+' m'],['距计划停靠点',fmt(stop-x,2)+' m'],['预测步',Math.round(step).toLocaleString()]]};
  };
 }
 if(id==='P0477'){
  const rows=[],mu=d.momentMean,g=d.momentWeight,constant=4*g-mu.reduce((v,m)=>v+m*m,0);
  let [x,v]=d.ego,cost=0,choice=mode;
  for(let j=0;j<=d.count;j++){
   choice=view.switches.get(j)??choice;
   const a=d.accel[choice];
   rows.push([x,v,a]);
   if(j===d.count)break;
   const diff=[x+d.tau*v,v,x,v].map((state,k)=>mu[k]-2*state);
   const product=diff.reduce((total,z,k)=>total+z*mu[k],0);
   cost+=constant+product/2+Math.sqrt(g*diff.reduce((total,z)=>total+z*z,0)-.75*product**2);
   x+=v*d.dt+.5*a*d.dt*d.dt;v+=a*d.dt;
  }
  view.cost=view.switches.size?cost:d.costs[mode];
  return f=>{
   const u=d.count*f,t=u*d.dt,j=Math.min(d.count-1,Math.floor(u)),within=(u-j)*d.dt;
   const [p0,v0,a]=rows[j],x=p0+v0*within+.5*a*within**2,v=v0+a*within;
   const lead=d.lead+d.slope*t,gap=lead-x,stage=d.k+j,red=stage>=d.red[0]&&stage<=d.red[1],head=d.jam+d.margin+d.tau*v;
   return {t,unit:'秒',plot:v-d.ego[1],camera:d.ego[0]+12+4*t,scale:13,cars:[car('受控车',x,green),car('前车预测',lead,amber)],signal:true,red,zone:[lead-head,lead],ruler:[0,1,'两车间距 '+fmt(gap,3)+' m'],metrics:[['加速度指令',fmt(a,6)+' m/s²'],['本车速度',fmt(v,5)+' m/s'],['时距约束余量',fmt(gap-head,4)+' m'],['红灯停车余量',red?fmt(gap-d.jam-d.margin,4)+' m':'绿灯阶段']]};
  };
 }
 if(id==='P0479'){
  const tail=mode===0,seg=d.groups[[2,0,1][mode]],labels=tail?[430,431,432]:mode===1?[1,2,3,4]:[215,216,217,218];return f=>{
   const u=f*(seg.length-1),pos=mix(seg,u),hv=mix(d.human,u),t=u*d.dt,margin=d.z*Math.sqrt(Math.max(0,hv[1]));
   const cars=pos.map((x,j)=>car('AV '+labels[j],x,green));if(tail)cars.push(car('人工车',hv[0],amber));
   const last=cars.length-1,gaps=cars.slice(1).map((v,j)=>cars[j].x-v.x),required=d.safe+(tail?margin:0),min=Math.min(...gaps.map((g,j)=>g-d.safe-(tail&&j===last-1?margin:0)));
   return {t,unit:'秒',plot:min,camera:(cars[0].x+cars[last].x)/2,scale:5.3,cars,zone:[cars[last].x,cars[last].x+required],ruler:[last,last-1,'实际 '+fmt(gaps.at(-1))+' m'],metrics:[['观察车辆',tail?'队尾 3 AV + 1 HV':labels[0]+' – '+labels.at(-1)],['要求间距',fmt(required,3)+' m'],['最小安全余量',fmt(min,3)+' m'],[tail?'人工车位置标准差':'领车参考速度',tail?fmt(Math.sqrt(hv[1]),4)+' m':fmt(d.reference[Math.min(d.reference.length-1,Math.floor(u))],3)+' m/s']]};
  };
 }
 if(id==='P0480')return f=>{
  const trial=view.trial,states=[d.gap[0],trial[1],trial[2]],u=2*f,j=Math.min(1,Math.floor(u)),x=lerp(states[j],states[j+1],u-j),a=j===0?trial[0]:0;
  // Screen positions represent deviations on a compressed linear scale, never physical kilometres.
  const front=40,ego=front-16-55*x/d.target;
  return {t:u,unit:'步',plot:x-d.target,camera:1,scale:6,compressed:true,cars:[car('先导车',front,amber),car('云控 AV',ego,green),car('人工车',ego-14,blue),car('人工车',ego-28,blue)],ghost:front-71,radio:[0,1],ruler:[1,0,'间距偏差 '+fmt(x,1)],metrics:[['当前指令',fmt(a,6)],['区间末间距偏差',fmt(states[j+1],3)],['目标偏差',fmt(d.target,0)],['两步总成本',fmt(trial[3],1)]]};
 };
 const rows=[];let [x,v]=d.actual,setting=mode;
 for(let j=0;j<=d.steps;j++){
  const t=j*d.dt,nom=d.nominal[0]+d.nominal[1]*t,dx=x-nom,dv=v-d.nominal[1];
  setting=view.switches.get(j)??setting;
  const a=setting?0:d.gain[0]*dx+d.gain[1]*dv;
  rows.push([x,v,nom,a,dx,dv,setting]);x+=v*d.dt+.5*a*d.dt*d.dt;v+=a*d.dt;
 }
 return f=>{
  const u=clamp(f<=.7?20*f/.7:20+(d.steps-20)*(f-.7)/.3,0,d.steps),t=u*d.dt;
  const tick=Math.floor(u),dt=(u-tick)*d.dt,[x0,v0,nom0,applied,,,setting]=rows[tick];
  const x=x0+v0*dt+.5*applied*dt*dt,v=v0+applied*dt,nom=nom0+d.nominal[1]*dt;
  const dx=x-nom,dv=v-d.nominal[1],lead=d.leader[0]+d.leader[1]*t,feedback=setting===0;
  const errorPath=rows.slice(Math.max(0,tick-40),tick+1).map(r=>[r[4],r[5]]);
  const inside=Math.abs(2*dx+dv)<=d.widths[0]+1e-8&&Math.abs(dx+dv)<=d.widths[1]+1e-8;
  return {t,unit:'秒',feedback,applied,velocityError:dv,errorPath,plot:dx*100,camera:(lead+x)/2,scale:12,cars:[car('跟随车',x,green),car('联网领车',lead,blue)],ghost:nom,radio:[1,0],ruler:[0,1,'间距 '+fmt(lead-x,3)+' m'],metrics:[['误差反馈指令',fmt(applied,6)+' m/s²'+(applied<d.inputRange[0]||applied>d.inputRange[1]?' · 超出输入限值':'')],['位置误差',fmt(dx*100,3)+' cm'],['速度误差',fmt(dv,5)+' m/s'],['管束边界',inside?'管内':'已越界']]};
 };
}
const W=900,H=340;
function surface(canvas){
 const c=canvas.getContext('2d');
 function box(x,y,w,h,fill){c.fillStyle=fill;c.fillRect(x,y,w,h);}
 function line(x,y,x2,y2,color,w=1){c.strokeStyle=color;c.lineWidth=w;c.beginPath();c.moveTo(x,y);c.lineTo(x2,y2);c.stroke();}
 function disc(x,y,r,color){c.fillStyle=color;c.beginPath();c.arc(x,y,r,0,2*Math.PI);c.fill();}
 function shape(points,fill){c.beginPath();points.forEach(([x,y],j)=>j?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fillStyle=fill;c.fill();}
 function txt(s,x,y,color,size=14,align='center'){c.textAlign=align;c.font='600 '+size+'px system-ui,sans-serif';c.fillStyle=color;c.fillText(s,x,y);}
 function tag(s,x,y,color='#214b4b'){c.font='600 13px system-ui';const w=c.measureText(s).width+18;x=clamp(x,w/2+3,W-w/2-3);
  box(x-w/2,y-15,w,21,color);txt(s,x,y,'white',13);}
 function drawCar(x,y,v,spin){
  const bus=v.type==='bus',s=bus?1.13:1,w=bus?92:57;
  c.save();c.translate(x,y);c.scale(s,s);
  c.fillStyle='#192e3450';c.beginPath();c.ellipse(1,3,w*.54,5,0,0,2*Math.PI);c.fill();
  if(bus){
   box(-w/2,-35,w,31,v.color);box(-w/2+2,-32,w-4,13,'#becfd1');for(let j=0;j<7;j++)box(-w/2+4+j*12,-32,9,12,'#426372');
   box(23,-17,10,16,'#b5d6cd');box(-43,-7,83,3,'#ecd6a3');
  }else{
   shape([[-28,-6],[-25,-14],[-16,-15],[-9,-23],[7,-23],[18,-15],[26,-13],[29,-7],[27,-2],[-26,-2]],v.color);
   shape([[-13,-15],[-7,-21],[-1,-21],[-1,-15]],'#cee1e2');shape([[1,-21],[7,-21],[15,-15],[1,-15]],'#bad5db');
   line(-18,-10,20,-10,'#ffffff64',1);
  }
  for(const dx of [-w*.32,w*.32]){disc(dx,0,6,'#1c323a');disc(dx,0,3.1,'#abbcbd');line(dx,0,dx+2.8*Math.cos(spin),2.8*Math.sin(spin),'#435a63',1.4);}
  box(w/2-3,-10,4,3,'#fff2b3');box(-w/2,-9,3,3,'#ff9679');c.restore();
 }
 function road(s,bg){
  box(0,0,W,H,'#c0d7d1');
  if(bg.complete&&bg.naturalWidth){
   // A small parallax movement leaves the foreground scale free to show metres.
   const h=201,w=h*bg.naturalWidth/bg.naturalHeight;
   const phase=((s.camera*s.scale*.16)%(2*w)+2*w)%(2*w);
   for(let tile=0;tile<Math.ceil(W/w)+3;tile++){
    const left=tile*w-phase;
    c.save();c.translate(left+(tile%2?w:0),0);if(tile%2)c.scale(-1,1);
    c.drawImage(bg,0,0,w,h);c.restore();
   }
  }else{
   for(let j=0;j<14;j++){const h=50+j*19%80;box(j*72,195-h,63,h,j%2?'#aebdb0':'#cdb99d');}
  }
  box(0,197,W,9,'#c8c2ac');box(0,206,W,99,'#59686b');box(0,211,W,2,'#ccd4bd');
  box(0,301,W,4,'#d9d4b4');box(0,305,W,35,'#d6d7c6');
  const sx=x=>W/2+(x-s.camera)*s.scale;
  if(!s.compressed){
   const spacing=40,first=Math.floor((s.camera-W/(2*s.scale))/spacing);
   for(let k=first;k<=first+Math.ceil(W/(s.scale*spacing))+1;k++){
    const x=sx(k*spacing);
    box(x,159,3,39,'#526965');line(x+1,159,x-7,157,'#526965',2);box(x-13,156,8,3,'#d3c99c');
    box(x-15,310,31,14,'#57746b');txt(fmt(k*spacing,0),x,321,'#fff',10);
   }
  }
  const phase=((s.camera*s.scale)%85+85)%85;
  for(let x=-phase;x<W;x+=85)box(x,271,42,3,'#e2e3ce');
  if(s.stop!=null && sx(s.stop)>-70 && sx(s.stop)<W+70){
   const x=sx(s.stop);box(x-22,161,3,41,'#435a58');box(x+26,161,3,41,'#435a58');box(x-25,156,58,6,'#304f50');box(x-20,165,44,27,'#c6dfdaa8');tag('下一站',x,146);}
  if(s.signal||s.light!=null){
   const x=s.signal?W-100:sx(s.light);
   if(x>0&&x<W){
    if(!s.signal){box(x,156,4,49,'#424d4d');box(x+4,213,4,46,'#f2f2d9');}
    box(x-20,130,42,17,'#253d42');disc(x-10,138,5,s.red?'#fb665c':'#614944');disc(x+11,138,5,s.red?'#365a48':'#76d79a');
    tag(s.signal?'预测信号':'路口',x,118);
   }
  }
  if(s.zone){const x=sx(s.zone[0]),w=sx(s.zone[1])-x;box(x,246,w,15,'#efbd5a99');for(let j=x+10;j<x+w;j+=12)line(j,246,j-8,260,'#a56d30');}
  if(s.ghost!=null){const x=sx(s.ghost);c.setLineDash([5,3]);c.strokeStyle='#246aa2';c.lineWidth=2;c.strokeRect(x-25,252,50,16);c.setLineDash([]);line(x,267,x,279,'#246aa2',2);}
  if(s.radio){const [a,b]=s.radio.map(j=>sx(s.cars[j].x));c.setLineDash([4,4]);line(a,202,b,202,'#16635c',2);c.setLineDash([]);disc(lerp(a,b,(s.t*2)%1),202,4,'#baeaac');}
  for(const v of s.cars){const x=sx(v.x);if(x<-65||x>W+65)continue;drawCar(x,246,v,v.x*.65);tag(v.label,x,195,v.color);}
  if(s.ruler){const [a,b,label]=s.ruler,x=sx(s.cars[a].x),y=sx(s.cars[b].x);
   line(x,284,y,284,'#f8dd9b',2);for(const p of [x,y])line(p,279,p,288,'#f8dd9b',2);tag(label,(x+y)/2,319);}
 }
 function network(s,d){
  const [r,next,f]=s.network;box(0,0,W,H,'#dce5cd');
  function xy(node){const [x,y]=d.nodes[node];return [95+11.8*x,76+8.8*y];}
  for(let j=0;j<45;j++){const x=30+j*71%850,y=20+j*57%280;box(x,y,20,13,'#bdc7ac');box(x-2,y-3,22,6,j%2?'#ab8c72':'#8a9f8f');disc(x+29,y+8,6,'#95ac87');}
  for(const xx of [180,420,655])for(const yy of [117,202]){
   box(xx-38,yy-11,70,30,'#c8c5aa');shape([[xx-40,yy-11],[xx-24,yy-22],[xx+32,yy-22],[xx+32,yy-11]],'#967b65');
   for(let j=0;j<6;j++)box(xx-33+j*10,yy-5,6,8,'#728d89');disc(xx+47,yy+4,10,'#9cb18c');disc(xx+44,yy,7,'#aac19a');
  }
  for(const [a,b] of d.edges){const [x,y]=xy(a),[xx,yy]=xy(b);line(x,y,xx,yy,'#aeb6a6',39);line(x,y,xx,yy,'#536266',32);}
  for(const [a,b] of d.edges){const [x,y]=xy(a),[xx,yy]=xy(b);c.setLineDash([10,8]);line(x,y,xx,yy,'#c9cbb6');c.setLineDash([]);}
  function lane(e,k){const [a,b]=d.edges[e],[x,y]=xy(a),[xx,yy]=xy(b),len=Math.hypot(xx-x,yy-y),dx=(xx-x)/len,dy=(yy-y)/len;return [lerp(x,xx,k)-dy*8,lerp(y,yy,k)+dx*8,Math.atan2(dy,dx)];}
  for(const [j] of d.edges.entries()){
   const [x,y,angle]=lane(j,.84);c.save();c.translate(x,y);c.rotate(angle);
   for(let b=-6;b<=6;b+=4)box(-1,b,4,2,'#d5d8c3');c.restore();
  }
  for(const [j,[,,phase]] of d.edges.entries()){
   const dest=d.edges[j][1],lamp=r[0][dest],color=lamp===phase?'#6de397':lamp===-2?'#ffcc6a':'#f48f82',[x,y]=lane(j,.9);disc(x,y,5,'#263d41');disc(x,y,3,color);
  }
  const nextById=new Map(next[1].map(row=>[row[0],row]));
  for(const [id,e,k,queued] of r[1]){
   const n=nextById.get(id),a=lane(e,k),b=n?lane(n[1],n[2]):lane(e,1);
   const x=lerp(a[0],b[0],f),y=lerp(a[1],b[1],f);
   c.save();c.translate(x,y);c.rotate(f<.5?a[2]:b[2]);box(-3.6,-2.2,7.2,4.4,queued?'#ecc066':['#95d6dc','#b0dbc4','#a1c1e1'][id%3]);box(0,-1.6,1.5,3.2,'#526c72');c.restore();
  }
  for(let j=0;j<4;j++){
   const node=d.region.indexOf(j),[x]=xy(node);tag('区 '+(j+1)+' · 排队 '+r[2][j],x,32);
   tag(r[6][j]?'轮转配时':'拥挤优先',x,307,r[6][j]?'#495f75':'#526e50');
  }
 }
 return {draw(s,d,bg){c.setTransform(canvas.width/W,0,0,canvas.height/H,0,0);if(s.network)network(s,d);else road(s,bg);}};
}
function chart(canvas,values,f){
 const c=canvas.getContext('2d'),w=canvas.width,h=canvas.height;c.clearRect(0,0,w,h);
 const min=Math.min(...values),max=Math.max(...values),span=max-min||1;
 const y=v=>h-6-(v-min)/span*(h-12),x=j=>5+j/(values.length-1)*(w-10);
 c.beginPath();values.forEach((v,j)=>j?c.lineTo(x(j),y(v)):c.moveTo(x(j),y(v)));c.strokeStyle='#528f85';c.lineWidth=2;c.stroke();
 const i=Math.round(f*(values.length-1));c.beginPath();c.moveTo(x(i),0);c.lineTo(x(i),h);c.strokeStyle='#bb8842';c.stroke();c.beginPath();c.arc(x(i),y(values[i]),4,0,Math.PI*2);c.fillStyle='#214c46';c.fill();
}
function mount(host,p,pack,step){
 const [type,title,modes,metric,unit,note]=cfg[p.id],d=pack.road;
 host.innerHTML=`<article class="wrap atlas medium-world road-world"><div class="replay-breadcrumb"><a href="index.html">实例仿真</a> / <a class="problem-ref"></a></div>
 <header class="atlas-title"><div><small></small><h1></h1></div></header>
 <section class="atlas-stage"><div class="atlas-stage-head"><div><small class="road-type"></small><h2></h2></div><output class="m-clock"></output></div>
 <div class="atlas-window"><canvas class="road-map"></canvas></div><div class="road-options" aria-label="仿真方案与观察位置"></div>
 <div class="atlas-control"><button class="play"></button><input class="scrub" type="range" min="0" max="1000" aria-label="回放进度"><select class="rate" aria-label="播放速度"><option value="0.5">0.5×</option><option value="1" selected>1×</option><option value="2">2×</option></select><button class="restart">重播</button></div></section>
 <section class="road-instruments"><dl></dl><div class="road-series"><span></span><output></output><canvas aria-label="指标随回放进度变化"></canvas></div></section>
 <details class="atlas-proof"><summary>实例与回放口径</summary><p></p><code></code></details></article>`;
 const q=sel=>host.querySelector(sel),map=q('.road-map'),trend=q('.road-series canvas'),renderer=surface(map);
 const renderers={P0442:window.ORTOPIA_MIXED,P0476:window.ORTOPIA_CORRIDORS,P0477:window.ORTOPIA_CORRIDORS,P0480:window.ORTOPIA_FLEET,P0482:window.ORTOPIA_FLEET};
 const scene=renderers[p.id],view={images:{},mode:0,focus:0,trial:null,switches:new Map()};
 const ctl=new AbortController(),on=(el,event,fn)=>el.addEventListener(event,fn,{signal:ctl.signal});
 q('.problem-ref').href='index.html#scene/'+p.sceneId;q('.problem-ref').textContent=p.sceneName;q('h1').textContent=p.title;
 q('.atlas-title small').textContent=p.sceneName+' · '+p.id+' · '+pack.sample;q('.road-type').textContent=type;q('h2').textContent=title;
 map.setAttribute('aria-label',type+'动态道路现场');q('.atlas-proof p').textContent=note+(scene?' 车辆和交通设施按实例的模型关系作示意。':'');q('code').textContent=fmt(pack.variables,0)+' 个变量 · '+fmt(pack.constraints,0)+' 条约束 · instance '+pack.instance+' · solution '+pack.solution;
 q('.road-series span').textContent=metric+'（'+unit+'）';
 if(scene){
  const stage=q('.atlas-stage'),anchor=document.createComment('scene position');
  stage.before(anchor);
  const dialog=document.createElement('dialog');dialog.className='atlas medium-world road-world road-expanded';
  dialog.setAttribute('aria-label',type+'放大现场');host.append(dialog);
  const button=document.createElement('button');button.type='button';button.className='road-expand';button.textContent='放大现场';
  q('.atlas-stage-head').append(button);
  on(button,'click',()=>{
   if(dialog.open){dialog.close();return;}
   dialog.append(stage);dialog.showModal();button.textContent='收起现场';
  });
  on(dialog,'close',()=>{anchor.after(stage);button.textContent='放大现场';button.focus();});
 }

 for(let j=0;j<4;j++){const el=document.createElement('div');el.innerHTML='<dt></dt><dd></dd>';q('dl').append(el);}
 const cells=[...host.querySelectorAll('dl div')],bg=new Image(),dur=p.id==='P0364'?35:p.id==='P0442'?8:16;
 let mode=0,f=0,rate=1,playing=!matchMedia('(prefers-reduced-motion: reduce)').matches,at,values,raf=0,last=0;
 function draw(){
  const s=at(f);
  if(scene)scene.draw(map,p.id,s,d,view);else renderer.draw(s,d,bg);
  chart(trend,values,f);
  q('.m-clock').textContent=fmt(s.t,s.unit==='步'?2:3)+' '+s.unit;q('.road-series output').textContent=fmt(s.plot,5);
  s.metrics.forEach(([k,v],j)=>{cells[j].firstChild.textContent=k;cells[j].lastChild.textContent=v;});
  q('.play').textContent=playing?'暂停':f>=1?'重新播放':'播放';q('.scrub').value=Math.round(f*1000);
 }
 function tick(now){if(!playing||document.hidden)return;f=clamp(f+Math.min(120,now-(last||now))*rate/(1000*dur),0,1);last=now;if(f>=1)playing=false;draw();if(playing)raf=requestAnimationFrame(tick);}
 function run(){cancelAnimationFrame(raf);last=0;draw();if(playing&&!document.hidden)raf=requestAnimationFrame(tick);}
 function refresh(){at=episode(p.id,d,mode,view);
  if(p.id==='P0477')q('.road-cost').textContent='全时域目标值 '+fmt(view.cost,2)+'　·　比归档方案增加 '+fmt(view.cost-d.costs[0],2);
  values=Array.from({length:161},(_,k)=>at(k/160).plot);run();}
 function choose(j){mode=j;view.mode=j;
  view.switches.clear();
  if(q('.road-intervene output'))q('.road-intervene output').textContent='';
  if(p.id==='P0480'){
   view.trial=d.trials[j];q('.cloud-input').value=view.trial[0];q('.cloud-setting').textContent=fmt(view.trial[0],6);
  }
  host.querySelectorAll('.road-options button').forEach((el,i)=>el.setAttribute('aria-pressed',String(i===j)));refresh();}
 modes.forEach((name,j)=>{const b=document.createElement('button');b.textContent=name;q('.road-options').append(b);
  on(b,'click',()=>{if(['P0442','P0476','P0480'].includes(p.id))f=0;choose(j);});});
 if(p.id==='P0477'){
  const result=document.createElement('output');result.className='road-cost road-adjust';q('.road-options').after(result);
 }
 if(p.id==='P0477'||p.id==='P0482'){
  const eco=p.id==='P0477',panel=document.createElement('div');
  panel.className='road-adjust road-intervene';
  panel.innerHTML='<span>行驶中接管</span><output aria-live="polite"></output>';
  const output=panel.lastChild;
  const names=eco?['从此刻减速','从此刻加速']:['从此刻启用反馈','从此刻关闭反馈'];
  names.forEach((name,next)=>{
   const b=document.createElement('button');b.type='button';b.textContent=name;panel.insertBefore(b,output);
   on(b,'click',()=>{
    if(f>=1){f=0;view.switches.clear();}
    const step=Math.ceil(at(f).t/d.dt-1e-9);
    for(const key of view.switches.keys())if(key>=step)view.switches.delete(key);
    view.switches.set(step,next);
    output.textContent=fmt(step*d.dt,3)+' 秒起 · '+name.slice(3);
    playing=true;refresh();
   });
  });
  q('.road-options').after(panel);
 }
 if(p.id==='P0442'){
  const label=document.createElement('label');label.className='road-adjust';
  label.innerHTML='<span>跟驰镜头</span><select aria-label="选择观察车辆"><option>网联车 1</option><option>网联车 2</option></select>';
  q('.road-options').after(label);
  on(label.lastChild,'change',e=>{view.focus=e.target.selectedIndex;q('.road-series span').textContent='受控车 '+(view.focus+1)+' 间距偏差（厘米）';refresh();});
 }
 if(p.id==='P0480'){
  const label=document.createElement('label');label.className='road-adjust';
  label.innerHTML='<span>首步云控指令</span><input class="cloud-input" type="range" step="0.01"><output class="cloud-setting"></output>';
  q('.road-options').after(label);
  const input=q('.cloud-input');input.min=-d.limit;input.max=d.limit;
  on(input,'input',()=>{
   const a=Number(input.value),[base,widthGain,centerGain]=d.reach;
   const first=Math.min(d.target,base+widthGain*Math.abs(a)+centerGain*a);
   view.trial=[a,first,d.target,(first-d.target)**2+d.weight*a*a];q('.cloud-setting').textContent=fmt(a);
   q('.road-options').querySelectorAll('button').forEach(el=>el.setAttribute('aria-pressed','false'));refresh();
  });
 }
 on(q('.play'),'click',()=>{if(f===1)f=0;playing=!playing;run();});on(q('.restart'),'click',()=>{f=0;playing=true;run();});
 on(q('.scrub'),'input',e=>{playing=false;f=+e.target.value/1000;run();});on(q('.rate'),'change',e=>rate=+e.target.value);
 function resize(){for(const c of [map,trend]){const r=c.getBoundingClientRect(),dpr=Math.min(2,devicePixelRatio||1);
  c.width=Math.max(1,Math.round(r.width*dpr));c.height=Math.max(1,Math.round(r.height*dpr));}draw();}
 choose(clamp((step||1)-1,0,modes.length-1));resize();const ro=new ResizeObserver(resize);ro.observe(map);ro.observe(trend);
 on(bg,'load',()=>{view.images[p.id]=bg;draw();});
 if(p.id==='P0476')bg.src='assets/replays/road-P0476.webp';else if(p.id==='P0479')bg.src='assets/replays/road-streetscape.webp';
 if(scene?.controls)scene.controls(map,p.id,d,draw,ctl.signal);
 on(document,'visibilitychange',run);document.title=p.title+' · ORtopia';scrollTo(0,0);
 return ()=>{cancelAnimationFrame(raf);ctl.abort();ro.disconnect();};
}
window.ORTOPIA_ROAD_WORLD={mount};
})();
