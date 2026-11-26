/* Instance-driven goods, reserve and service handoffs. The archival states are immutable:
   only the paint layer interpolates a vehicle along the selected pair of stations. */
(() => {
'use strict';
const {scene,building,person,car,crate,road,tree,along,lerp}=window.ORTOPIA_PAINT;
const labs=window.ORTOPIA_LABS;
const clamp=x=>Math.min(1,Math.max(0,x));
const smooth=x=>clamp(x)**2*(3-2*clamp(x));
const fmt=n=>Number(n).toLocaleString('en-US',{maximumFractionDigits:4});
const ink='#204447',teal='#318b7f',amber='#cb8c47',rust='#aa594e';
const descriptions={
 "P0004": [
  "Crowdsourced riders and third-party trucks divided into single units",
  "Third party orders",
  [
   "Crowdsourcing accounts for 80% of archives",
   "Crowdsourcing accounts for 60%"
  ],
  "Distribution ratio based on conversion per 100 orders. Keep the total order quantity and wages unchanged; the trial calculation of shares does not recalculate the queuing time."
 ],
 "P0007": [
  "The entire shipment can only pass through one hub",
  "Cargo ticket k0",
  [
   "via h1",
   "Change warp h0"
  ],
  "If the same ticket is reassigned between two enabled lines, the cargo volume will not be split. Displays two sections of unit freight and cargo volume; other cargo tickets are fixed, and rescheduling does not mean that it is feasible for the entire network."
 ],
 "P0011": [
  "Should I pick up item No. 1 first or go to delivery port No. 39?",
  "Car pickup and delivery",
  [
   "Press archive to pick up first",
   "Arrive first at the delivery port"
  ],
  "Reproduce the first pair of pick-up and send nodes. When changing the order, the first delivery was blocked and subsequent sections were not executed."
 ],
 "P0028": [
  "CityA rail line frequency and available capacity",
  "Railway train",
  [
   "10 shifts per cycle",
   "Withdraw the next class"
  ],
  "Multiply the arc unit shift capacity by the frequency to fix the single shift capacity; the supply upper limit is presented, which is not equal to the actual loading capacity."
 ],
 "P0030": [
  "How much inter-period inventory is left for the first period of delivery?",
  "Node 1 turnover goods",
  [
   "Keep archived balances",
   "Withdraw half of balance"
  ],
  "The end of the first period of the first demand scenario node 1. Partial call-out is performed after the demand is met, and the amount that can be carried forward is displayed without calculating the optimal cost for the second period."
 ],
 "P0036": [
  "The purchase order and arrival of the first SKU on the shelves",
  "SKU 0",
  [
   "Place archived purchase order",
   "Purchase volume halved"
  ],
  "Select the first item of the joint purchasing vector. The remaining 609 SKUs were kept at the original order quantity, and the purchased quantities were compared using the same batch of deliveries."
 ],
 "P0041": [
  "What should I take back after delivery to the same address?",
  "Address 1 return shipment",
  [
   "Delivery and recycling",
   "Only deliver goods"
  ],
  "Following the 1→31 aerial clip of the archived crew, pickup volume comes from customer 1. Skipping the pickup will miss the return trip."
 ],
 "P0048": [
  "Delivery truck enters G2 customer cluster",
  "G2 area delivery vehicle",
  [
   "House-to-house delivery by cluster",
   "Bypass intermediary customers"
  ],
  "The instance coordinates of G2_1 and G2_2 coincide, and the view shows the two delivery doors at the same address side by side. G2 internal paths and household requirements come from archives. If the comparison skips the middle household, the needs of this household are not met."
 ],
 "P0051": [
  "How many batches of trucks will be received at the loading port?",
  "Trains in batches",
  [
   "Take over the car’s filing share",
   "Leave half for the car behind you"
  ],
  "Select a vehicle in the first serviced route type and read the node service volume. Other vehicles will not be re-delivered; the unpicked portion will be reserved for subsequent vehicles."
 ],
 "P0063": [
  "How much more do you have to pay when the supply of goods enters the hub from across regions?",
  "Source 2",
  [
   "Enter the regional hub",
   "Change to inter-regional hub"
  ],
  "The price is calculated based on the periodic access fee and cross-region surcharge of the source of supply; other service traffic will not be reallocated."
 ],
 "P0067": [
  "When can the driver return to the warehouse after delivering goods to two households?",
  "First departure route",
  [
   "Send C4 first",
   "Send C3 first"
  ],
  "Comparing the arrival time of the first station separately, both stations serve. The instance time matrix is ​​symmetrical, and the total closed-loop driving time of the two sequences is the same."
 ],
 "P0072": [
  "Can the whole thing be transferred to the drone after the truck arrives at the station?",
  "Customer 78 Whole piece",
  [
   "Direct truck delivery",
   "Give the whole thing to the drone"
  ],
  "Reproduce the first destination of truck 0. Single piece requirement 2, drone load limit 0.125. Keep the entire ticket and the original customer's qualifications, and be blocked at the loading ramp during redispatch."
 ],
 "P0084": [
  "Add one more vote before departure for risky routes",
  "Line 1",
  [
   "Loading according to archive",
   "Merge into last vote from line 2"
  ],
  "Only the additional loading between the two archived routes is deduced to check the outgoing vehicle capacity without replacing the risk target with local overloading."
 ],
 "P0085": [
  "From which station does the drone travel to and from the same delivery point?",
  "Shipment No. 1",
  [
   "Release from station 0",
   "Fly from station 2 instead"
  ],
  "Both places are actual stopping points for the fleet. The flight distance of the drone is calculated based on the straight-line distance to and from the origin, and the remaining tasks are not rearranged."
 ],
 "P0163": [
  "Truck18 Do you need to recharge the battery after unloading?",
  "Truck18",
  [
   "Insert the gun for a period of time",
   "Skip recharge"
  ],
  "Use the archived energy from the third and final empty runs of Truck18. Control performing a battery check before returning to warehouse."
 ],
 "P0164": [
  "At which station will the package bound for B1 be extended?",
  "H→B1 flight",
  [
   "Enable R1 trunk",
   "Turn off R1 trunk"
  ],
  "Read the length of the two connected segments, and keep other selected edges unchanged after closing R1. Check whether both ends are connected before taking off."
 ],
 "P0184": [
  "A warehouse sends market batches to customers",
  "Warehouse passenger and cargo flow 0→0",
  [
   "Ship in bulk according to registration",
   "Give priority to keeping half in the warehouse"
  ],
  "Select archive warehouse passenger flow S_wc[0,0,0,2,1].Prices, production capacity and other cargo flows are fixed, and partial allocations may disrupt demand balance."
 ],
 "P0189": [
  "Is the first piece released from the truck on time?",
  "Drone D·C0 pieces",
  [
   "Take off on time",
   "Release one time unit later"
  ],
  "The flight segment o→C0→R0 is selected, and the customer time limit and flight time are taken from the original instance. Only the first delivery is compared, subsequent waits are not recalculated."
 ],
 "P0191": [
  "Release, service and recycling in the same receiving area",
  "Customer 6’s work machine",
  [
   "Release by archive",
   "Delay release by 0.05 hours"
  ],
  "Dock 17, consignee 6, and dock 25 are all mapped to physical address 6. The screen separates the working locations in the park, and the distance is not counted as the distance. Displays the return time of archived air jobs, and partially delays the fixed job duration."
 ],
 "P0193": [
  "The shared bus on the Circle Line is full, who will take the last order by sending a private car?",
  "Special car order 2118",
  [
   "Send archive car",
   "Cancel the dedicated car and retain the original shared allocation"
  ],
  "Select the only car order 2118. The withdrawal trial fixes all shared routes and does not temporarily rearrange them. Private car fixed fee 3."
 ],
 "P0199": [
  "The first section of freight channel after interruption",
  "Manifest 49",
  [
   "Keep archived first segment capacity",
   "Suspend this transportation"
  ],
  "The first outage scenario selects a manifest with a complete shipment. The outage trial freezes other vehicles and rerouting decisions and displays the first connection difference."
 ],
 "P0279": [
  "Can the goods be handed over at designated stops when taking the bus?",
  "Waybill No. k1",
  [
   "Delivery by filing at outbound site",
   "Do not enable outbound loading and unloading"
  ],
  "The original route and the cargo volume are fixed, and only the cargo handover function at the last station is disabled."
 ],
 "P0331": [
  "After the cabinet door is opened, does the delivery person pick up the package?",
  "D0 package",
  [
   "Let K0 take the order",
   "Cancel this drop-in delivery"
  ],
  "Fixed supply lines and other services. Only follow this customer and archive drop-in couriers."
 ],
 "P0363": [
  "The amount of electricity used to drive from the garage to the first home at night",
  "Delivery truck 1",
  [
   "According to archived out-of-storage power",
   "One less unit of electricity is replenished at night"
  ],
  "Select the first two segments of vehicle 1. The driving power consumption is taken from the original model f; the power at the station is compared with the archived power on the same line, and subsequent power purchase costs are not recalculated."
 ],
 "P0414": [
  "One direct service slot at facility 0",
  "Customer 0",
  [
   "Retain on-site service capabilities",
   "Closed facilities 0"
  ],
  "This facility has a capacity of 1 and the archives serve customers 0 directly from it. Keep other service assignments unchanged."
 ],
 "P0415": [
  "The car arrived first, but the pickup window hasn’t opened yet.",
  "Schedule pickup 2170",
  [
   "Wait until the appointment window opens",
   "Try to pick up your package upon arrival"
  ],
  "Arrival time of first pickup route 4.8139, service start 58. Controls are paused on the first violation of the time window."
 ],
 "P0433": [
  "How many customers can a route cover?",
  "Route r0",
  [
   "enable r0",
   "Remove r0"
  ],
  "The members of selected column r0 are delivered in the order in which they are stored, and the order is indicative. Other columns are fixed; exactly one override causes the group to lose service after the column is removed."
 ],
 "P0443": [
  "How many seats will be lost if the round-the-world ferry operates one less flight?",
  "circumnavigation fleet",
  [
   "Maintain 28 classes per week",
   "Reduce one class"
  ],
  "Only the supply of a single flight segment is evaluated based on the capacity of each voyage and the weekly flight, and the demand and freight rates remain unchanged; cargo owners who change the frequency are not re-evaluated."
 ],
 "P0444": [
  "Should empty trucks be kept at this site or transferred to another site?",
  "0 Type 0 Empty Cars",
  [
   "Leave the car on site",
   "Reduce empty driving to 1 field"
  ],
  "Vehicle 0 is extracted in the initial out-of-stock scenario. In-situ dispatch does not result in cross-field travel; the comparison only counts the newly adjusted segments and does not recalculate future income."
 ],
 "P0456": [
  "Supplier production lines reserved according to contract capacity",
  "Retailer Reserved Lot",
  [
   "Use contract capacity Q",
   "Use model lower bound Q_l instead"
  ],
  "Calculate the nominal payment based on the archived wholesale price multiplied by the capacity, keeping the share rate unchanged. Payments do not include profit sharing or worst-case scenario benefits."
 ],
 "P0457": [
  "Opening inventory has reached the order level",
  "First period inventory",
  [
   "Maintain archive water level",
   "Make up one extra unit"
  ],
  "There is no need to replenish the original solution for the first issue. Using the instance mean as the common demand path, we compare the ending balances of the two water levels without considering this path as the worst case scenario."
 ],
 "P0459": [
  "The car received two requests at point 1",
  "Requests 2 and 6",
  [
   "Accepts both 2 and 6",
   "Only accepting requests 2"
  ],
  "To reproduce the same observed state in the strategy table, the destination is always 1; compare the value of the existing actions in this state."
 ],
 "P0460": [
  "Doomsday LTL sharing and outsourcing options",
  "Doomsday inventory inventory",
  [
   "Taking the Archive Doomsday Route",
   "The ticket is outsourced"
  ],
  "Doomsday single ticket inventory status takes bitmask 2. According to the archived doomsday action table playback, the self-owned route and the outsourced clear the same ticket, and only the handover method is counted."
 ],
 "P0462": [
  "Single-family demand that still cannot fit in the entire vehicle",
  "Delivery van for customer 13",
  [
   "Fill up the car",
   "Only half filled"
  ],
  "Use the archived first single customer route and the first discrete requirement to fix this requirement. Only compare the satisfaction of this household this time."
 ],
 "P0463": [
  "Goods from the distribution center must be transferred to the satellite station",
  "t0003 customer parts",
  [
   "Connect to secondary distribution",
   "Terminate the second journey at the satellite station"
  ],
  "Only the one-way side costs from the center to the satellite station and from the satellite station to the selected customer are accumulated; the return trip and other trees are not included."
 ],
 "P0470": [
  "The last household switched to traveling by drone",
  "Customer 1's package",
  [
   "Delivered by truck along the original route",
   "Flying from the garage to serve customers 1"
  ],
  "Select the only customer 1 that allows drone service and compare the direct flight distance to and from the garage. Screen representation of truck paths omitting intermediate points; joint waiting and scene penalties are not recalculated."
 ],
 "P0471": [
  "Which order should be stocked when faced with the same high demand?",
  "High demand first market sample",
  [
   "Stocking according to high-type contracts",
   "Change to low-type contract stocking"
  ],
  "The first discrete demand of the H-type is fixed, and the smaller one between the demand and the stocking quantity is the actual sales. The trial balance was not reinterpreted as a new incentive-compatible contract."
 ],
 "P0474": [
  "The sales agent made an effort to make a choice after seeing the last quotation.",
  "Final sales agent",
  [
   "Use final commission",
   "Switch to zero commission"
  ],
  "Take the midpoint of the upper and lower commission limits of the last reporting interval and compare the commission corresponding to each unit of sales under the same report. The staff walking behavior settlement indicates that the entire menu rental is not recalculated."
 ],
 "P0475": [
  "The first retail store checks the wholesale order with the manufacturer",
  "Store 0 orders",
  [
   "Use archived order quantity",
   "Only order half"
  ],
  "Decode and archive the integer numerator and shared denominator to settle a single purchase at the original wholesale price. Calculate and fix other merchants' orders and factory quotations."
 ],
 "P0483": [
  "Which car will pick up this order now?",
  "Current transfer request",
  [
   "Send archived vehicle 2",
   "Reassign vehicle 1"
  ],
  "The expected values of both first-step assignments are derived from the calculation of subsequent OD branches from the original solution. Neighborhood locations are laid out on the instance's one-dimensional scale."
 ],
 "P0484": [
  "New pickup request sandwiched before original task",
  "root node vehicle",
  [
   "Send vehicles by archive 1",
   "Reassign vehicle 2"
  ],
  "Use the original root to request the pick-up and delivery insertion positions 1 and 2, pick up the passengers at the midpoint and send them to hub 0, and then execute the existing tasks of the vehicle. The vehicles' respective pick-up and delivery hubs come from instances. Compare the actual mileage of selected vehicles."
 ],
 "P0490": [
  "If you order one more item in the first issue, which issue can be used?",
  "First replenishment in transit",
  [
   "According to the archived first issue, no booking is required",
   "Order an extra piece for the first installment"
  ],
  "Select the common two-period demands 0, 1, and lead time one in the original distribution support. The comparison changes only the first in-transit order; the result is the satisfaction of that path."
 ],
 "P0492": [
  "Which car is sent to the zero inventory customer for replenishment?",
  "Car 1 · Customer 1",
  [
   "Perform archive replenishment",
   "Cancel this direct trip"
  ],
  "Decode the vehicle access bit and corresponding delivery quantity from the zero state. Keep the remaining customers and vehicles unchanged."
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
  if(id==='P0004'){car(g,sx+74,sy-32,1,'#7c9890','car');g.sign("Crowdsourcing "+fmt(reserved)+'%',sx+73,sy-68,'#617e67',11);}
  if(count)for(let a=0;a<count;a++)crate(g,sx-62+a%3*13,sy+4-Math.floor(a/3)*9,11,'#c69867');
 }
 if(id==='P0084'||id==='P0072'){const [x,y]=pts[1];g.box(x+46,y-48,49,18,st[1]==='hold'?rust:'#497b64');g.text(st[1]==='hold'?"Load limited":"Load check",x+70,y-39,10,'#fff5dc');}
 if(id==='P0163'||id==='P0363'){
  if(n>0){const q=st[3],cap=Math.max(...d.runs[0].map(v=>v[3])),wid=50;g.box(x-27,y+42,wid+4,9,'#547266');g.box(x-25,y+44,wid*clamp(q/cap),5,q<cap*.2?rust:'#b9d488');}
 }
 if(id==='P0415'&&j===1){g.box(x+49,y-43,58,20,st[1]==='hold'?rust:'#75836b');g.text(st[1]==='hold'?"The window is not open":"Schedule pickup",x+78,y-33,10,'#fff4d6');}
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
 if(/charg(?:e|er|ing)|plug/i.test(n))return 'charge';
 if(/parcel locker|locker station|locker area|locker bank/i.test(n))return 'locker';
 if(/relay|handoff|hand.?over|take.?off|loading pad|stopover|stop/i.test(n))return 'air';
 if(/weigh|scale|capacity check/i.test(n))return 'scale';
 if(/\b(?:port|terminal|dock|berth|loading bay)s?\b/i.test(n)&&d.freight==='port')return 'quay';
 if(/marshalling|marshaling|arrival track|rail/i.test(n))return 'rail';
 if(d.freight==='bus'&&j)return 'bus';
 if(/rack|shelf|shelves|retail warehouse|storage|receiving|workstation|departure lane|loading (?:bay|door|gate)/i.test(n))return 'shelf';
 if(/procure|purchas|reporting desk|quot(?:e|ation)|booking|order pool|application desk|order desk/i.test(n))return 'office';
 if(/customer|user|address|G\d|^v\d|delivery point|receiving point|door/i.test(n))return 'house';
 if(/hub|transfer|connection|freight station|depot|garage|yard|warehouse|dispatch|waiting/i.test(n))return 'depot';
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
 const sharedYard=d.actor==="Customer 6’s work machine";
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
 if(sharedYard){g.box(50,129,1140,380,'#bec3ae');g.line([[49,126],[1193,126],[1193,510],[50,510],[49,126]],'#89988b',4);for(let n=0;n<8;n++){g.box(95+n*140,135,98,27,'#d7d5ba');}g.sign("Receiving Park·Physical Address 6",620,91,ink,16);}
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
 return {run,i,j,phase,pct,active,row,clock:"On site "+(1+(landed?j:i))+' / '+run.length,
  metrics:[[d.measure[0],fmt(row[3])+(d.measure[1]?' '+d.measure[1]:'')],["follow object",d.actor],["current events",row[2]]]};
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
 labs[id]={batch:'remaining',title,action:"follow"+actor+", compare \""+choices[0]+"\"and\""+choices[1]+"\"On-site results.",choices,scope:note+" The appearance of the facility, handover actions and screen playback duration are for reference only.",views:["follow"+actor,"Panorama of the scene"],duration:35,
  chapters:(d,k)=>d.runs[k].map((r,i,run)=>({at:i/(run.length-1),label:r[2]})),
  frame,draw:(canvas,state,data,k,f,view)=>draw(canvas,state,data,k,f,view,id)};
}


// The five earlier labs retain their original evaluators and all of their decision controls.
function milestones(items){return ()=>items.map(([label,at])=>({label,at}));}
function upgrade(id,view,chapters,draw,extraFrame){
 const old=labs[id],base=old.frame;
 labs[id]={...old,batch:'lab20',views:[view,"Panorama of the scene"],chapters,duration:old.duration||48,
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
upgrade('P0029',"Follow the same shipment",milestones([["First round of boxing",.008],["Next size reveal",.2],["Final round i28 binning",.805],["Final sealing",.982]]),(cv,s,d,k,f,view)=>{
 const a=Math.min(7,s.loaded),b=d.plans[k][a],dest=[[793,237],[982,448]][b],store=[121,407],scan=[455,362],u=s.loaded===8?1:s.cursor-a;
 const path=[store,[277,407],scan,[564,358],[688,dest[1]],dest],p=along(path,u);
 scene(cv,'freight-old-bin',g=>{floor(g);for(let x=57;x<633;x+=19){g.box(x,402,13,9,'#85968a');}g.line([[54,415],[283,415],[448,370],[616,370]],'#6c827a',11);
  building(g,55,334,151,103,"Incoming goods receiving desk");g.box(431,289,8,82,ink);g.box(432,289,58,8,ink);g.sign("size scan",460,275);
  [[793,237],[982,448]].forEach(([x,y],b)=>{g.box(x-66,y+8,133,10,'#9a7959');g.line([[x-66,y-107],[x-66,y+6],[x+66,y+6],[x+66,y-107]],'#6e8680',4);g.sign("Packing station b"+b,x,y+42);});
 },[p[0],p[1]-18],view,640,g=>{
  const h=[0,0],sz=2.7;
  d.plans[k].slice(0,s.loaded).forEach((bin,j)=>{const xy=[[793,237],[982,448]][bin],th=d.dimensions[s.step][j]*sz;h[bin]+=th;pallet(g,xy[0]-56,xy[1]+5-h[bin],110,th,d.items[j],bin?'#d5ab71':'#9ab7a1');});
  [[793,237],[982,448]].forEach(([x,y],b)=>{const yy=y+5-d.capacity[b]*sz;g.line([[x-71,yy],[x+72,yy]],rust,2,[6,5]);if(h[b]>d.capacity[b]*sz)g.sign("Exceed container capacity",x,y-125,rust);});
  if(s.loaded<8){const m=u<.45?'fork':'fork';vehicle(g,m,p[0],p[1],1,u,1,teal);g.sign(d.items[a]+' → '+d.bins[b],p[0],p[1]-52,ink);}
  else g.sign("Sealing · "+d.bins[b],p[0],p[1]-155,teal);
 });
});
const rackPath=Array.from({length:47},(_,i)=>{const n=i-1;if(n<0)return [56,184];if(n===45)return[1187,458];const r=Math.floor(n/15),c=n%15;return [94+(r%2?14-c:c)*73,184+r*135];});
function rackPos(v){const z=Math.max(0,Math.min(46,v+1)),i=Math.floor(z);return lerp(rackPath[i],rackPath[Math.min(i+1,46)],z-i);}
upgrade('P0174',"Follow the current handover",milestones([["First flight departs",0],["Human-machine proximity",.19],["Mid-section handover",.48],["The last shelf is shipped out of the warehouse",.96]]),(cv,s,d,k,f,view)=>{
 const actors=s.actors.map(a=>rackPos(a.x)),target=s.done.length===d.plans[k].jobs.length?actors[d.plans[k].finish.indexOf(Math.max(...d.plans[k].finish))]:actors[2];
 scene(cv,'freight-old-pick',g=>{floor(g);g.line(rackPath,'#9fac95',16);g.line(rackPath,'#e1dcaf',2,[9,12]);
  for(let j=0;j<d.n;j++){const [x,y]=rackPos(j);g.box(x-23,y-57,46,32,'#617c72');for(let z=0;z<3;z++)crate(g,x-18+z*12,y-51,10);g.text('S'+j,x,y-68,11);}
  g.sign("Picking entrance",56,122);g.sign("Robot out of warehouse",1155,509);
 },target,view,516,g=>{
  for(let j=0;j<2;j++){const [x,y]=actors[j];g.box(x-14,y+9+j*17,29,12,j?'#b9814d':'#588884');g.dot(x-9,y+22+j*17,3,ink);g.dot(x+9,y+22+j*17,3,ink);crate(g,x-7,y+j*17,13);}
  const [x,y]=actors[2];person(g,x,y+3,s.actors[2].mode==="March"?s.t*4:0,teal,!!s.active);g.sign("Picker · "+s.actors[2].mode,x,y-89,ink,12);
  if(s.active){const [j,b,t,qty]=s.active;const p=lerp([x,y-16],[actors[b][0],actors[b][1]+b*17],clamp((s.t-t)/d.handling));crate(g,...p,14);g.sign('S'+j+' · '+qty+" items",p[0]+20,p[1]+44,teal,12);}
 });
});
function aircraft(g,x,y,sign){
 g.poly([[x-72,y+2],[x-40,y-8],[x+6,y-7],[x-6,y-48],[x+3,y-46],[x+30,y-8],[x+72,y-5],[x+81,y],[x+69,y+5],[x+25,y+6],[x-3,y+39],[x-11,y+40],[x+5,y+8],[x-47,y+6]],'#f7f3df');
 g.poly([[x-65,y],[x-75,y-21],[x-65,y-20],[x-44,y-2]],teal);g.sign(sign,x+10,y+49);
}
upgrade('P0411',"follow the pallet",milestones([["Incoming goods inspection",.01],["First ticket transfer",.31],["Second ticket to board the plane",.73],["Check interception",1]]),(cv,s,d,k,f,view)=>{
 const i=Math.min(s.done,s.moves.length-1),[booking,to]=s.moves[i],dock=[[1002,209],[911,449],[605,481]],a=[147,268+booking*130],b=dock[to],u=s.done===s.moves.length?1:s.cur-i;
 const p=along([a,[321,a[1]],[422,338],[567,338],[b[0]-125,b[1]],b],clamp((u-.1)/.8));
 const left=s.moves.slice(0,s.done).filter(v=>v[1]===2).length;
 const look=f>.99&&left?dock[2]:p;
 scene(cv,'freight-old-airport',g=>{g.box(0,0,1240,610,'#c2d0bd');g.box(0,113,1240,396,'#a3b0a8');g.line([[0,334],[1240,334]],'#dbc993',3,[17,9]);
  building(g,35,232,215,110,"Air cargo terminal · warehouse exit");g.sign("Cargo ticket 0",148,222);g.sign("Cargo ticket 1d4c",147,352);
  aircraft(g,1083,202,"Segment 0");aircraft(g,992,444,"Segment 1");g.line([[534,452],[662,452],[662,503],[534,503],[534,452]],'#b37a63',3);g.sign("Leave a place for temporary storage",604,425,rust);
 },look,view,641,g=>{
  const count=[0,0,0];s.moves.slice(0,s.done).forEach(([bk,t])=>{const n=count[t]++,[x,y]=dock[t];pallet(g,x-30+n%4*14,y+15-Math.floor(n/4)*12,13,10,'',bk?'#8aaf9b':'#d39b66');});
  vehicle(g,'fork',p[0],p[1],1,u,1,amber);g.sign("cargo ticket "+d.bookings[booking],p[0],p[1]-42,ink);
  if(f>.99&&left)g.sign("Leave land "+left+" Trust",604,538,rust);
 });
});
upgrade('P0461',"Follow hot meal",milestones([["Receive an order",.055],["Meal on the stove",.20],["Lunch box on board",.435],["Last order signature",.89]]),(cv,s,d,k,f,view)=>{
 const plans=d.plans[k],homes=[[1000,202],[1045,402],[675,480]],kitchen=[170,290],pass=[330,330],dock=[470,344],labels=['A','B','F'];
 const routes=homes.map(p=>[dock,[579,344],[664,p[1]],p]);
 const focusOrder=k===1?2:0,positions=plans.map(([cook,dep,v],j)=>{
  if(s.t<cook+d.prepare[j])return kitchen;
  if(s.t<dep)return pass;
  return along(routes[j],clamp((s.t-dep)/d.legs[j][0]));
 });
 const late=s.phases[focusOrder]==="Received";const follow=late&&k!==1?Math.max(0,s.phases.findIndex(p=>p==="Delivery")):focusOrder;
 scene(cv,'freight-old-kitchen',g=>{g.box(0,0,1240,610,'#c9d1b6');for(let j=0;j<19;j++)tree(g,24+j*68,112+(j%4)*33,.8);
  routes.forEach(p=>road(g,p,23));building(g,54,266,265,115,"shared kitchen",'#d0bc9d');g.box(128,280,86,13,'#576d67');for(let j=0;j<3;j++)g.dot(142+26*j,279,8,ink,3);g.sign("Dining table",334,285);g.sign("Delivery parking space",473,293);
  homes.forEach(([x,y],j)=>siteArt(g,x,y-2,'house',"Customer "+labels[j]));
 },positions[follow],view,624,g=>{
  for(let j=0;j<3;j++){const [x,y]=positions[j],phase=s.phases[j],off=(j-1)*12;
   if(phase==="Delivery"){car(g,x,y,1,j===0?teal:amber);g.sign(labels[j]+" meal",x,y-47);}
   else if(phase==="Cook"){g.dot(x+off,y-6,11,'#ab7455',5);g.dot(x+off,y-6-Math.sin(s.t*9)*3,6,'#d4b37b',3);}
   else if(phase==="Waiting"){crate(g,x+off,y-7,13);g.text(labels[j],x+off+4,y-21,12);}
   else if(phase==="Received"){person(g,x+12,y+7,0,teal,true);g.text(labels[j]+" Signed for",x,y+28,12);}
  }
  const [x,y]=positions[follow];g.sign(labels[follow]+" meal · "+s.phases[follow],x,y-66,ink);
 });
},(s,d,k)=>({...s,metrics:[...s.metrics,["Meal A departure time",String(d.plans[k][0][1])],["F Meal departure time",String(d.plans[k][2][1])]]}));
upgrade('P0408',"Follow the machine",milestones([["First cabinet installation",.01],["Moving between cabinets",.20],["Cross-region transition",.70],["Final entry into the cabinet",.98]]),(cv,s,d,k,f,view)=>{
 const regions=[...new Set(d.coords.map(x=>x[0]))],group=regions.indexOf(d.coords[s.a][0]),next=regions.indexOf(d.coords[s.b][0]);
 function regionXY(j){const row=Math.floor(j/8),col=j%8;return[98+(row%2?7-col:col)*148,173+row*139];}
 const a=regionXY(group),b=regionXY(next),p=lerp(a,b,s.p);
 if(view||!s.id){
  scene(cv,'freight-old-locker-map',g=>{g.box(0,0,1240,610,'#c5d5bc');g.line([[-15,330],[305,274],[674,308],[947,244],[1255,281]],'#95bcb3',30);
   road(g,regions.map((_,j)=>regionXY(j)),18);regions.forEach((v,j)=>{const [x,y]=regionXY(j);g.box(x-15,y-16,32,15,'#779b8b');g.text('C'+(j+1),x,y-28,12);});},p,view,605,g=>{
   drone(g,p[0],p[1]-28,s.t,teal,s.id);g.sign(s.id?"Within the cabinet area · "+s.id:'C'+(group+1)+' → C'+(next+1),p[0],p[1]-78);});
 }else{
  const residents=d.coords.map((pt,i)=>({pt,i})).filter(v=>v.pt[0]===d.coords[s.a][0]),max=Math.max(...residents.map(v=>v.pt[1]),.00001);
  const pos=x=>[147+899*x/max,397-37*Math.sin(Math.PI*x/max)],a=pos(d.coords[s.a][1]),b=pos(d.coords[s.b][1]),p=lerp(a,b,s.p);
  const lift=s.phase==="loading"?s.stageP:s.phase==="unloading"?1-s.stageP:s.phase==="Complete"?0:1;
  const droneY=p[1]-32-lift*59;
  scene(cv,'freight-old-locker-'+group,g=>{g.box(0,0,1240,610,'#d0d8bf');for(let n=0;n<10;n++){tree(g,n*135+47,132+n%2*46);building(g,n*135+33,232,56,55,'','#d6bfa6');}road(g,residents.map(v=>pos(v.pt[1])),25);
   residents.forEach(({pt,i})=>{const [x,y]=pos(pt[1]);siteArt(g,x,y-19,'locker',"Cabinet L"+i);});},[p[0],droneY],0,610,g=>{
   drone(g,p[0],droneY,s.t,teal,0);const z=droneY+10+12*(1-lift);g.line([[p[0],droneY],[p[0],z]],ink,1);crate(g,p[0]-6,z,12);
   g.sign("Task "+s.id+' · '+s.phase,p[0],droneY-37);
  });
 }
});
})();
