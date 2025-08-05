document.addEventListener("DOMContentLoaded", () => {
    // Initialize form selections
    document.getElementById("quote-type").selectedIndex = 0;
    document.getElementById("policy-type").selectedIndex = 0;
    document.getElementById("credit-note").selectedIndex = 0;
    
    // Rate table for premium calculations
    const rateTable = {
        1: 1.5, 2: 2, 3: 2.4, 4: 2.7, 5: 2.9,
        6: 3, 7: 3.4, 8: 3.45, 9: 3.55, 10: 3.6,
        11: 3.65, 12: 3.7, 18: 5.5, 24: 6.6,
        36: 9.5, 42: 10.15, 48: 10.8, 60: 11.4
    };

    // Set current date
    const now = new Date();
    const day = now.getDate().toString().padStart(2, '0');
    const month = now.toLocaleString('default', { month: 'short' });
    const year = now.getFullYear();
    const currentDate = `${day} ${month} ${year}`;
    document.getElementById("currentDate").textContent = `Date: ${currentDate}`;

    // DOM elements
    const submitBtn = document.getElementById("ins-det");
    const medBtn = document.getElementById("med");
    const creditNoteSelect = document.getElementById("credit-note");
    const refundCalculatorDiv = document.querySelector(".calculator");
    const totalPremiumSummary = document.getElementById("total-premium-summary");
    const totalPremiumDisplay = document.querySelector(".total-premium");
    const insMembersDiv = document.querySelector(".ins-members");
    const printBtn = document.getElementById("printBtn");
    const resetBtn = document.getElementById("resetBtn");
    const exportRefundBtn = document.getElementById("exportRefundOnly");

    // State variables
    let totalShares = null;
    let totalPremium = 0;

    // Function to display custom messages
    function showMessage(message, type = 'info') {
        const messageBox = document.createElement('div');
        messageBox.className = `message-box ${type}`;
        messageBox.innerHTML = `
            <p>${message}</p>
            <button class="close-message">OK</button>
        `;
        document.body.appendChild(messageBox);

        messageBox.querySelector('.close-message').addEventListener('click', () => {
            messageBox.remove();
        });

        if (type === 'info') {
            setTimeout(() => {
                if (messageBox.parentNode) {
                    messageBox.remove();
                }
            }, 5000);
        }
    }

    // Initially hide refund calculator
    refundCalculatorDiv.style.display = "none";

    // Submit button event handler
    submitBtn.addEventListener("click", (e) => {
        e.preventDefault();

        const numberOfMembers = parseInt(document.getElementById("Num").value);
        const totalLoan = parseFloat(document.getElementById("loan").value);
        const term = parseInt(document.getElementById("term").value);
        const creditNoteValue = creditNoteSelect.value;

        // Input validation
        if (!rateTable[term]) {
            return showMessage("Invalid loan term.", 'error');
        }
        if (!numberOfMembers || numberOfMembers <= 0) {
            return showMessage("Invalid number of members.", 'error');
        }
        if (isNaN(totalLoan) || totalLoan <= 0) {
            return showMessage("Invalid total loan amount.", 'error');
        }

        insMembersDiv.innerHTML = "";

        // Create table for member details
        const table = document.createElement("table");
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Client Name</th>
                    <th>DOB</th>
                    <th>ID</th>
                    <th>KRA PIN</th>
                    <th>Shares</th>
                    <th>Loan</th>
                    <th>Term</th>
                    <th>Premium</th>
                </tr>
            </thead>
            <tbody></tbody>
        `;
        const tbody = table.querySelector('tbody');

        // Reset premium calculations
        totalPremium = 0;
        totalShares = null;

        // Add rows for each member
        for (let i = 0; i < numberOfMembers; i++) {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td><input type="text" class="client-name-input"></td>
                <td><input type="date" class="dob-input"></td>
                <td><input type="text" class="id-input"></td>
                <td><input type="text" class="kra-pin-input"></td>
                <td><input type="number" class="shares-input"></td>
                <td class="loan-cell">0</td>
                <td>${term}</td>
                <td class="premium-cell">0</td>
            `;
            tbody.appendChild(row);
        }

        insMembersDiv.appendChild(table);

        // Handle shares input and premium calculations
        const sharesInputs = table.querySelectorAll(".shares-input");

        sharesInputs.forEach(input => {
            input.addEventListener("focus", () => {
                if (totalShares === null) {
                    const sharesValue = parseFloat(prompt("Enter total shares for all members:"));
                    if (sharesValue > 0) {
                        totalShares = sharesValue;
                    } else {
                        showMessage("Please enter a valid total shares amount.", 'error');
                        input.blur();
                    }
                }
            });

            input.addEventListener("input", () => {
                if (totalShares === null || totalShares === 0) {
                    showMessage("Please enter total shares first.", 'error');
                    input.value = '';
                    return;
                }

                totalPremium = 0;

                sharesInputs.forEach(inp => {
                    const shares = parseFloat(inp.value) || 0;
                    const row = inp.closest("tr");
                    const loanCell = row.querySelector(".loan-cell");
                    const premiumCell = row.querySelector(".premium-cell");
                    const dobInput = row.querySelector(".dob-input");

                    let memberLoan = 0;
                    let memberPremium = 0;
                    let age = 0;

                    // Calculate age if DOB is provided
                    if (dobInput && dobInput.value) {
                        const birthDate = new Date(dobInput.value);
                        const today = new Date();
                        age = today.getFullYear() - birthDate.getFullYear();
                        const m = today.getMonth() - birthDate.getMonth();
                        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                            age--;
                        }
                    }

                    if (totalShares > 0) {
                        memberLoan = Math.ceil((shares / totalShares) * totalLoan);

                        if (age > 75) {
                            premiumCell.textContent = "Not Eligible";
                            loanCell.textContent = memberLoan.toLocaleString();
                            return;
                        }

                        let rate = rateTable[term] / 1000;
                        if (age > 70) {
                            rate = 40 / 1000;
                        }

                        memberPremium = Math.ceil(memberLoan * rate);
                    }

                    loanCell.textContent = memberLoan.toLocaleString();

                    if (age <= 75) {
                        premiumCell.textContent = memberPremium.toLocaleString();
                        totalPremium += memberPremium;
                    }
                });

                // Update premium displays
                totalPremiumSummary.innerHTML = `<p><strong>Total Premium: ${totalPremium.toLocaleString()} Ksh</strong></p>`;
                totalPremiumDisplay.innerHTML = `<p><strong>Total Premium: ${totalPremium.toLocaleString()} Ksh</strong></p>`;
            });
        });

        // Handle credit note selection
        if (creditNoteValue === "yes") {
            refundCalculatorDiv.style.display = "block";
            totalPremiumDisplay.innerHTML = `<p>Please calculate the refund first and then click Calculate Refund to finalize premium.</p>`;
        } else if (creditNoteValue === "no") {
            refundCalculatorDiv.style.display = "none";
            totalPremiumDisplay.innerHTML = `<p><strong>Total Premium: ____ Enter details in the table to get premium</strong></p>`;
        }
    });

    // Calculate refund button event handler
    document.getElementById("calculateBtn").addEventListener("click", () => {
        const creditNoteValue = creditNoteSelect.value;
        if (creditNoteValue !== "yes") {
            showMessage("Please select 'yes' for credit note availability first.", 'error');
            return;
        }

        // Get input values with validation
        const memberName = document.getElementById("memberName").value.trim();
        const loanAmount = parseFloat(document.getElementById("loanAmount").value) || 0;
        const premiumPaid = parseFloat(document.getElementById("premiumPaid").value) || 0;
        const bankClaim = parseFloat(document.getElementById("bankClaim").value) || 0;
        
        // Date validation
        let loanIssueDate, loanExpiryDate, loanClearedDate;
        try {
            loanIssueDate = new Date(document.getElementById("loanIssueDate").value);
            loanExpiryDate = new Date(document.getElementById("loanExpiryDate").value);
            loanClearedDate = new Date(document.getElementById("loanClearedDate").value);
            
            if (isNaN(loanIssueDate) || isNaN(loanExpiryDate) || isNaN(loanClearedDate)) {
                throw new Error("Invalid date format");
            }
        } catch (error) {
            return showMessage("Please enter valid dates in YYYY-MM-DD format.", 'error');
        }

        // Date logic validation
        if (loanIssueDate >= loanExpiryDate) {
            return showMessage("Loan Issue Date must be before Expiry Date.", 'error');
        }
        if (loanClearedDate < loanIssueDate || loanClearedDate > loanExpiryDate) {
            return showMessage("Loan Cleared Date must be between Issue and Expiry dates.", 'error');
        }

        // Calculate days
        const loanPeriodDays = Math.ceil((loanExpiryDate - loanIssueDate) / (1000 * 60 * 60 * 24));
        const daysOnCover = Math.ceil((loanClearedDate - loanIssueDate) / (1000 * 60 * 60 * 24));

        // Calculate premium values
        const premiumUsed = Math.round((premiumPaid * daysOnCover) / loanPeriodDays);
        const premiumRefundable = premiumPaid - premiumUsed;

        // Calculate commission (20% rate)
        const commissionRate = 0.20;
        const commissionPaid = Math.round(premiumPaid * commissionRate);
        const commissionRecovery = Math.round(premiumRefundable * commissionRate);

        // Final amounts
        const amountPayable = bankClaim > 0 ? Math.min(bankClaim, premiumRefundable) : premiumRefundable;
        const totalRecovery = commissionRecovery + (premiumRefundable - amountPayable);
        const netPayable = premiumRefundable - totalRecovery;

        // Format currency for display
        const formatCurrency = (value) => value.toLocaleString('en-KE', {minimumFractionDigits: 2, maximumFractionDigits: 2});
        
        // Update the UI with calculations
        document.getElementById("loanPeriod").textContent = loanPeriodDays;
        document.getElementById("daysOnCover").textContent = daysOnCover;
        document.getElementById("premiumUsed").textContent = formatCurrency(premiumUsed);
        document.getElementById("premiumRefundable").textContent = formatCurrency(premiumRefundable);
        document.getElementById("amountPayable").textContent = formatCurrency(amountPayable);
        document.getElementById("commissionPaid").textContent = formatCurrency(commissionPaid);
        document.getElementById("commissionRecovery").textContent = formatCurrency(commissionRecovery);
        document.getElementById("totalRecovery").textContent = formatCurrency(totalRecovery);
        document.getElementById("netPayable").textContent = formatCurrency(netPayable);

        // Update the total premium display if exists
        const totalText = totalPremiumSummary.textContent.match(/\d+/g);
        const totalPremiumCalc = totalText ? parseInt(totalText.join("")) : 0;
        const finalAmount = totalPremiumCalc - netPayable;
        totalPremiumDisplay.innerHTML = `<p><strong>Final Premium (after credit note): ${formatCurrency(finalAmount)} Ksh</strong></p>`;

        showMessage("Refund calculated successfully!", 'success');
        
        // Enable the export button after successful calculation
        if (exportRefundBtn) {
            exportRefundBtn.disabled = false;
            exportRefundBtn.style.opacity = "1";
            exportRefundBtn.style.cursor = "pointer";
        }
    });

    // Medical requirements button event handler
    if (medBtn) {
        medBtn.addEventListener("click", (e) => {
            e.preventDefault();
            const medicalsDiv = document.querySelector(".medicals");
            const supportParagraph = document.querySelector(".support");
            const totalLoan = parseFloat(document.getElementById("loan").value) || 0;
            const memberRows = document.querySelectorAll(".ins-members table tr");
            
            let medicalsTable = `<table border="1"><tr><th>Client Name</th><th>Age</th><th>Medical Requirement</th></tr>`;
            
            memberRows.forEach((row, index) => {
                if (index === 0) return; // Skip header row
                
                const nameInput = row.querySelector("td:nth-child(1) input");
                const dobInput = row.querySelector("td:nth-child(2) input");
                const loanCell = row.querySelector(".loan-cell");
                const loanAmount = parseFloat(loanCell?.textContent.replace(/,/g, "")) || 0;
                const name = nameInput?.value.trim() || "N/A";
                const dob = dobInput?.value;
                
                let age = "-";
                if (dob) {
                    const birthDate = new Date(dob);
                    const today = new Date();
                    age = today.getFullYear() - birthDate.getFullYear();
                    const m = today.getMonth() - birthDate.getMonth();
                    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
                }
                
                let medicalReq = "Medical Not Required";
                if (loanAmount > 2000000 || age > 70) medicalReq = "Medical Required";
                
                medicalsTable += `<tr><td>${name}</td><td>${age}</td><td>${medicalReq}</td></tr>`;
            });
            
            medicalsTable += `</table>`;
            medicalsDiv.innerHTML = medicalsTable;
            supportParagraph.textContent = totalLoan > 82000000 ? "Facultative Support Needed" : "Facultative Support Not Needed";
        });
    }

    // Export refund only button event handler
    if (exportRefundBtn) {
        exportRefundBtn.addEventListener("click", async () => {
            const memberName = document.getElementById("memberName").value.trim();
            const fileName = memberName ? `Credit_Note_${memberName.replace(/\s+/g, '_')}` : "Credit_Note";
            
            // Create a container for the PDF content
            const container = document.createElement("div");
            container.style.width = "210mm";
            container.style.margin = "0 auto";
            container.style.padding = "20px";
            
            // Add title with member name
            const title = document.createElement("h2");
            title.textContent = `CREDIT NOTE${memberName ? ` - ${memberName}` : ''}`;
            title.style.textAlign = "center";
            title.style.marginBottom = "20px";
            container.appendChild(title);
            
            // Clone and clean the calculator section
            const calculatorClone = document.querySelector(".calculator").cloneNode(true);
            calculatorClone.querySelectorAll("button").forEach(btn => btn.remove());
            
            // Remove the member name input field to avoid duplication
            const memberNameInput = calculatorClone.querySelector("#memberName");
            if (memberNameInput) memberNameInput.remove();
            
            container.appendChild(calculatorClone);
            
            // Add current date
            const dateElement = document.createElement("p");
            dateElement.textContent = `Generated on: ${new Date().toLocaleDateString('en-GB')}`;
            dateElement.style.textAlign = "right";
            dateElement.style.marginTop = "20px";
            container.appendChild(dateElement);
            
            // Add footer if available
            const footer = document.querySelector(".calculator + p");
            if (footer) {
                const footerClone = footer.cloneNode(true);
                container.appendChild(footerClone);
            }
            
            // Temporary add to DOM for rendering
            document.body.appendChild(container);
            
            const opt = {
                margin: 10,
                filename: `${fileName}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { 
                    scale: 1,
                    scrollX: 0,
                    scrollY: 0,
                    useCORS: true,
                    allowTaint: true
                },
                jsPDF: { 
                    unit: 'mm',
                    format: 'a4',
                    orientation: 'portrait'
                }
            };
            
            try {
                await html2pdf().from(container).set(opt).save();
                showMessage("Credit note exported successfully!", 'success');
            } catch (error) {
                console.error("Export failed:", error);
                showMessage("Failed to export credit note. Please try again.", 'error');
            } finally {
                container.remove();
            }
        });
    }

    // Print button event handler
    if (printBtn) {
        printBtn.addEventListener("click", async () => {
            const selectedValues = {};
            document.querySelectorAll("select").forEach(select => {
                selectedValues[select.id] = select.options[select.selectedIndex]?.textContent || "Not selected";
            });

            const allPagesContainer = document.createElement("div");
            allPagesContainer.className = "pdf-document";

            const pageSections = document.querySelectorAll(".pg-break");
            if (pageSections.length > 0) {
                pageSections.forEach((section, index) => {
                    const pageContainer = document.createElement("div");
                    pageContainer.className = "pdf-page";

                    const contentContainer = document.createElement("div");
                    contentContainer.className = "pdf-content";

                    const sectionClone = section.cloneNode(true);
                    sectionClone.querySelectorAll("button, .calculator").forEach(el => el.remove());
                    sectionClone.querySelectorAll("input, select").forEach(input => {
                        const span = document.createElement("span");
                        span.style.display = "inline-block";
                        span.style.minWidth = "100px";
                        span.style.padding = "2px 5px";
                        span.style.borderBottom = "1px solid #ddd";
                        if (input.type === "date" && input.value) {
                            span.textContent = new Date(input.value).toLocaleDateString("en-GB");
                        } else if (input.type === "number" || input.type === "text") {
                            span.textContent = input.value;
                        } else if (input.tagName === "SELECT") {
                            span.textContent = selectedValues[input.id] || "Not selected";
                        }
                        input.replaceWith(span);
                    });

                    sectionClone.querySelectorAll("table").forEach(table => {
                        table.style.width = "100%";
                        table.style.borderCollapse = "collapse";
                        table.style.marginBottom = "15px";
                        table.style.pageBreakInside = "avoid";
                        table.querySelectorAll("th, td").forEach(cell => {
                            cell.style.border = "1px solid #ddd";
                            cell.style.padding = "8px";
                            cell.style.textAlign = "left";
                        });
                    });

                    contentContainer.appendChild(sectionClone);
                    pageContainer.appendChild(contentContainer);
                    allPagesContainer.appendChild(pageContainer);
                });
            }

            const tempDiv = document.createElement("div");
            tempDiv.style.width = "210mm";
            tempDiv.style.margin = "0 auto";
            tempDiv.appendChild(allPagesContainer);
            document.body.appendChild(tempDiv);

            const opt = {
                margin: 10,
                filename: `Group_Credit_Quote_${document.getElementById("groupName")?.value || 'Group'}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, scrollX: 0, scrollY: 0, useCORS: true, allowTaint: true },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };

            try {
                await html2pdf().from(tempDiv).set(opt).save();
                showMessage("PDF generated successfully!", 'success');
            } catch (error) {
                console.error("PDF generation failed:", error);
                showMessage("Failed to generate PDF. Please check console for details.", 'error');
            } finally {
                tempDiv.remove();
            }
        });
    }

    // Reset Form function
    function resetForm() {
        document.querySelector("form").reset();
        insMembersDiv.innerHTML = "";
        refundCalculatorDiv.style.display = "none";
        totalPremiumSummary.innerHTML = "";
        totalPremiumDisplay.innerHTML = "";
        totalShares = null;
        totalPremium = 0;
        
        // Disable export button on reset
        if (exportRefundBtn) {
            exportRefundBtn.disabled = true;
            exportRefundBtn.style.opacity = "0.5";
            exportRefundBtn.style.cursor = "not-allowed";
        }
    }

    // Event listeners
    resetBtn.addEventListener("click", resetForm);
    
    // Initialize export button as disabled
    if (exportRefundBtn) {
        exportRefundBtn.disabled = true;
        exportRefundBtn.style.opacity = "0.5";
        exportRefundBtn.style.cursor = "not-allowed";
    }
});