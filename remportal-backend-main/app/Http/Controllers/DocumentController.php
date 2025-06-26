<?php

namespace App\Http\Controllers;

use App\Models\Document;
use App\Services\MediaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class DocumentController extends Controller
{
    public function upload(Request $request)
    {
        $validator = Validator::make($request->all(),[
            'name' => 'required|string',
            'file' => 'required|mimes:pdf,jpg,png|max:2048',
            'visibility' => 'required|in:private,shared',
            'shared_with' => 'array|nullable',
            'shared_with.*' => 'exists:company_users,id',
        ]);

        if ($validator->fails()) {
            return new JsonResponse($validator->errors(), 422);
        }

        $filePath = MediaService::upload_file('public/documents',$request->file('file'));

        $admin = Auth::user();

        if ($admin->hasRole('Director')) {
            $company_id = $request->company_id;
        } else {
            $company_id = $admin->company_id;
        }
        if (!$company_id) {
            return response()->json("Company ID is required.", 422);
        }
        $document = Document::create([
            'company_id' => $company_id,
            'uploaded_by' => $admin->id,
            'name' => $request->name,
            'file_path' => $filePath,
            'visibility' => $request->visibility,
        ]);

        if ($request->visibility === 'shared' && $request->has('shared_with')) {
            $document->users()->attach($request->shared_with);
        }

        return response()->json('Document uploaded successfully', 201);
    }
    public function sharedDocuments()
    {
        $user = Auth::user();

        $documents = Document::where('visibility', 'shared')
            ->where('company_id', $user->company_id)
            ->whereHas('users', function ($query) use ($user) {
                $query->where('company_user_id', $user->id);
            })
            ->get();

        return response()->json($documents);
    }
    public function download($id)
    {
        $document = Document::findOrFail($id);

        if ($document->visibility === 'private' && $document->uploaded_by !== auth()->id()) {
            return response()->json(['message' => 'Access denied'], 403);
        }

        if ($document->visibility === 'shared' && !$document->users->contains(auth()->id())) {
            return response()->json(['message' => 'Access denied'], 403);
        }

        return Storage::download($document->file_path, $document->name);
    }
    public function all_documents(Request $request){
        $company = Auth::user();
        $offset = $request->query('offset');

        $documents = Document::byCompany($company)
        ->with(['company','users'])
        ->paginate($offset);

        return response()->json($documents);
    }
    public function destroy($id)
    {
        $company = Auth::user();
        $document = Document::byCompany($company)->where('id', $id)->first();
        if (!$document) {
            return response()->json('Document not found', 404);
        }
        MediaService::remove_file($document->file_path);
        $document->delete();

        return response()->json('Document deleted successfully');
    }
}
