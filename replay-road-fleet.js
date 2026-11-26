/* Scene-specific views for interval planning and distributed tube MPC. */
(() => {
'use strict';
const W = 900, H = 340, mint = '#83edd4', sand = '#ffcf7d';
const bound = (v,lo,hi)=>Math.max(lo,Math.min(hi,v));
const format = (v,n=1)=>Number(v).toLocaleString('zh-CN',{minimumFractionDigits:n,maximumFractionDigits:n});
function number(v,n=1) { return format(Math.abs(v)<.5*10**(-n)?0:v,n); }
function text(c,value,x,y,size=13,color='#fff',weight=600,align='left'){
  c.font=weight+' '+size+'px system-ui,sans-serif';c.textAlign=align;c.textBaseline='middle';c.fillStyle=color;c.fillText(value,x,y);
}
function fill(c,x,y,w,h,color,r=0){
  c.fillStyle=color;if(!r){c.fillRect(x,y,w,h);return;}
  c.beginPath();c.roundRect(x,y,w,h,r);c.fill();
}
function path(c,points,color,width=1,closed=false){
  c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));
  if(closed){c.closePath();c.fillStyle=color;c.fill();}
  else{c.strokeStyle=color;c.lineWidth=width;c.stroke();}
}
function disk(c,x,y,r,color){c.beginPath();c.arc(x,y,r,0,2*Math.PI);c.fillStyle=color;c.fill();}
function label(c,value,x,y,accent){
  c.font='650 13px system-ui';const w=c.measureText(value).width+19;
  fill(c,x-w/2,y-11,w,22,'#102a30e8',6);disk(c,x-w/2+7,y,2.5,accent);
  text(c,value,x+3,y,13,'#fff',650,'center');
}
function bracket(c,left,right,y,labelText,color){
  c.save();path(c,[[left,y-4],[left,y+4],[left,y],[right,y],[right,y-4],[right,y+4]],color,1.8);
  c.font='650 13px system-ui';const mid=(left+right)/2,w=c.measureText(labelText).width+15;
  fill(c,mid-w/2,y-10,w,20,'#102a30ed',5);text(c,labelText,mid,y,13,color,650,'center');c.restore();
}
// Passenger vehicles have a directional windshield, visible wheels and roof sensor on the automated car.
function vehicle(c,x,y,length,colour,connected=false){
  c.save();c.translate(x,y);c.scale(length/48,length/48);
  c.shadowColor='#122127bb';c.shadowBlur=4;c.shadowOffsetY=3;
  fill(c,-24,-10,48,20,colour,7);
  c.shadowBlur=0;c.shadowOffsetY=0;
  for(const xx of [-15,12]){fill(c,xx,-11,8,2.7,'#243039',1);fill(c,xx,8.3,8,2.7,'#243039',1);}
  const body=c.createLinearGradient(0,-9,0,9);body.addColorStop(0,'#ffffff88');body.addColorStop(.35,'#ffffff0d');body.addColorStop(1,'#101f273f');
  fill(c,-23,-9,46,18,body,6);
  path(c,[[5,-8],[12,-6],[12,6],[5,8]],'#263e4b',1,true);
  path(c,[[-14,-6],[-8,-8],[-8,8],[-14,6]],'#314956',1,true);
  fill(c,-7,-7,11,14,colour,2);fill(c,14,-6,6,12,'#ffffff1f',2);
  fill(c,-2,-10,5,2,'#233441',1);fill(c,-2,8,5,2,'#233441',1);
  if(connected){disk(c,-1,0,3.5,'#e5eee9');disk(c,-1,0,2,'#334c56');}
  for(const yy of [-7,5]){fill(c,20,yy,3,2,'#fff1b0',1);fill(c,-23,yy,2.5,2.5,'#ef6453',1);}
  c.restore();
}
function roadGround(c,urban,shift){
  const tileW=900;
  for(let k=-1;k<2;k++){
    const ox=k*tileW-(shift%tileW);c.save();c.translate(ox,0);
    if(urban){
      fill(c,0,0,W,H,'#aab398');
      fill(c,0,7,292,117,'#adaea6');fill(c,330,8,300,108,'#a4a59a');
      fill(c,746,12,153,105,'#b4b1a3');
      for(const [x,y,w,h] of [[43,30,93,55],[150,24,86,42],[411,23,123,62],[754,18,90,60]]){
        fill(c,x+5,y+7,w,h,'#788276',2);fill(c,x,y,w,h,'#d0d4c9',2);
        fill(c,x+5,y+6,w-10,h-12,'#afb9b0',1);for(let px=x+11;px<x+w-7;px+=7)fill(c,px,y+7,1.3,h-14,'#c4ccc2');
        for(let px=x+12;px<x+w-13;px+=26){fill(c,px,y+13,14,9,'#7c8e8c',2);fill(c,px+2,y+14,8,3,'#a3b3af');}
      }
      for(let j=0;j<12;j++){fill(c,12+j*23,101,19,2,'#e1dec0');fill(c,12+j*23,103,1,12,'#e1dec0');}
      fill(c,5,122,890,5,'#929e8d');for(let j=2;j<W;j+=17)fill(c,j,119,1.5,8,'#4e6865');
    }else{
      fill(c,0,0,W,H,'#9faf83');
      for(const [x,w,col] of [[0,170,'#aab882'],[182,270,'#b0b57d'],[467,117,'#a3b48a'],[596,304,'#c1ba92']]){
        fill(c,x,0,w,119,col);
        c.save();c.beginPath();c.rect(x,0,w,119);c.clip();
        for(let j=x-100;j<x+w+110;j+=6)path(c,[[j,0],[j+83,119]],'#ffffff1d',1.5);c.restore();
      }
      for(let j=0;j<110;j++){
        const tx=(j*121+j*j*13+29)%900,ty=(j*61+j*j*19+11)%119;
        if(ty>84||tx%182<12){disk(c,tx+3,ty+4,5.5,'#6c8062');disk(c,tx,ty,5,'#65865c');disk(c,tx-1,ty-1,3,'#7b9567');}
      }
      fill(c,0,117,W,8,'#bfc099');fill(c,0,234,W,13,'#a2ad8b');
    }
    // Twin carriageways, median crash barrier and road-edge delineators.
    fill(c,0,128,W,105,'#848c83');fill(c,0,132,W,35,'#666f70');fill(c,0,176,W,54,'#596367');
    fill(c,0,168,W,7,urban?'#b2ae8e':'#8d9a6f');
    fill(c,0,131,W,1.8,'#e3dfc7');fill(c,0,165,W,1.5,'#d6d0ac');fill(c,0,177,W,1.5,'#d4d0b0');fill(c,0,227,W,2,'#e5e1c7');
    for(let j=0;j<W;j+=43){fill(c,j,150,18,1.6,'#dbdcd2');fill(c,j,205,20,1.8,'#e4e3d7');}
    for(let j=0;j<W;j+=25){fill(c,j,230,2,3.5,'#556568');fill(c,j+2,231,18,1.4,'#adafa3');}
    c.restore();
  }
}


