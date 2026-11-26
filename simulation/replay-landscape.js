/* Canvas scenery and instruments for the verified instance replays. */
(()=> {
'use strict';
const palettes={
 depot:['#adcbb7','#dce6c8','#28756c'], plant:['#a9c5c3','#d1ded4','#456a81'],
 street:['#b5cbb2','#d7e4cf','#37786d'], rail:['#b6c7cb','#e0e5d6','#506a83'],
 port:['#9bc9d0','#d3e1ce','#287c91'], air:['#bbd3df','#dce9db','#54799c'],
 power:['#bdd1b4','#e8e5c5','#46774d'], market:['#dbccad','#f2e1bf','#ac6145'],
 clinic:['#b7d2c9','#dfebe2','#367b82'], relief:['#cbbd97','#eaddbc','#916b36'],
 cloud:['#bed0da','#dde6e9','#547796'], network:['#b8cdbe','#deeadb','#54775f']
};
const defaultKinds=['depot','plant','street','rail','port','air','power','market','clinic','relief','cloud','network'];
function sceneType(p){
 const s=p.title;
 if(/列车|铁路|地铁|轨道交通/.test(s))return 'rail';
 if(/港口|码头|集装箱|海运|船舶/.test(s))return 'port';
 if(/无人机|航班|机场|航空/.test(s))return 'air';
 return defaultKinds[Number(p.domainId.slice(0,2))-1]||'network';
}
function frame(canvas,p,track,index,progress,overlay,custom){
 const ctx=canvas.getContext('2d'),width=canvas.width,height=canvas.height;
 if(!width||!height)return [];
 const W=900,H=385,k=sceneType(p),pal=palettes[k],route=track.mode==='route';
 ctx.setTransform(width/W,0,0,height/H,0,0);
 const rect=(x,y,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(x,y,w,h);};
 function poly(pts,c,outline=''){ctx.beginPath();pts.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fillStyle=c;ctx.fill();if(outline){ctx.strokeStyle=outline;ctx.lineWidth=1;ctx.stroke();}}
 function line(pts,c,l=2){ctx.beginPath();pts.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.strokeStyle=c;ctx.lineWidth=l;ctx.lineJoin='round';ctx.lineCap='round';ctx.stroke();}
 function oval(x,y,rx,ry,c){ctx.fillStyle=c;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fill();}
 function label(txt,x,y,c='#25423d',size=13){ctx.font='600 '+size+'px system-ui,sans-serif';ctx.textAlign='center';ctx.fillStyle=c;ctx.fillText(String(txt),x,y);}
 function chip(txt,x,y,active){txt=String(txt);if(txt.length>21)txt=txt.slice(0,10)+'…'+txt.slice(-8);ctx.font='600 13px system-ui';const ww=Math.min(174,ctx.measureText(txt).width+14);rect(x-ww/2,y-12,ww,19,active?'#1b4845':'#fffffff0');label(txt,x,y+2,active?'#fff':'#24453f',12);}
 const seed=Number(p.id.slice(1)),sky=ctx.createLinearGradient(0,0,0,160);sky.addColorStop(0,'#dcecf2');sky.addColorStop(1,'#f4efe0');rect(0,0,W,H,sky);
 oval(780,31,19,19,'#faf0c5');for(let i=0;i<24;i++){const x=i*43-8,y=56+14*Math.sin(i*.8+seed);poly([[x,89],[x+29,y],[x+64,89]],'#b8cdbe');}
 rect(0,83,W,H-83,pal[1]);for(let i=0;i<19;i++){const x=(i*79+seed*13)%900,y=93+(i*61)%278;line([[x,y],[x+13,y-3]],pal[0],1);}
 if(k==='port'){poly([[0,93],[900,93],[900,119],[0,186]],'#8bbcc0');for(let j=0;j<11;j++)line([[j*75,128-j*.8],[j*75+30,126-j*.8]],'#d5e9e4');}
 else if(k==='street'||k==='rail'){line([[0,123],[900,96]],'#aab6ac',10);line([[0,124],[900,97]],'#f0eed9',2);}
 function box(x,y,w,h,d,front,side,roof){
  poly([[x-w/2,y-h],[x+w/2,y-h],[x+w/2+d,y-h-d*.53],[x-w/2+d,y-h-d*.53]],roof);
  rect(x-w/2,y-h,w,h,front);
  poly([[x+w/2,y],[x+w/2+d,y-d*.53],[x+w/2+d,y-h-d*.53],[x+w/2,y-h]],side);
 }
 function tree(x,y){rect(x-1,y-10,3,12,'#867350');oval(x,y-14,8,12,'#85a786');oval(x-3,y-15,5,8,'#9ab596');}
 for(let i=0;i<16;i++)tree((i*119+seed*7)%900,89+i%3*5);
 function building(x,y,scale,active){
  ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);
  const accent=active?'#d67e3d':pal[2];oval(5,3,35,7,'#56786530');
  if(k==='power'){box(-7,0,26,19,8,'#91b8a6','#608b82','#d2dfbc');line([[13,0],[15,-47]],'#677f7b',3);
   for(let j=0;j<3;j++){const a=j*2.094+.6;poly([[15,-47],[15+16*Math.cos(a),-47+16*Math.sin(a)],[15+5*Math.cos(a+.4),-47+5*Math.sin(a+.4)]],'#f9f6dc');}
  }else if(k==='relief'){poly([[-32,0],[-4,-32],[26,0]],'#bf895e');poly([[-4,-32],[5,-35],[35,-5],[26,0]],'#e4b97f');poly([[-16,0],[-5,-18],[4,0]],'#694f41');rect(19,-34,2,24,'#786c52');rect(21,-34,10,7,'#e37f4e');
  }else if(k==='port'){box(-10,0,34,12,6,'#b87956','#926047','#e0a876');box(2,-12,27,11,6,'#749a9c','#486c72','#b7d0c3');line([[21,0],[21,-42],[44,-42]],'#bc903e',4);line([[41,-42],[41,-25]],'#6d7466',1.5);
  }else if(k==='air'){box(-5,0,40,16,9,'#b7ced2','#718f98','#e9eddc');rect(16,-29,7,28,'#a6b6b7');box(19,-28,12,9,4,'#456a7c','#688797','#eaf0e0');rect(-15,-11,18,11,'#53808a');
  }else if(k==='rail'){box(-1,0,55,7,8,'#b2bab4','#8e9e99','#e1dfce');rect(-21,-26,3,20,'#668686');rect(18,-26,3,20,'#668686');box(-1,-26,56,4,8,accent,'#475e60','#d5e1d2');
  }else if(k==='market'){box(0,0,45,29,9,'#eed8b3','#bd9d83','#f4e4c7');rect(-16,-14,14,14,'#647f80');rect(4,-15,15,9,'#a6c1b6');for(let j=0;j<6;j++)poly([[-23+8*j,-21],[-15+8*j,-21],[-13+8*j,-15],[-21+8*j,-15]],j%2?'#f8dfb2':accent);
  }else if(k==='cloud'){for(let j=0;j<3;j++){box(-17+j*16,0,12,32+(j%2)*6,7,'#456574','#34535e','#9bb4bd');for(let m=0;m<4;m++){rect(-21+j*16,-6-m*6,7,2,'#83b4be');rect(-12+j*16,-6-m*6,2,2,'#b9dd90');}}
  }else if(k==='network'){for(let j=0;j<3;j++){const dx=(j-1)*18,dy=j===1?-9:0;line([[0,-22],[dx,dy-12]],'#638e84',3);box(dx,dy,14,12,5,'#73968c','#466c68','#bed8bf');}oval(0,-23,6,6,accent);
  }else{const high=k==='street'?36:k==='clinic'?34:23;box(0,0,47,high,10,k==='clinic'?'#f3eee0':k==='plant'?'#b5b6a3':'#ccd1b5','#8a9f91',accent);
   if(k==='clinic'){rect(-2,-30,5,13,'#427f79');rect(-6,-26,13,5,'#427f79');}
   else if(k==='plant'){rect(15,-47,7,22,'#957967');rect(14,-47,9,3,'#bcad91');}
   if(k==='depot'||k==='plant'){rect(-16,-17,23,17,'#627e75');for(let j=1;j<5;j++)rect(-15,-j*3,21,1,'#96a99b');box(15,2,9,8,4,'#d6aa68','#a17f4b','#e5c48d');}
   else{for(let j=0;j<4;j++)rect(-19+j*10,-14,6,6,'#7299a0');rect(4,-8,7,8,'#587977');}}
  ctx.restore();
 }
 // A distant settlement sets each location in its domain. Buildings in this
 // background are scenery; all labelled locations below come from the archive.
 for(let i=0;i<11;i++){
  const px=(i*91+seed*7)%900,py=92+(i%3)*4;
  ctx.save();ctx.globalAlpha=.46;building(px,py,.28+(i%3)*.06,false);ctx.restore();
 }
 function actor(x,y,direction,phase,unit=''){
  ctx.save();ctx.translate(x,y);ctx.scale(direction<0?-1:1,1);oval(0,3,18,4,'#345e6238');
  const rail=k==='rail',drone=(unit.includes('无人机')||/无人机|飞行/.test(track.title))&&!/卡车/.test(track.title),flight=/航班|飞行航段/.test(track.title);
  if(drone){line([[-10,-12],[10,-19]],'#445f68',3);line([[10,-12],[-10,-19]],'#445f68',3);for(const xx of [-11,11])oval(xx,-17,7,2,'#627d81');box(0,-9,10,5,3,'#d89f53','#8b7249','#f1c67f');}
  else if(flight){poly([[-22,-8],[-5,-8],[-10,-20],[-4,-20],[6,-9],[21,-7],[24,-4],[6,-3],[-6,7],[-11,7],[-6,-3],[-20,-2]],'#e5eee9','#62828c');}
  else if(k==='port'&&/船/.test(track.title)){poly([[-23,-7],[23,-7],[14,2],[-15,2]],'#376c79');box(1,-7,16,8,5,'#f4e6c6','#c1c6ad','#dae4c4');}
  else{const passenger=rail||/公交|乘客|接送|班次/.test(track.title);box(-3,-3,passenger?42:26,13,5,rail?'#3c7085':'#cc7942','#946b51','#ffe0a0');if(passenger){for(let j=0;j<5;j++)rect(-19+j*7,-14,5,5,'#d6e6dc');}else{rect(11,-11,11,9,'#527e80');rect(13,-10,6,4,'#d9e8df');}for(const n of [-12,12]){oval(n,-1,3.4,3.4,'#374f52');oval(n,-1,1.3,1.3,'#d6d8c3');}}
  ctx.restore();
 }
 function person(x,y,phase){const walk=Math.sin(phase*6)*2;oval(x,y+1,5,1.6,'#426b6333');line([[x,y-7],[x-2-walk,y],[x-2-walk,y]],'#475e64',1.8);line([[x,y-7],[x+2+walk,y]],'#475e64',1.8);rect(x-2,y-13,5,7,'#ae7146');oval(x+.5,y-16,2.8,3,'#bd906d');}
 const rows=track.events, time=progress, omit=custom.omit;
 const travel=['clock','route','coverage'].includes(track.kind);
 const color=['#126f71','#b96339','#49639a','#857138','#734c77','#407b50'];
 const legend=(v,x,y)=>{ctx.font='600 14px system-ui';ctx.textAlign='left';ctx.fillStyle='#21423d';ctx.fillText(v,x,y);};
 const clamp=v=>Math.max(0,Math.min(1,v)), fmt=v=>typeof v==='number'?new Intl.NumberFormat('zh-CN',{maximumSignificantDigits:5}).format(v):String(v);
 if(p.id==='P0479'){
  const min=Math.min(...rows.map(r=>+r[1])),max=Math.max(...rows.map(r=>+r[2])),pos=x=>75+750*(x-min)/(max-min||1);
  rect(0,195,900,64,'#657772');for(let x=0;x<900;x+=45)rect(x,232,22,2,'#eae6c9');const locations=[];
  for(const id of new Set(rows.map(r=>r[0]))){if(id===omit)continue;const steps=rows.filter(r=>r[0]===id),r=steps.find(r=>r[3]<=time&&time<r[4])||steps.at(-1);
   const f=clamp((time-r[3])/(r[4]-r[3])),meters=Number(r[1])+(Number(r[2])-Number(r[1]))*f;
   actor(pos(meters),224,1,f);chip(id,pos(meters),195,true);locations.push(meters);}
  const gaps=locations.slice(1).map((v,j)=>locations[j]-v);
  return {done:0,active:locations.length,text:'实例时间 '+fmt(time)+' 秒 · 展示车辆 '+locations.length+' 辆 · 最小相邻间距 '+fmt(Math.min(...gaps))+' 米'};
 }
 if(p.id==='P0488'){
  const j=Math.min(rows.length-1,Math.floor(time)),f=clamp(time-j);building(150,223,1.9,true);building(740,223,1.9,true);
  line([[162,236],[724,236]],'#849b8c',12);line([[162,236],[724,236]],'#d9ddc6',6);
  actor(183+515*f,234,1,f);chip('本期发单 '+fmt(rows[j][1]),175,268,true);chip('上期订单 '+(j?fmt(rows[j-1][1]):'—'),732,268,true);
  for(let h=0;h<Math.min(36,j);h++)box(560+(h%12)*13,317-Math.floor(h/12)*10,11,10,3,'#b99868','#9f815b','#e6cda0');
  return {done:j,active:1,text:'第 '+(j+1)+' 期 · 订货提前期 1 期 · 箱体记录已走完提前期的订单'};
 }
 if(p.id==='P0181'){
  let active=0,finished=0;
  for(const [j,[id,room,dest,t,u]] of rows.entries()){
   const x=275+j*350;building(x,207,1.9,true);chip(room,x,238,true);const phase=clamp((time-t)/(u-t));const omitted=id===omit;
   box(x,279,100,9,8,'#b5c7bf','#93a99e','#e4ede1');if(!omitted){
    person(x-45+15*phase,266,phase);rect(x-44,292,89*phase,7,'#31947c');if(time>=u)finished++;else if(time>=t)active++;
   }
   chip(id+' · '+(omitted?'暂缓':time>=u?'已完成':time<t?'等待':'进行中'),x,322,!omitted&&time>=t);
  }
  return {done:finished,active,text:'手术进行中 '+active+' 台 · 已完成 '+finished+' 台'};
 }
 if(p.id==='P0079'){
  const lanes=[...new Set(rows.map(r=>r[1]))];let done=0,working=0;
  for(let j=0;j<lanes.length;j++){
   const y=172+j*100;box(445,y,85,36,12,'#658b85','#476b68','#acc2ac');line([[135,y+10],[763,y+10]],'#6a7b74',9);
   for(let k=0;k<18;k++)oval(140+35*k,y+11,3,3,'#b2bfb0');chip(lanes[j].replace('待加工','机台'),445,y-52,true);
   for(const [id,a,b,t,u] of rows.filter(e=>e[1]===lanes[j]&&e[0]!==omit)){const h=rows.findIndex(e=>e[0]===id),started=time>=t,finished=time>=u;const x=finished?670+h*20:started?386+105*clamp((time-t)/(u-t)):146+h*32;
    box(x,y+4,22,19,5,finished?'#69a087':'#c78e56','#806f59','#ebce8b');chip(id,x,y+31,started&&!finished);if(finished)done++;else if(started)working++;}
  }
  return {done,active:working,text:'加工中 '+working+' 件 · 已完工 '+done+' 件'};
 }
 if(p.id==='P0006'||p.id==='P0029'||p.id==='P0036'||p.id==='P0493'){
  const production=p.id==='P0006',bins=p.id==='P0029',stations=p.id==='P0493',col=r=>production?Number(r[0].slice(-1)):bins?String(r[1]):stations?Math.floor(r[2]*4/Math.max(1,track.total)):r[2]%4;
  const keys=[...new Set(rows.map(col))],shown=keys.slice(0,8),tick=Math.min(rows.length-1,Math.floor(time)),frac=clamp(time-tick),cur=rows[tick],tallies=new Map(shown.map(g=>[g,0]));
  for(const r of rows.slice(0,Math.floor(time))){if(r[0]!==omit&&tallies.has(col(r)))tallies.set(col(r),tallies.get(col(r))+(bins?1:Number(r[1])||0));}
  const sum=[...tallies.values()].reduce((a,b)=>a+b,0),maximum=Math.max(1,...rows.map(r=>Math.abs(Number(r[1])||1)))*Math.max(1,rows.length/shown.length);
  shown.forEach((g,j)=>{const x=shown.length===1?500:172+j%4*(565/Math.max(1,Math.min(shown.length,4)-1)),y=j<4?219:313;
   building(x,y-18,1.15,true);const amount=tallies.get(g);
   chip((production?'厂 ':bins?'箱 ':stations?'站点组 ':'商品组 ')+g,x,y+9,col(cur)===g);
   rect(x-40,y+24,80,8,'#aebdac');rect(x-40,y+24,80*clamp(amount/maximum),8,'#3d806d');label(fmt(amount),x,y+50);
   if(col(cur)===g&&cur[0]!==omit&&time<rows.length){const xx=65+(x-65)*frac,yy=y+5-26*Math.sin(Math.PI*frac);
    if(bins||production||!stations)box(xx,yy,14,13,5,'#bd8a51','#887050','#eed095');else{person(xx,yy,frac);box(xx+10,yy,6,12,3,'#628e89','#50726f','#d3dfc4');}}
  });
  return {done:Math.floor(time),active:1,text:(production?'样本累计产量 ':bins?'已装箱物品 ':stations?'样本站点累计配置 ':'样本累计采购量 ')+fmt(sum)};
 }
 if(p.id==='P0478'){
  let done=0;rows.forEach(([id,a,b,t,u],j)=>{const x=190+(j%6)*106,y=192+Math.floor(j/6)*88;if(y>350)return;
   box(x,y,48,30,8,'#b5bdac','#819a8c','#dae4c6');const f=id===omit?0:clamp((time-t)/(u-t));
   rect(x-13,y-22,26,11,'#475d58');rect(x-11,y-20,22*f,7,'#95c666');chip(b,x,y+18,f===1);
   if(f>0&&f<1){person(x-64+60*f,y+2,f);line([[x-23,y-2],[x-14,y-12]],'#9a875d',2);}
   if(f===1)done++;});
  return {done,active:0,text:'已完成 '+done+' 项构件更新'};
 }


 if(travel){
  const names=[...new Set(rows.flatMap(r=>r.slice(1,3)))],pos=new Map(),ordered=['P0092','P0110'].includes(p.id);
  if(ordered)names.sort((a,b)=>Number(a)-Number(b));
  const cols=Math.min(8,Math.max(3,Math.ceil(names.length/2))),nr=Math.ceil(names.length/cols);
  names.forEach((n,i)=>{const row=Math.floor(i/cols),len=Math.min(cols,names.length-row*cols),a=len===1?.5:(row%2?len-1-i%cols:i%cols)/(len-1);pos.set(n,[85+730*a,146+(nr>1?row*163/(nr-1):67)+Math.sin(i*.93)*12]);});
  const edges=new Set(),seen=new Set(),units=new Map();
  for(const [id,a,b,t,u] of rows){
   const v=pos.get(a),w=pos.get(b),key=[a,b].sort().join('|');
   if(!edges.has(key)){line([v,w],pal[0],8);line([v,w],'#e8e4ce',4);edges.add(key);}
   if(id!==omit&&time>=u){seen.add(b);line([v,w],'#70a294',3);}
  }
  for(const [n,[x,y]] of pos){const yes=seen.has(n);building(x,y-4,names.length>20?.55:.83,yes);oval(x,y,6,3,yes?'#257762':'#90a59d');chip(n,x,y+14,yes);}
  const ids=[...new Set(rows.map(r=>r[0]))];let moving=0;
  for(const id of ids){
   if(id===omit)continue;const group=rows.filter(r=>r[0]===id).sort((a,b)=>a[3]-b[3]),active=group.filter(r=>r[3]<=time&&time<r[4]);
   const done=group.filter(r=>r[4]<=time);
   if(!active.length&&(!done.length||time>group.at(-1)[4]))continue;
   for(const [unit,aa,bb,t,u,v] of active.length?active:[done.at(-1)]){
    const a=pos.get(aa),b=pos.get(bb),f=clamp((time-t)/(u-t)),x=a[0]+(b[0]-a[0])*f,y=a[1]+(b[1]-a[1])*f,shade=color[ids.indexOf(id)%color.length];
    if(active.length){moving++;line([a,[x,y]],shade,4);}
    if(track.kind==='coverage'){oval(x,y,7,7,shade);if(v!=null)chip(fmt(v),x,y-17,true);continue;}
    if(unit.includes('配送员'))person(x,y,f);else actor(x,y,b[0]-a[0],f,unit);if(ids.length<=8)chip(id+(v!=null?' · '+fmt(v):''),x,y-30,true);
   }
  }
  return {done:rows.filter(r=>r[0]!==omit&&r[4]<=time).length,active:moving,text:'已抵达 '+seen.size+' 个端点'};
 }
 const n=rows.length, f=clamp(time/n),completed=Math.floor(time),idx=Math.min(n-1,completed),phase=clamp(time-idx),active=rows[idx];
 if(track.kind==='allocation'){
  const share=custom.share??rows[0][1],total=50,placed=Math.floor(f*total),left=Math.round(placed*share);
  for(const [j,title,nr] of [[0,'众包司机',left],[1,'第三方承运',placed-left]]){
   const x=j?680:225;building(x,220,1.8,true);chip(title,x,247,true);
   line([[449,158],[x,218]],'#b0c1af',9);
   for(let h=0;h<nr;h++)box(x-57+(h%11)*11,277+Math.floor(h/11)*12,9,7,3,'#c99d62','#946f47','#f5cd89');
  }
  if(placed<total){const l=Math.round((placed+1)*share)>left,x=l?225:680,t=(f*total)%1;actor(450+(x-450)*t,158+60*t,x-450,t);}
  building(450,156,1.3,true);chip('订单池',450,182,true);
  return {done:placed,active:total-placed,text:'众包 '+left+' 份 · 第三方 '+(placed-left)+' 份（50 份等量示意）'};
 }
 const vals=rows.map(r=>Number(r[1])).filter(Number.isFinite),mx=Math.max(...vals,0),mn=Math.min(...vals,0),range=mx-mn||1;
 if(track.kind==='series'){
  const x=j=>88+720*(rows[j][2]-rows[0][2])/(rows[n-1][2]-rows[0][2]||1),y=v=>305-145*(Number(v)-mn)/range;
  rect(55,135,790,194,'#f5f7e9');for(let j=0;j<4;j++)line([[80,160+j*45],[820,160+j*45]],'#cbdbce',1);
  const pts=rows.slice(0,idx+1).map((r,j)=>[x(j),y(r[1])]),next=Math.min(n-1,idx+1),last=pts.at(-1);
  const cursor=[last[0]+(x(next)-last[0])*phase,last[1]+(y(rows[next][1])-last[1])*phase];
  line([...pts,cursor],pal[2],4);oval(...cursor,7,7,'#c1683d');chip(fmt(active[1]),cursor[0],cursor[1]-17,true);
  if(p.id==='P0476'){const xx=80+720*(Number(active[1])-mn)/range;line([[70,342],[830,342]],'#9eafa5',7);actor(xx,341,1,phase);}
  legend(track.title,80,125);return {done:idx+1,active:1,text:'原记录 '+active[0]+' · '+fmt(active[1])};
 }
 const panels={
  depot:['调度台','订单与运力'],plant:['生产控制台','作业配置'],street:['交通调度台','车辆与班次'],rail:['行车控制室','列车与时刻'],port:['港航调度台','运输作业'],air:['飞行调度台','飞行任务'],power:['系统调度台','运行设定'],market:['经营决策台','商品与策略'],clinic:['服务调度台','服务配置'],relief:['应急调度台','物资配置'],cloud:['计算控制台','资源配置'],network:['网络控制台','方案配置']
 };
 const [desk,unit]=panels[k],phaseNow=clamp(time-Math.floor(time)),iNow=Math.min(rows.length-1,Math.floor(time)),current=rows[iNow],complete=rows.slice(0,Math.floor(time)).filter(r=>r[0]!==omit),v=Number(current[1]),all=rows.map(r=>Number(r[1])).filter(Number.isFinite),scale=Math.max(1e-9,...all.map(Math.abs)),binary=all.length===rows.length&&all.every(x=>x===1||x===0),selected=current[0]!==omit,ink=pal[2];
 // The field desk stages an archived assignment. The ledger below persists as the plan is assembled.
 const yard='#d4dfcb';poly([[36,277],[91,153],[829,153],[865,281]],yard);line([[41,281],[861,281]],'#a8b9a8',3);
 building(127,235,1.94,true);chip(desk,127,264,true);
 const centers=[365,564,755];for(const [j,x] of centers.entries()){
  const idx=iNow-1+j;if(idx<0||idx>=rows.length)continue;const record=rows[idx],num=Number(record[1]),active=idx===iNow,arrived=idx<iNow||time===rows.length;
  const reveal=arrived?1:active&&selected?phaseNow:0,ink2=idx<iNow?ink:active?'#b8693c':'#8f9d90';
  box(x,239,120,12,12,'#9dad9d','#849487','#dce6d7');
  if(k==='power'||k==='cloud'){
   box(x,225,40,54,10,'#708985','#506d6b','#a7bdb3');for(let z=0;z<6;z++){rect(x-15,179+z*7,26,3,'#3b5854');rect(x-14,179+z*7,22*reveal,2,ink2);}
   line([[x-50,223],[x-50,202],[x-25,202]],'#789d91',3);
   if(active&&selected){const xx=x-51+27*phaseNow;oval(xx,202,3,3,'#efb45b');}
  }else if(k==='market'){
   box(x,224,72,43,8,'#f0d6ad','#c3a882','#c57953');for(let z=0;z<6;z++)rect(x-35+z*12,181,12,9,z%2?'#e5a479':'#f5e5c5');rect(x-24,197,46,16,'#354c49');
   label(reveal>0?fmt(record[1]).slice(0,9):'—',x,209,'#edf3d6',12);
  }else if(k==='street'||k==='rail'||k==='air'||k==='port'){
   line([[x-52,215],[x+46,215]],'#899a93',6);if(reveal>0)actor(x-40+70*reveal,214,1,reveal);
   box(x+28,188,24,17,4,'#749795','#517779','#bad0c0');rect(x+20,177,15,5,reveal>0?ink2:'#b9c9ba');
  }else if(k==='clinic'||k==='relief'){
   building(x,216,.95,active);if(reveal>0)person(x-38+30*reveal,229,reveal);
  }else if(k==='plant'||k==='depot'){
   line([[x-51,220],[x+44,220]],'#748d83',7);for(let z=0;z<7;z++)oval(x-46+z*14,223,3,3,'#b9c9b6');
   if(reveal>0)box(x-39+65*reveal,216,22,17,4,'#c2a36a','#987e51','#e7c993');
  }else{
   for(let z=0;z<4;z++){const bx=x-33+z*20;line([[x,183],[bx,218]],'#a7bdb0',3);oval(bx,218,5,5,reveal>z/4?ink2:'#afbbb1');}oval(x,183,8,8,ink2);
  }
  chip(String(record[0]).slice(-22),x,254,active);if(active)chip(selected?fmt(record[1]):'暂缓',x,148,true);
 }
 const total=rows.length,x0=55,y0=315,w=785/total;
 for(let j=0;j<total;j++){const r=rows[j],h=Number.isFinite(Number(r[1]))?5+Math.min(1,Math.abs(Number(r[1]))/scale)*26:16;rect(x0+j*w,y0+28-h,Math.max(2,w-2),h,j<time&&r[0]!==omit?ink:'#c1cebd');}
 line([[x0+Math.min(784,time*w),y0-4],[x0+Math.min(784,time*w),y0+30]],'#b76b3c',2);
 legend(unit+'　'+current[0]+'　'+fmt(current[1]),54,371);
 return {done:complete.length,active:selected?1:0,text:'已执行 '+complete.length+' / '+total+' 项展示配置'+(binary?' · 已启用 '+complete.filter(r=>r[1]===1).length+' 项':'')+(omit?' · 暂缓 '+omit:'')};


}
window.ORTOPIA_LANDSCAPE={frame};
})();
