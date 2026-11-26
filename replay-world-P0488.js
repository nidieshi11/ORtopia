/* A single riverfront neighborhood. Periods determine orders and receipts;
   positions along the street interpolate the archived events for playback. */
(() => {
  'use strict';
  const W=1210, H=520;
  const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
  const between=(t,a,b)=>clamp((t-a)/(b-a));
  const mix=(a,b,v)=>a+(b-a)*clamp(v);
  const easing=v=>v*v*(3-2*v);
  const fmt=v=>Number(v.toFixed(3)).toString();
  const shirts=['#e6a15b','#597f9f','#9d6f91','#668b6a','#ba6b51','#5c9697','#bf8d43'];
  const vehicles=['#e9a855','#79aaa2','#a5b6cc','#d7956e','#d0b669','#a9a5bc'];
  const ink='#253e42';
  function path(points) {
    const edges=points.slice(1).map(([x,y],i)=>Math.hypot(x-points[i][0],y-points[i][1]));
    const length=edges.reduce((a,b)=>a+b,0);
    return f=>{
      let distance=clamp(f)*length;
      for(let i=0;i<edges.length;i++){
        if(distance<=edges[i]||i===edges.length-1){
          const k=clamp(distance/edges[i]);
          return [mix(points[i][0],points[i+1][0],k),mix(points[i][1],points[i+1][1],k)];
        }
        distance-=edges[i];
      }
    };
  }
  const freightRoad=[[83,200],[140,214],[228,253],[303,275],[337,274],[452,242],[496,232],[539,230],[573,246],[606,247]];
  const departing=[[606,247],[672,255],[724,254],[788,235],[863,236],[1010,255],[1100,228],[1260,215]];
  const upstream=path(freightRoad),downstream=path(departing);
  const arrivals=[[834,109],[900,163],[976,215],[898,117]];
  const approaches=arrivals.map(([x,y])=>path([[x,y],[x-5,y+14],[852,181],[811,201],[773,207],[749,210]]));
  const crossing=[[717,220],[707,230],[674,231],[624,220],[559,214],[533,215],[515,221],[509,250],[516,284],[530,318],[548,343],[566,357]];
  const doorPaths=[
    [[538,363],[505,367],[483,375],[480,410],[484,429],[509,429],[526,423]],
    [[575,370],[575,395],[574,429],[573,449],[587,455],[601,448]],
    [[600,356],[629,355],[648,367],[648,430],[651,451],[671,456],[686,450]]
  ];
  const homes=doorPaths.map(end=>path(crossing.concat(end)));
  const toStation=path([[717,220],[733,229],[763,225],[790,215],[828,211],[855,216],[864,229],[866,247],[880,271],[898,290],[919,301],[945,326],[970,335],[983,343]]);
  const busRoute=path([[430,389],[477,378],[535,359],[613,343],[743,348],[833,366],[914,369],[954,361],[988,353]]);
  const busExit=path([[988,353],[1026,355],[1081,382],[1150,390],[1265,386]]);
  const busArrival=id=>2.65+2*id;
  function buyerRoute(row,j,k){
    const sold=k<row.parcels,checkout=j+saleTime(k);
    const dest=(j+2*k)%homes.length;
    const walking=sold?1.86+dest*.2:1.7;
    const stationArrival=checkout+walking;
    const busId=Math.max(0,Math.ceil((stationArrival-busArrival(0)-.07)/2));
    return {sold,checkout,dest,walking,busId,end:sold?stationArrival:busArrival(busId)+.13};
  }
  const handCart=path([[589,239],[596,227],[623,209],[660,211],[674,215]]);
  const loadingEnd=.38;
  const saleTime=k=>.50+.08*k;
  function which(history,at,fallback){
    let k=fallback;
    for(const e of history||[]){if(e.at>at+1e-10)break;k=e.choice;}
    return k;
  }
  function frame(data,mode,f,history) {
    const n=data.path.length,t=clamp(f)*n,index=Math.min(n-1,Math.floor(t));
    const phase=t-index,rows=[];
    let previous=data.initialPipeline,sales=0,loss=0;
    for(let j=0;j<=index;j++){
      const [demand,supply]=data.path[j];
      const order=[data.orderMax,data.orderMax/2,0][which(history,j/n,mode)];
      const received=Math.min(previous,supply),sold=Math.min(received,demand);
      const parcels=Math.round(received*4),visits=Math.round(demand*4);
      const row={period:j+1,pipe:previous,demand,supply,order,received,sold,parcels,visits};
      rows.push(row);
      for(let k=0;k<visits;k++){
        if(t>=j+saleTime(k)){
          if(k<Math.round(sold*4))sales+=.25;
          else loss+=.25;
        }
      }
      previous=order;
    }
    const row=rows[index];
    const taken=Math.min(row.parcels,Math.max(0,Math.floor((phase-saleTime(0)+1e-9)/.08)+1));
    const shelf=phase<loadingEnd?0:row.parcels-taken;
    return {t,index,phase,rows,shelf,loss,sales,clock:'第 '+(index+1)+' / '+n+' 期',metrics:[
      ['上期在途订单',fmt(row.pipe)],['本期可交付',fmt(row.received)],['累计成交',fmt(sales)],['累计失销成本',fmt(loss*data.penalty)]
    ]};
  }
  function pen(c){
    function rect(x,y,w,h,color){c.fillStyle=color;c.fillRect(x,y,w,h);}
    function polygon(points,color){c.fillStyle=color;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();}
    function line(points,color,w=1,dash=[]){c.strokeStyle=color;c.lineWidth=w;c.lineJoin='round';c.lineCap='round';c.setLineDash(dash);c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke();c.setLineDash([]);}
    function oval(x,y,w,h,color){c.fillStyle=color;c.beginPath();c.ellipse(x,y,w,h,0,0,Math.PI*2);c.fill();}
    function txt(msg,x,y,size,color=ink,align='left',weight=650){c.font=weight+' '+size+'px system-ui, "Microsoft YaHei", sans-serif';c.fillStyle=color;c.textBaseline='middle';c.textAlign=align;c.fillText(msg,x,y);}
    return {c,rect,polygon,line,oval,txt};
  }
  function block(g,x,y,w,h,d,wall,side,roof) {
    const {polygon,rect,line}=g,k=d*.48;
    polygon([[x,y],[x+w,y],[x+w+d,y-k],[x+d,y-k]],roof);
    rect(x,y,w,h,wall);
    polygon([[x+w,y],[x+w+d,y-k],[x+w+d,y+h-k],[x+w,y+h]],side);
    line([[x,y],[x+w,y],[x+w+d,y-k]],'#f0e6cc',1.1);
  }
  function tree(g,x,y,scale=1){
    const {oval,line}=g,s=scale;
    oval(x+3*s,y,10*s,3*s,'#9ea993');line([[x,y],[x,y-17*s]],'#756d55',3*s);
    oval(x,y-18*s,10*s,10*s,'#557d69');oval(x-4*s,y-22*s,9*s,8*s,'#80a185');oval(x+3*s,y-26*s,6*s,6*s,'#a2b68d');
  }
  function windows(g,x,y,w,n,floors,shade){
    for(let j=0;j<floors;j++)for(let i=0;i<n;i++){
      const px=x+i*w/n,py=y+13*j;
      g.rect(px,py,7,8,shade);g.rect(px,py,7,1.6,'#d7d3bc');g.rect(px+3,py,1,7,'#acb8ae');
    }
  }
  function tower(g,x,y,w,h,colors){
    block(g,x,y,w,h,11,colors[0],colors[1],colors[2]);
    windows(g,x+6,y+6,w-8,Math.max(2,Math.floor(w/15)),Math.floor((h-3)/13),'#788d90');
    block(g,x+w*.25,y-8,14,5,5,'#a5a392','#888f85','#c3c6b3');
  }
  function label(g,text,x,y,bg='#234b4b',size=13){
    g.c.font='650 '+size+'px system-ui, "Microsoft YaHei", sans-serif';
    const w=g.c.measureText(text).width+13;g.rect(x,y-10,w,21,bg);g.txt(text,x+6.5,y+.2,size,'#fff8df');
  }
  const cityRoad=[[-80,172],[83,200],[140,214],[228,253],[303,275],[337,274],[452,242],[496,232],[573,246],[672,255],[724,254],[788,235],[863,236],[1010,255],[1100,228],[1245,216]];
  const river=[[272,-20],[284,55],[299,123],[308,178],[313,230],[309,278],[287,331],[280,375],[256,424],[210,525],[186,580],[378,580],[431,490],[429,437],[434,397],[466,332],[473,284],[456,238],[449,187],[434,130],[427,60],[399,-20]];
  function background(g) {
    const {rect,polygon,line,oval,txt}=g;
    rect(-100,-80,1450,700,'#d8dfcb');
    // Buildings sit on both banks. Only the freight street crosses the water at this level.
    polygon([[-20,75],[235,57],[291,148],[300,207],[240,225],[-20,164]],'#d2c8ad');
    polygon([[470,70],[679,44],[813,77],[986,47],[995,175],[830,202],[503,177]],'#cad4bd');
    polygon(river,'#7fb9b5');
    for(let i=0;i<32;i++){const y=i*18-15,x=y<200?320+y*.2:360-Math.max(0,y-300)*.34;
      line([[x+(i%3)*13,y],[x+18+(i%3)*13,y+1],[x+30+(i%3)*13,y-1]],i%2?'#a6cec0':'#94c7bf',1.4);}
    const bankL=river.slice(0,12), bankR=river.slice(12).reverse();
    [bankL,bankR].forEach(b=>{line(b,'#a3aa8d',10);line(b,'#dad7bb',5);});
    const colors=[['#c6beaa','#9fa79d','#d8d2bd'],['#c7baa4','#a39987','#e1d3bb'],['#b3c4b8','#91a799','#cdd5c5']];
    for(const [x,y,w,h,k] of [[-8,16,54,53,1],[58,6,60,61,0],[132,15,45,50,2],[194,8,48,59,0],[462,-7,57,71,1],[544,5,44,56,2],[593,-8,77,65,0],[698,-12,46,84,1],[783,5,58,66,0],[875,-8,75,75,2]])tower(g,x,y,w,h,colors[k]);
    const local=[[-20,77],[170,88],[243,105],[265,133],[264,190],[240,227],[229,254]],east=[[489,232],[476,204],[463,161],[463,106],[482,93],[592,78],[758,85],[865,110],[995,85],[1208,115]];
    [local,east].forEach(a=>{line(a,'#e6dfcc',15);line(a,'#a7aaa0',9);});
    // Public housing overlooking the shop and its pedestrian alleys.
    for(const [x,y,w,h,k] of [[773,62,63,51,0],[863,75,51,64,1],[925,71,44,60,2]])
      tower(g,x,y,w,h,colors[k]);
    const walk=[[975,200],[854,175],[805,199],[750,206],[716,217]];
    line(walk,'#d0c5ac',24);line(walk,'#eee2c5',18);
    line([[844,117],[851,145],[854,175]],'#e9dcc1',14);
    line([[906,146],[901,173],[871,180]],'#e9dcc1',12);
    // Southern frontage, a footbridge path and local activity keep the wider district connected.
    const south=[[-20,327],[74,335],[155,354],[230,378],[245,361],[245,318],[228,255]],southE=[[425,448],[429,390],[521,366],[622,344],[742,349],[827,370],[913,370],[955,362],[989,353],[1026,355],[1081,382],[1150,390],[1234,388]];
    [south,southE].forEach(a=>{line(a,'#cbc3ad',28);line(a,'#969f96',20);line(a,'#e6dbbd',1,[9,10]);});
    for(const [x,y,w,h,k] of [[-9,356,57,62,0],[69,389,65,49,2],[157,407,53,58,1],[491,372,69,51,2],[581,383,47,65,1],[661,382,66,68,0],[782,409,60,61,2],[887,397,62,57,1]])tower(g,x,y,w,h,colors[k]);
    for(const [x,y,w,h,k] of [[1001,120,54,62,2],[1116,78,70,78,1],[1179,144,37,59,0],[1083,404,61,64,0],[1003,414,47,55,1],[1154,431,59,45,2]])tower(g,x,y,w,h,colors[k]);
    // South-bank walkways lead to actual front doors drawn below.
    for(const way of doorPaths)line([[550,345],[566,357],...way],'#e9ddc4',6);
    for(const [x,y] of [[526,423],[601,448],[686,450]]){
      rect(x-6,y-16,12,17,'#57706d');line([[x,y-15],[x,y]],'#d5cdb5',1);rect(x+3,y-8,1,3,'#eac789');}
    line([[855,215],[867,249],[881,270],[898,290],[919,301],[945,326],[969,335],[984,343]],'#e9ddc4',16);
    polygon([[957,329],[1019,321],[1040,343],[983,352]],'#c7bfa7');
    block(g,973,295,47,3,9,'#638178','#435c59','#9aa99a');
    [976,1017].forEach(x=>rect(x,298,2.6,37,'#526965'));
    rect(983,319,25,6,'#b98f64');rect(987,325,2,6,'#796e5c');rect(1004,325,2,6,'#796e5c');
    label(g,'东岸公交站',969,288,'#496e67',11);
    for(const [x,y] of [[966,257],[1026,274],[1090,253],[1146,266],[1052,326],[1117,346],[1165,357]])tree(g,x,y,1);
    block(g,1043,254,53,49,15,'#b69c81','#958970','#ceb991');
    rect(1050,276,25,27,'#446d68');polygon([[1040,269],[1098,269],[1106,275],[1037,275]],'#6c9284');
    for(let i=0;i<3;i++){oval(1051+i*11,316+i,4.2,4.2,'#657773');oval(1051+i*11,316+i,2.9,2.9,'#d0d3bb');}
    for(const [x,y] of [[15,291],[55,301],[96,308],[138,316],[184,327],[237,346],[486,312],[489,340],[575,338],[621,327],[681,328],[739,329],[802,339],[873,351],[942,357],[758,153],[788,165],[934,154],[234,155],[249,176],[476,140],[503,151]])tree(g,x,y,.78);
    for(const [x,y] of [[27,459],[78,468],[129,486],[181,503],[468,453],[513,460],[551,452],[761,478],[822,489],[918,479]])tree(g,x,y,1.04);
    // North quay warehouses, canopy and open loading doors.
    block(g,18,115,157,77,30,'#b78562','#926b52','#d5ad78');
    polygon([[14,118],[27,99],[49,102],[59,89],[82,93],[95,79],[119,85],[130,74],[158,81],[176,86],[176,118]],'#bd9168');
    for(let i=0;i<3;i++){const x=35+i*45;rect(x,148,31,44,'#5c655b');rect(x+3,153,25,36,'#384f4d');rect(x,145,31,5,'#cbbba0');}
    for(let i=0;i<17;i++)line([[21+i*9,124],[21+i*9,142]],'#a57d60',1);
    label(g,'河岸供应仓',31,133,'#485b50',14);
    for(let i=0;i<4;i++)box(g,19+i*9,195+(i%2)*2,7);
    for(let i=0;i<12;i++)box(g,184+(i%4)*9,173+Math.floor(i/4)*6,8);
    for(let i=0;i<3;i++){rect(18+i*40,108-i*3,7,9,'#818373');rect(16+i*40,107-i*3,11,3,'#aaa48f');}
    // The sales area faces the alley. The loading ramp occupies the west corner.
    block(g,549,128,165,64,25,'#d8caa5','#a49677','#c2b898');
    for(let i=0;i<5;i++){rect(554+i*31,144,25,37,'#52756d');rect(556+i*31,146,22,22,'#95b7a5');}
    polygon([[541,143],[715,143],[726,153],[537,153]],'#b76249');
    for(let i=0;i<13;i++)polygon([[544+i*13,143],[551+i*13,143],[552+i*13,153],[544+i*13,153]],'#eee0bb');
    for(let i=0;i<3;i++)rect(551+i*78,153,3,39,'#9b7655');
    label(g,'滨河社区市场',570,132,'#285f58',14);
    for(const x of [555,597,657]){rect(x,178,16,9,'#aa8c62');for(let i=0;i<4;i++)oval(x+2+i*3.5,177,2.3,2.1,x%3?'#c69e58':'#739875');}
    polygon([[548,194],[716,194],[756,209],[732,231],[601,222],[558,217]],'#e3d8bd');
    const rackX=670;rect(rackX-15,213,55,5,'#885e42');rect(rackX-12,218,4,7,'#7c6c56');rect(rackX+32,218,4,7,'#7c6c56');
    rect(552,194,31,8,'#a6a48d');for(let j=0;j<6;j++)line([[552+j*5,196],[556+j*5,201]],'#e1b55e',2);
    for(const [x,y] of [[785,184],[873,161],[930,182],[505,184],[249,216]])tree(g,x,y,.85);
    // Main one-way shipping road, bridge deck and a striped pedestrian crossing.
    line(cityRoad,'#c1bda4',49);line(cityRoad,'#e4dec7',43);line(cityRoad,'#7c8c89',34);
    line(cityRoad,'#d6d6bd',1.8,[11,12]);
    line([[309,276],[337,274],[451,242]],'#8b9992',38);line([[309,276],[337,274],[451,242]],'#737f80',30);
    line([[309,259],[334,257],[451,225]],'#426b6a',3);
    for(let i=0;i<10;i++){const x=326+i*13,y=258-Math.max(0,x-335)*.28;line([[x,y],[x,y-8]],'#648783',2);}
    line([[309,252],[334,250],[450,218]],'#719490',2);
    for(let i=0;i<7;i++)line([[502+i*3.8,217],[498+i*3.8,246]],'#d7d6bf',1.7);
    for(let i=0;i<7;i++)line([[849+i*4,221],[856+i*4,250]],'#d7d6bf',1.7);
    txt('渡桥路',251,287,11,'#4e6864');txt('社区步道',856,200,11,'#627565');
    // East-bank plaza, with a sheltered exit through which customers can leave the scene.
    line([[512,254],[519,291],[534,318],[558,341]],'#c8bda2',18);
    line([[512,254],[519,291],[534,318],[558,341]],'#e8dbc1',13);
    block(g,547,295,36,39,10,'#b6b39e','#8b9481','#c8c8ac');
    rect(554,309,16,26,'#52675f');
    for(const [x,y] of [[30,319],[152,347],[625,330],[726,331],[873,364]]){
      line([[x,y],[x,y-23],[x+5,y-25]],'#62746c',2);oval(x+5,y-25,3,2,'#e7d5a5');
    }
  }
  function box(g,x,y,w=8){
    const h=w*.69,d=w*.34;
    g.rect(x-w/2,y-h,w,h,'#b97844');
    g.polygon([[x-w/2,y-h],[x-w/2+d,y-h-d*.5],[x+w/2+d,y-h-d*.5],[x+w/2,y-h]],'#e7b770');
    g.polygon([[x+w/2,y-h],[x+w/2+d,y-h-d*.5],[x+w/2+d,y-d*.5],[x+w/2,y]],'#9e683c');
    g.rect(x-1,y-h,2,h,'#edd0a0');
  }
  function person(g,x,y,shirt,step,parcel=false,size=1){
    const {oval,line,polygon}=g,r=size;
    oval(x+1,y+1,4.5*r,1.6*r,'#859183');
    const z=Math.sin(step)*2*r;
    line([[x-1*r,y-5*r],[x-2*r-z,y]],'#354e50',1.9*r);line([[x+1*r,y-5*r],[x+2*r+z,y]],'#354e50',1.9*r);
    polygon([[x-2.6*r,y-11*r],[x+2.3*r,y-11*r],[x+3*r,y-5*r],[x-2.6*r,y-5*r]],shirt);
    oval(x,y-13*r,2.3*r,2.7*r,'#bb8862');oval(x-.3*r,y-14.6*r,2.2*r,1.2*r,'#4e4540');
    line([[x-2*r,y-10*r],[x-3.8*r,y-6*r+z*.4]],shirt,1.6*r);
    if(parcel)box(g,x+3*r,y-4*r,4.3*r);
  }
  function truck(g,x,y,index){
    const {rect,polygon,oval,txt}=g,col=vehicles[index%vehicles.length];
    oval(x,y+1,28,4.5,'#687b74');rect(x-27,y-5,49,5,'#354749');
    block(g,x-28,y-18,33,14,5,col,'#61817d','#f3ddaf');
    polygon([[x+6,y-15],[x+16,y-15],[x+23,y-8],[x+24,y-3],[x+6,y-3]],'#477973');
    polygon([[x+11,y-13],[x+16,y-13],[x+20,y-9],[x+11,y-9]],'#c8ded4');
    rect(x+21,y-7,3,2,'#f0ce8d');rect(x-28,y-5,2,2,'#cd6851');
    for(const k of [-18,15]){oval(x+k,y-2.5,4.6,4.6,'#35494a');oval(x+k,y-2.5,2.2,2.2,'#b2b6a4');}
    txt(String(index+1).padStart(2,'0'),x-11,y-11,10,'#2d4746','center',750);
  }
  function afterCheckout(trip,t,k){
    const p=between(t,trip.checkout,trip.checkout+trip.walking);
    const [x,y]=(trip.sold?homes[trip.dest]:toStation)(p);
    if(trip.sold)return [x,y];
    const spread=k%5;
    const waitX=x+spread*4*p,waitY=y-(spread%2)*3*p;
    const board=between(t,Math.max(trip.checkout+trip.walking,busArrival(trip.busId)),trip.end);
    return [mix(waitX,996,board),mix(waitY,351,board)];
  }
  function customers(g,s){
    const actors=[];
    s.rows.forEach((row,j)=>{
      const age=s.t-j;
      if(age>4.8)return;
      for(let k=0;k<row.visits;k++){
        const start=k*.027,checkout=saleTime(k),serial=j*5+k;
        const trip=buyerRoute(row,j,k);
        if(age<start||s.t>=trip.end)continue;
        const intro=approaches[(j+k)%approaches.length];
        let x,y,moving=true;
        if(age<.30+start){
          [x,y]=intro(between(age,start,.30+start));
          // Adjacent customers fan out on the shared sidewalk.
          y+=(k%2)*3*between(age,start+.03,.27+start);
        }else if(age<checkout){
          const arrive=.30+start;
          const progress=between(age,arrive,checkout-.012);
          x=mix(749,717,progress);y=mix(210,220,progress)+(k%2)*2*(1-progress);
          moving=age<checkout-.012;
        }else{
          [x,y]=afterCheckout(trip,s.t,k);
          moving=s.t<trip.checkout+trip.walking||s.t>=busArrival(trip.busId);
        }
        actors.push({x,y,shirt:shirts[serial%shirts.length],gait:moving?(age-start)*38+serial:0,pack:age>=checkout&&k<row.parcels});
      }
    });
    actors.sort((a,b)=>a.y-b.y).forEach(a=>person(g,a.x,a.y,a.shirt,a.gait,a.pack,1.15));
  }
  function receiving(g,s) {
    const {rect,oval,line}=g,r=s.rows[s.index],a=s.phase;
    if(r.parcels&&a>=.11&&a<loadingEnd){
      const progress=between(a,.11,loadingEnd),[x,y]=handCart(progress);
      rect(x-10,y-3,19,2,'#52786b');oval(x-6,y,2.4,2.4,ink);oval(x+6,y,2.4,2.4,ink);
      for(let i=0;i<r.parcels;i++)box(g,x-5+(i%2)*8,y-4-Math.floor(i/2)*5,7);
      line([[x-10,y-2],[x-14,y-11]],'#5e715f',2);person(g,x-15,y+1,'#6588a1',progress*27,false,1.06);
    }
    for(let k=0;k<s.shelf;k++)box(g,667+k*9,213,7.6);
    person(g,703,214,'#608165',0,false,1.23);
    const inbound=s.phase<.11?'货车进站':'卸货上架';
    const status=s.phase<loadingEnd?(r.pipe?inbound:s.index?'本期无在途订单':'等待首批来货'):s.shelf?'架上 '+fmt(s.shelf*.25):'货架已空';
    label(g,status,647,175,s.shelf?'#36796a':'#8d6654',11);
  }
  function cityBus(g,t,id){
    const age=t-busArrival(id);
    if(age<-.95||age>1.42)return;
    const [x,y]=age<0?busRoute(easing(between(age,-.95,0))):busExit(easing(between(age,.19,1.42)));
    const {rect,polygon,oval,txt}=g;
    oval(x,y,31,4,'#75877b');rect(x-27,y-20,50,17,'#bc8357');
    polygon([[x-27,y-20],[x-20,y-25],[x+23,y-25],[x+26,y-20]],'#e7d7a6');rect(x-25,y-18,44,9,'#587a78');
    for(let k=0;k<5;k++)rect(x-23+k*8,y-17,6,7,'#b6cbc1');
    rect(x+13,y-18,7,15,age>=0&&age<.19?'#42625f':'#839e90');rect(x+20,y-14,5,10,'#c9a276');
    for(const dx of [-17,15]){oval(x+dx,y-3,4,4,'#344b4c');oval(x+dx,y-3,1.8,1.8,'#a9b5a2');}
    txt('东岸',x-7,y-5.1,6.1,'#fff1cc','center');
  }
  function neighborhoodTraffic(g,t){
    // Local residents walk from separate entrances to destinations on the same bank.
    const walk=path([[478,343],[548,331],[615,316],[701,314],[792,326],[901,346],[981,351]]);
    for(let j=0;j<12;j++){const u=(t+1-j*1.3)/2.8;if(u<0||u>1)continue;
      const [x,y]=walk(u);person(g,x,y,shirts[(j+2)%7],u*70,false,.93);}
    const ferryPath=path([[361,-28],[368,74],[396,170],[389,236],[375,317],[350,411],[337,548]]);
    const [x,y]=ferryPath(t/12);g.line([[x,y-15],[x-8,y-33]],'#a6cfc6',1.6);
    g.polygon([[x-4,y-14],[x+5,y-14],[x+7,y+7],[x+1,y+17],[x-6,y+7]],'#456d72');
    g.rect(x-4,y-6,8,13,'#d9ba85');
    for(let id=0;id<6;id++)cityBus(g,t,id);
  }
  let cachedStreet;
  function street(){
    if(cachedStreet)return cachedStreet;
    const image=document.createElement('canvas');image.width=W*2;image.height=H*2;
    const c=image.getContext('2d');c.scale(2,2);background(pen(c));cachedStreet=image;return image;
  }
  function camera(s,view,aspect){
    const mobile=aspect<1.32;
    if(view===1)return {x:W/2,y:H/2,width:W,height:H,fit:true};
    if(view===2)return {x:747,y:231,width:mobile?265:460,height:mobile?275:245};
    const t=s.t;
    // The camera follows the first freight lot, then two identifiable customer journeys.
    // An empty-handed customer's route branches toward the bus; a carton continues home.
    const focal=(x,y,width)=>({x,y,width:mobile?width*.59:width,height:mobile?width*.59:width*.54});
    const slide=(a,b,p)=>focal(mix(a.x,b.x,p),mix(a.y,b.y,p),mix(a.w,b.w,p));
    const truck=upstream(easing(between(t,.14,1.1)));
    if(t<1.10)return s.rows[0].order?focal(truck[0]+76,truck[1]-23,500):
      slide({x:789,y:185,w:500},{x:682,y:224,w:500},easing(between(t,0,1.1)));
    if(t<2.50)return slide({x:682,y:224,w:500},{x:710,y:216,w:420},easing(between(t,1.1,2.50)));
    const followThird=buyerRoute(s.rows[2],2,0),p=afterCheckout(followThird,Math.min(t,followThird.end),0);
    const thirdEnd=afterCheckout(followThird,followThird.end-.001,0);
    if(t<5.20)return focal(p[0],p[1]-6,433);
    // Travel back along the south promenade to the east crossing, never to the dispatch dock.
    if(t<6.74)return slide({x:thirdEnd[0],y:thirdEnd[1]-6,w:433},{x:724,y:224,w:490},easing(between(t,5.20,6.74)));
    const shortage=buyerRoute(s.rows[6],6,3),q=afterCheckout(shortage,Math.min(t,shortage.end),3);
    if(t<shortage.end)return focal(q[0],q[1]-6,478);
    const bus=busExit(easing(between(t,busArrival(shortage.busId)+.19,busArrival(shortage.busId)+1.42)));
    if(t<busArrival(shortage.busId)+.96)return focal(Math.min(bus[0],1120),bus[1]-9,495);
    // From the station district the market, crossings and successive departing groups share the frame.
    return slide({x:1120,y:370,w:495},{x:871,y:302,w:680},easing(between(t,busArrival(shortage.busId)+.96,12)));
  }
  function customerComparison(s,d){
    // Compare the same quarter-unit request under the actual command history and the archived policy.
    const options=[];
    s.rows.forEach((row,j)=>{
      const ref={...row,parcels:Math.round(4*Math.min(j?d.orderMax:d.initialPipeline,row.supply))};
      for(let k=0;k<row.visits;k++){
        const actual=buyerRoute(row,j,k),baseline=buyerRoute(ref,j,k);
        if(actual.checkout<=s.t)options.push({actual,baseline,j,k,active:s.t<=Math.max(actual.end,baseline.end)});
      }
    });
    return options.findLast(q=>q.active&&q.actual.sold!==q.baseline.sold)||options.findLast(q=>q.actual.sold!==q.baseline.sold)||options.findLast(q=>q.active)||options.at(-1);
  }
  function footprints(g,trip,t,k,col){
    const until=Math.min(t,trip.end),pts=Array.from({length:24},(_,j)=>afterCheckout(trip,mix(trip.checkout,until,j/23),k));
    g.line(pts,col,2,[4,4]);return pts.at(-1);
  }
  function draw(canvas,s,data,mode,f,view=0){
    const c=canvas.getContext('2d'),w=canvas.width,h=canvas.height;
    if(!w||!h)return;
    const compare=view===3?customerComparison(s,data):null;
    let cam=camera(s,view===3?2:view,w/h);
    if(compare){
      const {actual,baseline,k}=compare,a=afterCheckout(actual,Math.min(s.t,actual.end),k),b=afterCheckout(baseline,Math.min(s.t,baseline.end),k);
      const spanX=Math.abs(a[0]-b[0])+150,spanY=Math.abs(a[1]-b[1])+115,aspect=w/h;
      const width=Math.max(aspect<1.3?250:395,spanX,spanY*aspect);
      cam={x:(a[0]+b[0])/2,y:(a[1]+b[1])/2-12,width,height:width/aspect};
    }
    const scale=cam.fit?Math.min(w/cam.width,h/cam.height):Math.max(w/cam.width,h/cam.height);
    const x=clamp(cam.x-w/(2*scale),0,Math.max(0,W-w/scale));
    const y=clamp(cam.y-h/(2*scale),0,Math.max(0,H-h/scale));
    const ox=(w>W*scale?(w-W*scale)/2:0)-x*scale,oy=(h>H*scale?(h-H*scale)/2:0)-y*scale;
    c.setTransform(1,0,0,1,0,0);c.fillStyle='#dbe3d3';c.fillRect(0,0,w,h);
    c.setTransform(scale,0,0,scale,ox,oy);c.drawImage(street(),0,0,W,H);const g=pen(c);
    neighborhoodTraffic(g,s.t);
    for(let j=Math.max(0,s.index-1);j<=s.index;j++){
      const row=s.rows[j],age=s.t-j;
      if(!row.order||age>1.90)continue;
      const at=age<.14?[mix(70,83,easing(age/.14)),mix(179,200,easing(age/.14))]:
        age<1.10?upstream(easing(between(age,.14,1.10))):downstream(easing(between(age,1.39,1.90)));
      c.save();
      if(age<.14){c.beginPath();c.rect(0,189,W,H-189);c.clip();}
      truck(g,...at,j);
      c.restore();
      if(age<1.39){
        const next=s.rows[j+1];
        const note=age<.14?'配车 '+fmt(row.order):age<1||!next?'在途 '+fmt(row.order):'到货 '+fmt(next.received);
        label(g,note,at[0]-29,at[1]-33,'#345955',11);
      }
    }
    // The near-side bridge railing occludes the wheels as the trucks cross.
    g.line([[311,293],[339,292],[455,260]],'#71938b',3);
    for(let i=0;i<10;i++){const x=323+i*13,y=290-Math.max(0,x-335)*.28;g.line([[x,y],[x,y-6]],'#78978d',1.8);}
    receiving(g,s);customers(g,s);
    if(compare){
      const {actual,baseline,j,k}=compare,b=footprints(g,baseline,s.t,k,'#75858e'),a=footprints(g,actual,s.t,k,'#a67435');
      const same=actual.sold===baseline.sold;
      if(!same){g.oval(b[0],b[1]-2,5,2,'#748695');label(g,'归档 · '+(baseline.sold?'取到货':'缺货'),b[0]-21,b[1]-31,'#607a84',10);}
      g.oval(a[0],a[1],6,2,'#a97737');label(g,(j+1)+' 期 · 顾客 '+(k+1)+' · '+(actual.sold?'取到货':'缺货'),a[0]-20,a[1]-14,'#966633',10);
    }
    if(view===0){
      const selected=s.t>=6.74?[6,3]:s.t>=2.50&&s.t<5.20?[2,0]:null;
      if(selected){
        const [j,k]=selected,trip=buyerRoute(s.rows[j],j,k);
        if(s.t<trip.end){
          const [x,y]=afterCheckout(trip,s.t,k),color=trip.sold?'#286c5e':'#9c614a';
          g.oval(x,y+1,6,1.5,color);g.line([[x+3,y-14],[x+8,y-22],[x+11,y-22]],color,.9);
          label(g,'第 '+(j+1)+' 期 · '+(trip.sold?'带货回家':'缺货离开'),x+11,y-24,color,10);
        }
      }
    }
  }
  window.ORTOPIA_LABS.P0488={
    title:'河岸供应仓与社区市场',action:'选择以后各期的订货量。每期开头发出订单，上一期的订单继续运输，到货量取决于本期供应。每个小箱对应 0.25 单位需求。',
    choices:['按归档量订货','改订半量','停止订货'],live:true,duration:72,
    views:['沿线观察','街区全景','市场近看','顾客去向对照'],
    chapters:d=>[{label:'首批车过桥',at:.69/d.path.length},{label:'首批到货与销售',at:1.15/d.path.length},{label:'跟随第三期顾客',at:2.50/d.path.length},{label:'第七期供应缩减',at:6.70/d.path.length},{label:'东岸乘车离开',at:8.60/d.path.length}],
    scope:'归档见证路径 1 的前 12 期。到货受本期供应和上期订单限制，未满足的需求当期流失。每箱和每位顾客表示 0.25 单位。街区、步行回家与乘车离开用来追踪销售去向，交通和期内动作时长为示意。完整 65,536 期归档期望成本为 28,672.625。',
    frame,draw
  };
})();
