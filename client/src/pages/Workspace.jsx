import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { canvasAPI, authAPI } from '../utils/api';
import './Workspace.css';

function Workspace() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [canvases, setCanvases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [newCanvasName, setNewCanvasName] = useState('');
  const [newCanvasTheme, setNewCanvasTheme] = useState('default');
  const [nickname, setNickname] = useState(user?.nickname || '');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [error, setError] = useState('');

  const themes = [
    { value: 'default', label: 'Default', color: '#ffffff' },
    { value: 'light', label: 'Light', color: '#f5f5f5' },
    { value: 'dark', label: 'Dark', color: '#2c3e50' },
    { value: 'colorful', label: 'Colorful', color: '#ff6b6b' },
    { value: 'minimal', label: 'Minimal', color: '#ecf0f1' },
    { value: 'vintage', label: 'Vintage', color: '#d4a574' }
  ];

  useEffect(() => {
    loadCanvases();
  }, []);

  const loadCanvases = async () => {
    try {
      setLoading(true);
      const response = await canvasAPI.getAll();
      setCanvases(response.data.canvases);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCanvas = async (e) => {
    e.preventDefault();
    if (!newCanvasName.trim()) {
      setError('Canvas name is required');
      return;
    }

    try {
      const response = await canvasAPI.create({
        name: newCanvasName,
        theme: newCanvasTheme
      });
      setCanvases([response.data.canvas, ...canvases]);
      setShowCreateModal(false);
      setNewCanvasName('');
      setNewCanvasTheme('default');
      setError('');
    } catch {
      setError('Failed to create canvas');
    }
  };

  const handleDeleteCanvas = async (id, e) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this canvas?')) {
      return;
    }

    try {
      await canvasAPI.delete(id);
      setCanvases(canvases.filter(c => c._id !== id));
    } catch {
      setError('Failed to delete canvas');
    }
  };

  const handleOpenCanvas = (canvasId) => {
    navigate(`/canvas/${canvasId}`);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // Update nickname if changed
      if (nickname !== user.nickname) {
        await authAPI.updateProfile({ nickname });
      }

      // Upload avatar if selected
      if (avatarFile) {
        const formData = new FormData();
        formData.append('avatar', avatarFile);
        const response = await authAPI.uploadAvatar(formData);
        updateUser(response.data.user);
      } else if (nickname !== user.nickname) {
        const response = await authAPI.getMe();
        updateUser(response.data.user);
      }

      setShowProfileModal(false);
      setAvatarFile(null);
      setAvatarPreview(null);
    } catch {
      setError('Failed to update profile');
    }
  };

  const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) return null;
    if (avatarPath.startsWith('http')) return avatarPath;
    return `http://localhost:3001${avatarPath}`;
  };

  return (
    <div className="workspace-container">
      <header className="workspace-header">
        <div className="header-left">
          <h1>🎨 My Workspace</h1>
        </div>
        <div className="header-right">
          <button 
            className="profile-button" 
            onClick={() => {
              setShowProfileModal(true);
              setNickname(user?.nickname || '');
              setAvatarPreview(null);
              setAvatarFile(null);
            }}
          >
            {user?.avatar ? (
              <img 
                src={getAvatarUrl(user.avatar)} 
                alt={user.nickname} 
                className="avatar-small"
              />
            ) : (
              <div className="avatar-placeholder">{user?.nickname?.charAt(0).toUpperCase()}</div>
            )}
            <span>{user?.nickname}</span>
          </button>
          <button className="logout-button" onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      <main className="workspace-main">
        {error && <div className="error-banner">{error}</div>}

        <div className="canvas-grid-header">
          <h2>Your Canvases ({canvases.length})</h2>
          <button 
            className="create-button" 
            onClick={() => setShowCreateModal(true)}
          >
            + New Canvas
          </button>
        </div>

        {loading ? (
          <div className="loading">Loading canvases...</div>
        ) : canvases.length === 0 ? (
          <div className="empty-state">
            <p>You haven't created any canvases yet.</p>
            <button 
              className="create-button-large" 
              onClick={() => setShowCreateModal(true)}
            >
              Create Your First Canvas
            </button>
          </div>
        ) : (
          <div className="canvas-grid">
            {canvases.map((canvas) => (
              <div 
                key={canvas._id} 
                className="canvas-card"
                onClick={() => handleOpenCanvas(canvas._id)}
              >
                <div 
                  className="canvas-thumbnail"
                  style={{ backgroundColor: themes.find(t => t.value === canvas.theme)?.color || '#fff' }}
                >
                  {canvas.thumbnail ? (
                    <img src={canvas.thumbnail} alt={canvas.name} />
                  ) : (
                    <div className="canvas-icon">🎨</div>
                  )}
                </div>
                <div className="canvas-info">
                  <h3>{canvas.name}</h3>
                  <div className="canvas-meta">
                    <span className="canvas-theme">{themes.find(t => t.value === canvas.theme)?.label || 'Default'}</span>
                    <span className="canvas-date">
                      {new Date(canvas.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <button
                  className="delete-button"
                  onClick={(e) => handleDeleteCanvas(canvas._id, e)}
                  title="Delete canvas"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create Canvas Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Create New Canvas</h2>
            <form onSubmit={handleCreateCanvas}>
              <div className="form-group">
                <label>Canvas Name</label>
                <input
                  type="text"
                  value={newCanvasName}
                  onChange={(e) => setNewCanvasName(e.target.value)}
                  placeholder="Enter canvas name"
                  required
                />
              </div>
              <div className="form-group">
                <label>Theme</label>
                <div className="theme-selector">
                  {themes.map((theme) => (
                    <div
                      key={theme.value}
                      className={`theme-option ${newCanvasTheme === theme.value ? 'selected' : ''}`}
                      onClick={() => setNewCanvasTheme(theme.value)}
                    >
                      <div 
                        className="theme-color" 
                        style={{ backgroundColor: theme.color }}
                      />
                      <span>{theme.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="modal-buttons">
                <button 
                  type="button" 
                  className="cancel-button"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="submit-button">
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="modal-overlay" onClick={() => setShowProfileModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Edit Profile</h2>
            <form onSubmit={handleUpdateProfile}>
              <div className="form-group">
                <label>Avatar</label>
                <div className="avatar-upload">
                  <div className="avatar-preview">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Preview" />
                    ) : user?.avatar ? (
                      <img src={getAvatarUrl(user.avatar)} alt={user.nickname} />
                    ) : (
                      <div className="avatar-placeholder-large">
                        {user?.nickname?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    id="avatar-input"
                  />
                  <label htmlFor="avatar-input" className="upload-button">
                    Choose Image
                  </label>
                </div>
              </div>
              <div className="form-group">
                <label>Nickname</label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="Enter your nickname"
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={user?.email}
                  disabled
                  className="disabled-input"
                />
              </div>
              <div className="modal-buttons">
                <button 
                  type="button" 
                  className="cancel-button"
                  onClick={() => setShowProfileModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="submit-button">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Workspace;
