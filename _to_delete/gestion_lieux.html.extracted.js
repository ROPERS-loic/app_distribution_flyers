
// ══════════════════════════════════════════════════════════
//  CONFIG SUPABASE
// ══════════════════════════════════════════════════════════
const SUPABASE_URL = 'https://krbzipnoeroaofojccri.supabase.co';
const SUPABASE_KEY = 'sb_publishable_00DghQOW-_toZkmmA2uEkA_8yd9xNSP';

function getToken(){ const s=getStoredSession(); return s?.access_token||SUPABASE_KEY; }

async function refreshSession(){
  const s=getStoredSession();
  if(!s?.refresh_token) return false;
  try {
    const d=await sbAuthPost('token?grant_type=refresh_token',{refresh_token:s.refresh_token});
    localStorage.setItem('sb-krbzipnoeroaofojccri-auth-token',JSON.stringify(d));
    return true;
  } catch(e){ return false; }
}

async function sbFetch(url,opts){
  let r=await fetch(url,opts);
  if(r.status===401){
    const ok=await refreshSession();
    if(ok){
      opts.headers['Authorization']='Bearer '+getToken();
      r=await fetch(url,opts);
    } else {
      localStorage.removeItem('sb-krbzipnoeroaofojccri-auth-token');
      showToast('⚠ Session expirée, reconnexion nécessaire');
      setTimeout(()=>location.reload(), 1200);
      throw new Error('Session expirée, reconnectez-vous');
    }
  }
  if(!r.ok){const e=await r.json().catch(()=>({}));throw new Error(e.message||e.error||'HTTP '+r.status);}
  if(r.status===204) return null;
  return r.json();
}
async function sbGet(path){
  return sbFetch(`${SUPABASE_URL}/rest/v1/${path}`,{headers:{'apikey':SUPABASE_KEY,'Authorization':'Bearer '+getToken()}});
}
async function sbPost(table,data){
  return sbFetch(`${SUPABASE_URL}/rest/v1/${table}`,{method:'POST',headers:{'apikey':SUPABASE_KEY,'Authorization':'Bearer '+getToken(),'Content-Type':'application/json','Prefer':'return=representation'},body:JSON.stringify(data)});
}
async function sbPatch(table,filter,data){
  return sbFetch(`${SUPABASE_URL}/rest/v1/${table}?${filter}`,{method:'PATCH',headers:{'apikey':SUPABASE_KEY,'Authorization':'Bearer '+getToken(),'Content-Type':'application/json','Prefer':'return=representation'},body:JSON.stringify(data)});
}
async function sbDelete(table,filter){
  await sbFetch(`${SUPABASE_URL}/rest/v1/${table}?${filter}`,{method:'DELETE',headers:{'apikey':SUPABASE_KEY,'Authorization':'Bearer '+getToken()}});
  return true;
}
async function sbAuthPost(endpoint,body,token){
  const headers={'apikey':SUPABASE_KEY,'Content-Type':'application/json'};
  if(token) headers['Authorization']='Bearer '+token;
  const r=await fetch(`${SUPABASE_URL}/auth/v1/${endpoint}`,{method:'POST',headers,body:JSON.stringify(body)});
  if(!r.ok){const e=await r.json().catch(()=>({}));throw new Error(e.message||e.error_description||'HTTP '+r.status);}
  return r.json();
}

// ══════════════════════════════════════════════════════════
//  STATE
// ══════════════════════════════════════════════════════════
var ST = {
  user: null, profile: null,
  lieux: [], lieuxFiltered: [],
  tournees: [], tourneesFiltered: [],
  distributeurs: [],
  currentTourneeId: null, currentTourneeStops: [],
  pickerSelected: new Set(), addStopsSelected: new Set(),
  map: null, mapMarkers: [], lastVisits: {}, saisons: {}, rappels: {}, livraisons: {},
  realtimeSub: null,
  editeurLoaded: false
};

// ══════════════════════════════════════════════════════════
//  AUTH
// ══════════════════════════════════════════════════════════
async function doLogin(){
  const email = document.getElementById('login-email').value.trim();
  const pwd   = document.getElementById('login-pwd').value;
  const btn   = document.querySelector('.btn-login');
  document.getElementById('login-err').style.display = 'none';
  if(!email || !pwd){ showErr('Renseignez email et mot de passe'); return; }
  btn.textContent = '⏳ Connexion…'; btn.disabled = true;
  try {
    const data = await sbAuthPost('token?grant_type=password', {email, password: pwd});
    localStorage.setItem('sb-krbzipnoeroaofojccri-auth-token', JSON.stringify(data));
    await startApp(data.user);
  } catch(e) {
    showErr('❌ ' + e.message);
  } finally {
    btn.textContent = 'Se connecter'; btn.disabled = false;
  }
}

async function doLogout(){
  try { await sbAuthPost('logout', {}, getToken()); } catch(e){}
  localStorage.removeItem('sb-krbzipnoeroaofojccri-auth-token');
  location.reload();
}

function showErr(msg){ const e=document.getElementById('login-err'); e.textContent=msg; e.style.display='block'; }

function diag(msg, color){ console.log(msg); }

async function startApp(user){
  if(ST.user) return;
  ST.user = user;
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('app').classList.add('visible');
  document.getElementById('hdr-username').textContent = user.email;
  diag('✅ Connecté : ' + user.email, '#27AE60');
  diag('⏳ Chargement des données…');
  await loadAll();
  // setupRealtime(); // désactivé — connexion WebSocket bloque Edge tracking prevention
}

function getStoredSession(){
  try {
    const raw = localStorage.getItem('sb-krbzipnoeroaofojccri-auth-token');
    return raw ? JSON.parse(raw) : null;
  } catch(e){ return null; }
}

window.addEventListener('DOMContentLoaded', async () => {
  const stored = getStoredSession();
  if(stored?.user) await startApp(stored.user);
});


document.getElementById('login-pwd').addEventListener('keydown', e => { if(e.key==='Enter') doLogin(); });

// ══════════════════════════════════════════════════════════
//  LOAD ALL
// ══════════════════════════════════════════════════════════
async function loadAll(){
  await Promise.all([loadLieux(), loadTournees(), loadDistributeurs()]);
  renderDashboard();
  initMap();
}

async function loadLieux(){
  try {
    const data = await sbGet('lieux?select=*&actif=eq.true&order=nom');
    ST.lieux = data||[]; ST.lieuxFiltered=[...ST.lieux];
    updateMapMarkers();
  } catch(e) {
    showToast('❌ Lieux : '+e.message, 6000);
    const tb=document.getElementById('lieux-tbody'); if(tb) tb.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:20px;color:var(--red)">❌ ${e.message}</td></tr>`;
  }
}

async function loadTournees(){
  try {
    const data = await sbGet('tournees?select=*,distributeur:utilisateurs(nom,email),points:points_tournee(id,statut,quantite_flyers,type_arret,est_repere)&order=date.desc');
    ST.tournees=data||[]; ST.tourneesFiltered=[...ST.tournees];
    renderTourneesTable(); renderDashboard(); updateMapTourneeFilter();
  } catch(e){ console.error('loadTournees',e); }
}

async function loadDistributeurs(){
  try {
    const data = await sbGet('utilisateurs?select=*&order=nom.asc');
    ST.distributeurs = data||[];
    renderDistributeursSelects();
  } catch(e){ console.error('loadDistributeurs',e); }
}

// ══════════════════════════════════════════════════════════
//  NAVIGATION
// ══════════════════════════════════════════════════════════
function showSection(name){
  document.querySelectorAll('.section').forEach(s=>s.classList.remove('active'));
  document.querySelectorAll('.hdr-tab').forEach(t=>t.classList.remove('active'));
  document.getElementById('section-'+name).classList.add('active');
  document.getElementById('tab-'+name).classList.add('active');
  if(name==='carte'){ setTimeout(()=>ST.map&&ST.map.invalidateSize(),100); Promise.all([loadSaisonsActuelles(), loadRappelsActuels()]).then(()=>{ updateMapMarkers(); renderMapAlertes(); }); }
  if(name==='suivi') renderSuivi();
  if(name==='editeur') loadEditeur();
  if(name==='distributeurs') renderDistributeursTable();
  if(name==='stats') loadGStats();
  if(name==='notes') loadNotes();
}

function loadEditeur(){
  if(ST.editeurLoaded) return;
  const iframe = document.getElementById('editeur-iframe');
  iframe.src = 'editeur_lieux.html';
  ST.editeurLoaded = true;
}

// ══════════════════════════════════════════════════════════
//  DASHBOARD
// ══════════════════════════════════════════════════════════
function isRepere(p){ return p.est_repere===true; }

function renderDashboard(){
  document.getElementById('st-lieux').textContent = ST.lieux.length;
  document.getElementById('st-tournees').textContent = ST.tournees.length;
  const totalPts  = ST.tournees.reduce((s,t)=>s+(t.points?.filter(p=>!isRepere(p)).length||0),0);
  const donePts   = ST.tournees.reduce((s,t)=>s+(t.points?.filter(p=>p.statut!=='a_faire'&&!isRepere(p)).length||0),0);
  const totalFly  = ST.tournees.reduce((s,t)=>s+(t.points?.filter(p=>p.statut==='distribue').reduce((a,p)=>a+(p.quantite_flyers||0),0)||0),0);
  document.getElementById('st-distribues').textContent = donePts+' / '+totalPts;
  document.getElementById('st-flyers').textContent = totalFly;

  const el = document.getElementById('dash-tournees-list');
  const recent = ST.tournees.slice(0,6);
  if(!recent.length){ el.innerHTML='<div style="padding:20px;text-align:center;color:var(--grey);font-size:13px">Aucune tournée</div>'; return; }
  el.innerHTML = recent.map(t=>{
    const pts=(t.points||[]).filter(p=>!isRepere(p)), done=pts.filter(p=>p.statut!=='a_faire').length, pct=pts.length?Math.round(done/pts.length*100):0;
    return `<div class="tournee-row" onclick="openTourneeDetail(${t.id})">
      <div class="tr-icon">${statutEmoji(t.statut)}</div>
      <div class="tr-info">
        <div class="tr-name">${esc(t.nom)}</div>
        <div class="tr-meta">${fmtDate(t.date)} · ${t.distributeur?.nom||'Non assigné'}</div>
        <div class="prog-mini"><div class="prog-mini-fill" style="width:${pct}%"></div></div>
      </div>
      <span class="badge b-${t.statut}">${statutLabel(t.statut)}</span>
    </div>`;
  }).join('');
}

// ══════════════════════════════════════════════════════════
//  TOURNÉES
// ══════════════════════════════════════════════════════════
function fmtDureeEstimee(t){
  if(t.duree_totale_min===null||t.duree_totale_min===undefined) return '—';
  var h=Math.floor(t.duree_totale_min/60), m=Math.round(t.duree_totale_min%60);
  return (h>0?h+'h '+m+'min':m+' min')+(t.distance_km?' · '+t.distance_km+' km':'');
}
function renderTourneesTable(){
  const tbody=document.getElementById('tournees-tbody'),data=ST.tourneesFiltered;
  if(!data.length){tbody.innerHTML='<tr><td colspan="8" style="text-align:center;padding:30px;color:var(--grey)">Aucune tournée</td></tr>';return;}
  tbody.innerHTML=data.map(t=>{
    const pts=(t.points||[]).filter(p=>!isRepere(p)),done=pts.filter(p=>p.statut!=='a_faire').length,pct=pts.length?Math.round(done/pts.length*100):0;
    return `<tr>
      <td><strong style="cursor:pointer;color:var(--blue)" onclick="openTourneeDetail(${t.id})">${esc(t.nom)}</strong></td>
      <td>${fmtDate(t.date)}</td><td>${esc(t.distributeur?.nom||'—')}</td><td>${esc(t.secteur||'—')}</td>
      <td><span class="badge b-${t.statut}">${statutLabel(t.statut)}</span></td>
      <td><div style="display:flex;align-items:center;gap:8px;min-width:120px"><div class="prog-mini" style="flex:1"><div class="prog-mini-fill" style="width:${pct}%"></div></div><span style="font-size:11px;color:var(--grey)">${done}/${pts.length}</span></div></td>
      <td style="font-size:12px;color:var(--grey)">${fmtDureeEstimee(t)}</td>
      <td style="display:flex;gap:5px">
        <button class="btn btn-secondary btn-sm" onclick="openTourneeDetail(${t.id})">Détail</button>
        <button class="btn btn-danger btn-sm" onclick="deleteTournee(${t.id})">🗑</button>
      </td>
    </tr>`;
  }).join('');
}

function filterTourneesTable(){
  const q=norm(document.getElementById('tournees-search').value);
  const s=document.getElementById('tournees-statut-filter').value;
  ST.tourneesFiltered=ST.tournees.filter(t=>(!q||norm(t.nom).includes(q))&&(!s||t.statut===s));
  renderTourneesTable();
}

function renderDistributeursSelects(){
  const opts='<option value="">— Choisir —</option>'+ST.distributeurs.map(d=>`<option value="${d.id}">${esc(d.nom)}</option>`).join('');
  ['t-distributeur'].forEach(id=>{const el=document.getElementById(id);if(el)el.innerHTML=opts;});
}

function openTourneeModal(){
  document.getElementById('t-nom').value='';
  document.getElementById('t-date').value=new Date().toISOString().split('T')[0];
  document.getElementById('t-distributeur').value='';
  document.getElementById('t-secteur').value='';
  document.getElementById('t-commentaire').value='';
  document.getElementById('t-quantite').value='10';
  const pmo=document.getElementById('picker-mois-ouvre'), pmf=document.getElementById('picker-mois-ferme');
  if(pmo) pmo.value=''; if(pmf) pmf.value='';
  ST.pickerSelected=new Set(); renderLieuxPicker();
  openModal('modal-tournee');
}

function renderLieuxPicker(){
  const q=(document.getElementById('lieux-picker-search')||{}).value||'';
  const moisOuvre=document.getElementById('picker-mois-ouvre')?.value||'';
  const moisFerme=document.getElementById('picker-mois-ferme')?.value||'';
  const filtered=ST.lieux.filter(l=>{
    if(q && !norm(l.nom).includes(norm(q)) && !norm(l.ville).includes(norm(q))) return false;
    const s=ST.saisons[l.id];
    if(moisOuvre){ if(!s||!s.date_ouverture||(new Date(s.date_ouverture).getMonth()+1)!==parseInt(moisOuvre)) return false; }
    if(moisFerme){ if(!s||!s.date_fermeture||(new Date(s.date_fermeture).getMonth()+1)!==parseInt(moisFerme)) return false; }
    return true;
  });
  document.getElementById('lieux-picker').innerHTML=filtered.map(l=>{
    const s=ST.saisons[l.id];
    const saisonBadge=(s&&(s.date_ouverture||s.date_fermeture))?`<div class="lpi-cat" style="color:#8D6E63">${s.date_ouverture?'Ouvre '+new Date(s.date_ouverture).toLocaleDateString('fr-FR',{day:'2-digit',month:'short'}):''}${s.date_ouverture&&s.date_fermeture?' · ':''}${s.date_fermeture?'Ferme '+new Date(s.date_fermeture).toLocaleDateString('fr-FR',{day:'2-digit',month:'short'}):''}</div>`:'';
    return `
    <div class="lieu-pick-item ${ST.pickerSelected.has(l.id)?'selected':''}" onclick="togglePicker(${l.id})">
      <div class="lpi-check">${ST.pickerSelected.has(l.id)?'✓':''}</div>
      <div style="flex:1;min-width:0"><div class="lpi-name">${esc(l.nom)}</div><div class="lpi-cat">${esc(l.categorie||'')}${l.ville?' · '+esc(l.ville):''}</div>${saisonBadge}</div>
    </div>`;
  }).join('');
  document.getElementById('picker-count').textContent=ST.pickerSelected.size+' lieu'+(ST.pickerSelected.size>1?'x':'')+' sélectionné'+(ST.pickerSelected.size>1?'s':'');
}
function filterLieuxPicker(){ renderLieuxPicker(); }
function togglePicker(id){ if(ST.pickerSelected.has(id))ST.pickerSelected.delete(id);else ST.pickerSelected.add(id); renderLieuxPicker(); }

