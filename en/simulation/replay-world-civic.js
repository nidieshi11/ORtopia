/* Five public-service simulations. Every state is rebuilt from the instance pack.
   Street and room geometry is illustrative; decisions and quantities have model units. */
(() => {
'use strict';
const labs=window.ORTOPIA_LABS, W=1240,H=610, ink='#254347', dark='#27574f', gold='#c2853e', red='#a55144';
const cap=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)), frac=(t,a,b)=>cap((t-a)/(b-a||1)), mix=(a,b,u)=>a+(b-a)*cap(u);
const num=(n,k=2)=>Number(n.toFixed(k)).toLocaleString('en-US',{maximumFractionDigits:k});
const lerp=(a,b,u)=>[mix(a[0],b[0],u),mix(a[1],b[1],u)];
const fabric=['#b86950','#368377','#d29b4b','#657f9e','#85678a','#92974e'];
function drawKit(c){
 function box(x,y,w,h,col){c.fillStyle=col;c.fillRect(x,y,w,h);}
 function poly(pts,col){c.fillStyle=col;c.beginPath();pts.forEach(([x,y],j)=>j?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();}
 function line(pts,col,w=2,dash=[]){c.beginPath();pts.forEach(([x,y],j)=>j?c.lineTo(x,y):c.moveTo(x,y));c.strokeStyle=col;c.lineWidth=w;c.lineJoin='round';c.lineCap='round';c.setLineDash(dash);c.stroke();c.setLineDash([]);}
 function dot(x,y,rx,col,ry=rx){c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fillStyle=col;c.fill();}
 function text(s,x,y,px=15,col=ink,align='center'){c.fillStyle=col;c.textAlign=align;c.textBaseline='middle';c.font='650 '+px+'px system-ui,"Microsoft YaHei",sans-serif';c.fillText(s,x,y);}
 function sign(s,x,y,bg=dark,sz=14){c.font='650 '+sz+'px system-ui,"Microsoft YaHei",sans-serif';const w=c.measureText(s).width+14;box(x-w/2,y-11,w,22,bg);text(s,x,y,sz,'#fff6db');}
 return {c,box,poly,line,dot,text,sign};
}
function tree(g,x,y,k=1){g.dot(x+5*k,y+3*k,18*k,'#9cab8d',5*k);g.box(x-2*k,y-22*k,5*k,25*k,'#816d50');g.dot(x,y-30*k,17*k,'#608774',20*k);g.dot(x-7*k,y-33*k,13*k,'#86a384',15*k);g.dot(x-4*k,y-42*k,9*k,'#aabd87');}
function person(g,x,y,t,col,parcel=false){
 const z=Math.sin(t)*3;g.dot(x+2,y,7,'#73837a',2);g.line([[x-1,y-12],[x-4-z,y],[x,y-7],[x+5+z,y]],'#3d5050',3);
 g.box(x-4,y-23,9,12,col);g.dot(x+.5,y-28,4.8,'#c69c7a');g.dot(x,y-30,4.4,'#584c43',2.6);
 g.line([[x-3,y-20],[x-7,y-13+z/2]],col,3);if(parcel)crate(g,x+3,y-15,10,'#af7d46');
}
function crate(g,x,y,w=20,col='#be8c50'){g.box(x,y,w,w*.67,col);g.poly([[x,y],[x+4,y-3],[x+w+4,y-3],[x+w,y]],'#e3c595');g.box(x+w*.43,y,w*.15,w*.67,'#e8c995');}
function car(g,x,y,dir,col,body='van'){
 const c=g.c;c.save();c.translate(x,y);c.scale(dir,1);g.dot(0,2,32,'#727f74',5);
 if(body==='van'){g.box(-29,-25,40,20,col);g.poly([[11,-21],[21,-21],[30,-11],[30,-5],[11,-5]],col);g.box(14,-19,8,8,'#c7deda');g.box(-23,-21,15,6,'#dddfce');}
 else{g.poly([[-26,-10],[-18,-11],[-10,-21],[10,-21],[19,-12],[27,-10],[28,-4],[-26,-4]],col);g.poly([[-12,-13],[-7,-19],[7,-19],[12,-13]],'#b5d6d3');}
 for(const xx of [-17,18]){g.dot(xx,-4,5.2,'#354748');g.dot(xx,-4,2.6,'#b4b8ab');}c.restore();
}
function road(g,pts,w=34,col='#86938d'){g.line(pts,'#d6c9aa',w+11);g.line(pts,col,w);g.line(pts,'#dedcc2',1.6,[11,13]);}
function building(g,x,y,w,h,name,col='#cbb99d',roof='#9b9380'){
 g.poly([[x,y-h],[x+15,y-h-12],[x+w+15,y-h-12],[x+w,y-h]],roof);g.box(x,y-h,w,h,col);
 g.poly([[x+w,y-h],[x+w+15,y-h-12],[x+w+15,y-10],[x+w,y]],'#9da38f');g.box(x+w*.42,y-28,w*.17,28,'#52746b');
 for(let i=0;i<Math.floor(w/23);i++){const xx=x+7+i*23;g.box(xx,y-h+9,13,14,'#709a9b');g.box(xx+5,y-h+9,2,14,'#d4d4b6');}
 if(name)g.sign(name,x+w/2,y-h+36,dark,12);
}
function along(pts,f){let lengths=[],sum=0;for(let i=1;i<pts.length;i++){const a=pts[i-1],b=pts[i],d=Math.hypot(b[0]-a[0],b[1]-a[1]);lengths.push(d);sum+=d;}
 let left=cap(f)*sum;for(let i=0;i<lengths.length;i++){if(left<=lengths[i]||i===lengths.length-1)return lerp(pts[i],pts[i+1],left/(lengths[i]||1));left-=lengths[i];}return pts[0];}
const backdrops=new Map();
function scene(canvas,id,bg,at,overview,width,paint){
 let backing=backdrops.get(id);if(!backing){if(backdrops.size>=4)backdrops.delete(backdrops.keys().next().value);backing=document.createElement('canvas');backing.width=W*1.5;backing.height=H*1.5;const b=backing.getContext('2d');b.scale(1.5,1.5);bg(drawKit(b));backdrops.set(id,backing);}
 const c=canvas.getContext('2d'),w=canvas.width,h=canvas.height,aspect=w/h;
 let scale=overview?Math.min(w/W,h/H):Math.max(h/(width*.55),w/(aspect<1.35?width*.61:width));
 const ox=(w>=W*scale?(w-W*scale)/2:-cap(at[0]*scale-w*.5,0,W*scale-w));
 const oy=(h>=H*scale?(h-H*scale)/2:-cap(at[1]*scale-h*.52,0,H*scale-h));
 c.setTransform(1,0,0,1,0,0);c.fillStyle='#d8e2d3';c.fillRect(0,0,w,h);c.setTransform(scale,0,0,scale,ox,oy);c.drawImage(backing,0,0,W,H);paint(drawKit(c));
}
window.ORTOPIA_PAINT={scene,drawKit,building,tree,person,crate,car,road,along,lerp};
const checkpoints=arr=>()=>arr.map(([label,at])=>({label,at}));
const routePts=[[122,382],[265,277],[462,205],[683,185],[949,249],[1041,385],[684,457]];
function way(a,b){const p=routePts[a],q=routePts[b];return [p,[mix(p[0],q[0],.48),mix(p[1],q[1],.38)+13],q];}
function clinicDistrict(g){
 g.box(0,0,W,H,'#c6d2af');g.poly([[0,68],[330,25],[470,70],[392,133],[0,170]],'#a8bcab');g.line([[-20,555],[250,521],[475,550],[765,531],[1260,580]],'#90b9b3',38);
 for(let j=0;j<6;j++)for(let i=0;i<9;i++){const x=i*148+20+(j%2)*49,y=j*99+28; if((i+j)%3===0)building(g,x,y,43,26,'','#c9c3a8');else if((i+j)%2)tree(g,x,y,.8);}
 for(const [a,b] of [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,0],[1,4],[3,2],[2,5],[2,4]])road(g,way(a,b),23);
 const names=["District-level receiving and dispatching center","Dongmen Clinic 1","Qiaotou Clinic 2","Market Clinic 3","Corner Clinic 4","Riverside Clinic 5","Station Clinic 6"];
 routePts.forEach(([x,y],i)=>{const siteColor=['#a9c2b9','#e1c9a3','#bdd1c8','#deb185','#cbb8a4','#d8c9a3','#a9bbb8'][i];
  building(g,x-48,y-13,i?100:120,i?62+(i%3)*9:84,names[i],siteColor);
  if(i){g.box(x-34,y-49,13,4,'#a65e55');g.box(x-30,y-54,4,13,'#a65e55');}
  if(i===3||i===6){g.poly([[x+48,y-32],[x+92,y-32],[x+103,y-22],[x+42,y-22]],i===3?'#b87659':'#739193');g.box(x+48,y-22,3,17,'#8c8977');g.box(x+91,y-22,3,17,'#8c8977');}
 });
}
function sampleState(d,k,f){
 const [route,len]=d.routes[k],total=146,t=f*total;
 let pos=routePts[0],last=0,dist=0,picked=0,back=0,station=0,stage="Prepare to exit the warehouse",u=0,dir=1,done=[];
 for(let i=1;i<route.length;i++){
  const a=route[i-1],b=route[i],km=d.dist[a][b],pts=way(a,b);dir=routePts[b][0]>=routePts[a][0]?1:-1;
  if(t<last+km){u=frac(t,last,last+km);pos=along(pts,u);dist+=u*km;stage="Driving";station=b;break;}
  last+=km;dist+=km;station=b;pos=routePts[b];const stop=b?6:11;
  if(t<last+stop){u=frac(t,last,last+stop);stage=b?"handover":"Warehouse registration";if(b&&u>=.64){picked+=d.take[b];back+=d.returns[b];done.push(b);}break;}
  last+=stop;if(b){picked+=d.take[b];back+=d.returns[b];done.push(b);}else{stage="Registration completed";u=1;}
 }
 return {t,pos,stage,station,u,dir,done,picked,back,clock:stage==="Driving"?"Go to"+(station?"clinic "+station:"district center"):stage,metrics:[["This car has traveled mileage",num(dist,1)],["Samples collected and ready to be sent",num(picked)],["Results returned",num(back)],["The total mileage of this route",String(len)]]};
}
labs.P0008={batch:'world20',title:"Clinic pick-up to district-level delivery and reception center",action:"Choose the visit order for the first car on the first day, or skip the third clinic. Observe the loaded samples, returned results and return mileage.",choices:["Archive six stations","Go to the fourth clinic first","skip third clinic"],views:["Follow the delivery vehicle","Medical service area"],duration:58,
 endAt:(d,k)=>(d.routes[k][1]+6*(d.routes[k][0].length-2)+11)/146,
 chapters(d,k){const [seq,len]=d.routes[k];return [{label:"First stop handover",at:16.1/146},{label:"Mid-term delivery",at:(22+d.dist[1][seq[2]]+6+d.dist[seq[2]][seq[3]])/146},{label:"Return to district center",at:(len+6*(seq.length-2))/146}];},scope:"The partial route of a vehicle on the first day is displayed. The handover volume is taken from the traffic volume in stages 2 and 8 of the original solution. The remaining routes and handling arrangements are fixed. The waiting target for all instance archives is 6,873.25; the trial calculation statistics of this car, the map position and the duration of the action in the station are for reference.",frame:sampleState,
 draw(cv,s,d,k,f,v){scene(cv,'sample',clinicDistrict,s.pos,v,600,g=>{
  routePts.slice(1).forEach(([x,y],i)=>{const visited=s.done.includes(i+1);if(!visited)crate(g,x+23,y-16,17,'#54908b');if(k===2&&i===2)g.sign("To be collected next time",x,y+28,'#a46146');});
  car(g,s.pos[0],s.pos[1],s.dir,'#478c82');
  if(s.stage==="handover"){const [x,y]=s.pos;const pt=lerp([x+31,y-26],[x+13,y-2],s.u<=.64?s.u/.64:(1-s.u)/.36);person(g,...pt,s.u*18,'#e0b465',s.u<.64);g.sign("hand back "+d.returns[s.station]+"　charge "+d.take[s.station],x,y+35);}
  if(!s.station&&s.stage!=="Driving"){const [x,y]=s.pos;const p=lerp([x,y],[x+42,y-39],s.u);person(g,...p,s.u*25,'#8d7059',true);g.sign("Register "+s.picked+" portion",x,y+37);}
 });}};
