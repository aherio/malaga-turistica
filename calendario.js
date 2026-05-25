// --- VARIABLES GLOBALES DE ADMINISTRACIÓN (ACCESO ÚNICO) ---
let esAdmin = false; 
const CONTRASENA_SECRETA = "1234"; 

const adminStatus = document.getElementById('admin-status');
const btnLogin = document.getElementById('btn-login');
const listaCalendarios = []; 

// Evento de Login
btnLogin.addEventListener('click', () => {
    if (!esAdmin) {
        const intento = prompt("Introduce la contraseña de administrador:");
        if (intento === CONTRASENA_SECRETA) {
            esAdmin = true;
            adminStatus.textContent = "Modo: 🔐 Administrador (Modo Edición)";
            btnLogin.textContent = "Cerrar Sesión";
            adminStatus.style.color = "#2e7d32";
        } else {
            alert("Contraseña incorrecta. Acceso denegado.");
        }
    } else {
        esAdmin = false;
        adminStatus.textContent = "Modo: 👤 Cliente (Solo Lectura)";
        btnLogin.textContent = "Acceso Admin";
        adminStatus.style.color = "black";
    }
    
    // Al cerrar o abrir sesión, repintamos sin perder nada porque ahora lee de la memoria local
    listaCalendarios.forEach(instanciaCal => instanciaCal.renderCalendar());
});


// --- CLASE OBJETO PARA LOS CALENDARIOS ---
class Calendario {
    constructor(containerId, fechasPorDefecto) {
        this.containerId = containerId;
        this.container = document.getElementById(containerId);
        this.monthYearText = this.container.querySelector('.month-year');
        this.calendarDaysContainer = this.container.querySelector('.calendar-days');
        this.prevBtn = this.container.querySelector('.prev-month');
        this.nextBtn = this.container.querySelector('.next-month');
        
        this.currentDate = new Date();
        this.months = [
            "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
            "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
        ];

        // 💾 [NUEVO] INTENTAR CARGAR LAS FECHAS GUARDADAS DEL NAVEGADOR
        // Si es la primera vez que se abre, usará las 'fechasPorDefecto'
        const datosGuardados = localStorage.getItem(`ocupadas_${this.containerId}`);
        if (datosGuardados) {
            this.ocupadas = new Set(JSON.deserialize ? JSON.deserialize(datosGuardados) : JSON.parse(datosGuardados));
        } else {
            this.ocupadas = new Set(fechasPorDefecto);
        }

        // Configurar flechas de meses
        this.prevBtn.addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() - 1);
            this.renderCalendar();
        });

        this.nextBtn.addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() + 1);
            this.renderCalendar();
        });

        this.renderCalendar();
    }

    formatearFecha(year, month, day) {
        const m = String(month + 1).padStart(2, '0');
        const d = String(day).padStart(2, '0');
        return `${year}-${m}-${d}`;
    }

    // 💾 [NUEVO] FUNCIÓN PARA GRABAR LOS CAMBIOS EN EL DISCO
    guardarEnMemoria() {
        // Convertimos el Set a un Array normal para que se pueda transformar en texto JSON
        const arrayFechas = Array.from(this.ocupadas);
        localStorage.setItem(`ocupadas_${this.containerId}`, JSON.stringify(arrayFechas));
    }

    renderCalendar() {
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

            if (this.ocupadas.has(fechaString)) {
                dayDiv.classList.add('busy'); 
            } else {
                dayDiv.classList.add('available'); 
            }

            dayDiv.style.cursor = esAdmin ? "pointer" : "default";

            dayDiv.addEventListener('click', () => {
                if (!esAdmin) return; 

                if (this.ocupadas.has(fechaString)) {
                    this.ocupadas.delete(fechaString);
                    dayDiv.classList.remove('busy');
                    dayDiv.classList.add('available');
                } else {
                    this.ocupadas.add(fechaString);
                    dayDiv.classList.add('busy');
                    dayDiv.classList.remove('available');
                }

                // 💾 [NUEVO] Cada vez que el admin hace click, guardamos el estado actual
                this.guardarEnMemoria();
                console.log(`Guardado en ${this.containerId}.`);
            });

            this.calendarDaysContainer.appendChild(dayDiv);
        }
    }
}

// --- CREACIÓN DE LAS INSTANCIAS ---
// Estas fechas que pongo aquí solo saldrán la primerísima vez que abras la web si la memoria está vacía.
const apartamentoPlaya = new Calendario('cal-apartamento1', ["2026-05-15", "2026-05-16"]);
const apartamentoCentro = new Calendario('cal-apartamento2', ["2026-05-22", "2026-05-23"]);

listaCalendarios.push(apartamentoPlaya, apartamentoCentro);
