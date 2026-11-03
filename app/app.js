/* ERASÓ · aplicativo web. Carregado por index.html depois de rede.js. */
/* ===================== Ícones (traço 1,75, pontas redondas) ===================== */
const ICONS={
  send:'<path d="M4 12 20 4 14 20 11 13Z"/><path d="M11 13 20 4"/>',
  inbox:'<path d="M4 13h4l2 3h4l2-3h4"/><path d="M4 13 6.5 6h11L20 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"/>',
  activity:'<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  devices:'<rect x="3" y="5" width="13" height="10" rx="2"/><path d="M7 19h5"/><rect x="17.5" y="9" width="4" height="10" rx="1.2"/>',
  settings:'<circle cx="12" cy="12" r="3"/><path d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M5.6 18.4l1.8-1.8M16.6 7.4l1.8-1.8"/>',
  file:'<path d="M7 3h7l5 5v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/><path d="M14 3v5h5"/>',
  folder:'<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  image:'<rect x="3" y="4" width="18" height="16" rx="2.5"/><circle cx="9" cy="10" r="1.6"/><path d="M21 16l-5-5-9 9"/>',
  video:'<rect x="3" y="5" width="13" height="14" rx="2.5"/><path d="M16 10l5-3v10l-5-3"/>',
  text:'<path d="M5 7h14M5 12h14M5 17h9"/>',
  link:'<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
  clipboard:'<rect x="6" y="4.5" width="12" height="16.5" rx="2"/><rect x="9" y="2.5" width="6" height="4" rx="1"/>',
  search:'<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.4-4.4"/>',
  refresh:'<path d="M20 12a8 8 0 1 1-2.4-5.7"/><path d="M20 4v5h-5"/>',
  plus:'<path d="M12 5v14M5 12h14"/>', x:'<path d="M6 6l12 12M18 6 6 18"/>', check:'<path d="M5 12.5l4.5 4.5L19 7"/>',
  heart:'<path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.3a4.3 4.3 0 0 1 7.5 2.5C19.5 15.4 12 20 12 20z"/>',
  laptop:'<rect x="4" y="5" width="16" height="11" rx="1.6"/><path d="M2 19h20"/>',
  phone:'<rect x="7" y="2.5" width="10" height="19" rx="2.2"/><path d="M11 18.5h2"/>',
  tablet:'<rect x="4.5" y="3" width="15" height="18" rx="2.2"/><path d="M11 18h2"/>',
  monitor:'<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M9 20h6M12 16v4"/>',
  browser:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.7 5.6 3.7 9s-1.2 6.4-3.7 9M12 3c-2.5 2.6-3.7 5.6-3.7 9s1.2 6.4 3.7 9"/>',
  local:'<circle cx="6" cy="12" r="2.6"/><circle cx="18" cy="12" r="2.6"/><path d="M8.6 12h6.8"/>',
  remote:'<circle cx="5" cy="17" r="2.3"/><circle cx="19" cy="17" r="2.3"/><path d="M6.4 15.2C8 8.5 16 8.5 17.6 15.2"/>',
  offline:'<circle cx="12" cy="12" r="3"/>',
  shield:'<path d="M12 3l7 3v5c0 5-3.4 8.4-7 10-3.6-1.6-7-5-7-10V6z"/><path d="M9 12l2 2 4-4"/>',
  alert:'<path d="M12 4 2.8 20h18.4z"/><path d="M12 10v4M12 17v.3"/>',
  'chevron-up':'<path d="M6 15l6-6 6 6"/>', 'chevron-down':'<path d="M6 9l6 6 6-6"/>',
  up:'<path d="M12 19V5M6.5 10.5 12 5l5.5 5.5"/>', down:'<path d="M12 5v14M6.5 13.5 12 19l5.5-5.5"/>',
  qr:'<rect x="3.5" y="3.5" width="7" height="7" rx="1"/><rect x="13.5" y="3.5" width="7" height="7" rx="1"/><rect x="3.5" y="13.5" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3zM18 18h2.5v2.5M20.5 14v1"/>',
  hash:'<path d="M5 9h14M5 15h14M10 4 8 20M16 4l-2 16"/>',
  copy:'<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
  download:'<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',
  external:'<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
  pin:'<path d="M9 3.5h6l-1 6 3.5 3.5h-11L10 9.5z"/><path d="M12 13v7.5"/>',
  trash:'<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
  moon:'<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/>',
  sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/>',
  leaf:'<path d="M5 19c0-8 6-14 15-14 0 9-6 15-14 15"/><path d="M5 19l7-7"/>',
  spark:'<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>',
  settings2:'<path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/>',
  info:'<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5M12 8v.3"/>',
  eye:'<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
  retry:'<path d="M4 12a8 8 0 0 1 13.7-5.7L20 8.5"/><path d="M20 4v4.5h-4.5"/><path d="M20 12a8 8 0 0 1-13.7 5.7L4 15.5"/>'
};
const svgI=(n,c='')=>`<svg class="i ${c}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[n]||''}</svg>`;
function hydrateIcons(root=document){root.querySelectorAll('svg[data-i]').forEach(s=>{s.setAttribute('viewBox','0 0 24 24');s.setAttribute('aria-hidden','true');s.innerHTML=ICONS[s.dataset.i]||'';s.removeAttribute('data-i')})}

/* ===================== Utilidades ===================== */
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const nf=new Intl.NumberFormat('pt-BR',{maximumFractionDigits:1});
function fmtBytes(b){if(b<1e3)return b+' B';const u=['kB','MB','GB','TB'];let i=-1;do{b/=1000;i++}while(b>=1000&&i<u.length-1);return nf.format(b)+' '+u[i]}
function fmtTime(s){s=Math.max(0,Math.round(s));if(s<60)return s+' s';const m=Math.floor(s/60),r=s%60;return m<60?`${m} min ${r?r+' s':''}`.trim():`${Math.floor(m/60)} h ${m%60} min`}
const isMac=/Mac|iPhone|iPad/.test(navigator.platform);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const reduced=()=>document.documentElement.dataset.motion==='reduced'||(document.documentElement.dataset.motion!=='full'&&matchMedia('(prefers-reduced-motion: reduce)').matches);
function kindOf(name,type=''){if(/^image\//.test(type)||/\.(png|jpe?g|gif|webp|heic|svg)$/i.test(name))return'image';if(/^video\//.test(type)||/\.(mp4|mov|mkv|webm)$/i.test(name))return'video';return'file'}
function truncMid(s,n=28){return s.length<=n?s:s.slice(0,Math.ceil(n/2)-1)+'…'+s.slice(-Math.floor(n/2)+1)}

/* ===================== Estado ===================== */
// Tudo aqui vem do próprio aparelho: preferências em localStorage, Caixa em IndexedDB, aparelhos da presença real.
const PERFIL=ErasoRede.perfilDoNavegador();
// Nomes sorteados por versões anteriores: quem os tinha salvos passa a usar o nome real do aparelho.
const NOMES_ANTIGOS=['Ipê Sereno','Jatobá Atento','Bem-te-vi Calmo','Aroeira Ágil','Mandacaru Firme','Quero-quero Leve'];
const idCurto=id=>String(id).slice(0,4).toUpperCase();
const norm=s=>String(s==null?'':s).normalize('NFD').replace(/\p{Diacritic}/gu,'').toLowerCase();
const LS={get(k,d){try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch{return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v));return true}catch{return false}}};
const PREFS=Object.assign({id:'',sala:'',name:'',visible:true,auto:'off',pin:false,pinCode:'',favs:[],favInfo:{},settings:{},retention:7},LS.get('eraso-prefs',{}));
if(!/^[a-f0-9]{12}$/.test(PREFS.id))PREFS.id=ErasoRede.aleatorio(12);
const NOME_SEM_MODELO=ErasoRede.nomePadrao(PERFIL,PREFS.id);
if(!PREFS.name||NOMES_ANTIGOS.includes(PREFS.name))PREFS.name=NOME_SEM_MODELO;
if(PREFS.auto==='mine')PREFS.auto='fav';
// Sala: código secreto compartilhado pelos aparelhos que devem se ver. Pode vir de um link de convite (?sala=…).
const SALA_OK=/^[a-z0-9]{8,32}$/;
const salaDoTexto=t=>{t=String(t||'').trim();const m=/[?&]sala=([A-Za-z0-9]+)/.exec(t);return(m?m[1]:t).toLowerCase()};
let SALA=SALA_OK.test(PREFS.sala)?PREFS.sala:'';
{const c=salaDoTexto((location.search.match(/[?&]sala=[A-Za-z0-9]+/)||[''])[0]);if(SALA_OK.test(c)&&/[?&]sala=/.test(location.search))SALA=c}
const novaSala=()=>{const a='abcdefghjkmnpqrstuvwxyz23456789',b=crypto.getRandomValues(new Uint8Array(10));return Array.from(b,x=>a[x%a.length]).join('')};
const conviteDaSala=()=>`${location.origin}${location.pathname}?sala=${SALA}`;
const ME={id:PREFS.id,name:PREFS.name,type:PERFIL.tipo,os:PERFIL.meta};
let DEVICES=[];
const S={view:'compartilhar',tab:'nearby',mode:'one',selection:[],picked:new Set(),scanning:false,transfers:[],activity:LS.get('eraso-atividade',[]),inbox:[],
  visible:PREFS.visible,auto:PREFS.auto,pin:PREFS.pin,pinCode:PREFS.pinCode,favs:new Set(PREFS.favs),favInfo:PREFS.favInfo||{},retention:PREFS.retention,
  q:'',settings:Object.assign({autofinish:true,history:true,verifyIn:true,verifyOut:true},PREFS.settings),brand:'idle',sending:false,actFilter:'all',net:'conectando'};
function salvarPrefs(){LS.set('eraso-prefs',{id:ME.id,sala:SALA,name:ME.name,visible:S.visible,auto:S.auto,pin:S.pin,pinCode:S.pinCode,favs:[...S.favs],favInfo:S.favInfo,settings:S.settings,retention:S.retention})}
function salvarAtividade(){while(S.activity.length&&!LS.set('eraso-atividade',S.activity.slice(0,300).map(a=>({...a,items:undefined}))))S.activity.pop()}
/* Tempo relativo e datas (a partir de carimbos reais) */
function rel(ts){const m=Math.round((Date.now()-ts)/60000);if(m<1)return'agora';if(m<60)return`há ${m} min`;const h=Math.round(m/60);if(h<24)return`há ${h} h`;const d=Math.round(h/24);return d===1?'ontem':`há ${d} dias`}
function diaDe(ts){const hoje=new Date();hoje.setHours(0,0,0,0);const d=new Date(ts);d.setHours(0,0,0,0);const n=Math.round((hoje-d)/864e5);return n<=0?'Hoje':n===1?'Ontem':d.toLocaleDateString('pt-BR',{day:'numeric',month:'long'})}
const horaDe=ts=>new Date(ts).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});
const dataHora=ts=>new Date(ts).toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'});
/* Caixa: IndexedDB (guarda também os arquivos) */
const IDB={db:null,abrir(){return this.db||(this.db=new Promise((ok,erro)=>{if(!window.indexedDB)return erro(new Error('IndexedDB indisponível'));const r=indexedDB.open('eraso',1);r.onupgradeneeded=()=>r.result.createObjectStore('caixa',{keyPath:'id'});r.onsuccess=()=>ok(r.result);r.onerror=()=>erro(r.error)}))},
  async tx(modo,fn){const db=await this.abrir();return new Promise((ok,erro)=>{const t=db.transaction('caixa',modo),st=t.objectStore('caixa'),req=fn(st);t.oncomplete=()=>ok(req&&req.result);t.onerror=()=>erro(t.error);t.onabort=()=>erro(t.error)})},
  todos(){return this.tx('readonly',s=>s.getAll())},gravar(it){return this.tx('readwrite',s=>s.put(it))},apagar(id){return this.tx('readwrite',s=>s.delete(id))}};
const devIcon=t=>({phone:'phone',tablet:'tablet',laptop:'laptop',monitor:'monitor',browser:'browser'}[t]||'laptop');
const routeBadge=(d,compact)=>d.route==='local'?`<span class="badge local">${svgI('local','s16')}${compact?'':'Local'}</span>`:`<span class="badge offline">${svgI('offline','s16')}Offline${d.seen?' · '+d.seen:''}</span>`;

/* ===================== Marca: estado global (MOTION_SPEC §6) ===================== */
let brandTimer;
function computeBrand(){if(S.transfers.some(t=>t.status==='active')||S.sending)return'transferring';if(S.scanning)return'syncing';return'idle'}
function setBrand(state,label){
  clearTimeout(brandTimer);
  $$('[data-brand]').forEach(b=>{b.dataset.state=state;});
  const txt=label||({idle:S.net!=='conectado'?'Sem conexão com o servidor':S.visible?'Pronto · visível na rede':'Pronto · oculto',syncing:'Sincronizando…',transferring:'Transferindo…',done:'Tudo certo',attention:'Algo precisa de atenção',request:'Pedido recebido',opening:'Ficando visível…'}[state]);
  $('[data-brand-status]').textContent=txt;
  if(['done','attention','request','opening'].includes(state)){brandTimer=setTimeout(()=>setBrand(computeBrand()),state==='opening'?900:1400)}
}
function refreshBrand(){const st=$('[data-brand]').dataset.state;if(!['done','attention','request','opening'].includes(st))setBrand(computeBrand())}

/* ===================== Navegação ===================== */
const NAV=[['compartilhar','send','Compartilhar','Enviar'],['caixa','inbox','Caixa','Caixa'],['atividade','activity','Atividade','Atividade'],['dispositivos','devices','Dispositivos','Aparelhos'],['configuracoes','settings','Configurações','Ajustes']];
function renderNav(){
  const active=S.transfers.filter(t=>t.status==='active').length;
  const cur=S.view==='diagnostico'?'configuracoes':S.view;
  $('[data-nav]').innerHTML=NAV.map(([id,ic,l,ls],i)=>`<a href="#${id}" ${cur===id?'aria-current="page"':''} title="${l} (${isMac?'⌘':'Ctrl'}+${i+1})">${svgI(ic)}<span class="label">${l}</span><span class="label-short">${ls}</span>${id==='atividade'&&active?`<span class="count">${active}</span>`:''}</a>`).join('');
  $('[data-bottomnav]').innerHTML=NAV.map(([id,ic,l,ls])=>`<a href="#${id}" ${cur===id?'aria-current="page"':''}><span class="pill">${svgI(ic)}</span>${ls}${id==='atividade'&&active?`<span class="count">${active}</span>`:''}</a>`).join('');
}
function go(view){
  if(!NAV.some(n=>n[0]===view)&&view!=='diagnostico')view='compartilhar';
  if(S.view!==view&&INSP.kind&&!(INSP.kind==='device'&&['compartilhar','dispositivos'].includes(view))&&!(INSP.kind==='activity'&&view==='atividade'))closeInspector();
  S.view=view;$$('[data-view]').forEach(v=>v.hidden=v.dataset.view!==view);renderNav();
  if(view==='atividade')renderActivity(); if(view==='caixa')renderInbox(); if(view==='dispositivos')renderDevList(); if(view==='diagnostico')renderDiag();
  requestAnimationFrame(()=>$$('.seg').forEach(placeInd));
}
addEventListener('hashchange',()=>{const h=location.hash.slice(1);go(h==='sobre'?'configuracoes':h)});

/* ===================== Este aparelho ===================== */
const AUTO={off:'Sempre perguntar',fav:'Somente favoritos',all:'Qualquer aparelho da rede'};
const NET_TXT={conectado:'visível na rede',conectando:'conectando ao servidor…',reconectando:'reconectando ao servidor…',desconectado:'sem conexão com o servidor','sem-webrtc':'navegador sem suporte a conexão direta','outra-aba':'aberto em outra aba','sem-sala':'escolha uma sala'};
function statusLocal(){return S.net!=='conectado'?NET_TXT[S.net]||'sem conexão':S.visible?'visível na rede':'oculto'}
function renderThisDevice(){
  $$('[data-this-device]').forEach(el=>{el.innerHTML=`
    <div class="td-head"><span class="td-icon">${svgI(devIcon(ME.type))}<span class="dot ${S.visible&&S.net==='conectado'?'':'off'}"></span></span>
      <div><div class="td-name"><button class="td-name-btn" data-open-me title="Detalhes deste aparelho">${esc(ME.name)}</button></div><div class="td-sub">Este aparelho · ${statusLocal()}</div></div></div>
    <div class="td-row"><span>Visível</span><button class="switch" role="switch" aria-checked="${S.visible}" aria-label="Visível na rede" data-vis></button></div>
    <div class="td-row stack"><label>Receber automaticamente de</label><select class="select" data-auto aria-label="Receber automaticamente">${Object.entries(AUTO).map(([k,v])=>`<option value="${k}" ${S.auto===k?'selected':''}>${v}</option>`).join('')}</select></div>
    <div class="td-actions"><button class="link-btn" data-open-me>Detalhes</button></div>`});
  const sel=$('[data-auto-select]');if(sel)sel.innerHTML=Object.entries(AUTO).map(([k,v])=>`<option value="${k}" ${S.auto===k?'selected':''}>${v}</option>`).join('');
}
document.addEventListener('click',e=>{if(e.target.closest('[data-open-me]')){openInspector('me');return}const v=e.target.closest('[data-vis]');if(v){S.visible=!S.visible;salvarPrefs();REDE.atualizarPerfil({visivel:S.visible}).catch(()=>{});renderThisDevice();refreshBrand();toast(S.visible?'Este aparelho está visível na rede':'Este aparelho está oculto: os outros não o encontram nem enviam pedidos')}});
document.addEventListener('change',e=>{
  if(e.target.matches('[data-auto],[data-auto-select]')){S.auto=e.target.value;salvarPrefs();renderThisDevice();
    if(S.auto==='all')toast('Atenção: qualquer aparelho da rede poderá enviar arquivos para cá sem pedir confirmação.');}
});