function depot(g){
 g.box(0,0,W,H,'#cdd6b6');g.poly([[0,450],[380,399],[601,450],[540,610],[0,610]],'#aabf98');for(let i=0;i<25;i++){g.line([[i*21-80,610],[i*20+50,441]],'#c7c99b',4);}
 road(g,[[-50,350],[272,353],[541,330],[721,362],[900,298],[1250,331]],38);
 building(g,103,318,224,113,"Purchasing bagging workshop",'#d2b489','#b29a75');for(let i=0;i<3;i++){let x=84+i*42;g.box(x,156,31,71,'#b3b6ab');g.poly([[x-2,156],[x+15,143],[x+33,156]],'#8c9d93');}
 building(g,708,285,138,81,"community distribution warehouse",'#c5b79a');building(g,934,269,167,91,"Resident collection point",'#adc0ae');for(let i=0;i<9;i++)tree(g,395+i*86,142+(i%3)*16,.96);
 g.box(120,388,248,10,'#866f50');for(let i=0;i<4;i++){g.box(125+i*75,398,5,22,'#847967');}
 g.box(217,380,56,7,'#536d68');g.box(227,372,36,8,'#aac4ac');
 g.box(929,322,138,9,'#957957');g.box(945,331,6,17,'#947f65');g.box(1055,331,6,17,'#947f65');
 building(g,1100,451,113,70,"community settlement",'#c8b8aa');g.line([[966,321],[1041,344],[1100,371],[1170,420]],'#e7d8bc',16);}
