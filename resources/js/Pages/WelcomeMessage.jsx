import React from 'react';

export default function WelcomeMessage({ name, message }) {
  return (
    <div className="bg-green-100 p-4 rounded-lg shadow">
      <p className="text-lg">
        👋 <strong>{name}</strong>，{message}
      </p>
    </div>
  );
}
