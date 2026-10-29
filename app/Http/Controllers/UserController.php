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

        return Inertia::render('Usuarios/Create', [
            'tutores' => $tutores,
            'profesores' => $profesores,
        ]);
    }
    /**
 * Crear una cuenta de acceso para un tutor o profesor.
 */
        public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'password' => ['required', 'confirmed', Password::defaults()],
            'rol' => 'required|in:tutor,profesor',
            'tutor_id' => 'nullable|exists:tutores,id',
            'profesor_id' => 'nullable|exists:profesores,id',
            'email' => 'nullable|string|email|max:255',
        ]);

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

            $tutorId = $persona->id;
            $profesorId = null;

        } else {
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

            $tutorId = null;
            $profesorId = $persona->id;
        }

        // Priorizar el correo registrado en la ficha personal.
        // Si no existe, utilizar el ingresado por el administrador.
        $email = $persona->email ?: ($validated['email'] ?? null);

        $datosEmail = Validator::make(
            ['email' => $email],
            [
                'email' => 'required|string|email|max:255|unique:users,email',
            ],
            [
                'email.required' => 'Debes ingresar un correo electrónico para la cuenta.',
                'email.unique' => 'Este correo ya está asociado a otra cuenta.',
            ]
        )->validate();

        User::create([
            'name' => trim($persona->nombre . ' ' . $persona->apellido),
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