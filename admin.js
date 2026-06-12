// =====================
// Get DOM Elements
// =====================
const profile = document.querySelector('.profile_btn'); // Profile button in header
const dropdown = document.querySelector('.dropdown_wrapper'); // Dropdown menu

// =====================
// Show/Hide Dropdown on Profile Click
// =====================
profile.addEventListener('click', (event) => {
  event.stopPropagation(); // Prevent the document click from firing immediately
  dropdown.classList.toggle('none'); // Toggle dropdown visibility
  dropdown.classList.remove('hide'); // Remove hide class if present
  dropdown.classList.add('dropdown_wrapper--fade-in'); // Add fade-in animation
});

// =====================
// Hide Dropdown When Clicking Outside
// =====================
document.addEventListener("click", (event) => {
  const isClickInsideDropdown = dropdown.contains(event.target); // Check if click is inside dropdown
  const isProfileClicked = profile.contains(event.target); // Check if click is on profile button

  // If click is outside both dropdown and profile button, hide dropdown
  if (!isClickInsideDropdown && !isProfileClicked) {
    dropdown.classList.add('none'); // Hide dropdown
    dropdown.classList.remove('dropdown_wrapper--fade-in'); // Remove fade-in animation
  }
});

// =====================
// Admin Dashboard - User Management System
// =====================

class AdminDashboard {
  constructor() {
    this.users = [];
    this.filteredUsers = [];
    this.currentPage = 1;
    this.itemsPerPage = 10;
    this.currentUserId = null;
    
    this.init();
  }

  init() {
    this.loadUsers();
    this.setupEventListeners();
    this.updateDashboardStats();
    this.renderUsersTable();
  }

  // Load users from localStorage
  loadUsers() {
    this.users = JSON.parse(localStorage.getItem('users') || '[]');
    this.filteredUsers = [...this.users];
  }

  // Setup event listeners
  setupEventListeners() {
    // Admin dropdown toggle
    const adminProfileBtn = document.getElementById('adminProfileBtn');
    const adminDropdown = document.getElementById('adminDropdown');
    
    if (adminProfileBtn && adminDropdown) {
      adminProfileBtn.addEventListener('click', () => {
        adminDropdown.classList.toggle('hide');
      });

      // Close dropdown when clicking outside
      document.addEventListener('click', (e) => {
        if (!adminProfileBtn.contains(e.target) && !adminDropdown.contains(e.target)) {
          adminDropdown.classList.add('hide');
        }
      });
    }

    // Search functionality
    const userSearch = document.getElementById('userSearch');
    if (userSearch) {
      userSearch.addEventListener('input', (e) => {
        this.filterUsers(e.target.value);
      });
    }

    // Status filter
    const statusFilter = document.getElementById('statusFilter');
    if (statusFilter) {
      statusFilter.addEventListener('change', (e) => {
        this.filterByStatus(e.target.value);
      });
    }

    // Export users
    const exportUsers = document.getElementById('exportUsers');
    if (exportUsers) {
      exportUsers.addEventListener('click', () => {
        this.exportUsersData();
      });
    }

    // Modal controls
    this.setupModalControls();
  }

  // Filter users by search term
  filterUsers(searchTerm) {
    if (!searchTerm.trim()) {
      this.filteredUsers = [...this.users];
    } else {
      this.filteredUsers = this.users.filter(user => 
        user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    this.currentPage = 1;
    this.renderUsersTable();
  }

  // Filter users by status
  filterByStatus(status) {
    if (!status) {
      this.filteredUsers = [...this.users];
    } else {
      this.filteredUsers = this.users.filter(user => user.status === status);
    }
    this.currentPage = 1;
    this.renderUsersTable();
  }

  // Update dashboard statistics
  updateDashboardStats() {
    const totalUsers = document.getElementById('totalUsers');
    const newUsers = document.getElementById('newUsers');
    const activeUsers = document.getElementById('activeUsers');
    const recentLogins = document.getElementById('recentLogins');

    if (totalUsers) totalUsers.textContent = this.users.length;
    
    // Calculate new users this month
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const newUsersThisMonth = this.users.filter(user => {
      const userDate = new Date(user.createdAt);
      return userDate.getMonth() === currentMonth && userDate.getFullYear() === currentYear;
    }).length;
    
    if (newUsers) newUsers.textContent = newUsersThisMonth;

    // Calculate active users
    const activeUsersCount = this.users.filter(user => user.status === 'active').length;
    if (activeUsers) activeUsers.textContent = activeUsersCount;

    // Calculate recent logins (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentLoginsCount = this.users.filter(user => {
      if (!user.lastLogin) return false;
      return new Date(user.lastLogin) > sevenDaysAgo;
    }).length;
    
    if (recentLogins) recentLogins.textContent = recentLoginsCount;
  }

