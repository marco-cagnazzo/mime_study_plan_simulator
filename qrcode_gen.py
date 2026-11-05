import qrcode
from qrcode.image.svg import SvgPathImage

# 1. Inserisci l'URL pubblico della tua repository o pagina GitHub Pages

import qrcode
from PIL import Image

# 1. Configurazione link e percorso del file logo
GITHUB_URL = "https://marco-cagnazzo.github.io/mime_study_plan_simulator/"
LOGO_PATH = "logo-red-200.png"  # Può essere PNG con trasparenza, JPG, ecc.
OUTPUT_PATH = "qr_mime_with_logo.png"

# 2. Generazione del QR code con correzione d'errore massima (H = 30%)
qr = qrcode.QRCode(
    version=None,
    error_correction=qrcode.constants.ERROR_CORRECT_H,
    box_size=12,  # Rende l'immagine sufficientemente grande e nitida
    border=4
)
qr.add_data(GITHUB_URL)
qr.make(fit=True)

# Crea l'immagine base in RGB (necessario per gestire colori e loghi)
qr_img = qr.make_image(fill_color="black", back_color="white").convert("RGB")
qr_img.save("qr_github.png")
qr_svg = qrcode.QRCode(
    version=None,
    error_correction=qrcode.constants.ERROR_CORRECT_H,
    box_size=10,
    border=4,
    image_factory=SvgPathImage
)
qr_svg.add_data(GITHUB_URL)
qr_svg.make(fit=True)
img_svg = qr_svg.make_image()
img_svg.save("qr_github.svg")
# 3. Caricamento e ridimensionamento del logo
logo = Image.open(LOGO_PATH)

# Calcola la dimensione ideale: max 22% della larghezza del QR code
qr_width, qr_height = qr_img.size
max_logo_size = int(qr_width * 0.22)

# Mantiene le proporzioni originali del logo
logo.thumbnail((max_logo_size, max_logo_size), Image.Resampling.LANCZOS)

# 4. Calcolo delle coordinate centrali per il posizionamento
logo_w, logo_h = logo.size
pos_x = (qr_width - logo_w) // 2
pos_y = (qr_height - logo_h) // 2

# 5. Sovrapposizione del logo (gestendo l'eventuale canale alfa/trasparenza)
if logo.mode in ("RGBA", "LA"):
    qr_img.paste(logo, (pos_x, pos_y), mask=logo)
else    :
    qr_img.paste(logo, (pos_x, pos_y))

# 6. Salvataggio del risultato finale
qr_img.save(OUTPUT_PATH, quality=95)
print(f"QR Code con logo salvato con successo in: {OUTPUT_PATH}")