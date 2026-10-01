const REG_URL = 'https://emi.aprende.gob.mx/api/user/v1/account/registration/';
const LOGIN_URL = 'https://emi.aprende.gob.mx/api/user/v1/account/login_session/';

// Configuraciones centralizadas
const CONFIG = {
  fieldNames: {
    'name': 'Nombre completo',
    'username': 'Nombre de usuario', 
    'email': 'Correo electrónico',
    'password': 'Contraseña',
    'honor_code': 'Código de honor',
    'terms_of_service': 'Términos de servicio',
    'first_name': 'Nombre',
    'last_name': 'Apellido',
    'country': 'País',
    'year_of_birth': 'Año de nacimiento',
    'level_of_education': 'Nivel de educación',
    'goals': 'Objetivos',
    'mailing_address': 'Dirección postal',
    'city': 'Ciudad',
    'gender': 'Género'
  },
  
  translations: {
    'Username must be unique.': 'El nombre de usuario debe ser único.',
    'This username is already taken.': 'Este nombre de usuario ya está en uso.',
    'It looks like this username is already taken': 'Parece que este nombre de usuario ya está en uso.',
    'Username must be at least 2 characters long.': 'El nombre de usuario debe tener al menos 2 caracteres.',
    'Username must be at most 30 characters long.': 'El nombre de usuario debe tener máximo 30 caracteres.',
    'Username must be between 2 and 30 characters long.': 'El nombre de usuario debe tener al menos 2 y máximo 30 caracteres.',
    'Username must only contain letters, numbers, and underscore (_) characters.': 'El nombre de usuario solo puede contener letras, números y guiones bajos (_).',
    'A properly formatted e-mail is required': 'Se requiere un correo electrónico con formato correcto.',
    'Email must be unique.': 'El correo electrónico debe ser único.',
    'This email is already registered.': 'Este correo electrónico ya está registrado.',
    'This email is already associated with an existing account': 'Este correo electrónico ya está asociado con una cuenta existente.',
    'Enter a valid email address.': 'Ingresa una dirección de correo electrónico válida.',
    'Email is required.': 'El correo electrónico es obligatorio.',
    'Password must be at least 8 characters long.': 'La contraseña debe tener al menos 8 caracteres.',
    'This password is too short. It must contain at least 8 characters.': 'La contraseña es muy corta. Debe tener al menos 8 caracteres.',
    'The password is too similar to the username.': 'La contraseña es demasiado similar al nombre de usuario.',
    'Password must contain at least one number.': 'La contraseña debe contener al menos un número.',
    'Password must contain at least one letter.': 'La contraseña debe contener al menos una letra.',
    'Password must contain at least one uppercase letter.': 'La contraseña debe contener al menos una letra mayúscula.',
    'Password must contain at least one lowercase letter.': 'La contraseña debe contener al menos una letra minúscula.',
    'Password must contain at least one special character.': 'La contraseña debe contener al menos un carácter especial.',
    'Password is too common.': 'La contraseña es muy común.',
    'Password is too similar to your personal information.': 'La contraseña es muy similar a tu información personal.',
    'Name is required.': 'El nombre es obligatorio.',
    'Name must be at least 2 characters long.': 'El nombre debe tener al menos 2 caracteres.',
    'This field is required.': 'Este campo es obligatorio.',
    'This field cannot be blank.': 'Este campo no puede estar vacío.',
    'Invalid input.': 'Entrada inválida.',
    'Registration failed.': 'El registro falló.',
    'User already exists.': 'El usuario ya existe.',
    'Invalid data.': 'Datos inválidos.'
  },
  
  formFields: ['name', 'username', 'email', 'password', 'honor_code'],
  
  specificErrorMessages: {
    'duplicate-username': 'Este nombre de usuario ya está en uso.',
    'duplicate-email': 'Este correo electrónico ya está asociado con una cuenta existente.',
    'duplicate-email-username': 'Tanto el correo electrónico como el nombre de usuario ya están en uso.'
  }
};

// Utilidades
const getCookie = (name) => {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
};

const getFieldDisplayName = (fieldName) => CONFIG.fieldNames[fieldName] || fieldName;
const translateErrorMessage = (message) => CONFIG.translations[message] || message;

