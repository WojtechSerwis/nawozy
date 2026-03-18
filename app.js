const tanks = { t1: 240, t2: 130, t3: 72, t4: 26 };
const effectiveVolumes = { t1: 200, t2: 110, t3: 60, t4: 20 };

function dose(target, current, strength, volume){
    let diff = target - current;
    if(diff <= 0) return 0;
    return (diff * volume) / (strength * 10);
}

function updateParamColors(id){
    const tno3 = parseFloat(document.getElementById(`tno3_${id}`).value);
    const tpo4 = parseFloat(document.getElementById(`tpo4_${id}`).value);
    const tk = parseFloat(document.getElementById(`tk_${id}`).value);
    const tfe = parseFloat(document.getElementById(`tfe_${id}`).value);

    const inputs = [
        {el: `no3_${id}`, target: tno3},
        {el: `po4_${id}`, target: tpo4},
        {el: `k_${id}`, target: tk},
        {el: `fe_${id}`, target: tfe}
    ];

    inputs.forEach(i => {
        const val = parseFloat(document.getElementById(i.el).value) || 0;
        const inpEl = document.getElementById(i.el);
        inpEl.classList.remove('low','correct','high','warning');
        if(val < i.target*0.95) inpEl.classList.add('low');
        else if(val > i.target*1.1) inpEl.classList.add('high');
        else inpEl.classList.add('correct');
        if(i.el === `fe_${id}` && val > 1) inpEl.classList.add('warning');
        if(i.el === `k_${id}` && val > 50) inpEl.classList.add('warning');
    });
}

function calc(id){
    const v = effectiveVolumes[id];
    let no3 = parseFloat(document.getElementById(`no3_${id}`).value) || 0;
    let po4 = parseFloat(document.getElementById(`po4_${id}`).value) || 0;
    let k = parseFloat(document.getElementById(`k_${id}`).value) || 0;
    let fe = parseFloat(document.getElementById(`fe_${id}`).value) || 0;

    let wc = parseFloat(document.getElementById(`wc_${id}`).value) || 0;
    let fraction = (v - wc)/v;
    no3 *= fraction;
    po4 *= fraction;
    k *= fraction;
    fe *= fraction;

    const sno3 = parseFloat(document.getElementById(`sno3_${id}`).value);
    const spo4 = parseFloat(document.getElementById(`spo4_${id}`).value);
    const sk = parseFloat(document.getElementById(`sk_${id}`).value);
    const sfe = parseFloat(document.getElementById(`sfe_${id}`).value);

    const tno3 = parseFloat(document.getElementById(`tno3_${id}`).value);
    const tpo4 = parseFloat(document.getElementById(`tpo4_${id}`).value);
    const tk_target = parseFloat(document.getElementById(`tk_${id}`).value);
    const tfe_target = parseFloat(document.getElementById(`tfe_${id}`).value);

    let w_no3 = dose(tno3, no3, sno3, v);
    let w_po4 = dose(tpo4, po4, spo4, v);
    let w_k = dose(tk_target, k, sk, v);
    let w_fe = dose(tfe_target, fe, sfe, v);
    let micro = 8 * v / 100;

    let outHTML = `<table>`;
    outHTML += `<tr><td>Dawkowanie dzienne:</td><td></td></tr>`;
    outHTML += `<tr><td>🧪 NO3:</td><td>${(w_no3/7).toFixed(2)} ml</td></tr>`;
    outHTML += `<tr><td>💧 PO4:</td><td>${(w_po4/7).toFixed(2)} ml</td></tr>`;
    outHTML += `<tr><td>🌿 K:</td><td>${(w_k/7).toFixed(2)} ml</td></tr>`;
    outHTML += `<tr><td>🔩 Fe:</td><td>${(w_fe/7).toFixed(2)} ml</td></tr>`;
    outHTML += `<tr><td>💊 AF Micro:</td><td>${micro.toFixed(2)} kropli</td></tr>`;
    outHTML += `</table>`;

    document.getElementById(`out_${id}`).innerHTML = outHTML;

    let history = JSON.parse(localStorage.getItem(id+'_history') || '[]');
    history.push({no3:no3, po4:po4, k:k, fe:fe});
    if(history.length>30) history.shift();
    localStorage.setItem(id+'_history', JSON.stringify(history));

    let histHTML = '<b>Historia 30 dni:</b><br>';
    history.forEach(h=>{
        histHTML += `NO3:${h.no3} PO4:${h.po4} K:${h.k} Fe:${h.fe}<br>`;
    });
    document.getElementById(`history_${id}`).innerHTML = histHTML;
    updateParamColors(id);
}

