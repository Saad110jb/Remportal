<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AddonSetting;
use App\Models\Setting;
use App\Services\MediaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Validator;


class SettingsController extends Controller
{
    // Fetch all settings
    public function index()
    {
        $settings = Cache::remember('settings', 3600, function () {
            return Setting::whereIn('key', ['currency', 'business_name', 'logo'])->pluck('value', 'key')->toArray();
        });

        return new JsonResponse($settings);
    }

    // Update settings
    public function update(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'settings' => 'required|array',
            'settings.logo' => 'sometimes|file|image|max:2048'
        ]);

        if ($validator->fails()) {
            return new JsonResponse($validator->errors(), 422);
        }

        foreach ($request->settings as $key => $value) {
            if ($key == 'logo') {
                $path = MediaService::upload_file('public/logo', $value);
                $prev_log =  Setting::get('logo');
                if ($prev_log) {
                    MediaService::remove_file($prev_log);
                }
                Setting::set('logo', $path);
            } else {
                Setting::set($key, $value);
            }
        }

        // Clear and update cache
        Cache::forget('settings');
        Cache::remember('settings', 3600, function () {
            return Setting::all()->pluck('value', 'key')->toArray();
        });

        return new JsonResponse('Settings updated successfully!');
    }
    // get email settings 
    public function getEmailSettings()
    {
        $settings = Setting::whereIn('key', [
            'email_status',
            'email_driver',
            'email_host',
            'email_port',
            'email_username',
            'email_password',
            'email_encryption',
            'email_id',
            'email_name',
        ])
            ->pluck('value', 'key');

        return new JsonResponse($settings);
    }
    // update email settings
    public function updateEmailSettings(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email_status' => 'required|boolean',
            'email_driver' => 'required|string',
            'email_host' => 'required|string',
            'email_port' => 'required|integer',
            'email_username' => 'required|string',
            'email_password' => 'required|string',
            'email_encryption' => 'required|string',
            'email_id' => 'required|email',
            'email_name' => 'required|string',
        ]);

        if ($validator->fails()) {
            return new JsonResponse($validator->errors(), 422);
        }
        $validatedData  = $validator->validated();

        foreach ($validatedData as $key => $value) {
            Setting::updateOrInsert(['key' => $key], ['value' => $value]);
        }

        // Set the new mail configuration dynamically
        $config = [
            'status' => (bool) $validatedData['email_status'],
            'driver' => $validatedData['email_driver'],
            'host' => $validatedData['email_host'],
            'port' => $validatedData['email_port'],
            'username' => $validatedData['email_username'],
            'password' => $validatedData['email_password'],
            'encryption' => $validatedData['email_encryption'],
            'from' => [
                'address' => $validatedData['email_id'],
                'name' => $validatedData['email_name'],
            ],
            'sendmail' => '/usr/sbin/sendmail -bs',
            'pretend' => false,
        ];

        config(['mail' => $config]);

        return new JsonResponse('Email settings updated successfully.');
    }
    // addon settings 
    // public function getAllAddonSettings()
    // {
    //     // Check if the settings are cached
    //     $allSettingsGrouped = Cache::remember('addon_settings_grouped', 60, function () {
    //         // If not cached, query and group the settings
    //         return AddonSetting::all()->groupBy('settings_type');
    //     });
    //     $formattedSettings = $allSettingsGrouped->mapWithKeys(function ($settings, $type) {
    //         // Format each settings group (like 'bkash') to the required structure
    //         return [
    //             $type => $settings->pluck('value', 'key')->toArray()
    //         ];
    //     });

    //     return new JsonResponse($formattedSettings);
    // }
    // public function update_addon_settings(Request $request, $settings_type)
    // {
    //     // Validate the incoming data
    //     $validator = Validator::make($request->all(), [
    //         'settings' => 'required|array', // Ensure 'settings' is an array
    //         'settings.*.key' => 'required|string|distinct', // Ensure each key is a string and unique
    //         'settings.*.value' => 'required|string', // Ensure each value is a string
    //     ]);

    //     // If validation fails, return a response with the error messages
    //     if ($validator->fails()) {
    //         return new JsonResponse($validator->errors(), 422);
    //     }

    //     // Process the settings for the specified settings_type
    //     foreach ($request->settings as $setting) {
    //         // Find the setting by 'settings_type' and 'key', or create a new record if it doesn't exist
    //         $addonSetting = AddonSetting::where('settings_type', $settings_type)
    //             ->where('key', $setting['key'])
    //             ->first();

    //         if ($addonSetting) {
    //             // If the setting exists, update the value
    //             $addonSetting->value = $setting['value'];
    //             $addonSetting->save();
    //         }
    //     }

    //     // Return a success response
    //     return new JsonResponse('Settings updated successfully.');
    // }
    // public function add_gateway_settings(Request $request)
    // {

    //     $validator = Validator::make($request->all(), [
    //         'settings' => 'required|array',
    //         'settings.*.settings_type' => 'required|string',
    //         'settings.*.key' => 'required|string',
    //         'settings.*.value' => 'required|string',
    //     ]);

    //     // If validation fails, return a response with the error messages
    //     if ($validator->fails()) {
    //         return new JsonResponse($validator->errors(), 422);
    //     }
    //     $validated = $validator->validated();
    //     // Insert settings
    //     AddonSetting::insert($validated['settings']);

    //     // Return response
    //     return new JsonResponse('Gateway settings added successfully.', 201);
    // }
    public function delete_settings_by_type(Request $request)
    {

        $validator = Validator::make($request->all(), [
            'settings_type' => 'required|string|exists:addon_settings,settings_type',
        ]);

        if ($validator->fails()) {
            return new JsonResponse($validator->errors(), 422);
        }
        $validated = $validator->validated();
        // Delete all settings for the given settings_type
        $deletedCount = AddonSetting::where('settings_type', $validated['settings_type'])->delete();

        // Return response
        return new JsonResponse('Settings deleted successfully.', 200);
    }
}
