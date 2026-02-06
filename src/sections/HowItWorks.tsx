import { Search, Upload, Scan, Eye, Sliders, Download } from 'lucide-react'

const HowItWorks = () => {
  const steps = [
    {
      number: '01',
      icon: Search,
      title: 'Select Furniture Category',
      description: 'Choose from 6 industry-standard categories. This determines the parametric template, component detection pipeline, BIM classification, and validation rules.',
      details: [
        'Office chairs, tables, desks, cabinets, sofas, lighting',
        'Revit category & subcategory auto-assignment',
        'OmniClass, Uniclass 2015, IFC entity mapping',
        'Category-specific templates (4+ per category)'
      ]
    },
    {
      number: '02',
      icon: Upload,
      title: 'Upload Product Image',
      description: 'Upload product images or catalog PDFs. Our category-aware AI pipeline runs detection steps specific to your furniture type for maximum accuracy.',
      details: [
        'JPG, PNG, PDF support (up to 10MB)',
        '9-step category-specific analysis pipeline',
        'Catalog PDF OCR dimension extraction (98%)',
        'Best results from 3/4 angle, white background'
      ]
    },
    {
      number: '03',
      icon: Scan,
      title: 'AI Component Detection',
      description: 'Category-specific neural networks detect and classify furniture components with bounding boxes, confidence scores, and dimension estimates from industry standards.',
      details: [
        '5-8 components detected per category',
        'BIFMA G1, ANSI/BIFMA, ADA compliance ranges',
        'Interactive overlay inspection',
        '88-98% confidence per component'
      ]
    },
    {
      number: '04',
      icon: Eye,
      title: '3D Family Preview',
      description: 'Interactive Three.js preview with category-specific parametric geometry. Switch between Coarse, Medium, and Fine LOD representations used in Revit views.',
      details: [
        '6 parametric 3D models (one per category)',
        'Coarse / Medium / Fine LOD switching',
        'Real-time dimension and material updates',
        'Orbit, zoom, and grid controls'
      ]
    },
    {
      number: '05',
      icon: Sliders,
      title: 'Configure Parameters',
      description: 'Full Revit parameter editor with 4 tabs: Dimensions, Identity Data, Materials, and IFC/Standards. All values follow industry standards and become editable in Revit.',
      details: [
        'Category-specific dimension sliders with ranges',
        'Identity Data (manufacturer, model, cost, keynote)',
        'Visual material assignment with color swatches',
        'IFC classification & sustainability parameters'
      ]
    },
    {
      number: '06',
      icon: Download,
      title: 'Validate & Export',
      description: '23 automated checks across 6 validation categories ensure BIM standards compliance. Export as .rfa with optional type catalog, documentation, and IFC file.',
      details: [
        '23 checks: file, parametric, geometry, parameters, subcategories, materials',
        'Revit Family (.rfa) for Revit 2022-2025',
        'Type Catalog (.txt) for multi-type families',
        'IFC 4.3 export for open BIM exchange'
      ]
    }
  ]

  return (
    <section id="how-it-works" className="py-24 bg-[#111]">
      <div className="max-w-[1280px] mx-auto px-5">
        <div className="text-center mb-16 scroll-animate">
          <h2 className="text-3xl md:text-4xl font-semibold mb-4">
            How <span className="text-[#dc5f00]">CladeFamily</span> Works
          </h2>
          <p className="text-[#a3a1a1] max-w-3xl mx-auto">
            A 6-step guided workflow that combines AI-powered component detection,
            category-specific parametric templates, and comprehensive BIM standards
            validation to produce production-ready Revit families.
          </p>
        </div>

        <div className="scroll-animate mb-16 p-6 bg-[#1a1b1f] border border-[#515151] rounded-lg">
          <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
            {['Category', 'Upload', 'Detection', '3D Preview', 'Parameters', 'Export'].map((step, i, arr) => (
              <div key={step} className="flex items-center gap-3">
                <span className="px-3 py-2 bg-[#0a0a0a] border border-[#515151] rounded-lg font-medium">
                  {step}
                </span>
                {i < arr.length - 1 && (
                  <span className="text-[#dc5f00]">&#8594;</span>
                )}
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-[#666] mt-4">
            6 categories &#183; 23 validation checks &#183; 4 export formats &#183; Industry-standard dimensions
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {steps.map((step, index) => (
            <div
              key={step.number}
              className="scroll-animate card-hover p-6 rounded-lg"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center gap-4 mb-4">
                <span className="text-4xl font-bold text-[#dc5f00]/30">
                  {step.number}
                </span>
                <div className="w-12 h-12 bg-[#dc5f00]/10 rounded-lg flex items-center justify-center">
                  <step.icon className="text-[#dc5f00]" size={24} />
                </div>
              </div>
              <h3 className="text-xl font-medium mb-3">{step.title}</h3>
              <p className="text-[#a3a1a1] text-sm mb-4 leading-relaxed">
                {step.description}
              </p>
              <ul className="space-y-2">
                {step.details.map((detail, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-[#666]">
                    <span className="w-1.5 h-1.5 bg-[#dc5f00] rounded-full mt-1 flex-shrink-0" />
                    {detail}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="scroll-animate mt-16 p-8 bg-[#1a1b1f] border border-[#515151] rounded-lg">
          <h3 className="text-xl font-medium mb-6 text-center">Why a Hybrid Approach?</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-[#dc5f00] mb-2">70-85%</div>
              <p className="text-sm text-[#a3a1a1] mb-2">Pure AI (single image)</p>
              <p className="text-xs text-[#666]">Information loss from single view makes perfect reconstruction impossible</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-500 mb-2">85-90%</div>
              <p className="text-sm text-[#a3a1a1] mb-2">Multi-view only</p>
              <p className="text-xs text-[#666]">Better geometry but still outputs meshes, not parametric CAD</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-500 mb-2">92-95%</div>
              <p className="text-sm text-[#a3a1a1] mb-2">Hybrid (our approach)</p>
              <p className="text-xs text-[#666]">AI + templates + manual input + cloud Revit API = production-ready</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HowItWorks
