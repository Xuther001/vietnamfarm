import React from "react";
import "./MessageLog.css";

export default function MessageLog({ messages }) {
  return (
    <div className="message-log">
      <h4>Message Log</h4>
      <ul>
        {messages.length === 0 ? (
          <li>No messages yet.</li>
        ) : (
          messages.map((msg, i) => <li key={i}>{msg}</li>)
        )}
      </ul>
    </div>
  );
}