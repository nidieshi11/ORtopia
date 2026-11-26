(() => {
'use strict';
const questions = {
 P0058:"Which computer room should be expanded and how to cope with subsequent server demand?", P0068:"Which station should I go to first to shunt trains? How to reduce the shunting cost?",
 P0154:"How to arrange the departure intervals of commuter trains?", P0198:"How many two-hop interconnection zones can eight sites be divided into at least?",
 P0204:"Which berth should the ship park at and how many quay cranes should be equipped to load and unload in time?",
 P0001:"If two patients go to two clinics, how can they stagger their appointments?", P0012:"How to connect the operating room and recovery room to reduce overtime?",
 P0013:"Which unit start-stop combination should be chosen, and how to allocate thermal power and energy storage?", P0020:"There are two first-in, first-out lanes, which car should be let through first?",
 P0025:"Arrange regular classes first, and then how to deal with the changing needs of the two campuses?", P0045:"Can all marketing shares be given to the channel with the highest revenue?",
 P0057:"Which electricity sales periods should be reserved for limited fuel quota?", P0062:"During what periods should energy storage be purchased, generated and waited?",
 P0075:"There is a sequence of processes. How can machines and technicians be in place at the same time?", P0094:"How do vehicles pick up goods in separate trips, taking into account time windows and unloading?",
 P0122:"How many orders can be loaded into the same vehicle and how to arrange the order of delivery?", P0145:"Which order will be delivered by drone, and where will the truck pick it up?",
 P0160:"How much power do I need to replenish on the way to complete the rest of the delivery?", P0177:"If a robot is used to deliver an order, how early will the fleet finish work?",
 P0182:"How can four customers divide their vehicles and arrange them in order so that they can be on time and save energy?", P0213:"How to match the air supply volume and inlet pressure to ensure that the entire line is compliant?",
 P0214:"When will the three pieces of equipment be inspected and which combinations can meet the reliability requirements?", P0310:"Supplies are limited, how will removing one unit of drinking water change the total score?",
 P0449:"Where will a vehicle from this station be sent, and how will it affect subsequent transportation capacity?", P0452:"How to distribute the three home visits so as not to exceed the nurse's working hour limit?"
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
 const delta=index===0?'':("<span class=\"choice-delta\">relatively「"+esc(c.options[0].label)+'」 '+(diff>0?'+':'')+number.format(diff)+' '+esc(o.unit)+'</span>');
 return '<section class="choice-box"><div class="choice-intro"><h3>'+esc(c.title)+'</h3><small>'+esc(o.unit)+"</small></div><div class=\"choice-list\" aria-label=\"Compare values of the same indicator\">"+rowLabels(c,index)+'</div><p class="choice-note" aria-live="polite"><b>'+esc(o.label)+'</b>　'+esc(o.note)+' '+delta+'</p></section>';
}
function panel(target,rows,step,st,opt=0){
 const entry=rows[step];
 const checkpoints=rows.map((row,i)=>row.comparison?i:-1).filter(i=>i>=0);
 let branch='';
 if(entry.comparison)branch=comparison(entry.comparison,opt);
 else if(checkpoints.length){
  const next=checkpoints.find(i=>i>step)??checkpoints[0];
  branch='<button type="button" class="jump-choice" data-compare-step="'+next+"\">Compare step "+(next+1)+" <span>"+esc(rows[next].comparison.title)+' →</span></button>';
 }
 target.innerHTML="<header class=\"decision-heading\"><span>No. "+(step+1)+' / '+rows.length+" step</span><h2>"+esc(st.title)+'</h2></header><p class="decision-action">'+esc(entry.decision)+"</p><dl class=\"reason-lines\"><div><dt>Basis</dt><dd>"+esc(entry.evidence)+"</dd></div><div><dt>influence</dt><dd>"+esc(entry.consequence)+'</dd></div></dl>'+branch;
}
window.ORTOPIA_DECISIONS={questions,panel};
})();
