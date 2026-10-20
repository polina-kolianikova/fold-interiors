# FOLD design direction

## Art direction

Acid chartreuse, Klein blue, oversized moving poster typography and a small monospace annotation system make this a furniture campaign rather than a generic commerce template. GOOD and FORM split in opposite directions as the central object unfolds. The composition is centred and object-led. There is no card grid or decorative dashboard.

The chair is the main asset. A custom closed ribbon geometry follows a continuous curved profile from high back to rounded seat front. It has actual thickness, a separately modeled upholstered surface, piping, a darker formed shell, tubular metal sled frames, crossbars and glides. All important surfaces are modeled, so the user can rotate the chair beyond the hero angle.

## Scene sequence

| Chapter | Model state | Meaning |
| --- | --- | --- |
| Good form | Full chair, centred beneath huge poster type | An immediately recognizable sculptural product |
| Unfold | Upholstery and shell physically flatten into continuous sheets, then reform | The curve is derived from one surface |
| Your colour | The chair reunites, camera comes closer | Surface and colour change its character |
| A good place to land | Full object at a calm distance | Save an actual configured specification |

All transformations are derived from the native scroll coordinate. They remain reversible and can stop midway. Idle time does not advance the chapters. Position and normal morph targets unfold the original meshes into flat sheets on the GPU, retaining the same vertex identities. The layers then return to the original chair, rather than crossfading between unrelated models.

## Materials and performance

Bouclé detail is a generated canvas bump texture. Smooth finish changes the actual material roughness and bump contribution. The metal frame uses a separate reflective material. Directional shadows and cool fill reveal the continuous section. No large photos, remote models, texture downloads, video or postprocessing passes are required.

Shadow resolution is 1024 rather than 2048, and the shadow map updates only when the mesh shape or user orbit changes. Rendering is event-driven: once scroll and orbit converge, RAF stops. Hidden documents cancel the pending RAF; intersection state stops offscreen work. Desktop DPR starts at a maximum of 1.5, narrow screens at 1.15, with a conservative adaptive minimum of 0.8. The adaptation uses CPU render submission duration, not a claimed GPU or FPS measurement.

Hidden DOM diagnostics expose actual rendered frame count, draw calls, triangles, DPR and active, idle, hidden or offscreen state on documentElement.dataset.

## Interface

Every swatch is a real button with aria-pressed. The surface toggle changes the rendered surface and the specification. The native modal dialog supports Escape, focus containment and restoration. Saved files include the currently selected colour and material. No contact form pretends to place an order.

On narrow screens, the object occupies a lower dedicated visual zone beneath smaller titles. Configuration condenses to a bottom bar. A deliberate Turn 45° button avoids gesture competition with native vertical scroll. Reduced motion substitutes discrete chapter states for continuous movement. The local fallback SVG preserves a clear product silhouette.

## References and authorship

The reference principle is the same recognizable object moving between a whole product and a material breakdown, then returning to user control. The chair model, geometry, scene map, visual identity, text and texture are originally authored. No third party furniture brand or model is claimed.

## Verification boundaries

Source syntax and asset presence are independently checkable. Visual judgement, runtime interaction, frame cadence and physical phone behavior require browser/device observations. Do not equate source correctness with an observed high quality visual result.
