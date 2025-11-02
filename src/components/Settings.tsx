import { useState, useEffect } from 'react';
import { RehearsalSettings } from '../types';
import { loadSettings, saveSettings, resetSettings, DEFAULT_SETTINGS, formatInterval } from '../utils/settingsStorage';
import './Settings.css';

interface SettingsProps {
  onClose: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ onClose }) => {
  const [settings, setSettings] = useState<RehearsalSettings>(loadSettings());
  const [hasChanges, setHasChanges] = useState(false);

  // Load settings on mount
  useEffect(() => {
    setSettings(loadSettings());
  }, []);

  const handleIntervalChange = (box: keyof RehearsalSettings, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue > 0) {
      setSettings(prev => ({
        ...prev,
        [box]: numValue,
      }));
      setHasChanges(true);
    }
  };

  const handleSave = () => {
    saveSettings(settings);
    setHasChanges(false);
    alert('Settings saved successfully!');
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all settings to defaults?')) {
      const defaults = resetSettings();
      setSettings(defaults);
      setHasChanges(false);
    }
  };

  const handleClose = () => {
    if (hasChanges) {
      if (confirm('You have unsaved changes. Are you sure you want to close without saving?')) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  // Convert milliseconds to seconds for input
  const msToSeconds = (ms: number) => ms / 1000;
  const secondsToMs = (seconds: number) => seconds * 1000;

  return (
    <div className="settings-overlay">
      <div className="settings-modal">
        <div className="settings-header">
          <h2>Settings</h2>
          <button onClick={handleClose} className="close-button">×</button>
        </div>

        <div className="settings-content">
          <h3>Rehearsal Intervals</h3>
          <p className="settings-description">
            Configure how long to wait before reviewing cards in each box.
          </p>

          <div className="settings-grid">
            <div className="setting-item">
              <label htmlFor="box0">
                <strong>Box 1 (New Cards)</strong>
                <span className="interval-display">{formatInterval(settings.box0Interval)}</span>
              </label>
              <div className="input-group">
                <input
                  type="number"
                  id="box0"
                  min="0.1"
                  step="0.1"
                  value={msToSeconds(settings.box0Interval)}
                  onChange={(e) => handleIntervalChange('box0Interval', String(secondsToMs(parseFloat(e.target.value))))}
                />
                <span className="unit">seconds</span>
              </div>
              <small className="default-value">Default: {formatInterval(DEFAULT_SETTINGS.box0Interval)}</small>
            </div>

            <div className="setting-item">
              <label htmlFor="box1">
                <strong>Box 2</strong>
                <span className="interval-display">{formatInterval(settings.box1Interval)}</span>
              </label>
              <div className="input-group">
                <input
                  type="number"
                  id="box1"
                  min="1"
                  step="1"
                  value={msToSeconds(settings.box1Interval)}
                  onChange={(e) => handleIntervalChange('box1Interval', String(secondsToMs(parseFloat(e.target.value))))}
                />
                <span className="unit">seconds</span>
              </div>
              <small className="default-value">Default: {formatInterval(DEFAULT_SETTINGS.box1Interval)}</small>
            </div>

            <div className="setting-item">
              <label htmlFor="box2">
                <strong>Box 3</strong>
                <span className="interval-display">{formatInterval(settings.box2Interval)}</span>
              </label>
              <div className="input-group">
                <input
                  type="number"
                  id="box2"
                  min="1"
                  step="1"
                  value={msToSeconds(settings.box2Interval)}
                  onChange={(e) => handleIntervalChange('box2Interval', String(secondsToMs(parseFloat(e.target.value))))}
                />
                <span className="unit">seconds</span>
              </div>
              <small className="default-value">Default: {formatInterval(DEFAULT_SETTINGS.box2Interval)}</small>
            </div>

            <div className="setting-item">
              <label htmlFor="box3">
                <strong>Box 4</strong>
                <span className="interval-display">{formatInterval(settings.box3Interval)}</span>
              </label>
              <div className="input-group">
                <input
                  type="number"
                  id="box3"
                  min="1"
                  step="1"
                  value={msToSeconds(settings.box3Interval)}
                  onChange={(e) => handleIntervalChange('box3Interval', String(secondsToMs(parseFloat(e.target.value))))}
                />
                <span className="unit">seconds</span>
              </div>
              <small className="default-value">Default: {formatInterval(DEFAULT_SETTINGS.box3Interval)}</small>
            </div>

            <div className="setting-item">
              <label htmlFor="box4">
                <strong>Box 5 (Mastered)</strong>
                <span className="interval-display">{formatInterval(settings.box4Interval)}</span>
              </label>
              <div className="input-group">
                <input
                  type="number"
                  id="box4"
                  min="1"
                  step="1"
                  value={msToSeconds(settings.box4Interval)}
                  onChange={(e) => handleIntervalChange('box4Interval', String(secondsToMs(parseFloat(e.target.value))))}
                />
                <span className="unit">seconds</span>
              </div>
              <small className="default-value">Default: {formatInterval(DEFAULT_SETTINGS.box4Interval)}</small>
            </div>
          </div>

          <div className="settings-tip">
            <strong>💡 Tip:</strong> Shorter intervals help with initial learning, while longer intervals reinforce long-term memory.
          </div>
        </div>

        <div className="settings-footer">
          <button onClick={handleReset} className="reset-button">
            Reset to Defaults
          </button>
          <div className="button-group">
            <button onClick={handleClose} className="cancel-button">
              Cancel
            </button>
            <button onClick={handleSave} className="save-button" disabled={!hasChanges}>
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
