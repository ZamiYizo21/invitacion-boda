// --- PEGA AQUÍ LA URL DE TU WEB APP DE GOOGLE APPS SCRIPT ---
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbx6qTuO7fnaLUbRFmkV0ZFYsqrZ2iESU6jB1Y9_yaP0OfZ4HIDn_FhJI9v98surIH1mJA/exec";

// 🔑 CÓDIGO SECRETO DE ADMINISTRADOR (Para ver el panel de novios)
const ADMIN_SECRET_CODE = "ADMIN-BODA"; 

let audioPlayer = null;
let isPlaying = false;
let currentGuestData = { name: "Invitado", passes: 2 };

// --- INICIALIZACIÓN ---
document.addEventListener('DOMContentLoaded', () => {
  audioPlayer = document.getElementById('wedding-audio');
  setupCountdown();
  setupEventListeners();
  setupAccessCodeLogic();
  setupGeneratorLogic();
  cargarCanciones();
});

// --- FUNCIÓN GLOBAL DE AUDIO ---
function updateAudioIcon() {
  const icon = document.getElementById('audio-icon');
  if (!icon) return;
  if (isPlaying) {
    icon.className = "fa-solid fa-compact-disc spin-slow";
  } else {
    icon.className = "fa-solid fa-circle-pause";
  }
}

// Función para reproducir el audio de forma segura
function playAudio() {
  if (audioPlayer) {
    audioPlayer.play().then(() => {
      isPlaying = true;
      updateAudioIcon();
    }).catch(error => {
      console.log("El navegador bloqueó la reproducción automática hasta una interacción:", error);
      isPlaying = false;
      updateAudioIcon();
    });
  }
}

// --- LÓGICA DE VALIDACIÓN DE CÓDIGO ---
function setupAccessCodeLogic() {
  const urlParams = new URLSearchParams(window.location.search);
  const urlCode = urlParams.get('codigo');

  if (urlCode) {
    document.getElementById('access-code-input').value = urlCode;
    verifyCodeInSheet(urlCode.toUpperCase());
  }

  document.getElementById('btn-verify-code').addEventListener('click', () => {
    const inputCode = document.getElementById('access-code-input').value.trim().toUpperCase();
    if (inputCode) {
      if (inputCode === ADMIN_SECRET_CODE) {
        unlockAdminPanel();
      } else {
        verifyCodeInSheet(inputCode);
      }
    }
  });

  document.getElementById('access-code-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      document.getElementById('btn-verify-code').click();
    }
  });
}

// Desbloquear vista de Administrador
function unlockAdminPanel() {
  currentGuestData = { name: "Administrador (Novios)", passes: 10 };
  
  document.getElementById('nav-toggle-btn').classList.remove('hidden');
  
  const welcomeScreen = document.getElementById('welcome-screen');
  welcomeScreen.classList.add('opacity-0');
  setTimeout(() => {
    welcomeScreen.style.display = 'none';
    document.getElementById('audio-controls').classList.remove('hidden');
  }, 1000);

  playAudio();
  cargarCanciones();
  alert("¡Bienvenido al panel de administración, novios!");
}

function verifyCodeInSheet(code) {
  const errorMsg = document.getElementById('error-msg');
  errorMsg.classList.add('hidden');
  
  document.getElementById('btn-verify-code').innerText = "Verificando...";

  fetch(`${GOOGLE_SCRIPT_URL}?action=validar&codigo=${code}`)
    .then(response => response.json())
    .then(data => {
      document.getElementById('btn-verify-code').innerHTML = `<i class="fa-solid fa-key"></i> <span>Ingresar a la Invitación</span>`;
      
      if (data.status === "success") {
        unlockInvitation({
          name: data.name,
          passes: parseInt(data.passes)
        });
      } else {
        errorMsg.innerText = "Código incorrecto o no encontrado en el registro.";
        errorMsg.classList.remove('hidden');
      }
    })
    .catch(error => {
      document.getElementById('btn-verify-code').innerHTML = `<i class="fa-solid fa-key"></i> <span>Ingresar a la Invitación</span>`;
      errorMsg.innerText = "Error de conexión con la hoja de cálculo.";
      errorMsg.classList.remove('hidden');
      console.error("Error:", error);
    });
}

