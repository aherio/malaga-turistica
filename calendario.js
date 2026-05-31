// --- VARIABLES GLOBALES DE ADMINISTRACIÓN (ACCESO ÚNICO) ---
let esAdmin = false; 
const CONTRASENA_SECRETA = "1234"; // Contraseña para el modo edición

const adminStatus = document.getElementById('admin-status');
const btnLogin = document.getElementById('btn-login');

// ARRAY GLOBAL CENTRALIZADO: Guarda las instancias de los calendarios para poder actualizarlos
const listaCalendarios = []; 

// BASE DE DATOS DE FECHAS OCUPADAS: Almacena los días reservados por cada ID de apartamento
const DB_RESERVAS = {
    "cal-apartamento1": ["2026-05-08", "2026-05-15", "2026-05-16"], // Torrox
    "cal-apartamento2": ["2026-05-22", "2026-05-23"]               // Rincón
};

// --- CLASE OBJETO PARA LA CREACIÓN DE CALENDARIOS INDEPENDIENTES ---
class Calendario {
    constructor(containerId) {
        this.containerId = containerId;
        this.container = document.getElementById(containerId);
        
        if (!this.container) return; // Filtro de seguridad por si no existe el contenedor

        this.monthYearText = this.container.querySelector('.month-year');
        this.calendarDaysContainer = this.container.querySelector('.calendar-days');
        this.prevBtn = this.container.querySelector('.prev-month');
        this.nextBtn = this.container.querySelector('.next-month');
        
        this.currentDate = new Date();
        this.months = [
            "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
            "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
        ];

        // Configurar los botones de navegación de meses
        this.prevBtn.addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() - 1);
            this.renderCalendar();
        });

        this.nextBtn.addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() + 1);
            this.renderCalendar();
        });

        // Registrar automáticamente la instancia en el array global antes de renderizar
        listaCalendarios.push(this);

        // Dibujar el calendario
        this.renderCalendar();
    }

    // Generar formato estándar de fecha 'AAAA-MM-DD'
    formatearFecha(year, month, day) {
        const m = String(month + 1).padStart(2, '0');
        const d = String(day).padStart(2, '0');
        return `${year}-${m}-${d}`;
    }

    // Método principal para pintar la cuadrícula del mes actual
    renderCalendar() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();

        const firstDayIndex = new Date(year, month, 1).getDay();
        const startOffset = firstDayIndex === 0 ? 6 : firstDayIndex - 1;
        const totalDays = new Date(year, month + 1, 0).getDate();

        this.monthYearText.textContent = `${this.months[month]} ${year}`;
        this.calendarDaysContainer.innerHTML = '';

        // 1. Generar los espacios vacíos del inicio del mes
        for (let i = 0; i < startOffset; i++) {
            const emptyDiv = document.createElement('div');
            emptyDiv.classList.add('empty');
            this.calendarDaysContainer.appendChild(emptyDiv);
        }

        // 2. Generar los días numéricos del mes
        for (let day = 1; day <= totalDays; day++) {
            const dayDiv = document.createElement('div');
            dayDiv.textContent = day;
            dayDiv.classList.add('day');

            const fechaString = this.formatearFecha(year, month, day);

            // COMPROBACIÓN: Consultamos el Array global dinámico
            if (DB_RESERVAS[this.containerId] && DB_RESERVAS[this.containerId].includes(fechaString)) {
                dayDiv.classList.add('busy'); // Aplica los estilos del tachado rojo
            } else {
                dayDiv.classList.add('available');
            }

            // Cambiar comportamiento del puntero según los privilegios del Admin
            dayDiv.style.cursor = esAdmin ? "pointer" : "default";

            // Evento interactivo para el marcado/desmarcado de fechas
            dayDiv.addEventListener('click', () => {
                if (!esAdmin) return; // Si es cliente, bloquea la acción

                // Inicializar el array del apartamento si no existiera
                if (!DB_RESERVAS[this.containerId]) {
                    DB_RESERVAS[this.containerId] = [];
                }

                // LÓGICA DE ACTUALIZACIÓN EN TIEMPO REAL
                if (DB_RESERVAS[this.containerId].includes(fechaString)) {
                    // Si ya estaba reservado, lo eliminamos del array
                    DB_RESERVAS[this.containerId] = DB_RESERVAS[this.containerId].filter(f => f !== fechaString);
                } else {
                    // Si estaba libre, lo añadimos al array
                    DB_RESERVAS[this.containerId].push(fechaString);
                }

                // ACTUALIZACIÓN INMEDIATA: Volvemos a pintar este calendario para aplicar el cambio visual
                this.renderCalendar();
                
                console.log(`Actualizado [${this.containerId}]:`, DB_RESERVAS[this.containerId]);
            });

            this.calendarDaysContainer.appendChild(dayDiv);
        }
    }
}

// --- INITIALIZACIÓN DE LOS APARTAMENTOS ---
// Las instancias se registran automáticamente en el array global mediante el constructor
new Calendario('cal-apartamento1');
new Calendario('cal-apartamento2');

// --- EVENTO DE LOGIN COMPARTIDO ---
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
    
    // Al cambiar de rol, refrescamos todos los calendarios del array global
    listaCalendarios.forEach(instanciaCal => instanciaCal.renderCalendar());
});
