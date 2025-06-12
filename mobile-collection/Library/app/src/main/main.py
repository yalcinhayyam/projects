import os

def dosyalari_tara_ve_yaz(dizin, uzantilar, cikti_dosyasi):
    with open(cikti_dosyasi, 'w', encoding='utf-8') as f_out:
        for root, dirs, files in os.walk(dizin):
            for dosya in files:
                if any(dosya.endswith(uzanti) for uzanti in uzantilar):
                    dosya_yolu = os.path.join(root, dosya)
                    try:
                        with open(dosya_yolu, 'r', encoding='utf-8') as f_in:
                            icerik = f_in.read()
                        f_out.write(f"=== {dosya_yolu} ===\n")
                        f_out.write(icerik + "\n\n")
                    except Exception as e:
                        f_out.write(f"*** {dosya_yolu} okunamadı: {str(e)} ***\n\n")

# Kullanım
hedef_klasor = "java"  # <- kendi klasör yolunu buraya yaz
dosya_uzantilari = ['.java']  # aranacak dosya türleri
cikti_dosya = "tum_dosyalarin_icerigi.txt"

dosyalari_tara_ve_yaz(hedef_klasor, dosya_uzantilari, cikti_dosya)