const foodTruck=[[302,353],[541,330],[721,362],[902,298],[963,311]];
function foodFrame(d,k,f){const [grams,nut]=d.plans[k],stage=f<.23?"Weighing ingredients":f<.58?"Directly to the community":f<.78?"Distributing food baskets":"Family use";
 const truck=along(foodTruck,frac(f,.22,.64)),home=along([[965,315],[1013,339],[1095,372],[1170,420]],frac(f,.72,.98));
 const focus=f<.22?[220,341]:f<.65?truck:home;
 return {grams,nut,stage,truck,home,focus,clock:stage,metrics:[["cooking oil per basket",num(grams[5],3)+' g'],["daily energy",num(nut[0],2)+' kcal'],["Fat gap per person",num(Math.max(0,d.need[2]-nut[2]),3)+' g'],["The group delivers cooking oil",num(grams[5]*d.people*d.days/1e6*frac(f,.58,.70),3)+' t']]};}
labs.P0024={batch:'world20',title:"Food aid goes from the ingredients table to the hands of residents",action:"Choose to bag according to the archived recipe, or halve the cooking oil per person per day, and follow this batch to the community to check the nutritional supply.",choices:["Bagging by Archived Recipes","Cooking oil halved"],views:["Follow this batch of grain and oil","Supply panorama"],chapters:checkpoints([["Weigh cooking oil",.10],["Grain and oil shipped to communities",.39],["For residents",.76]]),duration:38,
 scope:"Showing direct shipping traffic for the first rate group in the 28-day plan, reaching 3,904 people. After changing the formula, the calculation will be based on the same number of people and days, and the nutrition will be calculated based on the original food coefficient. The screen uses one truck and one household to represent this batch of goods; the local trial does not re-optimize other recipes or routes.",frame:foodFrame,
 draw(cv,s,d,k,f,v){scene(cv,'food',depot,s.focus,v,590,g=>{
  const oil=k?2:4;
  const trolley=along([[210,383],[250,388],[283,378],[307,351]],frac(f,.075,.22));
  if(f<.22){
   const [x,y]=trolley;g.box(x-9,y,41,4,'#597468');g.dot(x-3,y+5,3,ink);g.dot(x+24,y+5,3,ink);
   for(let i=0;i<oil;i++){const xx=x-8+(i%3)*13,yy=y-Math.floor(i/3)*16;g.box(xx,yy-15,11,15,'#d9a933');g.box(xx+3,yy-19,6,5,'#68834f');}
   person(g,x-19,y+4,frac(f,.075,.22)*24,'#6b8a74');}
  for(let j=0;j<3;j++)crate(g,133+j*25,374,21);
  car(g,...s.truck,1,'#b28a52');if(f>.60){for(let j=0;j<oil;j++){const p=lerp(s.truck,[925+j*17,316],frac(f,.60+j*.011,.68+j*.011));crate(g,p[0],p[1]-5,14,'#cf9c33');}}
  if(f>=.22)person(g,269,383,0,'#6b8a74');
  for(let j=0;j<2;j++)person(g,1008+j*22,336+j*5,0,fabric[j+3]);
  if(f>.64){person(g,...s.home,f*45,'#906e96',f>.73);if(f>.84)g.sign(k?"fat gap "+num(d.need[2]-s.nut[2],2)+' g':"Meet three nutritional requirements",s.home[0]-15,s.home[1]-51,k?red:dark);}
 });}};
