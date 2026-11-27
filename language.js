(() => {
  'use strict';
  const root = new URL('.', document.currentScript.src);
  const page = location.pathname.slice(root.pathname.length);
  const path = page.replace(/^en\//, '');
  if (!/^(dataset|simulation)\/(?:index\.html|replay\.html)?$/.test(path)) return;
  const current = page.startsWith('en/') ? 'en' : 'zh';
  const topics = {
    "车辆路径与取送调度": "Vehicle Routing and Pickup and Delivery",
    "多方协作与分段配送": "Collaborative and Multistage Delivery",
    "货运网络与运力配置": "Freight Networks and Capacity",
    "采购补货与库存运输": "Procurement, Replenishment and Inventory Routing",
    "仓储作业与设施配置": "Warehouse Operations and Facility Design",
    "渠道合同与定价": "Distribution Contracts and Pricing",
    "生产计划与产销分配": "Production Planning and Sales Allocation",
    "车间排序与资源排程": "Job Sequencing and Resource Scheduling",
    "公交线网与班次排班": "Transit Networks and Timetabling",
    "按需接送与共享运力调配": "On-Demand Mobility and Fleet Allocation",
    "路网改造与信号配时": "Road Network Design and Signal Timing",
    "车辆速度与编队控制": "Vehicle Speed and Platoon Control",
    "列车开行与运行图": "Train Services and Timetabling",
    "中断恢复与乘客分流": "Disruption Recovery and Passenger Rerouting",
    "航空运营与收益管理": "Airline Operations and Revenue Management",
    "铁路货运与线路养护": "Rail Freight and Track Maintenance",
    "船舶靠泊与港口作业": "Berth Scheduling and Port Operations",
    "空地协同配送": "Coordinated Ground and Drone Delivery",
    "站网规划与机队调位": "Drone Bases and Fleet Repositioning",
    "电力调度与市场交易": "Power Dispatch and Electricity Markets",
    "能源设施投资与维护": "Energy Infrastructure Investment and Maintenance",
    "供水与输气管网运行": "Water and Gas Network Operations",
    "定价与收益管理": "Pricing and Revenue Management",
    "选品与营销投放": "Product Assortment and Marketing",
    "金融交易与合同激励": "Financial Trading and Contract Incentives",
    "预约、手术与护理排程": "Appointments, Surgery and Care Scheduling",
    "疾病防治与治疗规划": "Disease Prevention and Treatment Planning",
    "救援设施选址与预置": "Emergency Facility Siting and Prepositioning",
    "灾中调配与转运": "Disaster Response and Evacuation",
    "量子电路布局与控制": "Quantum Circuit Layout and Control",
    "云计算容量规划": "Cloud Capacity Planning",
    "分类规则学习": "Classification Rule Learning",
    "资源规划与情景拟合": "Resource Planning and Scenario Fitting",
    "网络分组与连通结构": "Graph Partitioning and Connectivity",
    "在线匹配、准入与排队": "Online Matching, Admission and Queues",
  };
  const enToZh = Object.fromEntries(Object.entries(topics).map(([zh, en]) => [en, zh]));

  function translatedUrl(language) {
    const url = new URL(location.href);
    url.pathname = root.pathname + (language === 'en' ? 'en/' : '') + path;
    if (language === 'zh') url.searchParams.set('lang', 'zh');
    else url.searchParams.delete('lang');
    const parts = url.hash.split('/');
    const datasetTopic = parts.length === 4 && parts[1] === 'domain';
    const simulationTopic = parts.length === 3 && parts[0] === '#scene';
    if (datasetTopic || simulationTopic) {
      const last = parts.length - 1;
      let topic;
      try { topic = decodeURIComponent(parts[last]); } catch { return url; }
      const translated = (language === 'en' ? topics : enToZh)[topic];
      if (translated) {
        parts[last] = encodeURIComponent(translated);
        url.hash = parts.join('/');
      }
    }
    return url;
  }

  const requested = new URLSearchParams(location.search).get('lang') === 'zh' ? 'zh' : 'en';
  const canonical = translatedUrl(requested);
  if (requested !== current) {
    location.replace(canonical.href);
    return;
  }
  if (canonical.href !== location.href) history.replaceState(history.state, '', canonical.href);

  function updateSwitch() {
    const link = document.querySelector('.language-link');
    if (link) link.href = translatedUrl(current === 'zh' ? 'en' : 'zh').href;
  }
  document.addEventListener('DOMContentLoaded', updateSwitch);
  window.addEventListener('hashchange', updateSwitch);

  // Hash routes already inherit the query. Carry the language across full page links too,
  // including keyboard navigation, copying a link and opening in a new tab.
  if (current === 'zh') {
    function localizeLink(event) {
      const link = event.target.closest?.('a[href]');
      if (!link || link.matches('.language-link,[download]') || link.getAttribute('href').startsWith('#')) return;
      const url = new URL(link.href);
      if (url.origin !== root.origin || !url.pathname.startsWith(root.pathname)) return;
      if (!/^(dataset|simulation)\/(?:index\.html|replay\.html)?$/.test(url.pathname.slice(root.pathname.length))) return;
      url.searchParams.set('lang','zh');
      link.href = url.href;
    }
    for (const event of ['pointerdown', 'focusin', 'contextmenu', 'click']) document.addEventListener(event, localizeLink, true);
  }
})();
