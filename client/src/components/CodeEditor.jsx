import React, { useState } from 'react';
import { Code, Trash2, Copy, Check } from 'lucide-react';

export default function CodeEditor({ code, onChange, language = 'javascript' }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    onChange('');
  };

  return (
    <div className="mt-3 rounded-2xl bg-[#09090D] border border-white/10 overflow-hidden shadow-inner">
      {/* Code Editor Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#121218] border-b border-white/5 text-xs text-gray-400">
        <div className="flex items-center gap-2 font-mono">
          <Code className="w-4 h-4 text-purple-400" />
          <span className="font-semibold text-gray-300">code_solution.{language === 'javascript' ? 'js' : language}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="p-1 hover:text-white transition-colors"
            title="Copy code"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="p-1 hover:text-red-400 transition-colors"
            title="Clear editor"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Editor Textarea */}
      <div className="relative font-mono text-xs">
        <textarea
          value={code}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`// Write your clean solution or pseudo-code here...\nfunction solution() {\n  // Implementation details\n}`}
          rows={7}
          spellCheck={false}
          className="w-full p-4 bg-transparent text-gray-200 font-mono text-xs focus:outline-none resize-y leading-relaxed"
        />
      </div>
    </div>
  );
}

