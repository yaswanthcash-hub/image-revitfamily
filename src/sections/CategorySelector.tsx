import { useState } from 'react'
import { furnitureCategories, type FurnitureCategory } from '../data/furniture-categories'
import { Armchair, Table, Monitor, Archive, Sofa, Lightbulb, ArrowRight, Check, Search, type LucideIcon } from 'lucide-react'

interface CategorySelectorProps {
  selectedCategory: FurnitureCategory | null
  onSelectCategory: (category: FurnitureCategory) => void
}

const iconMap: Record<string, LucideIcon> = {
  Armchair, Table, Monitor, Archive, Sofa, Lightbulb,
}

const CategorySelector = ({ selectedCategory, onSelectCategory }: CategorySelectorProps) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  return (
    <section className="py-24 bg-[#0a0a0a]">
      <div className="max-w-[1280px] mx-auto px-5">
        <div className="text-center mb-16 scroll-animate">
          <div className="inline-flex items-center gap-2 text-[#dc5f00] text-sm uppercase tracking-widest font-medium mb-4">
            <Search size={16} />
            <span>Step 1 of 6</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-semibold mb-4">
            Select <span className="text-[#dc5f00]">Furniture Category</span>
          </h2>
          <p className="text-[#a3a1a1] max-w-2xl mx-auto">
            Choose the Revit family category that matches your product. This determines the
            parametric template, component detection, and BIM classification.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {furnitureCategories.map((cat, index) => {
            const Icon = iconMap[cat.icon] || Armchair
            const isSelected = selectedCategory?.id === cat.id
            const isHovered = hoveredId === cat.id

            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat)}
                onMouseEnter={() => setHoveredId(cat.id)}
                onMouseLeave={() => setHoveredId(null)}
                className={`scroll-animate relative group text-left p-6 rounded-lg border transition-all duration-300 ${
                  isSelected
                    ? 'bg-[#dc5f00]/10 border-[#dc5f00] ring-1 ring-[#dc5f00]/50'
                    : 'bg-[#1a1b1f] border-[#515151] hover:border-[#dc5f00]/50 hover:-translate-y-1'
                }`}
                style={{ animationDelay: `${index * 80}ms` }}
              >
                {isSelected && (
                  <div className="absolute top-3 right-3 w-6 h-6 bg-[#dc5f00] rounded-full flex items-center justify-center">
                    <Check size={14} className="text-white" />
                  </div>
                )}

                <div className={`w-14 h-14 rounded-lg flex items-center justify-center mb-4 transition-colors ${
                  isSelected ? 'bg-[#dc5f00]/20' : 'bg-[#dc5f00]/10 group-hover:bg-[#dc5f00]/15'
                }`}>
                  <Icon className="text-[#dc5f00]" size={26} />
                </div>

                <h3 className="text-lg font-medium mb-1">{cat.name}</h3>
                <p className="text-sm text-[#a3a1a1] mb-4">{cat.description}</p>

                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="text-xs bg-[#111] border border-[#515151] px-2 py-1 rounded text-[#a3a1a1]">
                    {cat.revitCategory}
                  </span>
                  <span className="text-xs bg-[#111] border border-[#515151] px-2 py-1 rounded text-[#a3a1a1]">
                    {cat.ifcEntity}
                  </span>
                </div>

                <div className={`flex items-center gap-2 text-sm transition-all duration-200 ${
                  isSelected || isHovered ? 'text-[#dc5f00]' : 'text-[#666]'
                }`}>
                  <span>{cat.templates.length} templates</span>
                  <span className="text-[#515151]">|</span>
                  <span>{cat.dimensions.length} parameters</span>
                </div>

                {(isSelected || isHovered) && (
                  <div className="mt-4 pt-4 border-t border-[#515151]/50">
                    <p className="text-xs text-[#666] mb-2">Available templates:</p>
                    <div className="space-y-1">
                      {cat.templates.slice(0, 3).map(t => (
                        <div key={t} className="flex items-center gap-2 text-xs text-[#a3a1a1]">
                          <ArrowRight size={10} className="text-[#dc5f00]" />
                          {t}
                        </div>
                      ))}
                      {cat.templates.length > 3 && (
                        <span className="text-xs text-[#666]">+{cat.templates.length - 3} more</span>
                      )}
                    </div>
                  </div>
                )}
              </button>
            )
          })}
        </div>

        {selectedCategory && (
          <div className="mt-12 text-center scroll-animate">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-[#dc5f00]/10 border border-[#dc5f00]/30 rounded-lg">
              <Check size={18} className="text-[#dc5f00]" />
              <span className="text-sm">
                Selected: <span className="text-[#dc5f00] font-medium">{selectedCategory.name}</span>
                <span className="text-[#666] ml-2">({selectedCategory.revitCategory} / {selectedCategory.ifcEntity})</span>
              </span>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default CategorySelector
