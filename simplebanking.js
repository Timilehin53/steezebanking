// Modal open/close logic
const modal = document.getElementById('modal');
const loginBtn = document.getElementById('loginBtn');
const signupBtn = document.getElementById('signupBtn');
const closeModal = document.getElementById('closeModal');

if (loginBtn && modal) {
    loginBtn.onclick = function() {
        modal.style.display = 'flex';
    };
}
if (signupBtn && modal) {
    signupBtn.onclick = function() {
        modal.style.display = 'flex';
    };
}
if (closeModal && modal) {
    closeModal.onclick = function() {
        modal.style.display = 'none';
    };
}
window.addEventListener('click', function(event) {
    if (modal && event.target === modal) {
        modal.style.display = 'none';
    }
});

// AUTH form handling
const authMessage = document.getElementById('authMessage');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const showSignup = document.getElementById('showSignup');
const showLogin = document.getElementById('showLogin');
const modalTitle = document.getElementById('modalTitle');

function showMessage(msg, isError = false) {
    if (!authMessage) return;
    authMessage.style.display = 'block';
    authMessage.style.color = isError ? '#b91c1c' : '#10b981';
    authMessage.textContent = msg;
}

function clearMessage() {
    if (!authMessage) return;
    authMessage.style.display = 'none';
    authMessage.textContent = '';
}

if (showSignup) {
    showSignup.addEventListener('click', () => {
        loginForm.style.display = 'none';
        signupForm.style.display = 'block';
        modalTitle.textContent = 'Create Account';
        clearMessage();
    });
}
if (showLogin) {
    showLogin.addEventListener('click', () => {
        signupForm.style.display = 'none';
        loginForm.style.display = 'block';
        modalTitle.textContent = 'Login';
        clearMessage();
    });
}
function getUsers() {
    try {
        return JSON.parse(localStorage.getItem('sb_users') || '[]');
    } catch (e) {
        return [];
    }
}
function saveUsers(users) {
    localStorage.setItem('sb_users', JSON.stringify(users));
}

// generate a simple unique account number (10 digits)
function generateAccountNumber() {
    const users = getUsers();
    let acct;
    let tries = 0;
    do {
        // generate 10-digit number starting with 10-99 to avoid leading zeros
        acct = String(Math.floor(1000000000 + Math.random() * 9000000000));
        tries++;
        if (tries > 50) break; // safety
    } while (users.some(u => u.accountNumber === acct));
    return acct;
}

function maskAccount(acct) {
    if (!acct) return '';
    return acct.slice(0,4) + ' ' + acct.slice(4,7) + ' ' + acct.slice(7);
}

// current user helpers
function getCurrentUser() {
    try { return JSON.parse(localStorage.getItem('sb_current_user') || 'null'); }
    catch (e) { return null; }
}
function setCurrentUser(u) { localStorage.setItem('sb_current_user', JSON.stringify(u)); }
function clearCurrentUser() { localStorage.removeItem('sb_current_user'); }
function isAuthenticated() { return !!getCurrentUser(); }

// populate header account display
function populateHeaderAccount() {
    try {
        const hdr = document.getElementById('headerAccount');
        const cur = getCurrentUser();
        if (!hdr) return;
        if (cur && cur.accountNumber) {
            hdr.textContent = 'Acct: ' + cur.accountNumber;
        } else {
            hdr.textContent = '';
        }
    } catch (e) {}
}

// if page requested redirect to login, show modal on load
if (localStorage.getItem('sb_show_login')) {
    // ensure modal exists and forms exist
    if (modal) {
        modal.style.display = 'flex';
        if (loginForm) { loginForm.style.display = 'block'; }
        if (signupForm) { signupForm.style.display = 'none'; }
        if (modalTitle) { modalTitle.textContent = 'Login'; }
        showMessage('Please login to continue', true);
    }
    localStorage.removeItem('sb_show_login');
}

if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('signupName').value.trim();
        const user = document.getElementById('signupUser').value.trim();
        const pass = document.getElementById('signupPass').value;
        const pass2 = document.getElementById('signupPass2').value;
        if (!name || !user || !pass) {
            showMessage('Please fill all fields', true);
            return;
        }
        if (pass !== pass2) {
            showMessage('Passwords do not match', true);
            return;
        }
        const pin = document.getElementById('signupPin').value.trim();
        const pin2 = document.getElementById('signupPin2').value.trim();
        // validate pin
        if (!/^[0-9]{4,6}$/.test(pin)) {
            showMessage('PIN must be 4-6 digits', true);
            return;
        }
        if (pin !== pin2) {
            showMessage('PIN entries do not match', true);
            return;
        }
        // account number handling: use provided or generate
        const acctInputEl = document.getElementById('signupAccount');
        const acctInput = acctInputEl ? acctInputEl.value.trim() : '';
        const users = getUsers();
        if (users.find(u => u.user === user)) {
            showMessage('An account with this email/phone already exists', true);
            return;
        }
        let accountNumber = '';
        if (acctInput) {
            if (!/^[0-9]{10}$/.test(acctInput)) {
                showMessage('Account number must be 10 digits', true);
                return;
            }
            if (users.find(u => u.accountNumber === acctInput)) {
                showMessage('That account number is already taken, try generating one', true);
                return;
            }
            accountNumber = acctInput;
        } else {
            accountNumber = generateAccountNumber();
        }
        // store pin and accountNumber with user (note: plain-text here for demo only)
        users.push({ name, user, pass, pin, accountNumber });
        saveUsers(users);
        showMessage('Account created successfully');
        // auto-switch to login
        setTimeout(() => {
            signupForm.reset();
            signupForm.style.display = 'none';
            loginForm.style.display = 'block';
            modalTitle.textContent = 'Login';
            clearMessage();
            showMessage('Please login with your new account');
            // show the account number briefly
            setTimeout(() => {
                showMessage('Your account no: ' + maskAccount(accountNumber));
            }, 400);
        }, 900);
    });
}

// Generate account button handler
const genBtn = document.getElementById('generateAccount');
if (genBtn) {
    genBtn.addEventListener('click', () => {
        const acct = generateAccountNumber();
        const acctInputEl = document.getElementById('signupAccount');
        if (acctInputEl) acctInputEl.value = acct;
    });
}

if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const user = document.getElementById('loginUser').value.trim();
        const pass = document.getElementById('loginPass').value;
        const users = getUsers();
        const found = users.find(u => u.user === user && u.pass === pass);
        if (!found) {
            showMessage('Invalid credentials', true);
            return;
        }
        showMessage('Login successful');
        // close modal and update UI (simple)
        setTimeout(() => {
            modal.style.display = 'none';
            clearMessage();
            // indicate logged-in state (replace login button text) and persist current user
            setCurrentUser(found);
            const navBtn = document.getElementById('loginBtn');
            if (navBtn) navBtn.textContent = found.name.split(' ')[0];
            populateHeaderAccount();
        }, 700);
    });
}

// Helper to add keyboard + click activation to feature tiles
function addTileNavigation(id, href) {
    const el = document.getElementById(id);
    if (!el) return;
    const go = () => { window.location.href = href; };
    el.addEventListener('click', go);
    el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            go();
        }
    });
}

addTileNavigation('sendMoneyFeature', 'send-money.html');
addTileNavigation('payBillsFeature', 'pay-bills.html');
addTileNavigation('airtimeDataFeature', 'airtime-data.html');
addTileNavigation('walletFeature', 'wallet.html');

// populate header on load
populateHeaderAccount();