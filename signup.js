/* =====================
   Form Submission Handler
   ===================== */
document.addEventListener('DOMContentLoaded', function() {
  const signupForm = document.querySelector(".signup-form");

  signupForm.addEventListener("submit", (e) => {
    e.preventDefault();

    // Get form data
    const fullName = document.getElementById("full-name").value.trim();
    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const repeatPassword = document.getElementById("repeat-password").value;
    // const verifyHuman = document.getElementById("verify-human").checked; // Remove if not used
    
    // Enhanced validation
    if (!fullName || !username || !email || !password || !repeatPassword) {
      showNotification("Please fill in all required fields", "error");
      return;
    }

    // Username validation
    if (username.length < 3 || username.length > 20) {
      showNotification("Username must be between 3 and 20 characters", "error");
      return;
    }

    // Check if username already exists
    const existingUsers = JSON.parse(localStorage.getItem('hephAutoUsers') || '[]');
    const usernameExists = existingUsers.some(user => user.username && user.username.toLowerCase() === username.toLowerCase());
    
    if (usernameExists) {
      showNotification("This username is already taken", "error");
      return;
    }

    if (password !== repeatPassword) {
      showNotification("Passwords do not match!", "error");
      return;
    }

    // Strong password validation
    const strongPasswordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;
    if (!strongPasswordRegex.test(password)) {
      showNotification("Password must be at least 8 characters and contain letters, numbers, and symbols.", "error");
      return;
    }

    // Check if email already exists
    const emailExists = existingUsers.some(user => user.email.toLowerCase() === email.toLowerCase());
    
    if (emailExists) {
      showNotification("An account with this email already exists", "error");
      return;
    }

    // Show email verification overlay (do not register yet)
    const verificationCode = ('' + Math.floor(100000 + Math.random() * 900000));
    showEmailVerification(email, verificationCode);
    // Store registration data temporarily
    window._pendingRegistration = {
      fullName,
      username,
      email,
      password
    };
  });

  // Password visibility toggle functionality
  function setupPasswordToggle(inputId, toggleId) {
    const passwordInput = document.getElementById(inputId);
    const togglePassword = document.getElementById(toggleId);
    
    if (passwordInput && togglePassword) {
      togglePassword.addEventListener('click', function() {
        const isPassword = passwordInput.type === 'password';
        passwordInput.type = isPassword ? 'text' : 'password';
        
        if (isPassword) {
          togglePassword.classList.remove('fa-eye');
          togglePassword.classList.add('fa-eye-slash');
        } else {
          togglePassword.classList.remove('fa-eye-slash');
          togglePassword.classList.add('fa-eye');
        }
      });
    }
  }

  // Setup password toggles
  setupPasswordToggle('password', 'toggle-password');
  setupPasswordToggle('repeat-password', 'toggle-repeat-password');

  // Real-time password validation
  const passwordInput = document.getElementById('password');
  const repeatPasswordInput = document.getElementById('repeat-password');
  const confirmBtn = document.querySelector('.confirm-btn');
  
  if (passwordInput) {
    passwordInput.addEventListener('input', validatePasswordStrength);
    passwordInput.addEventListener('input', validateForm);
  }
  
  if (repeatPasswordInput) {
    repeatPasswordInput.addEventListener('input', validateForm);
  }
  
  // Add input listeners for all form fields
  const formInputs = ['full-name', 'username', 'email'];
  formInputs.forEach(inputId => {
    const input = document.getElementById(inputId);
    if (input) {
      input.addEventListener('input', validateForm);
      if (inputId === 'username') {
        input.addEventListener('input', checkUsernameTaken);
      }
      if (inputId === 'email') {
        input.addEventListener('input', checkEmailTaken);
      }
    }
  });

  // Real-time username taken check
  let lastUsernameError = '';
  function checkUsernameTaken() {
    const usernameInput = document.getElementById('username');
    const usernameError = document.getElementById('username-error');
    const username = usernameInput.value.trim();
    const existingUsers = JSON.parse(localStorage.getItem('hephAutoUsers') || '[]');
    const usernameExists = existingUsers.some(user => user.username && user.username.toLowerCase() === username.toLowerCase());
    if (username && usernameExists) {
      usernameError.textContent = 'This username is already taken';
      usernameError.style.display = 'block';
      usernameInput.classList.add('input-error-active');
      if (lastUsernameError !== username) {
        showNotification('This username is already taken', 'error');
        lastUsernameError = username;
      }
    } else {
      usernameError.textContent = '';
      usernameError.style.display = 'none';
      usernameInput.classList.remove('input-error-active');
      lastUsernameError = '';
    }
  }
  // Initial username check
  checkUsernameTaken();
  
  // Real-time email taken check
  let lastEmailError = '';
  function checkEmailTaken() {
    const emailInput = document.getElementById('email');
    const emailError = document.getElementById('email-error');
    const email = emailInput.value.trim().toLowerCase();
    const existingUsers = JSON.parse(localStorage.getItem('hephAutoUsers') || '[]');
    const emailExists = existingUsers.some(user => user.email && user.email.toLowerCase() === email);
    if (email && emailExists) {
      emailError.textContent = 'An account with this email already exists';
      emailError.style.display = 'block';
      emailInput.classList.add('input-error-active');
      if (lastEmailError !== email) {
        showNotification('An account with this email already exists', 'error');
        lastEmailError = email;
      }
    } else {
      emailError.textContent = '';
      emailError.style.display = 'none';
      emailInput.classList.remove('input-error-active');
      lastEmailError = '';
    }
  }
  // Initial email check
  checkEmailTaken();

  // Initial form validation
  validateForm();
});

