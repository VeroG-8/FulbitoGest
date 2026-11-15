<?php

namespace App\Http\Controllers;

use App\Models\Jugador;
use App\Models\Tutor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class TutorController extends Controller
{
    private function esAdministrador(): bool
    {
        return in_array(auth()->user()->rol, ['admin', 'superadmin'], true);
    }

    private function autorizarConsulta(): void
    {
        $rol = auth()->user()->rol;

        abort_unless(
            in_array($rol, ['admin', 'superadmin', 'tutor'], true),
            403,
            'No tienes permiso para consultar el módulo de tutores.'
        );
    }

    private function autorizarEdicion(Tutor $tutor): void
    {
        $usuario = auth()->user();

        if ($this->esAdministrador()) {
            return;
        }

        abort_unless(
            $usuario->rol === 'tutor'
                && (int) $usuario->tutor_id === (int) $tutor->id,
            403,
            'No tienes permiso para modificar este tutor.'
        );
    }

    /**
     * Listado de tutores activos.
     */
    public function index()
    {
        $this->autorizarConsulta();

        $usuario = auth()->user();
        $consulta = Tutor::query();

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
        abort_unless($this->esAdministrador(), 403);

        $jugadores = Jugador::where('estado', true)
            ->withCount('tutores')
            ->orderBy('apellido')
            ->orderBy('nombre')
            ->get(['id', 'dni', 'nombre', 'apellido']);

        return Inertia::render('Tutores/Create', [
            'jugadores' => $jugadores,
        ]);
    }

    /**
     * Registrar un tutor y, opcionalmente, asociarlo a un jugador.
     */
    public function store(Request $request)
    {
        abort_unless($this->esAdministrador(), 403);

        $datos = $request->validate([
            'dni' => [
                'required',
                'string',
                'max:20',
                Rule::unique('tutores', 'dni'),
            ],
            'nombre' => 'required|string|max:100',
            'apellido' => 'required|string|max:100',
            'email' => 'nullable|email|max:150',
            'telefono' => 'nullable|string|max:30',
            'direccion' => 'nullable|string|max:150',
            'localidad' => 'nullable|string|max:100',
            'jugador_id' => [
                'nullable',
                'integer',
                Rule::exists('jugadores', 'id')->where('estado', true),
            ],
            'parentesco' => [
                'nullable',
                'required_with:jugador_id',
                'string',
                'max:50',
            ],
        ], [
            'dni.required' => 'El DNI es obligatorio.',
            'dni.unique' => 'Ya existe un tutor registrado con ese DNI.',
            'nombre.required' => 'El nombre es obligatorio.',
            'apellido.required' => 'El apellido es obligatorio.',
            'jugador_id.exists' => 'El jugador seleccionado no existe o está inactivo.',
            'parentesco.required_with' => 'Debes indicar el parentesco del tutor con el jugador.',
            'parentesco.max' => 'El parentesco no puede superar los 50 caracteres.',
        ]);

        if (
            isset($datos['jugador_id'])
            && trim($datos['parentesco'] ?? '') === ''
        ) {
            throw ValidationException::withMessages([
                'parentesco' => 'Debes indicar el parentesco del tutor con el jugador.',
            ]);
        }

        DB::transaction(function () use ($datos) {
            $tutor = Tutor::create([
                'dni' => $datos['dni'],
                'nombre' => $datos['nombre'],
                'apellido' => $datos['apellido'],
                'email' => $datos['email'] ?? null,
                'telefono' => $datos['telefono'] ?? null,
                'direccion' => $datos['direccion'] ?? null,
                'localidad' => $datos['localidad'] ?? null,
                'estado' => true,
            ]);

            // La asociación es opcional.
            if (empty($datos['jugador_id'])) {
                return;
            }

            $jugador = Jugador::whereKey($datos['jugador_id'])
                ->lockForUpdate()
                ->firstOrFail();

            $cantidadTutores = $jugador->tutores()->count();

            if ($cantidadTutores >= 2) {
                throw ValidationException::withMessages([
                    'jugador_id' => 'Este jugador ya tiene el máximo de dos tutores asociados.',
                ]);
            }

            $hayTitular = $jugador->tutores()
                ->wherePivot('es_tutor_principal', true)
                ->exists();

            // Si no hay tutor, el nuevo será titular.
            // Si ya hay uno, el nuevo será suplente.
            $esPrincipal = $cantidadTutores === 0 || !$hayTitular;

            if ($esPrincipal) {
                DB::table('jugador_tutor')
                    ->where('jugador_id', $jugador->id)
                    ->update(['es_tutor_principal' => false]);
            }

            $jugador->tutores()->attach($tutor->id, [
                'parentesco' => trim($datos['parentesco']),
                'es_tutor_principal' => $esPrincipal,
            ]);
        });

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
            abort_unless($this->esAdministrador(), 403);
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

        $tutor->load([
            'jugadores:id,dni,nombre,apellido',
        ]);

        return Inertia::render('Tutores/Edit', [
            'tutor' => $tutor,
            'puedeAdministrarRelaciones' => $this->esAdministrador(),
        ]);
    }

    /**
     * Actualizar datos personales y, para administradores,
     * el parentesco de cada jugador asociado.
     */
    public function update(Request $request, Tutor $tutor)
    {
        $this->autorizarEdicion($tutor);

        $reglas = [
            'dni' => [
                'required',
                'string',
                'max:20',
                Rule::unique('tutores', 'dni')->ignore($tutor->id),
            ],
            'nombre' => 'required|string|max:100',
            'apellido' => 'required|string|max:100',
            'email' => 'nullable|email|max:150',
            'telefono' => 'nullable|string|max:30',
            'direccion' => 'nullable|string|max:150',
            'localidad' => 'nullable|string|max:100',
        ];

        if ($this->esAdministrador() && $request->has('relaciones')) {
            $reglas['relaciones'] = ['array'];
            $reglas['relaciones.*.jugador_id'] = [
                'required',
                'integer',
                'distinct',
                'exists:jugadores,id',
            ];
            $reglas['relaciones.*.parentesco'] = [
                'required',
                'string',
                'max:50',
            ];
        }

        $datos = $request->validate($reglas, [
            'dni.required' => 'El DNI es obligatorio.',
            'dni.unique' => 'Ya existe otro tutor registrado con ese DNI.',
            'nombre.required' => 'El nombre es obligatorio.',
            'apellido.required' => 'El apellido es obligatorio.',
            'relaciones.*.parentesco.required' => 'El parentesco es obligatorio.',
            'relaciones.*.parentesco.max' => 'El parentesco no puede superar los 50 caracteres.',
        ]);

        foreach ($datos['relaciones'] ?? [] as $indice => $relacion) {
            if (trim($relacion['parentesco']) === '') {
                throw ValidationException::withMessages([
                    "relaciones.{$indice}.parentesco" => 'El parentesco es obligatorio.',
                ]);
            }
        }

        DB::transaction(function () use ($tutor, $datos) {
            $tutor->update([
                'dni' => $datos['dni'],
                'nombre' => $datos['nombre'],
                'apellido' => $datos['apellido'],
                'email' => $datos['email'] ?? null,
                'telefono' => $datos['telefono'] ?? null,
                'direccion' => $datos['direccion'] ?? null,
                'localidad' => $datos['localidad'] ?? null,
            ]);

            // Solo administradores pueden modificar parentescos.
            foreach ($datos['relaciones'] ?? [] as $relacion) {
                $jugador = $tutor->jugadores()
                    ->where('jugadores.id', $relacion['jugador_id'])
                    ->first();

                // No se permite crear asociaciones desde este formulario.
                abort_if(
                    !$jugador,
                    403,
                    'No puedes modificar una relación que no pertenece a este tutor.'
                );

                $tutor->jugadores()->updateExistingPivot(
                    $jugador->id,
                    ['parentesco' => trim($relacion['parentesco'])]
                );
            }
        });

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
        abort_unless($this->esAdministrador(), 403);

        $tutor->update(['estado' => false]);

        return redirect()
            ->route('tutores.index')
            ->with('success', 'Tutor deshabilitado correctamente.');
    }

    /**
     * Historial de tutores inactivos.
     */
    public function historial()
    {
        abort_unless($this->esAdministrador(), 403);

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
        abort_unless($this->esAdministrador(), 403);

        $tutor->update(['estado' => true]);

        return redirect()
            ->route('tutores.historial')
            ->with('success', 'Tutor reactivado correctamente.');
    }
}