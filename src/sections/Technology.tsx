import { useState } from 'react'
import { Cpu, Database, Layers, GitBranch, CheckCircle, ArrowRight, Code, Terminal, Settings } from 'lucide-react'

const Technology = () => {
  const [activeTab, setActiveTab] = useState<'pipeline' | 'models' | 'data'>('pipeline')

  const pipelineSteps = [
    {
      number: '01',
      title: 'Multi-Modal Input',
      description: 'Image + dimensions + category for maximum accuracy',
      tech: ['Product images (1-3 angles)', 'Catalog PDF OCR', 'Manual dimension input'],
      accuracy: 'Foundation'
    },
    {
      number: '02',
      title: '3D Reconstruction',
      description: 'Wonder3D++ generates RGB + normal maps for superior geometry',
      tech: ['Cross-domain diffusion', 'Normal fusion algorithm', '6-view consistency'],
      accuracy: '88-92%'
    },
    {
      number: '03',
      title: 'B-Rep Conversion',
      description: 'Point2CAD reverse-engineers parametric CAD structure',
      tech: ['Point cloud segmentation', 'Analytical primitive fitting', 'Topology reconstruction'],
      accuracy: '92-95%'
    },
    {
      number: '04',
      title: 'Operation Classification',
      description: 'BRepNet classifies CAD operations from native B-rep structure',
      tech: ['Topological message passing', 'Face operation classification', 'Parametric constraints'],
      accuracy: '94.3%'
    },
    {
      number: '05',
      title: 'Revit Generation',
      description: 'Design Automation API creates editable .rfa families',
      tech: ['Cloud-based Revit API', 'Reference planes + parameters', 'BIM standards compliance'],
      accuracy: '96-98%'
    }
  ]

  const models = [
    {
      name: 'Wonder3D++',
      type: '3D Reconstruction',
      accuracy: '88-92%',
      description: 'Cross-domain diffusion model that generates both RGB views and normal maps simultaneously, enabling superior geometric accuracy for furniture reconstruction.',
      github: 'github.com/xxlong0/Wonder3D',
      license: 'MIT'
    },
    {
      name: 'Point2CAD',
      type: 'Parametric Conversion',
      accuracy: '94.3%',
      description: 'Reverse engineers 3D point clouds into parametric CAD models with proper B-rep structure. Fits analytical primitives and reconstructs topology.',
      github: 'github.com/Hippogriff/point2cad',
      license: 'Research'
    },
    {
      name: 'BRepNet',
      type: 'CAD Classification',
      accuracy: '94.3%',
      description: 'First neural network operating directly on native B-rep structures. Uses topological message passing to classify CAD operations with 4x fewer parameters than PointNet++.',
      github: 'github.com/AutodeskAILab/BRepNet',
      license: 'Apache 2.0'
    },
    {
      name: 'DeepCAD',
      type: 'CAD Generation',
      accuracy: '87%',
      description: 'Transformer-based model that generates CAD construction sequences. Trained on 178K CAD models with complete operation timelines.',
      github: 'github.com/ChrisWu1997/DeepCAD',
      license: 'MIT'
    },
    {
      name: 'Brep2Seq',
      type: 'Operation Extraction',
      accuracy: '92%',
      description: 'Transforms B-rep models into sequences of parametrized feature-based modeling operations using transformer encoder-decoder architecture.',
      github: 'Research paper',
      license: 'Research'
    },
    {
      name: 'PaddleOCR',
      type: 'Dimension Extraction',
      accuracy: '98%',
      description: 'Multilingual OCR engine optimized for extracting dimensional specifications from manufacturer catalogs and spec sheets.',
      github: 'github.com/PaddlePaddle/PaddleOCR',
      license: 'Apache 2.0'
    }
  ]

  const datasets = [
    {
      name: 'Objaverse-XL',
      size: '10.2M objects',
      description: 'Massive dataset of 3D objects from GitHub, Thingiverse, Sketchfab, and professional scans. 100x larger than previous datasets.',
      use: 'Pre-training reconstruction models',
      link: 'huggingface.co/datasets/allenai/objaverse-xl'
    },
    {
      name: '3D-FUTURE',
      size: '16,563 models',
      description: 'High-quality furniture CAD models with professional textures and exact image-3D matches. Industrial-grade quality.',
      use: 'Fine-tuning on furniture domain',
      link: 'tianchi.aliyun.com/specials/promotion/alibaba-3d-future'
    },
    {
      name: 'DeepCAD Dataset',
      size: '178K models',
      description: 'CAD models with complete construction sequences including sketch-extrude-fillet operations.',
      use: 'Training parametric generation',
      link: 'github.com/ChrisWu1997/DeepCAD'
    },
    {
      name: 'Fusion 360 Gallery',
      size: '8.6K models',
      description: 'Real user-created parametric CAD models from Onshape with operation timelines and constraints.',
      use: 'Understanding CAD workflows',
      link: 'github.com/AutodeskAILab/Fusion360GalleryDataset'
    },
    {
      name: 'ABC Dataset',
      size: '1M models',
      description: 'Professional CAD models from Onshape with B-rep structure and parametric information.',
      use: 'B-rep structure training',
      link: 'deep-geometry.github.io/abc-dataset'
    },
    {
      name: 'Objaverse++',
      size: '50K curated',
      description: 'Quality-filtered subset of Objaverse with manual annotations. Models trained on this outperform 100K random samples.',
      use: 'High-quality training subset',
      link: 'huggingface.co/datasets/TCXX/ObjaversePlusPlus'
    }
  ]

  return (
    <section id="technology" className="py-24 bg-[#0a0a0a]">
      <div className="max-w-[1280px] mx-auto px-5">
        {/* Section Header */}
        <div className="text-center mb-16 scroll-animate">
          <div className="inline-flex items-center gap-2 text-[#dc5f00] text-sm uppercase tracking-widest font-medium mb-4">
            <Cpu size={16} />
            <span>State-of-the-Art AI</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-semibold mb-4">
            The Technology Behind <span className="text-[#dc5f00]">92-95% Accuracy</span>
          </h2>
          <p className="text-[#a3a1a1] max-w-3xl mx-auto">
            Our hybrid pipeline combines the latest research in 3D reconstruction, 
            parametric CAD conversion, and BIM generation. No single approach achieves 
            99%—but our multi-stage system gets remarkably close.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center gap-4 mb-12 scroll-animate">
          {[
            { id: 'pipeline', label: 'Pipeline', icon: GitBranch },
            { id: 'models', label: 'AI Models', icon: Cpu },
            { id: 'data', label: 'Training Data', icon: Database }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-[#dc5f00] text-white'
                  : 'bg-[#1a1b1f] text-[#a3a1a1] hover:text-white border border-[#515151]'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Pipeline Tab */}
        {activeTab === 'pipeline' && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pipelineSteps.map((step, index) => (
                <div
                  key={step.number}
                  className="scroll-animate card-hover p-6 rounded-lg relative"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="absolute -top-3 -left-3 w-10 h-10 bg-[#dc5f00] rounded-full flex items-center justify-center text-lg font-bold">
                    {step.number}
                  </div>
                  <div className="pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-medium">{step.title}</h3>
                      <span className="text-xs bg-[#dc5f00]/20 text-[#dc5f00] px-2 py-1 rounded-full">
                        {step.accuracy}
                      </span>
                    </div>
                    <p className="text-sm text-[#a3a1a1] mb-4">{step.description}</p>
                    <ul className="space-y-2">
                      {step.tech.map((t, i) => (
                        <li key={i} className="flex items-center gap-2 text-xs text-[#666]">
                          <CheckCircle size={12} className="text-green-500" />
                          {t}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>

            {/* Architecture Diagram */}
            <div className="scroll-animate mt-12 p-8 bg-[#111] border border-[#515151] rounded-lg">
              <h3 className="text-xl font-medium mb-6 text-center">Hybrid Pipeline Architecture</h3>
              <div className="flex flex-wrap items-center justify-center gap-4">
                {['Image Input', 'Wonder3D++', 'Point2CAD', 'BRepNet', 'Design Automation', 'Revit .rfa'].map((step, i) => (
                  <div key={step} className="flex items-center gap-4">
                    <div className="px-4 py-3 bg-[#1a1b1f] border border-[#515151] rounded-lg text-sm font-medium">
                      {step}
                    </div>
                    {i < 5 && <ArrowRight size={20} className="text-[#dc5f00]" />}
                  </div>
                ))}
              </div>
              <div className="mt-6 text-center">
                <p className="text-sm text-[#666]">
                  Combined accuracy: <span className="text-[#dc5f00] font-medium">92-95%</span> with multi-modal input
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Models Tab */}
        {activeTab === 'models' && (
          <div className="grid md:grid-cols-2 gap-6">
            {models.map((model, index) => (
              <div
                key={model.name}
                className="scroll-animate card-hover p-6 rounded-lg"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-medium mb-1">{model.name}</h3>
                    <span className="text-xs text-[#dc5f00]">{model.type}</span>
                  </div>
                  <span className="text-xs bg-green-500/20 text-green-500 px-2 py-1 rounded-full">
                    {model.accuracy}
                  </span>
                </div>
                <p className="text-sm text-[#a3a1a1] mb-4">{model.description}</p>
                <div className="flex items-center gap-4 text-xs text-[#666]">
                  <span className="flex items-center gap-1">
                    <Code size={12} />
                    {model.github}
                  </span>
                  <span className="flex items-center gap-1">
                    <Settings size={12} />
                    {model.license}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Data Tab */}
        {activeTab === 'data' && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {datasets.map((dataset, index) => (
              <div
                key={dataset.name}
                className="scroll-animate card-hover p-6 rounded-lg"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-medium">{dataset.name}</h3>
                  <span className="text-xs bg-[#dc5f00]/20 text-[#dc5f00] px-2 py-1 rounded-full">
                    {dataset.size}
                  </span>
                </div>
                <p className="text-sm text-[#a3a1a1] mb-4">{dataset.description}</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs">
                    <Layers size={12} className="text-[#666]" />
                    <span className="text-[#666]">{dataset.use}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <Terminal size={12} className="text-[#666]" />
                    <span className="text-[#515151]">{dataset.link}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bottom CTA */}
        <div className="scroll-animate mt-16 p-8 bg-[#1a1b1f] border border-[#515151] rounded-lg text-center">
          <h3 className="text-xl font-medium mb-3">Why 92-95% Is The Realistic Target</h3>
          <p className="text-[#a3a1a1] max-w-2xl mx-auto mb-6">
            Pure AI from a single image maxes at 70-85%. True 99% requires professional 3D scanning 
            or manufacturer CAD files. Our hybrid approach—combining AI reconstruction with 
            template matching, manual dimension input, and cloud-based Revit generation—achieves 
            the highest practical accuracy for an automated SaaS product.
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle size={16} className="text-green-500" />
              <span>Fast enough to save time</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle size={16} className="text-green-500" />
              <span>Accurate enough to be useful</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle size={16} className="text-green-500" />
              <span>Editable for quick corrections</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Technology