// Generate unique user ID
function generateUserId() {
  return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Real-time password strength validation
function validatePasswordStrength() {
  const password = document.getElementById('password').value;
  
  // Get requirement icons
  const lengthIcon = document.getElementById('length-icon');
  const letterIcon = document.getElementById('letter-icon');
  const numberIcon = document.getElementById('number-icon');
  const symbolIcon = document.getElementById('symbol-icon');
  
  // Check each requirement
  const hasLength = password.length >= 8;
  const hasLetter = /[A-Za-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSymbol = /[^A-Za-z\d]/.test(password);
  
  // Update icons with appropriate colors and symbols
  updateRequirementIcon(lengthIcon, hasLength);
  updateRequirementIcon(letterIcon, hasLetter);
  updateRequirementIcon(numberIcon, hasNumber);
  updateRequirementIcon(symbolIcon, hasSymbol);
}

function updateRequirementIcon(iconElement, isValid) {
  if (isValid) {
    iconElement.textContent = '✓';
    iconElement.className = 'requirement-icon valid';
  } else {
    iconElement.textContent = '○';
    iconElement.className = 'requirement-icon pending';
  }
}

// Comprehensive form validation
function validateForm() {
  const fullName = document.getElementById("full-name").value.trim();
  const username = document.getElementById("username").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const repeatPassword = document.getElementById("repeat-password").value;
  const confirmBtn = document.querySelector('.confirm-btn');
  
  // Check if all fields are filled
  const allFieldsFilled = fullName && username && email && password && repeatPassword;
  
  // Check username length
  const usernameValid = username.length >= 3 && username.length <= 20;
  
  // Check email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const emailValid = emailRegex.test(email);
  
  // Check password strength
  const strongPasswordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;
  const passwordValid = strongPasswordRegex.test(password);
  
  // Check if passwords match
  const passwordsMatch = password === repeatPassword && password.length > 0;
  
  // All validations must pass
  const formValid = allFieldsFilled && usernameValid && emailValid && passwordValid && passwordsMatch;
  
  // Update button state
  if (confirmBtn) {
    confirmBtn.disabled = !formValid;
    if (formValid) {
      confirmBtn.style.opacity = '1';
      confirmBtn.style.cursor = 'pointer';
      confirmBtn.style.background = '#1a2233';
    } else {
      confirmBtn.style.opacity = '0.6';
      confirmBtn.style.cursor = 'not-allowed';
      confirmBtn.style.background = '#9ca3af';
    }
  }
  
  // Update password match indicator
  updatePasswordMatchIndicator(passwordsMatch, repeatPassword.length > 0);
}

// Update password match indicator
function updatePasswordMatchIndicator(match, hasValue) {
  const repeatPasswordInput = document.getElementById('repeat-password');
  if (repeatPasswordInput) {
    if (!hasValue) {
      repeatPasswordInput.style.borderColor = '#d1d5db';
    } else if (match) {
      repeatPasswordInput.style.borderColor = '#10b981';
      repeatPasswordInput.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.2)';
    } else {
      repeatPasswordInput.style.borderColor = '#ef4444';
      repeatPasswordInput.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.2)';
    }
  }
}

