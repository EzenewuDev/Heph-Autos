import React from 'react';
import './UserMenu.css';

const menuItems = [
  { icon: 'fa-store', label: 'Marketplace', action: 'marketplace' },
  { icon: 'fa-briefcase', label: 'Talent Hub', action: 'talent' },
  { icon: 'fa-shopping-bag', label: 'My Shop', action: 'shop' },
  { icon: 'fa-envelope', label: 'Messages', action: 'messages' },
  { icon: 'fa-plus-circle', label: 'Sell', action: 'sell' },
  { icon: 'fa-heart', label: 'Favorite', action: 'favorite' },
  { icon: 'fa-id-card', label: 'KYC Registration', action: 'kyc' },
  { icon: 'fa-user-edit', label: 'Edit Profile', action: 'edit' },
  { icon: 'fa-credit-card', label: 'Subscription', action: 'subscription' },
];

export default function UserMenu({
  name = 'Great Ezenewu',
  email = 'gxgraphicsdesign@gmail.com',
  avatar = 'assets/profile.png',
  onMenuClick = () => {},
  onLogout = () => {},
}) {
  return (
    <div className="user-menu-dropdown">
      <div className="user-menu-header">
        <img src={avatar} alt="User Avatar" className="user-avatar" />
        <div>
          <div className="user-name">{name}</div>
          <div className="user-email">{email}</div>
        </div>
      </div>
      <div className="user-menu-divider"></div>
      <ul className="user-menu-list">
        {menuItems.map(item => (
          <li key={item.label} onClick={() => onMenuClick(item.action)}>
            <i className={`fas ${item.icon}`}></i> {item.label}
          </li>
        ))}
      </ul>
      <div className="user-menu-divider"></div>
      <button className="logout-btn" onClick={onLogout}>
        <i className="fas fa-sign-out-alt"></i> Logout
      </button>
    </div>
  );
} 