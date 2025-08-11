// script.js
document.addEventListener('DOMContentLoaded', function() {
    // Initialize variables
    let salaryData = [];
    const today = new Date();
    const formattedDate = today.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });

    // DOM elements
    const calculateBtn = document.getElementById('calculateBtn');
    const generateDataBtn = document.getElementById('generateDataBtn');
    const addSalaryBtn = document.getElementById('addSalaryBtn');
    const saveCostingBtn = document.getElementById('saveCostingBtn');
    const saveQuotationBtn = document.getElementById('saveQuotationBtn');
    const signaturePhoto = document.getElementById('signaturePhoto');
    const signaturePreview = document.getElementById('signaturePreview');
    
    // Event listeners
    calculateBtn.addEventListener('click', calculatePremium);
    generateDataBtn.addEventListener('click', generateSalaryData);
    addSalaryBtn.addEventListener('click', addSalaryEntry);
    saveCostingBtn.addEventListener('click', saveCostingAsPDF);
    saveQuotationBtn.addEventListener('click', saveQuotationAsPDF);
    signaturePhoto.addEventListener('change', handleSignatureUpload);

    // Initialize the form
    initializeForm();

    function handleSignatureUpload(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                signaturePreview.innerHTML = `<img src="${e.target.result}" alt="Signature">`;
                updateQuotationPreview();
            };
            reader.readAsDataURL(file);
        }
    }

    function initializeForm() {
        calculatePremium();
    }

    function calculatePremium() {
        const members = parseInt(document.getElementById('members').value) || 0;
        const salaryType = document.getElementById('salaryType').value;
        let totalSalary = parseFloat(document.getElementById('totalSalary').value) || 0;
        const sumAssuredType = document.getElementById('sumAssuredType').value;
        const sumAssuredValue = parseFloat(document.getElementById('sumAssuredValue').value) || 0;
        const lastExpense = parseFloat(document.getElementById('lastExpense').value) || 0;
        const discount = parseFloat(document.getElementById('discount').value) || 0;
        const ciAccelerated = document.getElementById('ciAccelerated').checked;
        const leAccelerated = document.getElementById('leAccelerated').checked;

        // Convert to annual salary if monthly was provided
        if (salaryType === 'monthly') {
            totalSalary = totalSalary * 12;
        }

        // Calculate sum assured based on type
        let sumAssured;
        if (sumAssuredType === 'multiplier') {
            sumAssured = totalSalary * sumAssuredValue;
        } else {
            sumAssured = sumAssuredValue;
        }

        // Calculate premiums
        const deathPremium = sumAssured * 3.5 / 1000;
        const ptdPremium = sumAssured * 0 / 1000; // Rate is 0
        
        // Critical Illness premium (1 per mille if not accelerated)
        let ciPremium = 0;
        if (!ciAccelerated) {
            ciPremium = (sumAssured * 0.3) * 1 / 1000;
        }
        
        // Last Expense premium (1 per mille if not accelerated)
        let lePremium = 0;
        if (!leAccelerated) {
            lePremium = lastExpense * 1 / 1000;
        }

        // Calculate totals
        const totalPremium = deathPremium + ptdPremium + ciPremium + lePremium;
        const rebateAmount = totalPremium * (discount / 100);
        const finalPremium = totalPremium - rebateAmount;
        const netRate = (finalPremium / sumAssured) * 1000;

        // Update the costing table
        const costingTable = document.getElementById('costingTable').getElementsByTagName('tbody')[0];
        costingTable.innerHTML = `
            <tr>
                <td>GLA (Accidental, Illness & Natural Risks)</td>
                <td>Death in Service</td>
                <td>${sumAssuredValue} times Annual Salary</td>
                <td>${sumAssured.toLocaleString('en-US')}</td>
                <td>3.5</td>
                <td>${deathPremium.toLocaleString('en-US', {maximumFractionDigits: 2})}</td>
            </tr>
            <tr>
                <td></td>
                <td>Permanent Total disability</td>
                <td>${sumAssuredValue} times Annual Salary</td>
                <td>${sumAssured.toLocaleString('en-US')}</td>
                <td>0</td>
                <td>${ptdPremium.toLocaleString('en-US', {maximumFractionDigits: 2})}</td>
            </tr>
            <tr>
                <td></td>
                <td>Critical Illness</td>
                <td>30% of the death benefit up to a max of Kshs.3M</td>
                <td>${(sumAssured * 0.3).toLocaleString('en-US', {maximumFractionDigits: 2})}</td>
                <td>${ciAccelerated ? 'Accelerated' : '1.0'}</td>
                <td>${ciPremium.toLocaleString('en-US', {maximumFractionDigits: 2})}</td>
            </tr>
            <tr>
                <td></td>
                <td>Last Expense - Principal member</td>
                <td>${lastExpense.toLocaleString('en-US')}</td>
                <td>${lastExpense.toLocaleString('en-US')}</td>
                <td>${leAccelerated ? 'Accelerated' : '1.0'}</td>
                <td>${lePremium.toLocaleString('en-US', {maximumFractionDigits: 2})}</td>
            </tr>
        `;

        // Update summary
        document.getElementById('totalPremium').textContent = totalPremium.toLocaleString('en-US', {maximumFractionDigits: 2});
        document.getElementById('rebateAmount').textContent = rebateAmount.toLocaleString('en-US', {maximumFractionDigits: 2});
        document.getElementById('finalPremium').textContent = finalPremium.toLocaleString('en-US', {maximumFractionDigits: 2});
        document.getElementById('netRate').textContent = netRate.toLocaleString('en-US', {maximumFractionDigits: 2});

        // Update the quotation preview
        updateQuotationPreview();
    }

    function generateSalaryData() {
        const members = parseInt(document.getElementById('members').value) || 0;
        const salaryType = document.getElementById('salaryType').value;
        let totalSalary = parseFloat(document.getElementById('totalSalary').value) || 0;

        // Convert to monthly salary if annual was provided
        if (salaryType === 'annual') {
            totalSalary = totalSalary / 12;
        }

        // Calculate average monthly salary per member
        const avgSalary = totalSalary / members;

        // Generate random salaries that add up to the total monthly salary
        salaryData = [];
        let remainingSalary = totalSalary;
        
        for (let i = 0; i < members; i++) {
            // For the last member, use the remaining salary
            if (i === members - 1) {
                salaryData.push(remainingSalary);
                break;
            }
            
            // Generate a random salary around the average (between 50% and 150% of average)
            const minSalary = avgSalary * 0.5;
            const maxSalary = avgSalary * 1.5;
            const randomSalary = Math.random() * (maxSalary - minSalary) + minSalary;
            
            // Ensure we don't exceed the remaining salary
            const salary = Math.min(randomSalary, remainingSalary - (members - i - 1) * minSalary);
            salaryData.push(salary);
            remainingSalary -= salary;
        }

        // Update the data analysis table
        updateDataAnalysisTable();
    }

    function addSalaryEntry() {
        const monthlySalary = prompt("Enter monthly salary (KES):");
        if (monthlySalary && !isNaN(monthlySalary)) {
            salaryData.push(parseFloat(monthlySalary));
            updateDataAnalysisTable();
        }
    }

    function updateDataAnalysisTable() {
        const table = document.getElementById('dataAnalysisTable').getElementsByTagName('tbody')[0];
        let totalReinsurance = 0;

        table.innerHTML = '';

        salaryData.forEach(salary => {
            const annualSalary = salary * 12;
            const sumAssured = annualSalary * 5; // Assuming 5x multiplier
            // Reinsurance amount is sum assured minus 2 million per person
            const reinsuranceAmt = sumAssured > 2000000 ? sumAssured - 2000000 : 0;
            const reinsurancePremium = reinsuranceAmt * 3.5 / 1000;
            totalReinsurance += reinsurancePremium;

            const row = table.insertRow();
            row.innerHTML = `
                <td>${salary.toLocaleString('en-US', {maximumFractionDigits: 2})}</td>
                <td>${annualSalary.toLocaleString('en-US', {maximumFractionDigits: 2})}</td>
                <td>${sumAssured.toLocaleString('en-US', {maximumFractionDigits: 2})}</td>
                <td>${reinsuranceAmt.toLocaleString('en-US', {maximumFractionDigits: 2})}</td>
                <td>${reinsurancePremium.toLocaleString('en-US', {maximumFractionDigits: 2})}</td>
                <td><button class="delete-btn" data-salary="${salary}">Delete</button></td>
            `;
        });

        // Add event listeners to delete buttons
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const salaryToRemove = parseFloat(this.getAttribute('data-salary'));
                salaryData = salaryData.filter(s => s !== salaryToRemove);
                updateDataAnalysisTable();
            });
        });

        // Update totals
        const finalPremium = parseFloat(document.getElementById('finalPremium').textContent.replace(/,/g, '')) || 0;
        document.getElementById('totalReinsurance').textContent = totalReinsurance.toLocaleString('en-US', {maximumFractionDigits: 2});
        document.getElementById('retentionPremium').textContent = (finalPremium - totalReinsurance).toLocaleString('en-US', {maximumFractionDigits: 2});
    }

    function updateQuotationPreview() {
        const organization = document.getElementById('organization').value || '[Organization Name]';
        const validityDays = document.getElementById('validityDays').value || 240;
        const members = document.getElementById('members').value || 0;
        const totalSalary = parseFloat(document.getElementById('totalSalary').value) || 0;
        const salaryType = document.getElementById('salaryType').value;
        const sumAssuredType = document.getElementById('sumAssuredType').value;
        const sumAssuredValue = document.getElementById('sumAssuredValue').value || 0;
        const lastExpense = document.getElementById('lastExpense').value || 0;
        const fcl = document.getElementById('fcl').value || 0;
        const finalPremium = document.getElementById('finalPremium').textContent || '0.00';
        const ciAccelerated = document.getElementById('ciAccelerated').checked;
        const leAccelerated = document.getElementById('leAccelerated').checked;
        const signatoryName = document.getElementById('signatoryName').value || '[Signatory Name]';

        // Display annual salary (convert if monthly was provided)
        let annualSalary = totalSalary;
        if (salaryType === 'monthly') {
            annualSalary = totalSalary * 12;
        }

        const quotationPreview = document.getElementById('quotationPreview');
        quotationPreview.innerHTML = `
            <h3>${formattedDate}</h3>
            <h2>GROUP LIFE QUOTATION -- ${organization.toUpperCase()}</h2>
            <p>Thank you for your request to quote for the above group life cover. Based on the data provided, we quote as follows:</p>
            
            <table>
                <tr>
                    <th colspan="2">BENEFIT TYPE: GROUP LIFE ASSURANCE</th>
                </tr>
                <tr>
                    <td><strong>Number of Staff:</strong></td>
                    <td>${members}</td>
                </tr>
                <tr>
                    <td><strong>Annual Salaries:</strong></td>
                    <td>Kshs. ${annualSalary.toLocaleString('en-US', {maximumFractionDigits: 2})}</td>
                </tr>
                <tr>
                    <td><strong>Coverage:</strong></td>
                    <td>Cover is on 24 Hours worldwide-International and domestic terrain</td>
                </tr>
            </table>
            
            <h4>A. GROUP LIFE COVER-Illness, Accidental and Natural Risks</h4>
            <table>
                <tr>
                    <th>BENEFITS PROVIDED - A. GROUP LIFE</th>
                    <th>COVER LIMITS</th>
                </tr>
                <tr>
                    <td>Death Benefits-illness and natural causes</td>
                    <td>${sumAssuredValue} Year Annual Salaries</td>
                </tr>
                <tr>
                    <td>Permanent and Total Disability (PTD)</td>
                    <td>${sumAssuredValue} Year Annual Salaries</td>
                </tr>
                <tr>
                    <td> ${ciAccelerated ? 'Accelerated' : ''} Critical illness 30% Sum Assured</td>
                    <td>Up to a Maximum of 3M </td>
                </tr>
                <tr>
                    <td> ${leAccelerated ? 'Accelerated' : ''} Principal Member's Last Expense</td>
                    <td>Kshs. ${parseFloat(lastExpense).toLocaleString('en-US')}</td>
                </tr>
                <tr>
                    <td>Free Cover limit</td>
                    <td>Kshs. ${parseFloat(fcl).toLocaleString('en-US', {maximumFractionDigits: 2})}</td>
                </tr>
                <tr>
                    <td><strong>Annual Premium</strong></td>
                    <td><strong>Kshs. ${finalPremium}</strong></td>
                </tr>
            </table>
            
            <p><strong>This quotation is valid for ${validityDays} days from the date of issue</strong></p>
            
            <h4>Summary of Cover and Benefits Included</h4>
            <table>
                <tr>
                    <th>Description</th>
                    <th>GLA Benefit Structure</th>
                </tr>
                <tr>
                    <td><strong>Main Benefits</strong><br>Scope of Cover</td>
                    <td>
                        <ul>
                            <li><strong>Death Benefit:</strong> Provides for the payment of the benefit on death of the assured due to illness, accidental and natural causes.</li>
                            <li><strong>Permanent & Total Disability (PTD):</strong> Provides for the payment of the benefit if the assured is totally and permanently disabled due to illness, accidental and natural causes.</li>
                            <li><strong>${ciAccelerated ? 'Accelerated' : ''} Critical Illness (CI):</strong> Upon first time diagnosis of the following conditions; Heart attack, Stroke, Cancer, Coronary Artery Disease, Major organ transplant, Kidney failure, Paraplegia or paralysis, <strong>30% of death benefit</strong> subject to a maximum limit as indicated above will be payable. This amount is will be deducted from the death benefit if death occurs in the same year of cover.</li>
                            <li><strong>${leAccelerated ? 'Accelerated' : ''} Principal Last Expense (LE):</strong> An amount of <strong>KES ${parseFloat(lastExpense).toLocaleString('en-US')}.00</strong> becomes payable to the family of the deceased life assured within 48 working hours of receipt of notification of death within the cover period. This amount is will be deducted from the death benefit if death occurs in the same year of cover.</li>
                            <li>Members above Free cover limit will be subjected to medical examination. Any member above free cover limit and does not undergo medical examination will have their benefits capped to FCL.</li>
                            <li>Age Limit under the death benefits between 18 and 65 years of age while under the critical illness cover are between 18 and 60 years of age.</li>
                            <li>Cover on 24 hours worldwide basis international and domestic terrain</li>
                            <li>No Policy Excess payments</li>
                            <li>No exclusion on HIV/AIDS</li>
                            <li><strong>COVID 19 related deaths:</strong> In the event that the insured suffers occupational related COVID deaths, the insurer shall be liable to compensate the insured up to the maximum death benefit limit subject to re terms and limits.</li>
                        </ul>
                    </td>
                </tr>
                <tr>
                    <td><strong>Value Added Services</strong></td>
                    <td>
                        <ul>
                            <li><strong>Member education:</strong> The Kenya Orient Life Assurance Ltd shall endeavor to support and work with the appointed agent in providing training member education and health talks for all the staff on the scope of cover as and when required to do so</li>
                            <li><strong>Service Level Agreement:</strong> The Kenya Orient Life Assurance Ltd shall sign a service level agreement with the Employer on the expected service level standards and the turnaround times for issuing any documents and payment of claims</li>
                            <li><strong>Quarterly scheme reviews:</strong> The Kenya Orient Life Assurance Ltd shall conduct quarterly meetings with the client to review and advice the client on the performance of the scheme.</li>
                        </ul>
                    </td>
                </tr>
                <tr>
                    <td><strong>Exclusion Clauses</strong></td>
                    <td>
                        <ul>
                            <li>Intentional self-injury.</li>
                            <li>Participation in any criminal act.</li>
                            <li>Failure by a Member to seek or to follow medical advice.</li>
                        </ul>
                    </td>
                </tr>
                <tr>
                    <td><strong>Policy Extensions</strong></td>
                    <td>
                        <ul>
                            <li><strong>No exclusion on HIV/AIDS</strong></li>
                            <li><strong>Geographic Limits:</strong> No geographical limits</li>
                        </ul>
                    </td>
                </tr>
            </table>
            
            <h4>Set Up Requirements:</h4>
            <p>Provide the following details to enable preparation of costing schedule:</p>
            <ul>
                <li>Dates of birth, names and ID numbers of the employees</li>
                <li>Amount of fixed benefits for the group or sub category</li>
                <li>Completed group proposal form-by the employer</li>
            </ul>
            
            <h4>Claims Methodology</h4>
            <p>The insurer shall adhere to the below listed timelines:</p>
            <table>
                <tr>
                    <th>Claim Type</th>
                    <th>Documents Required</th>
                </tr>
                <tr>
                    <td><strong>Death</strong></td>
                    <td>
                        <ol>
                            <li>Death Notification (email or official letter)</li>
                            <li>Original death certificate</li>
                            <li>Copy of National ID card or Surrender of ID Form</li>
                            <li>Duly completed claim form (signed by either Head of HR or Finance)</li>
                        </ol>
                    </td>
                </tr>
                <tr>
                    <td><strong>Permanent & Total Disability Benefits</strong></td>
                    <td>
                        <ol>
                            <li>Permanent Disability Notification (email or official letter)</li>
                            <li>Original Medical Reports</li>
                            <li>Duly completed claim form (signed by either Head of HR or Finance)</li>
                            <li>Personal Medical Attendant Report (PMAR) for permanent disability claims</li>
                        </ol>
                    </td>
                </tr>
                <tr>
                    <td><strong>Critical Illness Benefits</strong></td>
                    <td>
                        <ol>
                            <li>Critical Illness Notification (email or official letter)</li>
                            <li>Original Medical Reports</li>
                            <li>Duly completed claim form (signed by either Head of HR or Finance)</li>
                            <li>Personal Medical Attendant Report (PMAR) for permanent disability claims</li>
                            <li>Copy of National ID card or Surrender of ID Form</li>
                            <li>Current pay slip</li>
                        </ol>
                    </td>
                </tr>
                <tr>
                    <td><strong>Funeral Benefits</strong></td>
                    <td>
                        <ol>
                            <li>Death Notification (email or official letter)</li>
                            <li>Original Burial Permit for funeral benefits</li>
                            <li>Death Notification (email or official letter)</li>
                            <li>Copy of National ID card or Surrender of ID Form</li>
                            <li>Claim Settlement within 48 working Hours from receipt of documentation</li>
                        </ol>
                    </td>
                </tr>
            </table>
            
            <h4>All claims will be settled within the following timelines.</h4>
            <table>
                <tr>
                    <th>Claim Type</th>
                    <th>Discharge Voucher</th>
                    <th>Claim Settlement</th>
                </tr>
                <tr>
                    <td><strong>Death Benefits</strong></td>
                    <td>4 working days on delivery of required documentation</td>
                    <td>3 working days on receipt of duly signed Discharge Voucher</td>
                </tr>
                <tr>
                    <td><strong>Funeral Benefits</strong></td>
                    <td>Not Applicable</td>
                    <td>48 working hours from receipt of official communication.</td>
                </tr>
                <tr>
                    <td><strong>Permanent & Total Disability Benefits</strong></td>
                    <td>4 working days on delivery of required documentation</td>
                    <td>3 working days on receipt of duly signed Discharge Voucher</td>
                </tr>
                <tr>
                    <td><strong>Critical Illness</strong></td>
                    <td>2 working days on delivery of required documentation</td>
                    <td>2 working days on receipt of duly signed Discharge Voucher</td>
                </tr>
            </table>
            
            <p>We hope that our proposal extensively covers your requirements.</p>
            <p>Thank you for providing The Kenya Orient Life Assurance Ltd with an opportunity to showcase our solid group life benefits solutions.</p>
            <div class="signature-block">
                <p style="text-align: right;">Yours faithfully,</p>
                <div style="text-align: right; margin-top: 50px;">
                    ${signaturePreview.innerHTML ? `<div style="margin-bottom: 10px;">${signaturePreview.innerHTML}</div>` : ''}
                    <p><strong>${signatoryName}</strong></p>
                    <p><strong>Business Development</strong></p>
                </div>
            </div>
        `;
    }

     function saveCostingAsPDF() {
    // Show loading indicator
    const spinner = document.createElement('div');
    spinner.className = 'pdf-spinner';
    document.body.appendChild(spinner);
    
    try {
        // Check if jsPDF is available
        if (!window.jspdf) {
            throw new Error('jsPDF library not loaded');
        }
        
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Check if autoTable plugin is available
        if (typeof doc.autoTable !== 'function') {
            throw new Error('autoTable plugin not loaded');
        }

        const organization = document.getElementById('organization').value || 'GLA_Costing';
        
        // Add title
        doc.setFontSize(18);
        doc.text(`Group Life Assurance Costing - ${organization}`, 105, 15, { align: 'center' });
        
        // Add date
        doc.setFontSize(12);
        doc.text(`Date: ${formattedDate}`, 14, 25);
        
        // Add costing table
        doc.autoTable({
            html: '#costingTable',
            startY: 30,
            theme: 'grid',
            headStyles: { fillColor: [52, 152, 219] },
            didDrawPage: function(data) {
                // Header
                doc.setFontSize(12);
                doc.setTextColor(40);
                doc.text(`Page ${data.pageCount}`, data.settings.margin.left, 10);
            }
        });
        
        // Add summary
        const totalPremium = document.getElementById('totalPremium').textContent;
        const rebateAmount = document.getElementById('rebateAmount').textContent;
        const finalPremium = document.getElementById('finalPremium').textContent;
        const netRate = document.getElementById('netRate').textContent;
        
        doc.text(14, doc.lastAutoTable.finalY + 15, 'Summary:');
        doc.text(14, doc.lastAutoTable.finalY + 25, `Total Annual Premium: ${totalPremium} KES`);
        doc.text(14, doc.lastAutoTable.finalY + 30, `Business Rebate: ${rebateAmount} KES`);
        doc.text(14, doc.lastAutoTable.finalY + 35, `Final Premium: ${finalPremium} KES`);
        doc.text(14, doc.lastAutoTable.finalY + 40, `Net Rate: ${netRate} per 1000 KES`);
        
        // Add data analysis if available
        if (salaryData.length > 0) {
            doc.addPage();
            doc.setFontSize(18);
            doc.text('Data Analysis', 105, 15, { align: 'center' });
            
            doc.autoTable({
                html: '#dataAnalysisTable',
                startY: 25,
                theme: 'grid',
                headStyles: { fillColor: [52, 152, 219] }
            });
            
            // Add totals
            const totalReinsurance = document.getElementById('totalReinsurance').textContent;
            const retentionPremium = document.getElementById('retentionPremium').textContent;
            
            doc.text(14, doc.lastAutoTable.finalY + 15, 'Totals:');
            doc.text(14, doc.lastAutoTable.finalY + 25, `Total Reinsurance Premium: ${totalReinsurance} KES`);
            doc.text(14, doc.lastAutoTable.finalY + 30, `Retention Premium: ${retentionPremium} KES`);
        }
        
        // Save the PDF
        doc.save(`${organization}_Costing_${today.getFullYear()}${(today.getMonth()+1).toString().padStart(2, '0')}${today.getDate().toString().padStart(2, '0')}.pdf`);
    } catch (error) {
        console.error('PDF generation error:', error);
        alert(`PDF generation failed: ${error.message}. Please ensure all required libraries are loaded.`);
    } finally {
        // Remove loading indicator
        document.body.removeChild(spinner);
    }
}

    function saveQuotationAsPDF() {
        const organization = document.getElementById('organization').value || 'GLA_Quotation';
        
        // Use html2canvas to capture the quotation preview
        html2canvas(document.getElementById('quotationPreview')).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgWidth = 210; // A4 width in mm
            const pageHeight = 295; // A4 height in mm
            const imgHeight = canvas.height * imgWidth / canvas.width;
            let heightLeft = imgHeight;
            let position = 0;
            
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
            
            // Add new pages if the content is longer than one page
            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }
            
            // Save the PDF
            pdf.save(`${organization}_Quotation_${today.getFullYear()}${(today.getMonth()+1).toString().padStart(2, '0')}${today.getDate().toString().padStart(2, '0')}.pdf`);
        });
    }

});

