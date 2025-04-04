// DOM Elements
const loginForm = document.getElementById('loginForm');
const errorMessage = document.getElementById('errorMessage');
const togglePasswordBtn = document.getElementById('togglePassword');
const passwordInput = document.getElementById('password');
const usernameInput = document.getElementById('username');
const rememberCheckbox = document.getElementById('remember');

// Utility Functions
const showElement = (element) => {
    element.classList.remove('hidden');
};

const hideElement = (element) => {
    element.classList.add('hidden');
};

const showError = (message) => {
    errorMessage.textContent = message;
    showElement(errorMessage);
    setTimeout(() => {
        hideElement(errorMessage);
    }, 5000);
};

// Load saved username if remember me was checked
const loadSavedCredentials = () => {
    const savedUsername = localStorage.getItem('username');
    const rememberMe = localStorage.getItem('rememberMe') === 'true';
    
    if (savedUsername && rememberMe) {
        usernameInput.value = savedUsername;
        rememberCheckbox.checked = true;
    }
};

// Save credentials if remember me is checked
const saveCredentials = () => {
    if (rememberCheckbox.checked) {
        localStorage.setItem('username', usernameInput.value);
        localStorage.setItem('rememberMe', 'true');
    } else {
        localStorage.removeItem('username');
        localStorage.removeItem('rememberMe');
    }
};

// Toggle password visibility
togglePasswordBtn.addEventListener('click', () => {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    
    // Toggle eye icon
    togglePasswordBtn.querySelector('i').classList.toggle('fa-eye');
    togglePasswordBtn.querySelector('i').classList.toggle('fa-eye-slash');
});

// Mock user database (in a real app, this would be on the server)
const users = [
    { username: 'teacher', password: 'password123' },
    { username: 'admin', password: 'admin123' }
];

// Authenticate user
const authenticateUser = (username, password) => {
    return users.find(user => 
        user.username === username && user.password === password
    );
};

// Handle form submission
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const username = usernameInput.value.trim();
    const password = passwordInput.value;
    
    if (!username || !password) {
        showError('Please enter both username and password');
        return;
    }
    
    const user = authenticateUser(username, password);
    
    if (user) {
        // Save credentials if remember me is checked
        saveCredentials();
        
        // Set login session
        sessionStorage.setItem('isLoggedIn', 'true');
        sessionStorage.setItem('currentUser', username);
        
        // Redirect to main page
        window.location.href = 'index.html';
    } else {
        showError('Invalid username or password');
        passwordInput.value = ''; // Clear password field for security
    }
});

// Social login buttons (mock functionality)
document.querySelectorAll('.social-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        showError('Social login is not implemented in this demo');
    });
});

// Forgot password functionality (mock)
document.querySelector('.forgot-password').addEventListener('click', (e) => {
    e.preventDefault();
    showError('Password reset functionality is not implemented in this demo');
});

// Signup link functionality (mock)
document.querySelector('.signup-link a').addEventListener('click', (e) => {
    e.preventDefault();
    showError('Sign up functionality is not implemented in this demo');
});

// Check if user is already logged in
const checkLoginStatus = () => {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
    if (isLoggedIn) {
        window.location.href = 'index.html';
    }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    hideElement(errorMessage);
    loadSavedCredentials();
    checkLoginStatus();
});
