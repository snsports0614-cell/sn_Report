import React, { useEffect, useRef } from 'react';

interface PreviewProps {
  code: string;
  visible: boolean;
}

export const Preview: React.FC<PreviewProps> = ({ code, visible }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (iframeRef.current) {
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        doc.open();
        doc.write(code);
        doc.close();
      }
    }
  }, [code, visible]);

  if (!visible) return null;

  return (
    <div className="flex-1 h-full flex flex-col bg-white min-w-0 relative">
      <div className="absolute top-0 left-0 w-full h-8 bg-gray-100 border-b border-gray-300 text-xs text-gray-500 flex items-center px-4 z-10">
        Browser Preview
      </div>
      <div className="flex-1 pt-8 h-full bg-white relative">
        <iframe
          ref={iframeRef}
          title="preview"
          className="w-full h-full border-none"
          sandbox="allow-scripts allow-modals allow-forms allow-same-origin"
        />
        {code.trim().length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
             <span className="text-gray-400 text-sm">Preview will appear here</span>
          </div>
        )}
      </div>
    </div>
  );
};