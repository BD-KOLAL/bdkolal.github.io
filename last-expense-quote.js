document.addEventListener("DOMContentLoaded", () => {
    // Current date display
    // Get current date in DDMMMYYYY format (e.g., 16Jul2025)
    const now = new Date();
    const day = now.getDate().toString().padStart(2, '0');
    const month = now.toLocaleString('default', { month: 'short' });
    const year = now.getFullYear();
    const currentDate = `${day} ${month} ${year}`;
    document.getElementById("currentDate").textContent = `Date: ${currentDate}`;

    
    

    // Premium calculation
    const premiumsPerFamily = [19500, 33800, 71500, 92300, 123500, 149500];
    const numberInput = document.getElementById("Num");
    const calculateBtn = document.getElementById("calculateBtn");
    const resetBtn = document.getElementById("resetBtn");
    const printBtn = document.getElementById("printBtn");

    // Calculate group premiums
    function calculatePremiums(event) {
        if (event) event.preventDefault();
        const numberOfFamilies = parseInt(numberInput.value) || 0;
        
        premiumsPerFamily.forEach((premium, index) => {
            const total = numberOfFamilies * premium;
            document.getElementById(`group${index + 1}`).textContent = 
                total.toLocaleString('en-KE');
        });
    }

    // Reset form
    function resetForm(event) {
        event.preventDefault();
        document.getElementById("groupName").value = "";
        document.getElementById("contactPerson").value = "";
        document.getElementById("contactEmail").value = "";
        numberInput.value = "0";
        
        premiumsPerFamily.forEach((_, index) => {
            document.getElementById(`group${index + 1}`).textContent = "";
        });
    }

    // Generate PDF with save dialog
    async function generatePDF(event) {
        event.preventDefault();
        
        // First ensure calculations are done
        calculatePremiums();
        
        // Clone the content
        const element = document.querySelector(".lequote-div");
        const clonedElement = element.cloneNode(true);

        // Create footer container for each page
        const pgBreaks = clonedElement.querySelectorAll('.pg-break');
        pgBreaks.forEach(page => {
            const pageFooter = document.createElement('div');
            pageFooter.innerHTML = clonedElement.querySelector('#pdf-footer').innerHTML;
            pageFooter.style.position = 'absolute';
            pageFooter.style.bottom = '0';
            pageFooter.style.left = '0';
            pageFooter.style.right = '0';
            pageFooter.style.textAlign = 'center';
            page.appendChild(pageFooter);
        });
        
        // Remove original footer
        clonedElement.querySelector('#pdf-footer')?.remove();
        
        // Replace inputs with their values
        const inputs = clonedElement.querySelectorAll("input");
        inputs.forEach(input => {
            const valueDisplay = document.createElement("span");
            valueDisplay.textContent = input.value;
            input.parentNode.replaceChild(valueDisplay, input);
        });
        
        // Remove buttons
        clonedElement.querySelector("#calculateBtn")?.remove();
        clonedElement.querySelector("#resetBtn")?.remove();
        clonedElement.querySelector("#printBtn")?.remove();

         // Get group name (trim and replace spaces with underscores)
    const groupName = document.getElementById("groupName").value.trim() || 'Group';
    const cleanGroupName = groupName.replace(/[^a-zA-Z0-9]/g, '_');
    
    // Create filename
    const filename = `Last_Expense_Quote_${cleanGroupName}_${currentDate}`;
    
        
        // PDF options
        const opt = {
            margin: 10,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { 
                scale: 2,
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
            // Generate PDF as blob
            const pdf = await html2pdf().set(opt).from(clonedElement).outputPdf('blob');
            
            // Create download link
            const blobUrl = URL.createObjectURL(pdf);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = `Last_Expense_Proposal_${document.getElementById("groupName").value || 'Group'}.pdf`;
            
            // Trigger click with a small delay
            setTimeout(() => {
                link.click();
                // Clean up
                setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
            }, 0);
            
        } catch (error) {
            console.error("PDF generation failed:", error);
            alert("Failed to generate PDF. Please check console for details.");
        }
    }

    // Event listeners
    calculateBtn.addEventListener("click", calculatePremiums);
    resetBtn.addEventListener("click", resetForm);
    printBtn.addEventListener("click", generatePDF);
});