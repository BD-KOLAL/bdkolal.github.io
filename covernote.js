document.addEventListener('DOMContentLoaded', function() {
    // Initialize jsPDF
    const { jsPDF } = window.jspdf;
    
    // Set current date
    const today = new Date();
    const formattedDate = today.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    document.getElementById('currentDate').textContent = formattedDate;
    
    // Add Member functionality
    const addMemberBtn = document.getElementById('addMember');
    const memberForm = document.getElementById('memberForm');
    const saveMemberBtn = document.getElementById('saveMember');
    const cancelAddBtn = document.getElementById('cancelAdd');
    const insuredBody = document.getElementById('insuredBody');
    
    // Update totals
    function updateTotals() {
        let totalLoan = 0;
        let totalPremium = 0;
        
        const rows = insuredBody.querySelectorAll('tr');
        rows.forEach(row => {
            const loanAmount = parseFloat(row.cells[4].textContent.replace(/,/g, ''));
            const premium = parseFloat(row.cells[5].textContent.replace(/,/g, ''));
            
            if (!isNaN(loanAmount)) totalLoan += loanAmount;
            if (!isNaN(premium)) totalPremium += premium;
        });
        
        document.getElementById('totalLoanAmount').textContent = totalLoan.toLocaleString('en-US');
        document.getElementById('totalPremium').textContent = totalPremium.toLocaleString('en-US');
    }
    
    // Add Member button click
    addMemberBtn.addEventListener('click', function() {
        memberForm.style.display = 'block';
    });
    
    // Cancel Add button click
    cancelAddBtn.addEventListener('click', function() {
        memberForm.style.display = 'none';
        // Clear form
        document.getElementById('memberForm').reset();
    });
    
    // Save Member button click
    saveMemberBtn.addEventListener('click', function() {
        // Get values from form
        const name = document.getElementById('newName').value;
        const id = document.getElementById('newId').value;
        const kraPin = document.getElementById('newKraPin').value;
        const dob = document.getElementById('newDob').value;
        const loanAmount = parseFloat(document.getElementById('newLoanAmount').value);
        const premium = parseFloat(document.getElementById('newPremium').value);
        
       
        
        // Create new row
        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td>${name}</td>
            <td>${id}</td>
            <td>${kraPin}</td>
            <td>${dob}</td>
            <td>${loanAmount.toLocaleString('en-US')}</td>
            <td>${premium.toLocaleString('en-US')}</td>
            <td><button class="delete-btn">Delete</button></td>
        `;
        
        // Add delete functionality
        const deleteBtn = newRow.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', function() {
            newRow.remove();
            updateTotals();
        });
        
        // Add row to table
        insuredBody.appendChild(newRow);
        
        // Update totals
        updateTotals();
        
        // Hide and reset form
        memberForm.style.display = 'none';
        document.getElementById('memberForm').reset();
    });
    
    // Save as PDF functionality
    const savePdfBtn = document.getElementById('savePdf');
    savePdfBtn.addEventListener('click', function() {
        // Get client name for filename
        const clientName = document.getElementById('assured').value || 'covernote';
        const filename = `covernote-${clientName.replace(/\s+/g, '-').toLowerCase()}`;
        
        // Create new PDF with landscape orientation
        const doc = new jsPDF('p', 'pt', 'a4');
        
        // Add logo image
        const logoImg = document.querySelector('.header img');
        const logoData = logoImg.src;
        doc.addImage(logoData, 'PNG', 400, 20, 120, 40);
        
        // Add title
        doc.setFontSize(16);
        doc.setTextColor(14, 20, 75);
        doc.text('GROUP CREDIT LIFE - COVER NOTE', 40, 50);
        doc.setFontSize(14);
        doc.text('COVER NOTE', 40, 70);
        
        // Add basic info
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        let yPos = 100;
        
        // Add assured info
        const assuredName = document.getElementById('assured').value;
        doc.text(`NAME OF THE ASSURED: ${assuredName}`, 40, yPos);
        yPos += 20;
        
        doc.text(`POLICY NUMBER: ${document.getElementById('policyNumber').textContent}`, 40, yPos);
        yPos += 20;
        
        doc.text(`TYPE OF POLICY: ${document.getElementById('policyType').textContent}`, 40, yPos);
        yPos += 20;
        
        // Add borrower info
        const borrowers = document.getElementById('Borrowers').value;
        doc.text(`NAME OF BORROWERS COVERED: ${borrowers}`, 40, yPos);
        yPos += 20;
        
        // Add loan info
        const loanAmount = document.getElementById('loanAmount').value;
        doc.text(`LOAN AMOUNT: ${loanAmount}`, 40, yPos);
        yPos += 20;
        
        const disbursementDate = document.getElementById('disbursementDate').value;
        doc.text(`Loan disbursement (Risk) Date: ${disbursementDate}`, 40, yPos);
        yPos += 20;
        
        const loanIssueDate = document.getElementById('loanIssueDate').value;
        doc.text(`LOAN ISSUE DATE: ${loanIssueDate}`, 40, yPos);
        yPos += 20;
        
        const maturityDate = document.getElementById('maturityDate').value;
        doc.text(`Maturity Date: ${maturityDate}`, 40, yPos);
        yPos += 20;
        
        const term = document.getElementById('term').value;
        doc.text(`Loan Term (in months): ${term}`, 40, yPos);
        yPos += 20;
        
        const policyType = document.getElementById('policy-type').value;
        doc.text(`Policy Type: ${policyType}`, 40, yPos);
        yPos += 30;
        
        // Add insured details table
        doc.setFontSize(12);
        doc.setTextColor(14, 20, 75);
        doc.text('INSURED DETAILS', 40, yPos);
        yPos += 20;
        
        // Prepare table data
        const tableData = [];
        const headers = [
            'CLIENT NAME', 
            'ID', 
            'KRA PIN', 
            'DOB', 
            'LOAN AMOUNT', 
            'PROPORTIONAL PREMIUM (Kes)'
        ];
        
        // Add header row
        tableData.push(headers);
        
        // Add member rows
        const rows = insuredBody.querySelectorAll('tr');
        rows.forEach(row => {
            const rowData = [];
            for (let i = 0; i < 6; i++) { // Skip the delete button column
                rowData.push(row.cells[i].textContent);
            }
            tableData.push(rowData);
        });
        
        // Add totals row
        tableData.push([
            '', '', '', 'TOTAL (Ksh)',
            document.getElementById('totalLoanAmount').textContent,
            document.getElementById('totalPremium').textContent
        ]);
        
        // Generate table
        doc.autoTable({
            startY: yPos,
            head: [tableData[0]],
            body: tableData.slice(1, -1),
            foot: [tableData[tableData.length - 1]],
            margin: { left: 40 },
            styles: { fontSize: 8 },
            headStyles: { 
                fillColor: [220, 220, 220],
                textColor: [14, 20, 75],
                fontStyle: 'bold'
            },
            footStyles: { 
                fillColor: [220, 220, 220],
                textColor: [14, 20, 75],
                fontStyle: 'bold'
            },
            columnStyles: {
                4: { halign: 'right' },
                5: { halign: 'right' }
            }
        });
        
        yPos = doc.lastAutoTable.finalY + 30;
        
        // Add prepared by and date
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        const preparedBy = document.querySelector('#preparedBy input[type="text"]').value;
        doc.text(`Prepared By: ${preparedBy}`, 40, yPos);
        
        // Try to add signature image if available
        const signatureInput = document.querySelector('#preparedBy input[type="file"]');
        if (signatureInput.files.length > 0) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const imgData = e.target.result;
                doc.addImage(imgData, 'JPEG', 120, yPos - 15, 60, 20);
                doc.text(`Date: ${formattedDate}`, 400, yPos);
                
                // Add Terms & Conditions
                yPos += 40;
                doc.setFontSize(12);
                doc.setTextColor(14, 20, 75);
                doc.text('Cover Terms & Conditions', 40, yPos);
                yPos += 20;
                
                doc.setFontSize(10);
                doc.setTextColor(0, 0, 0);
                const terms = [
                    'The policy shall be subject to signed service level agreement.',
                    'Premium clause shall apply',
                    'Policy shall be subject to underwriting guidelines and requirements'
                ];
                
                terms.forEach(term => {
                    doc.text(`• ${term}`, 50, yPos);
                    yPos += 15;
                });
                
                yPos += 10;
                doc.text('If you have any questions about this debit note, please contact us.', 40, yPos);
                
                // Add footer
                yPos += 30;
                doc.setFontSize(12);
                doc.setTextColor(14, 20, 75);
                doc.text('Thank You For Your Business', doc.internal.pageSize.width / 2, yPos, { align: 'center' });
                
                doc.save(filename + '.pdf');
            };
            reader.readAsDataURL(signatureInput.files[0]);
        } else {
            doc.text(`Date: ${formattedDate}`, 400, yPos);
            
            // Add Terms & Conditions
            yPos += 40;
            doc.setFontSize(12);
            doc.setTextColor(14, 20, 75);
            doc.text('Cover Terms & Conditions', 40, yPos);
            yPos += 20;
            
            doc.setFontSize(10);
            doc.setTextColor(0, 0, 0);
            const terms = [
                'The policy shall be subject to signed service level agreement.',
                'Premium clause shall apply',
                'Policy shall be subject to underwriting guidelines and requirements'
            ];
            
            terms.forEach(term => {
                doc.text(`• ${term}`, 50, yPos);
                yPos += 15;
            });
            
            yPos += 10;
            doc.text('If you have any questions about this debit note, please contact us.', 40, yPos);
            
            // Add footer
            yPos += 30;
            doc.setFontSize(12);
            doc.setTextColor(14, 20, 75);
            doc.text('Thank You For Your Business', doc.internal.pageSize.width / 2, yPos, { align: 'center' });
            
            doc.save(filename + '.pdf');
        }
    });
});