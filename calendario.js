// --- VARIABLES GLOBALES DE ADMINISTRACIÓN (ACCESO ÚNICO) ---
let esAdmin = false; 
const CONTRASENA_SECRETA = "1234"; // Contraseña para el modo edición

const adminStatus = document.getElementById('admin-status');
const btnLogin = document.getElementById('btn-login');

// Lista global donde se guardan las instancias para refrescarlas al cambiar de modo
const listaCalendarios = []; 

// --- CLASE OBJETO PARA LA CREACIÓN DE CALENDARIOS INDEPENDIENTES ---
class Calendario {
    constructor(containerId, fechasIniciales) {
        this.containerId = containerId;
        this.container = document.getElementById(containerId);
        
        // Verificar que el contenedor existe en el HTML antes de continuar
        if (!this.container) return;

        this.monthYearText = this.container.querySelector('.month-year');
        this.calendarDaysContainer = this.container.querySelector('.calendar-days');
        this.prevBtn = this.container.querySelector('.prev-month');
        this.nextBtn = this.container.querySelector('.next-month');
        
        this.currentDate = new Date();
        this.ocupadas = new Set(fechasIniciales); // Set con formato 'AAAA-MM-DD'
        this.months = [
            "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
            "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
        ];

        // Configurar escuchadores para cambiar de mes
        this.prevBtn.addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() - 1);
            this.renderCalendar();
        });

        this.nextBtn.addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() + 1);
            this.renderCalendar();
        });

        // Auto-agregar esta instancia a la lista global al ser creada
        listaCalendarios.push(this);

        // Dibujar por primera vez
        this.renderCalendar();
    }

    formatearFecha(year, month, day) {
        const m = String(month + 1).padStart(2, '0');
        const d = String(day).padStart(2, '0');
        return `${year}-${m}-${d}`;
    }

    renderCalendar() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();

        const firstDayIndex = new Date(year, month, 1).getDay();
        const startOffset = firstDayIndex === 0 ? 6 : firstDayIndex - 1;
        const totalDays = new Date(year, month + 1, 0).getDate();

        this.monthYearText.textContent = `${this.months[month]} ${year}`;
        this.calendarDaysContainer.innerHTML = '';

        // 1. Espacios vacíos
        for (let i = 0; i < startOffset; i++) {
            const emptyDiv = document.createElement('div');
            emptyDiv.classList.add('empty');
            this.calendarDaysContainer.appendChild(emptyDiv);
        }

        // 2. Pintar los días y aplicar el filtro de fechas ocupadas
        for (let day = 1; day <= totalDays; day++) {
            const dayDiv = document.createElement('div');
            dayDiv.textContent = day;
            dayDiv.classList.add('day');

            const fechaString = this.formatearFecha(year, month, day);

            // ¡IMPORTANTE!: Comprobación de la base de datos interna de reservas
            if (this.ocupadas.has(fechaString)) {
                dayDiv.classList.add('busy');      // Clase que aplica el tachado rojo
            } else {
                dayDiv.classList.add('available'); // Clase de día libre normal
            }

            // Cambiar aspecto del ratón según permisos
            dayDiv.style.cursor = esAdmin ? "pointer" : "default";

            // Evento click interactivo (Solo funciona si esAdmin es true)
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
                console.log(`Cambio en [${this.containerId}]. Ocupadas actuales:`, Array.from(this.ocupadas));
            });

            this.calendarDaysContainer.appendChild(dayDiv);
        }
    }
}

// --- CREACIÓN DE LAS INSTANCIAS (Se añaden solas a listaCalendarios gracias al constructor) ---
new Calendario('cal-apartamento1', ["2026-05-15", "2026-05-16", "2026-05-08"]); // Torrox
new Calendario('cal-apartamento2', ["2026-05-22", "2026-05-23"]);               // Rincón

// --- EVENTO DE LOGIN (COMPARTIDO Y COLOCADO ABAJO) ---
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
    
    // Forzar a todos los calendarios creados a redibujarse conservando sus arrays estables
    listaCalendarios.forEach(instanciaCal => instanciaCal.renderCalendar());
});
