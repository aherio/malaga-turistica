document.addEventListener("DOMContentLoaded", () => {

    // --- VARIABLES GLOBALES DE ADMINISTRACIÓN (ACCESO ÚNICO) ---
    let esAdmin = false; 
    const CONTRASENA_SECRETA = "1234"; // Contraseña para el modo edición

    const adminStatus = document.getElementById('admin-status');
    const btnLogin = document.getElementById('btn-login');

    // ARRAY GLOBAL CENTRALIZADO: Guarda los calendarios para poder refrescarlos
    const listaCalendarios = []; 

    // BASE DE DATOS DE FECHAS OCUPADAS (Formato 'AAAA-MM-DD')
    const DB_RESERVAS = {
        "cal-apartamento1": ["2026-05-08", "2026-05-15", "2026-05-16"], // Torrox
        "cal-apartamento2": ["2026-05-22", "2026-05-23"]               // Rincón
    };

    // --- CLASE OBJETO PARA LA CREACIÓN DE CALENDARIOS INDEPENDIENTES ---
    class Calendario {
        constructor(containerId) {
            this.containerId = containerId;
            this.container = document.getElementById(containerId);
            
            // Si el contenedor no existe en el HTML actual, detenemos la ejecución para evitar errores
            if (!this.container) return; 

            // SELECTORES EXACTOS ADAPTADOS A TU HTML
            this.monthYearText = this.container.querySelector('.month-year');
            this.calendarDaysContainer = this.container.querySelector('.calendar-days');
            this.prevBtn = this.container.querySelector('.prev-month');
            this.nextBtn = this.container.querySelector('.next-month');
            
            this.currentDate = new Date();
            this.months = [
                "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
                "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
            ];

            // Configurar los botones de navegación de meses con control de existencia
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

            // Registrar automáticamente esta instancia en el array de control global
            listaCalendarios.push(this);

            // Dibujar por primera vez el calendario en pantalla
            this.renderCalendar();
        }

        // Generar formato estándar de fecha 'AAAA-MM-DD' sin desfases horarios
        formatearFecha(year, month, day) {
            const m = String(month + 1).padStart(2, '0');
            const d = String(day).padStart(2, '0');
            return `${year}-${m}-${d}`;
        }

        // Método principal para pintar la cuadrícula del mes actual
        renderCalendar() {
            if (!this.calendarDaysContainer || !this.monthYearText) return;

            const year = this.currentDate.getFullYear();
            const month = this.currentDate.getMonth();

            // Calcular desfase del primer día de la semana (Lunes a Domingo)
            const firstDayIndex = new Date(year, month, 1).getDay();
            const startOffset = firstDayIndex === 0 ? 6 : firstDayIndex - 1;
            const totalDays = new Date(year, month + 1, 0).getDate();

            this.monthYearText.textContent = `${this.months[month]} ${year}`;
            this.calendarDaysContainer.innerHTML = '';

            // 1. Generar los espacios vacíos correspondientes al inicio del mes
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

                // COMPROBACIÓN DINÁMICA: Consultamos si la fecha está reservada
                if (DB_RESERVAS[this.containerId] && DB_RESERVAS[this.containerId].includes(fechaString)) {
                    dayDiv.classList.add('busy'); // Aplica la clase del tachado rojo
                } else {
                    dayDiv.classList.add('available'); // Día libre estándar
                }

                // Cambiar el diseño del puntero del ratón en función del rol de administración
                dayDiv.style.cursor = esAdmin ? "pointer" : "default";

                // EVENTO INTERACTIVO: Control de marcas de reserva en tiempo real al hacer clic
                dayDiv.addEventListener('click', () => {
                    if (!esAdmin) return; // Si eres un cliente (Solo Lectura), se bloquea la acción

                    // Inicializar el array del alojamiento si estuviera corrupto o vacío
                    if (!DB_RESERVAS[this.containerId]) {
                        DB_RESERVAS[this.containerId] = [];
                    }

                    // Si ya estaba bloqueado lo quitamos, si estaba libre lo añadimos
                    if (DB_RESERVAS[this.containerId].includes(fechaString)) {
                        DB_RESERVAS[this.containerId] = DB_RESERVAS[this.containerId].filter(f => f !== fechaString);
                    } else {
                        DB_RESERVAS[this.containerId].push(fechaString);
                    }

                    // ACTUALIZACIÓN INMEDIATA: Volvemos a pintar este calendario para refrescar el HTML
                    this.renderCalendar();
                    console.log(`Reservas actuales de [${this.containerId}]:`, DB_RESERVAS[this.containerId]);
                });

                this.calendarDaysContainer.appendChild(dayDiv);
            }
        }
    }

    // --- INICIALIZACIÓN AUTOMÁTICA DE TUS DOS APARTAMENTOS ---
    new Calendario('cal-apartamento1');
    new Calendario('cal-apartamento2');

    // --- LOGICA DEL BOTÓN DE LOGIN COMPARTIDO ---
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
                } else {
                    alert("Contraseña incorrecta. Acceso denegado.");
                }
            } else {
                esAdmin = false;
                if (adminStatus) {
                    adminStatus.textContent = "Modo: 👤 Cliente (Solo Lectura)";
                    adminStatus.style.color = "black";
                }
                btnLogin.textContent = "Acceso Admin";
            }
            
            // Forzamos un redibujado de todos los calendarios guardados en el array al cambiar de rol
            listaCalendarios.forEach(instanciaCal => instanciaCal.renderCalendar());
        });
    }
});