function hospital(g){
 g.box(0,0,W,H,'#c9d9d2');g.box(0,345,W,265,'#d6c7ac');for(let i=0;i<16;i++)g.line([[i*95,346],[i*104-90,610]],'#c4b89e',1);
 for(let j=0;j<3;j++)g.line([[0,382+j*66],[1240,382+j*66]],'#beb59f',1);
 [[55,181,190,"Clinic entrance"],[337,165,340,"waiting area"],[791,149,230,"Clinic"],[1108,171,108,"Leave hospital"]].forEach(([x,y,w,n])=>{g.box(x,y,w,176,'#a4b9af');g.box(x+9,y+8,w-18,163,'#e6e5d5');g.sign(n,x+w/2,y+34);});
 for(let i=0;i<6;i++){let x=345+i*58;g.box(x,306,44,21,'#799993');g.box(x,328,44,8,'#617e77');g.box(x+6,336,4,12,'#707b72');}
 g.box(179,266,28,69,'#83a199');g.box(183,271,20,20,'#335d5d');g.box(187,300,14,3,'#e3dfc8');
 g.dot(602,230,14,'#769487');g.dot(602,230,12,'#f1ebd8');g.line([[602,220],[602,230],[609,233]],'#647b72',2);
 g.box(952,236,41,66,'#8eaca5');g.box(957,242,31,27,'#4d6e70');g.line([[958,257],[964,257],[970,246],[975,263],[982,254],[986,254]],'#c0d7a9',1.8);
 g.box(825,265,102,14,'#a89372');g.box(832,280,7,52,'#917c60');g.box(902,280,7,52,'#917c60');g.box(865,240,39,24,'#446663');
 g.box(55,236,110,108,'#728e87');g.box(61,243,95,94,'#a9c7c0');g.box(110,242,4,100,'#e6e1c7');
 g.line([[178,390],[710,390],[778,378]],'#b4985c',3,[14,11]);g.line([[1000,381],[1180,380]],'#9ca98b',3);tree(g,720,346,.95);tree(g,1073,339,.8);}