// Show notification function
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  
  // Enhanced success notification with better styling
  if (type === 'success') {
    notification.innerHTML = `
      <div class="notification-content">
        <div class="notification-icon">
          <i class="fas fa-check-circle"></i>
        </div>
        <div class="notification-text">
          <h4>Success!</h4>
          <p>${message}</p>
        </div>
        <button class="notification-close">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="notification-progress"></div>
    `;
    
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: #fff;
      padding: 0;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(16, 185, 129, 0.3);
      z-index: 10000;
      transform: translateX(100%);
      transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
      max-width: 400px;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      overflow: hidden;
      border: 1px solid rgba(255, 255, 255, 0.1);
    `;
    
    notification.querySelector('.notification-content').style.cssText = `
      display: flex;
      align-items: center;
      gap: 15px;
      padding: 20px;
      position: relative;
    `;
    
    notification.querySelector('.notification-icon').style.cssText = `
      display: flex;
      align-items: center;
      justify-content: center;
      width: 48px;
      height: 48px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      flex-shrink: 0;
    `;
    
    notification.querySelector('.notification-icon i').style.cssText = `
      font-size: 24px;
      color: #fff;
    `;
    
    notification.querySelector('.notification-text').style.cssText = `
      flex: 1;
    `;
    
    notification.querySelector('.notification-text h4').style.cssText = `
      margin: 0 0 4px 0;
      font-size: 18px;
      font-weight: 600;
      color: #fff;
    `;
    
    notification.querySelector('.notification-text p').style.cssText = `
      margin: 0;
      font-size: 14px;
      color: rgba(255, 255, 255, 0.9);
      line-height: 1.4;
    `;
    
    notification.querySelector('.notification-close').style.cssText = `
      background: rgba(255, 255, 255, 0.1);
      border: none;
      color: #fff;
      cursor: pointer;
      padding: 8px;
      border-radius: 50%;
      font-size: 14px;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
    `;
    
    notification.querySelector('.notification-progress').style.cssText = `
      height: 3px;
      background: rgba(255, 255, 255, 0.3);
      width: 100%;
      position: relative;
    `;
    
    // Add hover effects
    notification.querySelector('.notification-close').addEventListener('mouseenter', function() {
      this.style.background = 'rgba(255, 255, 255, 0.2)';
      this.style.transform = 'scale(1.1)';
    });
    
    notification.querySelector('.notification-close').addEventListener('mouseleave', function() {
      this.style.background = 'rgba(255, 255, 255, 0.1)';
      this.style.transform = 'scale(1)';
    });
    
  } else if (type === 'error') {
    notification.innerHTML = `
      <div class="notification-content">
        <i class="fas fa-exclamation-circle"></i>
        <span class="notification-error-text">${message}</span>
        <button class="notification-close">
          <i class="fas fa-times"></i>
        </button>
      </div>
    `;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #fff0f0;
      color: #ef4444;
      padding: 15px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(239, 68, 68, 0.15);
      z-index: 10000;
      transform: translateX(100%);
      transition: transform 0.3s ease;
      max-width: 350px;
      font-family: 'Segoe UI', sans-serif;
      font-size: 1rem;
      font-weight: 500;
      letter-spacing: 0.01em;
      border: 1.5px solid #ef4444;
    `;
    notification.querySelector('.notification-content').style.cssText = `
      display: flex;
      align-items: center;
      gap: 10px;
    `;
    notification.querySelector('.notification-error-text').style.cssText = `
      color: #ef4444;
      font-weight: 600;
      font-size: 1rem;
    `;
    notification.querySelector('.notification-close').style.cssText = `
      background: none;
      border: none;
      color: #ef4444;
      cursor: pointer;
      margin-left: auto;
      padding: 0;
      font-size: 14px;
    `;
  }
  
  document.body.appendChild(notification);
  
  // Animate in with bounce effect for success
  if (type === 'success') {
    setTimeout(() => {
      notification.style.transform = 'translateX(0) scale(1)';
      notification.style.opacity = '1';
    }, 100);
    
    // Add progress bar animation
    const progressBar = notification.querySelector('.notification-progress');
    if (progressBar) {
      setTimeout(() => {
        progressBar.style.background = 'rgba(255, 255, 255, 0.8)';
        progressBar.style.transition = 'width 4.5s linear';
        progressBar.style.width = '0%';
      }, 100);
    }
  } else {
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 100);
  }
  
  // Close functionality
  const closeBtn = notification.querySelector('.notification-close');
  closeBtn.addEventListener('click', () => {
    if (type === 'success') {
      notification.style.transform = 'translateX(100%) scale(0.8)';
      notification.style.opacity = '0';
    } else {
      notification.style.transform = 'translateX(100%)';
    }
    setTimeout(() => notification.remove(), 300);
  });
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      if (type === 'success') {
        notification.style.transform = 'translateX(100%) scale(0.8)';
        notification.style.opacity = '0';
      } else {
        notification.style.transform = 'translateX(100%)';
      }
      setTimeout(() => notification.remove(), 300);
    }
  }, 5000);
}

