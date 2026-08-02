import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Facebook, Twitter, Linkedin, Instagram, Mail, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Logo } from './Logo';
import { newsletter } from '../../lib/api';

export function Footer() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const navigation = {
    company: [
      { name: t('footer.navHowItWorks', 'How It Works'), href: '#how-it-works' },
      { name: t('footer.navPricing', 'Pricing'), href: '#pricing' },
      { name: t('footer.navForCompanies', 'For Companies'), href: '#clients' },
      { name: t('footer.navForReps', 'For Reps'), href: '#reps' },
    ],
    legal: [
      { name: t('footer.navPrivacy', 'Privacy Policy'), href: '/privacy' },
      { name: t('footer.navTerms', 'Terms of Service'), href: '/terms' },
      { name: t('footer.navCookie', 'Cookie Policy'), href: '/cookies' },
      { name: t('footer.navGDPR', 'GDPR Compliance'), href: '/gdpr' },
    ],
    social: [
      { name: 'Facebook', href: 'https://facebook.com/harx.ai', icon: Facebook },
      { name: 'Twitter', href: 'https://twitter.com/harx_ai', icon: Twitter },
      { name: 'LinkedIn', href: 'https://linkedin.com/company/harx-ai', icon: Linkedin },
      { name: 'Instagram', href: 'https://instagram.com/harx.ai', icon: Instagram },
    ],
  };
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    if (href.startsWith('#')) {
      const element = document.getElementById(href.substring(1));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      } else {
        navigate('/' + href);
      }
    } else {
      navigate(href);
    }
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) {
      setFeedback({
        type: 'error',
        text: t('footer.newsletterEmailRequired', 'Please enter your email address.'),
      });
      return;
    }

    setLoading(true);
    setFeedback(null);
    try {
      const result = await newsletter.subscribe({
        email: trimmed,
        locale: i18n.language?.split('-')[0] || 'en',
      });
      if (!result?.success || !result?.data?.email) {
        throw new Error('Invalid newsletter subscribe response');
      }
      const created = result.data.created === true;
      setFeedback({
        type: 'success',
        text: created
          ? t('footer.newsletterSuccess', 'Thanks! You are subscribed.')
          : t('footer.newsletterAlready', 'You are already subscribed.'),
      });
      if (created) setEmail('');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setFeedback({
        type: 'error',
        text:
          axiosErr?.response?.data?.message ||
          t('footer.newsletterError', 'Could not subscribe. Please try again.'),
      });
    } finally {
      setLoading(false);
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div>
            <div className="mb-6">
              <Logo className="h-14 w-auto md:h-16" />
            </div>
            <p className="text-gray-400 mb-1">
              {t('footer.subtitle', 'AI-Powered Transaction-as-a-Service Platform')}
            </p>
            <p className="text-gray-400 mb-4">
              {t('footer.poweredBy', 'Powered by AI')}
            </p>
            <div className="space-y-2">
              <div className="flex items-center text-gray-400">
                <Mail className="h-5 w-5 mr-2" />
                <a href="mailto:contact@harx.ai" className="hover:text-white transition-colors">
                  contact@harx.ai
                </a>
              </div>
              <div className="flex items-start text-gray-400">
                <MapPin className="h-5 w-5 mr-2 mt-1" />
                <address className="not-italic">
                  16192 Coastal Hwy<br />
                  Lewes, DE 19958<br />
                  United States
                </address>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('footer.company', 'Company')}</h3>
            <ul className="space-y-2">
              {navigation.company.map((item) => (
                <li key={item.name}>
                  <a
                    href={item.href}
                    onClick={(e) => handleNavClick(e, item.href)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('footer.legal', 'Legal')}</h3>
            <ul className="space-y-2">
              {navigation.legal.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('footer.stayUpdated', 'Stay Updated')}</h3>
            <p className="text-gray-400 mb-4">
              {t('footer.newsletterDesc', 'Subscribe to our newsletter for the latest updates and insights.')}
            </p>
            <form className="space-y-2" onSubmit={handleSubscribe}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('footer.emailPlaceholder', 'Enter your email')}
                disabled={loading}
                autoComplete="email"
                required
                className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-harx-500 disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-2 bg-harx-500 text-white rounded-lg hover:bg-harx-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading
                  ? t('footer.newsletterSubmitting', 'Subscribing…')
                  : t('footer.subscribe', 'Subscribe')}
              </button>
              {feedback && (
                <p
                  className={`text-sm ${
                    feedback.type === 'success' ? 'text-green-400' : 'text-red-400'
                  }`}
                  role="status"
                >
                  {feedback.text}
                </p>
              )}
            </form>
          </div>
        </div>

        {/* Social Links */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex space-x-6">
              {navigation.social.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-gray-400 hover:text-white transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="sr-only">{item.name}</span>
                  <item.icon className="h-6 w-6" />
                </a>
              ))}
            </div>
            <p className="text-gray-400 text-sm">
              {t('footer.rights', '© {{year}} HARX Technologies Inc. All rights reserved.', { year: currentYear })}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
