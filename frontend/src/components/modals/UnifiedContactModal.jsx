import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faEnvelope,
    faPaperPlane,
    faUser,
    faMessage,
    faCamera,
    faPhone,
    faCheckCircle,
    faExclamationCircle,
    faBox,
    faShieldAlt
} from '@fortawesome/free-solid-svg-icons';
import BaseModal from '../modals/common/BaseModal.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';

function UnifiedContactModal({ isOpen, onClose }) {
    const [formData, setFormData] = useState({
        inquiryType: 'general',
        name: '',
        phone: '',
        email: '',
        message: '',
        packageType: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setFormData({
                inquiryType: 'general',
                name: '',
                phone: '',
                email: '',
                message: '',
                packageType: ''
            });
            setError('');
            setSuccess('');
            setAuthorized(false);
        }
    }, [isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (error) setError('');
    };

    const validateForm = () => {
        if (!formData.name.trim()) {
            setError('Please enter your name');
            return false;
        }
        if (!formData.email.trim()) {
            setError('Please enter your email');
            return false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            setError('Please enter a valid email address');
            return false;
        }
        if (!formData.phone.trim()) {
            setError('Please enter your phone number');
            return false;
        }
        if (!formData.message.trim()) {
            setError('Please enter your message');
            return false;
        }
        
        if (!authorized) {
            setError('Please authorize to proceed');
            return false;
        }
        
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);
        setError('');

        try {
            const requestData = {
                name: formData.name,
                phone: formData.phone,
                email: formData.email,
                message: formData.message,
                businessType: 'maple',
                inquiryType: formData.inquiryType,
            };
            
            if (formData.packageType && formData.packageType.trim()) {
                requestData.packageType = formData.packageType;
            }

            const response = await fetch('http://localhost:5000/api/concerns/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to submit');
            }

            if (result.success) {
                setSuccess(result.message || 'Message sent successfully! We\'ll get back to you within 24 hours.');
                setTimeout(() => {
                    setSuccess('');
                    onClose();
                }, 3000);
            } else {
                throw new Error(result.message || 'Failed to submit');
            }

        } catch (error) {
            console.error('Error submitting form:', error);
            setError(error.message || 'Failed to submit. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const inquiryOptions = [
        { value: 'general', label: 'General Inquiry' },
        { value: 'package-information', label: 'Package Information' },
        { value: 'others', label: 'Others' }
    ];

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            maxWidth='max-w-lg'
            icon={faPaperPlane}
            iconColor='text-gray-600'
            title="Contact Maple Street Photography"
            subtitle="Let's capture your precious moments"
        >
            <div className="p-6">
                {/* Error Message */}
                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                        <FontAwesomeIcon icon={faExclamationCircle} className="text-red-500 mt-0.5 flex-shrink-0" />
                        <p className="text-red-600 text-sm">{error}</p>
                    </div>
                )}

                {/* Success Message */}
                {success && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
                        <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 mt-0.5 flex-shrink-0" />
                        <p className="text-green-600 text-sm">{success}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Inquiry Type */}
                    <div>
                        <label className="block text-xs text-gray-600 mb-1 font-medium">Inquiry Type</label>
                        <select
                            name='inquiryType'
                            value={formData.inquiryType}
                            onChange={handleChange}
                            className="w-full p-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 bg-white"
                        >
                            {inquiryOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Name */}
                    <div>
                        <label className="block text-xs text-gray-600 mb-1 font-medium">Your Name *</label>
                        <div className='relative'>
                            <FontAwesomeIcon 
                                icon={faUser} 
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" 
                            />
                            <input
                                type='text'
                                name='name'
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full pl-10 p-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 bg-white"
                                placeholder="Your full name"
                            />
                        </div>
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="block text-xs text-gray-600 mb-1 font-medium">Phone Number *</label>
                        <div className='relative'>
                            <FontAwesomeIcon 
                                icon={faPhone} 
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" 
                            />
                            <input
                                type='tel'
                                name='phone'
                                value={formData.phone}
                                onChange={handleChange}
                                required
                                className="w-full pl-10 p-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 bg-white"
                                placeholder="+63 912 345 6789"
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-xs text-gray-600 mb-1 font-medium">Email Address *</label>
                        <div className='relative'>
                            <FontAwesomeIcon 
                                icon={faEnvelope} 
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" 
                            />
                            <input
                                type='email'
                                name='email'
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full pl-10 p-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 bg-white"
                                placeholder='you@example.com'
                            />
                        </div>
                    </div>

                    {/* Package Information Field */}
                    {formData.inquiryType === 'package-information' && (
                        <div>
                            <label className="block text-xs text-gray-600 mb-1 font-medium">Package Type</label>
                            <div className='relative'>
                                <FontAwesomeIcon 
                                    icon={faBox} 
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" 
                                />
                                <select
                                    name='packageType'
                                    value={formData.packageType}
                                    onChange={handleChange}
                                    className="w-full pl-10 p-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 bg-white"
                                >
                                    <option value=''>Select a package</option>
                                    <option value='newborn'>Newborn Session</option>
                                    <option value='maternity'>Maternity Session</option>
                                    <option value='family'>Family Session</option>
                                    <option value='milestone'>Milestone Session</option>
                                    <option value='portrait'>Portrait Session</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {/* Message */}
                    <div>
                        <label className="block text-xs text-gray-600 mb-1 font-medium">Message *</label>
                        <div className='relative'>
                            <FontAwesomeIcon 
                                icon={faMessage} 
                                className="absolute left-3 top-3 text-gray-400 text-sm" 
                            />
                            <textarea
                                name='message'
                                value={formData.message}
                                onChange={handleChange}
                                required
                                rows={4}
                                className="w-full pl-10 p-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 bg-white resize-none"
                                placeholder="Tell us about your photography needs..."
                            />
                        </div>
                    </div>

                    {/* Authorization Agreement */}
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <label className="flex items-start gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={authorized}
                                onChange={(e) => setAuthorized(e.target.checked)}
                                className="mt-0.5 w-4 h-4 text-gray-600 rounded border-gray-300 focus:ring-gray-500"
                            />
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <FontAwesomeIcon icon={faShieldAlt} className="text-gray-600 text-sm" />
                                    <span className="font-medium text-gray-900 text-sm">Authorization Agreement</span>
                                </div>
                                <p className="text-xs text-gray-600 mt-1">
                                    I authorize Maple Street Photography to contact me regarding my inquiry. 
                                    I confirm that the information provided is accurate and complete to the best of my knowledge.
                                </p>
                            </div>
                        </label>
                    </div>

                    {/* Submit Button */}
                    <button
                        type='submit'
                        disabled={loading}
                        className="w-full bg-gray-700 hover:bg-gray-800 text-white py-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <LoadingSpinner message="Sending..." />
                        ) : (
                            <>
                                Send Message
                                <FontAwesomeIcon icon={faPaperPlane} className='text-sm' />
                            </>
                        )}
                    </button>

                    {/* Footer note */}
                    <div className='text-center pt-2'>
                        <p className="text-xs text-gray-500">
                            We typically respond within 24 hours via the phone number or email address you provided.
                        </p>
                    </div>
                </form>
            </div>
        </BaseModal>
    );
}

export default UnifiedContactModal;