async function saveTournee(){
  const nom=document.getElementById('t-nom').value.trim(), date=document.getElementById('t-date').value;
  if(!nom||!date){showToast('⚠ Nom et date obligatoires');return;}
  if(!ST.pickerSelected.size){showToast('⚠ Sélectionnez au moins un lieu');return;}
  const distId=document.getElementById('t-distributeur').value||null;
  const qty=parseInt(document.getElementById('t-quantite').value)||10;
  try {
    const tArr=await sbPost('tournees',{nom,date,distributeur_id:distId,secteur:document.getElementById('t-secteur').value.trim(),commentaire:document.getElementById('t-commentaire').value.trim(),statut:'planifiee'});
    const tData=Array.isArray(tArr)?tArr[0]:tArr;
    const points=[...ST.pickerSelected].map((lieuId,i)=>({tournee_id:tData.id,lieu_id:lieuId,ordre_passage:i+1,quantite_flyers:qty,statut:'a_faire'}));
    await sbPost('points_tournee',points);
    showToast('✅ Tournée créée avec '+points.length+' lieux');
    closeModal('modal-tournee'); await loadTournees(); openTourneeDetail(tData.id);
  } catch(e){ showToast('❌ '+e.message); }
}

async function deleteTournee(id){
  if(!confirm('Supprimer cette tournée et tous ses points ?')) return;
  try {
    await sbDelete('tournees','id=eq.'+id);
    showToast('🗑 Tournée supprimée');
    if(ST.currentTourneeId===id) closeTourneeDetail();
    await loadTournees();
  }
  catch(e){ showToast('❌ '+e.message); }
}

function editPreparationTournee(){
  if(!ST.currentTourneeId) return;
  window.location.href = 'editeur_lieux.html?edit_tournee=' + ST.currentTourneeId;
}

async function openTourneeDetail(id){
  ST.currentTourneeId=id;
  try {
    const data=await sbGet(`points_tournee?select=*,lieu:lieux(nom,adresse,ville,categorie,latitude,longitude),commandes_livraison(*)&tournee_id=eq.${id}&order=ordre_passage.asc`);
    ST.currentTourneeStops=data||[];
  } catch(e){ showToast('❌ '+e.message); return; }
  const t=ST.tournees.find(x=>x.id===id);
  document.getElementById('detail-title').textContent=t?.nom||'Tournée';
  document.getElementById('detail-badge').className='badge b-'+(t?.statut||'planifiee');
  document.getElementById('detail-badge').textContent=statutLabel(t?.statut);
  document.getElementById('btn-edit-preparation').style.display=(t?.statut==='planifiee')?'':'none';
  document.getElementById('btn-synthese').style.display=(t?.statut==='terminee')?'':'none';
  loadRappelsActuels();
  document.getElementById('detail-infos').innerHTML=`
    <div style="font-size:12px"><strong>Date :</strong> ${fmtDate(t?.date)}</div>
    <div style="font-size:12px;display:flex;align-items:center;gap:6px;flex-wrap:wrap">
      <strong>Distributeur :</strong>
      <select style="font-size:12px;padding:2px 4px;border-radius:4px;border:1px solid #ddd" onchange="reassignTourneeDistributeur(this.value)">
        <option value="">— Non assigné —</option>
        ${ST.distributeurs.map(d=>`<option value="${d.id}" ${t?.distributeur_id===d.id?'selected':''}>${esc(d.nom)}</option>`).join('')}
      </select>
    </div>
    <div style="font-size:12px"><strong>Secteur :</strong> ${esc(t?.secteur||'—')}</div>
    <div style="font-size:12px"><strong>Commentaire :</strong> ${esc(t?.commentaire||'—')}</div>`;
  renderDetailStops();
  document.getElementById('tournees-list-view').style.display='none';
  document.getElementById('tournee-detail-view').style.display='block';
  showSection('tournees');
}

async function renameTournee(){
  if(!ST.currentTourneeId) return;
  const t = ST.tournees.find(x=>x.id===ST.currentTourneeId);
  const nom = prompt('Nouveau nom de la tournée :', t?.nom||'');
  if(nom===null) return;
  const trimmed = nom.trim();
  if(!trimmed){ showToast('⚠ Le nom ne peut pas être vide'); return; }
  try {
    await sbPatch('tournees','id=eq.'+ST.currentTourneeId,{nom:trimmed});
    if(t) t.nom = trimmed;
    document.getElementById('detail-title').textContent = trimmed;
    renderTourneesTable(); renderDashboard();
    showToast('✅ Tournée renommée');
  } catch(e){ showToast('❌ '+e.message); }
}

function openStopDetail(pointId){
  const s = ST.currentTourneeStops.find(x=>x.id===pointId);
  const validated = s && s.statut && s.statut!=='a_faire';
  if(validated){ editStopDetailForm(pointId); }
  else { renderStopDetailView(pointId); }
  openModal('modal-stop-detail');
}

function renderStopDetailView(pointId){
  const s = ST.currentTourneeStops.find(x=>x.id===pointId);
  if(!s) return;
  const l = s.lieu||{};
  document.getElementById('stop-detail-title').textContent = l.nom||'Arrêt';
  const isLivraisonOnly = s.type_arret==='livraison';
  const repere = isRepere(s);
  const cmd = s.commandes_livraison && s.commandes_livraison[0];
  const validated = s.statut && s.statut!=='a_faire';
  const adresseHtml = (l.adresse||l.ville) ? `<div style="font-size:12px;color:var(--grey);margin-bottom:14px">📍 ${esc([l.adresse,l.ville].filter(Boolean).join(', '))}</div>` : '';
  let bodyHtml = adresseHtml;
  if(repere && !validated){
    bodyHtml += `<div style="text-align:center;padding:30px 10px;color:var(--grey);font-size:13px">🏠 Point de repère (départ/arrivée) — sert uniquement au calcul de l'itinéraire, non soumis à validation</div>`;
  } else if(!validated){
    bodyHtml += `<div style="text-align:center;padding:30px 10px;color:var(--grey);font-size:13px">⏳ Pas encore réalisé par le distributeur</div>`;
  } else {
    const slbl = isLivraisonOnly
      ? ({distribue:'Livré',absent:'Non livré',ferme:'Non livré',refus:'Non livré'}[s.statut]||s.statut)
      : statutLabel(s.statut);
    const heure = s.heure_validation ? new Date(s.heure_validation).toLocaleString('fr-FR',{dateStyle:'short',timeStyle:'short'}) : '';
    bodyHtml += `<div style="margin-bottom:12px"><span class="badge b-${s.statut}">${esc(slbl)}</span>${heure?` <span style="font-size:11px;color:var(--grey);margin-left:6px">${heure}</span>`:''}${(!isLivraisonOnly && s.statut==='distribue')?` <span style="font-size:12px;color:var(--grey);margin-left:6px">· ${s.quantite_flyers||0} flyers${flyReasonTagG(s.quantite_flyers?null:s.raison_zero_nougaterie)}${(s.quantite_flyers_chateau||s.raison_zero_chateau)?' · '+(s.quantite_flyers_chateau||0)+' château'+flyReasonTagG(s.quantite_flyers_chateau?null:s.raison_zero_chateau):''}</span>`:''}</div>`;
    if(cmd){
      bodyHtml += `<div style="font-size:13px;margin-bottom:12px;color:#8A5A00">📦 ${esc(cmd.description||'Livraison')}${cmd.statut==='livree'?' ✓':''}</div>`;
    }
    bodyHtml += s.commentaire_distributeur
      ? `<div style="font-size:13px;margin-bottom:14px">💬 ${esc(s.commentaire_distributeur)}</div>`
      : `<div style="font-size:12px;color:var(--grey);margin-bottom:14px">Aucun commentaire</div>`;
    bodyHtml += s.photo_preuve
      ? `<img src="${s.photo_preuve}" style="width:100%;border-radius:8px;display:block;margin-bottom:14px" alt="Photo">`
      : `<div style="font-size:12px;color:var(--grey);margin-bottom:14px">Aucune photo</div>`;
    bodyHtml += `<button class="btn btn-secondary btn-sm" onclick="editStopDetailForm(${s.id})">✏️ Modifier</button>`;
  }
  document.getElementById('stop-detail-body').innerHTML = bodyHtml;
}

const PAQUET_QTY_OPTIONS_SD = [
  {v:0,   l:'Aucun'},
  {v:0.5, l:'½ paquet'},
  {v:1,   l:'1 paquet'},
  {v:2,   l:'2 paquets'},
  {v:3,   l:'3 paquets'},
  {v:4,   l:'4 paquets'}
];
function paquetOptionsHtmlSD(selected){
  return PAQUET_QTY_OPTIONS_SD.map(function(o){
    var sel = (o.v===4) ? (selected>=4) : (selected===o.v);
    return `<option value="${o.v}" ${sel?'selected':''}>${o.l}</option>`;
  }).join('');
}
const NOUGAT_QTY_OPTIONS_SD = [0,1,2,3,4];
function nougatOptionsHtmlSD(selected){
  return NOUGAT_QTY_OPTIONS_SD.map(function(v){
    var sel = (v===4) ? (selected>=4) : (selected===v);
    var lbl = v===0 ? 'Aucun' : (v+' paquet'+(v>1?'s':''));
    return `<option value="${v}" ${sel?'selected':''}>${lbl}</option>`;
  }).join('');
}
const ENTREE_QTY_OPTIONS_SD = [0,1,2,3,4,5,6];
function entreeOptionsHtmlSD(selected){
  return ENTREE_QTY_OPTIONS_SD.map(function(v){
    var sel = (v===6) ? (selected>=6) : (selected===v);
    var lbl = v===0 ? 'Aucune' : (v+(v===6?'+':'')+' entrée'+(v>1?'s':''));
    return `<option value="${v}" ${sel?'selected':''}>${lbl}</option>`;
  }).join('');
}

let SD = null;

async function editStopDetailForm(pointId){
  const s = ST.currentTourneeStops.find(x=>x.id===pointId);
  if(!s) return;
  const l0 = s.lieu||{};
  document.getElementById('stop-detail-title').textContent = l0.nom||'Arrêt';
  SD = {
    pointId: pointId,
    statut: s.statut!=='a_faire' ? s.statut : null,
    flyers: s.quantite_flyers||0,
    flyersChateau: s.quantite_flyers_chateau||0,
    raisonZeroNougaterie: s.raison_zero_nougaterie||null,
    raisonZeroChateau: s.raison_zero_chateau||null,
    entreeGratuite: s.entree_gratuite||0,
    nougat: s.nb_nougat_offert||0,
    commentaire: s.commentaire_distributeur||'',
    dateOuverture: '', dateFermeture: '',
    rappel: false, rappelComment: '',
    photoB64: null, photoFile: null
  };
  renderStopDetailEditForm();
  if(s.lieu_id){
    try {
      const annee = new Date().getFullYear();
      const rows = await sbGet(`saisons_lieux?select=date_ouverture,date_fermeture&lieu_id=eq.${s.lieu_id}&annee=eq.${annee}&limit=1`);
      if(rows && rows[0] && SD && SD.pointId===pointId){
        SD.dateOuverture = rows[0].date_ouverture||'';
        SD.dateFermeture = rows[0].date_fermeture||'';
        const oi=document.getElementById('sd-date-ouverture'), fi=document.getElementById('sd-date-fermeture');
        if(oi) oi.value = SD.dateOuverture;
        if(fi) fi.value = SD.dateFermeture;
      }
    } catch(e){}
  }
}

function renderStopDetailEditForm(){
  if(!SD) return;
  const s = ST.currentTourneeStops.find(x=>x.id===SD.pointId);
  if(!s) return;
  const isLivraisonOnly = s.type_arret==='livraison';
  const f = SD;
  const opts = isLivraisonOnly
    ? [['distribue','✅','Livré'],['absent','❌','Non livré']]
    : [['distribue','✅','Fait'],['ferme','🔒','Fermé'],['refus','🚫','Refus'],['absent','👻','Absent']];
  let html = `
    <div style="margin-bottom:14px">
      <label style="font-size:11px;font-weight:700;color:var(--grey);text-transform:uppercase;display:block;margin-bottom:6px">Statut *</label>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
        ${opts.map(function(o){ return `<button type="button" onclick="sdSetStatut('${o[0]}')" style="padding:14px 8px;border-radius:10px;border:2px solid ${f.statut===o[0]?'var(--gold-dk)':'#e5e5e5'};background:${f.statut===o[0]?'#FFF8E1':'#fff'};text-align:center;cursor:pointer">
          <div style="font-size:20px">${o[1]}</div><div style="font-size:12px;font-weight:600;margin-top:4px">${o[2]}</div>
        </button>`; }).join('')}
      </div>
    </div>
    <div style="margin-bottom:14px">
      <label style="font-size:11px;font-weight:700;color:var(--grey);text-transform:uppercase;display:block;margin-bottom:6px">Photo (optionnel)</label>
      <div style="border:2px dashed #ddd;border-radius:10px;padding:16px;text-align:center;cursor:pointer" onclick="document.getElementById('sd-photo-input').click()">
        <div style="font-size:22px">📷</div>
        <div style="font-size:12px;color:var(--grey);margin-top:4px">Cliquer pour ajouter une photo</div>
        <input type="file" id="sd-photo-input" accept="image/*" style="display:none" onchange="sdHandlePhoto(this)">
        ${f.photoB64?`<img src="${f.photoB64}" style="width:100%;border-radius:8px;margin-top:10px" alt="Photo">`
          : (s.photo_preuve?`<img src="${s.photo_preuve}" style="width:100%;border-radius:8px;margin-top:10px" alt="Photo existante">`:'')}
      </div>
    </div>`;
  if(!isLivraisonOnly){
    html += `
    <div style="margin-bottom:14px;display:${f.statut==='distribue'?'block':'none'}">
      <label style="font-size:11px;font-weight:700;color:var(--grey);text-transform:uppercase;display:block;margin-bottom:6px">🍬 Paquets Nougaterie</label>
      <select id="sd-flyers" style="width:100%;padding:7px;border-radius:6px;border:1px solid #ddd;font-size:13px" onchange="SD.flyers=parseFloat(this.value)||0;renderStopDetailEditForm()">
        ${paquetOptionsHtmlSD(f.flyers)}
      </select>
      ${f.flyers===0?raisonZeroButtonsHtmlG(f.raisonZeroNougaterie,'sdSetRaisonZeroNougaterie'):''}
      <label style="font-size:11px;font-weight:700;color:var(--grey);text-transform:uppercase;display:block;margin:10px 0 6px">🎟️ Paquets Château des Roure</label>
      <select id="sd-flyers-chateau" style="width:100%;padding:7px;border-radius:6px;border:1px solid #ddd;font-size:13px" onchange="SD.flyersChateau=parseFloat(this.value)||0;renderStopDetailEditForm()">
        ${paquetOptionsHtmlSD(f.flyersChateau)}
      </select>
      ${f.flyersChateau===0?raisonZeroButtonsHtmlG(f.raisonZeroChateau,'sdSetRaisonZeroChateau'):''}
    </div>
    <div style="margin-bottom:14px">
      <label style="font-size:11px;font-weight:700;color:var(--grey);text-transform:uppercase;display:block;margin-bottom:6px">📅 Infos saison (optionnel)</label>
      <div style="display:flex;gap:8px">
        <div style="flex:1">
          <label style="font-size:11px;color:var(--grey)">Ouvert jusqu'au</label>
          <input type="date" id="sd-date-fermeture" value="${f.dateFermeture||''}" style="width:100%;padding:6px;border-radius:6px;border:1px solid #ddd;font-size:13px" onchange="SD.dateFermeture=this.value">
        </div>
        <div style="flex:1">
          <label style="font-size:11px;color:var(--grey)">Réouvre le</label>
          <input type="date" id="sd-date-ouverture" value="${f.dateOuverture||''}" style="width:100%;padding:6px;border-radius:6px;border:1px solid #ddd;font-size:13px" onchange="SD.dateOuverture=this.value">
        </div>
      </div>
    </div>
    <div style="margin-bottom:14px">
      <label style="display:flex;align-items:center;gap:6px;font-size:13px;cursor:pointer">
        <input type="checkbox" ${f.rappel?'checked':''} onchange="SD.rappel=this.checked;renderStopDetailEditForm()">
        🔁 Prévoir un nouveau passage
      </label>
      ${f.rappel?`<textarea rows="2" placeholder="Pourquoi revenir ? (optionnel)" style="width:100%;margin-top:6px;padding:6px;border-radius:6px;border:1px solid #ddd;font-size:13px;font-family:inherit" oninput="SD.rappelComment=this.value">${esc(f.rappelComment||'')}</textarea>`:''}
    </div>
    <div style="margin-bottom:10px">
      <label style="font-size:11px;font-weight:700;color:var(--grey);text-transform:uppercase;display:block;margin-bottom:6px">🍬 Paquets dégustation nougat offerts</label>
      <select id="sd-nougat" style="width:100%;padding:7px;border-radius:6px;border:1px solid #ddd;font-size:13px" onchange="SD.nougat=parseFloat(this.value)||0">
        ${nougatOptionsHtmlSD(f.nougat)}
      </select>
      <label style="font-size:11px;font-weight:700;color:var(--grey);text-transform:uppercase;display:block;margin:10px 0 6px">🎟️ Entrées gratuites Château offertes</label>
      <select id="sd-entree" style="width:100%;padding:7px;border-radius:6px;border:1px solid #ddd;font-size:13px" onchange="SD.entreeGratuite=parseFloat(this.value)||0">
        ${entreeOptionsHtmlSD(f.entreeGratuite)}
      </select>
    </div>`;
  }
  html += `
    <div style="margin-bottom:14px">
      <label style="font-size:11px;font-weight:700;color:var(--grey);text-transform:uppercase;display:block;margin-bottom:6px">Commentaire (optionnel)</label>
      <textarea id="sd-comment" rows="3" style="width:100%;padding:7px;border-radius:6px;border:1px solid #ddd;font-size:13px;font-family:inherit" oninput="SD.commentaire=this.value">${esc(f.commentaire||'')}</textarea>
    </div>
    <div style="display:flex;gap:8px">
      <button class="btn btn-secondary btn-sm" style="flex:1" onclick="renderStopDetailView(${SD.pointId})">Annuler</button>
      <button class="btn btn-primary btn-sm" style="flex:1" id="sd-save-btn" onclick="saveStopDetailForm()" ${(!f.statut || (f.statut==='distribue' && ((f.flyers===0 && !f.raisonZeroNougaterie) || (f.flyersChateau===0 && !f.raisonZeroChateau)))) ? 'disabled' : ''}>💾 Enregistrer</button>
    </div>`;
  document.getElementById('stop-detail-body').innerHTML = html;
}

