import { Upload, Scan, Box, Sliders, Download, Layers } from 'lucide-react'

const HowItWorks = () => {
  const steps = [
    {
      number: '01',
      icon: Upload,
      title: 'Multi-Modal Input',
      description: 'Upload product images, catalog PDFs, or enter dimensions manually. Our system combines multiple data sources for maximum accuracy—no single image can achieve 99% alone.',
      details: [
        'Product images (1-3 angles for best results)',
        'Catalog PDF with OCR dimension extraction (98% accuracy)',
        'Manual dimension input (100% accuracy)',
        'Category selection for template matching'
      ]
    },
    {
      number: '02',
      icon: Scan,
      title: 'AI-Powered 3D Reconstruction',
      description: 'Wonder3D++ generates consistent multi-view RGB + normal maps using cross-domain diffusion. This captures surface geometry far better than single-view methods.',
      details: [
        'Cross-domain diffusion (RGB + normals)',
        '6-view consistency mechanism',
        'Normal fusion for superior geometry',
        '88-92% geometric accuracy'
      ]
    },
    {
      number: '03',
      icon: Box,
      title: 'Parametric CAD Conversion',
      description: 'Point2CAD reverse-engineers the mesh into B-rep structure with analytical primitives. BRepNet then classifies the CAD operations for true parametric editability.',
      details: [
        'Point cloud → B-rep conversion',
        'Analytical primitive fitting',
        'Topological reconstruction',
        'Operation classification (94.3% accuracy)'
      ]
    },
    {
      number: '04',
      icon: Layers,
      title: 'Template Matching & Refinement',
      description: 'Our system matches your furniture to curated Revit templates, then uses AI to refine the fit. This hybrid approach achieves higher accuracy than pure generation.',
      details: [
        '20+ hand-crafted furniture templates',
        'ICP algorithm for optimal fitting',
        'Dimension scaling to real-world units',
        'Symmetry detection and enforcement'
      ]
    },
    {
      number: '05',
      icon: Sliders,
      title: 'Parameter Configuration',
      description: 'Review and adjust the generated parameters in our web interface. The 3D preview updates in real-time as you modify dimensions, materials, and BIM data.',
      details: [
        'Interactive 3D preview (Three.js)',
        'Type & instance parameters',
        'BIM metadata (manufacturer, cost, etc.)',
        'Real-time validation'
      ]
    },
    {
      number: '06',
      icon: Download,
      title: 'Cloud Revit Generation',
      description: 'Autodesk Design Automation API creates the final .rfa file in the cloud—no local Revit needed. The result is a fully editable, standards-compliant Revit family.',
      details: [
        'Design Automation for Revit (cloud API)',
        'Reference planes + dimensional parameters',
        'BIM standards compliance check',
        'Ready-to-use .rfa file'
      ]
    }
  ]

  return (
    <section id="how-it-works" className="py-24 bg-[#111]">
      <div className="max-w-[1280px] mx-auto px-5">
        {/* Section Header */}
        <div className="text-center mb-16 scroll-animate">
          <h2 className="text-3xl md:text-4xl font-semibold mb-4">
            How <span className="text-[#dc5f00]">CladeFamily</span> Works
          </h2>
          <p className="text-[#a3a1a1] max-w-3xl mx-auto">
            Our hybrid pipeline combines state-of-the-art AI models with curated templates 
            and cloud-based Revit generation. No single approach achieves 99% accuracy—but 
            together, we reach 92-95% for production-ready families.
          </p>
        </div>

        {/* Pipeline Overview */}
        <div className="scroll-animate mb-16 p-6 bg-[#1a1b1f] border border-[#515151] rounded-lg">
          <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
            {['Image/PDF', 'Wonder3D++', 'Point2CAD', 'BRepNet', 'Templates', 'Design Automation', 'Revit .rfa'].map((step, i, arr) => (
              <div key={step} className="flex items-center gap-3">
                <span className="px-3 py-2 bg-[#0a0a0a] border border-[#515151] rounded-lg font-medium">
                  {step}
                </span>
                {i < arr.length - 1 && (
                  <span className="text-[#dc5f00]">→</span>
                )}
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-[#666] mt-4">
            Combined accuracy: <span className="text-[#dc5f00] font-medium">92-95%</span> with multi-modal input
          </p>
        </div>

        {/* Steps */}
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

        {/* Why Hybrid */}
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
