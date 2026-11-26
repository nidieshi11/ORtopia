(() => {
'use strict';
const questions = {
 P0058:'Which server room should expand to accommodate future demand?', P0068:'Which bike-sharing station should the rebalancing truck visit first to cut costs?',
 P0154:'How far apart should commuter trains depart?', P0198:'What is the fewest number of zones needed if every pair of sites in a zone must be within two hops?',
 P0204:'Which berth and how many quay cranes does each ship need to finish on time?',
 P0001:'How should two patients stagger their appointments across two clinics?', P0012:'How should surgery and recovery be scheduled to reduce overtime?',
 P0013:'Which generators should run, and how should thermal generation and storage share the load?', P0020:'Which vehicle should leave the two FIFO lanes first?',
 P0025:'How should regular shifts and on-call staff cover varying demand across two hospitals?', P0045:'Can all marketing effort go to the highest-return channel?',
 P0057:'In which trading periods should the generator use its limited fuel?', P0062:'When should the storage plant charge, discharge or idle?',
 P0075:'How can machines and technicians be available together when each operation is ready?', P0094:'How should pickups be split into trips to meet time windows and allow for unloading?',
 P0122:'Which orders fit on the same vehicle, and in what order should they be delivered?', P0145:'Which order should the drone deliver, and where should it rejoin the truck?',
 P0160:'How much should the vehicle recharge en route to complete its remaining deliveries?', P0177:'How much sooner can the fleet finish if a robot takes one delivery?',
 P0182:'How should four customers be assigned and sequenced to save energy and deliver on time?', P0213:'What gas supply and inlet pressure will keep the whole pipeline within its operating limits?',
 P0214:'When should three assets undergo maintenance to meet the reliability requirement?', P0310:'How does reallocating one unit of drinking water change the total relief score?',
 P0449:'Where should this station send a vehicle, and how will that affect future capacity?', P0452:'How should three home visits be assigned within the nurses’ working-hour limits?'
};
const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const number=new Intl.NumberFormat('en-US',{maximumFractionDigits:6});
function rowLabels(c,index) {
 const values=c.options.map(x=>x.value);
 const lo=Math.min(0,...values),hi=Math.max(0,...values),span=hi-lo||1;
 const zero=100*(-lo)/span;
 return c.options.map((o,k)=>{
   const start=100*(Math.min(0,o.value)-lo)/span,width=100*Math.abs(o.value)/span;
   return '<button class="choice-row" data-option="'+k+'" aria-pressed="'+(k===index)+'"><span class="choice-name">'+esc(o.label)+'</span><b>'+number.format(o.value)+'</b><span class="choice-scale" aria-hidden="true"><i style="left:'+start+'%;width:'+width+'%"></i><em style="left:'+zero+'%"></em></span></button>';
 }).join('');
}
function comparison(c,index){
 const o=c.options[index],diff=o.value-c.options[0].value;
 const delta=index===0?'':('<span class="choice-delta">relatively「'+esc(c.options[0].label)+'」 '+(diff>0?'+':'')+number.format(diff)+' '+esc(o.unit)+'</span>');
 return '<section class="choice-box"><div class="choice-intro"><h3>'+esc(c.title)+'</h3><small>'+esc(o.unit)+'</small></div><div class="choice-list" aria-label="Compare values of the same indicator">'+rowLabels(c,index)+'</div><p class="choice-note" aria-live="polite"><b>'+esc(o.label)+'</b>　'+esc(o.note)+' '+delta+'</p></section>';
}
function panel(target,rows,step,st,opt=0){
 const entry=rows[step];
 const checkpoints=rows.map((row,i)=>row.comparison?i:-1).filter(i=>i>=0);
 let branch='';
 if(entry.comparison)branch=comparison(entry.comparison,opt);
 else if(checkpoints.length){
  const next=checkpoints.find(i=>i>step)??checkpoints[0];
  branch='<button type="button" class="jump-choice" data-compare-step="'+next+'">Look at the first '+(next+1)+' comparison of steps <span>'+esc(rows[next].comparison.title)+' →</span></button>';
 }
 target.innerHTML='<header class="decision-heading"><span>No. '+(step+1)+' / '+rows.length+' step</span><h2>'+esc(st.title)+'</h2></header><p class="decision-action">'+esc(entry.decision)+'</p><dl class="reason-lines"><div><dt>Basis</dt><dd>'+esc(entry.evidence)+'</dd></div><div><dt>influence</dt><dd>'+esc(entry.consequence)+'</dd></div></dl>'+branch;
}
window.ORTOPIA_DECISIONS={questions,panel};
})();
