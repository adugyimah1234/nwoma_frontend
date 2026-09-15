// Enhanced Receipt Printing Functions for Garrison Assessments

interface AssessmentRegistrationData {
    id: number;
    // Student Information
    first_name: string;
    middle_name?: string;
    last_name: string;
    date_of_birth: string;
    gender: string;
    email: string;
    phone_number: string;

    // Guardian Information
    guardian_name: string;
    relationship: string;
    guardian_phone_number: string;

    // Registration Details
    registration_date: string;
    class_applying_for: string;
    category: string;
    exam_date: string;
    venue: string;
    exam_time: string;
    front_desk_person: string;

    // Payment & Status
    registration_fee?: string;
    status: string;
    scores?: string;

    // School Metadata (Dynamic)
    school_name?: string;
    school_address?: string;
    school_phone?: string;
    logo_url?: string;
}

// --- Enhanced Print Functions for Garrison Assessments ---

const handlePrintAssessmentReceipt = (registration: AssessmentRegistrationData) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
        printWindow.document.write(`
            <html>
                <head>
                    <title>${registration.school_name || 'Garrison'} Assessment Registration Receipt</title>
                    <style>
                        @media print {
                            @page { size: A4; margin: 1.5cm; }
                            body { -webkit-print-color-adjust: exact; }
                        }
                        body {
                            font-family: 'Times New Roman', serif;
                            padding: 20px;
                            max-width: 800px;
                            margin: 0 auto;
                            line-height: 1.4;
                        }
                        .logo-header {
                            text-align: center;
                            margin-bottom: 30px;
                            border-bottom: 3px solid #2c5282;
                            padding-bottom: 20px;
                        }
                        .logo img {
                            height: 100px;
                            width: auto;
                            margin-bottom: 10px;
                        }
                        .institution-name {
                            font-size: 24px;
                            font-weight: bold;
                            color: #2c5282;
                            margin: 10px 0;
                        }
                        .exam-title {
                            font-size: 20px;
                            color: #e53e3e;
                            font-weight: bold;
                            margin: 5px 0;
                        }
                        .receipt-title {
                            font-size: 18px;
                            text-decoration: underline;
                            margin: 10px 0;
                        }
                        .receipt-info {
                            background: #f7fafc;
                            padding: 15px;
                            border: 2px solid #e2e8f0;
                            margin-bottom: 20px;
                            border-radius: 8px;
                        }
                        .section {
                            margin-bottom: 25px;
                            padding: 15px;
                            background: #f8f9fa;
                            border-left: 4px solid #2c5282;
                            border-radius: 0 5px 5px 0;
                        }
                        .section-title {
                            font-weight: bold;
                            font-size: 16px;
                            border-bottom: 2px solid #2c5282;
                            margin-bottom: 15px;
                            padding-bottom: 8px;
                            color: #2c5282;
                            text-transform: uppercase;
                        }
                        .info-row {
                            display: flex;
                            margin-bottom: 12px;
                            padding: 6px 0;
                            border-bottom: 1px dotted #cbd5e0;
                        }
                        .info-row:last-child {
                            border-bottom: none;
                        }
                        .label {
                            font-weight: bold;
                            width: 180px;
                            color: #4a5568;
                        }
                        .value {
                            flex: 1;
                            color: #2d3748;
                        }
                        .exam-details {
                            background: #fff5f5;
                            border: 2px solid #feb2b2;
                            padding: 20px;
                            margin: 20px 0;
                            border-radius: 8px;
                        }
                        .exam-details .section-title {
                            color: #e53e3e;
                            border-bottom-color: #e53e3e;
                        }
                        .important-notice {
                            background: #fffbeb;
                            border: 2px solid #f6e05e;
                            padding: 15px;
                            margin: 20px 0;
                            border-radius: 8px;
                        }
                        .important-notice h4 {
                            color: #d69e2e;
                            margin: 0 0 10px 0;
                            font-size: 16px;
                        }
                        .footer {
                            margin-top: 40px;
                            text-align: center;
                            font-size: 0.9em;
                            color: #666;
                            border-top: 2px solid #e2e8f0;
                            padding-top: 20px;
                        }
                        .signatures {
                            display: flex;
                            justify-content: space-between;
                            margin: 40px 0 20px 0;
                            padding: 0 20px;
                        }
                        .signature-box {
                            text-align: center;
                            width: 200px;
                            border-top: 1px solid #000;
                            padding-top: 5px;
                        }
                        .watermark {
                            position: fixed;
                            bottom: 50px;
                            right: 50px;
                            opacity: 0.1;
                            transform: rotate(-45deg);
                            font-size: 60px;
                            z-index: -1;
                            color: #2c5282;
                            font-weight: bold;
                        }
                        .status-badge {
                            display: inline-block;
                            padding: 4px 12px;
                            border-radius: 20px;
                            font-size: 12px;
                            font-weight: bold;
                            text-transform: uppercase;
                        }
                        .status-confirmed {
                            background: #c6f6d5;
                            color: #22543d;
                        }
                        .status-pending {
                            background: #fef5e7;
                            color: #c05621;
                        }
                    </style>
                </head>
                <body>
                    <div class="logo-header">
                        <div class="logo">
                            <img src="${registration.logo_url || '/logo.png'}" alt="Institution Logo"/>
                        </div>
                        <div class="institution-name">${registration.school_name || 'Garrison Education Centre'}</div>
                        <div class="exam-title">ENTRANCE ASSESSMENT</div>
                        <div class="receipt-title">REGISTRATION RECEIPT</div>
                    </div>

                    <div class="receipt-info">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <strong>Receipt ID:</strong> ${registration.id}<br>
                                <strong>Registration Date:</strong> ${new Date(registration.registration_date).toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </div>
                            <div>
                                <strong>Processed by:</strong> ${registration.front_desk_person}<br>
                                <strong>Status:</strong> <span class="status-badge status-${registration.status.toLowerCase()}">${registration.status}</span>
                            </div>
                        </div>
                    </div>

                    <div class="section">
                        <div class="section-title">Student Information</div>
                        <div class="info-row">
                            <span class="label">Full Name:</span>
                            <span class="value">${registration.first_name} ${registration.middle_name || ''} ${registration.last_name}</span>
                        </div>
                        <div class="info-row">
                            <span class="label">Date of Birth:</span>
                            <span class="value">${new Date(registration.date_of_birth).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}</span>
                        </div>
                        <div class="info-row">
                            <span class="label">Gender:</span>
                            <span class="value">${registration.gender}</span>
                        </div>
                        <div class="info-row">
                            <span class="label">Email Address:</span>
                            <span class="value">${registration.email}</span>
                        </div>
                        <div class="info-row">
                            <span class="label">Phone Number:</span>
                            <span class="value">${registration.phone_number}</span>
                        </div>
                    </div>

                    <div class="section">
                        <div class="section-title">Guardian Information</div>
                        <div class="info-row">
                            <span class="label">Guardian Name:</span>
                            <span class="value">${registration.guardian_name}</span>
                        </div>
                        <div class="info-row">
                            <span class="label">Relationship:</span>
                            <span class="value">${registration.relationship}</span>
                        </div>
                        <div class="info-row">
                            <span class="label">Guardian Phone:</span>
                            <span class="value">${registration.guardian_phone_number}</span>
                        </div>
                    </div>

                    <div class="exam-details">
                        <div class="section-title">Assessment Details</div>
                        <div class="info-row">
                            <span class="label">Class Required:</span>
                            <span class="value">${registration.class_applying_for}</span>
                        </div>
                        <div class="info-row">
                            <span class="label">Category:</span>
                            <span class="value">${registration.category}</span>
                        </div>
                        <div class="info-row">
                            <span class="label">Assessment Date:</span>
                            <span class="value">${new Date(registration.exam_date).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}</span>
                        </div>
                        <div class="info-row">
                            <span class="label">Assessment Time:</span>
                            <span class="value">${registration.exam_time}</span>
                        </div>
                        <div class="info-row">
                            <span class="label">Venue:</span>
                            <span class="value">${registration.venue}</span>
                        </div>
                    </div>

                    <div class="section">
                        <div class="section-title">Payment Information</div>
                        <div class="info-row">
                            <span class="label">Registration Fee:</span>
                            <span class="value">GH₵ ${registration.registration_fee || 'XXX.XX'}</span>
                        </div>
                        <div class="info-row">
                            <span class="label">Payment Status:</span>
                            <span class="value">${registration.status}</span>
                        </div>
                        ${registration.scores ? `
                        <div class="info-row">
                            <span class="label">Previous Scores:</span>
                            <span class="value">${registration.scores}</span>
                        </div>
                        ` : ''}
                    </div>

                    <div class="important-notice">
                        <h4>⚠️ IMPORTANT ASSESSMENT INSTRUCTIONS</h4>
                        <ul style="margin: 10px 0; padding-left: 20px;">
                            <li>Report to the assessment venue 30 minutes before the scheduled time</li>
                            <li>Bring this receipt and a valid photo ID on the assessment day</li>
                            <li>No electronic devices, books, or notes are allowed in the assessment hall</li>
                            <li>Late arrivals will not be permitted to take the assessment</li>
                            <li>Contact the school office for any changes or inquiries</li>
                        </ul>
                    </div>

                    <div class="signatures">
                        <div class="signature-box">
                            <div style="margin-bottom: 30px;"></div>
                            Student Signature
                        </div>
                        <div class="signature-box">
                            <div style="margin-bottom: 30px;"></div>
                            Front Desk Officer
                        </div>
                    </div>

                    <div class="footer">
                        <p><strong>${registration.school_name || 'Garrison Education Centre'} - Assessment Division</strong></p>
                        <p>${registration.school_address ? registration.school_address + ' | ' : ''}${registration.school_phone ? 'Phone: ' + registration.school_phone : ''}</p>
                        <p><em>This is an official assessment registration receipt. Keep it safe for your records.</em></p>
                        <p>Generated on: ${new Date().toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}</p>
                    </div>

                    <div class="watermark">
                        OFFICIAL<br>RECEIPT
                    </div>
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    }
};

// PDF Export Function
const handleExportAssessmentReceiptPDF = (registration: AssessmentRegistrationData) => {
    const receiptContent = `
        ENTRANCE ASSESSMENT REGISTRATION RECEIPT
        =======================================

        Receipt ID: ${registration.id}
        Registration Date: ${new Date(registration.registration_date).toLocaleDateString()}
        Processed by: ${registration.front_desk_person}
        Status: ${registration.status}

        STUDENT INFORMATION
        ------------------
        Name: ${registration.first_name} ${registration.middle_name || ''} ${registration.last_name}
        Date of Birth: ${new Date(registration.date_of_birth).toLocaleDateString()}
        Gender: ${registration.gender}
        Email: ${registration.email}
        Phone: ${registration.phone_number}

        GUARDIAN INFORMATION
        -------------------
        Name: ${registration.guardian_name}
        Relationship: ${registration.relationship}
        Phone: ${registration.guardian_phone_number}

        ASSESSMENT DETAILS
        ===========================
        Class Required: ${registration.class_applying_for}
        Category: ${registration.category}
        Assessment Date: ${new Date(registration.exam_date).toLocaleDateString()}
        Assessment Time: ${registration.exam_time}
        Venue: ${registration.venue}

        PAYMENT INFORMATION
        ------------------
        Registration Fee: GH₵ ${registration.registration_fee || 'XXX.XX'}
        Payment Status: ${registration.status}
        ${registration.scores ? `Previous Scores: ${registration.scores}` : ''}

        IMPORTANT INSTRUCTIONS
        ---------------------
        - Report 30 minutes before assessment time
        - Bring this receipt and valid photo ID
        - No electronic devices allowed
        - Late arrivals will not be permitted

        Contact: office@garrison.edu.gh
        Generated: ${new Date().toLocaleString()}
    `;

    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Assessment-receipt-${registration.id}-${registration.first_name}-${registration.last_name}.txt`;
    link.click();
    URL.revokeObjectURL(url);
};