function sdSetStatut(v){ if(SD){ SD.statut=v; renderStopDetailEditForm(); } }
function sdSetRaisonZeroNougaterie(v){ if(SD){ SD.raisonZeroNougaterie=v; renderStopDetailEditForm(); } }
function sdSetRaisonZeroChateau(v){ if(SD){ SD.raisonZeroChateau=v; renderStopDetailEditForm(); } }

function sdHandlePhoto(input){
  const file = input.files[0]; if(!file || !SD) return;
  SD.photoFile = file;
  const r = new FileReader();
  r.onload = function(e){ SD.photoB64 = e.target.result; renderStopDetailEditForm(); };
  r.readAsDataURL(file);
}

async function saveStopDetailForm(){
  if(!SD || !SD.statut){ showToast('⚠ Choisissez un statut'); return; }
  if(SD.statut==='distribue' && ((SD.flyers===0 && !SD.raisonZeroNougaterie) || (SD.flyersChateau===0 && !SD.raisonZeroChateau))){ showToast('⚠ Précisez la raison (stock suffisant / refusé)'); return; }
  const pointId = SD.pointId;
  const s = ST.currentTourneeStops.find(x=>x.id===pointId);
  if(!s) return;
  const isLivraisonOnly = s.type_arret==='livraison';
  const btn = document.getElementById('sd-save-btn');
  if(btn){ btn.disabled=true; btn.textContent='Enregistrement…'; }

  let photoUrl = s.photo_preuve || null;
  if(SD.photoFile){
    try {
      const ext = SD.photoFile.name.split('.').pop()||'jpg';
      const path = `tournee_${ST.currentTourneeId}/p${pointId}_${Date.now()}.${ext}`;
      photoUrl = await uploadPhotoGestion(SD.photoFile, path);
    } catch(e){ showToast('⚠ Photo non envoyée : '+e.message); }
  }

  const patch = { statut: SD.statut, commentaire_distributeur: SD.commentaire||null, photo_preuve: photoUrl };
  if(!isLivraisonOnly){
    patch.quantite_flyers = SD.statut==='distribue' ? (SD.flyers||0) : 0;
    patch.quantite_flyers_chateau = SD.statut==='distribue' ? (SD.flyersChateau||0) : 0;
    patch.raison_zero_nougaterie = (SD.statut==='distribue' && (SD.flyers||0)===0) ? (SD.raisonZeroNougaterie||null) : null;
    patch.raison_zero_chateau = (SD.statut==='distribue' && (SD.flyersChateau||0)===0) ? (SD.raisonZeroChateau||null) : null;
    patch.nb_nougat_offert = SD.nougat||0;
    patch.entree_gratuite = SD.entreeGratuite||0;
  }

  try {
    await sbPatch('points_tournee','id=eq.'+pointId, patch);
    Object.assign(s, patch);
  } catch(e){
    showToast('❌ '+e.message);
    if(btn){ btn.disabled=false; btn.textContent='💾 Enregistrer'; }
    return;
  }

  if(!isLivraisonOnly && s.lieu_id && (SD.dateOuverture || SD.dateFermeture)){
    try { await saveSaisonLieuGestion(s.lieu_id, SD.dateOuverture||null, SD.dateFermeture||null); } catch(e){}
  }
  if(!isLivraisonOnly && s.lieu_id){
    try { await applyRappelUpdateGestion(s.lieu_id, SD.rappel, SD.rappelComment||null); } catch(e){}
  }

  renderDetailStops();
  renderStopDetailView(pointId);
  showToast('✅ Arrêt mis à jour');
}

async function uploadPhotoGestion(file, path){
  const doUp = function(tok){
    return fetch(`${SUPABASE_URL}/storage/v1/object/photos-distribution/${path}`, {
      method:'POST',
      headers:{'apikey':SUPABASE_KEY,'Authorization':'Bearer '+tok,'Content-Type':file.type||'image/jpeg','x-upsert':'true'},
      body:file
    });
  };
  let r = await doUp(getToken());
  if(r.status===401){
    const ok = await refreshSession();
    if(ok) r = await doUp(getToken());
  }
  if(!r.ok){ const e = await r.json().catch(function(){return {};}); throw new Error(e.message||'HTTP '+r.status); }
  return `${SUPABASE_URL}/storage/v1/object/public/photos-distribution/${path}`;
}

async function saveSaisonLieuGestion(lieuId, dateOuverture, dateFermeture){
  const annee = new Date().getFullYear();
  const payload = { lieu_id: lieuId, annee: annee, date_ouverture: dateOuverture||null, date_fermeture: dateFermeture||null, source:'admin', maj_par: ST.user?.id||null, maj_le: new Date().toISOString() };
  const existing = await sbGet(`saisons_lieux?select=id&lieu_id=eq.${lieuId}&annee=eq.${annee}&limit=1`);
  if(existing && existing[0]) await sbPatch('saisons_lieux','id=eq.'+existing[0].id, payload);
  else await sbPost('saisons_lieux', payload);
  await loadSaisonsActuelles();
  updateMapMarkers();
}

async function applyRappelUpdateGestion(lieuId, wantOpen, commentaire){
  const existing = await sbGet(`rappels_lieux?select=id&lieu_id=eq.${lieuId}&statut=eq.a_faire&limit=1`);
  if(existing && existing[0]){
    await sbPatch('rappels_lieux','id=eq.'+existing[0].id, {statut:'traite', traite_le:new Date().toISOString(), traite_par: ST.user?.id||null});
  }
  if(wantOpen){
    await sbPost('rappels_lieux', {lieu_id:lieuId, commentaire: commentaire||null, origine:'bureau', statut:'a_faire', cree_par: ST.user?.id||null});
  }
  await loadRappelsActuels();
  updateMapMarkers();
}

function renderDetailStops(){
  const stops=ST.currentTourneeStops;
  const realStops=stops.filter(s=>!isRepere(s));
  const done=realStops.filter(s=>s.statut!=='a_faire').length;
  document.getElementById('detail-stops-title').textContent=stops.length+' arrêts';
  document.getElementById('detail-prog-text').textContent=done+'/'+realStops.length+' validés';
  document.getElementById('detail-stops-list').innerHTML=stops.length===0
    ?'<div style="padding:20px;text-align:center;color:var(--grey);font-size:13px">Aucun arrêt</div>'
    :stops.map((s,idx)=>{
      const isLivraisonOnly = s.type_arret==='livraison';
      const repere = isRepere(s);
      const cmd = s.commandes_livraison&&s.commandes_livraison[0];
      const hasCommande = !!cmd;
      const desc = (cmd&&cmd.description)||'';
      const livDone = cmd && cmd.statut==='livree';
      const livLbl = {a_faire:'À livrer',distribue:'Livré',absent:'Non livré',ferme:'Non livré',refus:'Non livré'}[s.statut]||s.statut;
      const canEdit = s.statut==='a_faire';
      return `
      <div class="stop-list-item" draggable="true" ondragstart="stopDragStart(event,${idx})" ondragover="stopDragOver(event,${idx})" ondrop="stopDrop(event,${idx})" ondragend="stopDragEnd(event)"${(isLivraisonOnly||hasCommande)?' style="background:#FBF3E7"':''}>
        <div class="stop-ord"${isLivraisonOnly?' style="background:#C87F0A;color:#fff"':''}>${isLivraisonOnly?'📦':s.ordre_passage}</div>
        <div class="stop-info" style="cursor:pointer" onclick="openStopDetail(${s.id})" title="Voir ce qui a été réalisé"><div class="stop-nom">${esc(s.lieu?.nom||'?')}</div>
          ${isLivraisonOnly
            ? `<div class="stop-addr" style="color:#C87F0A;font-weight:600">📦 ${esc(desc||'Livraison')}</div>`
            : `<div class="stop-addr">${esc(s.lieu?.ville||s.lieu?.adresse||'')}</div>${hasCommande?`<div class="stop-addr" style="color:#C87F0A;font-weight:600">📦 ${esc(desc||'Livraison')}${livDone?' ✓':''}</div>`:''}`}
          ${s.commentaire_distributeur?`<div class="stop-addr" style="font-style:italic">💬 ${esc(s.commentaire_distributeur)}</div>`:''}
        </div>
        ${(isLivraisonOnly||repere)?'':`<span style="font-size:11px;margin-right:4px;color:var(--grey)">${s.quantite_flyers} flyers</span>`}
        ${(!isLivraisonOnly && !repere && s.statut==='distribue' && s.nb_nougat_offert>0)?`<span style="font-size:11px;margin-right:4px;color:var(--grey)">🍬×${s.nb_nougat_offert}</span>`:''}
        ${(!isLivraisonOnly && !repere && s.statut==='distribue' && s.entree_gratuite>0)?`<span style="font-size:11px;margin-right:4px;color:var(--grey)">🎟️×${s.entree_gratuite}</span>`:''}

        ${s.photo_preuve?`<span style="font-size:12px;margin-right:2px" title="Photo disponible">📷</span>`:''}
        ${repere
          ? `<span class="badge" style="background:#ECEFF1;color:#607D8B">🏠 Repère</span>`
          : `<span class="badge b-${s.statut}">${isLivraisonOnly?livLbl:statutLabel(s.statut)}</span>`}
        ${s.heure_validation?`<span style="font-size:10px;color:var(--grey)">${new Date(s.heure_validation).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})}</span>`:''}
        <span class="stop-drag-handle" title="Glisser pour réordonner">⋮⋮</span>
        ${(!isLivraisonOnly && !repere && canEdit)?`<span style="cursor:pointer;font-size:13px;margin-left:2px" onclick="editStopQty(${s.id})" title="Modifier la quantité de flyers">✏️</span>`:''}
        ${!isLivraisonOnly?`<span style="cursor:pointer;font-size:13px;margin-left:2px;opacity:${hasCommande?1:0.35}" onclick="toggleStopLivraison(${s.id})" title="${hasCommande?'Retirer la livraison':'Ajouter une livraison sur cet arrêt'}">📦</span>`:''}
        ${canEdit?`<span style="cursor:pointer;font-size:14px;color:#E53935;margin-left:2px" onclick="removeDetailStop(${s.id})" title="Retirer cet arrêt">✕</span>`:''}
      </div>`;
    }).join('');
}

let stopDragSrcIdx = null;

function stopDragStart(e, idx){
  stopDragSrcIdx = idx;
  e.dataTransfer.effectAllowed = 'move';
  try { e.dataTransfer.setData('text/plain', String(idx)); } catch(err){}
  e.currentTarget.classList.add('dragging');
}
function stopDragOver(e, idx){
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  document.querySelectorAll('#detail-stops-list .stop-list-item').forEach(function(el){ el.classList.remove('drag-over'); });
  if(idx !== stopDragSrcIdx) e.currentTarget.classList.add('drag-over');
}
async function stopDrop(e, idx){
  e.preventDefault();
  document.querySelectorAll('#detail-stops-list .stop-list-item').forEach(function(el){ el.classList.remove('drag-over'); });
  if(stopDragSrcIdx === null || idx === stopDragSrcIdx) return;
  const stops = ST.currentTourneeStops;
  const moved = stops.splice(stopDragSrcIdx, 1)[0];
  stops.splice(idx, 0, moved);
  stopDragSrcIdx = null;
  await persistGestionStopOrder(stops);
}
function stopDragEnd(e){
  stopDragSrcIdx = null;
  document.querySelectorAll('#detail-stops-list .stop-list-item').forEach(function(el){ el.classList.remove('dragging'); el.classList.remove('drag-over'); });
}
async function persistGestionStopOrder(stops){
  const updates = [];
  stops.forEach(function(s,i){ const newOrder=i+1; if(s.ordre_passage!==newOrder) updates.push({s:s,newOrder:newOrder}); });
  if(updates.length===0) return;
  try {
    for(const u of updates){ await sbPatch('points_tournee','id=eq.'+u.s.id,{ordre_passage:u.newOrder}); }
  } catch(e){ showToast('❌ '+e.message); }
  await openTourneeDetail(ST.currentTourneeId);
}
async function editStopQty(pointId){
  const s = ST.currentTourneeStops.find(x=>x.id===pointId); if(!s) return;
  const val = prompt('Quantité de flyers prévue pour ce lieu :', s.quantite_flyers);
  if(val===null) return;
  const qty = parseFloat(val);
  if(isNaN(qty) || qty<0){ showToast('⚠ Valeur invalide'); return; }
  try {
    await sbPatch('points_tournee','id=eq.'+pointId,{quantite_flyers:qty});
    await openTourneeDetail(ST.currentTourneeId);
  } catch(e){ showToast('❌ '+e.message); }
}
async function removeDetailStop(pointId){
  if(!confirm('Retirer cet arrêt de la tournée ?')) return;
  try {
    await sbDelete('points_tournee','id=eq.'+pointId);
    showToast('✕ Arrêt retiré');
    await openTourneeDetail(ST.currentTourneeId);
  } catch(e){ showToast('❌ '+e.message); }
}
async function toggleStopLivraison(pointId){
  const s = ST.currentTourneeStops.find(x=>x.id===pointId); if(!s) return;
  const cmd = s.commandes_livraison && s.commandes_livraison[0];
  try {
    if(cmd){
      if(!confirm('Retirer la livraison de cet arrêt ?')) return;
      await sbDelete('commandes_livraison','id=eq.'+cmd.id);
    } else {
      const desc = prompt('Que faut-il livrer à ce lieu ?','');
      if(desc===null) return;
      await sbPost('commandes_livraison',{
        lieu_id: s.lieu_id, tournee_id: ST.currentTourneeId, point_tournee_id: pointId,
        description: desc.trim(), statut:'a_livrer', cree_par: ST.user?.id||null
      });
    }
    await openTourneeDetail(ST.currentTourneeId);
  } catch(e){ showToast('❌ '+e.message); }
}
async function reassignTourneeDistributeur(newId){
  try {
    await sbPatch('tournees','id=eq.'+ST.currentTourneeId,{distributeur_id: newId||null});
    showToast('✅ Distributeur mis à jour');
    await loadTournees();
    await openTourneeDetail(ST.currentTourneeId);
  } catch(e){ showToast('❌ '+e.message); }
}

function closeTourneeDetail(){
  document.getElementById('tournees-list-view').style.display='block';
  document.getElementById('tournee-detail-view').style.display='none';
  ST.currentTourneeId=null;
}

async function updateTourneeStatut(statut){
  if(!ST.currentTourneeId) return;
  try {
    await sbPatch('tournees','id=eq.'+ST.currentTourneeId,{statut});
    showToast('✅ Statut mis à jour'); await loadTournees();
    document.getElementById('detail-badge').className='badge b-'+statut;
    document.getElementById('detail-badge').textContent=statutLabel(statut);
  } catch(e){ showToast('❌ '+e.message); }
}

