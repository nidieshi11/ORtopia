/* Steady positive flow through the series network in small/I001. */
window.ORTOPIA_FIELD_P0213 = (() => {
 'use strict';
 const sessions = new WeakMap();
 const eps = 1e-8;
 const fmt = (n,d=2) => Number(n).toFixed(d);
 const outside = (value,[low,high]) => value<low-eps || value>high+eps;

 function buildHydraulics(model) {
  const inlet=model.V_plus[0], outlet=model.V_minus[0];
  const supply=model.nodal_flow_bounds[inlet];
  const [negativeMax,negativeMin]=model.nodal_flow_bounds[outlet];
  const demand=[-negativeMin,-negativeMax];
  const pressureBounds=model.V.map(n=>model.pressure_bounds[n]);
  const pipeBounds=Object.values(model.arc_flow_bounds);
  const flowBounds=[Math.max(...pipeBounds.map(b=>b[0])),Math.min(...pipeBounds.map(b=>b[1]))];
  const inletBounds=pressureBounds[inlet];

  function score(term,pressure,flow) {
   if(typeof term==='number')return term;
   if(term.var==='p')return pressure[term.id];
   if(term.var==='q_node')return term.id===inlet?flow:-flow;
   if(term.op==='neg')return -score(term.args[0],pressure,flow);
   if(term.op==='mul')return term.args.reduce((v,t)=>v*score(t,pressure,flow),1);
   throw Error('Unsupported gas objective term');
  }
  function evaluate(pressure,flow) {
   const pressures=[pressure], violations=[];
   for(const arc of model.arcs) {
    const up=pressures[arc.tail];
    pressures[arc.head]=model.pipes.includes(arc.id)
      ?Math.sqrt(arc.c1*up*up-arc.c2*flow*flow)
      :up-arc.c*flow*flow/up;
   }
   for(const n of model.V)if(outside(pressures[n],pressureBounds[n]))violations.push({kind:'pressure',node:n});
   if(outside(flow,supply))violations.push({kind:'supply',node:inlet});
   if(outside(flow,demand))violations.push({kind:'demand',node:outlet});
   for(const arc of model.arcs)if(outside(flow,model.arc_flow_bounds[arc.id]))violations.push({kind:'flow',arc:arc.id});
   const objective=model.objective_components.reduce((s,term)=>s+score(term,pressures,flow),0);
   return {flow,pressures,pressureBounds,flowBounds,demand,feasible:violations.length===0,violations,objective};
  }
  function raisePressure(state) {
   if(!state.violations.some(v=>v.kind==='pressure')||state.violations.some(v=>v.kind!=='pressure'))return null;
   for(let tick=Math.ceil((state.pressures[inlet]-eps)*100);tick<=Math.floor((inletBounds[1]+eps)*100);tick++){
    const p=tick/100;
    if(evaluate(p,state.flow).feasible)return p;
   }
   return null;
  }
  return {evaluate,raisePressure,supply,demand,inletBounds,flowBounds};
 }

 function slider(name,label,bounds) {
  return '<label class="gas-setting"><span>'+label+' <output data-read="'+name+'"></output></span>'+
   '<input data-setting="'+name+'" type="range" min="'+bounds[0]+'" max="'+bounds[1]+'" step="0.01" aria-label="'+label+'">'+
   '<small><span>'+fmt(bounds[0])+'</span><span>'+fmt(bounds[1])+'</span></small></label>';
 }
 function mount(host,onInteract,index,onNode,replayAction) {
  const replay=window.ORTOPIA_REPLAYS.P0213;
  let s=sessions.get(host);
  if(!s){
   s={physics:buildHydraulics(replay.gasModel),point:null,index:null,name:'',time:0};
   sessions.set(host,s);
  }
  const {physics}=s, stop=replay.steps[index], reference=replay.steps[0].operatingPoint;
  if(index!==s.index){s.index=index;s.point={...stop.operatingPoint};s.name=stop.title;}
  const presets={
   reference:[replay.steps[0].title,reference],
   full:[replay.steps[1].title,replay.steps[1].operatingPoint],
   pressure:[replay.steps[2].title,replay.steps[2].operatingPoint],
   short:['Less air supply',{flow:physics.flowBounds[0],pressure:reference.pressure}]
  };
  host.innerHTML='<section class="gas-field" aria-label="Natural gas transmission and distribution station"><div class="gas-scene">'+
   '<canvas role="img" aria-label="Natural gas flows through three sections of series pipelines at the same time, and four pressure gauges display the pressure and boundary crossing conditions at each node."></canvas>'+
   '<button type="button" class="gas-hit gas-hit-in" data-adjust="pressure" title="Adjust inlet pressure" aria-label="Adjust inlet pressure"></button>'+
   '<button type="button" class="gas-hit gas-hit-out" data-adjust="flow" title="Regulate delivery flow" aria-label="Regulate delivery flow"></button></div>'+
   '<div class="gas-ops">'+slider('pressure','Inlet pressure',physics.inletBounds)+slider('flow','Deliver traffic',physics.flowBounds)+
   '<div class="gas-status" role="status"><span class="gas-state"></span><output class="gas-result"></output><small class="gas-note"></small></div></div>'+
   '<div class="gas-actions">'+Object.entries(presets).map(([id,[title]])=>'<button data-plan="'+id+'" type="button">'+title+'</button>').join('')+
   '<button type="button" data-action="raise">Maintain flow and make up pressure</button></div></section>';
  const q=sel=>host.querySelector(sel);
  const draw=window.ORTOPIA_GAS_WORLD.create(q('canvas'));
  let current,repair;
  function paint(){
   const next=physics.evaluate(s.point.pressure,s.point.flow);
   if(!current||next.flow!==current.flow||next.pressures[0]!==current.pressures[0]){
    s.needleStart=s.needle?.slice()||next.pressures.slice();
   }
   current=next;
   repair=physics.raisePressure(current);
   for(const key of ['pressure','flow']){
    const el=q('[data-setting='+key+']');el.value=s.point[key];
    q('[data-read='+key+']').textContent=fmt(s.point[key]);
   }
   q('.gas-state').textContent=(s.name||'Manual scheduling')+' · '+(current.feasible?'Feasible':'Infeasible');
   q('.gas-status').dataset.valid=String(current.feasible);
   q('.gas-result').textContent=(current.feasible?'target ':'Trial target ')+fmt(current.objective,4);
   const pErrors=current.violations.filter(v=>v.kind==='pressure');
   const info=[];
   if(pErrors.length)info.push(pErrors.map(v=>'P'+v.node).join(', ')+' Pressure crosses the line');
   if(outside(s.point.flow,physics.demand))info.push(s.point.flow<physics.demand[0]
     ?'Pay less '+fmt(physics.demand[0]-s.point.flow):'Exceeded receiving limit '+fmt(s.point.flow-physics.demand[1]));
   if(!info.length)info.push('The lower the goal, the better · Delivery scope '+physics.demand.map(n=>fmt(n)).join('–'));
   q('.gas-note').textContent=info.join(' · ');
   for(const [id,[,p]] of Object.entries(presets)){
    q('[data-plan='+id+']').setAttribute('aria-pressed',String(Math.abs(s.point.pressure-p.pressure)<eps&&Math.abs(s.point.flow-p.flow)<eps));
   }
   q('[data-action=raise]').disabled=repair===null;
   host.sceneFrame(s.time);
  }
  function edit(point,name){
   onInteract?.();s.point={...point};s.name=name;paint();replayAction?.();
  }
  for(const button of host.querySelectorAll('.gas-hit')){
   const key=button.dataset.adjust, bounds=key==='pressure'?physics.inletBounds:physics.flowBounds;
   let drag=null;
   button.onpointerdown=e=>{
    if(e.button!==0)return;
    drag={id:e.pointerId,y:e.clientY,initial:s.point[key],moved:false};
    button.setPointerCapture(e.pointerId);button.focus({preventScroll:true});
   };
   button.onpointermove=e=>{
    if(!drag||drag.id!==e.pointerId)return;
    const dy=drag.y-e.clientY;
    if(!drag.moved&&Math.abs(dy)<3)return;
    drag.moved=true;
    const distance=Math.max(85,Math.min(180,q('canvas').clientHeight*.55));
    const v=drag.initial+dy/distance*(bounds[1]-bounds[0]);
    edit({...s.point,[key]:Math.round(100*Math.max(bounds[0],Math.min(bounds[1],v)))/100},'Manual scheduling');
   };
   button.onpointerup=()=>{button.dataset.dragged=String(drag?.moved||false);drag=null;};
   button.onpointercancel=()=>{drag=null;};
   button.onkeydown=e=>{
    if(!['ArrowUp','ArrowRight','ArrowDown','ArrowLeft'].includes(e.key))return;
    e.preventDefault();
    const change=['ArrowUp','ArrowRight'].includes(e.key) ? 0.01 : -0.01;
    const v=Math.round(100*(s.point[key]+change))/100;
    edit({...s.point,[key]:Math.max(bounds[0],Math.min(bounds[1],v))},'Manual scheduling');
   };
  }
  q('.gas-field').oninput=e=>{
   const key=e.target.dataset.setting;if(!key)return;
   edit({...s.point,[key]:Number(e.target.value)},'Manual scheduling');
  };
  q('.gas-field').onclick=e=>{
   const b=e.target.closest('button');if(!b)return;
   if(b.dataset.adjust){
    if(b.dataset.dragged==='true'){b.dataset.dragged='false';return;}
    onInteract?.();
    const el=q('[data-setting='+b.dataset.adjust+']');
    el.focus({preventScroll:true});el.scrollIntoView({block:'nearest'});return;
   }
   if(b.dataset.plan){
    const [name,p]=presets[b.dataset.plan];edit(p,name);
   }else if(b.dataset.action==='raise'&&repair!==null)edit({...s.point,pressure:repair},'make up for pressure');
  };
  host.sceneFrame=t=>{
   s.time=t;
   const progress=matchMedia('(prefers-reduced-motion: reduce)').matches ? 1 : Math.min(1,t/.65);
   const eased=1-Math.pow(1-progress,3);
   s.needle=current.pressures.map((p,n)=>s.needleStart[n]+(p-s.needleStart[n])*eased);
   draw(current,t,index,s.needle);
  };
  host.previewDecision=option=>{
   const row=window.ORTOPIA_REPLAY_LOGIC.P0213[index];
   s.point={...(option?row.trials[option-1]:stop.operatingPoint)};s.name=row.comparison.options[option].label;paint();
   s.needleStart=current.pressures.slice();host.sceneFrame(s.time);
  };
  host.gasSnapshot=()=>current;
  s.time=host.sceneTime||0;paint();
 }
 return {mount};
})();
