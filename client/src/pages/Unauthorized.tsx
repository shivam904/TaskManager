import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldExclamationIcon } from '@heroicons/react/24/outline';

const Unauthorized: React.FC = () => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <ShieldExclamationIcon className="h-16 w-16 text-red-500 mx-auto" />
        <h1 className="mt-4 text-3xl font-bold text-gray-900">Unauthorized Access</h1>
        <p className="mt-2 text-lg text-gray-600">
          You don't have permission to access this page.
        </p>
        <div className="mt-6">
          <Link
            to="/dashboard"
            className="btn-primary"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized; 