document.addEventListener('DOMContentLoaded', () => {
    console.log("Contenido actual de localStorage:", localStorage);
});

/*###################################################################################
###################### FUNCIÓN PARA ESTABLECER UNA COOKIE ###########################
####################################################################################*/

function setCookie(name, value, days) {
    let dia = new Date();
    // Fecha de expedición + día actual
    dia.setTime(dia.getTime() + (days * 24 * 60 * 60 * 1000));
 
    let expiracion = "expires=" + dia.toUTCString(); // String de expiración en formato UTC
 
    // Creación de cookie con nombre, valor y fecha de expedición
    document.cookie = name + "=" + value + ";" + expiracion + ";path=/";
 }
 
 /*###################################################################################
 ################## FUNCIÓN ENCARGADA DE LEER EL VALOR DE LA COOKIE ##################
 ####################################################################################*/
 
 function getCookie(name) {
     let nameCookie = name + "=";
     let arrayCookie = document.cookie.split(';');
 
     for (let i = 0; i < arrayCookie.length; i++) {
         let cK = arrayCookie[i].trim();
         if (cK.indexOf(nameCookie) === 0) {
             return cK.substring(nameCookie.length, cK.length); // Devolver el valor si encontramos la cookie
         }
     }
     return null; // Devolver null si no encontramos la cookie
 }
 
 /*###################################################################################
 ################ FUNCIÓN PARA OBTENER Y GENERAR ID_CITA EN COOKIES ##################
 ####################################################################################*/
 
 function getID_CITA() {
     let idCita = getCookie('ID_CITA');
     let idsCitas = getCookie('IDS_CITAS') || '';//Leer los IDs existentes en cookies
 
     if (!idCita) {
         idCita = 1;
     } else {
         idCita = parseInt(idCita, 10) + 1;
     }
     setCookie('ID_CITA', idCita, 365);


     const idsList = idsCitas ? idsCitas.split(',') : [];
     if (!idsList.includes(idCita.toString())){
        idsList.push(idCita.toString());
     }

     setCookie('IDS_CITAS', idsList.join(','), 365);
 
     return idCita;
 }
 
 /*###################################################################################
 ############ FUNCIÓN PARA GUARDAR LOS DATOS DE LA CITA CON localStorage #############
 ####################################################################################*/ 
 
 function guardarCita(evento) {
    evento.preventDefault(); // Evitar envío normal del formulario

    // Determinar si estamos editando o creando una nueva cita
    const idCitaCookie = getCookie('CITA_EDITAR');
    const idCita = idCitaCookie ? parseInt(idCitaCookie, 10) : getID_CITA();

    const nombre = document.getElementById('nombrePaciente').value.trim();
    const apellidos = document.getElementById('apellidoPaciente').value.trim();
    const dni = document.getElementById('dniPaciente').value.trim();
    const telefono = document.getElementById('telefonoPaciente').value.trim();
    const fechaNac = document.getElementById('fechaPaciente').value;
    const observaciones = document.getElementById('obsvPaciente').value.trim();
    const fechaCita = document.getElementById('fecha').value;
    const horaCita = document.getElementById('time').value;



    // Validación de los campos
    let error = false;

    error |= !validarCampo(document.getElementById('nombrePaciente'), "El nombre es obligatorio");
    error |= !validarCampo(document.getElementById('apellidoPaciente'), "Los apellidos son obligatorios");
    error |= !validarCampo(document.getElementById('dniPaciente'), "El DNI es obligatorio");
    error |= !validarCampo(document.getElementById('telefonoPaciente'), "El teléfono es obligatorio");
    error |= !validarCampo(document.getElementById('fechaPaciente'), "La fecha de nacimiento es obligatoria");
    error |= !validarCampo(document.getElementById('fecha'), "La fecha de la cita es obligatoria");
    error |= !validarCampo(document.getElementById('time'), "La hora de la cita es obligatoria");

    if (error) return;


    // Crear o actualizar la cita
    const cita = {
        idCita,
        nombre,
        apellidos,
        dni,
        telefono,
        fechaNac,
        observaciones,
        fechaCita,
        horaCita
    };

    // Guardar cita en localStorage
    localStorage.setItem('cita_' + idCita, JSON.stringify(cita));

    // Actualizar lista de IDs en cookies (si es una nueva cita)
    if (!idCitaCookie) {
    let idsCitas = getCookie('IDS_CITAS') || '';
    const idsList = idsCitas ? idsCitas.split(',') : [];

    // Asegurar que no hay duplicados antes de actualizar la cookie
    idsList.push(idCita.toString());
    const uniqueIds = [...new Set(idsList)]; // Eliminar duplicados

    // Guardar la lista única de IDs en la cookie
    setCookie('IDS_CITAS', uniqueIds.join(','), 365);
    }


    // Limpiar cookie de edición
    if (idCitaCookie) {
        setCookie('CITA_EDITAR', '', -1);
    }
    //Mensaje registro en consola debug:
    console.log('Cookie CITA_EDITAR ha sido eliminada.');
    

    alert(idCitaCookie ? "Cita editada con éxito." : "Cita creada con éxito.");
    formulario.reset(); // Limpiar el formulario después de guardar
    window.location.href = '../mdHTML/medacDent.html';
 } 
 
 // Asignar el evento submit del formulario
 const formulario = document.getElementById('formCita');
 if (formulario) {
     formulario.addEventListener('submit', guardarCita);
 }
 
 /*###################################################################################
 #################### FUNCIÓN PARA MOSTRAR LOS DATOS DE LA CITA ######################
 ####################################################################################*/ 
 
 function mostrarCitas() {
    // Depuración
        console.log("mostrarCitas ejecutandose....");
     let listaCitas = document.getElementById('listaCitas');
     if (!listaCitas) return;
 
     listaCitas.innerHTML = ''; // Limpiar cualquier contenido anterior

     const citas = []; //Leer citas desde el localStorage

     for (let i = 0; i < localStorage.length; i++) {
         let key = localStorage.key(i);
 
         if (key.startsWith('cita_')) {
             const cita = JSON.parse(localStorage.getItem(key));
             console.log(`Cita encontrada: ${JSON.stringify(cita)}`);
             citas.push(cita);
         }
     }

     if (citas.length === 0){
        listaCitas.innerHTML = '<p>No hay citas registradas</p>';
        return;
     }  



     //Mostrar todas las citas ->

    const citasOrdenadas = ordenarCitasPorFecha(citas);

     citasOrdenadas.forEach(cita => {
        //Formateo de fecha para mejor lectura del user
        cita.fechaCita = formatearFecha(cita.fechaCita);
        cita.fechaNac = formatearFecha(cita.fechaNac);

        const citaElement = document.createElement('div');
        citaElement.classList.add('cita');
        citaElement.innerHTML = `
            <div class="cita" id="listaCitas">
                <p><strong>Paciente:</strong> ${cita.nombre} ${cita.apellidos}</p>
                <p><strong>DNI:</strong> ${cita.dni}</p>
                <p><strong>Teléfono:</strong> ${cita.telefono}</p>
                <p><strong>Fecha de Nacimiento:</strong> ${cita.fechaNac}</p>
                <p><strong>Fecha/Hora de Cita:</strong> ${cita.fechaCita}/${cita.horaCita}</p>
                <p><strong>Observaciones:</strong> ${cita.observaciones}</p>
                <button onclick="editarCita(${cita.idCita})">Editar</button>
                <button onclick="eliminarCita(${cita.idCita})">Eliminar</button>
            </div>
        `;

        listaCitas.appendChild(citaElement);
     });     

     if (listaCitas.innerHTML === '') {
        listaCitas.innerHTML = '<p>No hay citas disponibles.<p>';
     }
 }

 /*###################################################################################
##################### FUNCION PARA ELIMINAR UNA CITA #################################
####################################################################################*/

 
 function eliminarCita(idCita) {
     if (confirm("¿Estás seguro de que deseas eliminar esta cita?")) {
         localStorage.removeItem(`cita_${idCita}`);
         alert("Cita eliminada con éxito.");
         mostrarCitas();
     }
 }
 
 /*###################################################################################
 ############# FUNCIÓNES PARA ACTUALIZAR Y EDITAR LOS DATOS DE LA CITA ###############
 ####################################################################################*/
 
 function actualizarCita(idCita) {
    const cita = JSON.parse(localStorage.getItem(`cita_${idCita}`));

    // Verificar si la cita existe en localStorage
    if (!cita) {
        alert(`Error: No se encontró una cita con el ID: ${idCita}`);
        return;
    }

    const nombre = document.getElementById('nombrePaciente').value.trim();
    const apellidos = document.getElementById('apellidoPaciente').value.trim();
    const dni = document.getElementById('dniPaciente').value.trim();
    const telefono = document.getElementById('telefonoPaciente').value.trim();
    const fechaNac = document.getElementById('fechaPaciente').value;
    const observaciones = document.getElementById('obsvPaciente').value.trim();
    const fechaCita = document.getElementById('fecha').value;
    const horaCita = document.getElementById('time').value;

    //Validamos los campos antes de guardar
    if (!nombre || !apellidos || !dni || !telefono || !fechaNac || !fechaCita || !horaCita) {
        alert("Por favor, complete todos los campos obligatorios.");
        return;
    }

    const citaActualizada = {
        ...cita, //Mantiene otros campos existentes
        nombre,
        apellidos,
        dni,
        telefono,
        fechaNac,
        observaciones,
        fechaCita,
        horaCita
    };

    localStorage.setItem(`cita_${idCita}`, JSON.stringify(citaActualizada));

    //Limpiar la cookie de edición
    setCookie('CITA_EDITADA', '', -1);

    //Confirmar y redirección
    alert("Cita actualizada con éxito.");
    window.location.href = "../mdHTML/medacDent.html"; // Regresa al índice
 }
 
 function editarCita(idCita) {
    //Validar que el ID sea válido
    if (!idCita || isNaN(idCita)) {
        alert('Error: ID de cita no válido.');
        return;
    }

    //Verificar si la cita existe en localStorage
    const cita = localStorage.getItem(`cita_${idCita}`);
    if (!cita) {
        alert('Error: No se encontró una cita con este ID.');
        return;
    }

    //Redirigir al formulario con el ID en la URL
    window.location.href = `crearCita.html?idCita=${idCita}`;
 }

 document.addEventListener('DOMContentLoaded', function () {
    const idCita = obtenerIdCitaDeURL();

    if (idCita) {
        const cita = JSON.parse(localStorage.getItem(`cita_${idCita}`));

        if (cita) {
            document.getElementById('nombrePaciente').value = cita.nombre;
            document.getElementById('apellidoPaciente').value = cita.apellidos;
            document.getElementById('dniPaciente').value = cita.dni;
            document.getElementById('telefonoPaciente').value = cita.telefono;
            document.getElementById('fechaPaciente').value = cita.fechaNac;
            document.getElementById('obsvPaciente').value = cita.observaciones;
            document.getElementById('fecha').value = cita.fechaCita;
            document.getElementById('time').value = cita.horaCita;

            if (idCita){
                const btnGuardar = document.getElementById('btnGuardar');
                btnGuardar.textContent = "Actualizar Cita";
    
                btnGuardar.onclick = function (e) {
                    e.preventDefault();
                    actualizarCita(idCita);
                }
            }
        }
    }
 });