// Desbloquear invitación para invitado normal
function unlockInvitation(guestData) {
  currentGuestData = guestData;

  document.getElementById('nav-toggle-btn').classList.add('hidden');

  document.getElementById('guest-banner-title').innerText = `¡${currentGuestData.name}!`;
  document.getElementById('guest-banner-sub').innerText = `Nos encantaría compartir este gran día contigo. Hemos reservado ${currentGuestData.passes} pase(s) especialmente para ti.`;

  document.getElementById('rsvp-name').value = currentGuestData.name;
  document.getElementById('rsvp-passes-info').innerText = `Tienes un límite de ${currentGuestData.passes} pase(s) asignados.`;

  const selectCount = document.getElementById('rsvp-guests-count');
  selectCount.innerHTML = "";
  for (let i = 1; i <= currentGuestData.passes; i++) {
    const opt = document.createElement('option');
    opt.value = i;
    opt.innerText = `${i} Asistente${i > 1 ? 's' : ''}`;
    selectCount.appendChild(opt);
  }

  const welcomeScreen = document.getElementById('welcome-screen');
  welcomeScreen.classList.add('opacity-0');
  setTimeout(() => {
    welcomeScreen.style.display = 'none';
    document.getElementById('audio-controls').classList.remove('hidden');
  }, 1000);

  playAudio();
  cargarCanciones();
}

// --- CONTADOR REGRESIVO ---
function setupCountdown() {
  const weddingDate = new Date("November 14, 2026 16:00:00").getTime();

  function update() {
    const now = new Date().getTime();
    const diff = weddingDate - now;

    if (diff <= 0) {
      document.getElementById('cd-days').innerText = "00";
      document.getElementById('cd-hours').innerText = "00";
      document.getElementById('cd-mins').innerText = "00";
      document.getElementById('cd-secs').innerText = "00";
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);

    document.getElementById('cd-days').innerText = String(days).padStart(2, '0');
    document.getElementById('cd-hours').innerText = String(hours).padStart(2, '0');
    document.getElementById('cd-mins').innerText = String(mins).padStart(2, '0');
    document.getElementById('cd-secs').innerText = String(secs).padStart(2, '0');
  }

  update();
  setInterval(update, 1000);
}

// --- LÓGICA DE EVENTOS & INTERACCIÓN ---
function setupEventListeners() {
  document.getElementById('btn-toggle-audio').addEventListener('click', () => {
    if (!audioPlayer) return;
    if (isPlaying) {
      audioPlayer.pause();
      isPlaying = false;
    } else {
      audioPlayer.play();
      isPlaying = true;
    }
    updateAudioIcon();
  });

  let isGeneratorView = false;
  document.getElementById('nav-toggle-btn').addEventListener('click', () => {
    isGeneratorView = !isGeneratorView;
    const viewInv = document.getElementById('view-invitation');
    const viewGen = document.getElementById('view-generator');
    const navText = document.getElementById('nav-toggle-text');

    if (isGeneratorView) {
      viewInv.classList.add('hidden');
      viewGen.classList.remove('hidden');
      navText.innerText = "Ver Invitación";
    } else {
      viewGen.classList.add('hidden');
      viewInv.classList.remove('hidden');
      navText.innerText = "Panel de Novios";
    }
  });

  const giftModal = document.getElementById('gift-modal');
  document.getElementById('btn-open-gift-modal').addEventListener('click', () => {
    giftModal.classList.add('show');
  });
  document.getElementById('btn-close-gift-modal').addEventListener('click', () => {
    giftModal.classList.remove('show');
  });

  const lightboxModal = document.getElementById('lightbox-modal');
  const lightboxImg = document.getElementById('lightbox-img');
  
  document.querySelectorAll('.gallery-item').forEach(item => {
    item.addEventListener('click', () => {
      const src = item.getAttribute('data-src');
      lightboxImg.src = src;
      lightboxModal.classList.add('show');
    });
  });

  document.getElementById('btn-close-lightbox').addEventListener('click', () => {
    lightboxModal.classList.remove('show');
  });

  // Formulario Sugerencia de Canciones
  document.getElementById('song-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const input = document.getElementById('song-title');
    const val = input.value.trim();
    if (!val) return;

    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerText;
    submitBtn.innerText = "Enviando...";

    fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        tipo: "cancion",
        cancion: val,
        usuario: currentGuestData.name || "Invitado"
      })
    }).finally(() => {
      submitBtn.innerText = originalText;
      input.value = "";
      alert("¡Canción sugerida con éxito!");
      cargarCanciones();
    });
  });

  setupRSVPLogic();
}

// --- CARGAR CANCIONES DESDE GOOGLE SHEETS ---
function cargarCanciones() {
  const ul = document.getElementById('song-list');
  if (!ul) return;

  fetch(`${GOOGLE_SCRIPT_URL}?action=obtener_canciones`)
    .then(response => response.json())
    .then(data => {
      if (data.status === "success" && data.canciones.length > 0) {
        ul.innerHTML = "";
        data.canciones.forEach(item => {
          const li = document.createElement('li');
          li.className = "p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between";
          li.innerHTML = `<span><i class="fa-solid fa-music text-[#722F37] mr-2"></i> ${item.cancion} <span class="text-[11px] text-slate-400 block sm:inline">(${item.sugeridoPor})</span></span> <span class="text-[10px] text-emerald-600 font-semibold">Sugerida</span>`;
          ul.appendChild(li);
        });
      }
    })
    .catch(err => console.error("Error al cargar canciones:", err));
}