function patient(row,j,t){
 const [id,call,start,end]=row,seat=[364+(j%6)*58,345];
 if(t<call){return {pos:along([[60-(j%3)*14,405],[139,385],[242,369]],frac(t,call-4,call)),col:fabric[j%6],status:"On the way to the clinic"};}
 if(t<start)return {pos:along([[242,369],seat],frac(t,call,Math.min(call+1.1,start))),col:fabric[j%6],status:"Waiting"};
 if(t<end){const pt=along([start>call?seat:[242,369],[743,374],[822,335],[861,304]],frac(t,start,start+Math.min(1.3,(end-start)/3)));return {pos:pt,col:fabric[j%6],status:"Call for medical treatment"};}
 return {pos:along([[861,304],[1010,363],[1122,368],[1220,352]],frac(t,end,end+3.8)),col:fabric[j%6],status:"Leave hospital"};
}
function apptFrame(d,k,f){
 const rr=d.runs[k],t=f*76-3,waiting=rr.filter(([,a,s])=>t>=a&&t<s).length,done=rr.filter(r=>t>=r[3]).length;
 const active=rr.filter(r=>t>=r[1]-4&&t<=r[3]+3.8);
 let focusIndex=rr.findIndex(r=>t<r[3]+2.5);
 if(focusIndex<0)focusIndex=rr.length-1;
 const selected=rr[focusIndex],pf=patient(selected,focusIndex,t);
 return {t,rr,active,selected,pf,clock:"Clinic hours "+num(Math.max(0,t),1),metrics:[["Number of people waiting",String(waiting)],["ended",done+' / 10'],["Total wait occurred",num(rr.reduce((n,[id,a,s])=>n+Math.max(0,Math.min(t,s)-a),0),1)],["longest wait",num(Math.max(...rr.map(([id,a,s])=>Math.max(0,Math.min(t,s)-a))),1)]]};}
