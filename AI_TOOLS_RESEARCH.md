# Comprehensive AI Tools & APIs Research for Revit Family Generation

## Executive Summary

This document compiles extensive research on open-source tools, APIs, and services that can enhance our furniture image-to-Revit family conversion product. All tools listed have accessible APIs, open-source implementations, or free tiers suitable for production use.

---

## 1. Image-to-3D Conversion APIs

### 1.1 TRELLIS-2 (Microsoft) ⭐ RECOMMENDED
- **Status**: Open Source (MIT License)
- **Released**: December 2024
- **Parameters**: 4B parameter model
- **Speed**: Very Fast
- **Features**:
  - Revolutionary 4B-parameter AI model
  - Transforms images into 3D assets
  - NVIDIA NIM API and Replicate hosting options
  - Free online demo
  - Exports: GLB, OBJ, PLY
  - No signup required for demo
- **Implementation**: Replicate API or self-hosted
- **Cost**: Free tier available

### 1.2 TripoSR (Stability AI + Tripo AI) ⭐ RECOMMENDED
- **Status**: Open Source (MIT License)
- **Speed**: Under 0.5 seconds on NVIDIA A100
- **Features**:
  - Fast feedforward 3D reconstruction from single image
  - Transformer architecture
  - High-quality draft outputs
  - Outperforms OpenLRM
- **GitHub**: https://github.com/VAST-AI-Research/TripoSR
- **Hugging Face**: stabilityai/TripoSR
- **API**: Hugging Face Inference API
- **Cost**: Free via Hugging Face (rate limited) or self-hosted

### 1.3 Hunyuan3D-1 (Tencent)
- **Status**: Open Source
- **Released**: November 2024
- **Speed**: ~11 seconds total (4s multi-view + 7s reconstruction)
- **Features**:
  - Two-stage approach
  - Supports text and image inputs
  - Multi-view diffusion model
  - Feed-forward reconstruction
- **Implementation**: Self-hosted or API integration

### 1.4 InstantMesh (TencentARC) ⭐ RECOMMENDED
- **Status**: Open Source
- **Features**:
  - Feed-forward framework
  - Instant 3D mesh generation from single image
  - State-of-the-art generation quality
  - Significant training scalability
  - Outputs: OBJ, GLB
  - Background removal option
- **GitHub**: https://github.com/TencentARC/InstantMesh
- **Hugging Face**: TencentARC/InstantMesh (with live demo)
- **Cost**: Free

### 1.5 Wonder3D
- **Status**: Open Source (MIT License)
- **Speed**: 2-3 minutes
- **Features**:
  - Highly-detailed textured meshes
  - Cross-domain diffusion model
  - Multi-view normal maps + color images
  - Novel normal fusion method
  - Multi-view cross-domain attention mechanism
- **GitHub**: https://github.com/xxlong0/Wonder3D
- **Cost**: Free

### 1.6 Zero123++
- **Status**: Open Source
- **Features**:
  - Image-conditioned diffusion model
  - 3D-consistent multi-view images
  - High-quality, consistent multi-view generation
  - Overcomes texture degradation issues
  - Multiple model versions (v1.1, v1.2)
- **GitHub**: https://github.com/SUDO-AI-3D/zero123plus
- **Hugging Face**: Multiple versions available
- **Cost**: Free

### 1.7 Meshy.ai (Commercial with Free Tier)
- **Status**: Commercial API
- **Features**:
  - Robust REST API
  - Well-documented
  - Image-to-3D pipeline
  - PBR texture support
- **API Docs**: https://www.meshy.ai/
- **Cost**: Free tier with limits, paid plans available

### 1.8 Tripo3D (Commercial with Free Tier)
- **Status**: Commercial API
- **Features**:
  - Fast image-to-model conversion
  - REST API
  - Multiple output formats
- **Website**: https://www.tripo3d.ai/
- **Cost**: Free tier available

---

## 2. Multi-View & Depth Estimation

### 2.1 MiDaS (Intel ISL) ⭐ RECOMMENDED
- **Status**: Open Source
- **Features**:
  - Robust monocular depth estimation
  - Multiple model variants (DPT, BEiT, Swin2)
  - Zero-shot cross-dataset transfer
  - Works with any image
- **Models**:
  - dpt_beit_large_512
  - dpt_beit_large_384
  - dpt_swin2_large_384
  - dpt_large_384
  - dpt_hybrid_384
- **GitHub**: https://github.com/isl-org/MiDaS
- **Implementation**: PyTorch Hub or local
- **Cost**: Free

