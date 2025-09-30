import Link from "next/link";

const Footer = ({
  link,
}: {
  link: { href: string; text: string; subtext: string };
}) => {
  return (
    <footer
      id="site-footer"
      className="fixed bottom-0 left-0 w-full bg-gradient-to-t from-black via-black/90 to-transparent pt-20 pb-6 px-6 md:px-12 z-20"
    >
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <div className="flex gap-8">
          <Link
            href={link.href}
            className="text-sm text-white/60 hover:text-white transition-all duration-300 font-mono flex items-center group"
          >
            <span>{link.text}</span>
            <span className="opacity-0 group-hover:opacity-50 ml-2 transition-all duration-300">
              {link.subtext}
            </span>
          </Link>
        </div>

        <div className="text-sm text-white/60 font-mono">
          made by{" "}
          <a
            href="https://www.instagram.com/lmq4wb"
            className="hover:text-white transition-all duration-300 border-b border-dotted border-white/30"
            target="_blank"
            rel="noopener noreferrer"
          >
            @lmq4wb
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