function clearResults(id){
    ['no3','po4','k','fe'].forEach(p => document.getElementById(`${p}_${id}`).value = '');
    updateParamColors(id);
    document.getElementById(`out_${id}`).innerHTML = '';
}

function clearHistory(id){
    localStorage.removeItem(id+'_history');
    document.getElementById(`history_${id}`).innerHTML = '<b>Historia 30 dni:</b><br>';
}

function showTab(id){
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

function createTankUI(id, volume){
    document.getElementById(id).innerHTML = `
    <h3>${volume}L</h3>

    <div class="box">
    <table>
      <tr><td>Podmiana:</td><td><input id="wc_${id}" type="number"> L</td></tr>
    </table>
    </div>

    <div class="box">
    <b>Parametry</b><br>
    <p style="font-size:12px;color:#aaa;">Wprowadź parametry przed podmianą wody</p>
    <table>
      <tr><td>🧪 NO3:</td><td><input id="no3_${id}" type="number" oninput="updateParamColors('${id}')"> mg/l</td></tr>
      <tr><td>💧 PO4:</td><td><input id="po4_${id}" type="number" oninput="updateParamColors('${id}')"> mg/l</td></tr>
      <tr><td>🌿 K:</td><td><input id="k_${id}" type="number" oninput="updateParamColors('${id}')"> mg/l</td></tr>
      <tr><td>🔩 Fe:</td><td><input id="fe_${id}" type="number" oninput="updateParamColors('${id}')"> mg/l</td></tr>
    </table>
    <button onclick="clearResults('${id}')">Wyczyść parametry</button>
    </div>

    <div class="box">
    <b>Moc nawozów</b>
    <p style="font-size:12px;color:#aaa;">Wartości dla 10ml nawozu na 100L wody (mg/l)</p>
    <table>
      <tr><td>🧪 AF N Boost:</td><td><input id="sno3_${id}" value="9.5"> mg/l</td></tr>
      <tr><td>💧 AF PO4 Boost:</td><td><input id="spo4_${id}" value="0.4"> mg/l</td></tr>
      <tr><td>🌿 AF K Boost:</td><td><input id="sk_${id}" value="5"> mg/l</td></tr>
      <tr><td>🔩 AF Iron Boost:</td><td><input id="sfe_${id}" value="0.4"> mg/l</td></tr>
      <tr><td>💊 AF Micro:</td><td>8 kropli/dzień</td></tr>
    </table>
    </div>

    <div class="box">
    <b>Docelowe</b>
    <table>
      <tr><td>🧪 NO3:</td><td><input id="tno3_${id}" value="10"> mg/l</td></tr>
      <tr><td>💧 PO4:</td><td><input id="tpo4_${id}" value="1"> mg/l</td></tr>
      <tr><td>🌿 K:</td><td><input id="tk_${id}" value="20"> mg/l</td></tr>
      <tr><td>🔩 Fe:</td><td><input id="tfe_${id}" value="0.4"> mg/l</td></tr>
    </table>
    </div>

    <button onclick="calc('${id}')">Oblicz</button>
    <button onclick="clearHistory('${id}')">Wyczyść historię</button>

    <div class="result" id="out_${id}"></div>
    <div class="history-box" id="history_${id}"><b>Historia 30 dni:</b><br></div>
    `;
}

Object.keys(tanks).forEach(id => createTankUI(id, tanks[id]));