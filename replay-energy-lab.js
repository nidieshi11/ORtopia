'use strict';
window.ORTOPIA_ENERGY_LAB=(()=>{
 const sessions=new WeakMap();
 const eps=1e-7;
 const fmt=(v,d=2)=> new Intl.NumberFormat('zh-CN',{minimumFractionDigits:0,maximumFractionDigits:d}).format(Math.abs(v)<1e-8?0:v);
 const usd=v=>'$'+fmt(v,2);
 const data=()=>window.ORTOPIA_ENERGY_DATA;
 const clone=p=>Object.fromEntries(['on','gen','ch','dis','da'].map(k=>[k,[...p[k]]]));
 const toolNames={thermal:'火电机组',storage:'储能站',market:'电网交易',wind:'风电场'};
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
     local.push('节点 '+ancestor+(a.started?' 刚开机':' 刚停机')+'，最短'+(a.started?'开':'停')+'机 '+(a.started?th.minimum_up_time:th.minimum_down_time)+' 期，节点 '+n+' 必须继续'+(a.started?'开机':'停机')+'。');
    }
   }
   if(gen>th.generation_upper_bound_MW*on+eps||gen<th.generation_lower_bound_MW*on-eps)local.push('节点 '+n+' 的机组状态与出力不一致。');
   if(gen-prevGen>rampUp+eps||prevGen-gen>rampDown+eps)local.push('节点 '+n+' 需从 '+fmt(prevGen)+' 调至 '+fmt(gen)+' MW，超出'+(gen>prevGen?'爬升':'下降')+'限值 '+fmt(gen>prevGen?rampUp:rampDown)+' MW。');
   if(ch< -eps||dis< -eps||ch>s.charge_power_max_MW+eps||dis>s.discharge_power_max_MW+eps)local.push('节点 '+n+' 超出储能充放电功率范围。');
   if(stored<s.energy_min_MWh-eps||stored>s.energy_max_MWh+eps)local.push('节点 '+n+' 电量为 '+fmt(stored,3)+' MWh，可用范围 '+fmt(s.energy_min_MWh)+'–'+fmt(s.energy_max_MWh,3)+' MWh。');
   if(t.leaf_nodes.includes(n)&&stored<s.terminal_energy_min_MWh-eps)local.push('叶节点 '+n+' 期末只有 '+fmt(stored,3)+' MWh，要求至少 '+fmt(s.terminal_energy_min_MWh,3)+' MWh。');
   if(rt< -eps)local.push('节点 '+n+' 可售 '+fmt(sale,3)+' MW，较本期日前承诺少 '+fmt(-rt,3)+' MW。');
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
   return '<div class="el-tree-legend"><strong>选择情景节点</strong><span>节点灯显示机组启停</span></div><div class="el-periods"><span>第 1 期</span><span>第 2 期</span><span>第 3 期</span></div><div class="el-tree-map"><svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">'+edges+'</svg>'+
    result.nodes.map((d,i)=>'<button type="button" class="el-node '+(d.on?'el-on':'el-off')+(d.local.length?' el-fail':'')+'" aria-pressed="'+(i===current)+'" aria-label="节点 '+d.n+'，'+(d.on?'开机':'停机')+(d.local.length?'，约束冲突':'')+'" style="left:'+coords[i][0]+'%;top:'+coords[i][1]+'%" data-node="'+i+'"><i></i><b>'+d.n+'</b> '+(d.on?'开':'停')+'</button>').join('')+'</div>';
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
    body='<div class="el-switch" role="group" aria-label="当前节点机组启停">'+[1,0].map(v=>'<button type="button" data-switch="'+v+'" aria-pressed="'+(d.on===v)+'">'+(v?'开机':'停机')+'</button>').join('')+'</div>'+
    range('gen','机组出力',d.gen,0,t.generation_upper_bound_MW,'MW','.1',!d.on)+
    '<p>开机至少 '+t.minimum_up_time+' 期，停机至少 '+t.minimum_down_time+' 期。相邻时段最多增减 '+t.ramp_up_limit_MW_per_h+' MW。</p>';
   }else if(pane==='storage'){
    body=range('ch','充电功率',d.ch,0,s.charge_power_max_MW,'MW')+range('dis','放电功率',d.dis,0,s.discharge_power_max_MW,'MW')+
    '<p>充电效率 '+pct(s.charge_efficiency)+'，放电效率 '+pct(s.discharge_efficiency)+'。期末电量沿情景树传给子节点。</p>';
   }else if(pane==='market'){
    const max=Math.max(...Object.values(x.renewable_output_MW))+t.generation_upper_bound_MW+s.discharge_power_max_MW;
    body=range('da','本期共同日前承诺',d.contract,0,max,'MW','.1')+'<p>第 '+d.period+' 期全部节点共用该承诺。日前价 '+usd(price.day_ahead_price_dollar_per_MWh[d.period])+'/MWh，当前实时价 '+usd(price.real_time_price_dollar_per_MWh[d.n])+'/MWh。</p>';
   }else{
    body='<p class="el-weather-reading">'+fmt(d.wind,3)+' <small>MW</small></p><p>本节点的风电出力由实例给定。切换同一时期的其他节点，可以比较另一种风况和实时电价。</p>';
   }
   return '<div class="el-control-title"><b>节点 '+d.n+' · '+toolNames[pane]+'</b><span>第 '+d.period+' 期</span></div><div class="el-tabs" aria-label="选择要调度的设备">'+Object.entries(toolNames).map(([k,n])=>'<button type="button" aria-pressed="'+(k===pane)+'" data-tool="'+k+'">'+n+'</button>').join('')+'</div>'+body;
 }
 function field(host,s,d,prior){
   const spots=[['wind',16,52,'风电',fmt(d.wind)+' MW'],['thermal',36,77,'火电',fmt(d.gen)+' MW'],['storage',64,41,'储能',d.ch>.001?'充 '+fmt(d.ch)+' MW':d.dis>.001?'放 '+fmt(d.dis)+' MW':'静置'],['market',87,66,'并网',fmt(d.sale)+' MW']];
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
   lever.textContent=d.on?'⏻ 停炉':'⏻ 点火';
   const battery=host.querySelector('[data-tool="storage"] b');
   s.frame=t=>{
    s.draw(d,prior,t,data().input.storage.energy_max_MWh);
    const amount=prior+(d.stored-prior)*Math.max(0,Math.min(1,t/6));
    const label='储能 '+amount.toFixed(2)+' MWh';
    if(battery.textContent!==label)battery.textContent=label;
   };
   s.frame(s.time);
 }
 function pathControls(s,d,rows){
   const leaves=data().input.scenario_tree.leaf_nodes;
   let output='<span>选择一条风况路径</span><div>';
   for(const n of leaves){
    const path=rows[n-1].path;
    output+='<button type="button" data-route="'+n+'" aria-pressed="'+(s.leaf===n)+'">'+path.join(' → ')+'</button>';
   }
   return output+'</div><button type="button" data-direct="follow">▶ 沿此路径连播</button>';
 }
 function impact(result,s){
  const d=result.nodes[s.index], errors=result.errors, pattern=bits(s.plan);
  const best=data().policies[pattern], objective=data().objective;
  const status=errors.length?'不可行 · '+errors.length+' 处冲突':'可行方案';
  const errs=errors.length?'<ul>'+errors.slice(0,2).map(txt=>'<li>'+txt+'</li>').join('')+'</ul>':'';
  const off=result.nodes.filter(n=>!n.on).length;
  const balance='火电 '+fmt(d.gen)+' ＋ 风电 '+fmt(d.wind)+' ＋ 放电 '+fmt(d.dis)+' − 充电 '+fmt(d.ch)+' ＝ '+fmt(d.sale)+' MW';
  return '<div class="el-result '+(errors.length?'el-conflict':'')+'"><div><b>'+status+'</b><span>'+(!errors.length?'全树期望利润':'未满足约束的账面值')+'</span><strong>'+usd(result.profit)+'</strong></div><small>'+(errors.length?'需先修正约束，再比较收益。':'较实例解 '+delta(result.profit-objective)+'。')+'</small>'+errs+'</div>'+
   '<div class="el-balance">'+balance+'<br>其中日前 '+fmt(d.contract)+' MW，实时 '+fmt(d.rt)+' MW。</div>'+
   '<div class="el-presets"><button type="button" data-preset="repair" '+(!best?'disabled':'')+'>按当前启停重新配平</button><button type="button" data-preset="late">试试推迟一期启动</button><button type="button" data-preset="reset">恢复实例解</button></div>'+
   '<p class="el-pattern">7 个情景节点各选开或停，共有 128 种启停组合，'+Object.keys(data().policies).length+' 种存在可行调度。当前组合有 '+off+' 个停机节点。'+(best?'固定该组合后，连续调度的最高期望利润为 '+usd(best.profit)+'。':'该组合无法通过最短启停限制。')+'</p>';
 }
 function futures(result,s){
   const x=data().input,t=x.scenario_tree,d=result.nodes[s.index],leaves=result.nodes.filter(other=>t.leaf_nodes.includes(other.n));
   return '<div class="el-outcomes"><strong>四种末期结果</strong><small>从根到叶的整条路径收益，按概率加权得期望利润</small><div>'+
    leaves.map(l=>'<button type="button" data-node="'+(l.n-1)+'" class="'+(l.path.includes(d.n)?'el-related':'')+'"><span>节点 '+l.path.join(' → ')+'</span><b>'+usd(l.pathProfit)+'</b><small>'+pct(l.prob)+' 概率'+(l.path.some(n=>result.nodes[n-1].local.length)?' · 冲突':'')+'</small></button>').join('')+'</div></div>';
 }
 function mount(host,onInteract,index=0,onNode,replayAction,playPath){
   let s=sessions.get(host);
   if(!s){s={plan:clone(data().original),tool:'thermal',time:0,leaf:4,expanded:false};sessions.set(host,s);}
   s.index=Math.max(0,Math.min(6,index));s.time=host.sceneTime||0;
   const tree=data().input.scenario_tree;
   const branch=n=>tree.parent_of_node[n];
   const onPath=(leaf,n)=>leaf===n||branch(leaf)===n||n===1;
   if(!onPath(s.leaf,s.index+1))s.leaf=tree.leaf_nodes.find(n=>onPath(n,s.index+1));
   host.innerHTML='<section class="el-lab" aria-label="风火储联合电站"><div class="el-board"><div class="el-field"></div><div class="el-hud"></div></div>'+
    '<div class="el-quick"><div class="el-strategy"><span>启停方案</span><div><button type="button" data-preset="reset">首期开机</button><button type="button" data-preset="late">推迟一期</button><button type="button" data-preset="off">全程停炉</button></div></div><div class="el-route"></div></div>'+
    '<details class="el-details"><summary>逐节点调度及约束</summary><div class="el-desk"><div class="el-left"><div class="el-tree"></div><div class="el-futures"></div></div><div class="el-right"><div class="el-controls"></div><div class="el-impact" aria-live="polite"></div></div></div></details></section>';
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
    hud.innerHTML='<span>第 '+d.period+' 期 · 节点 '+d.n+'</span><b>'+(result.errors.length?'方案冲突 '+result.errors.length+' 处':'全树期望利润 '+usd(result.profit))+'</b>';
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
