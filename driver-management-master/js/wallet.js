document.addEventListener('DOMContentLoaded', () => {
  const walletHeader = document.querySelector('.wallet-header');
  const mobileNav = document.querySelector('.mobile-nav-buttons');
  const sections = document.querySelectorAll('[data-mobile-section]');
  const backBtns = document.querySelectorAll('.back-btn');
  let isDetail = false, scrollY = 0;

  const toggle = (el, d) => el && (el.style.display = d);

  const showDetail = (section) => {
    if (window.innerWidth > 768) return;
    isDetail = true;
    toggle(walletHeader, 'none'); toggle(mobileNav, 'none');
    sections.forEach(s => s.style.display = 'none');
    const t = document.querySelector(`[data-mobile-section="${section}"]`);
    if (t) { toggle(t, 'block'); t.classList.add('mobile-detail-view'); toggle(t.querySelector('.back-btn'), 'flex'); }
  };

  const showMain = () => {
    if (window.innerWidth > 768) return;
    isDetail = false;
    toggle(walletHeader, 'block'); toggle(mobileNav, 'flex');
    backBtns.forEach(b => toggle(b, 'none'));
    sections.forEach(s => { s.classList.remove('mobile-detail-view'); s.style.display = 'none'; });
  };

  document.querySelectorAll('.mobile-nav-btn').forEach(btn => {
    if (!btn.id.includes('cashout') && !btn.id.includes('topup')) {
      btn.addEventListener('click', () => showDetail(btn.dataset.section));
    }
  });
  backBtns.forEach(b => b.addEventListener('click', showMain));

  const resize = () => {
    if (window.innerWidth <= 768) { if (!isDetail) showMain(); }
    else { toggle(walletHeader,'block'); toggle(mobileNav,'none'); sections.forEach(s=>{s.style.display='block';s.classList.remove('mobile-detail-view');}); backBtns.forEach(b=>toggle(b,'none')); isDetail=false; }
  };
  window.addEventListener('resize', resize); resize();

  const open = (id) => {
    scrollY = window.pageYOffset;
    const m = document.getElementById(id); if (!m) return;
    m.classList.add('show'); document.body.classList.add('modal-open');
    document.body.style.top = `-${scrollY}px`;
  };
  const close = (id) => {
    const m = document.getElementById(id); if (!m) return;
    m.classList.remove('show'); document.body.classList.remove('modal-open');
    document.body.style.top = ''; window.scrollTo(0, scrollY);
  };

  document.addEventListener('click', e => {
    const openBtn = e.target.closest('[data-open]');
    const closeBtn = e.target.closest('[data-close]');
    if (openBtn) open(openBtn.dataset.open);
    if (closeBtn) close(closeBtn.dataset.close);
    const m = e.target.classList.contains('modal') && e.target;
    if (m) close(m.id);
  });
  // Quick amount buttons
  const topUp = document.getElementById('topup-modal');
  if (topUp) {
    const input = topUp.querySelector('.amount-field');
    topUp.addEventListener('click', e => {
      if (e.target.classList.contains('quick-amount-btn')) {
        topUp.querySelectorAll('.quick-amount-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        input.value = e.target.textContent.replace('₱','');
      }
    });
  }
});

let currentBalance = 0;

async function loadWalletData() {
    try {
        const response = await fetch('php/get_wallet_data.php');
        const data = await response.json();
        
        // Update balance
        currentBalance = parseFloat(data.wallet.balance);
        updateBalanceDisplay();
        
        // Update transactions
        updateTransactionsList(data.transactions);
        
        // Update payment methods
        updatePaymentMethods(data.payment_methods);
        
        // Update account details
        updateAccountDetails(data.wallet);
    } catch (error) {
        console.error('Error loading wallet data:', error);
    }
}

function updateBalanceDisplay() {
    document.querySelector('.balance-amount').textContent = `₱${currentBalance.toFixed(2)}`;
}

function updateTransactionsList(transactions) {
    const transactionsList = document.querySelector('.transactions-list');
    transactionsList.innerHTML = transactions.map(txn => `
        <div class="transaction-item">
            <div class="transaction-icon ${getTransactionIconClass(txn.type)}">
                <span class="iconify" data-icon="mdi:${getTransactionIcon(txn.type)}"></span>
            </div>
            <div class="transaction-details">
                <p class="transaction-type">${formatTransactionType(txn.type, txn.payment_method)}</p>
                <p class="transaction-date">${txn.formatted_date}</p>
            </div>
            <div class="transaction-amount ${txn.type === 'cashout' ? 'danger' : 'success'}">
                ${txn.type === 'cashout' ? '- ' : '+ '}₱${parseFloat(txn.amount).toFixed(2)}
            </div>
        </div>
    `).join('');
}

function updatePaymentMethods(methods) {
    const methodsList = document.querySelector('.payment-methods-list');
    const methodsHtml = methods.map(method => `
        <div class="payment-method-item">
            <div class="payment-icon ${method.type.toLowerCase()}">
                <span class="iconify" data-icon="arcticons:${method.type.toLowerCase()}"></span>
            </div>
            <div class="payment-details">
                <p class="payment-name">${method.type}</p>
                <p class="payment-number">${method.phone_number.replace(/(\d{2}).*(\d{2})/, '$1*****$2')}</p>
            </div>
            <button onclick="removePaymentMethod(${method.id})">Remove</button>
        </div>
    `).join('');
    
    methodsList.innerHTML = methodsHtml + `
        <div class="add-payment-method" onclick="openAddPaymentModal()">
            <span class="iconify" data-icon="mdi:plus"></span>
            <span>Add Payment Method</span>
        </div>
    `;
}

async function processTopUp(amount, paymentMethod) {
    try {
        const response = await fetch('php/process_transaction.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'topup',
                amount: amount,
                payment_method: paymentMethod
            })
        });
        
        const result = await response.json();
        if (result.error) throw new Error(result.error);
        
        currentBalance = parseFloat(result.new_balance);
        updateBalanceDisplay();
        await loadWalletData();
        closeModal('topup-modal');
    } catch (error) {
        alert(error.message || 'Failed to process top-up');
    }
}

