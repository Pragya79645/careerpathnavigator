// File: src/components/CompanyForm.tsx
import { useState, FormEvent } from 'react';

interface CompanyFormProps {
  onSubmit: (company: string, role: string) => void;
  isLoading: boolean;
}

const CompanyForm: React.FC<CompanyFormProps> = ({ onSubmit, isLoading }) => {
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (company.trim() && role.trim()) {
      onSubmit(company.trim(), role.trim());
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Enter Your Target Company and Role</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
            Target Company
          </label>
          <input
            type="text"
            id="company"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Google, Microsoft, Amazon"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            required
          />
        </div>
        
        <div className="mb-6">
          <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
            Target Role
          </label>
          <input
            type="text"
            id="role"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Software Engineer, Product Manager, Data Scientist"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
          />
        </div>
        
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-300"
          disabled={isLoading || !company.trim() || !role.trim()}
        >
          {isLoading ? 'Generating Roadmap...' : 'Generate Roadmap'}
        </button>
      </form>
    </div>
  );
};

export default CompanyForm;