<?php

namespace App\Http\Controllers;

use App\Models\EmployeeTransaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EmployeeTransactionController extends Controller
{
    /* GET /api/employee-transactions */
    public function index(): JsonResponse
    {
        return response()->json(EmployeeTransaction::latest()->paginate(15));
    }

    /* POST /api/employee-transactions */
    public function store(Request $request): JsonResponse
    {
        $data = $this->validatedData($request);

        $transaction = EmployeeTransaction::create($data);

        return response()->json($transaction, 201);
    }

    /* GET /api/employee-transactions/{transaction} */
    public function show(EmployeeTransaction $employeeTransaction): JsonResponse
    {
        return response()->json($employeeTransaction);
    }

    /* PUT / PATCH /api/employee-transactions/{transaction} */
    public function update(Request $request, EmployeeTransaction $employeeTransaction): JsonResponse
    {
        $data = $this->validatedData($request);

        $employeeTransaction->update($data);

        return response()->json($employeeTransaction);
    }

    /* DELETE /api/employee-transactions/{transaction} */
    public function destroy(EmployeeTransaction $employeeTransaction): JsonResponse
    {
        $employeeTransaction->delete();

        return response()->json(null, 204);
    }

    /* ────────────────
       Central validator
    ─────────────────── */
    protected function validatedData(Request $request): array
    {
        return $request->validate([
            'employee_id'       => ['required', 'exists:employee,id'],
            'company_id'        => ['required', 'integer', 'exists:company_info,company_id'],

            'transaction_type'  => ['required', 'in:credit,payment'],
            'payment_type'      => ['required', 'in:cash,upi,bank_transfer'],

            'salary_amount'     => ['required', 'numeric', 'min:0'],
            'payed_amount'      => ['required', 'numeric', 'min:0'],
        ]);
    }
}