async function askTerminerTourneeGestion(){
  const restants = (ST.currentTourneeStops||[]).filter(s => s.statut === 'a_faire' && !isRepere(s));
  if(!restants.length){ updateTourneeStatut('terminee'); return; }
  document.getElementById('terminer-tournee-intro').textContent = restants.length+' lieu'+(restants.length>1?'x':'')+' non visité'+(restants.length>1?'s':'')+'. Choisissez ceux à marquer "à faire plus tard" :';
  document.getElementById('terminer-tournee-list').innerHTML = restants.map(s => `
    <label style="display:flex;align-items:center;gap:8px;padding:6px 0;font-size:13px;border-bottom:1px solid var(--grey-lt)">
      <input type="checkbox" class="terminer-rappel-chk" data-lieu-id="${s.lieu_id}" checked>
      ${esc(s.lieu?.nom||'—')}
    </label>`).join('');
  openModal('modal-terminer-tournee');
}

async function ensureRappelOuvert(lieuId, commentaire, origine){
  const existing = await sbGet(`rappels_lieux?select=id&lieu_id=eq.${lieuId}&statut=eq.a_faire&limit=1`);
  if(existing && existing[0]){
    await sbPatch('rappels_lieux','id=eq.'+existing[0].id,{statut:'traite',traite_le:new Date().toISOString()});
  }
  const res = await sbPost('rappels_lieux',{lieu_id:lieuId, commentaire:commentaire||null, origine, statut:'a_faire'});
  ST.rappels[lieuId] = Array.isArray(res)?res[0]:res;
}

async function confirmerTerminerTourneeGestion(){
  closeModal('modal-terminer-tournee');
  const t = ST.tournees.find(x=>x.id===ST.currentTourneeId);
  const checks = Array.from(document.querySelectorAll('#terminer-tournee-list .terminer-rappel-chk'));
  await updateTourneeStatut('terminee');
  if(!ST.rappels) ST.rappels = {};
  for(const c of checks){
    if(!c.checked) continue;
    const lieuId = parseInt(c.getAttribute('data-lieu-id'),10);
    if(!lieuId) continue;
    const commentaire = `Non visité — tournée "${t?t.nom:''}" clôturée le ${new Date().toLocaleDateString('fr-FR')}`;
    try { await ensureRappelOuvert(lieuId, commentaire, 'bureau'); } catch(e){}
  }
  updateMapMarkers();
}

function openGmapTournee(){
  const stops=ST.currentTourneeStops.filter(s=>s.lieu?.latitude&&s.lieu?.longitude);
  if(!stops.length){showToast('⚠ Aucune coordonnée');return;}
  window.open('https://www.google.com/maps/dir/'+stops.map(s=>encodeURIComponent(s.lieu.latitude+','+s.lieu.longitude)).join('/'),'_blank');
}

