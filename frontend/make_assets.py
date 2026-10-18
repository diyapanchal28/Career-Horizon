import matplotlib.pyplot as plt
import numpy as np
from PIL import Image
import os

public_dir = r"d:\MiniProject_MscIT\Career-Horizon\Career-Horizon\frontend\public"
assets_dir = r"d:\MiniProject_MscIT\Career-Horizon\Career-Horizon\frontend\src\assets"
os.makedirs(assets_dir, exist_ok=True)

# 1. Load the transparent trimmed full logo
trimmed_path = os.path.join(public_dir, "test_trimmed.png")
full_img = Image.open(trimmed_path)
W_full, H_full = full_img.size

# Save logo.png
full_img.save(os.path.join(public_dir, "logo.png"))
full_img.save(os.path.join(assets_dir, "logo.png"))

# 2. Extract icon
icon_img = full_img.crop((0, 0, 155, 155))
icon_img.save(os.path.join(public_dir, "logo-icon.png"))
icon_img.save(os.path.join(assets_dir, "logo-icon.png"))

# 3. White variations
arr = np.array(full_img)
white_text_arr = arr.copy()
mask_text = (white_text_arr[:, 170:, 3] > 0)
white_text_arr[:, 170:, 0][mask_text] = 255
white_text_arr[:, 170:, 1][mask_text] = 255
white_text_arr[:, 170:, 2][mask_text] = 255
white_logo = Image.fromarray(white_text_arr, "RGBA")
white_logo.save(os.path.join(public_dir, "logo-white.png"))
white_logo.save(os.path.join(assets_dir, "logo-white.png"))

icon_arr = np.array(icon_img)
icon_white_arr = icon_arr.copy()
mask_icon = (icon_white_arr[:, :, 3] > 0)
icon_white_arr[:, :, 0][mask_icon] = 255
icon_white_arr[:, :, 1][mask_icon] = 255
icon_white_arr[:, :, 2][mask_icon] = 255
icon_white = Image.fromarray(icon_white_arr, "RGBA")
icon_white.save(os.path.join(public_dir, "logo-icon-white.png"))
icon_white.save(os.path.join(assets_dir, "logo-icon-white.png"))

# RDP for open & closed contours
def rdp_open(points, epsilon=0.25):
    if len(points) < 3:
        return points
    start = points[0]
    end = points[-1]
    diff = end - start
    denom = np.hypot(diff[0], diff[1]) + 1e-12
    dists = np.abs(diff[0] * (points[:, 1] - start[1]) - diff[1] * (points[:, 0] - start[0])) / denom
    idx = np.argmax(dists)
    if dists[idx] > epsilon:
        left = rdp_open(points[:idx+1], epsilon)
        right = rdp_open(points[idx:], epsilon)
        return np.vstack((left[:-1], right))
    else:
        return np.vstack((start, end))

def rdp_closed(points, epsilon=0.25):
    if np.allclose(points[0], points[-1]) and len(points) > 3:
        dists = np.hypot(points[:, 0] - points[0, 0], points[:, 1] - points[0, 1])
        furthest_idx = np.argmax(dists)
        part1 = rdp_open(points[:furthest_idx+1], epsilon)
        part2 = rdp_open(points[furthest_idx:], epsilon)
        return np.vstack((part1[:-1], part2))
    return rdp_open(points, epsilon)

pad = 4

# Generate vector icon
alpha_icon = icon_arr[:, :, 3] / 255.0
padded_icon = np.pad(alpha_icon, pad, mode='constant', constant_values=0)
fig, ax = plt.subplots()
cs_icon = ax.contour(padded_icon, levels=[0.5])
allsegs_icon = cs_icon.allsegs[0]
plt.close(fig)

