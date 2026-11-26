/* Activity follows the selected shelf, queue, contract or instrument.
   Physical layouts are schematic; settlement and branch data live in each instance pack. */
(() => {
'use strict';
const labs=window.ORTOPIA_LABS;
const config={
  P0044: {"kind": "works","title": "项目立项与资源领用","choices": ["沿用归档立项","同组替换一项"],"sites": ["立项窗口","资源核算","项目实施","退回档案"],"labels": ["项目用量","本项成本","两项合计成本"],"scope": "同一家族的一项获批与一项未批互换，保持项目数，所选替代的资源耗用更低。其余项目固定。按实例系数计算两个候选对成本的贡献。"},
  P0059: {"kind": "queue","title": "配对站里等来的同类伙伴","choices": ["同类到齐即配对","让第二对分开离场"],"sites": ["到达区","核对类型","结伴离站","各自离开"],"labels": ["同类人数","本次配对回报","本段回报"],"scope": "条件客流为四组同类型各两人，类型和配对回报取自实例。第二对改为放弃；此段不估计长期到达及流失的期望。"},
  P0060: {"kind": "works","title": "项目投入如何穿过相邻风险评估线","choices": ["足额投入锚项目","锚项目减半"],"sites": ["项目库","核拨预算","常规评估","关联评估"],"labels": ["锚项目投入","情景最大切面值","所示情景合计"],"scope": "重放锚项目所在的风险情景及相邻对照；预算机会未再分配。每一项取三个原始仿射切面的最大值，允许为负。"},
  P0082: {"kind": "works","title": "未来尚未揭晓时的首期资源调拨","choices": ["按根节点调拨","首项少调一单位"],"sites": ["待分资源","根节点","交付配额","待调池"],"labels": ["派发量","加权交付","根节点加权交付"],"scope": "只改根节点 x0，其余系数和决定固定。核对首期三项对同一个资源平衡的贡献，后续情景未重新排程。"},
  P0197: {"kind": "works","title": "一列相邻工序怎样共同占用作业链","choices": ["开启归档链位","停掉首个启用位"],"sites": ["待派工位","相邻工段","启用段","停用段"],"labels": ["活动量","含左邻项成本","所示链段成本"],"scope": "相邻两位同时工作才计入双线性成本。重算首个启用位周围的一段链，已固定上游值和插值端点。"},
  P0427: {"kind": "analysis","title": "测量样本被送往哪一个代表中心","choices": ["按归档中心分组","首个样本改投另一中心"],"sites": ["观测入口","量测台","代表中心 1","代表中心 2"],"labels": ["观测坐标","中心坐标","平方误差和"],"scope": "跟随 g1 的前七个观测。两个代表位置保持归档值，改变第一份样本的归属后逐个核算平方偏差。"},
  P0435: {"kind": "graph","title": "六色区段的左右边界","choices": ["选择归档区段","选择最窄边界区"],"sites": ["左邻区","选定六色区","右邻区","边界汇总"],"labels": ["所选区号","本侧跨界边","边界总数"],"scope": "所有六个颜色保留在同一个 K6，两侧原始跨界数之和就是所选区段的边界；环上其余区段折叠。"},
  P0453: {"kind": "works","title": "每期资源领用量随观测而变","choices": ["按原策略领用","第一类行动减半"],"sites": ["观测点","材料发放","作业单元","库存结算"],"labels": ["第一类行动","消耗资源一","八期资源一消耗"],"scope": "沿用前八期原始观测顺序，从相应原子读取两类归档行动，以原多项式核算第一种资源。未改变第二种行动。"},
  P0458: {"kind": "queue","title": "接件后先探测，再决定是否接受","choices": ["探测并接纳","拒绝第一件"],"sites": ["到达口","探测工位","接纳席位","拒绝出口"],"labels": ["实际子型","已实现回报","两件累计回报"],"scope": "使用归档的两笔实际到件，第二件保持拒绝。第一种方案先探测再接纳，另一种保留预算、放弃首件。子型在探测之后揭晓。"},
  P0467: {"kind": "queue","title": "同一团积压怎样分给四类队列","choices": ["按归档比例分配","第二类份额并入第一类"],"sites": ["需求入口","分流台","服务工位","空队列"],"labels": ["条件总积压","本类积压份额","四类拥堵成本"],"scope": "固定正积压为 100，从实例的 10021 个份额取前四类；其他份额不变。计算四类的 c×积压量的 m 次方之和，非稳态平均值。"},
  P0468: {"kind": "queue","title": "服务请求多分给哪一个服务器","choices": ["按归档流量","移一单位给最弱台"],"sites": ["请求端","分配器","高回报台","低回报台"],"labels": ["服务流率","期望回报率","两台合计回报率"],"scope": "用一单位最小流量在原最优解满载的高回报台与有余量的最弱台之间调整。按伯努利成功概率计量，不抽取服务时长。"},
  P0056: {"kind": "pulse","title": "控制脉冲穿过量子实验台","choices": ["归档双通道控制","后半段交换两路控制"],"sites": ["脉冲源","量子器件","态矢量读出","误差测量"],"labels": ["通道一强度","第一情景损失","风险加权目标"],"scope": "从同一个初态推进全部 5600 个步，显示 15 个采样帧。球面投影对应第一种扰动，目标按全部三种扰动、风险及脉冲处罚复算；归档为可行局部解。"},
  P0099: {"kind": "analysis","title": "样本读出特征后走向哪条分类线","choices": ["保留两条完整规则","首条删去一个条件"],"sites": ["输入样本","特征读取","预测为正","预测为负"],"labels": ["归档真值","预测分类","正确样本权重和"],"scope": "重建 96 个观测与全部特征，逐个展示前十个。两条合取规则按“或”组合，预测与实际标签相符才计入权重。"},
  P0074: {"kind": "finance","title": "投资头寸经过八次历史结算","choices": ["归档持仓","五分之一转入证券零"],"sites": ["资金账户","下单席位","收益入账","损失记账"],"labels": ["证券零占比（%）","该样本收益（%）","样本平均收益（%）"],"scope": "重建原始八个历史样本，在已准入资产间挪动 20% 资金。每份历史记录单独结算，末项是等权样本均值。"},
  P0095: {"kind": "shelf","title": "交叉商品群共享同一条陈列架","choices": ["上架归档商品","撤下第二件商品"],"sites": ["到货口","验货台","陈列架","留在后仓"],"labels": ["商品所需空间","实际占架空间","六件总占架"],"scope": "用归档选品的前六件和原货架面积逐件复核。撤下一件后保留空位，此段关注空间，不推断顾客替代购买。"},
  P0115: {"kind": "street","title": "首小时三个区域的网约车候车点","choices": ["归档报价和报酬","采用首档价薪组合"],"sites": ["分区入口","派车站","乘客上车区","候客区"],"labels": ["每公里报价","期望服务人次","三地期望人次"],"scope": "首小时市场状态 0_0_0、共享高薪运力余量为零。逐区重放两份价薪组合对应的期望服务数，以同一时段展示，不推演随后十一小时。"},
  P0169: {"kind": "energy","title": "远期电力合约到交割台","choices": ["归档远期头寸","首笔头寸减半"],"sites": ["交易席位","交割清算","正向头寸","反向头寸"],"labels": ["带符号头寸","时段交割量","净交割量"],"scope": "取第一期非零远期合约，按峰谷对应的时段小时数换算带符号交割量，其他合约固定。"},
  P0440: {"kind": "warehouse","title": "现款与赊购两批货如何入库","choices": ["现款与赊购均启用","只接收现款批次"],"sites": ["供应商","授信台","零售仓","暂未放行"],"labels": ["该批批发价","本批到仓量","合计到仓量"],"scope": "按归档现金采购与贸易信用各自数量发货，关闭赊购后保持现款预算和价格不变。显示短期入库量。"},
  P0441: {"kind": "warehouse","title": "采购补贴从订货单进入财政账","choices": ["归档单位补贴","单位补贴减半"],"sites": ["供应库","核对订货单","财政结算","采购归档"],"labels": ["单位采购补贴","本批财政支出","合计补贴支出"],"scope": "把归档采购量平分成两笔以便观察结算。按单位补贴乘实际订货量计支出，固定价格和采购量，未重新求供应商响应。"},
  P0445: {"kind": "shop","title": "顾客的保留价能否跨过现价","choices": ["归档开场报价","报价提高 0.5"],"sites": ["步行街","商品展示","收银提货","空手离店"],"labels": ["商品报价","成交件数","样本实收"],"scope": "原 10021 件初始库存下计算开场报价，取五位固定估值顾客比较同一报价。该窗口冻结开场报价，购买反馈不重新定价。"},
  P0448: {"kind": "ticket","title": "唯一的预订名额留给谁","choices": ["只接归档开放产品","同时开放两种产品"],"sites": ["等候大厅","核对产品","取得名额","未取得名额"],"labels": ["请求票价","本单收入","实收合计"],"scope": "重放开场两个决策时点的报价开关，给定低价后高价两笔请求。售出即占用唯一资源；这是条件到达路径。"},
  P0454: {"kind": "media","title": "一次广告活动能覆盖哪些人群","choices": ["沿用归档投放份额","暂停第一个人群"],"sites": ["广告服务器","分群投放","页面展示","空广告位"],"labels": ["投放份额","均值供给下展示量","样本展示合计"],"scope": "跟随非保量活动 w000 的前五个非零人群份额。计算各群均值供给乘份额，被取消的人群不再展示此广告，不向别人转投。"},
  P0455: {"kind": "warehouse","title": "金融市场揭晓后的采购交割","choices": ["归档采购量","第二种市场状态减半采购"],"sites": ["批发报价","金融交割","收货仓位","无采购"],"labels": ["状态批发价","采购数量","六状态平均支出"],"scope": "取前六个互斥金融叶节点，在对应的批发价下核对采购量与支出。对照仅改第二个叶节点的数量；所示均值等权，不代表全树最优利润。"},
  P0465: {"kind": "shelf","title": "一天漏补货，后面的货架能否补回来","choices": ["每日补至归档目标","第三期暂缓订货"],"sites": ["到货口","补货工位","零售货架","欠交区"],"labels": ["本期补货","期末净库存","累计欠交量"],"scope": "以原需求中心和均匀扰动、实例种子生成六期共同路径。在第三期跳过订货，此后仍按目标补货。负库存转为欠交。"},
  P0472: {"kind": "finance","title": "合同柜台按报告类型确定提成","choices": ["使用归档提成菜单","统一取中间档提成"],"sites": ["类型报告","合同柜台","销售执行","努力成本账"],"labels": ["本档提成","努力成本","平均努力成本"],"scope": "检查五个真实合同节点。给定报告，卖方最优努力等于提成，将其代入二次努力成本；未重求信息获取和合同可行性。"},
  P0473: {"kind": "warehouse","title": "补贴改变后供应商怎样报价与发货","choices": ["归档最低可行补贴","使用高补贴可行方案"],"sites": ["供应商报价","门店订货","结算柜台","需求端"],"labels": ["当前价格、数量或补贴","期望销量","期望财政支出"],"scope": "两组报价与订货量均来自实例的已校验供应商响应。最后按每件补贴乘期望销量结算。"},
  P0485: {"kind": "shelf","title": "商品调价如何改变工作量入口","choices": ["归档目录价","所示商品提价 0.25"],"sites": ["目录商品","挂牌定价","下单流","工作量池"],"labels": ["商品报价","名义需求率","六品名义需求率"],"scope": "第一类商品中取六个相隔的真实目录项。保持交付期不变，用实例线性价格响应重算名义需求，不将其当作实际整数客流。"},
  P0486: {"kind": "shop","title": "销量考核之前要不要继续高价","choices": ["归档反馈价格","全程挂最高价"],"sites": ["步行街口","报价窗口","提货离店","空手离店"],"labels": ["报价或考核目标","成交或考核销量","收入扣已到期罚金"],"scope": "截至第一考核点 72，以原强度和实例种子产生共同泊松到达与均匀估值。展示最初三人、其后成交及考核，收入扣当期销量罚金。"},
  P0487: {"kind": "shop","title": "店里最后两件货能否偿债","choices": ["归档动态报价","首位顾客打折"],"sites": ["街口","货架","成交提货","离店出口"],"labels": ["本次报价","成交件数","扣债后正权益"],"scope": "按归档两件库存递推重建价值函数，对五个给定估值用同一路径比较。首笔降价至估值上界的八成，此后按实际库存恢复原策略。"},
  P0491: {"kind": "shop","title": "顾客到店后库存反馈怎样改变报价","choices": ["归档库存反馈","固定九折开场价"],"sites": ["门厅","询价台","付款提货","未成交离店"],"labels": ["报价","成交件数","五人实收"],"scope": "从归档初始库存读取完整库存报价表，选五个固定估值比较。售出才扣库存，随后按已选规则报价；此段不估计无限期价值。"},
  P0498: {"kind": "shop","title": "七位后续顾客带来的实际收入","choices": ["按归档报价","七次报价都减半"],"sites": ["入口","报价亭","成交提货","离店出口"],"labels": ["报价","实际购买","七人累计实收"],"scope": "重放探索期之后的七笔已实现购买。此实例真实伯努利需求依赖特征且对价格不敏感，减价保持同一销售样本。"},
  P0499: {"kind": "shop","title": "今日的价签怎样成为明日的参考价","choices": ["归档价格轨迹","首期降价四成"],"sites": ["商业街","今日价签","销售柜台","参考价格记录"],"labels": ["当期价格","需求（百万）","累计收入（百万）"],"scope": "取前七期归档报价，只改第一期。之后恢复同一组归档价格，用真实参考价格更新和非对称需求计算销量及收入。"}
};
const paint=window.ORTOPIA_PAINT;
const {scene,building,tree,person,crate,car,road,along,lerp}=paint;
const ink='#284644', green='#30786b',orange='#b67443',red='#a65349',blue='#63879f';
const cloth=['#447f76','#a06f50','#6f85a1','#996e85','#8b935f'];
const limit=(v,lo=0,hi=1)=>Math.max(lo,Math.min(hi,v));
const nfmt=v=>Number(v).toLocaleString('zh-CN',{maximumFractionDigits:6});
const at=(u,n)=>Math.min(n-1,Math.floor(u*n));
const places={
  shop:[[95,382],[512,302],[995,250],[1036,463]],
  shelf:[[130,411],[462,307],[943,228],[918,455]],
  queue:[[97,340],[480,350],[982,210],[1030,435]],
  warehouse:[[100,415],[480,395],[973,331],[937,150]],
  works:[[96,340],[440,324],[968,246],[978,427]],
  analysis:[[113,278],[503,307],[972,183],[958,403]],
  energy:[[104,260],[497,345],[989,221],[976,424]],
  finance:[[99,358],[469,328],[994,234],[987,414]],
  street:[[106,415],[524,322],[996,223],[1002,460]],
  ticket:[[119,367],[487,323],[1000,233],[965,438]],
  media:[[115,343],[474,305],[939,190],[940,407]]
};
// The rooms and storefronts are arranged around each problem's actual decision point.
const individualPositions={
 P0044:[[116,398],[428,342],[886,258],[975,440]], P0060:[[106,319],[547,246],[901,181],[974,386]],
 P0082:[[132,427],[475,278],[865,353],[1033,189]], P0197:[[143,295],[485,346],[930,360],[880,218]],
 P0453:[[137,383],[553,359],[921,267],[959,447]], P0445:[[143,413],[460,296],[894,226],[1030,408]],
 P0486:[[125,397],[468,340],[875,240],[989,448]], P0487:[[152,440],[525,305],[913,321],[1000,445]],
 P0491:[[103,371],[446,328],[880,200],[1037,460]], P0498:[[175,409],[552,255],[904,222],[1003,430]],
 P0499:[[113,410],[424,305],[948,302],[1006,447]], P0472:[[108,388],[496,272],[963,200],[1001,394]],
 P0074:[[111,340],[479,339],[890,219],[908,439]], P0454:[[119,294],[532,332],[966,198],[980,441]],
 P0095:[[132,416],[461,302],[951,190],[996,408]],P0465:[[163,376],[510,305],[907,223],[943,438]],
 P0485:[[116,311],[486,319],[941,289],[900,442]]
};
for(const [id,cfg] of Object.entries(config)){cfg.id=id;cfg.points=individualPositions[id]||places[cfg.kind];}
function setDesign(g,cfg){
 const id=cfg.id;if(!cfg.points)return;
 const [entry,desk,deliver]=cfg.points,[x,y]=desk,[ox,oy]=deliver;
 if(id==='P0486'){ // Timed event sale; a marked turnstile and sales clock.
  for(let i=0;i<4;i++){g.box(x-116+62*i,y-160,5,96,'#806e54');g.poly([[x-113+62*i,y-158],[x-80+62*i,y-147],[x-113+62*i,y-135]],i%2?orange:green);}
  g.line([[x-114,y-160],[x+77,y-160]],'#968569',2);g.sign('限时销售场',x-24,y-162,green);for(let j=0;j<3;j++)raised(g,ox+35+j*19,oy+7,9,5,28,'#818d7b','#57685d','#b8c2a8');
 }else if(id==='P0487'){
  building(g,x-147,y-90,99,78,'账务室','#bcab9c','#877f77');workstation(g,x+78,y+9,'money');raised(g,ox+28,oy-43,44,13,40,'#7a8175','#53665c','#9a9f8c');g.dot(ox+50,oy-62,7,'#c8b495');
 }else if(id==='P0491'){
  for(let j=0;j<3;j++){raised(g,ox-104+j*56,oy-98,42,12,10,'#a78e6e','#857057','#d0b694');for(let a=0;a<3;a++)crate(g,ox-103+j*56+a*12,oy-121,13,'#b18152');}
  car(g,entry[0]+28,entry[1]-35,1,'#718c81');kiosk(g,x+160,y-27,74,48,blue,'库存查询');
 }else if(id==='P0498'){
  raised(g,x-77,y-89,156,11,42,'#71857f','#586c67','#a6b7a6');
  for(let j=0;j<3;j++){screen(g,x-66+j*47,y-123,40,28,'#a0c4bf');g.box(x-58+j*47,y-92,24,3,'#50736f');}
  g.sign('自适应报价终端',x,y-152,blue);
 }else if(id==='P0499'){
  const ax=x+115,ay=y-18;g.box(ax-10,ay-99,11,100,'#8a8f80');g.box(ax+78,ay-99,11,100,'#8a8f80');
  raised(g,ax-34,ay-83,147,8,61,'#536e69','#455b55','#abc0aa');g.sign('街区价格公示',ax+39,ay-115,ink);
 }else if(id==='P0445'){marketStall(g,x-111,y-27,112,'#aa7557');g.box(ox-82,oy-91,162,8,'#9c785b');for(let j=0;j<5;j++)crate(g,ox-73+j*29,oy-111,20,cloth[j]);}
 else if(id==='P0197'){// Adjacent jobs share a drive belt; stop remains on its actual lane.
  const yy=desk[1]+78;g.line([[171,yy],[1001,yy]],'#687c78',12);for(let j=0;j<8;j++){const xx=175+114*j;g.dot(xx,yy,13,'#8d9784');g.dot(xx,yy,5,'#596961');}}
 else if(id==='P0060'){for(let j=0;j<3;j++){panelGauge(g,desk[0]-114+74*j,desk[1]-132,cloth[j]);}}
 else if(id==='P0082'){g.line([[x-139,y+50],[x-54,y+65],[x+57,y+100],[x+136,y+89]],'#919e84',4);g.line([[x-54,y+65],[x+18,y+35],[x+116,y+28]],'#919e84',4);[[-139,50],[-54,65],[57,100],[136,89],[18,35],[116,28]].forEach(([dx,dy])=>g.dot(x+dx,y+dy,5,green));}
 else if(id==='P0453'){for(let j=0;j<2;j++){const xx=ox-65+j*76;g.box(xx-17,oy-129,34,73,j?blue:green);g.dot(xx,oy-129,17,j?'#8da8af':'#93a489',5);g.line([[xx,oy-57],[xx,oy-42],[x+43,oy-42]],j?blue:green,4);}}
 else if(id==='P0044'){workstation(g,x+71,y-8,'supply');g.box(x+97,y-68,22,26,'#baab86');g.box(x+99,y-64,17,3,'#696d57');}
 else if(id==='P0074'){raised(g,x+90,y-46,123,9,65,'#344c4d','#253a3e','#7e9081');for(let j=0;j<3;j++)g.line([[x+96,y-93+j*12],[x+120,y-88+j*12],[x+153,y-101+j*12],[x+184,y-92+j*12]],cloth[j],2);}
 else if(id==='P0472'){workstation(g,x+88,y+12,'money');for(let j=0;j<4;j++){g.box(x+18+j*17,y-36,14,10,cloth[j]);g.box(x+20+j*17,y-34,9,2,'#e8dfc7');}}
}
function panelGauge(g,x,y,col){raised(g,x,y,51,7,31,'#607d77','#4f6864','#9ea990');g.dot(x+25,y-17,10,'#ddd6b7');g.line([[x+25,y-17],[x+31,y-24]],col,2);}


const tile=(g,x,y,w,h,col)=>{g.box(x+3,y+5,w,h,'#a2a798');g.box(x,y,w,h,col);};
// Furniture has a fixed footprint. Shadows connect inventory and operators to their work surfaces.
function raised(g,x,y,w,d,h,face,side,top){
 g.poly([[x+5,y+4],[x+w+7,y+4],[x+w+d+12,y-d+5],[x+d,y-d+3]],'#a8a896');
 g.poly([[x,y-h],[x+w,y-h],[x+w,y],[x,y]],face);
 g.poly([[x+w,y-h],[x+w+d,y-h-d*.45],[x+w+d,y-d*.45],[x+w,y]],side);
 g.poly([[x,y-h],[x+d,y-h-d*.45],[x+w+d,y-h-d*.45],[x+w,y-h]],top);
}
function bench(g,x,y,wood='#a7825d'){
 g.box(x+6,y-11,5,12,'#626b5a');g.box(x+46,y-11,5,12,'#626b5a');raised(g,x,y-8,54,7,7,wood,'#756d59','#c1a780');
 for(let j=0;j<3;j++)g.box(x,y-25+j*4,53,3,wood);
}
function lamp(g,x,y){
 g.dot(x+4,y+2,13,'#a1a78f',3);g.box(x-2,y-47,4,48,'#627168');g.line([[x,y-44],[x+4,y-54],[x+13,y-54]],'#627168',3);
 g.poly([[x+8,y-55],[x+20,y-55],[x+24,y-50],[x+5,y-50]],'#68756a');g.box(x+8,y-50,13,2,'#f7deaa');
}
function plant(g,x,y){
 raised(g,x-8,y,17,3,12,'#b88765','#916e57','#d8aa80');
 for(let j=0;j<5;j++){const dx=(j-2)*4;g.line([[x,y-11],[x+dx,y-26+Math.abs(dx)*.25]],'#667962',2);g.dot(x+dx,y-27+Math.abs(dx)*.25,5,j%2?'#769479':'#587e6f',9);}
}
function marketStall(g,x,y,w,color){
 raised(g,x-w/2,y,w,10,29,'#bc9a73','#90795f','#dfc09a');
 for(let j=0;j<3;j++)for(let n=0;n<5;n++)g.dot(x-w*.38+j*w*.28+n*3,y-34+((n+j)%3)*2,3.7,['#a96344','#8c9859','#d3af61'][j]);
 g.box(x-w/2+1,y-69,4,41,'#7d7d65');g.box(x+w/2-3,y-69,4,41,'#7d7d65');
 for(let j=0;j<7;j++){const xx=x-w*.55+j*w*1.1/7;g.poly([[xx,y-73],[xx+w*.16,y-73],[xx+w*.16-4,y-62],[xx-4,y-62]],j%2?'#efdfc0':color);g.box(xx-4,y-62,w*.16,4,j%2?'#d9c9ad':color);}
}
function workstation(g,x,y,type){
 const c=type==='money'?'#895d47':type==='server'?'#506e75':'#657d77';
 raised(g,x,y,84,13,29,c,'#50615b','#d1b493');g.box(x+8,y-23,27,15,'#b8ac8e');g.box(x+13,y-18,10,2,'#657165');
 if(type==='money'){for(let k=0;k<3;k++)raised(g,x+39+k*9,y-32-k*2,13,3,3,'#d5bd76','#9e8e5d','#ead798');screen(g,x+2,y-67,40,32,'#b6b489');}
 else if(type==='server'){screen(g,x+14,y-66,59,34,'#8bb8aa');for(let k=0;k<3;k++)g.dot(x+7+k*10,y-12,2,'#b3bf95');}
 else {g.box(x+11,y-43,23,12,'#7d9194');g.box(x+16,y-50,14,8,'#c5bea7');for(let j=0;j<2;j++)crate(g,x+40+19*j,y-48,15);}
}
function bike(g,x,y){
 for(let j=0;j<2;j++){g.dot(x+j*23,y,7,'#53645a');g.dot(x+j*23,y,4.6,'#bbc5ac');}
 g.line([[x,y],[x+9,y-13],[x+17,y],[x+23,y],[x+16,y-14],[x+8,y-12]],'#a16d51',2);
}
function streetDepth(g,flavor){
 const warm=flavor==='P0496'||flavor==='shop';
 // The street runs between a continuous shopfront and a furnished pedestrian square.
 g.poly([[0,270],[1240,208],[1240,402],[795,430],[300,458],[0,424]],'#d5c8a7');
 for(let j=0;j<17;j++){const x=j*78,y=352-38*Math.sin(j*.33);g.line([[x,y-65],[x+5,y+48]],'#c4b99b',1);g.line([[x,y+35],[x+75,y+31]],'#c2b69c',1);}
 for(let j=0;j<5;j++){const x=15+j*273,y=232-22*Math.sin(j);building(g,x,y,111,51,'',j%2?'#d3b798':'#c0c5a3',j%2?'#9c7761':'#869981');marketStall(g,x+51,y+26,75, j%2?'#af7354':'#5e8979');}
 [[59,352],[356,344],[743,354],[1069,310]].forEach(([x,y],j)=>{bench(g,x,y);plant(g,x+66,y+2);lamp(g,x-13,y+4);if(j%2)bike(g,x+84,y+10);});
 for(let j=0;j<5;j++){const x=147+212*j,y=490+8*(j%2);g.box(x,y,66,3,'#f5e3af');if(j%2)tree(g,x+27,y+43,.76);}
 if(warm){marketStall(g,741,303,85,'#98744e');person(g,694,305,0,'#847963');}
}
function roomDepth(g,kind){
 const industrial=['warehouse','shelf','works'].includes(kind),desk=['analysis','finance','media'].includes(kind);
 // Distinct occupied bays along the back wall and a furnished foreground beyond the working aisle.
 for(let j=0;j<4;j++){const x=42+305*j,y=229+(j%2?7:0);
  if(industrial){raised(g,x,y,141,20,60,'#bcb59b','#969782','#d0c6ad');
   for(let level=0;level<2;level++){g.box(x+3,y-48+level*24,134,17,'#8a8976');for(let c=0;c<5;c++)crate(g,x+8+c*26,y-49+level*24,16,cloth[(c+j)%5]);}
   g.box(x,y-2,141,4,'#847965');workstation(g,x+157,y+16,'supply');}
  else if(desk){raised(g,x,y,197,15,22,'#947d64','#716758','#cebba2');for(let u=0;u<2;u++){screen(g,x+9+u*92,y-65,65,39,'#84b1a2');g.box(x+24+u*92,y-25,36,4,'#786e5c');}
   person(g,x+121,y-4,0,cloth[j]);}
  else {for(let u=0;u<2;u++){bench(g,x+10+u*63,y);if((u+j)%2===0)person(g,x+27+u*63,y-5,0,cloth[j]);}plant(g,x+159,y);}
 }
 for(let j=0;j<5;j++){const x=57+j*247,y=466+(j%2)*24;
  if(industrial){raised(g,x,y,66,12,9,'#a28d6c','#88775d','#b7a786');for(let a=0;a<3;a++)crate(g,x+4+a*19,y-24,16,cloth[(a+j)%5]);if(j%2)workstation(g,x+88,y+17,'supply');}
  else if(desk){workstation(g,x,y,kind==='finance'?'money':'server');person(g,x+42,y+15,0,cloth[j]);plant(g,x+113,y);}
  else {bench(g,x,y);lamp(g,x+89,y);if(j%2)plant(g,x+100,y);}
 }
 if(kind==='finance'){for(let j=0;j<4;j++){g.box(318+28*j,371,16,29,'#bdab70');g.dot(326+28*j,375,5,'#dbcb87');}}
 if(kind==='media'){for(let j=0;j<6;j++){const x=649+j*20;g.box(x,278,16,37,'#556b71');for(let h=0;h<4;h++)g.box(x+3,281+h*7,10,2,h%2?'#9cae95':'#c7c699');}}
}
function agentInk(g,x,y,t,col,parcel=false){
 const c=g.c;c.save();c.translate(x,y);c.scale(1.4,1.4);person(g,0,0,t,col,parcel);c.restore();
}


function kiosk(g,x,y,w,h,color,name){
 tile(g,x-w/2,y-h,w,h,'#d3c4a6');g.poly([[x-w/2-5,y-h],[x-w/2+9,y-h-17],[x+w/2+9,y-h-17],[x+w/2+3,y-h]],color);
 g.box(x-w/2+6,y-h+6,w-12,h*.49,'#718f87');g.box(x-w/2+8,y-16,w-16,7,color);
 g.box(x+w*.12,y-h+8,13,h*.43,'#d7e1c8');g.sign(name,x,y-h-25,color,14);
}
function rack(g,x,y,w,color){
 for(let j=0;j<2;j++){g.box(x,y+23*j,w,6,'#817f6d');for(let h=0;h<5;h++)crate(g,x+6+h*(w/5),y-14+23*j,15,cloth[(h+j+color)%5]);}
 g.box(x-2,y-21,4,53,'#70786d');g.box(x+w-3,y-21,4,53,'#70786d');
}
function screen(g,x,y,w,h,color){tile(g,x,y,w,h,'#3c5554');g.box(x+5,y+5,w-10,h-10,'#223f46');for(let j=0;j<5;j++){g.box(x+11,y+12+7*j,Math.max(8,(w-28)*(.35+.15*(j%4))),2,j%2?color:'#94aca1');}}
function hall(g,kind){
 const t=kind==='finance'?'#dbd3be':kind==='warehouse'?'#cfcebb':kind==='analysis'?'#d5dfd6':'#e1d9be';
 g.box(0,0,1240,610,t);g.box(0,0,1240,95,'#a8b9ad');g.box(0,83,1240,14,'#8e9e90');
 for(let j=0;j<10;j++){g.box(j*136+14,16,101,48,'#60817f');g.box(j*136+17,19,95,42,'#afc8c2');g.line([[j*136+45,22],[j*136+22,50]],'#c7d8ca',3);g.box(j*136+62,19,4,42,'#76918a');}
 for(let y=140;y<610;y+=68)g.line([[0,y],[1240,y]],'#c7c6b3',1);
 for(let x=-180;x<1300;x+=105)g.line([[x,97],[x+180,610]],'#c9c9b7',1);
}
function outdoor(g){
 g.box(0,0,1240,610,'#becdaf');g.line([[-50,60],[340,94],[597,70],[814,122],[1300,77]],'#92b7b0',56);
 for(let j=0;j<20;j++){const x=(j*193)%1240,y=28+((41*j)%480);if(j%3)tree(g,x,y,.75);else building(g,x,y+45,59,31,'','#c7baa1');}
}
function background(g,cfg){
 const {kind,sites}=cfg,ps=cfg.points||places.shop,[[x0,y0],[x1,y1],[x2,y2],[x3,y3]]=ps;
 if(['street','energy','shop'].includes(kind)){outdoor(g);streetDepth(g,kind);}else{hall(g,kind);roomDepth(g,kind);}
 const track=(a,b,w)=>{let pts=[a,[(a[0]+b[0])*.5,a[1]],b];g.line(pts,'#bdbeab',w+6);g.line(pts,['energy','media','analysis'].includes(kind)?'#7e9992':'#dfcfab',w);};
 track(ps[0],ps[1],27);track(ps[1],ps[2],23);track(ps[1],ps[3],23);
 if(kind==='shop'||kind==='street'){
  road(g,[[-40,510],[315,449],[660,459],[925,509],[1260,513]],46);
  for(let j=0;j<3;j++){building(g,130+j*208,203-j%2*32,110,73,'',['#cfb89e','#c5b7a8','#b6c4a0'][j]);tree(g,89+j*222,260,.86);}
  if(kind==='street'){for(let j=0;j<3;j++)car(g,x1-96+51*j,y1-32,1,cloth[j],'sedan');building(g,x2-67,y2-42,128,52,sites[2]);}
  else{kiosk(g,x2,y2-14,146,72,'#807954',sites[2]);rack(g,x2-53,y2-49,94,3);}
  kiosk(g,x1,y1-20,151,74,'#a66d51',sites[1]);g.sign(sites[3],x3,y3-53,red);g.sign(sites[0],x0,y0-61,green);
 }else if(kind==='warehouse'||kind==='shelf'||kind==='works'){
  for(let j=0;j<4;j++)rack(g,120+j*110,161,81,j);
  if(kind==='warehouse'){for(let j=0;j<4;j++){g.box(663+j*86,93,69,55,'#8e9a8d');for(let h=0;h<6;h++)g.box(665+j*86,98+h*7,65,2,'#b7c0ae');}car(g,x0+28,y0-24,1,green);}
  else if(kind==='works'){for(let j=0;j<4;j++){g.box(580+j*31,288,23,37,'#718d87');g.dot(589+j*31,294,5,'#c9b981');}g.line([[545,325],[706,325]],'#657a74',10);}
  else {rack(g,x2-54,y2-23,110,1);rack(g,x3-55,y3-23,110,3);}
  kiosk(g,x1,y1-17,143,67,'#657e70',sites[1]);[0,2,3].forEach(j=>g.sign(sites[j],ps[j][0],ps[j][1]-65,j===3?orange:green));
 }else if(kind==='queue'||kind==='ticket'){
  for(let j=0;j<5;j++){g.box(120+j*58,211,45,15,'#809790');g.box(120+j*58,228,4,8,ink);}
  if(kind==='ticket')for(let j=0;j<5;j++){g.box(x2+29*j-62,y2-53,9,34,'#7d9690');g.box(x2+29*j-60,y2-52,6,6,green);}
  kiosk(g,x1,y1-19,144,72,'#517b77',sites[1]);kiosk(g,x2,y2-15,160,62,'#6a897b',sites[2]);g.sign(sites[0],x0,y0-64);g.sign(sites[3],x3,y3-53,orange);
 }else if(kind==='energy'){
  for(let j=0;j<3;j++){const x=164+j*293;g.line([[x-33,300],[x,157],[x+32,300]],'#667971',6);g.line([[x-43,189],[x+43,189]],'#667971',5);g.line([[x-37,190],[x+142,219],[x+254,190]],'#788984',2);}
  ps.forEach(([x,y],j)=>{kiosk(g,x,y-17,143,48,j===3?orange:green,sites[j]);});
 }else if(kind==='analysis'||kind==='media'||kind==='finance'){
  for(let j=0;j<6;j++)screen(g,53+j*166,124,97,45,'#99c79b');
  ps.forEach(([x,y],j)=>{g.box(x-55,y-22,110,24,'#9d997e');screen(g,x-35,y-61,71,39,j===3?'#c89988':'#94c8ab');g.sign(sites[j],x,y-84,j===3?orange:green);});
 }
}
function pathFor(cfg,row){
 const ps=cfg.points||places.shop,[a,b]=ps,goal=ps[row[4]?3:2];
 return {arrival:[a,[a[0]+125,a[1]],[b[0]-102,b[1]+17],b],delivery:[b,[b[0]+133,b[1]],[goal[0]-84,goal[1]],goal]};
}
function locate(cfg,row,phase){
 const p=pathFor(cfg,row);return phase<.40?along(p.arrival,phase/.40):phase<.53?p.arrival.at(-1):along(p.delivery,(phase-.53)/.41);
}
function gauge(g,x,y,v,span){
 g.box(x-38,y,76,7,'#b5b9a9');g.box(x-37,y+1,Math.max(0,Math.min(74,Math.abs(v)/span*74)),5,v<0?red:green);
}
function eventFrame(cfg,d,k,f){
 const rows=d.runs[k],i=at(f,rows.length),phase=limit(f*rows.length-i),row=rows[i],settled=phase>=.91;
 const total=settled?row[3]:i?rows[i-1][3]:0;
 return {rows,i,phase,row,settled,total,clock:row[0],metrics:[[cfg.labels[0],phase<.39?'待核对':nfmt(row[1])],[cfg.labels[1],settled?nfmt(row[2]):'待交接'],[cfg.labels[2],nfmt(total)]]};
}
function instrument(cfg,id,canvas,s,d,k,f,view){
 const pulse=cfg.kind==='pulse',q=s.row,z=cfg.kind==='graph';
 const span=118+(f*8)%1*4;
 let pos;
 if(pulse){const r=s.i?s.rows[s.i-1].slice(5):[0,0,1],u=q.slice(5).map((v,j)=>r[j]+(v-r[j])*s.phase);pos=[779+120*u[0]+29*u[1],321-115*u[2]+24*u[1]];}
 else {const from=s.i===0?[190,335]:[670,335],to=s.i===0?[660,335]:[1050,305];pos=lerp(from,to,s.phase);}
 scene(canvas,id,(g)=>{
  hall(g,'analysis');roomDepth(g,'analysis');g.box(55,110,1130,420,'#475755');g.box(70,127,1100,386,'#244146');
  if(pulse){
   kiosk(g,249,353,223,130,'#777f68','双路脉冲发生器');screen(g,395,226,123,78,'#a1c49f');
   g.line([[342,316],[440,346],[605,315]],'#c4a96a',7);g.dot(779,321,137,'#426965');g.dot(779,321,128,'#2a4b50');g.line([[631,321],[929,321]],'#a2bcae',1);g.line([[779,178],[779,463]],'#a2bcae',1);g.sign('第一情景 · 态测量',779,155);
  }else{
   [190,635,1048].forEach((x,j)=>{const y=303,xs=Array.from({length:6},(_,m)=>[x+64*Math.cos(m*Math.PI/3),y+64*Math.sin(m*Math.PI/3)]);for(let a=0;a<6;a++)for(let b=0;b<a;b++)g.line([xs[a],xs[b]],'#83a89b',2);xs.forEach((p,h)=>g.dot(...p,10,cloth[h%5]));g.sign(['左邻区','所选区段','右邻区'][j],x,181);});
  }
 },pos,view,750,g=>{
  if(pulse){g.line([[779,321],pos],'#e6b46b',5);g.dot(...pos,8,'#ffe3a1');for(let j=0;j<=s.i;j++){const a=s.rows[j];g.dot(779+120*a[5]+29*a[6],321-115*a[7]+24*a[6],3,cloth[j%5]);}g.sign('通道一 '+nfmt(q[1]),395,383);}
  else {const active=s.rows.map(r=>r[2]);for(let j=0;j<2;j++)for(let e=0;e<active[j];e++)g.line([[j?694:254,304+e*25],[j?985:570,310+e*25]],j===s.i?'#efc982':'#8ca79c',3);g.sign('区 '+q[1],635,406);g.dot(...pos,9,'#ffd488');}
  g.sign(q[0],pos[0],pos[1]+42,green);g.sign(cfg.labels[2]+' '+nfmt(s.total),900,465);
 });
}
function drawEvent(cfg,id,canvas,s,d,k,f,view){
 if(id==='P0115'){serviceDistrict(id,canvas,s,d,k,f,view);return;}
 if(id==='P0473'){procurement(canvas,s,d,k,f,view);return;}
 if(['pulse','graph'].includes(cfg.kind)){instrument(cfg,id,canvas,s,d,k,f,view);return;}
 const r=s.row,ps=cfg.points,focus=locate(cfg,r,s.phase),scale=Math.max(1e-10,...d.runs.flat().map(a=>Math.abs(a[2]))),maxOut=Math.max(1e-10,...d.runs.flat().map(a=>Math.abs(a[3])));
 scene(canvas,id,g=>{background(g,cfg);setDesign(g,cfg);},focus,view,721,g=>{
  const retail=['shop','ticket','queue','street'].includes(cfg.kind);
  const digital=['energy','media','analysis','finance'].includes(cfg.kind);
  const visible=s.i+(s.settled?1:0);
  [0,1].forEach(lane=>{
   const filtered=s.rows.slice(0,visible).filter(a=>a[4]===lane),pt=ps[2+lane],x=pt[0],y=pt[1];
   filtered.slice(-5).forEach((e,j)=>{const xx=x-49+j*20,yy=y+24;if(retail)person(g,xx,yy,0,cloth[(j+lane)%5],e[2]>0&&cfg.kind==='shop');else if(digital){g.box(xx,yy-6,15,8,lane?orange:green);}else if(e[2]!==0)crate(g,xx,yy-7,14,cloth[j]);});
   if(filtered.length)g.sign(cfg.sites[2+lane]+' · '+filtered.length,x,y+62,lane?orange:green,13);
  });
  const current=pathFor(cfg,r);const col=cloth[s.i%5];
  if(digital){g.line(current.arrival,'#708b86',2,[6,6]);g.line(current.delivery,r[4]?orange:green,2,[6,6]);g.box(focus[0]-13,focus[1]-10,26,15,'#d7bea0');g.line([[focus[0]-10,focus[1]-8],[focus[0],focus[1]-2],[focus[0]+10,focus[1]-8]],'#826c50',2);
   if(cfg.kind==='media'&&s.settled){g.box(focus[0]-32,focus[1]-53,62,16,r[2]>0?'#f1bd70':'#575f55');}
  }else if(retail){agentInk(g,focus[0],focus[1],s.phase*20,col,s.phase>.60&&r[2]>0&&['shop','street'].includes(cfg.kind));
   if(cfg.kind==='street')car(g,focus[0]+27,focus[1]+18,1,blue,'sedan');
   if(s.i+1<s.rows.length&&s.phase>.4)person(g,ps[0][0]+(s.phase-.4)*79,ps[0][1]+8,s.phase*9,cloth[(s.i+1)%5]);
  }else{g.box(focus[0]-18,focus[1]-5,36,6,'#59665c');g.dot(focus[0]-11,focus[1]+2,4,ink);g.dot(focus[0]+12,focus[1]+2,4,ink);if(r[2]!==0||s.phase<.48)crate(g,focus[0]-10,focus[1]-19,20,'#b18756');agentInk(g,focus[0]-24,focus[1],s.phase*23,col);}
  if(digital){const [tx,ty]=ps[1];person(g,tx-31,ty-4,0,'#517574');if(cfg.kind==='finance'&&s.phase>.44&&s.phase<.63){const u=limit((s.phase-.44)/.19);raised(g,tx-32+39*u,ty-18,16,4,4,'#a89064','#806e51','#d9c481');}if(cfg.kind==='analysis'){g.line([[tx-47,ty+6],[tx+26,ty+6]],'#72998b',4);}}
  const x=focus[0],y=focus[1];g.sign(r[0],x,y-51,ink,14);
  if(s.phase>.40){g.sign(cfg.labels[0]+' '+nfmt(r[1]),ps[1][0],ps[1][1]+39,ink,13);gauge(g,x,y+17,r[2],scale);}
  if(s.settled){g.sign(cfg.labels[1]+' '+nfmt(r[2]),x,y+37,r[4]?orange:green,13);}
  siteEquipment(id,g,cfg,s,d,k,focus);
  const [gx,gy]=ps[2];gauge(g,gx,gy+80,s.total,maxOut);
 });
}
function serviceDistrict(id,canvas,s,d,k,f,view){
 const stops=[[290,198],[605,313],[899,209]],dest=[[553,354],[964,449],[1100,335]],j=s.i,a=stops[j],b=dest[j],u=s.phase;
 const base=[178+90*j,445],trip=[a,[a[0]+90,a[1]+28],[b[0]-90,b[1]],b];
 const focus=u<.39?along([base,[base[0]+60,base[1]-43],a],u/.39):along(trip,(u-.43)/.43);
 scene(canvas,id,g=>{
  outdoor(g);road(g,[[0,439],[340,388],[566,432],[968,448],[1260,419]],46);
  stops.forEach(([x,y],i)=>{road(g,[[x-48,439],[x-32,y+45],[x,y],[dest[i][0]-90,dest[i][1]],dest[i]],26);building(g,x-106,y-19,91,56,['北区广场','中央车站','东区商业街'][i]);g.sign('候车 '+(i+1),x,y-55);});
 },focus,view,735,g=>{
  for(let z=0;z<3;z++){const [x,y]=stops[z],amount=s.rows[z][2],residual=Math.max(1,Math.round(([22,27,23][z]-amount)/3));const count=z<j||z===j&&u>.42?residual:Math.round([22,27,23][z]/3);
   for(let a=0;a<count;a++)person(g,x-41+(a%5)*14,y+13+Math.floor(a/5)*17,0,cloth[(a+z)%5]);}
  if(u<.43)person(g,stops[j][0]+7,stops[j][1],u*6,green);
  for(let v=1;v<=Math.floor(s.row[2]/6);v++){const p=along(trip,limit((u-.42)*2.7-v*.11));car(g,p[0]+4,p[1]+13*v,1,cloth[v],'sedan');}
  car(g,...focus,1,green,'sedan');g.sign('区域 '+(s.i+1)+' · '+(u<.39?'前往乘客处':'载客行驶'),focus[0],focus[1]-53);g.sign('预计服务 '+nfmt(s.row[2]),a[0]+33,a[1]+66);
 });
}
function procurement(canvas,s,d,k,f,view){
 const places=[[100,410],[419,289],[783,226],[1067,345]],names=['供货库','供应商报价台','门店收货','补贴结算'],a=places[s.i],b=places[s.i+1],pos=along([a,[a[0]+77,a[1]+17],[b[0]-52,b[1]],b],s.phase);
 scene(canvas,'P0473-revised',g=>{outdoor(g);road(g,[[0,428],places[0],places[1],places[2],places[3],[1250,395]],29);places.forEach(([x,y],j)=>building(g,x-46,y-19,105,62,names[j]));},pos,view,707,g=>{
 if(s.i<2){car(g,...pos,1,green);crate(g,pos[0]-12,pos[1]-24,12,'#c98d50');}else{agentInk(g,...pos,s.phase*21,blue);g.box(pos[0]+5,pos[1]-17,13,9,'#eace90');}
 if(s.i===2||s.i===1&&s.phase>.9)for(let n=0;n<Math.round(d.runs[k][1][1]*5);n++)crate(g,729+15*n,223,13);
 g.sign(s.row[0]+' · '+nfmt(s.row[1]),pos[0],pos[1]-57);if(s.settled&&s.i===2)g.sign('财政支出 '+nfmt(s.total),pos[0],pos[1]+34);
 });
}
function siteEquipment(id,g,cfg,s,d,k,focus){
 const row=s.row,[x,y]=focus,ps=cfg.points,h=s.rows.slice(0,s.i+(s.settled?1:0));
 const shown=h.at(-1),ready=s.phase>.44,qty=shown?.[2]??0;
 if(['P0445','P0487','P0491','P0498','P0486','P0499'].includes(id)){
  const cash=ps[1],end=ps[2];
  if(id==='P0487'){
   const sales=h.reduce((sum,r)=>sum+r[2],0);for(let j=0;j<2;j++)if(j<2-sales)crate(g,cash[0]-37+j*32,cash[1]-30,23);
   g.sign('剩余 '+(2-sales)+' 件 · 债务 1.02539',cash[0],cash[1]-125,orange,13);
   if(sales)g.sign('偿债后权益 '+nfmt(shown[3]),end[0],end[1]-126,green,13);
  }else if(id==='P0486'){
   const sales=h.filter(a=>!a[0].startsWith('时点')).reduce((sum,r)=>sum+r[2],0);
   for(let j=0;j<8;j++){const xx=cash[0]-55+(j%4)*25,yy=cash[1]-46+Math.floor(j/4)*18;if(j<8-sales)crate(g,xx,yy,16);}
   g.dot(cash[0]+98,cash[1]-69,23,'#efe7c8');g.line([[cash[0]+98,cash[1]-69],[cash[0]+98+14*Math.sin((s.i+s.phase)/s.rows.length*Math.PI*1.8),cash[1]-69-14*Math.cos((s.i+s.phase)/s.rows.length*Math.PI*1.8)]],ink,3);
   g.sign('考核点 72 · 销量 '+sales,cash[0],cash[1]-125,ink,13);
  }else if(id==='P0498'){
   g.box(cash[0]+57,cash[1]-63,6,60,ink);g.dot(cash[0]+60,cash[1]-64,11,'#769799');for(let j=0;j<7;j++)g.dot(cash[0]-48+j*16,cash[1]-105,5,j<h.length?(s.rows[j][2]?green:red):'#bbc3ab');
  }else if(id==='P0499'){
   g.box(cash[0]-71,cash[1]-114,141,38,'#3f5b59');g.text('参考价 '+nfmt(s.i?s.rows[s.i-1][1]:0),cash[0],cash[1]-95,15,'#fff0cb');if(ready)g.sign('挂牌 '+nfmt(row[1]),x,y-80,green,13);
  }else if(id==='P0491'){
   g.sign('库存 '+(10250-h.reduce((sum,r)=>sum+r[2],0)),cash[0],cash[1]-124,green,13);for(let j=0;j<3;j++)crate(g,end[0]-41+j*25,end[1]-62,20,'#b68d64');
  }else{g.sign('开场报价 '+nfmt(row[1]),cash[0],cash[1]-124,orange,13);if(s.phase>.62&&row[2])crate(g,x+7,y-16,15);}
  return;
 }
 if(id==='P0059'){
  const branch=row[4]&&s.phase>.52;const other=branch?lerp(ps[1],[ps[2][0]-40,ps[2][1]],(s.phase-.52)/.46):[x+20,y-4];person(g,...other,s.phase*22,cloth[(s.i+2)%5]);if(ready)g.sign(branch?'放弃配对':'同类伙伴',other[0]+13,other[1]+42,branch?red:green,12);
 }else if(id==='P0458'){
  const desk=ps[1];screen(g,desk[0]-65,desk[1]-73,117,45,'#8dbe9a');g.sign(ready&&!k&&s.i===0?'探测后 · 子型 '+row[1]:'未探测',desk[0],desk[1]-54,ink,12);
 }else if(['P0095','P0465','P0485'].includes(id)){
  const counter=ps[2];g.box(counter[0]-73,counter[1]-35,152,7,'#7a806b');
  if(id==='P0095'){let offset=0;for(const r of h){if(r[2]){crate(g,counter[0]-68+offset,counter[1]-50,18*r[2],cloth[Math.floor(offset)%5]);offset+=18*r[2];}}}
  if(id==='P0465'){if(qty>0)crate(g,counter[0]-30,counter[1]-58,16+qty*24);if(qty<0)g.sign('累计欠交 '+nfmt(s.total),ps[3][0],ps[3][1]-94,red,13);}
  if(id==='P0485'){for(let j=0;j<6;j++)g.dot(counter[0]-49+20*j,counter[1]-48,4,cloth[j%5]);if(ready)g.sign('订单流率 '+nfmt(row[2]),x,y-80,green,13);}
 }else if(id==='P0099'||id==='P0427'){
  const desk=ps[1];if(id==='P0099'){g.sign(k?'规则一 · 少一项特征':'规则一 · 两项特征',desk[0],desk[1]-127,green,13);if(s.settled)g.sign(row[2]===row[1]?'分类正确':'误分类',x,y-81,row[2]===row[1]?green:red,13);}
  else{for(let j=0;j<2;j++)g.sign('中心 '+(j+1)+' · '+nfmt(d.runs[0].find(r=>r[4]===j)?.[2]??row[2]),ps[2+j][0],ps[2+j][1]-117,blue,13);}
 }else if(id==='P0454'){
  const pt=ps[row[4]?3:2];if(ready){g.box(pt[0]-31,pt[1]-55,62,24,row[2]?orange:'#414948');g.text(row[2]?'w000':'空位',pt[0],pt[1]-43,13,'#fcf2dc');}
 }else if(id==='P0467'||id==='P0468'){
  const pt=ps[row[4]?3:2];const max=Math.max(...d.runs.flat().map(z=>Math.abs(z[2])));
  for(let j=0;j<Math.round(7*Math.abs(row[2])/max);j++)person(g,pt[0]+37+j*10,pt[1]-1,0,cloth[j%5]);
 }else if(id==='P0440'){
  const dock=ps[row[4]?3:2];const size=Math.ceil(row[2]*35);if(s.phase>.40)for(let j=0;j<size;j++)crate(g,x+(j%3)*9-11,y-14-Math.floor(j/3)*7,10,'#b68955');
  if(s.settled)g.sign(row[2]?'批次已入库':'赊购未放行',dock[0],dock[1]-88,row[2]?green:red,13);
 }else if(id==='P0169'){
  const p=ps[row[4]?3:2];g.line([[p[0]-37,p[1]-32],[p[0]+37,p[1]-32]],'#dcb056',4);g.sign(row[4]?'反向交割':'正向交割',x,y-80,row[4]?orange:green,13);
 }
}


function marks(items){return items.map(([label,at])=>({label,at}));}
for(const [id,cfg] of Object.entries(config)){
 labs[id]={batch:'remaining',title:cfg.title,action:cfg.choices.join(' / ')+'。跟随现场查看'+cfg.labels.at(-1)+'的变化。',choices:cfg.choices,scope:cfg.scope+' 场所布局与事件间的行进时间为示意。',
 views:[cfg.kind==='pulse'?'跟随态测量':cfg.kind==='graph'?'跟随边界核查':'跟随当前对象','场所全景'],duration:41,
 chapters:(d,k)=>{const r=d.runs[k],n=r.length;return marks([['首次核对 · '+r[0][0],.4/n],['中段交接 · '+r[Math.floor(n/2)][0],(Math.floor(n/2)+.7)/n],['末次结算 · '+r[n-1][0],1]]);},
 frame:(d,k,f)=>eventFrame(cfg,d,k,f),draw:(canvas,s,d,k,f,view)=>drawEvent(cfg,id,canvas,s,d,k,f,view)};
}


// Existing numeric engines retain their original admissible decisions and live histories.
function upgrade(id,views,chapters,draw){
 const lab=labs[id];Object.assign(lab,{batch:'lab20',views,chapters,draw});
}
function commonStreet(g,name){
 outdoor(g);streetDepth(g,name.includes('双店')?'P0496':'shop');road(g,[[-40,449],[224,423],[431,450],[725,432],[970,491],[1270,450]],50);
 for(let j=0;j<4;j++){building(g,105+j*277,163,115,61,'',['#c9b899','#b7c0a3','#b9bbb4','#c6b7a3'][j]);tree(g,263+j*272,183,1);}
 tree(g,220,510);tree(g,883,535);g.sign(name,182,281,green);
}
upgrade('P0466',['跟随报价顾客','限量店全景'],d=>marks([['首位咨询',d.arrivals[0][0]/d.duration],['柜台中段',d.arrivals[Math.floor(d.arrivals.length/2)][0]/d.duration],['最后一笔结算',1]]),
 (canvas,s,d,k,f,view)=>{
 const j=Math.max(0,s.k-1),next=d.arrivals[j+1]?.[0]??d.duration,start=s.k?d.arrivals[j][0]:0;
 const u=s.k?limit((s.now-start)/(next-start||1)):limit(s.now/d.arrivals[0][0]);const center=[613,323],yes=[1024,262],no=[1020,440];
 const pos=!s.k?along([[116,411],[359,411],center],u):along([center,[743,372],s.latest.ok?yes:no],limit(u/.91));
 scene(canvas,'P0466-revised',g=>{commonStreet(g,'沿街顾客入口');raised(g,741,364,72,13,22,'#b3916b','#85715b','#d5bc93');for(let j=0;j<3;j++)crate(g,751+j*18,325,17);bench(g,377,363);workstation(g,476,282,'money');kiosk(g,613,302,199,94,'#936e53','限量商品柜台');rack(g,536,251,139,2);building(g,950,246,140,78,'提货处');g.sign('空手离店通道',1020,390,red);},pos,view,710,g=>{
 for(let a=0;a<d.stock;a++){const x=535+(a%4)*32,y=261+Math.floor(a/4)*20;if(a<s.left)crate(g,x,y,17);else g.line([[x,y+10],[x+16,y+10]],'#807e6c',2);}
 const label=s.k?'顾客 '+s.k:'首位顾客';agentInk(g,...pos,u*14,cloth[j%5],s.latest?.ok&&u>.14);g.sign(label,pos[0],pos[1]-61);if(s.latest)g.sign(s.latest.ok?'已成交，去提货':'未成交，离店',pos[0],pos[1]+23,s.latest.ok?green:red);
 if(s.k<d.arrivals.length&&s.k){const nx=along([[116,411],[359,411],center],u);person(g,...nx,u*18,cloth[(j+1)%5]);}
 g.sign('库存 '+s.left,614,191);g.sign(s.latest?.price!=null?'当前价 '+nfmt(s.latest.price):'等候询价',608,374);
 });
});
upgrade('P0469',['跟随选货顾客','店内全景'],d=>marks([['第一位进店',0],['中段顾客选货',.503],['末位顾客结账',1]]),
 (canvas,s,d,k,f,view)=>{
 const shelves=[[458,220],[637,257],[802,201]],entrance=[99,392],exit=[1060,425],counter=[943,289];
 const chosen=s.pick>=0,shelf=chosen?shelves[s.r.ids.indexOf(s.pick)]:[611,320];
 const u=s.phase,route=chosen?[entrance,[299,368],shelf,counter,exit]:[entrance,[315,370],shelf,[751,405],exit];
 const pos=chosen?(u<.48?along(route.slice(0,3),u/.48):u<.76?along(route.slice(2,4),(u-.48)/.28):along(route.slice(3),(u-.76)/.24)):along(route,u);
 scene(canvas,'P0469-revised',g=>{hall(g,'shelf');roomDepth(g,'shelf');marketStall(g,276,271,108,'#9d7254');bench(g,337,399);plant(g,568,367);workstation(g,813,452,'money');g.sign('店门',99,319);kiosk(g,945,268,127,64,green,'收银台');g.sign('街道出口',1058,352,orange);g.box(218,464,633,20,'#afa68a');},pos,view,690,g=>{
 s.r.ids.forEach((item,h)=>{const [x,y]=shelves[h],c=cloth[item%5];g.box(x-57,y-62,114,51,'#c9bb9f');for(let j=0;j<4;j++)crate(g,x-46+j*22,y-45,17,c);g.sign('商品 '+(item+1),x,y-78);if(s.pick===item&&u>.42)g.line([[x-55,y+4],[x+56,y+4]],'#c38d3f',4);});
 agentInk(g,...pos,u*22,cloth[s.i%5],chosen&&u>.52);g.sign('顾客 '+(s.i+1),pos[0],pos[1]-60);
 if(s.i+1<d.runs[0].picks.length&&u>.44)person(g,99+81*(u-.44),397,u*14,cloth[(s.i+1)%5]);
 if(u>.78)g.sign(chosen?'带走商品 '+(s.pick+1):'未购离店',pos[0],pos[1]+20,chosen?green:orange);
 });
});
upgrade('P0496',['跟随比价买家','双店街区'],d=>marks([['两店开价',0],['首单交付',.405],['次期报价',.59],['第二位离开',1]]),
 (canvas,s,d,k,f,view)=>{
 const a=[390,296],b=[852,234],spot=s.seller?b:a,entry=s.period?[1110,427]:[131,411],exit=s.period?[222,482]:[1062,482],route=[entry,[612,394],spot,exit];
 const pos=s.phase<.77?along(route.slice(0,3),s.phase/.77):along(route.slice(2),(s.phase-.77)/.23);
 scene(canvas,'P0496-revised',g=>{commonStreet(g,'双店商业街');g.poly([[449,327],[535,285],[730,308],[809,384],[669,413],[491,389]],'#c7b798');bench(g,568,358);bike(g,655,374);lamp(g,733,366);marketStall(g,530,287,67,'#a17a50');kiosk(g,...[a[0],a[1]-16],155,77,green,'甲店');kiosk(g,b[0],b[1]-16,158,72,red,'乙店');g.sign('公交站',1060,422);},pos,view,728,g=>{
 [a,b].forEach(([x,y],j)=>{if(s.stocks[j])crate(g,x-13,y-58,28);else g.sign('售罄',x,y-48,red);g.sign(!s.period?'报价 '+nfmt(j?d.opponent:s.r.quote):j===s.first?'第一单已售':'次期 '+nfmt(s.px),x,y+28);});
 agentInk(g,...pos,s.phase*24,cloth[s.period],s.phase>.77&&s.px<=1);g.sign('买家 '+(s.period+1),pos[0],pos[1]-47);if(s.phase>.77)g.sign(s.px<=1?'提货离开':'空手离开',pos[0],pos[1]+24);
 });
});
upgrade('P0432',['跟随核查员','保障区域'],d=>marks([['核查首个组件',0],['原组合的覆盖缺口',2/d.scenarios.length+.02],['最后一次联合核查',1]]),
 (canvas,s,d,k,f,view)=>{
 const depot=[135,395],sites=[[680,225],[997,339]],j=at(s.p,s.parts.length),u=limit(s.p*s.parts.length-j),a=s.parts[j],loc=sites[j],from=j?sites[j-1]:depot;
 const pos=along([from,[from[0]+87,from[1]+14],[loc[0]-100,loc[1]+64],loc],limit(u/.70));
 scene(canvas,'P0432-revised',g=>{commonStreet(g,'保障中心');for(let l=0;l<sites.length;l++){const b=sites[l],a=l?sites[l-1]:depot;road(g,[a,[a[0]+87,a[1]+14],[b[0]-100,b[1]+64],b],25);raised(g,b[0]+71,b[1]-5,49,9,35,'#939e94','#687e76','#b8beb0');g.line([[b[0]+91,b[1]-34],[b[0]+91,b[1]-106]],'#68736a',3);g.dot(b[0]+91,b[1]-106,5,'#c4ab66');}building(g,83,373,115,74,'调度库');sites.forEach(([x,y],l)=>building(g,x-48,y-14,104,64,l?'下游组件站':'第一组件站'));},pos,view,703,g=>{
 s.parts.forEach((pt,l)=>{const [x,y]=sites[l],covered=pt[k+1];g.dot(x+29,y-42,8,covered?'#79a876':red);g.sign('组件 '+pt[0],x,y+35);if(l<j||l===j&&u>.69)g.sign(covered?'已核实保障':'未获得保障',x,y-95,covered?green:red);});
 car(g,pos[0]-13,pos[1]+6,1,blue);person(g,pos[0]+18,pos[1],u*16,cloth[s.i%5]);g.sign('核查员 · '+s.sid,pos[0],pos[1]-48);if(u>.70&&!a[k+1])g.sign('在组件 '+a[0]+' 记录缺口',pos[0],pos[1]+61,red);
 });
});
upgrade('P0049',['跟随本层量子门','芯片全景'],d=>marks([['输入映射',0],['第九层换位',8/d.layers.length],['中段门耦合',.51],['输出映射',1]]),
 (canvas,s,d,k,f,view)=>{
 const now=s.row[0],gates=d.layers[s.i],first=gates[0]||[0,0],loc=q=>[185+212*q,315],blend=limit(s.p/.37);
 const nodes=now.map((q,j)=>lerp(loc(s.previous[j]),loc(q),blend));const [a,b]=first,pos=s.p<.40?nodes[a]:lerp(nodes[a],nodes[b],(s.p-.40)/.49);
 scene(canvas,'P0049-revised',g=>{g.box(0,0,1240,610,'#253a40');g.box(67,99,1110,398,'#385653');g.box(77,109,1090,377,'#1d363f');
 for(let ix=0;ix<15;ix++){const xx=98+ix*72;for(let n=0;n<3;n++){const yy=133+n*27;g.line([[xx,yy],[xx+19,yy],[xx+29,yy+12],[xx+32,yy+12]],'#45696b',2);g.dot(xx+32,yy+12,3,'#aa9167');}if(ix%2===1){raised(g,xx,419,47,6,21,'#3e5253','#263c40','#6e7f77');for(let n=0;n<4;n++)g.box(xx+3+n*10,419,4,6,'#bfad80');}}
 for(let j=0;j<5;j++){const [x,y]=loc(j);g.line([[x-50,119],[x-50,183],[x,224],[x,y]],'#678780',6);g.line([[x,y],[x,402],[x+46,429],[x+46,474]],'#678780',5);if(j<4)g.line([[x+20,y],[x+190,y]],'#a08a57',10);g.box(x-24,y-25,49,50,'#a08964');g.box(x-16,y-18,33,35,'#34535a');g.sign('Q'+j,x,y+58);}
 },pos,view,707,g=>{
 gates.forEach(([v,w],j)=>{const start=nodes[v],end=nodes[w],u=limit((s.p-.38)/.50);if(u>0){g.line([start,end],j?'#bfa4d1':'#8ac4b0',4);g.dot(...lerp(start,end,u),9,'#f1d188');}});
 nodes.forEach(([x,y],j)=>{g.dot(x,y-8,16,cloth[j]);g.text(String.fromCharCode(d.labelCodes[j]),x,y-8,15,'#fff');});
 now.forEach(q=>{if(s.row[3][q]>0&&s.p>.40){const [x,y]=loc(q);g.c.beginPath();g.c.arc(x,y,31,0,2*Math.PI);g.c.strokeStyle='#d59468';g.c.lineWidth=4;g.c.stroke();}});
 g.sign('第 '+(s.i+1)+' 层 · '+(gates.length?'门 '+gates.map(([v,w])=>String.fromCharCode(d.labelCodes[v])+'→'+String.fromCharCode(d.labelCodes[w])).join(' / '):'无双位门'),pos[0],pos[1]-75);
 });
});
labs.P0469.duration=238;labs.P0466.duration=66;
})();
