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
// signup button behaviour: shows signup modal when anonymous, acts as logout when authed
if (signupBtn && modal) {
    signupBtn.addEventListener('click', (e) => {
        const cur = getCurrentUser();
        if (cur) {
            // logout
            clearCurrentUser();
            populateAuthButtons();
            populateHeaderAccount();
            populateHeaderBalance();
            showMessage('Logged out');
        } else {
            // show signup modal
            modal.style.display = 'flex';
            if (signupForm) { signupForm.style.display = 'block'; }
            if (loginForm) { loginForm.style.display = 'none'; }
            if (modalTitle) { modalTitle.textContent = 'Create Account'; }
            clearMessage();
        }
    });
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
        if (cur) {
            // prefer nickname, fall back to first name, otherwise show account number
            const nick = cur.nickname || (cur.name ? cur.name.split(' ')[0] : '');
            if (nick) {
                hdr.textContent = nick;
            } else if (cur.accountNumber) {
                hdr.textContent = 'Acct: ' + cur.accountNumber;
            } else {
                hdr.textContent = '';
            }
        } else {
            hdr.textContent = '';
        }
    } catch (e) {}
}

// populate header balance display (format currency)
function populateHeaderBalance() {
    try {
        const balEl = document.getElementById('headerBalance');
        const cur = getCurrentUser();
        if (!balEl) return;
        // show masked balance if user enabled privacy
        const hidden = localStorage.getItem('sb_hide_balance') === '1';
        if (cur && typeof cur.balance !== 'undefined') {
            const n = Number(cur.balance || 0);
            if (hidden) {
                balEl.textContent = '₦••••••';
            } else {
                try {
                    balEl.textContent = n.toLocaleString('en-NG', { style: 'currency', currency: 'NGN' });
                } catch (e) {
                    balEl.textContent = '₦' + n.toFixed(2);
                }
            }
        } else {
            balEl.textContent = '';
        }
        // (no explicit toggle button label — header balance itself is clickable)
    } catch (e) {}
}

// balance privacy helpers
function toggleBalanceHidden() {
    const hidden = localStorage.getItem('sb_hide_balance') === '1';
    localStorage.setItem('sb_hide_balance', hidden ? '0' : '1');
    populateHeaderBalance();
}

// wire header balance click to toggle privacy
try {
    const balEl = document.getElementById('headerBalance');
    if (balEl) { balEl.style.cursor = 'pointer'; balEl.addEventListener('click', toggleBalanceHidden); }
} catch (e) {}

// also update login button text with first name when user is authenticated
function populateLoginName() {
    try {
        const cur = getCurrentUser();
        const navBtn = document.getElementById('loginBtn');
        if (!navBtn) return;
        if (cur && cur.name) {
            // use first word of the stored "name" as first name
            navBtn.textContent = cur.nickname || cur.name.split(' ')[0];
        } else {
            navBtn.textContent = 'Login';
        }
    } catch (e) {}
}

// update signup button and login button based on auth state
function populateAuthButtons() {
    try {
        populateLoginName();
        const sbtn = document.getElementById('signupBtn');
        if (!sbtn) return;
        const cur = getCurrentUser();
        if (cur) {
            sbtn.textContent = 'Logout';
            // (click behavior handled earlier to perform logout)
        } else {
            sbtn.textContent = 'Signup';
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
    const nickname = (document.getElementById('signupNickname') ? document.getElementById('signupNickname').value.trim() : '');
        const user = document.getElementById('signupUser').value.trim();
        const email = (document.getElementById('signupEmail') ? document.getElementById('signupEmail').value.trim() : '');
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
        if (email && users.find(u => u.email === email)) {
            showMessage('That email is already in use', true);
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
        // store pin, accountNumber and starting balance with user (note: plain-text here for demo only)
    const newUser = { name, nickname: nickname || '', user, email: email || '', pass, pin, accountNumber, balance: 0 };
        users.push(newUser);
        saveUsers(users);
        // auto-login the newly created user and update UI
        setCurrentUser(newUser);
        showMessage('Account created and logged in');
        setTimeout(() => {
            signupForm.reset();
            modal.style.display = 'none';
            clearMessage();
            populateAuthButtons();
            populateHeaderAccount();
            populateHeaderBalance();
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
            if (navBtn) navBtn.textContent = found.nickname || (found.name ? found.name.split(' ')[0] : 'Login');
            populateAuthButtons();
            populateHeaderAccount();
            populateHeaderBalance();
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
addTileNavigation('beneficiariesFeature', 'beneficiaries.html');
addTileNavigation('analyticsFeature', 'analytics.html');
addTileNavigation('settingsFeature', 'settings.html');

// populate header and auth buttons on load
populateHeaderAccount();
populateAuthButtons();
populateHeaderBalance();