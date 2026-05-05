import React from 'react';
import WelcomeMessage from './WelcomeMessage';

export default function Home() {
  const userName = 'Ng Yong Ng';
  const welcomeText = 'Welcome to the Web-Based Learning System!';

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Home</h1>
      <WelcomeMessage name={userName} message={welcomeText} />
    </div>
  );
}