labs.P0431={batch:'world20',title:"From outpatient check-in, waiting to calling number",action:"Change appointments for the first few patients and observe who is occupying the office, who is left waiting, and when the backlog subsides.",choices:["Archive seven unit intervals","The first four patients arrive at the same time","The first five digits are spaced two units apart"],views:["Follow the patient","Clinic plan"],duration:48,chapters:checkpoints([["First group sign-in",.04],["The fourth person is waiting or seeing a doctor",.18],["The first group leaves the hospital",.30],["Follow-up consultation",.62]]),
 scope:"Take the top ten reservations from the archived 540 and use the first duration scenario of the original instance. The order of patients and the length of service at that location are fixed. The metric is the actual number of waits and completions during the period, with a target of 0 for the full archive model. On-site walking interpolates between service events.",frame:apptFrame,
 draw(cv,s,d,k,f,v){scene(cv,'clinic',hospital,s.pf.pos,v,590,g=>{
  person(g,918,297,0,'#4c8a83');
  s.active.forEach(row=>{const j=s.rr.indexOf(row),p=patient(row,j,s.t);person(g,...p.pos,p.status==="Waiting"?0:s.t*3+j,p.col);if(row===s.selected)g.sign("No. "+row[0]+' · '+p.status,p.pos[0],p.pos[1]-46);});
 });}};
