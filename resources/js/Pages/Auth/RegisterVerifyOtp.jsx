import { useState, useEffect } from 'react';
import { useForm, Head, Link } from '@inertiajs/react';
import { Mail, Sparkles, AlertCircle, CheckCircle, ArrowRight, Clock, RefreshCw, ArrowLeft, Info } from 'lucide-react';

export default function RegisterVerifyOtp({ email }) {
    const [countdown, setCountdown] = useState(60);

    const { data, setData, post, processing, errors, reset } = useForm({
        otp: '',
    });

    const resendForm = useForm({});

    // 倒计时功能
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    const submit = (e) => {
        e.preventDefault();
        post(route('register.verify-otp.submit'));
    };

    const resendOtp = () => {
        resendForm.post(route('register.resend-otp'), {
            onSuccess: () => {
                setCountdown(60);
                reset('otp');
            },
        });
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && data.otp.length === 6) {
            submit(e);
        }
    };

    return (
        <>
            <Head title="Verify OTP - Complete Registration" />

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
                                <Mail className="w-10 h-10 text-white drop-shadow-[0_4px_12px_rgba(255,255,255,0.5)]" strokeWidth={2.5} />
                            </div>
                            <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
                                Verify Your Email
                            </h1>
                            <p className="text-gray-100 drop-shadow-lg text-base mb-2">
                                We've sent a 6-digit verification code to
                            </p>
                            <p className="text-white font-bold text-lg drop-shadow-lg">
                                {email}
                            </p>
                        </div>

                        {/* OTP Card */}
                        <div className="bg-black/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
                            
                            {/* Form */}
                            <form onSubmit={submit} className="p-8">
                                
                                {/* OTP Input */}
                                <div className="mb-6">
                                    <label htmlFor="otp" className="block text-sm font-semibold text-white mb-4 text-center drop-shadow-lg">
                                        Enter 6-Digit Verification Code
                                    </label>
                                    <div className="relative group">
                                        <input
                                            id="otp"
                                            type="text"
                                            name="otp"
                                            value={data.otp}
                                            onChange={(e) => {
                                                const value = e.target.value.replace(/\D/g, ''); // Only allow digits
                                                setData('otp', value);
                                            }}
                                            onKeyPress={handleKeyPress}
                                            maxLength={6}
                                            autoComplete="off"
                                            className={`
                                                w-full px-4 py-6
                                                bg-white/10 border-2 rounded-xl
                                                text-white placeholder-gray-400
                                                focus:outline-none focus:ring-2 focus:ring-purple-500/50
                                                transition-all duration-200
                                                ${errors.otp ? 'border-red-500/50' : 'border-white/20 focus:border-purple-500/50'}
                                                backdrop-blur-sm
                                                font-bold text-4xl text-center tracking-[0.5em]
                                                shadow-lg
                                            `}
                                            placeholder="• • • • • •"
                                            autoFocus
                                            required
                                        />
                                        
                                        {/* Visual feedback */}
                                        {data.otp.length === 6 && !errors.otp && (
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                                <CheckCircle className="w-8 h-8 text-green-400 animate-pulse" />
                                            </div>
                                        )}
                                    </div>
                                    {errors.otp && (
                                        <p className="mt-2 text-sm text-red-400 flex items-center justify-center space-x-1">
                                            <AlertCircle className="w-4 h-4" />
                                            <span>{errors.otp}</span>
                                        </p>
                                    )}
                                </div>

                                {/* Resend Section */}
                                <div className="mb-6 p-4 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-300 drop-shadow-lg">
                                            Didn't receive the code?
                                        </span>
                                        
                                        {countdown > 0 ? (
                                            <div className="flex items-center space-x-2 text-gray-400">
                                                <Clock className="w-4 h-4 animate-pulse" />
                                                <span className="text-sm font-semibold">
                                                    Resend in {countdown}s
                                                </span>
                                            </div>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={resendOtp}
                                                disabled={resendForm.processing}
                                                className="
                                                    flex items-center space-x-2
                                                    text-purple-400 hover:text-purple-300 
                                                    font-semibold text-sm
                                                    transition-colors
                                                    disabled:opacity-50
                                                "
                                            >
                                                <RefreshCw className={`w-4 h-4 ${resendForm.processing ? 'animate-spin' : ''}`} />
                                                <span>{resendForm.processing ? 'Sending...' : 'Resend Code'}</span>
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Verify Button */}
                                <button
                                    type="submit"
                                    disabled={processing || data.otp.length !== 6}
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
                                        {processing ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                <span>Verifying...</span>
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle className="w-5 h-5" />
                                                <span>Verify & Complete Registration</span>
                                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                            </>
                                        )}
                                    </span>
                                    
                                    {/* Button shimmer effect */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent 
                                                  translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                                </button>

                                {/* Back to Registration */}
                                <div className="mt-6 text-center">
                                    <Link
                                        href={route('register')}
                                        className="
                                            inline-flex items-center space-x-2
                                            text-gray-300 hover:text-white
                                            transition-colors
                                            group
                                        "
                                    >
                                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                                        <span className="text-sm font-medium drop-shadow-lg">Back to Registration</span>
                                    </Link>
                                </div>
                            </form>

                            {/* Tips Section */}
                            <div className="px-8 pb-8">
                                <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-2xl p-5 backdrop-blur-sm shadow-lg">
                                    <div className="flex items-start space-x-3">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/30 to-purple-500/30 flex items-center justify-center flex-shrink-0 border border-blue-500/40">
                                            <Info className="w-5 h-5 text-blue-300 drop-shadow-lg" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-bold text-white mb-2 drop-shadow-lg">Verification Tips</p>
                                            <ul className="space-y-2 text-xs text-blue-200">
                                                <li className="flex items-start space-x-2">
                                                    <span className="text-blue-400 mt-0.5 font-bold">•</span>
                                                    <span className="font-medium drop-shadow-lg">Check your spam folder if you don't see the email</span>
                                                </li>
                                                <li className="flex items-start space-x-2">
                                                    <span className="text-blue-400 mt-0.5 font-bold">•</span>
                                                    <span className="font-medium drop-shadow-lg">The code expires in 10 minutes</span>
                                                </li>
                                                <li className="flex items-start space-x-2">
                                                    <span className="text-blue-400 mt-0.5 font-bold">•</span>
                                                    <span className="font-medium drop-shadow-lg">Make sure to enter the code exactly as shown</span>
                                                </li>
                                                <li className="flex items-start space-x-2">
                                                    <span className="text-blue-400 mt-0.5 font-bold">•</span>
                                                    <span className="font-medium drop-shadow-lg">Request a new code if it doesn't arrive</span>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="text-center mt-8">
                            <p className="text-sm text-gray-300 font-medium drop-shadow-lg">
                                Need help? <Link href="/support" className="text-purple-400 hover:text-purple-300">Contact Support</Link>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Custom Styles */}
                <style>{`
                    @keyframes float {
                        0%, 100% { transform: translateY(0px) rotate(0deg); }
                        50% { transform: translateY(-20px) rotate(5deg); }
                    }
                    
                    @keyframes slideDown {
                        from {
                            opacity: 0;
                            transform: translateY(-10px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }
                    
                    .animate-float {
                        animation: float 6s ease-in-out infinite;
                    }
                    
                    .animate-slideDown {
                        animation: slideDown 0.3s ease-out;
                    }
                    
                    /* Hide number input arrows */
                    input[type="text"]::-webkit-inner-spin-button,
                    input[type="text"]::-webkit-outer-spin-button {
                        -webkit-appearance: none;
                        margin: 0;
                    }
                `}</style>
            </div>
        </>
    );
}