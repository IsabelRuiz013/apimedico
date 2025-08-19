const API_URL = 'http://localhost:3000';
let editandoMedico = false;
let medicoEditando = null;

// Elementos del DOM
const form = document.getElementById('medicoForm');
const submitBtn = document.getElementById('submitBtn');
const updateBtn = document.getElementById('updateBtn');
const cancelBtn = document.getElementById('cancelBtn');
const loading = document.getElementById('loading');
const messages = document.getElementById('messages');
const medicosList = document.getElementById('medicosList');

// Event listeners
form.addEventListener('submit', manejarSubmit);
updateBtn.addEventListener('click', actualizarMedico);
cancelBtn.addEventListener('click', cancelarEdicion);

// Cargar médicos al iniciar
document.addEventListener('DOMContentLoaded', cargarMedicos);

function mostrarLoading(show = true) {
    loading.style.display = show ? 'block' : 'none';
}

function mostrarMensaje(mensaje, tipo = 'success') {
    const alertClass = tipo === 'success' ? 'alert-success' : 'alert-error';
    const alertHTML = `
        <div class="alert ${alertClass}">
            ${mensaje}
        </div>
    `;
    messages.innerHTML = alertHTML;
    
    // Remover el mensaje después de 3 segundos
    setTimeout(() => {
        messages.innerHTML = '';
    }, 3000);
}

async function cargarMedicos() {
    try {
        mostrarLoading(true);
        const response = await fetch(`${API_URL}/medicos`);
        const medicos = await response.json();
        
        mostrarMedicos(medicos);
    } catch (error) {
        console.error('Error al cargar médicos:', error);
        mostrarMensaje('Error al cargar la lista de médicos', 'error');
    } finally {
        mostrarLoading(false);
    }
}

function mostrarMedicos(medicos) {
    if (medicos.length === 0) {
        medicosList.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <div style="font-size: 4em; margin-bottom: 20px; color: #4facfe;">•</div>
                <h3>No hay médicos registrados</h3>
                <p>Agrega el primer médico usando el formulario de arriba</p>
            </div>
        `;
        return;
    }

    const medicosHTML = medicos.map(medico => `
        <div class="medico-card">
            <div class="medico-info">
                <h3>${medico.nombres}</h3>
                <div class="medico-detail">
                    <strong>ID:</strong>
                    <span>${medico.idMedico}</span>
                </div>
                <div class="medico-detail">
                    <strong>Identificación:</strong>
                    <span>${medico.identificacion}</span>
                </div>
                <div class="medico-detail">
                    <strong>Teléfono:</strong>
                    <span>${medico.telefono}</span>
                </div>
                <div class="medico-detail">
                    <strong>Correo:</strong>
                    <span>${medico.correo}</span>
                </div>
            </div>
            <div class="medico-actions">
                <button class="btn btn-success" onclick="editarMedico('${medico.idMedico}')">
                    Editar
                </button>
                <button class="btn btn-danger" onclick="eliminarMedico('${medico.idMedico}')">
                    Eliminar
                </button>
            </div>
        </div>
    `).join('');

    medicosList.innerHTML = medicosHTML;
}

async function manejarSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(form);
    const medicoData = {
        idMedico: formData.get('idMedico'),
        identificacion: formData.get('identificacion'),
        nombres: formData.get('nombres'),
        telefono: formData.get('telefono'),
        correo: formData.get('correo')
    };

    try {
        mostrarLoading(true);
        const response = await fetch(`${API_URL}/medicos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(medicoData)
        });

        const result = await response.json();

        if (response.ok) {
            mostrarMensaje('Médico agregado exitosamente');
            form.reset();
            cargarMedicos();
        } else {
            mostrarMensaje(result.error || 'Error al agregar médico', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarMensaje('Error de conexión', 'error');
    } finally {
        mostrarLoading(false);
    }
}

async function editarMedico(idMedico) {
    try {
        const response = await fetch(`${API_URL}/medicos`);
        const medicos = await response.json();
        const medico = medicos.find(m => m.idMedico === idMedico);

        if (medico) {
            // Llenar el formulario con los datos del médico
            document.getElementById('idMedico').value = medico.idMedico;
            document.getElementById('identificacion').value = medico.identificacion;
            document.getElementById('nombres').value = medico.nombres;
            document.getElementById('telefono').value = medico.telefono;
            document.getElementById('correo').value = medico.correo;

            // Deshabilitar el campo ID
            document.getElementById('idMedico').disabled = true;

            // Cambiar el estado del formulario
            editandoMedico = true;
            medicoEditando = idMedico;
            submitBtn.style.display = 'none';
            updateBtn.style.display = 'inline-block';
            cancelBtn.style.display = 'inline-block';

            // Scroll al formulario
            document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarMensaje('Error al cargar datos del médico', 'error');
    }
}

async function actualizarMedico() {
    const formData = new FormData(form);
    const medicoData = {
        identificacion: formData.get('identificacion'),
        nombres: formData.get('nombres'),
        telefono: formData.get('telefono'),
        correo: formData.get('correo')
    };

    try {
        mostrarLoading(true);
        const response = await fetch(`${API_URL}/medicos/${medicoEditando}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(medicoData)
        });

        const result = await response.json();

        if (response.ok) {
            mostrarMensaje('Médico actualizado exitosamente');
            cancelarEdicion();
            cargarMedicos();
        } else {
            mostrarMensaje(result.error || 'Error al actualizar médico', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarMensaje('Error de conexión', 'error');
    } finally {
        mostrarLoading(false);
    }
}

function cancelarEdicion() {
    editandoMedico = false;
    medicoEditando = null;
    form.reset();
    document.getElementById('idMedico').disabled = false;
    submitBtn.style.display = 'inline-block';
    updateBtn.style.display = 'none';
    cancelBtn.style.display = 'none';
}

async function eliminarMedico(idMedico) {
    if (!confirm('¿Está seguro de que desea eliminar este médico?')) {
        return;
    }

    try {
        mostrarLoading(true);
        const response = await fetch(`${API_URL}/medicos/${idMedico}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (response.ok) {
            mostrarMensaje('Médico eliminado exitosamente');
            cargarMedicos();
        } else {
            mostrarMensaje(result.error || 'Error al eliminar médico', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarMensaje('Error de conexión', 'error');
    } finally {
        mostrarLoading(false);
    }
}

