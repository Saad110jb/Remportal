<?php 

namespace App\Services;

use Illuminate\Support\Facades\Storage;

class MediaService
{
    public static function upload_with_original_filename($path = 'public', $request_image)
    {
        // Get the original filename
        $originalName = $request_image->getClientOriginalName();

        // Combine the storage path and the original filename
        $filePath = $path . '/' . $originalName;

        // Store the file
        Storage::putFileAs($path, $request_image, $originalName);

        // Get the URL of the stored file
        $imageUrl = Storage::url($filePath);

        return $imageUrl;
    }

    public static function upload_file($path = 'public', $request_image)
    {
        $imagePath = Storage::putFile($path, $request_image);
        $imageUrl = Storage::url($imagePath);
        return $imageUrl;
    }
    public static function remove_file($path)
    {
        $image_path = str_replace('/storage/', '', $path);
        $isSuccess =  Storage::disk('public')->delete($image_path);
        
        return $isSuccess;
    }
}
