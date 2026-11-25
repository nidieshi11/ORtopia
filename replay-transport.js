(() => {
'use strict';
const configs={
 P0094:{name:'城郊集货场',actors:['趟次 1','趟次 2'],origin:'0',points:{'0':[135,278],C1a:[380,145],C1b:[715,180],C2a:[410,385],C2b:[745,368]}},
 P0122:{name:'仓库配送街区',actors:['路线 1','路线 2'],origin:'0'},
 P0145:{name:'车机协同配送街区',actors:['卡车','无人机'],origin:'0',points:{'0':[100,330],'3':[320,269],'1':[470,137],'2':[645,275],'4':[815,366]}},
 P0160:{name:'电车与街区充电站',actors:['V0','V1'],origin:'__start',points:{__start:[92,263],B0:[271,142],F0:[466,153],A0:[653,153],B1:[264,378],F1:[466,365],A1:[643,365],__end:[810,272]}},
 P0177:{name:'卡车与配送机器人',actors:['卡车','机器人'],origin:'depot'},
 P0182:{name:'限时配送街区',actors:['路线 1','路线 2'],origin:'depot'},
 P0449:{name:'车队调度场站',points:{location_01:[190,160],location_02:[692,165],location_03:[170,388],location_04:[700,374]}}
};
const W=900,H=490,colors=['#207d75','#cf7130','#5868a1'],cache=new WeakMap();
const esc=v=>String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const clamp=(v,l=0,h=1)=>Math.min(h,Math.max(l,v));
const ease=t=>t*t*(3-2*t);
const mix=(a,b,k)=>a+(b-a)*k;
const at=(p,q,t)=>[mix(p[0],q[0],t),mix(p[1],q[1],t)];
function rand(seed){let n=seed;return ()=>((n=(Math.imul(n,1664525)+1013904223)>>>0)/4294967296);}
function poly(c,ps,fill,stroke,width=1){c.beginPath();ps.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();if(fill){c.fillStyle=fill;c.fill()}if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke()}}
function line(c,ps,color,w){c.beginPath();ps.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.strokeStyle=color;c.lineWidth=w;c.lineCap='round';c.lineJoin='round';c.stroke()}
function oval(c,x,y,rx,ry,fill){c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fillStyle=fill;c.fill()}
function word(c,t,x,y,size,color,weight=600){c.fillStyle=color;c.font=weight+' '+size+'px "Microsoft YaHei","Segoe UI",sans-serif';c.textAlign='center';c.fillText(t,x,y)}
function tint(hex,k){const n=parseInt(hex.slice(1),16);return 'rgb('+[n>>16,(n>>8)&255,n&255].map(x=>Math.round(clamp(x*k,0,255))).join(',')+')'}
function project(x,y){return (u,v,h=0)=>[x+u+v*.52,y+.09*u+.57*v-h];}
function box(c,p,x,z,w,d,h,color){
 const a=p(x,z),b=p(x+w,z),cc=p(x+w,z+d),e=p(x,z+d),A=p(x,z,h),B=p(x+w,z,h),C=p(x+w,z+d,h),E=p(x,z+d,h);
 poly(c,[a,e,E,A],tint(color,.76));poly(c,[e,cc,C,E],tint(color,.91));poly(c,[A,B,C,E],tint(color,1.10));
}
function parcel(c,x,y,scale=1){
 const p=project(x,y);box(c,p,-4*scale,-4*scale,8*scale,7*scale,7*scale,'#cb995a');
 line(c,[p(0,-4*scale,7.2*scale),p(0,3*scale,7.2*scale),p(0,3*scale,4*scale)],'#f2d3a2',1.7*scale);
}
function tree(c,x,y,size,shade){
 c.save();c.translate(x,y);c.scale(size,size);
 oval(c,8,2,15,5,'#72916a46');line(c,[[0,1],[0,-20]],'#716c4a',3.3);
 oval(c,0,-26,13,14,shade?'#58836a':'#72915b');oval(c,-4,-29,10,12,shade?'#6b9976':'#91a96d');oval(c,3,-34,7,8,shade?'#80ab80':'#a1b679');oval(c,-6,-34,3.7,3.8,'#c1d18a55');c.restore();
}
function lamp(c,x,y){
 line(c,[[x,y],[x+11,y+3]],'#66875f44',2);line(c,[[x,y],[x,y-18],[x-4,y-21]],'#697466',1.5);
 oval(c,x-5,y-21,3.5,1.9,'#e8dfb9');
}
function building(c,x,y,w,d,h,type,col){
 const p=project(x,y),left=-w/2,right=w/2;
 poly(c,[p(left,-d),p(right,-d),p(right+13,6),p(left+13,6)],'#627a5844');
 box(c,p,left-3,-d-2,w+6,d+5,2,'#cfcec0');box(c,p,left,-d,w,d,h,type==='warehouse'?'#b8ccbf':type==='depot'?'#abc5c0':'#f1dcb6');
 const panel=(x0,z0,y0,x1,z1,y1,paint)=>poly(c,[p(x0,z0,y0),p(x1,z1,y0),p(x1,z1,y1),p(x0,z0,y1)],paint);
 if(type==='warehouse'||type==='depot'){
  box(c,p,left-2,-d-2,w+4,d+4,h+1,col);
  // The roof sits on top of pale facades, with individual shutters and steel seams.
  poly(c,[p(left,0),p(right,0),p(right,0,h-2),p(left,0,h-2)],'#d9deca');
  for(let u=left+4;u<right-2;u+=5)line(c,[p(u,-d-1,h+1.3),p(u,1,h+1.3)],tint(col,.81),1);
  const bays=w>46?2:1;
  for(let k=0;k<bays;k++){
   const a=left+5+k*(w-8)/bays,b=a+(w-10)/bays-2;
   panel(a,0,0,b,0,h*.72,'#426565');
   for(let hh=2;hh<h*.7;hh+=3)line(c,[p(a+.8,.2,hh),p(b-.8,.2,hh)],'#839e95',.9);
   line(c,[p(a-1,.5,0),p(a-1,.5,h*.75),p(b+1,.5,h*.75)],'#eff1d9',1.4);
  }
  poly(c,[p(left-1,0,h*.83),p(right+1,0,h*.83),p(right+1,5,h*.75),p(left-1,5,h*.75)],'#678a78');
  const stack=p(right+7,-4);parcel(c,stack[0],stack[1],1.05);parcel(c,stack[0]+6,stack[1]+5,.84);
 }else{
  const ridge=h+Math.min(11,d*.44);const over=2;
  poly(c,[p(left-over,-d-over,h),p(right+over,-d-over,h),p(right+over,-d/2,ridge),p(left-over,-d/2,ridge)],tint(col,1.13));
  poly(c,[p(left-over,-d/2,ridge),p(right+over,-d/2,ridge),p(right+over,over,h),p(left-over,over,h)],col);
  poly(c,[p(left-over,-d-over,h),p(left-over,-d/2,ridge),p(left-over,over,h)],tint(col,.84));
  for(let u=left+4;u<right;u+=5)line(c,[p(u,-d/2,ridge),p(u,1,h)],tint(col,.90),.8);
  panel(left+4,0,0,left+10,0,h*.63,'#55756c');
  for(let u=left+15;u<right-3;u+=10){panel(u,0,4,Math.min(u+6,right-2),0,h*.69,'#87aeac');line(c,[p(u-1,0,4),p(Math.min(u+7,right-1),0,4)],'#fff4db',1.5)}
  if(type==='shop'){
   for(let u=left+1,k=0;u<right;u+=5,k++)poly(c,[p(u,0,h*.7),p(Math.min(right,u+5),0,h*.7),p(Math.min(right,u+5),6,h*.55),p(u,6,h*.55)],k%2?'#fbebce':col);
   const crate=p(right+4,0);parcel(c,...crate,.75);
  }else box(c,(u,v,hh)=>p(u,v,hh+ridge-3),right-9,-d/2,4,4,6,'#ae9076');
 }
}
function charger(c,x,y){
 const p=project(x,y);
 box(c,p,-32,-24,63,37,1.6,'#aebca9');
 for(const u of [-21,17]){
  box(c,p,u,-12,7,5,24,'#4b837c');
  poly(c,[p(u+1,-6,15),p(u+6,-6,15),p(u+6,-6,21),p(u+1,-6,21)],'#b4d1b2');
  const a=p(u+8,-5,17);line(c,[a,[a[0]+4,a[1]+9],[a[0]+1,a[1]+14]],'#334c48',1.7);
 }
 for(const u of [-27,22])line(c,[p(u,-16),p(u,-16,33)],'#74867f',3);
 box(c,(u,v,h)=>p(u,v,h+32),-31,-26,65,30,3,'#557f72');
 for(let u=-27;u<30;u+=9)poly(c,[p(u,-22,35),p(u+7,-22,35),p(u+7,0,35),p(u,0,35)],'#637f83');
}
function streetCurve(a,b){
 const d=Math.hypot(b[0]-a[0],b[1]-a[1])||1;
 const bend=Math.min(d*.07,18)*(a[0]<b[0]?1:-1);
 const ctrl=[(a[0]+b[0])/2-(b[1]-a[1])*bend/d,(a[1]+b[1])/2+(b[0]-a[0])*bend/d];
 return t=>at(at(a,ctrl,t),at(ctrl,b,t),t);
}
function smoothPath(c,curve,color,w,dash=[]){c.save();c.setLineDash(dash);const ps=[];for(let i=0;i<=16;i++)ps.push(curve(i/16));line(c,ps,color,w);c.restore()}
function makeWorld(data,cfg){
 const seed=+data.id.slice(1),r=rand(seed*241+23),coords={};
 if(cfg.points)Object.assign(coords,cfg.points);
 else{
   const xs=data.entities.map(n=>n.x),ys=data.entities.map(n=>n.y),xmin=Math.min(...xs),xmax=Math.max(...xs),ymin=Math.min(...ys),ymax=Math.max(...ys);
   const sc=Math.min(676/(xmax-xmin||1),283/(ymax-ymin||1));
   data.entities.forEach(a=>{coords[a.id]=[450+(a.x-(xmin+xmax)/2)*sc,267+(a.y-(ymin+ymax)/2)*sc];});
 }
 const streets=new Map();
 data.steps.forEach(st=>(st.moves||[]).forEach(m=>{if(m.label==='无人机')return;const k=[m.from,m.to].sort().join(':');if(!streets.has(k))streets.set(k,streetCurve(coords[m.from],coords[m.to]));}));
 const backdrop=document.createElement('canvas');backdrop.width=W*2;backdrop.height=H*2;
 const c=backdrop.getContext('2d');c.scale(2,2);
 const gradient=c.createLinearGradient(0,0,300,H);gradient.addColorStop(0,'#d4e3bf');gradient.addColorStop(.55,'#c1d4aa');gradient.addColorStop(1,'#b6c997');c.fillStyle=gradient;c.fillRect(0,0,W,H);
 // Park lawns and joined road surfaces are drawn once per instance.
 for(let j=0;j<1050;j++){const x=r()*W,y=r()*H;oval(c,x,y,.6+r()*1.4,.5+r()*.4,r()<.62?'#6c975e32':'#eff1c64d')}
 const roadSamples=[];for(const curve of streets.values())for(let i=0;i<35;i++)roadSamples.push(curve(i/34));
 const marginRoads=[streetCurve([-60,32],[960,76]),streetCurve([-20,454],[920,500])];
 marginRoads.forEach(f=>{for(let i=0;i<45;i++)roadSamples.push(f(i/44))});
 const curves=[...streets.values(),...marginRoads];
 for(const [w,p] of [[31,'#96a08d'],[29,'#e3ddc9'],[23,'#9ea49a'],[21,'#acaea3']])for(const f of curves)smoothPath(c,f,p,w);
 for(const f of curves)smoothPath(c,f,'#e6dfba',1,[6,9]);
 const staticScene=[],positions=Object.values(coords),lotBounds=[],paths=[];
 // Short neutral sidewalks join buildings to the nearest street without adding a solved route.
 function sidewalk(x,y){
   const nearest=roadSamples.reduce((a,b)=>Math.hypot(x-b[0],y-b[1])<Math.hypot(x-a[0],y-a[1])?b:a);
   const dx=nearest[0]-x,dy=nearest[1]-y,len=Math.hypot(dx,dy);
   if(len<15)return;
   const end=[x+dx*(len-14)/len,y+dy*(len-14)/len];
   paths.push([[x,y],end]);
 }
 const tooClose=(x,y,pts,d)=>pts.some(p=>Math.hypot(x-p[0],y-p[1])<d);
 const roof=['#a96746','#6a8b86','#bd8b59','#708b75','#af755a','#73899b'];
 for(let i=0;i<data.entities.length;i++){
  const n=data.entities[i],[x,y]=coords[n.id],depot=/仓|车场|车队/.test(n.group),ev=n.group==='充电站';
  const w=depot?65:ev?63:43,d=depot?30:ev?30:24,h=depot?29:20+i%3*2;
  const bx=x-4,by=y-14;
  lotBounds.push([bx,by-18]);sidewalk(bx+8,by);
  if(depot){
   poly(c,[[bx-55,by-12],[bx+48,by-19],[bx+56,by+2],[bx-48,by+12]],'#c6c4ae');
   for(let bay=-2;bay<=2;bay++){
    const a=[bx+bay*15-4,by+3],b=[a[0]+5,a[1]+6];
    line(c,[a,b],'#f5f0da',1.3);
   }
  }
  poly(c,[[bx-w*.7,by-29],[bx+w*.48,by-33],[bx+w*.81,by+3],[bx-w*.59,by+6]],depot?'#c8cbbb':'#d5d6bc','#bcc3ac',1);
  staticScene.push({y:by,draw:()=>ev?charger(c,bx,by):building(c,bx,by,w,d,h,depot?'warehouse':'shop',depot?'#648d89':roof[i%roof.length])});
  const lx=x+29,ly=y-8;staticScene.push({y:ly,draw:()=>lamp(c,lx,ly)});
 }
 const used=[];
 // Populate the street edges with homes, trees and pocket gardens, leaving the route visible.
 for(let j=0;j<220;j++){
  const x=r()*(W+70)-30,y=r()*(H+70)-12;
  if(tooClose(x,y,used,42)||tooClose(x,y,positions,59)||tooClose(x,y,lotBounds,61)||tooClose(x,y,roadSamples,33))continue;
  used.push([x,y]);const w=22+r()*12,d=16+r()*7,h=13+r()*7,col=roof[Math.floor(r()*roof.length)];
  if(j%3===0){
    staticScene.push({y,draw:()=>{
     building(c,x,y,w,d,h,'home',col);
     // Doors, short paths and garden fences anchor the houses to the neighborhood.
     line(c,[[x-22,y+4],[x-14,y+6]],'#ded6b5',2.3);
     line(c,[[x+4,y+6],[x+20,y+8]],'#f8eed5',2.7);
     for(let j=0;j<6;j++){let px=x+4+3*j;line(c,[[px,y+7],[px,y+3]],'#eee5ce',1.2);}
    }});
    sidewalk(x-5,y+1);
    poly(c,[[x-23,y-20],[x+14,y-26],[x+27,y+4],[x-19,y+9]],'#d6d9b9');
  }else{const sc=.62+r()*.56;staticScene.push({y,draw:()=>tree(c,x,y,sc,j%2===0)});if(j%4===0)staticScene.push({y:y+5,draw:()=>tree(c,x+13,y+5,sc*.7,j%3===0)});}
 }
 paths.forEach(ps=>{line(c,ps,'#c2c0a8',4.8);line(c,ps,'#e5dfc7',3.1);});
 staticScene.sort((a,b)=>a.y-b.y).forEach(k=>k.draw());
 return {coords,backdrop,cfg};
}
function truck(c,x,y,heading,color,mini=false){
 const s=mini?.85:1,u=[Math.cos(heading)*s,Math.sin(heading)*s*.65],v=[-Math.sin(heading)*s,Math.cos(heading)*s*.65];
 const p=(a,b,h=0)=>[x+a*u[0]+b*v[0],y+a*u[1]+b*v[1]-h*s];
 oval(c,x+4,y+4,19*s,8*s,'#40544341');
 function body(a,b,l,d,h0,h1,tone){
  const floor=[p(a,b,h0),p(a+l,b,h0),p(a+l,b+d,h0),p(a,b+d,h0)];
  const top=[p(a,b,h1),p(a+l,b,h1),p(a+l,b+d,h1),p(a,b+d,h1)];
  const sides=floor.map((pt,j)=>({j,y:(pt[1]+floor[(j+1)%4][1])/2}));
  sides.sort((q,r)=>q.y-r.y).forEach(({j})=>poly(c,[floor[j],floor[(j+1)%4],top[(j+1)%4],top[j]],tint(tone,[.74,1,.90,.79][j])));
  poly(c,top,tint(tone,1.14));
 }
 body(-18,-8,37,16,2,5,'#384a4b');
 body(-17,-8.2,23,16.4,5.2,18,color);
 body(7,-7.5,12,15,5,13,'#e4e1cd');
 for(const side of [-7.8,7.8]){
  poly(c,[p(9,side,9),p(17,side,9),p(15,side,14),p(9,side,14)],'#7fa6ab');
  for(const a of [-10,13]){const wheel=p(a,side*1.04,3.7);oval(c,...wheel,3.3*s,3.6*s,'#2b4140');oval(c,...wheel,1.5*s,1.65*s,'#91a199');}
  line(c,[p(-15,side*1.06,10),p(3,side*1.06,10)],'#e9dfb3',1.7*s);
 }
 poly(c,[p(7,-7,14),p(13,-7,15),p(13,7,15),p(7,7,14)],'#e4e2cd');
 poly(c,[p(13,-7,15),p(17,-7,11),p(17,7,11),p(13,7,15)],'#8eb4b4');
 line(c,[p(19,-5,7),p(19,-2,7)],'#fff3b3',1.8*s);line(c,[p(19,2,7),p(19,5,7)],'#fff3b3',1.8*s);
}
function drone(c,x,y,alt,sec,carrying){
 oval(c,x+6,y+3,12,4,'#344d4b3e');
 const cy=y-alt;
 line(c,[[x-4,cy+1],[x-3,cy+8],[x+4,cy+8],[x+5,cy+1]],'#6e6960',1.7);
 if(carrying)parcel(c,x,cy+7,.65);
 for(const [dx,dy] of [[-13,-5],[13,-5],[-13,5],[13,5]]){
  line(c,[[x,cy],[x+dx,cy+dy]],'#404e51',2.9);
  oval(c,x+dx,cy+dy,6,2.5,'#cce1dc9f');
  const spin=sec*23+dx;line(c,[[x+dx-5*Math.cos(spin),cy+dy-2*Math.sin(spin)],[x+dx+5*Math.cos(spin),cy+dy+2*Math.sin(spin)]],'#3b4e4c',1.5);
 }
 oval(c,x,cy,7.2,4.2,'#cc8541');oval(c,x+2,cy-1,4.6,2.3,'#f0cc82');
}
function robot(c,x,y,heading){
 const k=heading>Math.PI/2||heading< -Math.PI/2?-1:1;
 c.save();c.translate(x,y);c.scale(k,1);
 const p=project(0,0);oval(c,2,2,12,3.8,'#36534749');box(c,p,-9,-7,16,10,9,'#dc935a');
 for(const xx of [-6,5]){oval(c,xx,1,3.6,3.6,'#374846');oval(c,xx,1,1.4,1.4,'#8fa399');}
 poly(c,[[-8,-8],[-7,-13],[3,-15],[10,-10],[8,-7]],'#f6eee2');oval(c,8,-7,2.2,1.4,'#3d6e6f');
 line(c,[[0,-12],[0,-21]],'#5c6860',1);poly(c,[[0,-21],[6,-19],[0,-17]],'#da914b');c.restore();
}
function human(c,x,y,t,walking,uniform,carry=false,flip=1){
 const k=walking?Math.sin(t*8):0,bob=walking?Math.abs(k)*1.35:Math.sin(t*2)*.24;
 c.save();c.translate(x,y);c.scale(flip,1);
 oval(c,3,1,7.5,2.6,'#3957403e');
 const hip=-8-bob,shoulder=-17-bob;
 line(c,[[0,hip],[-1-k*2.4,-4],[-2-k*3.9,0]],'#344a52',3);
 line(c,[[1,hip],[2+k*2.5,-4],[2+k*3.9,0]],'#4c5a5b',3.2);
 line(c,[[-3,1],[0+k*4,1]],'#433e33',1.8);
 poly(c,[[-3.3,shoulder],[2.7,shoulder-.2],[4.1,hip],[ -3.5,hip]],uniform);
 if(carry){
  line(c,[[-2,shoulder+1],[-4,shoulder+6],[1,shoulder+7]],'#b57a52',2.8);
  parcel(c,6,shoulder+10,1);
  line(c,[[2,shoulder-.1],[3,shoulder+4],[7,shoulder+5]],'#d59c76',2.9);
 }else{
  line(c,[[-2,shoulder+1],[-3-k,shoulder+5],[-2-k*3.1,shoulder+9]],'#bc8861',2.7);
  line(c,[[2,shoulder+1],[3+k,shoulder+5],[4+k*3.1,shoulder+8.2]],'#d5a57c',2.8);
 }
 oval(c,0,shoulder-4,3.8,4.3,'#d4a07b');oval(c,-.7,shoulder-6.4,3.8,2.4,'#53483b');
 line(c,[[-3.7,shoulder-6.6],[5,shoulder-6.1]],uniform,2.1);
 c.restore();
}
const metric=(st,k)=>st?.metrics?.find(m=>m.label===k)?.value;
const eventTime=st=>{const m=String(st.time||'').match(/-?\d+(?:\.\d+)?/);return m?+m[0]:0};
function legsFor(data,name){
 const legs=[];
 data.steps.forEach((st,index)=>(st.moves||[]).filter(m=>m.label===name).forEach(m=>{
   const end=eventTime(st),duration=metric(st,'本段行驶秒数')??metric(st,'卡车路段时间')??metric(st,'飞行耗时');
   const begin=duration!=null?end-Number(duration):null;
   legs.push({...m,index,begin,end});
 }));
 return legs;
}
function trackRecord(name,index,t,data,config){
 let pos=config.origin,active=null,frac=0;
 const st=data.steps[index],tEnd=eventTime(st),tBegin=index?eventTime(data.steps[index-1]):tEnd;
 const ratio=clamp((t-.07)/.69),modelTime=mix(tBegin,tEnd,ratio);
 for(const m of legsFor(data,name)){
  if(m.begin!==null&&m.end>m.begin+.00001&&tBegin!==tEnd){
   if(modelTime>=m.begin-.0001&&modelTime<m.end-.0001){active=m;frac=clamp((modelTime-m.begin)/(m.end-m.begin));break;}
   if(modelTime>=m.end-.0001){pos=m.to;continue;}
  }
  if(m.index<index){pos=m.to;continue;}
  if(m.index===index){active=m;frac=ease(ratio);break;}
 }
 return {pos,active,frac};
}
// A truck visit time is a rendezvous time. Here the truck drives immediately after launch
// and spends the available slack waiting at recovery; the submitted plan fixes both endpoints.
function rendezvous(data){
 const lift=data.steps.findIndex(st=>st.title.includes('起飞'));
 const drop=data.steps.findIndex(st=>st.moves.some(m=>m.label==='无人机'));
 const land=data.steps.findIndex(st=>st.title.includes('会合'));
 const airOut=data.steps[drop].moves[0],airBack=data.steps[land].moves[0];
 const groundStep=data.steps.find(st=>st.moves.some(m=>m.label==='卡车'&&m.from===airOut.from&&m.to===airBack.to));
 const exact=window.ORTOPIA_REPLAY_LOGIC?.[data.id]?.[0]?.rendezvous;
 return {lift,drop,land,airOut,airBack,ground:groundStep.moves[0],
   ...(exact||{launch:eventTime(data.steps[lift]),delivery:eventTime(data.steps[drop]),
     recovery:eventTime(data.steps[land]),groundDuration:Number(metric(groundStep,'卡车路段时间'))})};
}
function syncedBranch(f,index,progress){
 const {lift,drop,land,airOut,airBack,ground,launch,delivery,recovery,groundDuration}=f;
 let now=launch;
 if(index===drop)now=mix(launch,delivery,progress);
 else if(index>drop&&index<land)now=mix(delivery,recovery,progress);
 else if(index===land)now=recovery;
 function travel(m,from,to,air=false){
  const frac=clamp((now-from)/(to-from));
  if(frac>=1)return {pos:m.to,active:null,frac};
  return {pos:m.from,active:{...m,air},frac};
 }
 const truck=travel(ground,launch,launch+groundDuration);
 const drone=now<=delivery?travel(airOut,launch,delivery,true):travel(airBack,delivery,recovery,true);
 const airborne=45,altitude=index===lift?mix(18,airborne,ease(progress)):
   index===land?mix(airborne,18,ease(progress)):airborne;
 return {team:[truck,drone],now,altitude,aboard:index===land&&progress===1};
}
function showBranchOnMap(c,world,branch){
 const f=world.rendezvous,coords=world.coords;
 const road=streetCurve(coords[f.ground.from],coords[f.ground.to]);
 smoothPath(c,road,'#fcfbecdd',6);smoothPath(c,road,'#277767',2.4);
 for(const flight of [f.airOut,f.airBack]){
  const air=u=>{const p=at(coords[flight.from],coords[flight.to],u);return [p[0],p[1]-45]};
  smoothPath(c,air,'#fff6ddbd',4.5);smoothPath(c,air,'#a75b24',2,[6,5]);
 }
 if(branch.now>=f.launch+f.groundDuration){
  const [x,y]=coords[f.ground.to],complete=branch.now>=f.recovery;
  c.fillStyle=complete?'#255b4e':'#865b24';
  c.beginPath();c.roundRect(x-39,y+20,78,22,5);c.fill();
  word(c,complete?'车机会合':'卡车等候',x,y+36,13,'#fffdf5');
 }
}
// The alternate tour is independently enumerated with all customers assigned to the truck.
function truckOnlyMap(c,world,plan,sec){
 const coords=world.coords,f=world.rendezvous,seq=plan.sequence;
 const tripDuration=plan.durations.reduce((a,b)=>a+b,0);
 const now=tripDuration*clamp(sec/6);
 // Keep both options legible even when their ground legs share the same map coordinates.
 const road=streetCurve(coords[f.ground.from],coords[f.ground.to]);
 smoothPath(c,road,'#54665d',3.1,[7,5]);
 for(const m of [f.airOut,f.airBack]){
  const airway=k=>{const p=at(coords[m.from],coords[m.to],k);return [p[0],p[1]-42]};
  smoothPath(c,airway,'#fff4df',4.5);smoothPath(c,airway,'#ac642b',2.2,[5,5]);
 }
 let elapsed=0,marker=null;
 for(let j=0;j<plan.durations.length;j++){
  const a=coords[seq[j]],b=coords[seq[j+1]],curve=streetCurve(a,b),duration=plan.durations[j];
  smoothPath(c,curve,'#e8eadc',8);smoothPath(c,curve,'#622e63',3.4);
  if(!marker&&(now<=elapsed+duration||j===plan.durations.length-1)){
   const u=clamp((now-elapsed)/duration),p=curve(u),l=curve(clamp(u-.02)),r=curve(clamp(u+.02));
   marker={p,angle:Math.atan2((r[1]-l[1])/.65,r[0]-l[0])};
  }
  elapsed+=duration;
 }
 for(let j=1;j<seq.length-1;j++){
  const [x,y]=coords[seq[j]];
  oval(c,x-20,y+12,10,10,'#622e63');word(c,String(j),x-20,y+16,12,'#fff');
  human(c,x+15,y+6,sec,false,'#a57554',false,-1);
 }
 truck(c,marker.p[0],marker.p[1]+4,marker.angle,'#784979');
 drone(c,marker.p[0],marker.p[1]-2,18,0,false);
 c.fillStyle='#4e3154';c.beginPath();c.roundRect(14,14,202,28,6);c.fill();
 word(c,'对照方案 · 全部由卡车配送',115,34,15,'#fffaf2');
}
function choiceLine(c,a,b,ink,dashed=false){
 if(a[0]===b[0]&&a[1]===b[1]){
  c.save();c.setLineDash(dashed?[4,4]:[]);c.strokeStyle=ink;c.lineWidth=3;
  c.beginPath();c.ellipse(a[0]+15,a[1]+7,19,12,.1,.2,5.8);c.stroke();c.restore();
  poly(c,[[a[0]+31,a[1]-5],[a[0]+35,a[1]+2],[a[0]+26,a[1]]],ink);return;
 }
 const curve=streetCurve(a,b);
 smoothPath(c,curve,'#fff9e9df',7);smoothPath(c,curve,ink,3.8,dashed?[7,5]:[]);
 const p=curve(.58),q=curve(.59),rad=Math.atan2(q[1]-p[1],q[0]-p[0]);
 c.save();c.translate(...p);c.rotate(rad);poly(c,[[6,0],[-5,-5],[-3,0],[-5,5]],ink);c.restore();
}
function annotation(c,items,coords,ink){
 const occupied=[];
 for(const [id,label] of items){
  const [x,y]=coords[id];c.font='600 14px "Microsoft YaHei",sans-serif';
  const w=c.measureText(label).width+14,h=22;
  const spots=[[0,26],[0,-34],[0,54],[52,30],[-52,30],[0,-98]];
  const choices=spots.map(([dx,dy])=>[clamp(x+dx-w/2,4,W-w-4),clamp(y+dy,43,H-h-5)]);
  const hits=([x0,y0])=>occupied.some(([x1,y1,w1])=>x0<x1+w1+4&&x0+w+4>x1&&y0<y1+h+2&&y0+h+2>y1);
  const [bx,by]=choices.find(p=>!hits(p))||choices[0];occupied.push([bx,by,w]);
  const anchor=[clamp(x,bx+4,bx+w-4),by<y?by+h:by];
  line(c,[[x,y],anchor],ink,1.3);oval(c,x,y,3,3,ink);
  c.fillStyle=ink;c.beginPath();c.roundRect(bx,by,w,h,4);c.fill();
  word(c,label,bx+w/2,by+16,14,'#fff');
 }
}
function choiceMap(c,world,plan){
 const coords=world.coords,clr=plan.valid?'#693a70':'#a13e37',route=plan.route;
 // A paused counterfactual is static so an infeasible movement never looks like a completed trip.
 c.fillStyle='#f6f3e428';c.fillRect(0,0,W,H);
 if(plan.kind==='fleet'){
  const [a,b]=plan.oldRoute;choiceLine(c,coords[a],coords[b],'#637065',true);
 }
 for(let j=1;j<route.length;j++){
  const possible=plan.valid||(plan.kind==='energy'&&j===1);
  choiceLine(c,coords[route[j-1]],coords[route[j]],possible?'#744274':clr,!possible);
 }
 if(plan.kind==='cargo'){
  const warehouse=coords[plan.origin];const palette=['#356f76','#83598d'];
  plan.clients.forEach((id,j)=>choiceLine(c,coords[id],warehouse,palette[j],true));
  const bx=clamp(warehouse[0]-122,10,W-285),by=clamp(warehouse[1]+32,42,H-90);
  c.fillStyle='#faf8ed';c.fillRect(bx,by,275,66);c.strokeStyle=clr;c.lineWidth=1.4;c.strokeRect(bx,by,275,66);
  word(c,'仓库装车 · 每格 1 单位货量',bx+137,by+17,13,'#394e47');
  const total=plan.amounts.reduce((a,b)=>a+b,0),cell=Math.min(16,238/total);
  for(let j=0;j<total;j++){
   c.fillStyle=j>=plan.capacity?'#b14e39':j<plan.amounts[0]?palette[0]:palette[1];
   c.fillRect(bx+10+j*cell,by+24,cell-2,14);
  }
  const limit=bx+9+plan.capacity*cell;
  line(c,[[limit,by+20],[limit,by+42]],'#532926',2);
  word(c,'车容量 '+plan.capacity+'   /   订单 '+total,bx+137,by+56,13,'#66382f');
  truck(c,warehouse[0],warehouse[1],0,'#57736c',true);
 }
 if(plan.kind==='energy'){
  const [x,y]=coords[plan.truck];truck(c,x,y,0,'#774575');
  const end=coords[route.at(-1)],mx=(x+end[0])/2,my=(y+end[1])/2;
  oval(c,mx,my,10,10,clr);line(c,[[mx-5,my],[mx+5,my]],'#fff',2.6);
 }
 if(plan.kind==='fleet'){
  for(let j=0;j<plan.locations.length;j++){
   const [x,y]=coords[plan.locations[j]];
   for(let k=0;k<plan.stocks[j];k++){
    truck(c,x+(k%4-1.5)*24,y+5+Math.floor(k/4)*14,.1,k>=plan.previous[j]?'#995889':'#38756c',true);
   }
  }
 }
 if(plan.robotAboard){const [x,y]=coords[plan.robotAboard];truck(c,x,y,.1,'#744274');robot(c,x-8,y-16,.1);}
 annotation(c,plan.marks,coords,clr);
 c.font='600 15px "Microsoft YaHei",sans-serif';const title='对照方案 · '+plan.title,w=c.measureText(title).width+20;
 c.fillStyle=clr;c.beginPath();c.roundRect(12,12,w,28,4);c.fill();word(c,title,12+w/2,32,15,'#fff');
}
function branchPanel(f){
 const pct=v=>(100*v/(f.recovery-f.launch)).toFixed(3)+'%';
 const fmt=t=>t.toFixed(3);
 function row(name,split,left,right,air){
  const first=air?'#b86426':'#287667',second=air?'#da9451':'#c4ccbd';
  return '<div style="display:grid;grid-template-columns:4.5em minmax(0,1fr);align-items:center;gap:.35rem"><b>'+name+'</b>'+
   '<div style="position:relative"><div style="height:8px;border-radius:4px;background:linear-gradient(to right,'+first+' '+split+','+second+' '+split+')"></div>'+
   '<i data-sync-hand style="position:absolute;top:-3px;height:14px;width:2px;background:#152f29"></i><small>'+left+' · '+right+'</small></div></div>';
 }
 return '<figure style="background:#eff3eb;margin:0;padding:.55rem .85rem;display:grid;gap:.35rem;color:#24493f;font-size:.82rem;text-align:left">'+
  '<figcaption><b>并行配送</b>　<span data-sync-clock></span></figcaption>'+
  row('卡车',pct(f.groundDuration),'行驶 '+fmt(f.groundDuration),'等候 '+fmt(f.recovery-f.launch-f.groundDuration),false)+
  row('无人机',pct(f.delivery-f.launch),'送达 '+fmt(f.delivery),'回收 '+fmt(f.recovery),true)+
  '<small>两条时间轴从起飞时刻 '+fmt(f.launch)+' 开始。画面取卡车立即出发、在回收点等候的时序。</small></figure>';
}
function pointOnLeg(world,record){
 if(!record.active){return {pos:world.coords[record.pos],angle:.09};}
 const m=record.active;const a=world.coords[m.from],b=world.coords[m.to],curve=m.air?(u=>at(a,b,u)):streetCurve(a,b),u=record.frac;
 const p=curve(u),l=curve(clamp(u-.01)),r=curve(clamp(u+.01));
 return {pos:p,angle:Math.atan2((r[1]-l[1])/.65,r[0]-l[0])};
}
function hatch(c,curve,t,color,air=false){
 const ps=[];for(let i=0;i<=25;i++){const k=t*i/25,p=curve(k);ps.push([p[0],p[1]-(air?19+Math.sin(k*Math.PI)*16:0)]);}
 c.save();c.globalAlpha=.67;c.setLineDash(air?[4,4]:[]);line(c,ps,color,air?2.2:2.6);c.restore();
}
function names(c,data,world,st){
 const coords=world.coords;
 for(const e of data.entities){const [x,y]=coords[e.id];const title=e.label,hot=st.active.map(String).includes(e.id);
  const px=14;c.font='600 '+px+'px "Microsoft YaHei",sans-serif';
  const w=Math.ceil(c.measureText(title).width)+13,ly=Math.max(15,y-(e.group==='充电站'?68:69));
  c.fillStyle=hot?'#285d51ed':'#f7f5e9eb';c.beginPath();c.roundRect(x-w/2,ly-15,w,21,5);c.fill();
  word(c,title,x,ly,px,hot?'white':'#354a40');
 }
}
function routes(c,data,index,world,sec){
 const cfg=world.cfg,st=data.steps[index],t=clamp(sec/6);
 let team=cfg.actors.map(name=>trackRecord(name,index,t,data,cfg)),branch=null,aboard=false;
 if(data.id==='P0145'){
  const f=world.rendezvous;
  if(index>=f.lift&&index<=f.land){
   branch=syncedBranch(f,index,t);
   team=branch.team;aboard=branch.aboard;showBranchOnMap(c,world,branch);
  }else{
   aboard=true;
   if(!st.time){const last=data.steps.flatMap(step=>step.moves).filter(m=>m.label==='卡车').at(-1);team[0]={pos:last.to,active:null,frac:0};}
   team[1]={...team[0]};
  }
 }
 const moving=[],ground=[];
 team.forEach((record,j)=>{
  const actor=cfg.actors[j],{active}=record,loc=pointOnLeg(world,record);const [x,y]=loc.pos;
  // P0122 has two independent routes but no vehicle-to-vehicle ordering.
  if(data.id==='P0122'&&!st.title.startsWith(actor))return;
  if(data.id==='P0094'){
    const first=data.steps.findIndex(s=>s.title===actor+'出场'),last=data.steps.findIndex(s=>s.title===actor+'完成卸货');
    if(index<first||index>last)return;
  }
  if(active&&!branch&&!(actor==='无人机'&&aboard)){
   const a=world.coords[active.from],b=world.coords[active.to];
   const curve=active.air?(u=>at(a,b,u)):streetCurve(a,b);
   hatch(c,curve,record.frac,colors[j],actor==='无人机');
  }
  const other=team[1-j],same=other&&!active&&!other.active&&record.pos===other.pos;
  const offset=same&&!aboard&&!branch?(j===0?-13:13):0;
  if(actor==='无人机'){
   const altitude=branch?branch.altitude:18;
   const carrying=index<world.rendezvous.drop||(index===world.rendezvous.drop&&branch.now<world.rendezvous.delivery);
   moving.push({y:y+1,draw:()=>drone(c,x+offset,y-3,altitude+(!aboard?Math.sin(sec*2)*1.1:0),aboard?0:sec,carrying)});
  }else if(actor==='机器人'){moving.push({y,draw:()=>robot(c,x+offset,y+5,loc.angle)});}
  else{moving.push({y,draw:()=>truck(c,x+offset,y+4,loc.angle,colors[j])});}
 });
 // The staff are illustrative performers, not additional assignments in the solution.
 const servicePlace=st.moves?.[0]?.to||st.active[st.active.length-1];
 data.entities.forEach((e,j)=>{
  const [x,y]=world.coords[e.id],working=e.id===servicePlace,charge=e.group==='充电站';
  if(charge&&!working)return;
  const src=[x+17,y-10],dest=[x+10,y+7];
  if(working){
   const u=st.moves?.length?clamp((t-.62)/.33):clamp(t/.7);
   const p=at(src,dest,ease(u));ground.push({y:p[1],draw:()=>human(c,...p,sec+.6,u>0&&u<1,'#dd8a43',!charge,-1)});
   if(data.id==='P0094'&&st.title.includes('完成卸货')){
    const z=at([x+5,y],[x-18,y-13],ease(clamp((t-.15)/.72)));
    ground.push({y:z[1],draw:()=>human(c,...z,sec*1.1,t>.15&&t<.87,'#55877a',true,-1)});
   }
   if(charge&&t>.74){
    const end=world.coords[e.id];line(c,[[x+8,y-19],[x+8,y-4],[end[0]+3,end[1]+1]],'#355e53',2.4);
   }
  }else{
   const f=.5+.5*Math.sin(sec*.62+j),p=[x+17+10*f,y-7+2*f];
   ground.push({y:p[1],draw:()=>human(c,...p,sec+j,true,j%2?'#698b9b':'#ba7a45',false,Math.cos(sec*.62+j)>0?1:-1)});
  }
 });
 [...ground,...moving].sort((a,b)=>a.y-b.y).forEach(z=>z.draw());
 return branch;
}
function fleet(c,data,index,world,sec){
 const st=data.steps[index],t=clamp(sec/6);
 let snap=data.steps[0];for(let i=0;i<=index;i++)if(data.steps[i].changes.length)snap=data.steps[i];
 const actions=st.moves||[],frame=[];
 for(const ch of snap.changes){const k=ch.id,[x,y]=world.coords[k],q=parseInt(ch.value,10);
  let vehicle=0;
  for(const m of actions.filter(m=>m.from===k))for(let j=0;j<parseInt(m.label,10);j++){
   const curve=streetCurve(world.coords[m.from],world.coords[m.to]),u=ease(clamp((t-j*.035-.04)/.79)),p=curve(u),a=curve(clamp(u-.02)),b=curve(clamp(u+.02));
   const offset=(vehicle%3-1)*13,dx=offset*(.67+.33*Math.cos(u*Math.PI*2)),dy=(Math.floor(vehicle/3)*9+3);
   const angle=Math.atan2((b[1]-a[1])/.65,b[0]-a[0]);
   if(j===0)hatch(c,curve,u,colors[0]);frame.push({y:p[1]+dy,draw:()=>truck(c,p[0]+dx,p[1]+dy,angle,colors[j%2],true)});vehicle++;
  }
  for(;vehicle<q;vehicle++){const px=x-38+(vehicle%3)*31,py=y+8+Math.floor(vehicle/3)*17;
   frame.push({y:py,draw:()=>truck(c,px,py,.25,'#388a80',true)});}
  const px=x+45+Math.sin(sec*.7)*5;
  frame.push({y:y+5,draw:()=>human(c,px,y+5,sec,true,'#cf8440',false,1)});
 }
 frame.sort((a,b)=>a.y-b.y).forEach(z=>z.draw());
}
function footer(d,i){
 const st=d.steps[i], cfg=configs[d.id];
 if(d.id==='P0449'){
   const snap=d.steps.slice(0,i+1).reverse().find(s=>s.changes.length);
   return snap.changes.map(x=>'<span>'+esc(d.entities.find(e=>e.id===x.id).label)+' <b>'+esc(x.value)+'</b></span>').join('');
 }
 return cfg.actors.map(name=>{
  const records=d.steps.slice(0,i+1).filter(s=>s.moves?.some(m=>m.label===name)),last=records.at(-1);
  let id=last?.moves.find(m=>m.label===name).to||cfg.origin;
  if(d.id==='P0145'&&name==='无人机'){
   const launch=d.steps.findIndex(s=>s.title.includes('起飞')),land=d.steps.findIndex(s=>s.title.includes('会合'));
   if(i<launch||i>land){const tr=d.steps.slice(0,i+1).flatMap(s=>s.moves||[]).filter(m=>m.label==='卡车').at(-1);id=tr?.to||cfg.origin;}
   if(i===launch)id=d.steps[i].active[0];
  }
  let n=d.entities.find(a=>a.id===id)?.label||id;
  if(d.id==='P0160')n+=' · 抵达电量 '+(metric(last,'到达电量')??8);
  return '<span><b>'+esc(name)+'</b>　'+esc(n)+'</span>';
 }).join('');
}
function render(stage,data,index){
 const cfg=configs[data.id];if(!cfg)return;
 let world=cache.get(data);
 if(!world){world=makeWorld(data,cfg);cache.set(data,world);}
 if(data.id==='P0145')world.rendezvous=rendezvous(data);
 const f=world.rendezvous,showSync=f&&index>=f.lift&&index<=f.land;
 const st=data.steps[index];
 const option=window.ORTOPIA_REPLAY_LOGIC?.[data.id]?.[index]?.comparison;
 const mapChoice=option?.world;
 const allowAlternate=!!(mapChoice||(f?.truckOnly&&option&&(index===0||index===data.steps.length-1)));
 stage.innerHTML='<section class="tr-world" style="margin:0;background:#f7f8ef"><canvas data-step="'+index+'" width="1800" height="980" style="display:block;width:100%;height:auto" role="img" aria-label="'+esc(cfg.name+' · '+st.title)+'"></canvas>'+(showSync?branchPanel(f):'<div style="display:flex;flex-wrap:wrap;gap:4px 18px;padding:6px 12px;color:#345a49;background:#f1f4ea;font-size:.8rem"><small>'+ (data.id==='P0449'?'最近一期库存':'本步结束时的最近记录')+'</small>'+footer(data,index)+'</div>')+'</section>';
 const canvas=stage.querySelector('canvas'),c=canvas.getContext('2d');
 let alternate=false;
 const normalInfo=stage.querySelector('.tr-world>div');
 let legend=null;
 if(allowAlternate){
  legend=document.createElement('div');legend.hidden=true;legend.setAttribute('aria-label','对照路线图例');
  legend.style.cssText='padding:8px 12px;background:#f2edf2;color:#49374c;font-size:.85rem';
  if(mapChoice){
   legend.innerHTML='<b>对照方案 · '+esc(mapChoice.title)+'</b><br>'+esc(mapChoice.description);
  }else{
   const alt=f.truckOnly;
   legend.innerHTML='<b>对照方案 · 全部卡车配送</b>　'+alt.sequence.map(esc).join(' → ')+
   '<br>紫色实线表示对照路线，编号表示交货次序。灰色虚线表示原方案卡车直达段，橙色虚线表示原方案无人机支线。'+
   '<br>对照方案地面费用 '+alt.groundCost.toFixed(4)+'，含迟到罚金的总费用 '+alt.cost.toFixed(4)+'。无人机全程随车。';
  }
  stage.querySelector('.tr-world').append(legend);
 }
 const markers=stage.querySelectorAll('[data-sync-hand]'),clock=stage.querySelector('[data-sync-clock]');
 function draw(seconds){
  c.setTransform(2,0,0,2,0,0);c.drawImage(world.backdrop,0,0,W,H);
  if(alternate){
   names(c,data,world,st);
   if(mapChoice)choiceMap(c,world,mapChoice);else truckOnlyMap(c,world,f.truckOnly,seconds);
   return;
  }
  names(c,data,world,st);
  if(data.id==='P0449'){fleet(c,data,index,world,seconds);return;}
  const branch=routes(c,data,index,world,seconds);
  if(branch&&clock){
   const percent=clamp((branch.now-f.launch)/(f.recovery-f.launch))*100;
   markers.forEach(m=>m.style.left='calc('+percent+'% - 1px)');
   const phase=branch.now>=f.recovery?'会合':branch.now>=f.launch+f.groundDuration?'卡车等候回收':branch.now>=f.delivery?'无人机飞向回收点':'两条支线开始';
   clock.textContent='当前时刻 '+branch.now.toFixed(3)+' · '+phase;
  }
 }
 if(allowAlternate){
  stage.previewDecision=optionIndex=>{
   if(!stage.contains(canvas))return;
   alternate=optionIndex===1;legend.hidden=!alternate;
   if(normalInfo)normalInfo.style.display=alternate?'none':'flex';
   canvas.setAttribute('aria-label',alternate?'对照方案 · '+(mapChoice?.title||'全部卡车配送路线'):cfg.name+' · '+st.title);
   draw(Math.max(0,Number(stage.sceneTime)||0));
  };
 }else{
  delete stage.previewDecision;
 }
 stage.sceneFrame=draw;
 draw(Math.max(0,Number(stage.sceneTime)||0));
}
window.ORTOPIA_TRANSPORT={supports:id=>Object.hasOwn(configs,id),render};
})();
