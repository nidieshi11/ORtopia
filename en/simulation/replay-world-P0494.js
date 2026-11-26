/* The archived sites lie on a single distance ray. The street scene is an
 * illustrated section along that ray; only frame() advances model quantities. */
(() => {
  'use strict';
  const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n));
  const mix=(a,b,f)=>a+(b-a)*clamp(f);
  const frac=(x,a,b)=>clamp((x-a)/(b-a||1));
  const ease=x=>x*x*(3-2*x);
  const timed=new WeakMap();
  function timeline(d){
    if(timed.has(d))return timed.get(d);
    const marks=[[0,0]];let seconds=0;
    function add(t,length){seconds+=length;marks.push([seconds,t]);}
    for(let j=0;j<d.stops.length;j++){
      const [id,arr,dep]=d.stops[j];
      if(j){
        const km=Math.abs(d.positions[id]-d.positions[d.stops[j-1][0]]);
        add(arr,km>70?5.8:1.45+km*.045);
      }
      add(dep,id===0?(j?2.8:1.8):1.28+(dep-arr)*.10);
    }
    for(const mark of marks)mark[0]/=seconds;
    timed.set(d,marks);return marks;
  }
  function clockAt(d,x,inverse=false){
    const marks=timeline(d),a=inverse?1:0,b=1-a;
    for(let j=1;j<marks.length;j++){
      if(x<=marks[j][a])return mix(marks[j-1][b],marks[j][b],frac(x,marks[j-1][a],marks[j][a]));
    }
    return marks[marks.length-1][b];
  }
  function state(d,choice,f){
    const t=clockAt(d,f), tour=d.stops, pivot=tour[8], ninth=tour[10][0], opened=d.windows[ninth-1][0];
    let x=0,load=0,done=0,distance=0,site=0,target=0,from=0,leg=0,phase="Warehouse loading",progress=0,dir=1;
    if(choice && t>=pivot[2]){
      from=pivot[0];target=ninth;dir=-1;
      const gap=d.positions[from]-d.positions[target],arrival=pivot[2]+gap;
      progress=frac(t,pivot[2],arrival);x=mix(d.positions[from],d.positions[target],progress);
      distance=d.positions[from]+gap*progress;load=d.capacity;done=8;leg=1;
      site=t<arrival?null:target;phase=t<arrival?"Heading to the ninth stop":t<opened?"waiting service window":"The ninth order exceeds capacity";
    }else{
      for(let j=0;j<tour.length;j++){
        const [id,arr,dep,used]=tour[j];
        const prev=tour[Math.max(0,j-1)],gap=Math.abs(d.positions[id]-d.positions[prev[0]]);
        from=prev[0];target=id;dir=id===0&&j>0?-1:1;leg=j<9?0:j===9?1:2;
        if(t<arr){
          site=null;progress=frac(t,prev[2],arr);x=mix(d.positions[from],d.positions[id],progress);
          distance+=gap*progress;phase=id?"Drive to service point":"Return to warehouse";break;
        }
        x=d.positions[id];distance+=gap;site=id;
        if(t<dep){progress=frac(t,arr,dep);phase=id?"Deliver package":j?"Return to warehouse for replenishment":"Warehouse loading";break;}
        load=used;if(id)done++;
        progress=1;phase=id?"complete delivery":"Replenishment completed";
      }
    }
    return {t,x,load,done,distance,site,target,from,leg,dir,phase,progress,choice,
      clock:"Operating "+Math.floor(t+.00001)+" min",
      metrics:[["Served",done+" Single"],["Used capacity this round",load+' / '+d.capacity],["Operation status",phase],["Accumulated travel",Number(distance.toFixed(1))+' km']]};
  }

  const INK='#243d41',TEAL='#087969',AMBER='#f5ba57',MILK='#fff5dc',BAD='#a63f37';
  const rnd=n=>{const v=Math.sin(n*127.1+41.7)*18671.713;return v-Math.floor(v);};
  const roadY=x=>248+49*Math.sin(x/520)+38*Math.sin(x/910-.6)+13*Math.cos(x/141);
  const roadX=km=>km*21;
  const districts=["Distribution station","Riverside Industrial Area","west shore farm","old town neighborhood","riverfront community","Nancheng residential area","Rongshu Commercial Street"];
  const landmarkNames={36:"community clinic",44:"Banyan Tree Market",48:"corner bookstore",51:"station square"};
  const region=id=>id===0?0:id<8?1:id<19?2:id<28?3:id<36?4:id<44?5:6;
  const pointName=id=>id?'S'+id:"Distribution warehouse";
  function brush(canvas){
    const ctx=canvas.getContext('2d'),H=540,W=H*canvas.width/canvas.height;
    ctx.setTransform(canvas.height/H,0,0,canvas.height/H,0,0);
    ctx.lineJoin='round';ctx.lineCap='round';ctx.globalAlpha=1;
    function rect(x,y,w,h,col){ctx.fillStyle=col;ctx.fillRect(x,y,w,h);}
    function shape(pts,col){ctx.beginPath();pts.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fillStyle=col;ctx.fill();}
    function line(pts,col,sw=2,dash=[]){ctx.beginPath();pts.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.strokeStyle=col;ctx.lineWidth=sw;ctx.setLineDash(dash);ctx.stroke();ctx.setLineDash([]);}
    function oval(x,y,rx,ry,col){ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fillStyle=col;ctx.fill();}
    function txt(val,x,y,sz,col=INK,align='left',weight=600){ctx.font=weight+' '+sz+'px system-ui,"Microsoft YaHei",sans-serif';ctx.textAlign=align;ctx.textBaseline='middle';ctx.fillStyle=col;ctx.fillText(val,x,y);}
    function panel(x,y,w,h,col,r=7){ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fillStyle=col;ctx.fill();}
    return {ctx,W,H,rect,shape,line,oval,txt,panel};
  }
  function tree(g,x,y,size,kind=0){
    const {shape,oval,line}=g;oval(x+size*.30,y+1,size*.70,size*.18,'#284d3d2b');
    line([[x,y],[x,y-size*.8]],'#77674f',size*.15);
    if(kind===1){shape([[x-size*.52,y-size*.52],[x+size*.55,y-size*.52],[x,y-size*2.1]],'#537863');shape([[x,y-size*2.1],[x,y-size*.52],[x-size*.52,y-size*.52]],'#6f9071');return;}
    const colors=kind===2?['#ab934d','#c3a85d','#dac579']:['#517b62','#6b926a','#8fa879'];
    oval(x-1,y-size*.98,size*.68,size*.67,colors[0]);oval(x-size*.21,y-size*1.24,size*.60,size*.60,colors[1]);oval(x-size*.32,y-size*1.45,size*.31,size*.25,colors[2]);
  }
  function person(g,x,y,color,walk=0,parcel=false){
    const {line,oval,rect}=g,step=Math.sin(walk)*3;
    oval(x+2,y,7,2,'#344a492e');line([[x-2,y-11],[x-3-step,y-1]],'#38474a',3);
    line([[x+1,y-11],[x+3+step,y]],'#39464c',3);line([[x,y-19],[x,y-10]],color,7);
    line([[x-2,y-17],[x-5,y-10]],color,2);oval(x,y-24,4,4,'#d2a581');oval(x-.3,y-26.5,3.9,1.8,'#514644');
    if(parcel){rect(x+2,y-16,8,7,'#b77c44');rect(x+5,y-16,2,7,'#e6bf81');}
  }
  function solid(g,x,y,w,h,depth,front,side,roof){
    const {rect,shape}=g,D=depth;
    shape([[x,y],[x+w,y],[x+w+D+18,y-D*.5+3],[x+D,y-D*.5+3]],'#334b3e24');
    rect(x,y-h,w,h,front);shape([[x+w,y-h],[x+w+D,y-h-D*.53],[x+w+D,y-D*.53],[x+w,y]],side);
    shape([[x,y-h],[x+D,y-h-D*.53],[x+w+D,y-h-D*.53],[x+w,y-h]],roof);
  }
  const shops=["bookstore","Community post office","coffee","bakery","small market","flower shop","convenience store","fruits and vegetables"];
  const paint=[
    ['#eaceaa','#b49777','#e8d7b3'],['#bdc9bb','#96a899','#dddfc7'],
    ['#cca58e','#ab8773','#e2bf9f'],['#e4d5ad','#b4aa89','#f4e5bf'],['#abc1be','#8da5a1','#d2d8c5']
  ];
  function windows(g,x,y,w,rows,n,lit=false){
    const {rect}=g;for(let j=0;j<rows;j++)for(let i=0;i<n;i++){const xx=x+i*w/n;rect(xx,y+j*18,Math.min(15,w/n-5),10,'#ede5cb');rect(xx+1,y+j*18+1,Math.min(13,w/n-7),8,lit?'#d0ba82':'#698486');rect(xx+4,y+j*18+1,2,8,'#aebcb0');}
  }
  function building(g,x,y,id,kind,bg=false){
    const {rect,shape,line,oval,txt}=g,seed=id+(bg?800:0),wide=65+rnd(seed)*32,h=kind==='flats'?89:kind==='warehouse'?55:kind==='civic'?76:43;
    const [fac,side,roof]=paint[Math.floor(rnd(seed+34)*paint.length)];
    const l=x-wide/2;solid(g,l,y,wide,h,22,fac,side,roof);
    if(kind==='warehouse'){
      for(let n=0;n<3;n++){const dx=l+n*wide/3;shape([[dx,y-h],[dx+wide/3,y-h],[dx+wide/3,y-h-10]],'#a7ada1');line([[dx,y-h],[dx+wide/3,y-h-10]],'#687873',2);}
      rect(l+9,y-30,wide*.52,30,'#647b77');for(let j=0;j<4;j++)rect(l+10,y-27+j*6,wide*.50,2,'#a3ada2');
      rect(l+wide*.72,y-24,12,24,'#53716d');
    }else if(kind==='civic'){
      rect(l+4,y-h+6,wide-8,5,'#f0e5c7');windows(g,l+8,y-52,wide-12,2,4);rect(x-6,y-22,14,22,'#698382');
      solid(g,x-13,y-h+8,24,32,13,'#d8c9a4','#a9a189','#ead9af');oval(x-1,y-h-11,7,7,'#fff4d9');line([[x-1,y-h-16],[x-1,y-h-11],[x+2,y-h-8]],'#556b66',1.3);
      shape([[x-16,y-h-25],[x+14,y-h-25],[x,y-h-43]],'#678880');
    }else if(kind==='flats'){
      windows(g,l+8,y-h+9,wide-10,4,4);for(let n=0;n<3;n++)rect(l+1,y-26-n*18,wide-3,3,'#e6d9b9');
      rect(x+5,y-22,13,22,'#687f78');
    }else if(kind==='farm'){
      shape([[l-5,y-h+2],[x,y-h-25],[l+wide+5,y-h+2]],'#a97560');shape([[x,y-h-25],[x+22,y-h-38],[l+wide+26,y-h-10],[l+wide+5,y-h+2]],'#866452');
      rect(x-12,y-24,24,24,'#8e6d52');line([[x-11,y-23],[x+11,y-2]],'#d6c5a7',2);line([[x+11,y-23],[x-11,y-2]],'#d6c5a7',2);
    }else{
      const accents=['#b7664d','#547f77','#9e874e','#798b9a'],accent=accents[id%4];
      rect(l+4,y-25,wide-9,24,'#66817d');rect(x+8,y-24,4,24,'#d4ccad');
      for(let i=0;i<8;i++){const a=l-1+i*(wide+2)/8,b=a+(wide+2)/8;shape([[a,y-35],[b,y-35],[b-3,y-27],[a-3,y-27]],i%2?MILK:accent);}
      if(!bg)txt(shops[id%shops.length],x,y-40,9,'#3f5651','center',700);
    }
  }
  function depot(g,x,y){
    const {rect,shape,line,txt,oval}=g;
    solid(g,x-98,y,173,69,46,'#d0c7a8','#9d9d8a','#e8d9ba');
    for(let i=0;i<3;i++){
      const a=x-98+57*i;shape([[a,y-69],[a+56,y-69],[a+56,y-83]],'#8fa29a');
      shape([[a,y-69],[a+46,y-94],[a+102,y-107],[a+56,y-83]],'#aec0b5');
    }
    for(let i=0;i<2;i++){const a=x-76+i*76;rect(a,y-43,52,44,'#4d6862');rect(a+3,y-40,46,8,'#90a59a');for(let k=0;k<3;k++){rect(a+3+k*13,y-12,12,12,'#b98e5f');rect(a+7+k*13,y-12,2,12,'#e3c090');}}
    rect(x-93,y-64,96,17,TEAL);txt("Intercity distribution center",x-45,y-55,10,'#fff9df','center',700);
    line([[x+100,y-24],[x+100,y-85]],'#778b80',2);shape([[x+101,y-84],[x+124,y-80],[x+101,y-73]],'#dd9866');
    oval(x+74,y+13,15,3,'#48574c30');
  }
  function landmark(g,x,y,id){
    const {rect,shape,line,oval,txt}=g;
    if(id===36){
      solid(g,x-48,y,89,61,20,'#f4e9ce','#b7b6a3','#dbe1cf');
      solid(g,x-38,y-61,64,20,17,'#c9ded3','#9eafa3','#ebedda');
      windows(g,x-30,y-75,52,1,4);rect(x-5,y-30,30,30,'#85a6a3');
      rect(x-42,y-42,28,29,'#a1b9ad');rect(x-32,y-38,6,20,TEAL);rect(x-39,y-31,20,6,TEAL);
      rect(x-3,y-47,40,12,'#36887b');txt("community clinic",x+16,y-41,8,'#fffde8','center');
    }else if(id===44){
      // A market hall with an open front, baskets, and two freestanding stalls.
      solid(g,x-46,y-6,86,37,19,'#c99b74','#a78065','#e1b385');
      rect(x-40,y-36,75,31,'#786f57');
      for(let j=0;j<9;j++){
        const a=x-52+j*11;
        shape([[a,y-49],[a+11,y-49],[a+5,y-26],[a-6,y-26]],j%2?'#f4dba4':'#bc6048');
        rect(a-6,y-26,11,5,j%2?'#f3daa0':'#a95341');
      }
      rect(x-47,y-6,83,5,'#aa7955');
      for(let j=0;j<3;j++){
        const bx=x-42+27*j;rect(bx,y-15,23,10,'#b68e5e');
        for(let k=0;k<4;k++)oval(bx+3+k*5,y-15+(k%2),3,2.7,['#be674a','#98a060','#d6a34e'][j]);
      }
      rect(x-26,y-57,57,12,'#8a6147');txt("Banyan Tree Market",x+2,y-51,8,'#fff4cf','center');
    }else if(id===48){
      solid(g,x-42,y,77,62,21,'#e4c59e','#ada185','#c5d0b4');
      windows(g,x-35,y-54,50,1,3);rect(x-35,y-31,57,30,'#ac8a68');
      for(let n=0;n<2;n++){
        rect(x-34,y-25+n*13,54,2,'#625f4e');
        for(let k=0;k<9;k++)rect(x-33+k*5.9,y-31+n*13,3.6,6,['#648a81','#bd765a','#d8c18c'][k%3]);
      }
      shape([[x-33,y-62],[x-33,y-77],[x-10,y-82],[x-3,y-76],[x+20,y-81],[x+20,y-64],[x-4,y-59]],'#336f68');
      shape([[x-29,y-74],[x-11,y-78],[x-5,y-73],[x-5,y-62],[x-11,y-66],[x-29,y-62]],'#f4dfad');
      shape([[x-2,y-73],[x+15,y-77],[x+15,y-65],[x-2,y-62]],'#edd198');
      rect(x-39,y-41,78,10,'#447a71');txt("corner bookstore",x,y-36,8,'#fff4d7','center');
    }else if(id===51){
      solid(g,x-51,y,90,42,23,'#ded5b6','#a2967c','#e9daba');
      for(let j=0;j<4;j++){rect(x-44+j*23,y-30,16,30,'#82928a');oval(x-36+j*23,y-29,8,8,'#82928a');}
      solid(g,x-11,y-41,29,50,16,'#d6b48c','#ad967d','#bdad8d');
      oval(x+3,y-74,10,10,'#fff1cf');line([[x+3,y-81],[x+3,y-74],[x+8,y-70]],'#476560',1.8);
      shape([[x-17,y-92],[x+22,y-92],[x+3,y-115]],'#617c73');
      shape([[x+3,y-115],[x+20,y-122],[x+39,y-100],[x+22,y-92]],'#526f68');
      rect(x-36,y-43,67,10,'#607f73');txt("station square",x-2,y-38,8,'#fff8df','center');
    }
  }
  function recipient(g,s,d,id){
    const stop=d.stops.find(a=>a[0]===id),skip=s.choice&&id===36;
    if(!stop||s.choice&&id<44&&id!==36)return;
    const start=skip?d.windows[id-1][0]:stop[1],end=skip?Infinity:stop[2],lead=skip?80:9;
    if(s.t<start-lead||s.t>=end+7)return;
    const x=roadX(d.positions[id]),y=roadY(x),coat=['#91546c','#a35d40','#405d82','#398472'][id%4];
    let px,py,walk,parcel=false;
    if(s.t<start){
      const a=frac(s.t,start-lead,start);px=mix(x-6,x-63,a);py=mix(y-52,y-19,a);walk=a*32;
    }else if(s.t<end){
      const a=skip ? .72 : frac(s.t,start,end);
      px=mix(x-63,x-37,frac(a,0,.53));py=mix(y-19,y+9,frac(a,0,.53));
      walk=a*16;parcel=!skip&&a>.5;
    }else{
      const a=frac(s.t,end,end+7);
      px=a<.45?mix(x-37,x-67,a/.45):mix(x-67,x-15,(a-.45)/.55);
      py=mix(y+9,y-53,a);walk=a*29;parcel=true;
    }
    if(skip)px=2*x-px;
    person(g,px,py,coat,walk,parcel);
    if(skip&&s.t>=start){g.oval(px+9,py-28,8,8,'#af5444');g.txt('!',px+9,py-28,11,'#fff6dc','center',800);}
  }
  function parcelVan(g,x,y,dir,available,opening,big=1){
    const {ctx,rect,shape,line,oval,txt}=g;ctx.save();ctx.translate(x,y);ctx.scale(dir*big,big);
    oval(4,5,54,9,'#243e393d');const body='#247d71',roof='#71aea0';
    shape([[-54,-39],[-42,-47],[20,-47],[13,-39]],roof);rect(-54,-39,68,35,body);
    shape([[14,-33],[32,-33],[50,-19],[52,-3],[14,-3]],'#e0a550');
    shape([[20,-30],[30,-30],[43,-20],[20,-20]],'#567d86');line([[24,-29],[33,-23]],'#aec7c8',2);
    rect(-54,-7,105,4,'#3e5856');rect(47,-14,6,4,'#fff0ae');
    for(let j=0;j<8;j++){
      const xx=-49+(j%4)*13,yy=-35+Math.floor(j/4)*12,unloaded=j>=available;
      rect(xx,yy,12,11,unloaded?'#75988d':'#f0c47a');
      if(opening&&j===Math.max(0,available-1)){rect(xx,yy,12,11,'#685844');shape([[xx,yy],[xx-4,yy+2],[xx-4,yy+13],[xx,yy+11]],'#e2b566');}
      else rect(xx+8,yy+4,2,2,unloaded?'#b4c5b4':'#886e50');
    }
    for(const wx of [-36,34]){oval(wx,-2,8,8,'#263e41');oval(wx,-2,4,4,'#9eb2a8');oval(wx,-2,1.4,1.4,'#485f5c');}
    ctx.restore();
  }
  function car(g,x,y,col,dir,scale=1){
    const {ctx,rect,shape,oval}=g;ctx.save();ctx.translate(x,y);ctx.scale(dir*scale,scale);
    oval(0,1,19,4,'#364c4738');rect(-19,-10,37,9,col);shape([[-13,-10],[-7,-18],[5,-18],[13,-10]],col);shape([[-9,-11],[-5,-16],[3,-16],[9,-11]],'#b7cccb');
    oval(-11,0,3.7,3.7,INK);oval(10,0,3.7,3.7,INK);ctx.restore();
  }
  function bridgeRiver(g,center,x0,x1){
    if(center<x0-220||center>x1+220)return;
    const {shape,line}=g,dx=120;
    const banks=(x,y)=>[center+x+dx*Math.sin(y/320),y];
    const pts=Array.from({length:17},(_,j)=>banks(0,j*85-400));
    line(pts,'#9cac88',86);line(pts,'#e4d5ad',72);line(pts,'#8ab6af',62);
    for(let j=0;j<30;j++){const [x,y]=banks(-17+rnd(j)*36,j*32-184);line([[x,y],[x+8,y-1]],'#c2d8c6',2);}
  }
  function dressing(g,s,d,x0,x1){
    const {rect,line,shape,oval,txt,ctx}=g;
    const lo=Math.floor(x0/150)-2,hi=Math.ceil(x1/150)+2;
    for(let i=lo;i<=hi;i++){
      const x=i*150,local=region(Math.min(51,Math.max(1,Math.round(x/145)))),y=roadY(x);
      if(local===2){
        shape([[x-55,y-167],[x+117,y-188],[x+146,y-119],[x-29,y-107]],'#aec08b');
        for(let j=0;j<8;j++)line([[x-45+j*19,y-164-j*2],[x-20+j*19,y-112-j*2]],'#8aa277',3);
      }else{
        const type=local===1?'warehouse':local>=4?'flats':i%5===0?'civic':'shop';
        building(g,x+12,y-150,Math.abs(i+93),type,true);
        if(i%2===0)building(g,x+68,y-225,Math.abs(i+313),'flats',true);
      }
      for(let j=0;j<3;j++){const xx=x+13+j*45;tree(g,xx,y-110-rnd(i*9+j)*35,12+rnd(i*5+j)*9,j===1?1:0);}
    }
    for(const x of [roadX(85),roadX(239),roadX(316)])bridgeRiver(g,x,x0,x1);
    // Side streets and the service road share fixed intersections, even on the return journey.
    for(let i=lo;i<=hi;i++)if(i%3===0){
      const x=i*150+58,y=roadY(x),points=[[x+58,y-218],[x+37,y-98],[x,y],[x-29,y+93],[x-93,y+205]];
      line(points,'#c2bca2',23);line(points,'#9a9f91',15);
    }
    const route=[];
    for(let x=Math.floor(x0/20)*20-30;x<x1+60;x+=20)route.push([x,roadY(x)]);
    line(route,'#b7b6a0',76);line(route,'#ded8bc',73);line(route,'#747f78',50);line(route,'#899087',46);line(route,'#d7d1ae',1.5,[14,17]);
    const active=s.target,queue=[];
    for(let id=0;id<d.positions.length;id++){
      const x=roadX(d.positions[id]);if(x<x0-130||x>x1+130)continue;
      const y=roadY(x),reg=region(id),stop=d.stops.find(a=>id&&a[0]===id);
      const type=reg===1?'warehouse':reg===2?'farm':(id===36||id===51||id===22)?'civic':reg===5&&id%3?'flats':'shop';
      if(!id)depot(g,x-21,y-42);
      else{
        if(landmarkNames[id])landmark(g,x-8,y-52,id);
        else building(g,x-8,y-52,id,type);
        tree(g,x+51,y-43,12+id%6,id%7===0?2:0);
      }
      if(id>0){
        line([[x+24,y-25],[x+24,y-47]],'#7c8273',2);rect(x+12,y-53,24,12,active===id?TEAL:'#f6f0d9');txt('S'+id,x+24,y-47,9,active===id?'#fff':INK,'center',750);
        if(stop){
          const completed=(!s.choice||id>=44)&&s.t>=stop[2],col=completed?TEAL:'#b79355';
          oval(x-12,y-27,4.7,2.5,col);oval(x+3,y-27,4.7,2.5,col);
          queue.push(id);
        }
        if(id%3===0){rect(x+48,y-31,15,3,'#887650');rect(x+49,y-28,2,4,'#595f50');rect(x+60,y-28,2,4,'#595f50');}
      }
    }
    // Passing traffic has one forward trajectory per vehicle across the corridor.
    const traffic=[];
    for(let n=-29;n<65;n++){
      const sign=n%2===0?1:-1,xx=n*212+sign*s.t*(1.9+rnd(n+3));
      if(xx<x0-30||xx>x1+30||Math.abs(xx-roadX(s.x))<82)continue;
      traffic.push([xx,roadY(xx)+(sign>0?13:-5),['#b4836d','#b6b38b','#7a939e','#a78c71'][Math.abs(n)%4],sign]);
    }
    for(const [x,y,col,sign] of traffic)if(sign<0)car(g,x,y,col,sign,.72);
    // The spot at each stop is shared by the van and the customer, with no screen-space reset.
    const vx=roadX(s.x),isServing=s.phase==="Deliver package",stow=s.site===0;
    const lane=s.site===null?Math.min(1,Math.sin(s.progress*Math.PI)*4):0;
    const vy=roadY(vx)-4+lane*(s.dir>0?17:1);
    const avail=stow&&s.phase==="Return to warehouse for replenishment"?Math.round(d.capacity*s.progress):stow&&s.phase==="Warehouse loading"?Math.round(d.capacity*s.progress):d.capacity-s.load;
    parcelVan(g,vx,vy,s.dir,avail,isServing&&s.progress>.22&&s.progress<.86);
    for(const id of queue)recipient(g,s,d,id);
    if(stow&&s.progress<1){
      const px=mix(vx-73,vx-23,s.progress);person(g,px,vy-8,'#426c66',s.progress*26,true);
    }
    for(const [x,y,col,sign] of traffic)if(sign>0)car(g,x,y,col,sign,.75);
    for(let i=lo;i<=hi;i++){
      const x=i*150,y=roadY(x);
      if(i%4===0){
        shape([[x-39,y+86],[x+50,y+76],[x+80,y+96],[x-15,y+109]],'#c6bf9b');
        for(let j=0;j<3;j++){const xx=x+j*24-18,yy=y+88-j*2;oval(xx,yy,9,4,'#b18a5a');line([[xx,yy],[xx,yy+12]],'#796e59',2);oval(xx,yy-6,11,4,['#bb8466','#e2c781','#82a092'][j]);}
      }else{
        tree(g,x-21,y+140,20+rnd(i+31)*10,i%3===0?2:0);tree(g,x+54,y+152,16+rnd(i+77)*12);
        if(i%3===0)building(g,x+18,y+239,Math.abs(i+284),'farm',true);
      }
      for(let j=0;j<4;j++){const xx=x+j*31+12;oval(xx,y+70+rnd(i+j)*13,1.7,1,'#91a580');}
    }
  }
  function hud(g,s,d){
    const {W,rect,txt,panel}=g,m=16,y=15;
    const cap=d.capacity;
    const nearest=d.positions.findIndex(v=>v>=s.x);
    const district=districts[region(Math.max(0,nearest))];
    panel(m,y,Math.min(W-32,239),50,'#203f3cef');
    const place=landmarkNames[s.site];
    txt(place?district+' / '+place:district,m+13,y+15,12,'#b6d5c2');txt(s.site!==null?pointName(s.site)+' · '+s.phase:pointName(s.from)+' → '+pointName(s.target),m+13,y+34,16,'#fff4d9','left',700);
    const h=46,w=178;
    panel(16,g.H-h-14,w,h,'#fff8e9ed');
    txt("Vehicle 01",27,g.H-43,12,INK);txt("Available for service "+(cap-s.load)+' / '+cap,27,g.H-24,14,TEAL);
    for(let j=0;j<cap;j++)rect(110+(j%4)*14,g.H-49+Math.floor(j/4)*10,11,7,j<cap-s.load?'#cb9649':'#b7c3b4');
    if(s.phase==="The ninth order exceeds capacity"){
      const bw=Math.min(W-225,215);panel(W-bw-15,g.H-59,bw,44,'#9c443a');txt("S36 No quota remaining",W-bw/2-15,g.H-37,16,'#fff5df','center',700);
    }else if(s.phase==="waiting service window"){
      const bw=Math.min(W-210,227);panel(W-bw-15,g.H-59,bw,44,'#6d6044');
      txt("distance S36 open window "+Math.ceil(d.windows[s.target-1][0]-s.t)+" min",W-bw/2-15,g.H-37,15,'#fff5df','center');
    }
  }
  function street(g,s,d){
    const {W,H,ctx,rect,shape}=g,vx=roadX(s.x),last=roadX(d.positions[d.positions.length-1]);
    const stationary=s.site!==null;
    const span=stationary?0:Math.abs(d.positions[s.from]-d.positions[s.target]);
    const transit=span>45?Math.sin(Math.PI*s.progress)**.8:0;
    const z=(W<730?1.17:1.14)*(1-.43*transit);
    const center=clamp(vx+(stationary?0:s.dir*65*Math.sin(Math.PI*s.progress)),25,last-10),
       left=center-W*.46/z,top=roadY(vx)-H*.55/z;
    rect(0,0,W,H,'#c2cfac');ctx.save();ctx.scale(z,z);ctx.translate(-left,-top);
    const lo=left,hi=left+W/z;
    for(let i=Math.floor(lo/160)-1;i<=Math.ceil(hi/160);i++){
      const x=i*160,y=roadY(x);
      shape([[x-70,y-280],[x+135,y-290],[x+164,y-125],[x-40,y-122]],i%2?'#c8cba7':'#babf9a');
      shape([[x-4,y+21],[x+174,y+17],[x+207,y+215],[x+26,y+210]],i%3?'#bdcaa3':'#cbd3ae');
    }
    dressing(g,s,d,lo-85,hi+85);ctx.restore();hud(g,s,d);
  }
  function atlas(g,s,d){
    const {W,H,rect,shape,line,oval,txt,panel}=g;
    rect(0,0,W,H,'#d3d9ba');
    const kmMax=d.positions[d.positions.length-1],ax=48,bx=W-57;
    const pt=km=>{const q=km/kmMax;return [mix(ax,bx,q),377-187*q+38*Math.sin(q*6.3)];};
    for(let i=0;i<55;i++){
      const x=rnd(i+70)*W,y=95+rnd(i+11)*335,sw=14+rnd(i+80)*43;
      shape([[x,y],[x+sw,y-6],[x+sw+9,y+8],[x+5,y+15]],['#c3cca6','#b4c5a1','#c9cbab'][i%3]);
    }
    const river=Array.from({length:22},(_,j)=>[W*(.36+.08*Math.sin(j*.32)),j*27-20]);
    line(river,'#adbf9f',28);line(river,'#8ab9b0',18);
    const pts=Array.from({length:81},(_,j)=>pt(j*kmMax/80));
    line(pts,'#eee5ca',22);line(pts,'#89968a',13);
    const startKm=d.positions[s.from],actual=s.x,a=Math.min(startKm,actual),b=Math.max(startKm,actual);
    if(s.site===null){const trace=Array.from({length:45},(_,j)=>pt(mix(a,b,j/44)));line(trace,TEAL,5);}
    d.positions.forEach((km,id)=>{const [x,y]=pt(km);oval(x,y,id===s.site?5:2.8,id===s.site?5:2.8,id>=36?TEAL:'#657c6c');});
    const [dx,dy]=pt(0);solid(g,dx-20,dy-9,35,24,14,'#bdba9c','#939780','#ddd0ab');rect(dx-12,dy-24,15,13,'#70867b');txt("Distribution warehouse",dx,dy+25,14,INK,'center');
    const show=[{id:16,label:"farm"}, {id:30,label:"river bank"}, {id:36,label:"S36–43 Settlement"}, {id:51,label:"S44–51 Shopping Street"}];
    show.forEach(({id,label},j)=>{const [x,y]=pt(d.positions[id]),off=j===2?50:-62,px=clamp(x,52,W-65),py=y+off;
      line([[x,y+(off>0?7:-7)],[px,py+(off>0?-11:11)]],'#728771',1.5);
      if(j<2){tree(g,px-14,py-6,11,j===0?0:1);tree(g,px+8,py-6,14);}
      else{solid(g,px-15,py-12,19,j===2?20:10,8,'#c6bda2','#9f9f88','#e5d4b0');solid(g,px+9,py-11,15,15,7,'#b89b81','#958574','#dfc3a2');}
      txt(label,px,py+6,13,INK,'center',700);
    });
    const [xx,yy]=pt(s.x);parcelVan(g,xx,yy-12,s.dir,d.capacity-s.load,s.phase==="Deliver package",.55);
    txt("Away from the warehouse "+Number(s.x.toFixed(1))+' km',clamp(xx,64,W-65),yy-55,14,INK,'center',750);
    hud(g,s,d);
  }
  function compare(g,d,f){
    const {W,H,rect,line,txt,oval}=g;
    rect(0,0,W,H,'#e3e5d2');
    const horizon=d.positions[d.positions.length-1], x=km=>44+(W-88)*km/horizon;
    const fork=d.stops[8][0],depot=d.stops[9][0],next=d.stops[10][0];
    for(const [k,y] of [[0,H*.31],[1,H*.68]]){
      const s=state(d,k,f),roadTop=y+22,col=k?BAD:TEAL;
      const cap=d.capacity-s.load;
      txt(k?"Go directly to stop nine":"Return to warehouse for loading",28,y-77,19,col,'left',750);
      txt(s.phase+'  ·  '+Math.round(s.distance)+' km',28,y-51,16,INK);
      line([[x(0),roadTop],[x(horizon),roadTop]],'#8b9b89',12);
      for(const [label,id,dy] of [["Warehouse",depot,31],['S'+next,next,30],['S'+fork,fork,53]]){
        oval(x(d.positions[id]),roadTop,4,4,col);txt(label,x(d.positions[id]),roadTop+dy,13,INK,'center');
      }
      const active=s.site===null&&s.from!==s.target;
      if(active)line([[x(d.positions[s.from]),roadTop+7],[x(s.x),roadTop+7]],col,3);
      parcelVan(g,x(s.x),roadTop-6,s.dir,cap,s.phase==="Deliver package",.65);
      const cx=clamp(x(s.x),92,W-94);txt("Available for service "+cap+" grid",cx,roadTop-41,15,col,'center',750);
      if(k&&s.phase==="The ninth order exceeds capacity"){person(g,x(d.positions[next])+8,roadTop+7,'#ae694d',0,false);}
    }
    const archived=state(d,0,f);txt("Same model moment · "+Math.floor(archived.t)+" min",W/2,H-26,16,INK,'center');
  }
  window.ORTOPIA_LABS.P0494={
    title:"Two-trip neighborhood delivery with mobile parcel locker",action:"Select the driving instructions after the first eight orders have been delivered. See if the car returns to the warehouse to make up eight spaces, and then observe the ninth picker.",
    choices:["Return to warehouse for replenishment · Archive","Go directly to the next service point"],duration:84,
    views:["Follow Parcel Locker","Route panorama","Compare the two routes at the same time"],
    endAt(d,k){return k?clockAt(d,d.windows[d.stops[10][0]-1][0],true):1;},
    scope:"Play back the first two deliveries of car No. 1. In the original instance, 51 stations are on the same line as the warehouse, and the vehicle location, mileage, stops, time window and eight-cell capacity are all taken from the instance. Block buildings, curves, residents and background traffic are shown as illustrations. The screen changes speed according to events, fast for long distance driving, and slow for deliveries and loading.",
    chapters(d,k){
      const tour=d.stops,arrival=tour[8][2]+d.positions[tour[8][0]]-d.positions[tour[10][0]];
      return [[0,"Outbound loading"],[tour[1][1]-.6,"first stop delivery"],[tour[8][1]-.5,"The eighth order and the return position diverge"],
        [k?arrival-.5:tour[9][1]-.6,k?"Arrive early S36":"Return to warehouse for loading"],[tour[10][1]-.5,"Ninth single window opening"]].map(([t,label])=>({label,at:clockAt(d,t,true)}));
    },
    frame:state,draw(canvas,s,d,k,f,view=0){const g=brush(canvas);if(view===2)compare(g,d,f);else if(view===1)atlas(g,s,d);else street(g,s,d);}
  };
})();