### 2.2 ZoeDepth ⭐ RECOMMENDED
- **Status**: Open Source
- **Features**:
  - Metric depth estimation (not just relative)
  - Combines MiDaS with metric depth binning
  - Adaptive metric binning module
  - Zero-shot metric depth estimation
  - Precise absolute depth
- **Models**: ZoeD_N, ZoeD_K, ZoeD_NK
- **GitHub**: https://github.com/isl-org/ZoeDepth
- **PyTorch Hub**: `torch.hub.load(repo, "ZoeD_N", pretrained=True)`
- **Cost**: Free

### 2.3 Depth Anything V2
- **Status**: Open Source
- **Features**:
  - Improved monocular depth estimation
  - Better accuracy than MiDaS in some cases
  - Multiple scales
- **Cost**: Free

---

## 3. Object Detection & Segmentation

### 3.1 Segment Anything Model 3 (SAM 3) - Meta AI ⭐ HIGHLY RECOMMENDED
- **Status**: Open Source (Apache 2.0)
- **Released**: Latest version SAM 3
- **Training Data**: 11M images, 1.1B masks
- **Features**:
  - Text prompts for segmentation
  - Exemplar prompts
  - Detection, segmentation, tracking across images/video
  - Powers Facebook Marketplace "View in Room" for furniture
  - Zero-shot performance
  - Works with points, boxes, or text prompts
- **Use Case**: Perfect for furniture segmentation
- **Models**:
  - SAM (Original)
  - SAM 2 (video support)
  - SAM 3 (text + exemplar prompts)
- **GitHub**: https://github.com/facebookresearch/segment-anything
- **Playground**: https://segment-anything.com/
- **Third-Party API**: Segmind offers serverless API
- **Cost**: Free (Apache 2.0), commercial use allowed

### 3.2 YOLO (You Only Look Once)
- **Status**: Open Source
- **Features**:
  - Real-time object detection
  - 92.6% accuracy in detection tasks
  - Fast processing
  - Works well with OpenCV
- **Versions**: YOLOv8, YOLOv9, YOLOv10
- **Use Case**: Object identification, bounding box detection
- **Cost**: Free

---

## 4. Dimension Extraction & Measurement

### 4.1 OpenCV + Reference Object Method ⭐ RECOMMENDED
- **Status**: Open Source
- **Technique**:
  - "Pixels per metric" ratio calculation
  - Reference object with known dimensions
  - Canny edge detection
  - Contour analysis
  - Camera calibration for lens distortion
- **Accuracy**: High when reference object present
- **Implementation**: Python with OpenCV + NumPy
- **GitHub Examples**: https://github.com/Practical-CV/Measuring-Size-of-Objects-with-OpenCV
- **Cost**: Free

### 4.2 YOLO + OpenCV Measurement Pipeline
- **Features**:
  - YOLO for object identification
  - OpenCV for dimension calculation
  - Real-time measurement
  - Supports webcam or image input
- **Accuracy**: 92.6%+ for detection
- **Use Case**: Automated dimension extraction
- **Cost**: Free

### 4.3 Mask R-CNN for Precise Measurements
- **Features**:
  - Instance segmentation
  - Precise shape detection
  - Better than bounding boxes for irregular shapes
- **Use Case**: Complex furniture shapes
- **Cost**: Free (open source)

---

## 5. Mesh-to-Parametric CAD Conversion

### 5.1 Point2CAD (ETH Zurich) ⭐ CUTTING EDGE
- **Status**: Research Code Available (CVPR 2024)
- **Features**:
  - Reverse engineering CAD from 3D point clouds/meshes
  - Segments into CAD faces
  - Fits geometric primitives or freeform surfaces
  - Novel implicit neural representation
  - Outputs B-rep format CAD
  - Includes analytical surfaces, compatible edges/corners
  - Topology-aware
- **Output**: Native CAD B-rep format
- **GitHub**: https://github.com/prs-eth/point2cad
- **Paper**: CVPR 2024
- **Cost**: Free (research code)
- **Challenge**: Complex implementation

### 5.2 BRepNet
- **Status**: Research Code
- **Features**:
  - Neural network for B-rep CAD structures
  - Operates on native CAD data
  - Per-face operation segmentation
  - Uses exact parametric geometry
  - Topological connectivity
- **Use Case**: Feature classification on existing CAD
- **Cost**: Free
- **Note**: Works on existing B-reps, not conversion

---

## 6. Parametric CAD Generation (Python)

### 6.1 CadQuery ⭐ HIGHLY RECOMMENDED
- **Status**: Open Source
- **Base**: OpenCASCADE Technology (OCCT) kernel
- **Features**:
  - Intuitive Python API for parametric 3D CAD
  - Much more powerful than OpenSCAD
  - NURBS, splines, surface sewing support
  - STL repair
  - STEP import/export
  - Complex operations support
  - Faster than OpenSCAD
  - No GUI required (perfect for servers)
  - Scientific and engineering scripts
