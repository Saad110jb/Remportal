<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\JsonResponse;

class MailTemplateController extends Controller
{
    public function get_all_templates(Request $request)
    {
        $templates = DB::table('email_templates')->get();
        return new JsonResponse($templates, 200);
    }
    public function get_template(Request $request,$template_name)
    {
        $template = DB::table('email_templates')
        ->where('template_name',$template_name)
        ->first();
        if (!$template) {
            
            return new JsonResponse("Template not found", 404);
        }
        return new JsonResponse($template, 200);
    }
    public function update_template(Request $request,$template_name)
    {
        $validator = Validator::make($request->all(), [
            'subject' => 'required|string|max:255',
            'body' => 'required|string'
        ]);

        if ($validator->fails()) {
            return new JsonResponse( $validator->errors(), 422);
        }
        $template = DB::table('email_templates')
        ->where('template_name',$template_name)
        ->first();
        if (!$template) {
            
            return new JsonResponse( "Template not found", 404);
        }
        DB::table('email_templates')
        ->where('template_name', $template_name)
        ->update([
            'subject' => $request->subject,
            'body' => $request->body,
            'updated_at' => Carbon::now() // Ensure to update the timestamp if your table has updated_at column
        ]);
        return new JsonResponse("Template updated successfully.", 200);
    }
}
