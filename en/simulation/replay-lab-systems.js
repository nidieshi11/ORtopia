/* Instance-driven experiments for discrete systems. Interpolation is visual only. */
(() => {
'use strict';
const labs=window.ORTOPIA_LABS;
const ink='#193c42',sky='#e2efed',teal='#2d7972',mint='#a4d9b7',gold='#e2ad59',red='#ad5747',navy='#193344';
const clamp=n=>Math.max(0,Math.min(1,n)), mix=(a,b,t)=>a+(b-a)*clamp(t);
const num=(n,k=2)=>n.toLocaleString('en-US',{maximumFractionDigits:k});
const phase=(f,n)=>{const i=Math.min(n-1,Math.floor(clamp(f)*n));return [i,clamp(f*n-i)];};
function studio(canvas,back){
 const c=canvas.getContext('2d');c.setTransform(canvas.width/900,0,0,canvas.height/360,0,0);
 const rect=(x,y,w,h,color)=>{c.fillStyle=color;c.fillRect(x,y,w,h);};
 const dot=(x,y,r,color)=>{c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fillStyle=color;c.fill();};
 function line(points,color,w=2){c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.strokeStyle=color;c.lineWidth=w;c.lineJoin='round';c.stroke();}
 function poly(points,color){c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fillStyle=color;c.fill();}
 function label(s,x,y,sz=16,color=ink,bold=600,align='center'){c.font=bold+' '+sz+'px system-ui,sans-serif';c.textAlign=align;c.textBaseline='middle';c.fillStyle=color;c.fillText(s,x,y);}
 function tag(s,x,y,bg=ink){c.font='600 14px system-ui';const w=c.measureText(s).width+22;rect(x-w/2,y-12,w,24,bg);label(s,x,y,14,'#fff');}
 function along(points,f){const a=points.slice(1).map(([x,y],i)=>Math.hypot(x-points[i][0],y-points[i][1]));let v=clamp(f)*a.reduce((s,n)=>s+n,0);for(let j=0;j<a.length;j++){if(v<=a[j]||j===a.length-1)return [mix(points[j][0],points[j+1][0],v/a[j]),mix(points[j][1],points[j+1][1],v/a[j])];v-=a[j];}}
 function pulses(path,t,color,n=3){for(let j=0;j<n;j++){const [x,y]=along(path,(t+j/n)%1);dot(x,y,4,color);}}
 function crate(x,y,w=17,color='#af7952'){rect(x,y,w,12,color);rect(x+w*.4,y,w*.18,12,'#e9c58c');line([[x,y+12],[x+w,y+12]],'#744f40',1);}
 function person(x,y,shirt,t=0){const stride=Math.sin(t*Math.PI*2)*3;line([[x-4-stride,y],[x,y-8],[x+4+stride,y]],ink,3);rect(x-4,y-18,8,11,shirt);dot(x,y-22,4,'#c89671');line([[x-3,y-16],[x-6,y-10],[x-9,y-12]],shirt,2);}
 rect(0,0,900,360,back);return {c,rect,dot,line,poly,label,tag,along,pulses,crate,person};
}
labs.P0049={
 title:'Gate mapping on quantum chips',action:'Select the layout rules of four logical qubits on five physical bits, and observe gate operations, movement and crosstalk costs layer by layer.',choices:['Archive layout','Full mirror layout','Switch images every eight layers'],
 scope:'Play example of a 52-layer quantum circuit. Node positions are physical bits 0–4 and letters are logical qubits. Inter-layer movement represents mapping changes, and the target is calculated based on the original weight of error and moving distance.',
 frame(d,k,f){const [i,p]=phase(f,d.layers.length),plan=d.plans[k],row=plan[i];const total=plan.reduce((a,x)=>a+x[2],0);
  return {i,p,row,previous:plan[Math.max(0,i-1)][0],clock:'Circuit No. '+(i+1)+' / '+plan.length+' layer',metrics:[['Double door on this floor',d.layers[i].length+' a'],['Relocation of this layer’s mapping',row[1][3]+' grid'],['Crosstalk cost of this layer',num(row[1][2],5)],['Full circuit weighted target',num(total,6)]]};},
 draw(canvas,s,d){const g=studio(canvas,'#112b38'),{rect,dot,line,label,tag}=g;
  for(let j=0;j<18;j++){const xx=53+j*47;line([[xx,51],[xx,82],[xx+14,96],[xx+14,125]],'#29505a',2);dot(xx,51,3,'#527a7b');line([[xx+14,218],[xx+14,250],[xx-4,268],[xx-4,281]],'#29505a',2);}
  rect(78,110,744,123,'#38545b');rect(83,115,734,113,'#182e38');
  const at=i=>140+i*155;const qs=d.labelCodes.map(x=>String.fromCharCode(x));const current=s.row[0];
  for(let j=0;j<4;j++){line([[at(j),171],[at(j+1),171]],'#a38c61',8);line([[at(j),171],[at(j+1),171]],'#524f43',3);}
  d.layers[s.i].forEach(([a,b],k)=>{const x=at(current[a]),y=at(current[b]);const t=clamp((s.p-.30)*1.5);if(t>0){line([[x,171],[y,171]],k?'#c8a3e4':'#68ded0',5);dot(mix(x,y,t),171,9,k?'#efe1fb':'#c2fff0');}});
  for(let j=0;j<5;j++){rect(at(j)-19,151,38,39,'#b79d72');rect(at(j)-15,155,30,31,'#233d47');label('Q'+j,at(j),211,14,'#c2cfbf');if(s.row[3][j]>0&&s.p>.32){const c=g.c;c.beginPath();c.arc(at(j),171,22+Math.sin((s.p-.32)*Math.PI*3)*3,0,Math.PI*2);c.strokeStyle='#f4a880';c.lineWidth=2;c.stroke();}}
  current.forEach((v,q)=>{const old=s.previous[q],t=clamp(s.p/.30),x=mix(at(old),at(v),t),y=171-Math.sin(t*Math.PI)*(old===v?0:42);dot(x,y,15,['#9ed5b1','#e0b674','#b8a4db','#82bdcf'][q]);label(qs[q],x,y,18,'#162e38',750);});
  label('physical coupling chain',93,24,15,'#b7ccc6',650,'left');label('orange circle · The physical bits involved in crosstalk at this layer',445,29,13,'#e3b798');label('No. '+(s.i+1)+' layer',801,24,16,'#e8d9a1',650,'right');
  const gates=d.layers[s.i].map(([a,b])=>qs[a]+' → '+qs[b]);tag(gates.length?'Door command on this floor　'+gates.join('　/　'):'There is no double door on this floor',450,83,'#304d54');
  for(let j=0;j<d.layers.length;j++)rect(76+j*14.35,300,10,j===s.i?22:12,j===s.i?'#ffd286':j<s.i?'#66af9e':'#34535d');
  label('input layer 1',76,338,14,'#bbd3ca',600,'left');label('output layer '+d.layers.length,822,338,14,'#bbd3ca',600,'right');
 }
};
labs.P0069={
 title:'Start and stop of units in the power supply dispatch center',action:'In the third period, the archived unit can be started, replaced with another unit, or the start can be cancelled. Observe whether the power supply and backup constraints are satisfied at the same time.',choices:['Start Unit 233','Restart unit 108','Neither starts'],
 scope:'Three archived dispatch periods and all 585 units are used. Total output, available capacity and costs are calculated on a fleet basis. The flow of the rotor and line indicates the current output, and there are no additional dispatch observations during this period.',
 frame(d,k,f){const [i,p]=phase(f,3),r=d.plans[k][i],need=d.demand[i],res=d.reserve[i];const short=Math.max(0,need-r[1]),spare=Math.max(0,need+res-r[2]);
  const actual=Math.abs(r[1]-need)<1e-7?need:r[1];
  return {i,p,r,short,spare,clock:'Scheduling period '+(i+1)+' / 3',metrics:[['Full network real delivery/load',num(actual,3)+' / '+num(need,3)+' MW'],['power supply gap',num(short,3)+' MW'],['Alternate constraint notch',num(spare,3)+' MW'],['Dispatch cost as of current period',num(d.plans[k].slice(0,i+1).reduce((a,x)=>a+x[3],0),3)]]};},
 draw(canvas,s,d){const {rect,dot,line,poly,label,tag,pulses}=studio(canvas,sky);
  rect(0,194,900,166,'#d9d6ba');rect(0,248,900,20,'#a8ae97');const {r,p}=s;
  poly([[45,108],[68,88],[88,108],[113,87],[136,108],[161,88],[184,108],[210,86],[237,108],[265,92],[300,110],[300,238],[45,238]],'#76908c');rect(48,119,247,112,'#eae3c9');
  for(let k=0;k<2;k++){const x=106+124*k,on=r[4][k];rect(x-49,177,98,44,'#9eac9e');dot(x,172,31,'#365759');dot(x,172,25,on?'#89bd98':'#afbbb1');
   for(let a=0;a<5;a++){const th=a*Math.PI*2/5+(on?p*14:0);line([[x,172],[x+Math.cos(th)*20,172+Math.sin(th)*20]],'#476462',5);}dot(x,172,6,'#dde5c9');
   label('G'+d.unitIds[k],x,133,14);label(num(r[5][k],2)+' MW',x,208,14);dot(x+34,179,4,on?'#2a9b6c':'#b5aca0');}
  tag('Key units',172,56);rect(342,157,74,67,'#778e88');for(let k=0;k<5;k++)rect(347+k*13,168,7,36,'#b7c6af');label('remaining units',378,242,14);
  function tower(x,y){line([[x-22,y+74],[x,y],[x+22,y+74],[x-11,y+39],[x+11,y+39],[x-19,y+67],[x+19,y+67]],'#47706e',3);line([[x-27,y+17],[x+27,y+17]],'#47706e',4);}
  tower(485,111);tower(638,124);const wire=[[294,150],[350,125],[485,128],[560,143],[638,141],[719,161]];line(wire,'#4c6969',3);pulses(wire,p,'#f2ae3d',5);
  const city=[[728,100,39,133],[773,75,46,158],[829,131,32,102]];city.forEach(([x,y,w,h],j)=>{rect(x,y,w,h,['#709390','#829e98','#89a29a'][j]);for(let b=y+12;b<222;b+=18)for(let a=x+7;a<x+w-6;a+=14)rect(a,b,7,8,'#e9d79e');});
  tag('urban load',787,52);if(s.short>1e-6){line([[672,168],[686,168],[691,158],[698,179],[704,168],[718,168]],red,3);tag('load gap',782,253,red);}label('In transit '+r[0]+' / '+d.fleet+' Taiwan',173,291);label('available capacity '+num(r[2],2)+' MW',486,291);
  tag(s.short>1e-6?'Lack of supply '+num(s.short,3)+' MW':s.spare>1e-6?'Insufficient backup':'Both load and reserve are satisfied',756,287,s.short+s.spare>1e-6?red:teal);
  for(let j=0;j<3;j++){rect(99+j*243,322,213,7,j<=s.i?teal:'#b3bfb1');label('time period '+(j+1),205+j*243,344,13);}
 }
};

labs.P0087={
 title:'Elective schedule for three operating rooms',action:'Adjust the appointment time for the third surgery or the whole batch of surgeries to observe when long surgeries pass the closing time and how the scheduling risk cost changes.',choices:['Archived Appointments 0/10/20','Channel 3 postponed to 25','All three stations postponed 4'],
 scope:'Play archived scenario 207. Three operations each occupy an operating room and an anesthetist. Risk targets are calculated for all 545 scenarios. The screen clock is in instance time units.',
 frame(d,k,f){const [starts,cost]=d.plans[k],t=f*34,ends=starts.map((a,j)=>a+d.durations[j]),finished=ends.filter(x=>x<=t).length,extra=ends.reduce((a,e,i)=>a+Math.max(0,Math.min(e,t)-Math.max(d.close,starts[i])),0);
  const crew=ends.reduce((a,e,i)=>a+Math.max(0,Math.min(e,t)-Math.max(d.staffEnd[i],starts[i])),0);
  return {starts,ends,t,clock:'Surgery department clock '+num(t,2),metrics:[['The operation has ended',finished+' / 3'],['Current accumulated room overtime',num(extra,3)],['The current accumulated overtime work of anesthesiologists',num(crew,3)],['full scenario scheduling goals',num(cost,5)]]};},
 draw(canvas,s,d){const {rect,dot,line,poly,label,tag,person}=studio(canvas,'#dce9e4');
  for(let j=0;j<3;j++){
   const left=24+j*291,center=left+145,a=s.starts[j],e=s.ends[j],active=s.t>=a&&s.t<e,prep=s.t<a,local=s.t-a;
   rect(left,61,270,158,'#77948c');rect(left+5,66,260,139,'#edf1e7');rect(left+5,173,260,37,'#c2d4ca');rect(left+19,97,43,78,'#95b4a9');rect(left+24,103,31,33,'#c4e2d9');rect(left+55,145,4,10,ink);
   line([[center,67],[center,86],[center+12,97]],'#738b83',3);poly([[center+3,100],[center+25,100],[center+30,105],[center-2,105]],active?'#e7bc64':'#a7b6a9');
   rect(left+194,103,39,26,'#3d5a59');line([[left+198,117],[left+202,117],[left+206,113],[left+210,123],[left+214,109],[left+219,117],[left+229,117]],active?'#8edeaa':'#77998e',2);rect(left+211,130,4,28,'#728a81');
   line([[center-32,162],[center-36,184]],'#64857d',3);line([[center+30,162],[center+34,184]],'#64857d',3);rect(center-42,155,84,9,'#4e867d');
   if(active){dot(center-27,146,7,'#cb9b76');rect(center-20,141,55,14,'#76b4ad');person(center+14,152,'#457d70',s.t*.35);person(center-21,179,'#6c98a1');}
   const entry=clamp((s.t-(a-2))/2),exit=clamp((s.t-e)/2);
   if((prep&&entry>0)||(!prep&&!active&&exit<1)){const x=prep?mix(left+19,center-58,entry):mix(center-22,left+20,exit);
    rect(x-13,166,32,6,'#93acab');dot(x-9,178,3,ink);dot(x+15,178,3,ink);dot(x-8,160,4,'#c99875');rect(x-3,158,20,8,'#8ab6b0');person(x+28,181,'#6c9085',s.t);}
   const stat=active?(s.t>d.close?'During surgery after closing the stage':'During surgery'):prep?'Waiting area':'ended';tag('Operating room '+(j+1)+'　'+stat,center,40,active?(s.t>d.close?red:teal):'#697e75');
   const frac=clamp(local/d.durations[j]);rect(left+16,220,238,6,'#adbfaf');rect(left+16,220,238*frac,6,active?teal:'#638c7e');
  }
  const x=t=>81+t*22.6;
  for(let j=0;j<3;j++){const y=263+j*25;label('surgery '+(j+1),17,y,13,ink,600,'left');rect(81,y-5,768,10,'#c4d5ca');rect(x(s.starts[j]),y-6,x(s.ends[j])-x(s.starts[j]),12,'#92b39c');rect(x(s.starts[j]),y-6,Math.max(0,x(Math.min(s.ends[j],s.t))-x(s.starts[j])),12,teal);
   if(s.ends[j]>d.close){const start=Math.max(d.close,s.starts[j]);rect(x(start),y-5,x(s.ends[j])-x(start),10,'#d59675');}}
  line([[x(d.close),246],[x(d.close),326]],red,2);label('Regular shutdown '+num(d.close,2),x(d.close),339,12,red);line([[x(s.t),249],[x(s.t),324]],ink,2);
 }
};
labs.P0432={
 title:'Joint coverage of safeguard measures and scenarios',action:'Remove a selected safeguard, or add safeguards covering both components. Check whether all demand points meet the standards in each spot inspection scenario.',choices:['Archive Protection Package','remove a cover','add a safeguard'],
 scope:'Check the components according to six original scenarios, and the screen layout indicates the relationship between requirements and guarantees. There is no temporal sequence between scenes. Joint coverage probabilities and measure costs were recalculated for all 5,103 scenarios.',
 frame(d,k,f){const [i,p]=phase(f,d.scenarios.length),[sid,parts]=d.scenarios[i],r=d.plans[k],pass=parts.every(x=>x[k+1]);
  return {i,p,sid,parts,r,pass,clock:'Spot check '+(i+1)+' / '+d.scenarios.length+' · Scenario '+sid,metrics:[['total cost of measures',num(r[0])],['Scenario where all quantities are guaranteed',num(r[2])+' / '+num(d.population)],['joint coverage probability',num(r[3]*100,4)+'%'],['threshold '+num(d.threshold*100,4)+'%',r[3]+1e-10>=d.threshold?'reach':'Not yet reached']]};},
 draw(canvas,s,d,k){const {rect,dot,line,poly,label,tag,pulses}=studio(canvas,'#e1e6d3');
  for(const x of [40,250,485,700]){rect(x,36,13,215,'#c7cdbd');for(const y of [55,114,185]){rect(x+34,y+6,47,20,'#b5c4b4');poly([[x+29,y+7],[x+56,y-9],[x+86,y+7]],'#9bab9c');rect(x+41,y+12,8,6,'#e7dfbc');}}
  line([[0,249],[900,249]],'#bbbdad',30);line([[279,24],[279,249]],'#b9beac',19);line([[613,26],[613,249]],'#b9beac',19);
  const base=[153,152];rect(98,128,108,57,'#527d77');poly([[88,129],[152,98],[215,129]],'#38605d');rect(138,144,32,41,'#bad2bd');label('Safeguards',152,199,16,ink);
  const spots=s.parts.length===1?[[651,135]]:[[522,105],[752,189]];
  s.parts.forEach((a,j)=>{const [x,y]=spots[j],ok=!!a[k+1],route=[base,[279,152],[279,235],[x-46,235],[x-46,y],[x-18,y]];if(ok){line(route,'#488b78',4);pulses(route,s.p,'#ffe5a1',3);}else{line([[x-34,y+13],[x-19,y+28]],red,4);line([[x-34,y+28],[x-19,y+13]],red,4);}
   rect(x-17,y-20,57,43,'#d3c4a6');poly([[x-22,y-18],[x+10,y-44],[x+45,y-18]],'#8c7666');rect(x+6,y+5,8,18,'#725d50');dot(x+42,y-24,8,ok?teal:red);
   tag('components '+a[0]+' · '+(ok?'Cover':'Missing'),x+8,y+42,ok?teal:red);});
  tag('Scenario '+s.sid,128,31);label(k===1?'Remove measures '+d.actions[0]:k===2?'New measures '+d.actions[1]:'Enable actions by archive combination',474,29,16);tag(s.pass?'joint coverage':'Scenario not covered',780,31,s.pass?teal:red);
  const low=d.threshold-.001,max=d.threshold+.001;const barX=p=>110+682*clamp((p-low)/(max-low));rect(110,294,682,12,'#b5c4b4');rect(110,294,barX(s.r[3])-110,12,s.r[3]+1e-10>=d.threshold?teal:red);
  line([[barX(d.threshold),281],[barX(d.threshold),313]],ink,2);
  label('joint coverage threshold '+num(d.threshold*100,4)+'%',450,334,15);label('Scenario spot check instructions',111,273,12,ink,600,'left');
 }
};
labs.P0464={
 title:'Pre-disaster reserves and emergency supplies',action:'Set up pre-disaster inventory to deduce the survival capacity, emergency procurement and final supply shortage under the same disaster conditions.',choices:['Reserve 7 units','Reserve 3 units','Close warehouse'],
 scope:'Focusing on the original material number 7473, the demand, purchase limit and 50% survival rate are taken from an extreme case of the model. Driving between stages is only used to illustrate the process. The overall target uses validator results for 10,021 material categories.',
 frame(d,k,f){const [stock,cost]=d.plans[k],[i,p]=phase(f,4),surv=stock*d.survive,local=i<2?0:i===2?surv*clamp((p-.15)/.7):surv,ext=i<3?0:d.external*clamp((p-.12)/.74);
  return {stock,surv,local,ext,i,p,clock:['Pre-disaster preparedness','Damage inventory','Inventory delivery','emergency procurement'][i],metrics:[['Preset/Available Stock',num(stock)+' / '+(i?num(surv):'To be counted')],['Delivered to demand point',num(local+ext,3)],['Demand points are still lacking',num(d.demand-local-ext,3)],['Full model worst expected cost',num(cost,3)]]};},
 draw(canvas,s,d){const {rect,dot,line,poly,label,tag,crate,person}=studio(canvas,'#e1eae0');
  rect(0,193,900,167,'#d2d1ad');poly([[0,180],[72,110],[119,145],[177,99],[227,149],[304,106],[382,181]],'#a3b7a2');poly([[415,179],[493,121],[572,163],[632,106],[721,167],[806,113],[900,170],[900,198],[415,198]],'#b4c5ad');
  rect(38,139,228,84,'#91a598');poly([[24,141],[98,100],[204,100],[280,141]],'#5c7f72');rect(66,146,172,75,'#405d56');rect(73,179,153,5,'#b5a489');rect(73,211,153,5,'#b5a489');
  const remaining=s.i===0?s.stock:Math.max(0,s.surv-s.local);for(let n=0;n<Math.ceil(remaining-1e-9);n++){const x=80+n%5*26,y=196-Math.floor(n/5)*32;crate(x,y,17*Math.min(1,remaining-n));}
  if(s.i===1){for(let j=0;j<17;j++){const x=42+(j*39+s.p*27)%212,y=84+(j*19+s.p*67)%71;line([[x,y],[x-6,y+12]],'#8aa6aa',2);}}
  person(243,220,'#879887',s.p);tag('Regional storage warehouse',154,64);
  const road=[[222,244],[373,244],[462,224],[643,224],[741,239]];line(road,'#999e8e',22);line(road,'#d8d4b7',2);
  rect(411,111,78,60,'#bcbe9e');poly([[401,111],[450,86],[500,111]],'#928e75');label('external supply point',451,71,15);rect(434,134,27,37,'#788c7c');
  line([[450,172],[471,195],[531,224]],'#a8ad97',12);
  poly([[690,186],[741,131],[795,186]],'#b88e68');poly([[743,133],[705,186],[705,217],[780,217],[780,185]],'#dec9a3');poly([[741,152],[730,211],[751,211]],'#7b7764');rect(786,184,57,33,'#bea586');person(809,224,'#6a8881');person(834,229,'#958069');
  tag('Assistance collection point',762,87);
  function truck(x,y,color,load){rect(x-24,y-19,38,20,color);rect(x+14,y-13,15,14,'#b79461');rect(x+16,y-12,8,6,'#d1e1d6');dot(x-15,y+3,5,ink);dot(x+19,y+3,5,ink);if(load>0)crate(x-12,y-29,14);}
  if(s.i===2&&s.stock>0){const tt=clamp((s.p-.04)/.85);truck(mix(239,715,tt),mix(239,223,Math.sin(tt*Math.PI)),teal,s.surv);}
  if(s.i===3){const tt=clamp((s.p-.04)/.87);truck(mix(449,715,tt),mix(174,226,tt/.48),'#a5805a',d.external);}
  if(s.local+s.ext>.01)for(let n=0;n<Math.ceil(s.local+s.ext);n++)crate(702+20*n,226,15*Math.min(1,s.local+s.ext-n));
  const n=s.local+s.ext;label('supplies '+d.material+'　Demand '+num(d.demand,2)+' units',70,285,16,ink,600,'left');rect(70,310,758,14,'#b2baa3');rect(70,310,758*n/d.demand,14,teal);label('Cumulative delivery '+num(n,3)+' units',825,285,16,ink,600,'right');
 }
};
})();

