<?php

namespace App\Http\Controllers\auth;

use App\Http\Controllers\Controller;
use App\Models\CompanyUser;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Auth\Events\PasswordReset;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;

class PasswordResetController extends Controller
{
    public function forgot_password(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:company_users,email',
        ]);

        if ($validator->fails()) {
            return new JsonResponse($validator->errors(), 422);
        }

        $status = Password::broker('company_users')->sendResetLink($request->only('email'));

        return $status === Password::RESET_LINK_SENT
            ? new JsonResponse('Password reset link sent to your email',200)
            : new JsonResponse('Unable to send reset link', 500);
    }

    // Reset the password
    public function reset_password(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'token' => 'required',
            'email' => 'required|email|exists:company_users,email',
            'password' => 'required|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return new JsonResponse($validator->errors(), 422);
        }

        $status = Password::broker('company_users')->reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function (CompanyUser $user, $password) {
                $user->forceFill([
                    'password' => Hash::make($password)
                ])->setRememberToken(Str::random(60));

                $user->save();

                event(new PasswordReset($user));
            }
        );

        return $status === Password::PASSWORD_RESET
            ? new JsonResponse('Password has been reset successfully',200)
            : new JsonResponse('Password reset failed', 500);
    }
}
