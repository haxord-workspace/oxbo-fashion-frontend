import React, { useState } from 'react';
import { LoadingButton } from '../../components/common/LoadingButton';

interface FormErrors {
  name?: string;
  email?: string;
  message?: string;
}

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name as keyof FormErrors]) {
      setErrors({ ...errors, [e.target.name]: undefined });
    }
  };

  const validateForm = () => {
    const newErrors: FormErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.message.trim()) newErrors.message = 'Message is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        setFormData({ name: '', email: '', message: '' });
      }, 3000);
    }, 1000);
  };

  return (
    <div className="flex-1 bg-white pt-12 pb-24 px-4 sm:px-6 lg:px-8 min-h-[calc(100vh-80px)]">
      <div className="max-w-6xl mx-auto">
        <div className="mb-16 text-center md:text-left border-b-2 border-black pb-8 inline-block">
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight text-black italic pr-8" style={{ fontFamily: 'Impact, sans-serif' }}>
            CONTACT US
          </h1>
          <p className="mt-4 text-sm md:text-base text-gray-500 uppercase tracking-widest font-semibold max-w-xl">
            Have a question? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24">
          {/* Contact Information */}
          <div className="space-y-12">
            <div>
              <h3 className="text-xl font-black uppercase tracking-wider mb-6">Our Info</h3>
              <div className="space-y-8">
                <div>
                  <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Email</span>
                  <a href="mailto:hello@oxbofashion.com" className="text-lg font-medium hover:underline hover:text-gray-600 transition-colors">hello@oxbofashion.com</a>
                </div>
                <div>
                  <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Phone</span>
                  <a href="tel:+1234567890" className="text-lg font-medium hover:underline hover:text-gray-600 transition-colors">+1 (234) 567-890</a>
                </div>
                <div>
                  <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Address</span>
                  <address className="text-lg font-medium not-italic leading-relaxed">
                    thrisurr punnayukulam near royal hospital<br />
                    kerala, 678004
                  </address>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-black uppercase tracking-wider mb-6">Follow Us</h3>
              <div className="flex space-x-6">
                <a href="#" className="text-black hover:text-gray-500 transition-colors uppercase font-bold text-sm tracking-widest underline decoration-2 underline-offset-4">Instagram</a>
                <a href="#" className="text-black hover:text-gray-500 transition-colors uppercase font-bold text-sm tracking-widest underline decoration-2 underline-offset-4">Twitter</a>
                <a href="#" className="text-black hover:text-gray-500 transition-colors uppercase font-bold text-sm tracking-widest underline decoration-2 underline-offset-4">TikTok</a>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-gray-50 p-8 border border-gray-100 shadow-sm relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-black"></div>
            {isSubmitted ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-16">
                <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center text-white mb-2 shadow-lg">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <h3 className="text-2xl font-black uppercase tracking-wider">Message Sent</h3>
                <p className="text-gray-500 text-sm font-medium tracking-wide">Thank you for reaching out. We'll get back to you shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                <div>
                  <label htmlFor="name" className="block text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 bg-white border focus:outline-none transition-colors rounded-none ${
                      errors.name ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500' : 'border-gray-200 focus:border-black focus:ring-1 focus:ring-black'
                    }`}
                    placeholder="YOUR NAME"
                  />
                  {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                </div>
                <div>
                  <label htmlFor="email" className="block text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 bg-white border focus:outline-none transition-colors rounded-none ${
                      errors.email ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500' : 'border-gray-200 focus:border-black focus:ring-1 focus:ring-black'
                    }`}
                    placeholder="YOUR EMAIL"
                  />
                  {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                </div>
                <div>
                  <label htmlFor="message" className="block text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={6}
                    className={`w-full px-4 py-3 bg-white border focus:outline-none transition-colors resize-none rounded-none ${
                      errors.message ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500' : 'border-gray-200 focus:border-black focus:ring-1 focus:ring-black'
                    }`}
                    placeholder="HOW CAN WE HELP YOU?"
                  ></textarea>
                  {errors.message && <p className="mt-1 text-xs text-red-500">{errors.message}</p>}
                </div>
                <LoadingButton
                  type="submit"
                  isLoading={isSubmitting}
                  className="w-full py-4 bg-black text-white font-black uppercase tracking-widest hover:bg-gray-800 transition-colors shadow-md mt-4"
                >
                  SEND MESSAGE
                </LoadingButton>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