/* ===================== Segmentados ===================== */
function placeInd(seg){const on=seg.querySelector('[aria-checked="true"]'),ind=seg.querySelector('.ind');if(!on||!ind||!seg.offsetParent)return;ind.style.left=on.offsetLeft+'px';ind.style.width=on.offsetWidth+'px'}
function setSeg(seg,attr,val){$$('button[role=radio]',seg).forEach(b=>b.setAttribute('aria-checked',String(b.dataset[attr]===val)));placeInd(seg)}
const elOf=e=>e.target instanceof Element?e.target:document.body;
document.addEventListener('keydown',e=>{const seg=elOf(e).closest('.seg');if(!seg||!['ArrowLeft','ArrowRight'].includes(e.key))return;const bs=$$('button[role=radio]',seg),i=bs.indexOf(e.target);if(i<0)return;const n=bs[(i+(e.key==='ArrowRight'?1:bs.length-1))%bs.length];n.focus();n.click();e.preventDefault()});
addEventListener('resize',()=>$$('.seg').forEach(placeInd));

/* ===================== Modo de envio ===================== */
$('[data-mode]').addEventListener('click',e=>{const b=e.target.closest('[data-mode-val]');if(!b)return;setMode(b.dataset.modeVal)});
function setMode(m){
  S.mode=m;setSeg($('[data-mode]'),'modeVal',m);S.picked.clear();
  const touch=matchMedia('(hover: none)').matches;
  $('[data-hint]').innerHTML=m==='one'?(touch?'Toque em um bloco para adicionar conteúdo. Depois, toque no aparelho para enviar.':`Arraste arquivos para qualquer lugar da janela ou cole com <kbd>${isMac?'⌘':'Ctrl'} V</kbd>. No modo <strong>Um destino</strong>, basta tocar no aparelho para enviar.`):'Selecione os aparelhos e envie para todos de uma vez. A seleção continua depois do envio.';
  renderGrid();renderMultiBar();
}