/*###################################################################################
######### EVENTO QUE ASEGURA LA CARGA DE DATOS DESDE localStorage AL DOM ############
####################################################################################*/


 document.addEventListener('DOMContentLoaded', function () {
    console.log("DOM cargado, ejecutando mostrarCitas...");
    mostrarCitas();
});


/*## Funciones Extra ##*/

function formatearFecha(fechaISO) {
    if (!fechaISO) return ''; // Asegúrate de que hay una fecha válida
    const partes = fechaISO.split('-');
    if (partes.length !== 3) return fechaISO; // Devuelve la fecha original si no está en el formato esperado
    const [año, mes, dia] = partes;
    return `${dia}-${mes}-${año}`;
}

function mostrarMensajeError(mensaje, elemento) {
    const error = document.createElement('span');
    error.textContent = mensaje;
    error.style.color = 'red';
    error.style.fontSize = '12px';
    elemento.parentNode.appendChild(error);
    setTimeout(() => error.remove(), 3000);
}

// Función para la validación de los campos
function validarCampo(campo, mensaje) {
    if (!campo.value.trim()) {
        mostrarMensajeError(mensaje, campo);
        return false;
    }
        return true;
}

    
 //Función para obtener de la URL el id pasado por parámetros
 function obtenerIdCitaDeURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('idCita');
 }

// Método de ordenación
// Orden ascendente: más cercana primero
function ordenarCitasPorFecha(citas) {
    return citas.sort((a, b) => {
        const fechaHoraA = new Date(`${a.fechaCita}T${a.horaCita}`);
        const fechaHoraB = new Date(`${b.fechaCita}T${b.horaCita}`);
        return fechaHoraA - fechaHoraB; // Ordena de menor a mayor
    });
}