function terminal(g){
 g.box(0,0,W,H,'#d1e2e2');g.box(0,110,W,183,'#a3b8b1');g.box(0,178,W,66,'#7e918b');g.line([[0,210],[1240,210]],'#f0e8d1',3,[23,18]);g.box(0,262,W,348,'#d2c9b7');
 g.box(15,64,1210,16,'#778f89');for(let i=0;i<11;i++){let x=i*125;g.box(x,77,6,191,'#a0ada1');g.line([[x,78],[x+117,245]],'#c2d1c8',3);}
 g.box(62,255,245,86,'#b9a385');g.box(69,251,229,13,'#627b73');g.sign("Airline reservation counter",181,231);
 g.box(529,274,135,58,'#879c9b');g.sign("Waitlisting and rescheduling",599,251,'#667a78');
 g.box(858,257,92,88,'#a3aca2');g.box(866,268,73,74,'#638783');g.sign("boarding gate A1",902,234);
 for(let i=0;i<4;i++){let x=132+i*49;g.box(x,239,26,13,'#415f5c');g.box(x+2,241,20,4,'#91c0b7');}
 g.poly([[937,278],[993,231],[1024,231],[947,298]],'#a5b5ae');g.line([[942,273],[992,230],[1020,231]],'#e3e5d4',4);
 g.box(1063,111,33,52,'#8a9c98');g.poly([[1054,106],[1105,106],[1096,127],[1062,127]],'#70938f');g.box(1060,107,36,7,'#bfd8d1');
 g.line([[235,361],[445,398],[619,385],[898,340]],'#d7b36b',3,[10,11]);for(let j=0;j<7;j++){g.box(330+j*54,441,38,17,'#798d85');g.box(330+j*54,458,38,5,'#65796e');}
}
function jet(g,x,y){g.poly([[x-105,y],[x-65,y-4],[x-17,y-5],[x+19,y-43],[x+28,y-43],[x+15,y-5],[x+64,y-4],[x+83,y],[x+61,y+5],[x+11,y+5],[x-27,y+34],[x-37,y+34],[x-21,y+5],[x-72,y+4],[x-91,y+14]],'#faf2d9');g.dot(x+57,y-2,6,'#507982',2);g.poly([[x-89,y-1],[x-99,y-23],[x-91,y-23],[x-67,y-2]],'#50857b');}
function ticketPos(seg,pass,taken){
 const origin=pass?[76,383]:[43,352],desk=[210,347],wait=pass?[655,369]:[578,370];
 if(seg<.38)return along([origin,[129,359],desk],seg/.38);
 if(!taken)return along([desk,[320,369],[440,373],wait],frac(seg,.43,1));
 return along([desk,[337,385],[486,390],[650,375],[790,351],[895,330]],frac(seg,.43,1));
}
const jetBridge=[[895,330],[915,307],[946,278],[985,242],[1001,207]];
function booking(d,k,f){const accepted=k===1?0:1,t=2.45*f;const pass=t<1?0:1,seg=cap(t-pass);
 const taxi=210*frac(t,2.29,2.45),board=along(jetBridge,frac(t,2,2.28));
 let point=ticketPos(seg,pass,pass===accepted);
 if(t>=2)point=t<=2.28?board:[1001+taxi,207];
 else if(t>=1&&t<1.10)point=lerp(ticketPos(1,0,accepted===0),point,frac(t,1,1.10));
 else if(t>1.93&&accepted===0)point=lerp(point,jetBridge[0],frac(t,1.93,2));
 const revenue=t>=accepted+.43?d.offers[accepted]:0,clock=t>=2?"Check-in":"Sales period "+(pass+1)+"";
 return {t,pass,seg,accepted,point,revenue,clock,taxi,board,metrics:[["remaining seats",String(revenue?0:1)],["Sold itineraries",revenue?"Product "+d.products[accepted]:"Not sold yet"],["Income from these two orders",num(revenue,3)],["strategy expected income",num(d.expected[k],5)]]};}
labs.P0446={batch:'world20',title:"Which passenger will the last seat be reserved for?",action:"Be the first to quote the low fare. Choose whether to reserve a seat for subsequent passengers and follow the two orders to the change desk or boarding gate.",choices:["Ticket sales based on archive threshold","Tickets sold as soon as first person arrives"],views:["follow order","Terminal panorama"],duration:39,chapters:checkpoints([["First passenger price",.15],["Second booking",.54],["Last seat to board",.83]]),
 scope:"The two phases share one seat. The demonstration constructs the same pair of quotes with 10% and 80% of the upper bound supported by ticket prices for products 4 and 10, conditional on requests for both periods. Passenger movement lines are for reference. The overall strategy expects revenue plus points for all 5,201 products and no-request events.",frame:booking,
 draw(cv,s,d,k,f,v){scene(cv,'air',terminal,s.point,v,610,g=>{jet(g,1005+s.taxi,202);
 for(let j=0;j<2;j++){if(s.t<j)continue;const seg=cap(s.t-j),won=j===s.accepted,p=ticketPos(seg,j,won);
 if(won&&s.t>=2){
  if(s.t<=2.28){person(g,...s.board,(s.t-2)*105,fabric[j+1]);g.sign("travelers "+(j+1)+" · Boarding",s.board[0],s.board[1]-44,dark);}
  else g.sign("travelers "+(j+1)+" Already boarded",990+s.taxi,169,dark);
 }else{person(g,...p,seg*40,fabric[j+1]);g.sign(seg<.43?"Offer "+num(d.offers[j],2):won?"Ticket issued":"No ticket issued",p[0],p[1]-48,won?dark:red);}}
 g.sign(s.revenue?"Seats sold":"Extra seats 1",842,307,s.revenue?'#796850':dark);
 });}};
