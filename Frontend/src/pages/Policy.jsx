import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">Privacy Policy</h1>
        <p className="text-gray-400 text-lg">
          Last updated: {new Date().toLocaleDateString()}
        </p>
      </div>

      <div className="space-y-8">
        <div className="rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
          <div className="p-4 md:p-5">
            <h2 className="text-2xl font-semibold text-white mb-4">1. Information We Collect</h2>
            <div className="space-y-4 text-gray-300">
              <p>We collect information you provide directly to us, such as when you create an account, write reviews, or contact us.</p>
              <p>This includes your name, email address, username, and any content you post on our platform.</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
          <div className="p-4 md:p-5">
            <h2 className="text-2xl font-semibold text-white mb-4">2. How We Use Your Information</h2>
            <div className="space-y-4 text-gray-300">
              <p>We use your information to provide and improve our services, communicate with you, and ensure platform security.</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
          <div className="p-4 md:p-5">
            <h2 className="text-2xl font-semibold text-white mb-4">3. Contact Us</h2>
            <div className="space-y-4 text-gray-300">
              <p>If you have any questions about this Privacy Policy, please contact us at privacy@thiraiview.com</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;