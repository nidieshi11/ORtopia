/* P0204 small/I001. A vessel occupies the selected berth from start to departure.
   Cargo moves only in assigned crane periods. Shore power uses the certified lower response. */
(() => {
 'use strict';
 const F=window.ORTOPIA_FIELD;
 const {W,H,clamp,poly,line,ellipse,text,badge,box,cachedWorld}=F;
 const sessions=new WeakMap(), berthX=[246,674],cargoColors=['#b45f45','#567d88','#cea753','#769986'];
 function container(c,x,y,w=24,h=11,color='#987860'){
  box(c,x,y,w,h,4,[color,'#58675f','#c5bda3']);
  for(let r=4;r<w-1;r+=5)line(c,[[x+r,y-h+1],[x+r,y-1]],'#263c482e',1);
 }
 function harbour(c){
  const water=c.createLinearGradient(0,145,0,H);water.addColorStop(0,'#76aca8');water.addColorStop(1,'#315f70');
  c.fillStyle=water;c.fillRect(0,0,W,H);
  const sky=c.createLinearGradient(0,0,0,86);sky.addColorStop(0,'#c2d6d5');sky.addColorStop(1,'#e8dfc9');
  c.fillStyle=sky;c.fillRect(0,0,W,90);
  poly(c,[[0,56],[61,48],[108,58],[184,44],[261,63],[365,48],[466,68],[590,45],[721,65],[800,55],[940,62],[940,90],[0,90]],'#abc1b1');
  poly(c,[[0,83],[940,74],[940,179],[0,179]],'#c4c5af');
  for(let i=0;i<5;i++){const x=i*199-20;
   box(c,x,100,106,25,14,['#a6b4a6','#78988c','#d6d8c1']);
   for(let j=1;j<6;j++){c.fillStyle='#79988f';c.fillRect(x+15*j,82,7,12);}
  }
  for(let i=0;i<30;i++)container(c,11+(i%15)*64+(Math.floor(i/15)*7),123+Math.floor(i/15)*16,34,10,cargoColors[i%4]);
  c.fillStyle='#d0c9b1';c.fillRect(0,151,W,28);
  line(c,[[0,149],[W,149]],'#a39d88',3);line(c,[[0,157],[W,157]],'#8c9187',2);
  c.fillStyle='#7e9187';c.fillRect(0,180,W,16);line(c,[[0,179],[W,179]],'#e6c071',4);
  for(let x=5;x<W;x+=28){line(c,[[x,178],[x+7,178]],'#4e605c',3);if(x%3)ellipse(c,x+3,190,3.4,5,'#415556');}
  for(let i=0;i<150;i++){const x=(i*191)%946,y=204+(i*29)%211;line(c,[[x,y],[x+6+i%13,y-1]],i%4?'#a2d2c52e':'#d0e4d54d',1.4);}
 }
 const drawBackground=cachedWorld(harbour);
 function ship(c,x,y,scale,shipId,remaining){
  c.save();c.translate(x,y);c.scale(scale,scale);
  ellipse(c,2,7,85,10,'#20465347');
  poly(c,[[-87,-9],[62,-9],[90,-2],[74,10],[-69,10],[-87,3]],shipId?'#934f3e':'#385f71','#244954',1);
  poly(c,[[-87,-9],[-69,-20],[57,-20],[89,-3],[64,-6],[-70,-6]],'#d0bc91','#697b6b');
  line(c,[[-70,5],[70,5],[81,0]],'#d19a7c',2);
  box(c,-66,-15,18,17,8,['#ece2cb','#9baaa0','#f6edda']);
  c.fillStyle='#587780';c.fillRect(-65,-29,15,4);box(c,-59,-31,6,8,2,['#745548','#514943','#a57453']);
  const n=Math.ceil(remaining/5);
  for(let i=0;i<n;i++){const row=Math.floor(i/7),col=i%7;
   container(c,-42+col*14,-14-row*7,12,6,cargoColors[(i+shipId)%4]);
  }
  c.restore();
 }
 function gantry(c,x,t,working){
  const col=working?'#e8ae51':'#99a9a1',dark=working?'#876b41':'#697e77';
  line(c,[[x-18,160],[x-10,92],[x+1,90],[x+15,157]],dark,4);
  line(c,[[x-18,158],[x+7,106],[x-12,128],[x+13,154]],col,2);
  line(c,[[x-15,96],[x+1,86],[x+30,135],[x+58,171]],col,5);
  line(c,[[x-17,95],[x+47,161]],dark,1.5);
  box(c,x-17,102,12,12,4,['#84745d','#695e50','#d9b576']);
  const f=clamp(t%1),hold=f<.12,upper=f<.42,outward=f>.72;
  let position,depth;
  if(hold){position=1;depth=38-30*f/.12;}
  else if(upper){position=1-(f-.12)/.30;depth=8;}
  else if(!outward){position=0;depth=8+12*Math.sin(Math.PI*(f-.42)/.30);}
  else{position=(f-.72)/.28;depth=8+30*position;}
  if(!working){position=.12;depth=10;}
  const hx=x+1+position*50,hy=94+position*78;
  line(c,[[hx,hy],[hx,hy+depth]],'#3c5556',1.6);
  line(c,[[hx-6,hy+depth],[hx+6,hy+depth]],dark,3);
  if(working&&f<.57)container(c,hx-6,hy+depth+6,12,6,'#bb7249');
 }
 function locate(v,t){
  const x=berthX[v.berth],at=Math.max(0,v.arrival);
  if(t<v.start){
   if(t<at){const f=clamp(t/Math.max(.01,at));
    // Sailing into the harbour, finishing at the assigned slip when no anchorage wait is required.
    const target=v.start-at<.02?[x,222]:[800,334];
    return [938+(target[0]-938)*f,367+(target[1]-367)*f];}
   const wait=v.start-at;
   const approach=Math.min(.4,wait);
   const f=clamp((t-v.start+approach)/approach);
   return [800+(x-800)*f,334+(222-334)*f];
  }
  if(t<v.departure)return [x,222];
  const f=clamp((t-v.departure)/.6);
  return [x+(x>470?220:-200)*f,222+205*f];
 }
 function draw(ui,data,state,index,t){
  const c=ui.c,plan=data.plans[key(state)],v=plan.ships[1];
  const cuts=[0,1,v.start,v.start+1,v.departure+.36];
  const win=state.inspect||[cuts[index],cuts[index+1]];
  const now=win[0]+clamp(t/6)*(win[1]-win[0]);
  drawBackground(c);
  const cranes=[0,0],finished=[0,0],connected=[false,false];
  for(const vessel of plan.ships){
   const assigned=vessel.x_itq,shipId=vessel.ship;
   const row=assigned.find(r=>now>=r.t&&now<r.t+1);
   const unloaded=assigned.reduce((n,r)=>n+25*r.q*clamp(now-r.t),0);
   finished[vessel.berth]+=unloaded;
   if(row)cranes[vessel.berth]=row.q;
   const docked=now>=vessel.start&&now<vessel.departure;
   connected[vessel.berth] ||= docked&&vessel.SSE_periods.includes(Math.floor(now));
   if(now>vessel.departure+.6)continue;
   const [x,y]=locate(vessel,now);
   if(!docked){
    for(let i=0;i<4;i++){const phase=(i/4+t*.38)%1;
     line(c,[[x+48+phase*42,y+7],[x+58+phase*48,y+10]],'#c4e1d3',1.4);}
   }
   ship(c,x,y,shipId ? .96 : 1.05,shipId,75-unloaded);
   badge(c,(shipId+1)+' ship · '+Math.ceil(Math.max(0,75-unloaded))+' To be unloaded',x,y+23,'#244b50','#f7f0d8',14);
  }
  for(let b=0;b<2;b++){
   const x=berthX[b];
   // Each visible lift is illustrative, while remaining cargo follows exact per-period throughput.
   const count=cranes[b];for(let n=0;n<count;n++)gantry(c,x-90+46*n,t*1.2+n*.18,true);
   for(let i=0;i<Math.floor(finished[b]/5);i++)container(c,x+87+(i%5)*15,158-Math.floor(i/5)*7,13,6,cargoColors[i%4]);
   if(connected[b]){line(c,[[x+75,169],[x+81,178],[x+73,190],[x+56,202]],'#41c79b',4);badge(c,'shore power access',x+114,200,'#215e51','#e1ffdd',13);}
   badge(c,(b+1)+' Berth · '+(b?'regular':'shore power'),x,67,b===state.berth?'#27574d':'#65766b','#fff7df',16);
  }
  const idle=3-cranes[0]-cranes[1];for(let k=0;k<idle;k++)gantry(c,390+34*k,0,false);
  badge(c,'port time '+now.toFixed(1),105,28,'#254548','#fff5d7',16);
  badge(c,'Quayside crane operation '+(3-idle)+' / 3',816,28,'#edf0db','#33554d',16);
  badge(c,'2 No. ship · Leaving a mooring '+v.departure+' / Delivery date 6',470,380,plan.total?'#894d38':'#255455','#f8f2d8',16);
 }
 function key(s){return s.berth+'/'+s.cranes+'/'+s.start;}
 function mount(host,onInteract,index,onNode,replayAction){
  const data=window.ORTOPIA_REPLAYS.P0204.field;
  let s=sessions.get(host);if(!s){s={berth:0,cranes:2,start:3};sessions.set(host,s);}
  s.inspect=null;
  const ui=F.siteShell(host,'container-terminal','Two ships entering port, shore bridge loading and unloading and shore power connection','The point berth designates the docking location of vessel No. 2. Each quay crane can unload 25 units per period.');
  const group=(name,title,opts)=>'<div class="fp-group"><strong>'+title+'</strong>'+opts.map(([v,n])=>'<button data-control="'+name+'" data-value="'+v+'">'+n+'</button>').join('')+'</div>';
  ui.control.innerHTML=group('berth','Ship No. 2',[[0,'shore power berth'],[1,'Regular berth']])+group('cranes','Most bridges',[[1,'1 unit'],[2,'2 units']])+group('start','Start time',[[3,'3'],[4,'4'],[5,'5']])+'<button data-reset>restore archive</button>';
  function refresh(){const plan=data.plans[key(s)];
   ui.result.dataset.error='false';ui.result.textContent='Feasible · Late target '+plan.total.toFixed(2)+' · Total cost of two ships '+plan.cost.toFixed(2);
   for(const b of ui.control.querySelectorAll('[data-control]'))b.setAttribute('aria-pressed',String(+b.dataset.value===s[b.dataset.control]));
  }
  function edit(name,value){
   onInteract?.();if(name)s[name]=value;else Object.assign(s,{berth:0,cranes:2,start:3});
   const v=data.plans[key(s)].ships[1];s.inspect=[Math.max(0,v.arrival-.55),v.departure+.25];
   refresh();replayAction?.();host.sceneFrame(0);
  }
  ui.control.onclick=e=>{const b=e.target.closest('button');if(b)edit(b.dataset.control,+b.dataset.value);};
  berthX.forEach((x,i)=>F.hotspot(ui.scene,'Boat No. 2 '+(i+1)+' Berth No.',x,158,()=>edit('berth',i),245,123));
  host.sceneFrame=t=>draw(ui,data,s,index,t);
  host.previewDecision=i=>{Object.assign(s,i?{berth:0,cranes:1,start:5}:{berth:0,cranes:2,start:3});s.inspect=i?[4.4,8.2]:null;refresh();host.sceneFrame(host.sceneTime||0);};
  refresh();host.sceneFrame(host.sceneTime||0);
 }
 window.ORTOPIA_FIELD_P0204={mount};
})();
