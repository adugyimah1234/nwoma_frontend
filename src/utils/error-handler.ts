import { UseFormSetError, FieldValues, Path } from "react-hook-form";

/**
 * Maps backend validation errors to react-hook-form fields
 * Backend format: [{ "field_name": "Error message" }]
 */
export function handleValidationError<T extends FieldValues>(
  error: any,
  setError: UseFormSetError<T>
): boolean {
  if (error && error.status === 422 && Array.isArray(error.validationErrors)) {
    error.validationErrors.forEach((errObj: Record<string, string>) => {
      const fields = Object.keys(errObj);
      fields.forEach((field) => {
        setError(field as Path<T>, {
          type: "manual",
          message: errObj[field],
        });
      });
    });
    return true;
  }
  return false;
}
