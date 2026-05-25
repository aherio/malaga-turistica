// --- VARIABLES GLOBALES DE ADMINISTRACIÓN (ACCESO ÚNICO) ---
let esAdmin = false; 
const CONTRASENA_SECRETA = "1234"; // Contraseña para el modo edición

const adminStatus = document.getElementById('admin-status');
const btnLogin = document.getElementById('btn-login');
const listaCalendarios = []; // Array para almacenar y actualizar las instancias de los calendarios

// Evento de Login único compartido por todos los calendarios
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
        // Al cerrar sesión, vuelve a modo lectura pública
        esAdmin = false;
        adminStatus.textContent = "Modo: 👤 Cliente (Solo Lectura)";
        btnLogin.textContent = "Acceso Admin";
        adminStatus.style.color = "black";
    }
    
    // Al cambiar el rol de usuario, actualizamos visualmente todos los calendarios de la página
    listaCalendarios.forEach(instanciaCal => instanciaCal.renderCalendar());
});


// --- CLASE OBJETO PARA LA CREACIÓN DE CALENDARIOS INDEPENDIENTES ---
class Calendario {
    constructor(containerId, fechasIniciales) {
        // Elementos del DOM específicos de este calendario
        this.containerId = containerId;
        this.container = document.getElementById(containerId);
        this.monthYearText = this.container.querySelector('.month-year');
        this.calendarDaysContainer = this.container.querySelector('.calendar-days');
        this.prevBtn = this.container.querySelector('.prev-month');
        this.nextBtn = this.container.querySelector('.next-month');
        
        // Estado interno de fechas y navegación
        this.currentDate = new Date();
        this.ocupadas = new Set(fechasIniciales); // Formato de strings 'AAAA-MM-DD'
        this.months = [
            "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
            "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
        ];

        // Configurar los escuchadores de eventos para los botones de mes
        this.prevBtn.addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() - 1);
            this.renderCalendar();
        });

        this.nextBtn.addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() + 1);
            this.renderCalendar();
        });

        // Dibujar el calendario inmediatamente tras ser creado
        this.renderCalendar();
    }

    // Método auxiliar para generar la clave única de cada día sin problemas de husos horarios
    formatearFecha(year, month, day) {
        const m = String(month + 1).padStart(2, '0');
        const d = String(day).padStart(2, '0');
        return `${year}-${m}-${d}`;
    }

    // Método principal para pintar la cuadrícula del mes actual
    renderCalendar() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();

        // Calcular desfases de días de la semana (Lunes a Domingo)
        const firstDayIndex = new Date(year, month, 1).getDay();
        const startOffset = firstDayIndex === 0 ? 6 : firstDayIndex - 1;
        
        // Obtener la cantidad de días del mes
        const totalDays = new Date(year, month + 1, 0).getDate();

        // Actualizar la cabecera del calendario actual
        this.monthYearText.textContent = `${this.months[month]} ${year}`;
        this.calendarDaysContainer.innerHTML = '';

        // 1. Generar los espacios vacíos del inicio del mes
        for (let i = 0; i < startOffset; i++) {
            const emptyDiv = document.createElement('div');
            emptyDiv.classList.add('empty');
            this.calendarDaysContainer.appendChild(emptyDiv);
        }

        // 2. Generar e interactuar con los días numéricos del mes
        for (let day = 1; day <= totalDays; day++) {
            const dayDiv = document.createElement('div');
            dayDiv.textContent = day;
            dayDiv.classList.add('day');

            const fechaString = this.formatearFecha(year, month, day);

            // Asignar clase CSS según la base de datos de fechas de este apartamento
            if (this.ocupadas.has(fechaString)) {
                dayDiv.classList.add('busy'); // Se dibuja tachado
            } else {
                dayDiv.classList.add('available'); // Se dibuja normal libre
            }

            // Cambiar comportamiento del puntero del ratón según los privilegios del Admin global
            dayDiv.style.cursor = esAdmin ? "pointer" : "default";

            // Evento interactivo para el marcado de fechas
            dayDiv.addEventListener('click', () => {
                if (!esAdmin) return; // Filtro de seguridad: Si no es admin, ignora el clic

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

// --- CREACIÓN DE LAS INSTANCIAS DE CADA APARTAMENTO ---
// Le pasamos el ID del HTML y un listado de fechas ocupadas iniciales de prueba (puedes dejarlas vacías [])
const apartamentoPlaya = new Calendario('cal-apartamento1', ["2026-05-15", "2026-05-16"]);
const apartamentoCentro = new Calendario('cal-apartamento2', ["2026-05-22", "2026-05-23"]);

// Agregamos ambas instancias a nuestra lista global de control
listaCalendarios.push(apartamentoPlaya, apartamentoCentro);