// Manejo de errores del DOM
function clearFormErrors() {
  const generalErrors = document.getElementById('general-errors');
  if (generalErrors) {
    generalErrors.style.display = 'none';
    generalErrors.innerHTML = '';
  }
  
  CONFIG.formFields.forEach(field => {
    const errorElement = document.getElementById(field + '-error');
    const inputElement = document.getElementById(field);
    const inputGroup = inputElement?.closest('.input-group');
    
    if (errorElement) {
      errorElement.style.display = 'none';
      errorElement.innerHTML = '';
    }
    
    if (inputElement) {
      inputElement.classList.remove('is-invalid');
    }
    
    if (inputGroup) {
      inputGroup.classList.remove('has-error');
    }
  });
}

function showFieldError(fieldName, message) {
  const errorElement = document.getElementById(fieldName + '-error');
  const inputElement = document.getElementById(fieldName);
  const inputGroup = inputElement?.closest('.input-group');
  
  if (errorElement) {
    errorElement.innerHTML = translateErrorMessage(message);
    errorElement.style.display = 'block';
  }
  
  if (inputElement) {
    inputElement.classList.add('is-invalid');
  }
  
  if (inputGroup) {
    inputGroup.classList.add('has-error');
  }
}

function showGeneralError(message) {
  const generalErrors = document.getElementById('general-errors');
  if (generalErrors) {
    generalErrors.innerHTML = '<div class="general-error">' + translateErrorMessage(message) + '</div>';
    generalErrors.style.display = 'block';
  }
}

// Manejo de sugerencias de username
function createUsernameSuggestions(suggestions) {
  if (!suggestions || !Array.isArray(suggestions)) return '';
  
  let suggestionsHtml = '<div class="username-suggestions" style="margin-top: 10px;">';
  suggestionsHtml += '<p style="margin-bottom: 5px; font-size: 12px; color: #666;">Prueba con alguna de estas opciones:</p>';
  
  suggestions.slice(0, 3).forEach(suggestion => {
    suggestionsHtml += `<button type="button" class="btn btn-sm btn-outline-primary me-2 mb-2 username-suggestion-btn" 
                        onclick="selectUsernameSuggestion('${suggestion}')" 
                        style="font-size: 11px; padding: 2px 8px;">${suggestion}</button>`;
  });
  
  suggestionsHtml += '</div>';
  return suggestionsHtml;
}

// Procesamiento de errores de validación
const ErrorHandlers = {
  processFieldErrors(responseData, fieldName) {
    if (!responseData[fieldName] || !Array.isArray(responseData[fieldName])) return false;
    
    const messages = responseData[fieldName].map(error => error.user_message);
    const translatedMessages = messages.map(message => translateErrorMessage(message));
    const errorMessage = translatedMessages.join(', ');
    
    if (errorMessage) {
      showFieldError(fieldName, errorMessage);
      return true;
    }
    return false;
  },

  handleValidationErrors(responseData) {
    let hasErrors = false;
    
    // Procesar errores de todos los campos
    ['username', 'password', 'email', 'name'].forEach(field => {
      if (this.processFieldErrors(responseData, field)) {
        hasErrors = true;
      }
    });
    
    return hasErrors;
  },

  handleSpecificErrors(responseData) {
    let hasErrors = false;
    
    // Username duplicado con sugerencias
    if (responseData.error_code === 'duplicate-username') {
      let errorMessage = CONFIG.specificErrorMessages['duplicate-username'];
      errorMessage += createUsernameSuggestions(responseData.username_suggestions);
      showFieldError('username', errorMessage);
      hasErrors = true;
    }
    
    // Email duplicado
    if (responseData.error_code === 'duplicate-email') {
      showFieldError('email', CONFIG.specificErrorMessages['duplicate-email']);
      hasErrors = true;
    }
    
    // Email y username duplicados (nuevo caso)
    if (responseData.error_code === 'duplicate-email-username') {
      // Mostrar error específico para email
      if (responseData.email && Array.isArray(responseData.email)) {
        const emailMessages = responseData.email.map(error => error.user_message);
        const emailError = emailMessages.map(message => translateErrorMessage(message)).join(', ');
        showFieldError('email', emailError);
        hasErrors = true;
      }
      
      // Mostrar error específico para username con sugerencias
      if (responseData.username && Array.isArray(responseData.username)) {
        const usernameMessages = responseData.username.map(error => error.user_message);
        let usernameError = usernameMessages.map(message => translateErrorMessage(message)).join(', ');
        usernameError += createUsernameSuggestions(responseData.username_suggestions);
        showFieldError('username', usernameError);
        hasErrors = true;
      }
    }

    return hasErrors;
  },

  handleGenericErrors(responseData) {
    let hasErrors = false;
    
    // Field errors genéricos
    if (responseData.field_errors) {
      Object.entries(responseData.field_errors).forEach(([field, errors]) => {
        const errorList = Array.isArray(errors) ? errors : [errors];
        showFieldError(field, errorList.join(', '));
        hasErrors = true;
      });
    }
    
    // Validation errors genéricos
    if (responseData.validation_errors) {
      Object.entries(responseData.validation_errors).forEach(([field, errors]) => {
        const errorList = Array.isArray(errors) ? errors : [errors];
        showFieldError(field, errorList.join(', '));
        hasErrors = true;
      });
    }
    
    // Errores no específicos de campo
    if (responseData.non_field_errors) {
      const errors = Array.isArray(responseData.non_field_errors) 
        ? responseData.non_field_errors : [responseData.non_field_errors];
      showGeneralError(errors.join(', '));
      hasErrors = true;
    }
    
    // Otros errores generales
    const generalErrorFields = ['error', 'message', 'detail'];
    for (const field of generalErrorFields) {
      if (responseData[field]) {
        showGeneralError(responseData[field]);
        hasErrors = true;
        break;
      }
    }
    
    // String directo
    if (typeof responseData === 'string') {
      showGeneralError(responseData);
      hasErrors = true;
    }
    
    return hasErrors;
  }
};

