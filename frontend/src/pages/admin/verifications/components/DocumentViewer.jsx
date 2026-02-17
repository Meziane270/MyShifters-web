// src/pages/admin/verifications/components/DocumentViewer.jsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../../components/ui/dialog";
import { Button } from "../../../../components/ui/button";
import { Download, X, FileText, FileImage } from "lucide-react";

export default function DocumentViewer({ document, isOpen, onClose }) {
    if (!document || !document.file) return null;

    const { file } = document;
    const isPDF = file.content_type === 'application/pdf';
    const isImage = file.content_type?.startsWith('image/');

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = `data:${file.content_type};base64,${file.data_base64}`;
        link.download = file.filename;
        link.click();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl bg-card border-border">
                <DialogHeader>
                    <DialogTitle className="flex items-center justify-between text-foreground">
                        <div className="flex items-center gap-2">
                            {isPDF ? <FileText className="w-5 h-5" /> : <FileImage className="w-5 h-5" />}
                            <span>{file.filename}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                size="sm"
                                variant="outline"
                                className="border-border"
                                onClick={handleDownload}
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Télécharger
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={onClose}
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    </DialogTitle>
                </DialogHeader>

                <div className="mt-4 bg-background rounded-lg overflow-hidden" style={{ maxHeight: '70vh' }}>
                    {isPDF ? (
                        <iframe
                            src={`data:${file.content_type};base64,${file.data_base64}`}
                            className="w-full h-full min-h-[500px]"
                            title={file.filename}
                        />
                    ) : isImage ? (
                        <img
                            src={`data:${file.content_type};base64,${file.data_base64}`}
                            alt={file.filename}
                            className="w-full h-auto"
                        />
                    ) : (
                        <div className="p-8 text-center text-foreground/70">
                            <FileText className="w-12 h-12 mx-auto mb-3 text-foreground/30" />
                            <p>Aperçu non disponible</p>
                            <Button
                                variant="outline"
                                className="mt-4 border-border"
                                onClick={handleDownload}
                            >
                                Télécharger le fichier
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}