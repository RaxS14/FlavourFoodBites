// --- Shared Admin Notification System ---
const soundNew = new Audio("https://cdn.pixabay.com/download/audio/2022/03/15/audio_13e7d1e8db.mp3?filename=notification-1-126505.mp3");
const soundCancel = new Audio("https://cdn.pixabay.com/download/audio/2022/03/10/audio_4eec3b08db.mp3?filename=negative_beeps-6008.mp3");
soundNew.volume = 1.0;
soundCancel.volume = 1.0;

let lastOrders = JSON.stringify(JSON.parse(localStorage.getItem('orders')) || []);
let knownIds = new Set((JSON.parse(localStorage.getItem('orders')) || []).map(o=>o.id));
let notifiedCancelled = new Set();

function showToast(message, color="#27AE60") {
  let toast = document.getElementById("toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    toast.style.position = "fixed";
    toast.style.bottom = "30px";
    toast.style.right = "30px";
    toast.style.padding = "14px 22px";
    toast.style.background = color;
    toast.style.color = "#fff";
    toast.style.borderRadius = "8px";
    toast.style.zIndex = "9999";
    toast.style.fontFamily = "Poppins, sans-serif";
    toast.style.transition = "opacity 0.3s";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.style.opacity = "1";
  setTimeout(()=>toast.style.opacity="0", 3000);
}

function checkOrders() {
  const orders = JSON.parse(localStorage.getItem('orders')) || [];

  // New order
  orders.forEach(o=>{
    if(!knownIds.has(o.id)){
      knownIds.add(o.id);
      showToast(`🛎️ New Order — #${o.id}`, "#27AE60");
      soundNew.currentTime=0;
      soundNew.play().catch(()=>{});
    }
  });

  // Cancelled order
  orders.forEach(o=>{
    if(o.status==="cancelled" && !notifiedCancelled.has(o.id)){
      notifiedCancelled.add(o.id);
      showToast(`❗ Order #${o.id} cancelled`, "#E74C3C");
      soundCancel.currentTime=0;
      soundCancel.play().catch(()=>{});
    }
  });

  lastOrders = JSON.stringify(orders);
}

// Unlock audio
document.addEventListener('click', ()=>{
  soundNew.play().catch(()=>{});
  soundCancel.play().catch(()=>{});
  soundNew.pause(); soundCancel.pause();
  soundNew.currentTime=0; soundCancel.currentTime=0;
}, { once:true });

// Cross-tab sync
window.addEventListener('storage', e=>{
  if(e.key === 'orders') checkOrders();
});
