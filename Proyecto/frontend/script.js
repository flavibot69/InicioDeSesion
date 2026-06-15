const API_URL = 'http://localhost:3000/api';
let isLoginMode = true;

// Al cargar la página, verificar si el usuario ya estaba logueado
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const userEmail = localStorage.getItem('userEmail');
    if (token && userEmail) {
        showDashboard(userEmail);
    }
});

// Intercambiar la vista entre Login y Registro
function toggleAuthMode() {
    isLoginMode = !isLoginMode;
    const title = document.getElementById('auth-title');
    const btn = document.getElementById('btn-primary');
    const toggleText = document.getElementById('toggle-auth');

    if (isLoginMode) {
        title.textContent = 'Iniciar Sesión';
        btn.textContent = 'Ingresar';
        toggleText.textContent = 'Regístrate aquí';
    } else {
        title.textContent = 'Registro de Usuario';
        btn.textContent = 'Registrarse';
        toggleText.textContent = 'Inicia sesión aquí';
    }
}

// Procesar el formulario de Autenticación (Login o Registro)
async function handleAuth(event) {
    event.preventDefault();
    const correo = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const endpoint = isLoginMode ? '/auth/login' : '/auth/register';

    try {
        const res = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ correo, password })
        });
        
        const data = await res.json();

        if (!res.ok) {
            alert(data.message || 'Ocurrió un error');
            return;
        }

        if (isLoginMode) {
            // Guardar sesión
            localStorage.setItem('token', data.token);
            localStorage.setItem('userEmail', data.user.correo);
            showDashboard(data.user.correo);
        } else {
            alert('¡Usuario registrado con éxito! Ya puedes iniciar sesión.');
            toggleAuthMode();
            document.getElementById('auth-form').reset();
        }
    } catch (error) {
        alert('No se pudo conectar con el servidor.');
    }
}

// Mostrar el Dashboard y cargar tareas
function showDashboard(email) {
    document.getElementById('auth-container').style.display = 'none';
    document.getElementById('dashboard-container').style.display = 'block';
    document.getElementById('user-display').textContent = email;
    loadTasks();
}

// Cargar tareas del usuario desde el Backend
async function loadTasks() {
    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`${API_URL}/tasks`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const tasks = await res.json();
        
        const list = document.getElementById('task-list');
        list.innerHTML = '';

        if (tasks.length === 0) {
            list.innerHTML = '<li class="empty-list">No tienes tareas pendientes. ¡Buen trabajo!</li>';
            return;
        }

        tasks.forEach(task => {
            const li = document.createElement('li');
            li.className = 'task-item';
            li.innerHTML = `<span>${task.titulo}</span>`;
            list.appendChild(li);
        });
    } catch (error) {
        console.error('Error al cargar tareas:', error);
    }
}

// Crear una nueva tarea
async function handleCreateTask(event) {
    event.preventDefault();
    const titulo = document.getElementById('task-title').value;
    const token = localStorage.getItem('token');

    try {
        const res = await fetch(`${API_URL}/tasks`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ titulo })
        });

        if (res.ok) {
            document.getElementById('task-form').reset();
            loadTasks();
        } else {
            alert('Error al crear la tarea');
        }
    } catch (error) {
        console.error(error);
    }
}

// Cerrar sesión limpiando el almacenamiento local
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    document.getElementById('auth-container').style.display = 'block';
    document.getElementById('dashboard-container').style.display = 'none';
    document.getElementById('auth-form').reset();
}