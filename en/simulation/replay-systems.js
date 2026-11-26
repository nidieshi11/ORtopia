'use strict';
window.ORTOPIA_SYSTEMS=(()=>{
 const ids=new Set(['P0013','P0025','P0045','P0057','P0062','P0213','P0214']);
 const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const svgText=(x,y,t,cls='')=>'<text x="'+x+'" y="'+y+'" class="'+cls+'" text-anchor="middle">'+esc(t)+'</text>';
 const sym={R0:'🩺',R1:'🩺',OnCall:'🩺',H0:'🏥',H1:'🏥',G1:'⚙',G2:'⚙',L1:'ϟ'};
 function render(stage,d,i){
  const s=d.steps[i], changes=new Map((s.changes||[]).map(c=>[c.id,c.value]));
  if(d.id==='P0045'){
   const rows=d.steps.slice(0,i+1);
   stage.innerHTML="<div class=\"allocation\"><div class=\"allocation-key\"><b>marketing activity share</b><span>Email</span><span>Push notification</span><span>Coupon</span></div>"+rows.map((t,k)=>{
    const m=Object.fromEntries(t.changes.map(v=>[v.id,v.value])),person=t.changes.find(c=>!['mail','push','voucher'].includes(c.id));
    return '<div class="alloc-row '+(k===i?'current':'')+'"><b>'+esc(person?.value||t.title)+'</b><div>'+['mail','push','voucher'].map((a,j)=>{
     const v=parseFloat(m[a]);return v>0?'<span class="alloc-'+j+'" style="width:'+v+'%" title="'+esc(a+' '+m[a])+'">'+(v>9?esc(m[a]):'')+'</span>':'';
    }).join('')+'</div></div>';
   }).join('')+'</div>';return;
  }
  if(d.id==='P0062'||d.id==='P0057'){
   const bat=d.id==='P0062',point=d.trend.points.find(p=>p.step===i+1),left=s.level??(bat?point?.value:parseFloat(String(changes.get('fuel')).replace(/[^0-9.+-]/g,'')));
   const min=d.minCapacity??0,max=d.capacity,pct=Number.isFinite(max)&&left!=null?Math.min(100,Math.max(0,100*(left-min)/(max-min))):null;
   const grid=changes.get('grid')||changes.get('sale'),device=changes.get('plant')||changes.get('bat');
   const direction=bat?(s.links[0]?.[0]==='bat'?'→':s.links.length?'←':'—'):'→';
   stage.innerHTML='<div class="power-stage"><div class="power-machine"><div class="machine-figure">'+(bat?'▥':'⚙')+'</div><strong>'+esc(bat?"energy storage device":"Thermal power unit")+'</strong><div>'+esc(device)+'</div></div><div class="energy-arrow">'+direction+"</div><div class=\"power-machine\"><div class=\"machine-figure grid-symbol\">ϟ</div><strong>electricity market</strong><div>"+esc(grid)+'</div></div></div><div class="stock"><header><b>'+esc(bat?"Ending energy stock":"remaining fuel limit")+'</b><span>'+esc(Number.isFinite(left)?left.toLocaleString('en-US',{maximumFractionDigits:3}):'')+(Number.isFinite(max)?' / '+esc(Number(max).toLocaleString('en-US',{maximumFractionDigits:3})): '')+'</span></header>'+(pct!==null?'<div class="gauge"><i style="width:'+pct+'%"></i></div>':'')+'</div>';return;
  }
  const pos=new Map(),ents=d.entities,allLinks=new Map();
  d.steps.flatMap(v=>v.links).forEach(([a,b])=>allLinks.set(JSON.stringify([a,b]),[a,b]));
  const cols=[...new Set(ents.map(e=>e.group))];
  if(d.id==='P0213')ents.forEach((n,k)=>pos.set(n.id,[80+k*190,140]));
  else cols.forEach((col,k)=>{const row=ents.filter(n=>n.group===col);row.forEach((n,j)=>pos.set(n.id,[110+k*480/Math.max(1,cols.length-1),60+(j+.5)*230/row.length]));});
  const now=new Set(s.links.map(v=>JSON.stringify(v)));
  let h='<svg class="sys-network" role="img" aria-label="'+esc(s.title)+'" viewBox="0 0 720 335"><defs><marker id="currentArrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0 10 5 0 10" fill="#23755b"/></marker></defs>';
  for(const [key,[a,b]] of allLinks){
   if(!pos.has(a)||!pos.has(b))continue;
   const [x,y]=pos.get(a),[u,v]=pos.get(b),active=now.has(key),len=Math.hypot(u-x,v-y)||1;
   h+='<line x1="'+(x+29*(u-x)/len)+'" y1="'+(y+29*(v-y)/len)+'" x2="'+(u-31*(u-x)/len)+'" y2="'+(v-31*(v-y)/len)+'" stroke="'+(active?'#23755b':'#d1dfd4')+'" stroke-width="'+(active?4:2)+'"'+(active?' marker-end="url(#currentArrow)"':'')+'/>';
  }
  if(d.id!=='P0213')cols.forEach((col,k)=>h+=svgText(110+k*480/Math.max(1,cols.length-1),26,col,'column-label'));
  ents.forEach(n=>{
   const [x,y]=pos.get(n.id),active=s.active.includes(n.id),symbol=sym[n.id]||(d.id==='P0213'?'◉':n.label);
   h+='<circle cx="'+x+'" cy="'+y+'" r="27" fill="'+(active?'#d6e9d6':'#f3f5ed')+'" stroke="'+(active?'#32775e':'#bacdc0')+'" stroke-width="'+(active?3:1.4)+'"/>'+svgText(x,y+5,symbol,'mark')+
    (symbol!==n.label?svgText(x,y+43,n.label,'value'):'')+ (changes.has(n.id)?svgText(x,y+(symbol!==n.label?61:45),changes.get(n.id),'value'):'');
  });
  stage.innerHTML=h+'</svg>';
 }
 return {supports:id=>ids.has(id),render};
})();