// Función principal de manejo de errores
function handleApiError(err) {
  console.error('Error completo:', err);
  
  let hasSpecificErrors = false;
  
  if (err.response?.data) {
    const responseData = err.response.data;
    console.log('Contenido de responseData:', JSON.stringify(responseData, null, 2));
    
    // Manejar errores en orden de prioridad
    hasSpecificErrors = ErrorHandlers.handleSpecificErrors(responseData) ||
                       (responseData.error_code === 'validation-error' && ErrorHandlers.handleValidationErrors(responseData)) ||
                       ErrorHandlers.handleGenericErrors(responseData);
  }
  
  // Error genérico si no hay errores específicos
  if (!hasSpecificErrors) {
    const errorMessage = err.request 
      ? 'No se pudo conectar con el servidor. Verifique su conexión a internet.'
      : 'Error inesperado. Por favor, inténtelo de nuevo.';
    showGeneralError(errorMessage);
  }
}

// Funciones principales
async function enviarRegistro(event) {
  event.preventDefault();
  clearFormErrors();

  const formData = new URLSearchParams({
    name: document.getElementById('name').value.trim(),
    username: document.getElementById('username').value.trim(),
    email: document.getElementById('email').value.trim(),
    password: document.getElementById('password').value.trim(),
    honor_code: 'true',
    terms_of_service: 'true'
  });

  try {
    const resp = await axios.post(REG_URL, formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-CSRFToken': getCookie('csrftoken'),
        'X-Requested-With': 'XMLHttpRequest'
      },
      withCredentials: true
    });

    alert('¡Registro exitoso!');
    window.location.href = resp.data.redirect_url || "/dashboard";

  } catch (err) {
    handleApiError(err);
  }
}

async function loginUsuario(event) {
  event.preventDefault();

  const formData = new URLSearchParams({
    email: document.getElementById('login_email').value.trim(),
    password: document.getElementById('login_password').value.trim()
  });

  try {
    const resp = await axios.post(LOGIN_URL, formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-CSRFToken': getCookie('csrftoken'),
        'X-Requested-With': 'XMLHttpRequest'
      },
      withCredentials: true
    });

    window.location.href = resp.data.redirect_url || "/dashboard";
  } catch (err) {
    console.error(err);
    alert("Error de autenticación: " + (err.response?.data?.error || "Credenciales inválidas"));
  }
}