function station(g){
 g.box(0,0,W,H,'#cbd7b8');g.poly([[0,95],[140,56],[260,101],[400,41],[550,102],[680,73],[800,103],[960,42],[1100,75],[1240,58],[1240,154],[0,154]],'#adbfa4');
 road(g,[[-60,334],[194,324],[350,336],[657,340],[951,297],[1290,252]],65);
 road(g,[[350,337],[423,395],[570,437],[755,434],[884,354],[951,297]],33,'#9b9f91');
 g.poly([[476,388],[704,356],[836,379],[760,431],[567,432]],'#b6b7a3');building(g,484,288,136,73,"Express service area",'#d4b795');
 for(let i=0;i<2;i++){const x=624+97*i;g.box(x-14,337,28,72,'#d9dfc6');g.box(x-9,346,17,15,'#517b73');g.box(x-3,365,7,20,'#568a75');}
 for(let i=0;i<11;i++)tree(g,58+i*111,157+(i%3)*19,.8);for(let i=0;i<7;i++)tree(g,48+i*189,540-(i%2)*33);
 g.sign("fast charging",681,301);g.sign("Return to the main line",920,357,'#576f64');}
function evPos(row,j,t,rr){
 const [a,s,e,bay]=row,entry=[446,404],plug=[619+97*bay,403];
 if(t<a){return along([[82,331],[280,333],[352,337],entry],frac(t,a-.14,a));}
 const queueAt=at=>[551-29*rr.slice(0,j).reduce((n,q)=>n+(q[1]>at?1:1-frac(at,q[1],q[1]+.014)),0),434];
 if(t<s)return lerp(entry,queueAt(t),frac(t,a,a+.035));
 if(t<e){const start=lerp(entry,queueAt(s),frac(s,a,a+.035));return along([start,plug],frac(t,s,s+Math.min(.017,(e-s)*.23)));}
 return along([plug,[805,410],[876,355],[958,297],[1188,263]],frac(t,e,e+.14));
}
function charging(d,k,f){const runs=d.plans[k],end=Math.max(...d.plans.flat().map(x=>x[2]))+.18,t=f*(end+.14)-.14;
 const focusId=t<.39?2:t<.86?8:t<1.13?11:14;const j=runs.findLastIndex(row=>row[0]-.14<=t),ix=cap(focusId,0,Math.max(0,j));const pos=evPos(runs[ix],ix,t,runs);
 return {t,runs,ix,pos,clock:"arrival clock "+num(Math.max(0,t),3),metrics:[["working charging position",String(2-k)],["Queuing vehicles",String(runs.filter(([a,s])=>a<=t&&s>t).length)],["Cumulative queue time of samples",num(runs.reduce((v,[a,s])=>v+Math.max(0,Math.min(t,s)-a),0),4)],["Pile construction and time cost",num(d.localCost[k],4)]]};}
labs.P0493={batch:'world20',title:"Diversion and parallel charging in fast charging service areas",action:"Changed Station 0 from two charging guns to one. Observe the same batch of electric vehicles entering the service area, queuing up for charging and merging back to the main line.",choices:["Archived Dual Guns","Just build one gun"],views:["Follow inbound vehicles","Panorama of service area"],duration:48,chapters:checkpoints([["The first batch to enter",.12],["Multiple vehicles entering the station at the same time",.52],["queue dissipates",.79]]),
 scope:"Station 0 among 10,021 candidate stations is displayed. Use the arrival rate, service rate and the same random seed of the original instance to generate an example of 15 vehicles. The solution cost is calculated based on the original queuing expression, including the site construction fee and time cost. The lengths of buildings and vehicles along the route are for reference only.",frame:charging,
 draw(cv,s,d,k,f,v){scene(cv,'charge',station,s.pos,v,560,g=>{
  const spent=s.runs.filter(row=>row[1]<=s.t&&s.t<row[2]);if(k)g.sign("Not built",721,333,red,12);
  for(const [j,row] of s.runs.entries()){if(s.t<row[0]-.14||s.t>row[2]+.14)continue;const p=evPos(row,j,s.t,s.runs);car(g,...p,1,fabric[j%6],'car');
   if(spent.includes(row))g.line([[624+row[3]*97,374],[p[0]-3,p[1]-8]],dark,3);
   if(j===s.ix)g.sign('EV '+(j+1),p[0],p[1]-40,dark,12);}
 });}};
})();


