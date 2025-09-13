// Menú Familiar v12.7 — App principal

const MF = {
  key: 'mf_state_v127',
  state: null,

  default() {
    const base = {
      people: ['Jose','Carmen','Alex','Paula'],
      days: ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'],
      menu: {},
      supps: {},
      suppList: ['Creatina','Proteína','Magnesio','D3','B12'],
      pricesUpdated: new Date().toISOString().slice(0,10),
      prices: [
        {item:'Pechuga de pollo (kg)', econ:6.49, premium:8.90},
        {item:'Salmón (kg)',          econ:12.99, premium:18.50},
        {item:'Lentejas (kg)',        econ:1.45,  premium:2.10},
        {item:'Brócoli (pieza)',      econ:1.10,  premium:1.40},
        {item:'Boniato (kg)',         econ:1.89,  premium:2.30},
        {item:'Nueces (200g)',        econ:2.20,  premium:3.80},
      ],
      inventory: [
        {name:'Arroz', qty:1000, unit:'g'},
        {name:'Pechuga pollo', qty:1000, unit:'g'},
        {name:'Brócoli', qty:2, unit:'ud'},
        {name:'Boniato', qty:1500, unit:'g'}
      ],
      batch: [
        {task:'Asar boniato', when:'Dom 11:00', use:'Día 5 comida; crema Día 6'},
        {task:'Hornear pollo', when:'Dom 12:00', use:'Quinoa con pollo; crema calabacín c/pollo'}
      ],
    };

    // Relleno inicial de ejemplo (edítalo a tu gusto)
    base.days.forEach(d=>{
      base.menu[d] = {};
      base.supps[d] = {};
      base.people.forEach(p=>{
        base.menu[d][p] = ''; // vacío por defecto
        base.supps[d][p] = {};
        base.suppList.forEach(s=> base.supps[d][p][s] = false);
      });
    });

    // Mini ejemplo (lunes) para que veas algo al cargar
    base.menu['Lun']['Jose']   = 'Tortilla + brócoli · Cena: salmón y boniato';
    base.menu['Lun']['Carmen'] = 'Quinoa con pollo · Cena: crema calabaza';
    base.menu['Lun']['Alex']   = 'Arroz + lentejas · Cena: revuelto calabacín';
    base.menu['Lun']['Paula']  = 'Pasta + pavo · Cena: puré patata + huevo';

    return base;
  },

  load() {
    try {
      const raw = localStorage.getItem(MF.key);
      MF.state = raw ? JSON.parse(raw) : MF.default();
      // Integridad
      MF.state.days.forEach(d=>{
        MF.state.menu[d]  = MF.state.menu[d]  || {};
        MF.state.supps[d] = MF.state.supps[d] || {};
        MF.state.people.forEach(p=>{
          if (!MF.state.menu[d][p]) MF.state.menu[d][p] = '';
          if (!MF.state.supps[d][p]) {
            MF.state.supps[d][p] = {};
            MF.state.suppList.forEach(s=> MF.state.supps[d][p][s] = false);
          }
        });
      });
    } catch(e) {
      console.error(e);
      MF.state = MF.default();
    }
  },

  save(){ localStorage.setItem(MF.key, JSON.stringify(MF.state)); },

  reset(){
    if(confirm('¿Resetear datos y volver al ejemplo?')){
      localStorage.removeItem(MF.key);
      location.reload();
    }
  }
};

// Helpers DOM
function h(t, a={}, ...c){
  const e = document.createElement(t);
  for (const k in a){
    if (k.startsWith('on')) e.addEventListener(k.slice(2), a[k]);
    else if (k==='html') e.innerHTML = a[k];
    else e.setAttribute(k, a[k]);
  }
  c.flat().forEach(n=> e.appendChild(typeof n==='string'? document.createTextNode(n): n));
  return e;
}
function nav(path){ location.hash = path; }

function setActive(route){
  document.querySelectorAll('nav a').forEach(a=>a.classList.remove('active'));
  const id = 'nav-'+(route==='/'?'home':route.replace('/',''));
  const el = document.getElementById(id);
  if (el) el.classList.add('active');
}

function render(){
  MF.load();
  const app = document.getElementById('app');
  app.innerHTML = '';
  const route = location.hash.slice(1) || '/';
  setActive(route);

  if (route==='/') app.appendChild(homeView());
  else if (route==='/menu') app.appendChild(menuView());
  else if (route==='/supps') app.appendChild(suppsView());
  else if (route==='/prices') app.appendChild(pricesView());
  else if (route==='/inventory') app.appendChild(inventoryView());
  else if (route==='/batch') app.appendChild(batchView());
  else app.appendChild(homeView());
}

