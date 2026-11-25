'use strict';
window.ORTOPIA_CARE=(()=>{
 const supported=new Set(['P0452','P0012','P0001','P0025','P0310']);
 const fmt=n=>new Intl.NumberFormat('zh-CN',{maximumFractionDigits:5}).format(n);
 const esc=t=>String(t).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const reduced=()=>window.matchMedia('(prefers-reduced-motion:reduce)').matches;
 const font='Microsoft YaHei,PingFang SC,Arial,sans-serif';
 function text(x,y,s,size=16,color='#183f3d',anchor='middle',weight=600){
  return '<text x="'+x+'" y="'+y+'" fill="'+color+'" text-anchor="'+anchor+'" font-family="'+font+'" font-size="'+size+'" font-weight="'+weight+'">'+esc(s)+'</text>';
 }
 function tag(x,y,s,bg='#173f42',size=16){
  const w=Math.max(46,Array.from(String(s)).reduce((v,c)=>v+(c.charCodeAt(0)<128?.6:1),0)*size+18);
  return '<g transform="translate('+x+' '+y+')"><rect x="'+(-w/2)+'" y="'+(-size-4)+'" width="'+w+'" height="'+(size+12)+'" rx="5" fill="'+bg+'"/>'+text(0,-1,s,size,'#fff9ea')+'</g>';
 }
 function rotate(values,dur,repeat='indefinite',begin='0s'){
  if(reduced())return '';
  return '<animateTransform attributeName="transform" type="rotate" values="'+values+'" dur="'+dur+'s" repeatCount="'+repeat+'" begin="'+begin+'" fill="freeze"/>';
 }
 function shift(values,dur,repeat='indefinite'){
  if(reduced())return '';
  return '<animateTransform attributeName="transform" type="translate" values="'+values+'" dur="'+dur+'s" repeatCount="'+repeat+'" fill="freeze"/>';
 }
 function motion(path,seconds=3.6,begin=0){
  if(reduced()||!path)return '';
  return '<animateMotion path="'+path+'" dur="'+seconds+'s" begin="'+begin+'s" fill="freeze" calcMode="paced"/>';
 }
 // Each actor is rigged about the hip and shoulder joints; the feet are anchored at local (0,0).
 function actor(opts={}){
  const {role='nurse',pose='idle',facing=1,scale=1,skin='#c88965',name='',phase=0,cycles='indefinite',coat}=opts;
  const staff=['nurse','standby','doctor'].includes(role),haul=role==='worker',patient=role==='patient';
  const base=coat||(haul?'#c88537':patient?'#bb806f':role==='standby'?'#87729a':'#397e86');
  const face=skin,dark=haul?'#594c3a':patient?'#524e5d':'#294e59';
  const walking=pose==='walk'||pose==='carry',work=pose==='service'||pose==='clipboard'||pose==='hand';
  const gait=walking?'0;19;0;-19;0':'0;1;0;-1;0',counter=walking?'0;-20;0;20;0':'0;-1;0;1;0';
  const swing=(far)=>rotate(far?gait:counter,walking?.72:3.1,walking?cycles:'indefinite');
  function leg(x,far){
   return '<g transform="translate('+x+' -29)"><g>'+swing(far)+'<path d="M-3 0 Q3 -1 4 3 L3 15 5 26 0 27 -3 16 -5 6Z" fill="'+(far?'#415861':dark)+'"/><path d="M0 24h5l4 2q3 2 1 3H-1z" fill="#303a3c"/><path d="M0 28h10" stroke="#87918b" stroke-width="1.2"/></g></g>';
  }
  function arm(far){
   const armColor=far?'#6e9696':base,ang=walking?(far?counter:gait):work?(far?'0;-8;0':'0;-20;-10;0'):'0;3;0;-3;0';
   const hand=work||pose==='carry';
   return '<g transform="translate('+(far?-2:1)+' -48)"><g>'+rotate(ang,walking?.72:1.9,walking?cycles:'indefinite')+
    '<path d="'+(hand?'M0 0l4 8 9 -4':'M0 0l1 10 4 8')+'" stroke="'+face+'" stroke-width="4.4" stroke-linecap="round" fill="none"/>'+
    '<path d="M-2 -1q4 -2 6 2l1 6 -6 2 -3 -6z" fill="'+armColor+'"/><ellipse cx="'+(hand?13:5)+'" cy="'+(hand?4:18)+'" rx="2.5" ry="2.1" fill="'+face+'"/></g></g>';
  }
  const cloth='<path d="M-6 -50q6 -4 12 0l2 11 2 12q-10 3-20 0l2-14z" fill="'+base+'"/><path d="M-5 -48l3 18h-6l1-14z" fill="#213e46" opacity=".2"/>'+
    (staff?'<path d="M-4 -50l4 6 5-7" stroke="#d6ece7" stroke-width="1.6" fill="none"/><rect x="3" y="-43" width="3.6" height="5.4" rx=".7" fill="#e5f3df"/><path d="M-7 -39q3 4 6 0" stroke="#244c57" fill="none"/>':haul?'<path d="M-5 -49l3 17m6-18l-2 18m-10-3h17" stroke="#f5df70" stroke-width="2.8"/>':'');
  const hair=patient?'#716862':'#493d36';
  const head='<path d="M-3 -55h6v6q-3 2-6 0z" fill="'+face+'"/><path d="M-5 -63q5-6 11 0l1 5 2 2 -2 1q0 6-5 6l-5-3Z" fill="'+face+'"/>'+
    '<path d="M-6 -62q0-8 8-7 5 0 6 6l-7-1 -3 7-4-2Z" fill="'+hair+'"/><circle cx="4.5" cy="-59.5" r=".85" fill="#393732"/>'+
    (staff?'<path d="M-7 -64q1-7 8-7 7 0 8 8l-10-1-6 2z" fill="'+(role==='standby'?'#b9a4ce':'#90c2ba')+'"/>':haul?'<path d="M-8 -63q0-8 7-8t8 8l3 2h-17z" fill="#f4c050"/>':'')+
    (pose==='service'&&staff?'<path d="M1 -58l6-1v5l-5 1z" fill="#d9e8df"/>':'');
  const prop=pose==='clipboard'?'<g transform="translate(9 -46) rotate(10)"><rect width="9" height="9" rx="1" fill="#283e42"/><path d="M1 1h7v6H1z" fill="#c5dcd0"/></g>':pose==='carry'?'<g transform="translate(7,-47)"><path d="M0 2l8-3 8 3 -8 3z" fill="#ddb990"/><path d="M0 2l8 3v10l-8-3z" fill="#ad7954"/><path d="M8 5l8-3v10l-8 3z" fill="#c9986b"/></g>':
    staff&&walking?'<path d="M-8 -35l5 11" stroke="#674d3d" stroke-width="1.6"/><rect x="-10" y="-26" width="12" height="10" rx="2" fill="#aa7750"/><path d="M-7-22h5" stroke="#dfc399" stroke-width="1.4"/>':'';
  return '<g data-care-role="'+role+'" transform="scale('+scale+')"><ellipse cx="3" cy="0" rx="12" ry="3.3" fill="#223d3d" opacity=".22"/><g transform="scale('+facing+' 1)"><g>'+leg(-3,true)+leg(2,false)+
   '<g>'+shift(walking?'0 0;0 -1;0 0;0 -1;0 0':'0 0;0 -.7;0 0',walking?.72:2.7,walking?cycles:'indefinite')+arm(true)+cloth+head+arm(false)+prop+'</g></g></g>'+
   (name?tag(0,16,name,'#355951',12):'')+'</g>';
 }
 function at(x,y,content){return '<g transform="translate('+x+' '+y+')">'+content+'</g>';}
 function traveler(start,end,path,content,seconds=3.4){
  if(reduced()||!path)return at(end[0],end[1],content);
  return at(start[0],start[1],'<g class="care-traveler">'+motion(path,seconds)+content+'</g>');
 }
 function svg(scene,body,defs=''){
  return '<svg class="care-world" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 570" width="100%" role="img" aria-label="'+esc(scene)+'"><title>'+esc(scene)+'</title><defs>'+defs+'</defs>'+body+'</svg>';
 }
 const sky='<linearGradient id="cwSky" x2="0" y2="1"><stop stop-color="#a5ced9"/><stop offset="1" stop-color="#e8e9d2"/></linearGradient>';
 const soil='<linearGradient id="cwGround" x2=".9" y2="1"><stop stop-color="#b4c8ac"/><stop offset="1" stop-color="#8cab8c"/></linearGradient>';
 const tile='<pattern id="cwFloor" width="47" height="32" patternUnits="userSpaceOnUse" patternTransform="skewX(-11)"><rect width="47" height="32" fill="#dde3d6"/><path d="M47 0H0V32" fill="none" stroke="#cad4c8"/></pattern>';
 function tree(x,y,k=1){
  return at(x,y,'<g transform="scale('+k+')"><ellipse cx="8" cy="2" rx="23" ry="7" fill="#60775c" opacity=".3"/><path d="M0 0l1-37" stroke="#726952" stroke-width="6"/><path d="M0-16l-9-12m10 4l9-9" stroke="#726952" stroke-width="3"/><path d="M-18-32q-7-13 1-21 5-15 18-13 12-1 16 11 10 4 8 15-2 13-20 14-16 2-23-6z" fill="#789c78"/><path d="M-20-41q-1-12 8-15 4-12 18-9 5 1 7 6-19 0-15 16-11-4-18 2z" fill="#a0b98d"/></g>');
 }
 function shrubs(x,y,w){let h='';for(let k=0;k<Math.floor(w/11);k++)h+='<ellipse cx="'+(x+k*11)+'" cy="'+(y-(k%3)*2)+'" rx="10" ry="6" fill="'+['#8da97c','#9db58c','#769879'][k%3]+'"/>';return h;}
 // The clinic office and visit interior are dramatized at room scale; the sheet, allocation
 // counts, choice of day and service durations come from the recorded action.
 function dispatchBoard(v,optionIndex=0){
  const trial=optionIndex===1,emphasizeLimit=optionIndex===2,fixedView=trial||emphasizeLimit||reduced();
  const total=v.regularVisits+v.diverted,limit=v.shift+v.overtimeLimit;
  const road=v.outbound+v.inbound,allRegular=road+total*v.serviceEach;
  const timeScale=222/Math.max(limit,allRegular),limitX=184+limit*timeScale;
  let layer='<g class="dispatch-board" aria-label="当日访问分派与班次时长对照">'+
   '<rect x="25" y="83" width="490" height="356" rx="12" fill="#173e3b" stroke="#d5c29b" stroke-width="5"/>'+
   text(48,120,trial?'试排 · '+total+' 次全交常规护士':emphasizeLimit?'班次上限 · 含允许加班':'当日 '+total+' 次访问如何分派',23,'#fff9e9','start',700)+
   text(48,145,trial?'将待命组的一次访问调入常规组':emphasizeLimit?'上限由正常班次和允许加班相加得到':'每个标记代表一次访问，按区域计数',16,'#c2d9cb','start',400);
  const lanes=[[181,'待分派'],[233,'常规护士'],[278,'待命护士']];
  for(const [y,label] of lanes){
   layer+='<rect x="43" y="'+(y-18)+'" width="449" height="37" rx="6" fill="#28504b"/>'+
   text(57,y+6,label,17,'#fbf7e6','start');
  }
  for(let k=0;k<total;k++){
   const regular=trial||k<v.regularVisits;
   const sx=200+65*k,sy=181,ex=200+65*(regular?k:k-v.regularVisits),ey=regular?233:278;
   const begin=.55+k*.55;
   const move=fixedView?'':motion('M0 0 Q'+((ex-sx)*.3)+' '+((ey-sy)*.8)+' '+(ex-sx)+' '+(ey-sy),1.05,begin);
   const color=trial&&k>=v.regularVisits?'#ffae7f':regular?'#8de0b7':'#ddc5f0';
   const fill=fixedView?color:'#f8eabb';
   const change=fixedView?'':'<set attributeName="fill" to="'+color+'" begin="'+(begin+1.05)+'s" fill="freeze"/>';
   layer+=at(fixedView?ex:sx,fixedView?ey:sy,'<g class="visit-token" data-assigned="'+(regular?'regular':'standby')+'">'+move+'<rect x="-25" y="-13" width="50" height="26" rx="13" fill="'+fill+'">'+change+'</rect>'+text(0,6,'1 次',17,'#183c36')+'</g>');
  }
  layer+=text(48,330,'含往返的常规护士工时',17,'#fff9e9','start')+
   text(492,330,'竖线为上限 '+fmt(limit),15,'#e6dfba','end',500);
  const demands=[['常规 '+v.regularVisits+' 次',v.tour,'#8de0b7'],['全部由常规',allRegular,'#edb382']];
  demands.forEach(([label,value,color],j)=>{
   const y=358+j*37;
   layer+=text(53,y+5,label,17,'#faf7e6','start')+
    '<rect x="184" y="'+(y-7)+'" width="'+(value*timeScale)+'" height="12" rx="4" fill="'+color+'"/>'+
    text(489,y+5,fmt(value),16,'#fff9e9','end');
  });
  layer+='<path d="M'+limitX+' 341v69" stroke="'+(emphasizeLimit?'#ffdd62':'#e5dfbb')+'" stroke-width="'+(emphasizeLimit?5:2.5)+'" stroke-dasharray="'+(emphasizeLimit?'none':'3 3')+'"/>';
  if(trial||emphasizeLimit){
   const label=trial?'超出班次上限 '+fmt(allRegular-limit)+' · 这次试排不可行':'正常 '+fmt(v.shift)+' ＋ 允许加班 '+fmt(v.overtimeLimit)+' ＝ '+fmt(limit);
   layer+='<rect x="26" y="453" width="488" height="46" rx="6" fill="'+(trial?'#803e28':'#47543e')+'"/>'+text(270,482,label,18,'#fff8e7');
  }
  return layer+'</g>';
 }
 function office(data,i){
  const v=data.sceneValues;
  const stations=[[403,372],[537,383],[804,428],[658,360]];
  const from=stations[i],to=stations[i+1],facing=to[0]>=from[0]?1:-1;
  const dx=to[0]-from[0],dy=to[1]-from[1],walkTime=3.5;
  const path='M0 0 Q'+(dx*.54)+' '+(dy*.5+18)+' '+dx+' '+dy;
  const scale=i===2?3.08:3.02;
  const walking=traveler(from,to,path,actor({pose:'walk',scale,facing,cycles:5}),walkTime);
  const task=at(...to,actor({pose:i===2?'hand':'clipboard',scale,facing}));
  let room='<image href="assets/replays/P0452/clinic-office.webp" width="1000" height="570" preserveAspectRatio="xMidYMid slice"/>';
  room+=tag(142,45,'护理基地 0 · 值班室','#254c42',18);
  room+=reduced()?task:'<g>'+walking+'<set attributeName="visibility" to="hidden" begin="3.5s" fill="freeze"/></g>'+
   '<g visibility="hidden"><set attributeName="visibility" to="visible" begin="3.5s" fill="freeze"/>'+task+'</g>';
  const note=['读取当日 '+v.initialVisits+' 次访问','新转介 · 首次访问排在第 2 天','常规 '+v.regularVisits+' 次 · 待命 '+v.diverted+' 次'][i];
  if(i===2)room+=dispatchBoard(v);
  else room+=tag(780,522,note,'#2d6055',16);
  return svg(data.steps[i].title,room);
 }
 function visitInterior(data){
  const start=[163,349],end=[625,403],patient=[696,403];
  const walkingPerson=actor({pose:'walk',scale:2.35,cycles:5});
  const approach='<g><animateTransform attributeName="transform" type="scale" from="1" to="1.17" dur="3.4s" fill="freeze"/>'+walkingPerson+'</g>';
  const path='M0 0 Q110 50 237 54 T462 54';
  const walking=traveler(start,end,path,approach,3.4);
  const service=at(...end,actor({pose:'service',scale:2.75}));
  let room='<image href="assets/replays/P0452/home-visit.webp" width="1000" height="570" preserveAspectRatio="xMidYMid slice"/>';
  room+=tag(168,45,'居住区 1 · 入户访视','#67573f',18);
  room+=at(...patient,actor({role:'patient',pose:'hand',facing:-1,scale:2.63,coat:'#a77765',skin:'#c5987b'}));
  room+=reduced()?service:'<g>'+walking+'<set attributeName="visibility" to="hidden" begin="3.4s" fill="freeze"/></g>'+
   '<g visibility="hidden"><set attributeName="visibility" to="visible" begin="3.4s" fill="freeze"/>'+service+'</g>';
  room+=tag(785,522,'本区常规访问 '+data.sceneValues.regularVisits+' 次','#67573f',16);
  return svg('居家访视动作示意',room);
 }

 function home(data,i){
  const v=data.sceneValues,B=[182,311],Z=[797,259];
  const bg='<image href="assets/replays/P0452/care-scene.webp" x="0" y="0" width="1000" height="570" preserveAspectRatio="xMidYMid slice"/>';
  const back='<path d="M0 0H1000V570H0Z" fill="#c6d5b9"/>';
  const outward='M0 0 C60 16 165 -14 240 -16 S401 4 478 -17 S562 -44 615 -52';
  const inward='M0 0 C-57 9 -77 40 -137 35 S-287 35 -375 36 S-554 75 -615 52';
  
  let body=back+bg,regular,standby='';
  if(i===0||i===1||i===2){
   const pose=i===2?'hand':'clipboard';
   regular=at(B[0],B[1],actor({role:'nurse',pose,scale:.88}));
  }else if(i===3)regular=traveler(B,Z,outward,actor({pose:'walk',scale:.95,cycles:7.6}),5.5);
  else if(i===4)regular=at(Z[0],Z[1],actor({pose:'service',scale:.83}));
  else regular=traveler(Z,B,inward,actor({pose:'walk',scale:.95,cycles:7.6,facing:-1}),5.5);
  if(i>=2)standby=at(883,310,actor({role:'standby',pose:i===4?'service':'clipboard',facing:-1,scale:.82}));
  if(i===4)body+=at(823,257,actor({role:'patient',pose:'hand',facing:-1,scale:.77,skin:'#bd8c70',coat:'#b5826c'}));
  if(i===3||i===5)body+='<path d="M182 311 C242 327 347 297 422 295 S583 315 660 294 S744 267 797 259" fill="none" stroke="#fbfae8" stroke-opacity=".7" stroke-width="5"/><path d="M182 311 C242 327 347 297 422 295 S583 315 660 294 S744 267 797 259" fill="none" stroke="#5b8e75" stroke-width="2" stroke-dasharray="7 9"/>';
  body+=regular+standby+tag(149,197,'护理基地 0','#25594e',17)+tag(831,159,'居住区 1','#516745',17);
  if(i<=2)body+=tag(295,316,['读取日初排程','首次访问定在第 2 天','常规 2 次 · 转交 1 次'][i],'#32695d',14);
  if(i===4)body+=tag(779,302,'常规护理 × '+v.regularVisits,'#32695d',14);
  const summaries=[
   [['日初排程',v.initialVisits+' 次'],['新增转介',v.newReferrals+' 个'],['观察时点','日初']],
   [['接收转介',v.scheduledDay2+' 个'],['首次访问','第 2 天'],['今天排程',v.initialVisits+' 次']],
   [['当日访问',v.initialVisits+' 次'],['常规护士',v.regularVisits+' 次'],['待命护士',v.diverted+' 次']],
   [['去程','基地 0 → 区域 1'],['行程时长',fmt(v.outbound)],['常规访问',v.regularVisits+' 次']],
   [['常规服务',v.regularVisits+' 次'],['单次时长',fmt(v.serviceEach)],['合计时长',fmt(v.serviceEach*v.regularVisits)]],
   [['返程时长',fmt(v.inbound)],['班次总时长',fmt(v.tour)],['加班时长',fmt(v.overtime)]]
  ];
  return [i<3?office(data,i):i===4?visitInterior(data):svg(data.steps[i].title,body),summaries[i],'人物、住宅和步行动作为服务过程示意；本实例按区域记录访问数量。'];
 }
 function windowpane(x,y,w=63,h=44){
  return '<g transform="translate('+x+' '+y+')"><rect width="'+w+'" height="'+h+'" fill="#e8ebe0" stroke="#b9c9bd" stroke-width="3"/><rect x="3" y="3" width="'+(w-6)+'" height="'+(h-6)+'" fill="#9cbfc2"/><path d="m6 '+(h*.7)+' l'+(w*.47)+' -'+(h*.56)+' m-2 '+(h*.57)+' l'+(w*.28)+' -'+(h*.43)+'" stroke="#d7e7dd" stroke-width="3" opacity=".8"/><path d="M'+(w/2)+' 0v'+h+'" stroke="#f1f1df" stroke-width="3"/></g>';
 }
 function bench(x,y){return at(x,y,'<path d="m0 0 11-10h70l-10 10z" fill="#c1a379"/><path d="M0 0h71v5H0z" fill="#967e5b"/><path d="M8 5v10m56-10v10" stroke="#4c6862" stroke-width="4"/><path d="M8 -8v-11h70v10" fill="#d0b38d" stroke="#887e67" stroke-width="2"/>');}
 function bed(x,y){
  return at(x,y,'<ellipse cx="3" cy="7" rx="54" ry="9" fill="#879c8c" opacity=".36"/><path d="M-46 2l4 11m77-14l3 12" stroke="#617778" stroke-width="4"/><path d="m-50-4 13-14 88 0-13 14z" fill="#b6d4ce" stroke="#708e8b" stroke-width="2"/><path d="M-50-4h88v8h-88z" fill="#95b6b1"/><path d="m-47-6 12-12h21l-10 12z" fill="#edf4e5"/><path d="m-12 -6 10-10h50l-11 10z" fill="#4a9993"/><path d="M-50 -4v-12m88 12v-8" stroke="#657c7c" stroke-width="3"/>');
 }
 function monitor(x,y){return at(x,y,'<path d="M0 0v-26m-11 27h22" stroke="#647a76" stroke-width="4"/><rect x="-13" y="-38" width="28" height="18" rx="3" fill="#436966"/><path d="M-11-27h5l3-5 4 9 4-6h7" stroke="#9ce1a7" stroke-width="1.4" fill="none"/>');}
 function lamp(x,y){return at(x,y,'<path d="M-17 -38v18L-3-6 12-12" fill="none" stroke="#83999b" stroke-width="4"/><ellipse cx="14" cy="-8" rx="17" ry="6" fill="#b3c6c0"/><ellipse cx="15" cy="-6" rx="13" ry="3" fill="#f9f3d5"/>');}
 function hospitalBackground(names,surgery){
  let s='<rect width="1000" height="570" fill="url(#cwGround)"/><path d="M0 0h1000v73H0z" fill="url(#cwSky)"/>';
  for(let i=0;i<16;i++)s+=tree(i*70-10,78+(i%3)*8,.6+(i%4)/10);
  s+='<path d="M22 442L76 91h897l17 360-50 32H69Z" fill="#729284" opacity=".4"/><path d="M22 433l48-340h904l-34 340z" fill="#8aa397"/><path d="M24 419L76 113h889l-43 306z" fill="url(#cwFloor)" stroke="#829d93" stroke-width="3"/>'+
  '<path d="M75 78h896v113H75z" fill="#d4e1d6"/><path d="M75 69h902l-6 12H71z" fill="#638b80"/><path d="M75 177h896v14H75z" fill="#a0b8ab"/>';
  for(const x of [88,300,511,729]){s+=windowpane(x,92,75,52)+windowpane(x+97,92,67,52);}
  for(const x of [68,277,491,706,945]){
   s+='<path d="M'+x+' 190l-24 123v-70l24-121z" fill="#a9c0b8"/><path d="M'+(x-2)+' 123l-24 117 6 4 23-120z" fill="#e8eee0"/>';
  }
  s+='<path d="M38 322h908l-8 38H33Z" fill="#c2d2c7"/><path d="M36 345h906" stroke="#acbfb3" stroke-width="2"/><path d="M17 443h939l-7 17H10z" fill="#c3c7af"/><path d="M0 514h1000v56H0z" fill="#c1beaf"/><path d="M0 512h1000" stroke="#e7dfc8" stroke-width="5"/>';
  s+=bench(90,272)+bench(169,272)+bench(754,280);
  names.forEach((n,i)=>s+=tag(157+219*i,180,n,'#436d69',16));
  if(surgery)s+=bed(378,251)+monitor(337,244)+lamp(424,198)+bed(590,246)+monitor(629,240);
  else s+=bench(329,259)+monitor(405,232)+bench(541,259)+monitor(623,232);
  s+=at(430,256,actor({role:'doctor',pose:'service',coat:'#6d929a',facing:-1,scale:.72}))+at(645,260,actor({role:'doctor',pose:'clipboard',coat:'#729883',facing:-1,scale:.72}));
  s+=tree(54,480,.8)+tree(974,437,.83)+shrubs(111,470,159)+shrubs(655,474,203)+bench(450,466);
  return s;
 }
 function getPhase(data,i){
  const s=data.steps[i],multi=data.id==='P0001';
  if(multi&&!s.time)return {scenario:'',clock:0,ev:[]};
  const m=multi?/^(\S+)\s*\/\s*t=([\d.]+)/.exec(s.time):/([\d.]+)/.exec(s.time);
  return {scenario:multi?m[1]:'',clock:+m[multi?2:1],ev:data.schedule.events.filter(e=>!multi||e.resource.startsWith(m[1]+' · '))};
 }
 function place(phase,id,multi){
  const ev=phase.ev.filter(e=>e.label===id).sort((a,b)=>a.start-b.start);if(!ev.length)return -1;
  const {clock}=phase;
  if(clock<ev[0].start)return -1;
  const idx=ev.findIndex(e=>e.start<=clock&&clock<e.end);if(idx>=0)return idx+1;
  return clock>=ev[ev.length-1].end?3:0;
 }
 function roomTimeline(data,phase,ids){
  const events=data.schedule.events,finish=Math.max(...events.map(e=>e.end)),shift=data.sceneValues.regularEnd;
  const left=130,right=960,x=t=>left+t*(right-left)/finish;
  const colors=['#f4b48f','#b0cae3','#9cd9b8'];
  let strip='<g class="room-timeline" aria-label="手术和恢复的实际时隙排程">'+
   '<rect x="18" y="404" width="964" height="154" rx="9" fill="#173f3e" stroke="#a5bbae" stroke-width="2"/>'+
   text(38,430,(data.trial?'试排':'实际')+'排程 · 时隙 '+fmt(phase.clock),19,'#fff8e7','start',700)+
   text(959,430,'常规班结束 '+fmt(shift)+'　｜　白线表示当前交接时刻',16,'#d5e8da','end',500);
  const rooms=[...new Set(events.map(e=>e.resource))].sort((a,b)=>a.localeCompare(b));
  for(const [j,room] of rooms.entries()){
   const y=444+j*37;
   strip+=text(40,y+19,room.startsWith('OR')?'手术室':'恢复室',18,'#fff8e7','start')+
    '<rect x="'+left+'" y="'+y+'" width="'+(right-left)+'" height="27" rx="3" fill="#355957"/>'+
    '<rect x="'+x(shift)+'" y="'+y+'" width="'+(right-x(shift))+'" height="27" fill="#79594a" opacity=".7"/>';
   for(const e of events.filter(event=>event.resource===room)){
    const active=e.start<=phase.clock&&phase.clock<e.end;
    const opacity=active?1:e.end<=phase.clock?.83:.65;
    strip+='<g class="scheduled-patient" data-patient="'+esc(e.label)+'" data-occupied="'+active+'"><title>'+esc(room+'：'+e.label+'，时隙 '+e.start+' 至 '+e.end)+'</title>'+
     '<rect x="'+(x(e.start)+1)+'" y="'+y+'" width="'+(x(e.end)-x(e.start)-2)+'" height="27" rx="3" fill="'+colors[ids.indexOf(e.label)%colors.length]+'" opacity="'+opacity+'"'+(active?' stroke="#fffae4" stroke-width="2"':'')+'/>'+
     text((x(e.start)+x(e.end))/2,y+19,e.label+' · '+e.start+'–'+e.end,16,'#102e2b')+'</g>';
   }
  }
  const now=x(phase.clock);
  strip+='<path d="M'+x(shift)+' 437v75" stroke="#eac094" stroke-width="2" stroke-dasharray="3 3"/>'+
   '<path d="M'+(now-5)+' 436h10l-5 7z M'+now+' 441v74" fill="#fffae9" stroke="#fffae9" stroke-width="2"/>';
  const ticks=[...new Set(events.flatMap(e=>[e.start,e.end]))].sort((a,b)=>a-b);
  for(const t of ticks)strip+=text(x(t),538,fmt(t),16,t===phase.clock?'#fff9df':'#ceddd1');
  return strip+'</g>';
 }
 function ward(data,i){
  const multi=data.id==='P0001',phase=getPhase(data,i),previous=i?getPhase(data,i-1):null;
  const names=['等候区',multi?'诊疗站 n1':'手术室 OR_1',multi?'诊疗站 n2':'恢复室 PACU_1','离开诊疗区'];
  let body=hospitalBackground(names,!multi),count=0;
  const ids=data.entities.filter(e=>e.group==='患者').map(e=>e.id);
  const slots=(where,j)=>where===0?[119+j*40,280+j%2*15]:where===1?[337,288]:where===2?[564,288]:where===3?[793+j*35,350+j%2*20]:[95+j*36,385];
  ids.forEach((id,j)=>{
   const loc=place(phase,id,multi);
   if(loc===3)count++;
   if(loc===-1)return;
   const prev=previous&&phase.scenario===previous.scenario?place(previous,id,multi):-1;
   if(prev===3&&loc===3)return;
   const start=slots(prev,j),end=slots(loc,j),moving=prev!==loc;
   const dx=end[0]-start[0],dy=end[1]-start[1];
   let person;
   if(!multi&&loc!==3){
    // A wheeled patient trolley transfers directly between rooms at the scheduled boundary.
    person=bed(0,0)+at(0,-6,'<path d="m-31-7 11-5 47 1 8 5-43 2z" fill="'+['#98aaa5','#92a9b6','#c29a8a'][j%3]+'"/><ellipse cx="-27" cy="-9" rx="6" ry="5" fill="#cb967a"/>')+at(-43,3,actor({role:'nurse',scale:.7,pose:moving?'walk':'service',cycles:4}))+tag(0,26,id,'#50757a',12);
   }else person=actor({role:'patient',name:id,coat:['#b88271','#7c9aaf','#ac9270'][j%3],scale:.82,pose:moving?'walk':'idle',cycles:4});
   const corridor=361-start[1];
   const trace=moving?'M0 0 Q2 '+(corridor*.55)+' 0 '+corridor+' L'+dx+' '+corridor+' Q'+dx+' '+((corridor+dy)/2)+' '+dx+' '+dy:'';
   body+=traveler(start,end,trace,person,3.0);
  });
  if(!multi)body+=roomTimeline(data,phase,ids);
  if(multi&&!phase.ev.length)body+=at(177,275,actor({role:'nurse',pose:'clipboard',scale:.79}));
  return [svg(data.steps[i].title,body,sky+soil+tile),
   [[multi?'服务情景':'当前时隙',multi?(phase.scenario||'共同预约表'):fmt(phase.clock)],['服务中',data.steps[i].links.length+' 人'],['已完成',count+' / '+ids.length+' 人']],
   multi?'两组服务时长情景分别从零开始，房间与人物造型为示意。':'患者转运按排程事件演示，进出房间的动画时长按比例压缩。'];
 }
 function block(x,y,w,h,style){
  const {roof='#698b89',wall='#e0dcca',side='#acc0b4',warehouse=false,name}=style;
  const dx=Math.min(43,w*.2),dy=dx*.54;
  let b='<path d="M-8 12l'+(w+27)+' 8 '+(dx+10)+' -'+(dy+8)+' -32 -17z" fill="#748a74" opacity=".43"/>'+
   '<path d="M0 0v-'+h+'h'+w+'v'+h+'z" fill="'+wall+'"/><path d="M'+w+' 0l'+dx+' -'+dy+'v-'+h+'l-'+dx+' '+dy+'z" fill="'+side+'"/>'+
   '<path d="M-4 -'+h+'l'+dx+' -'+dy+'h'+(w+10)+'l-'+(dx+3)+' '+dy+'z" fill="'+roof+'"/>'+
   '<path d="M-4 -'+h+'h'+(w+8)+'v6H-4z" fill="#5b7772"/>';
  if(warehouse){
   for(let j=0;j<8;j++){const rx=9+j*(w-14)/8;b+='<path d="M'+rx+' -'+(h+1)+'l'+dx+' -'+(dy-2)+'" stroke="#98aba4" stroke-width="2"/>';}
   b+='<rect x="'+(w*.23)+'" y="-'+(h*.62)+'" width="'+(w*.53)+'" height="'+(h*.62)+'" fill="#536c69"/><rect x="'+(w*.25)+'" y="-'+(h*.59)+'" width="'+(w*.49)+'" height="'+(h*.2)+'" fill="#9baca6"/>';
   for(let j=0;j<3;j++)b+='<path d="M'+(w*.25)+' '+(-h*.58+j*4)+'h'+(w*.49)+'" stroke="#778a86"/>';
  }else{
   b+=windowpane(11,-h+21,w*.23,h*.33)+windowpane(w*.68,-h+21,w*.22,h*.33)+
    '<rect x="'+(w*.42)+'" y="-'+h*.53+'" width="'+w*.19+'" height="'+h*.53+'" fill="#577879"/>'+
    '<rect x="'+(w*.443)+'" y="-'+h*.5+'" width="'+w*.145+'" height="'+h*.31+'" fill="#aacbc8"/>'+
    '<path d="M'+(w*.36)+' 0h'+(w*.32)+'l-5 6h-'+(w*.32)+'z" fill="#c8cabc"/><path d="M'+(w*.36-5)+' 6h'+w*.32+'v3h-'+w*.32+'z" fill="#adb3a6"/>'+
    '<path d="M'+(w*.465)+' -'+(h*.85)+'h8v-7h7v7h7v7h-7v7h-7v-7h-8z" fill="#4a8c78"/>';
  }
  if(name)b+=tag(w/2,-h-12,name,'#315c54',16);
  return at(x,y,b);
 }
 function campus(data,i){
  const st=data.steps[i],base=[493,419],sites={H0:[212,272],H1:[777,282]};
  let b='<rect width="1000" height="570" fill="url(#cwGround)"/><path d="M0 54L195 4l805 65v58L149 79 0 114z" fill="#c6baa0"/>'+
   '<path d="M-40 377C241 400 294 280 494 278 S851 401 1030 315" fill="none" stroke="#e0d9c4" stroke-width="67"/><path d="M-40 377C241 400 294 280 494 278 S851 401 1030 315" fill="none" stroke="#b6b8a7" stroke-width="47"/>'+
   '<path d="M-40 377C241 400 294 280 494 278 S851 401 1030 315" fill="none" stroke="#f1ecce" stroke-width="2" stroke-dasharray="16 13"/>'+
   '<path d="M202 254l17 91m561-64l-23 59M481 317l9 117" stroke="#ded7bd" stroke-width="31" fill="none"/>';
  for(const [x,y,k] of [[74,135,1],[54,213,.68],[947,246,1],[45,470,1.1],[918,468,1.1],[598,115,1],[476,142,.8],[358,80,.75],[652,427,.7]])b+=tree(x,y,k);
  b+=block(74,253,230,113,{name:'院区 H0'})+block(651,265,237,118,{name:'院区 H1',roof:'#8a9997'})+block(408,415,155,69,{name:'候召值班处',roof:'#768f83'});
  b+=shrubs(68,264,75)+shrubs(822,280,68)+bench(587,444);
  const doctorIds=data.entities.filter(d=>d.group==='麻醉医师').map(d=>d.id);
  doctorIds.forEach((id,j)=>{
   const to=st.links.find(pair=>pair[0]===id)?.[1];
   // Every alternative demand starts from the same advance staff assignment.
   const advance=data.steps[0].links.find(pair=>pair[0]===id)?.[1];
   const target=to?sites[to]:base;const offset=to===advance?23:0;
   const end=[target[0]+offset,target[1]+(to===advance?7:0)];
   const initial=i===0?[target[0]-38,target[1]+20]:advance?end:base;
   const moving=end[0]!==initial[0]||end[1]!==initial[1];
   const dx=end[0]-initial[0],dy=end[1]-initial[1];
   const route=moving?'M0 0 Q'+(dx*.42)+' '+(dy*.25+14)+' '+dx+' '+dy:'';
   b+=traveler(initial,end,route,actor({role:'doctor',pose:moving?'walk':to?'service':'clipboard',coat:['#647a9b','#638e79','#7899a3'][j],facing:dx<0?-1:1,name:id,scale:.86,cycles:4}),3.2);
  });
  const demands=st.changes.filter(c=>sites[c.id]);
  return [svg(st.title,b,soil),[['规划时点',st.time],['院区 H0',demands.find(c=>c.id==='H0')?.value||'已配置常规班'],['院区 H1',demands.find(c=>c.id==='H1')?.value||'已配置常规班']],
   '各需求分支独立对照同一初始班表。站点位置、人物动作与调派路线为示意。'];
 }
 function box(x,y,s=.8,water=false){
  const a=water?['#539caa','#9ac3c9','#69adb7']:['#b48653','#e0b784','#d19e67'];
  return at(x,y,'<g transform="scale('+s+')"><path d="M-14 -13l8-6 25 1-8 6z" fill="'+a[1]+'"/><path d="M-14-13l25 1v15l-25-1z" fill="'+a[0]+'"/><path d="M11-12l8-5v14l-8 6z" fill="'+a[2]+'"/><path d="M-2-12l4 .2v9h-4z" fill="#f3dfbd"/></g>');
 }
 function tent(x,y,s){
  return at(x,y,'<g transform="scale('+s+')"><path d="m-45 6 83 2 26 -10 -36-13z" fill="#799382" opacity=".45"/><path d="m-42 2 29-44 44 1 24 41 -71 10z" fill="#e9e4cb"/><path d="m-42 2 29-44 24 47z" fill="#f5ecd5"/><path d="m-26 4 13-25 12 26z" fill="#6b8377"/><path d="m-13-42 24 47 44-5" stroke="#a3ac94" fill="none"/><path d="M-41 2l-6 6m102-9l6 6" stroke="#939f86"/></g>');
 }
 function relief(data,i){
  const v=data.sceneValues,area=v.areas[i],sent=v.supplies.map(src=>v.shipments[src][area]||{water:0,kits:0});
  let b='<rect width="1000" height="570" fill="url(#cwGround)"/><path d="M0 41l1000-16v54L0 99Z" fill="#aabf9d"/>'+
  '<path d="M308 0l62 0 -96 570h-65z" fill="#d7d1b9"/><path d="M263 196C418 193 468 233 550 278S731 301 789 292M241 455C360 409 468 321 550 278" fill="none" stroke="#e5dcc6" stroke-width="56"/>'+
  '<path d="M263 196C418 193 468 233 550 278S731 301 789 292M241 455C360 409 468 321 550 278" fill="none" stroke="#c9c4b1" stroke-width="39"/>';
  for(const [x,y,k] of [[43,66,.84],[543,75,1],[584,152,.8],[946,231,.8],[644,447,1.05],[556,481,.7],[90,528,1]])b+=tree(x,y,k);
  b+=block(66,178,172,78,{warehouse:true,roof:'#74959a',name:v.supplies[0]})+block(48,433,173,79,{warehouse:true,roof:'#779483',name:v.supplies[1]});
  b+=tent(807,200,.85)+tent(879,227,.73)+tent(819,290,1.23)+tag(834,146,'受援区 '+area,'#355b4d',17);
  const received={water:0,kits:0};
  v.supplies.forEach((src,j)=>{
   const ship=sent[j],dock=j?[175,440]:[190,181],dockEnd=[dock[0]+64,dock[1]+19];
   for(const m of v.materials)received[m]+=ship[m]||0;
   const used=v.materials.some(m=>ship[m]>0);
   b+=box(dock[0]-47,dock[1]+9,1)+box(dock[0]-29,dock[1]+16,.85,true);
   const person=actor({role:'worker',pose:used?'carry':'idle',coat:j?'#a17848':'#c28a3b',scale:.9,cycles:'2.6'});
   b+=traveler(dock,used?dockEnd:dock,used?'M0 0L64 19':'',person,2.2);
   if(used){
    const x=dockEnd[0]+37,y=dockEnd[1]-2;
    b+=at(x,y,'<ellipse cx="0" cy="7" rx="22" ry="6" fill="#7c8e7a" opacity=".45"/><path d="M-17 -1h37v7h-37Z" fill="#b38a50"/><path d="M-17 0v-17" stroke="#4c615b" stroke-width="4"/><circle cx="-10" cy="7" r="4.5" fill="#475859"/><circle cx="13" cy="7" r="4.5" fill="#475859"/>')+box(x+2,y-2,.71,(ship.water||0)>0);
    b+=tag(j?341:354,j?443:195,'水 '+fmt(ship.water||0)+' · 包 '+fmt(ship.kits||0),'#44665b',14);
   }
  });
  b+=at(760,303,actor({role:'worker',pose:'hand',scale:.9,coat:'#b08455',facing:-1}))+at(818,320,actor({role:'worker',pose:'carry',scale:.87,coat:'#6e8b75',facing:-1,cycles:3}));
  if(received.water)b+=box(750,324,1.1,true);if(received.kits)b+=box(765,338,1.1);
  return [svg(data.steps[i].title,b,soil),[['本步受援区',area],['饮水配给量',fmt(received.water)],['物资包配给量',fmt(received.kits)]],
  '逐区展示同一周期的分拨方案；搬运人员、箱体和地形仅示意装卸，不表示运输班次或逐箱数量。'];
 }
 function trialPicture(data,current,scene){
  const step=data.steps[current];
  if(scene.kind==='surgery'){
   const alt={...data,trial:true,schedule:{...data.schedule,events:scene.events}};
   const [picture]=ward(alt,current);
   return {picture,overlay:tag(260,51,'试排手术顺序　'+scene.order.join(' → '),'#7a5137',20),
    summary:[['试排首位患者',scene.order[0]],['手术室完工',fmt(Math.max(...scene.events.filter(e=>e.resource==='OR_1').map(e=>e.end)))],['恢复室完工',fmt(Math.max(...scene.events.filter(e=>e.resource==='PACU_1').map(e=>e.end)))]]};
  }
  if(scene.kind==='appointment'){
   const [picture]=ward(data,current);
   let inset='<rect x="89" y="287" width="822" height="246" rx="12" fill="#204943" stroke="#b9cbae" stroke-width="3"/>'+
    text(121,322,'试改预约 · '+scene.patient+' 在 '+scene.station+' 的预约推迟一个时隙',23,'#fff9e7','start',700);
   inset+=text(127,365,'原预约',18,'#d2dfd3','start')+tag(265,365,'时点 '+fmt(scene.oldSlot),'#52665b',20)+
    text(367,365,'→',24,'#fff4c6')+text(459,365,'新预约',18,'#d2dfd3','start')+
    tag(588,365,'时点 '+fmt(scene.newSlot),'#93613f',20);
   inset+=text(128,401,'同一新预约下，这位患者实际占用的服务时段',17,'#cedece','start');
   scene.cases.forEach((c,i)=>{
    const y=450+i*47;
    inset+=text(129,y,'情景 '+c.id,20,'#fff8e6','start');
    c.stations.forEach((n,j)=>{
     const x=260+j*282;
     inset+='<rect x="'+x+'" y="'+(y-24)+'" width="214" height="33" rx="7" fill="#376659"/>'+
      text(x+107,y,n.name+'　'+fmt(n.start)+' – '+fmt(n.end),18,'#fff8e6');
     if(j===0)inset+=text(x+247,y,'→',22,'#eee1ab');
    });
   });
   return {picture,overlay:inset,summary:[['试改患者',scene.patient],['变更站点',scene.station],['预约时点',fmt(scene.oldSlot)+' → '+fmt(scene.newSlot)]]};
  }
  if(scene.kind==='staffing'){
   const links=data.steps[0].links.slice();
   if(scene.target)links.push([scene.reserve,scene.target]);
   const steps=data.steps.map((s,i)=>i===current?{...s,links}:s);
   const [picture]=campus({...data,steps},current);
   const target=scene.target==='H0'?[212,290]:scene.target==='H1'?[777,300]:[493,430];
   const overlay=tag(230,52,'试排 · '+scene.reserve+(scene.target?' 调往院区 '+scene.target:' 留在候召值班处'),'#785139',20)+
    '<ellipse cx="'+target[0]+'" cy="'+target[1]+'" rx="42" ry="14" fill="none" stroke="#ac652c" stroke-width="4" stroke-dasharray="7 5"/>'+
    tag(204,321,'供给 '+fmt(scene.hours.H0)+' 小时','#43674c',16)+tag(781,331,'供给 '+fmt(scene.hours.H1)+' 小时','#43674c',16);
   return {picture,overlay,summary:[['试排候召医师',scene.reserve],['试排去向',scene.target||'留守待命'],['需求分支',step.time]]};
  }
  if(scene.kind==='relief'){
   const v={...data.sceneValues,shipments:scene.shipments};
   const [picture]=relief({...data,sceneValues:v},current);
   const waterIn=a=>v.supplies.reduce((sum,src)=>sum+v.shipments[src][a].water,0);
   const overlay=tag(282,50,'试配 · '+scene.source+' 改送 '+fmt(scene.quantity)+' 单位饮水','#79503a',20)+
    '<path d="M260 452Q465 390 526 420T764 455" fill="none" stroke="#faf3d6" stroke-width="10"/>'+
    '<path d="M260 452Q465 390 526 420T764 455" fill="none" stroke="#935b35" stroke-width="4" stroke-dasharray="10 5"/>'+
    '<path d="M762 448l17 7-18 5z" fill="#935b35"/>'+box(532,423,.88,true)+tag(536,467,'改送 1 单位水','#805136',17)+
    tent(825,464,.8)+tag(824,488,'受援区 '+scene.newArea,'#355b4d',17);
   return {picture,overlay,summary:[['出货仓',scene.source],['试配 '+scene.oldArea+' 饮水',fmt(waterIn(scene.oldArea))],['试配 '+scene.newArea+' 饮水',fmt(waterIn(scene.newArea))]]};
  }
 }
 function hookTrials(stage,data,current,map){
  const options=window.ORTOPIA_REPLAY_LOGIC?.[data.id]?.[current]?.comparison?.options;
  if(!options?.some(option=>option.scene))return;
  const summary=stage.querySelector('.cc-summary'),savedCells=summary.innerHTML,savedPicture=map.innerHTML;
  stage.previewDecision=index=>{
   const scene=options[index]?.scene;
   if(index===0||!scene){
    map.innerHTML=savedPicture;summary.innerHTML=savedCells;map.removeAttribute('data-trial');
    if(map.setCurrentTime)map.setCurrentTime(stage.sceneTime||0);
    return;
   }
   const result=trialPicture(data,current,scene);
   if(!result)return;
   const trial=new DOMParser().parseFromString(result.picture,'image/svg+xml').documentElement;
   map.innerHTML=trial.innerHTML;
   const group=document.createElementNS('http://www.w3.org/2000/svg','g');
   group.innerHTML=result.overlay;map.append(group);map.dataset.trial=scene.kind;
   summary.innerHTML=result.summary.map(([k,v])=>'<div class="cc-cell">'+esc(k)+'<b>'+esc(v)+'</b></div>').join('');
   // A clicked counterfactual shows the final assignment while the shared player is paused.
   if(map.setCurrentTime)map.setCurrentTime(5.5);
  };
 }
 function styles(){
  if(document.getElementById('care-world-style'))return;
  const el=document.createElement('style');el.id='care-world-style';
  el.textContent='.csim{margin:0;background:#edf1e7;color:#234b42}.csim .care-world{display:block;width:100%;height:auto;max-height:54vh}.csim .cc-summary{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));background:#fbfaf3;border-top:1px solid #d8dfd2}.csim .cc-cell{font-size:.73rem;line-height:1.35;padding:9px 11px;color:#52685b;overflow-wrap:anywhere}.csim .cc-cell+ .cc-cell{border-left:1px solid #d8dfd2}.csim .cc-cell b{display:block;font-size:.92rem;color:#244c41;margin-top:3px}.csim .cc-caption{font-size:.73rem;padding:5px 10px;background:#f4f6ee;color:#486352}.csim .care-world text{user-select:none}@media(max-width:500px){.csim .cc-cell{padding:5px}.csim .cc-cell b{font-size:.79rem}.csim .cc-caption{font-size:.69rem}}';
  document.head.append(el);
 }
 function render(stage,data,current){
  if(!supported.has(data.id))return false;styles();
  const f=({'P0452':home,'P0310':relief,'P0025':campus,'P0001':ward,'P0012':ward})[data.id];
  const [picture,entries,note]=f(data,current);
  stage.innerHTML='<figure class="csim">'+picture+'<div class="cc-summary">'+entries.map(([k,v])=>'<div class="cc-cell">'+esc(k)+'<b>'+esc(v)+'</b></div>').join('')+'</div><figcaption class="cc-caption">'+esc(note)+'</figcaption></figure>';
  const map=stage.querySelector('.care-world');if(map?.setCurrentTime)map.setCurrentTime(0);
  stage.previewDecision=null;
  hookTrials(stage,data,current,map);
  if(data.id==='P0452'&&current===2){
   const summary=stage.querySelector('.cc-summary'),original=summary.innerHTML;
   stage.previewDecision=optionIndex=>{
    if(![0,1,2].includes(optionIndex))return;
    const board=map.querySelector('.dispatch-board'),v=data.sceneValues;
    board.outerHTML=dispatchBoard(v,optionIndex);
    const active=map.querySelector('.dispatch-board');active.dataset.comparison=String(optionIndex);
    if(optionIndex===1){
     const hypothetical=[['试排访问',v.regularVisits+v.diverted],['试排常规护士',v.regularVisits+v.diverted],['试排待命护士',0]];
     summary.innerHTML=hypothetical.map(([label,n])=>'<div class="cc-cell">'+label+'<b>'+fmt(n)+' 次</b></div>').join('');
    }else summary.innerHTML=original;
    if(map.setCurrentTime)map.setCurrentTime(stage.sceneTime||0);
   };
  }
  return true;
 }
 return {supports:id=>supported.has(id),render};
})();