  // Render users table
  renderUsersTable() {
    const tableBody = document.getElementById('usersTableBody');
    if (!tableBody) return;

    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    const paginatedUsers = this.filteredUsers.slice(startIndex, endIndex);

    tableBody.innerHTML = '';

    if (paginatedUsers.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="6" class="no-data">
            <div class="no-data-content">
              <i class="fas fa-users"></i>
              <p>No users found</p>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    paginatedUsers.forEach(user => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>
          <div class="user-info">
            <img src="${user.profile.avatar}" alt="${user.fullName}" class="user-avatar">
            <div>
              <div class="user-name">${user.fullName}</div>
              <div class="user-id">${user.id}</div>
            </div>
          </div>
        </td>
        <td>${user.email}</td>
        <td>
          <span class="status-badge status-${user.status}">${user.status}</span>
        </td>
        <td>${this.formatDate(user.createdAt)}</td>
        <td>${user.lastLogin ? this.formatDate(user.lastLogin) : 'Never'}</td>
        <td>
          <div class="action-buttons">
            <button class="btn-icon" onclick="adminDashboard.viewUser('${user.id}')" title="View Details">
              <i class="fas fa-eye"></i>
            </button>
            <button class="btn-icon" onclick="adminDashboard.editUser('${user.id}')" title="Edit User">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn-icon btn-danger" onclick="adminDashboard.deleteUser('${user.id}')" title="Delete User">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </td>
      `;
      tableBody.appendChild(row);
    });

    this.renderPagination();
  }

  // Render pagination
  renderPagination() {
    const pagination = document.getElementById('pagination');
    if (!pagination) return;

    const totalPages = Math.ceil(this.filteredUsers.length / this.itemsPerPage);
    
    if (totalPages <= 1) {
      pagination.innerHTML = '';
      return;
    }

    let paginationHTML = '';
    
    // Previous button
    paginationHTML += `
      <button class="pagination-btn ${this.currentPage === 1 ? 'disabled' : ''}" 
              onclick="adminDashboard.goToPage(${this.currentPage - 1})">
        <i class="fas fa-chevron-left"></i>
      </button>
    `;

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= this.currentPage - 2 && i <= this.currentPage + 2)) {
        paginationHTML += `
          <button class="pagination-btn ${i === this.currentPage ? 'active' : ''}" 
                  onclick="adminDashboard.goToPage(${i})">
            ${i}
          </button>
        `;
      } else if (i === this.currentPage - 3 || i === this.currentPage + 3) {
        paginationHTML += '<span class="pagination-ellipsis">...</span>';
      }
    }

    // Next button
    paginationHTML += `
      <button class="pagination-btn ${this.currentPage === totalPages ? 'disabled' : ''}" 
              onclick="adminDashboard.goToPage(${this.currentPage + 1})">
        <i class="fas fa-chevron-right"></i>
      </button>
    `;

    pagination.innerHTML = paginationHTML;
  }

  // Go to specific page
  goToPage(page) {
    const totalPages = Math.ceil(this.filteredUsers.length / this.itemsPerPage);
    if (page < 1 || page > totalPages) return;
    
    this.currentPage = page;
    this.renderUsersTable();
  }

  // View user details
  viewUser(userId) {
    const user = this.users.find(u => u.id === userId);
    if (!user) return;

    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    const saveUser = document.getElementById('saveUser');

    modalTitle.textContent = 'User Details';
    saveUser.style.display = 'none';

    modalBody.innerHTML = `
      <div class="user-details">
        <div class="user-header">
          <img src="${user.profile.avatar}" alt="${user.fullName}" class="user-avatar-large">
          <div class="user-info-large">
            <h3>${user.fullName}</h3>
            <p class="user-email">${user.email}</p>
            <span class="status-badge status-${user.status}">${user.status}</span>
          </div>
        </div>
        
        <div class="user-details-grid">
          <div class="detail-group">
            <label>User ID:</label>
            <span>${user.id}</span>
          </div>
          <div class="detail-group">
            <label>Account Type:</label>
            <span>${user.accountType}</span>
          </div>
          <div class="detail-group">
            <label>Joined:</label>
            <span>${this.formatDate(user.createdAt)}</span>
          </div>
          <div class="detail-group">
            <label>Last Login:</label>
            <span>${user.lastLogin ? this.formatDate(user.lastLogin) : 'Never'}</span>
          </div>
          <div class="detail-group">
            <label>Login Count:</label>
            <span>${user.activity.loginCount}</span>
          </div>
          <div class="detail-group">
            <label>Phone:</label>
            <span>${user.profile.phone || 'Not provided'}</span>
          </div>
          <div class="detail-group">
            <label>Address:</label>
            <span>${user.profile.address || 'Not provided'}</span>
          </div>
          <div class="detail-group">
            <label>City:</label>
            <span>${user.profile.city || 'Not provided'}</span>
          </div>
          <div class="detail-group">
            <label>State:</label>
            <span>${user.profile.state || 'Not provided'}</span>
          </div>
          <div class="detail-group">
            <label>Country:</label>
            <span>${user.profile.country}</span>
          </div>
        </div>
      </div>
    `;

    this.showModal('userModal');
  }

  // Edit user
  editUser(userId) {
    const user = this.users.find(u => u.id === userId);
    if (!user) return;

    this.currentUserId = userId;
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    const saveUser = document.getElementById('saveUser');

    modalTitle.textContent = 'Edit User';
    saveUser.style.display = 'block';

    modalBody.innerHTML = `
      <form id="editUserForm" class="edit-user-form">
        <div class="form-row">
          <div class="form-group">
            <label for="editFullName">Full Name</label>
            <input type="text" id="editFullName" value="${user.fullName}" required>
          </div>
          <div class="form-group">
            <label for="editEmail">Email</label>
            <input type="email" id="editEmail" value="${user.email}" required>
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label for="editStatus">Status</label>
            <select id="editStatus">
              <option value="active" ${user.status === 'active' ? 'selected' : ''}>Active</option>
              <option value="inactive" ${user.status === 'inactive' ? 'selected' : ''}>Inactive</option>
              <option value="suspended" ${user.status === 'suspended' ? 'selected' : ''}>Suspended</option>
            </select>
          </div>
          <div class="form-group">
            <label for="editPhone">Phone</label>
            <input type="tel" id="editPhone" value="${user.profile.phone || ''}">
          </div>
        </div>
        
        <div class="form-group">
          <label for="editAddress">Address</label>
          <input type="text" id="editAddress" value="${user.profile.address || ''}">
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label for="editCity">City</label>
            <input type="text" id="editCity" value="${user.profile.city || ''}">
          </div>
          <div class="form-group">
            <label for="editState">State</label>
            <input type="text" id="editState" value="${user.profile.state || ''}">
          </div>
        </div>
      </form>
    `;

    this.showModal('userModal');
  }

  // Save user changes
  saveUserChanges() {
    const userIndex = this.users.findIndex(u => u.id === this.currentUserId);
    if (userIndex === -1) return;

    const form = document.getElementById('editUserForm');
    if (!form) return;

    const formData = new FormData(form);
    
    // Update user data
    this.users[userIndex] = {
      ...this.users[userIndex],
      fullName: document.getElementById('editFullName').value,
      email: document.getElementById('editEmail').value,
      status: document.getElementById('editStatus').value,
      profile: {
        ...this.users[userIndex].profile,
        phone: document.getElementById('editPhone').value,
        address: document.getElementById('editAddress').value,
        city: document.getElementById('editCity').value,
        state: document.getElementById('editState').value
      }
    };

    // Save to localStorage
    localStorage.setItem('users', JSON.stringify(this.users));
    
    // Update filtered users
    this.filteredUsers = this.filteredUsers.map(u => 
      u.id === this.currentUserId ? this.users[userIndex] : u
    );

    this.hideModal('userModal');
    this.renderUsersTable();
    this.updateDashboardStats();
    
    this.showNotification('User updated successfully!', 'success');
  }

  // Delete user
  deleteUser(userId) {
    this.currentUserId = userId;
    this.showModal('deleteModal');
  }

  // Confirm delete user
  confirmDeleteUser() {
    const userIndex = this.users.findIndex(u => u.id === this.currentUserId);
    if (userIndex === -1) return;

    // Remove user from arrays
    this.users.splice(userIndex, 1);
    this.filteredUsers = this.filteredUsers.filter(u => u.id !== this.currentUserId);

    // Save to localStorage
    localStorage.setItem('users', JSON.stringify(this.users));

    this.hideModal('deleteModal');
    this.renderUsersTable();
    this.updateDashboardStats();
    
    this.showNotification('User deleted successfully!', 'success');
  }

  // Export users data
  exportUsersData() {
    const csvContent = this.convertToCSV(this.filteredUsers);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `users_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  // Convert users data to CSV
  convertToCSV(users) {
    const headers = ['ID', 'Full Name', 'Email', 'Status', 'Joined', 'Last Login', 'Phone', 'City', 'State'];
    const csvRows = [headers.join(',')];
    
    users.forEach(user => {
      const row = [
        user.id,
        `"${user.fullName}"`,
        user.email,
        user.status,
        this.formatDate(user.createdAt),
        user.lastLogin ? this.formatDate(user.lastLogin) : 'Never',
        user.profile.phone || '',
        user.profile.city || '',
        user.profile.state || ''
      ];
      csvRows.push(row.join(','));
    });
    
    return csvRows.join('\n');
  }

  // Setup modal controls
  setupModalControls() {
    // User modal
    const userModal = document.getElementById('userModal');
    const closeModal = document.getElementById('closeModal');
    const cancelModal = document.getElementById('cancelModal');
    const saveUser = document.getElementById('saveUser');

    if (closeModal) closeModal.addEventListener('click', () => this.hideModal('userModal'));
    if (cancelModal) cancelModal.addEventListener('click', () => this.hideModal('userModal'));
    if (saveUser) saveUser.addEventListener('click', () => this.saveUserChanges());

    // Delete modal
    const deleteModal = document.getElementById('deleteModal');
    const closeDeleteModal = document.getElementById('closeDeleteModal');
    const cancelDelete = document.getElementById('cancelDelete');
    const confirmDelete = document.getElementById('confirmDelete');

    if (closeDeleteModal) closeDeleteModal.addEventListener('click', () => this.hideModal('deleteModal'));
    if (cancelDelete) cancelDelete.addEventListener('click', () => this.hideModal('deleteModal'));
    if (confirmDelete) confirmDelete.addEventListener('click', () => this.confirmDeleteUser());

    // Close modals when clicking outside
    [userModal, deleteModal].forEach(modal => {
      if (modal) {
        modal.addEventListener('click', (e) => {
          if (e.target === modal) {
            this.hideModal(modal.id);
          }
        });
      }
    });
  }

  // Show modal
  showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    }
  }

  // Hide modal
  hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.style.display = 'none';
      document.body.style.overflow = 'auto';
    }
  }

  // Format date
  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Show notification
  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
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
      background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
      color: white;
      padding: 15px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      transform: translateX(100%);
      transition: transform 0.3s ease;
      max-width: 300px;
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
}

// Initialize admin dashboard
let adminDashboard;
document.addEventListener('DOMContentLoaded', () => {
  adminDashboard = new AdminDashboard();
});

