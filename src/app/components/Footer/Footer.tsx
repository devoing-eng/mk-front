import Link from 'next/link';
import { FaXTwitter, FaTelegram } from 'react-icons/fa6';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="w-full bg-transparent text-gray-700 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row justify-between items-center border-t border-indigo-300 pt-4">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 text-xs text-gray-300 mb-4 sm:mb-0">
            <span>&copy; {currentYear} MemeKult</span>
            <nav className="flex flex-wrap justify-center gap-4">
              <Link target="_blank" rel="noopener noreferrer" href="https://x.com/memekult_com">
                <span className="hover:underline cursor-pointer">Support</span>
              </Link>
            </nav>
            <nav className="flex flex-wrap justify-center gap-4">
              <Link target="_blank" rel="noopener noreferrer" href="https://memekult.gitbook.io/memekult-docs">
                <span className="hover:underline cursor-pointer">Documentation</span>
              </Link>
            </nav>
            <nav className="flex flex-wrap justify-center gap-4">
              <Link href="mailto:hello@memekult.com?subject=Request%20API%20Access" target="_blank" rel="noopener noreferrer">
                <span className="hover:underline cursor-pointer">API</span>
              </Link>
            </nav>
          </div>
          <div className="flex space-x-4">
            <Link target="_blank" rel="noopener noreferrer" href="https://x.com/memekult_com">
              <span className="text-gray-300 hover:text-gray-500 cursor-pointer">
                <FaXTwitter className="w-5 h-5" />
              </span>
            </Link>
            <Link target="_blank" rel="noopener noreferrer"  href="https://t.me/memekult_com">
              <span className="text-gray-300 hover:text-gray-500 cursor-pointer">
                <FaTelegram className="w-5 h-5" />
              </span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;