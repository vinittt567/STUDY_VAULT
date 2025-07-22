import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { fileStorage } from '../../lib/fileStorage';
import { ArrowLeft, Download, Bookmark } from 'lucide-react';

const PDFReader: React.FC = () => {
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();
  const { books } = useApp();
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const book = books.find(b => b.id === bookId);

  useEffect(() => {
    const loadPdfUrl = async () => {
      if (!book?.pdfUrl) {
        setError('PDF file not found');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError('');
        
        // Check if it's already a full URL (data, blob, or http)
        if (book.pdfUrl.startsWith('data:') || book.pdfUrl.startsWith('blob:') || book.pdfUrl.startsWith('http')) {
          setPdfUrl(book.pdfUrl);
        } else {
          // This is a local file ID, get the actual URL from storage
          const actualUrl = await fileStorage.getFileUrl(book.pdfUrl);
          if (actualUrl) {
            setPdfUrl(actualUrl);
          } else {
            setError('PDF file not found in storage');
          }
        }
      } catch (err) {
        console.error('Error loading PDF:', err);
        setError('Failed to load PDF file');
      } finally {
        setIsLoading(false);
      }
    };

    loadPdfUrl();

    // Cleanup object URL when component unmounts
    return () => {
      if (pdfUrl && pdfUrl.startsWith('blob:')) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [book?.pdfUrl]);

  const handleDownload = () => {
    if (book && pdfUrl) {
      // Create a temporary link element to trigger download
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `${book.title}.pdf`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };
  if (!book) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Book Not Found</h2>
          <button
            onClick={() => navigate(-1)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Toolbar */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <h1 className="text-lg font-semibold text-gray-900 truncate max-w-md">{book.title}</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-colors">
              <Bookmark className="h-4 w-4" />
            </button>
            
            <button 
              onClick={handleDownload}
              className="p-2 rounded-lg text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-colors"
              title="Download PDF"
            >
              <Download className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* PDF Viewer */}
      <div className="flex-1 p-4">
        <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-[calc(100vh-120px)] bg-gray-100">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading PDF...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-[calc(100vh-120px)] bg-gray-100">
              <div className="text-center">
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={() => navigate(-1)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Go Back
                </button>
              </div>
            </div>
          ) : pdfUrl ? (
            <div className="w-full h-[calc(100vh-120px)]">
              {pdfUrl.startsWith('data:application/pdf') ? (
                // For data URLs, use object element which works better for PDFs
                <object
                  data={pdfUrl}
                  type="application/pdf"
                  className="w-full h-full"
                  title={book.title}
                >
                  <div className="flex items-center justify-center h-full bg-gray-100">
                    <div className="text-center">
                      <p className="text-gray-600 mb-4">PDF viewer not supported in this browser.</p>
                      <button
                        onClick={handleDownload}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Download PDF
                      </button>
                    </div>
                  </div>
                </object>
              ) : (
                // For regular URLs, use iframe
                <iframe
                  src={pdfUrl}
                  className="w-full h-full"
                  title={book.title}
                  style={{ border: 'none' }}
                  onError={() => {
                    console.error('Failed to load PDF:', pdfUrl);
                  }}
                />
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-[calc(100vh-120px)] bg-gray-100">
              <div className="text-center">
                <p className="text-gray-600 mb-4">No PDF available.</p>
                <button
                  onClick={() => navigate(-1)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Go Back
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PDFReader;