import React, { useState } from 'react';
import { Eye, X, Download, FileText, Loader2 } from 'lucide-react';

export default function DocumentPreview({ fileUrl, fileName, fileType, status }) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    const isImage = fileType?.match(/image\/*/);
    const isPdf = fileType === 'application/pdf' || fileName?.toLowerCase().endsWith('.pdf');

    // Pour les PDF, on utilise l'URL Cloudinary ou directe
    const getPdfUrl = () => {
        if (!fileUrl) return '';
        // Si c'est un PDF Cloudinary, on peut forcer l'affichage
        return fileUrl;
    };

    return (
        <>
            <button 
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-brand hover:text-white text-slate-600 rounded-xl transition-all font-bold text-xs"
            >
                <Eye className="h-4 w-4" /> Prévisualiser
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="relative w-full max-w-5xl h-[90vh] bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col">
                        {/* Header */}
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center">
                                    <FileText className="h-5 w-5" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-3">
                                        <h3 className="font-bold text-slate-900">{fileName}</h3>
                                        {status && (
                                            <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg ${
                                                status === 'verified' || status === 'vérifié' ? 'bg-emerald-100 text-emerald-700' :
                                                status === 'rejected' || status === 'rejeté' ? 'bg-red-100 text-red-700' :
                                                'bg-amber-100 text-amber-700'
                                            }`}>
                                                {(status === 'verified' || status === 'vérifié') ? 'Vérifié' : (status === 'rejected' || status === 'rejeté') ? 'Rejeté' : 'Vérification'}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{fileType}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <a 
                                    href={fileUrl} 
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-3 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-brand transition-all"
                                >
                                    <Download className="h-6 w-6" />
                                </a>
                                <button 
                                    onClick={() => setIsOpen(false)}
                                    className="p-3 hover:bg-red-50 rounded-xl text-slate-400 hover:text-red-500 transition-all"
                                >
                                    <X className="h-6 w-6" />
                                </button>
                            </div>
                        </div>

                        {/* Zone de contenu */}
                        <div className="flex-1 bg-slate-50 relative flex items-center justify-center overflow-auto p-4 md:p-8">
                            {loading && (
                                <div className="absolute inset-0 flex items-center justify-center bg-slate-50 z-10">
                                    <Loader2 className="h-10 w-10 animate-spin text-brand" />
                                </div>
                            )}
                            
                            {isImage ? (
                                <img 
                                    src={fileUrl} 
                                    alt={fileName} 
                                    className="max-w-full max-h-full object-contain shadow-lg rounded-[2rem]"
                                    onLoad={() => setLoading(false)}
                                />
                            ) : isPdf ? (
                                <div className="w-full h-full bg-white rounded-[2rem] shadow-xl overflow-hidden border border-slate-100">
                                    <iframe
                                        src={`https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`}
                                        className="w-full h-full"
                                        onLoad={() => setLoading(false)}
                                        title="PDF Preview"
                                    />
                                </div>
                            ) : (
                                <div className="text-center space-y-4">
                                    <div className="h-20 w-20 bg-white rounded-3xl flex items-center justify-center text-slate-200 mx-auto shadow-sm">
                                        <FileText className="h-10 w-10" />
                                    </div>
                                    <p className="text-slate-500 font-medium">Prévisualisation non disponible pour ce type de fichier.</p>
                                    <a href={fileUrl} download className="inline-block px-6 py-3 bg-brand text-white rounded-xl font-bold text-sm shadow-lg shadow-brand/20">
                                        Télécharger le document
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
