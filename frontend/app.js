// ============================================================
//  app.js — CyberGrid XAMPP IoT Dashboard
//  Change API_URL to match your XAMPP setup
// ============================================================

const API_URL = "http://localhost:8080/iotdashboardxampp/api/sensors.php";

const DEMO_DATA = {
  temperature:27.4,humidity:62,gas_level:320,
  motion:"Detected",light:480,pressure:1013.2,
  motion_log:[
    {time:"08:12",status:"Detected"},{time:"08:45",status:"Clear"},
    {time:"09:30",status:"Detected"},{time:"10:05",status:"Clear"},
    {time:"11:20",status:"Detected"}
  ],
  history:{
    labels:["08:00","09:00","10:00","11:00","12:00","13:00"],
    temperature:[25.1,26.3,27.4,28.0,27.8,27.4],
    humidity:[65,63,62,60,61,62],
    gas:[280,300,320,310,295,320]
  }
};

let tempHumChart=null, gasChart=null;

window.addEventListener("DOMContentLoaded",()=>{
  startClock();
  initCharts();
  fetchFromAPI();
});

function startClock(){
  function tick(){
    const now=new Date();
    document.getElementById("clock").textContent=now.toTimeString().slice(0,8);
    document.getElementById("dateDisplay").textContent=now.toDateString().slice(4);
  }
  tick();setInterval(tick,1000);
}

async function fetchFromAPI(){
  try{
    const response=await fetch(API_URL);
    if(!response.ok)throw new Error("HTTP "+response.status);
    const data=await response.json();
    if(data.error)throw new Error(data.error);
    renderDashboard(data);
    document.getElementById("statusDot").className="status-dot online";
    document.getElementById("statusText").textContent="ONLINE";
  }catch(err){
    console.warn("API error, using demo data:",err.message);
    renderDashboard(DEMO_DATA);
    document.getElementById("statusDot").className="status-dot";
    document.getElementById("statusText").textContent="DEMO MODE";
  }
}

function renderDashboard(d){
  setEl("temp",d.temperature);setEl("humidity",d.humidity);
  setEl("gas",d.gas_level);setEl("light",d.light);
  setEl("pressure",d.pressure);setEl("motion",d.motion||"--");
  const mc=document.getElementById("cardMotion");
  if(mc){const det=String(d.motion).toLowerCase()==="detected";mc.className="card card--motion "+(det?"detected":"clear");}
  setBadge("tempBadge",d.temperature,18,30);setBadge("humBadge",d.humidity,30,80);
  setBadge("gasBadge",d.gas_level,0,500);setMotionBadge("motionBadge",d.motion);
  setBadge("lightBadge",d.light,100,800);setBadge("pressureBadge",d.pressure,980,1040);
  setBar("tempBar",d.temperature,0,50);setBar("humBar",d.humidity,0,100);
  setBar("gasBar",d.gas_level,0,1000);setBar("lightBar",d.light,0,1000);
  setBar("pressureBar",d.pressure,900,1100);
  setGauge("gTemp","gTempVal",d.temperature,0,50,d.temperature+"°C");
  setGauge("gHum","gHumVal",d.humidity,0,100,d.humidity+"%");
  setGauge("gGas","gGasVal",d.gas_level,0,1000,d.gas_level+" ppm");
  setGauge("gLight","gLightVal",d.light,0,1000,d.light+" lux");
  setGauge("gPressure","gPressureVal",d.pressure,900,1100,d.pressure+" hPa");
  if(d.history){updateTempHumChart(d.history);updateGasChart(d.history);}
  if(d.motion_log){renderMotionLog(d.motion_log);}
}

function setEl(id,v){const e=document.getElementById(id);if(e)e.textContent=v!==undefined?v:"--";}
function setBadge(id,v,min,max){
  const e=document.getElementById(id);if(!e)return;
  const n=parseFloat(v);
  if(n>max){e.textContent="HIGH";e.className="card-status warn";}
  else if(n<min){e.textContent="LOW";e.className="card-status warn";}
  else{e.textContent="NORMAL";e.className="card-status ok";}
}
function setMotionBadge(id,v){
  const e=document.getElementById(id);if(!e)return;
  const det=String(v).toLowerCase()==="detected";
  e.textContent=det?"ALERT":"IDLE";e.className=det?"card-status crit":"card-status ok";
}
function setBar(id,v,min,max){
  const e=document.getElementById(id);if(!e)return;
  e.style.width=Math.min(100,Math.max(0,((v-min)/(max-min))*100))+"%";
}
function setGauge(barId,valId,v,min,max,label){
  const b=document.getElementById(barId),l=document.getElementById(valId);
  if(b)b.style.width=Math.min(100,Math.max(0,((v-min)/(max-min))*100))+"%";
  if(l)l.textContent=label;
}
function initCharts(){
  const opts={responsive:true,plugins:{legend:{labels:{color:"#235c40",font:{family:"'Share Tech Mono'",size:10}}}},scales:{x:{ticks:{color:"#1a4030",font:{family:"'Share Tech Mono'",size:9}},grid:{color:"rgba(0,255,136,0.04)"}},y:{ticks:{color:"#1a4030",font:{family:"'Share Tech Mono'",size:9}},grid:{color:"rgba(0,255,136,0.04)"}}}};
  tempHumChart=new Chart(document.getElementById("tempHumChart").getContext("2d"),{type:"line",data:{labels:[],datasets:[{label:"TEMP °C",data:[],borderColor:"#00ff88",backgroundColor:"rgba(0,255,136,0.06)",borderWidth:2,tension:.4,fill:true,pointBackgroundColor:"#00ff88",pointRadius:3},{label:"HUM %",data:[],borderColor:"#00ccff",backgroundColor:"rgba(0,204,255,0.05)",borderWidth:2,tension:.4,fill:true,pointBackgroundColor:"#00ccff",pointRadius:3}]},options:opts});
  gasChart=new Chart(document.getElementById("gasChart").getContext("2d"),{type:"bar",data:{labels:[],datasets:[{label:"GAS ppm",data:[],backgroundColor:"rgba(255,204,0,0.35)",borderColor:"#ffcc00",borderWidth:2,borderRadius:2}]},options:opts});
}
function updateTempHumChart(h){tempHumChart.data.labels=h.labels;tempHumChart.data.datasets[0].data=h.temperature;tempHumChart.data.datasets[1].data=h.humidity;tempHumChart.update();}
function updateGasChart(h){gasChart.data.labels=h.labels;gasChart.data.datasets[0].data=h.gas;gasChart.update();}
function renderMotionLog(log){
  const c=document.getElementById("motionLog");c.innerHTML="";
  [...log].slice(-5).reverse().forEach(e=>{
    const det=String(e.status).toLowerCase()==="detected";
    const div=document.createElement("div");
    div.className="motion-entry "+(det?"detected":"clear");
    div.innerHTML=`<span class="entry-dot"></span><span class="entry-time">${e.time}</span><span class="entry-msg">${det?"⚠ MOTION DETECTED":"✓ AREA CLEAR"}</span>`;
    c.appendChild(div);
  });
}
