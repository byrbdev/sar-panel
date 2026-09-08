const Footer = () => {
  return (
    <div className="flex w-full flex-col items-center justify-center px-1 pb-8 pt-3 lg:px-8">
      <p className="text-center text-sm font-medium text-gray-600 dark:text-gray-400">
        ©{new Date().getFullYear()} SAR Panel{' '}
        <a
          href="https://byrb.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-brand-500 hover:text-brand-600"
        >
          By RB Developer
        </a>
      </p>
    </div>
  );
};

export default Footer;
