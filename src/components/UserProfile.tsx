import { useState } from 'react';
import { UserProfile } from '../types';
import './UserProfile.css';

interface UserProfileProps {
  currentUser: UserProfile | null;
  allUsers: UserProfile[];
  onUserChange: (userId: string) => void;
  onCreateUser: (name: string) => void;
  onDeleteUser: (userId: string) => void;
}

export default function UserProfileComponent({
  currentUser,
  allUsers,
  onUserChange,
  onCreateUser,
  onDeleteUser,
}: UserProfileProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const handleCreateUser = () => {
    if (newUserName.trim()) {
      onCreateUser(newUserName.trim());
      setNewUserName('');
      setShowCreateForm(false);
    }
  };

  const handleDeleteUser = (userId: string) => {
    onDeleteUser(userId);
    setShowDeleteConfirm(null);
  };

  const handleSwitchUser = (userId: string) => {
    onUserChange(userId);
    setIsOpen(false);
  };

  return (
    <div className="user-profile-container">
      <button
        className="user-profile-button"
        onClick={() => setIsOpen(!isOpen)}
        title="User Profile"
      >
        <span className="user-icon">👤</span>
        <span className="user-name">{currentUser?.name || 'No User'}</span>
        <span className="dropdown-arrow">{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className="user-profile-dropdown">
          <div className="user-profile-header">User Profiles</div>

          <div className="user-list">
            {allUsers.map(user => (
              <div
                key={user.id}
                className={`user-item ${currentUser?.id === user.id ? 'active' : ''}`}
              >
                <button
                  className="user-select-button"
                  onClick={() => handleSwitchUser(user.id)}
                >
                  <span className="user-item-name">{user.name}</span>
                  {currentUser?.id === user.id && <span className="active-indicator">✓</span>}
                </button>

                {allUsers.length > 1 && (
                  <button
                    className="user-delete-button"
                    onClick={() => setShowDeleteConfirm(user.id)}
                    title={`Delete ${user.name}`}
                  >
                    ×
                  </button>
                )}

                {showDeleteConfirm === user.id && (
                  <div className="delete-confirm">
                    <p>Delete "{user.name}" and all their data?</p>
                    <div className="delete-confirm-buttons">
                      <button
                        className="confirm-yes"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        Yes
                      </button>
                      <button
                        className="confirm-no"
                        onClick={() => setShowDeleteConfirm(null)}
                      >
                        No
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="user-profile-actions">
            {!showCreateForm ? (
              <button
                className="create-user-button"
                onClick={() => setShowCreateForm(true)}
              >
                + Create New User
              </button>
            ) : (
              <div className="create-user-form">
                <input
                  type="text"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="Enter name"
                  maxLength={20}
                  onKeyPress={(e) => e.key === 'Enter' && handleCreateUser()}
                  autoFocus
                />
                <div className="create-user-buttons">
                  <button onClick={handleCreateUser} disabled={!newUserName.trim()}>
                    Create
                  </button>
                  <button onClick={() => {
                    setShowCreateForm(false);
                    setNewUserName('');
                  }}>
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
