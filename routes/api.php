<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;

/*
|--------------------------------------------------------------------------
| Allowed controllers
|--------------------------------------------------------------------------
*/
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CompanyInfoController;
use App\Http\Controllers\CompanyReceiptController;
use App\Http\Controllers\FileUpload;
use App\Http\Controllers\MailController;
use App\Http\Controllers\PlanController;
use App\Http\Controllers\RazorpayController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\EmployeeTrackerController;
use App\Http\Controllers\EmployeeTransactionController;
use App\Http\Controllers\EmployeeDetailsController;
use App\Http\Controllers\CommonController;





// use App\Http\Controllers\PaymentTrackerController;   // include when you add routes

/*
|--------------------------------------------------------------------------
| Public (unauthenticated) routes
|--------------------------------------------------------------------------
*/

Route::apiResource('employee-details', EmployeeDetailsController::class);
Route::apiResource('employee-transactions', EmployeeTransactionController::class);  
Route::apiResource('employee-tracker', EmployeeTrackerController::class);
Route::apiResource('employees', EmployeeController::class);

Route::post('/register',      [AuthController::class, 'register']);
Route::post('/login',         [AuthController::class, 'login']);
Route::post('/mobileLogin',   [AuthController::class, 'mobileLogin']);

Route::post('/reset-password-link', [MailController::class, 'sendEmail']);
Route::post('/newPassword',         [MailController::class, 'resetPassword']);

/*
|--------------------------------------------------------------------------
| Authenticated routes
|--------------------------------------------------------------------------
*/
Route::middleware(['auth:sanctum'])->group(function () {
    Route::post('/employeeCredit', [CommonController::class, 'employeeCredit']);

    /* ---------- AuthController ---------- */
    Route::post('/changePassword', [AuthController::class, 'changePassword']);
    Route::post('/logout',         [AuthController::class, 'logout']);
    Route::post('/registerUser',   [AuthController::class, 'registerUser']);
    Route::put ('/appUsers',       [AuthController::class, 'update']);
    Route::get ('/appUsers',       [AuthController::class, 'allUsers']);

    /* ---------- PlanController ---------- */
    Route::resource('plan', PlanController::class);

    /* ---------- FileUpload ---------- */
    Route::post('/fileUpload', [FileUpload::class, 'fileUpload']);

    /* ---------- CompanyInfoController ---------- */
    Route::resource('company', CompanyInfoController::class);
    /* ---------- RazorpayController ---------- */
    Route::post('/create-order',  [RazorpayController::class, 'createOrder']);
    Route::post('/verify-payment', [RazorpayController::class, 'verifyPayment']);

    /* ---------- CompanyReceiptController ---------- */
    Route::post('/company-receipt',  [CompanyReceiptController::class, 'store']);
    Route::get ('/company-receipts', [CompanyReceiptController::class, 'index']);
});

/*
|--------------------------------------------------------------------------
| Authenticated user info (closure, no controller)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});
