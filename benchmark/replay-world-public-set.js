/* Instance-specific operator decisions and physical readbacks for public services and power systems. */
(() => {
'use strict';
const labs=window.ORTOPIA_LABS, A=window.ORTOPIA_PAINT;
const {scene,building,tree,person,car,crate,road,along,lerp}=A;
const ink='#22433f', mint='#368a77', ochre='#b27c40', red='#ae5744', blue='#517e92';
const clip=(x,a=0,b=1)=>Math.min(b,Math.max(a,x));
const part=(f,a,b)=>clip((f-a)/(b-a));
const fmt=(v,d=4)=>Number((Math.abs(v)<.5*10**-d?0:v).toFixed(d)).toLocaleString('zh-CN',{maximumFractionDigits:d});
const marks=rows=>rows.map(([label,at])=>({label,at}));
const cases={
 P0026:['变电站的一次线路切换','核对 n0 至 n1 的已排潮流，断开该支路后再到对端读表。','保持归档接通','断开该支路','switch','开关值班室','线侧隔离开关','n1 受端表','支路有功','归档支路计划','单条已启用支路，断开后的支路有功为零。其他出力不重调。'],
 P0035:['跟着车辆电池过四轮五分钟申报','逐段累计基准功率乘以时长，观察跳过第三段后表计累计量。','执行四段申报','第三段不申报','ev','车队电能柜','双向充电桩','停车区总表','累计基准申报能量','归档累计能量','首四段各五分钟。读数为有符号基准功率的时间积分，未换算为电池荷电量。'],
 P0078:['值班人员在第四小时点验备用容量','前两小时照常交接，随后选择是否保留指定机组的备用申报。','全队按归档留备','后两小时撤去该机组备用','reserve','机组值班室','旋转备用机列','电网备用表','全队备用','逐小时要求','前四小时逐台累加备用，保持其他机组出力与备用申报。'],
 P0104:['线路工况改变后机组接到增发指令','跟随 c0 工况的有功调节指令，比较执行参与因子与锁定原设定。','执行参与因子','锁定事前出力','generation','工况调度室','g0 调速器','b0 就地遥测','机组有功','归档响应','一个给定工况下的本地调节。原出力、参与因子和系统调节量取自该实例。'],
 P0165:['配电工程：发电机入场后要不要再加固','新机组到场后，选择是否让线路施工队进场。跟到工位核对竣工项目与投资。','按归档建候选机组','额外加固 de000','build','物资集散库','候选机组工地','de000 线路工位','累计投资','归档投资','对已选机组追加一项给定报价的线路加固。只核算投资，不外推灾后收益。'],
 P0168:['需求读数改变后机组如何追随','用实例的两个相邻需求顶点，检查首期 12 号机组是否执行反馈增量。','跟随需求增量','冻结该反馈项','feedback','区域负荷采集站','12 号机组控制盘','首期响应测点','有功增量','需求差值','只改变首个负荷分量。用归档仿射系数乘两个顶点的读数差计算局部响应。'],
 P0176:['网格母线的负荷与并联损耗','在本地电表前选择发电计划，看供给能否同时覆盖有功负荷和并联电导损耗。','计入并联损耗','仅供应表计负荷','shunt','配电工区','并联支路','b0000 结算表','计划出力','负荷加损耗','网格 0 首个母线，电压幅值取归档运行点；局部有功差不代表整网重算。'],
 P0201:['恢复被削减的负荷之前先核对供给','跟随 b1 的负荷恢复申请。其他机组和线路保持当前安排时，核对申请和供给。','保持归档服务量','申请恢复剩余负荷','service','地方供电所','馈线配额柜','用户接电工位','申请供给量','已落实供给','实例含负荷削减。超出已落实供给的申请在接电工位等待，不把申请计作实际送电。'],
 P0209:['两区交易交割时的联络线','在联络线交割站选择全额或半额输送，沿走廊查看接收区的履约差。','按归档交换 6 单位','只交换 3 单位','tie','A 区交易席','跨区联络线','B 区交割站','跨区交换量','归档交换量','使用两区等量异号的净注入和传输上限，比较单项交割量，保留其他申报。'],
 P0210:['备用机怎样接替退出的机组','在给定的首个退出工况中，选择备用机补足出力或只补一半。','按归档补足','备用只执行一半','reserve','工况记录室','备用响应机','供电平衡表','备用增发','退出机组原出力','同一既定工况。其余分布式机组固定，增发与退出出力之差是这项操作的残余。'],
 P0436:['电池在第一个调度时段后还剩多少','从初始库存沿着变流器和电量表检查，选择是否执行首段电池支出。','执行首段排程','首段保持库存','battery','储能控制室','一号电池变流器','期末电量表','电池库存','归档期末库存','根节点首时段，按实例的时间长度和库存扣减变量算期末值；对照保持首段不支出。'],
 P0438:['事故工况切换时的无功调节','跟随母线无功设定从正常值转入首个给定工况，检查本地机组的无功读数。','采用工况无功设定','保持常态无功','reactive','无功值班室','励磁调节器','母线无功表','无功设定','归档无功设定','按稀疏工况修正解码一个母线。本题归档为已验证可行解，局部设定差不等于全网失衡。'],
 P0439:['区域事故响应时的机组调速','在共同调节信号到达时选择跟随或维持原值，看同一台机组的功率表。','执行工况调节','维持正常工况出力','turbine','区域集控楼','G1 调速机构','G1 功率表','机组有功 MW','归档出力 MW','单一既定工况。用归档的共同调节量、机组参与系数与出力上下限还原本机响应，以系统基准换算 MW。归档解已核为可行。']
};
function landscape(g,indoor=false){
 g.box(0,0,1240,610,indoor?'#e3dac7':'#cfdbc4');
 if(indoor){for(let x=0;x<1250;x+=48)g.line([[x,25],[x,595]],'#d5ccb8',1);for(let y=25;y<610;y+=48)g.line([[0,y],[1240,y]],'#d5ccb8',1);return;}
 g.poly([[0,80],[170,28],[277,76],[442,36],[558,89],[770,45],[921,64],[1108,36],[1240,53],[1240,126],[0,144]],'#a7bda7');
 g.line([[0,510],[220,475],[547,531],[803,505],[1054,490],[1240,526]],'#a7bba9',52);
 g.line([[0,510],[220,475],[547,531],[803,505],[1054,490],[1240,526]],'#83b1af',38);
 for(let j=0;j<21;j++)tree(g,(j*149+56)%1210,115+(j%4)*22,.65+(j%3)*.12);
}
function tower(g,x,y){g.line([[x-18,y],[x,y-83],[x+18,y],[x-11,y-27],[x+11,y-54],[x-7,y-54],[x+13,y-27],[x-18,y]],'#738981',3);g.line([[x-28,y-66],[x+28,y-66]],'#617b73',4);g.line([[x-19,y-80],[x+19,y-80]],'#617b73',3);}
function dial(g,x,y,val,target,span,label){
 const c=g.c,scale=Math.max(1e-8,span),angle=v=>Math.PI*(1.08+1.0*clip(.5+.45*(v-target)/scale));
 g.box(x-56,y-63,112,81,'#4f655f');g.box(x-52,y-59,104,70,'#f0ead5');
 for(let j=0;j<9;j++){const a=Math.PI*(1.08+j/8);g.line([[x+36*Math.cos(a),y-12+36*Math.sin(a)],[x+30*Math.cos(a),y-12+30*Math.sin(a)]],ink,2);}
 const a=angle(val);g.line([[x,y-12],[x+32*Math.cos(a),y-12+32*Math.sin(a)]],red,3);g.dot(x,y-12,3,ink);g.text(label,x,y+3,11);
}
function equipment(g,x,y,kind,power=1){
 if(['reserve','generation','turbine','feedback'].includes(kind)){
  g.box(x-62,y-45,125,44,'#829c8d');g.box(x-78,y-9,155,13,'#667a6e');
  for(let n=0;n<3;n++){g.dot(x-41+n*41,y-28,16,'#def0d8');g.dot(x-41+n*41,y-28,12,'#638174');for(let k=0;k<3;k++){const a=k*Math.PI*2/3+power;g.line([[x-41+n*41,y-28],[x-41+n*41+9*Math.cos(a),y-28+9*Math.sin(a)]],'#d7d8aa',3);}}
 }else if(['ev','battery'].includes(kind)){
  for(let j=0;j<3;j++){g.box(x-56+j*39,y-60,32,61,'#729686');g.box(x-50+j*39,y-53,20,31,'#d0dcc4');g.box(x-49+j*39,y-53+31*(1-power),18,31*power,'#59a788');}if(kind==='ev')car(g,x+85,y+18,-1,blue,'car');
 }else if(kind==='build'){g.box(x-48,y-39,103,40,'#7f9b88');for(let i=0;i<7;i++)g.box(x-41+i*13,y-32,4,23,'#4f6e66');}
 else if(['reactive','shunt','tie'].includes(kind)){
  for(let i=0;i<3;i++){const xx=x-44+44*i;g.box(xx-11,y-57,22,57,'#78978b');for(let j=0;j<7;j++)g.line([[xx-16,y-49+6*j],[xx+16,y-49+6*j]],'#b1b49d',3);}
 }else{for(const xx of [x-46,x+43]){g.box(xx-9,y-48,18,48,'#90a79c');for(let i=0;i<5;i++)g.box(xx-14,y-40+i*6,28,3,'#536f68');}g.line([[x-46,y-48],[x+40,y-48-30*(1-power)]],ochre,5);}
}
const positions={tie:[[153,372],[575,280],[1084,365]],battery:[[158,324],[616,391],[999,268]],ev:[[138,285],[598,365],[1044,326]],build:[[140,333],[571,303],[1050,380]],service:[[180,329],[580,380],[1032,280]],shunt:[[190,311],[660,358],[1030,310]],reactive:[[198,344],[640,285],[1018,368]]};
function receivingEquipment(g,kind,sites){
 const [a,b,z]=sites;
 if(['reserve','generation','turbine','feedback'].includes(kind)){
  // An operating hall with a pipe gallery behind the machine row.
  const [x,y]=b;g.box(x-108,y-113,210,73,'#c3cbb9');
  g.poly([[x-117,y-112],[x-86,y-133],[x+113,y-133],[x+104,y-112]],'#899e91');
  for(let j=0;j<5;j++){g.box(x-96+j*42,y-102,31,27,'#73979a');g.line([[x-81+j*42,y-102],[x-81+j*42,y-76]],'#c4d1b9',2);}
  for(let j=0;j<2;j++){
   const xx=x+97+j*20;g.line([[xx,y-49],[xx+14,y-49],[xx+14,y-92],[xx+40,y-92]],'#71897c',5);
  }
  if(kind==='feedback'||kind==='generation'){const xx=x+80;g.box(xx,y-26,42,30,'#607a70');g.box(xx+4,y-21,33,15,'#afc8b4');}
  if(kind==='turbine'){g.box(x+69,y-137,15,26,'#899a8a');g.box(x+67,y-141,19,5,'#597367');}
 }else if(kind==='switch'||kind==='reactive'||kind==='shunt'||kind==='tie'){
  const [x,y]=b;
  for(let bank=0;bank<3;bank++){const xx=x-106+bank*84;g.box(xx-8,y-19,17,19,'#7e9187');g.line([[xx,y-19],[xx,y-82]],'#828e81',4);for(let j=0;j<5;j++)g.box(xx-6,y-41-7*j,12,3,'#b3bba6');}
  g.line([[x-108,y-85],[x-26,y-72],[x+61,y-85]],'#647e72',2);
  if(kind==='shunt'||kind==='reactive')for(let j=0;j<3;j++){g.box(x+65+j*15,y-31,11,31,'#a5aba1');g.dot(x+71+j*15,y-31,5.5,'#84998c',3);}
 }else if(kind==='ev'||kind==='battery'){
  const [x,y]=b;
  g.poly([[x-95,y-77],[x-68,y-100],[x+98,y-100],[x+71,y-77]],'#5e7e84');
  g.line([[x-80,y-78],[x-80,y-7]],'#809487',4);g.line([[x+60,y-78],[x+60,y-10]],'#809487',4);
  for(let j=0;j<6;j++)g.line([[x-93+j*29,y-77],[x-67+j*29,y-100]],'#99b7b8',1.5);
 }else if(kind==='service'){
  const [x,y]=z;for(let j=0;j<3;j++){building(g,x-110+j*56,y+64,37,29,'','#c7b6a0');}
 }else if(kind==='build'){const [x,y]=z;g.box(x-142,y-13,43,12,ochre);g.line([[x-119,y-12],[x-139,y-47],[x-163,y-33]],ochre,7);g.dot(x-134,y,6,ink);g.dot(x-111,y,6,ink);}
}
function serviceGround(g,kind){
 // Surround the active service route with the places it connects to. Leave working aisles clear.
 const industrial=['switch','reserve','generation','feedback','tie','shunt','reactive','turbine','battery','build','ev'].includes(kind);
 const back=industrial?'#a7ada0':'#c4b19a';
 road(g,[[-30,180],[272,164],[515,191],[805,155],[1260,194]],18);
 for(let j=0;j<7;j++){const x=j*176+37,y=144+(j%3)*12;
  building(g,x,y,industrial?79:58,industrial?36:42,'',j%2?back:'#bdc3ad');
  if(industrial){g.box(x+13,y-45,9,18,'#929b91');g.box(x+37,y-39,15,5,'#8c9a91');}
  else{g.poly([[x-3,y-42],[x+30,y-62],[x+63,y-42]],'#aa8c79');tree(g,x+87,y+13,.73);}
 }
 for(let j=0;j<6;j++){const x=92+j*190;g.line([[x,486],[x,465],[x+12,459]],'#738a81',2);g.box(x+9,458,7,2,'#eaddbd');}
 if(industrial){
  for(let j=0;j<34;j++)g.line([[79+j*33,433],[79+j*33,419]],'#9aa999',1.5);
  g.line([[79,422],[1168,422]],'#a9b1a0',1);
 }else{
  for(let j=0;j<8;j++){const x=64+j*152;g.box(x,544,64,16,'#b2c19f');tree(g,x+23,555,.52);}
 }
}
function wallFixtures(g,type){
 for(let j=0;j<8;j++){const x=88+j*141;g.box(x,95,72,24,'#849b97');g.box(x+3,98,66,17,'#bad1c8');g.box(x+34,96,2,22,'#e9e8d7');}
 const factory=type==='factory';
 for(let j=0;j<6;j++){const x=120+j*195;g.box(x,478,65,7,'#a6a699');g.box(x+5,482,4,7,'#8a958b');g.box(x+56,482,4,7,'#8a958b');
  if(factory){for(let h=0;h<3;h++)crate(g,x+h*20,468,16,'#bf9b68');}
  else{g.box(x+30,465,6,12,'#83998a');g.dot(x+32,464,6,'#90aa8f');}
 }
}
function machine(g,x,y,stage){
 if(stage===0||stage===3){for(let j=0;j<2;j++){g.box(x-62,y-70+j*21,53,3,'#797c6d');for(let h=0;h<3;h++)crate(g,x-60+h*16,y-82+j*21,13,'#ac936e');}}
 else{
  g.box(x-48,y-88,76,40,'#829c91');g.box(x-43,y-84,60,25,'#587b75');g.box(x-38,y-80,45,17,'#b7ccc0');
  g.line([[x-35,y-79],[x-24,y-68],[x-12,y-75],[x-8,y-66]],'#d8b46a',3);g.box(x+32,y-83,18,32,'#8b9d8c');
  for(let j=0;j<3;j++)g.dot(x+40,y-77+7*j,2,j===1?ochre:'#c2d8bc');
 }
}
function gridMap(g,c,sites){
 const [, , , ,kind,src,mid,dst]=c;landscape(g);serviceGround(g,kind);const [a,b,z]=sites;
 const way=[a,[a[0]+157,a[1]],[b[0]-75,b[1]+38],b,[b[0]+168,b[1]],[z[0]-74,z[1]+24],z];
 road(g,way,25);building(g,a[0]-62,a[1]-18,123,66,src);
 g.poly([[b[0]-115,b[1]-64],[b[0]+104,b[1]-82],[b[0]+139,b[1]+18],[b[0]-90,b[1]+31]],'#c1beab');
 if(kind==='build'||kind==='tie'||kind==='switch'){for(let j=0;j<3;j++)tower(g,b[0]+135*j,b[1]-56-7*j);for(let j=0;j<2;j++)g.line([[b[0]+135*j,b[1]-125-7*j],[b[0]+72+135*j,b[1]-115-7*j],[b[0]+135*(j+1),b[1]-132-7*j]],'#67847a',1.8);}
 receivingEquipment(g,kind,sites);
 building(g,z[0]-55,z[1]+7,106,58,dst,'#b4c1a8');g.sign(mid,b[0],b[1]-108,ink);
}
for(const [id,c] of Object.entries(cases)){
 const [title,action,base,trial,kind,src,mid,dst,measure,reference,scope]=c;
 const sites=positions[kind]||[[160,330],[599,300],[1050,376]];
 labs[id]={batch:'remaining',title,action,choices:[base,trial],views:['跟随现场交班','设施全景'],duration:34,
  scope:scope+' 图中仪表、巡检路径与人员为现场示意；标记的时段或工况读数来自实例。',
  chapters:d=>marks(d.ticks.map((x,i)=>[x,[0,.26,.52,.81][i]])),
  frame(d,k,f){const ix=f<.26?0:f<.52?1:f<.81?2:3,v=d.values[k][ix],target=d.target[ix];
   return {ix,v,target,clock:d.ticks[ix],metrics:[[measure,fmt(v,6)],[reference,fmt(target,6)],['与参照的差额',fmt(v-target,6)],['当前设备',d.asset]]};},
  draw(canvas,s,d,k,f,view){const [a,b,z]=sites;const route=[a,[a[0]+157,a[1]],[b[0]-75,b[1]+38],b];const onward=[b,[b[0]+168,b[1]],[z[0]-74,z[1]+24],z];
   const pos=f<.52?along(route,part(f,.08,.44)):along(onward,part(f,.58,.88)),bad=s.ix>=2&&Math.abs(s.v-s.target)>1e-7;
   const span=Math.max(1e-6,...d.values.flat().map((v,j)=>Math.abs(v-d.target[j%4])));
   scene(canvas,id,g=>gridMap(g,c,sites),[pos[0],pos[1]-20],view,650,g=>{
    const power=kind==='switch'&&!s.v?0:1,scale=Math.max(1e-6,...d.values.flat().map(Math.abs));
    equipment(g,b[0],b[1]-21,kind,['reserve','generation','feedback','turbine'].includes(kind)?(s.v?f*38:0):kind==='ev'||kind==='battery'?clip(Math.abs(s.v)/scale):power);
    if(kind==='build'&&k&&s.ix>=2){tower(g,z[0]-87,z[1]-25);g.line([[z[0]-90,z[1]-73],[z[0]-74,z[1]-57]],ochre,7);}
    if(kind!=='build'){const flow=[ [b[0],b[1]-72],[b[0]+155,b[1]-82],[z[0]-65,z[1]-66],[z[0],z[1]-65] ];g.line(flow,'#71887b',2);if(Math.abs(s.v)>1e-8)for(let n=0;n<5;n++){const pt=along(flow,((s.v<0?1-f:f)*3+n/5)%1);g.dot(...pt,2.4+2*Math.min(1,Math.abs(s.v)/scale),bad?ochre:'#e4bd54');}}
    dial(g,z[0]+9,z[1]-62,s.v,s.target,span,measure);
    person(g,pos[0],pos[1]+7,f*100,mint,true);g.sign(s.ix===3?(bad?'复核差额 '+fmt(s.v-s.target,5):'复核 '+fmt(s.v,5)):s.ix===2?mid:src,pos[0],pos[1]-44,bad?red:ink,13);
   });
  }};
}
const civic={
 P0006:['两厂产线的最后一笔投产','把产品 0 在 f0 的投产加一单位，看工位能否在已排满的总产能下接单。','归档投产','给 f0 多排一单位','factory',['计划室','f0 生产线','成品接收区','f1 生产线'],'同厂其他 1,999 种产品和另一工厂的排程固定。只检查 f0 总产能，超额投产在进料端等待。'],
 P0009:['飓风救助点等候首批物资','选择中心 j0 发往避难所 i0 的装载量，跟到收货桌清点缺口。','按根节点计划发货','首批只装一半','relief',['j0 配送中心','装货坡道','i0 避难所','救助领取区'],'当前根节点的首条配送，其他发货不变。只比较 i0 这批已落实供应量和需求。'],
 P0018:['从两处急救基地飞往同一求助点','替换需求点 2 的出动基地，在同一比例的航线上看哪架先抵达。','归档基地','改派另一候选基地','drone',['邻接基地','本地基地','求助点 2','社区接应区'],'使用两条候选飞行距离除以同一飞行速度，比较无排队飞行时间。起飞准备和交接仅用于呈现，不计入飞行时间。'],
 P0023:['诊室叫号时谁还留在候诊区','把第二位患者提前到首位的时刻，观察患者 36 候诊到什么时候。','按归档预约','两位同时报到','clinic',['门诊入口','候诊区','诊室','离院通道'],'全员到诊。前六位患者以原顺序按各自保障服务时长就诊；逐人计算实际开诊和等候。'],
 P0034:['制氢点给首个加氢站送货','在发车前选择装载量，核对到站氢量与该站的用量。','按归档调拨','第一车只调拨半量','hydrogen',['生产点 0','装载台','加氢站 0','车辆服务位'],'第一个站点由生产点 0 单独供应。比较原调拨和固定其余调拨的单站缺额，行驶路径为示意。'],
 P0053:['治疗服务网点如何分到本期预算','在地区 c0 连续观察四期经费，第三期开始可将拨款减半，再核对五个网点的最低拨款要求。','归档经费','后两期拨款减半','fund',['地区预算处','网点服务台','拨款复核席','基层治疗点'],'每个时段把该地区的设施数乘以实例的单设施最低拨款。只检查预算下限与已拨经费。'],
 P0172:['首批筛查名额从登记到检验','在第一批未筛查人群中安排原定或一半筛查量，看多少人进入后续流程，多少留在登记册。','归档首期筛查','首期筛查名额减半','screen',['社区登记点','筛查室','检验接收台','下一批候检区'],'取风险组 0、健康状态 0、首月的松弛模型筛查量代理 V。图中人物代表成组的模型人数。保留其余服务安排，只比较本批代理量，未重新推演健康状态。'],
 P0181:['两台手术共用同一间手术室','交换两位患者进入手术室的先后，跟着第一位登记者观察等待、开台和恢复。','按归档顺序开台','交换两台手术顺序','surgery',['术前登记','手术等候区','共用手术室','恢复区'],'同一手术时长情景，两台手术在同一间已选手术室执行。保持时长，按前一台完毕才开下一台，比较局部开始时间。'],
 P0322:['救援车送完物资后带伤员去哪里','跟随车辆从仓库到 r340 卸货，再为同一批伤员选择接收医院。','送归档医院 h2','改送医院 h','rescue',['救助仓库 s','r340 受援点','接收医院 h2','接收医院 h'],'从归档提取首个地区的救援行程及两条合法送医弧。本地比较行程时长；替换目的地未重排其他地区的床位。'],
 P0437:['药房如何执行离散治疗日程','沿原模型的九个餐时逐格发放无名模拟药包。跳过第一个已排窗口，观察哪个登记格留空。','按归档窗口登记','跳过首个已排窗口','med',['模拟药房','备药工位','餐时登记台','留存记录区'],'只重放虚构实例中药物 1 的餐时二元变量。模拟药包表示一次安排，不换算患者剂量，也不推演疗效。']
};
const layouts={
 factory:[[152,322],[502,308],[1008,336],[518,461]],drone:[[178,206],[625,348],[1021,367],[1062,452]],
 relief:[[170,275],[405,362],[1005,298],[1031,414]],hydrogen:[[164,294],[499,355],[911,272],[1038,386]],
 clinic:[[135,377],[418,361],[746,273],[1054,392]],surgery:[[143,332],[430,395],[728,265],[1020,388]],
 fund:[[169,325],[475,355],[734,310],[1022,412]],screen:[[136,372],[474,317],[847,283],[827,424]],
 rescue:[[144,329],[563,377],[1042,234],[931,459]],med:[[186,257],[455,360],[754,328],[1043,367]]};
function places(type,d){
 const pts=layouts[type];if(type!=='drone')return pts;
 const [a,b,z,last]=pts,far=Math.hypot(a[0]-z[0],a[1]-z[1]),nominal=Math.hypot(b[0]-z[0],b[1]-z[1]);
 return [a,[z[0]+(b[0]-z[0])*far*d.ranges[1]/(nominal*d.ranges[0]),z[1]+(b[1]-z[1])*far*d.ranges[1]/(nominal*d.ranges[0])],z,last];
}
function civicStops(id,type,names,d,k){
 if(id==='P0018'){
  const branch=k?1-d.base:d.base,longest=Math.max(...d.ranges)/d.speed,arrival=.10+.76*d.ranges[branch]/d.speed/longest;
  return marks([[names[branch],0],['飞越河道',(.10+arrival)/2],['地面接应',arrival],['接应人员送到社区',arrival+.13]]);
 }
 if(id==='P0181'){
  const order=k?[...d.order].reverse():d.order,first=d.durations[order[0]],end=d.durations.reduce((a,b)=>a+b,0),horizon=end+.26;
  return marks([['首台患者入室',0],['首台患者转出',first/horizon],['第二台进入手术室',(first+.18)/horizon],['末台抵达恢复区',(end+.22)/horizon]]);
 }
 return marks(names.map((name,j)=>[name,[.04,.31,.59,.87][j]]));
}
function pavement(g,a,b,w=22){road(g,[a,[(a[0]+b[0])/2,a[1]],[(a[0]+b[0])/2+25,b[1]],b],w);}
function stepRoad(a,b,f){return along([a,[(a[0]+b[0])/2,a[1]],[(a[0]+b[0])/2+25,b[1]],b],f);}
function seats(g,x,y,n=4){for(let j=0;j<n;j++){g.box(x+j*21,y-12,16,9,'#79978c');g.box(x+j*21,y-4,16,4,'#536e69');}}
function structure(g,type,pts,names){
 const inside=['clinic','surgery','screen','med','factory'].includes(type);landscape(g,inside);
 if(inside){
  g.box(46,70,1148,440,'#c2c4b5');g.box(55,77,1130,427,'#eeeadc');
  wallFixtures(g,type);g.box(55,320,1130,94,'#ddd7c5');g.line([[59,366],[1180,366]],'#d1c4a7',3);
  pts.forEach(([x,y],j)=>{const gx=x-78,gy=y-110;g.box(gx,gy,158,85,j===2?'#cdded2':'#dbcdb7');
   g.line([[gx,gy+87],[gx,gy],[gx+159,gy],[gx+159,gy+87],[gx+100,gy+87]],'#7c8d81',4);
   const isTheatre=type==='surgery'&&names[j].includes('手术')&&!names[j].includes('等候');
   if(isTheatre||type==='surgery'&&names[j].includes('恢复')){
    // Outline the bed, bedding and working aisle; keep the stretcher corridor clear.
    g.box(x-47,y-72,62,29,'#8fb0a3');g.box(x-43,y-69,15,18,'#ede8d9');g.box(x-25,y-69,35,21,'#abc8b2');
    g.line([[x-42,y-42],[x-42,y-37]],'#627c74',3);g.line([[x+8,y-42],[x+8,y-37]],'#627c74',3);
    g.box(x+24,y-85,26,24,'#58736e');g.box(x+27,y-82,20,15,'#92b6ac');g.line([[x+28,y-74],[x+33,y-74],[x+35,y-79],[x+38,y-69],[x+41,y-75],[x+45,y-75]],'#e8edba',1.2);
    if(isTheatre){g.line([[x-47,y-104],[x-35,y-94],[x-18,y-94]],'#7f998f',3);g.dot(x-15,y-93,9,'#d1d8c5',4);}
   }else if(type==='factory'){machine(g,x,y,j);g.box(x-54,y-49,103,22,'#85968b');for(let n=0;n<8;n++)g.dot(x-45+13*n,y-26,4,'#576b65');}
   else if(type==='med'){for(let n=0;n<3;n++){g.box(x-52,y-82+n*20,104,5,'#938975');for(let h=0;h<5;h++)g.box(x-48+19*h,y-92+n*20,10,10,h%2?'#b5cdb9':'#e5c6a1');}}
   else if(j===1||j===3){seats(g,x-43,y-36,5);g.box(x-47,y-87,19,21,'#eee9d7');g.box(x-43,y-82,12,3,mint);
    if(type==='screen'){g.box(x+37,y-67,19,22,'#92afa5');g.box(x+44,y-82,4,16,'#507c75');}
   }
   else{g.box(x-49,y-55,100,24,'#a5b6ab');g.box(x-40,y-52,25,14,'#efe7cf');}
   g.sign(names[j],x,gy-14,ink,14);
  });
 }else{
  serviceGround(g,type);pts.slice(1).forEach((b,j)=>pavement(g,pts[type==='drone'?2:(type==='rescue'&&j===2?1:j)],b,22));
  if(type==='drone')g.line([[665,117],[738,243],[760,337],[812,457]],'#8cbbb4',49);
  pts.forEach(([x,y],j)=>{if(type==='drone'&&j<2){g.dot(x,y-6,49,'#adbbad',17);g.line([[x-15,y-5],[x+15,y-5]],'#f1ebcf',3);building(g,x-56,y-35,95,45,names[j]);}
   else if(type==='hydrogen'&&j<3){for(let n=0;n<3;n++){g.box(x-47+n*29,y-60,23,50,'#91aaa5');g.dot(x-35+n*29,y-58,11,'#b9cbc1',6);}g.sign(names[j],x,y-83);}
   else building(g,x-54,y-17,109,62,names[j],j===1?'#d9c899':'#b6c7b3');});
 }
}
function actor(xy,kind,label,color=mint,pace=0){return {xy,kind,label,color,pace};}
function batch(g,x,y,n,total){for(let j=0;j<Math.ceil(8*clip(n/(total||1))-.000001);j++)crate(g,x+(j%4)*12,y-Math.floor(j/4)*10,12);}
function people(g,x,y,count,capacity){const n=Math.ceil(8*clip(count/(capacity||1))-.000001);for(let a=0;a<n;a++)person(g,x+a%4*13,y+Math.floor(a/4)*13,a,['#b17d55','#638e8d','#a28869'][a%3]);}
function actorArt(g,o){
 const [x,y]=o.xy;if(o.kind==='truck'||o.kind==='ambulance'){car(g,x,y,1,o.kind==='ambulance'?'#e5e1cd':o.color);if(o.kind==='ambulance'){g.box(x-14,y-21,12,4,red);g.box(x-10,y-25,4,12,red);}}
 else if(o.kind==='drone'){g.line([[x-19,y-3],[x,y+2],[x+19,y-3]],ink,3);g.dot(x,y-1,7,ochre,4);for(const k of [-1,1]){g.dot(x+k*18,y-5,10,'#6b8e8b',2);g.box(x+k*17,y-8,2,6,'#677b77');}crate(g,x-5,y+1,10);}
 else if(o.kind==='stretcher'){person(g,x-22,y+4,o.pace,'#437b77');g.box(x-16,y-14,39,8,'#88aa95');g.dot(x+11,y-18,4,'#bf9775');g.line([[x-16,y-5],[x+20,y-5]],ink,2);for(let a of [-13,17])g.dot(x+a,y,3,ink);}
 else if(o.kind==='pallet'){crate(g,x-15,y-7,31,o.color);g.box(x-19,y+11,42,4,'#786c56');}
 else person(g,x,y,o.pace,o.color,o.kind==='courier');
 if(o.label)g.sign(o.label,x,y-38,o.color,12);
}
function scenario(id,d,k,f){
 const c=civic[id],type=c[4],pts=places(type,d),[a,b,z,last]=pts;let actors=[],focus,m=[],clock='',props=[];
 const add=(xy,kind,label,col,t=0)=>{actors.push(actor(xy,kind,label,col,t));return xy;};
 if(['P0006','P0009','P0034','P0172'].includes(id)){
  const factory=id==='P0006',screen=id==='P0172',q=d.amount,qty=k?(factory?q+1:q*.5):q;
  const actual=factory?Math.min(qty,d.limit-(d.booked-q)):qty;
  const p=stepRoad(a,b,part(f,.04,.33)),v=stepRoad(b,z,part(f,.40,.78)),land=stepRoad(z,last,part(f,.82,.97));
  const arrived=f>=.78?actual:0;clock=f<.33?'登记与备料':f<.40?'工位交接':f<.78?'执行计划':'接收复核';
  const cargo=screen?'首批筛查':factory?'产品 0':id==='P0034'?'氢气调拨':'首批救助物资';
  if(f<.38)focus=add(p,screen?'person':factory?'pallet':'courier',cargo,ochre,f*70);
  else if(f<.80)focus=add(v,screen?'person':factory?'pallet':'truck',cargo+' · '+fmt(actual,2),mint,f*70);
  else focus=add(f<.82?z:land,screen?'courier':factory?'pallet':'courier',screen?'检验交接':factory?'成品登记':'接收签字',mint,f*60);
  if(factory){props.push(['boxes',a,f<.33?qty:Math.max(0,qty-actual),q+1],['boxes',z,arrived,q+1]);m=[['产品 0 申请',fmt(qty)],['实际可排',fmt(actual)],['超出厂内总产能',fmt(Math.max(0,qty-q))]];if(k&&f>.36){add(b,'pallet','超额 1 单位等候',red);if(f>.79)focus=b;}}
  else if(screen){props.push(['people',a,d.available-arrived,d.available],['people',z,arrived,q]);m=[['首批筛查名额',fmt(qty)],['已交检验',fmt(arrived)],['本批原定名额未执行',fmt(q-qty)]];if(k&&f>.8){focus=add(last,'person','等待后续筛查',red);}}
  else{props.push(['boxes',b,f<.38?qty:0,q],['boxes',z,arrived,q]);m=[['调拨量',fmt(qty)],['已签收',fmt(arrived)],['本批需求缺口',fmt(Math.max(0,d.need-arrived))]];if(k&&f>.84)focus=add(z,'person',id==='P0034'?'站内补给不足':'等待余下物资',red);}
 }else if(id==='P0018'){
  const branch=k?1-d.base:d.base,from=branch?b:a,dt=d.ranges[branch]/d.speed,max=Math.max(...d.ranges)/d.speed;
  const t=max*part(f,.10,.86),u=clip(t/dt),pt=lerp(from,z,u);pt[1]-=Math.sin(u*Math.PI)*48;
  add(branch?a:b,'drone','待命基地',blue);focus=add(pt,'drone',u<1?'携包飞行':'到达求助点',mint);
  if(u>=1-1e-9){const arrival=.10+.76*dt/max;focus=add(stepRoad(z,last,part(f,arrival,arrival+.13)),'courier','接应人员',ochre,f*65);}
  clock='出动后 '+fmt(t,3);m=[['出动航距',fmt(d.ranges[branch])],['无排队飞行时间',fmt(dt,6)],['求助点状态',u>=1-1e-9?'已交接':'等候到达']];
 }else if(id==='P0023'||id==='P0181'){
  const surgery=id==='P0181';let rows=[],t=0;
  if(surgery){let end=0;for(const j of (k?[...d.order].reverse():d.order)){rows.push([j+1,0,end,end+d.durations[j]]);end+=d.durations[j];}t=f*(end+.26);}
  else{let end=0;for(const [j,row] of d.visits.entries()){const arrival=k&&j===1?0:row[1],start=Math.max(arrival,end);end=start+row[2];rows.push([row[0],arrival,start,end]);}t=f*(end+.35);}
  for(const [n,arr,start,end] of rows){
   let pos,col,lab;if(t<arr){pos=[a[0]-n%5*9,a[1]+(n%3)*15];col=blue;lab='未签到';}
   else if(t<start){pos=stepRoad(a,[b[0]+(n%4)*14,b[1]],part(t,arr,Math.min(start,arr+.16)));col=ochre;lab='候诊';}
   else if(t<end){pos=stepRoad(b,z,part(t,start,start+.18));col=mint;lab=surgery?'开台':'就诊';}
   else{pos=stepRoad(z,[last[0]+(n%3)*14,last[1]],part(t,end,end+.22));col=blue;lab=surgery?'恢复':'离诊';}
   const focal=surgery?n===1:n===rows[1][0];add(pos,surgery?'stretcher':'person',focal?(surgery?'手术 ':'患者 ')+n+' · '+lab:'',col,t*20);if(focal)focus=pos;
  }
  clock='模型时刻 '+fmt(t,3);const row=surgery?rows.find(r=>r[0]===1):rows[1];m=[['当前等候',String(rows.filter(r=>r[1]<=t&&r[2]>t).length)],['已结束',String(rows.filter(r=>r[3]<=t).length)],[surgery?'手术 1 开台时刻':'患者 36 累计等候',fmt(surgery?row[2]:clip(t-row[1],0,row[2]-row[1]),6)]];
 }else if(id==='P0053'){
  const j=Math.min(3,Math.floor(f*4)),within=clip(4*f-j),budget=d.budget[j]*(k&&j>=2?.5:1),minimum=d.minimum[j]*d.facilities;
  const pos=stepRoad(j%2===0?a:last,b,part(within,0,.47)),to=budget+1e-7<minimum?z:last;
  focus=add(within<.47?pos:stepRoad(b,to,part(within,.47,.90)),'courier',budget<minimum?'拨款需复核':'经费凭单 '+(j+1),budget<minimum?red:mint,within*40);
  props.push(['boxes',last,budget,Math.max(...d.budget)]);clock='经费第 '+(j+1)+' 期';m=[['本期拨款',fmt(budget,6)],['五个网点下限',fmt(minimum,6)],['低于下限',fmt(Math.max(0,minimum-budget),6)]];
 }else if(id==='P0322'){
  const sec=k?d.legs[2]:d.legs[1],h=d.legs[0]+sec,t=f*(d.legs[0]+Math.max(...d.legs.slice(1))),to=k?last:z;
  const pos=t<d.legs[0]?stepRoad(a,b,t/d.legs[0]):stepRoad(b,to,(t-d.legs[0])/sec);
  focus=add(pos,'ambulance',t<d.legs[0]?'送物资至 '+d.town:t<h?'转运 '+d.people+' 人':'医院已接收',mint,f*60);
  props.push(['boxes',b,t>=d.legs[0]?d.aid:0,d.aid],['people',b,t<d.legs[0]?d.people:0,d.people],['people',to,t>=h?d.people:0,d.people]);
  clock='行程时刻 '+fmt(t,2);m=[['物资签收',String(t>=d.legs[0]?d.aid:0)],['到院人数',String(t>=h?d.people:0)],['本车行程时长',String(h)]];
 }else if(id==='P0437'){
  const n=d.slots.length,j=Math.min(n-1,Math.floor(f*n)),u=clip(f*n-j),bits=d.visits.slice(),first=bits.indexOf(1);if(k)bits[first]=0;
  const booked=bits[j],log=bits.slice(0,j).reduce((x,y)=>x+y,0)+(u>=.7?booked:0);
  const pt=u<.35?stepRoad(a,b,u/.35):stepRoad(b,booked?z:last,part(u,.35,.75));
  focus=add(pt,'courier',booked?'窗口 '+d.slots[j]+' · 模拟包':'窗口 '+d.slots[j]+' · 空登记',booked?mint:ochre,f*65);
  for(let h=0;h<=j;h++)if(bits[h]&&(h<j||u>=.70))props.push(['tray',[last[0]-55+12*h,last[1]-19],1,1]);
  clock='餐时索引 '+d.slots[j];m=[['该窗口安排',booked?'有安排':'留空'],['已登记安排次数',String(log)],['归档窗口总数',String(d.visits.reduce((x,y)=>x+y,0))]];
 }
 return {clock,metrics:m,focus,actors,props};
}
for(const [id,c] of Object.entries(civic)){
 const [title,action,base,trial,type,names,scope]=c;
 labs[id]={batch:'remaining',title,action,choices:[base,trial],scope:scope+' 地点和人物形象为示意。',duration:37,views:[type==='drone'?'跟随急救任务':'跟随任务','场所全景'],
  chapters:(d,k)=>civicStops(id,type,names,d,k),frame:(d,k,f)=>scenario(id,d,k,f),
  draw(canvas,s,d,k,f,view){scene(canvas,id,g=>structure(g,type,places(type,d),names),[s.focus[0],s.focus[1]-22],view,630,g=>{
    for(const [kind,[x,y],n,total] of s.props){if(kind==='people')people(g,x-44,y+14,n,total);else if(kind==='tray')crate(g,x,y,11);else batch(g,x-30,y+18,n,total);}
    for(const item of s.actors)actorArt(g,item);
  });}};
}
// The first collection keeps its audited schedules and objective evaluations.
const renew={
 P0069:['第三班的启动指令最终发给哪台机组','跟随启动班组','电厂与城市负荷',['控制室','233 号机','108 号机','用户侧交割'],[0,.34,.67,.90]],
 P0079:['工件 j1 从备料架到哪台加工机','跟随工件 j1','车间全景',['第一批开工','分机作业','下一批交接','成品入库'],[0,.28,.58,.93]],
 P0087:['第三位患者何时进入手术部、何时进入恢复室','跟随患者 3','手术部全景',['交班','第二台开始','第三台入室','第三台转出'],[0,.31,.6,.93]],
 P0464:['从灾前储备库到受援居民的物资交接','跟随物资与收货人','救助区全景',['仓内备货','灾后清点','转运可用物资','外部采购抵达'],[0,.27,.52,.82]],
 P0489:['旧水排空后，各街区当天能领到多少水','跟随水流与取水人','水站全景',['首日放水','第一批取水','第五天库存交接','第十天高需求'],[.005,.062,.34,.815]]
};
function replayFirst(id,canvas,s,d,k,f,view){
 if(id==='P0079'){
  const plan=d.plans[k],src=[150,339],machines=[[580,245],[662,407]],depot=[1042,339],end=Math.max(...plan.finish);
  const get=(j)=>{const m=machines[plan.machine[j]],station=[m[0]+(j%3)*13-14,m[1]],start=plan.start[j],stop=plan.finish[j],t=s.t;
   if(t<start)return stepRoad([src[0]+j*13,src[1]], [station[0]-88,station[1]+15],part(t,Math.max(0,start-.8),start));
   if(t<stop){const move=part(t,start,start+Math.min(.28,(stop-start)*.22));return lerp([station[0]-88,station[1]+15],station,move);}
   return stepRoad(station,[depot[0]+j*12,depot[1]],part(t,stop,Math.min(end,stop+.5))||Number(t===end));};
  const focus=get(0);
  scene(canvas,id,g=>{structure(g,'factory',[src,...machines,depot],['工件备料','M1 加工站','M2 加工站','成品清点']);},focus,view,594,g=>{
   for(let j=0;j<d.jobs.length;j++){const pos=get(j);actorArt(g,actor(pos,'pallet',d.jobs[j]+' · '+({wait:'待加工',run:'加工中',done:'已完工'}[s.jobs[j]]),j===0?mint:ochre));}
   machines.forEach(([x,y],m)=>{const busy=s.jobs.some((v,j)=>v==='run'&&plan.machine[j]===m);g.dot(x+57,y-48,6,busy?'#e1b451':'#6a8c83');});
  });
 }else if(id==='P0087'){
  const ward=[[530,199],[680,315],[816,427]],lobby=[164,368],rec=[1045,326],t=s.t;
  const get=j=>{const st=s.starts[j],ed=s.ends[j],w=ward[j];if(t<st)return stepRoad([lobby[0],lobby[1]+j*16],[w[0]-70,w[1]+8],part(t,Math.max(0,st-3),st));
   if(t<ed)return lerp([w[0]-62,w[1]+8],w,part(t,st,st+.45));return stepRoad(w,[rec[0],rec[1]+j*16],part(t,ed,ed+1.7));};
  scene(canvas,id,g=>{structure(g,'surgery',[lobby,...ward,rec],['术前等候','手术一室','手术二室','手术三室','恢复区']);},get(2),view,640,g=>{
   ward.forEach(([x,y],j)=>{const at=get(j),busy=t>=s.starts[j]&&t<s.ends[j];actorArt(g,actor(at,'stretcher',j===2?'患者 3 · '+(busy?'手术中':t<s.starts[j]?'待入室':'恢复中'):'',j===2?mint:blue,f*80));person(g,x+21,y-5,busy?f*60:0,'#537b86');g.dot(x+55,y-86,5,busy?ochre:'#7e9d83');});
  });
 }else if(id==='P0069'){
  const a=[150,345],b=[494,269],z=[692,365],city=[1039,341],unit=k===1?z:b;
  const pos=f<.66?stepRoad(a,[463,338],part(f,.08,.60)):f<.87?stepRoad([463,338],unit,part(f,.66,.79)):stepRoad(unit,city,part(f,.86,.97));
  scene(canvas,id,g=>{landscape(g);building(g,85,305,118,67,'负荷调度');building(g,989,292,104,67,'用户接电站');pavement(g,a,b);pavement(g,b,z);pavement(g,z,city);tower(g,839,259);},pos,view,665,g=>{
   for(const [n,pt] of [b,z].entries()){equipment(g,...pt,'generation',s.r[4][n]?f*70:0);g.sign('G'+d.unitIds[n]+' · '+fmt(s.r[5][n],2)+' MW',pt[0],pt[1]-73);}
   const deficit=s.short+s.spare>1e-7;dial(g,city[0],city[1]-40,s.r[2],d.demand[s.i]+d.reserve[s.i],Math.max(10,d.reserve[s.i]),'供电与备用');
   actorArt(g,actor(pos,'courier',s.i===2?(deficit?'交割差额待处理':'机组接班成功'):'启动指令交班',deficit?red:mint,f*60));
  });
 }else if(id==='P0464'){
  const wh=[178,293],vendor=[554,213],dst=[958,367],resident=[1088,427],empty=s.stock===0;
  const leg=s.i===2&&!empty?stepRoad(wh,dst,part(s.p,.02,.72)):s.i===3?stepRoad(vendor,dst,part(s.p,.02,.64)):wh;
  const focus=(empty&&s.i===2)||s.i===3&&s.p>.73?dst:leg;
  scene(canvas,id,g=>{structure(g,'relief',[wh,vendor,dst,resident],['区域储备仓','应急采购站','受援领取点','临时安置区']);pavement(g,wh,dst);},focus,view,630,g=>{
   if(!empty)batch(g,wh[0]-22,wh[1]+12,Math.max(0,(s.i?s.surv:s.stock)-s.local),d.capacity);
   if(s.i===1){for(let j=0;j<18;j++){const x=wh[0]-64+j*8,y=wh[1]-88+(s.p*70+j*9)%60;g.line([[x,y],[x-5,y+10]],'#799fa6',2);}}
   if(s.i===2&&!empty||s.i===3)actorArt(g,actor(leg,'truck',s.i===2?'仓库留存物资':'应急采购批次',mint));
   if(s.i===0||s.i===1)actorArt(g,actor(wh,'courier',empty?'仓库未启用':s.i===0?'预置库存':'清点剩余',ochre));
   batch(g,dst[0]-30,dst[1]+12,s.local+s.ext,d.demand);people(g,dst[0],dst[1]+34,d.demand-s.local-s.ext,d.demand);
   if(s.i===3&&s.p>.66)actorArt(g,actor(stepRoad(dst,resident,part(s.p,.65,1)),'courier','已领取物资',mint,s.p*35));
   if(empty&&s.i===2||s.i===3&&s.p>.7)g.sign('仍待供应 '+fmt(d.demand-s.local-s.ext,2),dst[0],dst[1]-56,red);
  });
 }else{
  const source=[158,211],tank=[529,304],homes=[[955,254],[1040,374],[928,444]],drain=[382,427],out=homes[s.i%3],u=s.phase;
  const feed=s.buy>0,draining=s.purge&&s.old>0,active=u<.22?(draining?lerp(tank,drain,part(u,0,.22)):tank):u<.54?(feed?lerp(source,tank,part(u,.22,.54)):tank):s.served>0?lerp(tank,out,part(u,.54,.88)):out;
  scene(canvas,id,g=>{landscape(g);building(g,70,193,140,65,'补水泵房');g.sign('排空回收渠',drain[0],drain[1]+29);homes.forEach(([x,y],j)=>building(g,x-48,y-18,90,58,'居民取水点 '+(j+1)));
   for(const path of [[source,tank],[tank,drain],...homes.map(p=>[tank,p])])g.line(path,'#879e93',14);
   g.box(tank[0]-61,tank[1]-98,122,100,'#576e68');g.box(tank[0]-56,tank[1]-94,112,90,'#deebdd');
  },active,view,610,g=>{
   const h=85*clip(s.volume/d.capacity);g.box(tank[0]-55,tank[1]-5-h,110,h,s.age>=2?'#79a79b':'#65aab0');g.sign('储水 '+fmt(s.volume,1),tank[0],tank[1]-118,ink);
   const path=u<.22?[tank,drain]:u<.54?[source,tank]:[tank,out];if((u<.22&&draining)||(u>=.22&&u<.54&&feed)||(u>=.54&&s.served>0)){for(let j=0;j<6;j++){const pt=lerp(path[0],path[1],(f*20+j/6)%1);g.dot(...pt,3,'#69bace');}}
   const shortage=s.need>s.served;
   if(shortage&&s.served>0&&u>.78){const leaving=actor([out[0]-18-62*part(u,.78,.98),out[1]+26],'courier','已领到部分供水',mint,u*23);actorArt(g,leaving);}
   actorArt(g,actor([out[0]+part(u,.8,1)*(shortage?0:46),out[1]+10],'person',u>.7?(shortage?'待取水':'本日已取水'):'本日用水户',shortage?red:mint,u*23));});
 }
}
for(const [id,[title,follow,overview,names,times]] of Object.entries(renew)){
 const original=labs[id];labs[id]={...original,batch:'lab20',title,views:[follow,overview],duration:43,
  chapters:(d,k)=>id==='P0087'?marks([['术前等候',0],['第三台入室',d.plans[k][0][2]/34],['关台时刻',d.close/34],['第三台结束',Math.min(1,(d.plans[k][0][2]+d.durations[2])/34)]]):marks(names.map((x,i)=>[x,times[i]])),
  draw:(canvas,s,d,k,f,view)=>replayFirst(id,canvas,s,d,k,f,view)};
}
})();
