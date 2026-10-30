<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class VerificarRol
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $usuario = $request->user();

        if (!$usuario) {
            abort(401, 'Debes iniciar sesión para acceder.');
        }

        // El superadministrador también puede acceder a las rutas de admin.
        if ($usuario->rol === 'superadmin' && in_array('admin', $roles, true)) {
            return $next($request);
        }

        if (!in_array($usuario->rol, $roles, true)) {
            abort(403, 'No tienes permisos para acceder a esta sección.');
        }

        return $next($request);
    }
}