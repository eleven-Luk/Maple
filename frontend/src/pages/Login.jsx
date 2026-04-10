import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faEye, 
    faEyeSlash, 
    faEnvelope, 
    faLock,
    faArrowRight,
    faKey,
    faClock,
    faSpinner,
    faShieldAlt,
    faArrowLeft,
    faUser,
    faCheckCircle,
    faLaptop
} from '@fortawesome/free-solid-svg-icons';

function Login() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        otp: ['', '', '', '', '', '']
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [requiresOTP, setRequiresOTP] = useState(false);
    const [resendTimer, setResendTimer] = useState(0);
    const [resendLoading, setResendLoading] = useState(false);
    const [rememberDevice, setRememberDevice] = useState(true); // Default to true
    const [emailFocused, setEmailFocused] = useState(false);
    const [passwordFocused, setPasswordFocused] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        let timer;
        if (resendTimer > 0) {
            timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [resendTimer]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
        setError('');
    };

    const handleOTPChange = (index, value) => {
        if (value.length <= 1 && /^\d*$/.test(value)) {
            const newOTP = [...formData.otp];
            newOTP[index] = value;
            setFormData({ ...formData, otp: newOTP });
            
            if (value && index < 5) {
                const nextInput = document.getElementById(`otp-${index + 1}`);
                if (nextInput) nextInput.focus();
            }
        }
    };

    const handleResendOTP = async () => {
        if (resendTimer > 0) return;
        
        setResendLoading(true);
        try {
            const response = await axios.post('http://localhost:5000/api/auth/resend-otp', {
                email: formData.email
            });
            
            if (response.data.success) {
                setSuccess('Verification code sent successfully');
                setResendTimer(60);
                setTimeout(() => setSuccess(''), 3000);
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to resend code');
            setTimeout(() => setError(''), 3000);
        } finally {
            setResendLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const payload = {
                email: formData.email,
                password: formData.password
            };
            
            if (requiresOTP) {
                const otpValue = formData.otp.join('');
                if (otpValue.length !== 6) {
                    setError('Please enter the 6-digit verification code');
                    setLoading(false);
                    return;
                }
                payload.otp = otpValue;
                payload.rememberDevice = rememberDevice; // Send remember device preference
            }
            
            const response = await axios.post('http://localhost:5000/api/auth/login', payload);
            
            if (response.data.requiresOTP) {
                setRequiresOTP(true);
                setSuccess(response.data.message || 'Verification code sent to your email');
                setTimeout(() => setSuccess(''), 5000);
            } else if (response.data.success) {
                localStorage.setItem('token', response.data.token);
                navigate('/maple-admin');
            }
            
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Login failed';
            setError(errorMessage);
        } finally { 
            setLoading(false);
        }
    };

    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const goToHomepage = () => {
        navigate('/main');
    };

    return (
        <div className='min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-6'>
            {/* Back Button */}
            <div className='fixed top-4 left-4 md:top-6 md:left-6 z-20'>
                <button
                    onClick={goToHomepage}
                    className='flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-600 px-3 py-2 rounded-lg shadow-sm border border-gray-200 transition-all duration-200 text-sm hover:shadow'
                >
                    <FontAwesomeIcon icon={faArrowLeft} className='w-4 h-4' />
                    <span>Back</span>
                </button>
            </div>

            <div className='max-w-md w-full'>
                {/* Header */}
                <div className='text-center mb-8'>
                    <div className='w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center mx-auto mb-4'>
                        <FontAwesomeIcon icon={faUser} className="text-white text-xl" />
                    </div>
                    <h1 className="text-2xl font-semibold text-gray-900 mb-1">
                        Welcome back
                    </h1>
                    <p className="text-sm text-gray-500">
                        Sign in to your account
                    </p>
                </div>

                {/* Form Card */}
                <div className='bg-white rounded-lg shadow-sm border border-gray-100'>
                    <div className='p-6 md:p-8'>
                        {/* Messages */}
                        {error && (
                            <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-lg">
                                <p className="text-red-600 text-sm text-center">{error}</p>
                            </div>
                        )}

                        {success && (
                            <div className="mb-6 p-3 bg-green-50 border border-green-100 rounded-lg">
                                <p className="text-green-600 text-sm text-center">{success}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className='space-y-5'>
                            {/* Email Field */}
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-2'>
                                    Email address
                                </label>
                                <div className={`relative transition-all duration-200 ${emailFocused ? 'ring-2 ring-gray-200' : ''}`}>
                                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                        <FontAwesomeIcon icon={faEnvelope} className="text-sm" />
                                    </div>
                                    <input 
                                        type="email" 
                                        name="email"
                                        value={formData.email}
                                        placeholder="you@example.com"
                                        required
                                        disabled={loading || requiresOTP}
                                        onChange={handleChange}
                                        onFocus={() => setEmailFocused(true)}
                                        onBlur={() => setEmailFocused(false)}
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-gray-900 text-sm focus:outline-none focus:border-gray-300 transition-colors disabled:opacity-50 disabled:bg-gray-50"
                                    />
                                </div>
                            </div>

                            {/* Password or OTP Field */}
                            {!requiresOTP ? (
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                                        Password
                                    </label>
                                    <div className={`relative transition-all duration-200 ${passwordFocused ? 'ring-2 ring-gray-200' : ''}`}>
                                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                            <FontAwesomeIcon icon={faLock} className="text-sm" />
                                        </div>
                                        <input 
                                            type={showPassword ? 'text' : 'password'} 
                                            name="password" 
                                            value={formData.password}
                                            placeholder="Enter your password"
                                            required
                                            disabled={loading}
                                            onChange={handleChange}
                                            onFocus={() => setPasswordFocused(true)}
                                            onBlur={() => setPasswordFocused(false)}
                                            className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-lg text-gray-900 text-sm focus:outline-none focus:border-gray-300 transition-colors disabled:opacity-50"
                                        />
                                        <button 
                                            type="button"
                                            onClick={toggleShowPassword}
                                            disabled={loading}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                        >
                                            <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} className="text-sm" />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div>
                                        <label className='block text-sm font-medium text-gray-700 mb-2'>
                                            Verification code
                                        </label>
                                        <div className='flex gap-2 justify-center mb-3'>
                                            {formData.otp.map((digit, index) => (
                                                <input
                                                    key={index}
                                                    id={`otp-${index}`}
                                                    type="text"
                                                    maxLength="1"
                                                    value={digit}
                                                    onChange={(e) => handleOTPChange(index, e.target.value)}
                                                    className="w-10 h-12 text-center text-lg font-medium border border-gray-200 rounded-lg focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-200 transition-all"
                                                    autoFocus={index === 0}
                                                />
                                            ))}
                                        </div>
                                        <div className='flex justify-center'>
                                            <button
                                                type="button"
                                                onClick={handleResendOTP}
                                                disabled={resendTimer > 0 || resendLoading}
                                                className="text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50 transition-colors"
                                            >
                                                {resendLoading ? (
                                                    <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                                                ) : resendTimer > 0 ? (
                                                    <span>Resend code in {resendTimer}s</span>
                                                ) : (
                                                    'Resend code'
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Remember this device checkbox */}
                                    <div className="flex items-center gap-2 pt-2">
                                        <input
                                            type="checkbox"
                                            id="rememberDevice"
                                            checked={rememberDevice}
                                            onChange={(e) => setRememberDevice(e.target.checked)}
                                            className="w-4 h-4 text-gray-600 rounded border-gray-300 focus:ring-gray-500"
                                        />
                                        <label htmlFor="rememberDevice" className="text-sm text-gray-600 cursor-pointer">
                                            <FontAwesomeIcon icon={faLaptop} className="mr-1 text-xs" />
                                            Remember this device for 1 day
                                        </label>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1">
                                        You won't need to enter a verification code on this device for 1 day
                                    </p>
                                </>
                            )}

                            {/* Submit Button */}
                            <button 
                                type="submit" 
                                disabled={loading}
                                className="w-full py-2.5 mt-2 bg-gray-900 hover:bg-gray-800 rounded-lg text-white text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>{requiresOTP ? 'Verifying...' : 'Signing in...'}</span>
                                    </>
                                ) : (
                                    <>
                                        <span>{requiresOTP ? 'Verify & sign in' : 'Sign in'}</span>
                                        <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Footer */}
                        <div className='mt-6 pt-5 border-t border-gray-100 text-center'>
                            <p className='text-xs text-gray-400 flex items-center justify-center gap-1'>
                                <FontAwesomeIcon icon={faShieldAlt} className="text-gray-300" />
                                <span>Secure login with two-factor authentication</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;