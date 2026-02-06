import { Check, Zap, Users, Building2, CreditCard } from 'lucide-react'

const Pricing = () => {
  const tiers = [
    {
      name: 'Free',
      price: '$0',
      period: '/month',
      description: 'Perfect for trying out the platform',
      icon: Zap,
      features: [
        '3 families/month',
        'Basic templates only',
        'Standard parameters',
        '3-day support response',
        '3D preview'
      ],
      cta: 'Get Started',
      highlighted: false
    },
    {
      name: 'Pro',
      price: '$49',
      period: '/month',
      description: 'Best for individual architects',
      icon: Zap,
      features: [
        '50 families/month',
        'All templates',
        'Custom parameters',
        'Priority processing',
        '24hr support',
        'Batch processing (up to 5)'
      ],
      cta: 'Start Pro Trial',
      highlighted: true
    },
    {
      name: 'Team',
      price: '$199',
      period: '/month',
      description: 'For firms with 5 users',
      icon: Users,
      features: [
        '250 families/month (shared)',
        'Company template library',
        'Shared parameter standards',
        'Team collaboration',
        'Dedicated support',
        'Revit plugin access',
        'Batch processing (up to 20)'
      ],
      cta: 'Contact Sales',
      highlighted: false
    },
    {
      name: 'Pay-Per-Family',
      price: '$4.99',
      period: '/family',
      description: 'No subscription required',
      icon: CreditCard,
      features: [
        'No monthly commitment',
        'Same quality as Pro',
        'All templates',
        'Custom parameters',
        'Perfect for occasional use',
        'Credits never expire'
      ],
      cta: 'Buy Credits',
      highlighted: false
    }
  ]

  return (
    <section id="pricing" className="py-24 bg-[#0a0a0a]">
      <div className="max-w-[1280px] mx-auto px-5">
        {/* Section Header */}
        <div className="text-center mb-16 scroll-animate">
          <h2 className="text-3xl md:text-4xl font-semibold mb-4">
            Simple, <span className="text-[#dc5f00]">Transparent</span> Pricing
          </h2>
          <p className="text-[#a3a1a1] max-w-2xl mx-auto">
            Start free, upgrade when you need more. No hidden fees, no surprises.
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tiers.map((tier, index) => (
            <div
              key={tier.name}
              className={`scroll-animate relative p-6 rounded-lg border transition-all duration-200 ${
                tier.highlighted
                  ? 'bg-[#1a1b1f] border-[#dc5f00] lg:scale-105 lg:-translate-y-2'
                  : 'bg-[#1a1b1f] border-[#515151] hover:border-[#dc5f00]/50'
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {tier.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-[#dc5f00] text-white text-xs font-medium px-3 py-1 rounded-full uppercase tracking-wider">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${
                  tier.highlighted ? 'bg-[#dc5f00]/20' : 'bg-[#515151]/30'
                }`}>
                  <tier.icon className={tier.highlighted ? 'text-[#dc5f00]' : 'text-[#a3a1a1]'} size={24} />
                </div>
                <h3 className="text-xl font-medium mb-1">{tier.name}</h3>
                <p className="text-sm text-[#666]">{tier.description}</p>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-bold">{tier.price}</span>
                <span className="text-[#666]">{tier.period}</span>
              </div>

              <ul className="space-y-3 mb-8">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm">
                    <Check size={16} className="text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-[#a3a1a1]">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                className={`w-full py-3 rounded-lg font-medium text-sm uppercase tracking-wider transition-all duration-200 ${
                  tier.highlighted
                    ? 'bg-[#dc5f00] text-white hover:bg-white hover:text-black'
                    : 'bg-transparent border border-[#515151] text-white hover:border-[#dc5f00] hover:text-[#dc5f00]'
                }`}
              >
                {tier.cta}
              </button>
            </div>
          ))}
        </div>

        {/* Enterprise CTA */}
        <div className="mt-12 scroll-animate p-8 bg-[#1a1b1f] border border-[#515151] rounded-lg text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Building2 className="text-[#dc5f00]" size={28} />
            <h3 className="text-xl font-medium">Enterprise</h3>
          </div>
          <p className="text-[#a3a1a1] mb-6 max-w-xl mx-auto">
            Need unlimited families, API access, or on-premise deployment? 
            Contact us for custom enterprise solutions.
          </p>
          <button className="btn-secondary">
            Contact Sales
          </button>
        </div>
      </div>
    </section>
  )
}

export default Pricing
