import { useState, useEffect } from 'react';
import { AppSettings, RehearsalSettings } from '../types';
import { loadSettings, saveSettings, resetSettings, DEFAULT_SETTINGS, formatInterval } from '../utils/settingsStorage';
import './Settings.css';

interface SettingsProps {
  userId?: string;
  onClose: () => void;
  onSettingsChange?: (settings: AppSettings) => void;
}

export const Settings: React.FC<SettingsProps> = ({ userId, onClose, onSettingsChange }) => {
  const [settings, setSettings] = useState<AppSettings>(loadSettings(userId));
  const [hasChanges, setHasChanges] = useState(false);

  // Load settings on mount or when userId changes
  useEffect(() => {
    setSettings(loadSettings(userId));
  }, [userId]);

  const handleIntervalChange = (box: keyof RehearsalSettings, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue > 0) {
      setSettings(prev => ({
        ...prev,
        rehearsal: {
          ...prev.rehearsal,
          [box]: numValue,
        },
      }));
      setHasChanges(true);
    }
  };

  const handleAudioSettingChange = (key: 'enableHarmonicRatio' | 'harmonicRatioThreshold', value: boolean | number) => {
    setSettings(prev => ({
      ...prev,
      audioDetection: {
        ...prev.audioDetection,
        [key]: value,
      },
    }));
    setHasChanges(true);
  };

  const handleTimeoutChange = (value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0) {
      setSettings(prev => ({
        ...prev,
        timeout: numValue,
      }));
      setHasChanges(true);
    }
  };

  const handleSilentTimeoutChange = (value: boolean) => {
    setSettings(prev => ({
      ...prev,
      silentTimeout: value,
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    saveSettings(settings, userId);
    setHasChanges(false);
    if (onSettingsChange) {
      onSettingsChange(settings);
    }
    alert('Settings saved successfully!');
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all settings to defaults?')) {
      const defaults = resetSettings(userId);
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
                <span className="interval-display">{formatInterval(settings.rehearsal.box0Interval)}</span>
              </label>
              <div className="input-group">
                <input
                  type="number"
                  id="box0"
                  min="0.1"
                  step="0.1"
                  value={msToSeconds(settings.rehearsal.box0Interval)}
                  onChange={(e) => handleIntervalChange('box0Interval', String(secondsToMs(parseFloat(e.target.value))))}
                />
                <span className="unit">seconds</span>
              </div>
              <small className="default-value">Default: {formatInterval(DEFAULT_SETTINGS.rehearsal.box0Interval)}</small>
            </div>

            <div className="setting-item">
              <label htmlFor="box1">
                <strong>Box 2</strong>
                <span className="interval-display">{formatInterval(settings.rehearsal.box1Interval)}</span>
              </label>
              <div className="input-group">
                <input
                  type="number"
                  id="box1"
                  min="1"
                  step="1"
                  value={msToSeconds(settings.rehearsal.box1Interval)}
                  onChange={(e) => handleIntervalChange('box1Interval', String(secondsToMs(parseFloat(e.target.value))))}
                />
                <span className="unit">seconds</span>
              </div>
              <small className="default-value">Default: {formatInterval(DEFAULT_SETTINGS.rehearsal.box1Interval)}</small>
            </div>

            <div className="setting-item">
              <label htmlFor="box2">
                <strong>Box 3</strong>
                <span className="interval-display">{formatInterval(settings.rehearsal.box2Interval)}</span>
              </label>
              <div className="input-group">
                <input
                  type="number"
                  id="box2"
                  min="1"
                  step="1"
                  value={msToSeconds(settings.rehearsal.box2Interval)}
                  onChange={(e) => handleIntervalChange('box2Interval', String(secondsToMs(parseFloat(e.target.value))))}
                />
                <span className="unit">seconds</span>
              </div>
              <small className="default-value">Default: {formatInterval(DEFAULT_SETTINGS.rehearsal.box2Interval)}</small>
            </div>

            <div className="setting-item">
              <label htmlFor="box3">
                <strong>Box 4</strong>
                <span className="interval-display">{formatInterval(settings.rehearsal.box3Interval)}</span>
              </label>
              <div className="input-group">
                <input
                  type="number"
                  id="box3"
                  min="1"
                  step="1"
                  value={msToSeconds(settings.rehearsal.box3Interval)}
                  onChange={(e) => handleIntervalChange('box3Interval', String(secondsToMs(parseFloat(e.target.value))))}
                />
                <span className="unit">seconds</span>
              </div>
              <small className="default-value">Default: {formatInterval(DEFAULT_SETTINGS.rehearsal.box3Interval)}</small>
            </div>

            <div className="setting-item">
              <label htmlFor="box4">
                <strong>Box 5 (Mastered)</strong>
                <span className="interval-display">{formatInterval(settings.rehearsal.box4Interval)}</span>
              </label>
              <div className="input-group">
                <input
                  type="number"
                  id="box4"
                  min="1"
                  step="1"
                  value={msToSeconds(settings.rehearsal.box4Interval)}
                  onChange={(e) => handleIntervalChange('box4Interval', String(secondsToMs(parseFloat(e.target.value))))}
                />
                <span className="unit">seconds</span>
              </div>
              <small className="default-value">Default: {formatInterval(DEFAULT_SETTINGS.rehearsal.box4Interval)}</small>
            </div>
          </div>

          <div className="settings-tip">
            <strong>💡 Tip:</strong> Shorter intervals help with initial learning, while longer intervals reinforce long-term memory.
          </div>

          <h3>Answer Timeout</h3>
          <p className="settings-description">
            Set how long users have to answer each question. Box 1 always has infinite time.
          </p>

          <div className="settings-grid">
            <div className="setting-item">
              <label htmlFor="timeout">
                <strong>Timeout Duration</strong>
                <span className="interval-display">
                  {settings.timeout === 0 ? 'Infinite' : `${settings.timeout} seconds`}
                </span>
              </label>
              <div className="input-group">
                <input
                  type="number"
                  id="timeout"
                  min="0"
                  step="1"
                  value={settings.timeout}
                  onChange={(e) => handleTimeoutChange(e.target.value)}
                />
                <span className="unit">seconds</span>
              </div>
              <small className="default-value">Default: {DEFAULT_SETTINGS.timeout} seconds</small>
              <p className="setting-help">
                Set to 0 for infinite time. Otherwise, the answer is automatically marked as incorrect after the timeout.
              </p>
            </div>

            <div className="setting-item">
              <label htmlFor="silentTimeout">
                <strong>Silent Timeout</strong>
              </label>
              <div className="input-group">
                <input
                  type="checkbox"
                  id="silentTimeout"
                  checked={settings.silentTimeout}
                  onChange={(e) => handleSilentTimeoutChange(e.target.checked)}
                />
                <label htmlFor="silentTimeout" className="checkbox-label">
                  Hide timer and allow answering after timeout
                </label>
              </div>
              <small className="default-value">
                Default: {DEFAULT_SETTINGS.silentTimeout ? 'Enabled' : 'Disabled'}
              </small>
              <p className="setting-help">
                When enabled, the countdown timer is hidden and you can continue answering after timeout.
                Correct answers are shown with green feedback, but cards only progress to the next box if answered correctly before timeout.
                Otherwise, they go to Box 1.
              </p>
            </div>
          </div>

          <div className="settings-tip">
            <strong>💡 Tip:</strong> Timeouts help practice quick recall, but Box 1 (new cards) always has infinite time to ensure proper learning.
          </div>

          <h3>Audio Detection</h3>
          <p className="settings-description">
            Configure how the app detects piano sounds and filters out background noise.
          </p>

          <div className="settings-grid">
            <div className="setting-item">
              <label htmlFor="enableHarmonicRatio">
                <strong>Enable Harmonic Ratio Filtering</strong>
              </label>
              <div className="input-group">
                <input
                  type="checkbox"
                  id="enableHarmonicRatio"
                  checked={settings.audioDetection.enableHarmonicRatio}
                  onChange={(e) => handleAudioSettingChange('enableHarmonicRatio', e.target.checked)}
                />
                <label htmlFor="enableHarmonicRatio" className="checkbox-label">
                  Filter out non-piano sounds based on harmonic content
                </label>
              </div>
              <small className="default-value">
                Default: {DEFAULT_SETTINGS.audioDetection.enableHarmonicRatio ? 'Enabled' : 'Disabled'}
              </small>
            </div>

            {settings.audioDetection.enableHarmonicRatio && (
              <div className="setting-item">
                <label htmlFor="harmonicRatioThreshold">
                  <strong>Harmonic Ratio Threshold</strong>
                  <span className="interval-display">
                    {(settings.audioDetection.harmonicRatioThreshold * 100).toFixed(0)}%
                  </span>
                </label>
                <div className="input-group">
                  <input
                    type="range"
                    id="harmonicRatioThreshold"
                    min="0.3"
                    max="0.9"
                    step="0.05"
                    value={settings.audioDetection.harmonicRatioThreshold}
                    onChange={(e) => handleAudioSettingChange('harmonicRatioThreshold', parseFloat(e.target.value))}
                  />
                  <span className="unit">{(settings.audioDetection.harmonicRatioThreshold * 100).toFixed(0)}%</span>
                </div>
                <small className="default-value">
                  Default: {(DEFAULT_SETTINGS.audioDetection.harmonicRatioThreshold * 100).toFixed(0)}%
                </small>
                <p className="setting-help">
                  Higher values are more strict (better at filtering background noise but may miss soft piano notes).
                  Lower values are more permissive (detect soft notes but may react to background sounds).
                </p>
              </div>
            )}
          </div>

          <div className="settings-tip">
            <strong>💡 Tip:</strong> If the app reacts to background noise (talking, other sounds), increase the harmonic ratio threshold. If it's not detecting soft piano notes, decrease it.
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
