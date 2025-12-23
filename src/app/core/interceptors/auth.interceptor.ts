import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  let token: string | null = null;

  // Verificar que estamos en navegador y que existe localStorage
  if (typeof window !== 'undefined' && window.localStorage) {
    token = localStorage.getItem('token'); // o el nombre que uses
  }

  // Si existe el token, clonar la petición y agregar el header
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req);
};
