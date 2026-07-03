// Utilidad para autenticación con localStorage

const AUTH_KEY = 'gang_web_auth';
// Cambia esta contraseña por la que quieras
const CORRECT_PASSWORD = 'vnf2026';

// Derivamos un token simple de la contraseña actual. Si cambias la
// contraseña, el token cambiará y lo almacenado anteriormente dejará de
// ser válido (por eso al cambiar la contraseña ya no se podrá entrar).
const getAuthToken = (): string => {
  try {
    return btoa(CORRECT_PASSWORD);
  } catch (error) {
    return CORRECT_PASSWORD;
  }
};

/**
 * Verifica si el usuario ya está autenticado (compara token derivado)
 */
export const isAuthenticated = (): boolean => {
  try {
    const stored = localStorage.getItem(AUTH_KEY);
    return stored === getAuthToken();
  } catch (error) {
    console.error('Error al leer localStorage:', error);
    return false;
  }
};

/**
 * Valida la contraseña ingresada
 */
export const validatePassword = (password: string): boolean => {
  return password.toLowerCase() === CORRECT_PASSWORD;
};

/**
 * Guarda el estado de autenticación en localStorage usando el token derivado
 */
export const saveAuthentication = (): void => {
  try {
    localStorage.setItem(AUTH_KEY, getAuthToken());
  } catch (error) {
    console.error('Error al guardar en localStorage:', error);
  }
};

/**
 * Borra la autenticación (para desarrollo/debug)
 */
export const clearAuthentication = (): void => {
  try {
    localStorage.removeItem(AUTH_KEY);
  } catch (error) {
    console.error('Error al borrar de localStorage:', error);
  }
};

/**
 * Si hay un valor guardado que no coincide con el token derivado de la
 * contraseña actual, lo eliminamos. Esto fuerza que el usuario tenga que
 * re-autenticarse después de cambiar la contraseña en el código.
 */
export const ensureAuthValid = (): void => {
  try {
    const stored = localStorage.getItem(AUTH_KEY);
    if (stored && stored !== getAuthToken()) {
      localStorage.removeItem(AUTH_KEY);
    }
  } catch (error) {
    console.error('Error al validar/auth en localStorage:', error);
  }
};
