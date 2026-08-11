// Utility: print table of applicant registrations
// Extracted to a separate .ts file to avoid confusing the JSX parser
// with HTML template literals containing <html>, <body>, etc.

interface RegistrationForPrint {
  registration_date?: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  class_applying_for?: string;
  gender?: string;
  scores?: number | null;
}

export function printRegistrationsTable(
  filteredRegistrations: RegistrationForPrint[],
  indexOfFirstItem: number
): void {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const rows = filteredRegistrations
    .map((registration, idx) => {
      const dateStr = registration.registration_date
        ? new Date(registration.registration_date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: '2-digit',
          })
        : '';
      return [
        '<tr>',
        `<td>${indexOfFirstItem + idx + 1}</td>`,
        `<td>${dateStr}</td>`,
        `<td>${registration.first_name} ${registration.middle_name ?? ''} ${registration.last_name}</td>`,
        `<td>${registration.class_applying_for ?? ''}</td>`,
        `<td>${registration.gender ?? ''}</td>`,
        `<td>${registration.scores ?? ''}</td>`,
        '</tr>',
      ].join('');
    })
    .join('');

  const html = [
    '<html><head><title>Registrations Table</title>',
    '<style>',
    '@media print { @page { size: landscape; margin: 2cm; } }',
    'body { font-family: Arial, sans-serif; padding: 20px; }',
    'table { width: 100%; border-collapse: collapse; margin-top: 20px; }',
    'th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }',
    'th { background-color: #f4f4f4; }',
    '.footer { margin-top: 20px; text-align: center; font-size: 0.9em; color: #666; }',
    '</style></head><body>',
    `<div style="text-align:center;margin-bottom:20px"><p>Total Records: ${filteredRegistrations.length}</p></div>`,
    '<table>',
    '<thead><tr><th>No.</th><th>Date</th><th>Name</th><th>Class</th><th>Gender</th><th>Scores</th></tr></thead>',
    '<tbody>',
    rows,
    '</tbody></table>',
    '</body></html>',
  ].join('');

  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.print();
}
