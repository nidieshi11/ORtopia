/* Retail and inventory decisions. Periods and customer arrivals drive the state;
   display time between events is used only to interpolate movement. */
(() => {
'use strict';
const labs=window.ORTOPIA_LABS, money=(n,d=2)=>Number(n).toLocaleString('en-US',{maximumFractionDigits:d});
const clamp=v=>Math.max(0,Math.min(1,v)),lerp=(a,b,f)=>a+(b-a)*clamp(f);
function eventAt(f,count){
 const index=Math.min(count-1,Math.floor(f*count));return [index,clamp(f*count-index)];
}
function decision(history,at,fallback){
 let selected=fallback;for(const event of history||[]){if(event.at>at+1e-10)break;selected=event.choice;}return selected;
}
function studio(canvas,sky='#d0e5df',floor='#dddfcc'){
 const c=canvas.getContext('2d');c.setTransform(canvas.width/900,0,0,canvas.height/360,0,0);
 const box=(x,y,w,h,color)=>{c.fillStyle=color;c.fillRect(x,y,w,h);};
 function disk(x,y,r,color){c.beginPath();c.arc(x,y,r,0,2*Math.PI);c.fillStyle=color;c.fill();}
 function path(pts,color,w=2){c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.strokeStyle=color;c.lineWidth=w;c.stroke();}
 function poly(pts,color){c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fillStyle=color;c.fill();}
 function text(s,x,y,size=15,color='#203d3c',align='center'){
  c.fillStyle=color;c.font='600 '+size+'px system-ui,sans-serif';c.textAlign=align;c.fillText(s,x,y);}
 function plate(s,x,y,color='#204944'){c.font='600 15px system-ui';const w=c.measureText(s).width+20;box(x-w/2,y-17,w,24,color);text(s,x,y,15,'#fff');}
 function person(x,y,color,walk=0){const z=Math.sin(walk*14)*3;path([[x-4-z,y],[x,y-9],[x+4+z,y]],'#314849',3);box(x-4,y-18,8,10,color);disk(x,y-22,4,'#ba916c');path([[x,y-15],[x+5,y-12],[x+9,y-15]],color,2);}
 function crate(x,y,color='#bb894f'){box(x,y,18,14,color);box(x+7,y,4,14,'#dfbc86');path([[x,y+14],[x+18,y+14]],'#796046',1);}
 const wash=c.createLinearGradient(0,0,0,250);wash.addColorStop(0,sky);wash.addColorStop(1,'#f3efdc');box(0,0,900,360,wash);box(0,235,900,125,floor);
 return {c,box,disk,path,poly,text,plate,person,crate};
}
labs.P0489={
 title:"The drain valve, water replenishing pump and water inlet of the water tank",action:"Choose whether to empty on the first day and how much water to replenish, and observe the water supply gap and subsequent emptying triggered by water age.",choices:["Archive emptying and rehydration","Keep the old water on the first day and do not replenish it","After emptying on the first day, half a box will be replenished."],
 scope:"Track 12 days by archive policy table. The three first-day decisions share the requirement of fixed seed extraction, and the original strategy will be implemented from the next day. Displays the discounted cost of the path, archiving indefinite targets checked by the original Bellman checker.",
 frame(d,c,f){const rows=d.runs[c],[i,phase]=eventAt(f,rows.length),[old,purge,buy,need,served,end,age,cost]=rows[i],base=purge?0:old,peak=base+buy;
  const volume=phase<.22?lerp(old,base,phase/.22):phase<.54?lerp(base,peak,(phase-.22)/.32):lerp(peak,end,(phase-.54)/.39);
  const total=rows.slice(0,i+(phase>=.94?1:0)).reduce((a,r,j)=>a+r[7]*d.discount**j,0);
  return {i,phase,old,purge,buy,need,served,end,age,volume,clock:"Day "+(i+1)+"",metrics:[["Amount to clear",money(old*purge)],["Purchase water volume",money(buy)],["Today's water supply gap",phase>=.93?money(need-served):"Waiting for water"],["Settled discount charges",money(total)]]};
 },
 draw(canvas,s,d){const {box,disk,path,poly,text,plate}=studio(canvas,'#d4e6e5','#ced8c0');
  poly([[0,193],[140,105],[230,165],[370,108],[500,184],[650,130],[900,188],[900,240],[0,240]],'#b6c9ac');
  const feed=s.phase>=.22&&s.phase<.54&&s.buy>0,drain=s.phase<.22&&s.purge,demand=s.phase>=.54&&s.phase<.93;
  path([[87,184],[136,184],[136,98],[287,98]],'#758e88',15);path([[555,224],[691,224],[691,181],[790,181]],'#718983',15);path([[321,234],[321,274],[184,274]],'#718983',11);
  if(feed)path([[90,184],[136,184],[136,98],[290,98]],'#53aab5',6);
  if(demand)path([[553,224],[691,224],[691,181],[791,181]],'#4c9da9',6);
  if(drain)path([[321,234],[321,274],[184,274]],'#bd8751',5);
  box(282,64,284,178,'#627c78');box(289,70,270,164,'#d8e6df');
  const h=156*s.volume/d.capacity;box(289,234-h,270,h,s.age>=2?'#72a59a':'#68b4bf');
  for(let j=0;j<=4;j++)path([[290,232-j*39],[305,232-j*39]],'#53766e',2);
  disk(91,184,25,'#527e76');const ang=feed?s.phase*35:0;for(let j=0;j<3;j++)path([[91,184],[91+18*Math.cos(ang+j*2.094),184+18*Math.sin(ang+j*2.094)]],'#d4e5cb',5);
  plate("Water volume "+money(s.volume,1),425,159);text("water age "+s.age+" days",425,270);
  text("water replenishing pump",90,230);text("Drain valve",190,306);plate("water demand "+money(s.need),766,137);
  if(demand)for(let j=0;j<3;j++)disk(792,188+((s.phase*175+j*11)%34),3,'#5c9faf');
  text(["Empty or retain","Procurement into the pool","Provide water to users"][s.phase<.22?0:s.phase<.54?1:2],450,329,17);
 }
};
labs.P0466={
 title:"The last period of sale for limited edition products",action:"Switch quotation rules. Customers arrive one after another, and the transaction is completed when the valuation reaches the quoted price; after one item is sold, the next customer faces a new inventory status.",choices:["Archive Feedback Pricing","Fixed quote 1","Add 0.55 to archive price"],live:true,
 scope:"Under the original demand intensity and valuation distribution, take the conditional state of remaining time 0.14 and inventory 8. Extract common customer flows based on instance seeds to display the actual sales revenue of this customer flow. The expected value of the entire archive is calculated as 9,601.6534 based on the original series.",
 frame(d,c,f,h){let left=d.stock,rev=0,k=0,latest=null,now=f*d.duration;
  for(const [j,[time,budget]] of d.arrivals.entries()){
   if(time>now)break;
   const choice=decision(h,time/d.duration,c),price=left===0?null:choice===1?1:d.quotes[j][left]+(choice===2 ? .55 : 0),ok=left>0&&budget>=price;
   if(ok){rev+=price;left--;}k++;latest={time,budget,price,ok};
  }
  return {left,rev,k,latest,now,clock:"Remaining "+money(d.duration-now,4),metrics:[["Customer has arrived",String(k)],["Available inventory",String(left)],["latest transaction",latest?(latest.ok?"deal":"leave"):"wait"],["Actual receipt of this paragraph",money(rev,4)]]};
 },
 draw(canvas,s,d){const {box,disk,path,poly,text,plate,person}=studio(canvas,'#d7e2e4','#dfd9c6');
  box(65,74,490,150,'#547775');box(73,82,474,134,'#eee5c9');text("limited quantity Business product",310,111,19);
  for(let j=0;j<8;j++){const x=100+j*54;box(x,147,39,44,j<s.left?'#b37652':'#c9c6b6');if(j<s.left){box(x+16,147,6,44,'#e6c888');text(j+1,x+20,177,12,'#fff');}}
  box(578,121,230,105,'#a18b71');box(608,91,94,50,'#305a57');text(!s.latest?"To be quoted":s.latest.price===null?"sold out":"Offer "+money(s.latest.price,2),655,123,15,'#fff');
  const visit=s.latest,diff=visit?Math.min(1,(s.now-visit.time)*270):0;
  if(visit){const x=lerp(720,visit.ok?524:847,diff);person(x,252+(visit.ok?10:0)*diff,visit.ok?'#477e69':'#ac7057',diff);if(visit.ok)box(x+7,239,13,11,'#b4754b');plate("Valuation "+money(visit.budget,2),x,202);}
  person(614,198,'#34685f');box(568,195,148,12,'#795c47');box(581,207,13,25,'#90765c');box(694,207,13,25,'#90765c');
  for(let j=0;j<Math.min(4,d.arrivals.length-s.k);j++)person(769+j*26,288+j*6,'#738492',0);
  path([[80,287],[536,287]],'#9aa99b',3);text("sold "+(d.stock-s.left)+' / '+d.stock,306,321,18);
 }
};
labs.P0469={
 title:"Three display positions and customers’ purchasing choices",action:"Change the display mix and let the next customer choose between the new shelf and the out-of-store option. Compare sales revenue with the same customer flow.",choices:["Archive portfolio","Replace an item","Choose three items based on attractiveness"],live:true,
 duration:79,scope:"The original question adversarial target value of the archiving strategy is 0. Live demonstration of typical customer choices. The same set of random preferences is generated using instance seeds for 99 store visits, and the expected single customer revenue is accurately calculated according to the MNL selection probability.",
 frame(d,c,f,h){const [i,phase]=eventAt(f,d.runs[0].picks.length);let revenue=0,sold=0,r,pick;
  for(let j=0;j<=i;j++){r=d.runs[decision(h,j/d.runs[0].picks.length,c)];pick=r.picks[j];if(pick>=0&&(j<i||phase>.76)){sold++;revenue+=d.prices[pick];}}
  return {r,pick,i,phase,clock:"Customer "+(i+1)+' / 99',metrics:[["Current display",r.ids.map(k=>'#'+(k+1)).join('、')],["Expected revenue per customer",money(r.expected,5)],["Number of transactions completed",String(sold)],["Actual collection of passenger flow samples",money(revenue,3)]]};
 },
 draw(canvas,s){const {box,disk,path,text,plate,person}=studio(canvas,'#efe1c9','#dfd9c3');
  box(60,67,560,165,'#718978');box(75,78,530,140,'#f7f0dc');
  for(const [j,k] of s.r.ids.entries()){const x=110+j*160,c=['#b37e56','#6986a1','#ba9562','#b76460','#8d9977','#558d80','#9b83a3','#9aa4ab'][k];
   box(x,111,104,64,'#e6dfc9');for(let n=0;n<3;n++){box(x+n*30+6,128,21,41,c);box(x+n*30+11,120,12,9,c);box(x+n*30+7,142,19,12,'#eee3c9');}plate("Commodity "+(k+1),x+49,201);}
  box(700,110,114,94,'#a89a82');box(713,125,88,79,'#e3dbbe');plate("export",760,139,'#556761');
  const at=s.pick<0?760:160+s.r.ids.indexOf(s.pick)*160,paid=s.phase>.76;
  const x=paid?lerp(at,760,(s.phase-.76)/.24):lerp(641,at,s.phase/.65),y=paid?lerp(241,215,(s.phase-.76)/.24):lerp(270,241,s.phase/.65);
  const shirts=['#7d6c94','#9f704e','#548777','#687f95'];person(x,y,shirts[s.i%4],s.phase);
  if(s.pick>=0&&paid)box(x+7,y-15,11,12,'#c59b64');
  for(let k=1;k<=Math.min(3,98-s.i);k++){const qx=644+k*30-16*s.phase;person(qx,278+k*7,shirts[(s.i+k)%4],s.phase*.2);}
  text(paid?(s.pick<0?"Customer leaves the store":"Take away the goods "+(s.pick+1)):"Customers compare the products on this shelf",362,316,17);
 }
};
labs.P0496={
 title:"Two stores competing for the same order in two phases",action:"Change the initial quotation of store A. The winner of the first phase may be sold out, and the two companies implement the second phase pricing strategy based on transaction history.",choices:["A-mortgage archived quotes","A's first issue is zero","A step up"],
 scope:"The picture shows a branch where both stores have a limited production of one piece; the first phase will be the same price and the winner will be used, and the second phase will be based on the median price of the seller's strategy. Expected profit is additionally weighted for capacity type, draw, and archive continuation hybrid strategies.",
 frame(d,c,f){const r=d.runs[c],[period,phase]=eventAt(f,2),first=r.sample[0],seller=period?1-first:first,px=period?r.sample[1]:(first?d.opponent:r.quote);
  const stocks=[1,1];if(period)stocks[first]=0;if(phase>.77&&px<=1)stocks[seller]=0;
  return {r,first,period,phase,seller,px,stocks,clock:"Sales period "+(period+1)+"",metrics:[["A first-phase quotation",money(r.quote,5)],["First win rate",money(r.first[0]*100)+'%'],["Expected profit for two periods",money(r.profit[0],5)],["B’s expected profit for two periods",money(r.profit[1],5)]]};
 },
 draw(canvas,s,d){const {box,disk,path,poly,text,plate,person,crate}=studio(canvas,'#e7dfcf','#d6d6bc');
  ["A","B"].forEach((name,j)=>{const x=j?572:94,col=j?'#a06556':'#4b7c78';box(x,114,230,111,'#d0bda0');
   poly([[x-9,117],[x+24,78],[x+214,78],[x+240,117]],col);box(x+24,136,181,57,'#879c8d');
   if(s.stocks[j])crate(x+107,169);else text("sold out",x+116,175,20,'#543e31');plate(name+"shop",x+114,105,col);
   text(s.period===0?"Offer "+money(j?d.opponent:s.r.quote,3):s.first===j?"The first phase has been sold":"Offer "+money(s.px,3),x+114,251);});
  path([[105,267],[786,267]],'#b6b59e',3);
  const store=s.seller?686:208,x=s.phase<=.77?lerp(450,store,(s.phase-.14)/.6):lerp(store,s.seller?819:75,(s.phase-.77)/.23),y=lerp(295,270,s.phase/.68);
  person(x,y,s.period?'#9b714e':'#536389',s.phase);
  if(s.phase>.77&&s.px<=1)crate(x+6,y-14);
  text("buyer "+(s.period+1)+'　'+(s.phase>.77?(s.px<=1?"from"+(s.seller?"B":"A")+"Goods bought in store · Transaction price "+money(s.px,3):"leave the market"):"Compare prices between two stores"),450,323,17);
 }
};
})();