// Floating Chat Functionality
// (Copied from Heph.js for floating chat widget)
document.addEventListener("DOMContentLoaded", () => {
  const chatIcon = document.getElementById('chatIcon');
  const chatInterface = document.getElementById('chatInterface');
  const closeChat = document.getElementById('closeChat');
  const messageInput = document.getElementById('messageInput');
  const sendMessage = document.getElementById('sendMessage');
  const chatMessages = document.getElementById('chatMessages');
  const chatBadge = document.querySelector('.chat-badge');

  // Toggle chat interface
  if (chatIcon && chatInterface) {
    chatIcon.addEventListener('click', () => {
      chatInterface.classList.toggle('active');
      // Hide badge when chat is open
      if (chatBadge) {
        chatBadge.style.display = chatInterface.classList.contains('active') ? 'none' : 'flex';
      }
    });
  }

  // Close chat
  if (closeChat && chatInterface) {
    closeChat.addEventListener('click', () => {
      chatInterface.classList.remove('active');
      if (chatBadge) {
        chatBadge.style.display = 'flex';
      }
    });
  }

  // Send message functionality
  if (sendMessage && messageInput && chatMessages) {
    sendMessage.addEventListener('click', sendChatMessage);
    messageInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        sendChatMessage();
      }
    });
  }

  function sendChatMessage() {
    const message = messageInput.value.trim();
    if (message) {
      // Add buyer message
      const buyerMessage = `
        <div class="message buyer-message">
          <div class="message-content">
            <p>${message}</p>
            <span class="message-time">${getCurrentTime()}</span>
          </div>
        </div>
      `;
      chatMessages.insertAdjacentHTML('beforeend', buyerMessage);
      
      // Clear input
      messageInput.value = '';
      
      // Scroll to bottom
      chatMessages.scrollTop = chatMessages.scrollHeight;
      
      // Simulate seller response after 1 second
      setTimeout(() => {
        const sellerResponse = `
          <div class="message seller-message">
            <div class="message-content">
              <p>Thank you for your message! I'll get back to you shortly with more details about the vehicle.</p>
              <span class="message-time">${getCurrentTime()}</span>
            </div>
          </div>
        `;
        chatMessages.insertAdjacentHTML('beforeend', sellerResponse);
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }, 1000);
    }
  }

  function getCurrentTime() {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  }
});

