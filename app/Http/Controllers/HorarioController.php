<?php

namespace App\Http\Controllers;

use App\Models\Cancha;
use App\Models\Categoria;
use App\Models\Horario;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class HorarioController extends Controller
{
    /**
     * Listado de horarios activos según el rol.
     */
    public function index()
    {
        $horarios = $this->consultaHorariosVisibles()
            ->with([
                'categoria:id,anio',
                'profesor:id,nombre,apellido',
                'cancha:id,nombre,predio_id',
                'cancha.predio:id,nombre',
            ])
            ->where('estado', true)
            ->orderBy('dia_semana')
            ->orderBy('hora_inicio')
            ->get();

        return Inertia::render('Horarios/Index', [
            'horarios' => $horarios,
        ]);
    }

    /**
     * Formulario de creación.
     */
    public function create()
    {
        $this->autorizarAdministracion();

        $categorias = Categoria::query()
            ->where('estado', true)
            ->with([
                'profesores' => function ($query) {
                    $query->select(
                        'profesores.id',
                        'profesores.nombre',
                        'profesores.apellido'
                    )->orderBy('profesores.apellido');
                },
            ])
            ->orderBy('anio')
            ->get(['id', 'anio']);

        $canchas = Cancha::query()
            ->where('estado', true)
            ->whereHas('predio', function ($query) {
                $query->where('estado', true);
            })
            ->with('predio:id,nombre')
            ->orderBy('nombre')
            ->get(['id', 'nombre', 'predio_id']);

        return Inertia::render('Horarios/Create', [
            'categorias' => $categorias,
            'canchas' => $canchas,
        ]);
    }

    /**
     * Registrar un horario.
     */
    public function store(Request $request)
    {
        $this->autorizarAdministracion();

        $datos = $this->validarDatos($request);

        $datos['profesor_id'] = $this->obtenerProfesorCategoria(
            $datos['categoria_id']
        );

        $this->validarCanchaDisponible($datos['cancha_id']);
        $this->validarConflictos($datos);

        Horario::create([
            ...$datos,
            'estado' => true,
        ]);

        return redirect()
            ->route('horarios.index')
            ->with('success', 'Horario creado correctamente.');
    }

    /**
     * Mostrar detalle de un horario.
     * El usuario solamente puede consultar horarios habilitados
     * para su rol.
     */
    public function show(Horario $horario)
    {
        $horario = $this->consultaHorariosVisibles()
            ->where('estado', true)
            ->whereKey($horario->id)
            ->with([
                'categoria:id,anio',
                'profesor:id,nombre,apellido',
                'cancha:id,nombre,predio_id',
                'cancha.predio:id,nombre',
            ])
            ->firstOrFail();

        return Inertia::render('Horarios/Show', [
            'horario' => $horario,
        ]);
    }

    /**
     * Formulario de edición.
     */
    public function edit(Horario $horario)
    {
        $this->autorizarAdministracion();

        $categorias = Categoria::query()
            ->where(function ($query) use ($horario) {
                $query->where('estado', true)
                    ->orWhere('id', $horario->categoria_id);
            })
            ->with([
                'profesores' => function ($query) {
                    $query->select(
                        'profesores.id',
                        'profesores.nombre',
                        'profesores.apellido'
                    )->orderBy('profesores.apellido');
                },
            ])
            ->orderBy('anio')
            ->get(['id', 'anio']);

        $canchas = Cancha::query()
            ->where(function ($query) use ($horario) {
                $query->where('estado', true)
                    ->orWhere('id', $horario->cancha_id);
            })
            ->with('predio:id,nombre')
            ->orderBy('nombre')
            ->get(['id', 'nombre', 'predio_id']);

        return Inertia::render('Horarios/Edit', [
            'horario' => $horario,
            'categorias' => $categorias,
            'canchas' => $canchas,
        ]);
    }

    /**
     * Actualizar un horario.
     */
    public function update(Request $request, Horario $horario)
    {
        $this->autorizarAdministracion();

        $datos = $this->validarDatos($request);

        $datos['profesor_id'] = $this->obtenerProfesorCategoria(
            $datos['categoria_id']
        );

        $this->validarCanchaDisponible($datos['cancha_id']);
        $this->validarConflictos($datos, $horario->id);

        $horario->update($datos);

        return redirect()
            ->route('horarios.index')
            ->with('success', 'Horario actualizado correctamente.');
    }

    /**
     * Desactivar un horario.
     */
    public function destroy(Horario $horario)
    {
        $this->autorizarAdministracion();

        $horario->update([
            'estado' => false,
        ]);

        return redirect()
            ->route('horarios.index')
            ->with('success', 'Horario deshabilitado correctamente.');
    }

    /**
     * Historial de horarios inactivos.
     */
    public function historial()
    {
        $this->autorizarAdministracion();

        $horarios = Horario::with([
            'categoria:id,anio',
            'profesor:id,nombre,apellido',
            'cancha:id,nombre,predio_id',
            'cancha.predio:id,nombre',
        ])
            ->where('estado', false)
            ->orderBy('dia_semana')
            ->orderBy('hora_inicio')
            ->get();

        return Inertia::render('Horarios/Historial', [
            'horarios' => $horarios,
        ]);
    }

    /**
     * Reactivar un horario.
     */
    public function reactivar(Horario $horario)
    {
        $this->autorizarAdministracion();

        if ($horario->estado) {
            return redirect()
                ->route('horarios.index');
        }

        if (!Categoria::where('id', $horario->categoria_id)
            ->where('estado', true)
            ->exists()) {
            return back()->withErrors([
                'categoria_id' => 'No se puede reactivar el horario porque la categoría está inactiva.',
            ]);
        }

        $canchaDisponible = Cancha::where('id', $horario->cancha_id)
            ->where('estado', true)
            ->whereHas('predio', function ($query) {
                $query->where('estado', true);
            })
            ->exists();

        if (!$canchaDisponible) {
            return back()->withErrors([
                'cancha_id' => 'No se puede reactivar el horario porque la cancha o su predio están inactivos.',
            ]);
        }

        $datos = [
            'categoria_id' => $horario->categoria_id,
            'profesor_id' => $this->obtenerProfesorCategoria(
                $horario->categoria_id
            ),
            'cancha_id' => $horario->cancha_id,
            'dia_semana' => $horario->dia_semana,
            'hora_inicio' => $horario->hora_inicio,
            'hora_fin' => $horario->hora_fin,
        ];

        try {
            $this->validarConflictos($datos, $horario->id);
        } catch (ValidationException $e) {
            return back()->withErrors($e->errors());
        }

        $horario->update([
            'profesor_id' => $datos['profesor_id'],
            'estado' => true,
        ]);

        return redirect()
            ->route('horarios.historial')
            ->with('success', 'Horario reactivado correctamente.');
    }

    /**
     * Construir la consulta de horarios que puede visualizar
     * el usuario autenticado según su rol.
     *
     * Admin y superadmin: todos.
     * Profesor: categorías asignadas al profesor.
     * Tutor: categorías de sus jugadores asociados.
     */
    private function consultaHorariosVisibles(): Builder
    {
        $usuario = auth()->user();

        $query = Horario::query();

        if (in_array($usuario?->rol, ['admin', 'superadmin'], true)) {
            return $query;
        }

        if ($usuario?->rol === 'profesor') {
            abort_if(
                !$usuario->profesor_id,
                403,
                'La cuenta no tiene un profesor asociado.'
            );

            return $query->whereHas(
                'categoria.profesores',
                function ($consulta) use ($usuario) {
                    $consulta->where(
                        'profesores.id',
                        $usuario->profesor_id
                    );
                }
            );
        }

        if ($usuario?->rol === 'tutor') {
            abort_if(
                !$usuario->tutor_id,
                403,
                'La cuenta no tiene un tutor asociado.'
            );

            return $query->whereHas(
                'categoria.jugadores',
                function ($jugadores) use ($usuario) {
                    $jugadores
                        ->where('jugadores.estado', true)
                        ->whereHas(
                            'tutores',
                            function ($tutores) use ($usuario) {
                                $tutores->where(
                                    'tutores.id',
                                    $usuario->tutor_id
                                );
                            }
                        );
                }
            );
        }

        abort(403, 'No tienes permiso para consultar horarios.');
    }

    /**
     * Validaciones generales de los datos.
     */
    private function validarDatos(Request $request): array
    {
        return $request->validate([
            'categoria_id' => [
                'required',
                'integer',
                Rule::exists('categorias', 'id')
                    ->where('estado', true),
            ],

            'cancha_id' => [
                'required',
                'integer',
                Rule::exists('canchas', 'id')
                    ->where('estado', true),
            ],

            'dia_semana' => [
                'required',
                'string',
                Rule::in([
                    'lunes',
                    'martes',
                    'miercoles',
                    'jueves',
                    'viernes',
                ]),
            ],

            'hora_inicio' => [
                'required',
                'date_format:H:i',
            ],

            'hora_fin' => [
                'required',
                'date_format:H:i',
                'after:hora_inicio',
            ],
        ], [
            'categoria_id.required' => 'Debés seleccionar una categoría.',
            'categoria_id.exists' => 'La categoría seleccionada no existe o está inactiva.',

            'cancha_id.required' => 'Debés seleccionar una cancha.',
            'cancha_id.exists' => 'La cancha seleccionada no existe o está inactiva.',

            'dia_semana.required' => 'Debés seleccionar un día.',
            'dia_semana.in' => 'El día seleccionado no es válido. Los horarios se asignan de lunes a viernes.',

            'hora_inicio.required' => 'Debés indicar la hora de inicio.',
            'hora_inicio.date_format' => 'La hora de inicio no tiene un formato válido.',

            'hora_fin.required' => 'Debés indicar la hora de finalización.',
            'hora_fin.date_format' => 'La hora de finalización no tiene un formato válido.',
            'hora_fin.after' => 'La hora de finalización debe ser posterior a la hora de inicio.',
        ]);
    }

    /**
     * Obtener el profesor responsable de una categoría.
     */
    private function obtenerProfesorCategoria(int $categoriaId): ?int
    {
        $profesorId = Categoria::findOrFail($categoriaId)
            ->profesores()
            ->value('profesores.id');

        return $profesorId ? (int) $profesorId : null;
    }

    /**
     * Comprobar que la cancha y su predio estén activos.
     */
    private function validarCanchaDisponible(int $canchaId): void
    {
        $disponible = Cancha::where('id', $canchaId)
            ->where('estado', true)
            ->whereHas('predio', function ($query) {
                $query->where('estado', true);
            })
            ->exists();

        if (!$disponible) {
            throw ValidationException::withMessages([
                'cancha_id' => 'La cancha seleccionada no está disponible o pertenece a un predio inactivo.',
            ]);
        }
    }

    /**
     * Comprobar superposiciones de horarios.
     *
     * Se controla:
     * - Misma categoría.
     * - Mismo profesor, cuando existe.
     * - Misma cancha.
     *
     * Los horarios consecutivos están permitidos.
     */
    private function validarConflictos(
        array $datos,
        ?int $horarioId = null
    ): void {
        $conflicto = Horario::query()
            ->where('estado', true)
            ->where('dia_semana', $datos['dia_semana'])
            ->where('hora_inicio', '<', $datos['hora_fin'])
            ->where('hora_fin', '>', $datos['hora_inicio'])
            ->when($horarioId, function ($query) use ($horarioId) {
                $query->where('id', '!=', $horarioId);
            })
            ->where(function ($query) use ($datos) {
                $query->where(
                    'categoria_id',
                    $datos['categoria_id']
                );

                if (!empty($datos['profesor_id'])) {
                    $query->orWhere(
                        'profesor_id',
                        $datos['profesor_id']
                    );
                }

                $query->orWhere(
                    'cancha_id',
                    $datos['cancha_id']
                );
            })
            ->exists();

        if (!$conflicto) {
            return;
        }

        throw ValidationException::withMessages([
            'hora_inicio' => 'Existe otro horario que se superpone para la misma categoría, profesor o cancha. Revisá los horarios asignados.',
        ]);
    }

    /**
     * Permitir modificaciones únicamente a administradores.
     */
    private function autorizarAdministracion(): void
    {
        abort_unless(
            in_array(
                auth()->user()?->rol,
                ['admin', 'superadmin'],
                true
            ),
            403,
            'No tienes permiso para realizar esta acción.'
        );
    }
}