// Excel/CSV Export Function
const handleExportAssessmentReceiptExcel = (registration: AssessmentRegistrationData) => {
    const data = [
        ['ENTRANCE ASSESSMENT REGISTRATION RECEIPT'],
        [''],
        ['Receipt Information'],
        ['Receipt ID', registration.id],
        ['Registration Date', new Date(registration.registration_date).toLocaleDateString()],
        ['Processed by', registration.front_desk_person],
        ['Status', registration.status],
        [''],
        ['Student Information'],
        ['First Name', registration.first_name],
        ['Middle Name', registration.middle_name || ''],
        ['Last Name', registration.last_name],
        ['Date of Birth', new Date(registration.date_of_birth).toLocaleDateString()],
        ['Gender', registration.gender],
        ['Email', registration.email],
        ['Phone', registration.phone_number],
        [''],
        ['Guardian Information'],
        ['Guardian Name', registration.guardian_name],
        ['Relationship', registration.relationship],
        ['Guardian Phone', registration.guardian_phone_number],
        [''],
        ['Assessment Details'],
        ['Class Required', registration.class_applying_for],
        ['Category', registration.category],
        ['Assessment Date', new Date(registration.exam_date).toLocaleDateString()],
        ['Assessment Time', registration.exam_time],
        ['Venue', registration.venue],
        [''],
        ['Payment Information'],
        ['Registration Fee', `GH₵ ${registration.registration_fee || 'XXX.XX'}`],
        ['Payment Status', registration.status],
        ['Previous Scores', registration.scores || ''],
        [''],
        ['Generated', new Date().toLocaleString()],
    ];

    const csvContent = data.map(row =>
        row.map(cell => `"${cell}"`).join(',')
    ).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Assessment-receipt-${registration.id}-${registration.first_name}-${registration.last_name}.csv`;
    link.click();
    URL.revokeObjectURL(url);
};

// Export all functions
export {
    handlePrintAssessmentReceipt,
    handleExportAssessmentReceiptPDF,
    handleExportAssessmentReceiptExcel,
    type AssessmentRegistrationData
};