/* Vistas */
function homeView(){
  return h('div',{},
    h('div',{class:'grid'},
      card('📅','Menú semanal','Editar por persona y día', ()=>nav('/menu')),
      card('💊','Suplementos','Checks diarios', ()=>nav('/supps')),
      card('💶','Precios','Editar y exportar CSV', ()=>nav('/prices')),
      card('📦','Inventario','Regenerar desde menú', ()=>nav('/inventory')),
      card('👩‍🍳','Batch cooking','Agenda de cocciones', ()=>nav('/batch')),
    ),
    h('div',{class:'card'}, h('div',{class:'small'}, 'Precios actualizados: '+MF.state.pricesUpdated))
  );
}
function card(icon,tit,desc,onclick){
  return h('div',{class:'card',onclick},
    h('div',{class:'small'},icon),
    h('h3',{},tit),
    h('div',{class:'small'},desc)
  );
}

function menuView(){
  const wrap = h('div',{class:'card'}, h('h3',{},'Menú semanal'));
  const t = h('table',{class:'table'});
  t.appendChild(h('thead',{}, h('tr',{}, h('th',{},'Día'), ...MF.state.people.map(p=>h('th',{},p)))));
  const tb = h('tbody',{});
  MF.state.days.forEach(d=>{
    const tr = h('tr',{}, h('td',{}, d));
    MF.state.people.forEach(p=>{
      const ta = h('textarea',{}, MF.state.menu[d][p]);
      ta.addEventListener('input', ()=>{ MF.state.menu[d][p]=ta.value; MF.save(); });
      tr.appendChild(h('td',{}, ta));
    });
    tb.appendChild(tr);
  });
  t.appendChild(tb);
  const actions = h('div',{},
    h('button',{class:'btn',onclick:()=>window.print()},'📄 Exportar PDF (B/N)'),
    h('span',{class:'small'},'  Usa “Guardar como PDF” en el diálogo de impresión.')
  );
  wrap.appendChild(t); wrap.appendChild(h('br')); wrap.appendChild(actions);
  return wrap;
}

function suppsView(){
  const wrap = h('div',{class:'card'}, h('h3',{},'Suplementos'));
  const t = h('table',{class:'table'});
  t.appendChild(h('thead',{}, h('tr',{}, h('th',{},'Día/Persona'), ...MF.state.people.map(p=>h('th',{},p)))));
  const tb = h('tbody',{});
  MF.state.days.forEach(d=>{
    const tr = h('tr',{}, h('td',{}, d));
    MF.state.people.forEach(p=>{
      const box = h('div',{});
      MF.state.suppList.forEach(s=>{
        const chk = h('input',{type:'checkbox'});
        chk.checked = !!MF.state.supps[d][p][s];
        chk.addEventListener('change', ()=>{ MF.state.supps[d][p][s]=chk.checked; MF.save(); });
        box.appendChild(h('label',{}, chk, ' ', s, h('br')));
      });
      tr.appendChild(h('td',{}, box));
    });
    tb.appendChild(tr);
  });
  t.appendChild(tb); wrap.appendChild(t);
  return wrap;
}

function pricesView(){
  const wrap = h('div',{class:'card'}, h('h3',{},'Precios'));
  const t = h('table',{class:'table'});
  t.appendChild(h('thead',{}, h('tr',{}, h('th',{},'Producto'), h('th',{},'Económico (€)'), h('th',{},'Premium (€)'))));
  const tb = h('tbody',{});
  MF.state.prices.forEach((r)=>{
    tb.appendChild(h('tr',{},
      h('td',{}, r.item),
      h('td',{}, h('input',{type:'number',step:'0.01',value:r.econ,oninput:e=>{r.econ=parseFloat(e.target.value||0);MF.save();}})),
      h('td',{}, h('input',{type:'number',step:'0.01',value:r.premium,oninput:e=>{r.premium=parseFloat(e.target.value||0);MF.save();}}))
    ));
  });
  t.appendChild(tb);
  const btns = h('div',{},
    h('button',{class:'btn',onclick:exportCSV},'Exportar CSV')
  );
  wrap.appendChild(t); wrap.appendChild(h('br')); wrap.appendChild(btns);
  return wrap;
}
function exportCSV(){
  const rows = [['Producto','Económico','Premium'], ...MF.state.prices.map(p=>[p.item,p.econ,p.premium])];
  const csv = rows.map(r=>r.join(';')).join('\n');
  const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'precios.csv';
  a.click();
}