async function processCashout(amount, paymentMethod) {
    try {
        if (amount > currentBalance) {
            throw new Error('Insufficient balance');
        }

        const response = await fetch('php/process_transaction.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'cashout',
                amount: amount,
                payment_method: paymentMethod
            })
        });
        
        const result = await response.json();
        if (result.error) throw new Error(result.error);
        
        currentBalance = parseFloat(result.new_balance);
        updateBalanceDisplay();
        await loadWalletData();
        closeModal('cashout-modal');
    } catch (error) {
        alert(error.message || 'Failed to process cash-out');
    }
}

async function removePaymentMethod(id) {
    if (!confirm('Are you sure you want to remove this payment method?')) return;
    
    try {
        const response = await fetch('php/remove_payment_method.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: id })
        });
        
        const result = await response.json();
        if (result.error) throw new Error(result.error);
        
        await loadWalletData();
    } catch (error) {
        alert(error.message || 'Failed to remove payment method');
    }
}

// Helper functions
function getTransactionIconClass(type) {
    return {
        'topup': 'warning',
        'cashout': 'danger',
        'trip_payment': 'success'
    }[type] || 'default';
}

function getTransactionIcon(type) {
    return {
        'topup': 'arrow-up',
        'cashout': 'arrow-down',
        'trip_payment': 'car'
    }[type] || 'help-circle';
}

function formatTransactionType(type, method = '') {
    const types = {
        'topup': 'Top-up',
        'cashout': 'Cash-out',
        'trip_payment': 'Trip Payment'
    };
    return `${types[type] || type}${method ? ` via ${method}` : ''}`;
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.display = 'none';
    modal.querySelector('.amount-field').value = '';
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    loadWalletData();

    // Quick amount buttons
    document.querySelectorAll('.quick-amount-btn').forEach(btn => {
        btn.onclick = () => {
            const amount = parseFloat(btn.textContent.replace('₱', ''));
            btn.closest('.modal').querySelector('.amount-field').value = amount;
        };
    });

    // Top-up button
    document.querySelector('#topup-modal .modal-btn:not(.secondary)').onclick = () => {
        const modal = document.getElementById('topup-modal');
        const amount = parseFloat(modal.querySelector('.amount-field').value);
        const method = modal.querySelector('input[name="topup-payment"]:checked').value;
        
        if (isNaN(amount) || amount < 100 || amount > 2000) {
            alert('Please enter an amount between ₱100 and ₱2,000');
            return;
        }
        
        processTopUp(amount, method);
    };

    // Cash-out button
    document.querySelector('#cashout-modal .modal-btn:not(.secondary)').onclick = () => {
        const modal = document.getElementById('cashout-modal');
        const amount = parseFloat(modal.querySelector('.amount-field').value);
        const method = modal.querySelector('input[name="cashout-payment"]:checked').value;
        
        if (isNaN(amount) || amount < 50) {
            alert('Please enter an amount of at least ₱50');
            return;
        }
        
        processCashout(amount, method);
    };

    // Modal open buttons
    document.querySelectorAll('[data-open]').forEach(btn => {
        btn.onclick = () => {
            const modalId = btn.dataset.open;
            document.getElementById(modalId).style.display = 'flex';
        };
    });

    // Modal close buttons
    document.querySelectorAll('[data-close]').forEach(btn => {
        btn.onclick = () => closeModal(btn.dataset.close);
    });

    // Mobile navigation
    document.querySelectorAll('.mobile-nav-btn').forEach(btn => {
        btn.onclick = () => {
            if (btn.dataset.open) {
                document.getElementById(btn.dataset.open).style.display = 'flex';
            } else if (btn.dataset.section) {
                document.querySelectorAll('[data-mobile-section]').forEach(section => {
                    section.style.display = section.dataset.mobileSection === btn.dataset.section ? 'block' : 'none';
                });
                document.querySelectorAll('.back-btn').forEach(backBtn => {
                    backBtn.style.display = 'block';
                });
            }
        };
    });

    // Back buttons
    document.querySelectorAll('.back-btn').forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll('[data-mobile-section]').forEach(section => {
                section.style.display = '';
            });
            btn.style.display = 'none';
        };
    });
});
