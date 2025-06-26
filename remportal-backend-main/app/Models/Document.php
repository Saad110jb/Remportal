<?php

namespace App\Models;

use App\Traits\ForUserScope;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Document extends Model
{
    use ForUserScope;
    protected $fillable = ['company_id', 'uploaded_by', 'name', 'file_path', 'visibility'];

    public function users()
    {
        return $this->belongsToMany(CompanyUser::class, 'document_user', 'document_id', 'company_user_id')->select('name','email','avatar');
    }    

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function uploadedBy()
    {
        return $this->belongsTo(CompanyUser::class, 'uploaded_by');
    }
}
