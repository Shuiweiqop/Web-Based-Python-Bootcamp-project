import { useState } from 'react';
import { useForm, Head } from '@inertiajs/react';
import { Mail, Lock, Sparkles, AlertCircle, CheckCircle, ArrowRight, Send, ShieldCheck } from 'lucide-react';

export default function VerifyOtp({ email }) {
    const [step, setStep] = useState('send'); // 'send' or 'verify'

    const sendForm = useForm({
        email: email || '',
    });

    const verifyForm = useForm({
        email: email || '',
        otp: '',
    });

    const sendOtp = (e) => {
        e.preventDefault();
        sendForm.post(route('otp.send'), {
            onSuccess: () => {
                setStep('verify');
            },
        });
    };

    const verifyOtp = (e) => {
        e.preventDefault();
        verifyForm.post(route('otp.verify'));
    };

    const handleKeyPress = (e, form) => {
        if (e.key === 'Enter') {
            if (step === 'send') {
                sendOtp(e);
            } else if (verifyForm.data.otp.length === 6) {
                verifyOtp(e);
            }
        }
    };

    return (
        <>
            <Head title={step === 'send' ? 'Send OTP' : 'Verify OTP'} />

            <div className="min-h-screen relative overflow-hidden">
                {/* Animated Background */}
                <div className="fixed inset-0 -z-10">
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900" />
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                    <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
                    <div className="absolute inset-0 bg-black/40" />
                </div>

                {/* Content */}
                <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
                    <div className="w-full max-w-lg">
                        
                        {/* Logo/Brand */}
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4 shadow-2xl animate-float">
                                {step === 'send' ? (
                                    <Send className="w-10 h-10 text-white drop-shadow-[0_4px_12px_rgba(255,255,255,0.5)]" strokeWidth={2.5} />
                                ) : (
                                    <ShieldCheck className="w-10 h-10 text-white drop-shadow-[0_4px_12px_rgba(255,255,255,0.5)]" strokeWidth={2.5} />
                                )}
                            </div>
                            <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
                                {step === 'send' ? 'Send Verification Code' : 'Verify Your Email'}
                            </h1>
                            <p className="text-gray-100 drop-shadow-lg text-base">
                                {step === 'send' 
                                    ? 'Enter your email to receive a verification code'
                                    : 'Enter the 6-digit code sent to your email'
                                }
                            </p>
                        </div>

                        {/* Progress Indicator */}
                        <div className="mb-8 flex items-center justify-center space-x-4">
                            <div className={`flex items-center space-x-2 ${step === 'send' ? 'opacity-100' : 'opacity-50'}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                                    step === 'send' 
                                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' 
                                        : 'bg-white/20 text-white'
                                }`}>
                                    1
                                </div>
                                <span className="text-white text-sm font-medium drop-shadow-lg">Send Code</span>
                            </div>
                            
                            <div className="w-12 h-0.5 bg-white/20">
                                <div className={`h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-500 ${
                                    step === 'verify' ? 'w-full' : 'w-0'
                                }`} />
                            </div>
                            
                            <div className={`flex items-center space-x-2 ${step === 'verify' ? 'opacity-100' : 'opacity-50'}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                                    step === 'verify' 
                                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' 
                                        : 'bg-white/20 text-white'
                                }`}>
                                    2
                                </div>
                                <span className="text-white text-sm font-medium drop-shadow-lg">Verify</span>
                            </div>
                        </div>

                        {/* Card */}
                        <div className="bg-black/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
                            
                            {step === 'send' ? (
                                /* Send OTP Form */
                                <form onSubmit={sendOtp} className="p-8">
                                    <div className="mb-6">
                                        <label htmlFor="email" className="block text-sm font-semibold text-white mb-2 drop-shadow-lg">
                                            Email Address
                                        </label>
                                        <div className="relative group">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-purple-400 transition-colors drop-shadow-lg z-10" />
                                            <input
                                                id="email"
                                                type="email"
                                                name="email"
                                                value={sendForm.data.email}
                                                onChange={(e) => sendForm.setData('email', e.target.value)}
                                                onKeyPress={(e) => handleKeyPress(e, sendForm)}
                                                className={`
                                                    w-full pl-12 pr-4 py-4
                                                    bg-white/10 border-2 rounded-xl
                                                    text-white placeholder-gray-400
                                                    focus:outline-none focus:ring-2 focus:ring-purple-500/50
                                                    transition-all duration-200
                                                    ${sendForm.errors.email ? 'border-red-500/50' : 'border-white/20 focus:border-purple-500/50'}
                                                    backdrop-blur-sm
                                                    font-medium text-base
                                                    shadow-lg
                                                `}
                                                placeholder="your.email@example.com"
                                                autoFocus
                                                required
                                            />
                                        </div>
                                        {sendForm.errors.email && (
                                            <p className="mt-2 text-sm text-red-400 flex items-center space-x-1">
                                                <AlertCircle className="w-4 h-4" />
                                                <span>{sendForm.errors.email}</span>
                                            </p>
                                        )}
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={sendForm.processing}
                                        className="
                                            w-full py-4 rounded-xl font-bold text-white text-lg
                                            bg-gradient-to-r from-blue-500 to-purple-600
                                            hover:from-blue-600 hover:to-purple-700
                                            disabled:opacity-50 disabled:cursor-not-allowed
                                            shadow-xl hover:shadow-2xl
                                            transition-all duration-200
                                            hover:scale-105 active:scale-95
                                            flex items-center justify-center space-x-2
                                            relative overflow-hidden
                                            group
                                            border border-white/30
                                        "
                                    >
                                        <span className="relative z-10 flex items-center space-x-2 drop-shadow-lg">
                                            {sendForm.processing ? (
                                                <>
                                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                    <span>Sending Code...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="w-5 h-5" />
                                                    <span>Send Verification Code</span>
                                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                                </>
                                            )}
                                        </span>
                                        
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent 
                                                      translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                                    </button>
                                </form>
                            ) : (
                                /* Verify OTP Form */
                                <form onSubmit={verifyOtp} className="p-8">
                                    <div className="mb-6">
                                        <label htmlFor="otp" className="block text-sm font-semibold text-white mb-4 text-center drop-shadow-lg">
                                            Enter 6-Digit Verification Code
                                        </label>
                                        <p className="text-center text-gray-300 text-sm mb-4 drop-shadow-lg">
                                            Code sent to: <span className="font-bold text-white">{verifyForm.data.email}</span>
                                        </p>
                                        <div className="relative group">
                                            <input
                                                id="otp"
                                                type="text"
                                                name="otp"
                                                value={verifyForm.data.otp}
                                                onChange={(e) => {
                                                    const value = e.target.value.replace(/\D/g, '');
                                                    verifyForm.setData('otp', value);
                                                }}
                                                onKeyPress={(e) => handleKeyPress(e, verifyForm)}
                                                maxLength={6}
                                                className={`
                                                    w-full px-4 py-6
                                                    bg-white/10 border-2 rounded-xl
                                                    text-white placeholder-gray-400
                                                    focus:outline-none focus:ring-2 focus:ring-purple-500/50
                                                    transition-all duration-200
                                                    ${verifyForm.errors.otp ? 'border-red-500/50' : 'border-white/20 focus:border-purple-500/50'}
                                                    backdrop-blur-sm
                                                    font-bold text-4xl text-center tracking-[0.5em]
                                                    shadow-lg
                                                `}
                                                placeholder="• • • • • •"
                                                autoFocus
                                                required
                                            />
                                            
                                            {verifyForm.data.otp.length === 6 && !verifyForm.errors.otp && (
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                                    <CheckCircle className="w-8 h-8 text-green-400 animate-pulse" />
                                                </div>
                                            )}
                                        </div>
                                        {verifyForm.errors.otp && (
                                            <p className="mt-2 text-sm text-red-400 flex items-center justify-center space-x-1">
                                                <AlertCircle className="w-4 h-4" />
                                                <span>{verifyForm.errors.otp}</span>
                                            </p>
                                        )}
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={verifyForm.processing || verifyForm.data.otp.length !== 6}
                                        className="
                                            w-full py-4 rounded-xl font-bold text-white text-lg
                                            bg-gradient-to-r from-blue-500 to-purple-600
                                            hover:from-blue-600 hover:to-purple-700
                                            disabled:opacity-50 disabled:cursor-not-allowed
                                            shadow-xl hover:shadow-2xl
                                            transition-all duration-200
                                            hover:scale-105 active:scale-95
                                            flex items-center justify-center space-x-2
                                            relative overflow-hidden
                                            group
                                            border border-white/30
                                            mb-4
                                        "
                                    >
                                        <span className="relative z-10 flex items-center space-x-2 drop-shadow-lg">
                                            {verifyForm.processing ? (
                                                <>
                                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                    <span>Verifying...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircle className="w-5 h-5" />
                                                    <span>Verify Code</span>
                                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                                </>
                                            )}
                                        </span>
                                        
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent 
                                                      translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setStep('send')}
                                        className="
                                            w-full py-3 rounded-xl font-semibold text-base
                                            bg-white/10 hover:bg-white/15
                                            border-2 border-white/20 hover:border-white/30
                                            text-white
                                            transition-all duration-200
                                            hover:scale-105 active:scale-95
                                        "
                                    >
                                        Resend Verification Code
                                    </button>
                                </form>
                            )}

                            {/* Info Section */}
                            <div className="px-8 pb-8">
                                <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-2xl p-5 backdrop-blur-sm shadow-lg">
                                    <div className="flex items-start space-x-3">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/30 to-purple-500/30 flex items-center justify-center flex-shrink-0 border border-blue-500/40">
                                            <Lock className="w-5 h-5 text-blue-300 drop-shadow-lg" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-bold text-white mb-2 drop-shadow-lg">Security Tips</p>
                                            <ul className="space-y-2 text-xs text-blue-200">
                                                <li className="flex items-start space-x-2">
                                                    <span className="text-blue-400 mt-0.5 font-bold">•</span>
                                                    <span className="font-medium drop-shadow-lg">Never share your verification code with anyone</span>
                                                </li>
                                                <li className="flex items-start space-x-2">
                                                    <span className="text-blue-400 mt-0.5 font-bold">•</span>
                                                    <span className="font-medium drop-shadow-lg">The code expires in 10 minutes</span>
                                                </li>
                                                <li className="flex items-start space-x-2">
                                                    <span className="text-blue-400 mt-0.5 font-bold">•</span>
                                                    <span className="font-medium drop-shadow-lg">Check your spam folder if you don't see the email</span>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Custom Styles */}
                <style>{`
                    @keyframes float {
                        0%, 100% { transform: translateY(0px) rotate(0deg); }
                        50% { transform: translateY(-20px) rotate(5deg); }
                    }
                    
                    .animate-float {
                        animation: float 6s ease-in-out infinite;
                    }
                `}</style>
            </div>
        </>
    );
}