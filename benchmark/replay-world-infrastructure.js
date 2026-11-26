/* Five local decision experiments. Model time is advanced in frame(); camera
   travel and the motion between handoffs are interpolated for the replay. */
(() => {
'use strict';
const labs=window.ORTOPIA_LABS, W=1240, H=520;
const ink='#223f41',teal='#247b70',ochre='#c69a4a',rust='#b9694d',water='#80b5b5';
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)), lerp=(a,b,t)=>a+(b-a)*clamp(t);
const frac=(t,a,b)=>clamp((t-a)/(b-a)), smooth=t=>t*t*(3-2*t);
const amount=(v,n=2)=>Number(v.toFixed(n)).toLocaleString('zh-CN',{maximumFractionDigits:n});
function onPath(points,t){
 const legs=points.slice(1).map(([x,y],i)=>Math.hypot(x-points[i][0],y-points[i][1]));
 let dist=clamp(t)*legs.reduce((a,b)=>a+b,0);
 for(let i=0;i<legs.length;i++){
  if(dist<=legs[i]||i===legs.length-1)return [lerp(points[i][0],points[i+1][0],dist/(legs[i]||1)),lerp(points[i][1],points[i+1][1],dist/(legs[i]||1))];
  dist-=legs[i];
 }
}
function focus(stops,t){
 let i=0;while(i<stops.length-2&&t>stops[i+1][0])i++;
 const a=stops[i],b=stops[i+1],p=smooth(frac(t,a[0],b[0]));
 return [lerp(a[1],b[1],p),lerp(a[2],b[2],p),lerp(a[3],b[3],p)];
}
const deck=new Map();
function brush(c){
 const rect=(x,y,w,h,color)=>{c.fillStyle=color;c.fillRect(x,y,w,h);};
 function line(pts,color,width=2,dash=[]){c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.strokeStyle=color;c.lineWidth=width;c.lineJoin='round';c.lineCap='round';c.setLineDash(dash);c.stroke();c.setLineDash([]);}
 function poly(pts,color){c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fillStyle=color;c.fill();}
 function oval(x,y,a,b,col){c.fillStyle=col;c.beginPath();c.ellipse(x,y,a,b,0,0,2*Math.PI);c.fill();}
 function text(t,x,y,n=13,col=ink,align='center'){c.fillStyle=col;c.font='650 '+n+'px system-ui,sans-serif';c.textAlign=align;c.textBaseline='middle';c.fillText(t,x,y);}
 function tag(t,x,y,col=ink){c.font='650 13px system-ui,sans-serif';const w=c.measureText(t).width+14;rect(x-w/2,y-10,w,21,col);text(t,x,y+1,13,'#fff8e5');}
 function block(x,y,w,h,d,wall,roof,side){rect(x,y-h,w,h,wall);poly([[x,y-h],[x+d,y-h-d*.43],[x+w+d,y-h-d*.43],[x+w,y-h]],roof);poly([[x+w,y],[x+w+d,y-d*.43],[x+w+d,y-h-d*.43],[x+w,y-h]],side);}
 function tree(x,y,k=1){oval(x+3,y,12*k,3*k,'#9da793');rect(x-2*k,y-24*k,4*k,24*k,'#847761');oval(x,y-26*k,12*k,16*k,'#6e9078');oval(x-4*k,y-30*k,8*k,12*k,'#88a488');}
 function person(x,y,col,step=0){const q=Math.sin(step)*3;line([[x-3-q,y],[x,y-8],[x+3+q,y]],ink,2.4);rect(x-3,y-15,6,8,col);oval(x,y-18,3.5,3.5,'#be906b');}
 function box(x,y,col,w=21){block(x-w/2,y,w,w*.54,w*.19,col,'#e3c38f','#926f53');for(let j=1;j<5;j++)line([[x-w/2+j*w/5,y-w*.46],[x-w/2+j*w/5,y-1]],'#f5e8be80',.9);}
 function factory(x,y,w,name,col='#9ea79c'){block(x,y,w,59,17,col,'#d1cbb5','#798980');
  for(let j=0;j<3;j++){const a=x+j*w/3;poly([[a,y-59],[a+w/3,y-74],[a+w/3,y-59]],'#a1ada1');rect(a+6,y-43,w/3-11,12,'#769395');}
  rect(x+w*.53,y-27,w*.36,27,'#687d74');for(let j=0;j<4;j++)rect(x+w*.54,y-24+j*6,w*.34,2,'#8b9a88');tag(name,x+w/2,y-88);}
 function rails(pts){line(pts,'#b1a596',15);line(pts,'#ded6bc',11,[3,6]);line(pts,'#617073',7);line(pts,'#bcbdb0',4);}
 return {c,rect,line,poly,oval,text,tag,block,tree,person,box,factory,rails};
}
function paint(canvas,id,site,actors,target,view){
 const c=canvas.getContext('2d'),w=canvas.width,h=canvas.height;if(!w||!h)return;
 if(!deck.has(id)){const bg=document.createElement('canvas');bg.width=W*2;bg.height=H*2;const b=bg.getContext('2d');b.scale(2,2);site(brush(b));deck.set(id,bg);}
 const portrait=w/h<1.32,span=target[2]*(portrait ? .59 : 1),scale=view?Math.min(w/W,h/H):Math.max(w/span,h/(portrait?span:span*.58));
 const cx=view?W/2:clamp(target[0],w/scale/2,W-w/scale/2),cy=view?H/2:clamp(target[1],h/scale/2,H-h/scale/2);
 c.setTransform(1,0,0,1,0,0);c.fillStyle='#dae3d6';c.fillRect(0,0,w,h);
 c.setTransform(scale,0,0,scale,w/2-cx*scale,h/2-cy*scale);c.drawImage(deck.get(id),0,0,W,H);actors(brush(c));
}
const chapters=xs=>()=>xs.map(([label,at])=>({label,at}));
function terrain(g,sky,ground){g.rect(0,0,W,H,sky);g.poly([[0,152],[95,112],[185,130],[300,81],[397,132],[510,73],[600,128],[705,91],[830,130],[995,70],[1132,127],[1240,86],[1240,520],[0,520]],'#a7b8a3');g.rect(0,170,W,350,ground);}
function transfer(s,e,p){return [lerp(s[0],e[0],p),lerp(s[1],e[1],p)];}
const common={batch:'world20',duration:51};
function vessel(g,x,y,name,color,load){
 g.poly([[x-65,y],[x+62,y],[x+40,y+18],[x-52,y+18]],color);g.rect(x-48,y-20,21,20,'#e6ddc6');g.rect(x-46,y-16,16,5,'#708f8f');g.rect(x-40,y-25,5,5,'#967866');
 for(let i=0;i<Math.min(load,32);i++){const j=i%8;g.rect(x-20+j*8,y-6-Math.floor(i/8)*5,7,5,i%3===0?'#bd895e':i%3===1?'#6a9a93':'#a4ad7e');}
 g.text(name,x,y+8,10,'#fff');
}
function portSite(g){
 g.rect(0,0,W,H,'#b4cdbb');g.rect(0,303,W,217,water);
 g.rect(0,0,W,61,'#c6d7cf');
 for(let j=0;j<25;j++){const x=j*54,y=40+6*Math.sin(j*2.4);g.block(x,y+15,29+(j%3)*7,12+(j%4)*6,6,'#a8b9ac','#c4cbba','#98ada1');}
 g.rect(12,67,1214,19,'#9eaca0');g.line([[12,77],[1228,77]],'#d2d2b5',1.7,[12,11]);
 for(let j=0;j<16;j++){const x=14+j*77;g.line([[x,86],[x,67]],'#879788',2);g.line([[x,65],[x+77,65]],'#97a995',1);}
 for(let j=0;j<6;j++)for(let k=0;k<21;k++)g.line([[k*65+j*9,332+j*30],[k*65+j*9+17,331+j*30]],'#afd1c4',2);
 g.rect(0,260,W,45,'#c7c2a8');g.rect(0,300,W,5,'#7b8175');g.line([[0,277],[1240,277]],'#9d9b8a',19);g.line([[0,277],[1240,277]],'#e6dabb',2,[18,13]);
 g.factory(40,189,154,'集装箱进港查验');g.rails([[-25,224],[176,224],[239,206],[371,206]]);
 for(const [x,name,col] of [[355,'一号船专用堆场','#9cae8d'],[556,'共享箱区','#c4ab80'],[747,'二号船专用堆场','#97ad9e']]){
  g.block(x-62,213,123,12,21,col,'#e1d6af','#8a9985');g.line([[x-50,185],[x-50,122],[x+59,122],[x+59,183]],'#71877a',6);g.tag(name,x,102);}
 for(const [x,label] of [[430,'A 泊位岸桥'],[950,'B 泊位岸桥']]){
  g.rect(x-68,251,169,9,'#a1a99a');for(let j=0;j<4;j++){const z=x-59+j*46;g.rect(z,260,5,15,'#7d8a80');g.line([[z,250],[z,240],[z+40,240],[z+40,250]],'#88998a',1.6);}
  g.rect(x-68,271,169,5,'#83948b');g.line([[x-56,276],[x-56,156],[x-23,142],[x+72,142],[x+93,156]],'#c99c57',6);
  g.line([[x-56,225],[x-10,152],[x+71,153]],'#c99c57',4);g.line([[x+49,150],[x+49,259]],'#6a7770',2);g.tag(label,x,124);}
 for(let j=0;j<15;j++){const x=920+(j%5)*41,y=96+Math.floor(j/5)*13;g.box(x,y,j%3===0?'#9aa68a':j%3===1?'#c19b71':'#809e9e',28);}
 for(let j=0;j<12;j++){const x=38+j*100;g.line([[x,290],[x,296],[x+33,296]],'#dfc56a',2);}
 for(let x=33;x<W;x+=94)g.oval(x,303,5,5,'#656e68');
}
function portFrame(d,k,f){
 const slots=(k?[d.blocks[0]-1,d.blocks[1]+1]:d.blocks).map(n=>n*d.blockSize);let share=d.shared*d.blockSize,skipped=0,loaded=0;
 const bins=[0,0,0],ships=[0,0],moves=[],time=f*1.22,all=d.loads[0]+d.loads[1];
 for(let n=0;n<all;n++){
  const boat=n<d.loads[0]?0:1,j=boat?n-d.loads[0]:n;const dedicated=j<slots[boat],ok=dedicated||share>0;
  if(!dedicated&&ok)share--;
  const yard=ok?(dedicated?boat*2:1):-1,pack=.015+n*.36/all,leave=.61+n*.39/all;
  const u=frac(time,pack,pack+.16),v=frac(time,leave,leave+.16);
  if(u>=1&&!ok)skipped++;if(ok&&u>=1&&v===0)bins[yard]++;if(ok&&v>=1){ships[boat]++;loaded++;}
  if((u>0&&u<1)||(ok&&v>0&&v<1))moves.push({n,boat,yard,u,v});
 }
 return {f,time,bins,ships,moves,skipped,loaded,slots,alt:!!k,clock:time<.55?'进港堆存':time<1.15?'岸桥装船':'离泊核对',metrics:[['本情景装船',loaded+' / '+all],['未获堆位',skipped+' 箱'],['专用区容量',slots.join(' / ')+' 箱']]};
}
labs.P0202={...common,title:'双层集装箱港的箱位交接',action:'在两船到港前决定专用区的分配。跟随箱子从进港查验进入专用或共享堆场，再交给岸桥。',choices:['两船各留两块','一号船让一块给二号船'],views:['跟随箱流','港区全景'],chapters:chapters([['进港验箱',.03],['共享箱区接货',.34],['一号岸桥起吊',.58],['二号泊位交付',.83]]),scope:'首个到港情景的两船分别有 29、22 箱待装，每块容量 12。按专用区优先、共享区补足计算箱位；单箱交接顺序、楼层视角与船舶运动是执行示意。指标取本情景堆存和装载量。',frame:portFrame,
 draw(canvas,s,d,k,f,view){const dest=[355,556,747],focal=focus([[0,100,215,470],[.17,325,204,470],[.36,k?182:535,218,460],[.51,k?166:550,217,500],[.67,470,302,465],[.87,906,310,515],[1,1007,347,570]],f);
  paint(canvas,'port',portSite,g=>{
   const xShip=[445,959].map((x,b)=>x+((s.ships[b]===d.loads[b])?65*frac(s.time,1.16,1.22):0));
   xShip.forEach((x,b)=>vessel(g,x,337+b*12,b?'B02':'A01',b?'#65767c':'#486c70',s.ships[b]));
   s.bins.forEach((v,idx)=>{for(let i=0;i<v;i++)g.box(dest[idx]-47+(i%8)*13,210-6*Math.floor(i/8),idx===1?'#c18a57':'#75a394',11);});
   // Show representative tractors; all containers enter the yard/ship counters.
   for(const m of s.moves){if(m.n%5!==0&&m.n!==28)continue;
    const end=m.yard<0?[164,246]:[dest[m.yard],204];const pos=m.v>0?onPath([end,[end[0]+20,266],[xShip[m.boat],265],[xShip[m.boat],315]],m.v):onPath([[78,223],[178,224],end],m.u);
    const [px,py]=pos;
    if(m.v<.76){g.rect(px-9,py+1,19,3,'#5d6c60');g.oval(px-6,py+5,2.3,2.3,ink);g.oval(px+6,py+5,2.3,2.3,ink);}
    else{g.line([[xShip[m.boat],152],[px,py-12]],'#6b7368',1.3);g.rect(px-8,py-12,16,2,'#d1a051');}
    g.box(px,py,m.boat?'#789d96':'#be8755',15);}
   if(s.skipped){for(let i=0;i<s.skipped;i++)g.box(142+i*13,248,rust,12);g.tag('待位 '+s.skipped+' 箱',163,263,rust);}
   g.person(115,234,'#dc9c48',s.time*25);g.tag('已装 '+s.loaded+' 箱',750,409);
  },focal,view);}
};
const minePaths=[
 [[121,228],[253,250],[334,241],[468,238],[586,253],[673,202],[788,173],[970,176],[1084,194]],
 [[121,228],[253,250],[334,241],[468,238],[586,253],[676,314],[809,343],[971,342],[1100,370]]
];
function quarry(g){
 terrain(g,'#d6d6ba','#cab99a');g.poly([[0,106],[86,80],[176,87],[233,116],[289,214],[0,240]],'#a88567');
 for(let j=0;j<5;j++)g.line([[0,118+j*20],[110+j*12,115+j*19],[180+j*10,135+j*15],[200+j*14,162+j*12]],j%2?'#cfb392':'#957456',7);
 g.oval(110,205,80,32,'#b89b79');g.oval(109,209,53,18,'#9b8067');g.tag('一号矿 · 采面',112,85);
 g.factory(287,222,92,'破碎分级站','#ad9a82');g.line([[197,208],[299,178]],'#716f60',10);g.line([[203,202],[296,174]],'#bfae88',3);
 for(const pts of minePaths)g.rails(pts);
 g.line([[550,229],[550,207]],'#767969',3);g.tag('港口分岔',551,190);
 const access=[[-16,361],[113,319],[233,302],[312,284],[415,304],[518,338],[624,342],[688,375],[801,408]];
 g.line(access,'#bfac8d',17);g.line(access,'#dfc8a5',12);
 for(let j=0;j<25;j++){const x=j*51+8,y=408+13*Math.sin(j*3.2);g.poly([[x,y],[x+9,y-4],[x+17,y-2],[x+22,y]],'#b39c7d');}
 g.block(355,177,44,37,8,'#bba688','#d2bc98','#9b8f7d');g.rect(362,151,29,10,'#7a9090');g.line([[352,177],[347,190],[399,189]],'#807565',3);
 for(const x of [375,410,445]){g.oval(x,199,10,4,'#888b7d');g.rect(x-9,171,18,28,'#a6a797');g.oval(x,170,9,4,'#c4c2a8');}
 g.line([[354,159],[386,156],[431,157],[444,171]],'#879485',3);
 g.poly([[904,48],[1240,75],[1240,129],[1092,115],[988,111]],'#82aead');g.poly([[876,423],[1045,393],[1240,411],[1240,520],[876,520]],'#7aaab1');
 for(const [x,y,title] of [[1080,182,'东港 · 块矿料场'],[1099,362,'西港 · 受料口']]){
  for(let j=0;j<3;j++)g.poly([[x-75+j*41,y-8],[x-39+j*38,y-39-j*4],[x+2+j*40,y-8]],j%2?'#897563':'#a0896a');
 g.line([[x+11,y-12],[x+58,y-55],[x+103,y-55]],'#71867e',8);g.line([[x+73,y-55],[x+73,y-8]],'#71867e',5);
 for(let j=0;j<6;j++){const px=x+17+j*7,py=y-20-j*5;g.line([[px,py],[px+1,py-7]],'#91998a',1.5);}
 g.block(x+58,y+9,44,13,7,'#9aa392','#c1c5ac','#7e8b7b');g.tag(title,x,y-82);}
 for(let j=0;j<7;j++){g.tree(501+j*61,133+(j%3)*6,.7);g.tree(179+j*70,371+(j%3)*9,.8);}
}
function oreCar(g,x,y,col,size=1){g.poly([[x-18*size,y-14*size],[x+20*size,y-14*size],[x+14*size,y],[x-13*size,y]],col);g.poly([[x-14*size,y-15*size],[x-3*size,y-20*size],[x+5*size,y-18*size],[x+12*size,y-16*size]],'#765b48');g.oval(x-9*size,y+2*size,3*size,3*size,ink);g.oval(x+10*size,y+2*size,3*size,3*size,ink);}
function mineFrame(d,k,f){
 const T=d.capacity[0].length,now=f*T,idx=Math.min(T-1,Math.floor(now)),p=now-idx;
 const ore=d.ore[0][0][idx],settled=p>=.91,excess=(j)=>k?Math.max(0,d.receipts[1][j]+d.ore[0][0][j]-d.capacity[1][j]):0;
 let backlog=0;for(let j=0;j<idx+(settled?1:0);j++)backlog+=excess(j);
 const terminal=k?1:0,position=onPath(minePaths[terminal],smooth(frac(p,.05,.85)));
 return {idx,p,ore,terminal,position,backlog,settled,clock:'交付期 '+(idx+1)+' / '+T,metrics:[['该批块矿',amount(ore)],['指定接收港',k?'西港':'东港'],['各期累计超容量',amount(backlog)],['本期西港拟入库量',amount(d.receipts[1][idx]+(k?ore:0))]]};
}
labs.P0215={...common,title:'一号矿块矿经过分岔到港',action:'改变原来送往东港的块矿去向，保留两港其余矿山和矿级的收货量。观察分岔和港口受料能力。',choices:['送原定东港','这批块矿转西港'],views:['跟随运矿批次','矿港全景'],chapters:chapters([['首批出矿',.01],['列车到分岔',.08],['首批靠港',.143],['第三批交运',.41],['第六期到港',.97]]),scope:'六期、420 个矿山的原始稀疏发运量按接收港和交付期汇总；镜头跟随一号矿原分给东港的块矿。改港后，新增超容量留在受料口。铁路、采面、批次在期内的运动为示意。',frame:mineFrame,
 draw(canvas,s,d,k,f,view){const [x,y]=s.position,port=minePaths[k?1:0].at(-1);
  let cam=[x,y-12,s.p<.8?500:445];
  if(s.idx>0){
   // After the first delivery the receiver takes over the view. Later batches share
   // the same line, while admitted and held ore remain at their respective gates.
   cam=focus([[1/6,port[0],port[1]-12,445],[.25,1128,port[1]-28,465],[.38,1100,334,560],
      [.50,1084,311,680],[.61,595,245,540],[.69,319,200,445],[.74,565,241,505],
      [.81,port[0],port[1],465],[.92,port[0],port[1]-18,580],[1,1127,port[1]-16,475]],f);
  }
  paint(canvas,'mine',quarry,g=>{
   const phase=s.p,arm=lerp(-8,16,clamp(phase/.17));g.block(120,215,30,17,4,'#c49a55','#dcc17c','#9c7844');
   g.line([[134,199],[158,177],[171+arm,197]],'#d3a44d',6);g.poly([[168+arm,197],[181+arm,195],[175+arm,205]],'#7b7568');
   if(s.p<.91||k){g.rect(x-40,y-16,19,15,'#507f79');g.rect(x-34,y-22,10,9,'#79978a');oreCar(g,x-8,y,'#b08868');oreCar(g,x+24,y,'#9c8066');}
   g.tag(s.settled?(k?'超容 · 批次待收':'块矿已卸入东港'):'第 '+(s.idx+1)+' 批 · '+amount(s.ore),x,y-43,s.settled&&k?rust:ink);
   // The westbound fine-ore consignment is present in both branches.
   const fineT=frac(s.p,.17,.98),fine=d.ore[1][1][s.idx];
   if(fineT>0&&fineT<1){const [a,b]=onPath(minePaths[1],smooth(fineT));oreCar(g,a,b+5,'#768d89',.82);g.tag('粉矿 '+amount(fine),a,b+25,'#5d7d75');}
   if(s.idx>0||s.settled){
    const n=s.idx+Number(s.settled),sx=k?1106:1068,sy=k?362:176;
    for(let j=0;j<n;j++)g.poly([[sx-35+j*10,sy],[sx-26+j*10,sy-6-j],[sx-13+j*10,sy]],k?'#aa795b':'#886c57');
    g.tag(k?'累计待收 '+amount(s.backlog):'东港已收 '+n+' 批',sx,sy+45,k?rust:teal);
    for(const [bx,by] of [[1080,182],[1099,362]]){
     const belt=[[bx+11,by-12],[bx+58,by-55],[bx+101,by-55]];
     for(let j=0;j<4;j++){const [u,v]=onPath(belt,(f*7+j/4)%1);g.oval(u,v-3,3.8,2.5,'#805e43');}
     const operator=transfer([bx+50,by+13],[bx+68,by+13],Math.min(1,s.p*3));
     g.person(...operator,'#9b7a50',s.p<.33?s.p*28:0);
    }
   }
   if(s.settled&&!k)g.person(1091,193,teal,2);
   if(k&&s.p>.8){g.rect(1142,331,4,30,'#775e54');g.line([[1144,338],[1110,338]],rust,5);}
  },cam,view);}
};
const supplyLine=[[78,228],[158,228],[208,248],[281,248],[346,232],[457,231],[561,243],[690,243],[780,255],[927,250],[1071,239],[1172,246]];
const tankLink=[[561,243],[571,195],[669,155]];
function pipes(g,pts){g.line(pts,'#677f79',19);g.line(pts,'#a2b6a7',12);g.line(pts,'#c3cabb',3);}
function waterworks(g){
 terrain(g,'#c8ddda','#c2cbb4');g.poly([[0,159],[104,138],[161,159],[179,198],[124,251],[0,267]],'#78afb6');g.line([[151,158],[169,193],[129,253]],'#b8b39d',9);g.tag('原水库',82,131);
 for(let q=0;q<12;q++)g.line([[10+(q%3)*33,174+q*6],[30+(q%3)*33,174+q*6]],'#a9cacf',1.2);
 g.factory(263,227,118,'加压泵站','#a5b6a6');
 g.rect(588,126,145,46,'#9caa99');g.oval(661,126,72,16,'#c6cfbb');g.oval(661,170,72,14,'#84978a');g.tag('高位调节水池',667,91);
 pipes(g,supplyLine);pipes(g,tankLink);
 g.tag('管道汇流井',556,277);g.tag('居民供水支路',1025,144);
 for(let j=0;j<6;j++){const x=50+j*15;g.line([[x,180],[x+9,205]],'#96a99b',2);}
 for(const x of [412,454]){g.oval(x,219,12,4,'#8b9e90');g.rect(x-11,185,22,33,'#a5b5a4');g.oval(x,185,11,4,'#d7dac3');}
 g.line([[370,194],[402,194],[411,185]],'#8a998c',4);g.line([[422,190],[444,190]],'#93a393',4);
 for(let j=0;j<5;j++)g.line([[598+j*28,130],[598+j*28,166]],'#b6c2a9',1.5);
 g.line([[732,123],[740,132],[740,176]],'#899a86',2);for(let j=0;j<6;j++)g.line([[733,138+j*6],[739,138+j*6]],'#879b86',1.6);
 for(const [x,y] of [[157,228],[557,241],[780,254]]){g.oval(x,y,6,7,'#718f86');g.line([[x-6,y-8],[x+6,y-8]],'#9c835c',2);}
 for(let j=0;j<8;j++){const x=817+j*47;g.block(x,216+(j%2)*7,31,43+(j%3)*9,8,'#cfbca8','#e7d6bd','#aba18d');for(let u=0;u<3;u++)g.rect(x+5+8*u,183+(j%2)*3,5,8,'#698c90');}
 for(let j=0;j<7;j++){const x=470+j*103;g.tree(x,347+(j%2)*12,.8);}
 for(let j=0;j<3;j++)pipes(g,[[915+j*80,250],[915+j*80,219]]);
 g.line([[0,373],[304,377],[470,344],[716,365],[954,342],[1240,347]],'#b0ac94',22);
}
function waterFrame(d,k,f){
 const total=d.water.length,time=f*total*1800;let volume=d.initial,lost=0,delivered=0,idx=0,dt=0,row,pump,fill,service;
 for(let j=0;j<total;j++){
  idx=j;row=d.water[j];dt=clamp(time-j*1800,0,row[5]);const stop=k&&j<2;
  pump=stop?0:row[0];fill=stop?-Math.min(row[4],row[2],volume/row[5]):row[1];service=pump-fill;
  volume+=fill*dt;lost+=Math.max(0,row[2]-service)*dt;delivered+=service*dt;
  if(time<(j+1)*1800)break;
 }
 return {time,idx,p:dt/1800,row,pump,fill,service,volume,lost,clock:'运行 '+amount(time/60,0)+' 分钟',metrics:[['泵流量',amount(pump*1000,1)+' L/s'],['水池体积',amount(volume,1)+' m³'],['累计供水缺口下界',amount(lost,2)+' m³'],['已供水量（流量口径）',amount(delivered,1)+' m³']]};
}
function stream(g,pts,count,t,col){for(let j=0;j<count;j++){const [x,y]=onPath(pts,(j/count+t)%1);g.oval(x,y,4.9,3.1,col);}}
labs.P0208={...common,title:'从水库、泵房到社区供水',action:'选择头两个半小时时段的泵开关。停泵时观察高位水池反向供水，以及联络管达到流量上限后的缺口。',choices:['执行归档开泵计划','前一小时停泵'],views:['跟随供水路径','供水区全景'],chapters:chapters([['泵房出水',.035],['水池联络管',.24],['社区入户端',.43],['水泵恢复',.54],['两小时结算',.98]]),scope:'展示 48 个半小时中的前 4 段。复核归档体积守恒及 110 个分区的总取水；停泵分支按联络管反向流量上限供给，计算缺水下界，后续泵流量固定。此分支未重新求解水头。管道长度和入户场所为示意。',frame:waterFrame,
 draw(canvas,s,d,k,f,view){const aim=focus([[0,k?663:85,k?155:194,440],[.16,k?600:325,212,440],[.27,564,205,460],[.44,1025,232,505],[.56,329,209,450],[.78,662,170,485],[1,1075,239,530]],f);
  paint(canvas,'water',waterworks,g=>{
   const v=s.time/330,from=supplyLine.slice(0,7),to=supplyLine.slice(6);
   if(s.pump)stream(g,from,9,v,'#99dce5');stream(g,to,s.fill<0?4:9,v,'#9ddce8');
   stream(g,s.fill<0?[...tankLink].reverse():tankLink,4,v,'#98d1df');
   g.oval(328,242,14,14,'#48716e');for(let j=0;j<3;j++){const a=j*2.094+(s.pump?s.time/130:0);g.line([[328,242],[328+11*Math.cos(a),242+11*Math.sin(a)]],'#d5d7bb',3);}
   const height=clamp((s.volume-d.initial+180)/470)*36;g.rect(616,163-height,91,height,'#6ab2be');g.tag(amount(s.volume,0)+' m³',659,116);
   g.tag(s.pump?'泵站运行':'泵站停机',322,273,s.pump?teal:rust);
   const quality=s.service/s.row[2];for(let j=0;j<3;j++){const x=920+j*80;g.line([[x,218],[x+11,218],[x+11,225]],'#5a776d',3);g.line([[x+11,225],[x+11,225+14*quality]],'#86c0cb',4*quality);}
   if(quality<.999)g.tag('反送上限 · 供给不足',1004,277,rust);g.person(1103,225,'#b38355',0);
  },aim,view);}
};
const incoming=[[61,156],[165,146],[250,173],[346,174],[467,184],[571,196],[649,201]];
const cellLine=[[649,201],[688,230],[756,248],[831,241],[873,230]];
function tower(g,x,y,h){
 g.line([[x-18,y],[x,y-h],[x+18,y],[x-10,y-h*.4],[x+10,y-h*.4],[x-14,y-h*.19]],'#647b77',3);
 g.line([[x-27,y-h*.82],[x+27,y-h*.82]],'#586a65',4);g.line([[x-21,y-h*.64],[x+21,y-h*.64]],'#586a65',3);
}
function energySite(g){
 terrain(g,'#c5d9d9','#bdc9b3');g.poly([[242,117],[277,135],[268,202],[214,313],[155,520],[96,520],[152,301],[211,194]],'#7caeaf');
 for(const [x,y,h] of [[60,217,72],[164,204,68],[345,232,70],[465,243,73]])tower(g,x,y,h);
 g.line(incoming,'#637672',2);g.line(incoming.map(([x,y])=>[x,y+5]),'#637672',1.5);
 g.factory(413,357,142,'本地火电厂','#a3a799');g.rect(437,231,14,55,'#ac988b');g.rect(465,219,13,69,'#a6958b');
 g.line([[489,280],[524,226],[571,196]],'#677f78',4);
 g.block(579,227,93,41,15,'#b3bba8','#d6d3b9','#859384');
 for(let j=0;j<4;j++){g.rect(592+j*18,169,8,28,'#858f87');for(let i=0;i<4;i++)g.rect(590+j*18,172+5*i,12,2,'#b2b9a5');}
 g.tag('B0007 母线',626,141);
 g.line(cellLine,'#658582',7);g.line(cellLine,'#a9b6a2',3);
 for(let j=0;j<3;j++){g.block(830+68*j,241,57,49,13,'#819b94','#d1d8bb','#607e76');for(let q=0;q<6;q++)g.line([[835+j*68+q*8,200],[835+j*68+q*8,232]],'#a8bbab',2);g.rect(846+j*68,205,16,13,'#567672');}
 g.tag('P0001 储能站',927,161);g.rect(780,248,24,14,'#8c9e8d');g.line([[783,254],[801,254]],'#d7c674',3);
 g.tag('区域电网联络线',138,104);
 g.rect(571,251,146,6,'#a0af9d');for(let j=0;j<13;j++){const x=572+j*12;g.line([[x,249],[x,232]],'#8da08e',1.2);}g.line([[572,235],[717,235]],'#94a38d',1.2);
 for(let j=0;j<5;j++){const x=853+j*38;g.rect(x,266,15,4,'#c9b75e');}
 for(let j=0;j<3;j++){const x=404+j*39;g.block(x,357,23,14,5,'#9caa99','#b6c0ac','#869987');}
 for(let j=0;j<7;j++){const x=980+j*34,y=338-(j%3)*5;g.block(x,y,24,38+j%3*10,8,'#bcc1a9','#d9d8bf','#9fa98f');for(let k=0;k<3;k++)g.rect(x+4+k*6,y-29,3,7,'#809a92');}
 g.tag('调度计量室',737,300);g.block(688,370,90,42,16,'#bcbcaa','#d2d1bb','#919d8f');g.rect(701,338,49,15,'#718f90');
 for(let j=0;j<8;j++)g.tree(64+j*100,410+(j%2)*8,.83);
}
function powerFrame(d,k,f){
 const n=d.dispatch.length,t=f*n,i=Math.min(n-1,Math.floor(t)),p=t-i;
 const [pc,pd,base,thermal,net,demand,ls,gs]=d.dispatch[i],actual=k&&i===3?0:pd;
 const initial=i?d.dispatch[i-1][2]:d.initial,soc=initial+p*(pc*d.eff[0]-actual/d.eff[1]);
 const residual=Math.abs(thermal+net+actual-pc+ls-gs-demand);
 return {i,p,t,pc,actual,needed:pd,net,soc,residual,clock:'第 '+(i+1)+' 小时 · '+Math.round(60*p)+' 分',metrics:[['充电 / 放电',amount(pc,3)+' / '+amount(actual,3)+' MW'],['储能电量',amount(soc,3)+' MWh'],['固定其余调度的平衡缺口',amount(residual,3)+' MW']]};
}
labs.P0167={...common,title:'电网联络线与储能站的四小时交班',action:'前两小时观察区域来电如何进入储能站。第四小时选择是否执行原放电；其余机组、弃电和联络线交换沿用归档值。',choices:['执行原放电','第四小时保持电量'],views:['跟随功率交接','站区全景'],chapters:chapters([['调度核对',.02],['联络线送电',.26],['电池充入',.42],['第四小时放电',.751],['交换功率结算',.96]]),scope:'24 小时中截取 B0007 母线及 P0001 储能站的前 4 小时；该母线无风机。按原充放电效率和母线平衡逐时复核，停放电分支固定其余调度，显示仍需补足的功率，不推断具体停电用户。电力流标识为瞬时方向示意。',frame:powerFrame,
 draw(canvas,s,d,k,f,view){const aim=focus([[0,722,323,470],[.24,275,181,550],[.36,638,201,460],[.49,924,222,430],[.72,879,215,465],[.84,k?820:633,216,465],[1,k?632:188,188,525]],f);
  paint(canvas,'energy',energySite,g=>{
   const clock=s.t*1.7,active=s.pc>1e-5||s.actual>1e-5,storageOut=s.i===3;
   if(s.pc>0){stream(g,incoming,8,clock,'#ffdc7e');stream(g,cellLine,4,clock,'#bbc959');}
   if(s.actual>0){stream(g,[...cellLine].reverse(),4,clock,'#f2cb64');stream(g,[...incoming].reverse(),8,clock,'#f2cb64');}
   g.oval(649,201,7,7,s.residual>1e-6?rust:teal);
   const level=clamp((s.soc-5)/43);for(let j=0;j<3;j++){g.rect(845+68*j,228-level*20,15,level*20,'#b9d18c');}
   g.tag(amount(s.soc,2)+' MWh',913,273);
   if(s.i===1)g.tag('输入 '+amount(s.pc,2)+' MW',636,244,teal);
   if(storageOut){g.tag(active?'放电送出':'保持电量 · 未放电',876,185,active?teal:rust);g.tag(active?'联络线按计划送出':'交换计划缺 '+amount(s.residual,3)+' MW',616,244,active?teal:rust);}
   const staff=transfer([706,364],[759,350],frac(s.t,0,.54));g.person(...staff,'#ce9757',s.t<.54?s.t*35:0);
  },aim,view);}
};
const railCache=new WeakMap();
function schedule(d,k){
 if(!railCache.has(d))railCache.set(d,[]);
 const plans=railCache.get(d);if(plans[k])return plans[k];
 const events=[];let clock=0,x=d.clusters[0][0];
 function add(a,b,time,action,id){events.push({a,b,start:clock,end:clock+time,action,id});clock+=time;x=b;}
 add(x,x,d.setup,'线路封锁准备',-1);
 for(let i=0;i<d.clusters.length;i++){
  if(k&&i===1)continue;
  const [a,b]=d.clusters[i];if(a>x)add(x,a,(a-x)/d.rates[3],'转场行车',i);
  add(a,a,d.rates[0],'机具展开',i);add(a,b,(b-a)/d.rates[2],'通过作业段',i);add(b,b,d.rates[1],'机具收起',i);
 }
 plans[k]={events,duration:clock};return plans[k];
}
function railFrame(d,k,f){
 const plan=schedule(d,k),t=Math.min(f*d.window,plan.duration),event=plan.events.find(e=>t<e.end-1e-9)||plan.events.at(-1);
 const x=lerp(event.a,event.b,frac(t,event.start,event.end)),fixed=d.units.map(v=>plan.events.some(e=>e.action==='通过作业段'&&v>=e.a-1e-7&&v<=e.b+1e-7&&t+1e-7>=e.start+(v-e.a)/d.rates[2]));
 return {x,t,action:event.action,id:event.id,fixed,complete:t>=plan.duration-1e-7,clock:'封锁后 '+amount(t,2)+' 小时',metrics:[['已覆盖检测点',fixed.filter(Boolean).length+' / '+fixed.length],['未覆盖',fixed.filter(v=>!v).length+' 点'],['作业里程标',amount(x,3)+' km'],['占用封锁时长',amount(t,3)+' h']]};
}
function displayKm(km,d){
 const marks=[[-5,0]];d.clusters.forEach(([a,b],i)=>{const offset=[147,602,987][i];marks.push([a-.06,offset-30],[a,offset],[a+.024,offset+61],[b,offset+116]);});marks.push([173,1240]);
 let i=0;while(i<marks.length-2&&km>marks[i+1][0])i++;
 return lerp(marks[i][1],marks[i+1][1],frac(km,marks[i][0],marks[i+1][0]));
}
const grade=x=>282+18*Math.sin(x/221)-.025*x;
function railSite(g){
 terrain(g,'#c2d6d2','#b7c5a8');g.poly([[368,130],[418,146],[431,288],[401,520],[320,520],[370,302]],'#83b1b3');
 g.poly([[830,187],[886,112],[946,136],[1003,174],[995,217],[830,220]],'#8f9b88');
 g.block(42,237,77,42,13,'#a59d87','#cabda5','#8c9580');g.tag('东端工务段',93,154);
 g.factory(555,207,85,'河谷瞭望所','#a5a592');g.block(1051,199,87,48,12,'#b0a58d','#d1c2a6','#938f79');g.tag('西坡会让站',1091,124);
 const pts=[];for(let x=0;x<=W;x+=10)pts.push([x,grade(x)]);g.line(pts,'#a9a491',25);g.rails(pts);g.line([[333,grade(333)+10],[435,grade(435)+10]],'#767d71',5);
 for(let j=0;j<9;j++){const x=337+j*12;g.line([[x,grade(x)+10],[x+10,grade(x)+20],[x+10,grade(x)+9]],'#797f70',2);}
 for(const x of [258,537,767,1067]){const y=grade(x);g.line([[x,y-4],[x,y-45]],'#727667',3);g.rect(x-5,y-52,10,18,'#617064');g.oval(x,y-47,2.8,2.8,'#bf8e5f');}
 g.line([[541,150],[547,205],[578,251],[592,334],[612,389]],'#d4caaf',13);
 for(let j=0;j<17;j++){const x=32+j*72;g.tree(x,338+j%3*13,.8);if(j%2)g.tree(x+21,155+(j%4)*9,.8);}
 for(const [x,n] of [[147,'12.42 km'],[602,'104.06 km'],[987,'155.74 km']]){g.rect(x-13,grade(x)-51,4,27,'#7e7c6e');g.tag(n,x,grade(x)-60,'#726b5b');}
}
labs.P0478={...common,title:'封锁窗内的铁路养护机组',action:'跟随机组展开、作业、收起并转场。比较按计划作业与跳过中段时，哪三处检测点留在原状。',choices:['执行三段养护','直接转往第三段'],views:['跟随养护车','线路全景'],chapters:(d,k)=>{const ev=schedule(d,k).events;return [{label:'封锁准备',at:0},...ev.filter(e=>e.action==='通过作业段').map(e=>({label:'进入第 '+(e.id+1)+' 作业段',at:e.start/d.window}))];},endAt:(d,k)=>Math.min(1,schedule(d,k).duration/d.window),scope:'取两天执行记录中的首日。三个养护区间、九处检测点、机具开关时间、工作及行驶速度来自实例。固定其余安排，试算跳过中段后的覆盖与耗时。现场放大各作业段及段首的相邻检测点；公里标显示真实位置，不重估长期风险。',frame:railFrame,
 draw(canvas,s,d,k,f,view){const x=displayKm(s.x,d),y=grade(x);paint(canvas,'rail',railSite,g=>{
   d.units.forEach((v,i)=>{const px=displayKm(v,d),py=grade(px);g.rect(px-3,py-6,6,13,s.fixed[i]?'#318a73':'#c06b51');g.oval(px,py+15,3,3,s.fixed[i]?teal:rust);});
   g.rect(x-30,y-24,52,16,'#d49b4e');g.rect(x-18,y-35,22,13,'#d3ac66');g.rect(x-16,y-32,14,8,'#86a6a3');g.rect(x+15,y-22,14,12,'#9a815d');for(const dx of [-19,14])g.oval(x+dx,y-5,5,5,ink);
   if(s.action==='通过作业段'){g.line([[x-5,y-14],[x-3,y-4],[x+2,y]],'#816752',3);g.oval(x,y,4,3,'#ead486');}
   g.tag(s.complete?(k?'结束 · 中段 3 点未覆盖':'结束 · 9 点已覆盖'):s.action,x,y-50,s.complete&&k?rust:ink);
   if(k&&s.x>=d.clusters[1][0])g.tag('中段留待处置',627,319,rust);
   if(s.t<d.setup){const crew=transfer([99,243],[135,grade(147)+17],frac(s.t,0,d.setup));g.person(...crew,'#c8824f',s.t*18);}
  },[x,y-14,s.action==='转场行车'?630:403],view);}
};
})();

