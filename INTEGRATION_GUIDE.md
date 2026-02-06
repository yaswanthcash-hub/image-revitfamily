# Integration Guide: Advanced AI Features

This guide shows you how to enable advanced AI features using the open-source tools we've researched.

## Quick Start (No API Keys Required)

The system works out-of-the-box in **demo mode** with sample 3D models. Just upload an image and the system will:
1. Store your project in Supabase
2. Return a demo 3D model for testing
3. Allow dimension editing
4. Generate a placeholder Revit family file

## Enabling Real AI Processing

To enable real 3D reconstruction, you need API keys from any of these providers:

### Option 1: Hugging Face (Recommended - FREE)

**Best for:** InstantMesh, TripoSR, Wonder3D

1. Sign up at https://huggingface.co/
2. Go to Settings → Access Tokens
3. Create a new token with "Read" access
4. Add to your environment variables:
   ```bash
   HF_API_KEY=hf_your_token_here
   ```

**Supported Models:**
- `instantmesh` - TencentARC/InstantMesh (Recommended)
- `triposr` - stabilityai/TripoSR (Very Fast)
- `wonder3d` - flamehaze1115/Wonder3D-v1 (Highest Quality)

### Option 2: Replicate (Easy Setup)

**Best for:** TRELLIS-2, latest models

1. Sign up at https://replicate.com/
2. Get your API token from Account Settings
3. Add to environment:
   ```bash
   REPLICATE_API_KEY=r8_your_token_here
   ```

**Features:**
- Pay-per-use (very affordable)
- Access to TRELLIS-2 and other cutting-edge models
- Managed infrastructure

### Option 3: Commercial APIs

**Meshy.ai**
```bash
MESHY_API_KEY=your_meshy_key
```
- Sign up: https://www.meshy.ai/
- Free tier: Limited credits
- Best for: Production-ready results

**Tripo3D**
```bash
TRIPO3D_API_KEY=your_tripo_key
```
- Sign up: https://www.tripo3d.ai/
- Free tier available
- Best for: Fast commercial use

## Advanced Features to Integrate

### 1. Furniture Segmentation with SAM 3

Remove backgrounds automatically using Meta's Segment Anything Model.

**Installation:**
```bash
pip install segment-anything
```

**Example Usage:**
```python
from segment_anything import sam_model_registry, SamPredictor

# Load model
sam = sam_model_registry["vit_h"](checkpoint="sam_vit_h.pth")
predictor = SamPredictor(sam)

# Segment furniture
predictor.set_image(image)
masks, _, _ = predictor.predict(prompt="furniture")
```

**Integration Point:**
- Add to `process-image-to-3d` edge function
- Pre-process images before 3D reconstruction
- Improves quality by removing backgrounds

### 2. Dimension Estimation with ZoeDepth

Automatically estimate real-world dimensions.

**Installation:**
```bash
pip install torch torchvision
```

**Example Usage:**
```python
import torch

# Load ZoeDepth
model = torch.hub.load("isl-org/ZoeDepth", "ZoeD_N", pretrained=True)

# Get metric depth
depth = model.infer_pil(image)
metric_depth = depth.numpy()

# Extract dimensions
height_pixels = object_bbox.height
height_meters = metric_depth[bbox] * height_pixels
```

**Integration Point:**
- Create new edge function: `estimate-dimensions`
- Automatically populate dimension fields
- User can override if needed

### 3. Parametric CAD with CadQuery

Generate true parametric CAD models from 3D meshes.

**Installation:**
```bash
pip install cadquery
```

**Example Usage:**
```python
import cadquery as cq

# Generate parametric chair
def create_chair(width, depth, height, seat_height):
    result = (
        cq.Workplane("XY")
        .box(width, depth, seat_height)  # Seat
        .faces(">Z").workplane()
        .box(width, depth/10, height - seat_height)  # Back
    )
    return result

chair = create_chair(18, 18, 36, 18)
chair.val().exportStep("chair.step")
```

**Integration Point:**
- Add to `generate-revit-family` edge function
- Convert mesh to parametric operations
- Export as STEP for CAD compatibility

### 4. BIM Format with IfcOpenShell

Generate standard BIM formats compatible with all software.

**Installation:**
```bash
pip install ifcopenshell
```

**Example Usage:**
```python
import ifcopenshell
from ifcopenshell.api import run

# Create IFC file
ifc = run("project.create_file")

# Add furniture element
furniture = run("root.create_entity", ifc,
    ifc_class="IfcFurniture",
    name="Custom Chair"
)

# Export
ifc.write("furniture.ifc")

# Convert to Revit
# Use IfcConvert: ifcconvert furniture.ifc furniture.rvt
```

**Integration Point:**
- Alternative to direct RFA generation
- Better compatibility
- Industry standard format

## Production Architecture

### Recommended Stack

