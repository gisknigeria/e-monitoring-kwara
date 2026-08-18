import { useEffect, useRef, useState } from "react";
import { FaTimes, FaImage, FaVideo, FaCheck, FaShare } from "react-icons/fa";

export default function IncidentNotificationModal({
  notification,
  incident,
  currentUser,
  onClose,
  onMarkDone,
  onOpenChat,
}) {
  const [isMarking, setIsMarking] = useState(false);
  const [error, setError] = useState("");

  const handleMarkDone = async () => {
    setError("");
    setIsMarking(true);
    try {
      await onMarkDone(incident.id);
      // Optionally close after marking done
    } catch (err) {
      setError(err.message || "Failed to mark as done. Please try again.");
    } finally {
      setIsMarking(false);
    }
  };

  const handleOpenChat = async () => {
    setError("");
    try {
      await onOpenChat(incident.id);
    } catch (err) {
      setError(err.message || "Failed to open chat. Please try again.");
    }
  };

  const mediaItems = incident?.media || [];
  const hasMedia = mediaItems.length > 0;

  const getMediaIcon = (type) => {
    if (type?.startsWith("image")) return <FaImage />;
    if (type?.startsWith("video")) return <FaVideo />;
    return null;
  };

  return (
    <div className="modal-backdrop">
      <div className="modal incident-notification-modal">
        <div className="modal-header">
          <h2>Incident Assignment</h2>
          <button className="icon-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="modal-content">
          {/* Message from Admin */}
          <div className="notification-section">
            <h3>Message from Command</h3>
            <div className="message-box">
              <p>{notification?.message || "No message provided."}</p>
            </div>
          </div>

          {/* Incident Information */}
          <div className="notification-section">
            <h3>Incident Details</h3>
            <div className="incident-details">
              <div className="detail-row">
                <span className="detail-label">Type:</span>
                <span className="detail-value">
                  {incident?.reportType || "Unknown"}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Severity:</span>
                <span
                  className="detail-value"
                  style={{
                    color:
                      incident?.severity === "Critical"
                        ? "#ef4444"
                        : incident?.severity === "High"
                          ? "#fb923c"
                          : incident?.severity === "Medium"
                            ? "#facc15"
                            : "#38bdf8",
                  }}
                >
                  {incident?.severity || "Unknown"}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Title:</span>
                <span className="detail-value">{incident?.title}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Description:</span>
                <span className="detail-value detail-description">
                  {incident?.description}
                </span>
              </div>
              {incident?.lga && (
                <div className="detail-row">
                  <span className="detail-label">LG:</span>
                  <span className="detail-value">{incident.lga}</span>
                </div>
              )}
              {incident?.ward && (
                <div className="detail-row">
                  <span className="detail-label">Ward:</span>
                  <span className="detail-value">{incident.ward}</span>
                </div>
              )}
              {incident?.pollingUnit && (
                <div className="detail-row">
                  <span className="detail-label">Polling Unit:</span>
                  <span className="detail-value">{incident.pollingUnit}</span>
                </div>
              )}
              <div className="detail-row">
                <span className="detail-label">Status:</span>
                <span className="detail-value">{incident?.status || "Open"}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Reported at:</span>
                <span className="detail-value">
                  {incident?.createdAt
                    ? new Date(incident.createdAt).toLocaleString()
                    : "Unknown"}
                </span>
              </div>
            </div>
          </div>

          {/* Media Attachments */}
          {hasMedia && (
            <div className="notification-section">
              <h3>Attachments ({mediaItems.length})</h3>
              <div className="media-list">
                {mediaItems.map((media, index) => (
                  <div key={index} className="media-item">
                    <div className="media-icon">
                      {getMediaIcon(media.type)}
                    </div>
                    <div className="media-info">
                      <p className="media-name">{media.name || `Attachment ${index + 1}`}</p>
                      <p className="media-type">{media.type || "Unknown type"}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && <div className="error-message">{error}</div>}
        </div>

        <div className="modal-actions">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handleOpenChat}
            disabled={error ? false : false}
            className="btn-secondary"
            title="Open persistent chat with admin"
          >
            <FaShare style={{ marginRight: "0.5rem" }} />
            Report Situation
          </button>
          <button
            type="button"
            onClick={handleMarkDone}
            disabled={isMarking}
            className="btn-primary"
          >
            <FaCheck style={{ marginRight: "0.5rem" }} />
            {isMarking ? "Marking..." : "Done"}
          </button>
        </div>
      </div>
    </div>
  );
}
