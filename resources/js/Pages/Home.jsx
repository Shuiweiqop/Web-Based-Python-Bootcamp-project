import React from 'react';
import WelcomeMessage from './WelcomeMessage'; // 注意路径根据实际情况调整

export default function Home() {
  const userName = 'Ng Yong Ng';
  const welcomeText = '欢迎来到 Web-Based Learning System！';
  const NickName ='Micheal';
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">主页</h1>
      <WelcomeMessage name={userName} message={welcomeText} />
    </div>
  );
}
