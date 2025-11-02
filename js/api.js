// SimpleBOS API client
(function(global){
  const API = {};
  let API_BASE = localStorage.getItem('SIMPLEBOS_API_BASE') || 'http://localhost:5175';
  API.setBase = function(url){ API_BASE = url.replace(/\/+$/,''); try{ localStorage.setItem('SIMPLEBOS_API_BASE', API_BASE); }catch(e){} };
  API.getBase = function(){ return API_BASE; };
  async function fetchJSON(path, opts = {}){
    const resp = await fetch(API_BASE + path, {
      method: opts.method || 'GET',
      headers: { 'Content-Type': 'application/json', ...(opts.headers||{}) },
      body: opts.body ? JSON.stringify(opts.body) : undefined,
    });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}: ` + await resp.text());
    return resp.json();
  }
  API.health    = () => fetchJSON('/health');
  API.loadMonth = (ym) => fetchJSON(`/data/${encodeURIComponent(ym)}`);
  API.saveMonth = (payload) => fetchJSON('/data', { method:'POST', body: payload });
  API.getLists  = () => fetchJSON('/lists');
  API.saveLists = (payload) => fetchJSON('/lists', { method:'POST', body: payload });
  global.SimpleBOS_API = API;
})(window);
