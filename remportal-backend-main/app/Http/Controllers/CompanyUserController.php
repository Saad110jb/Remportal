<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\CompanyUser;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class CompanyUserController extends Controller
{
    /**
     * Register a new company user.
     */
    public function register(Request $request)
    {
        $request->validate([
        'uid'         => 'required|string|unique:company_users,uid',
            'company_id' => 'required|exists:companies,id',
            'name'       => 'required|string|max:255',
            'email'      => 'required|string|email|max:255|unique:company_users',
            'password'   => 'required|string|min:6|confirmed', // expects password_confirmation too
            'phone'      => 'nullable|string|max:20',
         
            'address'    => 'nullable|string|max:255',
            'national_id'=> 'nullable|string|max:50',
        ]);

        $companyUser = CompanyUser::create([
            'uid'         => $request->uid,  // generate UUID here
            'company_id'  => $request->company_id,
            'name'        => $request->name,
            'email'       => $request->email,
            'password'    => Hash::make($request->password),
            'phone'       => $request->phone,
            'avatar'      => $request->avatar,
            'address'     => $request->address,
            'national_id' => $request->national_id,
        ]);

        return response()->json([
            'message' => 'Company user registered successfully',
            'user'    => $companyUser,
        ], 201);
    }

    /**
     * List all company users (optional).
     */
  public function index(Request $request)
{
    $query = CompanyUser::query();

    if ($request->has('company_id')) {
        $query->where('company_id', $request->company_id);
    }

    return response()->json($query->get());
}

}