- **Exports**: STL, STEP, AMF, 3MF
- **GitHub**: https://github.com/CadQuery/cadquery
- **Docs**: https://cadquery.readthedocs.io/
- **PyPI**: `pip install cadquery`
- **Cost**: Free

### 6.2 FreeCAD Python API
- **Status**: Open Source
- **Features**:
  - Full Python API for solid modeling
  - Parametric 3D modeler
  - Real-life object design
  - Extensive features
- **GitHub**: https://github.com/FreeCAD/FreeCAD
- **Cost**: Free
- **Challenge**: Heavier than CadQuery

### 6.3 libfive
- **Status**: Open Source
- **Features**:
  - Software library for solid modeling
  - Suited for parametric and procedural design
  - Low-level geometry kernel
  - Scheme and Python bindings
- **Website**: https://libfive.com/
- **Cost**: Free

---

## 7. BIM/IFC/Revit Integration

### 7.1 IfcOpenShell ⭐ RECOMMENDED
- **Status**: Open Source (LGPL)
- **IFC Support**: IFC2x3, IFC4, IFC4x1, IFC4x2, IFC4x3
- **Features**:
  - Complete IFC parsing
  - Extensive Python API (hundreds of functions)
  - C++ libraries with Python bindings
  - Integrates with FreeCAD, Blender
  - Supports 4D and 5D BIM operations
  - Cascading geometric coordinate changes
  - Subgraph purging
  - Element appending
- **Conversion Tool**: IfcConvert
  - Outputs: OBJ, DAE, GLB, STP, IGS, XML, SVG, H5, TTL/WKT, IFC-SPF
  - Can convert IFC to RVT (Revit format)
- **GitHub**: https://github.com/IfcOpenShell/IfcOpenShell
- **Docs**: https://docs.ifcopenshell.org/
- **Platforms**: Windows, Mac, Linux
- **Cost**: Free

### 7.2 Autodesk Platform Services (formerly Forge) - Design Automation API
- **Status**: Commercial with Free Tier
- **Features**:
  - Official Autodesk Revit API access
  - Cloud-based automation
  - Design Automation for Revit
  - Direct RFA generation
- **Free Tier**:
  - Limited monthly usage
  - Ideal for testing, POCs
  - Non-rated APIs are free
  - Rated APIs have usage caps
- **Updated**: December 2025 pricing model
- **Cost**: Free tier with limits, paid tiers available
- **Website**: https://aps.autodesk.com/
- **Challenge**: Requires Autodesk account, limited free usage

---

## 8. Recommended Technology Stack

### PHASE 1: Image Processing & Segmentation
1. **SAM 3** (Meta) - Segment furniture from background
2. **ZoeDepth** - Extract depth information for scale

### PHASE 2: 3D Reconstruction
**Primary Options** (Pick one based on quality/speed tradeoff):
- **TRELLIS-2** - Fastest, newest, high quality
- **InstantMesh** - Fast, proven, excellent quality
- **TripoSR** - Very fast, good for drafts
- **Wonder3D** - Slower but highest detail

### PHASE 3: Dimension Extraction
1. **OpenCV + Reference Object** - Manual reference
2. **ZoeDepth Metric Depth** - Automated scale estimation
3. **User Input** - Final manual adjustment

### PHASE 4: Parametric Conversion
1. **Point2CAD** - Mesh to parametric CAD (cutting edge)
2. **CadQuery** - Generate parametric features programmatically

### PHASE 5: Revit Family Generation
**Option A: IFC Route** (Open Source)
1. CadQuery → STEP export
2. IfcOpenShell → IFC generation
3. IfcConvert → RVT conversion

**Option B: Direct Route** (Commercial)
1. Autodesk Design Automation API
2. Direct RFA generation

---

## 9. Implementation Priority Matrix

### HIGH PRIORITY (Implement First)
1. ✅ **InstantMesh** or **TRELLIS-2** - 3D reconstruction
2. ✅ **SAM 3** - Furniture segmentation
3. ✅ **ZoeDepth** - Dimension estimation
4. ✅ **CadQuery** - Parametric CAD generation

### MEDIUM PRIORITY (Enhance Product)
5. **Point2CAD** - Advanced parametric extraction
6. **IfcOpenShell** - BIM format support
7. **OpenCV Measurement** - Automated dimensions

### LOW PRIORITY (Future Features)
8. **Wonder3D** - Ultra-high quality option
9. **Autodesk Design Automation** - Official Revit API
10. **Multi-view models** - Enhanced reconstruction

