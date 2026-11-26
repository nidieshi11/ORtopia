/* Instance-driven goods, reserve and service handoffs. The archival states are immutable:
   only the paint layer interpolates a vehicle along the selected pair of stations. */
(() => {
'use strict';
const {scene,building,person,car,crate,road,tree,along,lerp}=window.ORTOPIA_PAINT;
const labs=window.ORTOPIA_LABS;
const clamp=x=>Math.min(1,Math.max(0,x));
const smooth=x=>clamp(x)**2*(3-2*clamp(x));
const fmt=n=>Number(n).toLocaleString('zh-CN',{maximumFractionDigits:4});
const ink='#204447',teal='#318b7f',amber='#cb8c47',rust='#aa594e';
const descriptions={
 "P0004": [
  "分单台的众包骑手与第三方货车",
  "第三方订单",
  [
   "众包按归档占八成",
   "众包改占六成"
  ],
  "按每百单折算分配比例。保持订单总量及工资不变；份额试算不重算排队时间。"
 ],
 "P0007": [
  "整票货物只能经过一个枢纽",
  "货票 k0",
  [
   "经 h1",
   "改经 h0"
  ],
  "两条已启用线路之间改派同一票，货量不拆分。显示两段单位运费乘货量；其他货票固定，改派不代表全网可行。"
 ],
 "P0011": [
  "先取 1 号件，还是先去 39 号交货口",
  "取送车",
  [
   "按归档先取件",
   "先到交货口"
  ],
  "复现第一对取送节点。改变先后次序时在首次交货即受阻，后续路段未执行。"
 ],
 "P0028": [
  "CityA 铁路线的开行频次与可用运力",
  "铁路班列",
  [
   "每周期 10 班",
   "撤下一班"
  ],
  "用该弧单位班次容量乘以频次，固定单班容量；呈现供给上限，不等同实际装载量。"
 ],
 "P0030": [
  "首期配送留下多少跨期库存",
  "节点 1 周转货",
  [
   "保留归档结存",
   "调出一半结存"
  ],
  "首需求情景节点 1 的第一期期末。局部调出在需求满足后进行，展示可结转量，不推算第二期最优成本。"
 ],
 "P0036": [
  "首个 SKU 的采购单与到仓上架",
  "SKU 0",
  [
   "下归档采购单",
   "采购量减半"
  ],
  "选择联合采购向量的第一项。其余 609 个 SKU 保持原订购量，用同一批交付比较采购数量。"
 ],
 "P0041": [
  "送达同一地址后还要带回什么",
  "地址 1 回程件",
  [
   "送货并回收",
   "只送去程货"
  ],
  "跟随归档机组的 1→31 空中片段，取送量来自客户 1。跳过取件会漏做回程任务。"
 ],
 "P0048": [
  "配送车进入 G2 客户簇",
  "G2 片区配送车",
  [
   "按簇逐户送货",
   "绕过中间客户"
  ],
  "G2_1 与 G2_2 的实例坐标重合，视图将同址的两个交货门并列示意。G2 内部路径与各户需求来自归档。对照跳过中间一户，该户需求未满足。"
 ],
 "P0051": [
  "分批取货车在装车口接收多少",
  "分批车次",
  [
   "接下该车归档份额",
   "留一半给后车"
  ],
  "选第一种有服务的路线型中的一辆车，读取节点服务量。其他车不补运；未取部分留待后车。"
 ],
 "P0063": [
  "货源跨区进枢纽时要多付多少",
  "货源 2",
  [
   "进入本区枢纽",
   "改走跨区枢纽"
  ],
  "按该货源的周期接入费及跨区附加费计价；不重新分配其他服务流量。"
 ],
 "P0067": [
  "司机送完两户后何时能回库",
  "第一条出车路线",
  [
   "先送 C4",
   "先送 C3"
  ],
  "单独比较第一站到货早晚，两站都服务。实例时间矩阵对称，两种顺序的闭环行驶总时长相同。"
 ],
 "P0072": [
  "卡车到站后能把整件转给无人机吗",
  "客户 78 整件",
  [
   "卡车直送",
   "将整件交给无人机"
  ],
  "复现卡车 0 的首个目的地。单件需求 2，无人机限载 0.125。保持整票与原客户资格，改派时在装载坪受阻。"
 ],
 "P0084": [
  "风险路线发车前再加一票",
  "线路 1",
  [
   "按归档装车",
   "从线路 2 并入最后一票"
  ],
  "仅推演两条归档路线之间的追加装载，检查出车容量，不用局部超载量替代风险目标。"
 ],
 "P0085": [
  "无人机从哪一站往返同一收货点",
  "配送 1 号件",
  [
   "从 0 站放飞",
   "改从 2 站放飞"
  ],
  "两处均为车队实际停靠点。无人机飞行距离按原点位的直线距离往返计算，未重新安排其余任务。"
 ],
 "P0163": [
  "Truck18 卸货后还要不要补电",
  "Truck18",
  [
   "插枪一个时段",
   "跳过补电"
  ],
  "使用 Truck18 第三趟及末段空驶的归档能量。对照在返库前执行电量检查。"
 ],
 "P0164": [
  "飞往 B1 的包裹在哪一站续航",
  "H→B1 航件",
  [
   "启用 R1 中继",
   "关闭 R1 中继"
  ],
  "读取连接的两段长度，关闭 R1 后保持其他选边不变。起飞前检查两端是否连通。"
 ],
 "P0184": [
  "一个仓库发往客户的市场批次",
  "仓客货流 0→0",
  [
   "按登记批量发运",
   "优先保留一半在仓"
  ],
  "选取归档仓客流量 S_wc[0,0,0,2,1]。价格、产能和其他货流固定，局部调拨可能破坏需求平衡。"
 ],
 "P0189": [
  "从卡车放飞的首件是否准时",
  "无人机 D · C0 件",
  [
   "准时起飞",
   "晚一个时间单位放飞"
  ],
  "选定 o→C0→R0 航段，客户时限与飞行时间取自原实例。只比较首次交付，后续等待不重算。"
 ],
 "P0191": [
  "同一收货园区内的放飞、服务与回收",
  "客户 6 的作业机",
  [
   "按归档放飞",
   "推迟 0.05 小时放飞"
  ],
  "停靠 17、收货人 6 与停靠 25 均映射到物理地址 6。画面分开园区内作业位置，间距不计为航程。显示归档空中作业返回时刻，局部延时固定作业时长。"
 ],
 "P0193": [
  "环线共享车已满，谁送专车承担的最后一单",
  "专车订单 2118",
  [
   "派归档专车",
   "撤销专车且保留原共享分配"
  ],
  "选择唯一专车订单 2118。撤车试算固定所有共享路线，不临时重排。专车固定费 3。"
 ],
 "P0199": [
  "中断后的第一段货运通道",
  "货单 49",
  [
   "保留归档首段运力",
   "暂停这段运输"
  ],
  "第一个中断情景中选有完整承运的货单。停运试算冻结其他车辆和改道决策，显示首次接续差异。"
 ],
 "P0279": [
  "公交携货时能否在指定站交接",
  "k1 号运单",
  [
   "按归档在出站点交货",
   "不启用出站装卸"
  ],
  "固定原线路与该笔货量，仅停用末站的货物交接功能。"
 ],
 "P0331": [
  "柜门打开后，顺路配送员是否接件",
  "D0 包裹",
  [
   "让 K0 接单",
   "取消这次顺路交付"
  ],
  "固定补给线路及其他服务方式。只跟随此客户与归档顺路配送员。"
 ],
 "P0363": [
  "从夜间车库驶往首户的电量",
  "配送车 1",
  [
   "按归档出库电量",
   "夜间少补一个电量单位"
  ],
  "选取车辆 1 的前两段。行驶耗电取原模型 f；到站电量与同线路归档比较，不重算后续购电费用。"
 ],
 "P0414": [
  "设施 0 的一个直接服务名额",
  "客户 0",
  [
   "保留现场服务能力",
   "关闭设施 0"
  ],
  "本设施容量 1，归档由它直接服务客户 0。保持其他服务分配不变。"
 ],
 "P0415": [
  "车先到了，取件窗口还没开",
  "预约取件 2170",
  [
   "等到预约窗口开启",
   "到达即尝试取件"
  ],
  "第一条取件路线的到达时刻 4.8139，服务开始 58。对照在首次违反时间窗时暂停。"
 ],
 "P0433": [
  "一条列路线能覆盖多少个客户",
  "路线 r0",
  [
   "启用 r0",
   "撤下 r0"
  ],
  "选中列 r0 的成员按存储顺序演示交付，顺序是示意。其他列固定；恰好一次覆盖使撤列后该组失去服务。"
 ],
 "P0443": [
  "环航班轮少开一班会少多少舱位",
  "环航船队",
  [
   "维持每周 28 班",
   "减少一班"
  ],
  "按每航次容量乘周班次只评估单航段供给，需求与运价不变；未对更改频次的货主选择重新求值。"
 ],
 "P0444": [
  "空车留在本场还是调去另一个场",
  "0 场 0 型空车",
  [
   "原场留车",
   "空驶调到 1 场"
  ],
  "初始无货场景抽取车辆 0。原地候派不产生跨场行驶；对照只统计新调位段，未重算未来收益。"
 ],
 "P0456": [
  "按合同容量预留的供应商产线",
  "零售商预留批次",
  [
   "采用合同容量 Q",
   "改用模型下界 Q_l"
  ],
  "按归档批发价乘容量试算名义货款，保持分成率不变。货款没有计入利润分成或最坏情形收益。"
 ],
 "P0457": [
  "开盘库存已经达到订货水位",
  "首期库存",
  [
   "维持归档水位",
   "额外补一单位"
  ],
  "首期原解无需补货。用实例均值作为共同需求路径，比较两种水位的期末结存，未把该路径当成最坏情形。"
 ],
 "P0459": [
  "车在 1 号点收到两份请求",
  "请求 2 与 6",
  [
   "同时接受 2 和 6",
   "只接受请求 2"
  ],
  "复现策略表中同一已观察状态，目的地均取 1；比较该状态已有动作价值。"
 ],
 "P0460": [
  "末日零担拼载与外包的选择",
  "末日库存中的货单",
  [
   "采用归档末日路线",
   "该票转外包"
  ],
  "末日单票库存状态取位掩码 2。按归档末日动作表回放，自有路线与外包清空同一票，只统计交接方式。"
 ],
 "P0462": [
  "整车仍装不下的单户需求",
  "客户 13 的送货车",
  [
   "装满本车",
   "仅装一半"
  ],
  "采用归档的首条单客户路线与第一种离散需求，固定此次需求。只比较这一户这一次的满足量。"
 ],
 "P0463": [
  "配送中心的货必须在卫星站换车",
  "t0003 客户件",
  [
   "接通二级配送",
   "在卫星站终止二程"
  ],
  "仅累计中心到卫星站、卫星站到选定客户的单程边成本；未计返程及其他树。"
 ],
 "P0470": [
  "最后一户改由无人机往返",
  "客户 1 的包裹",
  [
   "沿原路线由卡车送",
   "从车库放飞服务客户 1"
  ],
  "选唯一允许无人机服务的客户 1，比较车库往返直飞距离。卡车路径省略中间点的画面表示；不重算联合等待与场景罚金。"
 ],
 "P0471": [
  "面对同一高需求时按哪张订单备货",
  "高需求首个市场样本",
  [
   "按高类型合同备货",
   "改按低类型合同备货"
  ],
  "固定 H 型首个离散需求，以需求与备货量较小者为实际销售。未将试算重新解释为新的激励相容合同。"
 ],
 "P0474": [
  "销售代理看到末档报价后的努力选择",
  "末档销售代理",
  [
   "采用末档佣金",
   "改用零佣金"
  ],
  "取最后一个报告区间佣金上下界中点，在同一报告下比较每单位销售对应的佣金。人员行走为结算示意，未重算整份菜单租金。"
 ],
 "P0475": [
  "第一家零售店与制造商核对批发单",
  "门店 0 订单",
  [
   "采用归档订货量",
   "仅订一半"
  ],
  "解码归档整数分子与共享分母，按原批发价结算单笔采购。试算固定其他商家的订货和厂方报价。"
 ],
 "P0483": [
  "哪辆车现在去接这一单",
  "当前接送请求",
  [
   "派归档车辆 2",
   "改派车辆 1"
  ],
  "两种首步指派的期望值均来自原解对后续 OD 支路的计算。街区位置按实例的一维刻度布置。"
 ],
 "P0484": [
  "夹在原任务之前的新接送请求",
  "根节点车辆",
  [
   "按归档派车辆 1",
   "改派车辆 2"
  ],
  "采用原根请求取送插入位 1、2，中点接客后送至枢纽 0，再执行该车已有任务。车辆各自的待取、待送枢纽来自实例。比较选中车辆的实际行驶里程。"
 ],
 "P0490": [
  "第一期多订一件，哪一期可以动用",
  "首笔在途补货",
  [
   "按归档首期不订",
   "首期额外订一件"
  ],
  "选择原分布支持中的共同两期需求 0、1，提前期一。对照仅改变首笔在途订单；结果为该路径的满足量。"
 ],
 "P0492": [
  "哪辆车给零库存客户送去补货",
  "车 1 · 客户 1",
  [
   "执行归档补货",
   "取消本次直达行程"
  ],
  "从零状态解码车辆访问位及对应配送量。保持其余客户与车辆不变。"
 ]
};
const shopfronts=['#d7c3a2','#a4b5a6','#b2bcb3','#d7beab'];
function property(g,x,y,j,kind){
 const side=j%2?-1:1;
 if(kind==='store'||kind==='depot'){
  // Vary the material flow of each dock with its doors, dock level and aisle markings.
  g.box(x-89,y+39,179,10,'#a8aa97');g.line([[x-92,y+44],[x+94,y+44]],'#b69b62',3,[8,7]);
  for(let t=0;t<3;t++){g.box(x-87+t*15,y+32,10,8,'#697d72');g.box(x-86+t*15,y+31,8,2,'#d7c887');}
 }else{
  g.line([[x-70,y+21],[x-55,y+32],[x+90,y+32]],'#dfd3b6',10);
  g.box(x+60*side-2,y-73,3,91,'#788879');g.line([[x+60*side,y-73],[x+48*side,y-73]],'#768c82',3);g.dot(x+48*side,y-71,4,'#f4deb0',2);
 }
}
function interior(g){
 g.box(0,0,1240,610,'#e6dccc');
 for(let j=0;j<6;j++){const x=33+j*208;g.box(x,50,153,134,'#acc7c0');g.box(x+7,57,138,118,'#c5dbd2');g.box(x+74,53,4,126,'#ece4ce');g.box(x+4,119,146,4,'#ece4ce');}
 g.poly([[0,186],[1240,186],[1240,610],[0,610]],'#d4c6ad');
 for(let y=228;y<610;y+=66)g.line([[0,y],[1240,y]],'#c5b49b',1);for(let x=15;x<1240;x+=87)g.line([[x,186],[x-115,610]],'#c5b49b',1);
}
function counter(g,x,y,j,label){
 g.box(x-68,y-25,132,18,'#9c8168');g.poly([[x-68,y-25],[x-46,y-41],[x+83,y-41],[x+64,y-25]],'#e0c5a3');
 g.box(x-59,y-8,7,19,'#876f57');g.box(x+52,y-8,7,19,'#876f57');
 g.box(x-3,y-67,42,29,'#386265');g.box(x+2,y-63,32,18,'#a7d5c6');g.box(x+14,y-39,6,8,ink);
 for(let z=0;z<4;z++)g.box(x-47+z*4,y-33-z,23,2,'#f0e4c9');person(g,x+61,y-26,0,j%2?teal:amber);
 g.sign(label,x,y-94,ink,13);
}
function townDetail(g,id,d,pts){
 const theme=d.freight;
 if(theme==='sales'){interior(g);return;}
 if(theme==='store'||theme==='depot'){
  for(let n=0;n<7;n++){const x=n*190-42;g.poly([[x,10],[x+133,10],[x+112,43],[x-22,43]],'#eff0dc');g.line([[x+60,19],[x+51,36]],'#d6ded0',5);}
  g.line([[21,546],[1220,546]],'#6a8c81',4);
  if(['P0030','P0036','P0457','P0490'].includes(id))for(let j=0;j<12;j++){const x=32+j*108;g.box(x,490,68,8,'#637c73');g.box(x,499,4,35,'#6f7e70');g.box(x+64,499,4,35,'#6f7e70');for(let m=0;m<3;m++)crate(g,x+3+m*20,476,16,['#be8759','#8fa99a','#c5a15d'][j%3]);}
  return;
 }
 if(theme==='port'){
  if(id==='P0443'){
   g.poly([[-20,298],[356,264],[642,289],[906,243],[1260,255],[1260,586],[831,565],[571,529],[291,558],[-20,511]],'#83b6b4');
   for(let j=0;j<32;j++){const x=(j*131)%1240,y=350+(j*59)%150;g.line([[x,y],[x+19,y-1]],'#b7d3c9',1);}
   for(const [x,y] of pts){g.poly([[x-72,y-60],[x+80,y-60],[x+65,y-8],[x-80,y-8]],'#bac0ab');for(let j=0;j<5;j++)g.box(x-64+j*28,y-9,7,7,'#606e63');}
  }else{
   for(let j=0;j<13;j++){const x=28+j*95;g.box(x,183,75,30,j%2?'#829a94':'#bd946f');for(let m=0;m<7;m++)g.box(x+4+m*10,185,1,26,'#a4ad9d');}
  }return;
 }
 if(theme==='rail'){
  for(let j=0;j<3;j++){const pts=[[0,220+j*42],[340,233+j*43],[744,160+j*42],[1240,157+j*40]];g.line(pts,'#687875',7);g.line(pts,'#c3ad89',14,[2,10]);}
  for(let j=0;j<6;j++){const x=j*190+21;g.box(x,117,3,104,'#627c73');g.line([[x,119],[x+104,119]],'#768778',3);g.line([[x,151],[x+45,120]],'#758674',2);}
  return;
 }
 if(theme==='drone'){
  g.poly([[21,145],[176,69],[332,100],[472,168],[361,176],[156,161]],'#94b39b');
  for(let j=0;j<8;j++){const x=177+j*128,y=482+(j%3)*19;g.line([[x,y],[x+57,y-9]],'#95ae85',5);}
 }else{
  g.line([[-10,164],[406,158],[744,121],[1250,127]],'#bcc4b1',17);
  for(let j=0;j<13;j++){const x=38+j*98,y=146-(j%4)*9;building(g,x,y,54+(j%3)*8,37+(j%4)*13,'',shopfronts[j%4]);}
  if(theme==='network')for(let j=0;j<7;j++){const x=j*168+27;g.line([[x,469],[x+122,446]],'#b3b79a',3);}
 }
}
function situation(g,id,d,s,pts,present){
 const st=s.row,n=s.i,j=st[0],[x,y]=pts[j],end=s.i===s.run.length-1;
 const transfer=['fork','hand','van','drone','train','ship','bus','charge'].includes(s.active[1]);
 if(transfer&&present&&s.active[1]!=='drone'&&d.freight!=='sales'){
  // A waiting handler steps in only when the consignment reaches the bay.
  const doorDist=s.phase<.18?s.phase/.18:s.pct>=1?1:0;
  person(g,x+29-9*doorDist,y+13,doorDist*5,'#748e6e',end&&st[1]==='hand'&&st[4]>0);
 }
 if(['P0004','P0030','P0036','P0051','P0184','P0457','P0475','P0462','P0490'].includes(id)&&n>0){
  const [sx,sy]=pts[id==='P0462'?1:0],base=d.runs[0][0][4],q=s.run[1][4];
  const reserved=id==='P0004'?100-q:Math.max(0,base-q);
  const count=reserved>0?Math.min(9,Math.max(1,Math.ceil(8*reserved/Math.max(1,base)))):0;
  if(id==='P0004'){car(g,sx+74,sy-32,1,'#7c9890','car');g.sign('众包 '+fmt(reserved)+'%',sx+73,sy-68,'#617e67',11);}
  if(count)for(let a=0;a<count;a++)crate(g,sx-62+a%3*13,sy+4-Math.floor(a/3)*9,11,'#c69867');
 }
 if(id==='P0084'||id==='P0072'){const [x,y]=pts[1];g.box(x+46,y-48,49,18,st[1]==='hold'?rust:'#497b64');g.text(st[1]==='hold'?'载荷受限':'载荷检查',x+70,y-39,10,'#fff5dc');}
 if(id==='P0163'||id==='P0363'){
  if(n>0){const q=st[3],cap=Math.max(...d.runs[0].map(v=>v[3])),wid=50;g.box(x-27,y+42,wid+4,9,'#547266');g.box(x-25,y+44,wid*clamp(q/cap),5,q<cap*.2?rust:'#b9d488');}
 }
 if(id==='P0415'&&j===1){g.box(x+49,y-43,58,20,st[1]==='hold'?rust:'#75836b');g.text(st[1]==='hold'?'窗口未开':'预约取件',x+78,y-33,10,'#fff4d6');}
 if(id==='P0331'&&j===1){g.box(x-38,y-62,14,15,'#48665e');if(st[1]==='hold')crate(g,x-37,y-54,9);}
 if(id==='P0474'&&n===2){g.box(x+26,y+2,35,27,'#ede3cb');g.text(fmt(st[3]),x+43,y+15,10,ink);}
}


const layouts={
 city:[[131,403],[500,256],[991,366],[740,481]],
 network:[[143,343],[523,213],[570,447],[1052,315]],
 depot:[[163,295],[583,386],[995,268],[829,465]],
 store:[[156,397],[526,325],[1009,352],[760,455]],
 sales:[[182,382],[580,279],[992,418]],
 drone:[[167,417],[559,277],[997,381],[754,465]],
 port:[[150,393],[558,322],[974,320]],
 bus:[[160,389],[590,296],[1020,412]],
 charge:[[148,392],[554,286],[987,369]],
 rail:[[132,420],[570,340],[1000,325]]
};
function points(d){
 if(!d.xy)return layouts[d.freight].slice(0,d.sites.length);
 const xs=d.xy.map(p=>p[0]),ys=d.xy.map(p=>p[1]),l=Math.min(...xs),b=Math.min(...ys),dx=Math.max(...xs)-l,dy=Math.max(...ys)-b;
 const scale=Math.min(850/(dx||1),225/(dy||.001));
 const mapped=d.xy.map(([x,y])=>[620+(x-l-dx/2)*scale,355-(y-b-dy/2)*scale]);
 if(d.sites.includes('G2_1')){
  // These are two different customers at exactly the same coordinate. Separate their doors, not their service order.
  mapped[1][0]-=63;mapped[2][0]+=63;
 }
 return mapped;
}
function stationType(d,j){
 const n=d.sites[j];
 if(/充电|电枪/.test(n))return 'charge';
 if(/包裹柜|柜站|柜区/.test(n))return 'locker';
 if(/中继|机交接|起飞|装载坪|停靠点/.test(n))return 'air';
 if(/称重|秤|容量检查/.test(n))return 'scale';
 if(/港|码头|泊位|装载口/.test(n)&&d.freight==='port')return 'quay';
 if(/编组|到达线|铁路/.test(n))return 'rail';
 if(d.freight==='bus'&&j)return 'bus';
 if(/货架|零售仓|存储区|收货区|工位|发车道|装载门/.test(n))return 'shelf';
 if(/采购|报告台|报价|订舱|订单池|申请台|接单席/.test(n))return 'office';
 if(/客户|用户|地址|G\d|^v\d|收货点|门口/.test(n))return 'house';
 if(/枢纽|交接台|接续站|货站|车库|车场|仓|分单|候车/.test(n))return 'depot';
 return ['depot','depot','house','office'][j%4];
}
function siteArt(g,x,y,type,label){
 const col=type==='house'?'#dfc5ab':type==='office'?'#d8d6be':'#b3c6b6';
 if(type==='shelf'){
  g.box(x-62,y-89,124,76,'#516966');for(let i=0;i<4;i++)for(let j=0;j<2;j++)crate(g,x-55+i*29,y-73+j*26,17,j?'#d09b5c':'#a4b9a1');
  for(let j=0;j<3;j++)g.box(x-63,y-87+j*28,126,3,'#e2bb7c');g.box(x-65,y-92,5,83,ink);g.box(x+61,y-92,5,83,ink);
 }else if(type==='air'){
  g.dot(x,y-25,48,'#91a99a',17);g.dot(x,y-26,34,'#e6ddae',11);g.text('H',x,y-26,15,ink);g.line([[x-48,y-22],[x-48,y-80]],ink,3);g.poly([[x-47,y-80],[x-24,y-72],[x-47,y-65]],'#c17958');
 }else if(type==='locker'){
  g.box(x-57,y-72,114,61,'#4a7974');for(let j=0;j<2;j++)for(let i=0;i<5;i++){g.box(x-52+i*21,y-67+j*25,18,23,'#e1d8b2');g.box(x-38+i*21,y-61+j*25,2,5,'#53756e');}
 }else if(type==='quay'){
  g.line([[x-40,y-8],[x-36,y-110],[x+52,y-110]],'#69898c',7);g.line([[x-36,y-70],[x+28,y-110]],'#537775',3);g.line([[x+40,y-109],[x+40,y-43]],ink,2);
  for(let j=0;j<6;j++)g.box(x-87+(j%3)*28,y-24-Math.floor(j/3)*18,25,15,j%2?amber:teal);
 }else if(type==='rail'||type==='bus'){
  g.box(x-73,y-64,145,7,'#538681');g.box(x-62,y-60,4,46,ink);g.box(x+54,y-60,4,46,ink);g.box(x-28,y-31,51,6,'#987c59');g.box(x-44,y-59,69,19,'#d4d6bf');
 }else if(type==='charge'){
  g.box(x-39,y-68,27,56,'#577d7a');g.box(x-34,y-60,17,16,'#b5dfcf');g.line([[x-13,y-59],[x+8,y-52],[x+10,y-28],[x+2,y-24]],ink,3);g.box(x+24,y-68,7,56,'#ccba74');
 }else if(type==='scale'){
  g.poly([[x-62,y-12],[x+48,y-12],[x+65,y-24],[x-48,y-24]],'#687c79');for(let j=0;j<8;j++)g.line([[x-53+j*14,y-14],[x-42+j*14,y-22]],'#d9c58b',3);g.box(x+48,y-63,5,43,ink);g.box(x+29,y-69,42,15,'#557b6b');
 }else{
  building(g,x-54,y-12,102,type==='house'?58:type==='office'?81:66,'',col,type==='house'?'#b17d61':'#85958b');
  if(type==='depot'){g.box(x-21,y-53,41,40,'#526d68');for(let n=0;n<5;n++)g.box(x-19,y-52+n*6,38,2,'#91a59a');crate(g,x-45,y-27,16);}
 }
 g.sign(label,x,y-(type==='quay'?130:105),ink,13);
}
function lane(d,pts,a,b,air=false){
 const p=pts[a],q=pts[b];if(a===b)return [p,q];
 if(air||d.xy)return [p,q];
 const t=d.freight==='store'||d.freight==='depot'||d.freight==='rail'?.62:.46;
 return [p,[p[0]+(q[0]-p[0])*t,p[1]],[p[0]+(q[0]-p[0])*(t+.1),q[1]],q];
}
function backdrop(g,d,pts,id){
 const sharedYard=d.actor==='客户 6 的作业机';
 const theme=d.freight,indoor=['store','depot','sales'].includes(theme);
 g.box(0,0,1240,610,indoor?'#d9d1bb':'#c2d2b6');
 if(indoor){
  for(let x=-100;x<1330;x+=92){g.line([[x,180],[x+50,600]],'#cec5af',1);g.box(x+45,24,36,104,'#b4c4b9');}
  for(let y=171;y<605;y+=65)g.line([[0,y],[1240,y]],'#c9c2ab',1);
  for(let x=38;x<1210;x+=146){g.box(x,123,108,9,'#8a9c8d');for(let i=0;i<4;i++)crate(g,x+7+i*23,106,18,'#b89d76');}
  g.line([[0,522],[1240,522]],'#b2a16f',3,[21,8]);
 }else{
  g.poly([[0,61],[159,29],[344,67],[552,15],[774,81],[1034,28],[1240,57],[1240,178],[0,185]],'#aec4b1');
  if(theme==='port')g.poly([[0,0],[1240,0],[1240,262],[741,274],[178,234],[0,250]],'#91bebb');
  else if(['drone','network'].includes(theme))g.line([[-20,501],[291,465],[504,488],[822,544],[1270,503]],'#93bbb3',48);
  let seed=Number(id.slice(1))||6;
  for(let n=0;n<49;n++){seed=(seed*16807)%2147483647;const x=seed%1240;seed=(seed*16807)%2147483647;const y=82+seed%475;if(pts.some(([a,b])=>Math.abs(a-x)<92&&Math.abs(b-y)<118))continue;
   if(theme==='port'&&y<280)continue;
   if(n%5===0&&theme!=='drone')building(g,x,y,36,27,'','#c9c3ae');else tree(g,x,y,.64+(n%3)*.12);
  }
 }
 townDetail(g,id,d,pts);
 if(sharedYard){g.box(50,129,1140,380,'#bec3ae');g.line([[49,126],[1193,126],[1193,510],[50,510],[49,126]],'#89988b',4);for(let n=0;n<8;n++){g.box(95+n*140,135,98,27,'#d7d5ba');}g.sign('收货园区 · 物理地址 6',620,91,ink,16);}
 const seen=new Set();
 for(const run of d.runs)for(let k=1;k<run.length;k++){
  const a=run[k-1][0],b=run[k][0],key=[a,b].sort().join('/');
  if(a===b||seen.has(key))continue;seen.add(key);
  const line=lane(d,pts,a,b);
  if(id==='P0443'){if(run[k][1]==='ship')g.line(line,'#b7d8d2',1,[7,12]);}
  else if(theme==='sales'){g.line(line,'#d1c19f',2,[5,9]);}
  else if(theme==='rail'){g.line(line,'#647774',12);g.line(line,'#c2ad89',18,[2,10]);g.line(line,'#a0aaa2',5);}
  else if(indoor){g.line(line,'#b5b39f',27);g.line(line,'#e1c36b',2,[12,8]);}
  else road(g,line,theme==='drone'?14:24);
 }
 pts.forEach(([x,y],j)=>{if(theme==='sales'){counter(g,x,y,j,d.sites[j]);return;}property(g,x,y,j,theme);siteArt(g,x,y-12,stationType(d,j),d.sites[j]);});
}
function drone(g,x,y,t,color,goods){
 g.dot(x+3,y+24,24,'#8ba096',4);g.line([[x-18,y-4],[x+15,y-9]],ink,3);g.line([[x-17,y-12],[x+17,y-2]],ink,3);
 for(const [a,b] of [[-17,-5],[15,-10],[-16,-13],[17,-3]])g.dot(x+a,y+b,11,Math.sin(t*5)>.1?'#c2cfbc':'#a6b9af',2.6);
 g.dot(x,y-6,9,color,5);if(goods>0){g.line([[x,y-3],[x,y+8]],ink,1);crate(g,x-5,y+7,11);}
}
function vehicle(g,mode,x,y,dir,t,n,color){
 if(mode==='drone'){drone(g,x,y,t,color,n);return;}
 if(mode==='fork'){
  car(g,x,y,dir,amber,'car');g.box(x+dir*22-2,y-33,3,29,ink);g.line([[x+dir*22,y-4],[x+dir*39,y-4]],ink,3);if(n>0)crate(g,x+dir*29-6,y-17,13);return;
 }
 if(mode==='ship'){g.poly([[x-53,y-13],[x+58,y-13],[x+42,y+3],[x-39,y+3]],'#4b6d77');g.box(x-39,y-32,19,19,'#efe3c4');for(let j=0;j<3;j++)crate(g,x-14+j*18,y-26,16,j%2?amber:teal);return;}
 if(mode==='train'){
  const cx=g.c;cx.save();cx.translate(x,y);cx.scale(dir,1);for(let j=0;j<3;j++){const v=-29-j*46;g.box(v-38,-22,40,17,j%2?'#ac895c':'#69928b');g.line([[v-38,-5],[v+4,-5]],ink,3);for(const w of [-30,-6])g.dot(v+w,-2,3,ink);}
  g.poly([[-25,-6],[-25,-27],[1,-30],[22,-23],[34,-9],[32,-5]],color);g.box(7,-24,11,7,'#b8d2d0');g.line([[-26,-4],[33,-4]],ink,3);for(const w of [-13,18])g.dot(w,-2,4,ink);cx.restore();return;
 }
 if(mode==='bus'){g.box(x-51,y-28,97,24,color);for(let j=0;j<6;j++)g.box(x-46+j*15,y-24,11,9,'#c6dbd2');for(const w of [-34,30])g.dot(x+w,y-3,5,ink);return;}
 if(mode==='worker'||mode==='invoice'||mode==='hand'){person(g,x,y,t,color,mode==='hand'&&n>0);if(mode==='invoice'){g.box(x+6,y-18,12,10,'#efe7c9');g.line([[x+7,y-15],[x+14,y-15]],ink,1);}return;}
 car(g,x,y,dir,color);if(mode==='charge')g.line([[x+21,y-10],[x+37,y+4],[x+46,y-20]],'#b29a3c',3);
}
function frame(d,k,f){
 const run=d.runs[k],raw=clamp(f)*(run.length-1),i=Math.min(Math.floor(raw+1e-9),run.length-1),j=Math.min(i+1,run.length-1),phase=raw-i,a=run[i],b=run[j];
 const pct=clamp((phase-.19)/.68),landed=i===j||pct>=1;
 const row=landed?b:a,active=phase<.19||landed?row:b;
 // Handling and take-over are finite events. Resource totals change at arrival, not midway.
 return {run,i,j,phase,pct,active,row,clock:'现场 '+(1+(landed?j:i))+' / '+run.length,
  metrics:[[d.measure[0],fmt(row[3])+(d.measure[1]?' '+d.measure[1]:'')],['跟随对象',d.actor],['当前事件',row[2]]]};
}
function draw(canvas,s,d,k,f,view,id){
 const pts=points(d),a=s.run[s.i],b=s.run[s.j],air=b[1]==='drone',route=lane(d,pts,a[0],b[0],air),p=along(route,smooth(s.pct));
 const fly=air?Math.sin(Math.PI*s.pct)*67:0;const groundY=p[1]+5,present=s.pct>=1||s.i===s.j;
 const dir=pts[b[0]][0]>=pts[a[0]][0]?1:-1,station=s.row[0],mode=s.active[1],baseColor=k?'#a86952':'#357e74';
 const same=a[0]===b[0],handoff=['fork','hand','worker','invoice'].includes(b[1]);
 const movex=same&&handoff?Math.sin(Math.PI*s.pct)*18:0;
 const focus=[p[0]+movex,groundY-fly-26];
 scene(canvas,id,g=>backdrop(g,d,pts,id),focus,view,670,g=>{
  if(air&&a[0]!==b[0])g.line(route,'#608981',1.4,[4,7]);
  const max=Math.max(...d.runs.flatMap(r=>r.map(x=>x[4])),1e-9);
  // Locations keep their real cargo activity after the camera has moved.
  const seen=new Map();for(let n=0;n<=s.i;n++){const e=s.run[n];seen.set(e[0],e);}
  for(const [j,item] of seen){const [x,y]=pts[j];const scale=Math.min(9,Math.ceil(Math.max(0,item[4])/max*9));
   if(j===station||['hand','hold','fork'].includes(item[1]))for(let n=0;n<scale;n++)crate(g,x+28+n%3*10,y-8-Math.floor(n/3)*8,9,['#b28b61','#d9ab66','#ba976a'][n%3]);}
  const px=p[0]+movex,py=groundY-fly;
  if(mode==='hold'){
   const [x,y]=pts[station];person(g,x-18,y+2,0,rust);g.line([[x+4,y-17],[x+40,y-17]],'#cc785d',5);g.line([[x+7,y-17],[x+7,y+2]],ink,3);
  }else{
   vehicle(g,mode,px,py,dir,s.pct*13,s.active[4],baseColor);
   if(handoff&&same&&s.phase>.18&&s.phase<.89){person(g,px+19,py+2,s.pct*5,teal);if(s.active[4]>0)crate(g,px+6,py-16-s.pct*2,11);}
  }
  situation(g,id,d,s,pts,present);
  const tagY=py-(air?37:46);
  g.sign(d.actor,px,tagY,baseColor,13);
  const loc=present||s.pct<.04||same;
  if(loc&&s.row[1]==='hold')g.sign(s.row[2],px,py+25,rust,12);
  else if(loc)g.sign(s.row[2],px,py+26,'#566d60',12);
 });
}
for(const [id,[title,actor,choices,note]] of Object.entries(descriptions)){
 labs[id]={batch:'remaining',title,action:'跟随'+actor+'，比较“'+choices[0]+'”和“'+choices[1]+'”在现场的结果。',choices,scope:note+' 设施外观、交接动作和屏幕播放时长为示意。',views:['跟随'+actor,'现场全景'],duration:35,
  chapters:(d,k)=>d.runs[k].map((r,i,run)=>({at:i/(run.length-1),label:r[2]})),
  frame,draw:(canvas,state,data,k,f,view)=>draw(canvas,state,data,k,f,view,id)};
}


// The five earlier labs retain their original evaluators and all of their decision controls.
function milestones(items){return ()=>items.map(([label,at])=>({label,at}));}
function upgrade(id,view,chapters,draw,extraFrame){
 const old=labs[id],base=old.frame;
 labs[id]={...old,batch:'lab20',views:[view,'现场全景'],chapters,duration:old.duration||48,
  frame:extraFrame?(d,k,f,h)=>extraFrame(base(d,k,f,h),d,k):base,draw};
}
function floor(g,hot=false){
 g.box(0,0,1240,610,hot?'#e6d8c2':'#d5d4bc');
 for(let x=-20;x<1270;x+=86)g.line([[x,0],[x+60,610]],'#c6c6b3',1);
 for(let y=32;y<620;y+=76)g.line([[0,y],[1240,y]],'#c6c6b3',1);
}
function pallet(g,x,y,w,h,txt,col){
 g.box(x,y,w,h,col);g.box(x+w*.47,y,w*.09,h,'#e7d4a5');g.line([[x,y],[x+w,y],[x+w,y+h]],'#936f4d',1);if(h>9&&w>35)g.text(txt,x+w*.5,y+h*.5,11,ink);
}
upgrade('P0029','跟随当件货物',milestones([['首轮入箱',.008],['下一次尺寸揭晓',.2],['末轮 i28 分箱',.805],['末轮封箱',.982]]),(cv,s,d,k,f,view)=>{
 const a=Math.min(7,s.loaded),b=d.plans[k][a],dest=[[793,237],[982,448]][b],store=[121,407],scan=[455,362],u=s.loaded===8?1:s.cursor-a;
 const path=[store,[277,407],scan,[564,358],[688,dest[1]],dest],p=along(path,u);
 scene(cv,'freight-old-bin',g=>{floor(g);for(let x=57;x<633;x+=19){g.box(x,402,13,9,'#85968a');}g.line([[54,415],[283,415],[448,370],[616,370]],'#6c827a',11);
  building(g,55,334,151,103,'进货收货台');g.box(431,289,8,82,ink);g.box(432,289,58,8,ink);g.sign('尺寸扫描',460,275);
  [[793,237],[982,448]].forEach(([x,y],b)=>{g.box(x-66,y+8,133,10,'#9a7959');g.line([[x-66,y-107],[x-66,y+6],[x+66,y+6],[x+66,y-107]],'#6e8680',4);g.sign('装箱工位 b'+b,x,y+42);});
 },[p[0],p[1]-18],view,640,g=>{
  const h=[0,0],sz=2.7;
  d.plans[k].slice(0,s.loaded).forEach((bin,j)=>{const xy=[[793,237],[982,448]][bin],th=d.dimensions[s.step][j]*sz;h[bin]+=th;pallet(g,xy[0]-56,xy[1]+5-h[bin],110,th,d.items[j],bin?'#d5ab71':'#9ab7a1');});
  [[793,237],[982,448]].forEach(([x,y],b)=>{const yy=y+5-d.capacity[b]*sz;g.line([[x-71,yy],[x+72,yy]],rust,2,[6,5]);if(h[b]>d.capacity[b]*sz)g.sign('超过箱容',x,y-125,rust);});
  if(s.loaded<8){const m=u<.45?'fork':'fork';vehicle(g,m,p[0],p[1],1,u,1,teal);g.sign(d.items[a]+' → '+d.bins[b],p[0],p[1]-52,ink);}
  else g.sign('封箱 · '+d.bins[b],p[0],p[1]-155,teal);
 });
});
const rackPath=Array.from({length:47},(_,i)=>{const n=i-1;if(n<0)return [56,184];if(n===45)return[1187,458];const r=Math.floor(n/15),c=n%15;return [94+(r%2?14-c:c)*73,184+r*135];});
function rackPos(v){const z=Math.max(0,Math.min(46,v+1)),i=Math.floor(z);return lerp(rackPath[i],rackPath[Math.min(i+1,46)],z-i);}
upgrade('P0174','跟随当前交接',milestones([['首架出发',0],['人机接近',.19],['中段交接',.48],['末架出库',.96]]),(cv,s,d,k,f,view)=>{
 const actors=s.actors.map(a=>rackPos(a.x)),target=s.done.length===d.plans[k].jobs.length?actors[d.plans[k].finish.indexOf(Math.max(...d.plans[k].finish))]:actors[2];
 scene(cv,'freight-old-pick',g=>{floor(g);g.line(rackPath,'#9fac95',16);g.line(rackPath,'#e1dcaf',2,[9,12]);
  for(let j=0;j<d.n;j++){const [x,y]=rackPos(j);g.box(x-23,y-57,46,32,'#617c72');for(let z=0;z<3;z++)crate(g,x-18+z*12,y-51,10);g.text('S'+j,x,y-68,11);}
  g.sign('拣货入口',56,122);g.sign('机器人出库',1155,509);
 },target,view,516,g=>{
  for(let j=0;j<2;j++){const [x,y]=actors[j];g.box(x-14,y+9+j*17,29,12,j?'#b9814d':'#588884');g.dot(x-9,y+22+j*17,3,ink);g.dot(x+9,y+22+j*17,3,ink);crate(g,x-7,y+j*17,13);}
  const [x,y]=actors[2];person(g,x,y+3,s.actors[2].mode==='行进'?s.t*4:0,teal,!!s.active);g.sign('拣货员 · '+s.actors[2].mode,x,y-89,ink,12);
  if(s.active){const [j,b,t,qty]=s.active;const p=lerp([x,y-16],[actors[b][0],actors[b][1]+b*17],clamp((s.t-t)/d.handling));crate(g,...p,14);g.sign('S'+j+' · '+qty+' 件',p[0]+20,p[1]+44,teal,12);}
 });
});
function aircraft(g,x,y,sign){
 g.poly([[x-72,y+2],[x-40,y-8],[x+6,y-7],[x-6,y-48],[x+3,y-46],[x+30,y-8],[x+72,y-5],[x+81,y],[x+69,y+5],[x+25,y+6],[x-3,y+39],[x-11,y+40],[x+5,y+8],[x-47,y+6]],'#f7f3df');
 g.poly([[x-65,y],[x-75,y-21],[x-65,y-20],[x-44,y-2]],teal);g.sign(sign,x+10,y+49);
}
upgrade('P0411','跟随托盘',milestones([['进库验货',.01],['第一票转运',.31],['第二票上机',.73],['核对截载',1]]),(cv,s,d,k,f,view)=>{
 const i=Math.min(s.done,s.moves.length-1),[booking,to]=s.moves[i],dock=[[1002,209],[911,449],[605,481]],a=[147,268+booking*130],b=dock[to],u=s.done===s.moves.length?1:s.cur-i;
 const p=along([a,[321,a[1]],[422,338],[567,338],[b[0]-125,b[1]],b],clamp((u-.1)/.8));
 const left=s.moves.slice(0,s.done).filter(v=>v[1]===2).length;
 const look=f>.99&&left?dock[2]:p;
 scene(cv,'freight-old-airport',g=>{g.box(0,0,1240,610,'#c2d0bd');g.box(0,113,1240,396,'#a3b0a8');g.line([[0,334],[1240,334]],'#dbc993',3,[17,9]);
  building(g,35,232,215,110,'航空货站 · 出库口');g.sign('货票 0',148,222);g.sign('货票 1d4c',147,352);
  aircraft(g,1083,202,'航段 0');aircraft(g,992,444,'航段 1');g.line([[534,452],[662,452],[662,503],[534,503],[534,452]],'#b37a63',3);g.sign('留地暂存',604,425,rust);
 },look,view,641,g=>{
  const count=[0,0,0];s.moves.slice(0,s.done).forEach(([bk,t])=>{const n=count[t]++,[x,y]=dock[t];pallet(g,x-30+n%4*14,y+15-Math.floor(n/4)*12,13,10,'',bk?'#8aaf9b':'#d39b66');});
  vehicle(g,'fork',p[0],p[1],1,u,1,amber);g.sign('货票 '+d.bookings[booking],p[0],p[1]-42,ink);
  if(f>.99&&left)g.sign('留地 '+left+' 托',604,538,rust);
 });
});
upgrade('P0461','跟随热餐',milestones([['接到订单',.055],['灶上出餐',.20],['餐盒上车',.435],['末单签收',.89]]),(cv,s,d,k,f,view)=>{
 const plans=d.plans[k],homes=[[1000,202],[1045,402],[675,480]],kitchen=[170,290],pass=[330,330],dock=[470,344],labels=['A','B','F'];
 const routes=homes.map(p=>[dock,[579,344],[664,p[1]],p]);
 const focusOrder=k===1?2:0,positions=plans.map(([cook,dep,v],j)=>{
  if(s.t<cook+d.prepare[j])return kitchen;
  if(s.t<dep)return pass;
  return along(routes[j],clamp((s.t-dep)/d.legs[j][0]));
 });
 const late=s.phases[focusOrder]==='签收';const follow=late&&k!==1?Math.max(0,s.phases.findIndex(p=>p==='配送')):focusOrder;
 scene(cv,'freight-old-kitchen',g=>{g.box(0,0,1240,610,'#c9d1b6');for(let j=0;j<19;j++)tree(g,24+j*68,112+(j%4)*33,.8);
  routes.forEach(p=>road(g,p,23));building(g,54,266,265,115,'共享厨房','#d0bc9d');g.box(128,280,86,13,'#576d67');for(let j=0;j<3;j++)g.dot(142+26*j,279,8,ink,3);g.sign('出餐台',334,285);g.sign('配送停车位',473,293);
  homes.forEach(([x,y],j)=>siteArt(g,x,y-2,'house','客户 '+labels[j]));
 },positions[follow],view,624,g=>{
  for(let j=0;j<3;j++){const [x,y]=positions[j],phase=s.phases[j],off=(j-1)*12;
   if(phase==='配送'){car(g,x,y,1,j===0?teal:amber);g.sign(labels[j]+' 餐',x,y-47);}
   else if(phase==='烹制'){g.dot(x+off,y-6,11,'#ab7455',5);g.dot(x+off,y-6-Math.sin(s.t*9)*3,6,'#d4b37b',3);}
   else if(phase==='候车'){crate(g,x+off,y-7,13);g.text(labels[j],x+off+4,y-21,12);}
   else if(phase==='签收'){person(g,x+12,y+7,0,teal,true);g.text(labels[j]+' 已签收',x,y+28,12);}
  }
  const [x,y]=positions[follow];g.sign(labels[follow]+' 餐 · '+s.phases[follow],x,y-66,ink);
 });
},(s,d,k)=>({...s,metrics:[...s.metrics,['A 餐发车时刻',String(d.plans[k][0][1])],['F 餐发车时刻',String(d.plans[k][2][1])]]}));
upgrade('P0408','跟随作业机',milestones([['第一柜装件',.01],['首片柜间搬运',.20],['跨片区转场',.70],['末段入柜',.98]]),(cv,s,d,k,f,view)=>{
 const regions=[...new Set(d.coords.map(x=>x[0]))],group=regions.indexOf(d.coords[s.a][0]),next=regions.indexOf(d.coords[s.b][0]);
 function regionXY(j){const row=Math.floor(j/8),col=j%8;return[98+(row%2?7-col:col)*148,173+row*139];}
 const a=regionXY(group),b=regionXY(next),p=lerp(a,b,s.p);
 if(view||!s.id){
  scene(cv,'freight-old-locker-map',g=>{g.box(0,0,1240,610,'#c5d5bc');g.line([[-15,330],[305,274],[674,308],[947,244],[1255,281]],'#95bcb3',30);
   road(g,regions.map((_,j)=>regionXY(j)),18);regions.forEach((v,j)=>{const [x,y]=regionXY(j);g.box(x-15,y-16,32,15,'#779b8b');g.text('C'+(j+1),x,y-28,12);});},p,view,605,g=>{
   drone(g,p[0],p[1]-28,s.t,teal,s.id);g.sign(s.id?'柜区内 · '+s.id:'C'+(group+1)+' → C'+(next+1),p[0],p[1]-78);});
 }else{
  const residents=d.coords.map((pt,i)=>({pt,i})).filter(v=>v.pt[0]===d.coords[s.a][0]),max=Math.max(...residents.map(v=>v.pt[1]),.00001);
  const pos=x=>[147+899*x/max,397-37*Math.sin(Math.PI*x/max)],a=pos(d.coords[s.a][1]),b=pos(d.coords[s.b][1]),p=lerp(a,b,s.p);
  const lift=s.phase==='装货'?s.stageP:s.phase==='卸货'?1-s.stageP:s.phase==='完成'?0:1;
  const droneY=p[1]-32-lift*59;
  scene(cv,'freight-old-locker-'+group,g=>{g.box(0,0,1240,610,'#d0d8bf');for(let n=0;n<10;n++){tree(g,n*135+47,132+n%2*46);building(g,n*135+33,232,56,55,'','#d6bfa6');}road(g,residents.map(v=>pos(v.pt[1])),25);
   residents.forEach(({pt,i})=>{const [x,y]=pos(pt[1]);siteArt(g,x,y-19,'locker','柜 L'+i);});},[p[0],droneY],0,610,g=>{
   drone(g,p[0],droneY,s.t,teal,0);const z=droneY+10+12*(1-lift);g.line([[p[0],droneY],[p[0],z]],ink,1);crate(g,p[0]-6,z,12);
   g.sign('任务 '+s.id+' · '+s.phase,p[0],droneY-37);
  });
 }
});
})();
