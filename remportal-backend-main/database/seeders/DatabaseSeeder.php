<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;

use App\Models\AddonSetting;
use App\Models\Property;
use App\Models\Flat;
use App\Models\Payment;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {

        $this->call(CompanyUserAdminSeeder::class);
        // start dummy data 
        // Insert Properties
        $propertyIds = [];
        $properties = [
            ['company_id' => 1, 'name' => 'Sunshine Apartments', 'description' => 'dreams come true', 'location' => '123 Main Street, Dhaka', 'price' => 200, 'property_for' => 'sale'],
            ['company_id' => 1, 'name' => 'Green Valley Homes', 'description' => 'dreams come true', 'location' => '456 Avenue Road, Chittagong', 'price' => 200, 'property_for' => 'sale'],
            ['company_id' => 1, 'name' => 'Lakeview Residency', 'description' => 'dreams come true', 'location' => '789 Lake Road, Sylhet', 'price' => 200, 'property_for' => 'sale'],
        ];

        foreach ($properties as $property) {
            $propertyIds[] = Property::create($property)->id;
        }

        // Insert Flats
        foreach ($propertyIds as $propertyId) {
            for ($i = 1; $i <= 5; $i++) {
                $flat = Flat::create([
                    'company_id' => 1,
                    'property_id' => $propertyId,
                    'name' => 'Flat ' . str_pad($i, 2, '0', STR_PAD_LEFT),
                    'size' => rand(800, 2000),
                    'price' => rand(3000000, 8000000),
                    'address' => fake()->address,
                    'bedrooms' => rand(1, 5),
                    'bathrooms' => rand(1, 3),
                    'kitchen' => rand(1, 2),
                    'balcony' => rand(0, 2),
                    'status' => fake()->randomElement(['available', 'sold', 'reserved']),
                ]);

                // Insert Payments
                for ($j = 1; $j <= 5; $j++) {
                    Payment::create([
                        'flat_id' => $flat->id,
                        'type' => fake()->randomElement(['Installment', 'Utility', 'Admin']),
                        'amount' => rand(50000, 200000),
                        'payment_link_token' => Crypt::encryptString(Str::random(32)),
                        'payment_date' => fake()->dateTimeThisYear,
                        'description' => fake()->sentence,
                        'status' => fake()->randomElement(['pending', 'paid', 'overdue']),
                    ]);
                }
            }
        }
        // create settings data 
        Setting::insert([
            [
                'key' => 'currency',
                'value' => '৳',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'business_name',
                'value' => 'REM Portal BD',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'logo',
                'value' => 'default_logo.png',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'tenant_option_enabled',
                'value' => 'true',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'user_id_prefix',
                'value' => 'REM',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // mail config
            [
                'key' => 'email_status',
                'value' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'key' => 'email_driver',
                'value' => 'smtp',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'key' => 'email_host',
                'value' => 'smtp.mailtrap.io',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'key' => 'email_port',
                'value' => 587,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'key' => 'email_username',
                'value' => 'your_mailtrap_username',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'key' => 'email_password',
                'value' => 'your_mailtrap_password',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'key' => 'email_encryption',
                'value' => 'tls',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'key' => 'email_id',
                'value' => 'no-reply@example.com',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'key' => 'email_name',
                'value' => 'Example App',
                'created_at' => now(),
                'updated_at' => now()
            ],
        ]);
        // end dummy data 
        $admin = User::where('email', 'admin@gmail.com')->first();
        if (!$admin) {
            // Create the admin user
            $admin = User::create([
                'name' => 'Admin',
                'email' => 'admin@gmail.com',
                'approved' => true,
                'password' => Hash::make('password')
            ]);

            // Mark email as verified
            $admin->markEmailAsVerified();
            // Assign role as admin (assuming you have a role management system)
            $admin->assignRole('Director');


            $this->command->info('Admin user seeded successfully.');
        } else {
            $this->command->info('Admin user already exists.');
        }
        // email - template seeder 
        $templates = [
            [
                'template_name' => 'password_reset',
                'subject' => 'Password Reset Request',
                'body' => 'Dear {FIRST_NAME} ,<br><br>You have requested a password reset. Click <a href="{RESET_LINK}">here</a> to reset your password.<br><br>Best Regards,<br>Leon Cycle <div style="text-align: center; color: #888; font-size: 12px; margin-top: 20px;">
                <p>Leoncycle</p>
                <p>45 Leakes Road LAVERTON NORTH, VIC 3026, 
                    <br>
                    AU.3026, 45 Leakes Road LAVERTON NORTH
                </p>
                <p>Email: support.au@leoncycle.com | Phone: (03) 90695443</p>
                </div>
                ',
                'available_variables' => json_encode(['FIRST_NAME', 'LAST_NAME', 'RESET_LINK'])
            ],
            [
                'template_name' => 'order_delivery',
                'subject' => 'Order Delivery Confirmation',
                'body' => 'Hello {CUSTOMER_NAME},<br><br>Your order has been delivered successfully.<br>Order ID: {ORDER_ID}<br>Delivery Date: {DELIVERY_DATE}<br><br>Thank you for shopping with us!<br>We hope you enjoy your purchase!<div style="text-align: center; color: #888; font-size: 12px; margin-top: 20px;">
                    <p>Leoncycle</p>
                    <p>45 Leakes Road LAVERTON NORTH, VIC 3026, 
                        <br>
                        AU.3026, 45 Leakes Road LAVERTON NORTH
                    </p>
                    <p>Email: support.au@leoncycle.com | Phone: (03) 90695443</p>
                </div>
                ',
                'available_variables' => json_encode(['CUSTOMER_NAME', 'CUSTOMER_EMAIL', 'ORDER_ID', 'DELIVERY_DATE'])
            ],
            [
                'template_name' => 'warranty_approved',
                'subject' => 'Warranty Approved',
                'body' => 'Dear {FIRST_NAME},<br><br>Your warranty has been approved.<br>Thank you for using our service!<div style="text-align: center; color: #888; font-size: 12px; margin-top: 20px;">
                    <p>Leoncycle</p>
                    <p>45 Leakes Road LAVERTON NORTH, VIC 3026, 
                        <br>
                        AU.3026, 45 Leakes Road LAVERTON NORTH
                    </p>
                    <p>Email: support.au@leoncycle.com | Phone: (03) 90695443</p>
                </div>',
                'available_variables' => json_encode(['FIRST_NAME', 'LAST_NAME', 'EMAIL', 'PHONE', 'COMPANY_NAME', 'ADDRESS', 'MESSAGE'])
            ],
            [
                'template_name' => 'account_created',
                'subject' => 'Your Account Has Been Created',
                'body' => 'Hello {NAME},<br><br>Your {ROLE} account has been created.<br><br>Here are your credentials:<br>Email: {EMAIL}<br>Password: {PASSWORD}<br>Role: {ROLE}<br>Please change your password after logging in.<br><br><a href="{LOGIN_URL}">Login</a><br><br>Thank you for using our application! <div style="text-align: center; color: #888; font-size: 12px; margin-top: 20px;">
                    <p>Leoncycle</p>
                    <p>45 Leakes Road LAVERTON NORTH, VIC 3026, 
                        <br>
                        AU.3026, 45 Leakes Road LAVERTON NORTH
                    </p>
                    <p>Email: support.au@leoncycle.com | Phone: (03) 90695443</p>
                </div>',
                'available_variables' => json_encode(['NAME', 'EMAIL', 'PASSWORD', 'ROLE', 'LOGIN_URL'])
            ],
            [
                'template_name' => 'company_account_created',
                'subject' => 'Your New Account Details',
                'body' => 'Dear {NAME},<br><br>
                           Your account has been successfully created.<br>
                           Email: {EMAIL} <br>
                           Password: {PASSWORD} <br>
                           Role: {ROLE} <br>
                           Login here: <a href="{LOGIN_URL}">{LOGIN_URL}</a> <br><br>
                           Best Regards,<br>Rem portal',
                'available_variables' => json_encode(['NAME', 'EMAIL', 'PASSWORD', 'ROLE', 'LOGIN_URL'])
            ]

        ];

        foreach ($templates as $template) {
            DB::table("email_templates")->insert($template);
        }
    }
}
