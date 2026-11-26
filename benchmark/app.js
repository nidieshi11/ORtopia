(() => {
'use strict';
const E=id=>document.getElementById(id), main=E('content');
const catalog=window.BENCHMARK_CATALOG||{};
const domains=catalog.domains||[];
const dom=id=>domains.find(d=>d.id===id);
const subdomains=window.ORTOPIA_SUBDOMAINS||{};
const problemGroup=new Map();
const assignedDomain=new Map();
for(const [domainId,groups] of Object.entries(subdomains)){
 for(const group of groups){
  for(const id of group.ids){
   problemGroup.set(id,group);
   assignedDomain.set(id,domainId);
  }
 }
}
const probs=(catalog.problems||[]).map(p=>{
 const domain=dom(assignedDomain.get(p.id));
 return domain?{...p,domainId:domain.id,domain:domain.name}:p;
});
const byId=new Map(probs.map(p=>[p.id,p]));
const byDomain=id=>probs.filter(p=>p.domainId===id);
const s=x=>String(x??''), esc=x=>s(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const route=(kind,id)=>'#/'+kind+(id!=null?'/'+encodeURIComponent(id):'');
const detail=p=>route('case',p.id), param=u=>esc(u), sortZh=(a,b)=>s(a).localeCompare(s(b),'zh-CN',{numeric:true});
const paths={
 book:'M3 5q4-2 9 1 5-3 9-1v14q-4-2-9 1-5-3-9-1z M12 6v14',
 stack:'m3 7 9-4 9 4-9 4z M3 12l9 4 9-4 M3 17l9 4 9-4',
 image:'M3 5h18v14H3z M4 17l5-5 4 3 3-4 4 6 M7.8 9h.4',
 math:'M3 12h3l3 6 4-14h8 M15 14l5 5 M20 14l-5 5', nodes:'M5 6h5v4H5z M15 15h5v4h-5z M3 15h5v4H3z M7 10v2h10v3 M5 15v-3', text:'M5 4h14v16H5z M8 9h8 M8 12h8 M8 15h5', full:'M4 10V4h6 M14 4h6v6 M20 14v6h-6 M10 20H4v-6', pdf:'M6 3h8l4 4v14H6z M14 3v5h4 M9 13h6 M9 16h4',
 warehouse:'M3 11l9-7 9 7v9H3z M8 20v-8h8v8 M8 15h8 M8 18h8',
 factory:'M3 20V9l7 3V8l7 3V4h3l1 16z M6 16h2 M11 16h2 M16 16h2',
 road:'M4 20 8 4 M20 20 16 4 M12 4v3 M12 10v3 M12 16v4',
 train:'M7 3h10q2 0 2 3v10q0 2-2 2H7q-2 0-2-2V6q0-3 2-3z M5 11h14 M12 4v7 M8 15h1 M15 15h1 M8 18l-2 3 M16 18l2 3',
 air:'m3 13 7-1 7-8q2-1 2 1l-4 8 5 4-1 1-6-2-4 4H7l2-6-6 1z',
 drone:'M9 10h6v5H9z M9 10 6 7 M15 10l3-3 M9 15l-3 3 M15 15l3 3 M3 5h6 M15 5h6 M3 19h6 M15 19h6', energy:'m13 2-9 12h6l-1 8 11-14h-7z',
 finance:'M3 21h18 M5 17v-5h3v5 M11 17V8h3v9 M17 17V5h3v12 M4 8l5-4h5', health:'M6 7h12q2 0 2 2v10H4V9q0-2 2-2z M9 7V4h6v3 M12 10v6 M9 13h6',
 rescue:'M12 3 4 6v6q0 6 8 9 8-3 8-9V6z M12 8v7 M9 11.5h6', chip:'M6 6h12v12H6z M9 3v3 M15 3v3 M9 18v3 M15 18v3 M3 9h3 M3 15h3 M18 9h3 M18 15h3 M9 9h6v6H9z',
 network:'M3 4h5v5H3z M16 4h5v5h-5z M9 15h6v6H9z M8 6h8 M6 9l5 6 M18 9l-5 6' };
const ico=k=>'<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="'+(paths[k]||paths.book)+'"/></svg>', cats=['warehouse','factory','road','train','air','drone','energy','finance','health','rescue','chip','network'];
const seriesList=[['trans','Transportation Research Parts'],['informs','INFORMS 系列'],['utd','UTD 24 系列']]; const seriesNames={trans:'Transportation Research',informs:'INFORMS',utd:'UTD 24'};
const groupOf=p=>Array.isArray(p.series)?p.series.map(v=>s(v).toLowerCase()):[];
const groupLink=(domainId,group)=>route('domain',domainId)+(group?'/'+encodeURIComponent(group.key):'');
const replayIds = new Set(window.ORTOPIA_REPLAY_IDS || []);
// Use the same release key for the scene preview and its full-size viewer.
const assetVersion = new URL(document.currentScript.src).search;
const sceneUrl = p => {
 if(!p.scene)return '';
 const revision = p.sceneVersion ? '?v='+encodeURIComponent(p.sceneVersion) : assetVersion;
 return p.scene + revision;
};
let domainSearch={id:null,query:''};
let series='trans', currentProblem=null, zoom=1;
function setNav(n){for(const k of ['domains','library'])E('nav-'+k).classList.toggle('active',k===n)}
function crumb(items){return '<div class="crumb" aria-label="面包屑"><a href="../">首页</a>'+items.map(([t,u])=>'<i>/</i>'+(u?'<a href="'+param(u)+'">'+esc(t)+'</a>':'<strong>'+esc(t)+'</strong>')).join('')+'</div>'}
function has(q,p){const hay=[p.id,p.title,p.paperTitle,p.domain,problemGroup.get(p.id)?.label,p.journal,p.year,p.journalShort,...groupOf(p)].map(s).join(' ').toLowerCase(); return q.toLowerCase().trim().split(/\s+/).every(v=>hay.includes(v))}
function listItem(p){return '<a class="result" href="'+param(detail(p))+'"><span class="serial">'+esc(p.id)+'</span><span class="result-body"><strong>'+esc(p.title)+'</strong><small>'+esc(p.paperTitle)+'</small><small>'+esc([p.domain,p.journalShort||p.journal,p.year].filter(Boolean).join(' · '))+'</small></span><span class="chev"></span></a>'}
function domainsPage(){
 document.title='领域目录 · ORtopia';
 const cards=domains.map((d,i)=>{
  const groups=subdomains[d.id];
  const count=byDomain(d.id).length;
  return '<a class="domain-card" href="'+param(route('domain',d.id))+'"><span class="dicon">'+ico(cats[i])+
   '</span><span class="domain-body"><span class="domain-name">'+esc(d.name)+'</span><span class="domain-meta">'+
   count+' 道问题'+(groups?' · '+groups.length+' 个子类':'')+'</span></span><span class="chev" aria-hidden="true"></span></a>';
 }).join('');
 main.innerHTML='<div class="wrap page" id="domain-index"><div class="domain-head"><h1>领域目录</h1>'+
  '<p class="muted">'+domains.length+' 个领域 · '+probs.length+' 道问题</p></div><div class="domains-grid">'+cards+'</div></div>';
}
function libraryPage(){
 document.title='论文集 · ORtopia';
 const journalCount=new Set(probs.map(p=>p.journal).filter(Boolean)).size;
 main.innerHTML='<div class="wrap page" id="library"><div class="domain-head"><h1>论文集</h1>'+
  '<p class="muted">'+journalCount+' 种期刊 · '+probs.length+' 篇论文</p></div><div id="shelves"></div></div>';
 shelves();
}
function shelves(){
 const container=E('shelves');if(!container)return;
 let groups=[...seriesList]; if(probs.some(p=>!groupOf(p).some(k=>seriesNames[k])))groups.push(['other','其他期刊']);
 const selectBy=k=>probs.filter(p=>k==='other'?!groupOf(p).some(v=>seriesNames[v]):groupOf(p).includes(k));
 const filtered=selectBy(series), journals=new Map;
 for(const p of filtered){const name=p.journal||p.journalShort||'其他期刊';if(!journals.has(name))journals.set(name,[]);journals.get(name).push(p)}
 container.innerHTML='<div class="tabs" role="group" aria-label="论文系列">'+groups.map(([k,n])=>'<button type="button" data-series="'+k+'" aria-pressed="'+(series===k)+'" class="'+(series===k?'active':'')+'">'+esc(n)+' <em>'+selectBy(k).length+'</em></button>').join('')+'</div><div class="journals">'+[...journals.entries()].sort(([a],[b])=>sortZh(a,b)).map(([name,rows],i)=>'<details class="journal"'+(i===0?' open':'')+'><summary>'+ico('book')+'<span>'+esc(name)+'</span><span class="pill">'+rows.length+' 篇</span><span class="chev"></span></summary>'+rows.sort((a,b)=>Number(b.year)-Number(a.year)||sortZh(a.paperTitle,b.paperTitle)).map(p=>'<div class="paper-row"><div class="pdf-mark">PDF</div><div><a class="paper-title" target="_blank" rel="noopener" href="'+param(p.pdf)+'">'+esc(p.paperTitle)+'</a><div class="paper-info">'+esc([p.year,p.id,p.title].filter(Boolean).join(' · '))+'</div></div><div class="paper-actions"><a href="'+param(detail(p))+'">问题详情</a><a href="'+param(p.pdf)+'" download="'+esc(p.pdfName||s(p.paperTitle)+'.pdf')+'">下载 PDF</a></div></div>').join('')+'</details>').join('')+(journals.size?'':'<div class="empty">此系列暂无论文。</div>')+'</div>';
 container.querySelectorAll('[data-series]').forEach(b=>b.onclick=()=>{series=b.dataset.series;shelves();container.querySelector('[data-series="'+series+'"]').focus({preventScroll:true})});
}
function domainPage(id,groupKey){
 const domain=dom(id);
 if(!domain)return miss();
 const rows=byDomain(id);
 const groups=subdomains[id]||[];
 const active=groups.find(group=>group.key===groupKey);
 if(groupKey && !active)return miss();
 const members=group=>rows.filter(p=>problemGroup.get(p.id)===group);
 const tabs=groups.length?'<nav class="subdomain-nav" aria-label="二级分类">'+
   [[undefined,'全部',rows.length],...groups.map(group=>[group,group.label,members(group).length])]
   .map(([group,label,count])=>'<a href="'+param(groupLink(id,group))+'"'+(group===active?' aria-current="page"':'')+'>'+
      esc(label)+' <span>'+count+'</span></a>').join('')+'</nav>':'';
 const trail=[['领域目录','#/domains'],[domain.name,active?groupLink(id):undefined]];
 if(active)trail.push([active.label]);
 const inputLabel=active?'在此子类中检索':'在本领域中检索';
 main.innerHTML='<div class="wrap page">'+crumb(trail)+'<div class="domain-head">'+
   '<h1>'+esc(domain.name)+'</h1><p class="muted">本领域收录 '+rows.length+' 道优化问题。</p></div>'+tabs+
   '<div class="tools"><label class="search-field"><span class="glass" aria-hidden="true"></span>'+
   '<input id="filter-domain" type="search" placeholder="'+inputLabel+'" aria-label="'+inputLabel+'"></label>'+
   '<span class="count-label" id="domain-count" aria-live="polite"></span></div><div id="domain-list"></div></div>';
 const input=E('filter-domain');
 input.value=domainSearch.query;
 function filter(){
  domainSearch.query=input.value;
  const results=(active?members(active):rows).filter(p=>has(input.value,p));
  E('domain-count').textContent='显示 '+results.length+' 道问题';
  const list=items=>'<div class="result-list">'+items.map(listItem).join('')+'</div>';
  if(!results.length){
   E('domain-list').innerHTML='<div class="no-hits">没有找到匹配的问题。</div>';
  }else if(groups.length && !active){
   const sections=groups.map(group=>{
    const matches=results.filter(p=>problemGroup.get(p.id)===group);
    return matches.length?'<section class="subdomain-section"><h2><a href="'+param(groupLink(id,group))+'">'+
      esc(group.label)+'</a> <small>'+matches.length+' 题</small></h2>'+list(matches)+'</section>':'';
   });
   const unassigned=results.filter(p=>!problemGroup.has(p.id));
   if(unassigned.length)sections.push(list(unassigned));
   E('domain-list').innerHTML=sections.join('');
  }else E('domain-list').innerHTML=list(results);
 }
 input.addEventListener('input',filter);
 filter();
 document.title=(active?active.label+' · ':'')+domain.name+' · ORtopia';
}
function para(md){
 let text=s(md).trim().replace(/^#[^\n]*\n+/,'');const math=[];
 text=text.replace(/\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\)|(?<!\\)\$(?!\$)[^$]*?(?<!\\)\$/g,token=>{math.push(token);return '\ue000'+(math.length-1)+'\ue001'});
 return text.split(/\r?\n\s*\r?\n/).filter(Boolean).map(v=>{v=v.trim();if(/^#{1,6}\s/.test(v))return '<h3>'+esc(v.replace(/^#{1,6}\s+/,''))+'</h3>';return '<p>'+esc(v).replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>').replace(/\r?\n/g,'<br>')+'</p>'}).join('').replace(/\ue000(\d+)\ue001/g,(_,n)=>esc(math[Number(n)]));
}
function descriptionMode(mode){
 const el=E('description-text'),p=currentProblem;if(!el||!p)return;
 const raw=mode==='symbolic'?(p.description||p.plainDescription):(p.plainDescription||p.summary||p.description);
 el.innerHTML=para(raw||'暂无问题描述。');el.scrollTop=0;
 document.querySelectorAll('[data-description]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.description===mode)));
 if(mode==='symbolic'&&typeof window.renderMathInElement==='function')window.renderMathInElement(el,{delimiters:[{left:'$$',right:'$$',display:true},{left:'\\[',right:'\\]',display:true},{left:'\\(',right:'\\)',display:false},{left:'$',right:'$',display:false}],throwOnError:false,trust:false,strict:'ignore'});
}
function panel(title,k,action,body){return '<section class="panel"><div class="panel-head"><div class="panel-title">'+ico(k)+'<h2>'+title+'</h2></div>'+action+'</div>'+body+'</section>'}
function zoomBtn(kind){return '<button class="panel-ctl" data-view="'+kind+'" aria-label="放大查看'+({scene:'场景图',math:'数学模型'}[kind])+'">'+ico('full')+'放大</button>'}
function pdfFile(u){return /\.pdf(?:[?#]|$)/i.test(u)}
function mathList(p){return (Array.isArray(p.mathPages)?p.mathPages:[]).map(v=>typeof v==='string'?v:v.url||v.src).filter(Boolean)}
function picBox(kind,url,desc){return url?'<button class="image-frame panel-'+kind+'" data-view="'+kind+'" aria-label="放大查看'+desc+'"><img src="'+param(url)+'" alt="'+esc(desc)+'" decoding="async"></button>':'<div class="empty">暂未收录'+desc+'。</div>'}
function detailPage(id){
 const p=byId.get(id);if(!p)return miss();currentProblem=p;document.title=p.title+' · ORtopia';const mp=mathList(p);
 const switcher='<div class="desc-switch" role="group" aria-label="问题描述版本"><button data-description="symbolic" aria-pressed="true">有符号</button><button data-description="plain" aria-pressed="false">纯文字</button></div>';
 const math=mp.length?mp.map((u,i)=>pdfFile(u)?'<object aria-label="数学模型 PDF" type="application/pdf" data="'+param(u)+'"><a class="route-link" href="'+param(u)+'" target="_blank" rel="noopener">打开数学模型 PDF</a></object>':'<button class="math-img" data-view="math" data-page="'+i+'" aria-label="放大数学模型第 '+(i+1)+' 页"><img src="'+param(u)+'" loading="lazy" alt="数学模型，第 '+(i+1)+' 页"></button>').join(''):'<div class="empty">暂未收录模型图片。'+(p.tex?'<a class="route-link" href="'+param(p.tex)+'" download>下载 LaTeX 源文件</a>':'')+'</div>';
 const group=problemGroup.get(p.id);
 const trail=[['领域目录','#/domains'],[p.domain,route('domain',p.domainId)]];
 if(group)trail.push([group.label,groupLink(p.domainId,group)]);
 const headings=crumb([...trail,[p.id]]);
 const replay=replayIds.has(p.id)
   ? '<a class="primary replay-entry" href="../simulation/replay.html#'+param(p.id)+'">进入实例仿真 <span aria-hidden="true">→</span></a>' : '';
 const paper=p.pdf
   ? '<a class="tool" href="'+param(p.pdf)+'" target="_blank" rel="noopener">'+ico('pdf')+'论文 PDF</a>'+
     '<a class="tool" download="'+esc(p.pdfName||s(p.paperTitle)+'.pdf')+'" href="'+param(p.pdf)+'">下载论文</a>' : '';
 const metadata='<strong>'+esc(p.journal||p.journalShort)+'</strong><span>'+esc(p.year)+'</span>'+
   groupOf(p).map(k=>'<span class="badge">'+esc(seriesNames[k]||k)+'</span>').join('');
 main.innerHTML='<div class="wrap page">'+headings+
   '<header class="case-head"><div class="tagline"><span class="serial">'+esc(p.id)+'</span><span class="pill">'+esc(p.domain)+'</span></div>'+
   '<h1>'+esc(p.title)+'</h1><p class="eng-title">'+esc(p.paperTitle)+'</p>'+
   '<div class="bar"><div class="pmeta">'+metadata+'</div><div class="doc-actions">'+replay+paper+'</div></div></header>'+
   '<div class="case-grid">'+
   panel('场景图','image',p.scene?zoomBtn('scene'):'',picBox('scene',sceneUrl(p),p.title+' 场景图'))+
   panel('数学模型','math',mp.length?zoomBtn('math'):'','<div class="panel-math">'+math+'</div>')+
   panel('问题描述','text',switcher,'<div class="descpanel" id="description-text"></div>')+'</div>'+
   '<div class="case-nav"><a href="'+param(route('domain',p.domainId))+'">返回'+esc(p.domain)+'目录</a></div></div>';
 descriptionMode('symbolic');
}
function miss(){currentProblem=null;main.innerHTML='<div class="wrap page"><h1>未找到此条目</h1><a class="route-link" href="#/">返回资料库</a></div>'}
function render(scroll=true){
 const [kind,id,groupKey]=location.hash.replace(/^#\/?/,'').split('/').map(v=>{try{return decodeURIComponent(v)}catch{return v}});currentProblem=null;document.title='ORtopia';
 if(!probs.length){main.innerHTML='<div class="wrap page"><h1>目录暂未载入</h1><p>请确认网页与配套的数据目录保存在一起。</p></div>';return}
 if(kind!=='domain'||domainSearch.id!==id)domainSearch={id:kind==='domain'?id:null,query:''};
 setNav(kind==='library'?'library':'domains');
 if(!kind||kind==='domains')domainsPage();
 else if(kind==='library')libraryPage();
 else if(kind==='domain')domainPage(id,groupKey);
 else if(kind==='case')detailPage(id);
 else miss();
 if(scroll)window.scrollTo({top:0,behavior:'instant'});
}
function search(){if(!E('search-modal').open)E('search-modal').showModal();E('lookup').focus();lookup()}
function lookup(){const q=E('lookup').value.trim(),rs=probs.filter(p=>!q||has(q,p));const max=q?60:8;E('hits').innerHTML='<p style="padding:0 15px 8px;color:var(--sub);font-size:.85rem">'+(q?'找到 '+rs.length+' 道问题'+(rs.length>max?'，显示前 '+max+' 道':''):'从题库开始浏览')+'</p>'+(rs.length?rs.slice(0,max).map(listItem).join(''):'<p class="no-hits">没有匹配结果，请试试论文关键词、题号或期刊名。</p>')}
function view(kind,index=0){
 if(!currentProblem || !['scene','math'].includes(kind))return;
 const items=kind==='scene'?[sceneUrl(currentProblem)].filter(Boolean):mathList(currentProblem);
 if(!items.length)return;
 const title=kind==='scene'?'场景图':'数学模型';
 const dialog=E('viewer'), body=E('viewer-body');
 dialog.classList.toggle('scene-viewer',kind==='scene');
 E('viewer-title').textContent=currentProblem.id+' · '+title;
 body.innerHTML=items.map((url,i)=>pdfFile(url)
   ? '<iframe title="数学模型 PDF" src="'+param(url)+'"></iframe>'
   : '<img src="'+param(url)+'" alt="'+esc(kind==='scene'?currentProblem.title+' 场景图':title+'，第 '+(i+1)+' 页')+'" data-view-index="'+i+'">').join('');
 zoom=1;
 dialog.showModal();
 body.scrollTo(0,0);
 applyZoom();
 if(kind==='scene'){
   const img=body.querySelector('img');
   if(img && !img.complete)img.addEventListener('load',applyZoom,{once:true});
 }else if(index>0){
   const page=body.querySelector('[data-view-index="'+index+'"]');
   if(page)Promise.all([...body.querySelectorAll('img')].slice(0,index+1).map(img=>img.decode().catch(()=>{})))
     .then(()=>{if(page.isConnected && dialog.open)body.scrollTop=page.offsetTop-body.offsetTop});
 }
}
function applyZoom(){
 const body=E('viewer-body');
 const scene=E('viewer').classList.contains('scene-viewer');
 const images=body.querySelectorAll('img');
 E('zoom-value').textContent=Math.round(zoom*100)+'%';
 E('zoom-in').disabled=!images.length || zoom>=5;
 E('zoom-out').disabled=!images.length || zoom<=.5;
 E('zoom-fit').disabled=!images.length;
 images.forEach(img=>{
   if(scene && img.naturalWidth && img.naturalHeight){
     const fit=Math.min(body.clientWidth,body.clientHeight*img.naturalWidth/img.naturalHeight);
     img.style.width=Math.max(1,Math.floor(fit*zoom))+'px';
   }else img.style.width=zoom*100+'%';
 });
}
function changeZoom(direction){
 const body=E('viewer-body');
 const x=(body.scrollLeft+body.clientWidth/2)/Math.max(1,body.scrollWidth);
 const y=(body.scrollTop+body.clientHeight/2)/Math.max(1,body.scrollHeight);
 zoom=direction===0?1:Math.max(.5,Math.min(5,zoom+direction*.25));
 applyZoom();
 body.scrollLeft=x*body.scrollWidth-body.clientWidth/2;
 body.scrollTop=direction===0?0:y*body.scrollHeight-body.clientHeight/2;
}
window.addEventListener('resize',()=>{if(E('viewer').open)applyZoom()});
document.addEventListener('click',e=>{const el=e.target.closest('[data-close],[data-view],[data-description],#hits a,dialog,nav a,.brand');if(!el)return;
 if(el.dataset.description){descriptionMode(el.dataset.description);return}if(el.dataset.close){E(el.dataset.close).close();return}if(el.dataset.view){view(el.dataset.view,+(el.dataset.page||0));return}if(el.matches('#hits a'))E('search-modal').close();if(el.tagName==='DIALOG'&&e.target===el){const r=el.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)el.close()}
 if((el.matches('nav a')||el.matches('.brand'))&&el.hash===location.hash)render();
});
E('zoom-in').onclick=()=>changeZoom(1);E('zoom-out').onclick=()=>changeZoom(-1);E('zoom-fit').onclick=()=>changeZoom(0);E('open-search').onclick=search;E('lookup').addEventListener('input',lookup);
document.addEventListener('keydown',e=>{if((e.key==='/'||((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'))&&!['INPUT','TEXTAREA','SELECT'].includes(e.target.tagName)&&!E('viewer').open){e.preventDefault();search()}if(e.key==='Enter'&&e.target===E('lookup')){const a=E('hits').querySelector('a');if(a){e.preventDefault();a.click()}}});
window.addEventListener('hashchange',()=>render());render();
})();
