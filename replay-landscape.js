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
 function actor(x,y,direction,phase){
  ctx.save();ctx.translate(x,y);ctx.scale(direction<0?-1:1,1);oval(0,3,18,4,'#345e6238');
  const rail=k==='rail',drone=/无人机|飞行/.test(track.name)&&!/卡车/.test(track.name),flight=/航班|飞行航段/.test(track.name);
  if(drone){line([[-10,-12],[10,-19]],'#445f68',3);line([[10,-12],[-10,-19]],'#445f68',3);for(const xx of [-11,11])oval(xx,-17,7,2,'#627d81');box(0,-9,10,5,3,'#d89f53','#8b7249','#f1c67f');}
  else if(flight){poly([[-22,-8],[-5,-8],[-10,-20],[-4,-20],[6,-9],[21,-7],[24,-4],[6,-3],[-6,7],[-11,7],[-6,-3],[-20,-2]],'#e5eee9','#62828c');}
  else if(k==='port'&&/船/.test(track.name)){poly([[-23,-7],[23,-7],[14,2],[-15,2]],'#376c79');box(1,-7,16,8,5,'#f4e6c6','#c1c6ad','#dae4c4');}
  else{const passenger=rail||/公交|乘客|接送|班次/.test(track.name);box(-3,-3,passenger?42:26,13,5,rail?'#3c7085':'#cc7942','#946b51','#ffe0a0');if(passenger){for(let j=0;j<5;j++)rect(-19+j*7,-14,5,5,'#d6e6dc');}else{rect(11,-11,11,9,'#527e80');rect(13,-10,6,4,'#d9e8df');}for(const n of [-12,12]){oval(n,-1,3.4,3.4,'#374f52');oval(n,-1,1.3,1.3,'#d6d8c3');}}
  ctx.restore();
 }
 function person(x,y,phase){const walk=Math.sin(phase*6)*2;oval(x,y+1,5,1.6,'#426b6333');line([[x,y-7],[x-2-walk,y],[x-2-walk,y]],'#475e64',1.8);line([[x,y-7],[x+2+walk,y]],'#475e64',1.8);rect(x-2,y-13,5,7,'#ae7146');oval(x+.5,y-16,2.8,3,'#bd906d');}
 const rows=track.rows,r=rows[index],hit=[];
 if(custom?.coverage){
  const {routes,picks}=custom.coverage,clients=[...new Set(routes.flatMap(z=>z.customers))];
  const xpos=(j,count)=>count===1?450:65+j*765/(count-1);
  const shown=routes.filter(z=>picks.has(z.id));const more=shown.length>12,lines=more?shown.slice(0,12):shown;
  lines.forEach((z,j)=>{const x=xpos(j,lines.length);for(const c of z.customers){const dx=xpos(clients.indexOf(c),clients.length);line([[x,180],[dx,296]],'#80a896',2);}
   building(x,171,.75,true);chip(z.id,x,192,true);});
  clients.forEach((c,j)=>{const x=xpos(j,clients.length),n=shown.filter(z=>z.customers.includes(c)).length;building(x,290,.7,n===1);oval(x,300,7,6,n===1?'#367c67':'#c27337');chip(c+' × '+n,x,322,n===1);});
  label(more?'显示前 12 条已选路线，覆盖次数按全部已选路线计算':'已选路线与客户覆盖',450,125);return [];
 }
 if(custom?.share!=null){
  const share=custom.share;building(450,156,1.35,true);chip('配送平台',450,181,true);
  [[208,share,'众包司机'],[692,1-share,'第三方承运']].forEach(([x,f,name])=>{
   line([[450,161],[x,278]],'#bbc5b2',10);line([[450,161],[x,278]],'#5b9382',2+7*f);
   building(x,275,1.1,false);const t=progress;actor(450+(x-450)*t,161+117*t,x-450,t);
   chip(name+' '+(f*100).toFixed(2)+'%',x,309,true);});
  return [];
 }
 if(route){
  const names=[...new Set(rows.flatMap(e=>[e.a,e.b]))],pos=new Map();
  const cols=Math.min(7,Math.max(2,Math.ceil(names.length/3))),nr=Math.ceil(names.length/cols);
  names.forEach((n,i)=>{const row=Math.floor(i/cols),len=Math.min(cols,names.length-row*cols),x=len===1?450:95+(row%2?len-1-i%cols:i%cols)*(710/(len-1));pos.set(n,[x,165+(nr===1?54:row*151/(nr-1))+13*Math.sin(i+seed)]);});
  rows.forEach(e=>{const a=pos.get(e.a),b=pos.get(e.b);line([a,b],k==='rail'?'#808e88':'#a5b5aa',k==='rail'?6:12);line([a,b],k==='rail'?'#e5dfc8':'#d9dace',k==='rail'?2:9);
   const dx=b[0]-a[0],dy=b[1]-a[1],length=Math.hypot(dx,dy)||1;
   for(let j=16;j<length-12;j+=k==='rail'?12:35){const x=a[0]+dx*j/length,y=a[1]+dy*j/length;
    if(k==='rail')line([[x-4*dy/length,y+4*dx/length],[x+4*dy/length,y-4*dx/length]],'#948f7f',1.6);
    else line([[x,y],[x+8*dx/length,y+8*dy/length]],'#f6f2d9',1.3);}
   });
  if(overlay){ctx.setLineDash([7,5]);for(const edge of overlay.rows){if(pos.has(edge.a)&&pos.has(edge.b))line([pos.get(edge.a),pos.get(edge.b)],'#985d9b',2);}ctx.setLineDash([]);}
  const a=pos.get(r.a),b=pos.get(r.b);line([a,b],'#167f76',5);
  for(const [n,[x,y]] of pos){const active=n===r.a||n===r.b;if(k==='depot'&&/^(C\d|客户)/i.test(n)){
    const scale=names.length>15?.65:1;ctx.save();ctx.translate(x,y-4);ctx.scale(scale,scale);box(0,0,25,18,8,'#e0c399','#ac9c84','#ae7153');poly([[-13,-18],[0,-30],[13,-18]],'#d3a984');rect(-7,-12,7,12,'#657c72');rect(4,-13,5,5,'#75949a');ctx.restore();
   }else building(x,y-6,names.length>15?.7:1.06,active);oval(x,y,4,3,active?'#13766e':'#688a78');chip(n,x,y+18,active);hit.push({x,y,i:rows.findIndex(z=>z.a===n||z.b===n)});}
  let t=.03+.94*progress;actor(a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,b[0]-a[0],t);person(b[0]+16,b[1]-3,0);
 }else{
  const group=Math.floor(index/6)*6,entries=rows.slice(group,group+6),values=rows.map(z=>z.v).filter(z=>typeof z==='number'),lim=Math.max(...values.map(Math.abs),1e-12);
  const binary=values.length===rows.length&&values.every(v=>v===0||v===1);
  entries.forEach((e,j)=>{const active=group+j===index,col=j%3,y=j<3?(entries.length>3?178:229):300,x=165+col*283;
   poly([[x-110,y+9],[x-72,y-39],[x+101,y-39],[x+79,y+10]],active?'#aaceb8':'#c9d8c2');line([[x-106,y+11],[x+78,y+11]],active?'#438776':'#a8bda7',2);
   building(x-33,y,1,active);const frac=typeof e.v==='number'?Math.min(1,Math.abs(e.v)/lim):1;
   const accent=active?'#c77835':'#648f85';
   if(overlay){const o=overlay.rows.find(other=>other.at===e.at);if(o)chip('对照 '+String(o.v).slice(0,12),x-30,y-65,false);}
   if(binary){rect(x+12,y-28,36,19,'#4c6868');oval(x+21,y-19,5,5,e.v?'#b6df7c':'#a2aca7');label(e.v?'1':'0',x+38,y-15,'#fff',11);}
   else if(/库存|结存|储量|电量|容量/.test(track.name)){rect(x+14,y-40,29,40,'#7a958d');rect(x+17,y-37,23,34,'#d4dfd2');rect(x+17,y-3-34*frac,23,34*frac,accent);for(let n=0;n<4;n++)rect(x+17,y-6-n*8,6,1,'#596d68');}
   else if(/价格|成本|报价|工资|收益|费用|租金|佣金|预算/.test(track.name)){
    poly([[x+9,y-29],[x+52,y-29],[x+62,y-18],[x+52,y-7],[x+9,y-7]],'#eed294','#b49b70');oval(x+54,y-18,2.3,2.3,'#f8f4e3');
    line([[x+13,y-14],[x+13+33*frac,y-14]],accent,3);
   }else if(/到达|时刻|时间|时长|间隔|工期/.test(track.name)){
    oval(x+36,y-20,17,17,'#657f78');oval(x+36,y-20,14,14,'#f7f1d5');const angle=frac*5.23-1.57;line([[x+36,y-20],[x+36+12*Math.cos(angle),y-20+12*Math.sin(angle)]],accent,2);
   }else if(/装载|物资|采购|生产量|产量|配送量|服务量|订单量|分配量/.test(track.name)&&typeof e.v==='number'){
    for(let n=0;n<Math.round(8*frac);n++){const xx=x+14+(n%4)*11,yy=y-Math.floor(n/4)*10;box(xx,yy,10,9,3,'#d2a366','#ad8254','#e0bf8f');}
   }else{rect(x+9,y-30,55,27,'#385653');rect(x+12,y-27,49,21,'#e4eedb');const angle=-2.75+2.36*frac;oval(x+36,y-9,2,2,accent);line([[x+36,y-9],[x+36+Math.cos(angle)*18,y-9+Math.sin(angle)*18]],accent,2);rect(x+30,y-3,12,3,'#648479');}
   if(active){const ax=x+4+progress*6;person(ax,y+5,progress);}
   chip(e.at||track.name,x,y+27,active);label(String(e.v).length>16?String(e.v).slice(0,15)+'…':e.v,x+38,y-46,active?'#84471e':'#41675b',14);hit.push({x,y,i:group+j});
  });
 }
 return hit;
}
window.ORTOPIA_LANDSCAPE={frame};
})();
