import React, { useState } from 'react';
import { Building2, Mail, MessageSquare, Phone, User } from 'lucide-react';
import { Button } from './Button';

export function Contact() {
  const [inquiryType, setInquiryType] = useState('client');

  return (
    <div className="min-h-screen pt-16">
      <div className="container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Get in Touch
            </h1>
            <p className="text-xl text-gray-600">
              Have questions? We're here to help you succeed with HARX.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8">
            {/* Inquiry Type Selector */}
            <div className="flex gap-4 mb-8">
              <button
                className={`flex-1 py-3 px-6 rounded-lg text-center transition-colors ${
                  inquiryType === 'client'
                    ? 'bg-harx-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                onClick={() => setInquiryType('client')}
              >
                I'm a Potential Client
              </button>
              <button
                className={`flex-1 py-3 px-6 rounded-lg text-center transition-colors ${
                  inquiryType === 'rep'
                    ? 'bg-harx-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                onClick={() => setInquiryType('rep')}
              >
                I Want to Be a Rep
              </button>
            </div>

            {/* Zoho CRM Form */}
            <div id="crmWebToEntityForm" className="zcwf_lblLeft crmWebToEntityForm">
              <form 
                action="https://crm.zoho.com/crm/WebToLeadForm" 
                name="WebToLeads6350485000007441002" 
                method="POST" 
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  fetch(e.currentTarget.action, {
                    method: 'POST',
                    body: formData,
                  })
                  .then(response => {
                    if (response.ok) {
                      alert('Thank you for your message. We will get back to you soon!');
                      e.currentTarget.reset();
                    } else {
                      throw new Error('Form submission failed');
                    }
                  })
                  .catch(error => {
                    console.error('Error:', error);
                    alert('There was an error submitting the form. Please try again later.');
                  });
                }}
                className="space-y-6"
              >
                <input type="text" style={{ display: 'none' }} name="xnQsjsdp" value="8a66890a320144fa10583039479a805dc89c7ee4e9bfd02dcd1da33786f3c6f0" />
                <input type="hidden" name="zc_gad" id="zc_gad" value="" />
                <input type="text" style={{ display: 'none' }} name="xmIwtLD" value="183a9faf2fae53a446e3e2b6f2b9f3ea20e3258a0a59f12422fd3a54511944fe702f38b793f031b7b182f3cb8633330a" />
                <input type="text" style={{ display: 'none' }} name="actionType" value="TGVhZHM=" />
                <input type="text" style={{ display: 'none' }} name="returnURL" value="null" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="Last_Name"
                        name="Last Name"
                        required
                        maxLength={80}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-harx-600 focus:border-transparent"
                        placeholder="John Doe"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        id="Email"
                        name="Email"
                        required
                        maxLength={100}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-harx-600 focus:border-transparent"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="tel"
                        id="Phone"
                        name="Phone"
                        required
                        maxLength={30}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-harx-600 focus:border-transparent"
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {inquiryType === 'client' ? 'Company' : 'Location'} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Building2 className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="Company"
                        name="Company"
                        required
                        maxLength={200}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-harx-600 focus:border-transparent"
                        placeholder={inquiryType === 'client' ? 'Company Name' : 'City, Country'}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message
                  </label>
                  <div className="relative">
                    <div className="absolute top-3 left-3 pointer-events-none">
                      <MessageSquare className="h-5 w-5 text-gray-400" />
                    </div>
                    <textarea
                      id="Description"
                      name="Description"
                      rows={4}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-harx-600 focus:border-transparent"
                      placeholder="Tell us about your needs..."
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-4">
                  <Button type="reset" variant="secondary" size="lg">
                    Reset
                  </Button>
                  <Button type="submit" size="lg">
                    Send Message
                  </Button>
                </div>
              </form>
            </div>
          </div>

          {/* Company Information */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="text-center">
              <Mail className="h-8 w-8 text-harx-600 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Email Us</h3>
              <p className="text-gray-600">sales@harx.ai</p>
            </div>
            <div className="text-center">
              <Building2 className="h-8 w-8 text-harx-600 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Visit Us</h3>
              <p className="text-gray-600">
                HARX TECHNOLOGIES Inc.<br />
                16192 Coastal Hwy<br />
                Lewes, DE 19958, USA
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