/* ===================== Seleção ===================== */
function addItems(items){
  const before=S.selection.length;let dup=0;
  items.forEach(it=>{if(S.selection.some(s=>s.name===it.name&&s.size===it.size&&s.kind===it.kind)){dup++;return}S.selection.push({id:Math.random().toString(36).slice(2),...it})});
  renderTray();if(dup)toast(dup===1?'1 item repetido não foi adicionado':`${dup} itens repetidos não foram adicionados`);
  return S.selection.length-before;
}
function filesToItems(list){return[...list].map(f=>({file:f,name:f.webkitRelativePath||f.name,size:f.size,kind:kindOf(f.name,f.type),thumb:/^image\//.test(f.type)?URL.createObjectURL(f):null}))}
function textItem(t){t=t.trim();if(!t)return null;const isUrl=/^[a-z][a-z0-9+.-]*:\/\/\S+$/i.test(t);return{name:isUrl?t:t.slice(0,40),body:t,size:new Blob([t]).size,kind:isUrl?'link':'text'}}
function renderTray(){
  const tray=$('[data-tray]'),n=S.selection.length;tray.hidden=!n||!$('[data-send-panel]').hidden;
  const total=S.selection.reduce((a,s)=>a+s.size,0);
  $('[data-tray-sum]').textContent=n===1?'1 item':`${n} itens`;$('[data-tray-size]').textContent=fmtBytes(total);
  $('[data-thumbs]').innerHTML=S.selection.map((s,i)=>`<div class="thumb ${s.kind==='text'||s.kind==='link'?s.kind:''}" style="animation-delay:${Math.min(i,8)*30}ms">
    <div class="box">${s.thumb?`<img src="${s.thumb}" alt="">`:s.kind==='text'||s.kind==='link'?`<span>${s.kind==='link'?svgI('link','s16')+' ':''}${esc(s.body.slice(0,90))}</span>`:svgI(s.kind==='video'?'video':'file','s24')}</div>
    ${s.kind==='text'||s.kind==='link'?'':`<span class="nm" title="${esc(s.name)}">${esc(truncMid(s.name.split('/').pop(),14))}</span>`}
    <button class="rm" data-rm="${s.id}" aria-label="Remover ${esc(s.name)}">${svgI('x','s16')}</button></div>`).join('');
  renderMultiBar();
}
$('[data-thumbs]').addEventListener('click',e=>{const b=e.target.closest('[data-rm]');if(!b)return;S.selection=S.selection.filter(s=>s.id!==b.dataset.rm);renderTray()});
$('[data-tray-clear]').addEventListener('click',()=>{S.selection=[];renderTray();toast('Seleção limpa')});

/* Origens */
$('.sources').addEventListener('click',async e=>{const b=e.target.closest('[data-src]');if(!b)return;const s=b.dataset.src;
  if(s==='file')$('[data-file-input]').click();
  else if(s==='folder')$('[data-folder-input]').click();
  else if(s==='media')$('[data-media-input]').click();
  else if(s==='text'||s==='link')openEditor(s);
  else if(s==='paste')pasteFromClipboard();
});
['[data-file-input]','[data-folder-input]','[data-media-input]'].forEach(sel=>$(sel).addEventListener('change',e=>{const n=addItems(filesToItems(e.target.files));if(n)toast(`${n} ${n===1?'item adicionado':'itens adicionados'}`);e.target.value=''}));
function openEditor(kind){const ed=$('[data-editor]');ed.hidden=false;ed.dataset.kind=kind;$('[data-editor-label]').textContent=kind==='link'?'Link para enviar':'Texto para enviar';$('[data-editor-text]').placeholder=kind==='link'?'https://…':'Escreva ou cole aqui…';$('[data-editor-text]').focus()}
function closeEditor(){$('[data-editor]').hidden=true;$('[data-editor-text]').value=''}
$('[data-editor-cancel]').addEventListener('click',closeEditor);
$('[data-editor-add]').addEventListener('click',addFromEditor);
$('[data-editor-text]').addEventListener('keydown',e=>{if(e.key==='Enter'&&(e.ctrlKey||e.metaKey)){e.preventDefault();addFromEditor()}});
function addFromEditor(){const it=textItem($('[data-editor-text]').value);if(!it){toast('Escreva algo antes de adicionar');return}addItems([it]);closeEditor()}
async function pasteFromClipboard(){try{const t=await navigator.clipboard.readText();const it=textItem(t);if(it){addItems([it]);toast('Conteúdo colado na seleção')}else toast('A área de transferência está vazia')}catch{toast(`Use ${isMac?'⌘':'Ctrl'}+V para colar (o navegador bloqueou a leitura direta)`)}}
document.addEventListener('paste',e=>{if(elOf(e).closest('textarea,input'))return;const files=e.clipboardData.files;if(files&&files.length){addItems(filesToItems(files));go('compartilhar');toast('Colado na seleção');return}const it=textItem(e.clipboardData.getData('text'));if(it){addItems([it]);go('compartilhar');toast('Colado na seleção')}});

/* Arrastar e soltar */
let dragDepth=0;
addEventListener('dragenter',e=>{if(![...e.dataTransfer.types].includes('Files'))return;dragDepth++;$('[data-drop]').hidden=false});
addEventListener('dragleave',()=>{dragDepth=Math.max(0,dragDepth-1);if(!dragDepth)$('[data-drop]').hidden=true});
addEventListener('dragover',e=>{e.preventDefault();$$('.card').forEach(c=>c.classList.toggle('dragover',c.contains(e.target)&&!c.classList.contains('offline')))});
addEventListener('drop',e=>{e.preventDefault();dragDepth=0;$('[data-drop]').hidden=true;$$('.card.dragover').forEach(c=>c.classList.remove('dragover'));
  $('.capture')?.classList.remove('drag');if(S.view==='caixa'&&e.dataTransfer.files.length){inboxAddFiles(e.dataTransfer.files);return}
  const items=filesToItems(e.dataTransfer.files);if(!items.length)return;go('compartilhar');addItems(items);
  const card=e.target.closest('.card[data-dev]');if(card){const d=DEVICES.find(x=>x.id===card.dataset.dev);if(d&&d.online)sendTo(d)}});

/* ===================== Destinos ===================== */
// Os aparelhos vêm da presença real (servidor local). Favoritos ficam guardados neste navegador.
const TABS=[['nearby','Por perto'],['fav','Favoritos']];
const daAba=d=>S.tab==='fav'?d.fav:d.online;
const combina=(d,q)=>!q||norm(`${d.name} ${d.meta} ${TIPOS[d.type]||''} ${d.id} ${idCurto(d.id)}`).includes(norm(q.replace(/^#|^id\s*/i,'').trim())||norm(q));
function visibleDevices(){return DEVICES.filter(d=>daAba(d)&&combina(d,S.q))}
function renderTabs(){const cnt={nearby:DEVICES.filter(d=>d.online).length,fav:DEVICES.filter(d=>d.fav).length};
  $('[data-tabs]').innerHTML=TABS.map(([k,l])=>`<button class="tab" role="tab" aria-selected="${S.tab===k}" data-tab="${k}">${l}<span class="n">${cnt[k]}</span></button>`).join('')}
$('[data-tabs]').addEventListener('click',e=>{const b=e.target.closest('[data-tab]');if(!b)return;S.tab=b.dataset.tab;renderTabs();renderGrid()});
function sincronizarAparelhos(lista){
  const on=new Set(lista.map(a=>a.id));
  DEVICES=lista.map(a=>({id:a.id,name:a.nome,type:a.tipo,meta:a.so||'Aparelho',route:'local',online:true,fav:S.favs.has(a.id)}));
  let mudou=false;
  lista.forEach(a=>{if(S.favs.has(a.id)){const i=S.favInfo[a.id];if(!i||i.name!==a.nome||i.type!==a.tipo||i.meta!==a.so||Date.now()-i.seen>6e4){S.favInfo[a.id]={name:a.nome,type:a.tipo,meta:a.so||'Aparelho',seen:Date.now()};mudou=true}}});
  S.favs.forEach(id=>{if(!on.has(id)&&S.favInfo[id])DEVICES.push({id,name:S.favInfo[id].name,type:S.favInfo[id].type,meta:S.favInfo[id].meta,route:'offline',online:false,seen:`visto ${rel(S.favInfo[id].seen)}`,fav:true})});
  S.picked.forEach(id=>{if(!on.has(id))S.picked.delete(id)});
  if(mudou)salvarPrefs();
  $('[data-scan-text]').textContent=statusBusca();
  renderGrid();renderMultiBar();if(S.view==='dispositivos')renderDevList();if(INSP.kind==='device')renderInspector();
}
function statusBusca(){if(S.net!=='conectado')return NET_TXT[S.net]?NET_TXT[S.net][0].toUpperCase()+NET_TXT[S.net].slice(1):'Sem conexão';const n=DEVICES.filter(d=>d.online).length;const onde=SALA?'sala':'rede';return n===0?`Nenhum aparelho encontrado nesta ${onde}`:`${n} ${n===1?'aparelho encontrado':'aparelhos encontrados'} nesta ${onde} · agora`}
function cardHTML(d,i){
  return `<button class="card ${d.online?'':'offline'} ${S.picked.has(d.id)?'selected':''}" data-dev="${d.id}" style="animation-delay:${Math.min(i,8)*30}ms"
    aria-label="${S.mode==='many'?'Selecionar':'Enviar para'} ${esc(d.name)}, ${esc(d.meta)}, ${d.online?'rota local, online':'offline'}">
    <span class="dev-icon">${svgI(devIcon(d.type),'s24')}<span class="dot ${d.online?'':'off'}"></span></span>
    <span><span class="name">${esc(d.name)}</span>
      <span class="meta">${esc(d.meta)}${d.name.toUpperCase().includes(idCurto(d.id))?'':` · ID ${idCurto(d.id)}`}</span>
      <span class="badges">${routeBadge(d)}</span></span>
    <span class="tail"><span class="fav ${d.fav?'on':''}" data-fav="${d.id}" role="button" tabindex="-1" aria-label="${d.fav?'Remover dos':'Adicionar aos'} favoritos">${svgI('heart')}</span><span class="info" data-info="${d.id}" role="button" tabindex="-1" title="Detalhes (clique com o botão direito no cartão)" aria-label="Detalhes de ${esc(d.name)}">${svgI('info','s16')}</span></span>
    <span class="check">${svgI('check','s16')}</span>
    <span class="inline-progress"><span class="bar"><i></i></span><span class="meta mono" data-inline-txt></span></span>
  </button>`}
function renderGrid(){
  renderTabs();const list=visibleDevices(),g=$('[data-grid]');
  if(!list.length){
    let vazio;
    if(S.q&&DEVICES.some(daAba))vazio=`<h3>Nenhum aparelho corresponde à busca</h3><p style="margin:0">Nada em “${esc(S.q)}”. A busca vale para o nome, o sistema, o tipo e o ID do aparelho.</p><div class="row-end" style="justify-content:center"><button class="btn btn-secondary btn-sm" data-dev-clear>Limpar busca</button></div>`;
    else if(S.tab==='fav')vazio=`<h3>Nenhum favorito ainda</h3><p style="margin:0">Toque no coração de um aparelho para encontrá-lo mais rápido. Favoritos offline continuam na lista.</p>`;
    else if(S.net==='sem-sala')vazio=`<h3>Entre numa sala</h3><p style="margin:0">Para encontrar os seus aparelhos, use o mesmo código de sala em todos eles. Crie um código novo e envie o convite para o outro aparelho, ou digite o código que você já tem.</p><div class="row-end" style="justify-content:center;gap:8px;flex-wrap:wrap"><input class="ren" data-sala-input placeholder="código ou link de convite" maxlength="200" aria-label="Código da sala" style="width:230px"><button class="btn btn-primary btn-sm" data-sala-entrar>Entrar</button><button class="btn btn-secondary btn-sm" data-sala-gerar>Criar sala nova</button></div>`;
    else if(S.net!=='conectado')vazio=`<h3>${S.net==='conectando'||S.net==='reconectando'?'Conectando ao servidor local…':'Sem conexão com o servidor local'}</h3><p style="margin:0">${S.net==='sem-webrtc'?'Este navegador não permite conexão direta entre aparelhos. Use uma versão atual do Chrome, Edge, Firefox ou Safari.':S.net==='outra-aba'?'O ERASÓ já está aberto em outra aba deste navegador. Feche a outra aba e recarregue esta.':'O ERASÓ precisa do servidor local para encontrar aparelhos. Confira se ele está em execução e se este aparelho está na mesma rede.'}</p><div class="row-end" style="justify-content:center"><button class="btn btn-secondary btn-sm" data-scan>${svgI('refresh','s16')}Tentar novamente</button><button class="btn btn-ghost btn-sm" data-goto-diag>Diagnosticar</button></div>`;
    else vazio=`<h3>Nenhum aparelho encontrado</h3><p style="margin:0">Abra o ERASÓ em outro aparelho conectado à mesma rede, no endereço <span class="mono">${esc(location.origin)}</span>. Ele aparece aqui assim que ficar visível.</p><div class="row-end" style="justify-content:center"><button class="btn btn-secondary btn-sm" data-scan>${svgI('refresh','s16')}Buscar novamente</button><button class="btn btn-ghost btn-sm" data-goto-diag>Diagnosticar</button></div>`;
    g.innerHTML=`<div class="empty" style="grid-column:1/-1">${trailSVG('pending')}${vazio}</div>`;hydrateIcons(g);return}
  g.innerHTML=list.map(cardHTML).join('');
}
function trailSVG(state){return `<svg viewBox="0 0 160 24" width="160" height="24" aria-hidden="true" style="overflow:visible"><line x1="12" y1="12" x2="148" y2="12" stroke="var(--trail-pending)" stroke-width="2" stroke-dasharray="2 6" stroke-linecap="round"/><circle cx="12" cy="12" r="7" fill="var(--trail-origin)"/><circle cx="148" cy="12" r="7" fill="${state==='pending'?'none':'var(--trail-dest)'}" stroke="var(--trail-dest)" stroke-width="2"/></svg>`}
$('[data-grid]').addEventListener('click',e=>{
  const inf=e.target.closest('[data-info]');if(inf){e.stopPropagation();openInspector('device',inf.dataset.info);return}
  const fav=e.target.closest('[data-fav]');if(fav){e.stopPropagation();alternarFavorito(fav.dataset.fav,true);return}
  const c=e.target.closest('[data-dev]');if(!c)return;const d=DEVICES.find(x=>x.id===c.dataset.dev);if(!d)return;
  if(!d.online){toast(`${d.name} está offline (${d.seen}). Quando ele voltar à rede, você poderá enviar.`);return}
  if(S.mode==='many'){S.picked.has(d.id)?S.picked.delete(d.id):S.picked.add(d.id);c.classList.toggle('selected');renderMultiBar();return}
  sendTo(d);
});
function alternarFavorito(id,comDesfazer){
  const d=DEVICES.find(x=>x.id===id);const ja=S.favs.has(id);
  if(ja){S.favs.delete(id)}else{S.favs.add(id);if(d)S.favInfo[id]={name:d.name,type:d.type,meta:d.meta,seen:Date.now()}}
  salvarPrefs();sincronizarAparelhos(DEVICES.filter(x=>x.online).map(x=>({id:x.id,nome:x.name,tipo:x.type,so:x.meta})));
  const nome=d?d.name:(S.favInfo[id]&&S.favInfo[id].name)||'Aparelho';
  toast(ja?`${nome} removido dos favoritos`:`${nome} adicionado aos favoritos`,comDesfazer?'Desfazer':null,()=>alternarFavorito(id,false));
}
function renderMultiBar(){const bar=$('[data-multi-bar]');const n=S.picked.size;bar.hidden=!(S.mode==='many'&&n);if(!n)return;
  $('[data-multi-text]').textContent=S.selection.length?`${S.selection.length} ${S.selection.length===1?'item':'itens'} · ${fmtBytes(S.selection.reduce((a,s)=>a+s.size,0))}`:'Adicione algo para enviar';
  $('[data-multi-btn]').textContent=`Enviar para ${n} ${n===1?'aparelho':'aparelhos'}`}
$('[data-multi-send]').addEventListener('click',()=>{if(!S.selection.length){nudgeComposer();return}
  const alvo=[...S.picked].map(id=>DEVICES.find(x=>x.id===id)).filter(d=>d&&d.online);if(!alvo.length){toast('Os aparelhos escolhidos não estão mais na rede');return}
  alvo.forEach(d=>iniciarEnvio(d,S.selection.map(s=>({...s})),{inline:true}));toast(`Enviando para ${alvo.length} ${alvo.length===1?'aparelho':'aparelhos'}`)});

/* Descoberta (real): pede ao servidor a lista atual de aparelhos visíveis */
async function scan(){if(S.scanning)return;S.scanning=true;$('[data-scan-status]').classList.add('scanning');$('[data-scan-text]').textContent='Procurando…';refreshBrand();
  try{await REDE.buscar();techlog('info','Busca concluída')}catch(e){techlog('error',`Busca falhou: ${e.message}`);toast(`Não foi possível buscar: ${e.message}`)}
  S.scanning=false;$('[data-scan-status]').classList.remove('scanning');$('[data-scan-text]').textContent=statusBusca();refreshBrand();renderGrid()}
function tirarSalaDaUrl(){if(!/[?&]sala=/.test(location.search))return;const u=new URLSearchParams(location.search);u.delete('sala');const q=u.toString();history.replaceState(null,'',location.pathname+(q?'?'+q:'')+location.hash)}
function entrarNaSala(texto){const c=salaDoTexto(texto);if(c&&!SALA_OK.test(c)){toast('O código da sala tem de 8 a 32 letras minúsculas e números.');return false}
  SALA=c;salvarPrefs();tirarSalaDaUrl();REDE.entrarNaSala(SALA);techlog('info',SALA?'Entrou na sala':'Saiu da sala');renderSettingsBits();if(INSP.kind==='me')renderInspector();return true}
document.addEventListener('click',e=>{const t=e.target;
  if(t.closest('[data-sala-entrar]')){const i=t.closest('[data-grid],.set-row')?.querySelector('[data-sala-input]')||$('[data-sala-input]');if(!i||!i.value.trim()){toast('Digite o código da sala ou crie uma nova.');return}if(entrarNaSala(i.value))toast('Você entrou na sala');return}
  if(t.closest('[data-sala-gerar]')){const c=novaSala();entrarNaSala(c);copiar(conviteDaSala(),'Sala criada. O link de convite foi copiado: abra-o no outro aparelho.');return}
  if(t.closest('[data-sala-copiar]')){if(SALA)copiar(conviteDaSala(),'Convite copiado');return}
  if(t.closest('[data-sala-sair]')){entrarNaSala('');toast(REDE.config.salaObrigatoria?'Você saiu da sala':'Você saiu da sala. Agora vê todos os aparelhos da rede.');return}
});
document.addEventListener('input',e=>{if(e.target.matches('[data-dev-q]')){S.q=e.target.value;renderGrid()}});
document.addEventListener('click',e=>{if(e.target.closest('[data-dev-clear]')){S.q='';const i=$('[data-dev-q]');if(i){i.value='';i.focus()}renderGrid();return}if(e.target.closest('[data-scan]')){if(S.net!=='conectado')REDE.conectar();scan()}});

/* ===================== Envio ===================== */
// Tudo o que aparece aqui reflete o estado REAL da conexão (ErasoRede): conectando, aguardando resposta, PIN, transferindo, recusado, falha.
function nudgeComposer(){const c=$('[data-composer]');c.classList.add('attention');toast('Primeiro escolha o que enviar');setTimeout(()=>c.classList.remove('attention'),1200);$('.source').focus()}
const LIMITE_TEXTO=100000;
function paraRede(itens){return itens.map(it=>it.kind==='text'||it.kind==='link'?{kind:it.kind,name:it.name,size:it.size,body:it.body}:{kind:'file',name:it.name,size:it.size,file:it.file})}
function validarSelecao(itens){
  for(const it of itens){
    if((it.kind==='text'||it.kind==='link')&&it.size>LIMITE_TEXTO){toast('Um dos textos passa de 100 kB. Envie como arquivo.');return false}
    if(it.kind!=='text'&&it.kind!=='link'&&!(it.file instanceof Blob)){toast(`"${it.name}" não está mais disponível. Adicione o arquivo de novo.`);return false}
    if(it.kind!=='text'&&it.kind!=='link'&&it.size===0){toast(`"${it.name}" está vazio e não pode ser enviado.`);return false}
  }
  return true}
const parRede=d=>({id:d.id,nome:d.name,tipo:d.type});
function sendTo(d){
  if(!S.selection.length){nudgeComposer();return}
  if(S.sending){toast('Aguarde a resposta do envio atual');return}
  const itens=S.selection.map(s=>({...s}));if(!validarSelecao(itens))return;
  if(S.net!=='conectado'){toast('Sem conexão com o servidor local. Use "Diagnosticar" para ver o que houve.');return}
  S.sending=true;refreshBrand();closeEditor();
  const panel=$('[data-send-panel]');$('[data-tray]').hidden=true;panel.hidden=false;
  panel.innerHTML=`<div class="send-panel">
    <div class="trail-wrap">
      <div class="endpoint origin"><span class="ep-icon">${svgI(devIcon(ME.type))}</span><span>${esc(ME.name)}<br><span class="faint">Este aparelho</span></span></div>
      <svg class="trail" viewBox="0 0 300 24" preserveAspectRatio="none" aria-hidden="true"><line class="base" x1="4" y1="12" x2="296" y2="12"/><line class="line" x1="4" y1="12" x2="296" y2="12"/>${reduced()?'':'<circle class="ember" r="5" cy="12"><animate attributeName="cx" values="4;296" dur="1.6s" begin="0.4s" repeatCount="indefinite"/></circle>'}</svg>
      <div class="endpoint dest"><span class="ep-icon">${svgI(devIcon(d.type))}</span><span>${esc(d.name)}<br>${routeBadge(d)}</span></div>
    </div>
    <div class="send-status" data-send-status role="status">Conectando a ${esc(d.name)}…</div>
    <div class="row-end"><button class="btn btn-secondary btn-sm" data-send-cancel>Cancelar</button></div></div>`;
  const card=$(`.card[data-dev="${d.id}"]`);card&&card.classList.add('waiting');
  const envio=tratarEnvio(d,itens,{painel:panel});
  panel.querySelector('[data-send-cancel]').onclick=()=>{if(['recusado','falhou','cancelado','concluido'].includes(envio.status))envio._fecharPainel();else envio.cancelar()};
}
function iniciarEnvio(d,itens,o={}){if(!validarSelecao(itens))return null;if(S.net!=='conectado'){toast('Sem conexão com o servidor local.');return null}return tratarEnvio(d,itens,{painel:null,inline:!!o.inline})}
function tratarEnvio(d,itens,{painel,inline=false}){
  const total=itens.reduce((a,s)=>a+s.size,0);let t=null,fechado=false;
  const st=()=>painel&&painel.querySelector('[data-send-status]');
  const fimPainel=()=>{if(fechado||!painel)return;fechado=true;S.sending=false;painel.hidden=true;painel.innerHTML='';$$('.card.waiting').forEach(c=>c.classList.remove('waiting'));renderTray();refreshBrand()};
  const falhaPainel=(msg)=>{const el=st();if(!el)return;el.textContent=msg;el.classList.add('bad');painel.querySelector('.trail')?.classList.add('refused');painel.querySelector('.ember')?.remove();painel.querySelector('[data-pin-box]')?.remove();painel.querySelector('[data-send-cancel]').textContent='Fechar';setBrand('attention');setTimeout(fimPainel,3600)};
  const envio=REDE.enviar(parRede(d),paraRede(itens));envio._fecharPainel=fimPainel;
  if(!painel){t=criarTransferencia('out',d,itens,total,{inline,status:'pending',envio})}
  envio.onprogresso=(n)=>{if(t)progresso(t,n)};
  envio.onpin=(restam)=>{if(painel)pedirPin(envio,painel,d,restam,fimPainel);else{finalizar(t,'failed',`${d.name} exige PIN. Envie por "Um destino" para digitá-lo.`);envio.cancelar()}};
  envio.onstatus=(s,erro)=>{
    if(s==='conectando'&&st())st().textContent=`Conectando a ${d.name}…`;
    else if(s==='aguardando'){if(st()){st().textContent=`Aguardando ${d.name} aceitar…`;painel.querySelector('[data-pin-box]')?.remove()}if(t){t.status='pending';updateRow(t)}}
    else if(s==='transferindo'){
      if(st()){st().textContent=`${d.name} aceitou`;st().classList.remove('bad');painel.querySelector('.endpoint.dest')?.classList.add('landed');painel.querySelector('.ember')?.remove();painel.querySelector('[data-pin-box]')?.remove()}
      if(t){t.status='active';t.started=Date.now();t.lastSpeedAt=t.started;updateRow(t);renderDock(true)}else t=criarTransferencia('out',d,itens,total,{inline,status:'active',envio});
      if(painel){if(S.mode==='one')S.selection=[];setTimeout(()=>{fimPainel();renderTray()},520)}
    }
    else if(s==='concluido'){if(t)finalizar(t,'ok');fimPainel()}
    else if(s==='recusado'){
      if(t)finalizar(t,'declined');else{registrarAtividade({dir:'out',title:tituloItens(itens),kind:itens[0].kind,size:total,peer:d.name,peerId:d.id,status:'declined',body:itens.length===1?itens[0].body:undefined});falhaPainel(`${d.name} recusou o envio.`)}
      if(!t)toast(`${d.name} recusou o envio`)}
    else if(s==='falhou'){
      if(t)finalizar(t,'failed',erro);else{registrarAtividade({dir:'out',title:tituloItens(itens),kind:itens[0].kind,size:total,peer:d.name,peerId:d.id,status:'failed',erro,body:itens.length===1?itens[0].body:undefined});falhaPainel(erro||'O envio falhou.')}
      techlog('error',`Envio para ${d.name} falhou: ${erro}`)}
    else if(s==='cancelado'){if(t)finalizar(t,'canceled');else toast('Envio cancelado');fimPainel()}
  };
  return envio}
const tituloItens=itens=>itens.length===1?itens[0].name:`${itens.length} itens`;
/* PIN pedido pelo destino: o destino confere o PIN de verdade (3 tentativas, depois bloqueio de 1 minuto) */
function pedirPin(envio,painel,d,restam,fimPainel){
  const el=painel.querySelector('[data-send-status]');if(!el)return;painel.querySelector('[data-pin-box]')?.remove();
  const primeira=restam>=2&&!envio._pinPedido;envio._pinPedido=true;
  el.textContent=`${d.name} exige um PIN. Peça o PIN a quem usa esse aparelho.`;
  const box=document.createElement('div');box.dataset.pinBox='';box.setAttribute('data-pin-box','');box.style.cssText='display:grid;gap:8px;justify-items:center';
  box.innerHTML=`<div class="pin-boxes" role="group" aria-label="PIN de 4 dígitos">${[0,1,2,3].map(i=>`<input inputmode="numeric" maxlength="4" data-pin="${i}" aria-label="Dígito ${i+1} de 4" autocomplete="off">`).join('')}</div>
    <p class="pin-err" data-pin-err ${primeira?'hidden':''} style="margin:0;color:var(--danger);font-size:13px;display:flex;gap:6px;align-items:center">${svgI('alert','s16')}<span>PIN incorreto · ${restam} ${restam===1?'tentativa restante':'tentativas restantes'}</span></p>`;
  el.after(box);const ins=$$('[data-pin]',box);ins[0].focus();
  box.addEventListener('input',e=>{const i=e.target.closest('[data-pin]');if(!i)return;const k=+i.dataset.pin;let v=i.value.replace(/\D/g,'');box.querySelector('.pin-boxes').classList.remove('bad');
    if(v.length>1){[...v].slice(0,4-k).forEach((c,j)=>ins[k+j].value=c);ins[Math.min(3,k+v.length-1)].focus()}else{i.value=v;if(v&&k<3)ins[k+1].focus()}
    const code=ins.map(x=>x.value).join('');if(code.length===4){ins.forEach(x=>x.disabled=true);envio.enviarPin(code)}});
  box.addEventListener('keydown',e=>{const i=e.target.closest('[data-pin]');if(i&&e.key==='Backspace'&&!i.value&&+i.dataset.pin>0)ins[+i.dataset.pin-1].focus()});
}

/* ===================== Transferências + doca ===================== */
function criarTransferencia(dir,peer,items,total,o={}){
  const t={id:ErasoRede.aleatorio(8),dir,peer:{id:peer.id,name:peer.name,type:peer.type,route:'local'},items,total:Math.max(total,1),done:0,status:o.status||'active',started:Date.now(),lastSpeedAt:Date.now(),lastDone:0,speed:0,inline:!!o.inline,envio:o.envio||null,rec:o.rec||null,erro:''};
  S.transfers.unshift(t);renderDock(true);renderNav();refreshBrand();
  if(t.inline){const c=$(`.card[data-dev="${peer.id}"]`);c&&c.classList.add('sending')}
  return t}
function progresso(t,feito){
  t.done=Math.min(t.total,Math.max(t.done,feito));const agora=Date.now();
  if(agora-t.lastSpeedAt>=500){const inst=(t.done-t.lastDone)/((agora-t.lastSpeedAt)/1000);t.speed=t.speed?t.speed*0.6+inst*0.4:inst;t.lastSpeedAt=agora;t.lastDone=t.done}
  updateRow(t);updateDockHead()}
function rowHTML(t){
  const it=t.items[0],name=t.items.length===1?it.name.split('/').pop():`${t.items.length} itens`;
  return `<div class="trow ${t.status==='failed'?'failed':''}" role="listitem" data-row="${t.id}">
    <span class="ticon">${it.thumb?`<img src="${it.thumb}" alt="">`:svgI(it.kind==='video'?'video':it.kind==='image'?'image':it.kind==='link'?'link':it.kind==='text'?'text':'file')}</span>
    <div class="tt"><div class="tn" title="${esc(name)}">${t.dir==='out'?'↑':'↓'} ${esc(truncMid(name,30))}</div>
      <div class="bar ${t.status==='ok'?'done':t.status==='failed'?'error':t.status==='canceled'||t.status==='declined'?'canceled':''}"><i style="transform:scaleX(${t.done/t.total})"></i></div>
      <div class="ts" data-ts>${statusText(t)}</div></div>
    <div data-ract>${rowActions(t)}</div></div>`}
function statusText(t){
  const who=(t.dir==='out'?'para ':'de ')+esc(t.peer.name),rb=routeBadge(t.peer,true);
  if(t.status==='pending')return `<span>Aguardando ${esc(t.peer.name)} aceitar…</span>${rb}`;
  if(t.status==='active'){const pct=Math.floor(t.done/t.total*100),rem=t.speed>0?(t.total-t.done)/t.speed:0;return `<span class="mono">${pct}%${t.speed>0?` · ${fmtBytes(t.speed)}/s · ${fmtTime(rem)}`:''}</span>${rb}<span>${who}</span>`}
  if(t.status==='ok')return `<span class="state-ok">${svgI('check','s16')}Concluído</span><span class="mono">${fmtBytes(t.total)}</span>${rb}<span>${who}</span>`;
  if(t.status==='failed')return `<span class="state-bad">${svgI('alert','s16')}${esc(t.erro||'Falhou')}</span>${rb}`;
  if(t.status==='declined')return `<span class="state-bad">${svgI('x','s16')}Recusado por ${esc(t.peer.name)}</span>`;
  if(t.status==='canceled')return `<span>Cancelado</span>${rb}<span>${who}</span>`;return''}
function rowActions(t){
  if(t.status==='active'||t.status==='pending')return `<button class="icon-btn" data-cancel="${t.id}" aria-label="Cancelar">${svgI('x')}</button>`;
  if((t.status==='failed'||t.status==='declined')&&t.dir==='out')return `<button class="btn btn-secondary btn-sm" data-retry="${t.id}">${svgI('retry','s16')}Tentar de novo</button>`;
  return''}
function updateRow(t){const r=$(`[data-row="${t.id}"]`);if(r){r.querySelector('.bar>i').style.transform=`scaleX(${t.done/t.total})`;r.querySelector('[data-ts]').innerHTML=statusText(t)}
  if(t.inline){const c=$(`.card[data-dev="${t.peer.id}"]`);if(c){const b=c.querySelector('.inline-progress .bar>i');if(b)b.style.transform=`scaleX(${t.done/t.total})`;const x=c.querySelector('[data-inline-txt]');if(x)x.textContent=t.status==='active'?`${Math.floor(t.done/t.total*100)}% · ${fmtBytes(t.speed||0)}/s`:''}}}
function finalizar(t,status,erro=''){
  if(!t||['ok','failed','canceled','declined'].includes(t.status))return;
  t.status=status;t.erro=erro;if(status==='ok')t.done=t.total;
  const r=$(`[data-row="${t.id}"]`);if(r)r.outerHTML=rowHTML(t);
  if(t.inline){const c=$(`.card[data-dev="${t.peer.id}"]`);if(c){c.classList.remove('sending')}}
  const nome=t.items.length===1?t.items[0].name.split('/').pop():`${t.items.length} itens`,seg=(Date.now()-t.started)/1000;
  registrarAtividade({dir:t.dir,title:nome,kind:t.items[0].kind,size:t.total,peer:t.peer.name,peerId:t.peer.id,status,erro,duration:seg,speed:seg>0?t.total/seg:0,items:t.items,integridade:status==='ok'&&t.dir==='in'&&t.verif===true?'conferida':'',
    body:t.items.length===1&&(t.items[0].kind==='text'||t.items[0].kind==='link')?t.items[0].body:undefined});
  techlog(status==='ok'?'info':status==='failed'?'error':'warn',`${t.dir==='out'?'Envio para':'Recebimento de'} ${t.peer.name}: ${{ok:'concluído',failed:'falhou ('+erro+')',canceled:'cancelado',declined:'recusado'}[status]} · ${fmtBytes(t.total)}`);
  if(status==='ok'){setBrand('done');toast(t.dir==='out'?`Enviado para ${t.peer.name}`:`Recebido de ${t.peer.name} · salvo pelo navegador`);announce(`${t.dir==='out'?'Envio':'Recebimento'} concluído`)}
  else if(status==='failed'){setBrand('attention');const dk=$('[data-dock]');dk.classList.remove('collapsed');dk.classList.add('error');toast(`Falha: ${erro||'a transferência não foi concluída'}`)}
  else if(status==='canceled')toast('Transferência cancelada');
  else if(status==='declined')toast(`${t.peer.name} recusou o envio`);
  renderNav();updateDockHead();
  if(!S.transfers.some(x=>x.status==='active'||x.status==='pending'))setTimeout(()=>{refreshBrand();if(!S.transfers.some(x=>x.status==='active'||x.status==='pending'||x.status==='failed')){$('[data-dock]').classList.add('done');if(S.settings.autofinish&&S.transfers.every(x=>x.status==='ok'))setTimeout(()=>{if(!S.transfers.some(x=>x.status==='active'||x.status==='pending')){$('[data-dock]').hidden=true;S.transfers=[]}},4000)}},1500);
}
function registrarAtividade(a){if(!S.settings.history)return;a.ts=Date.now();S.activity.unshift(a);salvarAtividade();if(S.view==='atividade')renderActivity()}
function retry(id){const t=S.transfers.find(x=>x.id===id);if(!t||t.dir!=='out')return;const d=DEVICES.find(x=>x.id===t.peer.id&&x.online);if(!d){toast(`${t.peer.name} não está na rede agora`);return}
  S.transfers=S.transfers.filter(x=>x.id!==id);$(`[data-row="${id}"]`)?.remove();$('[data-dock]').classList.remove('error');
  iniciarEnvio(d,t.items.map(i=>({...i})),{inline:t.inline});toast('Tentando de novo')}
function renderDock(expand){const dk=$('[data-dock]');dk.hidden=false;dk.classList.remove('done');if(expand&&innerWidth>=600){dk.classList.remove('collapsed');$('[data-dock-toggle]').setAttribute('aria-expanded','true');$('[data-dock-toggle]').innerHTML=svgI('chevron-down')}
  $('[data-dock-list]').innerHTML=S.transfers.map(rowHTML).join('');updateDockHead()}
function updateDockHead(){
  const act=S.transfers.filter(t=>t.status==='active'||t.status==='pending'),out=act.filter(t=>t.dir==='out').length,inn=act.length-out;
  const tot=act.reduce((a,t)=>a+t.total,0),dn=act.reduce((a,t)=>a+t.done,0);
  $('[data-ring]').style.strokeDashoffset=act.length?50.27*(1-dn/tot):(S.transfers.some(t=>t.status==='failed')?50.27:0);
  const failed=S.transfers.filter(t=>t.status==='failed').length;
  $('[data-dock-title]').firstChild.textContent=act.length?[out&&`Enviando ${out}`,inn&&`Recebendo ${inn}`].filter(Boolean).join(' · '):failed?`${failed} com falha`:'Tudo certo';
  $('[data-dock-sub]').textContent=act.length?`${Math.floor(dn/tot*100)}% · ${fmtBytes(dn)} de ${fmtBytes(tot)}`:`${S.transfers.filter(t=>t.status==='ok').length} concluídas nesta sessão`;
}
$('[data-dock-list]').addEventListener('click',e=>{const c=e.target.closest('[data-cancel]');if(c){const t=S.transfers.find(x=>x.id===c.dataset.cancel);if(!t)return;if(t.envio)t.envio.cancelar();else if(t.rec)t.rec.cancelar();finalizar(t,'canceled');return}
  const r=e.target.closest('[data-retry]');if(r)retry(r.dataset.retry)});
$('[data-dock-toggle]').addEventListener('click',()=>{const dk=$('[data-dock]'),c=dk.classList.toggle('collapsed');$('[data-dock-toggle]').setAttribute('aria-expanded',String(!c));$('[data-dock-toggle]').innerHTML=svgI(c?'chevron-up':'chevron-down')});
$('[data-dock-close]').addEventListener('click',()=>{if(S.transfers.some(t=>t.status==='active'||t.status==='pending')){$('[data-dock]').classList.add('collapsed');return}$('[data-dock]').hidden=true;S.transfers=[]});
function announce(m){$('[data-dock-live]').textContent=m}
/* Grava o arquivo recebido pela pasta de downloads do navegador */
function salvarArquivo(nome,blob){const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=String(nome||'arquivo').split('/').pop().replace(/[\\/:*?"<>|]/g,'_');document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),60000)}

/* ===================== Pedido de recebimento ===================== */
let reqState=null,reqReturnFocus=null;
S.reqQueue=[];
function pedidoChegou(rec){
  const peer={id:rec.peer.id,name:rec.peer.nome,type:rec.peer.tipo,meta:rec.peer.so,route:'local',online:true,fav:S.favs.has(rec.peer.id)};rec.peerUI=peer;
  const soTexto=rec.itens.every(i=>i.kind==='text'||i.kind==='link');
  techlog('info',`Pedido recebido de ${peer.name} (${rec.itens.length} ${rec.itens.length===1?'item':'itens'}, ${fmtBytes(rec.total)})`);
  const auto=!soTexto&&(S.auto==='all'||(S.auto==='fav'&&peer.fav));
  if(auto){setBrand('request');toast(`Recebendo automaticamente de ${peer.name}`);aceitarPedido(rec,{});return}
  if(reqState&&!$('[data-req-scrim]').hidden){S.reqQueue.push(rec);updateReqQueue();toast(`Outro pedido chegou (${peer.name}); está na fila`);return}
  mostrarPedido(rec);
}
function nomeFinal(rec,i,nomes){const it=rec.itens.find(x=>x.i===i);return (nomes&&nomes[i])||it.name}
function aceitarPedido(rec,o){
  const peer=rec.peerUI,pular=o.pular||new Set(),nomes=o.nomes||[];
  const aceitos=rec.itens.filter(i=>!pular.has(i.i)),arquivos=aceitos.filter(i=>i.kind==='file');
  const itensT=arquivos.map(i=>{const n=nomeFinal(rec,i.i,nomes);return{name:n,size:i.size,kind:kindOf(n)}}),total=arquivos.reduce((a,i)=>a+i.size,0);
  let t=null;
  rec.ontexto=(it)=>{registrarAtividade({dir:'in',title:it.kind==='link'?'Link recebido':'Texto recebido',kind:it.kind,body:it.body,size:it.size,peer:peer.name,peerId:peer.id,status:'ok'})};
  rec.onarquivo=(a)=>{salvarArquivo(a.nome,a.blob);if(t)t.verif=t.verif!==false&&a.verificado};
  rec.onprogresso=(n)=>{if(t)progresso(t,n)};
  rec.onstatus=(s,erro)=>{if(!t)return;if(s==='concluido')finalizar(t,'ok');else if(s==='falhou')finalizar(t,'failed',erro);else if(s==='cancelado')finalizar(t,'canceled')};
  if(arquivos.length)t=criarTransferencia('in',peer,itensT,total,{status:'active',rec});
  rec.aceitar({pular:[...pular],nomes});
}
function mostrarPedido(rec){
  const peer=rec.peerUI;reqReturnFocus=document.activeElement;setBrand('request');
  const itens=rec.itens,soTexto=itens.every(i=>i.kind==='text'||i.kind==='link');
  reqState={rec,peer,skip:new Set(),files:itens.map(i=>({i:i.i,name:i.kind==='text'||i.kind==='link'?(i.body||'').slice(0,40):i.name,size:i.size,kind:i.kind==='file'?kindOf(i.name):i.kind,body:i.body})),names:itens.map(i=>i.name),texto:soTexto};
  const files=reqState.files,total=rec.total;
  const d=$('[data-req]');
  const cabeca=`<p class="faint" data-req-queue style="text-align:center;font-size:12px;margin:-8px 0 8px" hidden></p>
    <div class="req-top">
      <span class="req-icon">${svgI(devIcon(peer.type),'s40')}</span>
      <p class="req-name" id="req-name">${esc(peer.name)}</p>
      <div class="badges" style="display:flex;gap:6px;justify-content:center;flex-wrap:wrap">${routeBadge(peer)}${peer.fav?'<span class="badge">Favorito</span>':'<span class="badge busy">Desconhecido</span>'}</div>
      <p class="req-what" id="req-what">${soTexto?(itens.length===1&&itens[0].kind==='link'?'te enviou um link':itens.length===1?'te enviou um texto':`te enviou ${itens.length} mensagens`):`quer te enviar <strong>${files.length} ${files.length===1?'item':'itens'}</strong> · <span class="mono">${fmtBytes(total)}</span>`}</p>
    </div>`;
  if(soTexto){
    rec.aceitar();/* confirma o recebimento ao remetente; o conteúdo já está no pedido */
    const corpo=itens.map(i=>i.body).join('\n\n');const unicoLink=itens.length===1&&itens[0].kind==='link';
    d.innerHTML=`${cabeca}<div class="msg-box">${itens.map(i=>i.kind==='link'?`<div><a href="${esc(i.body)}" target="_blank" rel="noopener noreferrer">${esc(i.body)}</a></div>`:`<div>${esc(i.body)}</div>`).join('')}</div>
      <div class="req-actions" style="grid-template-columns:repeat(${unicoLink?3:2},1fr)">
        <button class="btn btn-secondary" data-req-close>Fechar</button>
        <button class="btn btn-secondary" data-req-save>${svgI('inbox','s16')}Salvar na Caixa</button>
        ${unicoLink?`<a class="btn btn-primary" href="${esc(itens[0].body)}" target="_blank" rel="noopener noreferrer" data-req-close>${svgI('external','s16')}Abrir</a>`:`<button class="btn btn-primary" data-req-copy>${svgI('copy','s16')}Copiar</button>`}
      </div>`;
    reqState.corpo=corpo;
  }else{
    d.innerHTML=`${cabeca}
    <div class="previews">${files.map((f,k)=>`<div class="pv" data-pv="${k}" style="animation-delay:${k*30}ms"><span class="pi">${svgI(f.kind==='image'?'image':f.kind==='link'?'link':f.kind==='text'?'text':'file')}</span><span style="min-width:0"><span class="pn" style="display:block" data-pvn="${k}">${esc(f.name)}</span><span class="mono faint" style="font-size:12px">${fmtBytes(f.size)}</span></span></div>`).join('')}</div>
      <div class="req-links"><button class="btn btn-ghost btn-sm" data-req-opts aria-expanded="false">${svgI('settings2','s16')}Opções</button></div>
      <div class="opts" data-opts hidden>
        <div class="opt-row"><span>Os arquivos são salvos pelo navegador, na pasta de downloads dele.</span></div>
        ${files.map((f,k)=>`<div class="opt-file"><input class="ren" data-ren="${k}" value="${esc(f.name)}" aria-label="Nome do arquivo ${k+1}" ${f.kind==='text'||f.kind==='link'?'disabled':''}><span class="st" data-rst="${k}">Sem alteração</span><button class="switch" role="switch" aria-checked="true" aria-label="Incluir ${esc(f.name)}" data-skip="${k}"></button></div>`).join('')}
        <div class="opt-row" style="flex-wrap:wrap"><span>Renomear em lote</span><span style="display:flex;gap:6px;align-items:center"><input class="ren" data-batch-prefix placeholder="prefixo, ex.: oficina" style="width:160px"><button class="btn btn-secondary btn-sm" data-batch>Numerar</button><button class="btn btn-ghost btn-sm" data-ren-undo>Desfazer</button></span></div>
      </div>
      ${peer.fav?'':`<div class="req-warn">${svgI('alert','s16')}<span>Este aparelho não está nos seus favoritos. Só aceite se souber quem está enviando.</span></div>`}
      <div class="req-actions"><button class="btn btn-secondary btn-lg" data-req-decline>${svgI('x','s16')}Recusar</button><button class="btn btn-primary btn-lg" data-req-accept>${svgI('check','s16')}Aceitar <kbd>↵</kbd></button></div>`;
  }
  $('[data-req-scrim]').hidden=false;updateReqQueue();d.focus();
  if(soTexto)itens.forEach(it=>registrarAtividade({dir:'in',title:it.kind==='link'?'Link recebido':'Texto recebido',kind:it.kind,body:it.body,size:it.size,peer:peer.name,peerId:peer.id,status:'ok'}));
}
function updateReqQueue(){const q=$('[data-req-queue]');if(!q)return;const n=S.reqQueue.length;q.hidden=!n;q.textContent=n?`1 de ${n+1} pedidos · os outros esperam na fila`:''}
function closeRequest(){$('[data-req-scrim]').hidden=true;reqState=null;refreshBrand();if(S.reqQueue.length){const prox=S.reqQueue.shift();setTimeout(()=>mostrarPedido(prox),260);return}reqReturnFocus&&reqReturnFocus.focus&&reqReturnFocus.focus()}
function reqRenStatus(){reqState.files.forEach((f,k)=>{const st=$(`[data-rst="${k}"]`);if(!st)return;const skip=reqState.skip.has(k),ren=reqState.names[k]!==f.name;st.textContent=skip?'Pulado':ren?'Renomeado':'Sem alteração';st.className='st'+(skip?' skip':ren?' ren':'');const pv=$(`[data-pvn="${k}"]`);if(pv)pv.textContent=reqState.names[k]})}
function reqAcceptLabel(){const n=reqState.files.length-reqState.skip.size,t=reqState.files.length;$('[data-req-accept]').innerHTML=n?`${svgI('check','s16')}Aceitar ${n<t?n+' de '+t:''} <kbd>↵</kbd>`:'Nada selecionado';$('[data-req-accept]').disabled=!n}
$('[data-req]').addEventListener('input',e=>{const r=e.target.closest('[data-ren]');if(!r||!reqState)return;const v=r.value.replace(/[\\/:*?"<>|]/g,'');if(v!==r.value){r.value=v;toast('Esse caractere não pode ser usado em nomes de arquivo')}reqState.names[+r.dataset.ren]=v||reqState.files[+r.dataset.ren].name;reqRenStatus()});
$('[data-req]').addEventListener('click',e=>{
  const t=e.target;if(!reqState)return;
  if(t.closest('[data-req-opts]')){const o=$('[data-opts]');o.hidden=!o.hidden;t.closest('[data-req-opts]').setAttribute('aria-expanded',String(!o.hidden));return}
  if(t.closest('[data-batch]')){const p=($('[data-batch-prefix]').value||'arquivo').trim().replace(/[\\/:*?"<>|]/g,'');let n=0;reqState.files.forEach((f,k)=>{if(reqState.skip.has(k)||f.kind==='text'||f.kind==='link')return;n++;const ext=f.name.includes('.')?f.name.slice(f.name.lastIndexOf('.')):'';reqState.names[k]=`${p}-${String(n).padStart(2,'0')}${ext}`;$(`[data-ren="${k}"]`).value=reqState.names[k]});reqRenStatus();return}
  if(t.closest('[data-ren-undo]')){reqState.names=reqState.files.map(f=>f.name);$$('[data-ren]').forEach((r,k)=>r.value=reqState.names[k]);reqRenStatus();return}
  const sk=t.closest('[data-skip]');if(sk){const k=+sk.dataset.skip,on=sk.getAttribute('aria-checked')==='true';sk.setAttribute('aria-checked',String(!on));on?reqState.skip.add(k):reqState.skip.delete(k);$(`[data-pv="${k}"]`).classList.toggle('skipped',on);reqRenStatus();reqAcceptLabel();return}
  if(t.closest('[data-req-decline]')){const {rec,peer}=reqState;rec.recusar();techlog('info',`Pedido de ${peer.name} recusado`);registrarAtividade({dir:'in',title:rec.itens.length===1?rec.itens[0].name:`${rec.itens.length} itens`,kind:'file',size:rec.total,peer:peer.name,peerId:peer.id,status:'declined'});closeRequest();toast(`Você recusou o pedido de ${peer.name}`);return}
  if(t.closest('[data-req-accept]')){const {rec,skip,names}=reqState;const pular=new Set([...skip].map(k=>rec.itens[k].i)),nm=[];rec.itens.forEach((it,k)=>{nm[it.i]=names[k]});closeRequest();aceitarPedido(rec,{pular,nomes:nm});return}
  if(t.closest('[data-req-copy]')){navigator.clipboard?.writeText(reqState.corpo).then(()=>toast('Copiado'),()=>toast('O navegador bloqueou a cópia. Selecione o texto e copie manualmente.'));closeRequest();return}
  if(t.closest('[data-req-save]')){const {rec,peer}=reqState;rec.itens.forEach(it=>addInbox({kind:it.kind,body:it.body,title:it.kind==='link'?'Link recebido':null,size:it.size,from:peer.name}));closeRequest();toast('Salvo na Caixa','Abrir',()=>location.hash='caixa');return}
  if(t.closest('[data-req-close]')){closeRequest()}
});

/* ===================== Atividade (COMPONENT_INVENTORY §7) ===================== */
// Cada linha é uma operação que realmente aconteceu neste aparelho. O histórico fica guardado no navegador.
const ACT_F=[['all','Tudo'],['out','Enviados'],['in','Recebidos'],['failed','Falhas']];
const KIND_L={all:'Todos os tipos',file:'Documentos',image:'Imagens',video:'Vídeos',text:'Textos',link:'Links'};
S.actQuery='';S.actKind='all';S.actRoute='all';
const SIT={ok:['Concluído','var(--success)'],declined:['Recusado','var(--danger)'],canceled:['Cancelado','var(--text-secondary)'],failed:['Falhou','var(--danger)']};
function renderActivity(){
  $('[data-act-chips]').innerHTML=ACT_F.map(([k,l])=>`<button class="tab" aria-pressed="${S.actFilter===k}" aria-selected="${S.actFilter===k}" data-af="${k}">${l}</button>`).join('');
  const q=norm(S.actQuery);
  const list=S.activity.filter(a=>(S.actFilter==='all'||(S.actFilter==='failed'?a.status!=='ok':a.dir===S.actFilter))&&(S.actKind==='all'||a.kind===S.actKind)&&(!q||norm(a.title+' '+a.peer+' '+(a.body||'')).includes(q)));
  const filtered=S.actFilter!=='all'||S.actKind!=='all'||q;
  $('[data-act-count]').textContent=filtered?`${list.length} de ${S.activity.length}`:'';$('[data-act-reset]').hidden=!filtered;
  if(!list.length){$('[data-activity]').innerHTML=S.activity.length?`<div class="empty">${svgI('search','s40')}<h3>Nenhum resultado</h3><p style="margin:0">Tente outra busca ou limpe os filtros.</p><button class="btn btn-secondary btn-sm" data-act-reset2>Limpar filtros</button></div>`:`<div class="empty">${trailSVG('pending')}<h3>Nada por aqui ainda</h3><p style="margin:0">${S.settings.history?'O que você enviar e receber aparece nesta lista.':'O histórico está desligado em Configurações › Receber.'}</p></div>`;return}
  const groups={};list.forEach(a=>{const g=diaDe(a.ts);(groups[g]=groups[g]||[]).push([a,S.activity.indexOf(a)])});
  $('[data-activity]').innerHTML=Object.entries(groups).map(([g,items])=>`<div class="day">${g}</div><div class="list">${items.map(([a,i])=>{const [sit,cor]=SIT[a.status]||SIT.failed;return `
    <div class="li ${INSP.kind==='activity'&&INSP.ref===i?'active':''}" data-act="${i}" tabindex="0" aria-label="${esc(a.title)}, abrir detalhes"><span class="dir" title="${a.dir==='out'?'Enviado':'Recebido'}">${svgI(a.dir==='out'?'up':'down')}</span>
      <span class="ticon" style="width:36px;height:36px;border-radius:10px;background:var(--bg-sunken);display:grid;place-items:center;color:var(--text-secondary)">${svgI(a.kind==='video'?'video':a.kind==='image'?'image':a.kind==='link'?'link':a.kind==='text'?'text':'file')}</span>
      <div style="min-width:0"><div class="lt">${esc(a.title)}</div><div class="lm"><span class="mono">${fmtBytes(a.size)}</span>·<span>${a.dir==='out'?'para':'de'} ${esc(a.peer)}</span>${routeBadge({route:'local'},true)}<span>${horaDe(a.ts)}</span><span style="color:${cor}">${sit}</span></div></div>
      <div class="acts"></div></div>`}).join('')}</div>`).join('');
}
function resetActFilters(){S.actFilter='all';S.actKind='all';S.actQuery='';$('[data-act-q]').value='';$('[data-act-kind]').value='all';renderActivity()}
$('[data-act-chips]').addEventListener('click',e=>{const b=e.target.closest('[data-af]');if(b){S.actFilter=b.dataset.af;renderActivity()}});
$('[data-act-q]').addEventListener('input',e=>{S.actQuery=e.target.value;renderActivity()});
$('[data-act-kind]').addEventListener('change',e=>{S.actKind=e.target.value;renderActivity()});
$('[data-act-reset]').addEventListener('click',resetActFilters);
$('[data-act-clear]').addEventListener('click',()=>openClearHistory());
function openClearHistory(){openModal(`<div class="dlg-head"><h2 id="m-title">Limpar histórico</h2><button class="icon-btn" data-modal-close aria-label="Fechar">${svgI('x')}</button></div>
  <div class="modal-body"><div class="choice" role="radiogroup" aria-labelledby="m-title">
    <label><input type="radio" name="clr" value="old" checked><span>Mais antigos que 30 dias<small>Mantém o que aconteceu recentemente.</small></span></label>
    <label><input type="radio" name="clr" value="all"><span>Tudo<small>Apaga todo o histórico de envios e recebimentos.</small></span></label></div>
    <p class="notice">${svgI('info','s16')}<span>Só a lista é apagada. Os arquivos que você recebeu continuam na pasta de downloads do navegador.</span></p></div>
  <div class="modal-actions"><button class="btn btn-ghost" data-modal-close>Cancelar</button><button class="btn btn-danger" data-clear-go>Limpar</button></div>`,{label:'Limpar histórico',onClick:e=>{if(!e.target.closest('[data-clear-go]'))return;
    const all=$('[data-modal] input[name=clr]:checked').value==='all',antes=[...S.activity],corte=Date.now()-30*864e5;
    S.activity=all?[]:S.activity.filter(a=>a.ts>=corte);const apagados=antes.length-S.activity.length;salvarAtividade();closeModal();closeInspector();renderActivity();techlog('info',all?'Histórico apagado':`Histórico antigo apagado (${apagados})`);
    toast(apagados?(all?'Histórico apagado':`${apagados} ${apagados===1?'registro apagado':'registros apagados'}`):'Nada com mais de 30 dias para apagar',apagados?'Desfazer':null,()=>{S.activity=antes;salvarAtividade();renderActivity()})}})}
$('[data-activity]').addEventListener('click',e=>{if(e.target.closest('[data-act-reset2]')){resetActFilters();return}
  if(e.target.closest('button,a'))return;const li=e.target.closest('[data-act]');if(li)openInspector('activity',+li.dataset.act)});
$('[data-activity]').addEventListener('keydown',e=>{if(e.key!=='Enter'&&e.key!==' ')return;const li=e.target.closest&&e.target.matches('[data-act]')&&e.target;if(li){e.preventDefault();openInspector('activity',+li.dataset.act)}});

/* ===================== Caixa (COMPONENT_INVENTORY §8) ===================== */
// Itens guardados NESTE aparelho (IndexedDB). Expiram conforme a configuração; itens fixados não expiram.
const expiraTxt=it=>it.pinned?'Fixado: não expira':(()=>{const d=Math.ceil((it.ts+S.retention*864e5-Date.now())/864e5);return d<=1?'Expira hoje':`Expira em ${d} dias`})();
function persistirItem(it){const {thumb,isNew,...limpo}=it;return IDB.gravar(limpo).catch(e=>{techlog('error',`Não foi possível guardar na Caixa: ${e.message}`);toast('Não foi possível guardar neste navegador (armazenamento cheio ou bloqueado).')})}
function addInbox(it,isNew=true){
  const item={...it,isNew,id:ErasoRede.aleatorio(10),ts:Date.now(),pinned:false};
  if(item.blob&&/^image\//.test(item.blob.type))item.thumb=URL.createObjectURL(item.blob);
  S.inbox.unshift(item);persistirItem(item);if(S.view==='caixa')renderInbox()}
async function carregarCaixa(){
  try{const todos=await IDB.todos(),corte=Date.now()-S.retention*864e5,vivos=[];
    for(const it of todos){if(!it.pinned&&it.ts<corte){IDB.apagar(it.id).catch(()=>{});continue}if(it.blob&&/^image\//.test(it.blob.type))it.thumb=URL.createObjectURL(it.blob);vivos.push(it)}
    S.inbox=vivos.sort((a,b)=>b.ts-a.ts)}catch(e){techlog('warn',`Caixa indisponível neste navegador: ${e.message}`);S.inboxIndisponivel=true}
  if(S.view==='caixa')renderInbox()}
function inboxCard(it){const i=S.inbox.indexOf(it);
  return `<article class="ibx ${it.isNew?'new':''} ${it.pinned?'pinned':''}">
    ${it.kind==='image'?`<div class="img">${it.thumb?`<img src="${it.thumb}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:10px">`:svgI('image','s40')}</div><div class="lt" style="font-weight:500">${esc(it.body)}</div>`:it.kind==='file'||it.kind==='video'?`<div style="display:flex;gap:10px;align-items:center"><span class="pi" style="width:40px;height:40px;border-radius:10px;background:var(--bg-sunken);display:grid;place-items:center">${svgI(it.kind==='video'?'video':'file')}</span><div style="min-width:0"><div class="lt" style="font-weight:500">${esc(it.body)}</div><div class="mono faint" style="font-size:12px">${fmtBytes(it.size||0)}</div></div></div>`:it.kind==='link'?`<div style="display:flex;gap:8px;align-items:center">${svgI('link','s16')}<span class="faint" style="font-size:13px">${esc((()=>{try{return new URL(it.body).hostname}catch{return it.body}})())}</span></div><div style="font-weight:500">${esc(it.title||it.body)}</div>`:`<div class="body">${esc(it.body)}</div>`}
    <div class="lm"><span>de ${esc(it.from)}</span>·<span>${rel(it.ts)}</span><span class="faint">${expiraTxt(it)}</span></div>
    <div class="row-end" style="justify-content:flex-start">${it.blob?`<button class="btn btn-secondary btn-sm" data-ib-dl="${i}">${svgI('download','s16')}Baixar</button>`:it.kind==='link'?`<a class="btn btn-secondary btn-sm" href="${esc(it.body)}" target="_blank" rel="noopener noreferrer">${svgI('external','s16')}Abrir</a>`:''}
      ${it.blob?'':`<button class="btn btn-ghost btn-sm" data-ib-copy="${i}">${svgI('copy','s16')}Copiar</button>`}
      <button class="btn btn-ghost btn-sm" data-ib-send="${i}">${svgI('send','s16')}Enviar para…</button>
      <button class="icon-btn" aria-label="${it.pinned?'Desafixar':'Fixar no topo'}" aria-pressed="${!!it.pinned}" data-ib-pin="${i}">${svgI('pin')}</button><button class="icon-btn" aria-label="Excluir" data-ib-del="${i}">${svgI('trash')}</button></div></article>`}
function renderInbox(){
  const pinned=S.inbox.filter(i=>i.pinned),rest=S.inbox.filter(i=>!i.pinned),box=$('[data-inbox]');
  if(S.inboxIndisponivel){box.innerHTML=`<div class="empty" style="grid-column:1/-1">${svgI('alert','s40')}<h3>A Caixa não está disponível</h3><p style="margin:0">Este navegador bloqueou o armazenamento local (modo privado ou permissão negada).</p></div>`;return}
  if(!S.inbox.length){box.innerHTML=`<div class="empty" style="grid-column:1/-1">${svgI('inbox','s40')}<h3>Sua Caixa está vazia</h3><p style="margin:0">Escreva, cole um link ou solte um arquivo acima. Itens recebidos de outros aparelhos também podem ser salvos aqui.</p></div>`;return}
  box.innerHTML=(pinned.length?`<div class="day" style="grid-column:1/-1;margin-top:0">Fixados</div>${pinned.map(inboxCard).join('')}<div class="day" style="grid-column:1/-1">Recentes</div>`:'')+rest.map(inboxCard).join('');
  S.inbox.forEach(i=>i.isNew=false);
}
$('[data-inbox]').addEventListener('click',e=>{const t=e.target;
  const c=t.closest('[data-ib-copy]');if(c){navigator.clipboard?.writeText(S.inbox[+c.dataset.ibCopy].body).then(()=>toast('Copiado'),()=>toast('O navegador bloqueou a cópia. Selecione o texto e copie manualmente.'));return}
  const dl=t.closest('[data-ib-dl]');if(dl){const it=S.inbox[+dl.dataset.ibDl];salvarArquivo(it.body,it.blob);return}
  const p=t.closest('[data-ib-pin]');if(p){const it=S.inbox[+p.dataset.ibPin];it.pinned=!it.pinned;persistirItem(it);renderInbox();toast(it.pinned?'Fixado no topo':'Desafixado');return}
  const s=t.closest('[data-ib-send]');if(s){const it=S.inbox[+s.dataset.ibSend];addItems([it.blob?{name:it.body,size:it.size,kind:kindOf(it.body,it.blob.type),thumb:it.thumb||null,file:new File([it.blob],it.body,{type:it.blob.type})}:{name:it.kind==='link'?it.body:it.body.slice(0,40),body:it.body,size:new Blob([it.body]).size,kind:it.kind}]);location.hash='compartilhar';toast('Adicionado à seleção. Toque no aparelho para enviar.');return}
  const d=t.closest('[data-ib-del]');if(d){const idx=+d.dataset.ibDel,[it]=S.inbox.splice(idx,1);IDB.apagar(it.id).catch(()=>{});renderInbox();toast('Item excluído da Caixa','Desfazer',()=>{S.inbox.splice(idx,0,it);persistirItem(it);renderInbox()})}});
function saveCapture(){const t=$('[data-capture]').value.trim();if(!t){$('[data-capture]').focus();return}const it=textItem(t);addInbox({kind:it.kind,body:t,title:null,size:it.size,from:'Este aparelho'});$('[data-capture]').value='';toast('Guardado na Caixa')}
$('[data-capture-save]').addEventListener('click',saveCapture);
$('[data-capture]').addEventListener('keydown',e=>{if(e.key==='Enter'&&(e.ctrlKey||e.metaKey)){e.preventDefault();saveCapture()}});
function inboxAddFiles(files){[...files].forEach(f=>addInbox({kind:kindOf(f.name,f.type),body:f.name.split('/').pop(),size:f.size,blob:f,from:'Este aparelho'}));toast('Guardado na Caixa')}

/* ===================== Dispositivos (COMPONENT_INVENTORY §9.1) ===================== */
function devRow(d){return `<div class="li" style="grid-template-columns:auto 1fr auto auto"><span class="dev-icon" style="position:relative;width:40px;height:40px;border-radius:10px;background:var(--bg-sunken);display:grid;place-items:center;color:var(--text-secondary)">${svgI(devIcon(d.type))}<span class="dot ${d.online?'':'off'}"></span></span>
  <div style="min-width:0"><div class="lt">${esc(d.name)} ${d.fav?`<span style="color:var(--accent-fill)" title="Favorito">${svgI('heart','s16')}</span>`:''}</div><div class="lm">${esc(d.meta)}${d.online?'':' · '+esc(d.seen||'offline')}${d.fav&&d.online&&S.auto==='fav'?' · recebe automático':''}</div></div>
  <div>${routeBadge(d)}</div><button class="icon-btn" aria-label="Detalhes de ${esc(d.name)}" data-insp-dev="${d.id}">${svgI('info')}</button></div>`}
function renderDevList(){const near=DEVICES.filter(d=>d.online),offFav=DEVICES.filter(d=>!d.online);
  $('[data-dev-list]').innerHTML=`<section class="dev-group"><div class="day" style="margin-top:0;display:flex;justify-content:space-between"><span>Por perto · ${near.length}</span><span>Na mesma rede, com o ERASÓ aberto e visível</span></div><div class="list">${near.map(devRow).join('')||`<div class="li" style="display:block">${S.net==='conectado'?'Nenhum aparelho encontrado agora.':'Sem conexão com o servidor local.'}</div>`}</div></section>
    ${offFav.length?`<section class="dev-group"><div class="day" style="display:flex;justify-content:space-between"><span>Favoritos offline · ${offFav.length}</span><span>Voltam à lista quando se conectarem</span></div><div class="list">${offFav.map(devRow).join('')}</div></section>`:''}`}
$('[data-dev-list]').addEventListener('click',e=>{const b=e.target.closest('[data-insp-dev]');if(b){openInspector('device',b.dataset.inspDev);return}const li=e.target.closest('.li');if(li&&!e.target.closest('button')){const id=li.querySelector('[data-insp-dev]')?.dataset.inspDev;if(id)openInspector('device',id)}});

/* ===================== Registros técnicos ===================== */
const TECHLOG=[];
const hhmmss=d=>d.toTimeString().slice(0,8);
function techlog(type,msg){TECHLOG.push({t:hhmmss(new Date()),type,msg});if(TECHLOG.length>200)TECHLOG.shift();if(S.view==='diagnostico'&&$('[data-techlog]'))renderTechLog()}
techlog('info','ERASÓ iniciado · '+location.origin);

/* ===================== Inspetor ===================== */
const INSP={kind:null,ref:null,ret:null,confirm:false};
function openInspector(kind,ref){INSP.ret=INSP.kind?INSP.ret:document.activeElement;Object.assign(INSP,{kind,ref,confirm:false});
  const el=$('[data-inspector]');el.hidden=false;$('.app').classList.add('with-insp');$('[data-insp-scrim]').hidden=innerWidth>=1280;renderInspector();
  $$('.li.active').forEach(x=>x.classList.remove('active'));if(kind==='activity')$(`.li[data-act="${ref}"]`)?.classList.add('active');
  $('#insp-title')?.focus()}
function closeInspector(){const el=$('[data-inspector]');if(el.hidden)return;el.hidden=true;$('.app').classList.remove('with-insp');$('[data-insp-scrim]').hidden=true;$$('.li.active').forEach(x=>x.classList.remove('active'));INSP.kind=null;INSP.ret&&INSP.ret.isConnected&&INSP.ret.focus&&INSP.ret.focus()}
const row=(k,v,mono)=>`<dt>${k}</dt><dd class="${mono?'mono':''}">${v}</dd>`;
const TIPOS={phone:'Celular',tablet:'Tablet',laptop:'Computador',monitor:'Computador',browser:'Navegador'};
const KIND_TXT={file:'Documento',image:'Imagem',video:'Vídeo',text:'Texto',link:'Link'};
const SIT_LONGA={ok:'<span style="color:var(--success)">Concluído</span>',declined:'<span class="danger-text">Recusado pelo outro aparelho</span>',canceled:'Cancelado',failed:'<span class="danger-text">Falhou</span>'};
function renderInspector(){const el=$('[data-inspector]');let head='',body='',bar='';
  if(INSP.kind==='device'){const d=DEVICES.find(x=>x.id===INSP.ref);if(!d){closeInspector();return}
    head=`<span class="insp-icon">${svgI(devIcon(d.type),'s24')}<span class="dot ${d.online?'':'off'}"></span></span>
      <div><h2 id="insp-title" tabindex="-1">${esc(d.name)}</h2><div class="meta">${routeBadge(d)}${d.fav?'<span class="badge">Favorito</span>':''}</div></div>`;
    body=`<details open><summary>Identidade</summary>
        <dl class="mtab">${row('Nome',esc(d.name))}${row('Tipo',TIPOS[d.type]||'Aparelho')}${row('Sistema · navegador',esc(d.meta))}${row('Identificador',esc(d.id),true)}</dl></details>
      <details open><summary>Conexão</summary><dl class="mtab">
        ${row('Rota atual',routeBadge(d))}${row('Situação',d.online?'Visível agora':esc(d.seen||'Offline'))}${row('Canal','WebRTC (conexão direta, criptografada)')}</dl>
        <div style="margin-top:10px">${d.online?`<button class="btn btn-secondary btn-sm" data-insp-test>${svgI('activity','s16')}Testar conexão</button><span class="faint" style="font-size:13px;margin-left:8px" data-insp-test-out></span>`:''}</div></details>
      <details open><summary>Preferências</summary><dl class="mtab">
        ${row('Favorito',`<button class="switch" role="switch" aria-checked="${!!d.fav}" data-insp-fav aria-label="Favorito"></button>`)}
        ${row('Receber automático',S.auto==='fav'?(d.fav?'Sim (favorito)':'Não'):S.auto==='all'?'Sim (qualquer aparelho)':'Não (sempre perguntar)')}</dl></details>`;
    bar=INSP.confirm?`<div class="confirm-box" role="alert"><span>Esquecer <strong>${esc(d.name)}</strong>? Ele sai dos favoritos e some da lista quando estiver offline.</span><div class="row-end"><button class="btn btn-ghost btn-sm" data-insp-cancel>Cancelar</button><button class="btn btn-danger btn-sm" data-insp-remove>Esquecer</button></div></div>`:
      `${d.fav?`<button class="btn btn-ghost btn-sm btn-danger-ghost" data-insp-ask>${svgI('trash','s16')}Esquecer</button>`:''}<span class="spacer"></span>${d.online?`<button class="btn btn-primary btn-sm" data-insp-send aria-label="Enviar para ${esc(d.name)}">${svgI('send','s16')}Enviar <kbd>↵</kbd></button>`:'<span class="faint" style="font-size:13px">Offline</span>'}`}
  else if(INSP.kind==='activity'){const a=S.activity[INSP.ref];if(!a){closeInspector();return}
    const ic=a.kind==='video'?'video':a.kind==='image'?'image':a.kind==='link'?'link':a.kind==='text'?'text':'file';
    head=`<span class="insp-icon">${svgI(ic,'s24')}</span><div><h2 id="insp-title" tabindex="-1">${esc(a.title)}</h2><div class="meta"><span>${a.dir==='out'?'Enviado':'Recebido'}</span>·<span>${dataHora(a.ts)}</span></div></div>`;
    body=`${a.kind==='text'||a.kind==='link'?`<div class="insp-preview txt">${esc(a.body||a.title)}</div>`:''}
      <details open><summary>Detalhes</summary><dl class="mtab">
        ${row('Tipo',KIND_TXT[a.kind]||'Arquivo')}${row('Tamanho',fmtBytes(a.size),true)}
        ${row(a.dir==='out'?'Para':'De',esc(a.peer))}${row('Rota',routeBadge({route:'local'}))}
        ${row('Situação',SIT_LONGA[a.status]||SIT_LONGA.failed)}${a.erro?row('Motivo',esc(a.erro)):''}
        ${a.status==='ok'&&a.duration?row('Duração',fmtTime(a.duration),true)+(a.speed?row('Velocidade média',fmtBytes(a.speed)+'/s',true):''):''}
        ${a.integridade?row('Integridade',`<span style="color:var(--success);display:inline-flex;gap:4px;align-items:center">${svgI('check','s16')}Conferida (CRC32)</span>`):''}
        ${a.dir==='in'&&a.kind!=='text'&&a.kind!=='link'&&a.status==='ok'?row('Salvo em','Pasta de downloads do navegador'):''}</dl></details>`;
    bar=`<button class="btn btn-ghost btn-sm btn-danger-ghost" data-insp-delact>${svgI('trash','s16')}Remover do histórico</button><span class="spacer"></span>${a.kind==='text'||a.kind==='link'?`<button class="btn btn-primary btn-sm" data-insp-copy>${svgI('copy','s16')}Copiar</button>`:''}`}
  else if(INSP.kind==='me'){
    head=`<span class="insp-icon">${svgI(devIcon(ME.type),'s24')}<span class="dot ${S.visible&&S.net==='conectado'?'':'off'}"></span></span><div><h2 id="insp-title" tabindex="-1">${esc(ME.name)}</h2><div class="meta"><span>Este aparelho</span>·<span>${statusLocal()}</span></div></div>`;
    body=`<details open><summary>Identidade</summary>
        <div class="field" style="margin-top:8px"><label for="insp-name" style="font-size:13px;color:var(--text-tertiary);font-weight:400">Nome que os outros veem</label><div class="insp-name"><input id="insp-name" data-insp-name value="${esc(ME.name)}" maxlength="40"><button class="btn btn-secondary btn-sm" data-insp-rename>Salvar</button></div></div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px"><button class="btn btn-ghost btn-sm" data-insp-randname>${svgI('refresh','s16')}Usar o nome do aparelho</button></div>
        <dl class="mtab">${row('Tipo',TIPOS[ME.type]||'Aparelho')}${row('Sistema · navegador',esc(ME.os))}${row('Identificador',esc(ME.id),true)}${row('Sala',SALA?esc(SALA):'Rede toda (sem sala)',!!SALA)}</dl></details>
      <details open><summary>Conexão</summary><dl class="mtab">${row('Servidor local',esc(location.origin),true)}${row('Estado',esc(NET_TXT[S.net]||S.net))}
        ${row('Rota',routeBadge({route:'local'}))}${row('Aparelhos vistos',String(DEVICES.filter(d=>d.online).length))}</dl></details>
      <details><summary>Segurança</summary><dl class="mtab">${row('Criptografia','Conexão direta WebRTC (DTLS)')}${row('Exigir PIN',S.pin?'Sim':'Não')}</dl></details>`;
    bar=`<button class="btn btn-ghost btn-sm" data-goto-diag>${svgI('activity','s16')}Diagnosticar</button><span class="spacer"></span>`}
  el.innerHTML=`<div class="insp-head">${head}<button class="icon-btn" data-insp-close aria-label="Fechar detalhes (Esc)">${svgI('x')}</button></div><div class="insp-body">${body}</div><div class="action-bar">${bar}</div>`;
}
function refreshDeviceViews(){renderGrid();if(S.view==='dispositivos')renderDevList();renderThisDevice()}
$('[data-inspector]').addEventListener('click',async e=>{const t=e.target;
  if(t.closest('[data-insp-close]')){closeInspector();return}
  const d=INSP.kind==='device'?DEVICES.find(x=>x.id===INSP.ref):null;
  if(t.closest('[data-insp-rename]')){const v=$('[data-insp-name]').value.trim();if(!v){toast('O nome não pode ficar vazio');return}
    ME.name=v;salvarPrefs();REDE.atualizarPerfil({nome:v}).catch(()=>{});techlog('info',`Nome deste aparelho alterado para "${v}"`);refreshDeviceViews();renderInspector();toast('Nome salvo');return}
  if(t.closest('[data-insp-randname]')){$('[data-insp-name]').value=ErasoRede.nomePadrao(PERFIL,ME.id);$('[data-insp-name]').focus();return}
  if(t.closest('[data-insp-test]')&&d){const out=$('[data-insp-test-out]');out.textContent='Testando…';try{const ms=await REDE.testarConexao({id:d.id,nome:d.name});out.textContent=`Conexão direta ok · ${ms} ms`;techlog('info',`Teste com ${d.name}: ${ms} ms`)}catch(err){out.textContent=err.message;techlog('error',`Teste com ${d.name} falhou: ${err.message}`)}return}
  const fv=t.closest('[data-insp-fav]');if(fv&&d){alternarFavorito(d.id,false);fv.setAttribute('aria-checked',String(S.favs.has(d.id)));renderInspector();return}
  if(t.closest('[data-insp-ask]')){INSP.confirm=true;renderInspector();$('[data-insp-cancel]')?.focus();return}
  if(t.closest('[data-insp-cancel]')){INSP.confirm=false;renderInspector();return}
  if(t.closest('[data-insp-remove]')&&d){const nome=d.name,id=d.id;S.favs.delete(id);delete S.favInfo[id];salvarPrefs();sincronizarAparelhos(DEVICES.filter(x=>x.online).map(x=>({id:x.id,nome:x.name,tipo:x.type,so:x.meta})));closeInspector();toast(`${nome} esquecido`);return}
  if(t.closest('[data-insp-send]')&&d){closeInspector();location.hash='compartilhar';sendTo(d);return}
  if(t.closest('[data-insp-copy]')){const a=S.activity[INSP.ref];navigator.clipboard?.writeText(a.body||a.title).then(()=>toast('Copiado'),()=>toast('O navegador bloqueou a cópia.'));return}
  if(t.closest('[data-insp-delact]')){const i=INSP.ref,[a]=S.activity.splice(i,1);salvarAtividade();closeInspector();renderActivity();toast('Removido do histórico (o arquivo continua no disco)','Desfazer',()=>{S.activity.splice(i,0,a);salvarAtividade();renderActivity()});return}
});
$('[data-inspector]').addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.matches('[data-insp-name]')){e.preventDefault();$('[data-insp-rename]').click()}
  else if(e.key==='Enter'&&e.target.id==='insp-title'){const p=$('[data-inspector] .action-bar .btn-primary');p&&p.click()}});
$('[data-insp-scrim]').addEventListener('click',closeInspector);
document.addEventListener('contextmenu',e=>{const c=e.target.closest&&e.target.closest('.card[data-dev]');if(!c)return;e.preventDefault();openInspector('device',c.dataset.dev)});

/* ===================== Diagnóstico ===================== */
// Cada verificação consulta o estado real: navegador, servidor local, presença e conexão direta com cada aparelho.
const DIAG={running:false,results:{},sym:null,symStep:0,symDone:false,logFilter:'all'};
const CHECKS=[
  {id:'nav',t:'Navegador compatível',run:async()=>typeof RTCPeerConnection!=='undefined'&&typeof EventSource!=='undefined'?{s:'ok',d:'Conexão direta entre aparelhos (WebRTC) disponível.'}:{s:'bad',d:'Este navegador não permite conexão direta entre aparelhos. Use uma versão atual do Chrome, Edge, Firefox ou Safari.'}},
  {id:'srv',t:'Servidor local',run:async()=>{
    const t0=performance.now();try{const r=await fetch('/api/aparelhos',{cache:'no-store'});if(!r.ok)throw new Error('status '+r.status);const ms=Math.round(performance.now()-t0);
      return S.net==='conectado'?{s:'ok',d:`Conectado a ${location.origin} · ${ms} ms.`}:{s:'warn',d:`O servidor responde, mas este aparelho está “${NET_TXT[S.net]||S.net}”.`,a:'Reconectar',fix:async()=>REDE.conectar(),keep:false}}
    catch{return{s:'bad',d:`Sem resposta de ${location.origin}. Confira se o servidor do ERASÓ está em execução e se este aparelho está na mesma rede.`}}}},
  {id:'vis',t:'Este aparelho está visível',run:async()=>S.visible?{s:'ok',d:'Outros aparelhos da rede conseguem te encontrar.'}:{s:'bad',d:'Oculto: ninguém consegue te encontrar nem enviar pedidos.',a:'Ficar visível',fix:async()=>{S.visible=true;salvarPrefs();await REDE.atualizarPerfil({visivel:true});renderThisDevice();refreshBrand()}}},
  {id:'par',t:'Outros aparelhos na rede',run:async()=>{try{await REDE.buscar()}catch{}const n=DEVICES.filter(d=>d.online).length;return n?{s:'ok',d:`${n} ${n===1?'aparelho visível':'aparelhos visíveis'}: ${DEVICES.filter(d=>d.online).map(d=>d.name).join(', ')}.`}:{s:'warn',d:`Nenhum aparelho encontrado. Abra ${location.origin} em outro aparelho, na mesma rede, e deixe-o visível.`}}},
  {id:'dir',t:'Conexão direta com cada aparelho',run:async()=>{const on=DEVICES.filter(d=>d.online);if(!on.length)return{s:'warn',d:'Não há aparelhos para testar.'};
    const res=await Promise.all(on.map(async d=>{try{return[d,await REDE.testarConexao({id:d.id,nome:d.name})]}catch(e){return[d,null,e.message]}}));
    const ruins=res.filter(r=>r[1]==null);res.forEach(r=>techlog(r[1]==null?'error':'info',`Teste com ${r[0].name}: ${r[1]==null?r[2]:r[1]+' ms'}`));
    return ruins.length?{s:'bad',d:`Sem conexão direta com ${ruins.map(r=>r[0].name).join(', ')}. ${ruins[0][2]}`}:{s:'ok',d:res.map(r=>`${r[0].name}: ${r[1]} ms`).join(' · ')}}},
];
const SYMPTOMS=[
  {id:'find',t:'Não encontro outros aparelhos',why:'Os aparelhos se encontram pelo servidor local: todos precisam abrir o mesmo endereço, ao mesmo tempo, e estar visíveis.',steps:[`Abra ${location.origin} nos dois aparelhos (o endereço completo, igual nos dois).`,'Confira se “Visível” está ligado nos dois.','Toque em “Buscar novamente” e rode a verificação acima.','Se o outro aparelho nem abre a página, ele não está na mesma rede ou o firewall do computador que executa o servidor bloqueia a porta.']},
  {id:'conn',t:'Aparece na lista, mas não conecta',why:'A conexão direta entre navegadores depende de a rede permitir tráfego entre os aparelhos.',steps:['Use “Testar conexão” nos detalhes do aparelho para ver a mensagem de erro.','Redes de convidados e alguns Wi-Fi de instituições isolam os aparelhos entre si (“isolamento de clientes”). Teste com outra rede.','Desligue VPNs nos dois aparelhos.','Teste com o roteador (hotspot) de um celular: conecte os dois aparelhos nele.']},
  {id:'recv',t:'Não recebo o que enviam',why:'O pedido chega, mas o arquivo não termina de ser salvo, ou o aparelho recusa pedidos.',steps:['Confira se este aparelho está “Visível” e se o PIN (se estiver ligado) foi informado a quem envia.','Permita que o navegador baixe vários arquivos (ele pode bloquear downloads automáticos).','Confira o espaço livre no aparelho: o arquivo é guardado na memória até terminar (limite de 2 GB).']},
  {id:'stops',t:'A transferência começa e para no meio',why:'A conexão caiu durante o envio, comum quando a tela do celular apaga ou o aparelho troca de rede.',steps:['Mantenha os dois aparelhos com a tela ligada e perto do roteador.','Use “Tentar de novo” na transferência.','Evite trocar de aba ou bloquear o celular durante o envio.']},
];
async function runChecks(only){
  if(DIAG.running)return;DIAG.running=true;const list=only?CHECKS.filter(c=>c.id===only):CHECKS;
  if(!only)DIAG.results={};setBrand('syncing','Verificando conexão…');techlog('info',only?`Verificando de novo: ${only}`:'Diagnóstico iniciado');
  for(const c of list){DIAG.results[c.id]={s:'running'};renderChecks();let r;try{r=await c.run()}catch(e){r={s:'bad',d:`Erro inesperado: ${e.message}`}}DIAG.results[c.id]=r;if(r.s!=='ok')techlog(r.s==='bad'?'error':'warn',`${c.t}: ${r.d}`);renderChecks()}
  DIAG.running=false;renderChecks();const bad=Object.values(DIAG.results).filter(r=>r.s!=='ok').length;setBrand(bad?'attention':'done',bad?'Algo precisa de atenção':'Conexão ok');
  announce(bad?`${bad} itens precisam de atenção`:'Tudo certo com a conexão')}
function renderChecks(){const box=$('[data-checks]');if(!box)return;const res=DIAG.results,started=Object.keys(res).length;
  box.innerHTML=`<ul class="checks">${CHECKS.map(c=>{const r=res[c.id];const cls=!r?'pending':r.s==='running'?'':r.s;
    const st=!r?svgI('offline','s16'):r.s==='running'?'<span class="spin" aria-hidden="true"></span>':r.s==='ok'?svgI('check','s16'):svgI('alert','s16');
    return `<li class="check ${cls}"><span class="st">${st}</span><div><div class="ct">${c.t}</div>${r&&r.d?`<div class="cd">${esc(r.d)}</div>`:r&&r.s==='running'?'<div class="cd">Verificando…</div>':''}</div>
      <div>${r&&r.a?`<button class="btn ${r.s==='bad'?'btn-primary':'btn-secondary'} btn-sm" data-fix="${c.id}" ${DIAG.running?'disabled':''}>${r.a}</button>`:''}</div></li>`}).join('')}</ul>
    ${!DIAG.running&&started===CHECKS.length?(()=>{const bad=Object.values(res).filter(r=>r.s!=='ok').length;return `<div class="summary ${bad?'attn':'ok'}" role="status">${bad?svgI('alert','s16'):svgI('check','s16')}<span style="flex:1">${bad?`${bad} ${bad===1?'item precisa':'itens precisam'} de atenção.`:'Tudo certo com a conexão deste aparelho.'}</span><button class="btn btn-ghost btn-sm" data-copy-report>${svgI('copy','s16')}Copiar relatório</button></div>`})():''}`}
function renderSymptoms(){const box=$('[data-symptoms]');if(!box)return;const s=SYMPTOMS.find(x=>x.id===DIAG.sym);
  box.innerHTML=`<div class="symptoms" role="group" aria-label="O que está acontecendo?">${SYMPTOMS.map(x=>`<button class="sym" aria-pressed="${DIAG.sym===x.id}" data-sym="${x.id}"><span class="dot2"></span>${x.t}</button>`).join('')}</div>
    ${s?`<div class="guide" aria-live="polite"><p class="why"><strong>Por que acontece:</strong> ${s.why}</p>
      <ol class="gsteps">${s.steps.map((t,i)=>`<li class="gstep ${DIAG.symDone||i<DIAG.symStep?'done':i===DIAG.symStep?'cur':''}"><div>${t}${!DIAG.symDone&&i===DIAG.symStep?`<div class="gq"><span>Funcionou?</span><button class="btn btn-secondary btn-sm" data-sym-yes>Sim</button><button class="btn btn-ghost btn-sm" data-sym-no>${i<s.steps.length-1?'Não, próximo passo':'Não'}</button></div>`:''}</div></li>`).join('')}</ol>
      ${DIAG.symDone==='ok'?`<div class="summary ok" style="margin:0">${svgI('check','s16')}<span>Que bom! Se acontecer de novo, este guia continua aqui.</span></div>`:''}
      ${DIAG.symDone==='help'?`<div class="summary attn" style="margin:0">${svgI('alert','s16')}<span style="flex:1">Ainda não funcionou. Copie o relatório e envie para quem cuida da rede ou para a equipe do projeto.</span><button class="btn btn-secondary btn-sm" data-copy-report>${svgI('copy','s16')}Copiar relatório</button></div>`:''}</div>`:''}`}
function renderTechLog(){const box=$('[data-techlog]');if(!box)return;const f=DIAG.logFilter;const items=TECHLOG.filter(l=>f==='all'||(f==='err'?l.type!=='info':l.type===f));
  box.innerHTML=items.length?items.map(l=>`<span class="${l.type==='error'?'e':l.type==='warn'?'w':''}">${l.t}  ${l.type==='error'?'ERRO ':l.type==='warn'?'AVISO':'INFO '}  ${esc(l.msg)}</span>`).join('\n'):'Nenhum registro.';box.scrollTop=box.scrollHeight}
function renderDiag(){
  $('[data-diag]').innerHTML=`
    <section class="panel" aria-labelledby="d-auto"><div class="panel-head"><h2 id="d-auto">Verificação automática</h2><button class="btn btn-primary btn-sm" data-run-checks>${svgI('refresh','s16')}${Object.keys(DIAG.results).length?'Verificar de novo':'Verificar agora'}</button><p>Confere o navegador, o servidor local, a visibilidade e a conexão direta com cada aparelho encontrado.</p></div><div data-checks></div></section>
    <section class="panel" aria-labelledby="d-sym"><div class="panel-head"><h2 id="d-sym">O que está acontecendo?</h2><p>Escolha a situação para ver um passo a passo.</p></div><div data-symptoms></div></section>
    <details class="panel adv" data-adv><summary>Avançado <span class="faint" style="font-weight:400;font-size:13px">· para quem entende de redes</span></summary><div class="adv-body">
      <div><h3>Este aparelho</h3><dl class="mtab">${row('Servidor local',esc(location.origin),true)}${row('Identificador',esc(ME.id),true)}${row('Estado',esc(NET_TXT[S.net]||S.net))}${row('Navegador',esc(navigator.userAgent))}</dl></div>
      <div><div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:8px"><h3 style="margin:0;flex:1">Registros técnicos</h3>
        <div class="chips" style="margin:0" data-log-chips>${[['all','Tudo'],['info','Informações'],['err','Avisos e erros']].map(([k,l])=>`<button class="tab" aria-pressed="${DIAG.logFilter===k}" aria-selected="${DIAG.logFilter===k}" data-logf="${k}">${l}</button>`).join('')}</div>
        <button class="btn btn-ghost btn-sm" data-copy-log>${svgI('copy','s16')}Copiar</button></div><pre class="techlog" data-techlog tabindex="0" aria-label="Registros técnicos"></pre></div>
    </div></details>`;
  renderChecks();renderSymptoms();renderTechLog()}
function report(){const r=CHECKS.map(c=>{const x=DIAG.results[c.id];return `- ${c.t}: ${x?({ok:'OK',warn:'ATENÇÃO',bad:'PROBLEMA',running:'…'}[x.s])+(x.d?': '+x.d:''):'não verificado'}`}).join('\n');
  return `Relatório de conexão do ERASÓ\nAparelho: ${ME.name} · ${ME.os}\nServidor: ${location.origin} · estado: ${NET_TXT[S.net]||S.net}\n${r}\nSituação escolhida: ${SYMPTOMS.find(s=>s.id===DIAG.sym)?.t||'não informada'}\n\nÚltimos registros:\n${TECHLOG.slice(-8).map(l=>`${l.t} ${l.type.toUpperCase()} ${l.msg}`).join('\n')}`}
const copiar=(txt,ok)=>navigator.clipboard?.writeText(txt).then(()=>toast(ok),()=>toast('O navegador bloqueou a cópia. Selecione o texto e copie manualmente.'));
$('[data-diag]').addEventListener('click',async e=>{const t=e.target;
  if(t.closest('[data-run-checks]')){runChecks();t.closest('[data-run-checks]').lastChild.textContent='Verificar de novo';return}
  const fx=t.closest('[data-fix]');if(fx){const c=CHECKS.find(x=>x.id===fx.dataset.fix),r=DIAG.results[c.id];fx.disabled=true;await r.fix();await runChecks(c.id);if(DIAG.results[c.id].s==='ok')toast('Corrigido');return}
  const sy=t.closest('[data-sym]');if(sy){DIAG.sym=DIAG.sym===sy.dataset.sym?null:sy.dataset.sym;DIAG.symStep=0;DIAG.symDone=false;renderSymptoms();return}
  if(t.closest('[data-sym-yes]')){DIAG.symDone='ok';techlog('info','Problema resolvido pelo guia');renderSymptoms();return}
  if(t.closest('[data-sym-no]')){const s=SYMPTOMS.find(x=>x.id===DIAG.sym);if(DIAG.symStep<s.steps.length-1)DIAG.symStep++;else DIAG.symDone='help';renderSymptoms();return}
  if(t.closest('[data-copy-report]')){copiar(report(),'Relatório copiado');return}
  if(t.closest('[data-copy-log]')){copiar(TECHLOG.map(l=>`${l.t} ${l.type.toUpperCase()} ${l.msg}`).join('\n'),'Registros copiados');return}
  const lf=t.closest('[data-logf]');if(lf){DIAG.logFilter=lf.dataset.logf;$$('[data-logf]').forEach(b=>{b.setAttribute('aria-pressed',String(b===lf));b.setAttribute('aria-selected',String(b===lf))});renderTechLog();return}
});
document.addEventListener('click',e=>{if(e.target.closest&&e.target.closest('[data-goto-diag]')){e.preventDefault();closeInspector();location.hash='diagnostico'}});

/* ===================== Diálogo genérico (revisão 5) ===================== */
const MODAL={ret:null,onClose:null,onClick:null};
function openModal(html,{label='',cls='',onClose=null,onClick=null}={}){
  if($('[data-modal-scrim]').hidden)MODAL.ret=document.activeElement;Object.assign(MODAL,{onClose,onClick});
  const m=$('[data-modal]');m.className='dialog modal-dialog '+cls;m.setAttribute('aria-label',label);m.innerHTML=html;hydrateIcons(m);
  $('[data-modal-scrim]').hidden=false;(m.querySelector('[autofocus]')||m).focus()}
function closeModal(){if($('[data-modal-scrim]').hidden)return;$('[data-modal-scrim]').hidden=true;const f=MODAL.onClose;Object.assign(MODAL,{onClose:null,onClick:null});f&&f();MODAL.ret&&MODAL.ret.isConnected&&MODAL.ret.focus&&MODAL.ret.focus()}
$('[data-modal]').addEventListener('click',e=>{if(e.target.closest('[data-modal-close]')){closeModal();return}MODAL.onClick&&MODAL.onClick(e)});
$('[data-modal]').addEventListener('keydown',e=>{if(e.key!=='Tab')return;const f=$$('button:not([disabled]),input:not([disabled]),select,textarea,a[href]',$('[data-modal]')).filter(x=>x.offsetParent);if(!f.length)return;const a=f[0],z=f[f.length-1];if(e.shiftKey&&document.activeElement===a){z.focus();e.preventDefault()}else if(!e.shiftKey&&document.activeElement===z){a.focus();e.preventDefault()}});
$('[data-modal-scrim]').addEventListener('click',e=>{if(e.target===e.currentTarget&&!$('[data-modal]').classList.contains('onb'))closeModal()});
const dlgHead=(t,id='m-title')=>`<div class="dlg-head"><h2 id="${id}">${t}</h2><button class="icon-btn" data-modal-close aria-label="Fechar">${svgI('x')}</button></div>`;
function brandHero(tag=true,animate=false){return `<div class="brand" ${animate?'data-state="opening"':''} style="pointer-events:none;flex-direction:column;gap:10px;padding:0">${$('#symbolTpl').innerHTML}<img class="wordmark on-light" src="assets/letreiro.png" alt="Erasó"><img class="wordmark on-dark" src="assets/letreiro-invertido.png" alt="Erasó"></div>${tag?'<div class="onb-tag">De uma ponta à outra.</div><div class="tagline-rule sm" aria-hidden="true"></div>':''}`}

/* ===================== Primeiro uso (COMPONENT_INVENTORY §11.3) ===================== */
const ONB={step:0,name:'',visible:true,auto:'off'};
function openOnboarding(){Object.assign(ONB,{step:0,name:ME.name,visible:S.visible,auto:S.auto});renderOnb()}
function renderOnb(){const s=ONB.step,N=4;let body='';
  if(s===0)body=`<div class="onb-hero">${brandHero(true,true)}<p style="margin-top:6px">Envie arquivos, textos e links entre os seus aparelhos na mesma rede, sem cabo e sem precisar mandar para você mesmo por aplicativo de mensagens.</p></div>`;
  if(s===1)body=`<h2 id="onb-t">Como este aparelho vai se chamar?</h2><p>É assim que os outros aparelhos vão te ver. Dá para mudar depois.</p>
    <div class="field" style="margin-top:14px"><label for="onb-name">Nome do aparelho</label><div class="insp-name"><input id="onb-name" data-onb-name value="${esc(ONB.name)}" maxlength="40" autofocus><button class="btn btn-secondary btn-sm" data-onb-rand>${svgI('refresh','s16')}Nome do aparelho</button></div></div>`;
  if(s===2)body=`<h2 id="onb-t">Quem pode te enviar coisas?</h2><p>Você sempre vê um pedido antes de receber, a não ser que escolha receber automaticamente.</p>
    <div class="opt-row" style="font-size:14px;margin:14px 0 10px"><span>Ficar visível na rede<br><span class="faint" style="font-size:13px">Aparelhos na mesma rede conseguem te encontrar.</span></span><button class="switch" role="switch" aria-checked="${ONB.visible}" data-onb-vis aria-label="Ficar visível na rede"></button></div>
    <div class="choice" role="radiogroup" aria-label="Receber automaticamente">${[['off','Sempre perguntar','Recomendado. Cada pedido aparece para você aceitar ou recusar.'],['fav','Receber direto dos meus favoritos','Os outros aparelhos continuam perguntando.'],['all','Receber direto de qualquer aparelho','Não recomendado em redes públicas, como a da escola ou da biblioteca.']].map(([k,t,d])=>`<label><input type="radio" name="onb-auto" value="${k}" ${ONB.auto===k?'checked':''}><span>${t}<small>${d}</small></span></label>`).join('')}</div>`;
  if(s===3)body=`<div class="onb-hero" style="text-align:left;justify-items:start">${svgI('leaf','s40')}<h2 id="onb-t">Um projeto de extensão</h2><p>O ERASÓ nasceu em um projeto de extensão estudantil ligado aos Objetivos de Desenvolvimento Sustentável. <span class="faint">[ODS e metas a definir.]</span></p><a class="link-btn" href="#sobre" data-onb-about>Saiba mais em Configurações › Sobre o projeto</a></div>`;
  const last=s===N-1;
  openModal(`${body}<div class="onb-dots" aria-label="Etapa ${s+1} de ${N}">${Array.from({length:N},(_,i)=>`<i class="${i===s?'on':''}"></i>`).join('')}</div>
    <div class="onb-foot"><button class="btn btn-ghost btn-sm" data-onb-skip>${last?'':'Pular introdução'}</button><span style="display:flex;gap:8px">${s?`<button class="btn btn-ghost" data-onb-back>Voltar</button>`:''}<button class="btn btn-primary" data-onb-next>${s===0?'Começar':last?'Concluir':'Continuar'}</button></span></div>`,
    {label:'Introdução ao ERASÓ',cls:'onb',onClick:onbClick});
  if(s===0)$('[data-onb-next]').focus();if(last)$('[data-onb-skip]').hidden=true;
}
function onbSave(){if(ONB.step===1){const v=($('[data-onb-name]').value||'').trim();if(v)ONB.name=v}if(ONB.step===2){ONB.auto=$('[data-modal] input[name=onb-auto]:checked').value}}
function onbFinish(){ME.name=ONB.name;S.visible=ONB.visible;S.auto=ONB.auto;try{localStorage.setItem('eraso-onboarded','1')}catch{}salvarPrefs();REDE.atualizarPerfil({nome:ME.name,visivel:S.visible}).catch(()=>{});closeModal();renderThisDevice();refreshBrand();techlog('info',`Primeiro uso concluído · nome "${ME.name}"`);toast(`Pronto! ${ME.name} está ${S.visible?'visível e pronto para receber':'oculto'}.`)}
function onbClick(e){const t=e.target;
  if(t.closest('[data-onb-rand]')){$('[data-onb-name]').value=ErasoRede.nomePadrao(PERFIL,ME.id);return}
  const v=t.closest('[data-onb-vis]');if(v){ONB.visible=!ONB.visible;v.setAttribute('aria-checked',String(ONB.visible));return}
  if(t.closest('[data-onb-about]')){e.preventDefault();onbSave();onbFinish();location.hash='configuracoes';setTimeout(()=>document.getElementById('sobre')?.scrollIntoView(),80);return}
  if(t.closest('[data-onb-skip]')){onbFinish();return}
  if(t.closest('[data-onb-back]')){onbSave();ONB.step--;renderOnb();return}
  if(t.closest('[data-onb-next]')){onbSave();if(ONB.step===3){onbFinish();return}ONB.step++;renderOnb()}}

/* ===================== Ajuda dos modos de envio (§4.4) ===================== */
$('[data-mode-help]').addEventListener('click',()=>openModal(`${dlgHead('Modos de envio')}<div class="modal-body">
  <div class="notice" style="color:var(--text-primary)">${svgI('send')}<span><strong>Um destino</strong><br><span class="muted">Toque em um aparelho e o envio começa. A seleção é limpa quando termina.</span></span></div>
  <div class="notice" style="color:var(--text-primary)">${svgI('devices')}<span><strong>Vários</strong><br><span class="muted">Marque vários aparelhos e envie para todos de uma vez. A seleção continua para você mandar de novo.</span></span></div></div>
  <div class="modal-actions"><button class="btn btn-primary" data-modal-close autofocus>Entendi</button></div>`,{label:'Modos de envio'}));

/* ===================== Editor da seleção (§4.3) ===================== */
function openSelEditor(){if(!S.selection.length)return;const draft=S.selection.map(s=>({...s}));
  const draw=()=>openModal(`${dlgHead('Editar seleção')}<div class="modal-body"><p class="pair-step-text" style="margin:0">Renomeie, ajuste o texto ou remova itens antes de enviar. O arquivo original não muda.</p>
    <div>${draft.map((s,i)=>`<div class="edit-row"><span class="pi" style="width:36px;height:36px;border-radius:10px;background:var(--bg-sunken);display:grid;place-items:center">${svgI(s.kind==='image'?'image':s.kind==='video'?'video':s.kind==='link'?'link':s.kind==='text'?'text':'file','s16')}</span>
      ${s.kind==='text'||s.kind==='link'?`<textarea data-ed="${i}" aria-label="Texto do item ${i+1}">${esc(s.body)}</textarea>`:`<input data-ed="${i}" value="${esc(s.name.split('/').pop())}" aria-label="Nome do arquivo ${i+1}">`}
      <button class="icon-btn" data-ed-rm="${i}" aria-label="Remover">${svgI('trash')}</button></div>`).join('')||'<p class="faint">Nenhum item.</p>'}</div></div>
    <div class="modal-actions"><button class="btn btn-ghost btn-danger-ghost" data-ed-all style="margin-right:auto">Remover tudo</button><button class="btn btn-ghost" data-modal-close>Cancelar</button><button class="btn btn-primary" data-ed-save>Salvar</button></div>`,
    {label:'Editar seleção',cls:'wide',onClick:e=>{const t=e.target;const rm=t.closest('[data-ed-rm]');if(rm){sync();draft.splice(+rm.dataset.edRm,1);draw();return}
      if(t.closest('[data-ed-all]')){draft.length=0;draw();return}
      if(t.closest('[data-ed-save]')){sync();if(draft.some(d=>!(d.kind==='text'||d.kind==='link'?d.body:d.name).trim())){toast('Nomes e textos não podem ficar vazios');return}S.selection=draft;closeModal();renderTray();toast('Seleção atualizada')}}});
  const sync=()=>$$('[data-ed]').forEach(el=>{const d=draft[+el.dataset.ed];if(!d)return;if(d.kind==='text'||d.kind==='link'){d.body=el.value;d.name=el.value.slice(0,40);d.size=new Blob([el.value]).size}else{const v=el.value.replace(/[\\/:*?"<>|]/g,'');const dir=d.name.includes('/')?d.name.slice(0,d.name.lastIndexOf('/')+1):'';d.name=dir+v}});
  draw()}
$('[data-tray-edit]').addEventListener('click',openSelEditor);

/* ===================== Atalhos de teclado ===================== */
function openShortcuts(){const M=isMac?'⌘':'Ctrl';openModal(`${dlgHead('Atalhos de teclado')}<div class="kbd-list">
  <span>Abrir a paleta de comandos</span><span><kbd>${M}</kbd><kbd>K</kbd></span><span>Colar na seleção</span><span><kbd>${M}</kbd><kbd>V</kbd></span>
  <span>Ir para Compartilhar · Caixa · Atividade · Dispositivos · Configurações</span><span><kbd>${M}</kbd><kbd>1</kbd>…<kbd>5</kbd></span>
  <span>Adicionar texto / guardar na Caixa</span><span><kbd>${M}</kbd><kbd>↵</kbd></span><span>Aceitar pedido · executar ação principal</span><span><kbd>↵</kbd></span>
  <span>Fechar painel, diálogo ou paleta</span><span><kbd>Esc</kbd></span><span>Detalhes de um aparelho</span><span>botão direito no cartão</span><span>Ver esta lista</span><span><kbd>?</kbd></span></div>
  <div class="modal-actions"><button class="btn btn-primary" data-modal-close autofocus>Fechar</button></div>`,{label:'Atalhos de teclado'})}
document.addEventListener('click',e=>{if(e.target.closest&&e.target.closest('[data-open-shortcuts]'))openShortcuts();if(e.target.closest&&e.target.closest('[data-open-onboarding]'))openOnboarding()});

/* ===================== Configurações (COMPONENT_INVENTORY §10.1) ===================== */
// Toda preferência é salva em localStorage (eraso-prefs) e aplicada na hora.
const gerarPin=()=>String(crypto.getRandomValues(new Uint32Array(1))[0]%10000).padStart(4,'0');
function aplicarRede(){REDE.pin=S.pin?S.pinCode:'';REDE.verificarEnvio=!!S.settings.verifyOut;REDE.verificarRecebimento=!!S.settings.verifyIn}
function syncSettingsSwitches(){$$('[data-pin-switch]').forEach(b=>b.setAttribute('aria-checked',String(S.pin)));$$('[data-set-switch]').forEach(b=>b.setAttribute('aria-checked',String(!!S.settings[b.dataset.setSwitch])));
  const linha=$('[data-pin-row]');if(linha)linha.hidden=!S.pin;const c=$('[data-pin-code]');if(c&&document.activeElement!==c)c.value=S.pinCode}
function renderSettingsBits(){syncSettingsSwitches();
  const si=$('[data-sala-input]',$('[data-settings]'));if(si&&document.activeElement!==si)si.value=SALA;
  const sd=$('[data-sala-desc]');if(sd)sd.textContent=REDE.config.salaObrigatoria?'Só aparelhos com o mesmo código se veem. Mantenha o código em segredo.':'Opcional. Sem código, todos os aparelhos da rede se veem. Com um código, só quem usa o mesmo código aparece.';
  const sc=$('[data-sala-copiar]'),ss=$('[data-sala-sair]');if(sc)sc.hidden=!SALA;if(ss)ss.hidden=!SALA;
const n=$('[data-set-name]');if(n&&document.activeElement!==n)n.value=ME.name;
  const r=$('[data-retention]');if(r)r.value=String(S.retention);requestAnimationFrame(()=>$$('[data-settings] .seg').forEach(placeInd))}
$('[data-settings]').addEventListener('click',e=>{const t=e.target;
  const sw=t.closest('[data-set-switch]');if(sw){const k=sw.dataset.setSwitch;S.settings[k]=!S.settings[k];sw.setAttribute('aria-checked',String(S.settings[k]));salvarPrefs();aplicarRede();techlog('info',`Configuração "${k}" ${S.settings[k]?'ligada':'desligada'}`);if(k==='history'&&S.view==='atividade')renderActivity();return}
  if(t.closest('[data-name-save]')){const v=$('[data-set-name]').value.trim();if(!v){toast('O nome não pode ficar vazio');return}ME.name=v;salvarPrefs();REDE.atualizarPerfil({nome:v}).catch(()=>{});renderThisDevice();toast('Nome salvo');return}
  if(t.closest('[data-pin-new]')){S.pinCode=gerarPin();salvarPrefs();aplicarRede();syncSettingsSwitches();toast('Novo PIN gerado');return}
  if(t.closest('[data-clear-hist]'))openClearHistory()});
$('[data-pin-code]').addEventListener('input',e=>{const v=e.target.value.replace(/\D/g,'').slice(0,4);e.target.value=v;if(v.length===4){S.pinCode=v;salvarPrefs();aplicarRede()}});
$('[data-pin-code]').addEventListener('blur',e=>{if(e.target.value.length!==4){e.target.value=S.pinCode;toast('O PIN precisa ter 4 dígitos')}});
$('[data-pin-switch]').addEventListener('click',e=>{S.pin=!S.pin;if(S.pin&&!/^\d{4}$/.test(S.pinCode))S.pinCode=gerarPin();salvarPrefs();aplicarRede();syncSettingsSwitches();toast(S.pin?'PIN ligado. Quem enviar para este aparelho precisará digitá-lo.':'PIN desligado')});
$('[data-settings]').addEventListener('change',e=>{
  if(e.target.matches('[data-retention]')){S.retention=+e.target.value;salvarPrefs();const corte=Date.now()-S.retention*864e5;S.inbox.filter(i=>!i.pinned&&i.ts<corte).forEach(i=>IDB.apagar(i.id).catch(()=>{}));S.inbox=S.inbox.filter(i=>i.pinned||i.ts>=corte);if(S.view==='caixa')renderInbox();toast(`Itens da Caixa ficam guardados por ${S.retention===1?'1 dia':S.retention+' dias'}`)}});
$('[data-set-q]').addEventListener('input',e=>{const q=norm(e.target.value.trim());let any=false;
  $$('[data-settings] .set-sec').forEach(sec=>{let vis=0;$$('.set-row',sec).forEach(r=>{const ok=!q||norm(r.textContent+' '+sec.querySelector('h2').textContent).includes(q);r.hidden=!ok;if(ok)vis++});
    const about=sec.id==='sobre'&&(!q||norm(sec.textContent).includes(q));sec.hidden=!vis&&!about;if(vis||about)any=true});
  $('[data-set-none]').hidden=any});
$('[data-about-hero]').innerHTML=brandHero(true);

/* rotas: atualiza Configurações ao entrar */
const _goBase=go;go=function(v){_goBase(v);if(S.view==='configuracoes')renderSettingsBits()};

/* soltar arquivos na Caixa */
const capBox=$('.capture');
capBox.addEventListener('dragover',e=>{e.preventDefault();capBox.classList.add('drag')});capBox.addEventListener('dragleave',()=>capBox.classList.remove('drag'));

/* ===================== Tema e movimento ===================== */
function setTheme(v){document.documentElement.dataset.theme=v;try{localStorage.setItem('eraso-theme',v)}catch{}setSeg($('[data-theme-seg]'),'themeVal',v);$$('[data-toggle-theme]').forEach(b=>b.innerHTML=svgI(isDark()?'sun':'moon'))}
const isDark=()=>document.documentElement.dataset.theme==='dark'||(document.documentElement.dataset.theme==='system'&&matchMedia('(prefers-color-scheme: dark)').matches);
function toggleTheme(){setTheme(isDark()?'light':'dark')}
function setMotion(v){if(v==='system')delete document.documentElement.dataset.motion;else document.documentElement.dataset.motion=v;try{localStorage.setItem('eraso-motion',v)}catch{}setSeg($('[data-motion-seg]'),'motionVal',v)}
$('[data-theme-seg]').addEventListener('click',e=>{const b=e.target.closest('[data-theme-val]');if(b)setTheme(b.dataset.themeVal)});
$('[data-motion-seg]').addEventListener('click',e=>{const b=e.target.closest('[data-motion-val]');if(b)setMotion(b.dataset.motionVal)});
$$('[data-toggle-theme]').forEach(b=>b.addEventListener('click',toggleTheme));

/* ===================== Toast ===================== */
function toast(msg,action,fn){const t=document.createElement('div');t.className='toast';t.innerHTML=`<span>${esc(msg)}</span>${action?`<button>${esc(action)}</button>`:''}`;if(action)t.querySelector('button').onclick=()=>{fn();t.remove()};
  const box=$('[data-toasts]');box.appendChild(t);while(box.children.length>2)box.firstElementChild.remove();setTimeout(()=>t.remove(),action?6000:3600)}
document.addEventListener('click',e=>{const b=e.target.closest('[data-toast]');if(b)toast(b.dataset.toast)});

/* ===================== Paleta de comandos ===================== */
let palSel=0,palItems=[];
function commands(){return[
  {g:'Ações',t:'Enviar arquivos…',i:'file',k:'',run:()=>{go('compartilhar');$('[data-file-input]').click()}},
  {g:'Ações',t:'Enviar texto',i:'text',run:()=>{location.hash='compartilhar';setTimeout(()=>openEditor('text'),50)}},
  {g:'Ações',t:'Colar da área de transferência',i:'clipboard',run:()=>{location.hash='compartilhar';pasteFromClipboard()}},
  {g:'Ações',t:'Buscar aparelhos por perto',i:'refresh',run:()=>{location.hash='compartilhar';S.tab='nearby';scan()}},
  {g:'Ações',t:'Guardar na Caixa…',i:'inbox',run:()=>{location.hash='caixa';setTimeout(()=>$('[data-capture]').focus(),50)}},
  {g:'Ações',t:'Diagnosticar conexão',i:'activity',run:()=>location.hash='diagnostico'},
  {g:'Ações',t:'Detalhes deste aparelho',sub:'servidor, identificador',i:'info',run:()=>openInspector('me')},
  {g:'Ações',t:S.visible?'Ficar oculto na rede':'Ficar visível na rede',i:'eye',run:()=>{$('[data-vis]').click()}},
  {g:'Ajustes',t:'Atalhos de teclado',i:'settings2',k:'?',run:openShortcuts},
  {g:'Ajustes',t:'Rever introdução',i:'leaf',run:openOnboarding},
  {g:'Ajustes',t:'Alto contraste',i:'eye',run:()=>setTheme(document.documentElement.dataset.theme==='contrast'?'system':'contrast')},
  ...DEVICES.filter(d=>d.online).map(d=>({g:'Aparelhos',t:`Enviar para ${d.name}`,sub:`${d.meta} · ID ${idCurto(d.id)}`,hay:d.id,i:devIcon(d.type),run:()=>{location.hash='compartilhar';sendTo(d)}})),
  ...NAV.map(([id,ic,l],i)=>({g:'Ir para',t:l,i:ic,k:`${isMac?'⌘':'Ctrl'} ${i+1}`,run:()=>location.hash=id})),
  {g:'Ajustes',t:'Alternar tema claro/escuro',i:'moon',run:toggleTheme},
  {g:'Ajustes',t:'Animações reduzidas',i:'spark',run:()=>{setMotion(document.documentElement.dataset.motion==='reduced'?'system':'reduced');toast('Preferência de animação atualizada')}},
]}
function openPalette(){$('[data-pal-scrim]').hidden=false;const inp=$('[data-pal-input]');inp.value='';renderPal('');inp.focus()}
function closePalette(){$('[data-pal-scrim]').hidden=true}
function renderPal(q){q=q.normalize('NFD').replace(/\p{Diacritic}/gu,'').toLowerCase();palItems=commands().filter(c=>norm(c.t+' '+(c.sub||'')+' '+(c.hay||'')+' '+c.g).includes(q));palSel=0;
  if(!palItems.length){$('[data-pal-list]').innerHTML=`<div class="pal-group">Nada encontrado — tente "enviar" ou o nome de um aparelho</div>`;return}
  let g='';$('[data-pal-list]').innerHTML=palItems.map((c,i)=>{const h=c.g!==g?`<div class="pal-group">${c.g}</div>`:'';g=c.g;return h+`<div class="pal-item" role="option" id="po${i}" aria-selected="${i===palSel}" data-pi="${i}">${svgI(c.i)}<span class="pt">${c.t}${c.sub?` <small>${c.sub}</small>`:''}</span>${c.k?`<kbd>${c.k}</kbd>`:''}</div>`}).join('');
  $('[data-pal-input]').setAttribute('aria-activedescendant','po0')}
function movePal(d){if(!palItems.length)return;palSel=(palSel+d+palItems.length)%palItems.length;$$('.pal-item').forEach((el,i)=>el.setAttribute('aria-selected',String(i===palSel)));const el=$(`#po${palSel}`);el.scrollIntoView({block:'nearest'});$('[data-pal-input]').setAttribute('aria-activedescendant','po'+palSel)}
function runPal(i){const c=palItems[i];if(!c)return;closePalette();c.run()}
$('[data-pal-input]').addEventListener('input',e=>renderPal(e.target.value));
$('[data-pal-input]').addEventListener('keydown',e=>{if(e.key==='ArrowDown'){movePal(1);e.preventDefault()}else if(e.key==='ArrowUp'){movePal(-1);e.preventDefault()}else if(e.key==='Enter'){runPal(palSel);e.preventDefault()}});
$('[data-pal-list]').addEventListener('click',e=>{const it=e.target.closest('[data-pi]');if(it)runPal(+it.dataset.pi)});
$('[data-pal-scrim]').addEventListener('click',e=>{if(e.target===e.currentTarget)closePalette()});
$$('[data-open-palette]').forEach(b=>b.addEventListener('click',openPalette));

/* ===================== Atalhos globais ===================== */
document.addEventListener('keydown',e=>{
  const mod=e.ctrlKey||e.metaKey;
  if(mod&&e.key.toLowerCase()==='k'){e.preventDefault();$('[data-pal-scrim]').hidden?openPalette():closePalette();return}
  if(e.key==='Escape'){if(!$('[data-pal-scrim]').hidden){closePalette();return}if(!$('[data-modal-scrim]').hidden){if($('[data-modal]').classList.contains('onb'))onbFinish(false);else closeModal();return}if(!$('[data-req-scrim]').hidden)return;if(INSP.kind){closeInspector();return}if(!$('[data-req-scrim]').hidden)return;/* pedido exige decisão explícita */
    if(!$('[data-editor]').hidden){closeEditor();return}}
  if(!$('[data-req-scrim]').hidden&&e.key==='Enter'&&!elOf(e).closest('button,a')){const a=$('[data-req-accept]');if(a&&!a.disabled){e.preventDefault();a.click()}}
  if(e.key==='?'&&!elOf(e).closest('input,textarea,select,[contenteditable]')&&$('[data-modal-scrim]').hidden){e.preventDefault();openShortcuts();return}
  if(mod&&/^[1-5]$/.test(e.key)&&!e.shiftKey){e.preventDefault();location.hash=NAV[+e.key-1][0]}
});
/* foco preso no pedido */
$('[data-req]').addEventListener('keydown',e=>{if(e.key!=='Tab')return;const f=$$('button:not([disabled]),a[href]',$('[data-req]'));if(!f.length)return;const first=f[0],last=f[f.length-1];if(e.shiftKey&&document.activeElement===first){last.focus();e.preventDefault()}else if(!e.shiftKey&&document.activeElement===last){first.focus();e.preventDefault()}});

/* ===================== Rede (presença e conexão direta reais) ===================== */
const REDE=new ErasoRede.Rede({sala:SALA,perfil:{id:ME.id,nome:ME.name,tipo:ME.type,so:ME.os},visivel:S.visible,
  onStatus:(s)=>{S.net=s;if(['desconectado','outra-aba','sem-webrtc','sem-sala'].includes(s))sincronizarAparelhos([]);renderThisDevice();$('[data-scan-text]').textContent=statusBusca();refreshBrand();renderGrid();if(INSP.kind==='me')renderInspector()},
  onAparelhos:sincronizarAparelhos,onPedido:pedidoChegou,log:(t,m)=>techlog(t==='error'?'error':t==='warn'?'warn':'info',m)});
aplicarRede();

/* ===================== Início ===================== */
$$('[data-symbol]').forEach(s=>s.replaceWith($('#symbolTpl').content.cloneNode(true)));
$$('[data-mod]').forEach(k=>k.textContent=k.textContent.replace('Ctrl',isMac?'⌘':'Ctrl'));
$('[data-goto-about]').addEventListener('click',e=>{e.preventDefault();location.hash='configuracoes';setTimeout(()=>document.getElementById('sobre').scrollIntoView({behavior:reduced()?'auto':'smooth'}),60)});
hydrateIcons();
let th='system',mo='system';try{th=localStorage.getItem('eraso-theme')||'system';mo=localStorage.getItem('eraso-motion')||'system'}catch{}
setTheme(th);setMotion(mo);
matchMedia('(prefers-color-scheme: dark)').addEventListener('change',()=>setTheme(document.documentElement.dataset.theme));
renderThisDevice();setMode('one');go((location.hash.slice(1)==='sobre'?'configuracoes':location.hash.slice(1))||'compartilhar');
setBrand('opening');carregarCaixa();
if(/[?&]sala=/.test(location.search)){salvarPrefs();tirarSalaDaUrl()}
// Antes de entrar na rede, descobre o modelo do aparelho (quando o navegador informa) para o nome e o sistema serem os reais.
Promise.race([ErasoRede.detalharPerfil(PERFIL),new Promise(r=>setTimeout(r,800))]).then(()=>{
  ME.os=PERFIL.meta;REDE.perfil.so=ME.os;
  if(ME.name===NOME_SEM_MODELO&&PERFIL.modelo){ME.name=ErasoRede.nomePadrao(PERFIL,ME.id);REDE.perfil.nome=ME.name;salvarPrefs();renderThisDevice()}
}).finally(()=>REDE.conectar());
let onbDone=false;try{onbDone=!!localStorage.getItem('eraso-onboarded')}catch{}if(!onbDone&&!/[?&]sem-intro/.test(location.search))setTimeout(openOnboarding,500);
