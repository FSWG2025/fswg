import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Send } from "lucide-react";
import { toast } from "sonner";

interface EmailModalProps {
    isOpen: boolean;
    onClose: () => void;
    recipient: string;
    defaultSubject?: string;
    defaultBody?: string;
}

const EmailModal = ({ isOpen, onClose, recipient, defaultSubject = "", defaultBody = "" }: EmailModalProps) => {
    const [subject, setSubject] = useState(defaultSubject);
    const [body, setBody] = useState(defaultBody);

    const handleSend = () => {
        // Opens the user's default mail client
        const mailto = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.location.href = mailto;
        toast.success("Email client opened");
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
                        transition={{ duration: 0.3 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto p-6 relative"
                    >
                        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                            <X className="w-4 h-4 text-gray-600" />
                        </button>
                        <div className="flex items-center gap-2 mb-4">
                            <Mail className="w-5 h-5 text-[#C69259]" />
                            <h2 className="text-xl font-bold text-[#12213E]">Send Email</h2>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <label className="text-sm text-gray-500">To</label>
                                <p className="font-medium">{recipient}</p>
                            </div>
                            <div>
                                <label className="text-sm text-gray-500">Subject</label>
                                <input
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    className="w-full mt-1 px-3 py-2 border rounded-lg text-sm"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-500">Message</label>
                                <textarea
                                    value={body}
                                    onChange={(e) => setBody(e.target.value)}
                                    rows={6}
                                    className="w-full mt-1 px-3 py-2 border rounded-lg text-sm resize-none"
                                />
                            </div>
                            <button onClick={handleSend} className="w-full py-2 bg-[#C69259] text-white rounded-full font-semibold flex items-center justify-center gap-2">
                                <Send className="w-4 h-4" /> Open Email Client
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default EmailModal;