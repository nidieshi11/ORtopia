/* ORtopia • five operations worlds driven by the local instance and replay plan. */
(() => {
  "use strict";
  const labs = window.ORTOPIA_LABS ||= {};
  const ink = "#213e46", muted = "#597476", green = "#08796d", mint = "#90ccb7";
  const blue = "#37748e", amber = "#de944a", brick = "#b75a45", cream = "#fbf7ee";
  const palette = ["#278572","#d7984e","#688dac","#b76b58"];
  const limit = (n,a=0,b=1)=>Math.max(a,Math.min(b,n));
  const mix = (a,b,t)=>a+(b-a)*t;
  const num = (v,n=1)=>Number(v.toFixed(n)).toString();
  function box(g,x,y,w,h,color,r=0) {
    g.fillStyle=color;g.beginPath();
    if(r) g.roundRect(x,y,w,h,r); else g.rect(x,y,w,h);
    g.fill();
  }
  function line(g,pts,color,width=2,dash=[]) {
    g.save();g.beginPath();g.moveTo(...pts[0]);pts.slice(1).forEach(p=>g.lineTo(...p));
    g.strokeStyle=color;g.lineWidth=width;g.lineJoin="round";g.lineCap="round";g.setLineDash(dash);g.stroke();g.restore();
  }
  function circle(g,x,y,r,c){g.fillStyle=c;g.beginPath();g.arc(x,y,r,0,Math.PI*2);g.fill();}
  function poly(g,pts,c){g.fillStyle=c;g.beginPath();pts.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();g.fill();}
  function label(g,x,y,text,size=14,c=ink,align="left",bold=false){
    g.save();g.fillStyle=c;g.font=(bold?"650 ":"500 ")+size+'px "Microsoft YaHei", system-ui, sans-serif';g.textAlign=align;g.fillText(String(text),x,y);g.restore();
  }
  function canvasOf(cv,background){
    const g=cv.getContext("2d");g.setTransform(cv.width/900,0,0,cv.height/360,0,0);
    box(g,0,0,900,360,background);return g;
  }
  function carton(g,x,y,w,h,c,id) {
    box(g,x,y,w,h,c,3);box(g,x+w*.4,y,w*.13,h,"#e4d3a5");
    line(g,[[x+2,y+2],[x+w-2,y+2]],"#fffae1",1);
    if(id) label(g,x+5,y+h-3,id,11,"#142f37","left",true);
  }
  function wheels(g,x,y,w,col) {for (const t of [0,w]) {circle(g,x+t,y,5,ink);circle(g,x+t,y,2,col);}}
  function header(g,left,right) {box(g,0,0,900,37,"#153e45");label(g,18,25,left,16,"#fff8e6","left",true);label(g,882,24,right,13,"#c2ded9","right");}
  function chip(g,x,y,value,c){box(g,x,y,64,22,c,5);label(g,x+32,y+16,value,12,"white","center",true);}
  function packing(d,c,f){
    const m=d.plans[c], step=Math.min(d.dimensions.length-1,Math.floor(f*d.dimensions.length));
    const cursor=(f*d.dimensions.length-step)*m.length, loaded=Math.floor(cursor+1e-9);
    const loads=[0,0],risk=[0,0];m.forEach((b,k)=>{if(k<loaded)loads[b]+=d.dimensions[step][k];});
    d.dimensions.forEach((row,s)=>{const v=[0,0];m.forEach((b,k)=>v[b]+=row[k]);v.forEach((v,b)=>{if(v>d.capacity[b])risk[b]+=d.probabilities[s];});});
    return {step,cursor,loaded,loads,risk,clock:'尺寸情景 '+(step+1)+' / '+d.dimensions.length,
      metrics:[['当前情景装入',loaded+' / '+m.length],['两箱超容概率',risk.map(x=>Math.round(100*x)+'%').join(' / ')],['允许超容概率',Math.round(100*d.epsilon)+'%'],[Math.max(...risk)>d.epsilon+1e-8?'不可行分配成本':'全实例分配成本',d.costs[c]]]};
  }
  labs.P0029={title:'随机尺寸货件装箱',action:'在尺寸揭晓之前决定货件归箱',choices:['归档分配','两箱整组互换','把 i28 移到 b1'],scope:'展示 50 箱中的 b0、b1 及其全部 8 件货。每轮用一种实际尺寸情景重新装箱，成本计入全部 200 件。',frame:packing,
    draw(cv,s,d,c){
      const g=canvasOf(cv,"#e9eee4"),m=d.plans[c], row=d.dimensions[s.step], centers=[466,730],scale=3.25,base=300;
      header(g,"分拣月台  /  随机尺寸装箱",s.clock);
      for(let x=0;x<900;x+=90){line(g,[[x,39],[x,249]],"#d5dfd5",1);line(g,[[x,313],[x-40,359]],"#d0dbd2",1);}
      box(g,14,176,230,20,"#75918b",8);box(g,14,177,230,5,ink);
      for(let x=23;x<244;x+=19)circle(g,x,188,4,"#dfe9dc");
      box(g,43,196,8,61,muted);box(g,207,196,8,61,muted);
      label(g,25,81,'待检货件',16,ink,'left',true);
      const active=Math.min(m.length-1,s.loaded),t=limit(s.cursor-s.loaded);
      for(let k=s.loaded+1;k<Math.min(m.length,s.loaded+5);k++){const x=190-(k-s.loaded)*42;carton(g,x,145,37,30,palette[m[k]],d.items[k]);}
      const heights=[0,0];
      for(let b=0;b<2;b++){
        const x=centers[b];box(g,x-105,base,210,11,"#8f6e51",2);box(g,x-100,base+11,14,6,ink);box(g,x+88,base+11,14,6,ink);
        line(g,[[x-100,base-d.capacity[b]*scale],[x-100,base],[x+100,base],[x+100,base-d.capacity[b]*scale]],"#637c7b",3);
        label(g,x,338,d.bins[b]+'  ·  '+num(s.loads[b])+' / '+num(d.capacity[b]),15,ink,"center",true);
      }
      for(let k=0;k<s.loaded;k++){const b=m[k],h=row[k]*scale;carton(g,centers[b]-73,base-heights[b]-h,146,h-1,palette[b],d.items[k]);heights[b]+=h;}
      if(s.loaded<m.length){const b=m[active],h=row[active]*scale;
        const x=mix(190,centers[b]-73,t),y=mix(144,base-heights[b]-h,t)-56*Math.sin(Math.PI*t);
        carton(g,x,y,mix(38,146,t),h,palette[b],d.items[active]);
        line(g,[[x+19,47],[x+19,y-2]],muted,1);box(g,x+8,43,22,8,muted,2);
      }
      for(let b=0;b<2;b++){const x=centers[b], y=base-d.capacity[b]*scale;line(g,[[x-111,y],[x+111,y]],brick,2,[5,5]);label(g,x+104,y-5,"容量线",11,brick,"right");}
    }};
  function factory(d,c,f){
    const p=d.plans[c], horizon=Math.max(...p.finish),t=horizon*f;
    const jobs=p.start.map((start,k)=>t<start?'wait':t<p.finish[k]?'run':'done');
    return {t,jobs,clock:'工时 '+num(t,2),metrics:[['已完工',jobs.filter(x=>x==='done').length+' / '+d.jobs.length],['情景 w1 工期',num(horizon,3)],['180 情景期望工期',num(p.expected,6)]]};
  }
  labs.P0079={title:'两台加工机的随机工时排程',action:'选择分机方案后执行情景 w1',choices:['归档分机','将 j1 改派至 M2','全部派至 M1'],scope:'分机决策对全部 180 个工时情景相同。车间回放第一个情景，期望工期按原始情景概率加权。',frame:factory,
    draw(cv,s,d,c){
      const g=canvasOf(cv,'#e3ebe7'),p=d.plans[c];
      header(g,'双机加工间  /  w1 实际工时',s.clock);
      for(let m=0;m<2;m++){
        const y=52+m*150, ids=d.jobs.map((_,k)=>k).filter(k=>p.machine[k]===m).sort((a,b)=>p.start[a]-p.start[b]);
        const run=ids.find(k=>s.jobs[k]==='run');
        box(g,18,y,864,135,'#f6f4e9',10);chip(g,29,y+11,'机台 M'+(m+1),m?blue:green);
        label(g,36,y+53,'进料架',13,muted);
        line(g,[[38,y+105],[302,y+105]],ink,6);for(let x=42;x<300;x+=17)circle(g,x,y+105,3,'#a5b7ac');
        box(g,325,y+18,214,94,m?'#6697aa':'#69a793',9);box(g,345,y+29,143,65,'#d6e8dd',6);
        box(g,354,y+35,126,49,'#24464b',3);box(g,409,y+36,15,18,'#b7c7b8',1);
        const pulse=run===undefined?0:Math.sin(s.t*18);poly(g,[[408,y+50],[425,y+50],[416,y+60+pulse*5]],'#d8e0c9');
        box(g,496,y+36,32,28,ink,3);circle(g,505,y+46,3,run===undefined?'#839597':'#79e1a6');
        box(g,330,y+110,204,7,ink,3);label(g,432,y+129,run===undefined?'空闲':'加工 '+d.jobs[run],13,ink,'center',true);
        line(g,[[561,y+105],[850,y+105]],muted,5);label(g,572,y+41,'完工台',13,muted);
        ids.forEach((k,n)=>{
          const pos=ids.indexOf(k), start=p.start[k],finish=p.finish[k];
          const waitX=234-pos*54,doneX=585+pos*61;
          if(s.jobs[k]==='wait'){carton(g,waitX,y+76,44,28,palette[k],d.jobs[k]);return;}
          if(s.jobs[k]==='done'){carton(g,doneX,y+77,49,27,palette[k],d.jobs[k]);return;}
          const q=limit((s.t-start)/(finish-start)),x=q<.18?mix(waitX,390,q/.18):q>.86?mix(390,doneX,(q-.86)/.14):390;
          const yy=q<.18?mix(y+76,y+63,q/.18):q>.86?mix(y+63,y+77,(q-.86)/.14):y+63;
          carton(g,x,yy,49,19,palette[k],d.jobs[k]);
          if(q>=.18&&q<=.86){box(g,355,y+86,120,3,'#92afa2');box(g,355,y+86,120*q,3,'#ffcc70');}
        });
      }
    }};
  function actorAt(jobs,who,t,handling,exit,n){
    const stops=who===2?jobs:jobs.filter(j=>j[1]===who);
    let end=0,prev=-1;
    for(const j of stops){
      const [rack,,start]=j;
      const arrival=who!==2?j[4]:end+(prev===-1?rack+1:prev===rack?0:Math.abs(rack-prev)+1);
      if(t<arrival)return {x:mix(prev,rack,limit((t-end)/(arrival-end))),mode:'行进'};
      if(t<start)return {x:rack,mode:'等待交接'};
      if(t<start+handling)return {x:rack,mode:'交接'};
      end=start+handling;prev=rack;
    }
    if(who===2)return {x:prev,mode:'拣选完成'};
    return {x:mix(prev,n,limit((t-end)/(exit-end))),mode:t<exit?'驶向出口':'抵达出口'};
  }
  function pickerState(d,c,f){
    const p=d.plans[c],max=Math.max(...p.finish),t=f*max,done=p.jobs.filter(j=>j[2]+d.handling<=t);
    const actors=[0,1,2].map(w=>actorAt(p.jobs,w,t,d.handling,p.finish[w],d.n));
    return {t,actors,active:p.jobs.find(j=>t>=j[2]&&t<j[2]+d.handling),done,
      clock:'作业时刻 '+num(t),metrics:[['交接次数',done.length+' / '+p.jobs.length],['已交接件数',done.reduce((v,j)=>v+j[3],0)],['两车出库时刻',p.finish.join(' / ')],['总工期',max]]};
  }
  function worker(g,x,y,t,moving){
    const a=moving?Math.sin(t*5)*5:0;
    circle(g,x,y-16,6,'#bc8f62');box(g,x-7,y-13,14,15,'#d39047',4);box(g,x-6,y-21,13,4,'#f4c767',2);
    line(g,[[x-3,y+2],[x-4-a,y+10]],ink,3);line(g,[[x+3,y+2],[x+4+a,y+10]],ink,3);
  }
  labs.P0174={title:'移动货架区的人机同步拣选',action:'出发前选择拣货员的访问顺序',choices:['从 S0 顺序拣货','先到 S5 再回 S0','从 S44 逆序拣货'],scope:'两台机器人和一位拣货员须在同一架位交接。保留 45 架位的全部订单数量、机器人分工及原始行走时间。',frame:pickerState,
    draw(cv,s,d,c){
      const g=canvasOf(cv,'#eee9d9'),p=d.plans[c], center=limit(s.actors[2].x,2.2,d.n-3.2), scale=108;
      const X=n=>450+(n-center)*scale;
      header(g,'履约仓  /  拣货员与双机器人',s.clock);
      box(g,0,49,900,98,'#d9dfcd');box(g,0,149,900,123,'#e5e5d8');box(g,0,272,900,88,'#f8f5e9');
      for(let n=0;n<d.n;n++){const x=X(n);if(x<-65||x>965)continue;
        box(g,x-46,59,92,77,'#73958a',3);box(g,x-40,63,80,67,'#d0d7be');
        for(let j=0;j<4;j++)carton(g,x-36+(j%2)*36,70+Math.floor(j/2)*28,31,20,j%2?'#bda275':'#d0b581');
        for(let j=0;j<3;j++)box(g,x-42,65+j*29,84,4,'#68867d');label(g,x,151,'S'+n,13,muted,'center',true);
      }
      for(const y of [194,233])line(g,[[0,y],[900,y]],'#bec9bd',2,[12,10]);
      const person=s.actors[2];worker(g,X(person.x),172,s.t,person.mode==='行进');
      s.actors.slice(0,2).forEach((a,r)=>{const real=X(a.x),x=limit(real,36,864),y=202+37*r;
        box(g,x-22,y-12,44,17,r?blue:green,6);box(g,x-11,y-18,22,10,'#b7d2c6',3);wheels(g,x-13,y+6,26,cream);
        label(g,x,y+1,(real<30?'‹ ':real>870?'› ':'')+'R'+(r+1),11,'white','center',true);
      });
      if(s.active){const [n,r,start,qty]=s.active, q=limit((s.t-start)/d.handling);
        carton(g,X(n)-7,mix(175,193+r*37,q),14,12,amber);label(g,879,173,'S'+n+' 交接 '+qty+' 件',14,ink,'right',true);}
      label(g,18,296,'全仓位置',13,muted);
      const left=106,right=863,pos=x=>mix(left,right,(x+1)/(d.n+1));
      line(g,[[left,315],[right,315]],'#9ea99a',3);for(let j=0;j<d.n;j++)box(g,pos(j),308,2,7,'#aab8a5');
      s.actors.forEach((a,r)=>circle(g,pos(a.x),306+r*9,5,[green,blue,amber][r]));
      label(g,left,345,'入口',12,muted,'center');label(g,right,345,'出口',12,muted,'center');
      label(g,450,346,'拣货员 · '+person.mode+'       R1 · '+s.actors[0].mode+'       R2 · '+s.actors[1].mode,13,ink,'center');
    }};
  function cargoState(d,c,f){
    const base=d.plans[0],plan=d.plans[c],sum=row=>row.reduce((a,b)=>a+b,0),moves=[];
    plan.forEach((row,b)=>{for(let j=0;j<sum(base[b]);j++)moves.push([b,j<row[0]?0:j<sum(row)?1:2]);});
    const cur=f*moves.length,done=Math.floor(cur+1e-8),load=[...d.other,0];
    moves.slice(0,done).forEach(([,to])=>load[to]++);
    return {moves,cur,done,load,clock:'搬运 '+done+' / '+moves.length+' 托',metrics:[['航段 0 已装',load[0]+' / '+d.capacities[0]],['航段 1 已装',load[1]+' / '+d.capacities[1]],['全网未运托数',d.values[c][1]],['全网净收益',d.values[c][0]]]};
  }
  function plane(g,x,y,color){
    g.save();g.translate(x,y);
    poly(g,[[-54,-3],[-23,-8],[-3,-8],[-23,-56],[-15,-58],[22,-10],[61,-9],[77,-5],[83,0],[75,5],[61,8],[22,9],[-18,54],[-25,54],[-3,9],[-28,7],[-56,13],[-62,12],[-52,2]],'#f4f4e9');
    poly(g,[[-54,-4],[-67,-23],[-60,-24],[-34,-6]],color);
    line(g,[[-42,0],[47,0]],color,3);box(g,59,-5,8,10,'#536f7c',3);
    for(let j=0;j<6;j++)circle(g,-20+j*10,-4,1.5,ink);
    g.restore();
  }
  function forklift(g,x,y,color,carrying){
    wheels(g,x-11,y+7,22,cream);box(g,x-18,y-5,31,12,color,3);
    box(g,x-8,y-15,11,11,'#558087',2);box(g,x+13,y-17,3,23,ink);box(g,x+13,y+3,19,3,ink);
    if(carrying)carton(g,x+17,y-8,13,11,carrying);
  }
  labs.P0411={title:'空港货站的托盘配舱',action:'截载前决定两票货如何占用两段舱位',choices:['归档配舱','互换四托舱位','第一票留地四托'],scope:'在 7,501 票订舱中试改两票的 11 托，其余配载固定。搬运按托演示，净收益和未运量按全网计。',frame:cargoState,
    draw(cv,s,d,c){
      const g=canvasOf(cv,'#d8e3dd'), gate=[[566,103],[566,231],[328,290]],bay=[[121,127],[121,203]];
      header(g,'航空货运站  /  舱位分配',s.clock);
      box(g,0,39,215,244,'#d2cbb9');box(g,14,53,183,225,'#f1ebdc',5);
      label(g,29,77,'出港货库',17,ink,'left',true);
      const fraction=limit(s.cur-s.done),active=s.moves[s.done];
      const returning=s.done > 0 ? .4 : 0;
      const picked=active&&fraction>=returning;
      const left=d.plans[0].map((r,b)=>r[0]+r[1]-s.moves.slice(0,s.done).filter(v=>v[0]===b).length-(picked&&active[0]===b?1:0));
      for(let b=0;b<2;b++){const y=bay[b][1];
        box(g,26,y-29,153,62,'#d3dacc',3);label(g,32,y-11,'订舱 '+d.bookings[b]+' · '+left[b]+' 托',13,ink,'left',true);
        for(let j=0;j<left[b];j++)carton(g,32+j*19,y+1,16,15,palette[b]);
        box(g,181,y-13,20,31,muted,2);
      }
      for(let j=0;j<2;j++){
        const y=gate[j][1];line(g,[[193,162],[280,162],[394,y],[610,y]],'#b9c9bd',20);line(g,[[193,162],[280,162],[394,y],[610,y]],'#fff7cc',1.5,[6,8]);
        box(g,585,y-47,287,95,'#b0c4bd',10);
        line(g,[[595,y],[859,y]],'#f3da79',2,[8,6]);plane(g,757,y,j?blue:green);
        label(g,597,y-24,'航段 '+d.paths[j],14,ink,'left',true);
        label(g,597,y+33,'舱位 '+s.load[j]+' / '+d.capacities[j],13,ink,'left',true);
        for(let k=0;k<s.done;k++)if(s.moves[k][1]===j){const prior=s.moves.slice(0,k).filter(m=>m[1]===j).length;carton(g,588+prior%4*18,y-2+Math.floor(prior/4)*14,16,12,palette[s.moves[k][0]]);}
      }
      box(g,227,269,208,60,'#efe6cf',7);label(g,239,289,'留地待运区',14,ink,'left',true);
      for(let k=0;k<s.load[2];k++)carton(g,242+k*25,297,23,18,palette[0]);
      if(active){
        const [b,to]=active,start=[183,bay[b][1]];
        const along=(a,z,t)=>t<.38?[mix(a[0],277,t/.38),mix(a[1],162,t/.38)]:[mix(277,z[0],(t-.38)/.62),mix(162,z[1],(t-.38)/.62)];
        const [x,y]=picked?along(start,gate[to],(fraction-returning)/(1-returning)):along(start,gate[s.moves[s.done-1][1]],1-fraction/returning);
        forklift(g,x,y+12,'#d49c4c',picked?palette[b]:null);
      } else {const end=gate[s.moves.at(-1)[1]];forklift(g,end[0],end[1]+12,'#d49c4c');}
      label(g,875,346,'既有装载  '+d.other[0]+' / '+d.other[1]+' 托',13,muted,'right');
    }};
  function kitchenState(d,c,f){
    const plan=d.plans[c],end=Math.max(...plan.map((v,j)=>v[1]+d.legs[j][0]+d.legs[j][1])),t=end*f;
    const phases=plan.map(([cook,dep],j)=>t<d.placed[j]?'未下单':t<cook?'已下单':t<cook+d.prepare[j]?'烹制':t<dep?'候车':t<dep+d.legs[j][0]?'配送':'签收');
    const vans=[0,1].map(v=>{const j=plan.findIndex((p,j)=>p[2]===v&&t>=p[1]&&t<p[1]+d.legs[j][0]+d.legs[j][1]);if(j<0)return {j:-1,u:0};
      const dep=plan[j][1],out=d.legs[j][0],back=d.legs[j][1],dt=t-dep;
      return {j,u:dt<out?dt/out:1-(dt-out)/back,back:dt>=out};});
    return {t,phases,vans,clock:'营业时刻 '+num(t,2),metrics:[['顾客已签收',phases.filter(x=>x==='签收').length+' / 3'],['出车次数',plan.filter(p=>p[1]<=t).length],['当前历史超期发车损失',num(d.cost[c],3)]]};
  }
  const clients=[[648,91],[782,171],[647,272]];
  function pointOnRoute(j,u){const [x,y]=clients[j],viaX=531,t=limit(u),a=viaX-402,b=Math.abs(y-180),e=x-viaX,travel=t*(a+b+e);
    if(travel<=a)return [402+travel,180];if(travel<=a+b)return [viaX,180+Math.sign(y-180)*(travel-a)];return [viaX+travel-a-b,y];}
  function van(g,x,y,color,no){box(g,x-18,y-10,26,15,color,3);poly(g,[[x+7,y-8],[x+15,y-8],[x+20,y-2],[x+20,y+5],[x+7,y+5]],color);
    box(g,x+10,y-6,6,6,'#d6eadf');wheels(g,x-10,y+6,22,cream);label(g,x-5,y+2,no,10,'white','center',true);}
  labs.P0461={title:'共享厨房的灶台与外送车',action:'为同一组订单安排开火与出车顺序',choices:['归档出餐与派车','只派一辆车','优先制作 A 餐'],scope:'回放归档中的一条三单历史。灶台、车辆、保鲜和往返时长取自实例，损失只统计这条历史的超期发车。',frame:kitchenState,
    draw(cv,s,d,c){
      const g=canvasOf(cv,'#e7ecdf'),p=d.plans[c],letters=['A','B','F'];
      header(g,'共享厨房  /  热餐履约',s.clock);
      const dock=[402,180];
      for(let j=0;j<3;j++){const [x,y]=clients[j],pts=[dock,[531,180],[531,y],[x,y]];
        line(g,pts,'#abb9ad',21);line(g,pts,'#f8f3d5',2,[8,10]);}
      box(g,12,53,356,277,'#a4b7a8',8);box(g,19,59,342,265,'#f6f1df',6);
      box(g,26,73,321,27,'#254d4e',3);label(g,37,92,'中央厨房    热食工位',15,'white','left',true);
      const cook=s.phases.indexOf('烹制'),cy=170;
      box(g,39,143,116,54,'#8da598',5);box(g,42,147,109,38,'#304f4f',3);circle(g,96,166,15,'#b8b9a0');circle(g,96,166,10,cook>=0?'#e1a252':'#637975');
      if(cook>=0){circle(g,96,165,12,palette[cook]);label(g,96,170,letters[cook],13,'white','center',true);
        for(let n=0;n<3;n++){const x=85+n*10,y=137+Math.sin(s.t*14+n)*3;line(g,[[x,y],[x+2,y-6],[x,y-12]],'#a7b8ac',2);}}
      worker(g,176,176,s.t,cook>=0);label(g,39,218,cook>=0?'正在制作 '+letters[cook]+' 餐':'灶台空闲',13,ink,'left',true);
      box(g,220,134,116,69,'#d7ccb1',4);label(g,230,155,'取餐台',14,muted);
      for(let j=0;j<3;j++)if(s.phases[j]==='候车')carton(g,229+j*31,172,24,17,palette[j],letters[j]);
      for(let j=0;j<3;j++){const y=239+j*23;circle(g,42,y-3,5,palette[j]);label(g,55,y,letters[j]+' 餐',13,ink);label(g,123,y,'出车 '+p[j][1]+'   V'+(p[j][2]+1),12,muted);label(g,300,y,s.phases[j],13,ink,'right',true);}
      for(let j=0;j<3;j++){const [x,y]=clients[j];
        box(g,x+12,y-10,53,32,'#d8c9ae',3);poly(g,[[x+5,y-10],[x+36,y-32],[x+71,y-10]],palette[j]);box(g,x+36,y+5,10,17,'#879b8f');
        label(g,x+37,y+40,letters[j]+' 客户',13,ink,'center',true);
        if(s.phases[j]==='签收')carton(g,x+9,y+14,16,12,palette[j]);
      }
      s.vans.forEach((vanState,v)=>{const [x,y]=vanState.j===-1?[389+v*28,217]:pointOnRoute(vanState.j,vanState.u);
        van(g,x,y+(v?5:-5),v?blue:green,'V'+(v+1));
        if(vanState.j!==-1&&!vanState.back)box(g,x-14,y-13+(v?5:-5),8,4,palette[vanState.j]);});
      label(g,881,344,'道路按往返时长演示 · 灶台与车辆均不可重占',13,muted,'right');
    }};
})();
