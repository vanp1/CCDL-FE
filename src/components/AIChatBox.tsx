import React, { useState, useRef, useEffect } from 'react';
import { aiService } from '../services/aiService';
import { ImageIcon, SendIcon, RotateCcw, Copy, ClipboardCheck } from 'lucide-react';
import { useChatStore, ChatMessage } from '../services/chatStore';

interface AIChatBoxProps {
  onInsertValues: (values: {
    uaw?: { simple?: number; average?: number; complex?: number; total?: number };
    uucw?: { simple?: number; average?: number; complex?: number; total?: number };
    tcf?: { factors?: { id: number; value: number }[] };
    ef?: { factors?: { id: number; value: number }[] };
    explanation?: string;
  }) => void;
}

export function AIChatBox({ onInsertValues }: AIChatBoxProps) {
  const { messages: storedMessages, addMessage, clearMessages } = useChatStore();
  const [input, setInput] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUploadClick = () => {
    fileInputRef.current?.click();
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && !imageFile) return;
    const userMessage: ChatMessage = {
      role: 'user',
      content: input || 'Analyze this image and extract UCP values.',
      timestamp: Date.now()
    };

    addMessage(userMessage);
    setInput('');
    setIsLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      let aiResponseContent: string;
      if (imageFile) {
        aiResponseContent = await aiService.analyzeImage(imageFile);
      } else {
        aiResponseContent = await aiService.analyzeText(input);
      }

      const parsedAnalysis = aiService.parseAnalysisFromText(aiResponseContent);
      console.log("Parsed analysis results:", parsedAnalysis);

      // Force additional parsing attempts if initial parsing failed
      let finalAnalysis = parsedAnalysis;
      if (!finalAnalysis || (!finalAnalysis.uaw && !finalAnalysis.uucw)) {
        console.log("Initial parsing failed, trying manual extraction...");

        // Manual extraction for UAW
        const uawRegex = /UAW.*?=.*?(\d+)/i;
        const uawMatch = aiResponseContent.match(uawRegex);

        // Manual extraction for UUCW
        const uucwRegex = /UUCW.*?=.*?(\d+)/i;
        const uucwMatch = aiResponseContent.match(uucwRegex);

        if (uawMatch || uucwMatch) {
          finalAnalysis = finalAnalysis || {};

          if (uawMatch && !finalAnalysis.uaw) {
            const total = parseInt(uawMatch[1], 10);
            finalAnalysis.uaw = { total, simple: 0, average: 0, complex: 0 };
            console.log("Manually extracted UAW:", finalAnalysis.uaw);
          }

          if (uucwMatch && !finalAnalysis.uucw) {
            const total = parseInt(uucwMatch[1], 10);
            finalAnalysis.uucw = { total, simple: 0, average: 0, complex: 0 };
            console.log("Manually extracted UUCW:", finalAnalysis.uucw);
          }

          // Extract explanation if available
          if (!finalAnalysis.explanation) {
            const calcRegex = /(?:calculations?|explanation)[\s:]+(.+?)(?=$)/is;
            const calcMatch = aiResponseContent.match(calcRegex);
            if (calcMatch) {
              finalAnalysis.explanation = calcMatch[1].trim();
            }
          }
        }
      }

      // Always set the analysis in the UI, whether parsed automatically or manually
      setAnalysis(finalAnalysis || null);

      const response: ChatMessage = {
        role: 'assistant',
        content: aiResponseContent,
        timestamp: Date.now(),
        analysis: finalAnalysis || undefined
      };

      addMessage(response);
    } catch (error) {
      console.error("Error processing analysis:", error);
      setError("Failed to process the analysis. Please try again.");
    } finally {
      setIsLoading(false);
      clearImage();
    }
  };

  const handleInsertValues = () => {
    if (analysis) {
      console.log("Inserting values:", analysis);

      // Create a clean, normalized version of the analysis data
      const formattedValues = {
        uaw: analysis.uaw ? {
          simple: analysis.uaw.simple ?? 0,
          average: analysis.uaw.average ?? 0,
          complex: analysis.uaw.complex ?? 0,
          total: analysis.uaw.total ?? 0
        } : undefined,

        uucw: analysis.uucw ? {
          simple: analysis.uucw.simple ?? 0,
          average: analysis.uucw.average ?? 0,
          complex: analysis.uucw.complex ?? 0,
          total: analysis.uucw.total ?? 0
        } : undefined,

        tcf: analysis.tcf && analysis.tcf.factors ? {
          factors: analysis.tcf.factors.map((factor: { id: number | string; value: number | string }) => {
            // Ensure the factor has proper id and value format
            const id = typeof factor.id === 'string'
              ? Number(String(factor.id).replace(/\s+/g, ''))
              : Number(factor.id);

            const value = typeof factor.value === 'string'
              ? Number(String(factor.value).replace(/\s+/g, ''))
              : Number(factor.value);

            return { id, value };
          })
        } : undefined,

        ef: analysis.ef && analysis.ef.factors ? {
          factors: analysis.ef.factors.map((factor: { id: number | string; value: number | string }) => {
            // Special handling for malformed EF factor IDs and values (common in AI responses)
            let id = factor.id;
            let value = factor.value;

            // If id is a string, clean it up (remove spaces, quotes, etc.)
            if (typeof id === 'string') {
              id = Number(id.replace(/[^\d.-]/g, ''));
            } else {
              id = Number(id);
            }

            // If value is a string, clean it up
            if (typeof value === 'string') {
              value = Number(value.replace(/[^\d.-]/g, ''));
            } else {
              value = Number(value);
            }

            // Ensure the values are valid numbers
            id = isNaN(id) ? 0 : id;
            value = isNaN(value) ? 0 : value;

            console.log(`Normalized EF factor: id=${id}, value=${value}`);
            return { id, value };
          })
        } : undefined,

        explanation: analysis.explanation
      };

      // Log the formatted values for debugging
      console.log("Formatted values for insertion:", formattedValues);

      // Pass the values to the parent component for insertion
      onInsertValues(formattedValues);
    }
  };

  const handleResetChat = () => {
    clearMessages();
    setAnalysis(null);
    setError(null);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        // You could add a toast notification here
        console.log('Text copied to clipboard');
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
      });
  };

  useEffect(() => {
    // Update analysis state from the most recent assistant message
    const lastAssistantMessage = [...storedMessages]
      .reverse()
      .find(msg => msg.role === 'assistant');

    if (lastAssistantMessage?.analysis) {
      console.log("Found analysis in last assistant message:", lastAssistantMessage.analysis);
      setAnalysis(lastAssistantMessage.analysis);
    } else if (lastAssistantMessage) {
      console.log("Assistant message found but no analysis:", lastAssistantMessage);
      // Try parsing the content directly
      const parsedAnalysis = aiService.parseAnalysisFromText(lastAssistantMessage.content);
      if (parsedAnalysis) {
        console.log("Successfully parsed analysis from content:", parsedAnalysis);
        setAnalysis(parsedAnalysis);

        // Update the stored message with the analysis
        const updatedMessage = {
          ...lastAssistantMessage,
          analysis: parsedAnalysis
        };

        // Replace the message in the store
        const messageIndex = storedMessages.findIndex(
          msg => msg.role === 'assistant' && msg.timestamp === lastAssistantMessage.timestamp
        );

        if (messageIndex !== -1) {
          const updatedMessages = [...storedMessages];
          updatedMessages[messageIndex] = updatedMessage;
          // This is a hacky way to update the store, but it works for debugging
          clearMessages();
          updatedMessages.forEach(msg => addMessage(msg));
        }
      }
    }
  }, [storedMessages, clearMessages, addMessage]);

  // Debug component to show the raw response and parsed analysis
  const DebugPanel = () => {
    const lastAssistantMessage = [...storedMessages]
      .reverse()
      .find(msg => msg.role === 'assistant');

    return (
      <div className="mt-4 p-3 bg-yellow-50 rounded-md border border-yellow-200 text-xs">
        <details>
          <summary className="font-medium text-yellow-800 cursor-pointer">Debug Info</summary>
          <div className="mt-2 overflow-auto">
            <div className="mb-2">
              <h4 className="font-semibold mb-1">Raw Response:</h4>
              <pre className="whitespace-pre-wrap break-all text-[10px] bg-white p-2 rounded max-h-40 overflow-auto">
                {lastAssistantMessage?.content || "No response"}
              </pre>
            </div>
            <div>
              <h4 className="font-semibold mb-1">Parsed Analysis:</h4>
              <pre className="whitespace-pre-wrap break-all text-[10px] bg-white p-2 rounded max-h-40 overflow-auto">
                {analysis ? JSON.stringify(analysis, null, 2) : "No analysis parsed"}
              </pre>
            </div>
          </div>
        </details>
      </div>
    );
  };

  return (
    <div className="w-full h-[500px] bg-white rounded-lg flex flex-col">
      <div className="p-4 border-b flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">AI Assistant</h2>
          <p className="text-sm text-gray-600">Chat or upload an image to analyze UCP values</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-800 text-sm rounded-md transition"
          >
            {showHistory ? 'Hide History' : 'Show History'}
          </button>
          <button
            onClick={handleResetChat}
            className="flex items-center justify-center w-8 h-8 transition bg-red-100 rounded-lg hover:bg-red-200"
            title="Reset chat"
          >
            <RotateCcw className="w-4 h-4 text-red-600" />
          </button>
        </div>
      </div>

      {showHistory ? (
        <div className="flex-1 p-4 overflow-y-auto">
          <h3 className="text-lg font-semibold mb-3">Chat History</h3>
          {storedMessages.length === 0 ? (
            <p className="text-gray-500 text-center my-4">No chat history available</p>
          ) : (
            <div className="space-y-4">
              {storedMessages.map((message, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${message.role === 'user'
                    ? 'bg-blue-50 border-blue-100'
                    : 'bg-gray-50 border-gray-100'
                    }`}
                >
                  <div className="flex justify-between mb-1">
                    <span className="font-medium text-sm">
                      {message.role === 'user' ? 'You' : 'AI Assistant'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(message.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-sm whitespace-pre-wrap">
                    {message.content}
                  </div>
                  <button
                    onClick={() => copyToClipboard(message.content)}
                    className="mt-2 flex items-center text-xs text-blue-600 hover:text-blue-800"
                  >
                    <Copy className="w-3 h-3 mr-1" /> Copy to clipboard
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-1 overflow-hidden">
          {/* Chat section - Left side */}
          <div className="flex flex-col w-1/2 border-r">
            {/* Chat messages */}
            <div className="flex-1 p-4 overflow-y-auto">
              {storedMessages.map((message, index) => (
                <div
                  key={index}
                  className={`mb-4 ${message.role === 'user' ? 'text-right' : 'text-left'}`}
                >
                  <div
                    className={`inline-block p-3 rounded-lg max-w-[90%] ${message.role === 'user'
                      ? 'bg-blue-100 text-blue-900'
                      : 'bg-gray-100 text-gray-900'
                      }`}
                  >
                    <div className="whitespace-pre-wrap">{message.content}</div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex items-center justify-center">
                  <div className="text-gray-500 animate-pulse">
                    Processing...
                  </div>
                </div>
              )}
            </div>

            {/* Image preview area */}
            {imagePreview && (
              <div className="px-4 py-2 border-t">
                <div className="flex items-center">
                  <div className="relative w-16 h-16">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="object-cover w-full h-full rounded"
                    />
                    <button
                      onClick={clearImage}
                      className="absolute flex items-center justify-center w-5 h-5 text-white bg-red-500 rounded-full -top-2 -right-2"
                    >
                      ×
                    </button>
                  </div>
                  <span className="ml-2 text-sm text-gray-600">
                    Image uploaded and ready for analysis
                  </span>
                </div>
              </div>
            )}

            {/* Input area */}
            <div className="p-4 mt-auto border-t">
              <form onSubmit={handleSubmit} className="flex items-center gap-2">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                />
                <div className="flex-1">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your message or upload an image..."
                    className="w-full p-2 border rounded-lg resize-none"
                    rows={2}
                    disabled={isLoading}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleImageUploadClick}
                  className="flex items-center justify-center w-10 h-10 transition bg-gray-100 rounded-lg hover:bg-gray-200"
                  disabled={isLoading}
                >
                  <ImageIcon className="w-5 h-5 text-gray-600" />
                </button>
                <button
                  type="submit"
                  className="flex items-center justify-center w-10 h-10 text-white transition bg-blue-600 rounded-lg hover:bg-blue-700"
                  disabled={isLoading}
                >
                  <SendIcon className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
          {/* Analysis section - Right side */}
          <div className="flex flex-col w-1/2">
            <div className="p-4 border-b">
              <h3 className="font-semibold">Analysis Results</h3>
            </div>
            <div className="flex-1 p-4 overflow-y-auto">
              {analysis && (analysis.uaw || analysis.uucw) ? (
                <div className="p-4 rounded-lg bg-gray-50">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-white rounded-md shadow-sm">
                      <div className="mb-2 font-medium text-gray-800">UAW (Unadjusted Actor Weight):</div>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span>Simple:</span>
                          <span className="font-medium">{analysis.uaw?.simple ?? 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Average:</span>
                          <span className="font-medium">{analysis.uaw?.average ?? 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Complex:</span>
                          <span className="font-medium">{analysis.uaw?.complex ?? 0}</span>
                        </div>
                        <div className="flex justify-between border-t pt-1 mt-1">
                          <span>Total:</span>
                          <span className="font-bold">{analysis.uaw?.total ?? 0}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-white rounded-md shadow-sm">
                      <div className="mb-2 font-medium text-gray-800">UUCW (Unadjusted Use Case Weight):</div>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span>Simple:</span>
                          <span className="font-medium">{analysis.uucw?.simple ?? 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Average:</span>
                          <span className="font-medium">{analysis.uucw?.average ?? 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Complex:</span>
                          <span className="font-medium">{analysis.uucw?.complex ?? 0}</span>
                        </div>
                        <div className="flex justify-between border-t pt-1 mt-1">
                          <span>Total:</span>
                          <span className="font-bold">{analysis.uucw?.total ?? 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {(analysis.tcf?.factors && analysis.tcf.factors.length > 0) && (
                    <div className="mt-4 p-3 bg-white rounded-md shadow-sm">
                      <div className="mb-2 font-medium text-gray-800">TCF Factors:</div>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        {analysis.tcf.factors.map((factor: { id: number; value: number }) => (
                          <div key={factor.id} className="flex justify-between">
                            <span>Factor {factor.id}:</span>
                            <span className="font-medium">{factor.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {(analysis.ef?.factors && analysis.ef.factors.length > 0) && (
                    <div className="mt-4 p-3 bg-white rounded-md shadow-sm">
                      <div className="mb-2 font-medium text-gray-800">EF Factors:</div>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        {analysis.ef.factors.map((factor: { id: number; value: number }) => (
                          <div key={factor.id} className="flex justify-between">
                            <span>Factor {factor.id}:</span>
                            <span className="font-medium">{factor.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end w-full mt-4">
                    <button
                      onClick={handleInsertValues}
                      className="w-fit py-2.5 px-4 flex items-center justify-center font-medium text-white rounded-lg 
                      bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700
                      transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                      <ClipboardCheck className="w-5 h-5 mr-2" />
                      Insert Values into Form
                    </button>
                  </div>

                  {analysis.explanation && (
                    <div className="mt-4 p-3 bg-white rounded-md shadow-sm">
                      <div className="mb-2 font-medium text-gray-800">Explanation:</div>
                      <div className="text-sm whitespace-pre-wrap text-gray-700">
                        {analysis.explanation}
                      </div>
                    </div>
                  )}

                  {/* Add debug panel to assist with troubleshooting */}
                  {process.env.NODE_ENV !== 'production' && <DebugPanel />}
                </div>
              ) : error ? (
                <div className="p-4 text-center">
                  <div className="text-red-500">{error}</div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                  <p>No analysis results yet.</p>
                  <p className="text-sm mt-1">Chat with the AI or upload an image to get started.</p>
                  {/* Add debug panel in dev mode even if no analysis is available */}
                  {process.env.NODE_ENV !== 'production' && storedMessages.length > 0 && <DebugPanel />}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 