function inventoryView(){
  const wrap = h('div',{class:'card'}, h('h3',{},'Inventario'));
  const t = h('table',{class:'table'});
  t.appendChild(h('thead',{}, h('tr',{}, h('th',{},'Producto'), h('th',{},'Cantidad'), h('th',{},'Unidad'), h('th',{},'Acciones'))));
  const tb = h('tbody',{});
  MF.state.inventory.forEach((it,idx)=>{
    tb.appendChild(h('tr',{},
      h('td',{}, h('input',{type:'text', value:it.name, oninput:e=>{it.name=e.target.value; MF.save();}})),
      h('td',{}, h('input',{type:'number', step:'0.01', value:it.qty, oninput:e=>{it.qty=parseFloat(e.target.value||0); MF.save();}})),
      h('td',{}, h('input',{type:'text', value:it.unit, oninput:e=>{it.unit=e.target.value; MF.save();}})),
      h('td',{}, h('button',{class:'btn',onclick:()=>{ MF.state.inventory.splice(idx,1); MF.save(); render(); }},'Eliminar'))
    ));
  });
  t.appendChild(tb);
  const add  = h('button',{class:'btn',onclick:()=>{ MF.state.inventory.push({name:'Nuevo',qty:0,unit:'ud'}); MF.save(); render(); }},'Añadir');
  const regen = h('button',{class:'btn',onclick:regenFromMenu},'Regenerar desde menú');
  wrap.appendChild(t); wrap.appendChild(h('br')); wrap.appendChild(h('div',{}, add, ' ', regen));
  return wrap;
}
function regenFromMenu(){
  const factors = [
    {k:'pollo',   item:'Pechuga pollo', qty:200, unit:'g'},
    {k:'salmón',  item:'Salmón',        qty:180, unit:'g'},
    {k:'brócoli', item:'Brócoli',       qty:0.5, unit:'ud'}, // 1 ud para 2 personas
    {k:'boniato', item:'Boniato',       qty:200, unit:'g'},
    {k:'lenteja', item:'Lentejas',      qty:80,  unit:'g'},
    {k:'nuez',    item:'Nueces',        qty:20,  unit:'g'},
  ];
  const need = {};
  MF.state.days.forEach(d=>{
    MF.state.people.forEach(p=>{
      const text = (MF.state.menu[d][p]||'').toLowerCase();
      factors.forEach(f=>{
        if (text.includes(f.k)){
          const key = f.item+'|'+f.unit;
          need[key] = (need[key]||0) + f.qty;
        }
      });
    });
  });
  for (const key in need){
    const [name,unit] = key.split('|');
    const idx = MF.state.inventory.findIndex(x=>x.name===name && x.unit===unit);
    if (idx>=0) MF.state.inventory[idx].qty += need[key];
    else MF.state.inventory.push({name, qty:need[key], unit});
  }
  MF.save();
  alert('Inventario regenerado desde el menú (estimación).');
  render();
}

function batchView(){
  const wrap = h('div',{class:'card'}, h('h3',{},'Batch cooking'));
  const t = h('table',{class:'table'});
  t.appendChild(h('thead',{}, h('tr',{}, h('th',{},'Tarea'), h('th',{},'Cuándo'), h('th',{},'Se usa en'), h('th',{},'Acciones'))));
  const tb = h('tbody',{});
  MF.state.batch.forEach((b,idx)=>{
    tb.appendChild(h('tr',{},
      h('td',{}, h('input',{type:'text', value:b.task, oninput:e=>{ b.task=e.target.value; MF.save(); }})),
      h('td',{}, h('input',{type:'text', value:b.when, oninput:e=>{ b.when=e.target.value; MF.save(); }})),
      h('td',{}, h('input',{type:'text', value:b.use,  oninput:e=>{ b.use=e.target.value;  MF.save(); }})),
      h('td',{}, h('button',{class:'btn',onclick:()=>{ MF.state.batch.splice(idx,1); MF.save(); render(); }},'Eliminar'))
    ));
  });
  t.appendChild(tb);
  const add = h('button',{class:'btn',onclick:()=>{ MF.state.batch.push({task:'Nueva tarea',when:'',use:''}); MF.save(); render(); }},'Añadir');
  wrap.appendChild(t); wrap.appendChild(h('br')); wrap.appendChild(add);
  return wrap;
}

/* Router */
window.addEventListener('load', render);
window.addEventListener('hashchange', render);
