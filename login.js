// =====================
// Login System - HephAuto
// =====================

document.addEventListener('DOMContentLoaded', function() {
  const loginForm = document.getElementById('loginForm');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const togglePassword = document.getElementById('toggle-password');
  const submitBtn = document.querySelector('.login-submit-btn');
  const btnText = document.querySelector('.btn-text');
  const btnLoading = document.querySelector('.btn-loading');

  // Initialize demo accounts if they don't exist
  initializeDemoAccounts();

  // Pre-fill login credentials if available
  // prefillLoginCredentials(); // Disabled - users must enter credentials themselves

  // Password visibility toggle
  if (togglePassword && passwordInput) {
    togglePassword.addEventListener('click', function() {
      const isPassword = passwordInput.type === 'password';
      passwordInput.type = isPassword ? 'text' : 'password';
      
      if (isPassword) {
        togglePassword.classList.remove('fa-eye');
        togglePassword.classList.add('fa-eye-slash');
        togglePassword.title = 'Hide Password';
      } else {
        togglePassword.classList.remove('fa-eye-slash');
        togglePassword.classList.add('fa-eye');
        togglePassword.title = 'Show Password';
      }
    });
  }

  // Form submission
  if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const email = emailInput.value.trim();
      const password = passwordInput.value;
      const rememberMe = document.getElementById('remember-me').checked;

      // Basic validation
      if (!email || !password) {
        showNotification('Please fill in all fields', 'error');
        return;
      }

      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        showNotification('Please enter a valid email address', 'error');
        emailInput.focus();
        return;
      }

      // Show loading state
      setLoadingState(true);

      try {
        // Validate credentials against stored users
        const user = await validateCredentials(email, password);
        
        if (user) {
          // Update user activity
          updateUserActivity(user.id);
          
          // Store session data
          const sessionData = {
            userId: user.id,
            email: user.email,
            name: user.name,
            username: user.username,
            userType: user.userType,
            loginTime: new Date().toISOString(),
            rememberMe: rememberMe
          };
          
          if (rememberMe) {
            // Store in localStorage for persistent login
            localStorage.setItem('hephAutoSession', JSON.stringify(sessionData));
          } else {
            // Store in sessionStorage for session-only login
            sessionStorage.setItem('hephAutoSession', JSON.stringify(sessionData));
          }

          // Save login data for future pre-filling
          const loginData = {
            email: user.email,
            username: user.username,
            timestamp: new Date().toISOString()
          };
          localStorage.setItem('hephAutoLastLogin', JSON.stringify(loginData));

          showNotification('Login successful! Redirecting...', 'success');
          
          // Redirect based on user type
          setTimeout(() => {
            if (user.userType === 'admin') {
              window.location.href = 'admin.html';
            } else {
              window.location.href = 'Heph.html';
            }
          }, 1500);
          
        } else {
          showNotification('Invalid email or password', 'error');
          passwordInput.value = '';
          passwordInput.focus();
        }
      } catch (error) {
        console.error('Login error:', error);
        showNotification('An error occurred during login. Please try again.', 'error');
      } finally {
        setLoadingState(false);
      }
    });
  }

  // Initialize demo accounts
  function initializeDemoAccounts() {
    const existingUsers = JSON.parse(localStorage.getItem('hephAutoUsers') || '[]');
    
    // Check if demo accounts already exist
    const hasAdmin = existingUsers.some(user => user.email === 'admin@hephauto.com');
    const hasUser = existingUsers.some(user => user.email === 'user@example.com');
    
    if (!hasAdmin) {
      const adminUser = {
        id: 'demo-admin-' + Date.now(),
        name: 'Admin User',
        username: 'admin_user',
        email: 'admin@hephauto.com',
        password: 'admin123',
        userType: 'admin',
        phone: '+234 801 234 5678',
        location: 'Ibadan, Nigeria',
        registrationDate: new Date().toISOString(),
        lastLogin: null,
        isActive: true
      };
      existingUsers.push(adminUser);
    }
    
    if (!hasUser) {
      const regularUser = {
        id: 'demo-user-' + Date.now(),
        name: 'Demo User',
        username: 'demo_user',
        email: 'user@example.com',
        password: 'user123',
        userType: 'user',
        phone: '+234 901 234 5678',
        location: 'Lagos, Nigeria',
        registrationDate: new Date().toISOString(),
        lastLogin: null,
        isActive: true
      };
      existingUsers.push(regularUser);
    }
    
    localStorage.setItem('hephAutoUsers', JSON.stringify(existingUsers));
  }

  // Validate credentials against stored users
  async function validateCredentials(identifier, password) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const users = JSON.parse(localStorage.getItem('hephAutoUsers') || '[]');
        const user = users.find(u =>
          ((u.email && u.email.toLowerCase() === identifier.toLowerCase()) ||
           (u.username && u.username.toLowerCase() === identifier.toLowerCase())) &&
          u.password === password &&
          u.isActive
        );
        resolve(user || null);
      }, 500);
    });
  }

  // Update user's last login time
  function updateUserActivity(userId) {
    const users = JSON.parse(localStorage.getItem('hephAutoUsers') || '[]');
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex !== -1) {
      users[userIndex].lastLogin = new Date().toISOString();
      localStorage.setItem('hephAutoUsers', JSON.stringify(users));
    }
  }

  // Set loading state
  function setLoadingState(isLoading) {
    if (submitBtn) {
      submitBtn.disabled = isLoading;
    }
    if (btnText) {
      btnText.style.display = isLoading ? 'none' : 'inline';
    }
    if (btnLoading) {
      btnLoading.style.display = isLoading ? 'inline' : 'none';
    }
  }

  // Pre-fill login credentials from signup or last login
  function prefillLoginCredentials() {
    // First check for signup credentials
    const savedCredentials = localStorage.getItem('hephAutoLoginCredentials');
    const lastLoginData = localStorage.getItem('hephAutoLastLogin');
    
    let credentialsToUse = null;
    let source = '';
    
    if (savedCredentials) {
      try {
        const credentials = JSON.parse(savedCredentials);
        const now = new Date();
        const savedTime = new Date(credentials.timestamp);
        
        // Check if credentials are less than 24 hours old
        const hoursDiff = (now - savedTime) / (1000 * 60 * 60);
        
        if (hoursDiff < 24 && credentials.email) {
          credentialsToUse = credentials;
          source = 'signup';
        } else {
          // Clear old credentials
          localStorage.removeItem('hephAutoLoginCredentials');
        }
      } catch (error) {
        console.error('Error parsing saved credentials:', error);
        localStorage.removeItem('hephAutoLoginCredentials');
      }
    }
    
    // If no signup credentials, check for last login data
    if (!credentialsToUse && lastLoginData) {
      try {
        const lastLogin = JSON.parse(lastLoginData);
        const now = new Date();
        const savedTime = new Date(lastLogin.timestamp);
        
        // Check if last login is less than 7 days old
        const daysDiff = (now - savedTime) / (1000 * 60 * 60 * 24);
        
        if (daysDiff < 7 && lastLogin.email) {
          credentialsToUse = lastLogin;
          source = 'lastLogin';
        } else {
          // Clear old last login data
          localStorage.removeItem('hephAutoLastLogin');
        }
      } catch (error) {
        console.error('Error parsing last login data:', error);
        localStorage.removeItem('hephAutoLastLogin');
      }
    }
    
    // Pre-fill if we have valid credentials
    if (credentialsToUse && emailInput) {
      emailInput.value = credentialsToUse.email;
      emailInput.focus();
      
      // Show appropriate notification
      if (source === 'signup') {
        showNotification(`Welcome back! Your email has been pre-filled.`, 'info');
        
        // Clear the saved credentials after use
        setTimeout(() => {
          localStorage.removeItem('hephAutoLoginCredentials');
        }, 5000);
      } else if (source === 'lastLogin') {
        showNotification(`Welcome back! Your email has been pre-filled.`, 'info');
      }
    }
  }

  // Show notification
  function showNotification(message, type = 'info') {
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    const icon = type === 'success' ? 'fa-check-circle' : 
                 type === 'error' ? 'fa-exclamation-circle' : 
                 'fa-info-circle';
    
    notification.innerHTML = `
      <div class="notification-content">
        <i class="fas ${icon}"></i>
        <span>${message}</span>
        <button class="notification-close">
          <i class="fas fa-times"></i>
        </button>
      </div>
    `;
    
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? '#28a745' : 
                   type === 'error' ? '#dc3545' : '#17a2b8'};
      color: white;
      padding: 15px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      transform: translateX(100%);
      transition: transform 0.3s ease;
      max-width: 350px;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    `;
    
    notification.querySelector('.notification-content').style.cssText = `
      display: flex;
      align-items: center;
      gap: 10px;
    `;
    
    notification.querySelector('.notification-close').style.cssText = `
      background: none;
      border: none;
      color: white;
      cursor: pointer;
      margin-left: auto;
      padding: 0;
      font-size: 14px;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 100);
    
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => notification.remove(), 300);
    });
    
    setTimeout(() => {
      if (notification.parentNode) {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
      }
    }, 5000);
  }

  // Check if user is already logged in
  function checkLoginStatus() {
    const sessionData = localStorage.getItem('hephAutoSession') || sessionStorage.getItem('hephAutoSession');
    
    if (sessionData) {
      try {
        const session = JSON.parse(sessionData);
        const now = new Date();
        const loginTime = new Date(session.loginTime);
        
        const maxAge = session.rememberMe ? 24 * 60 * 60 * 1000 : 8 * 60 * 60 * 1000;
        
        if (now - loginTime < maxAge) {
          if (session.userType === 'admin') {
            window.location.href = 'admin.html';
          } else {
            window.location.href = 'Heph.html';
          }
        } else {
          localStorage.removeItem('hephAutoSession');
          sessionStorage.removeItem('hephAutoSession');
        }
      } catch (error) {
        console.error('Error parsing session data:', error);
        localStorage.removeItem('hephAutoSession');
        sessionStorage.removeItem('hephAutoSession');
      }
    }
  }

  checkLoginStatus();
});

// ===== FLOATING CHAT FUNCTIONALITY =====
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

// Global session management functions
function getCurrentUser() {
  const sessionData = localStorage.getItem('hephAutoSession') || sessionStorage.getItem('hephAutoSession');
  if (sessionData) {
    try {
      return JSON.parse(sessionData);
    } catch (error) {
      console.error('Error parsing session data:', error);
      return null;
    }
  }
  return null;
}

function logoutUser() {
  localStorage.removeItem('hephAutoSession');
  sessionStorage.removeItem('hephAutoSession');
  window.location.href = 'login.html';
}

function isLoggedIn() {
  return getCurrentUser() !== null;
}

function isAdmin() {
  const user = getCurrentUser();
  return user && user.userType === 'admin';
}

window.getCurrentUser = getCurrentUser;
window.logoutUser = logoutUser;
window.isLoggedIn = isLoggedIn;
window.isAdmin = isAdmin;
