import React, { useState } from 'react';
import {
  X,
  UploadCloud,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { Transaction } from '../types';
import { parseStatementTextWithAi } from '../services/api';
import { DEFAULT_CATEGORIES } from '../data/initialData';

interface SmartBatchImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportTransactions: (transactions: Array<Omit<Transaction, 'id'>>) => void;
  existingCategories?: string[];
}

export const SmartBatchImportModal: React.FC<SmartBatchImportModalProps> = ({
  isOpen,
  onClose,
  onImportTransactions,
  existingCategories = DEFAULT_CATEGORIES,
}) => {
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [extractedList, setExtractedList] = useState<Array<Omit<Transaction, 'id'>> | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleParse = async () => {
    if (!inputText.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      const results = await parseStatementTextWithAi(inputText, existingCategories);
      if (results && results.length > 0) {
        setExtractedList(results);
      } else {
        setError('No transactions could be extracted. Please verify input text.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to process statement text.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmImport = () => {
    if (extractedList && extractedList.length > 0) {
      onImportTransactions(extractedList);
      setInputText('');
      setExtractedList(null);
      onClose();
    }
  };

  const loadSampleStatement = () => {
    setInputText(
`08/12/2026 TARGET STORE T-1402 $64.50 (Shopping)
08/14/2026 STARBUCKS COFFEE #9822 $8.75 (Dining Out)
08/15/2026 CHEVRON GASOLINE $46.20 (Transportation)
08/16/2026 TRADER JOES GROCERY $92.40 (Groceries)
08/18/2026 NETFLIX.COM MONTHLY $22.99 (Subscription)
08/20/2026 APPLE.COM/BILL ICLOUD $9.99 (Utilities)
08/21/2026 FREELANCE CLIENT INVOICE +$850.00 (Income)`
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-2xl bg-slate-900 rounded-3xl shadow-2xl border border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">
                Statement & Receipt ML Extractor
              </h3>
              <p className="text-xs text-slate-400">
                Paste bank statements, logs, or receipt text for instant auto-categorization
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {!extractedList ? (
            <>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Raw Bank Statement / Receipt Text
                  </label>
                  <button
                    type="button"
                    onClick={loadSampleStatement}
                    className="text-xs font-bold text-emerald-400 hover:text-emerald-300 hover:underline"
                  >
                    Load Sample Statement Data
                  </button>
                </div>
                <textarea
                  id="textarea-batch-input"
                  rows={8}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Paste statement excerpts, receipt lines, or raw text here...&#10;&#10;Example:&#10;Trader Joes 8/12 $54.20&#10;Chevron Gas $45&#10;Netflix subscription $22.99"
                  className="w-full p-3.5 text-xs sm:text-sm font-mono text-white bg-slate-950/70 border border-slate-800 rounded-2xl focus:border-emerald-500 focus:outline-none placeholder-slate-600"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-rose-500/10 text-rose-300 text-xs border border-rose-500/30">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  Extracted {extractedList.length} Transactions
                </span>
                <button
                  onClick={() => setExtractedList(null)}
                  className="text-xs text-emerald-400 hover:text-emerald-300 underline font-bold"
                >
                  Edit Input Text
                </button>
              </div>

              <div className="border border-slate-800 rounded-2xl divide-y divide-slate-800/80 max-h-72 overflow-y-auto bg-slate-950/40">
                {extractedList.map((item, idx) => (
                  <div key={idx} className="p-3.5 flex items-center justify-between text-xs hover:bg-slate-800/40">
                    <div className="space-y-0.5">
                      <div className="font-bold text-white">{item.description}</div>
                      <div className="flex items-center gap-2 text-slate-400">
                        <span>{item.date}</span>
                        <span>•</span>
                        <span className="px-2 py-0.2 rounded-md bg-slate-800 font-bold text-slate-300">
                          {item.category}
                        </span>
                        {item.isRecurring && (
                          <span className="px-2 py-0.2 rounded-md bg-indigo-500/20 text-indigo-300 font-bold">
                            Recurring
                          </span>
                        )}
                      </div>
                    </div>
                    <div className={`font-black text-sm ${item.type === 'income' ? 'text-emerald-400' : 'text-white'}`}>
                      {item.type === 'income' ? '+' : '-'}${item.amount.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-950/40 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white rounded-xl"
          >
            Cancel
          </button>

          {!extractedList ? (
            <button
              id="btn-run-batch-parse"
              onClick={handleParse}
              disabled={isLoading || !inputText.trim()}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-slate-950 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 rounded-2xl shadow-md shadow-emerald-500/20 transition-all"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Extracting with ML...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Extract & Auto-Categorize</span>
                </>
              )}
            </button>
          ) : (
            <button
              id="btn-confirm-batch-import"
              onClick={handleConfirmImport}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-slate-950 bg-emerald-500 hover:bg-emerald-400 rounded-2xl shadow-md shadow-emerald-500/20 transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Import All {extractedList.length} Items</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
