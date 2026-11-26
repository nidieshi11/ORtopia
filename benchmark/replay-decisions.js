(() => {
'use strict';
const questions = {
 P0058:'该扩建哪座机房，怎样应对后续服务器需求？', P0068:'先去哪一站调车，怎样降低调运代价？',
 P0154:'怎样安排通勤列车的发车间隔？', P0198:'八个站点最少能分成几个两跳互达区？',
 P0204:'船舶停哪个泊位、配几台岸桥才能及时装卸？',
 P0001:'两名患者过两个诊站，预约怎样错开？', P0012:'手术室和恢复室怎样接续，才能少加班？',
 P0013:'选哪种机组开停组合，再怎样分配火电和储能？', P0020:'两条先进先出车道，哪辆车应该先放行？',
 P0025:'先排常规班，再怎样应对两院区的需求变化？', P0045:'能把营销份额都给收益最高的渠道吗？',
 P0057:'有限的燃料额度应留给哪些售电时段？', P0062:'储能应在哪些时段买电、发电和等待？',
 P0075:'工序有先后，机器和技师怎样同时到位？', P0094:'车辆怎样分趟取货，兼顾时间窗和卸货？',
 P0122:'哪几单能装进同一辆车，怎样安排交货顺序？', P0145:'让无人机分送哪一单，卡车在哪里接回它？',
 P0160:'途中要补多少电，才能完成余下配送？', P0177:'让机器人分送一单，车队会提前多久收工？',
 P0182:'四个客户怎样分车、排顺序，才能准时且省能？', P0213:'供气量和入口压力怎么配，才能让全线合规？',
 P0214:'三台设备何时检修，哪些组合能满足可靠性要求？', P0310:'物资有限，调走一单位饮水会怎样改变总得分？',
 P0449:'本站的一辆车派往哪里，会怎样影响后续运力？', P0452:'三次上门怎样分派，才不会超过护士的工时上限？'
};
const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const number=new Intl.NumberFormat('zh-CN',{maximumFractionDigits:6});
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
 const delta=index===0?'':('<span class="choice-delta">相对「'+esc(c.options[0].label)+'」 '+(diff>0?'+':'')+number.format(diff)+' '+esc(o.unit)+'</span>');
 return '<section class="choice-box"><div class="choice-intro"><h3>'+esc(c.title)+'</h3><small>'+esc(o.unit)+'</small></div><div class="choice-list" aria-label="比较同一指标的取值">'+rowLabels(c,index)+'</div><p class="choice-note" aria-live="polite"><b>'+esc(o.label)+'</b>　'+esc(o.note)+' '+delta+'</p></section>';
}
function panel(target,rows,step,st,opt=0){
 const entry=rows[step];
 const checkpoints=rows.map((row,i)=>row.comparison?i:-1).filter(i=>i>=0);
 let branch='';
 if(entry.comparison)branch=comparison(entry.comparison,opt);
 else if(checkpoints.length){
  const next=checkpoints.find(i=>i>step)??checkpoints[0];
  branch='<button type="button" class="jump-choice" data-compare-step="'+next+'">看第 '+(next+1)+' 步的对照 <span>'+esc(rows[next].comparison.title)+' →</span></button>';
 }
 target.innerHTML='<header class="decision-heading"><span>第 '+(step+1)+' / '+rows.length+' 步</span><h2>'+esc(st.title)+'</h2></header><p class="decision-action">'+esc(entry.decision)+'</p><dl class="reason-lines"><div><dt>依据</dt><dd>'+esc(entry.evidence)+'</dd></div><div><dt>影响</dt><dd>'+esc(entry.consequence)+'</dd></div></dl>'+branch;
}
window.ORTOPIA_DECISIONS={questions,panel};
})();
