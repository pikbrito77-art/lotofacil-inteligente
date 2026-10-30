#!/usr/bin/env python3
"""
Script para converter SVGs para PNGs necessários pelo Expo
Requer: pip install cairosvg pillow
"""

import os
import subprocess
import sys

def convert_svg_to_png(svg_path, png_path, width, height):
    """Converte SVG para PNG usando cairosvg"""
    try:
        import cairosvg
        cairosvg.svg2png(
            url=svg_path,
            write_to=png_path,
            output_width=width,
            output_height=height
        )
        print(f"✅ {svg_path} -> {png_path} ({width}x{height})")
        return True
    except ImportError:
        print("❌ cairosvg não instalado. Execute: pip install cairosvg")
        return False
    except Exception as e:
        print(f"❌ Erro ao converter {svg_path}: {e}")
        return False

def main():
    assets_dir = os.path.join(os.path.dirname(__file__), 'assets')
    
    # Verifica se cairosvg está disponível
    try:
        import cairosvg
    except ImportError:
        print("Instalando cairosvg...")
        subprocess.check_call([sys.executable, '-m', 'pip', 'install', 'cairosvg', 'pillow'])
        import cairosvg
    
    conversions = [
        # (svg_file, png_file, width, height)
        ('icon.svg', 'icon.png', 1024, 1024),
        ('icon.svg', 'adaptive-icon.png', 432, 432),
        ('splash.svg', 'splash.png', 1284, 2778),
        ('favicon.svg', 'favicon.png', 32, 32),
    ]
    
    print("🔄 Convertendo assets SVG para PNG...\n")
    
    success = 0
    for svg_file, png_file, w, h in conversions:
        svg_path = os.path.join(assets_dir, svg_file)
        png_path = os.path.join(assets_dir, png_file)
        
        if os.path.exists(svg_path):
            if convert_svg_to_png(svg_path, png_path, w, h):
                success += 1
        else:
            print(f"⚠️  {svg_file} não encontrado")
    
    print(f"\n✅ {success}/{len(conversions)} conversões concluídas")
    
    # Verifica se todos os PNGs necessários existem
    required = ['icon.png', 'adaptive-icon.png', 'splash.png', 'favicon.png']
    missing = [f for f in required if not os.path.exists(os.path.join(assets_dir, f))]
    
    if missing:
        print(f"\n⚠️  Arquivos ainda faltando: {', '.join(missing)}")
        print("   O Expo pode gerar automaticamente no build, mas recomenda-se ter os PNGs.")
    else:
        print("\n🎉 Todos os assets prontos para uso!")

if __name__ == '__main__':
    main()