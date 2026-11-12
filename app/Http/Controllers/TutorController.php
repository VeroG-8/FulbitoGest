<?php

namespace App\Http\Controllers;

use App\Models\Tutor;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TutorController extends Controller
{
    /**
     * Comprueba si el usuario es administrador o superadministrador.
     */
    private function esAdministrador(): bool
    {
        return in_array(auth()->user()->rol, ['admin', 'superadmin'], true);
    }

    /**
     * Comprueba si el usuario puede consultar el módulo de tutores.
     */
    private function autorizarConsulta(): void
    {
        $rol = auth()->user()->rol;

        abort_unless(
            in_array($rol, ['admin', 'superadmin', 'tutor'], true),
            403,
            'No tienes permiso para consultar el módulo de tutores.'
        );
    }

    /**
     * Comprueba si el usuario puede editar un tutor determinado.
     */
    private function autorizarEdicion(Tutor $tutor): void
    {
        $usuario = auth()->user();

        if ($this->esAdministrador()) {
            return;
        }

        if (
            $usuario->rol === 'tutor' &&
            (int) $usuario->tutor_id === (int) $tutor->id
        ) {
            return;
        }

        abort(403, 'No tienes permiso para modificar este tutor.');
    }

    /**
     * Listado de tutores activos.
     */
    public function index()
    {
        $this->autorizarConsulta();

        $usuario = auth()->user();

        $consulta = Tutor::query();

        // El tutor solamente puede consultar su propio registro.
        if ($usuario->rol === 'tutor') {
            $consulta->where('id', $usuario->tutor_id);
        }

        $totalActivos = (clone $consulta)
            ->where('estado', true)
            ->count();

        $totalInactivos = $this->esAdministrador()
            ? (clone $consulta)->where('estado', false)->count()
            : 0;

        $tutores = (clone $consulta)
            ->where('estado', true)
            ->orderBy('apellido')
            ->orderBy('nombre')
            ->get();

        return Inertia::render('Tutores/Index', [
            'tutores' => $tutores,
            'totalActivos' => $totalActivos,
            'totalInactivos' => $totalInactivos,
            'puedeAdministrar' => $this->esAdministrador(),
        ]);
    }

    /**
     * Formulario para crear un tutor.
     */
    public function create()
    {
        abort_unless(
            $this->esAdministrador(),
            403,
            'No tienes permiso para crear tutores.'
        );

        return Inertia::render('Tutores/Create');
    }

    /**
     * Registrar un tutor.
     */
    public function store(Request $request)
    {
        abort_unless(
            $this->esAdministrador(),
            403,
            'No tienes permiso para crear tutores.'
        );

        $validated = $request->validate([
            'dni' => 'required|string|max:20|unique:tutores,dni',
            'nombre' => 'required|string|max:100',
            'apellido' => 'required|string|max:100',
            'email' => 'nullable|email|max:150',
            'telefono' => 'nullable|string|max:30',
            'direccion' => 'nullable|string|max:150',
            'localidad' => 'nullable|string|max:100',
        ]);

        Tutor::create([
            ...$validated,
            'estado' => true,
        ]);

        return redirect()
            ->route('tutores.index')
            ->with('success', 'Tutor creado correctamente.');
    }

    /**
     * Mostrar la ficha de un tutor.
     */
    public function show(Tutor $tutor)
    {
        $usuario = auth()->user();

        if ($usuario->rol === 'tutor') {
            abort_unless(
                (int) $usuario->tutor_id === (int) $tutor->id,
                403,
                'No tienes permiso para consultar este tutor.'
            );
        } else {
            abort_unless(
                $this->esAdministrador(),
                403,
                'No tienes permiso para consultar fichas de tutores.'
            );
        }

        $tutor->load('jugadores');

        return Inertia::render('Tutores/Show', [
            'tutor' => $tutor,
        ]);
    }

    /**
     * Formulario para editar un tutor.
     */
    public function edit(Tutor $tutor)
    {
        $this->autorizarEdicion($tutor);

        return Inertia::render('Tutores/Edit', [
            'tutor' => $tutor,
        ]);
    }

    /**
     * Actualizar los datos personales y de contacto.
     */
    public function update(Request $request, Tutor $tutor)
    {
        $this->autorizarEdicion($tutor);

        $validated = $request->validate([
            'dni' => 'required|string|max:20|unique:tutores,dni,' . $tutor->id,
            'nombre' => 'required|string|max:100',
            'apellido' => 'required|string|max:100',
            'email' => 'nullable|email|max:150',
            'telefono' => 'nullable|string|max:30',
            'direccion' => 'nullable|string|max:150',
            'localidad' => 'nullable|string|max:100',
        ]);

        $tutor->update($validated);

        if (auth()->user()->rol === 'tutor') {
            return redirect()
                ->route('tutores.show', $tutor->id)
                ->with('success', 'Tus datos se actualizaron correctamente.');
        }

        return redirect()
            ->route('tutores.index')
            ->with('success', 'Tutor actualizado correctamente.');
    }

    /**
     * Desactivar un tutor.
     */
    public function destroy(Tutor $tutor)
    {
        abort_unless(
            $this->esAdministrador(),
            403,
            'No tienes permiso para deshabilitar tutores.'
        );

        $tutor->update([
            'estado' => false,
        ]);

        return redirect()
            ->route('tutores.index')
            ->with('success', 'Tutor deshabilitado correctamente.');
    }

    /**
     * Consultar historial de tutores inactivos.
     */
    /**
 * Consultar historial de tutores inactivos.
 * Exclusivo de administradores y superadministradores.
 */
public function historial()
{
    abort_unless(
        $this->esAdministrador(),
        403,
        'No tienes permiso para consultar el historial de tutores.'
    );

    $tutores = Tutor::where('estado', false)
        ->orderBy('apellido')
        ->orderBy('nombre')
        ->get();

    return Inertia::render('Tutores/Historial', [
        'tutores' => $tutores,
    ]);
}

    /**
     * Reactivar un tutor.
     */
    public function reactivar(Tutor $tutor)
    {
        abort_unless(
            $this->esAdministrador(),
            403,
            'No tienes permiso para reactivar tutores.'
        );

        $tutor->update([
            'estado' => true,
        ]);

        return redirect()
            ->route('tutores.historial')
            ->with('success', 'Tutor reactivado correctamente.');
    }
}