#!/usr/bin/env python3
"""
Portfolio Image Asset Generator (Ultra-Compatible)
Generates high-impact assets for web 3D effects.
Run anywhere: Support for Pillow-only (no numpy/opencv required).
"""

import os
import sys
import math

try:
    from PIL import Image, ImageFilter, ImageEnhance, ImageChops, ImageDraw
    PIL_AVAILABLE = True
except ImportError:
    print("Error: Pillow (PIL) is required. Install with: pip install Pillow")
    sys.exit(1)

def ensure_dir(directory):
    if not os.path.exists(directory):
        os.makedirs(directory)

def create_glitch_asset(input_path, output_path, offset=15):
    """
    Creates a cyberpunk-style RGB split glitch.
    """
    print(f"Generating Glitch Asset: {output_path}...")
    try:
        img = Image.open(input_path).convert('RGB')
        r, g, b = img.split()
        r = ImageChops.offset(r, offset, 0)
        b = ImageChops.offset(b, -offset, 0)
        glitch_img = Image.merge('RGB', (r, g, b))
        glitch_img.save(output_path)
        print("✓ Glitch asset saved.")
        return True
    except Exception as e:
        print(f"Failed: {e}")
        return False

def create_pixel_asset(input_path, output_path, pixel_size=12):
    """
    Creates a pixelated version.
    """
    print(f"Generating Pixel Asset: {output_path}...")
    try:
        img = Image.open(input_path)
        w, h = img.size
        small = img.resize((w // pixel_size, h // pixel_size), Image.Resampling.NEAREST)
        pixelated = small.resize((w, h), Image.Resampling.NEAREST)
        pixelated.save(output_path)
        print("✓ Pixel asset saved.")
        return True
    except Exception as e:
        print(f"Failed: {e}")
        return False

def create_edge_map_asset(input_path, output_path):
    """
    Creates a high-contrast edge map (No-Numpy version).
    """
    print(f"Generating Edge Map: {output_path}...")
    try:
        img = Image.open(input_path).convert('L')
        # Simple convolution filter for edges
        edges = img.filter(ImageFilter.FIND_EDGES)
        # Enhance for visibility
        edges = ImageEnhance.Contrast(edges).enhance(5.0)
        edges.save(output_path)
        print("✓ Edge map saved.")
        return True
    except Exception as e:
        print(f"Failed: {e}")
        return False

def create_radial_gradient(size, center, radius, inner_color=255, outer_color=0):
    """
    Generates a radial gradient image using pure PIL (slow but compatible).
    """
    width, height = size
    cx, cy = center
    
    # Create new grayscale image
    img = Image.new('L', size)
    pixels = img.load()
    
    for y in range(height):
        for x in range(width):
            # Distance from center
            dist = math.sqrt((x - cx)**2 + (y - cy)**2)
            # Normalize 0 to 1
            norm = min(dist / radius, 1.0)
            # Interpolate
            val = int(inner_color * (1 - norm) + outer_color * norm)
            pixels[x, y] = val
            
    return img

def create_depth_map_heuristic(input_path, output_path):
    """
    Creates a heuristic depth map (No-Numpy version).
    """
    print(f"Generating Heuristic Depth Map: {output_path}...")
    try:
        img = Image.open(input_path).convert('L')
        w, h = img.size
        
        # Center of image
        center = (w // 2, h // 2)
        radius = math.sqrt((w/2)**2 + (h/2)**2)
        
        # Create radial gradient (255=close/white, 0=far/black)
        depth_img = create_radial_gradient((w, h), center, radius, 220, 30)
        
        # Blend with blurred original image for some shape detail
        detail = img.filter(ImageFilter.GaussianBlur(10))
        final_depth = Image.blend(depth_img, detail, 0.4)
        
        final_depth.save(output_path)
        print("✓ Depth map saved.")
        return True
    except Exception as e:
        print(f"Failed: {e}")
        return False

def main():
    print("=== Portfolio Asset Generator (Universal) ===")
    
    input_filename = "Subject.png"
    output_dir = "generated_assets"
    
    if not os.path.exists(input_filename):
        print(f"Error: Input file '{input_filename}' not found.")
        return

    ensure_dir(output_dir)
    
    create_glitch_asset(input_filename, os.path.join(output_dir, "subject_glitch.png"))
    create_pixel_asset(input_filename, os.path.join(output_dir, "subject_pixel.png"))
    create_edge_map_asset(input_filename, os.path.join(output_dir, "subject_edges.png"))
    create_depth_map_heuristic(input_filename, os.path.join(output_dir, "subject_depth.png"))
    
    print("\n=== Assets Generated ===")
    print(f"Location: {os.path.abspath(output_dir)}")

if __name__ == "__main__":
    main()