
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import { InformationCircleIcon, PaperAirplaneIcon } from '../constants';

const ContactUsScreen: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [messageBody, setMessageBody] = useState('');
  const [formMessage, setFormMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFormMessage(null);
    // Simulate sending message
    setTimeout(() => {
      setIsLoading(false);
      setFormMessage(`Thank you, ${name}! Your message about "${subject}" has been received. We'll get back to you at ${email} shortly.`);
      setName(''); setEmail(''); setSubject(''); setMessageBody('');
    }, 1500);
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center space-x-3 mb-4">
        <Link to="/profile" className="text-primary hover:text-accent-700">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </Link>
        <h1 className="text-2xl font-semibold text-neutral-800">Contact Us</h1>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
        <h2 className="text-lg font-semibold text-neutral-700">Get in Touch</h2>
        <p className="text-sm text-neutral-600">
          Have questions or need assistance? Reach out to us. <br/>
          Customer Support (24/7): <a href="tel:18005552739" className="text-primary hover:underline">1-800-555-APEX</a> <br/>
          General Inquiries: <a href="mailto:support@apexnationalbank.com" className="text-primary hover:underline">support@apexnationalbank.com</a>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-4">
        <h2 className="text-lg font-semibold text-neutral-700">Send us a Message</h2>
        {formMessage && <div className="p-3 bg-green-100 text-green-700 rounded-md">{formMessage}</div>}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-neutral-700">Full Name</label>
          <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} className="mt-1 w-full p-2 border rounded-md" required />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-neutral-700">Email Address</label>
          <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-1 w-full p-2 border rounded-md" required />
        </div>
        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-neutral-700">Subject</label>
          <input type="text" id="subject" value={subject} onChange={e => setSubject(e.target.value)} className="mt-1 w-full p-2 border rounded-md" required />
        </div>
        <div>
          <label htmlFor="messageBody" className="block text-sm font-medium text-neutral-700">Message</label>
          <textarea id="messageBody" value={messageBody} onChange={e => setMessageBody(e.target.value)} rows={4} className="mt-1 w-full p-2 border rounded-md" required />
        </div>
        <Button type="submit" variant="primary" className="w-full" isLoading={isLoading} disabled={isLoading} leftIcon={<PaperAirplaneIcon className="w-5 h-5"/>}>
          {isLoading ? 'Sending...' : 'Send Message'}
        </Button>
      </form>
       <div className="text-xs text-neutral-500 p-3 bg-neutral-100 rounded-md border border-neutral-200 flex items-start space-x-2">
         <InformationCircleIcon className="w-4 h-4 text-neutral-500 flex-shrink-0 mt-0.5" />
        <span>We typically respond to email inquiries within 24-48 business hours. For urgent matters, please call our customer support line.</span>
      </div>
    </div>
  );
};

export default ContactUsScreen;