#!/usr/bin/env python3
"""Convert GUINEAPIG.m4a to MP3."""

from pydub import AudioSegment
import os

src = 'attached_assets/GUINEAPIG.m4a'
dst = 'attached_assets/GUINEAPIG.mp3'

try:
    # Load the m4a file
    audio = AudioSegment.from_file(src, format='m4a')
    
    # Export as mp3
    audio.export(dst, format='mp3', bitrate='192k')
    
    if os.path.exists(dst):
        size = os.path.getsize(dst)
        print(f'✓ Successfully converted: {src} → {dst}')
        print(f'✓ File size: {size:,} bytes')
    else:
        print('✗ Conversion failed - file not created')
except Exception as e:
    print(f'✗ Error: {str(e)}')