function base(c,urban,worldShift=0){
  roadGround(c,urban,worldShift);
  const overlay=c.createLinearGradient(0,0,0,64);overlay.addColorStop(0,'#0d2732a0');overlay.addColorStop(1,'#0d273200');fill(c,0,0,W,64,overlay);
}
function beam(c,x1,y1,x2,y2,phase){
  const bend=(y1+y2)/2-18;
  c.beginPath();c.moveTo(x1,y1);c.quadraticCurveTo((x1+x2)/2,bend,x2,y2);
  c.setLineDash([5,4]);c.strokeStyle='#a2f3e7';c.lineWidth=1.5;c.stroke();c.setLineDash([]);
  const q=1-phase;disk(c,x1*q+x2*phase,q*q*y1+2*phase*q*bend+phase*phase*y2,3.5,'#ecfff6');
}
function intervalScene(c,state,d,mode,selected){
  const trial=selected??d.trials[mode]??d.trials[0],f=state.t,j=f<1?0:1,portion=bound((state.plot+d.target)/d.target,0,1);
  base(c,true);
  const leader=466+210*Math.min(f,1)+130*Math.max(f-1,0);
  const av=leader-81-178*portion, y=187, first=av-80, tail=av-156;
  // Headway is a scaled prediction deviation; the view carries no absolute vehicle positions.
  fill(c,12,10,282,29,'#102a30e8',7);text(c,format(d.count,0)+' 辆车队  ·  首车间距偏差缩尺演示',25,25,14);
  fill(c,666,10,221,29,'#102a30e8',7);
  text(c,'预测 '+(j+1)+' / 2',679,25,14,mint);
  text(c,'输入 '+number(j?0:trial[0],3),874,25,14,'white',650,'right');
  if(d.reach){
    const [baseReach,widthGain,centerGain]=d.reach;
    const upper=baseReach+widthGain*Math.abs(trial[0])+centerGain*trial[0];
    const domain=baseReach+(widthGain+Math.abs(centerGain))*d.limit;
    const left=660,right=871,axisX=v=>left+(right-left)*v/domain;
    fill(c,left-12,47,239,75,'#102a30ed',7);
    text(c,'首步可达间距偏差 · 正值范围',left,63,13,'#e4f3ef');
    fill(c,left,80,right-left,7,'#465e63',3);fill(c,left,80,axisX(upper)-left,7,'#55c3a5',3);
    const gx=axisX(d.target);
    path(c,[[gx,77],[gx,91]],sand,2);
    disk(c,axisX(trial[1]),83,4,'#fbfffc');
    text(c,'上界 '+format(upper,0),left,104,12,mint);
    text(c,'目标 '+format(d.target,0),right,104,12,sand,650,'right');
  }
  const mastX=327,mastY=86;
  fill(c,mastX-3,mastY,6,35,'#667c7d',2);fill(c,mastX-15,mastY+33,30,4,'#59696a',2);
  fill(c,mastX-10,mastY-6,20,13,'#e1ece5',3);disk(c,mastX,mastY,3,'#159685');label(c,'路侧通信单元',mastX,mastY-21,mint);
  // An uplink pulse arrives at the CAV, then its predicted headway unfolds along the road ruler.
  const packet=(f*5)%1;
  beam(c,mastX,mastY,av,y-13,Math.min(packet/.55,1));
  if(packet>=.55){
    const response=(packet-.55)/.45;
    path(c,[[av,y+12],[av,y+17],[leader,y+17]],'#e5bf74',1.3);
    disk(c,av+(leader-av)*response,y+17,3.5,sand);
  }
  const wanted=leader-81-178;
  if(j===0){
    const predicted=leader-81-178*trial[1]/d.target;
    c.setLineDash([4,3]);path(c,[[av,y+10],[av,y+22],[predicted,y+22]],mint,1.6);c.setLineDash([]);
    path(c,[[predicted,y+16],[predicted-4,y+23],[predicted+4,y+23]],mint,1,true);
  }
  c.setLineDash([5,4]);c.strokeStyle='#ebf9fe';c.lineWidth=1.5;c.strokeRect(wanted-24,y-13,48,26);c.setLineDash([]);
  // Target outline sits on the same compressed headway axis as the CAV.
  if(Math.abs(wanted-av)>46)label(c,'目标位置',wanted,y+24,'#c7def4');
  vehicle(c,tail,y,42,'#a5afaf');vehicle(c,first,y,44,'#c5d0ce');
  vehicle(c,av,y,50,'#14a68f',true);vehicle(c,leader,y,48,'#d38c47');
  label(c,'云控车',av,y-31,mint);label(c,'先导车',leader,y-31,sand);
  text(c,'人工跟驰',tail-8,y-22,12,'#fff',650,'center');
  bracket(c,av,leader,y+44,'间距偏差 '+format(state.plot+d.target,0),'#f7db9e');
  // Cost terms from this instance's two-stage objective; compare complete alternatives.
  fill(c,0,251,W,89,'#102831f5');text(c,'两步计划成本',18,271,14,'#e2f4ed');
  fill(c,18,290,9,9,mint,2);text(c,'间距跟踪',32,295,12,'#d1e4df');
  fill(c,18,309,9,9,sand,2);text(c,'控制投入',32,314,12,'#d1e4df');
  const left=142,barW=214,names=['归档指令','首步不干预','首步最大输入'];
  const preset=d.trials.findIndex(row=>Math.abs(row[0]-trial[0])<1e-10);
  const slots=d.trials.slice(),active=preset<0?0:preset;
  if(preset<0){names[0]='当前试调';slots[0]=trial;}
  const maxCost=Math.max(...slots.map(row=>row[3]));
  slots.forEach((row,k)=>{
    const x=left+k*249,effort=d.weight*row[0]**2,tracking=Math.max(0,row[3]-effort);
    if(k===active)fill(c,x-7,258,235,74,'#27414a',7);
    text(c,names[k],x,273,13,k===active?'#fff':'#c0d3d3');
    text(c,format(row[3]/1e6,2)+' 百万',x+barW,273,12,'#e7eee7',650,'right');
    fill(c,x,293,barW,11,'#394d55',3);
    fill(c,x,293,barW*tracking/maxCost,11,mint);fill(c,x+barW*tracking/maxCost,293,barW*effort/maxCost,11,sand);
    text(c,'首步预测 '+format(row[1],0)+' / '+format(d.target,0),x,318,12,'#d9e6e7',500);
  });
}
const referenceCache=new WeakMap();
function feedbackReference(d){
  if(referenceCache.has(d))return referenceCache.get(d);
  const rows=[];let ep=d.actual[0]-d.nominal[0],ev=d.actual[1]-d.nominal[1];
  for(let n=0;n<=d.steps;n++){
    const a=d.gain[0]*ep+d.gain[1]*ev;rows.push([ep,ev,a]);
    ep+=d.dt*ev+.5*d.dt*d.dt*a;ev+=d.dt*a;
  }
  referenceCache.set(d,rows);return rows;
}
function tubeDrive(c,state,d,mode){
  const t=state.t,tick=bound(Math.floor(t/d.dt+1e-8),0,d.steps),v0=d.nominal[1];
  const lead=state.cars[1].x,follow=state.cars[0].x,err=(follow-state.ghost)*100;
  const enabled=state.feedback??(mode===0),ref=feedbackReference(d),sub=t/d.dt-tick;
  const on=ref[tick].map((v,j)=>v+(ref[Math.min(d.steps,tick+1)][j]-v)*sub);
  const vDrift=d.actual[1]-v0,off=d.actual[0]-d.nominal[0]+vDrift*t;
  const a=state.applied??(enabled?on[2]:0),evNow=state.velocityError??(enabled?on[1]:vDrift);
  const late=Math.max(0,t-6);
  // Compression of the long cruise is restricted to camera movement. Gap uses physical metres.
  const leadX=338+Math.min(t,6)*40+Math.min(late/(d.steps*d.dt-6),1)*136;
  const scale=5.3,gap=lead-follow,carX=leadX-gap*scale,ghostX=leadX-(lead-state.ghost)*scale;
  const shift=Math.min(t,6)*(v0*scale-40)+late*.72;
  base(c,false,shift);
  fill(c,12,10,258,29,'#102a30e8',7);text(c,'车队跟踪试验  ·  '+(enabled?'位置与速度误差反馈':'关闭反馈'),24,25,14);
  fill(c,711,10,176,29,'#102a30e8',7);text(c,'采样 '+tick+' / '+d.steps,875,25,14,'#fff',650,'right');
  const y=192;
  beam(c,leadX,y-13,carX,y-13,(t/d.dt)%1);
  c.setLineDash([4,3]);c.strokeStyle='#e3f6ff';c.lineWidth=2;c.strokeRect(ghostX-23,y-12,46,24);c.setLineDash([]);
  const altError=enabled?off:on[0],altX=ghostX+altError*scale;
  if(Math.abs(altX-carX)>3.5){
    c.save();c.globalAlpha=.52;vehicle(c,altX,y,45,enabled?'#cf9a56':'#43af96',true);c.restore();
    label(c,enabled?'始终关闭':'始终反馈',altX-26,y+28,enabled?sand:mint);
  }
  vehicle(c,carX,y,45,'#12a48d',true);vehicle(c,leadX,y,46,'#6593b6',true);
  label(c,'跟随车',carX,y-32,mint);label(c,'领车',leadX,y-32,'#bedaee');
  bracket(c,carX,leadX,y+29,format(gap,2)+' m','#f2d898');
  // The same-clock alternatives start at the same measured error. Arrows use physical cm.
  const gaugeX=735;
  fill(c,527,48,359,72,'#102a30ed',7);
  text(c,'同刻位置误差',539,62,13,'white');
  const scaleCm=82/Math.max(7.5,Math.abs(off*100),Math.abs(on[0]*100));
  for(const [row,name,dp,color] of [[0,'始终反馈',on[0],mint],[1,'始终关闭',off,sand]]){
    const cy=82+row*22,px=gaugeX+dp*100*scaleCm;
    text(c,name,539,cy,12,color);path(c,[[648,cy],[820,cy]],'#657980');
    path(c,[[gaugeX,cy-4],[gaugeX,cy+4]],'#c3d3cd');
    path(c,[[gaugeX,cy],[px,cy]],color,3);disk(c,px,cy,4,color);
    text(c,number(dp*100,2)+' cm',877,cy,12,color,600,'right');
  }
  const rawTrace=state.errorPath??(enabled?ref.slice(0,tick+1):[[d.actual[0]-d.nominal[0],vDrift],[off,vDrift]]);
  const trace=rawTrace.map(row=>[row[0]*100,row[1]*100]);
  const epNow=err/100,inside=Math.abs(2*epNow+evNow)<=d.widths[0]+1e-7&&Math.abs(epNow+evNow)<=d.widths[1]+1e-7;
  fill(c,0,240,W,100,'#102831f5');
  text(c,'跟车误差放大',18,261,15,'#f0f9f5');
  text(c,'位置 '+number(err,2)+' cm',18,289,14,mint);
  text(c,'速度 '+number(evNow*100,2)+' cm/s',18,315,13,'#c7d9d8');
  const cx=294,cy=291,sx=10,sy=3.5;
  path(c,[[cx-91,cy],[cx+91,cy]],'#5e7680');path(c,[[cx,cy-39],[cx,cy+39]],'#5e7680');
  const verts=[[-1,-1],[-1,1],[1,1],[1,-1]].map(([u,v])=>{
    const b1=u*d.widths[0]*100,b2=v*d.widths[1]*100;
    return [cx+(b1+b2)*sx,cy-(-b1-2*b2)*sy];
  });
  path(c,verts,'#387366',1,true);path(c,verts.concat([verts[0]]),'#82ceae',1.5);
  text(c,'速度',cx+6,cy-38,10,'#aec3c2',500);text(c,'位置',cx+90,cy+11,10,'#aec3c2',500,'right');
  trace.push([err,evNow*100]);path(c,trace.map(([x,y])=>[cx+bound(x*sx,-88,88),cy-bound(y*sy,-39,39)]),'#fff1bd',1.5);
  disk(c,cx,cy,2.5,'#d9efe2');
  const marker=[cx+bound(err*sx,-88,88),cy-bound(evNow*100*sy,-39,39)];
  disk(c,marker[0],marker[1],5,inside?mint:'#ff946f');
  text(c,inside?'误差在允许管束内':'误差已越出管束',410,266,16,inside?mint:'#ffae87');
  text(c,'反馈加速度 '+number(a,5)+' m/s²',410,297,14,'#e2ece6');
  text(c,'每 '+number(d.dt,1)+' 秒更新一次',410,320,12,'#adc3c2',500);
  const routeStart=658,routeEnd=865,yy=300,progress=t/(d.steps*d.dt);
  text(c,'归档行程',routeStart,265,13,'#e2ece6');
  text(c,format(d.steps*d.dt*v0/1000,2)+' km',routeEnd,265,13,'#cfdfdc',600,'right');
  path(c,[[routeStart,yy],[routeEnd,yy]],'#658183',5);
  path(c,[[routeStart,yy],[routeStart+(routeEnd-routeStart)*progress,yy]],mint,5);
  disk(c,routeStart+(routeEnd-routeStart)*progress,yy,5,mint);
  text(c,fmtDistance(lead-d.leader[0]),routeStart,320,12,'#d4e5e1',500);
}
function fmtDistance(m){return m<1000?number(m,1)+' m':number(m/1000,3)+' km';}
function draw(canvas,id,state,data,context={}){
  const c=canvas.getContext('2d');c.save();c.setTransform(canvas.width/W,0,0,canvas.height/H,0,0);
  const mode=context.mode??0;
  if(id==='P0480')intervalScene(c,state,data,mode,context.trial);
  else tubeDrive(c,state,data,mode);
  c.restore();
}
window.ORTOPIA_FLEET={draw};
})();
