<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use App\Models\Categoria;
use App\Models\Jugador;
use App\Models\Tutor;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class JugadorController extends Controller
{
    /**
     * Comprobar si el usuario es administrador o superadministrador.
     */
    private function esAdministrador(): bool
    {
        return in_array(auth()->user()->rol, ['admin', 'superadmin']);
    }

    /**
     * Comprobar si el jugador está asociado al tutor autenticado.
     */
    private function esJugadorDelTutor(Jugador $jugador): bool
    {
        $usuario = auth()->user();

        return $usuario->rol === 'tutor'
            && $jugador->tutores()
                ->where('tutores.id', $usuario->tutor_id)
                ->exists();
    }

    /**
     * Autorizar la edición de un jugador.
     */
    private function autorizarEdicion(Jugador $jugador): void
    {
        if ($this->esAdministrador()) {
            return;
        }

        abort_unless(
            $this->esJugadorDelTutor($jugador),
            403,
            'No tienes permiso para modificar este jugador.'
        );
    }

    /**
     * Mostrar el listado de jugadores activos.
     */
        public function index(Request $request)
    {
        $usuario = auth()->user();

        $consulta = Jugador::with('categoria:id,anio')
            ->where('estado', true);

        $consultaInactivos = Jugador::where('estado', false);

        // Restringir jugadores según el profesor.
        if ($usuario->rol === 'profesor') {
            $filtroProfesor = function ($query) use ($usuario) {
                $query->where('profesores.id', $usuario->profesor_id);
            };

            $consulta->whereHas('categoria.profesores', $filtroProfesor);
            $consultaInactivos->whereHas('categoria.profesores', $filtroProfesor);
        }

        // Restringir jugadores según el tutor.
        if ($usuario->rol === 'tutor') {
            $filtroTutor = function ($query) use ($usuario) {
                $query->where('tutores.id', $usuario->tutor_id);
            };

            $consulta->whereHas('tutores', $filtroTutor);
            $consultaInactivos->whereHas('tutores', $filtroTutor);
        }

        $totalInactivos = $consultaInactivos->count();

        // Categorías disponibles para el usuario.
        $categorias = Categoria::whereIn(
            'id',
            (clone $consulta)->select('categoria_id')->distinct()
        )
            ->orderBy('anio', 'desc')
            ->get(['id', 'anio']);

        // Búsqueda por nombre, apellido o DNI.
        $buscar = trim($request->input('buscar', ''));

        if ($buscar !== '') {
            $consulta->where(function ($query) use ($buscar) {
                $query->where('nombre', 'like', "%{$buscar}%")
                    ->orWhere('apellido', 'like', "%{$buscar}%")
                    ->orWhere('dni', 'like', "%{$buscar}%");
            });
        }

        // Filtro por múltiples categorías.
        $categoria = $request->input('categoria', []);

        if (!is_array($categoria)) {
            $categoria = $categoria !== '' ? [$categoria] : [];
        }

        $categoria = array_values(array_filter(
            $categoria,
            fn ($id) => filter_var($id, FILTER_VALIDATE_INT) !== false
        ));

        if (!empty($categoria)) {
            $consulta->whereIn('categoria_id', $categoria);
        }

        // Ordenamiento seguro.
        $orden = $request->input('orden', 'apellido');
        $direccion = $request->input('direccion', 'asc');

        if (!in_array($orden, ['apellido', 'dni'], true)) {
            $orden = 'apellido';
        }

        if (!in_array($direccion, ['asc', 'desc'], true)) {
            $direccion = 'asc';
        }

        if ($orden === 'dni') {
            $consulta->orderBy('dni', $direccion)
                ->orderBy('apellido')
                ->orderBy('nombre');
        } else {
            $consulta->orderBy('apellido', $direccion)
                ->orderBy('nombre', $direccion);
        }

        $jugadores = $consulta
            ->paginate(10)
            ->withQueryString();

        $esAdministrador = $this->esAdministrador();

        $permisos = [
            'crear' => $esAdministrador,
            'editar' => $esAdministrador || $usuario->rol === 'tutor',
            'eliminar' => $esAdministrador,
            'historial' => $esAdministrador,
        ];

        return Inertia::render('Jugadores/Index', [
            'jugadores' => $jugadores,
            'categorias' => $categorias,
            'totalInactivos' => $totalInactivos,
            'filtros' => [
                'buscar' => $buscar,
                'categoria' => $categoria,
                'orden' => $orden,
                'direccion' => $direccion,
            ],
            'permisos' => $permisos,
        ]);
    }

    /**
     * Mostrar el formulario de creación.
     */
    public function create()
    {
        abort_unless(
            $this->esAdministrador(),
            403,
            'No tienes permiso para crear jugadores.'
        );

        $categorias = Categoria::where('estado', true)
            ->orderBy('anio', 'desc')
            ->get(['id', 'anio']);

        return Inertia::render('Jugadores/Create', [
            'categorias' => $categorias,
        ]);
    }

    /**
     * Guardar un nuevo jugador.
     */
    public function store(Request $request)
    {
        abort_unless(
            $this->esAdministrador(),
            403,
            'No tienes permiso para crear jugadores.'
        );

        $validated = $request->validate([
            'dni' => [
                'required',
                'string',
                'max:20',
                Rule::unique('jugadores', 'dni'),
            ],
            'nombre' => 'required|string|max:100',
            'apellido' => 'required|string|max:100',
            'nacionalidad' => 'nullable|string|max:100',
            'fecha_nacimiento' => 'required|date',
            'telefono' => 'nullable|string|max:30',
            'direccion' => 'nullable|string|max:255',
            'localidad' => 'nullable|string|max:100',
            'categoria_id' => [
                'required',
                Rule::exists('categorias', 'id')
                    ->where(fn ($query) => $query->where('estado', true)),
            ],
        ], [
            'dni.required' => 'El DNI es obligatorio.',
            'dni.unique' => 'Ya existe un jugador registrado con ese DNI.',
            'nombre.required' => 'El nombre es obligatorio.',
            'apellido.required' => 'El apellido es obligatorio.',
            'fecha_nacimiento.required' => 'La fecha de nacimiento es obligatoria.',
            'categoria_id.required' => 'Debés seleccionar una categoría.',
            'categoria_id.exists' => 'La categoría seleccionada no está disponible.',
        ]);

        Jugador::create([
            ...$validated,
            'estado' => true,
        ]);

        return redirect()
            ->route('jugadores.index')
            ->with('success', 'Jugador creado correctamente.');
    }

    /**
     * Mostrar el formulario de edición.
     */
        /**
     * Mostrar el formulario de edición.
     */
    public function edit(Jugador $jugador)
    {
        $this->autorizarEdicion($jugador);

        $puedeModificarCategoria = $this->esAdministrador();

        // Solamente los administradores reciben las categorías disponibles.
        $categorias = $puedeModificarCategoria
            ? Categoria::where('estado', true)
                ->orWhere('id', $jugador->categoria_id)
                ->orderBy('anio', 'desc')
                ->get(['id', 'anio'])
            : [];

        // Formatear fecha para el input type="date".
        $jugador->fecha_nacimiento = $jugador->fecha_nacimiento
            ? $jugador->fecha_nacimiento->format('Y-m-d')
            : null;

        return Inertia::render('Jugadores/Edit', [
            'jugador' => $jugador,
            'categorias' => $categorias,
            'puedeModificarCategoria' => $puedeModificarCategoria,
        ]);
    }

    /**
     * Actualizar los datos de un jugador.
     */
    public function update(Request $request, Jugador $jugador)
    {
        $this->autorizarEdicion($jugador);

        $reglasPersonales = [
            'dni' => [
                'required',
                'string',
                'max:20',
                Rule::unique('jugadores', 'dni')->ignore($jugador->id),
            ],
            'nombre' => 'required|string|max:100',
            'apellido' => 'required|string|max:100',
            'nacionalidad' => 'nullable|string|max:100',
            'fecha_nacimiento' => 'required|date',
            'telefono' => 'nullable|string|max:30',
            'direccion' => 'nullable|string|max:255',
            'localidad' => 'nullable|string|max:100',
        ];

        $mensajes = [
            'dni.required' => 'El DNI es obligatorio.',
            'dni.unique' => 'Ya existe otro jugador registrado con ese DNI.',
            'nombre.required' => 'El nombre es obligatorio.',
            'apellido.required' => 'El apellido es obligatorio.',
            'fecha_nacimiento.required' => 'La fecha de nacimiento es obligatoria.',
        ];

        // Administradores pueden modificar todos los datos.
        if ($this->esAdministrador()) {
            $validated = $request->validate([
                ...$reglasPersonales,
                'categoria_id' => [
                    'required',
                    Rule::exists('categorias', 'id')
                        ->where(function ($query) use ($jugador) {
                            $query->where('estado', true)
                                ->orWhere('id', $jugador->categoria_id);
                        }),
                ],
            ], [
                ...$mensajes,
                'categoria_id.required' => 'Debés seleccionar una categoría.',
                'categoria_id.exists' => 'La categoría seleccionada no está disponible.',
            ]);
        } else {
            // El tutor solamente puede modificar datos personales y de contacto.
            // categoria_id y cualquier otro campo administrativo se ignoran.
            $validated = $request->validate($reglasPersonales, $mensajes);
        }

        $jugador->update($validated);

        if (auth()->user()->rol === 'tutor') {
            return redirect()
                ->route('jugadores.show', $jugador->id)
                ->with('success', 'Los datos del jugador se actualizaron correctamente.');
        }

        return redirect()
            ->route('jugadores.index')
            ->with('success', 'Jugador actualizado correctamente.');
    }

        /**
     * Mostrar la ficha completa del jugador.
     */
    public function show(Jugador $jugador)
    {
        $usuario = auth()->user();

        // Administradores y superadministradores pueden consultar cualquier jugador.
        if (in_array($usuario->rol, ['admin', 'superadmin'])) {
            // Acceso permitido.
        } elseif ($usuario->rol === 'tutor') {
            // El tutor solamente puede consultar jugadores asociados a él.
            abort_unless(
                $this->esJugadorDelTutor($jugador),
                403,
                'No tienes permiso para consultar este jugador.'
            );
        } elseif ($usuario->rol === 'profesor') {
            // El profesor solamente puede consultar jugadores de sus categorías.
            abort_unless(
                $jugador->categoria()
                    ->whereHas('profesores', function ($query) use ($usuario) {
                        $query->where('profesores.id', $usuario->profesor_id);
                    })
                    ->exists(),
                403,
                'No tienes permiso para consultar este jugador.'
            );
        } else {
            abort(403, 'No tienes permiso para consultar este jugador.');
        }

        // Cargar categoría y tutores asociados.
        $jugador->load([
            'categoria:id,anio',
            'tutores:id,dni,nombre,apellido,email,telefono,direccion,localidad',
        ]);

        // Administradores y tutores asociados pueden editar.
        $puedeEditar = $this->esAdministrador()
            || $this->esJugadorDelTutor($jugador);
        $puedeAdministrarTutores = $this->esAdministrador();
        $tutores = $jugador->tutores;
        $puedeAsociarTutor = $this->esAdministrador()
            && $tutores->count() < 2;

        $tutoresDisponibles = $puedeAsociarTutor
            ? Tutor::where('estado', true)
                ->whereDoesntHave('jugadores', function ($query) use ($jugador) {
                    $query->where('jugadores.id', $jugador->id);
                })
                ->orderBy('apellido')
                ->orderBy('nombre')
                ->get(['id', 'dni', 'nombre', 'apellido'])
            : collect();

        return Inertia::render('Jugadores/Show', [
            'jugador' => $jugador,
            'puedeEditar' => $puedeEditar,
            'puedeAsociarTutor' => $puedeAsociarTutor,
            'puedeAdministrarTutores' => $puedeAdministrarTutores,
            'tutoresDisponibles' => $tutoresDisponibles,
        ]);
    }
    /**
     * Deshabilitar un jugador.
     */
    public function destroy(Jugador $jugador)
    {
        abort_unless(
            $this->esAdministrador(),
            403,
            'No tienes permiso para deshabilitar jugadores.'
        );

        $jugador->update([
            'estado' => false,
        ]);

        return redirect()
            ->route('jugadores.index')
            ->with('success', 'Jugador deshabilitado correctamente.');
    }

        /**
     * Mostrar el historial de jugadores deshabilitados.
     */
    public function historial()
    {
        $usuario = auth()->user();

        $consulta = Jugador::with('categoria:id,anio')
            ->where('estado', false);

        // Filtrar por categorías asignadas al profesor.
        if ($usuario->rol === 'profesor') {
            $consulta->whereHas('categoria.profesores', function ($query) use ($usuario) {
                $query->where('profesores.id', $usuario->profesor_id);
            });
        }

        // Filtrar por jugadores vinculados al tutor.
        if ($usuario->rol === 'tutor') {
            $consulta->whereHas('tutores', function ($query) use ($usuario) {
                $query->where('tutores.id', $usuario->tutor_id);
            });
        }

        $jugadores = $consulta
            ->orderBy('apellido')
            ->orderBy('nombre')
            ->get();

        return Inertia::render('Jugadores/Historial', [
            'jugadores' => $jugadores,
        ]);
    }
    /**
     * Reactivar un jugador deshabilitado.
     */
    public function reactivar(Jugador $jugador)
    {
        abort_unless(
            $this->esAdministrador(),
            403,
            'No tienes permiso para reactivar jugadores.'
        );

        $jugador->update([
            'estado' => true,
        ]);

        return redirect()
            ->route('jugadores.historial')
            ->with('success', 'Jugador reactivado correctamente.');
    }

    public function asociarTutor(Request $request, Jugador $jugador)
    {
        abort_unless(
            $this->esAdministrador(),
            403,
            'No tienes permiso para asociar tutores.'
        );

        $datos = $request->validate([
            'tutor_id' => [
                'required',
                'integer',
                Rule::exists('tutores', 'id')->where('estado', true),
            ],
            'parentesco' => [
                'required',
                'string',
                'max:50',
            ],
            'es_tutor_principal' => [
                'required',
                'boolean',
            ],
        ], [
            'tutor_id.required' => 'Debes seleccionar un tutor.',
            'tutor_id.exists' => 'El tutor seleccionado no existe o está inactivo.',
            'parentesco.required' => 'Debes indicar el parentesco.',
            'parentesco.max' => 'El parentesco no puede superar los 50 caracteres.',
        ]);

        DB::transaction(function () use ($jugador, $datos) {

            $jugadorBloqueado = Jugador::whereKey($jugador->id)
                ->lockForUpdate()
                ->firstOrFail();

            $cantidadTutores = $jugadorBloqueado->tutores()->count();

            if ($cantidadTutores >= 2) {
                throw ValidationException::withMessages([
                    'tutor_id' => 'El jugador ya tiene el máximo de dos tutores asociados.',
                ]);
            }

            if ($jugadorBloqueado->tutores()
                ->where('tutores.id', $datos['tutor_id'])
                ->exists()) {
                throw ValidationException::withMessages([
                    'tutor_id' => 'Este tutor ya está asociado al jugador.',
                ]);
            }

            $hayTutorPrincipal = $jugadorBloqueado->tutores()
                ->wherePivot('es_tutor_principal', true)
                ->exists();

            // El primero siempre será principal.
            // Si no existe uno principal, el nuevo también deberá serlo.
            $esPrincipal = $cantidadTutores === 0
                || !$hayTutorPrincipal
                || (bool) $datos['es_tutor_principal'];

            // Si se elige un nuevo tutor principal, se actualiza el anterior.
            if ($esPrincipal) {
                $tutorPrincipalActual = $jugadorBloqueado->tutores()
                    ->wherePivot('es_tutor_principal', true)
                    ->first();

                if ($tutorPrincipalActual) {
                    $jugadorBloqueado->tutores()->updateExistingPivot(
                        $tutorPrincipalActual->id,
                        ['es_tutor_principal' => false]
                    );
                }
            }

            $jugadorBloqueado->tutores()->attach($datos['tutor_id'], [
                'parentesco' => trim($datos['parentesco']),
                'es_tutor_principal' => $esPrincipal,
            ]);
        });

        return redirect()
            ->route('jugadores.show', $jugador->id)
            ->with('success', 'Tutor asociado correctamente.');
    }
    /**
     * Actualizar los datos personales de un tutor y su relación
     * con un jugador determinado.
     */
    public function actualizarTutor(
        Request $request,
        Jugador $jugador,
        Tutor $tutor
    ) {
        abort_unless(
            $this->esAdministrador(),
            403,
            'No tienes permiso para modificar tutores.'
        );

        $datos = $request->validate([
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
            'parentesco' => 'required|string|max:50',
            'es_tutor_principal' => 'required|boolean',
        ], [
            'dni.required' => 'El DNI es obligatorio.',
            'dni.unique' => 'Ya existe otro tutor registrado con ese DNI.',
            'nombre.required' => 'El nombre es obligatorio.',
            'apellido.required' => 'El apellido es obligatorio.',
            'parentesco.required' => 'Debes indicar el parentesco.',
        ]);

        if (trim($datos['parentesco']) === '') {
            throw ValidationException::withMessages([
                'parentesco' => 'Debes indicar el parentesco.',
            ]);
        }

        DB::transaction(function () use ($jugador, $tutor, $datos) {
            $jugadorBloqueado = Jugador::whereKey($jugador->id)
                ->lockForUpdate()
                ->firstOrFail();

            $tutorAsociado = $jugadorBloqueado->tutores()
                ->where('tutores.id', $tutor->id)
                ->exists();

            abort_unless(
                $tutorAsociado,
                404,
                'El tutor no está asociado a este jugador.'
            );

            $tutoresActuales = $jugadorBloqueado->tutores()->get();

            $otroTutor = $tutoresActuales->first(
                fn ($item) => (int) $item->id !== (int) $tutor->id
            );

            $quiereSerPrincipal = (bool) $datos['es_tutor_principal'];

            // Si hay un solo tutor, no puede quedar como suplente.
            if (!$quiereSerPrincipal && !$otroTutor) {
                throw ValidationException::withMessages([
                    'es_tutor_principal' => 'El jugador debe tener un tutor titular.',
                ]);
            }

            // Actualizar los datos personales del tutor.
            $tutor->update([
                'dni' => $datos['dni'],
                'nombre' => $datos['nombre'],
                'apellido' => $datos['apellido'],
                'email' => $datos['email'] ?? null,
                'telefono' => $datos['telefono'] ?? null,
                'direccion' => $datos['direccion'] ?? null,
                'localidad' => $datos['localidad'] ?? null,
            ]);

            // Primero se desmarca la titularidad de todas las relaciones.
            DB::table('jugador_tutor')
                ->where('jugador_id', $jugadorBloqueado->id)
                ->update([
                    'es_tutor_principal' => false,
                    'updated_at' => now(),
                ]);

            // Actualizar parentesco y condición del tutor editado.
            $jugadorBloqueado->tutores()->updateExistingPivot(
                $tutor->id,
                [
                    'parentesco' => trim($datos['parentesco']),
                    'es_tutor_principal' => $quiereSerPrincipal,
                ]
            );

            // Si el editado pasa a suplente, el otro pasa a titular.
            if (!$quiereSerPrincipal && $otroTutor) {
                $jugadorBloqueado->tutores()->updateExistingPivot(
                    $otroTutor->id,
                    ['es_tutor_principal' => true]
                );
            }
        });

        return redirect()
            ->route('jugadores.show', $jugador->id)
            ->with('success', 'Tutor actualizado correctamente.');
    }
}