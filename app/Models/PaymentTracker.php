<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PaymentTracker extends Model
{
    use HasFactory;
    protected $fillable=[
        'factory_product_id',
        'customer_id',
        'amount',
        'isCredit',
        'created_by',
        'updated_by'
    ];

    protected $hidden = [
        'created_at',
        'updated_at',
    ];
}
