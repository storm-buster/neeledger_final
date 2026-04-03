# 🧠 Grad-CAM Explainability in NeeLedger's Vegetation Detection System

## Overview

NeeLedger employs a deep learning-based vegetation/mangrove detection pipeline that processes satellite RGB imagery to generate segmentation masks. To ensure transparency and auditability—critical for carbon credit verification—we integrate **Grad-CAM (Gradient-weighted Class Activation Mapping)** as our primary visual explainability layer.

---

## 1. What is Grad-CAM?

**Grad-CAM** is an explainability technique for convolutional neural networks (CNNs) that produces a **coarse localization heatmap** highlighting which spatial regions in an input image most influenced the model's prediction.

### Technical Definition

Grad-CAM computes the **gradient** of a target output (e.g., "mangrove" class score or segmentation logit) with respect to the **feature maps** of a chosen convolutional layer—typically the last layer before the classifier. These gradients are then:

1. **Global average pooled** to obtain importance weights per feature channel
2. **Linearly combined** with the feature maps
3. **ReLU-activated** to retain only positive contributions
4. **Upsampled** to match the input image resolution

The result: a heatmap showing **where** the model focused when making its prediction.

---

## 2. How Grad-CAM Works in Our Pipeline

### Step-by-Step Process

```
┌─────────────────────────────────────────────────────────────────────┐
│  SATELLITE RGB IMAGE                                                │
│  (e.g., 512×512 Sentinel-2 or drone imagery)                       │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│  STEP 1: FORWARD PASS                                               │
│  • Image passes through segmentation CNN (e.g., U-Net, DeepLabV3)  │
│  • Intermediate feature maps are captured at target layer          │
│  • Model outputs vegetation/mangrove segmentation mask             │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│  STEP 2: GRADIENT COMPUTATION                                       │
│  • Select target class or pixel region (e.g., "mangrove" mask)     │
│  • Backpropagate gradients to the target convolutional layer       │
│  • Compute: ∂y_target / ∂A^k  (gradient of output w.r.t. feature k)│
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│  STEP 3: IMPORTANCE WEIGHTING                                       │
│  • Global Average Pool each gradient tensor:                       │
│      α_k = (1/Z) Σᵢ Σⱼ (∂y / ∂A^k_ij)                             │
│  • α_k represents importance weight for feature map k              │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│  STEP 4: WEIGHTED COMBINATION                                       │
│  • Combine feature maps with their importance weights:             │
│      L_GradCAM = ReLU( Σₖ αₖ · A^k )                               │
│  • ReLU discards negative values (we want positive evidence only)  │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│  STEP 5: HEATMAP GENERATION & OVERLAY                               │
│  • Upsample L_GradCAM to input image size (512×512)                │
│  • Normalize to [0, 1] range                                       │
│  • Apply colormap (jet/viridis): red=high, blue=low               │
│  • Overlay semi-transparently on original satellite image          │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│  OUTPUT: EXPLAINABLE VISUALIZATION                                  │
│  • Original image + Grad-CAM heatmap overlay                       │
│  • Stored as: sample_cam.npy in neeledger_demo/                    │
└─────────────────────────────────────────────────────────────────────┘
```

### Demo Artifacts (in `neeledger_demo/`)

| File | Purpose |
|------|---------|
| `neeledger_model.pth` | Trained PyTorch segmentation model |
| `sample_rgb.npy` | Input satellite RGB image |
| `sample_pred.npy` | Model's predicted vegetation mask |
| `sample_ndvi.npy` | NDVI ground truth / proxy labels |
| `sample_cam.npy` | **Grad-CAM heatmap output** |

---

## 3. Why Grad-CAM is Valuable for This Project

### 3.1 Spatial Reasoning Verification

| Scenario | What Grad-CAM Reveals |
|----------|----------------------|
| ✅ **Correct focus** | Heatmap highlights mangrove/vegetation canopy regions |
| ⚠️ **Concerning focus** | Heatmap activates on water bodies, clouds, or infrastructure |
| ❌ **Unreliable model** | Random/scattered activations with no spatial coherence |

### 3.2 Trust & Auditability

For carbon credit verification, AI decisions alone are insufficient. Regulators and verifiers require:

- **Visual evidence** of model reasoning
- **Alignment validation** between predicted regions and ground truth
- **Traceable decision pathways** for audit trails

Grad-CAM provides this by answering: *"What did the model look at to make this prediction?"*

### 3.3 Integration with NDVI Validation

Our pipeline cross-references Grad-CAM activations against **NDVI (Normalized Difference Vegetation Index)** ground truth:

