<?php 

if (!function_exists('get_setting')) {
    function get_setting($key)
    {
        $setting = \App\Models\Setting::where('key', $key)->first();
        return $setting ? $setting->value : null;
    }
}