// Email verification overlay logic
function showEmailVerification(email, code) {
  document.getElementById('verifyEmailDisplay').textContent = email;
  document.getElementById('emailVerifyOverlay').style.display = 'flex';
  // Autofocus first input
  document.querySelector('#verifyCodeInputs input').focus();
  // Store code for checking
  window._verificationCode = code;
  window._verificationEmail = email;
}

// Move focus to next input on input
Array.from(document.querySelectorAll('#verifyCodeInputs input')).forEach((input, idx, arr) => {
  input.addEventListener('input', function() {
    if (this.value.length === 1 && idx < arr.length - 1) {
      arr[idx + 1].focus();
    }
  });
  input.addEventListener('keydown', function(e) {
    if (e.key === 'Backspace' && !this.value && idx > 0) {
      arr[idx - 1].focus();
    }
  });
});

// Resend code logic
const resendBtn = document.getElementById('resendCodeBtn');
if (resendBtn) {
  resendBtn.onclick = function() {
    // Generate and send a new code (simulate)
    const newCode = ('' + Math.floor(100000 + Math.random() * 900000));
    window._verificationCode = newCode;
    alert('A new code has been sent to ' + window._verificationEmail + ' (Demo: ' + newCode + ')');
  };
}

// On code input complete, check code
Array.from(document.querySelectorAll('#verifyCodeInputs input')).forEach((input, idx, arr) => {
  input.addEventListener('input', function() {
    // If last input and all filled, check code
    if (idx === arr.length - 1 && arr.every(i => i.value.length === 1)) {
      const entered = arr.map(i => i.value).join('');
      if (entered === window._verificationCode) {
        // Complete registration and redirect
        if (window._pendingRegistration) {
          const { fullName, username, email, password } = window._pendingRegistration;
          const existingUsers = JSON.parse(localStorage.getItem('hephAutoUsers') || '[]');
          const newUser = {
            id: generateUserId(),
            name: fullName,
            username: username,
            email: email,
            password: password, // In a real app, this should be hashed
            userType: 'user',
            phone: '',
            location: '',
            registrationDate: new Date().toISOString(),
            lastLogin: null,
            isActive: true
          };
          existingUsers.push(newUser);
          localStorage.setItem('hephAutoUsers', JSON.stringify(existingUsers));
          document.getElementById('emailVerifyOverlay').style.display = 'none';
          // Save login credentials for pre-filling
          const loginCredentials = {
            email: email,
            username: username,
            timestamp: new Date().toISOString()
          };
          localStorage.setItem('hephAutoLoginCredentials', JSON.stringify(loginCredentials));
          
          showNotification('Your account has been successfully created! Welcome to HephAuto. Redirecting to login...', 'success');
          setTimeout(() => {
            window.location.href = 'login.html';
          }, 2000);
          window._pendingRegistration = null;
        }
      } else {
        alert('Incorrect code. Please try again.');
        arr.forEach(i => i.value = '');
        arr[0].focus();
      }
    }
  });
});

// Integrate with signup flow: after successful signup, show overlay
// Replace the setTimeout redirect in your signup handler with:
// const verificationCode = ('' + Math.floor(100000 + Math.random() * 900000));
// showEmailVerification(email, verificationCode);
// (In a real app, send the code to the user's email here!)