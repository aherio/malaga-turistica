// ==========================================================================
// 1. CONFIGURACIÓN DE TU BASE DE DATOS REAL (CONECTADA CON TU PROYECTO)
// ==========================================================================
const firebaseConfig = {
    apiKey: "AIzaSyDoOHH2r6kUVn3k-LBE2SkRj6g08Uuc_UI",
    authDomain: "malaga-turistica.firebaseapp.com",
    databaseURL: "https://malaga-turistica-default-rtdb.europe-west1.firebasedatabase.app/", 
    projectId: "malaga-turistica",
    storageBucket: "malaga-turistica.firebasestorage.app",
    messagingSenderId: "871403346309",
    appId: "1:871403346309:web:2ac53f7a7f05301f610cec",
    measurementId: "G-7M8YT97RLC"
};

// Inicializamos Firebase de forma segura
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const database = firebase.database();

// ==========================================================================
// 2. INTERACTIVIDAD DE LOS CALENDARIOS (LÓGICA INTERNA)
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {

    let esAdmin = false; 
    const CONTRASENA_SECRETA = "1234"; // Tu clave para editar

    const adminStatus = document.getElementById('admin-status');
    const btnLogin = document.getElementById('btn-login');
    const btnSave = document.getElementById('btn-save'); 

    const listaCalendarios = []; 
    let DB_RESERVAS = {}; 

    class Calendario {
        constructor(containerId) {
            this.containerId = containerId;
            this.container = document.getElementById(containerId);
            if (!this.container) return; 

            this.monthYearText = this.container.querySelector('.month-year');
            this.calendarDaysContainer = this.container.querySelector('.calendar-days');
            this.prevBtn = this.container.querySelector('.prev-month');
            this.nextBtn = this.container.querySelector('.next-month');
            
            this.currentDate = new Date();
            this.months = [
                "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
                "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
            ];

            if (this.prevBtn) {
                this.prevBtn.onclick = (e) => {
                    e.preventDefault();
                    this.currentDate.setMonth(this.currentDate.getMonth() - 1);
                    this.renderCalendar();
                };
            }

            if (this.nextBtn) {
                this.nextBtn.onclick = (e) => {
                    e.preventDefault();
                    this.currentDate.setMonth(this.currentDate.getMonth() + 1);
                    this.renderCalendar();
                };
            }

            listaCalendarios.push(this);
        }

        formatearFecha(year, month, day) {
            const m = String(month + 1).padStart(2, '0');
            const d = String(day).padStart(2, '0');
            return `${year}-${m}-${d}`;
        }

        renderCalendar() {
            if (!this.calendarDaysContainer || !this.monthYearText) return;

            const year = this.currentDate.getFullYear();
            const month = this.currentDate.getMonth();

            const firstDayIndex = new Date(year, month, 1).getDay();
            const startOffset = firstDayIndex === 0 ? 6 : firstDayIndex - 1;
            const totalDays = new Date(year, month + 1, 0).getDate();

            this.monthYearText.textContent = `${this.months[month]} ${year}`;
            this.calendarDaysContainer.innerHTML = '';

            for (let i = 0; i < startOffset; i++) {
                const emptyDiv = document.createElement('div');
                emptyDiv.classList.add('empty');
                this.calendarDaysContainer.appendChild(emptyDiv);
            }

            for (let day = 1; day <= totalDays; day++) {
                const dayDiv = document.createElement('div');
                dayDiv.textContent = day;
                dayDiv.classList.add('day');

                const fechaString = this.formatearFecha(year, month, day);

                if (DB_RESERVAS[this.containerId] && DB_RESERVAS[this.containerId].includes(fechaString)) {
                    dayDiv.classList.add('busy'); 
                } else {
                    dayDiv.classList.add('available'); 
                }

                dayDiv.style.cursor = esAdmin ? "pointer" : "default";

                dayDiv.addEventListener('click', () => {
                    if (!esAdmin) return; 

                    if (!DB_RESERVAS[this.containerId]) {
                        DB_RESERVAS[this.containerId] = [];
                    }

                    if (DB_RESERVAS[this.containerId].includes(fechaString)) {
                        DB_RESERVAS[this.containerId] = DB_RESERVAS[this.containerId].filter(f => f !== fechaString);
                    } else {
                        DB_RESERVAS[this.containerId].push(fechaString);
                    }

                    this.renderCalendar(); 
                });

                this.calendarDaysContainer.appendChild(dayDiv);
            }
        }
    }

    // ==========================================================================
    // 3. DESCARGA AUTOMÁTICA EN TIEMPO REAL DESDE LA NUBE
    // ==========================================================================
    database.ref('reservas_malaga').once('value').then((snapshot) => {
        const datosEnLaNube = snapshot.val();
        if (datosEnLaNube) {
            DB_RESERVAS = datosEnLaNube;
        } else {
            DB_RESERVAS = { "cal-apartamento1": [], "cal-apartamento2": [] };
        }
        
        new Calendario('cal-apartamento1');
        new Calendario('cal-apartamento2');
        listaCalendarios.forEach(cal => cal.renderCalendar());
    }).catch((error) => {
        console.error("Error conectando a internet: ", error);
        new Calendario('cal-apartamento1');
        new Calendario('cal-apartamento2');
        listaCalendarios.forEach(cal => cal.renderCalendar());
    });

    // ==========================================================================
    // 4. CONTROL DEL MODO ADMINISTRADOR (LOGIN Y GUARDADO INTELIGENTE)
    // ==========================================================================
    if (btnLogin) {
        btnLogin.addEventListener('click', () => {
            if (!esAdmin) {
                const intento = prompt("Introduce la contraseña de administrador:");
                if (intento === CONTRASENA_SECRETA) {
                    esAdmin = true;
                    if (adminStatus) {
                        adminStatus.textContent = "Modo: 🔐 Administrador (Modo Edición)";
                        adminStatus.style.color = "#2e7d32";
                    }
                    btnLogin.textContent = "Cerrar Sesión";
                    if (btnSave) btnSave.style.display = "inline-block"; 
                } else {
                    alert("Contraseña incorrecta.");
                }
            } else {
                esAdmin = false;
                if (adminStatus) {
                    adminStatus.textContent = "Modo: 👤 Cliente (Solo Lectura)";
                    adminStatus.style.color = "black";
                }
                btnLogin.textContent = "Acceso Admin";
                if (btnSave) btnSave.style.display = "none"; 
            }
            listaCalendarios.forEach(instanciaCal => instanciaCal.renderCalendar());
        });
    }

    // BOTÓN VERDE "GUARDAR CAMBIOS" UNIFICADO Y ANTI-NULL
    if (btnSave) {
        btnSave.addEventListener('click', () => {
            
            // Si la base de datos de internet venía vacía (null), forzamos la estructura inicial
            if (!DB_RESERVAS || Object.keys(DB_RESERVAS).length === 0) {
                DB_RESERVAS = {
                    "cal-apartamento1": [],
                    "cal-apartamento2": []
                };
            }

            // Subimos los datos limpios a Firebase
            database.ref('reservas_malaga').set(DB_RESERVAS)
                .then(() => {
                    alert("💾 ¡Perfecto! Fechas sincronizadas en internet con éxito. El bloqueo ha terminado.");
                })
                .catch((error) => {
                    alert("Error crítico al subir a Firebase: " + error.message);
                });
        });
    }
});
