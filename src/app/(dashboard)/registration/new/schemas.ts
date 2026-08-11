import * as z from 'zod';

export const registrationSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  middle_name: z.string().optional(),
  last_name: z.string().min(1, 'Last name is required'),
  date_of_birth: z.string().min(1, 'Date of birth is required'),
  class_applying_for: z.string().min(1, 'Class is required'),
  gender: z.enum(['Male', 'Female', 'Other']),
  previous_school: z.string().optional(),
  phone_number: z.string().min(1, 'Applicant phone number is required'),
  category: z.string().min(1, 'Category is required'),
  academic_year: z.string().min(1, 'Academic year is required'),
  guardian_name: z.string().min(1, 'Guardian name is required'),
  relationship: z.string().min(1, 'Relationship is required'),
  guardian_phone_number: z.string().min(1, 'Guardian phone number is required'),
  address: z.string().min(1, 'Address is required'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
});

export type RegistrationFormValues = z.infer<typeof registrationSchema>;
