<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use App\Models\Categoria;
use App\Models\Jugador;

class JugadorController extends Controller
{
    /**
     * Mostrar el listado de jugadores activos.
     */
    public function index(Request $request)
    {
        $usuario = auth()->user();

        $consulta = Jugador::with('categoria')
            ->where('estado', true);

        $consultaInactivos = Jugador::where('estado', false);

        // Restringir jugadores según el profesor.
        if ($usuario->rol === 'profesor') {
            $consulta->whereHas('categoria.profesores', function ($query) use ($usuario) {
                $query->where('profesores.id', $usuario->profesor_id);
            });
        }

        // Restringir jugadores según el tutor.
        if ($usuario->rol === 'tutor') {
            $consulta->whereHas('tutores', function ($query) use ($usuario) {
                $query->where('tutores.id', $usuario->tutor_id);
            });
        }

        $totalInactivos = $consultaInactivos->count();

        // Categorías disponibles para el usuario.
        $categorias = Categoria::whereIn(
            'id',
            (clone $consulta)->select('categoria_id')->distinct()
        )
            ->orderBy('anio', 'desc')
            ->get(['id', 'nombre', 'anio']);

        // Búsqueda por nombre, apellido o DNI.
        $buscar = trim($request->input('buscar', ''));

        if ($buscar !== '') {
            $consulta->where(function ($query) use ($buscar) {
                $query->where('nombre', 'like', "%{$buscar}%")
                    ->orWhere('apellido', 'like', "%{$buscar}%")
                    ->orWhere('dni', 'like', "%{$buscar}%");
            });
        }

        // Filtro por categoría.
        $categoria = $request->input('categoria');

        if ($categoria) {
            $consulta->where('categoria_id', $categoria);
        }

        // Ordenamiento seguro: solo se permiten estos campos.
        $orden = $request->input('orden', 'apellido');
        $direccion = $request->input('direccion', 'asc');

        if (!in_array($orden, ['apellido', 'dni'], true)) {
            $orden = 'apellido';
        }

        if (!in_array($direccion, ['asc', 'desc'], true)) {
            $direccion = 'asc';
        }

        // Aplicar orden y paginación.
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
        ]);
    }

    /**
     * Mostrar el formulario de creación.
     */
    public function create()
    {
        $categorias = Categoria::where('estado', true)
            ->orderBy('anio', 'desc')
            ->get(['id', 'nombre', 'anio']);

        return Inertia::render('Jugadores/Create', [
            'categorias' => $categorias,
        ]);
    }

    /**
     * Guardar un nuevo jugador.
     */
    public function store(Request $request)
    {
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
    public function edit(Jugador $jugador)
    {
        // Incluir categorías activas y la categoría actual del jugador.
        $categorias = Categoria::where('estado', true)
            ->orWhere('id', $jugador->categoria_id)
            ->orderBy('anio', 'desc')
            ->get(['id', 'nombre', 'anio']);

        // Formatear fecha para el input type="date".
        $jugador->fecha_nacimiento = $jugador->fecha_nacimiento
            ? $jugador->fecha_nacimiento->format('Y-m-d')
            : null;

        return Inertia::render('Jugadores/Edit', [
            'jugador' => $jugador,
            'categorias' => $categorias,
        ]);
    }

    /**
     * Actualizar los datos de un jugador.
     */
    public function update(Request $request, Jugador $jugador)
    {
        $validated = $request->validate([
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
            'categoria_id' => [
                'required',
                Rule::exists('categorias', 'id')
                    ->where(function ($query) use ($jugador) {
                        $query->where('estado', true)
                            ->orWhere('id', $jugador->categoria_id);
                    }),
            ],
        ], [
            'dni.required' => 'El DNI es obligatorio.',
            'dni.unique' => 'Ya existe otro jugador registrado con ese DNI.',
            'nombre.required' => 'El nombre es obligatorio.',
            'apellido.required' => 'El apellido es obligatorio.',
            'fecha_nacimiento.required' => 'La fecha de nacimiento es obligatoria.',
            'categoria_id.required' => 'Debés seleccionar una categoría.',
            'categoria_id.exists' => 'La categoría seleccionada no está disponible.',
        ]);

        $jugador->update($validated);

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

    // Verificar acceso del profesor.
    if ($usuario->rol === 'profesor') {
        $tieneAcceso = $jugador->categoria()
            ->whereHas('profesores', function ($query) use ($usuario) {
                $query->where('profesores.id', $usuario->profesor_id);
            })
            ->exists();

        abort_unless(
            $tieneAcceso,
            403,
            'No tienes permiso para consultar este jugador.'
        );
    }

    // Verificar acceso del tutor.
    if ($usuario->rol === 'tutor') {
        $tieneAcceso = $jugador->tutores()
            ->where('tutores.id', $usuario->tutor_id)
            ->exists();

        abort_unless(
            $tieneAcceso,
            403,
            'No tienes permiso para consultar este jugador.'
        );
    }

    $jugador->load([
        'categoria',
        'tutores',
        'carnets',
        'torneos',
        'viajes',
        'pases',
    ]);

    return Inertia::render('Jugadores/Show', [
        'jugador' => $jugador,
    ]);
}

    /**
     * Deshabilitar un jugador.
     */
    public function destroy(Jugador $jugador)
    {
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

        $consulta = Jugador::with('categoria')
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
        $jugador->update([
            'estado' => true,
        ]);

        return redirect()
            ->route('jugadores.historial')
            ->with('success', 'Jugador reactivado correctamente.');
    }
}