```
Alignment Score = IoU(Grad-CAM hotspots, NDVI > threshold)
```

A high alignment score (>0.7) indicates the model is focusing on actual vegetation, not artifacts.

---

## 4. Interpreting the Heatmap

### Color Scale

| Color | Activation Level | Interpretation |
|-------|-----------------|----------------|
| 🔴 **Red / Yellow** | High (0.7–1.0) | Strong model focus — primary decision drivers |
| 🟢 **Green** | Medium (0.4–0.7) | Moderate contribution to prediction |
| 🔵 **Blue / Purple** | Low (0.0–0.4) | Weak or negligible influence |

### Diagnostic Scenarios

| Heatmap Pattern | Diagnosis | Action |
|-----------------|-----------|--------|
| Red regions align with dense mangrove canopy | ✅ Model reasoning is spatially correct | Proceed with confidence |
| Red regions focus on water/tidal areas | ⚠️ Model may be confusing reflectance patterns | Flag for manual review |
| Scattered red spots across entire image | ❌ Model lacks spatial coherence | Reject / retrain model |
| Red regions on clouds or shadows | ⚠️ Model is confused by atmospheric artifacts | Apply preprocessing filters |

### Visual Example

```
┌──────────────────────────┬──────────────────────────┐
│   ORIGINAL SATELLITE     │   GRAD-CAM OVERLAY       │
│   ┌────────────────┐     │   ┌────────────────┐     │
│   │ 🌊 Water       │     │   │ ⬛ (blue/cold)  │     │
│   │ 🌳🌳 Mangrove  │     │   │ 🔴🔴 (red/hot)  │     │
│   │ 🏠 Settlement  │     │   │ ⬛ (blue/cold)  │     │
│   └────────────────┘     │   └────────────────┘     │
│                          │                          │
│   Interpretation: Model correctly focuses on        │
│   mangrove regions, ignoring water & settlement.    │
└──────────────────────────┴──────────────────────────┘
```

---

## 5. Why This Matters for Stakeholders

### For Regulators & Verification Agencies (ACVA)

- **Audit trail**: Every prediction includes a visual explanation
- **Compliance evidence**: Demonstrates AI is not a "black box"
- **Anomaly detection**: Quickly identify suspicious predictions

### For Investors & Carbon Credit Buyers

- **Due diligence**: Verify that AI-estimated carbon credits are based on sound spatial reasoning
- **Risk mitigation**: Grad-CAM misalignment flags potentially fraudulent claims
- **Transparency**: Builds confidence in the MRV (Monitoring, Reporting, Verification) pipeline

### For Project Proponents

- **Faster approval**: Clear explanations reduce back-and-forth with verifiers
- **Self-audit**: Identify issues before formal submission
- **Documentation**: Export Grad-CAM overlays for compliance reports

---

## 6. Limitations & Best Practices

### Limitations

| Limitation | Implication |
|------------|-------------|
| **Explanation ≠ Proof** | A good-looking heatmap does not guarantee the model is correct; it only shows where the model looked |
| **Coarse resolution** | Grad-CAM from early layers is spatially coarse; may miss fine-grained boundaries |
| **Class-specific** | Must be computed per-class; aggregated masks may dilute localization |
| **Not causal** | Shows correlation between features and output, not causation |

### Best Practices

1. **Always validate against ground truth**
   - Compare Grad-CAM hotspots with NDVI masks (`sample_ndvi.npy`)
   - Calculate IoU (Intersection over Union) for quantitative alignment

2. **Use alongside other metrics**
   - Combine with biomass confidence intervals from XGBoost
   - Cross-check with temporal change detection scores

3. **Flag discrepancies for human review**
   - If Grad-CAM alignment < 0.5, escalate to ACVA Manual Review
   - If Grad-CAM shows water focus, trigger Field Audit

4. **Version and archive explanations**
   - Store `sample_cam.npy` with each submission
   - Include in blockchain-anchored evidence hash

---

## 7. Summary

| Aspect | Description |
|--------|-------------|
| **What** | Grad-CAM generates spatial heatmaps showing where the model focuses |
| **How** | Gradient-weighted combination of feature maps, ReLU-activated, upsampled |
| **Why** | Provides visual, auditable evidence of model reasoning for carbon credit verification |
| **When to trust** | Heatmap aligns with vegetation regions and NDVI ground truth |
| **When to question** | Heatmap focuses on water, clouds, or random areas |
| **Role in pipeline** | Explainability layer between ML prediction and ACVA verification |

---

**Grad-CAM transforms NeeLedger's AI from a black box into a transparent, auditable decision-support tool—essential for building trust in carbon credit verification at scale.**
