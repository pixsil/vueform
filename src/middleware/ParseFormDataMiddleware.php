<?php

// version 2: fixed for laravel 12 and higher

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class ParseFormDataMiddleware
{
    /**
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        $isFormData = str_contains(
            $request->headers->get('content-type'),
            'multipart/form-data'
        );

        if ($isFormData && $request->has('json')) {
            $request->merge((array) json_decode($request->json, true));
            $request->request->remove('json');

            // since Laravel 13 input overrules files in all(), so put the uploaded files back over the json values
            $request->merge($request->allFiles());
        }

        return $next($request);
    }
}