function printTourneePDF(){
  const { jsPDF } = window.jspdf;
  if(!jsPDF){ alert('jsPDF non chargé'); return; }
  const t = ST.tournees.find(x=>x.id===ST.currentTourneeId);
  const stops = [...ST.currentTourneeStops].sort((a,b)=>(a.ordre_passage||0)-(b.ordre_passage||0));
  if(!stops.length){ showToast('⚠ Aucun arrêt dans cette tournée'); return; }
  const now = new Date().toLocaleDateString('fr-FR',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'});

  const doc = new jsPDF({ orientation:'landscape', unit:'mm', format:'a4' });
  const W = doc.internal.pageSize.getWidth();

  // ── HEADER ──
  doc.setFillColor(26,26,26);
  doc.rect(0,0,W,20,'F');
  doc.setFont('helvetica','bold');
  doc.setFontSize(13);
  doc.setTextColor(255,255,255);
  doc.text('La Nougaterie du Pont d\'Arc',10,8);
  doc.setFont('helvetica','normal');
  doc.setFontSize(8);
  doc.setTextColor(212,160,23);
  doc.text('FEUILLE DE ROUTE — '+(t?.nom||'').toUpperCase(),10,14);
  doc.setTextColor(200,200,200);
  doc.setFontSize(8);
  doc.text('Généré le '+now, W-10, 8, {align:'right'});
  doc.text('Imprimé depuis Gestion lieux', W-10, 13, {align:'right'});

  // ── META BAND ──
  doc.setFillColor(247,246,242);
  doc.rect(0,20,W,11,'F');
  doc.setTextColor(80,80,80);
  doc.setFontSize(8);
  const metaY1=25.5, metaY2=29.5;
  doc.setFont('helvetica','bold'); doc.text('Date :',10,metaY1);
  doc.setFont('helvetica','normal'); doc.text(fmtDate(t?.date),24,metaY1);
  doc.setFont('helvetica','bold'); doc.text('Distributeur :',70,metaY1);
  doc.setFont('helvetica','normal'); doc.text(t?.distributeur?.nom||'Non assigné',95,metaY1);
  doc.setFont('helvetica','bold'); doc.text('Arrêts :',150,metaY1);
  doc.setFont('helvetica','normal'); doc.text(String(stops.length),165,metaY1);
  doc.setFont('helvetica','bold'); doc.text('Secteur :',10,metaY2);
  doc.setFont('helvetica','normal'); doc.text(t?.secteur||'—',24,metaY2);
  if(t?.commentaire){
    doc.setFont('helvetica','bold'); doc.text('Commentaire :',70,metaY2);
    doc.setFont('helvetica','normal'); doc.text(String(t.commentaire).slice(0,80),95,metaY2);
  }

  // ── NOTE D'USAGE ──
  doc.setFillColor(255,247,224);
  doc.rect(0,31,W,7,'F');
  doc.setFont('helvetica','italic'); doc.setFontSize(7.5); doc.setTextColor(140,110,20);
  doc.text('À utiliser sur le terrain en cas de problème technique avec l\'application. Cochez le statut de chaque arrêt et notez les quantités à la main.', W/2, 35.5, {align:'center'});

  // ── TABLE-FORMULAIRE (à remplir à la main) ──
  const rows = stops.map(s=>{
    const l=s.lieu||{};
    const isLivraisonOnly = s.type_arret==='livraison';
    const cmd = s.commandes_livraison&&s.commandes_livraison[0];
    const hasCommande = !!cmd;
    const adresse=[l.adresse,l.ville].filter(Boolean).join(', ')||'—';
    const desc = (cmd&&cmd.description)||'';
    let lieuCell = l.nom||'—';
    if(isLivraisonOnly) lieuCell += '\n[LIVRAISON] '+(desc||'à préciser');
    else if(hasCommande) lieuCell += '\n[LIVRAISON] '+(desc||'à préciser')+'\n[  ] Livré   [  ] Non livré';
    const statutCell = isLivraisonOnly ? '[  ] Livré\n[  ] Non livré' : '[  ] Fait\n[  ] Fermé\n[  ] Refus\n[  ] Absent';
    return [String(s.ordre_passage||''), lieuCell, adresse, statutCell,
      isLivraisonOnly?'—':'', isLivraisonOnly?'—':'', isLivraisonOnly?'—':'[  ]', isLivraisonOnly?'—':'[  ]', ''];
  });

  doc.autoTable({
    startY: 42,
    head:[['N°','Lieu','Adresse / Ville','Statut (cocher)','Flyers\nNgt','Flyers\nChât.','Nougat\noffert','Entrée\ngrat.','Commentaire']],
    body: rows,
    styles:{ fontSize:8.5, cellPadding:3, font:'helvetica', minCellHeight:18, valign:'top' },
    headStyles:{ fillColor:[26,26,26], textColor:255, fontStyle:'bold', fontSize:7.5, valign:'middle' },
    columnStyles:{
      0:{cellWidth:9,halign:'center'},
      1:{cellWidth:40},
      2:{cellWidth:48},
      3:{cellWidth:32},
      4:{cellWidth:15,halign:'center'},
      5:{cellWidth:15,halign:'center'},
      6:{cellWidth:15,halign:'center'},
      7:{cellWidth:15,halign:'center'}
    },
    margin:{ left:10, right:10 },
    didParseCell: function(data){
      const st = stops[data.row.index];
      const stHasLivraison = st && (st.type_arret==='livraison' || (st.commandes_livraison && st.commandes_livraison.length>0));
      if(data.section==='body' && stHasLivraison){
        data.cell.styles.fillColor = [251,243,231];
        if(data.column.index===1){ data.cell.styles.textColor = [140,90,0]; data.cell.styles.fontStyle = 'bold'; }
      }
    }
  });

  doc.save('feuille_route_'+(t?.nom||'sans-nom').replace(/[^a-z0-9]+/gi,'_')+'_'+(t?.date||'').replace(/-/g,'')+'.pdf');
}

async function photoToDataURLGestion(url, size){
  try {
    const resp = await fetch(url);
    if(!resp.ok) throw new Error('fetch failed');
    const blob = await resp.blob();
    const bmp = await createImageBitmap(blob);
    const canvas = document.createElement('canvas');
    canvas.width = size; canvas.height = size;
    const ctx = canvas.getContext('2d');
    const side = Math.min(bmp.width, bmp.height);
    const sx = (bmp.width-side)/2, sy = (bmp.height-side)/2;
    ctx.drawImage(bmp, sx, sy, side, side, 0, 0, size, size);
    return canvas.toDataURL('image/jpeg', 0.7);
  } catch(e) { return null; }
}

function truncSynthese(s, n){ s = s||''; return s.length>n ? s.slice(0,n-1)+'…' : s; }

async function genererSyntheseTournee(){
  const { jsPDF } = window.jspdf;
  if(!jsPDF){ alert('jsPDF non chargé'); return; }
  const t = ST.tournees.find(x=>x.id===ST.currentTourneeId);
  const stops = [...ST.currentTourneeStops].filter(s=>!isRepere(s)).sort((a,b)=>(a.ordre_passage||0)-(b.ordre_passage||0));
  if(!stops.length){ showToast('⚠ Aucun arrêt dans cette tournée'); return; }

  showToast('⏳ Génération en cours…', 6000);
  if(!ST.rappels) await loadRappelsActuels();

  const photoMap = {};
  await Promise.all(stops.filter(s=>s.photo_preuve).map(async s=>{
    photoMap[s.id] = await photoToDataURLGestion(s.photo_preuve, 200);
  }));

  const now = new Date().toLocaleDateString('fr-FR',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'});
  const doc = new jsPDF({ orientation:'landscape', unit:'mm', format:'a4' });
  const W = doc.internal.pageSize.getWidth(), H = doc.internal.pageSize.getHeight();
  const M = 10;

  function drawHeader(){
    doc.setFillColor(26,26,26); doc.rect(0,0,W,20,'F');
    doc.setTextColor(255,255,255); doc.setFont('helvetica','bold'); doc.setFontSize(14);
    doc.text('Document de synthèse — '+(t?.nom||'Tournée'), M, 13);
    doc.setFont('helvetica','normal'); doc.setFontSize(9);
    doc.text('Généré le '+now, W-M, 13, {align:'right'});
    doc.setFontSize(8.5);
    const distNom = t?.distributeur?.nom || 'Non assigné';
    doc.text('Date : '+fmtDate(t?.date)+'   ·   Distributeur : '+distNom+'   ·   '+stops.length+' arrêts', M, 18);
  }

  drawHeader();
  let y = 26;
  const gap = 4, cardW = (W - M*2 - gap)/2, cardH = 40, photoSize = 26;
  let col = 0;

  stops.forEach((s) => {
    if(col===0 && y + cardH > H - 10){ doc.addPage(); drawHeader(); y = 26; }
    const x = M + col*(cardW+gap);

    doc.setDrawColor(220,220,220);
    doc.roundedRect(x, y, cardW, cardH, 2, 2);

    const img = photoMap[s.id];
    if(img){
      try { doc.addImage(img, 'JPEG', x+3, y+3, photoSize, photoSize); } catch(e){}
    } else {
      doc.setFillColor(245,245,245); doc.rect(x+3, y+3, photoSize, photoSize, 'F');
      doc.setFontSize(6.5); doc.setTextColor(180,180,180); doc.setFont('helvetica','normal');
      doc.text('Pas de photo', x+3+photoSize/2, y+3+photoSize/2, {align:'center'});
    }

    const isLivraisonOnly = s.type_arret === 'livraison';
    const cmd = s.commandes_livraison && s.commandes_livraison[0];
    const tx = x + 3 + photoSize + 4;
    const tw = cardW - photoSize - 10;

    doc.setTextColor(0,0,0); doc.setFont('helvetica','bold'); doc.setFontSize(9.5);
    doc.text((s.ordre_passage||'')+'. '+truncSynthese(s.lieu?.nom, 30), tx, y+7, {maxWidth: tw});

    doc.setFont('helvetica','normal'); doc.setFontSize(8); doc.setTextColor(120,120,120);
    doc.text(truncSynthese(s.lieu?.ville||'', 36), tx, y+11.5);

    const statutColors = {distribue:[39,174,96], ferme:[120,120,120], refus:[229,57,53], absent:[232,135,10], a_faire:[160,160,160]};
    const statutTexts = isLivraisonOnly
      ? {a_faire:'À livrer', distribue:'Livré', absent:'Non livré', ferme:'Non livré', refus:'Non livré'}
      : {a_faire:'Non visité', distribue:'Fait', ferme:'Fermé', refus:'Refus', absent:'Absent'};
    const col1 = statutColors[s.statut] || [100,100,100];
    doc.setFont('helvetica','bold'); doc.setFontSize(8.5); doc.setTextColor(col1[0],col1[1],col1[2]);
    let statutLine = statutTexts[s.statut] || s.statut;
    if(s.heure_validation){
      statutLine += '  ·  ' + new Date(s.heure_validation).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'});
    }
    doc.text(statutLine, tx, y+16.5, {maxWidth: tw});

    doc.setFont('helvetica','normal'); doc.setFontSize(8); doc.setTextColor(60,60,60);
    if(isLivraisonOnly){
      doc.text('Livraison : '+truncSynthese(cmd?.description||'', 40), tx, y+21, {maxWidth: tw});
    } else if(s.statut==='distribue'){
      const flyTagSyn = r => r==='stock_suffisant' ? '(S)' : r==='refuse' ? '(R)' : '';
      let qtyLine = 'Flyers : '+(s.quantite_flyers||0)+((s.quantite_flyers||0)===0?flyTagSyn(s.raison_zero_nougaterie):'')+' Ngt · '+(s.quantite_flyers_chateau||0)+((s.quantite_flyers_chateau||0)===0?flyTagSyn(s.raison_zero_chateau):'')+' Chât.';
      if(s.nb_nougat_offert>0) qtyLine += '  ·  Nougat dégust. x'+s.nb_nougat_offert;
      if(s.entree_gratuite>0) qtyLine += '  ·  Entrées offertes x'+s.entree_gratuite;
      doc.text(qtyLine, tx, y+21, {maxWidth: tw});
    } else {
      const rappelActif = ST.rappels && ST.rappels[s.lieu_id];
      if(rappelActif){
        doc.setTextColor(232,135,10); doc.setFont('helvetica','bold');
        doc.text('Repassage prévu', tx, y+21);
      } else {
        doc.setTextColor(160,160,160);
        doc.text('Pas de repassage prévu', tx, y+21);
      }
    }

    if(s.commentaire_distributeur){
      doc.setFont('helvetica','italic'); doc.setFontSize(7.5); doc.setTextColor(90,90,90);
      const lines = doc.splitTextToSize(truncSynthese(s.commentaire_distributeur, 90), tw);
      doc.text(lines.slice(0,2), tx, y+25.5);
    }

    col = (col+1) % 2;
    if(col===0) y += cardH + gap;
  });

  doc.save('synthese_'+(t?.nom||'sans-nom').replace(/[^a-z0-9]+/gi,'_')+'_'+(t?.date||'').replace(/-/g,'')+'.pdf');
  showToast('✅ Document généré');
}

function openAddStopModal(){ ST.addStopsSelected=new Set(); renderAddStops(); openModal('modal-add-stops'); }
function renderAddStops(){
  const q=(document.getElementById('add-stops-search')||{}).value||'';
  const existingIds=new Set(ST.currentTourneeStops.map(s=>s.lieu_id));
  const filtered=ST.lieux.filter(l=>!existingIds.has(l.id)&&(!q||norm(l.nom).includes(norm(q))));
  document.getElementById('add-stops-picker').innerHTML=filtered.map(l=>`
    <div class="lieu-pick-item ${ST.addStopsSelected.has(l.id)?'selected':''}" onclick="toggleAddStop(${l.id})">
      <div class="lpi-check">${ST.addStopsSelected.has(l.id)?'✓':''}</div>
      <div style="flex:1;min-width:0"><div class="lpi-name">${esc(l.nom)}</div><div class="lpi-cat">${esc(l.categorie||'')}${l.ville?' · '+esc(l.ville):''}</div></div>
    </div>`).join('');
  document.getElementById('add-stops-count').textContent=ST.addStopsSelected.size+' sélectionné(s)';
}
function filterAddStops(){ renderAddStops(); }
function toggleAddStop(id){ if(ST.addStopsSelected.has(id))ST.addStopsSelected.delete(id);else ST.addStopsSelected.add(id); renderAddStops(); }

async function saveAddStops(){
  if(!ST.addStopsSelected.size){showToast('⚠ Aucun lieu sélectionné');return;}
  const maxOrdre=ST.currentTourneeStops.reduce((m,s)=>Math.max(m,s.ordre_passage),0);
  const qty=parseInt(document.getElementById('add-stops-qty').value)||10;
  const points=[...ST.addStopsSelected].map((lieuId,i)=>({tournee_id:ST.currentTourneeId,lieu_id:lieuId,ordre_passage:maxOrdre+i+1,quantite_flyers:qty,statut:'a_faire'}));
  try {
    await sbPost('points_tournee',points);
    showToast('✅ '+points.length+' lieu(x) ajouté(s)');
    closeModal('modal-add-stops'); await openTourneeDetail(ST.currentTourneeId);
  } catch(e){ showToast('❌ '+e.message); }
}

// ══════════════════════════════════════════════════════════
//  CARTE
// ══════════════════════════════════════════════════════════
async function loadLastVisits(){
  // Charge la dernière visite (statut, date) pour chaque lieu
  try {
    const rows = await sbGet(
      'points_tournee?select=lieu_id,statut,heure_validation' +
      '&statut=neq.a_faire&heure_validation=not.is.null' +
      '&order=lieu_id.asc,heure_validation.desc'
    );
    const map = {};
    rows.forEach(r => {
      if (!map[r.lieu_id]) map[r.lieu_id] = { statut: r.statut, date: r.heure_validation };
    });
    ST.lastVisits = map;
  } catch(e) { ST.lastVisits = {}; }
}

function markerColor(lieuId, seuilMs) {
  const v = ST.lastVisits[lieuId];
  if (!v) return '#9E9E9E'; // jamais visité
  const age = Date.now() - new Date(v.date).getTime();
  if (v.statut === 'distribue' && age <= seuilMs) return '#27AE60'; // vert récent
  if (age > seuilMs) return '#E8A020'; // orange ancien
  return '#E53935'; // rouge : refus/fermé/absent récent
}

async function loadSaisonsActuelles(){
  try {
    const rows = await sbGet('saisons_lieux?select=lieu_id,annee,date_ouverture,date_fermeture&order=lieu_id.asc,annee.desc');
    const map = {};
    rows.forEach(r => { if (!map[r.lieu_id]) map[r.lieu_id] = r; });
    ST.saisons = map;
  } catch(e) { ST.saisons = {}; }
}

function saisonStatut(lieuId){
  const s = ST.saisons[lieuId];
  if (!s || (!s.date_ouverture && !s.date_fermeture)) return null;
  const today = new Date().toISOString().slice(0,10);
  if (s.date_fermeture && today > s.date_fermeture && (!s.date_ouverture || today < s.date_ouverture)) return 'ferme';
  if (s.date_fermeture) {
    const joursAvant = (new Date(s.date_fermeture) - new Date(today)) / 86400000;
    if (joursAvant >= 0 && joursAvant <= 30) return 'ferme_bientot';
  }
  return 'ouvert';
}
async function loadRappelsActuels(){
  try {
    const rows = await sbGet('rappels_lieux?select=id,lieu_id,commentaire,origine,type,cree_le&statut=eq.a_faire&order=lieu_id.asc,cree_le.desc');
    const map = {};
    rows.forEach(r => { if (!map[r.lieu_id]) map[r.lieu_id] = r; });
    ST.rappels = map;
  } catch(e) { ST.rappels = {}; }
}
async function loadLivraisonsActuelles(){
  try {
    const rows = await sbGet('commandes_livraison?select=id,lieu_id,description,cree_le&statut=eq.a_livrer&point_tournee_id=is.null&order=lieu_id.asc,cree_le.desc');
    const map = {};
    rows.forEach(r => { if (!map[r.lieu_id]) map[r.lieu_id] = r; });
    ST.livraisons = map;
  } catch(e) { ST.livraisons = {}; }
}
async function signalerLivraisonLieu(id){
  const description = prompt('Que faut-il livrer/déposer à ce lieu ?', '');
  if(description===null || !description.trim()) return;
  try{
    const res = await sbPost('commandes_livraison',{lieu_id:id, description:description.trim(), statut:'a_livrer', cree_par: ST.user?.id||null});
    ST.livraisons[id] = Array.isArray(res)?res[0]:res;
    showToast('📦 Livraison signalée');
  } catch(e){ showToast('❌ '+e.message); return; }
  updateMapMarkers();
  openFicheLieu(id);
}
async function annulerLivraisonLieu(id){
  const actif = ST.livraisons[id]; if(!actif) return;
  if(!confirm('Retirer cette livraison signalée (erreur de saisie ou déjà faite) ?')) return;
  try{
    await sbPatch('commandes_livraison','id=eq.'+actif.id,{statut:'livree', livree_le:new Date().toISOString(), livree_par: ST.user?.id||null});
    delete ST.livraisons[id];
    showToast('✓ Livraison marquée faite');
  } catch(e){ showToast('❌ '+e.message); return; }
  updateMapMarkers();
  openFicheLieu(id);
}
async function toggleRappelLieuFiche(id){
  const actif = ST.rappels[id];
  if(actif){
    if(!confirm('Marquer ce lieu comme traité (retirer le rappel "à faire") ?')) return;
    try{
      await sbPatch('rappels_lieux','id=eq.'+actif.id,{statut:'traite',traite_le:new Date().toISOString()});
      delete ST.rappels[id];
      showToast('✓ Rappel traité');
    } catch(e){ showToast('❌ '+e.message); return; }
    updateMapMarkers();
    openFicheLieu(id);
  } else {
    openRappelTypeModal(id);
  }
}
var RT = { lieuId: null };
function openRappelTypeModal(id){
  RT.lieuId = id;
  document.getElementById('rt-comment').value = '';
  document.querySelector('input[name="rt-type"][value="repassage"]').checked = true;
  updateRappelTypeLabels();
  openModal('modal-rappel-type');
}
function updateRappelTypeLabels(){
  document.querySelectorAll('#modal-rappel-type label[id^="rt-lbl-"]').forEach(function(lbl){
    var radio = lbl.querySelector('input');
    var on = radio.checked;
    var col = radio.value==='rdv_commercial' ? '#7B1FA2' : '#E53935';
    var bg = radio.value==='rdv_commercial' ? '#F3E5F5' : '#FFEBEE';
    lbl.style.borderColor = on ? col : 'var(--grey-lt)';
    lbl.style.background = on ? bg : '';
  });
}
async function confirmRappelTypeModal(){
  const id = RT.lieuId; if(!id) return;
  const commentaire = document.getElementById('rt-comment').value.trim();
  const type = (document.querySelector('input[name="rt-type"]:checked')||{}).value || 'repassage';
  closeModal('modal-rappel-type');
  try{
    const res = await sbPost('rappels_lieux',{lieu_id:id,commentaire:commentaire||null,origine:'bureau',statut:'a_faire',type});
    ST.rappels[id] = Array.isArray(res)?res[0]:res;
    showToast(type==='rdv_commercial'?'📅 RDV commercial ajouté':'🔁 Marqué à faire');
  } catch(e){ showToast('❌ '+e.message); return; }
  updateMapMarkers();
  openFicheLieu(id);
}
async function deleteRappelLieuFiche(id){
  const actif = ST.rappels[id]; if(!actif) return;
  if(!confirm('Retirer ce rappel "à faire" (erreur de saisie) ? Cette action est définitive.')) return;
  try{
    await sbDelete('rappels_lieux','id=eq.'+actif.id);
    delete ST.rappels[id];
    showToast('🗑 Rappel retiré');
  } catch(e){ showToast('❌ '+e.message); return; }
  updateMapMarkers();
  openFicheLieu(id);
}
async function saveSaisonManuelleFiche(id){
  const annee = parseInt(document.getElementById('fiche-saison-annee').value,10);
  if(!annee){ showToast('⚠ Année invalide'); return; }
  const dateOuverture = document.getElementById('fiche-saison-ouverture').value || null;
  const dateFermeture = document.getElementById('fiche-saison-fermeture').value || null;
  const commentaire = document.getElementById('fiche-saison-commentaire').value.trim() || null;
  if(!dateOuverture && !dateFermeture){ showToast('⚠ Renseigne au moins une date'); return; }
  try{
    const existing = await sbGet('saisons_lieux?select=id&lieu_id=eq.'+id+'&annee=eq.'+annee+'&limit=1');
    const payload = {
      lieu_id: id, annee,
      date_ouverture: dateOuverture, date_fermeture: dateFermeture,
      commentaire, source: 'admin',
      maj_par: ST.user?.id || null,
      maj_le: new Date().toISOString()
    };
    if(existing && existing[0]) await sbPatch('saisons_lieux','id=eq.'+existing[0].id,payload);
    else await sbPost('saisons_lieux',payload);
    showToast('✓ Saison '+annee+' enregistrée');
    await loadSaisonsActuelles();
    updateMapMarkers();
    openFicheLieu(id);
  } catch(e){ showToast('❌ '+e.message); }
}

function getSeuilMs() {
  const weeks = parseInt(document.getElementById('map-seuil')?.value) || 4;
  return weeks * 7 * 24 * 3600 * 1000;
}

function initMap(){
  if(ST.map) return;
  ST.map=L.map('map').setView([44.4073,4.3980],10);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap',maxZoom:18}).addTo(ST.map);
  Promise.all([loadLastVisits(), loadSaisonsActuelles(), loadRappelsActuels(), loadLivraisonsActuelles()]).then(()=>{ updateMapMarkers(); renderMapAlertes(); });
}

function updateMapMarkers(){
  if(!ST.map) return;
  ST.mapMarkers.forEach(m=>m.remove()); ST.mapMarkers=[];
  const seuilMs = getSeuilMs();
  const saisonFiltre = document.getElementById('map-saison-filter')?.value || '';
  const rappelFiltre = document.getElementById('map-rappel-filter')?.value || '';
  ST.lieux.forEach(l=>{
    if(!l.latitude||!l.longitude) return;
    const statutSaison = saisonStatut(l.id);
    if (saisonFiltre === 'sans_info' && statutSaison !== null) return;
    if (saisonFiltre && saisonFiltre !== 'sans_info' && statutSaison !== saisonFiltre) return;
    const rappel = ST.rappels[l.id];
    if (rappelFiltre === 'oui' && !rappel) return;
    const color = markerColor(l.id, seuilMs);
    const v = ST.lastVisits[l.id];
    const lastStr = v
      ? new Date(v.date).toLocaleDateString('fr-FR',{day:'2-digit',month:'short',year:'numeric'}) + ' — ' +
        ({distribue:'✅ Fait',ferme:'🔒 Fermé',refus:'🚫 Refus',absent:'👻 Absent'}[v.statut]||v.statut)
      : '⚫ Jamais visité';
    const s = ST.saisons[l.id];
    const saisonStr = statutSaison==='ferme'
      ? '<br><span style="color:#E53935;font-weight:600">🔒 Fermé actuellement'+(s&&s.date_ouverture?' — réouvre le '+new Date(s.date_ouverture).toLocaleDateString('fr-FR'):'')+'</span>'
      : statutSaison==='ferme_bientot'
      ? '<br><span style="color:#E8A020;font-weight:600">⏳ Ferme le '+new Date(s.date_fermeture).toLocaleDateString('fr-FR')+'</span>'
      : (s && (s.date_ouverture||s.date_fermeture))
      ? '<br><span style="color:#8D6E63;font-size:11px">📅 '+(s.date_ouverture?'ouvre '+new Date(s.date_ouverture).toLocaleDateString('fr-FR',{day:'2-digit',month:'short'}):'')+(s.date_ouverture&&s.date_fermeture?' · ':'')+(s.date_fermeture?'ferme '+new Date(s.date_fermeture).toLocaleDateString('fr-FR',{day:'2-digit',month:'short'}):'')+'</span>'
      : '';
    const ringStyle = (statutSaison==='ferme'||statutSaison==='ferme_bientot') ? 'outline:2px dashed #2B2B2B;outline-offset:2px;' : '';
    const livraison = ST.livraisons[l.id];
    const isRdvCommercial = rappel && rappel.type==='rdv_commercial';
    const rappelDot = rappel
      ? (isRdvCommercial
          ? '<div style="position:absolute;top:-4px;right:-4px;width:16px;height:16px;border-radius:50%;background:#7B1FA2;border:1.5px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,.4);display:flex;align-items:center;justify-content:center;font-size:9px">📅</div>'
          : '<div style="position:absolute;top:-2px;right:-2px;width:8px;height:8px;border-radius:50%;background:#E53935;border:1.5px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,.4)"></div>')
      : '';
    const livraisonDot = livraison ? '<div class="map-badge-pulse" style="position:absolute;bottom:-4px;left:-4px;width:16px;height:16px;border-radius:50%;background:#C87F0A;border:1.5px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,.4);display:flex;align-items:center;justify-content:center;font-size:9px">📦</div>' : '';
    const rappelStr = rappel ? '<br><span style="color:'+(isRdvCommercial?'#7B1FA2':'#E53935')+';font-weight:600">'+(isRdvCommercial?'📅 RDV commercial':'🔁 À faire')+(rappel.commentaire?' — '+esc(rappel.commentaire):'')+'</span>' : '';
    const livraisonStr = livraison ? '<br><span style="color:#C87F0A;font-weight:600">📦 Livraison à faire'+(livraison.description?' — '+esc(livraison.description):'')+'</span>' : '';
    const isDepart = l.categorie === 'Point de départ';
    const icon = isDepart
      ? L.divIcon({
          html:`<div style="position:relative;width:26px;height:26px;display:flex;align-items:center;justify-content:center;font-size:20px;filter:drop-shadow(0 1px 3px rgba(0,0,0,.5))">🏠${rappelDot}${livraisonDot}</div>`,
          iconSize:[26,26],iconAnchor:[13,13],className:''
        })
      : isRdvCommercial
      ? L.divIcon({
          html:`<div style="position:relative;width:20px;height:20px"><div style="width:20px;height:20px;background:#7B1FA2;border:2px solid white;border-radius:50%;box-shadow:0 1px 5px rgba(0,0,0,.4);display:flex;align-items:center;justify-content:center;font-size:12px;${ringStyle}">📅</div>${livraisonDot}</div>`,
          iconSize:[20,20],iconAnchor:[10,10],className:''
        })
      : L.divIcon({
          html:`<div style="position:relative;width:14px;height:14px"><div style="width:14px;height:14px;background:${color};border:2px solid white;border-radius:50%;box-shadow:0 1px 5px rgba(0,0,0,.4);${ringStyle}"></div>${rappelDot}${livraisonDot}</div>`,
          iconSize:[14,14],iconAnchor:[7,7],className:''
        });
    const m=L.marker([l.latitude,l.longitude],{icon})
      .bindPopup(`<strong>${l.nom}</strong><br><span style="color:#666;font-size:11px">${l.categorie||''}${l.ville?' · '+l.ville:''}</span><br><span style="font-size:11px">${lastStr}</span>${saisonStr}${rappelStr}${livraisonStr}`)
      .addTo(ST.map);
    ST.mapMarkers.push(m);
  });
}

function renderMapAlertes(){
  const seuilMs = getSeuilMs();
  const weeks = parseInt(document.getElementById('map-seuil')?.value) || 4;
  const alertes = ST.lieux.filter(l => {
    const v = ST.lastVisits[l.id];
    if (!v) return true; // jamais visité
    return (Date.now() - new Date(v.date).getTime()) > seuilMs;
  }).sort((a,b) => {
    const da = ST.lastVisits[a.id]?.date || '0';
    const db = ST.lastVisits[b.id]?.date || '0';
    return da < db ? -1 : 1; // les plus anciens en premier
  });

  const hdr = document.getElementById('map-alertes-hdr');
  const title = document.getElementById('map-alertes-title');
  const list = document.getElementById('map-alertes-list');
  if (!hdr||!title||!list) return;

  if (alertes.length === 0) {
    hdr.className = 'ok';
    title.textContent = `✅ Tous les lieux ont été visités dans les ${weeks} dernières semaines`;
    list.innerHTML = '';
    return;
  }
  hdr.className = '';
  title.textContent = `⚠️ ${alertes.length} lieu${alertes.length>1?'x':''} non visité${alertes.length>1?'s':''} depuis ${weeks}+ semaines`;
  list.innerHTML = alertes.map(l => {
    const v = ST.lastVisits[l.id];
    const dateStr = v
      ? new Date(v.date).toLocaleDateString('fr-FR',{day:'2-digit',month:'short',year:'numeric'})
      : 'Jamais';
    return `<div class="map-alerte-item">
      <span style="font-weight:600">${esc(l.nom)}<span style="color:var(--grey);font-weight:400"> · ${esc(l.ville||l.categorie||'')}</span></span>
      <span style="color:var(--grey);white-space:nowrap;margin-left:8px">${dateStr}</span>
    </div>`;
  }).join('');
}

function applyMapSeuil(){
  updateMapMarkers();
  renderMapAlertes();
}

function toggleAlertes(){
  const body = document.getElementById('map-alertes-body');
  const chev = document.getElementById('map-alertes-chev');
  if (!body) return;
  body.classList.toggle('open');
  chev.textContent = body.classList.contains('open') ? '▴' : '▾';
}

function centerMap(){
  if(!ST.map||!ST.mapMarkers.length) return;
  ST.map.fitBounds(L.featureGroup(ST.mapMarkers).getBounds().pad(0.1));
}

function updateMapTourneeFilter(){
  document.getElementById('map-tournee-filter').innerHTML='<option value="">Tous les lieux</option>'+ST.tournees.map(t=>`<option value="${t.id}">${esc(t.nom)}</option>`).join('');
}
function filterMap(){ updateMapMarkers(); }

// ══════════════════════════════════════════════════════════
//  SUIVI LIVE
// ══════════════════════════════════════════════════════════
async function renderSuivi(){
  const actives=ST.tournees.filter(t=>t.statut==='en_cours'||t.statut==='planifiee');
  const el=document.getElementById('suivi-tournees-grid');
  if(!actives.length){el.innerHTML='<div style="color:var(--grey);font-size:13px;padding:20px">Aucune tournée en cours</div>';return;}
  el.innerHTML=actives.map(t=>{
    const pts=(t.points||[]).filter(p=>!isRepere(p)),done=pts.filter(p=>p.statut!=='a_faire').length,pct=pts.length?Math.round(done/pts.length*100):0;
    return `<div class="card">
      <div class="card-header"><h3>${esc(t.nom)}</h3><span class="badge b-${t.statut}">${statutLabel(t.statut)}</span></div>
      <div style="padding:14px">
        <div style="font-size:12px;color:var(--grey);margin-bottom:10px">👤 ${esc(t.distributeur?.nom||'Non assigné')} · 📅 ${fmtDate(t.date)}</div>
        <div style="display:flex;justify-content:space-between;margin-bottom:6px">
          <span style="font-size:12px;font-weight:600">${done} / ${pts.length} points</span>
          <span style="font-size:12px;font-weight:700;color:var(--gold-dk)">${pct}%</span>
        </div>
        <div class="prog-mini" style="height:8px;border-radius:4px"><div class="prog-mini-fill" style="width:${pct}%;height:8px;border-radius:4px;background:${pct===100?'var(--green)':'var(--gold)'}"></div></div>
        <div style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap">
          ${['distribue','ferme','refus','absent'].map(s=>{const n=pts.filter(p=>p.statut===s).length;return n?`<span class="badge b-${s}">${statutLabel(s)} : ${n}</span>`:''}).join('')}
        </div>
        <button class="btn btn-secondary btn-sm" style="margin-top:12px;width:100%" onclick="openTourneeDetail(${t.id})">Voir le détail</button>
      </div>
    </div>`;
  }).join('');
}

// ══════════════════════════════════════════════════════════
//  REALTIME
// ══════════════════════════════════════════════════════════
function setupRealtime(){
  ST.realtimeSub=sb.channel('db-changes')
    .on('postgres_changes',{event:'*',schema:'public',table:'points_tournee'},async payload=>{
      await loadTournees(); renderSuivi();
      if(ST.currentTourneeId&&payload.new?.tournee_id===ST.currentTourneeId){
        const idx=ST.currentTourneeStops.findIndex(s=>s.id===payload.new.id);
        if(idx>-1){ST.currentTourneeStops[idx]={...ST.currentTourneeStops[idx],...payload.new};renderDetailStops();}
      }
      addActivity(payload);
    })
    .on('postgres_changes',{event:'*',schema:'public',table:'tournees'},async()=>{await loadTournees();renderSuivi();})
    .subscribe();
}

var activityFeed=[];
function addActivity(payload){
  if(payload.eventType==='UPDATE'&&payload.new&&payload.new.statut!=='a_faire'){
    const stop=ST.currentTourneeStops.find(s=>s.id===payload.new.id);
    activityFeed.unshift({msg:`${stop?.lieu?.nom||'Lieu'} — ${statutLabel(payload.new.statut)}`,ts:new Date().toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'}),color:statutColor(payload.new.statut)});
    activityFeed=activityFeed.slice(0,10); renderActivity();
  }
}
function renderActivity(){
  const el=document.getElementById('dash-activity');
  if(!activityFeed.length){el.innerHTML='<div style="padding:20px;text-align:center;color:var(--grey);font-size:13px">En attente…</div>';return;}
  el.innerHTML=activityFeed.map(a=>`<div class="rt-item"><div class="rt-dot" style="background:${a.color}"></div><div class="rt-nom">${esc(a.msg)}</div><div style="font-size:10px;color:var(--grey)">${a.ts}</div></div>`).join('');
}

// ══════════════════════════════════════════════════════════
//  HELPERS
// ══════════════════════════════════════════════════════════
function openModal(id){ document.getElementById(id).classList.add('open'); }
function closeModal(id){ document.getElementById(id).classList.remove('open'); }

function showToast(msg, dur=2400){
  const t=document.getElementById('toast');
  t.textContent=msg; t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'), dur);
}

function esc(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function norm(s){ return (s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase(); }
function fmtDate(d){ if(!d) return '—'; try{ return new Date(d).toLocaleDateString('fr-FR'); }catch(e){ return d; } }
function statutLabel(s){ return {planifiee:'Planifiée',en_cours:'En cours',terminee:'Terminée',annulee:'Annulée',a_faire:'À faire',distribue:'Fait',ferme:'Fermé',refus:'Refus',absent:'Absent'}[s]||s||''; }
function flyReasonTagG(raison){
  if(raison==='stock_suffisant') return ' <span style="color:var(--grey);font-weight:600">(stock ok)</span>';
  if(raison==='refuse') return ' <span style="color:var(--red);font-weight:600">(refusé)</span>';
  return '';
}
function raisonZeroButtonsHtmlG(current, setterFnName){
  return `<div style="display:flex;gap:6px;margin-top:6px">
    <button type="button" onclick="${setterFnName}('stock_suffisant')" style="flex:1;padding:6px;font-size:11px;border-radius:6px;border:1.5px solid ${current==='stock_suffisant'?'#27AE60':'#ddd'};background:${current==='stock_suffisant'?'#E8F5E9':'#fff'};color:${current==='stock_suffisant'?'#27AE60':'#555'};cursor:pointer;font-weight:600">🔄 Stock suffisant</button>
    <button type="button" onclick="${setterFnName}('refuse')" style="flex:1;padding:6px;font-size:11px;border-radius:6px;border:1.5px solid ${current==='refuse'?'#E53935':'#ddd'};background:${current==='refuse'?'#FFEBEE':'#fff'};color:${current==='refuse'?'#E53935':'#555'};cursor:pointer;font-weight:600">🚫 Refusé</button>
  </div>`;
}
function statutEmoji(s){ return {planifiee:'📋',en_cours:'🏃',terminee:'✅',annulee:'❌'}[s]||'📋'; }
function statutColor(s){ return {distribue:'var(--green)',ferme:'var(--red)',refus:'#7B1FA2',absent:'var(--orange)'}[s]||'var(--grey)'; }

// ══════════════════════════════════════════════════════════
//  FICHE LIEU
// ══════════════════════════════════════════════════════════
async function openFicheLieu(id) {
  const l = ST.lieux.find(x=>x.id===id); if(!l) return;
  document.getElementById('fiche-lieu-title').textContent = l.nom;
  document.getElementById('fiche-lieu-body').innerHTML = '<div style="text-align:center;padding:40px;color:var(--grey)"><div class="loader"></div><div style="margin-top:10px">Chargement…</div></div>';
  openModal('modal-fiche-lieu');

  const yr = new Date().getFullYear();
  const all = await sbGet(`points_tournee?select=id,statut,quantite_flyers,quantite_flyers_chateau,raison_zero_nougaterie,raison_zero_chateau,heure_validation,commentaire_distributeur,photo_preuve,tournees(id,nom,date,distributeur:utilisateurs(nom))&lieu_id=eq.${id}&statut=neq.a_faire&heure_validation=not.is.null&order=heure_validation.desc`).catch(()=>[]);
  const saisons = await sbGet(`saisons_lieux?select=annee,date_ouverture,date_fermeture,commentaire,source&lieu_id=eq.${id}&order=annee.desc`).catch(()=>[]);
  const rappelRows = await sbGet(`rappels_lieux?select=id,commentaire,origine,type,cree_le&lieu_id=eq.${id}&statut=eq.a_faire&order=cree_le.desc&limit=1`).catch(()=>[]);
  const livraisonRows = await sbGet(`commandes_livraison?select=id,description,cree_le&lieu_id=eq.${id}&statut=eq.a_livrer&point_tournee_id=is.null&order=cree_le.desc&limit=1`).catch(()=>[]);
  const livraisonActive = livraisonRows && livraisonRows[0];
  ST.livraisons[id] = livraisonActive || undefined;
  const rappelActif = rappelRows && rappelRows[0];
  ST.rappels[id] = rappelActif || undefined;
  const anneeSaisonCourante = new Date().getFullYear();
  const saisonCourante = saisons.find(s => s.annee === anneeSaisonCourante);
  const annee = all.filter(p=>p.heure_validation&&p.heure_validation.startsWith(yr));
  const flyAn  = annee.filter(p=>p.statut==='distribue').reduce((s,p)=>s+(p.quantite_flyers||0),0);
  const flyAll = all.filter(p=>p.statut==='distribue').reduce((s,p)=>s+(p.quantite_flyers||0),0);
  const taux   = all.length ? Math.round(all.filter(p=>p.statut==='distribue').length/all.length*100) : 0;
  const photos = all.filter(p=>p.photo_preuve);
  const dotC   = {distribue:'var(--green)',ferme:'var(--grey)',refus:'var(--red)',absent:'var(--orange)'};
  const bgC    = {distribue:'var(--green-lt)',ferme:'#ECEFF1',refus:'var(--red-lt)',absent:'var(--orange-lt)'};
  const txtC   = {distribue:'var(--green)',ferme:'var(--grey)',refus:'var(--red)',absent:'var(--orange)'};
  const slbls  = {distribue:'✅ Fait',ferme:'🔒 Fermé',refus:'🚫 Refus',absent:'👻 Absent'};
  const gm = l.latitude&&l.longitude ? `https://www.google.com/maps/search/?api=1&query=${l.latitude},${l.longitude}` : null;

  // Infos + stats
  let html = `
    <div style="display:flex;gap:16px;margin-bottom:18px;flex-wrap:wrap">
      <div style="flex:1;min-width:200px">
        ${l.adresse||l.ville?`<div style="font-size:13px;margin-bottom:4px">📍 ${esc([l.adresse,l.code_postal,l.ville].filter(Boolean).join(', '))}</div>`:''}
        ${l.telephone?`<div style="font-size:13px;margin-bottom:4px">📞 <a href="tel:${l.telephone}">${esc(l.telephone)}</a></div>`:''}
        ${l.email?`<div style="font-size:13px;margin-bottom:4px">✉️ <a href="mailto:${l.email}">${esc(l.email)}</a></div>`:''}
        ${l.zone_tournee?`<div style="font-size:13px;margin-bottom:4px">🗂 Zone : ${esc(l.zone_tournee)}</div>`:''}
        ${saisons.length?`<div style="font-size:11px;font-weight:700;color:var(--grey);text-transform:uppercase;letter-spacing:.4px;margin:10px 0 4px">📅 Saison</div>${saisons.map(s=>`<div style="font-size:12px;margin-bottom:2px"><strong>${s.annee}</strong> — ${s.date_ouverture?'ouvre '+new Date(s.date_ouverture).toLocaleDateString('fr-FR',{day:'2-digit',month:'short'}):''}${s.date_ouverture&&s.date_fermeture?' · ':''}${s.date_fermeture?'ferme '+new Date(s.date_fermeture).toLocaleDateString('fr-FR',{day:'2-digit',month:'short'}):''}${!s.date_ouverture&&!s.date_fermeture?'—':''}${s.commentaire?' · '+esc(s.commentaire):''}</div>`).join('')}`:''}
        <div style="display:flex;gap:5px;margin:6px 0 5px">
          <div style="width:56px"><label style="font-size:9px;color:var(--grey)">Année</label><input id="fiche-saison-annee" type="number" value="${saisonCourante?saisonCourante.annee:anneeSaisonCourante}" style="width:100%;box-sizing:border-box;font-size:11px;padding:3px"></div>
          <div style="flex:1"><label style="font-size:9px;color:var(--grey)">Ouverture</label><input id="fiche-saison-ouverture" type="date" value="${saisonCourante&&saisonCourante.date_ouverture?saisonCourante.date_ouverture:''}" style="width:100%;box-sizing:border-box;font-size:11px;padding:3px"></div>
          <div style="flex:1"><label style="font-size:9px;color:var(--grey)">Fermeture</label><input id="fiche-saison-fermeture" type="date" value="${saisonCourante&&saisonCourante.date_fermeture?saisonCourante.date_fermeture:''}" style="width:100%;box-sizing:border-box;font-size:11px;padding:3px"></div>
        </div>
        <input id="fiche-saison-commentaire" type="text" placeholder="Commentaire (optionnel)" value="${saisonCourante&&saisonCourante.commentaire?esc(saisonCourante.commentaire):''}" style="width:100%;box-sizing:border-box;font-size:11px;padding:3px;margin-bottom:5px">
        <button class="btn btn-secondary btn-sm" style="margin-bottom:6px" onclick="saveSaisonManuelleFiche(${id})">💾 Enregistrer la saison</button>
        <div style="font-size:11px;font-weight:700;color:#E53935;text-transform:uppercase;letter-spacing:.4px;margin:10px 0 4px">🔁 À faire</div>
        ${rappelActif?`<div style="font-size:12px;margin-bottom:4px">${rappelActif.type==='rdv_commercial'?'<span style="color:#7B1FA2;font-weight:700">📅 RDV commercial</span><br>':''}${rappelActif.commentaire?esc(rappelActif.commentaire):'<em>(sans commentaire)</em>'}<br><span style="color:var(--grey);font-size:11px">${rappelActif.origine==='terrain'?'signalé sur le terrain':rappelActif.origine==='pointage'?'signalé au pointage':'ajouté depuis le bureau'} le ${new Date(rappelActif.cree_le).toLocaleDateString('fr-FR')}</span><br><div style="display:flex;gap:5px;margin-top:4px"><button class="btn btn-secondary btn-sm" onclick="toggleRappelLieuFiche(${id})">✓ Marquer traité</button><button class="btn btn-secondary btn-sm" onclick="deleteRappelLieuFiche(${id})">🗑 Retirer</button></div></div>`:`<button class="btn btn-secondary btn-sm" style="margin-bottom:4px" onclick="toggleRappelLieuFiche(${id})">🔁 Marquer à faire</button>`}
        <div style="font-size:11px;font-weight:700;color:#C87F0A;text-transform:uppercase;letter-spacing:.4px;margin:10px 0 4px">📦 Livraison</div>
        ${livraisonActive?`<div style="font-size:12px;margin-bottom:4px">${livraisonActive.description?esc(livraisonActive.description):'<em>(sans description)</em>'}<br><span style="color:var(--grey);font-size:11px">signalée le ${new Date(livraisonActive.cree_le).toLocaleDateString('fr-FR')}</span><br><div style="display:flex;gap:5px;margin-top:4px"><button class="btn btn-secondary btn-sm" onclick="annulerLivraisonLieu(${id})">✓ Marquer livrée / retirer</button></div></div>`:`<button class="btn btn-secondary btn-sm" style="margin-bottom:4px" onclick="signalerLivraisonLieu(${id})">📦 Signaler une livraison</button>`}
        ${l.source_horaires?`<div style="font-size:12px;margin-top:4px">🔗 ${/^https?:\/\//.test(l.source_horaires)?`<a href="${esc(l.source_horaires)}" target="_blank">${esc(l.source_horaires)}</a>`:esc(l.source_horaires)}</div>`:''}
        ${l.notes?`<div style="font-size:12px;color:var(--grey);margin-top:6px">${esc(l.notes)}</div>`:''}
        ${gm?`<a href="${gm}" target="_blank" class="btn btn-secondary btn-sm" style="margin-top:8px;display:inline-flex">🗺️ Voir sur Maps</a>`:''}
      </div>
      <div style="flex:2">
        <div class="fiche-stats-d">
          <div class="fsd-tile"><div class="sv">${annee.length}</div><div class="sl">Visites ${yr}</div></div>
          <div class="fsd-tile"><div class="sv" style="color:var(--gold-dk)">${flyAn}</div><div class="sl">Flyers ${yr}</div></div>
          <div class="fsd-tile"><div class="sv" style="color:var(--green)">${taux}%</div><div class="sl">Taux réussite</div></div>
          <div class="fsd-tile"><div class="sv">${all.length}</div><div class="sl">Total visites</div></div>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          ${['distribue','ferme','refus','absent'].map(s=>{const n=all.filter(p=>p.statut===s).length;return n?`<span class="badge b-${s}">${slbls[s]} : ${n}</span>`:''}).join('')}
        </div>
      </div>
    </div>`;

  // Photos
  if(photos.length){
    html += `<div style="font-size:11px;font-weight:700;color:var(--grey);text-transform:uppercase;letter-spacing:.4px;margin-bottom:8px">📷 Photos (${photos.length})</div>
    <div class="photo-grid-d">
      ${photos.slice(0,10).map(p=>{
        const d=p.heure_validation?new Date(p.heure_validation).toLocaleDateString('fr-FR',{day:'2-digit',month:'short',year:'numeric'}):'';
        return `<img src="${p.photo_preuve}" loading="lazy" title="${d}" onclick="openPhotoLbD('${p.photo_preuve}','${esc(d)}')" alt="${esc(d)}">`;
      }).join('')}
    </div>`;
  }

  // Timeline avec filtre
  window._ficheAdminAll = all; window._ficheAdminAnnee = annee;
  html += `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
      <div style="font-size:11px;font-weight:700;color:var(--grey);text-transform:uppercase;letter-spacing:.4px">Historique des visites</div>
      <div style="display:flex;gap:6px">
        <button id="fad-yr-btn" onclick="ficheAdminFilter(true)" class="btn btn-primary btn-sm">${yr}</button>
        <button id="fad-all-btn" onclick="ficheAdminFilter(false)" class="btn btn-secondary btn-sm">Tout</button>
      </div>
    </div>
    <div id="fad-timeline">${ficheTimelineDesktopHTML(annee,dotC,bgC,txtC,slbls)}</div>`;

  document.getElementById('fiche-lieu-body').innerHTML = html;
}

function ficheAdminFilter(yearOnly){
  const list = yearOnly ? window._ficheAdminAnnee : window._ficheAdminAll;
  const yr = new Date().getFullYear();
  const dotC={distribue:'var(--green)',ferme:'var(--grey)',refus:'var(--red)',absent:'var(--orange)'};
  const bgC={distribue:'var(--green-lt)',ferme:'#ECEFF1',refus:'var(--red-lt)',absent:'var(--orange-lt)'};
  const txtC={distribue:'var(--green)',ferme:'var(--grey)',refus:'var(--red)',absent:'var(--orange)'};
  const slbls={distribue:'✅ Fait',ferme:'🔒 Fermé',refus:'🚫 Refus',absent:'👻 Absent'};
  document.getElementById('fad-yr-btn').className = yearOnly ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm';
  document.getElementById('fad-all-btn').className = yearOnly ? 'btn btn-secondary btn-sm' : 'btn btn-primary btn-sm';
  document.getElementById('fad-timeline').innerHTML = ficheTimelineDesktopHTML(list,dotC,bgC,txtC,slbls);
}

function ficheTimelineDesktopHTML(list,dotC,bgC,txtC,slbls){
  if(!list.length) return `<div style="text-align:center;padding:30px;color:var(--grey);font-size:13px">Aucun passage enregistré</div>`;
  return list.map(p=>{
    const d = p.heure_validation ? new Date(p.heure_validation) : null;
    const dateStr = d ? d.toLocaleDateString('fr-FR',{weekday:'long',day:'2-digit',month:'long',year:'numeric'}) : (p.tournees?.date||'—');
    const heureStr = d ? d.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'}) : '';
    const dist = p.tournees?.distributeur?.nom||'';
    return `<div class="ftd-item">
      <div class="ftd-dot" style="background:${dotC[p.statut]||'#ccc'};box-shadow:0 0 0 2px ${dotC[p.statut]||'#ccc'}"></div>
      <div class="ftd-content" style="flex:1">
        <div class="ftd-date">${esc(dateStr)}${heureStr?' · '+heureStr:''}</div>
        <div style="margin:3px 0">
          <span class="badge" style="background:${bgC[p.statut]};color:${txtC[p.statut]}">${slbls[p.statut]||p.statut}</span>
          ${p.statut==='distribue'?`<span style="font-size:11px;color:var(--grey);margin-left:6px">🗞 ${p.quantite_flyers||0} flyers${flyReasonTagG(p.quantite_flyers?null:p.raison_zero_nougaterie)}</span>`:''}
          ${p.statut==='distribue'&&(p.quantite_flyers_chateau||p.raison_zero_chateau)?`<span style="font-size:11px;color:var(--grey);margin-left:6px">🎟️ ${p.quantite_flyers_chateau||0} château${flyReasonTagG(p.quantite_flyers_chateau?null:p.raison_zero_chateau)}</span>`:''}
          ${p.tournees?.nom?`<span style="font-size:11px;color:var(--grey);margin-left:6px">📋 ${esc(p.tournees.nom)}</span>`:''}
          ${dist?`<span style="font-size:11px;color:var(--grey);margin-left:6px">👤 ${esc(dist)}</span>`:''}
        </div>
        ${p.commentaire_distributeur?`<div class="ftd-comment">💬 ${esc(p.commentaire_distributeur)}</div>`:''}
      </div>
      ${p.photo_preuve?`<img src="${p.photo_preuve}" class="ftd-photo" loading="lazy" onclick="openPhotoLbD('${p.photo_preuve}','${esc(dateStr)}')" alt="Photo">`:''}
    </div>`;
  }).join('');
}

function openPhotoLbD(url, caption){
  const lb = document.createElement('div');
  lb.className = 'photo-lb-d';
  lb.innerHTML = `<span class="photo-lb-d-close" onclick="this.parentElement.remove()">✕</span><img src="${url}" alt="${caption}"><div style="color:rgba(255,255,255,.7);font-size:12px">${caption}</div>`;
  lb.onclick = e=>{ if(e.target===lb) lb.remove(); };
  document.body.appendChild(lb);
}

// ══════════════════════════════════════════════════════════
//  DISTRIBUTEURS
// ══════════════════════════════════════════════════════════
async function loadDistributeurs(){
  try {
    const data = await sbGet('utilisateurs?select=*&order=nom.asc');
    ST.distributeurs = data||[];
    renderDistributeursSelects();
    if(document.getElementById('section-distributeurs').classList.contains('active')) renderDistributeursTable();
  } catch(e){ console.error('loadDistributeurs',e); }
}

function renderDistributeursTable(){
  const tbody = document.getElementById('distributeurs-tbody');
  if(!ST.distributeurs.length){
    tbody.innerHTML='<tr><td colspan="6" style="text-align:center;padding:30px;color:var(--grey)">Aucun distributeur</td></tr>';
    return;
  }
  tbody.innerHTML = ST.distributeurs.map(d => {
    const nb = ST.tournees.filter(t => t.distributeur_id === d.id).length;
    const roleLabel = d.role==='admin'
      ? '<span class="badge" style="background:#F3E5F5;color:#7B1FA2">Admin</span>'
      : '<span class="badge b-planifiee">Distributeur</span>';
    return `<tr>
      <td><strong>${esc(d.nom)}</strong></td>
      <td style="color:var(--grey)">${esc(d.email)}</td>
      <td>${esc(d.telephone||'—')}</td>
      <td>${roleLabel}</td>
      <td><span style="font-size:12px">${nb} tournée${nb>1?'s':''}</span></td>
      <td style="display:flex;gap:6px">
        <button class="btn btn-secondary btn-sm" onclick="editDistributeur('${d.id}')">✏️ Modifier</button>
        ${d.role!=='admin'?`<button class="btn btn-danger btn-sm" onclick="deleteDistributeur('${d.id}','${esc(d.nom)}')">🗑</button>`:''}
      </td>
    </tr>`;
  }).join('');
}

var editingDistId = null;

function openDistributeurModal(){
  editingDistId = null;
  document.getElementById('dist-modal-title').textContent = 'Nouveau distributeur';
  document.getElementById('d-nom').value = '';
  document.getElementById('d-tel').value = '';
  document.getElementById('d-email').value = '';
  document.getElementById('d-pwd').value = '';
  document.getElementById('d-pwd2').value = '';
  document.getElementById('dist-create-fields').style.display = 'block';
  document.getElementById('dist-save-btn').textContent = 'Créer le compte';
  document.getElementById('dist-modal-info').style.display = 'none';
  openModal('modal-distributeur');
}

function editDistributeur(id){
  const d = ST.distributeurs.find(x=>x.id===id); if(!d) return;
  editingDistId = id;
  document.getElementById('dist-modal-title').textContent = 'Modifier — '+d.nom;
  document.getElementById('d-nom').value = d.nom||'';
  document.getElementById('d-tel').value = d.telephone||'';
  document.getElementById('dist-create-fields').style.display = 'none';
  document.getElementById('dist-save-btn').textContent = 'Enregistrer';
  document.getElementById('dist-modal-info').style.display = 'block';
  document.getElementById('dist-modal-info').textContent = '📧 '+d.email+' — le mot de passe ne peut pas être modifié ici.';
  openModal('modal-distributeur');
}

async function saveDistributeur(){
  const btn = document.getElementById('dist-save-btn');
  const nom = document.getElementById('d-nom').value.trim();
  const tel = document.getElementById('d-tel').value.trim();
  if(!nom){ showToast('⚠ Le nom est obligatoire'); return; }
  btn.disabled=true; btn.textContent='⏳ En cours…';

  try {
    if(editingDistId){
      await sbPatch('utilisateurs','id=eq.'+editingDistId,{nom, telephone:tel||null});
      showToast('✅ Profil mis à jour');
      closeModal('modal-distributeur');
      await loadDistributeurs(); renderDistributeursTable();
    } else {
      const email = document.getElementById('d-email').value.trim();
      const pwd   = document.getElementById('d-pwd').value;
      const pwd2  = document.getElementById('d-pwd2').value;
      if(!email||!pwd){ showToast('⚠ Email et mot de passe obligatoires'); btn.disabled=false; btn.textContent='Créer le compte'; return; }
      if(pwd!==pwd2){ showToast('⚠ Les mots de passe ne correspondent pas'); btn.disabled=false; btn.textContent='Créer le compte'; return; }
      if(pwd.length<6){ showToast('⚠ Mot de passe trop court (min. 6 caractères)'); btn.disabled=false; btn.textContent='Créer le compte'; return; }

      const authData = await sbAuthPost('signup',{email, password:pwd});
      const userId = authData.user?.id||authData.id;
      if(!userId){ showToast('❌ Impossible de récupérer l\'ID utilisateur'); btn.disabled=false; btn.textContent='Créer le compte'; return; }

      try { await sbPost('utilisateurs',{id:userId, nom, email, role:'distributeur', telephone:tel||null}); }
      catch(pe){ showToast('⚠ Compte créé mais profil incomplet : '+pe.message); btn.disabled=false; return; }
      showToast('✅ Compte créé pour '+nom);
      closeModal('modal-distributeur');
      await loadDistributeurs(); renderDistributeursTable();
    }
  } catch(e){ showToast('❌ '+e.message); }
  btn.disabled=false;
}

async function deleteDistributeur(id, nom){
  const nb = ST.tournees.filter(t=>t.distributeur_id===id).length;
  const msg = nb>0 ? `Supprimer "${nom}" ? Il a ${nb} tournée(s) assignée(s) qui seront désassignées.` : `Supprimer "${nom}" ?`;
  if(!confirm(msg)) return;
  try {
    if(nb>0) await sbPatch('tournees','distributeur_id=eq.'+id,{distributeur_id:null});
    await sbDelete('utilisateurs','id=eq.'+id);
    showToast('🗑 '+nom+' supprimé');
    await loadDistributeurs(); renderDistributeursTable();
  } catch(e){ showToast('❌ '+e.message); }
}

// ══════════════════════════════════════════════════════════
//  STATISTIQUES
// ══════════════════════════════════════════════════════════
let _gsData = [];

async function loadGStats(){
  document.getElementById('gs-tbody').innerHTML = '<tr><td colspan="10" style="text-align:center;padding:30px;color:var(--grey)">Chargement…</td></tr>';
  try {
    const data = await sbGet('points_tournee?select=id,statut,quantite_flyers,quantite_flyers_chateau,raison_zero_nougaterie,raison_zero_chateau,nb_nougat_offert,entree_gratuite,heure_validation,commentaire_distributeur,lieux(nom,ville,categorie),tournees(nom,date,distributeur:utilisateurs(nom))&statut=neq.a_faire&heure_validation=not.is.null&order=heure_validation.desc&limit=2000');
    _gsData = data || [];
    applyGStats();
  } catch(e){
    document.getElementById('gs-tbody').innerHTML = '<tr><td colspan="10" style="text-align:center;padding:20px;color:red">Erreur : '+e.message+'</td></tr>';
  }
}

function setGsPeriod(p){
  const now = new Date();
  const today = now.toISOString().slice(0,10);
  let from='', to='';
  if(p==='day'){
    from=today; to=today;
  } else if(p==='week'){
    const d = new Date(now);
    d.setDate(d.getDate()-d.getDay()+1);
    from=d.toISOString().slice(0,10);
    const d2 = new Date(d); d2.setDate(d2.getDate()+6);
    to=d2.toISOString().slice(0,10);
  } else if(p==='month'){
    from=today.slice(0,7)+'-01';
    to=today;
  } else if(p==='year'){
    from=today.slice(0,4)+'-01-01';
    to=today;
  } else if(p==='all'){
    from=''; to='';
  }
  if(p!=='custom'){
    document.getElementById('gs-date-from').value=from;
    document.getElementById('gs-date-to').value=to;
  }
  document.querySelectorAll('.gs-pbtn').forEach(b=>b.classList.remove('active'));
  const btn = document.getElementById('gspb-'+p);
  if(btn) btn.classList.add('active');
  applyGStats();
}

function applyGStats(){
  const from   = document.getElementById('gs-date-from').value;
  const to     = document.getElementById('gs-date-to').value;
  const statut = document.getElementById('gs-statut').value;
  const nougat = document.getElementById('gs-nougat').value;
  const sort   = document.getElementById('gs-sort').value;

  let filtered = _gsData.filter(p => {
    if(statut && p.statut !== statut) return false;
    if(nougat === '1' && !((p.nb_nougat_offert||0) > 0)) return false;
    if(nougat === '0' && (p.nb_nougat_offert||0) > 0) return false;
    if(p.heure_validation){
      const d = p.heure_validation.slice(0,10);
      if(from && d < from) return false;
      if(to   && d > to)   return false;
    }
    return true;
  });

  filtered.sort((a,b) => {
    if(sort==='date_desc') return new Date(b.heure_validation||0)-new Date(a.heure_validation||0);
    if(sort==='date_asc')  return new Date(a.heure_validation||0)-new Date(b.heure_validation||0);
    if(sort==='lieu_az')   return ((a.lieux?.nom)||'').localeCompare((b.lieux?.nom)||'');
    if(sort==='qty_desc')  return (b.quantite_flyers||0)-(a.quantite_flyers||0);
    return 0;
  });

  const dist    = filtered.filter(p=>p.statut==='distribue');
  const paquets = dist.reduce((s,p)=>s+(p.quantite_flyers||0),0);
  const paquetsChateau = dist.reduce((s,p)=>s+(p.quantite_flyers_chateau||0),0);
  const taux    = filtered.length ? Math.round(dist.length/filtered.length*100)+'%' : '—';
  const nougats = filtered.reduce((s,p)=>s+(p.nb_nougat_offert||0),0);
  const entrees = filtered.reduce((s,p)=>s+(p.entree_gratuite||0),0);
  document.getElementById('gs-total').textContent   = filtered.length;
  document.getElementById('gs-paquets').textContent = paquets;
  document.getElementById('gs-paquets-chateau').textContent = paquetsChateau;
  document.getElementById('gs-taux').textContent    = taux;
  document.getElementById('gs-nougat-count').textContent = nougats;
  document.getElementById('gs-entrees-count').textContent = entrees;

  const colors = {distribue:'#27AE60',ferme:'#E53935',refus:'#E8A020',absent:'#8E24AA'};
  const labels = {distribue:'Fait',ferme:'Fermé',refus:'Refus',absent:'Absent'};

  if(!filtered.length){
    document.getElementById('gs-tbody').innerHTML = '<tr><td colspan="10" style="text-align:center;padding:30px;color:var(--grey)">Aucun résultat</td></tr>';
    return;
  }

  document.getElementById('gs-tbody').innerHTML = filtered.map(p => {
    const l = p.lieux||{};
    const t = p.tournees||{};
    const d = p.heure_validation ? new Date(p.heure_validation) : null;
    const dateStr = d ? d.toLocaleDateString('fr-FR',{day:'2-digit',month:'2-digit',year:'2-digit'}) : '—';
    const nougatQty = p.nb_nougat_offert||0;
    const entreeQty = p.entree_gratuite||0;
    const comment = (p.commentaire_distributeur||'').replace('[Nougat offert]','').trim();
    const col = colors[p.statut]||'#999';
    const lbl = labels[p.statut]||p.statut;
    const qty = p.statut==='distribue' ? (p.quantite_flyers||0)+' pqt'+flyReasonTagG(p.quantite_flyers?null:p.raison_zero_nougaterie) : '—';
    const qtyCh = p.statut==='distribue' ? (p.quantite_flyers_chateau||0)+' pqt'+flyReasonTagG(p.quantite_flyers_chateau?null:p.raison_zero_chateau) : '—';
    return `<tr>
      <td style="font-weight:600">${l.nom||'—'}</td>
      <td style="color:var(--grey);font-size:11px">${l.ville||'—'}</td>
      <td><span style="color:${col};font-weight:bold;font-size:11px">${lbl}</span></td>
      <td style="font-weight:600">${qty}</td>
      <td style="font-weight:600">${qtyCh}</td>
      <td style="text-align:center">${nougatQty>0?'🍬×'+nougatQty:''}</td>
      <td style="text-align:center">${entreeQty>0?'🎟️×'+entreeQty:''}</td>
      <td style="font-size:11px;color:var(--grey)">${dateStr}</td>
      <td style="font-size:11px">${t.distributeur?.nom||'—'}</td>
      <td style="font-size:11px;color:var(--grey);font-style:italic">${comment}</td>
    </tr>`;
  }).join('');
}

// ══════════════════════════════════════════════════════════
//  NOTES TERRAIN
// ══════════════════════════════════════════════════════════
let _notesData = [];

async function loadNotes(){
  document.getElementById('notes-list').innerHTML = '<div style="text-align:center;padding:30px;color:var(--grey)">Chargement…</div>';
  try {
    _notesData = await sbGet('notes_terrain?order=date_creation.desc&limit=200') || [];
    // badge non lues
    const nonLues = _notesData.filter(n=>n.statut==='non_lu').length;
    const badge = document.getElementById('notes-badge');
    if(nonLues > 0){ badge.textContent = nonLues; badge.style.display='inline'; }
    else badge.style.display='none';
    renderNotesList();
  } catch(e){
    document.getElementById('notes-list').innerHTML = '<div style="text-align:center;padding:20px;color:red">Erreur : '+e.message+'</div>';
  }
}

function renderNotesList(){
  const filtre = document.getElementById('notes-filtre')?.value || '';
  const data = filtre ? _notesData.filter(n=>n.statut===filtre) : _notesData;
  if(!data.length){
    document.getElementById('notes-list').innerHTML = '<div style="text-align:center;padding:30px;color:var(--grey)">Aucune note</div>';
    return;
  }
  document.getElementById('notes-list').innerHTML = data.map(n=>{
    const d = new Date(n.date_creation);
    const dateStr = d.toLocaleDateString('fr-FR',{day:'2-digit',month:'2-digit',year:'2-digit'})
      + ' ' + d.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'});
    const isLu = n.statut==='lu';
    return `<div class="card pad" style="margin-bottom:12px;border-left:4px solid ${isLu?'#ccc':'#F5C21A'}">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;gap:8px">
        <div>
          <span style="font-size:12px;font-weight:700">${n.distributeur_nom||'Distributeur'}</span>
          <span style="font-size:11px;color:var(--grey);margin-left:8px">${dateStr}</span>
        </div>
        <div style="display:flex;gap:6px;flex-shrink:0">
          ${!isLu ? `<button onclick="marquerLu(${n.id})" style="font-size:11px;padding:3px 8px;background:#27AE60;color:#fff;border:none;border-radius:6px;cursor:pointer;font-weight:700">✓ Marquer lu</button>` : '<span style="font-size:11px;color:#27AE60;font-weight:700">✓ Lu</span>'}
          <button onclick="supprimerNote(${n.id})" style="font-size:11px;padding:3px 8px;background:#E53935;color:#fff;border:none;border-radius:6px;cursor:pointer">🗑</button>
        </div>
      </div>
      <p style="margin:0;font-size:13px;line-height:1.6;white-space:pre-wrap">${n.texte}</p>
    </div>`;
  }).join('');
}

async function marquerLu(id){
  try {
    await sbPatch('notes_terrain','id=eq.'+id,{statut:'lu'});
    await loadNotes();
  } catch(e){ showToast('Erreur : '+e.message); }
}

async function supprimerNote(id){
  if(!confirm('Supprimer cette note ?')) return;
  try {
    await sbDelete('notes_terrain','id=eq.'+id);
    await loadNotes();
  } catch(e){ showToast('Erreur : '+e.message); }
}

document.querySelectorAll('.modal-overlay').forEach(m=>{
  m.addEventListener('click',e=>{ if(e.target===m) closeModal(m.id); });
});

// ══════════════════════════════════════════════════════════
//  EXPORT STATS
// ══════════════════════════════════════════════════════════
function _getStatsFilteredData() {
  const from = document.getElementById('gs-date-from').value;
  const to   = document.getElementById('gs-date-to').value;
  const stat = document.getElementById('gs-statut').value;
  const ngt  = document.getElementById('gs-nougat').value;
  let data = [...(_gsData||[])];
  if(from) data = data.filter(p=>p.heure_validation && p.heure_validation >= from);
  if(to)   data = data.filter(p=>p.heure_validation && p.heure_validation <= to+'T23:59:59');
  if(stat) data = data.filter(p=>p.statut===stat);
  if(ngt==='1') data = data.filter(p=>(p.nb_nougat_offert||0) > 0);
  if(ngt==='0') data = data.filter(p=>!((p.nb_nougat_offert||0) > 0));
  return data;
}

function _statsFiltersLabel() {
  const from = document.getElementById('gs-date-from').value;
  const to   = document.getElementById('gs-date-to').value;
  const stat = document.getElementById('gs-statut').value;
  const fmt = v => v ? new Date(v).toLocaleDateString('fr-FR',{day:'2-digit',month:'2-digit',year:'numeric'}) : null;
  const period = (from||to) ? [(fmt(from)||'…'),(fmt(to)||'aujourd\'hui')].join(' — ') : 'Toute la période';
  const labels = {distribue:'Fait',ferme:'Fermé',refus:'Refus',absent:'Absent'};
  return { period, statut: stat ? (labels[stat]||stat) : 'Tous' };
}

function exportStatsPDF() {
  const { jsPDF } = window.jspdf;
  if(!jsPDF){ alert('jsPDF non chargé'); return; }
  const filtered = _getStatsFilteredData();
  const { period, statut } = _statsFiltersLabel();
  const now = new Date().toLocaleDateString('fr-FR',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'});

  const doc = new jsPDF({ orientation:'landscape', unit:'mm', format:'a4' });
  const W = doc.internal.pageSize.getWidth();

  // ── HEADER ──
  doc.setFillColor(26,26,26);
  doc.rect(0,0,W,20,'F');
  doc.setFont('helvetica','bold');
  doc.setFontSize(13);
  doc.setTextColor(255,255,255);
  doc.text('La Nougaterie du Pont d\'Arc',10,8);
  doc.setFont('helvetica','normal');
  doc.setFontSize(8);
  doc.setTextColor(212,160,23);
  doc.text('RAPPORT STATISTIQUES',10,14);
  doc.setTextColor(200,200,200);
  doc.setFontSize(8);
  doc.text('Généré le '+now, W-10, 10, {align:'right'});
  doc.text('Export sélection', W-10, 15, {align:'right'});

  // ── META BAND ──
  doc.setFillColor(247,246,242);
  doc.rect(0,20,W,9,'F');
  doc.setTextColor(80,80,80);
  doc.setFontSize(8);
  doc.setFont('helvetica','bold');
  doc.text('Période :', 10, 26);
  doc.setFont('helvetica','normal');
  doc.text(period, 30, 26);
  doc.setFont('helvetica','bold');
  doc.text('Statut :', 100, 26);
  doc.setFont('helvetica','normal');
  doc.text(statut, 116, 26);
  doc.setFont('helvetica','bold');
  doc.text('Résultats :', 160, 26);
  doc.setFont('helvetica','normal');
  doc.text(filtered.length+' visites', 180, 26);

  // ── KPI ROW ──
  const dist = filtered.filter(p=>p.statut==='distribue');
  const paquets = dist.reduce((s,p)=>s+(p.quantite_flyers||0),0);
  const paquetsCh = dist.reduce((s,p)=>s+(p.quantite_flyers_chateau||0),0);
  const taux = filtered.length ? Math.round(dist.length/filtered.length*100)+'%' : '—';
  const nougats = filtered.reduce((s,p)=>s+(p.nb_nougat_offert||0),0);
  const entrees = filtered.reduce((s,p)=>s+(p.entree_gratuite||0),0);

  const kpis = [
    { val: String(filtered.length), lbl: 'Visites totales' },
    { val: taux,                    lbl: 'Taux distribution' },
    { val: String(nougats),         lbl: 'Nougats offerts' },
    { val: String(entrees),         lbl: 'Entrees offertes' },
    { val: String(paquets),         lbl: 'Paquets Nougaterie' },
    { val: String(paquetsCh),       lbl: 'Paquets Chateau' },
  ];
  const kW = (W-20)/6;
  kpis.forEach((k,i) => {
    const x = 10 + i*kW;
    doc.setFillColor(240,240,238);
    doc.roundedRect(x,31,kW-3,14,2,2,'F');
    doc.setFont('helvetica','bold');
    doc.setFontSize(12);
    doc.setTextColor(26,26,26);
    doc.text(k.val, x+(kW-3)/2, 39, {align:'center'});
    doc.setFont('helvetica','normal');
    doc.setFontSize(6.5);
    doc.setTextColor(120,120,120);
    doc.text(k.lbl.toUpperCase(), x+(kW-3)/2, 43, {align:'center'});
  });

  // ── TABLE ──
  const labels = {distribue:'Fait',ferme:'Fermé',refus:'Refus',absent:'Absent'};
  const rows = filtered.map(p => {
    const l = p.lieux||{};
    const t = p.tournees||{};
    const d = p.heure_validation ? new Date(p.heure_validation).toLocaleDateString('fr-FR',{day:'2-digit',month:'2-digit',year:'2-digit'}) : '—';
    const comment = (p.commentaire_distributeur||'').replace('[Nougat offert]','').trim();
    const flyTagG = r => r==='stock_suffisant' ? '(S)' : r==='refuse' ? '(R)' : '';
    const qty   = p.statut==='distribue' ? String(p.quantite_flyers||0)+((p.quantite_flyers||0)===0?flyTagG(p.raison_zero_nougaterie):'') : '—';
    const qtyCh = p.statut==='distribue' ? String(p.quantite_flyers_chateau||0)+((p.quantite_flyers_chateau||0)===0?flyTagG(p.raison_zero_chateau):'') : '—';
    return [
      l.nom||'—', l.ville||'—', labels[p.statut]||p.statut,
      qty, qtyCh, String(p.nb_nougat_offert||0), String(p.entree_gratuite||0),
      d, t.distributeur?.nom||'—', comment
    ];
  });

  const statColors = {distribue:[39,174,96],ferme:[229,57,53],refus:[232,135,10],absent:[142,36,170]};
  doc.autoTable({
    startY: 48,
    head:[['Lieu','Ville','Statut','Ngt Pkts','Cht Pkts','Ngt','Entr.','Date','Distributeur','Commentaire']],
    body: rows,
    styles:{ fontSize:7.5, cellPadding:2.5, font:'helvetica' },
    headStyles:{ fillColor:[26,26,26], textColor:255, fontStyle:'bold', fontSize:7 },
    alternateRowStyles:{ fillColor:[250,250,248] },
    columnStyles:{
      0:{fontStyle:'bold', cellWidth:38},
      1:{cellWidth:22, textColor:[100,100,100]},
      2:{cellWidth:22},
      3:{cellWidth:14, halign:'center'},
      4:{cellWidth:14, halign:'center'},
      5:{cellWidth:10, halign:'center'},
      6:{cellWidth:10, halign:'center'},
      7:{cellWidth:20, textColor:[100,100,100]},
      8:{cellWidth:28},
      9:{textColor:[130,130,130], fontStyle:'italic'},
    },
    didDrawCell(data){
      if(data.section==='body' && data.column.index===2){
        const raw = filtered[data.row.index];
        const col = statColors[raw?.statut];
        if(col){ doc.setTextColor(...col); doc.setFont('helvetica','bold'); doc.text(data.cell.text.join(''), data.cell.x+1, data.cell.y+data.cell.height/2+1); doc.setFont('helvetica','normal'); doc.setTextColor(0,0,0); }
      }
    },
    didDrawPage(data){
      const pg = doc.internal.getCurrentPageInfo().pageNumber;
      const total = '{total_pages_count_string}';
      doc.setFontSize(7); doc.setTextColor(160,160,160);
      doc.text('La Nougaterie du Pont d\'Arc — Usage interne', 10, doc.internal.pageSize.getHeight()-5);
      doc.text('Page '+pg+' / '+doc.internal.getNumberOfPages(), W-10, doc.internal.pageSize.getHeight()-5, {align:'right'});
    }
  });

  doc.setFont('helvetica','normal'); doc.setFontSize(6.5); doc.setTextColor(140,140,140);
  doc.text('(S) stock encore suffisant  ·  (R) refusé par l\'établissement', 10, doc.internal.pageSize.getHeight()-9);
  doc.save('stats_nougaterie_'+new Date().toISOString().slice(0,10)+'.pdf');
}

function exportStatsExcel() {
  const filtered = _getStatsFilteredData();
  const { period, statut } = _statsFiltersLabel();
  const labels = {distribue:'Fait',ferme:'Fermé',refus:'Refus',absent:'Absent'};
  const BOM = '﻿';
  const sep = ';';
  const rows = [
    ['La Nougaterie du Pont d\'Arc — Export Statistiques'],
    ['Période :',period,'Statut :',statut,'Total :',filtered.length+' visites'],
    [],
    ['Lieu','Ville','Statut','Paquets Nougaterie','Paquets Château','Paquets nougat offerts','Entrées gratuites','Date','Distributeur','Commentaire'],
    ...filtered.map(p => {
      const l = p.lieux||{};
      const t = p.tournees||{};
      const d = p.heure_validation ? new Date(p.heure_validation).toLocaleDateString('fr-FR') : '';
      const comment = (p.commentaire_distributeur||'').replace('[Nougat offert]','').trim();
      return [
        l.nom||'', l.ville||'', labels[p.statut]||p.statut,
        p.statut==='distribue' ? (p.quantite_flyers||0)+((p.quantite_flyers||0)===0?(p.raison_zero_nougaterie==='stock_suffisant'?' (stock)':p.raison_zero_nougaterie==='refuse'?' (refuse)':''):'') : '',
        p.statut==='distribue' ? (p.quantite_flyers_chateau||0)+((p.quantite_flyers_chateau||0)===0?(p.raison_zero_chateau==='stock_suffisant'?' (stock)':p.raison_zero_chateau==='refuse'?' (refuse)':''):'') : '',
        p.nb_nougat_offert||0,
        p.entree_gratuite||0,
        d, t.distributeur?.nom||'', comment
      ];
    })
  ];
  const csv = BOM + rows.map(r=>r.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(sep)).join('\r\n');
  const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'stats_nougaterie_'+new Date().toISOString().slice(0,10)+'.csv';
  a.click();
}