```
User Upload
    ↓
Supabase Storage
    ↓
[Edge Function: preprocess-image]
    ↓ SAM 3 Segmentation
    ↓ Background Removal
    ↓
[Edge Function: process-image-to-3d]
    ↓ InstantMesh / TRELLIS-2
    ↓ 3D Mesh (GLB)
    ↓
[Edge Function: estimate-dimensions]
    ↓ ZoeDepth Analysis
    ↓ Dimension Extraction
    ↓
[Edge Function: generate-parametric-cad]
    ↓ CadQuery Conversion
    ↓ STEP File
    ↓
[Edge Function: generate-revit-family]
    ↓ IfcOpenShell OR Autodesk API
    ↓ RFA / IFC File
    ↓
Final Download
```

## Performance Optimization

### 1. Use Multiple Providers
```typescript
// Fallback chain
const providers = ['instantmesh', 'triposr', 'trellis2'];

for (const provider of providers) {
  try {
    const result = await process3D(imageUrl, provider);
    if (result.success) return result;
  } catch (error) {
    continue; // Try next provider
  }
}
```

### 2. Caching Strategy
```typescript
// Cache successful conversions
const cacheKey = `3d_${imageHash}_${provider}`;
const cached = await supabase
  .from('mesh_cache')
  .select('*')
  .eq('cache_key', cacheKey)
  .maybeSingle();

if (cached) return cached.mesh_url;
```

### 3. Async Processing with Webhooks
```typescript
// Start processing
const job = await startProcessing(imageUrl);

// Poll for completion
const checkStatus = async () => {
  const status = await getJobStatus(job.id);
  if (status === 'completed') {
    // Update UI
  } else {
    setTimeout(checkStatus, 5000);
  }
};
```

## Cost Estimation

### Free Tier Usage
- **Hugging Face**: ~1000 requests/month (rate limited)
- **Replicate**: $0.001 - $0.05 per generation
- **Supabase**: 500MB storage, 2GB bandwidth (free)

### Scaling Costs (1000 conversions/month)
- **InstantMesh (HF)**: $0 (free tier)
- **TRELLIS-2 (Replicate)**: ~$20-50
- **Meshy.ai**: ~$50-100 (commercial API)
- **Storage**: ~$0-5 (Supabase)
- **Total**: $20-155/month

### Self-Hosted (Advanced)
- **GPU Server**: $0.50/hour (on-demand)
- **Estimated**: $100-300/month for moderate usage
- **Best for**: High volume (>10,000/month)

## API Examples

### Creating a Project
```typescript
const { data: project } = await supabase
  .from('projects')
  .insert({
    name: 'Modern Chair',
    image_url: imageUrl,
    furniture_category: 'chair',
    status: 'pending'
  })
  .select()
  .single();
```

### Triggering 3D Generation
```typescript
const response = await fetch(
  `${SUPABASE_URL}/functions/v1/process-image-to-3d`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      projectId: project.id,
      imageUrl: imageUrl,
      category: 'chair',
      provider: 'instantmesh'
    })
  }
);
```

### Monitoring Progress
```typescript
const channel = supabase
  .channel('project-updates')
  .on('postgres_changes',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'projects',
      filter: `id=eq.${projectId}`
    },
    (payload) => {
      console.log('Status:', payload.new.status);
      if (payload.new.status === 'completed') {
        console.log('Mesh URL:', payload.new.mesh_url);
      }
    }
  )
  .subscribe();
```

## Troubleshooting

### Common Issues

**1. "Model loading error" from Hugging Face**
- Solution: Model may be warming up. Wait 30s and retry.
- Alternative: Use `instantmesh` which loads faster

**2. "API rate limit exceeded"**
- Solution: Add delays between requests
- Alternative: Use Replicate for guaranteed capacity

**3. "Mesh quality is poor"**
- Solution: Use `wonder3d` for highest quality
- Check: Ensure image has good lighting and clear view

**4. "Dimension estimation incorrect"**
- Solution: Use reference object in photo
- Alternative: Manual dimension input

## Next Steps

1. ✅ Choose your 3D provider (InstantMesh recommended)
2. ✅ Get API keys (Hugging Face is free)
3. ✅ Test with sample images
4. 📋 Integrate SAM 3 for segmentation
5. 📋 Add ZoeDepth for dimensions
6. 📋 Implement CadQuery for parametric CAD
7. 📋 Add IfcOpenShell for BIM export

## Support Resources

- **Hugging Face Docs**: https://huggingface.co/docs/api-inference
- **CadQuery Tutorial**: https://cadquery.readthedocs.io/
- **IfcOpenShell Guide**: https://ifcopenshell.org/
- **Supabase Edge Functions**: https://supabase.com/docs/guides/functions

## Community & Contributions

All models listed are open source. Consider:
- Contributing improvements back to repositories
- Sharing your Revit family templates
- Reporting issues on GitHub
- Joining model-specific Discord communities