---

## 10. API Integration Examples

### Example 1: Hugging Face Inference API (TripoSR)
```python
import requests

API_URL = "https://api-inference.huggingface.co/models/stabilityai/TripoSR"
headers = {"Authorization": f"Bearer {HF_API_KEY}"}

def generate_3d(image_url):
    response = requests.post(API_URL, headers=headers, json={"inputs": image_url})
    return response.content  # 3D mesh data
```

### Example 2: Segment Anything (SAM) via Segmind
```python
import requests

url = "https://api.segmind.com/v1/sam-img2img"
data = {
  "image": "base64_encoded_image",
  "prompt": "furniture"
}
headers = {'x-api-key': API_KEY}

response = requests.post(url, json=data, headers=headers)
```

### Example 3: CadQuery for Parametric CAD
```python
import cadquery as cq

# Generate parametric chair
chair = (cq.Workplane("XY")
    .box(width, depth, height)
    .faces(">Z").workplane()
    .rect(seat_width, seat_depth)
    .extrude(seat_height))

# Export to STEP
chair.val().exportStep("chair.step")
```

### Example 4: ZoeDepth for Metric Depth
```python
import torch

model = torch.hub.load("isl-org/ZoeDepth", "ZoeD_N", pretrained=True)
depth = model.infer_pil(image)

# Extract scale information
metric_depth = depth.numpy()
```

---

## 11. Cost Analysis

### FREE Tier Options
- **TRELLIS-2**: Free demo, self-hosted free
- **TripoSR**: Free on Hugging Face
- **InstantMesh**: Free (open source)
- **SAM 3**: Free (Apache 2.0)
- **ZoeDepth**: Free
- **CadQuery**: Free
- **IfcOpenShell**: Free
- **OpenCV**: Free

### Commercial Free Tiers
- **Meshy.ai**: Limited free credits
- **Tripo3D**: Free tier available
- **Autodesk APS**: Monthly free usage cap
- **Hugging Face**: Rate-limited free inference

### Recommended for Production
- **Primary**: Self-hosted open source (TRELLIS-2, InstantMesh, SAM 3)
- **Backup**: Commercial APIs with free tiers (Meshy, Tripo3D)
- **Scale**: Replicate.com for managed hosting

---

## 12. Next Steps

1. **Integrate SAM 3** for automatic furniture segmentation
2. **Add ZoeDepth** for dimension estimation
3. **Implement TRELLIS-2/InstantMesh** alongside TripoSR
4. **Add CadQuery** for parametric CAD generation
5. **Explore IfcOpenShell** for BIM/IFC support
6. **Consider Point2CAD** for advanced features

---

## Sources

- [TRELLIS-2 - Microsoft Open-Source](https://trellis-2.org/)
- [TripoSR - GitHub VAST-AI-Research](https://github.com/VAST-AI-Research/TripoSR)
- [stabilityai/TripoSR - Hugging Face](https://huggingface.co/stabilityai/TripoSR)
- [InstantMesh - GitHub TencentARC](https://github.com/TencentARC/InstantMesh)
- [InstantMesh - Hugging Face Space](https://huggingface.co/spaces/TencentARC/InstantMesh)
- [Wonder3D - GitHub](https://github.com/xxlong0/Wonder3D)
- [Zero123++ - GitHub](https://github.com/SUDO-AI-3D/zero123plus)
- [Meshy AI](https://www.meshy.ai/)
- [Tripo AI](https://www.tripo3d.ai/)
- [MiDaS - GitHub isl-org](https://github.com/isl-org/MiDaS)
- [ZoeDepth - GitHub isl-org](https://github.com/isl-org/ZoeDepth)
- [Segment Anything - GitHub Meta](https://github.com/facebookresearch/segment-anything)
- [Meta AI SAM 3 Announcement](https://ai.meta.com/blog/segment-anything-model-3/)
- [Point2CAD - GitHub ETH Zurich](https://github.com/prs-eth/point2cad)
- [CadQuery - GitHub](https://github.com/CadQuery/cadquery)
- [CadQuery Documentation](https://cadquery.readthedocs.io/)
- [IfcOpenShell](https://ifcopenshell.org/)
- [IfcOpenShell - GitHub](https://github.com/IfcOpenShell/IfcOpenShell)
- [Autodesk Platform Services](https://aps.autodesk.com/)
- [PyImageSearch - Measuring Object Size](https://pyimagesearch.com/2016/03/28/measuring-size-of-objects-in-an-image-with-opencv/)
- [OpenCV Object Measurement - GitHub](https://github.com/Practical-CV/Measuring-Size-of-Objects-with-OpenCV)
