#!/usr/bin/env python3
"""
Ultra HD Portfolio Asset Generator
Creates high-quality artistic variations and effects from portrait image
"""

import cv2
import numpy as np
from PIL import Image, ImageFilter, ImageEnhance, ImageOps, ImageDraw, ImageFont
import os
import sys
from datetime import datetime

class UltraHDAssetGenerator:
    def __init__(self, input_path, output_dir="generated_assets_ultra"):
        self.input_path = input_path
        self.output_dir = output_dir
        self.img = None
        self.img_rgb = None
        self.width = 0
        self.height = 0
        
        # Create output directory
        os.makedirs(output_dir, exist_ok=True)
        
        # Load image
        self.load_image()
    
    def load_image(self):
        """Load and prepare image"""
        self.img = cv2.imread(self.input_path)
        if self.img is None:
            raise ValueError(f"Could not load image from {self.input_path}")
        
        # Convert to RGB for PIL
        self.img_rgb = cv2.cvtColor(self.img, cv2.COLOR_BGR2RGB)
        self.height, self.width = self.img.shape[:2]
        print(f"Loaded image: {self.width}x{self.height}")
    
    def save(self, img, filename, quality=95):
        """Save image with high quality"""
        output_path = os.path.join(self.output_dir, filename)
        if isinstance(img, np.ndarray):
            cv2.imwrite(output_path, img, [cv2.IMWRITE_PNG_COMPRESSION, 3])
        else:
            img.save(output_path, 'PNG', optimize=True)
        print(f"  ✓ Saved: {filename}")
        return output_path
    
    def generate_depth_map_advanced(self):
        """Generate high-quality depth map with multiple techniques"""
        print("\n🔹 Generating Advanced Depth Map...")
        
        gray = cv2.cvtColor(self.img, cv2.COLOR_BGR2GRAY)
        
        # Multi-scale edge detection
        edges1 = cv2.Canny(gray, 50, 150)
        edges2 = cv2.Canny(gray, 30, 100)
        edges = cv2.addWeighted(edges1, 0.7, edges2, 0.3, 0)
        
        # Morphological operations for better structure
        kernel = np.ones((5,5), np.uint8)
        edges = cv2.morphologyEx(edges, cv2.MORPH_CLOSE, kernel)
        edges = cv2.morphologyEx(edges, cv2.MORPH_OPEN, kernel)
        
        # Distance transform
        dist = cv2.distanceTransform(255 - edges, cv2.DIST_L2, 5)
        
        # Multi-scale blur for depth levels
        blur1 = cv2.GaussianBlur(gray, (5, 5), 0)
        blur2 = cv2.GaussianBlur(gray, (15, 15), 0)
        blur3 = cv2.GaussianBlur(gray, (31, 31), 0)
        
        # Combine depth cues
        detail = cv2.subtract(gray, blur1)
        medium = cv2.subtract(blur1, blur2)
        coarse = cv2.subtract(blur2, blur3)
        
        depth = cv2.addWeighted(dist, 0.4, coarse.astype(np.float32), 0.3, 0)
        depth = cv2.add(depth, medium.astype(np.float32) * 0.2)
        depth = cv2.add(depth, detail.astype(np.float32) * 0.1)
        
        # Enhance with bilateral filter for edge preservation
        depth = cv2.bilateralFilter(depth.astype(np.uint8), 9, 75, 75)
        
        # Normalize
        depth = cv2.normalize(depth, None, 0, 255, cv2.NORM_MINMAX).astype(np.uint8)
        
        # Apply CLAHE for better contrast
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
        depth = clahe.apply(depth)
        
        self.save(depth, "depth_map_ultra.png")
        
        # Also save inverted version
        depth_inv = cv2.bitwise_not(depth)
        self.save(depth_inv, "depth_map_inverted.png")
        
        return depth
    
    def generate_edge_variations(self):
        """Generate various edge detection styles"""
        print("\n🔹 Generating Edge Variations...")
        
        gray = cv2.cvtColor(self.img, cv2.COLOR_BGR2GRAY)
        
        # Standard Canny edges
        edges = cv2.Canny(gray, 50, 150)
        edges_rgb = cv2.cvtColor(edges, cv2.COLOR_GRAY2BGR)
        self.save(edges_rgb, "edges_canny.png")
        
        # Sobel edges (gradient-based)
        sobelx = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=3)
        sobely = cv2.Sobel(gray, cv2.CV_64F, 0, 1, ksize=3)
        sobel = cv2.magnitude(sobelx, sobely)
        sobel = cv2.normalize(sobel, None, 0, 255, cv2.NORM_MINMAX).astype(np.uint8)
        self.save(cv2.cvtColor(sobel, cv2.COLOR_GRAY2BGR), "edges_sobel.png")
        
        # Laplacian edges (second derivative)
        laplacian = cv2.Laplacian(gray, cv2.CV_64F)
        laplacian = cv2.normalize(laplacian, None, 0, 255, cv2.NORM_MINMAX).astype(np.uint8)
        self.save(cv2.cvtColor(laplacian, cv2.COLOR_GRAY2BGR), "edges_laplacian.png")
        
        # Sketch effect
        inv_gray = cv2.bitwise_not(gray)
        blur = cv2.GaussianBlur(inv_gray, (21, 21), 0)
        sketch = cv2.divide(gray, 255 - blur, scale=256)
        self.save(cv2.cvtColor(sketch, cv2.COLOR_GRAY2BGR), "sketch_pencil.png")
        
        # Contour drawing
        contours, _ = cv2.findContours(edges, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
        contour_img = np.zeros_like(self.img)
        cv2.drawContours(contour_img, contours, -1, (255, 255, 255), 1)
        self.save(contour_img, "edges_contours.png")
    
    def generate_neon_effects(self):
        """Generate neon/glow effects"""
        print("\n🔹 Generating Neon Effects...")
        
        edges = cv2.Canny(cv2.cvtColor(self.img, cv2.COLOR_BGR2GRAY), 50, 150)
        
        # Blue neon
        neon_blue = np.zeros_like(self.img)
        neon_blue[edges > 0] = [255, 100, 50]  # BGR format
        neon_blue = cv2.GaussianBlur(neon_blue, (15, 15), 0)
        self.save(neon_blue, "neon_blue.png")
        
        # Pink/Cyan dual neon
        neon_dual = np.zeros_like(self.img)
        neon_dual[edges > 0] = [255, 50, 200]  # Pink
        neon_dual = cv2.GaussianBlur(neon_dual, (11, 11), 0)
        
        # Add cyan glow on one side
        cyan_shift = np.roll(neon_dual, 5, axis=1)
        cyan_shift[:, :, 0] = 200  # Blue
        cyan_shift[:, :, 1] = 255  # Green
        cyan_shift[:, :, 2] = 100  # Red
        neon_dual = cv2.addWeighted(neon_dual, 0.7, cyan_shift, 0.5, 0)
        self.save(neon_dual, "neon_dual_tone.png")
        
        # White neon with bloom
        white_neon = np.zeros_like(self.img)
        white_neon[edges > 0] = [255, 255, 255]
        for blur in [5, 11, 21]:
            bloom = cv2.GaussianBlur(white_neon, (blur, blur), 0)
            white_neon = cv2.addWeighted(white_neon, 1.0, bloom, 0.3, 0)
        self.save(white_neon, "neon_white_bloom.png")
    
    def generate_glitch_effects(self):
        """Generate digital glitch art variations"""
        print("\n🔹 Generating Glitch Effects...")
        
        h, w = self.height, self.width
        
        # RGB Split
        b, g, r = cv2.split(self.img)
        b_shift = np.roll(b, 10, axis=1)
        r_shift = np.roll(r, -10, axis=1)
        rgb_split = cv2.merge([b_shift, g, r_shift])
        self.save(rgb_split, "glitch_rgb_split.png")
        
        # Scan line corruption
        glitch_scan = self.img.copy()
        for i in range(0, h, 4):
            if np.random.random() > 0.7:
                shift = np.random.randint(-20, 20)
                glitch_scan[i:i+2, :] = np.roll(glitch_scan[i:i+2, :], shift, axis=1)
        self.save(glitch_scan, "glitch_scan_lines.png")
        
        # Data moshing effect
        glitch_mosh = self.img.copy()
        for _ in range(50):
            x = np.random.randint(0, w - 50)
            y = np.random.randint(0, h - 10)
            block = glitch_mosh[y:y+10, x:x+50].copy()
            x_shift = np.random.randint(-30, 30)
            x_start = max(0, min(x + x_shift, w - 50))
            glitch_mosh[y:y+10, x_start:x_start+50] = block
        self.save(glitch_mosh, "glitch_data_mosh.png")
        
        # VHS distortion
        vhs = self.img.copy()
        noise = np.random.normal(0, 25, vhs.shape).astype(np.uint8)
        vhs = cv2.add(vhs, noise)
        # Add chromatic aberration
        shift = 3
        vhs[:, :-shift, 0] = vhs[:, shift:, 0]  # Blue channel shift
        vhs[:, shift:, 2] = vhs[:, :-shift, 2]  # Red channel shift
        self.save(vhs, "glitch_vhs.png")
    
    def generate_halftone(self):
        """Generate halftone/dot patterns"""
        print("\n🔹 Generating Halftone Patterns...")
        
        gray = cv2.cvtColor(self.img, cv2.COLOR_BGR2GRAY)
        h, w = gray.shape
        
        # Standard halftone
        dot_size = 8
        halftone = np.ones((h, w), dtype=np.uint8) * 255
        
        for y in range(0, h, dot_size):
            for x in range(0, w, dot_size):
                avg = np.mean(gray[y:y+dot_size, x:x+dot_size])
                radius = int((1 - avg / 255) * (dot_size // 2))
                if radius > 0:
                    cv2.circle(halftone, (x + dot_size//2, y + dot_size//2), radius, 0, -1)
        
        self.save(cv2.cvtColor(halftone, cv2.COLOR_GRAY2BGR), "halftone_dots.png")
        
        # CMYK halftone simulation
        cmyk = np.zeros((h, w, 3), dtype=np.uint8)
        angles = [15, 75, 30, 45]  # CMYK angles
        colors = [[255, 0, 0], [0, 255, 0], [0, 0, 255], [128, 128, 128]]
        
        for i, (angle, color) in enumerate(zip(angles[:3], colors[:3])):
            layer = np.ones((h, w, 3), dtype=np.uint8) * 255
            for y in range(0, h, 10):
                for x in range(0, w, 10):
                    val = gray[y, x]
                    if i == 0:  # Cyan
                        intensity = 255 - val
                    elif i == 1:  # Magenta
                        intensity = val
                    else:  # Yellow
                        intensity = abs(128 - val) * 2
                    
                    radius = int((intensity / 255) * 4)
                    if radius > 0:
                        cv2.circle(layer, (x, y), radius, color, -1)
            
            cmyk = cv2.addWeighted(cmyk, 1.0, layer, 0.5, 0)
        
        self.save(cmyk, "halftone_cmyk.png")
    
    def generate_cinematic_grades(self):
        """Generate cinematic color grading variations"""
        print("\n🔹 Generating Cinematic Color Grades...")
        
        pil_img = Image.fromarray(cv2.cvtColor(self.img, cv2.COLOR_BGR2RGB))
        
        # Teal & Orange (Blockbuster look)
        teal_orange = pil_img.copy()
        r, g, b = teal_orange.split()
        r = r.point(lambda i: min(255, int(i * 1.1)))
        g = g.point(lambda i: int(i * 0.9))
        b = b.point(lambda i: min(255, int(i * 1.2)))
        teal_orange = Image.merge('RGB', (r, g, b))
        enhancer = ImageEnhance.Contrast(teal_orange)
        teal_orange = enhancer.enhance(1.2)
        self.save(teal_orange, "cinematic_teal_orange.png")
        
        # Film Noir (High contrast B&W)
        noir = ImageOps.grayscale(pil_img)
        enhancer = ImageEnhance.Contrast(noir)
        noir = enhancer.enhance(2.0)
        self.save(noir, "cinematic_noir.png")
        
        # Vintage/Warm
        vintage = pil_img.copy()
        r, g, b = vintage.split()
        r = r.point(lambda i: min(255, int(i * 1.15)))
        b = b.point(lambda i: int(i * 0.85))
        vintage = Image.merge('RGB', (r, g, b))
        enhancer = ImageEnhance.Color(vintage)
        vintage = enhancer.enhance(0.8)
        self.save(vintage, "cinematic_vintage.png")
        
        # Cyberpunk (High saturation, blue/purple)
        cyber = pil_img.copy()
        r, g, b = cyber.split()
        r = r.point(lambda i: min(255, int(i * 1.3)))
        g = g.point(lambda i: int(i * 0.8))
        b = b.point(lambda i: min(255, int(i * 1.4)))
        cyber = Image.merge('RGB', (r, g, b))
        enhancer = ImageEnhance.Color(cyber)
        cyber = enhancer.enhance(1.5)
        self.save(cyber, "cinematic_cyberpunk.png")
        
        # Bleach Bypass (Desaturated, high contrast)
        gray = ImageOps.grayscale(pil_img)
        bleach = Image.blend(pil_img, gray.convert('RGB'), 0.5)
        enhancer = ImageEnhance.Contrast(bleach)
        bleach = enhancer.enhance(1.4)
        self.save(bleach, "cinematic_bleach_bypass.png")
    
    def generate_embossed_effects(self):
        """Generate embossed and engraved effects"""
        print("\n🔹 Generating Embossed Effects...")
        
        gray = cv2.cvtColor(self.img, cv2.COLOR_BGR2GRAY)
        
        # Emboss
        kernel = np.array([[-2, -1, 0],
                          [-1,  1, 1],
                          [ 0,  1, 2]])
        embossed = cv2.filter2D(gray, -1, kernel) + 128
        embossed = cv2.cvtColor(embossed, cv2.COLOR_GRAY2BGR)
        self.save(embossed, "embossed_metal.png")
        
        # Engraved (inverted emboss)
        kernel_inv = np.array([[0, 1, 2],
                               [1, 1, -1],
                               [2, -1, -2]])
        engraved = cv2.filter2D(gray, -1, kernel_inv) + 128
        engraved = cv2.cvtColor(engraved, cv2.COLOR_GRAY2BGR)
        self.save(engraved, "engraved_stone.png")
        
        # 3D relief
        sobelx = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=3)
        sobely = cv2.Sobel(gray, cv2.CV_64F, 0, 1, ksize=3)
        gradient = cv2.magnitude(sobelx, sobely)
        gradient = cv2.normalize(gradient, None, 0, 255, cv2.NORM_MINMAX).astype(np.uint8)
        
        relief = np.zeros_like(self.img)
        for i in range(3):
            relief[:, :, i] = gradient
        self.save(relief, "embossed_relief.png")
    
    def generate_stylized_art(self):
        """Generate various artistic stylizations"""
        print("\n🔹 Generating Stylized Art...")
        
        # Watercolor effect
        watercolor = self.img.copy()
        watercolor = cv2.stylization(watercolor, sigma_s=60, sigma_r=0.6)
        self.save(watercolor, "art_watercolor.png")
        
        # Oil painting
        oil = cv2.xphoto.oilPainting(self.img, size=7, dynRatio=1)
        self.save(oil, "art_oil_painting.png")
        
        # Pencil sketch detailed
        gray = cv2.cvtColor(self.img, cv2.COLOR_BGR2GRAY)
        inv_gray = cv2.bitwise_not(gray)
        blur = cv2.GaussianBlur(inv_gray, (21, 21), 0)
        sketch = cv2.divide(gray, 255 - blur, scale=256)
        sketch_color = cv2.cvtColor(sketch, cv2.COLOR_GRAY2BGR)
        self.save(sketch_color, "art_pencil_color.png")
        
        # Cartoon effect
        gray = cv2.cvtColor(self.img, cv2.COLOR_BGR2GRAY)
        gray_blur = cv2.medianBlur(gray, 7)
        edges = cv2.adaptiveThreshold(gray_blur, 255, cv2.ADAPTIVE_THRESH_MEAN_C, cv2.THRESH_BINARY, 9, 9)
        color = cv2.bilateralFilter(self.img, 9, 250, 250)
        cartoon = cv2.bitwise_and(color, color, mask=edges)
        self.save(cartoon, "art_cartoon.png")
    
    def generate_alpha_masks(self):
        """Generate various alpha/mask versions"""
        print("\n🔹 Generating Alpha Masks...")
        
        gray = cv2.cvtColor(self.img, cv2.COLOR_BGR2GRAY)
        
        # Grayscale with alpha based on brightness
        rgba = cv2.cvtColor(self.img, cv2.COLOR_BGR2BGRA)
        alpha = cv2.bitwise_not(gray)  # Invert: darker = more opaque
        rgba[:, :, 3] = alpha
        self.save(rgba, "mask_alpha_gradient.png")
        
        # Silhouette
        _, silhouette = cv2.threshold(gray, 127, 255, cv2.THRESH_BINARY_INV)
        silhouette_rgba = cv2.cvtColor(self.img, cv2.COLOR_BGR2BGRA)
        silhouette_rgba[:, :, 3] = silhouette
        self.save(silhouette_rgba, "mask_silhouette.png")
        
        # Vignette mask
        h, w = gray.shape
        center_x, center_y = w // 2, h // 2
        Y, X = np.ogrid[:h, :w]
        dist_from_center = np.sqrt((X - center_x)**2 + (Y - center_y)**2)
        mask = 255 - cv2.normalize(dist_from_center, None, 0, 255, cv2.NORM_MINMAX).astype(np.uint8)
        vignette_rgba = cv2.cvtColor(self.img, cv2.COLOR_BGR2BGRA)
        vignette_rgba[:, :, 3] = mask
        self.save(vignette_rgba, "mask_vignette.png")
    
    def generate_all(self):
        """Generate all asset types"""
        print("=" * 60)
        print("ULTRA HD ASSET GENERATOR")
        print("=" * 60)
        print(f"Input: {self.input_path}")
        print(f"Output: {self.output_dir}/")
        print("=" * 60)
        
        try:
            self.generate_depth_map_advanced()
            self.generate_edge_variations()
            self.generate_neon_effects()
            self.generate_glitch_effects()
            self.generate_halftone()
            self.generate_cinematic_grades()
            self.generate_embossed_effects()
            self.generate_stylized_art()
            self.generate_alpha_masks()
            
            print("\n" + "=" * 60)
            print("✅ ALL ASSETS GENERATED SUCCESSFULLY!")
            print("=" * 60)
            print(f"\nOutput directory: {self.output_dir}/")
            print(f"Total assets: {len(os.listdir(self.output_dir))}")
            print("\nAsset categories:")
            print("  • Depth Maps (2)")
            print("  • Edge Variations (4)")
            print("  • Neon Effects (3)")
            print("  • Glitch Effects (4)")
            print("  • Halftone Patterns (2)")
            print("  • Cinematic Grades (5)")
            print("  • Embossed Effects (3)")
            print("  • Stylized Art (4)")
            print("  • Alpha Masks (3)")
            print("=" * 60)
            
        except Exception as e:
            print(f"\n❌ Error: {e}")
            import traceback
            traceback.print_exc()

def main():
    # Configuration
    input_image = "Subject.png"
    output_directory = "generated_assets_ultra"
    
    # Check if input exists
    if not os.path.exists(input_image):
        print(f"\n❌ Error: Input image '{input_image}' not found!")
        print(f"Please place your image as '{input_image}' in this directory.")
        return
    
    # Generate assets
    generator = UltraHDAssetGenerator(input_image, output_directory)
    generator.generate_all()

if __name__ == "__main__":
    main()