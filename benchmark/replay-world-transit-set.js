/* Transit worlds use operating events and a separate illustrated geography.
   A run contains the place, visible carrier, cumulative measure and operating instant. */
(() => {
'use strict';
const labs=window.ORTOPIA_LABS;
const specs={
  "P0015": {"mode":"town","title":"预约接送：第一条行程由谁承接","actor":"行程 0","stops":["派车处","乘客家门","目的站"],"choices":["派自有车辆","撤下这条单线行程"],"measure":"已有人手的路线","unit":"条","scope":"w1 情景下，从已配人的单线及相邻双线行程复算覆盖数。撤下行程 0 后固定其他人员与外包安排。","clock":"事件序号"},
  "P0019": {"mode":"taxi","title":"两名空闲司机遇到首笔叫车","actor":"首位请求者","stops":["街区入口","叫车上客区","行程终点"],"choices":["推荐一名空闲司机","此次暂不推荐"],"measure":"本次匹配收益","unit":"","scope":"初始有 2 名 d000 司机。固定首个请求、司机可用且乘客尚未离开的事件，只核算这次成交。","clock":"事件序号"},
  "P0027": {"mode":"town","title":"三枢纽的乘客怎样通过 h0→h1","actor":"使用弧 1 的旅客","stops":["出行起点","h0 站台","h1 站台","目的地"],"choices":["保留 h0→h1 班线","关闭这条班线"],"measure":"原行程受阻","unit":"笔","scope":"只统计归档行程中使用有向弧 1 的需求条目；关闭服务后保持已选路径。","clock":"事件序号"},
  "P0046": {"mode":"air","title":"恢复运行时，能再把一班挪进早窗吗","actor":"c5","stops":["机位","放行点","早窗跑道","晚窗跑道","到达机场"],"choices":["保留归档晚窗","提前挪入已满的早窗"],"measure":"早窗申请数","unit":"班","scope":"早窗容量 1700。从所有归档航路复算占用数，对 f5_late 单独改窗；其他飞机保留原槽位。","clock":"事件序号"},
  "P0047": {"mode":"town","title":"一号乘客能否在接驳岛追上二程车","actor":"乘客 1","stops":["接客站","换乘岛","交付站 15"],"choices":["等接客车到达再离岛","一程车到岛前先发二程车"],"measure":"错过接续的提前量","unit":"时间单位","scope":"乘客 1 由第 2 辆接客车换到第 1 辆送客车。对照让送客车在其自身到岛时刻直接发车。","clock":"模型时刻"},
  "P0052": {"mode":"charge","title":"97 路全日往返需要多大的电池","actor":"97 路首辆车","stops":["Kashmere Gate","Mundka 站","储备审核"],"choices":["选配 300 kWh 电池","改配 200 kWh 电池"],"measure":"到站电量","unit":"kWh","scope":"按 8 段实际耗电递减，保留归档零补电。小电池方案在第一段预计低于储备线的出发站停下，最后显示若仍发车的预计余量。","clock":"行程段"},
  "P0055": {"mode":"taxi","title":"两对乘客同车还是逐对接送","actor":"电动合乘车 1","stops":["车库 0","上车点 1","上车点 2","下车点 41","下车点 42"],"choices":["先接两单再送客","送完第一单再接第二单"],"measure":"本段行驶","unit":"km","scope":"用节点坐标计算前两单的行车距离。其余订单、分时电费与完整运营目标不在本段比较内。","clock":"事件序号"},
  "P0071": {"mode":"air","title":"F23 穿越航路扇区 S","actor":"航班 F23","stops":["机场 A","航路扇区 S","机场 B"],"choices":["按归档时刻放行","在 A 多等一个时段"],"measure":"抵达 B 的时刻","unit":"时段","scope":"按归档 A/S/B 时刻保持各段航时，比较单班地面等待；替代时刻未获得全网容量确认。","clock":"模型时段"},
  "P0080": {"mode":"air","title":"扰动揭晓前，是否保留第一班排班","actor":"航班 f0_0","stops":["始发机场 A","航班计划台","待恢复机位","旅客候机区"],"choices":["提前取消全部四班","先保留 f0_0 待情景恢复"],"measure":"提前取消","unit":"班","scope":"展示第一阶段从排班到候机或待恢复机位。保留 f0_0 不保证最终起飞，第二阶段机场时窗仍生效。","clock":"事件序号"},
  "P0081": {"mode":"town","title":"三座接驳车在第二个上客点等谁","actor":"V0 接驳车","stops":["B0 车库","R0_0","R0_1","轨道站 S"],"choices":["两组按顺序上车","首组上车后直达车站"],"measure":"送到车站的人数","unit":"人","scope":"V0 两组预约合计三人。直达方案放弃第二组，指标只计这辆车完成的接驳。","clock":"事件序号"},
  "P0111": {"mode":"taxi","title":"司机菜单上的两张订单","actor":"订单 O64","stops":["派单台","司机接单区","乘客上车点","交付地点"],"choices":["同时展示两张订单","只展示第一张"],"measure":"首单匹配概率","unit":"%","scope":"D0 的菜单含 O64 与 O82。用各单效用及拒单效用复算匹配概率。街区演示首单成交的一条路径，概率不是必然成交。","clock":"事件序号"},
  "P0114": {"mode":"charge","title":"终点站分派下一辆车去哪个线路","actor":"终点站待发车辆","stops":["终点站场","出车审核口","L1 站台","L2 站台"],"choices":["按归档派往 L1","本车改派 L2"],"measure":"L1 本轮获派","unit":"辆","scope":"解码 Nk 得到两条线分别 43、42 辆。对照从第一线挪一辆到第二线，固定其余分配，未重排充电位。","clock":"事件序号"},
  "P0123": {"mode":"town","title":"固定线路外的 13 名乘客怎样到站","actor":"首个需求响应班","stops":["始发站 1","站台上客区","终点站 21"],"choices":["派归档需求响应车","取消该班并保留原分配"],"measure":"该班完成接送","unit":"人","scope":"情景 0。首个响应班的 departure、duration 和 passengers 来自解，取消时这组旅客继续候车。","clock":"分钟"},
  "P0148": {"mode":"charge","title":"首班电巴少带一段电量会怎样","actor":"零号电巴","stops":["出库位","首班起点","首班终点","接续审核位"],"choices":["按归档起始电量","仅带 20 kWh 到发车位"],"measure":"首班预计结束电量","unit":"kWh","scope":"首班行驶 34.7 km。固定车辆、路程及行车耗电 27.76 kWh，仅改变初始电量，预计耗尽时在发车位截停。","clock":"事件序号"},
  "P0151": {"mode":"rail","title":"A 端首班列车在库内编成几节","actor":"A 端首班车","stops":["A 车库","编挂位","A 站台","B 站台"],"choices":["按归档两节发车","改编四节发车"],"measure":"本列提供座位","unit":"席","scope":"首班时刻 1，每节 17 席。只比较列车提供的运力，未重新优化后续车库库存。","clock":"事件序号"},
  "P0152": {"mode":"town","title":"七辆接送车能否接走全部预约者","actor":"末辆接送车","stops":["车场","沿线预约站","集中接送区","回场下客"],"choices":["每车保留四座","每车只开放三座"],"measure":"至少未能上车","unit":"人","scope":"28 人对应归档 7 趟，各车最多 4 人。三座对照计算固定趟数下的容量缺口下界；聚合站台示意。","clock":"事件序号"},
  "P0159": {"mode":"charge","title":"一号线的快充车队要派几辆","actor":"E321 班组","stops":["配车库","快充泊位","一号线站台","线网出口"],"choices":["派全部六辆 E321","保留一辆在库"],"measure":"出车额定载客总量","unit":"人","scope":"归档 n_1_E321_1=6；单车容量 105 人。对照固定其他车型与充电设施。","clock":"事件序号"},
  "P0173": {"mode":"charge","title":"回库后首个充电时段留给哪辆车","actor":"班次 0→3 电巴","stops":["发车库","零号班终点","三号班终点","车库充电棚"],"choices":["在第 9 段接入充电枪","跳过第 9 段"],"measure":"第 9 段电网充电功率","unit":"kW","scope":"归档 0→3 接续，回库电量为 1.0；按 pDep 的第 9 段功率比较。其他车辆用电固定。","clock":"事件序号"},
  "P0179": {"mode":"air","title":"受扰航班第一段巡航速度","actor":"首个商业航段","stops":["起飞爬升","巡航中点","下降入口"],"choices":["按归档巡航速度","降到允许最低巡航速度"],"measure":"纯巡航时间","unit":"分钟","scope":"使用第一个航段剖面 72 的距离 376 与巡航速度；排除固定非巡航时间，两种选择不重新分配飞机。","clock":"巡航分钟"},
  "P0190": {"mode":"signal","title":"同一批来车遇到不同放行窗口","actor":"首车 v1_1","stops":["进口车道","停车线","冲突区","驶出路口"],"choices":["按第一车道的绿窗","改用另一队列的放行时刻"],"measure":"等候放行","unit":"时间单位","scope":"第一车道与第二车道首车到线时刻相同。对照把后一队实际等待 437.0 的放行窗口用于这辆车，其余队列不重排。","clock":"模型时刻"},
  "P0195": {"mode":"railfreight","title":"货运专列开行时，首情景的快件如何装运","actor":"首情景货运批次","stops":["快件收货口","Origin 装车区","Midway","Terminal"],"choices":["启用归档货运专列","取消专列且不换车"],"measure":"由专列承运的货量","unit":"单位","scope":"从首个情景第 3 种列车的各订单实际配载求和，只统计专列货量。取消后留在集货区。","clock":"事件序号"},
  "P0206": {"mode":"port","title":"第二条船能否提前占用第一条船的泊位","actor":"第二条到港船","stops":["锚地","第一泊位进口","岸桥装卸面","离泊水域"],"choices":["等第一条船结束后靠泊","与第一条船同刻靠泊"],"measure":"预约起点重叠","unit":"时段","scope":"使用两条船归档 t、c。固定第一船作业，按连续区间的交集长度计算提前入泊的冲突，不改变装卸顺序。","clock":"泊位时刻"},
  "P0270": {"mode":"town","title":"接驳车 b9 能再接受一组预约吗","actor":"b9 末组预约者","stops":["预约入口","一站排队区","二站","三站下客区"],"choices":["按归档搭乘","再给满载车加一人"],"measure":"需要占用的座位","unit":"席","scope":"本轮 b9 的原分配有 32 人，容量 32。试算插入未在 b9 名单的一人，其余预约固定，超额乘客留站。","clock":"事件序号"},
  "P0274": {"mode":"charge","title":"bus0 完成 job0 后是否还能回库","actor":"bus0","stops":["车场入口","job0 站","返场检查口","车库"],"choices":["给定满电出发","仅装入够跑去程的电量"],"measure":"完成去返程后的计划余量","unit":"能量单位","scope":"按归档 in0/out0 两弧，能耗分别 3、2。负数是按计划回库的缺口，实际车辆留在 job0。","clock":"事件序号"},
  "P0348": {"mode":"charge","title":"从第一波班次经过满充站接第二波","actor":"T1_1→T2_1","stops":["第一波出车位","第一波终点","S1_1 充电位","第二波发车位"],"choices":["按归档满充","经过充电站但不插枪"],"measure":"第二波计划出发电量","unit":"能量单位","scope":"固定原两波班次的衔接弧与空驶耗电，比较充电前、满充后、抵达第二个发车位时的电量。","clock":"事件序号"},
  "P0353": {"mode":"railfreight","title":"高铁客运车厢里是否为这批货留位","actor":"货类 1","stops":["Origin 收货","客运车装货区","Junction","Destination"],"choices":["保留货类在客运模式的配载","卸下该批且不另行配载"],"measure":"这批货的毛收入","unit":"费用单位","scope":"读取 Passenger 模式对 Class1 的 2.0 吨配载与单位价格 48。仅比较该批毛收入。","clock":"事件序号"},
  "P0360": {"mode":"rail","title":"首列地铁在第一段区间跑多久","actor":"首列车","stops":["首站站台","区间中点","第二站站台"],"choices":["采用归档运行调整","保持原区间运行时长"],"measure":"累计区间运行","unit":"秒","scope":"比较首车第一段计划、扰动与运行调整之和。区间中点按匀速示意；不外推后续乘客等待与再生电量。","clock":"秒"},
  "P0409": {"mode":"rail","title":"L0 车库出段弧怎样接上首班","actor":"L0 首列车","stops":["d1 车库","Aup 发车站","Bup 到达站"],"choices":["按分钟运行图放行","出库延迟一分钟"],"measure":"最早抵达 Bup","unit":"分钟","scope":"取归档相接的两条弧。延迟时固定每段耗时；给出顺延到站下界，不重新检查其他列车冲突。","clock":"分钟"},
  "P0412": {"mode":"rail","title":"一号线首班车是否为首组乘客开门","actor":"情景 1 首组客流","stops":["站外入口","一号线首站","列车上客门","下一站"],"choices":["按场景解开门上客","这班越站不接首组"],"measure":"本班接入的首组客流","unit":"人","scope":"取第一个情景、第一条线、第一班、第一站的 boarding 数据 11。共用发车索引从 [2, 4] 开始；其他旅客分配固定。","clock":"事件序号"},
  "P0429": {"mode":"cycle","title":"改造跨区自行车道后，N0 怎样到 N3","actor":"N0→N3 骑行者","stops":["N0","N1","N2","N3"],"choices":["经已改善的 N0→N2","经 N1 绕行"],"measure":"累计骑行时间","unit":"时间单位","scope":"从归档 y 提取 N0→N2→N3 的路径。替代走既有三段路，用原 t 逐段加总；仅比较这一个 OD。","clock":"行程时刻"},
  "P0447": {"mode":"ticket","title":"最后一期开放哪几档票价","actor":"末期余座旅客","stops":["售票台","报价屏","出票口","登机桥"],"choices":["开放三档票价","只开放第一档"],"measure":"末期单步期望收入","unit":"金额","scope":"解码最后一期一席的归档菜单。期望收入为到达概率乘各商品选择概率与票价之和；移动旅客表示成交路径。","clock":"事件序号"},
  "P0450": {"mode":"ticket","title":"最后一席是单卖高价票还是两档一起卖","actor":"一席库存","stops":["库存柜台","票价菜单","出票审核","登机口"],"choices":["末期只开放高价票","末期同时开放两档票"],"measure":"末期单步期望收入","unit":"金额","scope":"归档初始席位估值 108.7065。提取末期一席、终端价值零的局部比较，用原到达率与两种报价菜单复算单步期望收益。","clock":"事件序号"},
  "P0451": {"mode":"taxi","title":"自动驾驶车 0 是否立即出发接客","actor":"顾客 0","stops":["订单入口","路边上客点","乘车路段","送达口"],"choices":["调派 0 号车","本轮让该车空闲"],"measure":"本单派车支出","unit":"费用单位","scope":"车辆 0 原配顾客 0，本地派遣费用 11，顾客等待权重 22。取消分配时本单未获服务；费用只计派遣项。","clock":"事件序号"},
  "P0481": {"mode":"charge","title":"共享快充功率时哪辆车要拔枪","actor":"5 号站充电车组","stops":["车辆入口","电力接入柜","5 号站母线","驶出站区"],"choices":["逐车功率上限","全站共用额定功率"],"measure":"车队一周期电能费","unit":"费用单位","scope":"取归档分钟 24 至 34 的 5 号站，按车辆、时刻逐行解码充电功率。每分钟读数对应一个两分钟调度格，周期电费覆盖全车队。车辆位置示意，未分配本站功率的车辆不显示在充电位。","clock":"归档分钟"},
  "P0495": {"mode":"taxi","title":"订单到达后，空车是否跨区调位","actor":"v0_001","stops":["原区停车点","调度通知区","跨区道路","目标区停车点"],"choices":["采用 W_min=0 的策略","采用 W_min=1 的策略"],"measure":"本次回放空车调动","unit":"次","scope":"使用同一随机到达记录与符号方向的两条归档轨迹。跟踪首辆被调位的空车，终点列出整个样本的空车移动记录数。","clock":"事件序号"}
};
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const fmt=v=>Number(v.toFixed(4)).toString();
const ink='#284742', green='#307c68', orange='#c78441', indigo='#476b86', red='#ad584b';
const schema={
 town:[[90,395],[380,301],[732,366],[1110,265],[972,477]],
 taxi:[[100,415],[350,365],[615,225],[890,300],[1125,440]],
 charge:[[93,417],[361,324],[705,376],[1115,282],[948,490]],
 rail:[[98,429],[380,352],[734,333],[1094,268]],
 railfreight:[[85,415],[352,365],[734,337],[1105,282]],
 air:[[90,433],[387,338],[710,238],[1010,393],[1164,193]],
 port:[[90,444],[423,398],[750,356],[1100,463]],
 signal:[[90,382],[508,382],[638,351],[1090,351]],
 ticket:[[90,387],[386,341],[721,342],[1080,304]],
 cycle:[[83,417],[348,437],[682,245],[1097,300]]
};
function point(spec,index){
 if(spec.points)return spec.points[index];
 const base=schema[spec.mode][index];
 if(!spec.id)return base;
 const seed=Number(spec.id.slice(1));
 // Stations retain the case's declared topology, including branches and out-and-back paths.
 return [base[0]+(index&&base[0]<1100?Math.sin(seed+index*3)*35:0),base[1]+Math.sin(seed*.8+index*2.1)*27];
}
function lineBetween(spec,a,b){
 const start=point(spec,a),end=point(spec,b);
 if(a===b)return [start,end];
 if(['rail','railfreight','air','port','ticket','signal'].includes(spec.mode))return [start,end];
 const dx=end[0]-start[0],dy=end[1]-start[1];
 return [start,[start[0]+dx*.45,start[1]+dy*.23],[start[0]+dx*.67,end[1]-dy*.16],end];
}
function rails(g,points){
 g.line(points,'#938e7f',20);g.line(points,'#6a6c63',18,[3,8]);g.line(points,'#c9d0c6',10);g.line(points,'#73796e',6);
}
function platform(g,x,y,label){
 g.box(x-48,y-22,99,11,'#aba896');g.box(x-49,y-23,100,3,'#dbb966');
 g.box(x-36,y-66,4,43,'#6a8378');g.box(x+33,y-66,4,43,'#6a8378');
 g.poly([[x-54,y-63],[x-40,y-75],[x+55,y-75],[x+47,y-63]],'#62887a');g.sign(label,x,y-87,green,12);
}
function pumps(g,x,y){
 for(const xx of [x-23,x+18]){g.box(xx,y-42,16,39,'#ecdfbc');g.box(xx+3,y-37,11,13,'#49897e');g.line([[xx+14,y-30],[xx+21,y-24],[xx+21,y-9],[xx+14,y-7]],'#465e57',2);}
}
function tower(g,x,y){
 g.box(x-9,y-95,18,95,'#c5c2ac');g.poly([[x-19,y-106],[x+21,y-106],[x+13,y-88],[x-13,y-88]],'#587b80');g.box(x-21,y-110,43,5,'#78999b');g.line([[x,y-111],[x,y-127]],ink,2);
}
function crane(g,x,y){
 g.line([[x-35,y],[x-20,y-99],[x+33,y-99],[x+48,y]],'#b9884b',7);g.line([[x-41,y-102],[x+82,y-102]],'#e0b261',8);g.line([[x-30,y-102],[x+6,y-128],[x+79,y-102]],'#9a8054',3);g.line([[x+66,y-98],[x+66,y-48]],ink,2);g.box(x-15,y-104,25,15,'#719598');
}
function city(g,s){
 const art=window.ORTOPIA_PAINT;
 const port=s.mode==='port',airport=s.mode==='air',indoors=s.mode==='ticket';
 g.box(0,0,1240,610,indoors?'#ddd5ba':'#d9e6dc');
 if(indoors){
  g.box(0,110,1240,97,'#adc9d0');for(let x=0;x<1240;x+=58){g.box(x,109,6,98,'#ece4ce');g.line([[x,130],[x+45,112]],'#c2d9d9',3);}
  g.box(0,211,1240,399,'#d4cdba');for(let j=0;j<6;j++)g.line([[0,250+j*62],[1240,248+j*62]],'#c0b9a6',2);
  for(let x=30;x<1240;x+=160)g.line([[x,210],[x+86,610]],'#c4bba7',2);
 }else{
  g.poly([[0,157],[143,84],[288,145],[426,96],[585,135],[789,79],[981,125],[1082,98],[1240,136],[1240,225],[0,225]],'#b3c7b4');
  for(let j=0;j<31;j++){const x=j*46-15,h=27+j*29%68;g.box(x,181-h,33,h,'#a4bab3');for(let q=0;q<h/17-1;q++)for(let k=0;k<3;k++)g.box(x+3+k*9,187-h+q*16,5,7,'#d0dad0');}
  g.box(0,183,1240,430,port?'#80b6b1':airport?'#c2cca9':'#c3d1af');
  if(port){g.poly([[0,183],[1240,183],[1240,334],[0,427]],'#b6b5a1');for(let x=0;x<1240;x+=67){g.line([[x,461+x%42],[x+24,461+x%42]],'#a1cfbf',2);}}
  else if(airport){g.line([[-80,512],[1300,235]],'#a6afa0',52);g.line([[-80,512],[1300,235]],'#e9e2cb',3,[25,22]);tower(g,562,255);}
  else{
   g.line([[0,501],[273,488],[536,523],[869,478],[1280,489]],'#86b6af',s.mode==='cycle'?47:27);
   for(let j=0;j<10;j++){let x=17+j*128,y=238+(j*23)%32;if(j%3){art.building(g,x,y,54+j%2*17,24+j%4*7,'','#bdbca5');}else art.tree(g,x+20,y,.76);}
   for(let j=0;j<12;j++){const x=j*108,y=530+j*19%50;art.tree(g,x,y,.74);}
  }
 }
 if(s.mode==='signal'){art.road(g,[[563,130],[569,590]],55);for(let x=530;x<573;x+=8)g.line([[x,370],[x+1,390]],'#e1d7b8',4);}
}
function solarRoof(g,x,y){
 g.poly([[x-58,y-48],[x+52,y-48],[x+39,y-18],[x-69,y-18]],'#547180');
 for(let i=0;i<5;i++)g.line([[x-56+i*24,y-47],[x-68+i*24,y-19]],'#aec7c1',2);
 g.line([[x-62,y-32],[x+46,y-32]],'#adc5c8',2);
 for(let dx of [-50,33])g.line([[x+dx,y-18],[x+dx,y+11]],'#6e7e76',4);
}
function house(g,x,y,k){
 const A=window.ORTOPIA_PAINT;A.building(g,x,y,62,43,'',k?'#cbb39e':'#cec7aa');
 g.poly([[x-5,y-42],[x+27,y-64],[x+69,y-42]],k?'#ac795f':'#919d80');
 g.box(x+33,y-21,13,21,'#6c817d');g.box(x+7,y-16,15,10,'#819d93');
}
function hangar(g,x,y,name){
 g.poly([[x-60,y-24],[x-55,y-62],[x-25,y-81],[x+31,y-81],[x+61,y-63],[x+65,y-24]],'#b4bec1');
 g.box(x-60,y-59,125,59,'#bec3b3');g.box(x-46,y-46,94,46,'#6e837b');
 for(let dx=-45;dx<50;dx+=13)g.line([[x+dx,y-44],[x+dx,y-2]],'#899a8d',2);
 g.sign(name,x,y-63,indigo,12);
}
function placeDetails(g,s){
 const A=window.ORTOPIA_PAINT,p=s.stops.map((_,j)=>point(s,j)),[x,y]=p[1],last=p.at(-1);
 if(['P0015','P0047','P0019','P0081','P0055','P0123','P0270','P0152','P0451','P0495'].includes(s.id)){
  const o=p[0];for(let j=0;j<3;j++)house(g,o[0]+32+j*67,o[1]-39-j*12,j%2);
  if(['P0081','P0123','P0047','P0270'].includes(s.id)){
   rails(g,[[last[0]-200,last[1]-64],[last[0]+130,last[1]-82]]);
   train(g,last[0]+40,last[1]-72,green,2);
  }
 }
 if(['P0052','P0148','P0159','P0173','P0348','P0481','P0274','P0114'].includes(s.id)){
  const depot=p[s.id==='P0173'||s.id==='P0481'?2:0];hangar(g,depot[0]+64,depot[1]-52,'车辆检修库');
  pumps(g,depot[0]-44,depot[1]-22);
  if(s.id==='P0173')solarRoof(g,p[3][0]-30,p[3][1]-63);
  if(s.id==='P0481'){for(let j=0;j<3;j++){solarRoof(g,p[2][0]-78+j*99,p[2][1]-55);pumps(g,p[2][0]-110+j*99,p[2][1]-43);}}
 }
 if(s.mode==='rail'){
  const q=p[0];hangar(g,q[0]+23,q[1]-62,s.id==='P0151'?'编组车库':'车辆段');
  for(let j=0;j<3;j++)rails(g,[[q[0]-90,q[1]-17-j*9],[q[0]+30,q[1]-20-j*9],[q[0]+117,q[1]+6]]);
 }
 if(s.mode==='air'){
  if(s.id==='P0179'||s.id==='P0071')for(let j=0;j<4;j++){const xx=111+326*j,yy=235+j%2*27;g.dot(xx,yy,29,'#eff0df',8);g.dot(xx+14,yy-7,17,'#eef0e3',10);}
  else hangar(g,p[0][0]+80,p[0][1]-65,'航班运行基地');
 }
 if(s.mode==='cycle'){
  for(let j=0;j<4;j++)A.tree(g,x-76+j*31,y-35,.8);g.line([[p[0][0],p[0][1]-10],[p[2][0],p[2][1]-12]],'#789e89',4,[11,10]);
 }
 if(s.id==='P0190'){const [x,y]=p[1];A.road(g,[[x+75,141],[x+74,540]],53);g.line([[x-2,y-28],[x+2,y+23]],'#eee4c9',4);}
}
function peopleAt(g,x,y,n,f=0){
 for(let j=0;j<n;j++)window.ORTOPIA_PAINT.person(g,x+11*(j%5),y-5*Math.floor(j/5),f*24+j*.3,j%2?orange:green);
}
function activity(g,s,d,st,k){
 const f=st.f,A=window.ORTOPIA_PAINT,id=s.id,p=s.stops.map((_,j)=>point(s,j)),[x,y]=st.pos;
 if(['P0052','P0148','P0274','P0348'].includes(id)){
  const mx=Math.max(1,...d.runs.flat().map(r=>r[2])),pct=clamp(st.value/mx),blocked=k&&st.holding&&st.j===d.runs[k].length-1;
  const n=id==='P0052'?(k?2:3):4;for(let j=0;j<n;j++){g.box(x-32+j*15,y-42,13,8,j/n<pct?'#6b9572':'#bd9672');g.box(x-29+j*15,y-44,7,2,'#959f89');}
  g.sign((blocked?'储备不足 · ':'')+fmt(st.value)+' '+s.unit,x,y+30,blocked?red:'#305f5a',13);
  if(blocked){g.line([[x+42,y+9],[x+42,y-19]],ink,3);g.line([[x+35,y-18],[x+60,y-18]],red,5);}
 }
 if(id==='P0173'){
  const [xx,yy]=p[3];pumps(g,xx+47,yy+1);
  if(st.arrived&&st.next[0]===3&&!k){g.line([[xx+50,yy-28],[xx+36,yy-7],[xx+15,yy-13]],'#d9b85d',5);g.dot(xx+51,yy-27,7,'#c4de76');}
  g.sign(fmt(st.value)+' kW',x,y+23,st.value?green:'#786e60',14);
 }
 if(id==='P0159'){const a=p[0];if(k)vehicle(g,a[0]+36,a[1]-32,'b',1,0);g.sign(k?'1 辆留库':'6 辆出车',a[0]+29,a[1]-63,k?orange:green,12);}
 if(id==='P0481'){
  const [xx,yy]=p[2],bay=bus=>xx-74+[0,1,6].indexOf(bus)*76;
  const current=new Set(st.sockets.map(row=>row[0]));
  for(const [bus,kw] of st.sockets){
   const bx=bay(bus);vehicle(g,bx,yy+28,'b',1,0);
   const cable=[[xx,yy-15],[bx-30,yy+12],[bx-17,yy+22]];g.line(cable,'#bc9744',4);
   for(let j=0;j<3;j++){const pos=A.along(cable,(f*(kw/600)*60+j/3)%1);g.dot(pos[0],pos[1],3.8,'#f8da76');}
   g.sign('车 '+bus+' · '+fmt(kw)+' kW',bx,yy+47,green,10);
  }
  for(const [bus] of st.prior)if(!current.has(bus)&&st.slice<.32){const x=bay(bus)+st.slice*405;vehicle(g,x,yy+30+st.slice*60,'b',1,f);}
  for(const [bus] of st.upcoming)if(!current.has(bus)&&st.slice>.58){const u=clamp((st.slice-.58)/.42);vehicle(g,bay(bus)-(1-u)*148,yy+29+(1-u)*28,'b',1,f);}
  g.sign(fmt(st.delivered)+' kWh',xx,yy+80,indigo,14);
 }
 if(id==='P0055'||id==='P0081'){
  const idx=st.next[0],first=p[1],second=p[2];
  if(st.j===1&&!st.arrived)peopleAt(g,first[0]+8,first[1]-8,1);
  const picked=d.runs[k].slice(0,st.j+(st.arrived?1:0)).some(q=>q[0]===2);
  if(!picked)peopleAt(g,second[0]+4,second[1]-8,id==='P0081'?2:1);
  if(id==='P0081'&&idx===3&&st.arrived)peopleAt(g,x+30,y-14,k?1:3);
 }
 if(id==='P0015'||id==='P0451'||id==='P0019'){
  const stop=p[1];if(st.j===1&&!st.arrived)peopleAt(g,stop[0]-22,stop[1]-8,1);if(st.next[0]===p.length-1&&st.arrived&&!k)peopleAt(g,x+32,y-4,1);
 }
 if(id==='P0027'){if(k){g.line([[p[1][0]+22,p[1][1]-27],[p[1][0]+22,p[1][1]+6]],ink,4);g.line([[p[1][0]+11,p[1][1]-25],[p[1][0]+38,p[1][1]-25]],red,6);}
  else if(st.next[0]===2&&!st.arrived)peopleAt(g,p[2][0]-25,p[2][1]-16,3);}
 if(id==='P0111'){const z=p[1];g.box(z[0]-19,z[1]+12,47,21,'#e4d6b7');for(let j=0;j<(k?1:2);j++){g.box(z[0]-15+j*20,z[1]+15,17,14,j?indigo:green);g.text(j?'82':'64',z[0]-7+j*20,z[1]+22,9,'#fff');}}
 if(id==='P0123'||id==='P0270'||id==='P0152'){const stop=p[id==='P0152'?2:1];const count=st.next[0]===(id==='P0152'?2:1)&&!st.arrived?9:k&&st.holding?(id==='P0152'?7:id==='P0123'?13:1):0;peopleAt(g,stop[0]-36,stop[1]-9,count);}
 if(id==='P0190'){const [xx,yy]=p[1];for(let j=1;j<=4;j++){const lag=j*.07;const pos=A.lerp(p[0],p[1],clamp(st.f*3-lag));if(st.holding||st.j===1)A.car(g,pos[0]-j*47,pos[1]+21,1,j%2?indigo:orange,'car');}g.dot(xx+17,yy-87,4,st.holding?red:'#a3d17d');}
 if(id==='P0151'&&k&&st.next[0]===1){const z=p[1];train(g,z[0]-93,z[1]+9,indigo,2);g.sign('附挂两节',z[0]-98,z[1]+32,indigo,12);}
 if(id==='P0412'){let n=k||st.j<2?11:Math.round(11*(1-st.q));peopleAt(g,p[1][0]-32,p[1][1]-14,Math.max(0,n));}
 if(['P0046','P0071'].includes(id)&&st.holding){const z=p[1];g.line([[z[0]+50,z[1]-21],[z[0]+51,z[1]+8]],ink,4);g.dot(z[0]+50,z[1]-24,7,red);}
 if(id==='P0080'){const z=p[3];peopleAt(g,z[0]-24,z[1]-8,k?2:6);g.sign(k?'1 班待恢复':'预取消 4 班',z[0],z[1]+25,k?orange:red,12);}
 if(s.mode==='railfreight'){const n=k||st.j===1?4:0;for(let j=0;j<n;j++)A.crate(g,p[1][0]+j*13,p[1][1]+13,12);if(st.kind==='r')for(let j=0;j<3;j++)A.crate(g,x-14-j*20,y-18,14);}
 if(s.mode==='ticket'){
  const idx=st.next[0];if(idx===1||idx===2){let n=id==='P0447'?(k?1:3):(k?2:1);g.box(x+22,y-35,13*n+6,22,'#d6c7a7');for(let i=0;i<n;i++)g.box(x+25+i*13,y-33,11,18,[green,orange,indigo][i]);}
 }
}

function backdrop(g,s,d){
 const A=window.ORTOPIA_PAINT;
 city(g,s);
 placeDetails(g,s);
 const segments=new Set();
 for(const row of d.runs){for(let j=1;j<row.length;j++){
  const a=row[j-1][0],b=row[j][0],key=[a,b].sort().join();if(a===b||segments.has(key))continue;segments.add(key);
  const pts=lineBetween(s,a,b);
  if(['rail','railfreight'].includes(s.mode))rails(g,pts);
  else if(s.mode==='cycle'){g.line(pts,'#9faa88',20);g.line(pts,'#c8b886',14);g.line(pts,'#fff1b5',2,[14,12]);}
  else if(s.mode==='port')g.line(pts,'#b2cebc',2,[8,18]);
  else if(s.mode==='ticket')g.line(pts,'#bbab89',3,[7,12]);
  else if(s.mode!=='air')A.road(g,pts,s.mode==='signal'?46:32);
 }}
 s.stops.forEach((name,j)=>{
  const [x,y]=point(s,j),yy=y-16;
  if(s.mode==='ticket'){
   if(j===3){g.box(x-45,yy-24,105,14,'#8caaaa');g.line([[x+48,yy-12],[x+50,yy+4]],'#8d9587',5);g.sign(name,x,y-65);}
   else {g.box(x-41,yy-28,82,26,'#bdab8f');g.box(x-43,yy-33,85,6,'#598484');g.box(x+9,yy-53,27,19,'#4b6d73');g.sign(name,x,yy-70);}
  }else if(s.mode==='air'){
   if(/机位|机场|放行|计划台|起飞|登机|候机/.test(name)) A.building(g,x-35,yy-9,78,48,name,'#c9c6b2','#9caeab');
   else{g.dot(x,yy,7,'#e6e1c4');g.sign(name,x,yy-45,indigo,12);}
  }else if(s.mode==='port'){
   if(j===2){crane(g,x-42,yy-16);for(let k=0;k<4;k++)A.crate(g,x-80+k*23,yy-14,17);}
   g.sign(name,x,yy-57,indigo,12);
  }else if(s.mode==='signal'){
   if(j===1){g.box(x+15,yy-56,4,53,ink);g.box(x+9,yy-78,17,30,ink);}g.sign(name,x-20,yy-97,indigo,12);
  }else if(s.mode==='railfreight'&&(j===0||j===1)){A.building(g,x-54,yy-16,105,62,name,'#c8c5ae');for(let n=0;n<4;n++)A.crate(g,x-49+n*25,yy-3,17);if(j===1)crane(g,x+49,yy-22);}
  else if(s.mode==='charge'&&/电|充|审核/.test(name)){pumps(g,x,yy);g.sign(name,x,yy-68,green,12);}
  else if(['rail','railfreight','town','charge'].includes(s.mode)){platform(g,x,yy,name);}
  else if(s.mode==='cycle'){g.line([[x-6,yy],[x-6,yy-27]],ink,3);g.sign(name,x-6,yy-34);}
  else A.building(g,x-40,yy-7,76,50,name,'#c9b89d');
 });
}
function train(g,x,y,color,cars=1,direction=1){
 g.c.save();g.c.translate(x,y);g.c.scale(direction,1);
 for(let j=0;j<cars;j++){let a=-j*63;g.poly([[a-44,-6],[a-44,-30],[a-38,-35],[a+8,-35],[a+18,-25],[a+18,-6]],color);
  for(let i=0;i<4;i++)g.box(a-38+i*12,-28,9,10,'#c6ddd6');g.box(a-40,-12,54,3,'#e2b964');g.dot(a-30,-5,5,ink);g.dot(a+6,-5,5,ink);}
 g.c.restore();
}
function plane(g,x,y,dir=1){
 g.c.save();g.c.translate(x,y);g.c.scale(dir,1);g.dot(4,13,32,'#7e91825e',5);
 g.poly([[-35,-8],[-18,-7],[-3,-8],[-24,-30],[-15,-30],[14,-10],[34,-9],[43,-4],[36,0],[8,1],[-14,20],[-21,20],[-7,1],[-27,0]],'#e8ede1');
 g.poly([[-31,-8],[-35,-22],[-29,-22],[-16,-6]],'#468a8b');g.line([[-29,-4],[28,-4]],indigo,2);g.c.restore();
}
function boat(g,x,y){
 g.poly([[x-48,y-12],[x+43,y-12],[x+30,y+2],[x-33,y+2]],'#476979');g.box(x-31,y-34,17,22,'#e6debe');g.box(x-27,y-30,8,4,'#65878d');
 for(let k=0;k<3;k++)g.box(x-10+k*14,y-21,13,9,[orange,green,red][k]);
}
function bike(g,x,y,f){
 g.dot(x-9,y-6,6,ink);g.dot(x+10,y-6,6,ink);g.line([[x-9,y-6],[x-3,y-16],[x+3,y-7],[x+10,y-6],[x+6,y-18]],'#ddab59',3);
 g.line([[x-3,y-18],[x,y-27],[x+8,y-19]],green,5);g.dot(x+1,y-32,4,'#a77956');g.line([[x-2,y-17],[x+Math.sin(f*24)*5,y-8]],ink,2);
}
function vehicle(g,x,y,type,dir,f,passengers=1){
 const A=window.ORTOPIA_PAINT;
 if(type==='p'){for(let j=0;j<Math.min(4,passengers);j++)A.person(g,x+j*9-4,y-Math.floor(j/3)*5,f*27+j,j?orange:green);return;}
 if(type==='a'){plane(g,x,y,dir);return;}if(type==='s'){boat(g,x,y);return;}if(type==='y'){bike(g,x,y,f);return;}
 if(type==='k'){A.crate(g,x-15,y-12,25);return;}
 if(type==='r'||type==='R'){train(g,x,y,green,type==='R'?4:2,dir);return;}
 if(type==='b'||type==='v'){train(g,x,y,indigo,1,dir);return;}
 A.car(g,x,y,dir,type==='t'?orange:green,type==='t'?'van':'taxi');
}
function axis(d,s){
 const all=d.runs.flat(),min=Math.min(...all.map(r=>r[3])),max=Math.max(...all.map(r=>r[3]));
 return [min,max];
}
function playback(d,s,k,f){
 const rows=d.runs[k],sameClock=['秒','巡航分钟','行程时刻','模型时段','泊位时刻'].includes(s.clock);
 const [begin,finish]=sameClock?axis(d,s):[rows[0][3],rows.at(-1)[3]];
 // Preserve an observable arrival and interchange even when a red phase lasts hundreds of seconds.
 const weights=rows.slice(1).map((r,j)=>Math.max(.65,Math.log1p(r[3]-rows[j][3]))),sum=weights.reduce((a,b)=>a+b,0);
 let u=clamp((f-.035)/.92),j=1,q=0,clock=begin+u*(finish-begin);
 if(sameClock){while(j<rows.length-1&&rows[j][3]<clock)j++;q=clamp((clock-rows[j-1][3])/(rows[j][3]-rows[j-1][3]||1));}
 else{let n=u*sum;while(j<rows.length-1&&n>weights[j-1])n-=weights[j++-1];q=clamp(n/weights[j-1]);clock=rows[j-1][3]+q*(rows[j][3]-rows[j-1][3]);}
 const prev=rows[j-1],next=rows[j],move=clamp((q-.09)/.79),route=lineBetween(s,prev[0],next[0]);
 const loc=window.ORTOPIA_PAINT.along(route,move);
 const holding=prev[0]===next[0],arrived=move>=1,kind=(q<.09?prev:next)[1];
 const continuous=['累计骑行时间','累计区间运行','纯巡航时间','本段行驶','首班结束电量','到站电量','等候放行'].includes(s.measure);
 const val=continuous?prev[2]+move*(next[2]-prev[2]):(arrived?next[2]:prev[2]);
 if(s.id==='P0481'){
  const t=rows[0][3]+clamp((f-.035)/.92)*(rows.at(-1)[3]-rows[0][3]),idx=Math.min(rows.length-1,Math.floor((t-24+.0000001)/2)),row=rows[idx];
  const amps=row[4],cost=rows[0][2],sum=row=>row[4].reduce((n,x)=>n+x[1],0),total=rows.slice(0,idx).reduce((n,r)=>n+sum(r)/30,0)+sum(row)*(t-row[3])/60;
  return {pos:loc,kind,j,prev,next,holding,arrived,q,f,clock:'第 '+fmt(t)+' 分钟',value:cost,
   sockets:amps,prior:idx?rows[idx-1][4]:[],upcoming:idx<rows.length-1?rows[idx+1][4]:[],slice:(t-row[3])/2,delivered:total,
   metrics:[['已接枪车辆',amps.map(a=>'车 '+a[0]).join('、')||'无'],['本站充电功率',fmt(sum(row))+' kW'],['24 分后输送电量',fmt(total)+' kWh'],[s.measure,fmt(cost)+' '+s.unit]]};
 }
 let note=holding?s.stops[next[0]]:arrived?s.stops[next[0]]:s.stops[prev[0]]+' → '+s.stops[next[0]];
 return {pos:loc,kind,j,prev,next,holding,arrived,q,f,clock:s.clock==='事件序号'?note:s.clock+' '+fmt(clock),metrics:[['当前地点',note],[s.measure,fmt(val)+(s.unit?' '+s.unit:'')]],value:val};
}
function register(id,s){
 s.id=id;
 const action=s.choices.join('，或')+'。跟随'+s.actor+'观察'+s.measure+'。';
 labs[id]={batch:'remaining',title:s.title,scope:s.scope+' 场所位置与未给定的步行动线为示意。',choices:s.choices,
 action,views:['跟随'+s.actor,'场区全景'],duration:39,
 chapters:(d,k)=>{if(id==='P0481')return [{at:0,label:'24 分 · 首班接枪'},{at:.24,label:'26 分 · 共用功率'},{at:.79,label:'32 分 · 分配功率'},{at:.98,label:'34 分 · 切换'}];const rs=d.runs[k];let keys=[{at:0,label:s.stops[rs[0][0]]}];let jlast=0;
 for(let frame=0;frame<=160;frame++){let f=frame/160,st=playback(d,s,k,f);if(st.arrived&&jlast<st.j){keys.push({at:f,label:s.stops[st.next[0]]});jlast=st.j;}}return keys;},
 frame:(d,k,f)=>playback(d,s,k,f),
 draw(canvas,st,d,k,f,view){
  const A=window.ORTOPIA_PAINT,here=st.pos,dir=point(s,st.next[0])[0]>=point(s,st.prev[0])[0]?1:-1;
  A.scene(canvas,id,g=>backdrop(g,s,d),[here[0],here[1]-34],view,610,g=>{
   if(s.mode==='signal'){const [x,y]=point(s,1);g.dot(x+17,y-87,4.4,st.holding?red:'#91d286');}
   if(s.mode==='ticket'){const [x,y]=point(s,1),n=id==='P0447'?(k?1:3):(k?2:1);for(let j=0;j<n;j++){g.box(x-37+j*23,y-52,21,13,k?orange:green);g.text('票',x-27+j*23,y-46,10,'#fff');}const apron=point(s,3),taxi=clamp((f-.945)/.055);plane(g,apron[0]+10+taxi*86,apron[1]+5-taxi*14);}
   if(s.mode==='charge'&&st.holding&&st.kind!=='p'){const [x,y]=here;g.line([[x-9,y-21],[x-22,y-17],[x-29,y-33]],'#50796b',2);}
   if(k&&st.kind==='p'&&st.holding&&['P0047','P0270','P0152'].includes(id)){
    // The tracked passenger stays on the pavement as the assigned or unavailable vehicle leaves.
    const offset=clamp(st.q*1.22)*210;vehicle(g,here[0]+offset,here[1]+21,'b',1,f);
   }
   if(id==='P0159'){
    const n=k?5:6,loc=k?window.ORTOPIA_PAINT.along([point(s,0),point(s,1),point(s,2),point(s,3)],f):here;
    for(let j=0;j<(k?n:n-1);j++)vehicle(g,loc[0]+(j%3-1)*65,loc[1]+24+Math.floor(j/3)*25,'b',dir,f);
   }
   if(s.mode==='port'){if(k)boat(g,point(s,2)[0],point(s,2)[1]);const x=point(s,2)[0]+23,y=point(s,2)[1]-83;let q=st.j===2?st.q:0;g.line([[x,y-36],[x,y-34+q*28]],ink,2);A.crate(g,x-10,y-34+q*28,19);}
   if(s.mode==='railfreight'&&st.kind==='k'&&st.next[0]>1){train(g,here[0]+55,here[1]+8,indigo,2);}
   if(id==='P0481'){/* Charging berths are drawn from actual powers below. */}
   else if(s.mode==='ticket'&&st.kind==='a'){if(f<.945)A.person(g,here[0],here[1],f*23,green);}
   else if(st.kind==='v'&&s.mode==='air')plane(g,here[0],here[1],dir);
   else if(id==='P0495'&&st.kind==='v')A.car(g,here[0],here[1],dir,green,'taxi');
   else vehicle(g,here[0],here[1],st.kind,dir,st.holding?0:f,['P0123','P0152','P0081','P0270','P0412'].includes(id)?3:1);
   if(s.mode==='charge'&&['kWh','能量单位','kW'].includes(s.unit)){
    const max=Math.max(1,...d.runs.flat().map(r=>r[2]));g.box(here[0]-23,here[1]+8,48,8,'#48615b');g.box(here[0]-21,here[1]+10,44*clamp(st.value/max),4,st.value<max*.17?'#d88853':'#a8d890');
   }
   activity(g,s,d,st,k);
   g.sign(s.actor,here[0],here[1]-53,st.holding&&k?red:green,12);
  });
 }};
}
Object.entries(specs).forEach(([id,s])=>register(id,s));
// Follow actual vehicles on the operational maps from the first decision collection.
function operationMap(g,s){
 city(g,s);
 if(s.mode==='air'){
  for(let j=0;j<s.points.length;j++){
   const [x,y]=s.points[j];window.ORTOPIA_PAINT.building(g,x-43,y+3,72,43,'航站 '+j,'#c3c0ab');
   g.dot(x+15,y+12,25,'#829790',10);g.text('H',x+15,y+11,15,'#fff');
  }
 }else{
  if(s.mode==='rail'){
   rails(g,s.points.slice(0,10));rails(g,s.points.slice(10));const [x,y]=s.points[9],[xx,yy]=s.points[10];
   g.line([[x+5,y],[xx-4,yy]],'#ab745c',8,[5,6]);g.sign('区间封锁',(x+xx)/2,y+73,red,12);
  }else window.ORTOPIA_PAINT.road(g,s.points,34);
  s.points.forEach(([x,y],j)=>{if(s.mode==='town'||j===9||j===10||j%3===1)platform(g,x,y-18,s.stops[j]);else g.text(s.stops[j],x,y-25,10,ink);});
 }
}
function timetableWorld(id,labels){
 const old=labs[id],air=id==='P0161',metro=id==='P0092';
 const frame=old.frame;
 let layout;
 function map(d){
  if(layout)return layout;
  let points=[],stops=[];
  if(metro){
   const miles=[0];for(const segment of d.segments)miles.push(miles.at(-1)+segment);
   points=miles.map((x,j)=>[63+x/miles.at(-1)*1120,380-51*Math.sin(Math.PI*j/15)]);stops=d.names;
  }else if(air){points=d.nodes.map(([x,y])=>[105+x*62,468-(y-3)*46]);}
  else{points=Array.from({length:10},(_,j)=>[86+j*118,377-53*Math.sin(j*.69)]);stops=points.map((_,j)=>j+' 号站');}
  return layout={points,stops,mode:air?'air':metro?'rail':'town'};
 }
 function locate(s,d,k){
  const {points}=map(d),A=window.ORTOPIA_PAINT;
  if(metro){
   const station=k===2?9:10;
   const plan=d.scenarios[k],board=plan.platforms.find(e=>e[1]===station&&e[0]>=(k===2?7900:7700)),service=plan.trains.find(r=>r[0]===board[5]);
   const ev=s.trains.find(r=>r.id===board[5]);let pos=points[station],on=false,actor=d.names[station]+' 候车客流';
   if(ev){pos=A.lerp(points[ev.a],points[ev.b],ev.p);on=true;actor=ev.id+' 次 · 已上车';}
   else if(s.t>service[3].at(-1)){pos=points[service[2].at(-1)];actor='到达 '+d.names[service[2].at(-1)];}
   return {pos,on,actor,station,evt:board[0],amount:s.platforms[station===9?0:1].count};
  }
  if(air){
   const group=d.requests[0],fl=d.flights.find(x=>x[0]===group[7]&&x[1]===group[8]),a=points[group[0]],b=points[group[1]];
   const on=!k&&s.t>=fl[4]&&s.t<fl[5],done=!k&&s.t>=fl[5];const p=clamp((s.t-fl[4])/(fl[5]-fl[4]));
   let pos=on?A.lerp(a,b,p):done?[b[0]-32,b[1]+22]:[a[0]-31+clamp((s.t-group[2]+3)/3)*30,a[1]+14];
   return {pos,on,done,actor:s.status,evt:fl[4]};
  }
  const plan=d.scenarios[k],board=plan.board.find(z=>z[2]>=54&&z[3]>0),ride=plan.routes[board[0]-1],idx=19-d.station,bus=s.fleet.find(x=>x.id===board[0]),station=d.station;
  const mapBus=e=>{const n=Math.floor(e.where),next=Math.min(n+1,9);return A.lerp(points[n],points[next],e.where-n);};
  const on=!!bus&&s.t>=board[2],done=s.t>=ride.at(-1)[2],pos=done?points[0]:on?mapBus(bus):points[station];
  return {pos,on:on&&!done,done,actor:done?'返回终点':on?board[0]+' 次公交乘客':station+' 号站候车乘客',evt:board[2],mapBus,station};
 }
 labs[id]={...old,batch:'lab20',title:labels[0],views:[labels[1],labels[2]],duration:42,
  scope:old.scope+' 默认镜头随指定一组旅客的候车、上车与到达推进。实际路段按实例时序运行。人物为聚合需求的代表。',
  chapters(d,k){
   if(air){const r=d.requests[0],fl=d.flights.find(x=>x[0]===r[7]&&x[1]===r[8]);return [[0,'航站开放'],[r[2]/d.end,'三人组报到'],[fl[4]/d.end,'核验航班'],[k?r[3]/d.end:fl[5]/d.end,k?'起飞窗口关闭':'抵达 0 号场']].map(([at,label])=>({at,label}));}
   let probe=frame(d,k,0),e=locate(probe,d,k).evt,lo=metro?d.bounds[0]:36,hi=metro?d.bounds[1]:112;
   return [[0,'候车现场'],[clamp((e-lo-(metro?50:3))/(hi-lo)),'车辆接近'],[clamp((e-lo)/(hi-lo)),'站台上客'],[clamp((e-lo+(metro?135:7))/(hi-lo)),'车上跟随']].map(([at,label])=>({at,label}));
  },
  draw(canvas,s,d,k,f,view){
   const A=window.ORTOPIA_PAINT,m=map(d),pts=m.points,follow=locate(s,d,k),here=follow.pos;
   A.scene(canvas,id,g=>operationMap(g,m),[here[0],here[1]-24],view,metro?540:625,g=>{
    if(metro){
     for(const e of s.trains){let pos=A.lerp(pts[e.a],pts[e.b],e.p);train(g,pos[0],pos[1]+(e.b>e.a?8:-3),e.agent?indigo:green,1,e.b>e.a?1:-1);}
     for(let i=0;i<2;i++){const [x,y]=pts[9+i],n=Math.min(15,Math.ceil(s.platforms[i].count/4));for(let j=0;j<n;j++)A.person(g,x-20+(j%6)*8,y-16-Math.floor(j/6)*6,0,j%2?orange:green);}
    }else if(air){
     for(const e of s.fleet){const p=e.fl?A.lerp(pts[e.a],pts[e.b],e.p):pts[e.a];plane(g,p[0]+12,p[1]-7,e.fl&&pts[e.b][0]<pts[e.a][0]?-1:1);}
     if(!follow.on)for(let j=0;j<3;j++)A.person(g,here[0]+j*10,here[1]+8,follow.done?f*20:0,j?green:orange);
    }else{
     for(const bus of s.fleet){const [x,y]=follow.mapBus(bus);vehicle(g,x,y+(bus.returning?2:16),'b',bus.returning?-1:1,f);}
     const [x,y]=pts[d.station],n=Math.min(17,s.queue);
     for(let j=0;j<n;j++)A.person(g,x+(j%7)*8-27,y-14-Math.floor(j/7)*7,0,j<s.booked?orange:green);
    }
    g.sign(follow.actor,here[0],here[1]-55,k&&!follow.on?indigo:green,13);
   });
  }
 };
}
timetableWorld('P0092',['中断折返后，站台旅客搭上哪一班','跟随折返旅客','伦敦线路全景']);
timetableWorld('P0110',['预约公交从 7 号站接客回到总站','跟随返程乘客','公交沿线全景']);
timetableWorld('P0161',['三位旅客怎样从 1 号起降场飞抵 0 号场','跟随三人组','起降场全景']);

})();
