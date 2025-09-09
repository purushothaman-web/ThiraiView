import React from 'react';

const TermsOfService = () => {
  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">Terms of Service</h1>
        <p className="text-gray-400 text-lg">
          Last updated: {new Date().toLocaleDateString()}
        </p>
      </div>

      <div className="space-y-8">
        <div className="rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
          <div className="p-4 md:p-5">
            <h2 className="text-2xl font-semibold text-white mb-4">1. Acceptance of Terms</h2>
            <div className="space-y-4 text-gray-300">
              <p>By using ThiraiView, you agree to be bound by these Terms of Service.</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
          <div className="p-4 md:p-5">
            <h2 className="text-2xl font-semibold text-white mb-4">2. User Conduct</h2>
            <div className="space-y-4 text-gray-300">
              <p>You agree to use our platform responsibly and not to post inappropriate content.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;