// Funciones de utilidad
function togglePassword(inputId) {
  const input = document.getElementById(inputId);
  const icon = document.getElementById(inputId + '_icon');
  
  const isPassword = input.type === 'password';
  input.type = isPassword ? 'text' : 'password';
  icon.classList.toggle('bi-eye', !isPassword);
  icon.classList.toggle('bi-eye-slash', isPassword);
}

function selectUsernameSuggestion(suggestion) {
  const usernameInput = document.getElementById('username');
  if (!usernameInput) return;
  
  usernameInput.value = suggestion;
  
  // Limpiar errores
  const usernameError = document.getElementById('username-error');
  const inputGroup = usernameInput.closest('.input-group');
  
  if (usernameError) {
    usernameError.style.display = 'none';
    usernameError.innerHTML = '';
  }
  
  usernameInput.classList.remove('is-invalid');
  inputGroup?.classList.remove('has-error');
  usernameInput.focus();
}

function mostrarInicioSesion() {
  document.getElementById('formularioLogin').style.display = 'block';
  document.getElementById('formularioRegistro').style.display = 'none';
  document.getElementById('formularioOlvideMiContrasena').style.display = 'none';
}

function mostrarRegistro() {
  document.getElementById('formularioLogin').style.display = 'none';
  document.getElementById('formularioRegistro').style.display = 'block';
  document.getElementById('formularioOlvideMiContrasena').style.display = 'none';
}

function mostrarOlvideMiContrasena() {
  document.getElementById('formularioLogin').style.display = 'none';
  document.getElementById('formularioRegistro').style.display = 'none';
  document.getElementById('formularioOlvideMiContrasena').style.display = 'block';
  
  // Limpiar mensajes previos
  document.getElementById('password-reset-errors').style.display = 'none';
  document.getElementById('password-reset-success').style.display = 'none';
  document.getElementById('password_reset_email').value = '';
}

async function enviarRecuperacionContrasena(event) {
  event.preventDefault();

  const email = document.getElementById('password_reset_email').value.trim();
  const errorsDiv = document.getElementById('password-reset-errors');
  const successDiv = document.getElementById('password-reset-success');
  
  // Limpiar mensajes previos
  errorsDiv.style.display = 'none';
  successDiv.style.display = 'none';

  if (!email) {
    mostrarError('Por favor, ingresa tu correo electrónico.');
    return;
  }

  const formData = new URLSearchParams({
    email: email
  });

  try {
    const response = await axios.post('/account/password', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-CSRFToken': getCookie('csrftoken'),
        'X-Requested-With': 'XMLHttpRequest'
      },
      withCredentials: true
    });

    // Mostrar mensaje de éxito
    successDiv.innerHTML = `
      <div class="d-flex align-items-center">
        <i class="bi bi-check-circle-fill me-2"></i>
        <div>
          <strong>¡Enlace enviado!</strong><br>
          <small>Revisa tu correo electrónico. Te hemos enviado un enlace para restablecer tu contraseña.</small>
        </div>
      </div>
    `;
    successDiv.style.display = 'block';

    // Limpiar el formulario
    document.getElementById('password_reset_email').value = '';
    
  } catch (err) {
    console.error('Error en reset de contraseña:', err);
    
    let errorMessage = 'Error al enviar el enlace de recuperación. ';
    
    if (err.response?.status === 403) {
      errorMessage += 'Has realizado demasiadas solicitudes recientemente. Espera unos minutos antes de volver a intentarlo.';
    } else if (err.response?.status === 400) {
      errorMessage += 'Por favor, verifica que el correo electrónico sea válido.';
    } else if (err.response?.status === 500) {
      errorMessage += 'Error del servidor. Por favor, inténtalo nuevamente.';
    } else {
      errorMessage += 'Por favor, inténtalo nuevamente.';
    }
    
    mostrarError(errorMessage);
  }
  
  function mostrarError(mensaje) {
    errorsDiv.innerHTML = `
      <div class="d-flex align-items-center">
        <i class="bi bi-exclamation-triangle-fill me-2"></i>
        <div>${mensaje}</div>
      </div>
    `;
    errorsDiv.style.display = 'block';
  }
}

document.addEventListener('DOMContentLoaded', mostrarInicioSesion);