'use strict';
window.ORTOPIA_ENERGY_LAB=(()=>{
 const sessions=new WeakMap();
 const eps=1e-7;
 const fmt=(v,d=2)=> new Intl.NumberFormat('en-US',{minimumFractionDigits:0,maximumFractionDigits:d}).format(Math.abs(v)<1e-8?0:v);
 const usd=v=>'$'+fmt(v,2);
 const data=()=>window.ORTOPIA_ENERGY_DATA;
 const clone=p=>Object.fromEntries(['on','gen','ch','dis','da'].map(k=>[k,[...p[k]]]));
 const toolNames={thermal:"Thermal power unit",storage:"Energy storage station",market:"Grid trading",wind:"wind farm"};
 const bits=p=>p.on.join('');
 const delta=v=>(v>=0?'+':'−')+usd(Math.abs(v));
 const pct=v=>fmt(v*100,1)+'%';
 function fuelCost(curve,x){
   const b=curve.breakpoints_MW,c=curve.values_per_hour;
   const right=b.findIndex(limit=>limit>=x-eps);
   const i=right<0?b.length-1:Math.max(1,right);
   return c[i-1]+(x-b[i-1])*(c[i]-c[i-1])/(b[i]-b[i-1]);
 }
 function evaluate(plan){
  const input=data().input, t=input.scenario_tree,th=input.thermal_unit,s=input.storage;
  const prices=input.market_prices,dt=input.model_scope.period_length_hour;
  const nodes=[],errors=[];
  const dayRevenue=plan.da.reduce((sum,mw,k)=>sum+dt*mw*prices.day_ahead_price_dollar_per_MWh[k+1],0);
  let rtRevenue=0,thermalCost=0,storageCost=0;
  for(const n of t.nodes){
   const i=n-1,par=t.parent_of_node[n],prev=nodes[par-1],period=t.stage_of_node[n],prob=t.node_probability[n];
   const on=plan.on[i],gen=plan.gen[i],ch=plan.ch[i],dis=plan.dis[i],wind=input.renewable_output_MW[n];
   const prevOn=prev?.on??th.initial_commitment_status,prevGen=prev?.gen??th.initial_generation_MW;
   const started=on>prevOn,stopped=on<prevOn, rampUp=dt*(prevOn?th.ramp_up_limit_MW_per_h:th.startup_ramp_limit_MW_per_h);
   const rampDown=dt*(on?th.ramp_up_limit_MW_per_h:th.shutdown_ramp_limit_MW_per_h);
   const stored=(prev?.stored??0)+dt*(s.charge_efficiency*ch-dis/s.discharge_efficiency);
   const contract=plan.da[period-1],sale=wind+gen-ch+dis,rt=sale-contract;
   const unitCost=dt*fuelCost(th.production_cost,gen)+(started?th.startup_cost_dollar:0)+(stopped?th.shutdown_cost_dollar:0);
   const batCost=dt*(ch*s.charge_cost_dollar_per_MWh+dis*s.discharge_cost_dollar_per_MWh);
   const earned=dt*rt*prices.real_time_price_dollar_per_MWh[n];
   const path=prev?[...prev.path,n]:[n];
   const local=[];
   for(const ancestor of path.slice(0,-1)){
    const a=nodes[ancestor-1];
    if((a.started||a.stopped)&&period-a.period<(a.started?th.minimum_up_time:th.minimum_down_time)&&on!==a.on){
     local.push("Node "+ancestor+(a.started?" Just turned on":" Just shut down")+", the shortest"+(a.started?"open":"stop")+"machine "+(a.started?th.minimum_up_time:th.minimum_down_time)+" Period, node "+n+" must continue"+(a.started?"Power on":"Offline")+'。');
    }
   }
   if(gen>th.generation_upper_bound_MW*on+eps||gen<th.generation_lower_bound_MW*on-eps)local.push("Node "+n+" The status of the unit is inconsistent with the output.");
   if(gen-prevGen>rampUp+eps||prevGen-gen>rampDown+eps)local.push("Node "+n+" Need from "+fmt(prevGen)+" adjust to "+fmt(gen)+" MW, beyond"+(gen>prevGen?"climb":"fall")+"limit "+fmt(gen>prevGen?rampUp:rampDown)+' MW。');
   if(ch< -eps||dis< -eps||ch>s.charge_power_max_MW+eps||dis>s.discharge_power_max_MW+eps)local.push("Node "+n+" Exceeding the energy storage charging and discharging power range.");
   if(stored<s.energy_min_MWh-eps||stored>s.energy_max_MWh+eps)local.push("Node "+n+" The power is "+fmt(stored,3)+" MWh, available range "+fmt(s.energy_min_MWh)+'–'+fmt(s.energy_max_MWh,3)+' MWh。');
   if(t.leaf_nodes.includes(n)&&stored<s.terminal_energy_min_MWh-eps)local.push("leaf node "+n+" At the end of the period there are only "+fmt(stored,3)+" MWh, minimum required "+fmt(s.terminal_energy_min_MWh,3)+' MWh。');
   if(rt< -eps)local.push("Node "+n+" Available for sale "+fmt(sale,3)+" MW, less than the current period’s advance commitment "+fmt(-rt,3)+' MW。');
   errors.push(...local);
   rtRevenue+=prob*earned;thermalCost+=prob*unitCost;storageCost+=prob*batCost;
   nodes.push({n,period,prob,par,path,local,on,gen,ch,dis,wind,stored,sale,rt,contract,started,stopped,localProfit:earned-unitCost-batCost});
  }
  nodes.forEach(d=>{d.pathProfit=dayRevenue+d.path.reduce((v,n)=>v+nodes[n-1].localProfit,0);});
  return {nodes,errors,dayRevenue,rtRevenue,thermalCost,storageCost,profit:dayRevenue+rtRevenue-thermalCost-storageCost};
 }
 function optimised(key){
  const p=data().policies[key];
  if(!p)return null;
  return clone({...p,on:key.split('').map(Number)});
 }
 function treeView(result,current){
   const tree=data().input.scenario_tree, coords=[[9,50],[46,26],[46,76],[91,12],[91,37],[91,62],[91,87]];
   const edges=tree.nodes.slice(1).map(n=>{
    const a=coords[tree.parent_of_node[n]-1],b=coords[n-1];
    const active=result.nodes[current].path.includes(n);
    return '<path class="'+(active?'el-path':'')+'" d="M'+a[0]+' '+a[1]+' C'+(a[0]+16)+' '+a[1]+' '+(b[0]-16)+' '+b[1]+' '+b[0]+' '+b[1]+'"/>';
   }).join('');
   return "<div class=\"el-tree-legend\"><strong>Select scenario node</strong><span>Node lights indicate unit start and stop</span></div><div class=\"el-periods\"><span>No. 1 Period</span><span>No. 2 Period</span><span>No. 3 Period</span></div><div class=\"el-tree-map\"><svg viewBox=\"0 0 100 100\" preserveAspectRatio=\"none\" aria-hidden=\"true\">"+edges+'</svg>'+
    result.nodes.map((d,i)=>'<button type="button" class="el-node '+(d.on?'el-on':'el-off')+(d.local.length?' el-fail':'')+'" aria-pressed="'+(i===current)+"\" aria-label=\"Node "+d.n+'，'+(d.on?"Power on":"Offline")+(d.local.length?", constraint conflict":'')+'" style="left:'+coords[i][0]+'%;top:'+coords[i][1]+'%" data-node="'+i+'"><i></i><b>'+d.n+'</b> '+(d.on?"open":"stop")+'</button>').join('')+'</div>';
 }
 function range(key,title,value,min,max,unit,step='.01',disabled=false){
   // "any" preserves the source's full-precision values, including a non-rounded power limit.
   return '<label class="el-range"><span>'+title+' <b data-val="'+key+'">'+fmt(value,3)+' '+unit+'</b></span><input type="range" min="'+min+'" max="'+max+'" step="any" value="'+value+'" aria-label="'+title+'" data-power="'+key+'" data-inc="'+step+'" '+(disabled?'disabled':'')+'><small>'+fmt(min,3)+' '+unit+'<i>'+fmt(max,3)+' '+unit+'</i></small></label>';
 }
 function controls(session,d){
   const x=data().input,s=x.storage,t=x.thermal_unit,price=x.market_prices;
   const pane=session.tool;
   let body='';
   if(pane==='thermal'){
    body="<div class=\"el-switch\" role=\"group\" aria-label=\"Current node unit starts and stops\">"+[1,0].map(v=>'<button type="button" data-switch="'+v+'" aria-pressed="'+(d.on===v)+'">'+(v?"Power on":"Offline")+'</button>').join('')+'</div>'+
    range('gen',"Unit output",d.gen,0,t.generation_upper_bound_MW,'MW','.1',!d.on)+
    "<p>Boot at least "+t.minimum_up_time+" period, downtime is at least "+t.minimum_down_time+" period. Maximum increase or decrease in adjacent time periods "+t.ramp_up_limit_MW_per_h+' MW。</p>';
   }else if(pane==='storage'){
    body=range('ch',"Charging power",d.ch,0,s.charge_power_max_MW,'MW')+range('dis',"Discharge power",d.dis,0,s.discharge_power_max_MW,'MW')+
    "<p>Charging efficiency "+pct(s.charge_efficiency)+", Discharge efficiency "+pct(s.discharge_efficiency)+".The electricity at the end of the period is transferred to the child nodes along the scenario tree.</p>";
   }else if(pane==='market'){
    const max=Math.max(...Object.values(x.renewable_output_MW))+t.generation_upper_bound_MW+s.discharge_power_max_MW;
    body=range('da',"Common day-to-day commitments in this issue",d.contract,0,max,'MW','.1')+"<p>No. "+d.period+" All nodes in the period share this commitment. Day-ahead price "+usd(price.day_ahead_price_dollar_per_MWh[d.period])+"/MWh, current real-time price "+usd(price.real_time_price_dollar_per_MWh[d.n])+'/MWh。</p>';
   }else{
    body='<p class="el-weather-reading">'+fmt(d.wind,3)+" <small>MW</small></p><p>The wind power output of this node is given by the example. Switch to other nodes in the same period to compare another wind condition and real-time electricity prices.</p>";
   }
   return "<div class=\"el-control-title\"><b>Node "+d.n+' · '+toolNames[pane]+"</b><span>No. "+d.period+" Period</span></div><div class=\"el-tabs\" aria-label=\"Select the device to schedule\">"+Object.entries(toolNames).map(([k,n])=>'<button type="button" aria-pressed="'+(k===pane)+'" data-tool="'+k+'">'+n+'</button>').join('')+'</div>'+body;
 }
 function field(host,s,d,prior){
   const spots=[['wind',16,52,"Wind power",fmt(d.wind)+' MW'],['thermal',36,77,"Thermal power",fmt(d.gen)+' MW'],['storage',64,41,"energy storage",d.ch>.001?"charge "+fmt(d.ch)+' MW':d.dis>.001?"put "+fmt(d.dis)+' MW':"Let stand"],['market',87,66,"Grid connection",fmt(d.sale)+' MW']];
   if(!host.firstChild){
    host.innerHTML=spots.map(([k,x,y])=>'<button type="button" class="el-hotspot" style="left:'+x+'%;top:'+y+'%" data-tool="'+k+'"><b></b><span></span></button>').join('')+
    '<button class="el-breaker" type="button" data-direct="switch"></button>';
    s.draw=window.ORTOPIA_ENERGY_WORLD.create(host);
   }
   for(const [k,,,label,val] of spots){
    const button=host.querySelector('[data-tool="'+k+'"]');
    button.firstChild.textContent=label;button.lastChild.textContent=val;button.setAttribute('aria-pressed',String(s.tool===k));
   }
   const lever=host.querySelector('.el-breaker');
   lever.setAttribute('aria-pressed',String(Boolean(d.on)));
   lever.textContent=d.on?"⏻ shutdown":"⏻ Ignite";
   const battery=host.querySelector('[data-tool="storage"] b');
   s.frame=t=>{
    s.draw(d,prior,t,data().input.storage.energy_max_MWh);
    const amount=prior+(d.stored-prior)*Math.max(0,Math.min(1,t/6));
    const label="energy storage "+amount.toFixed(2)+' MWh';
    if(battery.textContent!==label)battery.textContent=label;
   };
   s.frame(s.time);
 }
 function pathControls(s,d,rows){
   const leaves=data().input.scenario_tree.leaf_nodes;
   let output="<span>Choose a wind path</span><div>";
   for(const n of leaves){
    const path=rows[n-1].path;
    output+='<button type="button" data-route="'+n+'" aria-pressed="'+(s.leaf===n)+'">'+path.join(' → ')+'</button>';
   }
   return output+"</div><button type=\"button\" data-direct=\"follow\">▶ Broadcast along this path</button>";
 }
 function impact(result,s){
  const d=result.nodes[s.index], errors=result.errors, pattern=bits(s.plan);
  const best=data().policies[pattern], objective=data().objective;
  const status=errors.length?"Not feasible · "+errors.length+" in conflict":"Possible solutions";
  const errs=errors.length?'<ul>'+errors.slice(0,2).map(txt=>'<li>'+txt+'</li>').join('')+'</ul>':'';
  const off=result.nodes.filter(n=>!n.on).length;
  const balance="Thermal power "+fmt(d.gen)+" ＋ Wind power "+fmt(d.wind)+" ＋ discharge "+fmt(d.dis)+" − Charging "+fmt(d.ch)+' ＝ '+fmt(d.sale)+' MW';
  return '<div class="el-result '+(errors.length?'el-conflict':'')+'"><div><b>'+status+'</b><span>'+(!errors.length?"Whole tree expected profit":"Book value that does not satisfy constraints")+'</span><strong>'+usd(result.profit)+'</strong></div><small>'+(errors.length?"The constraints need to be corrected first, and then the benefits can be compared.":"Comparative example solution "+delta(result.profit-objective)+'。')+'</small>'+errs+'</div>'+
   '<div class="el-balance">'+balance+"<br>Among them, the days before "+fmt(d.contract)+" MW, real time "+fmt(d.rt)+' MW。</div>'+
   '<div class="el-presets"><button type="button" data-preset="repair" '+(!best?'disabled':'')+">Re-trim according to current start/stop</button><button type=\"button\" data-preset=\"late\">Try delaying the start of phase one</button><button type=\"button\" data-preset=\"reset\">Restoring instance solution</button></div>"+
   "<p class=\"el-pattern\">7 Each scene node can be turned on or off, with a total of 128 start-stop combination, "+Object.keys(data().policies).length+" There is feasible scheduling. The current combination is "+off+" downtime nodes."+(best?"After fixing this combination, the highest expected profit of continuous scheduling is "+usd(best.profit)+'。':"This combination cannot pass the minimum start-stop limit.")+'</p>';
 }
 function futures(result,s){
   const x=data().input,t=x.scenario_tree,d=result.nodes[s.index],leaves=result.nodes.filter(other=>t.leaf_nodes.includes(other.n));
   return "<div class=\"el-outcomes\"><strong>Four final outcomes</strong><small>The income of the entire path from the root to the leaves is the expected profit weighted by probability.</small><div>"+
    leaves.map(l=>'<button type="button" data-node="'+(l.n-1)+'" class="'+(l.path.includes(d.n)?'el-related':'')+"\"><span>Node "+l.path.join(' → ')+'</span><b>'+usd(l.pathProfit)+'</b><small>'+pct(l.prob)+" Probability"+(l.path.some(n=>result.nodes[n-1].local.length)?" · Conflict":'')+'</small></button>').join('')+'</div></div>';
 }
 function mount(host,onInteract,index=0,onNode,replayAction,playPath){
   let s=sessions.get(host);
   if(!s){s={plan:clone(data().original),tool:'thermal',time:0,leaf:4,expanded:false};sessions.set(host,s);}
   s.index=Math.max(0,Math.min(6,index));s.time=host.sceneTime||0;
   const tree=data().input.scenario_tree;
   const branch=n=>tree.parent_of_node[n];
   const onPath=(leaf,n)=>leaf===n||branch(leaf)===n||n===1;
   if(!onPath(s.leaf,s.index+1))s.leaf=tree.leaf_nodes.find(n=>onPath(n,s.index+1));
   host.innerHTML="<section class=\"el-lab\" aria-label=\"Combined wind, thermal and storage power station\"><div class=\"el-board\"><div class=\"el-field\"></div><div class=\"el-hud\"></div></div>"+
    "<div class=\"el-quick\"><div class=\"el-strategy\"><span>Start-stop plan</span><div><button type=\"button\" data-preset=\"reset\">First phase launch</button><button type=\"button\" data-preset=\"late\">Postpone one period</button><button type=\"button\" data-preset=\"off\">Shut down the whole process</button></div></div><div class=\"el-route\"></div></div>"+
    "<details class=\"el-details\"><summary>Node-by-node scheduling and constraints</summary><div class=\"el-desk\"><div class=\"el-left\"><div class=\"el-tree\"></div><div class=\"el-futures\"></div></div><div class=\"el-right\"><div class=\"el-controls\"></div><div class=\"el-impact\" aria-live=\"polite\"></div></div></div></details></section>";
   const root=host.querySelector('.el-lab');
   const q=selector=>root.querySelector(selector);
   q('.el-details').open=s.expanded;
   q('.el-details').ontoggle=e=>{s.expanded=e.target.open;};
   function paint(editing=false){
    const result=evaluate(s.plan),d=result.nodes[s.index];
    const prior=d.par?result.nodes[d.par-1].stored:0;
    field(q('.el-field'),s,d,prior);
    const hud=q('.el-hud');
    hud.classList.toggle('is-invalid',Boolean(result.errors.length));
    hud.innerHTML="<span>No. "+d.period+" Period · Node "+d.n+'</span><b>'+(result.errors.length?"Solution conflict "+result.errors.length+" at":"Whole tree expected profit "+usd(result.profit))+'</b>';
    q('.el-route').innerHTML=pathControls(s,d,result.nodes);
    const planKey=bits(s.plan);
    for(const [preset,key] of [['reset','1111111'],['late','0111111'],['off','0000000']]){
      q('.el-strategy [data-preset="'+preset+'"]').setAttribute('aria-pressed',String(key===planKey));
    }

    q('.el-tree').innerHTML=treeView(result,s.index);
    if(!editing)q('.el-controls').innerHTML=controls(s,d);
    else for(const key of ['gen','ch','dis','da']){
      const label=q('[data-val="'+key+'"]');
      if(label)label.textContent=fmt(key==='da'?d.contract:d[key],3)+' MW';
    }
    q('.el-impact').innerHTML=impact(result,s);q('.el-futures').innerHTML=futures(result,s);
   }
   function edit(button){
    onInteract?.();
    if(button.hasAttribute('data-node')){
      const node=Number(button.dataset.node);s.index=node;
      if(onNode){onNode(node);return;}paint();return;
    }
    if(button.dataset.route){s.leaf=Number(button.dataset.route);if(onNode){onNode(0);return;}}
    else if(button.dataset.direct==='follow'){if(playPath)playPath(0);return;}
    else if(button.dataset.direct==='switch'){
     const i=s.index;
     s.plan.on[i]=1-s.plan.on[i];
     if(!s.plan.on[i])s.plan.gen[i]=0;
     s.plan=optimised(bits(s.plan))||s.plan;
    }
    else if(button.dataset.tool){s.tool=button.dataset.tool;q('.el-details').open=true;s.expanded=true;}
    else if(button.hasAttribute('data-switch')){
      const enabled=Number(button.dataset.switch);
      if(enabled===s.plan.on[s.index])return;
      s.plan.on[s.index]=enabled;
      if(!enabled)s.plan.gen[s.index]=0;
    }else if(button.dataset.preset==='reset')s.plan=clone(data().original);
    else if(button.dataset.preset==='late')s.plan=optimised('0111111');
    else if(button.dataset.preset==='off')s.plan=optimised('0000000');
    else if(button.dataset.preset==='repair')s.plan=optimised(bits(s.plan))||s.plan;
    const key=Object.keys(button.dataset)[0],val=button.dataset[key];
    const parent=button.closest('.el-field,.el-controls,.el-strategy,.el-impact')?.classList[0]||'el-impact';
    paint();if(!button.dataset.tool)replayAction?.();q('.'+parent+' [data-'+key+'="'+val+'"]')?.focus({preventScroll:true});
   }
   root.onclick=e=>{const b=e.target.closest('button');if(b&&root.contains(b)&&!b.disabled)edit(b);};
   root.oninput=e=>{
    const el=e.target;if(!el.matches('[data-power]'))return;
    onInteract?.();const key=el.dataset.power,t=data().input.scenario_tree.stage_of_node[s.index+1];
    s.plan[key][key==='da'?t-1:s.index]=Number(el.value);paint(true);replayAction?.();
   };
   // The source optimum and exact off-root bid need not coincide with a rounded slider tick.
   root.onkeydown=e=>{
    const el=e.target;if(!el.matches('[data-power]')||!['ArrowUp','ArrowRight','ArrowDown','ArrowLeft'].includes(e.key))return;
    e.preventDefault();const sign=['ArrowUp','ArrowRight'].includes(e.key)?1:-1;
    el.value=Math.max(+el.min,Math.min(+el.max,+el.value+sign*Number(el.dataset.inc)));
    el.dispatchEvent(new Event('input',{bubbles:true}));
   };
   host.sceneFrame=time=>{s.time=time;s.frame?.(time);};
   host.nextSceneStep=()=>{
    const path=[1,branch(s.leaf),s.leaf],next=path.indexOf(s.index+1)+1;
    return next>0&&next<path.length?path[next]-1:null;
   };
   host.previewDecision=k=>{
    s.plan=k===1?optimised('0000000'):clone(data().original);paint();
   };
   paint();
 }
 return {mount};
})();
