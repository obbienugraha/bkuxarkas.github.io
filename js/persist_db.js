// SIMPLEBOS DB Persistence (ONLY Data Tersimpan per-bulan + row state)
(function(){
  // HANYA menyimpan & memulihkan Data Tersimpan (bukan RKAS)
  var SAVED_BODIES = ['#savedTable tbody', '#dataTersimpan tbody', '#data-tersimpan tbody', '#savedData tbody', '#tDataTersimpan tbody'];
  var RKAS_MONTH_CONTROLS = ['#bulan','#filterBulan','select[name="bulan"]','.filter-bulan','#tahun','#filterTahun','select[name="tahun"]','.filter-tahun'];

  function qFirst(list){ for (var i=0;i<list.length;i++){ var el=document.querySelector(list[i]); if(el) return el; } return null; }
  function getSavedBody(){ return qFirst(SAVED_BODIES); }
  function throttle(fn,ms){ var to=null; return function(){ clearTimeout(to); to=setTimeout(fn,ms); }; }

  // ====== Penentu bulan dari kontrol RKAS ======
  var MONTHS={'JANUARI':1,'JAN':1,'JANUARY':1,'FEBRUARI':2,'FEB':2,'FEBRUARY':2,'MARET':3,'MAR':3,'MARCH':3,'APRIL':4,'APR':4,'MEI':5,'MAY':5,'JUNI':6,'JUN':6,'JUNE':6,'JULI':7,'JUL':7,'JULY':7,'AGUSTUS':8,'AGS':8,'AGT':8,'AUG':8,'AUGUST':8,'SEPTEMBER':9,'SEP':9,'SEPT':9,'OKTOBER':10,'OKT':10,'OCT':10,'OCTOBER':10,'NOVEMBER':11,'NOV':11,'DESEMBER':12,'DES':12,'DEC':12,'DECEMBER':12};
  function pad2(n){ return (n<10?'0'+n:''+n); }
  function readText(el){ if(!el) return ''; if('value' in el) return String(el.value||'').trim(); return String(el.textContent||'').trim(); }
  function getSelectedMonthYear(){
    var monthEl = qFirst(['#bulan', '#filterBulan', 'select[name="bulan"]', '.filter-bulan']);
    var yearEl  = qFirst(['#tahun', '#filterTahun', 'select[name="tahun"]', '.filter-tahun']);
    var mTxt=readText(monthEl).toUpperCase(); var yTxt=readText(yearEl);
    var now=new Date(); var year=parseInt(yTxt,10); if(!year||isNaN(year)) year=now.getFullYear();
    var mNum=MONTHS[mTxt]; if(!mNum && mTxt){ var mInt=parseInt(mTxt,10); if(!isNaN(mInt)&&mInt>=1&&mInt<=12) mNum=mInt; }
    if(!mNum) mNum=now.getMonth()+1;
    return year+'-'+pad2(mNum);
  }

  // ====== Row-key & state (apple-switch + highlight) ======
  function textNorm(s){ return String(s||'').replace(/\s+/g,' ').trim(); }
  function rowKey(tr){
    if (!tr) return null;
    var id = tr.getAttribute('data-id') || tr.getAttribute('id') || tr.getAttribute('data-rowid');
    if (id) return 'id:'+id;
    var tds = tr.querySelectorAll('td'), join='';
    for (var i=0;i<tds.length;i++){ join += '|'+ textNorm(tds[i].textContent); }
    // hash
    var h=0; for (var i=0;i<join.length;i++){ h=((h<<5)-h)+join.charCodeAt(i); h|=0; }
    return 'tx:' + ((h>>>0).toString(36));
  }
  function isSwitchOn(tr){
    if (tr.getAttribute('data-appleswitch')==='1') return true;
    if (tr.classList.contains('appleswitched')) return true;
    var sw = tr.querySelector('.apple-switch, .switch, .toggle');
    if (sw && (sw.classList.contains('active')||sw.classList.contains('is-active')||sw.classList.contains('--switch-active'))) return true;
    var cb = tr.querySelector('input[type="checkbox"]');
    return !!(cb && cb.checked);
  }
  function setSwitch(tr, on){
    tr.setAttribute('data-appleswitch', on?'1':'0');
    tr.classList.toggle('appleswitched', on);
    var sw = tr.querySelector('.apple-switch, .switch, .toggle');
    if (sw){
      sw.classList.toggle('active', on);
      sw.classList.toggle('is-active', on);
      sw.classList.toggle('--switch-active', on);
      try{ sw.setAttribute('aria-checked', on?'true':'false'); }catch(e){}
      var cb = sw.matches('input[type="checkbox"]') ? sw : sw.querySelector('input[type="checkbox"]');
      if (cb) cb.checked = !!on;
    }
  }
  function isHL(tr){ return tr.classList.contains('highlight') || tr.classList.contains('highlight-red') || tr.classList.contains('row-highlight'); }
  function setHL(tr, on){
    tr.classList.toggle('highlight', on);
    tr.classList.toggle('highlight-red', on);
    tr.classList.toggle('row-highlight', on);
  }
  function extractStateMapSaved(){
    var tbody = getSavedBody(); var map={}; if(!tbody) return map;
    tbody.querySelectorAll('tr').forEach(tr => {
      var k=rowKey(tr); if(!k) return;
      map[k] = { sw: isSwitchOn(tr)?1:0, hl: isHL(tr)?1:0 };
    });
    return map;
  }
  function applyStateMapSaved(map){
    var tbody = getSavedBody(); if(!tbody||!map) return;
    tbody.querySelectorAll('tr').forEach(tr=>{
      var k=rowKey(tr); if(!k||!map[k]) return;
      setSwitch(tr, !!map[k].sw);
      setHL(tr, !!map[k].hl);
    });
  }

  // ====== LIST (Nama Pegawai & Belanja) global ======
  function readOptions(sel){ if(!sel) return []; var out=[]; for(var i=0;i<sel.options.length;i++){ var v=sel.options[i].value; if(v){ var up=v.toUpperCase(); if(out.indexOf(up)===-1) out.push(up);} } return out; }
  function writeOptions(sel,list){ if(!sel||!Array.isArray(list)) return; var place=sel.querySelector('option[value=""]'); sel.innerHTML=''; if(place) sel.appendChild(place); list.forEach(v=>{ var o=document.createElement('option'); o.value=v; o.textContent=v; sel.appendChild(o); }); }
  function captureLists(){
    var peg=[...readOptions(document.getElementById('namaPegawai')), ...readOptions(document.getElementById('editNamaPegawai'))];
    var bel=[...readOptions(document.getElementById('belanja')), ...readOptions(document.getElementById('editBelanja'))];
    peg = Array.from(new Set(peg.map(s=>String(s||'').toUpperCase()).filter(Boolean)));
    bel = Array.from(new Set(bel.map(s=>String(s||'').toUpperCase()).filter(Boolean)));
    return { pegawai: peg, belanja: bel };
  }
  function applyLists(obj){
    var peg = (obj&&obj.pegawai)||[], bel = (obj&&obj.belanja)||[];
    writeOptions(document.getElementById('namaPegawai'), peg);
    writeOptions(document.getElementById('editNamaPegawai'), peg);
    writeOptions(document.getElementById('belanja'), bel);
    writeOptions(document.getElementById('editBelanja'), bel);
  }

  // ====== API helper ======
  function saveSavedToDB(reason){
    var ym = getSelectedMonthYear();
    var tbody = getSavedBody();
    var payload = {
      ym,
      rkas_html: null,
      rkas_state: "{}",
      saved_html:  tbody ? tbody.innerHTML : null,
      saved_state: JSON.stringify(extractStateMapSaved() || {})
    };
    return window.SimpleBOS_API.saveMonth(payload).catch(e=>console.warn('[SimpleBOS] saveMonth(saved-only) failed:', e));
  }
  async function loadSavedFromDB(){
    var ym = getSelectedMonthYear();
    var tbody = getSavedBody();
    try{
      const d = await window.SimpleBOS_API.loadMonth(ym);
      if (tbody){
        if (d && d.saved_html){
          tbody.innerHTML = d.saved_html;
          applyStateMapSaved(JSON.parse(d.saved_state||'{}'));
        } else {
          tbody.innerHTML = '';
        }
      }
    }catch(e){
      console.warn('[SimpleBOS] loadMonth(saved-only) failed:', e);
    }
    try{
      applyLists(await window.SimpleBOS_API.getLists());
    }catch(e){
      console.warn('[SimpleBOS] getLists failed:', e);
    }
  }

  // ====== Hooks ======
  function hookButtons(){
    var ids=['simpanBtn','editSave','hapusBtn','deleteBtn','transferBtn','gabungkanBtn','subUraianSaveBtn'];
    document.addEventListener('click', function(e){
      var t=e.target; if(!t) return;
      var isMatch = ids.some(id => t.id===id || (t.closest && t.closest('#'+id)));
      if (!isMatch) return;
      setTimeout(()=>saveSavedToDB('btn:'+(t.id||'')), 60);
    }, true);
  }
  function hookSwitches(){
    document.addEventListener('click', function(e){
      var sw = e.target && e.target.closest && e.target.closest('.apple-switch, .switch, .toggle');
      if (!sw) return;
      var tr = sw.closest('tr'); if (!tr) return;
      var tbody = getSavedBody();
      if (!tbody || !tbody.contains(tr)) return; // hanya Data Tersimpan
      var next = !(tr.getAttribute('data-appleswitch')==='1' || tr.classList.contains('appleswitched'));
      setSwitch(tr, next);
      setHL(tr, next);
      setTimeout(()=>saveSavedToDB('switch'), 20);
    }, true);
  }
  function attachObserverSaved(){
    var tbody = getSavedBody(); if (!tbody) return;
    var saver = throttle(()=>saveSavedToDB('mutation'), 150);
    try{ new MutationObserver(saver).observe(tbody, {childList:true,subtree:true,attributes:true,characterData:true}); }catch(e){}
  }
  function hookMonthChangeFromRKAS(){
    RKAS_MONTH_CONTROLS.forEach(sel=>{
      var el=document.querySelector(sel); if(!el) return;
      el.addEventListener('change', ()=>setTimeout(loadSavedFromDB, 100));
    });
  }

  document.addEventListener('DOMContentLoaded', function(){
    if (!window.SimpleBOS_API){ console.error('SimpleBOS_API tidak ditemukan. Sertakan js/api.js terlebih dahulu.'); return; }
    loadSavedFromDB();
    setTimeout(loadSavedFromDB, 240);
    setTimeout(loadSavedFromDB, 600);

    hookButtons();
    hookSwitches();
    attachObserverSaved();
    hookMonthChangeFromRKAS();
    setInterval(()=>saveSavedToDB('interval'), 3000);
  });
})();
