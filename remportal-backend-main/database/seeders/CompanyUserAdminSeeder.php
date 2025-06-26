<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\Company;
use App\Models\CompanyUser;

class CompanyUserAdminSeeder extends Seeder
{
    public function run()
    {
        // Create admin company
        $company = Company::firstOrCreate([
            'name' => 'Abc real state company',
        ]);
        $company->extendSubscription(1);
        // Admin users data
        $adminUsers = [
            [
                'company_id' => $company->id,
                'name' => 'Admin',
                'email' => 'admin@example.com',
                'password' => Hash::make('123456789')
            ]
        ];
        $customerUsers = [
            [
                'company_id' => $company->id,
                'name' => 'John Doe',
                'email' => 'johndoe@example.com',
                'password' => Hash::make('123456789')
            ]
        ];

        // Insert admin users
        foreach ($adminUsers as $userData) {
            $c_user = CompanyUser::updateOrCreate(
                ['email' => $userData['email']],
                $userData
            );
            $c_user->assignRole('Company Admin');
        }
        // Insert customers users
        foreach ($customerUsers as $userData) {
            $c_user = CompanyUser::updateOrCreate(
                ['email' => $userData['email']],
                $userData
            );
            $c_user->assignRole('Customer');
        }
    }
}