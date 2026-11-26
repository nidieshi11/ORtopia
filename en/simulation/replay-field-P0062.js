/* small/I002. The reservoirs visualize the usable interval of the storage state. */
(() => {
  'use strict';
  const data = {
    low: 5.788519810535387, high: 8.799276627466059, initial: 5.788519810535387,
    alpha: .8483296427973954, beta: 1.1074951216740403, maxBuy: 4.187868565175994, maxSell: 3.2078633796671716,
    buy: [7.575,6.781,5.779,4.898,4.672,4.047], sell: [11.483,7.655,12.799,7.077,11.942,11.827],
    original: [0,1,-1,0,1,-1]
  };
  const span = data.high - data.low;
  const fmt = (n,k=2) => (Math.abs(n)<1e-8 ? 0 : n).toFixed(k);
  const clamp = (v,a,b) => Math.min(b,Math.max(a,v));
  function plan() { return data.original.map(mode=>({mode,share:1})); }
  function settle(slots) {
    let store = data.initial;
    return slots.map(({mode,share},i)=>{
      const begin = store, target = span * share;
      const buy = mode===1 ? Math.min(data.maxBuy,target/data.alpha,(data.high-begin)/data.alpha) : 0;
      const sell = mode===-1 ? Math.min(data.maxSell,target/data.beta,(begin-data.low)/data.beta) : 0;
      store=clamp(begin+buy*data.alpha-sell*data.beta,data.low,data.high);
      const clipped = mode!==0 && Math.abs(store-begin)<target-1e-8;
      return {mode,share,buy,sell,begin,end:store,clipped,profit:sell*data.sell[i]-buy*data.buy[i]};
    });
  }
  const WATER=[[174,123],[235,123],[352,196],[467,270],[548,270],[606,278],[710,278]];
  const LINE=[[477,226],[500,190],[540,197],[578,175],[620,185],[675,158],[721,171],[766,147]];
  function point(path,progress) {
    const lengths=path.slice(1).map(([x,y],i)=>Math.hypot(x-path[i][0],y-path[i][1]));
    let travel=clamp(progress,0,1)*lengths.reduce((a,b)=>a+b,0);
    for(let i=0;i<lengths.length;i++){
      if(travel<=lengths[i] || i===lengths.length-1){
        const [x,y]=path[i],dx=path[i+1][0]-x,dy=path[i+1][1]-y;
        return [x+dx*travel/lengths[i],y+dy*travel/lengths[i],Math.atan2(dy,dx)];
      }
      travel-=lengths[i];
    }
  }
  function scene(canvas){
    const W=840,H=335,ctx=canvas.getContext('2d'), art=document.createElement('canvas');
    const maxRatio=2;
    function path(c,pts,fill,stroke,width=1){
      c.beginPath();for(let i=0;i<pts.length;i++) i?c.lineTo(...pts[i]):c.moveTo(...pts[i]);
      if(fill){c.closePath();c.fillStyle=fill;c.fill();}
      if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.lineJoin='round';c.lineCap='round';c.stroke();}
    }
    function rect(c,x,y,w,h,color){c.fillStyle=color;c.fillRect(x,y,w,h);}
    function circ(c,x,y,r,color){c.beginPath();c.arc(x,y,r,0,2*Math.PI);c.fillStyle=color;c.fill();}
    function tree(c,x,y,s,color){
      rect(c,x-s*.05,y-s*.36,s*.10,s*.37,'#5c6653');
      path(c,[[x,y-s],[x-s*.27,y-s*.38],[x-s*.11,y-s*.42],[x-s*.36,y-s*.15],[x+s*.36,y-s*.15],[x+s*.12,y-s*.42],[x+s*.26,y-s*.38]],color);
    }
    function tower(c,x,y,s){
      c.save();c.translate(x,y);c.scale(s,s);
      for(const pts of [[[-11,0],[0,-66],[11,0]], [[-14,-50],[14,-50],[0,-62],[-14,-50]],[[-18,-39],[18,-39],[0,-50],[-18,-39]],
        [[-8,-18],[7,-27],[-5,-36],[5,-43]],[[8,-18],[-7,-27],[5,-36],[-5,-43]],[[-10,-1],[8,-16],[-8,-16],[10,-1]]]) path(c,pts,null,'#576863',1.6);
      c.restore();
    }
    function backdrop(c){
      const sky=c.createLinearGradient(0,0,0,190);sky.addColorStop(0,'#c6e1e3');sky.addColorStop(1,'#f3eee0');rect(c,0,0,W,H,sky);
      circ(c,679,40,19,'#fff0c6');
      path(c,[[0,99],[54,57],[98,66],[155,29],[193,55],[247,28],[326,87],[377,61],[424,83],[477,49],[543,75],[606,38],[661,67],[700,42],[769,82],[840,52],[840,150],[0,150]],'#abc1ad');
      path(c,[[0,117],[74,83],[114,90],[165,64],[229,82],[264,60],[317,78],[387,111],[450,91],[508,107],[550,81],[598,89],[675,71],[736,96],[792,75],[840,87],[840,170],[0,170]],'#8ba89a');
      path(c,[[0,122],[80,105],[138,113],[201,88],[259,99],[320,110],[416,141],[516,125],[588,111],[647,124],[741,93],[840,110],[840,207],[0,207]],'#819c83');
      for(let i=0;i<50;i++){
        const x=(i*67)%855, y=117+Math.sin(x*.018)*11+(i%3)*2;
        tree(c,x,y,6+i%9,'#698775');
      }
      const land=[[0,124],[67,130],[152,149],[207,131],[232,96],[250,101],[292,128],[321,136],[367,178],[423,193],[461,217],[510,219],[551,228],[597,225],[624,245],[668,278],[732,285],[789,244],[840,224],[840,335],[0,335]];
      path(c,land,'#b4aa86');
      path(c,land.slice(0,-2),null,'#718459',6);
      for(let i=0;i<5;i++){
        const y=170+i*26;path(c,[[0,y],[81,y+8],[144,y+14],[213,y+6],[262,y-16],[317,y+3],[367,y+40],[418,y+56],[490,y+91],[572,y+97],[641,y+116]],null,i%2?'#ada381':'#c3b99b',2.5);
      }
      for(const [x,y,h] of [[260,108,22],[275,118,31],[303,130,19],[331,146,28],[352,161,18],[396,185,25],[559,226,24],[576,225,17],[802,239,24],[824,230,31]])tree(c,x,y,h,'#466f59');
      path(c,[[168,83],[195,83],[205,137],[173,149]],'#9eaaa0');
      path(c,[[195,83],[204,79],[219,124],[205,137]],'#77877d');
      rect(c,166,78,32,5,'#dfdfc7');
      for(let x=167;x<=199;x+=8)rect(c,x,70,1,9,'#64746b');
      path(c,[[166,72],[199,72]],null,'#64746b',1);
      // Exposed steel penstock, partially embedded in the hillside.
      path(c,WATER,null,'#3f5350',15);path(c,WATER,null,'#b8c6b9',11);path(c,WATER,null,'#678d8e',6);
      for(let i=1;i<22;i++){
        const [x,y,ang]=point(WATER,i/22);
        c.save();c.translate(x,y);c.rotate(ang);rect(c,-1.5,-7,3,14,'#73847d');c.restore();
      }
      // Powerhouse and generator floor, cut away at turbine elevation.
      path(c,[[430,222],[492,222],[504,210],[443,210]],'#c66147');
      path(c,[[492,222],[504,210],[504,257],[492,270]],'#a99974');
      rect(c,430,222,62,45,'#e0c9a3');rect(c,426,265,69,10,'#756f62');
      for(let x=437;x<490;x+=14){rect(c,x,230,8,13,'#546d68');rect(c,x,235,8,2,'#b0b5a0');}
      tower(c,577,222,.92);tower(c,675,206,.96);tower(c,766,202,1.1);
      path(c,LINE,null,'#59665d',1.8);path(c,LINE.map(([x,y])=>[x,y+5]),null,'#66766a',1);
      // Lower intake lip and floating deck.
      rect(c,689,274,34,7,'#84988e');
      for(let x=693;x<724;x+=5)rect(c,x,274,1,7,'#4c625d');
      rect(c,0,314,W,21,'#897f6a');path(c,[[0,314],[142,312],[261,317],[453,314],[592,317],[840,314]],null,'#a59b80',2);
    }
    function basin(c,x0,x1,y,base,top,t,blocked,upper){
      c.save();
      // Intersect water with the dam/valley cross-section as the shoreline retreats.
      const bed=upper?[[0,73],[174,73],[174,139],[127,144],[66,140],[0,136]]
        :[[615,222],[840,222],[840,288],[791,298],[725,303],[683,293],[658,274]];
      c.beginPath();bed.forEach(([x,h],i)=>i?c.lineTo(x,h):c.moveTo(x,h));c.closePath();c.clip();
      const pts=[[x0,base],[x0,y]];
      for(let x=x0;x<=x1;x+=4)pts.push([x,y+Math.sin(x*.072+t*2.4)*.6+Math.sin(x*.12-t*2)*.35]);
      pts.push([x1,y],[x1,base]);
      const gr=c.createLinearGradient(0,top,0,base);gr.addColorStop(0,'#56b6b1');gr.addColorStop(1,'#226c80');
      path(c,pts,gr);path(c,pts.slice(1,-1),null,blocked?'#edb774':'#bcf1da',2);
      for(let i=0;i<8;i++){
        const x=x0+8+((i*31+t*2.5)%(x1-x0-17)),h=y+4+(i%3)*3;
        if(h<base-1)path(c,[[x,h],[x+6+(i%3)*4,h]],null,'#89c4b9',1);
      }
      c.restore();
    }
    function tags(c,x,y,text,bg='#edf0dc',fg='#263f39'){
      const mobile=canvas.clientWidth<540, size=mobile?21:13;
      c.save();c.font='600 '+size+'px "Microsoft YaHei", sans-serif';const w=c.measureText(text).width+15;
      c.fillStyle=bg;c.beginPath();c.roundRect(x,y,w,size+8,5);c.fill();c.fillStyle=fg;c.fillText(text,x+7,y+size+2);c.restore();
    }
    function arrows(c,route,sign,phase,count,color){
      for(let i=0;i<count;i++){
        const p=(i/count+phase)%1,[x,y,angle]=point(route,sign===1?p:1-p);
        c.save();c.translate(x,y);c.rotate(angle+(sign===1?0:Math.PI));
        path(c,[[-5,-3],[2,0],[-5,3]],null,color,2.2);c.restore();
      }
    }
    let pixelW=0;
    return (row,t)=>{
      const w=Math.max(640,Math.min(1750,Math.round((canvas.clientWidth||W)*Math.min(maxRatio,window.devicePixelRatio||1))));
      if(pixelW!==w){
        pixelW=w;canvas.width=w;canvas.height=Math.round(w*H/W);
        art.width=w;art.height=canvas.height;
        const bg=art.getContext('2d');bg.setTransform(w/W,0,0,art.height/H,0,0);backdrop(bg);
      }
      ctx.setTransform(1,0,0,1,0,0);ctx.drawImage(art,0,0);ctx.setTransform(w/W,0,0,canvas.height/H,0,0);
      const fraction=clamp(t/6,0,1), store=row.begin+(row.end-row.begin)*fraction;
      const scale=clamp((store-data.low)/span,0,1),flow=row.buy>1e-8?1:row.sell>1e-8?-1:0;
      basin(ctx,0,174,119-scale*32,146,86,t,!flow&&row.clipped,true);
      basin(ctx,615,840,249+scale*24,304,245,t,false,false);
      // In section view a ruler measures the working range rather than the physical bottom.
      for(let y=87;y<=119;y+=8)path(ctx,[[156,y],[163,y]],null,'#e6e5ce',1.6);
      rect(ctx,161,86,2,35,'#d1d4bf');
      const rotor=[467,270], strength=row.buy?row.buy/data.maxBuy:row.sell/data.maxSell;
      circ(ctx,...rotor,22,'#394e49');circ(ctx,...rotor,18,'#acb5a2');circ(ctx,...rotor,15,'#516965');
      ctx.save();ctx.translate(...rotor);ctx.rotate(-flow*t*(2+strength*4));
      for(let i=0;i<7;i++){ctx.rotate(Math.PI*2/7);path(ctx,[[2,0],[9,-3],[13,-2],[11,3],[3,4]],'#dfd9b9');}
      ctx.restore();circ(ctx,...rotor,4,'#dfad65');
      if(flow){
        const speed=.10+.14*strength;
        arrows(ctx,WATER,-flow,(t*speed)%1,12,'#d5ffff');
        arrows(ctx,LINE,-flow,(t*speed*1.15)%1,8,'#ffdc76');
      }
      tags(ctx,12,49,'Shangku  '+fmt(store,2));
      tags(ctx,672,209,'market grid','#f5e0ae','#60491e');
      tags(ctx,702,295,'Drop into the library');
      tags(ctx,355,284,flow>0?'water pump · pumping water':flow<0?'Water turbine · Power generation':row.clipped?'The unit is restricted and stalled':'Unit standby',flow?'#d8e9ce':'#e4e2cf');
    };
  }

  const stateName = mode => mode===1?'pump water':mode===-1?'generate electricity':'Offline';
  const icon = mode => mode===1?'↗':mode===-1?'↘':'—';
  function mount(host,onInteract,index,onNode,replayAction){
    const state=host._p0062 ||= {plan:plan()};
    const app=document.createElement('section');app.className='hy6';host.replaceChildren(app);
    app.innerHTML='<div class="hy6-top"><div><b>Pumped storage power station</b><small>dispatch profile · Example small/I002</small></div><div class="hy6-score"><small>Six period net income</small><strong></strong></div></div>'+
      '<div class="hy6-art"><canvas role="img" aria-label="Operation profile of the upper reservoir, reversible turbine and lower reservoir, with blue water flow and golden transmission arrows changing direction with dispatch"></canvas></div>'+
      '<div class="hy6-status"><b></b><span></span></div>'+
      '<div class="hy6-controls"><div class="hy6-switch" role="group" aria-label="Unit mode of this issue"><button data-hmode="1">↗ pumped hydro</button><button data-hmode="0">— Offline</button><button data-hmode="-1">↘ Release water to generate electricity</button></div><label title="The proportion of water transfer volume in this period to the total available storage capacity">Water volume <input type="range" min="0" max="100" step="1"><output></output></label></div>'+
      '<div class="hy6-board" role="group" aria-label="Six-period scheduling, select a period to change the plan"></div>'+
      '<div class="hy6-footer"><span>Change the schedule at a certain time period, and the subsequent water level and income will change accordingly.. </span><button data-reset>Restoring instance solution</button></div>';
    const find=s=>app.querySelector(s),board=find('.hy6-board'),slider=find('input');
    for(let i=0;i<6;i++){
      const button=document.createElement('button');
      button.type='button';button.dataset.slot=i;
      button.innerHTML='<b>No. '+(i+1)+' Period</b><i></i><small>buy '+fmt(data.buy[i])+'<br>sell '+fmt(data.sell[i])+'</small>';
      button.onclick=()=>{if(onNode)onNode(i);else {index=i;update();host.sceneFrame(6);}};
      board.append(button);
    }
    const render=scene(find('canvas'));
    let rows=[],trial=null;
    function update(){
      rows=settle(trial||state.plan);
      const total=rows.reduce((n,r)=>n+r.profit,0),r=rows[index];
      find('.hy6-score strong').textContent=fmt(total);
      const limit=r.clipped ? (r.mode===1?'The warehouse is full':'reach lowest water level') : '';
      const money=r.profit>0?'income '+fmt(r.profit):r.profit<0?'expenditure '+fmt(-r.profit):'no deal';
      find('.hy6-status b').textContent='No. '+(index+1)+' Period · '+(r.buy?'Purchase electricity and pump water':r.sell?'Discharge water and sell electricity':limit||'Offline');
      find('.hy6-status span').textContent=limit && (r.buy||r.sell) ? limit+' · '+money : money;
      find('.hy6-status').classList.toggle('limited',r.clipped);
      for(const b of app.querySelectorAll('[data-hmode]'))b.setAttribute('aria-pressed',String(+b.dataset.hmode===r.mode));
      slider.value=Math.round(r.share*100);slider.disabled=!r.mode;find('output').textContent=slider.value+'%';
      for(const [i,b] of [...board.children].entries()){
        const v=rows[i];b.setAttribute('aria-pressed',String(i===index));b.className=v.clipped?'clipped':v.mode===1?'charge':v.mode===-1?'sell':'idle';
        b.querySelector('i').textContent=(v.clipped?'!':icon(v.mode))+' '+(v.clipped?(v.buy||v.sell?'Current limiting':v.mode===1?'Full':'No margin'):stateName(v.mode));
        b.setAttribute('aria-label','No. '+(i+1)+' period,'+b.querySelector('i').textContent+', purchase price '+data.buy[i]+', selling price '+data.sell[i]);
      }
    }
    function edit(fn,replay=true){
      onInteract?.();trial=null;fn();update();
      if(replay && replayAction)replayAction();
      else host.sceneFrame(6);
    }
    app.querySelectorAll('[data-hmode]').forEach(b=>b.onclick=()=>edit(()=>{state.plan[index].mode=+b.dataset.hmode;}));
    slider.oninput=()=>edit(()=>{state.plan[index].share=+slider.value/100;},false);
    slider.onchange=()=>{if(replayAction)replayAction();};
    find('[data-reset]').onclick=()=>edit(()=>{state.plan=plan();});
    host.sceneFrame=t=>render(rows[index],Math.max(0,t));
    host.previewDecision=i=>{
      trial=null;
      if(i){
        trial=plan();
        const start=index<3?0:3;
        if(index===start || index===start+1){trial[start].mode=1;trial[start+1].mode=0;}
        else{trial[start+1].mode=0;trial[start+2].mode=0;}
      }
      update();host.sceneFrame(i?6:host.sceneTime||0);
    };
    update();host.sceneFrame(host.sceneTime||0);
  }
  window.ORTOPIA_FIELD_P0062={mount};
})();
