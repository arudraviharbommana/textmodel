import { useState } from 'react';
import { FileText } from 'lucide-react';

function MinimalApp() {
  console.log('MinimalApp rendering...');
  const [activeMode, setActiveMode] = useState('test');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  IntelliNLP
                </h1>
                <p className="text-sm text-gray-600">Intelligent Text & Code Processor</p>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              Debug Mode - Testing App Structure
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 pb-8">
        <div className="mt-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">App Structure Test</h2>
            <p className="text-gray-600 mb-4">
              The basic app structure is working. Testing mode: {activeMode}
            </p>
            <button
              onClick={() => setActiveMode(activeMode === 'test' ? 'working' : 'test')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Toggle Mode
            </button>
            <div className="mt-4 p-4 bg-gray-50 rounded">
              <h3 className="font-medium mb-2">Status Check:</h3>
              <ul className="text-sm space-y-1">
                <li>✅ React rendering</li>
                <li>✅ Tailwind CSS working</li>
                <li>✅ State management working</li>
                <li>✅ Lucide React icons working</li>
                <li>⚠️ Testing component imports...</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default MinimalApp;
