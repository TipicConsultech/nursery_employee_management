<?php

namespace App\Http\Controllers;

use App\Models\EmployeeDetails;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EmployeeDetailsController extends Controller
{
    /* GET /api/employee-details */
    public function index(): JsonResponse
    {
        return response()->json(EmployeeDetails::latest()->paginate(15));
    }

    /* POST /api/employee-details */
    public function store(Request $request): JsonResponse
    {
        $data = $this->validatedData($request);

        $details = EmployeeDetails::create($data);

        return response()->json($details, 201);
    }

    /* GET /api/employee-details/{details} */
    public function show(EmployeeDetails $employeeDetail): JsonResponse
    {
        return response()->json($employeeDetail);
    }

    /* PUT / PATCH /api/employee-details/{details} */
    public function update(Request $request, EmployeeDetails $employeeDetail): JsonResponse
    {
        $data = $this->validatedData($request);

        $employeeDetail->update($data);

        return response()->json($employeeDetail);
    }

    /* DELETE /api/employee-details/{details} */
    public function destroy(EmployeeDetails $employeeDetail): JsonResponse
    {
        $employeeDetail->delete();

        return response()->json(null, 204);
    }

    /* ────────────────
       Central validator
    ─────────────────── */
    protected function validatedData(Request $request): array
    {
        return $request->validate([
            'employee_id'    => ['required', 'exists:employee,id'],
            'company_id'     => ['required', 'integer', 'exists:company_info,company_id'],
            'document_name'  => ['required', 'string', 'max:255'],
            'document_link'  => ['required', 'url', 'max:2048'],
        ]);
    }
}
