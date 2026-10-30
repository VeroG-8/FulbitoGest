<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\Tutor;
use App\Models\Profesor;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Illuminate\Http\RedirectResponse;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class UserController extends Controller
{
    /**
     * Mostrar las cuentas de acceso registradas.
     */
    public function index(): Response
    {
        $usuarios = User::with(['tutor', 'profesor'])
            ->orderBy('name')
            ->paginate(10);

        return Inertia::render('Usuarios/Index', [
            'usuarios' => $usuarios,
        ]);
    }
    /**
     * Mostrar el formulario para crear una cuenta.
     */
        public function create(): Response
    {
        $tutores = Tutor::where('estado', true)
            ->whereDoesntHave('usuario')
            ->orderBy('apellido')
            ->orderBy('nombre')
            ->get();

        $profesores = Profesor::where('estado', true)
            ->whereDoesntHave('usuario')
            ->orderBy('apellido')
            ->orderBy('nombre')
            ->get();

        $rolesPermitidos = auth()->user()->rol === 'superadmin'
            ? ['tutor', 'profesor', 'admin', 'superadmin']
            : ['tutor', 'profesor'];

        return Inertia::render('Usuarios/Create', [
            'tutores' => $tutores,
            'profesores' => $profesores,
            'rolesPermitidos' => $rolesPermitidos,
        ]);
    }
    /**
     * Crear una cuenta de acceso para un tutor o profesor.
     */
        public function store(Request $request): RedirectResponse
    {
        $esSuperadmin = $request->user()->rol === 'superadmin';

        $rolesPermitidos = $esSuperadmin
            ? ['tutor', 'profesor', 'admin', 'superadmin']
            : ['tutor', 'profesor'];

        $validated = $request->validate([
            'rol' => ['required', Rule::in($rolesPermitidos)],
            'password' => ['required', 'confirmed', Password::defaults()],
            'tutor_id' => ['nullable', 'exists:tutores,id'],
            'profesor_id' => ['nullable', 'exists:profesores,id'],
            'name' => ['nullable', 'string', 'max:255'],
            'email' => ['nullable', 'string', 'email', 'max:255'],
        ]);

        $tutorId = null;
        $profesorId = null;

        if ($validated['rol'] === 'tutor') {
            if (empty($validated['tutor_id']) || !empty($validated['profesor_id'])) {
                throw ValidationException::withMessages([
                    'tutor_id' => 'Debes seleccionar un tutor válido.',
                ]);
            }

            $persona = Tutor::where('estado', true)
                ->whereDoesntHave('usuario')
                ->find($validated['tutor_id']);

            if (!$persona) {
                throw ValidationException::withMessages([
                    'tutor_id' => 'El tutor seleccionado no está disponible o ya tiene una cuenta.',
                ]);
            }

            $name = trim($persona->nombre . ' ' . $persona->apellido);
            $email = $persona->email ?: ($validated['email'] ?? null);
            $tutorId = $persona->id;

        } elseif ($validated['rol'] === 'profesor') {
            if (empty($validated['profesor_id']) || !empty($validated['tutor_id'])) {
                throw ValidationException::withMessages([
                    'profesor_id' => 'Debes seleccionar un profesor válido.',
                ]);
            }

            $persona = Profesor::where('estado', true)
                ->whereDoesntHave('usuario')
                ->find($validated['profesor_id']);

            if (!$persona) {
                throw ValidationException::withMessages([
                    'profesor_id' => 'El profesor seleccionado no está disponible o ya tiene una cuenta.',
                ]);
            }

            $name = trim($persona->nombre . ' ' . $persona->apellido);
            $email = $persona->email ?: ($validated['email'] ?? null);
            $profesorId = $persona->id;

        } else {
            if (!$esSuperadmin) {
                abort(403);
            }

            if (!empty($validated['tutor_id']) || !empty($validated['profesor_id'])) {
                throw ValidationException::withMessages([
                    'rol' => 'Las cuentas administrativas no deben vincularse a una ficha personal.',
                ]);
            }

            $datos = $request->validate([
                'name' => ['required', 'string', 'max:255'],
                'email' => ['required', 'string', 'email', 'max:255'],
            ]);

            $name = trim($datos['name']);
            $email = $datos['email'];
        }

        $datosEmail = Validator::make(
            ['email' => $email],
            [
                'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            ],
            [
                'email.required' => 'Debes ingresar un correo electrónico para la cuenta.',
                'email.unique' => 'Este correo ya está asociado a otra cuenta.',
            ]
        )->validate();

        User::create([
            'name' => $name,
            'email' => $datosEmail['email'],
            'password' => Hash::make($validated['password']),
            'rol' => $validated['rol'],
            'tutor_id' => $tutorId,
            'profesor_id' => $profesorId,
        ]);

        return redirect()
            ->route('usuarios.index')
            ->with('success', 'Cuenta creada correctamente.');
    }
}