icon_paths = []
for seg in allsegs_icon:
    unpadded = seg - pad
    unpadded[:, 0] = np.clip(unpadded[:, 0], 0, 155)
    unpadded[:, 1] = np.clip(unpadded[:, 1], 0, 155)
    simplified = rdp_closed(unpadded, epsilon=0.25)
    coords = [f"{p[0]:.2f} {p[1]:.2f}" for p in simplified]
    icon_paths.append("M " + " L ".join(coords) + " Z")

icon_d = " ".join(icon_paths)

svg_icon = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 155 155" width="155" height="155" fill="none">
  <path fill-rule="evenodd" clip-rule="evenodd" d="{icon_d}" fill="#874ced" />
</svg>'''

svg_icon_white = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 155 155" width="155" height="155" fill="none">
  <path fill-rule="evenodd" clip-rule="evenodd" d="{icon_d}" fill="#ffffff" />
</svg>'''

favicon_svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 155 155" width="32" height="32" fill="none">
  <path fill-rule="evenodd" clip-rule="evenodd" d="{icon_d}" fill="#874ced" />
</svg>'''

with open(os.path.join(public_dir, "logo-icon.svg"), "w") as f:
    f.write(svg_icon)
with open(os.path.join(assets_dir, "logo-icon.svg"), "w") as f:
    f.write(svg_icon)
with open(os.path.join(public_dir, "logo-icon-white.svg"), "w") as f:
    f.write(svg_icon_white)
with open(os.path.join(assets_dir, "logo-icon-white.svg"), "w") as f:
    f.write(svg_icon_white)
with open(os.path.join(public_dir, "favicon.svg"), "w") as f:
    f.write(favicon_svg)

# Full logo vector
alpha_full = arr[:, :, 3] / 255.0
padded_full = np.pad(alpha_full, pad, mode='constant', constant_values=0)
fig, ax = plt.subplots()
cs_full = ax.contour(padded_full, levels=[0.5])
allsegs_full = cs_full.allsegs[0]
plt.close(fig)

full_icon_paths = []
full_text_paths = []

for seg in allsegs_full:
    unpadded = seg - pad
    unpadded[:, 0] = np.clip(unpadded[:, 0], 0, W_full)
    unpadded[:, 1] = np.clip(unpadded[:, 1], 0, H_full)
    cx = unpadded[:, 0].mean()
    simplified = rdp_closed(unpadded, epsilon=0.25)
    coords = [f"{p[0]:.2f} {p[1]:.2f}" for p in simplified]
    path_str = "M " + " L ".join(coords) + " Z"
    if cx < 165:
        full_icon_paths.append(path_str)
    else:
        full_text_paths.append(path_str)

full_icon_d = " ".join(full_icon_paths)
full_text_d = " ".join(full_text_paths)

svg_full = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W_full} {H_full}" width="{W_full}" height="{H_full}" fill="none">
  <path fill-rule="evenodd" clip-rule="evenodd" d="{full_icon_d}" fill="#874ced" />
  <path fill-rule="evenodd" clip-rule="evenodd" d="{full_text_d}" fill="#1d1732" />
</svg>'''

svg_full_white = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W_full} {H_full}" width="{W_full}" height="{H_full}" fill="none">
  <path fill-rule="evenodd" clip-rule="evenodd" d="{full_icon_d}" fill="#874ced" />
  <path fill-rule="evenodd" clip-rule="evenodd" d="{full_text_d}" fill="#ffffff" />
</svg>'''

with open(os.path.join(public_dir, "logo.svg"), "w") as f:
    f.write(svg_full)
with open(os.path.join(assets_dir, "logo.svg"), "w") as f:
    f.write(svg_full)
with open(os.path.join(public_dir, "logo-white.svg"), "w") as f:
    f.write(svg_full_white)
with open(os.path.join(assets_dir, "logo-white.svg"), "w") as f:
    f.write(svg_full_white)

# Clean up temporary test files
for tmp in ["test_icon.png", "test_full.png", "test_trimmed.png"]:
    p = os.path.join(public_dir, tmp)
    if os.path.exists(p):
        os.remove(p)

print("Generated all vector and raster assets successfully!")
