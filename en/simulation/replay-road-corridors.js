/* P0476/P0477 share the drawing instruments, but use different longitudinal
   coordinates, decision variables and risk displays. Coordinates in metres. */
(() => {
'use strict';
const W=900,H=340;
const settings=new WeakMap();
const clamp=(v,lo,hi)=>Math.max(lo,Math.min(hi,v));
const num=(v,d=1)=>Number(v).toLocaleString('en-US',{minimumFractionDigits:d,maximumFractionDigits:d});
const sign=(v,d)=>Math.abs(v)<.5*10**-d?num(0,d):(v>0?'+':'−')+num(Math.abs(v),d);

function rounded(g,x,y,w,h,r,fill,stroke){
 g.beginPath();g.roundRect(x,y,w,h,r);
 if(fill){g.fillStyle=fill;g.fill();}
 if(stroke){g.lineWidth=1;g.strokeStyle=stroke;g.stroke();}
}
function text(g,s,x,y,size=13,color='white',align='left',weight=600){
 g.fillStyle=color;g.textBaseline='middle';g.textAlign=align;
 g.font=weight+' '+size+'px system-ui,"Microsoft YaHei",sans-serif';g.fillText(s,x,y);
}
function line(g,x,y,x2,y2,col,width=1,dash=[]){
 g.beginPath();g.strokeStyle=col;g.lineWidth=width;g.setLineDash(dash);
 g.moveTo(x,y);g.lineTo(x2,y2);g.stroke();g.setLineDash([]);
}
function disk(g,x,y,r,col){
 g.fillStyle=col;g.beginPath();g.arc(x,y,r,0,2*Math.PI);g.fill();
}
function tag(g,x,y,label,accent){
 g.font='600 13px system-ui,"Microsoft YaHei",sans-serif';
 const width=g.measureText(label).width+19,left=clamp(x-width/2,3,W-width-3);
 rounded(g,left,y-12,width,23,5,'rgba(21,39,43,.92)');
 g.fillStyle=accent;g.fillRect(left+1,y-7,3,14);text(g,label,left+width/2+2,y,13,'#fff','center');
}
function hatch(g,x,w,y,h,ink,fill){
 if(w<=0)return;
 g.save();g.beginPath();g.rect(x,y,w,h);g.clip();
 g.fillStyle=fill;g.fillRect(x,y,w,h);
 for(let j=x-h;j<x+w;j+=8)line(g,j,y+h,j+h,y,ink,1.4);
 g.restore();
}
function ground(g,img){
 if(img?.complete&&img.naturalWidth){g.drawImage(img,0,0,W,H);return;}
 // The roadway remains playable during image transfer.
 g.fillStyle='#7e997f';g.fillRect(0,0,W,H);
 for(let j=0;j<20;j++){
  g.fillStyle=j%3?'#c2bbaa':'#a28b72';g.fillRect(j*51+3,30+j%4*8,40,46);
  disk(g,j*51+17,109,10,'#5b795b');disk(g,j*51+11,105,7,'#78946d');
 }
 g.fillStyle='#c2c3b6';g.fillRect(0,135,W,113);g.fillStyle='#697375';g.fillRect(0,145,W,94);
 line(g,0,188,W,188,'#d0c193',2);
 for(const y of [166,211])line(g,0,y,W,y,'#e0e4d4',1,[10,13]);
}
function vehicle(g,x,y,length,width,bus,color){
 const rear=x,top=y-width/2;
 g.save();g.shadowColor='rgba(8,23,27,.65)';g.shadowBlur=4;g.shadowOffsetY=3;
 const roof=g.createLinearGradient(0,top,0,top+width);
 roof.addColorStop(0,color);roof.addColorStop(.18,'#f4f5df');roof.addColorStop(.31,color);roof.addColorStop(.8,color);roof.addColorStop(1,'#304450');
 rounded(g,rear,top,length,width,bus?3:width*.32,roof,'#334046');g.restore();
 if(bus){
  rounded(g,rear+2,top+2,5,width-4,1,'#536c76');
  rounded(g,rear+length*.81,top+1,length*.14,width-2,2,'#315966');
  for(const at of [.26,.54]){rounded(g,rear+length*at,top+width*.22,length*.15,width*.56,1,'#d1d4cc','#829696');
   for(let j=0;j<3;j++)line(g,rear+length*(at+.03),top+width*(.31+.13*j),rear+length*(at+.12),top+width*(.31+.13*j),'#8a9690');}
 }else{
  rounded(g,rear+length*.24,top+2,length*.51,width-4,4,'#254653');
  rounded(g,rear+length*.34,top+2,length*.23,width-4,2,color);
  line(g,rear+length*.65,top+3,rear+length*.73,top+width-3,'#92b2b5');
 }
 for(const sy of [top+2,top+width-4]){
  g.fillStyle='#ef8366';g.fillRect(rear+.8,sy,1.8,2);
  g.fillStyle='#fff2c8';g.fillRect(rear+length-2.6,sy,2,2);
 }
}
function signal(g,x,y,red){
 rounded(g,x-18,y-9,36,18,7,'#24343a','#bbcbc6');
 disk(g,x-9,y,4.6,red?'#ff746d':'#563f41');
 disk(g,x,y,4.6,'#5c5640');disk(g,x+9,y,4.6,red?'#3b5447':'#75e69d');
}
function bus(g,s,d,img,trial){
 ground(g,img);
 const rowset=d.windows.find(rows=>s.t>=rows[0][0]*d.dt-.001&&s.t<=rows.at(-1)[0]*d.dt+.001)||d.windows[0];
 const mode=d.windows.indexOf(rowset),first=rowset[0],last=rowset.at(-1),local=s.t-first[0]*d.dt;
 const tMax=(last[0]-first[0])*d.dt;
 // Use the crossing once on departure. Mid-route uses an uninterrupted
 // stretch of the same street; the final target aligns with the bus shelter.
 let spacing=(mode===2?524:689)/(Math.max(last[1],last[2])-first[1]);
 let startX=73;
 if(mode===0){
  // Mirror the entire photograph as one surface. This puts the first
  // segment's signal on the far-side crosswalk and keeps the street continuous.
  startX=12;spacing=(W*(1-.837)-startX)/d.light;
  if(img?.complete&&img.naturalWidth){
   g.save();g.translate(W,0);g.scale(-1,1);g.drawImage(img,0,0,W,H);g.restore();
  }
 }else if(mode===1&&img?.complete&&img.naturalWidth){
  // A single continuous midblock field of view, outside the intersection.
  const portion=.49;
  g.drawImage(img,0,img.naturalHeight*(201/H)*(1-portion),
   img.naturalWidth*portion,img.naturalHeight*portion,0,0,W,H);
 }
 const project=x=>startX+(x-first[1])*spacing,px=project(s.cars[0].x),ref=project(s.ghost);
 const y=201,stage=["Depart from starting point","Traveling between stations","Near the end"][mode];
 const v=s.t>=last[0]*d.dt?last[3]:rowset[Math.min(rowset.length-2,Math.floor(local/d.dt+1e-7))][3];
 const slot=clamp(Math.floor(local/d.dt+1e-7),0,rowset.length-2);
 const vCommand=rowset[slot+1][3];
 if(mode===0){
  const sx=project(d.light);line(g,sx,178,sx,226,'#f2eee4',2);
  signal(g,sx,157,s.red);tag(g,sx,129,"signalized intersection",'#88d8a3');
 }
 if(mode===2){
  const sx=project(d.terminal[0]),tol=spacing*d.terminal[1];
  hatch(g,sx-tol,2*tol,y-14,32,'#e0fbab','#9ac97f88');
  line(g,sx,185,sx,231,'#d8ffa5',2);
  tag(g,sx,151,"platform · docking window ±"+num(d.terminal[1],0)+' m','#baf1a3');
 }
 // An alignment mark indicates the bus model's longitudinal reference point.
 line(g,project(first[1]),y+17,px,y+17,'#a5ece1',3);
 line(g,ref,y-18,ref,y+23,'#72ccff',2,[3,2]);
 vehicle(g,px,y,42,14,true,'#e1ad43');
 disk(g,px,y+17,3,'#8bf1dd');
 const controls=rowset.slice(1).map(row=>row[3]);
 const live=trial.drives?.get(mode);
 // dt equals the driver's time constant. Command j sets speed j+1;
 // position during interval j still uses its initial measured speed.
 let command=live?live.base:trial.active?trial.speed:null;
 const positions=[first[1]],speeds=[first[3]];
 for(let j=0;j<controls.length;j++){
  if(live?.orders.has(j))command=live.orders.get(j);
  if(command!==null)controls[j]=command;
  positions.push(positions[j]+speeds[j]*d.dt);
  speeds.push(controls[j]);
 }
 const showTrial=!!live||trial.active;
 const trialX=positions[slot]+speeds[slot]*(local-slot*d.dt);
 const trialError=trialX-s.ghost;
 trial.mode=mode;trial.nextTick=Math.max(0,Math.ceil(local/d.dt-1e-6));trial.lastTick=controls.length;
 if(trial.buttons)for(const button of trial.buttons)button.disabled=trial.nextTick>=trial.lastTick;
 if(trial.verdict){
  const err=positions.at(-1)-last[2],endSpeed=speeds.at(-1),terminalOk=Math.abs(err)<d.terminal[1]&&endSpeed===0;
  const prefix=live?"field instructions "+live.orders.size+" Article · ":'';
  const verdict=!showTrial?'':prefix+(mode===2?
   "Stopping at the end of the segment to check position difference "+sign(err,2)+" m, speed "+num(endSpeed,1)+' m/s · '+(terminalOk?"satisfy":"not satisfied"):
   "Position difference at the end of this paragraph "+sign(err,2)+' m');
  if(trial.verdict.textContent!==verdict)trial.verdict.textContent=verdict;
 }
 if(showTrial){
  const xx=project(trialX);
  if(xx>=0&&xx<W){
   g.setLineDash([4,3]);rounded(g,xx,y+23,42,12,3,'#e8a56b4d','#ffe5a9');g.setLineDash([]);
   line(g,xx,y+19,xx,y+38,'#ffcd90',1.5);
  }else{tag(g,xx<0?59:841,233,"The trial car has driven out",'#ffcd90');}
 }
 tag(g,clamp(px+19,55,875),y-34,v===0?"Parked":stage+' · '+num(v,1)+' m/s','#e3b958');
 rounded(g,13,10,241,31,5,'#183942e8');
 text(g,"bus dispatch",25,25,14,'#f2ce79');
 text(g,"Mileage between stations "+num(s.cars[0].x/1000,3)+' km',102,25,14);
 // The upper plot shows the discrete decision actually issued each 2 seconds.
 const panelY=265,plotX=174,plotW=489,base=320,amp=37;
 rounded(g,12,panelY,W-24,64,6,'rgba(17,38,42,.94)');
 text(g,"expected speed",26,285,15,'#fbf5df');text(g,"every 2 One command per second",26,309,12,'#bdd2c9');
 const bars=rowset.length-1,bw=plotW/bars;
 for(let j=0;j<bars;j++){
  const val=rowset[j+1][3],bh=val/d.limit*amp;
  g.fillStyle=j===slot?'#ecc574':j<slot?'#83b7ab':'#586f72';
  g.fillRect(plotX+j*bw,base-bh,bw-3,Math.max(2,bh));
 }
 line(g,plotX,base+1,plotX+plotW,base+1,'#a8bebb');
 const cursor=plotX+plotW*local/tMax;line(g,cursor,276,cursor,323,'white',1.4);
 if(showTrial){
  controls.forEach((value,j)=>{
   const sy=base-value/d.limit*amp,left=plotX+j*bw;
   line(g,left,sy,left+bw,sy,'#f5b557',2);
   if(j)line(g,left,base-controls[j-1]/d.limit*amp,left,sy,'#eeb16c',1);
  });
  text(g,live?"On-site trial calculation of position difference":"Constant speed trial calculation deviation",684,283,12,'#e3bd85');
  text(g,sign(trialError,2)+' m',684,308,19);
 }else{
  text(g,"Archiving instructions",684,283,12,'#bdcfc8');
  text(g,num(vCommand,2)+' m/s',684,308,19);
 }
}
// The road geometry is an illustrative streetscape. Only the signal phase
// and the longitudinal rear-bumper coordinates are part of the instance.
function junction(g,red){
 const mid=705,left=mid-51,right=mid+51,upper=139,lower=226;
 g.fillStyle='#637673';g.fillRect(0,0,W,H);
 function pavement(x,y,w,h){
  rounded(g,x,y,w,h,9,'#a4a79c','#75827b');
  g.save();g.beginPath();g.rect(x+2,y+2,w-4,h-4);g.clip();
  for(let i=x;i<x+w;i+=13)line(g,i,y,i,y+h,'#92998e',.8);
  for(let j=y;j<y+h;j+=12)line(g,x,j,x+w,j,'#909a8f',.8);g.restore();
 }
 pavement(-4,-10,left-2,upper+10);pavement(right+6,-10,W-right+4,upper+10);
 pavement(-4,lower,left-2,H-lower+5);pavement(right+6,lower,W-right+4,H-lower+5);
 function roof(x,y,w,h,body){
  g.save();g.shadowColor='#293d4199';g.shadowBlur=5;g.shadowOffsetX=5;g.shadowOffsetY=5;
  rounded(g,x,y,w,h,2,body,'#67716c');g.restore();
  rounded(g,x+3,y+3,w-6,h-6,2,null,'#b8b4a4');
  for(let j=7;j<w-18;j+=36){
   rounded(g,x+j,y+8,16,12,2,'#777f7d','#bbc4bd');
   disk(g,x+j+8,y+14,4,'#596564');line(g,x+j+4,y+14,x+j+12,y+14,'#94a09a');
  }
 }
 for(let x=-49,i=0;x<650;x+=127,i++){
  roof(x,8+(i%3)*6,104,56+i%2*14,i%2?'#a28a7e':'#b1a58f');
  roof(x+9,267+i%2*8,100,65,'#947b70');
 }
 roof(780,17,115,74,'#9b9185');roof(780,266,125,68,'#9f9788');
 function tree(x,y){
  disk(g,x+4,y+5,12,'#56685b88');disk(g,x,y,11,'#557460');
  disk(g,x-3,y-3,8,'#698367');disk(g,x+3,y-5,5,'#819072');
 }
 for(let x=25;x<W;x+=62)if(x<left-20||x>right+20){tree(x,114);tree(x+5,245);}
 const grd=g.createLinearGradient(0,upper,0,lower);grd.addColorStop(0,'#4a5057');grd.addColorStop(.58,'#51585d');grd.addColorStop(1,'#44494c');
 g.fillStyle=grd;g.fillRect(0,upper,W,lower-upper);g.fillRect(left,0,right-left,H);
 for(const [lo,hi] of [[0,left-12],[right+12,W]]){
  for(const y of [180,183])line(g,lo,y,hi,y,'#ceb477',1.1);
  for(const y of [159,205])line(g,lo,y,hi,y,'#c9c7ba',1,[12,12]);
  for(const y of [upper+2,lower-2])line(g,lo,y,hi,y,'#dfd9c6',2);
 }
 for(const [lo,hi] of [[0,upper-10],[lower+10,H]]){
  line(g,mid,lo,mid,hi,'#c9ad6c',2);
  line(g,mid-24,lo,mid-24,hi,'#d9d3c3',1,[12,12]);
  line(g,mid+24,lo,mid+24,hi,'#d9d3c3',1,[12,12]);
 }
 for(let y=upper+4;y<lower-2;y+=7){
  g.fillStyle='#d1cfc3';g.fillRect(left-12,y,10,3);g.fillRect(right+2,y,10,3);
 }
 for(let x=left+3;x<right;x+=8){
  g.fillStyle='#c8c5b9';g.fillRect(x,upper-12,3,10);g.fillRect(x,lower+2,3,10);
 }
 line(g,left-18,184,left-18,lower-4,'#ece5d0',2.4);
 line(g,right+18,upper+4,right+18,179,'#ece5d0',2.4);
 for(const x of [149,391,569]){
  line(g,x,216,x+18,216,'#b8bcb2',2);
  line(g,x+12,213,x+18,216,'#b8bcb2',2);line(g,x+12,219,x+18,216,'#b8bcb2',2);
 }
 for(const [x,y] of [[left-21,lower+6],[right+20,upper-7]]){
  line(g,x-10,y+7,x+12,y+7,'#333f40',3);signal(g,x,y,red);
 }
}
function eco(g,s,d,img){
 if(img?.complete&&img.naturalWidth)ground(g,img);else junction(g,s.red);
 const y=196,scale=14.0,sx=x=>72+(x-d.ego[0])*scale;
 const ego=s.cars[0].x,lead=s.cars[1].x,tail=sx(ego),front=sx(lead);
 const headx=sx(s.zone[0]),redx=sx(lead-d.jam-d.margin);
 const gap=lead-ego,stage=d.k+Math.min(d.count-1,Math.floor(s.t/d.dt+1e-6));
 hatch(g,headx,front-headx,y-12,26,'#e8be6266','#efc46457');
 if(s.red)hatch(g,redx,front-redx,y-12,26,'#ff958ccc','#d1504799');
 line(g,headx,y-17,headx,y+20,'#ffdc87',2);
 if(s.red)line(g,redx,y-17,redx,y+20,'#ffc0b1',2);
 vehicle(g,tail,y,51,21,false,'#41a79e');vehicle(g,front,y,53,21,false,'#e4b15f');
 line(g,tail+4,y-14,tail+4,y-24,'white');tag(g,tail+25,y-38,"controlled vehicle",'#80dcd1');
 line(g,front+4,y-14,front+4,y-24,'white');tag(g,front+25,y-38,"Forecast",'#f3ca88');
 line(g,tail,y+29,front,y+29,'#f5e9c6',1.4);
 for(const x of [tail,front])line(g,x,y+24,x,y+34,'#f5e9c6',1.4);
 tag(g,(tail+front)/2,y+48,"distance between cars "+num(gap,3)+' m','#f8d38b');
 // Call out the second longitudinal rule exactly when its phase is active.
 if(s.red){
  const labelX=clamp((redx+front)/2,105,W-105);
  line(g,redx,y-13,labelX,y-53,'#f6bda8',1);
  tag(g,labelX,y-66,"Parking distance ≥ "+num(d.jam+d.margin,0)+' m','#ffa98d');
 }
 // Signal state is a time series. No physical stop-line coordinate is supplied.
 rounded(g,12,10,305,38,6,'#162f36eb');signal(g,42,29,s.red);
 text(g,s.red?"Red light parking distance restriction takes effect":"Green light · Check safe time interval",74,29,14,'#f2f6ef');
 const trackX=649,trackY=34,trackW=217;
 rounded(g,633,10,253,44,5,'#162f36eb');text(g,"predicted phase",trackX,21,11,'#dce9d8');
 line(g,trackX,trackY,trackX+trackW,trackY,'#86bc9c',5);
 const ratio=j=>clamp((j-d.k)/d.count,0,1);
 line(g,trackX+trackW*ratio(d.red[0]),trackY,trackX+trackW*ratio(d.red[1]+1),trackY,'#e88a7e',5);
 disk(g,trackX+trackW*ratio(stage),trackY,4,'white');
 const coasting=d.ego[0]+d.ego[1]*s.t,cm=100*(ego-coasting);
 const maxCm=50*Math.max(...d.accel.map(Math.abs))*(d.dt*d.count)**2;
 rounded(g,12,266,W-24,63,6,'rgba(18,36,46,.95)');
 text(g,"gliding at relatively constant speed",26,285,15,'#e8f2ea');text(g,"Longitudinal displacement difference · cm zoom",26,309,12,'#bed0d2');
 const lo=237,hi=608,middle=(lo+hi)/2;
 line(g,lo,297,hi,297,'#617c82',2);line(g,middle,286,middle,306,'#adc1c1');
 const cx=middle+cm/maxCm*(hi-lo)/2;line(g,middle,297,cx,297,'#73cbbb',4);disk(g,cx,297,5,'#b7efce');
 text(g,"backward",lo,312,11,'#bdd0cb');text(g,"Ahead of time",hi,312,11,'#bdd0cb','right');
 text(g,sign(cm,3)+' cm',635,296,18,'#e9eecb');
 text(g,s.red?"Red light parking boundary":"safe interval boundary",869,278,10,'#b7cacf','right');
 text(g,s.red?num(d.jam+d.margin,1)+' m':num(lead-s.zone[0],2)+' m',869,306,15,'white','right');
}
function controls(canvas,id,data,redraw,signal){
 if(!['P0476','P0477'].includes(id)||settings.has(canvas))return;
 const stage=canvas.closest('.atlas-stage'),panel=document.createElement('div');
 if(!stage)return;
 const trial={active:false,speed:8,drives:new Map()};settings.set(canvas,trial);
 panel.className='corridor-controls';panel.style.cssText='display:flex;align-items:center;gap:12px;flex-wrap:wrap;padding:10px 16px;background:#f3f5ee;border-top:1px solid #d7dfd5;font-size:14px';
 const on=(el,ev,fn)=>el.addEventListener(ev,fn,{signal});
 if(id==='P0476'){
  const check=document.createElement('input'),range=document.createElement('input'),label=document.createElement('label'),output=document.createElement('output');
  check.type='checkbox';label.append(check," Trial calculation of superimposed constant speed command");
  range.type='range';range.setAttribute('aria-label',"Calculate expected vehicle speed");range.min=0;range.max=data.limit;range.step=.5;range.value=trial.speed;range.style.width='100px';output.textContent='8 m/s';
  on(check,'change',()=>{trial.drives.clear();trial.active=check.checked;redraw();});
  on(range,'input',()=>{trial.speed=Number(range.value);output.textContent=trial.speed+' m/s';redraw();});
  trial.verdict=document.createElement('span');trial.verdict.setAttribute('aria-live','polite');
  panel.append(label,range,output);trial.buttons=[];
  for(const [caption,key] of [["Now issue the trial speed calculation",'apply'],["Brake now",'brake']]){
   const button=document.createElement('button');button.type='button';button.textContent=caption;
   button.dataset.busAction=key;panel.append(button);trial.buttons.push(button);
   on(button,'click',()=>{
    redraw();
    if(trial.nextTick>=trial.lastTick)return;
    const branch=trial.drives.get(trial.mode)||{base:trial.active?trial.speed:null,orders:new Map()};
    // Rewinding and entering a new instruction replaces that branch's future.
    for(const j of branch.orders.keys())if(j>=trial.nextTick)branch.orders.delete(j);
    branch.orders.set(trial.nextTick,key==='brake'?0:trial.speed);
    trial.drives.set(trial.mode,branch);redraw();
    const play=stage.querySelector('.play');if(play?.textContent==="play")play.click();
   });
  }
  const reset=document.createElement('button');reset.type='button';reset.textContent="Revoke field order";
  on(reset,'click',()=>{trial.drives.delete(trial.mode);redraw();});panel.append(reset,trial.verdict);
 }else{
  const desc=document.createElement('span');desc.textContent="Positioning signal switching";panel.append(desc);
  for(const [caption,at] of [["red light starts",data.red[0]],["red light ends",data.red[1]+1]]){
   const b=document.createElement('button');b.type='button';b.textContent=caption;
   on(b,'click',()=>{const scrub=stage.querySelector('.scrub');if(!scrub)return;
    const ratio=(at-data.k)/data.count;
    scrub.value=Math.ceil(ratio*Number(scrub.max));scrub.dispatchEvent(new Event('input',{bubbles:true}));
   });panel.append(b);
  }
 }
 stage.append(panel);redraw();
}
function draw(canvas,id,state,data,context){
 const g=canvas.getContext('2d');g.save();g.setTransform(canvas.width/W,0,0,canvas.height/H,0,0);
 const image=context?.images?.[id];
 if(id==='P0476')bus(g,state,data,image,settings.get(canvas)||{active:false,speed:8});
 else if(id==='P0477')eco(g,state,data,image);
 g.restore();
}
window.ORTOPIA_CORRIDORS={draw,controls};
})();
