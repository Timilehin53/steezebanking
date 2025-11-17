// External JS for send-money.html
(function(){
    // auth guard: redirect to home and show login modal if not authenticated
    try {
        const u = JSON.parse(localStorage.getItem('sb_current_user') || 'null');
        if (!u) {
            localStorage.setItem('sb_show_login', '1');
            window.location.href = 'simple_bank.html#features';
        }
    } catch(e){}

    document.addEventListener('DOMContentLoaded', () => {
        const form = document.getElementById('sendMoneyForm');
        const proceedBtn = document.getElementById('proceedBtn');
        const confirmModal = document.getElementById('confirmModal');
        const confirmBody = document.getElementById('confirmBody');
        const confirmSend = document.getElementById('confirmSend');
        const cancelSend = document.getElementById('cancelSend');

        function showModal(contentHtml) {
            confirmBody.innerHTML = contentHtml;
            confirmModal.style.display = 'flex';
            confirmModal.setAttribute('aria-hidden', 'false');
        }

        function hideModal() {
            confirmModal.style.display = 'none';
            confirmModal.setAttribute('aria-hidden', 'true');
        }

        proceedBtn.addEventListener('click', () => {
            const recipient = document.getElementById('recipient').value.trim();
            const amount = parseFloat(document.getElementById('amount').value);
            const bankSelect = document.getElementById('recipientBank');
            const bankValue = bankSelect ? bankSelect.value : '';
            const bankText = bankSelect ? bankSelect.options[bankSelect.selectedIndex].text : '';
            
            // Validation
            const errors = [];
            if (!recipient) errors.push('Please enter recipient account number');
            if (!amount || amount <= 0) errors.push('Please enter a valid amount');
            if (!bankValue) errors.push('Please select the recipient bank');
            
            if (errors.length) {
                showModal('<p class="error-text">' + errors.join('<br>') + '</p>');
                return;
            }

            // Extra note for 'Other' banks
            const otherNote = bankValue === 'other' ? '<p style="margin-top:0.5rem;font-size:0.9em;color:#6b7280;">Note: For international/other banks please ensure you provide the correct IBAN or SWIFT code to avoid delays.</p>' : '';

            // Show confirmation
            const html = `
                <p>Recipient: <strong>${recipient}</strong></p>
                <p>Bank: <strong>${bankText}</strong></p>
                <p>Amount: <strong>$${amount.toFixed(2)}</strong></p>
                ${otherNote}
                <p style="margin-top:0.5rem;font-size:0.9em;color:#6b7280;">Transfer fee: $0.00</p>
            `;
            showModal(html);
        });

        cancelSend.addEventListener('click', hideModal);

        confirmSend.addEventListener('click', () => {
            // Simulate processing
            confirmSend.disabled = true;
            confirmSend.textContent = 'Processing...';
            
            setTimeout(() => {
                hideModal();
                // Show success message
                const success = document.createElement('div');
                success.className = 'success-message';
                success.innerHTML = '<h3 style="color:#10b981">Transfer Successful</h3><p style="color:#6b7280;margin-top:0.5rem;">Your money is on its way!</p>';
                form.parentNode.insertBefore(success, form.nextSibling);
                
                // Reset form and button
                form.reset();
                confirmSend.disabled = false;
                confirmSend.textContent = 'Send Now';
            }, 1500);
        });

        // Close modal when clicking outside
        confirmModal.addEventListener('click', (e) => {
            if (e.target === confirmModal) hideModal();
        });
    });
})();
