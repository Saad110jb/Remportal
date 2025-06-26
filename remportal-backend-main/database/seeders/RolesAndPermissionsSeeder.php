<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run()
    {
        // Clear Cache
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        $permissions = [
            'dashboard_statistics',
            'users_list',
            'manage_role_permission',
            'manage_properties',
            'manage_flats',
            'manage_payments',
            'settings',
            'manage_my_users',
            'manage_notice',
            'mail_templates',
            'manage_documents'
        ];

        // Create permissions
        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission,'guard_name' => 'sanctum']);
        }

        // Define roles and assign permissions
        $rolesPermissions = [
            'Director' => [
                'dashboard_statistics', 
                'users_list',
                'manage_role_permission',
                'manage_properties',
                'manage_flats',
                'manage_payments',
                'settings',
                'manage_my_users',
                'mail_templates',
                'manage_notice',
                'manage_documents'
            ],
            'Customer' => ['users_list'],
            'Company Admin' => ['dashboard_statistics', 'manage_properties', 'manage_flats' ,'manage_my_users','manage_payments','manage_notice','manage_documents'],
            'employee' => ['manage_payments'],
        ];

        foreach ($rolesPermissions as $role => $perms) {
            $role = Role::firstOrCreate(['name' => $role,'guard_name' => 'sanctum']);
            foreach ($perms as $perm) {
                $role->givePermissionTo($perm);
            }
        }
    }
}
