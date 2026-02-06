import { Linkedin, Twitter, Youtube, Github } from 'lucide-react'

const Footer = () => {
  const footerLinks = {
    Product: [
      { name: 'Features', href: '#features' },
      { name: 'Pricing', href: '#pricing' },
      { name: 'API', href: '#api' },
      { name: 'Changelog', href: '#' },
    ],
    Resources: [
      { name: 'Documentation', href: '#' },
      { name: 'Tutorials', href: '#' },
      { name: 'Blog', href: '#' },
      { name: 'Support', href: '#' },
    ],
    Company: [
      { name: 'About', href: '#' },
      { name: 'Careers', href: '#' },
      { name: 'Contact', href: '#' },
      { name: 'Partners', href: '#' },
    ],
    Legal: [
      { name: 'Privacy', href: '#' },
      { name: 'Terms', href: '#' },
      { name: 'Security', href: '#' },
    ],
  }

  const socialLinks = [
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Youtube, href: '#', label: 'YouTube' },
    { icon: Github, href: '#', label: 'GitHub' },
  ]

  return (
    <footer className="bg-[#0a0a0a] border-t border-[#515151]">
      <div className="max-w-[1280px] mx-auto px-5 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Logo & Description */}
          <div className="lg:col-span-2">
            <a href="#" className="inline-block mb-4">
              <span className="text-2xl font-semibold tracking-tight">
                CLADE<span className="text-[#dc5f00]">FAMILY</span>
              </span>
            </a>
            <p className="text-[#a3a1a1] text-sm leading-relaxed mb-6 max-w-sm">
              AI-powered Revit family generation for modern architects. 
              Transform product images into parametric BIM families in minutes.
            </p>
            
            {/* Social Links */}
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-10 h-10 bg-[#1a1b1f] border border-[#515151] rounded-lg flex items-center justify-center text-[#a3a1a1] hover:text-[#dc5f00] hover:border-[#dc5f00] transition-all duration-200"
                >
                  <social.icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-medium mb-4 text-sm uppercase tracking-wider">
                {category}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-sm text-[#a3a1a1] hover:text-[#dc5f00] transition-colors duration-200"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-[#515151]/50 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-[#666]">
            © 2025 CladeFamily. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-sm text-[#666]">
              Made with ❤️ for architects
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