// --- GENERADOR DE CÓDIGOS ---
function setupGeneratorLogic() {
  document.getElementById('link-gen-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const nameVal = document.getElementById('gen-name').value.trim();
    const passesVal = parseInt(document.getElementById('gen-passes').value);
    let customCode = document.getElementById('gen-custom-code').value.trim().toUpperCase();

    if (!customCode) {
      customCode = 'BODA-' + Math.random().toString(36).substring(2, 7).toUpperCase();
    }

    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.innerText = "Guardando en Google Sheets...";

    fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        codigo: customCode,
        nombre: nameVal,
        passes: passesVal
      })
    }).finally(() => {
      submitBtn.innerText = "Generar Código e Invitación";
      
      const baseUrl = window.location.origin + window.location.pathname;
      const generatedUrl = `${baseUrl}?codigo=${customCode}`;

      document.getElementById('out-guest-name').innerText = nameVal;
      document.getElementById('out-guest-passes').innerText = passesVal;
      document.getElementById('out-guest-code').innerText = customCode;
      document.getElementById('gen-url-output').value = generatedUrl;
      
      const message = `¡Hola ${nameVal}! 💍✨ Nos da muchísimo gusto invitarte a nuestra boda. Tu código de acceso personal es: *${customCode}* (Válido para ${passesVal} pases). Puedes ingresar a tu invitación digital aquí: ${generatedUrl}`;
      document.getElementById('btn-whatsapp-share').href = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;

      document.getElementById('gen-result').classList.remove('hidden');
      alert("¡Código generado y guardado en la hoja de cálculo con éxito!");
    });
  });

  document.getElementById('btn-copy-url').addEventListener('click', () => {
    const output = document.getElementById('gen-url-output');
    output.select();
    navigator.clipboard.writeText(output.value);
    alert("¡Enlace y código copiados al portapapeles!");
  });
}

// --- LÓGICA RSVP ---
function setupRSVPLogic() {
  const statusSelect = document.getElementById('rsvp-status');
  const guestsContainer = document.getElementById('rsvp-guests-container');
  const allergiesContainer = document.getElementById('rsvp-allergies-container');

  statusSelect.addEventListener('change', (e) => {
    if (e.target.value === 'no') {
      guestsContainer.classList.add('hidden');
      allergiesContainer.classList.add('hidden');
    } else {
      guestsContainer.classList.remove('hidden');
      allergiesContainer.classList.remove('hidden');
    }
  });

  const rsvpForm = document.getElementById('rsvp-form');
  if (rsvpForm) {
    rsvpForm.addEventListener('submit', (e) => {
      e.preventDefault(); 
      e.stopPropagation();

      const name = currentGuestData.name || document.getElementById('rsvp-name').value.trim();
      const submitBtn = rsvpForm.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn.innerHTML;
      
      submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Verificando registro...`;

      fetch(`${GOOGLE_SCRIPT_URL}?action=verificar_rsvp&nombre=${encodeURIComponent(name)}`)
        .then(response => response.json())
        .then(res => {
          if (res.ya_confirmo) {
            submitBtn.innerHTML = originalBtnText;
            alert(`¡Hola ${name}! Notamos que ya habías enviado tu confirmación anteriormente con este nombre. Si necesitas hacer algún cambio, comunícate con los novios.`);
            return;
          }

          submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Guardando confirmación...`;

          const status = statusSelect.value;
          const isAttending = (status === 'yes');
          const count = isAttending ? document.getElementById('rsvp-guests-count').value : 0;
          const allergies = isAttending ? document.getElementById('rsvp-allergies').value.trim() : "N/A";

          fetch(GOOGLE_SCRIPT_URL, {
            method: "POST",
            mode: "no-cors",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              tipo: "rsvp",
              nombre: name,
              asistira: isAttending,
              asistentes: count,
              alergias: allergies
            })
          }).finally(() => {
            submitBtn.innerHTML = originalBtnText;

            const phoneNumber = "525541006372"; 
            let message = "";

            if (isAttending) {
              message = `¡Hola! Soy *${name}* y confirmo mi asistencia a la boda de Andrea & Jose. 🎉\n\n` +
                        `✔️ *Asistiré con:* ${count} persona(s)\n` +
                        `${allergies && allergies !== 'N/A' ? `🍽️ *Restricciones/Alergias:* ${allergies}` : '🍽️ *Restricciones/Alergias:* Ninguna'}`;
            } else {
              message = `¡Hola! Soy *${name}*. Lamentablemente no podré asistir a la boda de Andrea & Jose, pero les deseo muchas felicidades en su gran día. 🥂✨`;
            }

            const whatsappUrl = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;
            window.open(whatsappUrl, '_blank');
          });

        })
        .catch(error => {
          submitBtn.innerHTML = originalBtnText;
          alert("Hubo un error al verificar tu estado. Inténtalo de nuevo.");
          console.error("Error:", error);
        });

      return false;
    });
  }
}
