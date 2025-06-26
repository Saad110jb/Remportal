<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Auth;

class CheckSubscription
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = Auth::user();

        if ($user && $user->company) {
            if ($user->company->status === 'disabled') {
                return response()->json('Company access is disabled by admin.', 403);
            }
    
            if (!$user->company->subscription_ends_at || now()->greaterThan($user->company->subscription_ends_at)) {
                return response()->json('Subscription expired. Please renew.', 403);
            }
        }

        return $next($request);
    }
}
