def metni_temizle_ve_bol(dosya_yolu, max_karakter=3500):
    with open(dosya_yolu, 'r', encoding='utf-8') as f:
        metin = f.read()

    # 1. Adım: Trim işlemi
    temiz_metin = ' '.join(metin.split())  # Tüm boşlukları ve yeni satırları tek boşlukla değiştirir

    # 2. Adım: Parçalara ayır
    parcalar = [temiz_metin[i:i+max_karakter] for i in range(0, len(temiz_metin), max_karakter)]

    # 3. Adım: Dosyalara yaz
    for idx, parca in enumerate(parcalar, 1):
        with open(f"parca_{idx}.txt", "w", encoding='utf-8') as f_out:
            f_out.write(parca)
        print(f"parca_{idx}.txt dosyası oluşturuldu ({len(parca)} karakter).")

# Örnek kullanım
metni_temizle_ve_bol("tum_dosyalarin_icerigi.txt", max_karakter=100000)
