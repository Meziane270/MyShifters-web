import React, { useState, useCallback } from "react";
import { UploadCloud, Trash2, CheckCircle2, AlertCircle, Loader2, FileText } from "lucide-react";
import { toast } from "sonner";
import DocumentPreview from '../../../../components/shared/DocumentPreview';

// Types de documents autorisés
const DOCUMENT_TYPES = [
    { id: "identity", label: "Document d'identité", accept: ".pdf,.jpg,.jpeg,.png", maxSize: 5 * 1024 * 1024 },
    { id: "rib", label: "RIB", accept: ".pdf,.jpg,.jpeg,.png", maxSize: 5 * 1024 * 1024 },
    { id: "business_proof", label: "Avis de situation (AE)", accept: ".pdf,.jpg,.jpeg,.png", maxSize: 5 * 1024 * 1024 },
    { id: "cv", label: "Curriculum Vitae", accept: ".pdf,.jpg,.jpeg,.png", maxSize: 5 * 1024 * 1024 },
];

export default function DocumentList({ documents = [], onUpload, onDelete, saving = false }) {
    const [uploadingFor, setUploadingFor] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragType, setDragType] = useState(null);

    const handleDragOver = useCallback((e, type) => {
        e.preventDefault();
        setIsDragging(true);
        setDragType(type);
    }, []);

    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        setIsDragging(false);
        setDragType(null);
    }, []);

    const handleFiles = useCallback(async (files, type) => {
        const file = files[0];
        if (!file) return;

        const docType = DOCUMENT_TYPES.find(t => t.id === type);
        if (!docType) return;

        const allowedMime = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
        if (!allowedMime.includes(file.type)) {
            toast.error(`Le fichier doit être au format PDF, JPG ou PNG`);
            return;
        }

        if (file.size > docType.maxSize) {
            const maxSizeMB = docType.maxSize / (1024 * 1024);
            toast.error(`Le fichier ne doit pas dépasser ${maxSizeMB} Mo`);
            return;
        }

        setUploadingFor(type);
        try {
            await onUpload(file, type);
        } catch (error) {
            toast.error("Erreur lors de l'upload");
        } finally {
            setUploadingFor(null);
        }
    }, [onUpload]);

    const handleDrop = useCallback(async (e, type) => {
        e.preventDefault();
        setIsDragging(false);
        setDragType(null);
        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            await handleFiles(files, type);
        }
    }, [handleFiles]);

    const handleFileSelect = useCallback(async (e, type) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            await handleFiles(files, type);
        }
        e.target.value = null;
    }, [handleFiles]);

    const getDocumentByType = (type) => {
        return documents.find(doc => doc.type === type);
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'verified':
                return 'Vérifié';
            case 'rejected':
                return 'Rejeté';
            default:
                return 'Vérification';
        }
    };

    return (
        <div className="space-y-6">
            {DOCUMENT_TYPES.map((docType) => {
                const doc = getDocumentByType(docType.id);
                const isDraggingThis = isDragging && dragType === docType.id;
                const isUploading = uploadingFor === docType.id;

                return (
                    <div key={docType.id} className="space-y-2">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-sm font-black text-slate-700 uppercase tracking-wider">{docType.label}</h3>
                            {doc && (
                                <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                                    doc.status === 'verified' ? 'bg-emerald-100 text-emerald-700' :
                                    doc.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                    'bg-amber-100 text-amber-700'
                                }`}>
                                    {getStatusText(doc.status)}
                                </span>
                            )}
                        </div>
                        
                        <div
                            onDragOver={(e) => handleDragOver(e, docType.id)}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, docType.id)}
                            className={`
                                border-2 border-dashed rounded-[2rem] p-6 flex flex-col items-center justify-center text-center
                                transition-all duration-300
                                ${isDraggingThis
                                ? 'border-brand bg-brand/5 scale-[1.02]'
                                : doc
                                    ? 'border-emerald-100 bg-emerald-50/20'
                                    : 'border-slate-100 hover:border-brand/30 hover:bg-slate-50/50'
                            }
                            `}
                        >
                            {doc ? (
                                <div className="w-full flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${
                                            doc.status === 'verified' ? 'bg-emerald-100 text-emerald-600' :
                                            doc.status === 'rejected' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
                                        }`}>
                                            <FileText className="h-6 w-6" />
                                        </div>
                                        <div className="text-left">
                                            <p className="font-bold text-slate-900 text-sm truncate max-w-[150px]">
                                                {doc.file?.filename || docType.label}
                                            </p>
                                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                                                {doc.mime_type || 'Document'}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-2">
                                        <DocumentPreview 
                                            fileUrl={doc.url} 
                                            fileName={docType.label} 
                                            fileType={doc.mime_type || 'application/pdf'} 
                                            status={doc.status}
                                        />
                                        <button
                                            onClick={() => onDelete(doc.id)}
                                            disabled={saving}
                                            className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all disabled:opacity-30"
                                        >
                                            <Trash2 className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:text-brand transition-all">
                                        {isUploading ? (
                                            <Loader2 className="h-7 w-7 animate-spin text-brand" />
                                        ) : (
                                            <UploadCloud className="h-7 w-7" />
                                        )}
                                    </div>
                                    <div className="mt-4">
                                        <p className="text-sm font-bold text-slate-600">
                                            {isUploading ? "Upload en cours..." : "Glissez votre document ici"}
                                        </p>
                                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">
                                            PDF, JPG, PNG (MAX 5 MO)
                                        </p>
                                    </div>
                                    <input
                                        type="file"
                                        id={`file-upload-${docType.id}`}
                                        className="hidden"
                                        accept={docType.accept}
                                        onChange={(e) => handleFileSelect(e, docType.id)}
                                        disabled={uploadingFor !== null}
                                    />
                                    <label
                                        htmlFor={`file-upload-${docType.id}`}
                                        className="mt-6 px-6 py-3 bg-white border border-slate-200 rounded-xl text-xs font-black uppercase tracking-widest text-slate-600 hover:border-brand hover:text-brand transition-all shadow-sm cursor-pointer"
                                    >
                                        Choisir un fichier
                                    </label>
                                </>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
