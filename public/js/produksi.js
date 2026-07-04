/**
 * public/js/produksi.js
 * Script interaktif untuk halaman Modul Produksi.
 * Menangani: tambah/hapus baris komponen, kalkulasi total modal otomatis.
 */

/** Tambah baris komponen baru dengan meng-clone baris pertama */
function tambahBaris() {
    const container = document.getElementById('komponen-container');
    const firstRow  = document.querySelector('.komponen-row').cloneNode(true);

    // Reset nilai baris baru
    firstRow.querySelector('select').value              = '';
    firstRow.querySelector('.komponen-qty').value       = '';
    firstRow.querySelector('.komponen-harga-hidden').value = '';

    container.appendChild(firstRow);
    hitungTotalModal();
}

/** Hapus baris komponen (minimal 1 baris harus ada) */
function hapusBaris(btn) {
    const rows = document.querySelectorAll('.komponen-row');
    if (rows.length > 1) {
        btn.closest('.komponen-row').remove();
        hitungTotalModal();
    } else {
        alert('Minimal harus ada satu komponen!');
    }
}

/** Hitung total modal secara otomatis berdasarkan pilihan & qty komponen */
function hitungTotalModal() {
    let total = 0;

    document.querySelectorAll('.komponen-row').forEach(baris => {
        const select      = baris.querySelector('.komponen-select');
        const qtyInput    = baris.querySelector('.komponen-qty');
        const hargaHidden = baris.querySelector('.komponen-harga-hidden');

        if (!select || !qtyInput) return;

        const opt         = select.options[select.selectedIndex];
        const hargaSatuan = parseFloat(opt?.getAttribute('data-harga')) || 0;
        const jumlah      = parseFloat(qtyInput.value) || 0;

        if (hargaHidden) hargaHidden.value = hargaSatuan;

        total += hargaSatuan * jumlah;
    });

    const display = document.getElementById('totalModalDisplay');
    if (display) display.value = Math.round(total);
}

// Hitung ulang setiap ada perubahan input di form produksi
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('formProduksi');
    if (form) {
        form.addEventListener('input',  hitungTotalModal);
        form.addEventListener('change', hitungTotalModal);
    }
});
