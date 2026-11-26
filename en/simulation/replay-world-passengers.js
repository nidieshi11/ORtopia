/* Local decision worlds for passenger and mixed rail operations. Coordinates are
   illustrative; the timeline and operating quantities come from medium/I001. */
(() => {
'use strict';
const labs=window.ORTOPIA_LABS;
const clip=(v,lo=0,hi=1)=>Math.min(hi,Math.max(lo,v));
const ratio=(t,a,b)=>clip((t-a)/(b-a||1));
const lerp=(a,b,q)=>a+(b-a)*clip(q);
const fmt=(v,n=1)=>Number(v.toFixed(n)).toString();
const dec=(v,n=2)=>v.toFixed(n);
const mint='#366d66',cream='#fbefd3',ink='#253f43',rust='#af5845',gold='#e9aa5e',sea='#75a8aa';
const jackets=['#d98052','#627bb0','#3c877b','#bf6463','#9b9755'];
function lineAt(t,keys){
 for(let i=1;i<keys.length;i++)if(t<=keys[i][0]){
  const a=keys[i-1],b=keys[i],p=ratio(t,a[0],b[0]);return [lerp(a[1],b[1],p),lerp(a[2],b[2],p)];
 }
 return keys[keys.length-1].slice(1);
}
function drawing(c){
 function rect(x,y,w,h,color){c.fillStyle=color;c.fillRect(x,y,w,h);}
 function poly(pts,color){c.fillStyle=color;c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();}
 function path(pts,color,w=2,dash=[]){c.strokeStyle=color;c.lineWidth=w;c.lineJoin='round';c.lineCap='round';c.setLineDash(dash);c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke();c.setLineDash([]);}
 function disk(x,y,rx,ry,col){c.fillStyle=col;c.beginPath();c.ellipse(x,y,rx,ry,0,0,7);c.fill();}
 function text(str,x,y,size=15,col=ink,align='center'){c.font='650 '+size+'px system-ui,sans-serif';c.fillStyle=col;c.textBaseline='middle';c.textAlign=align;c.fillText(str,x,y);}
 function tag(str,x,y,col=mint){c.font='650 14px system-ui,sans-serif';const w=c.measureText(str).width+18;rect(x-w/2,y-13,w,26,col);text(str,x,y,14,'#fff8e8');}
 return {rect,poly,path,disk,text,tag};
}
function base(g,palette,heights=[57,70,42]){
 const {rect,poly}=g;rect(0,0,1460,560,palette[0]);poly([[0,180],[90,120],[175,154],[311,81],[455,143],[594,104],[727,152],[892,68],[1030,133],[1200,87],[1460,154],[1460,234],[0,234]],palette[1]);rect(0,190,1460,370,palette[2]);
 for(let j=0;j<27;j++){const x=49*j-13,h=heights[j%heights.length]+j*17%30;rect(x,183-h,36+j%3*11,h,palette[3]);for(let k=0;k<Math.floor(h/14)-1;k++)for(let n=0;n<3;n++)rect(x+4+n*9,188-h+k*12,5,5,palette[0]);}
}
function building(g,x,y,w,h,col,sign='',type=0){
 const {rect,poly,path,text}=g;rect(x,y-h,w,h,col);poly([[x,y-h],[x+12,y-h-10],[x+w+12,y-h-10],[x+w,y-h]],'#d9d6ba');
 poly([[x+w,y-h],[x+w+12,y-h-10],[x+w+12,y-10],[x+w,y]],'#899b8b');
 if(type===2){for(let i=0;i<3;i++){rect(x+7+i*w/3,y-30,w/3-9,30,'#556d69');for(let k=0;k<4;k++)rect(x+8+i*w/3,y-27+k*6,w/3-11,2,'#93aaa0');}}
 else {for(let row=0;row<Math.floor((h-18)/20);row++)for(let k=0;k<Math.floor(w/19);k++){rect(x+5+k*19,y-h+6+row*19,11,12,'#709293');rect(x+6+k*19,y-h+7+row*19,3,10,'#b4cab9');}rect(x+w*.47,y-22,15,22,ink);}
 if(type===1){poly([[x-4,y-39],[x+w+2,y-39],[x+w+5,y-29],[x-6,y-29]],rust);for(let j=0;j<w/15;j++)rect(x+j*15,y-39,5,10,'#edc591');}
 if(sign){rect(x+3,y-h-1,w-6,18,'#41635c');text(sign,x+w/2,y-h+8,12,cream);}
}
function trees(g,x,y,n,gap=35){for(let j=0;j<n;j++){const a=x+j*gap,h=24+j%3*4;g.rect(a-1.5,y-h,3,h,'#776f58');g.disk(a,y-h,10,13,'#668b68');g.disk(a-4,y-h-4,6,8,'#92ac76');}}
function road(g,pts,w=40){g.path(pts,'#c0bba0',w+14);g.path(pts,'#eadfc2',w+9);g.path(pts,'#788582',w);g.path(pts,'#d6cda8',2,[12,15]);}
function track(g,y,x1=0,x2=1460){g.rect(x1,y-7,x2-x1,17,'#968f79');for(let x=x1;x<x2;x+=13)g.rect(x,y-7,3,17,'#746e61');g.rect(x1,y-4,x2-x1,2,'#d0d3bf');g.rect(x1,y+5,x2-x1,2,'#d0d3bf');}
function platform(g,x,y,w,name){
 g.rect(x,y,w,12,'#9d9f8a');g.rect(x,y,w,3,'#dcb66e');
 for(let j=7;j<w;j+=48){g.rect(x+j,y-38,4,38,'#687c72');}
 g.poly([[x-7,y-37],[x+6,y-49],[x+w+6,y-49],[x+w-1,y-37]],'#6a9080');
 if(name)g.tag(name,x+w/2,y-56,'#41665b');
}
function bus(g,x,y,col,id,open=false){
 g.disk(x,y+1,38,4,'#45595965');g.rect(x-37,y-30,74,25,col);g.rect(x-32,y-32,62,3,'#e9dfc3');
 for(let j=0;j<5;j++)g.rect(x-33+j*13,y-26,10,9,'#bfd9ce');
 g.rect(x+23,y-14,10,10,open?'#383f38':'#476761');g.rect(x-35,y-11,45,2,'#e7d6a8');
 for(const a of [-23,22]){g.disk(x+a,y-4,6,6,ink);g.disk(x+a,y-4,2,2,'#aab6a8');}g.text(id,x-5,y-11,10,'#fff');
}
function rail(g,x,y,col,id,cars=2){
 for(let j=0;j<cars;j++){const v=x-j*68;g.poly([[v-60,y-28],[v-52,y-35],[v-3,y-35],[v+8,y-23],[v+8,y-5],[v-60,y-5]],col);
 for(let k=0;k<4;k++)g.rect(v-51+k*13,y-28,9,9,'#cce1d7');g.rect(v-56,y-9,60,3,'#e6c985');g.disk(v-45,y-4,4.5,4.5,ink);g.disk(v-4,y-4,4.5,4.5,ink);}
 g.text(id,x-23,y-13,9,'#fff');
}
function person(g,x,y,idx=0,walk=0,bag=false){
 const shirt=jackets[idx%jackets.length],z=Math.sin(walk)*2;g.disk(x+1,y+1,5,1.5,'#66766868');g.path([[x-2-z,y],[x,y-6],[x+2+z,y]],ink,1.9);
 g.rect(x-2.8,y-13,5.6,8,shirt);g.disk(x,y-15.8,2.6,3,'#bb8d6e');g.disk(x-.3,y-17.4,2.7,1.4,'#514e47');if(bag)g.rect(x+3,y-8,5,5,gold);
}
function group(g,x,y,n,p){for(let j=0;j<n;j++)person(g,x+(j%6)*8,y+Math.floor(j/6)*5,j,p*20+j);}
const backdrops=new Map();
function viewport(canvas,decor,s,view,focus,span=505){
 const c=canvas.getContext('2d'),w=canvas.width,h=canvas.height;let bg=backdrops.get(decor);
 if(!bg){bg=document.createElement('canvas');bg.width=2880;bg.height=1080;const ctx=bg.getContext('2d');ctx.scale(2,2);decor(drawing(ctx));backdrops.set(decor,bg);}
 const scale=view?Math.min(w/1440,h/540):(w/h<1.35?Math.max(h/356,w/(span*.7)):Math.max(h/(span*.55),w/(span*1.26)));
 const ox=view?(w-1440*scale)/2:-clip(focus[0]-w/scale*.5,0,Math.max(0,1440-w/scale))*scale;
 const oy=view?(h-540*scale)/2:-clip(focus[1]-h/scale*.53,0,Math.max(0,540-h/scale))*scale;
 c.setTransform(1,0,0,1,0,0);c.fillStyle='#e0e6d9';c.fillRect(0,0,w,h);c.setTransform(scale,0,0,scale,ox,oy);c.drawImage(bg,0,0,1440,540);return drawing(c);
}
function clock(v){const m=Math.floor(v);return String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0');}
const marks=(arr)=>arr.map(([at,label])=>({at,label}));
function hall(g){
 base(g,['#d9e9de','#bacdb9','#c8d5ac','#a7bcb2']);
 building(g,40,201,103,68,'#b8b79f',"Xicheng entrance",1);building(g,406,190,124,65,'#bead92',"Qiaoxia Shopping Mall",1);
 building(g,1245,206,146,100,'#b5bcac',"Binjiang Office Building");trees(g,170,217,5);trees(g,1000,222,6);
 g.rect(0,390,1440,150,'#bbd1b2');g.poly([[600,540],[710,360],[801,290],[856,230],[821,540]],'#7eb3ad');
 road(g,[[0,298],[245,301],[496,361],[734,388],[1000,354],[1440,300]],42);
 for(let x=45;x<1440;x+=100){g.rect(x,247,9,55,'#929d91');}
 g.rect(0,242,1440,10,'#b7baad');track(g,238);platform(g,135,231,153,"urban rail");platform(g,677,231,133,"transfer station");platform(g,1212,231,154,"East Railway Station");
 platform(g,135,286,118,"bus exit");platform(g,685,371,108,"connector");
 g.poly([[830,445],[884,430],[924,432],[903,445]],'#537679');g.rect(869,422,29,12,'#cfa877');
 for(let j=0;j<4;j++){const x=1110+j*37;g.rect(x,388,21,14,'#af8a5c');g.poly([[x-4,387],[x+9,372],[x+24,387]],j%2?'#d29d5b':'#b16c56');}
 for(let i=0;i<16;i++){const x=677+i*4;g.rect(x,240+i*7,8,7,'#acaa96');}
 g.tag("OD 0 starting point",87,345);g.tag("riverside destination",1343,330);
}
function reroute(d,k,f){
 const t=f;let a,kind;const route=[2,1,0][k],arrival=.91;
 if(route===2){
  a=lineAt(t,[[0,50,304],[.11,172,230],[.4,736,230],[.51,748,240],[.64,730,378],[.87,1238,325],[1,1331,274]]);
  kind=t<.11?"pit stop":t<.4?"Take the rail train":t<.64?"Walk and transfer":t<.87?"Take shuttle bus":"reach destination";
 }else if(route===1){
  a=lineAt(t,[[0,50,304],[.13,175,297],[.34,496,360],[.53,734,385],[.72,1000,353],[arrival,1250,319],[1,1331,274]]);
  kind=t<.13?"Go to bus stop":t<arrival?"Take direct bus":"reach destination";
 }else{
  a=lineAt(t,[[0,50,304],[.14,175,229],[.62,762,229],[.88,1265,229],[1,1331,274]]);kind=t<.14?"Walking towards the rail station":t<.88?"Take a direct train":"reach destination";
 }
 return {t,a,route,kind,clock:"Morning rush hour · "+kind,metrics:[["OD 0 nominal demand",fmt(d.demand,3)],["Recommended path",["direct track","direct bus","Transfer"][route]],["Full instance specified solution cost",dec(d.scores[k])]]};
}
labs.P0077={batch:'world20',title:"Three diversion channels that interrupt the hub",action:"Select the recommended path for morning peak OD 0, following this flow of passengers from the west entrance through the disturbed hub.",choices:["press archive transfer","Take direct bus instead","Change to direct rail"],views:["Follow this group of passengers","hub panorama"],duration:42,
 chapters:()=>marks([[0,"west entrance"],[.34,"Observe the first journey"],[.58,"middle section of hub"],[.87,"Arrive at Binjiang"]]),
 scope:"The morning peak OD 0 is displayed from 1,000 pairs of origin and destination points in three time periods. Under the same nominal demand and shared uncertainty ball, only the path share of the group is changed, and the cost of the specified solution is recalculated according to the original formula with the zero non-negative dual block and the corresponding norm. Station names, buildings along the route, travel time and number of figures are used to illustrate the three routes.",
 frame:reroute,draw(canvas,s,d,k,f,v){const g=viewport(canvas,hall,s,v,s.a);const [x,y]=s.a;
 if(/train|rail ride/i.test(s.kind))rail(g,x,y+7,mint,"M · Morning shift");
 else if(/(?:shuttle|direct) bus/i.test(s.kind))bus(g,x,y+2,rust,s.route===2?"connect":"direct");
 else group(g,x-9,y,6,s.t);
 if(s.route===2&&s.t>=.4&&s.t<.64){rail(g,736+ratio(s.t,.4,.64)*730,237,mint,'M');bus(g,734,386,rust,"connect",true);}
 if(s.kind==="reach destination"){if(s.route===0)rail(g,lerp(1265,1538,ratio(s.t,.88,1)),237,mint,'M');else bus(g,lerp(1250,1510,ratio(s.t,s.route===2?.87:.91,1)),323,rust,"Continue");}
 g.tag(s.kind,x,Math.max(90,y-72));
 }};
function yard(g){
 base(g,['#ede4ce','#c9c3a3','#c6ccad','#b5b8a2'],[43,49,69]);
 building(g,31,202,116,66,'#c7b49a',"First stop on the west line",1);building(g,336,216,145,70,'#bbbaa0',"T224 end point");
 building(g,596,175,180,82,'#c0ae91',"CS1 charging garage",2);building(g,1024,198,152,61,'#b5b69f',"T063 departure station");building(g,1287,192,108,67,'#c8bba3',"Chengdong Terminal");
 road(g,[[0,285],[316,271],[414,276],[501,337],[627,345],[752,327],[866,273],[1045,275],[1187,311],[1440,293]],40);
 road(g,[[525,338],[542,235],[619,216],[762,215],[823,253],[860,276]],27);
 for(let j=0;j<4;j++){const x=568+j*49;g.rect(x,199,20,22,'#537f70');g.rect(x+4,202,12,6,'#dbe9b7');g.path([[x+16,210],[x+24,210],[x+26,225],[x+21,229]],'#354f4b',2);g.text('⚡',x+10,215,10,cream);}
 platform(g,58,264,78,"Western Front");platform(g,356,255,81,"Drop-off area");platform(g,994,255,107,"Departure from East Line");trees(g,17,401,33,39);
 for(let j=0;j<4;j++){const x=582+j*42;g.poly([[x,147],[x+31,147],[x+43,137],[x+12,137]],'#587d87');g.path([[x+14,145],[x+23,138]],'#a4c5bc',1);}
 g.tag("Slow charging berth",689,251,'#6d7558');g.rect(925,251,5,40,'#535d50');g.rect(928,252,17,13,'#e8c47b');
 g.poly([[738,452],[804,373],[930,353],[1045,365],[1125,440],[1440,460],[1440,540],[0,540]],'#a5bbb0');
 g.rect(1152,340,30,16,'#546d64');g.text("Eastern Front",1167,348,11,cream);
}
function chargeFrame(d,k,f){
 const times=d.times,e=d.energy,share=[1,0,.5][k],t=lerp(times[0],times[7],f);
 const charged=e[3]*Math.min(share,ratio(t,times[3],times[4]));
 const projected=e[0]-e[1]-e[2]+e[3]*share-e[4]-e[5];
 const rejected=t>=times[6]&&projected<d.minimum;
 let battery=e[0]-e[1]*ratio(t,times[0],times[1])-e[2]*ratio(t,times[2],times[3])+charged-e[4]*ratio(t,times[5],times[6])-(!rejected?e[5]*ratio(t,times[6],times[7]):0);
 const coord=lineAt(t,[[times[0],89,283],[807,225,276],[times[1],408,276],[times[2],408,276],[833,540,233],[times[3],626,216],[times[5],626,216],[880,842,266],[times[6],1041,272],[896,1187,311],[times[7],1355,300]]);
 const active=t>=times[3]&&t<lerp(times[3],times[4],share);
 const a=rejected?[1041,272]:coord;
 const stage=t<times[1]?"T224 carrying passengers":t<times[3]?"Driving into the charging station":t<times[5]?active?"charging station":share?"Charging ends":"Docked and not charging":t<times[6]?"Go to starting position T063":rejected?"Insufficient reserves · Dispatch suspended":"T063 carrying passengers";
 return {t,a,active,rejected,battery,charged,projected,stage,clock:clock(t)+' · '+stage,metrics:[["Recharged",dec(charged)+' kWh'],["Vehicle power",dec(battery)+' kWh'],["T063 Estimated power at station",dec(projected)+' kWh'],["minimum reserve",fmt(d.minimum)+' kWh']]};
}
labs.P0124={batch:'world20',title:"Charging connection from the end of the west line to the starting point of the east line",action:"In CS1, change the replenishing power of T224 after the shift to see if the same K7M can complete T063 with the specified reserve.",choices:["Replenish power according to archive","Skip this recharge","Only make up for half"],views:["Follow this electric bus","Panorama of garage and lines"],duration:49,chapters:d=>marks([[0,"Departure T224"],[ratio(d.times[2],d.times[0],d.times[7]),"Go through the library gate"],[ratio(d.times[3],d.times[0],d.times[7]),"Plug in the gun to charge"],[ratio(d.times[6],d.times[0],d.times[7]),"Review T063 departure"]]),
 scope:"Reproduce T224→CS1→T063 in 237 archived shifts. Driving power consumption, departure time, charging power, and minimum reserve of 40 kWh use K7M instance data. The alternative plan is to retain the original parking period and empty driving schedule. If the next train is expected to be lower than the reserve, the vehicle will be reserved on site according to the departure review rules. The remaining shifts follow the filing schedule.",frame:chargeFrame,
 draw(canvas,s,d,k,f,v){const g=viewport(canvas,yard,s,v,s.a,510);const [x,y]=s.a;bus(g,x,y,mint,'K7M',s.active||s.rejected);
 if(s.active){g.path([[618,214],[614,225],[625,233],[x+7,y-8]],gold,3);g.tag("Access CS1 · "+dec(s.charged,1)+' kWh',627,153);}
 else g.tag(s.stage,x,Math.max(72,y-68),s.rejected?rust:mint);
 if(s.t>826&&s.t<834){const a=lineAt(s.t,[[826,405,272],[834,366,225]]);group(g,...a,4,s.t);}
 if(s.t>870){const count=s.rejected?7:s.t<885?6:Math.max(0,6-Math.floor((s.t-885)*2));group(g,999,260,count,s.t*.24);}
 if(!s.rejected&&s.t>904){const a=lineAt(s.t,[[904,1343,303],[908,1376,257]]);person(g,...a,1,s.t,true);}
 g.rect(x-28,y+8,56,5,'#798c7d');g.rect(x-28,y+8,56*clip(s.battery/200),5,s.battery<45?gold:mint);
 }};
const railPos=idx=>92+(idx-17)*299;
function metro(g){
 base(g,['#d7e0e5','#b8c5bd','#ced1bd','#a7b3ad'],[87,54,105,60]);
 road(g,[[0,372],[1440,372]],44);trees(g,40,426,35,40);building(g,334,212,103,79,'#c3b9a8',"city archives");building(g,667,207,96,95,'#aab9ab',"Residences along the river");
 building(g,946,210,121,84,'#b6b99c',"Return control room",2);building(g,1240,209,130,82,'#b6af99',"Eastern District Hospital");
 for(let x=56;x<1440;x+=108){g.rect(x,290,13,67,'#939e95');g.poly([[x-15,290],[x+26,290],[x+12,308],[x+2,308]],'#969e93');}
 for(let x=43;x<1440;x+=137){g.rect(x,164,3,96,'#7c8a80');g.path([[x-8,175],[x+20,175],[x+5,187]],'#7f8e83',2);}
 g.path([[0,178],[1440,178]],'#849085',1);
 g.rect(0,285,1440,10,'#a6ae9e');track(g,266);track(g,288);
 g.path([[963,264],[1020,257],[1080,230],[1175,230]],'#a7a68f',10);g.path([[963,264],[1020,257],[1080,230],[1175,230]],'#737e77',3);
 for(let j=17;j<=21;j++){const x=railPos(j);platform(g,x-70,257,127,'S'+j+(j===20?" · Return station":''));g.path([[x-54,294],[x-32,344],[x+5,345]],'#b6ad93',10);}
}
function railFrame(d,k,f){
 const times=(r,i)=>d.trains.find(e=>e[0]===r&&e[1]===i)[2];
 const direct=times(18,20),next=times(19,20),first=times(18,17),end=times(19,21);
 const t=lerp(first-d.dwell,end+27,f);
 function trainX(r){
  const keys=[];for(let i=17;i<=21;i++){const dep=times(r,i);keys.push([dep-d.dwell,railPos(i),0],[dep,railPos(i),0]);}
  return lineAt(t,keys)[0];
 }
 const x18=trainX(18),x19=trainX(19),at=railPos(20);
 const off=t>=direct-d.dwell&&t<next&&k===0,spent=k?0:clip(t-direct,0,next-direct);
 const phase=t<direct-d.dwell?"Go to S20":k?"Continue with the original vehicle":t<next-d.dwell?"Get off the bus and wait for the entire journey":t<next?"Open the door when changing vehicles":"Continue with the entire journey";
 const subject=t<direct-d.dwell||k?[x18,266]:off?[at+lerp(-9,25,ratio(t,direct-d.dwell,direct)),250]:[x19,288];
 return {t,x18,x19,subject,k,off,direct,next,phase,clock:"Operation seconds "+Math.round(t),metrics:[["This batch transfer passenger flow",fmt(k?0:d.transfers,3)+" Visitors"],["Two cars waiting in the starting room",Math.round(spent)+" s"],["Minimum number of connecting trains throughout the day",d.fleet[k]+" Column"],["Vehicle group limit",d.limit+" Column"]]};
}
labs.P0158={batch:'world20',title:"Short-distance passengers are handed over to the next full-distance train at S20",action:"Keep the departure time of each train and decide whether train 18 will turn back at S20 or continue to carry passengers to the end of the line.",choices:["S20 Return by archive","18 times changed to full course"],views:["Follow the flow of changing passengers","Panorama along the route"],duration:48,chapters:()=>marks([[0,"S17 uplink section"],[.49,"18 trips to the return station"],[.6,"Observe the transfer platform"],[.8,"19 pit stops"]]),
 scope:"S17–S21 for Scenario 1, Direction 1. According to the archive distribution, 27.791 passengers made 19 transfers at the short line terminus. The trial calculation retains the passenger flow and the original train schedule, changes the entire journey 18 times, and recalculates the full-day train group matching. Partial passenger flow will not be re-optimized across the entire line; the number of platforms, buildings and carriages are for reference only.",
 frame:railFrame,draw(canvas,s,d,k,f,v){const g=viewport(canvas,metro,s,v,s.subject,558),stop=railPos(20);
 if(!k&&s.t>s.direct){const a=lineAt(s.t,[[s.direct,stop,266],[s.direct+80,stop+58,252],[s.direct+158,stop+105,232]]);rail(g,...a,'#538c80',"18 · Return to warehouse");}
 else rail(g,s.x18,266,mint,'18');
 if(s.t>=d.trains.find(e=>e[0]===19&&e[1]===17)[2]-d.dwell)rail(g,s.x19,288,'#ad7052','19');
 if(s.off){const n=s.t<s.direct?Math.max(1,Math.ceil(ratio(s.t,s.direct-d.dwell,s.direct)*8)):s.t<s.next-d.dwell?8:Math.ceil((1-ratio(s.t,s.next-d.dwell,s.next))*8);
 group(g,stop+1,251,n,s.t*.14);}
 g.tag(s.phase,s.subject[0],s.subject[1]-83,s.off?'#a66c44':mint);
 }};
function cargo(g){
 base(g,['#d7e4e2','#b1c1bb','#c1c5b1','#a5b6b2']);
 for(let k=0;k<3;k++){building(g,20+k*98,220,82,58,'#b7aa8d',k===1?"A port cargo terminal":'',2);}
 building(g,568,226,113,69,'#c0b69b',"B Will give way");building(g,1172,222,160,75,'#b4b39e',"C container yard",2);
 for(const x of [120,1210]){g.rect(x,139,9,111,'#b48c52');g.rect(x-51,136,128,8,'#bc965d');g.path([[x-45,136],[x,110],[x+71,136]],'#927848',3);g.path([[x+48,144],[x+48,206]],'#646d63',2);}
 for(let j=0;j<4;j++)track(g,269+j*31);for(const x of [212,250,288,1230,1268,1306]){g.rect(x,347,32,15,'#92866a');g.rect(x,333,32,13,'#a7634e');}
 platform(g,52,258,105,"A port area");platform(g,620,258,100,"B intermediate station");platform(g,1230,258,100,"C unloading");
 for(const x of [245,747,1311]){g.rect(x,243,4,26,ink);g.rect(x-4,231,12,16,'#535e55');g.disk(x+2,237,3,3,'#91ab67');}
 road(g,[[0,408],[840,419],[1440,409]],25);
 g.poly([[0,457],[340,453],[530,483],[950,474],[1100,450],[1440,447],[1440,540],[0,540]],'#86b4b1');
 for(let j=0;j<3;j++){const x=50+j*519;g.rect(x,453,103,10,'#a59a7d');g.poly([[x+5,483],[x+86,483],[x+104,474],[x-5,474]],'#5d7575');g.rect(x+9,463,24,11,'#eac792');
 for(let k=0;k<3;k++)g.rect(x+37+k*16,467,14,7,k%2?'#927e6d':'#a66252');}
 g.path([[48,358],[124,355],[192,334],[286,302]],'#898975',7);
 g.path([[32,288],[135,288],[200,298],[286,302]],'#898975',7);
}
function consist(g,x,y,col,id,pass=false){
 if(pass){rail(g,x,y,sea,'P');return;}g.poly([[x-45,y-12],[x-45,y-24],[x-24,y-24],[x-19,y-32],[x-7,y-32],[x+6,y-20],[x+8,y-8]],col);
 g.rect(x-19,y-27,10,7,'#d9e4cf');g.text(id,x-19,y-13,9,cream);
 for(let j=0;j<2;j++){const xx=x-121-j*71;
  if(id==='F91'){for(let i=0;i<3;i++){g.rect(xx+i*21,y-19,18,13,'#ab835c');g.rect(xx+i*21+7,y-19,3,13,'#e2c69c');}g.rect(xx-2,y-8,69,3,'#bc7951');}
  else {g.rect(xx,y-22,63,16,j?'#8b9c8c':col);for(let i=0;i<9;i++)g.rect(xx+2+i*7,y-21,1,14,'#4a54432b');}
  g.rect(xx-2,y-6,71,3,ink);for(const a of [6,54])g.disk(xx+a,y-1,4,4,ink);}
}
function freightFrame(d,k,f){
 const t=lerp(-2,33,f);const chosen=k?'F91':'F102',rejected=k?'F102':'F91';
 const admit=d.trips.find(a=>a[1]===chosen),other=d.trips.find(a=>a[1]===rejected);
 const route=(dep)=>lineAt(t,[[dep-1,135,302],[dep,135,302],[dep+d.segments[0],662,302],[dep+d.segments[0]+d.dwell,662,302],[dep+d.segments[0]+d.dwell+d.segments[1],1285,302]]);
 const trains=d.trips.filter(a=>a[0]!==14||a[1]===chosen).map(a=>({id:a[1],color:a[1]==='F91'?rust:a[1]==='F102'?mint:'#818d72',p:route(a[0]),dep:a[0]}));
 const freight=trains.find(a=>a.id===chosen);const passenger=lineAt(t,[[0,135,269],[7,662,269]]);
 const bayY=k?355:287;
 if(t<14)freight.p=lineAt(t,[[0,125,bayY],[12,125,bayY],[14,135,302]]);
 const focus=t<7?passenger:t<=11?lineAt(t,[[7,662,269],[11,125,bayY]]):freight.p;
 const target=d.trips.find(a=>a[1]==='F102')[2];
 return {t,trains,passenger,focus,chosen,rejected,cmp:other,admit,clock:"Run chart "+clock(Math.max(t,0)),
 metrics:[["14 distribution slots",chosen],["The freight rate income of this tank",String(admit[2])],["Full day plan income",String(d.objective-target+admit[2])],["Minimum interval in the same direction",d.headway+" min"]]};
}
labs.P0416={batch:'world20',title:"The departure slot of the port cargo train after the passenger train has passed through",action:"At the 14th minute there are two freight bookings competing for the same dispatch slot. Select a deal and follow the cargo train through the intermediate station into the C field.",choices:["Release by filing F102","Replace F91"],views:["Follow the dispatch site","MTR corridor panorama"],duration:40,chapters:()=>marks([[0,"Fixed bus departure"],[.26,"First freight train access"],[.455,"Allow competitive bookings"],[.67,"Give way to the stop"],[.903,"Arrive at C cargo yard"]]),
 scope:"Read the passenger and freight departures in the first 21 minutes according to the original operation chart. Port handling, shipping lanes and cargo appearance are used to distinguish bookings. Keep the fixed passenger cars and all other accepted freight trains, except exchange F102 and F91 with the same ideal departure time, route and stop duration. The time penalty remains zero, and the full-day income is recalculated based on the freight rates of the exchange-in and exchange-out shipments.",
 frame:freightFrame,draw(canvas,s,d,k,f,v){const g=viewport(canvas,cargo,s,v,s.focus,575);
 if(s.t<=7.5)consist(g,...s.passenger,sea,'P',true);
 for(const a of s.trains){if(s.t<a.dep-1&&a.id!==s.chosen||s.t>a.dep+17.4)continue;consist(g,...a.p,a.color,a.id);}
 consist(g,125,k?287:355,k?mint:rust,s.rejected);
 if(s.t<14){g.tag("Ready to go · "+s.chosen,140,k?400:222);}
 else{g.tag(s.rejected+" stay",137,k?225:395,'#8d6756');}
 const focusTrain=s.trains.find(a=>a.id===s.chosen);
 if(s.t>=14&&s.t<30.4)g.tag(s.chosen+" · Mid-section freight",focusTrain.p[0],245,k?rust:mint);
 if(s.t>29){const a=lineAt(s.t,[[29,1190,302],[30.2,1190,261],[31.3,1254,261],[32.6,1307,344],[33,1307,344]]);
  g.path([[1210,139],[a[0]+7,154],[a[0]+7,a[1]-18]],'#687677',1.4);
  g.rect(a[0]-10,a[1]-18,36,14,k?'#b68b60':mint);g.rect(a[0]+4,a[1]-18,3,14,k?'#e8cfa4':'#86b6a4');}
 }};


function transferYard(g){
 base(g,['#d1e6e6','#b5c7b5','#c9c9ad','#99b4b4'],[45,74,88]);
 road(g,[[0,341],[1440,341]],112);
 for(let j=0;j<4;j++){const x=125+j*385;platform(g,x-76,264,134,["S1 · First Station Square","S2 · Synchronous transfer island","S3 · Passenger Transport Center","S4 · Closing lot"][j]);}
 building(g,210,239,109,63,'#c7a889',"sports park");building(g,575,229,130,71,'#b4b8a1',"Transfer service hall",1);building(g,980,244,168,74,'#c6b998',"Passenger transport center",2);
 trees(g,28,422,38,37);g.rect(0,449,1440,11,'#dcd5bc');g.rect(0,463,1440,6,'#a4b59c');
 for(const x of [125,510,895]){for(let j=0;j<9;j++)g.rect(x+5,277+j*11,15,6,'#e3ddbc');}
 g.rect(459,258,34,4,'#886e52');g.rect(462,261,3,7,ink);g.rect(486,261,3,7,ink);
}
function transferFrame(d,k,f){
 const t=f*3,model= t<.18?0:t<.91?ratio(t,.18,.91):t<1.32?1:t<2.05?1+ratio(t,1.32,2.05):t<2.22?2:2+ratio(t,2.22,3);
 const busX=125+model*385,failed=k&&t>=1.21;
 let focus=t<.18?[lerp(82,125,t/.18),lerp(263,309,t/.18)]:t>2.05?[lerp(895,937,ratio(t,2.05,2.31)),lerp(309,256,ratio(t,2.05,2.31))]:[busX,309];
 if(k&&t>=.91)focus=lineAt(t,[[.91,518,308],[1.05,527,347],[1.21,519,279],[1.53,479,267]]);
 return {t,model,busX,focus,failed,k,clock:"hallway moment "+fmt(model,2),metrics:[["Demand for the second segment of car No. 2",(d.loads[1][1]+k)+' / '+d.capacity+" seat"],["Passenger 1",failed?"Transfer blocked":t>=2.05?"Arrived":t<.18?"Ready to get on the bus":"Follow the car"],["The passenger completed the ride",String(t<.91?0:t<2.05||failed?1:2)+' / 2']]};
}
labs.P0112={batch:'world20',title:"Synchronous transfer island for six micro buses",action:"Decide whether passenger 1 transfers to train No. 2 at the second stop. The original seat allocations of the other 59 passengers remain fixed.",choices:["Continue riding on bus number 1","Request to switch to car No. 2"],views:["Follow passenger 1","Panorama of four stations"],duration:37,endAt:(_d,k)=>k?.66:1,chapters:(_d,k)=>marks([[0,"Get on the bus at first stop"],[.305,"Two cars arrive at the station at the same time"],[.41,"Check the second section seats"],k?[.52,"Fully loaded car leaving S2"]:[.68,"Arriving at the third stop"]]),
 scope:"The original solution is that six cars run 1→2→3→4 simultaneously, and the first two sections of each car are fully loaded with nine seats. The relevant cars No. 1 and 2 were tracked on site. Try to reserve seats for existing passengers and indicate rejection on the platform when requesting additional seats. The transfer and walking movements are slowed down and occur simultaneously in the model. There is no reassignment to other passengers and no calculation of alternative global goals.",frame:transferFrame,
 draw(canvas,s,d,k,f,v){const g=viewport(canvas,transferYard,s,v,s.focus,500);
 const gate=s.t<.18||s.t>.91&&s.t<1.32||s.t>2.05&&s.t<2.22;
 bus(g,s.busX,310,mint,'1',gate);bus(g,s.busX+9,358,rust,'2',gate);
 // Passengers whose destination is station two leave their assigned vehicles when the doors open.
 if(s.t>.91&&s.t<1.67){const q=ratio(s.t,.91,1.52);group(g,lerp(515,554,q),lerp(310,246,q),2,s.t);}
 if(s.t>=2.05){const q=ratio(s.t,2.05,2.57);group(g,lerp(905,952,q),lerp(352,247,q),5,s.t);}
 const [x,y]=s.focus;if(k&&s.t>=.91)person(g,x,y,0,s.t<1.53?s.t*24:0,true);
 else if(s.t<.18||s.t>=2.05)person(g,x,y,0,s.t*16,true);
 if(s.failed){g.tag("Passenger 1 · Waiting at full capacity",x,y-41,rust);if(s.t>1.32&&s.t<2.05)g.tag("Car No. 2 · 9 seats occupied",s.busX+9,397,rust);}
 else g.tag("Passenger 1",x,y-57);
 }};
})();
