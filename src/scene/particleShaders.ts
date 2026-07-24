/**
 * Soft attenuated points — circular falloff + distance-based gl_PointSize.
 * Morph between Shape A (sphere) and Shape B (grid) via uMorph when GPU path is used.
 */
export const particleVertexShader = /* glsl */ `
uniform float uSize;
uniform float uPixelRatio;
uniform float uMorph;
uniform float uAttenuation;

attribute vec3 aPositionB;

varying float vAlpha;

void main() {
  vec3 mixed = mix(position, aPositionB, clamp(uMorph, 0.0, 1.0));
  vec4 mvPosition = modelViewMatrix * vec4(mixed, 1.0);
  gl_Position = projectionMatrix * mvPosition;

  float dist = max(0.001, -mvPosition.z);
  // Soft perspective falloff — particles shrink smoothly into the distance
  float atten = uSize * uPixelRatio * (uAttenuation / dist);
  gl_PointSize = clamp(atten, 1.2, 48.0);

  // Fade slightly with distance so far points read softer
  vAlpha = clamp(2.4 / dist, 0.25, 1.0);
}
`

export const particleFragmentShader = /* glsl */ `
uniform vec3 uColor;
uniform float uOpacity;

varying float vAlpha;

void main() {
  // Soft circular sprite (not a hard square)
  vec2 uv = gl_PointCoord - vec2(0.5);
  float d = length(uv);
  float soft = smoothstep(0.5, 0.12, d);
  if (soft < 0.01) discard;

  float alpha = soft * uOpacity * vAlpha;
  gl_FragColor = vec4(uColor * soft, alpha);
}
`
