/**
 * public/js/dashboard.js
 * Script interaktif untuk halaman Dashboard.
 */

/** Auto-isi kolom SKU saat user memilih barang dari dropdown */
function updateSKU() {
    const select = document.getElementById('selectBarang');
    const skuInput = document.getElementById('inputSKU');
    const selectedOption = select.options[select.selectedIndex];
    skuInput.value = selectedOption.getAttribute('data-sku') || '';
}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.prevent-double-submit').forEach((form) => {
        form.addEventListener('submit', () => {
            const submitButton = form.querySelector('button[type="submit"]');
            if (!submitButton) return;

            submitButton.disabled = true;
            submitButton.dataset.originalText = submitButton.innerHTML;
            submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" aria-hidden="true"></span> Menyimpan...';
        });
    });
});
