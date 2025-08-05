document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('calculateBtn').addEventListener('click', calculateRefund);
});

// Current date display
    // Get current date in DDMMMYYYY format (e.g., 16Jul2025)
    const now = new Date();
    const day = now.getDate().toString().padStart(2, '0');
    const month = now.toLocaleString('default', { month: 'short' });
    const year = now.getFullYear();
    const currentDate = `${day} ${month} ${year}`;
    document.getElementById("currentDate").textContent = `Date: ${currentDate}`;

function calculateRefund() {
    try {
        // Get all input elements
        const loanIssueDateEl = document.getElementById('loanIssueDate');
        const loanExpiryDateEl = document.getElementById('loanExpiryDate');
        const loanClearedDateEl = document.getElementById('loanClearedDate');
        const premiumPaidEl = document.getElementById('premiumPaid');
        const bankClaimEl = document.getElementById('bankClaim');

        // Check if elements exist
        if (!loanIssueDateEl || !loanExpiryDateEl || !loanClearedDateEl || 
            !premiumPaidEl || !bankClaimEl) {
            throw new Error('One or more form elements are missing');
        }

        // Get values
        const loanIssueDate = new Date(loanIssueDateEl.value);
        const loanExpiryDate = new Date(loanExpiryDateEl.value);
        const loanClearedDate = new Date(loanClearedDateEl.value);
        const premiumPaid = parseFloat(premiumPaidEl.value) || 0;
        const bankClaim = parseFloat(bankClaimEl.value) || 0;

        // Validate dates
        if (isNaN(loanIssueDate.getTime())) throw new Error('Please enter a valid Loan Issue Date');
        if (isNaN(loanExpiryDate.getTime())) throw new Error('Please enter a valid Loan Expiry Date');
        if (isNaN(loanClearedDate.getTime())) throw new Error('Please enter a valid Loan Cleared Date');

        // Calculate values
        const loanPeriod = Math.floor((loanExpiryDate - loanIssueDate) / (1000 * 60 * 60 * 24));
        const daysOnCover = Math.floor((loanClearedDate - loanIssueDate) / (1000 * 60 * 60 * 24)) + 1;
        const premiumUsed = (premiumPaid * (daysOnCover / loanPeriod)).toFixed(2);
        const premiumRefundable = (premiumPaid - premiumUsed).toFixed(2);
        const amountPayable = Math.min(bankClaim, premiumRefundable).toFixed(2);
        const commissionPaid = (0.18 * premiumPaid).toFixed(2);  // Changed to 18% as per your table
        const commissionRecovery = (0.18 * amountPayable).toFixed(2);
        const totalRecovery = (premiumRefundable - commissionRecovery).toFixed(2);
        const netPayable = (totalRecovery - commissionPaid).toFixed(2);

        // Display results
        document.getElementById('loanPeriod').textContent = loanPeriod;
        document.getElementById('daysOnCover').textContent = daysOnCover;
        document.getElementById('premiumUsed').textContent = premiumUsed;
        document.getElementById('premiumRefundable').textContent = premiumRefundable;
        document.getElementById('amountPayable').textContent = amountPayable;
        document.getElementById('commissionPaid').textContent = commissionPaid;
        document.getElementById('commissionRecovery').textContent = commissionRecovery;
        document.getElementById('totalRecovery').textContent = totalRecovery;
        document.getElementById('netPayable').textContent = netPayable;

    } catch (error) {
        console.error('Error:', error.message);
        alert(error.message);
    }
    
}