// Extracted from inline <script> blocks

$(document).ready(function() {
            // Global variables for Excel processing
            let excelWorkbook = null;
            let currentSelectedMonth = ''; // Menyimpan bulan yang sedang dipilih
            
            // Theme toggle functionality
            const themeToggleBtn = $('#themeToggleBtn');
            const themeIcon = $('#themeIcon');
            const body = $('body');
            
            // Check for saved theme preference
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme === 'dark') {
                body.addClass('dark-theme');
                themeIcon.attr('src', 'https://img.icons8.com/?size=100&id=5WuayCnLJDW1&format=png&color=000000');
            }
            
            // Toggle theme
            themeToggleBtn.click(function() {
                body.toggleClass('dark-theme');
                
                if (body.hasClass('dark-theme')) {
                    localStorage.setItem('theme', 'dark');
                    themeIcon.attr('src', 'https://img.icons8.com/?size=100&id=5WuayCnLJDW1&format=png&color=000000');
                } else {
                    localStorage.setItem('theme', 'light');
                    themeIcon.attr('src', 'https://img.icons8.com/?size=100&id=dBVjWcKd58RU&format=png&color=000000');
                }
            });
            
            // Inisialisasi Flatpickr untuk Tanggal Lunas
            flatpickr("#tglLunas", {
                dateFormat: "d-m-Y",
                allowInput: true,
                locale: "id",
                onChange: function(selectedDates, dateStr, instance) {
                    // Otomatis tambahkan "Tgl. [tanggal]" ke field uraian
                    updateUraianWithDate();
                }
            });
            
            // Inisialisasi Flatpickr untuk Tanggal Pembelian
            flatpickr("#tglPembelian", {
                dateFormat: "d F Y",
                allowInput: true,
                locale: "id",
                onChange: function(selectedDates, dateStr, instance) {
                    updateUraianWithDate();
                }
            });
            
            // Inisialisasi Flatpickr untuk Edit Tanggal Lunas
            flatpickr("#editTglLunas", {
                dateFormat: "d-m-Y",
                allowInput: true,
                locale: "id",
                onChange: function(selectedDates, dateStr, instance) {
                    // Otomatis tambahkan "Tgl. [tanggal]" ke field uraian
                    updateEditUraianWithDate();
                }
            });
            
            // Inisialisasi Flatpickr untuk Edit Tanggal Pembelian
            flatpickr("#editTglPembelian", {
                dateFormat: "d F Y",
                allowInput: true,
                locale: "id",
                onChange: function(selectedDates, dateStr, instance) {
                    updateEditUraianWithDate();
                }
            });
            
            // Fungsi untuk menambahkan "Tgl. [tanggal]" ke field uraian
            function updateUraianWithDate() {
                let tglLunas = $('#tglPembelian').val();
                let uraian = $('#uraianTrans').val();
                
                // Hapus format "Tgl. DD-MM-YYYY" jika sudah ada
                uraian = uraian.replace(/ Tgl\. \d{2}-\d{2}-\d{4}/g, '');
                
                // Tambahkan format "Tgl. DD-MM-YYYY" di akhir
                if (tglLunas) {
                    $('#uraianTrans').val(uraian + ' Tgl. ' + tglLunas);
                }
            }
            
            // Fungsi untuk menambahkan "Tgl. [tanggal]" ke field edit uraian
            function updateEditUraianWithDate() {
                let tglLunas = $('#editTglPembelian').val();
                let uraian = $('#editUraian').val();
                
                // Hapus format "Tgl. DD-MM-YYYY" jika sudah ada
                uraian = uraian.replace(/ Tgl\. \d{2}-\d{2}-\d{4}/g, '');
                
                // Tambahkan format "Tgl. DD-MM-YYYY" di akhir
                if (tglLunas) {
                    $('#editUraian').val(uraian + ' Tgl. ' + tglLunas);
                }
            }
            
            // Event listener untuk field uraian (mencegah penghapusan otomatis saat user mengedit)
            $('#uraianTrans').on('input', function() {
                // Biarkan user mengedit tanpa intervensi
            });
            
            // Event listener untuk field edit uraian (mencegah penghapusan otomatis saat user mengedit)
            $('#editUraian').on('input', function() {
                // Biarkan user mengedit tanpa intervensi
            });
            
            // Generate No Kode dari No Bukti
            $('#noBukti').on('input', function() {
                let noBukti = $(this).val();
                if(noBukti.length >= 3) {
                    $('#noKode').val(noBukti.slice(-3));
                } else {
                    $('#noKode').val('');
                }
            });
            
            // Generate No Kode dari No Bukti (Edit Form)
            $('#editNoBukti').on('input', function() {
                let noBukti = $(this).val();
                if(noBukti.length >= 3) {
                    $('#editNoKode').val(noBukti.slice(-3));
                } else {
                    $('#editNoKode').val('');
                }
            });
            
            // Format input harga dengan autofit
            $('.currency-input input').on('keyup', function(e) {
                // Skip for arrow keys
                if([37, 38, 39, 40].indexOf(e.keyCode) > -1) return;
                
                // Format number
                let value = $(this).val().replace(/\D/g, "");
                $(this).val(formatRupiah(value));
                
                // Autofit width based on content
                $(this).css('width', 'auto');
                $(this).css('width', $(this).outerWidth() + 20);
            });

            // Upload file Excel (robust)
            $('#uploadFromEmpty').off('click').on('click', function() {
                $('#fileUpload').trigger('click');
            });

            $('#fileUpload').off('change').on('change', function(e) {
                const f = e.target.files && e.target.files[0];
                if (!f) return;

                // Validasi tipe file
                const validTypes = ['.xlsx', '.xls', '.xlsm', '.csv'];
                const fileExtension = '.' + f.name.split('.').pop().toLowerCase();
                
                if (!validTypes.includes(fileExtension)) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Format File Tidak Valid',
                        text: 'Silakan pilih file Excel (.xlsx, .xls, .xlsm) atau CSV (.csv)',
                        confirmButtonText: 'OK'
                    });
                    return;
                }

                // Tampilkan loading overlay
                $('#loadingOverlay').addClass('active');

                // Proses file dengan delay tipis agar animasi muncul
                setTimeout(function() {
                    try {
                        processExcelFile(f);
                    } catch(err){
                        console.error('Gagal memproses Excel (awal):', err);
                        Swal.fire({
                            icon: 'error', 
                            title: 'Gagal memuat Excel', 
                            text: 'Terjadi kesalahan saat memproses file: ' + String(err)
                        });
                        $('#loadingOverlay').removeClass('active');
                    }
                }, 150);
            });

            // Filter bulan
            $('#bulanFilter').change(function() {
                let selectedMonth = $(this).val();
                currentSelectedMonth = selectedMonth; // Simpan bulan yang dipilih
                
                if (selectedMonth) {
                    applyMonthFilter(selectedMonth);
                } else {
                    // Reset filter
                    resetMonthFilter();
                }
            });
            
            // Fungsi untuk mendeteksi dan merender baris grup
            function appendGroupRow(rincian) {
                // Hitung jumlah kolom di thead
                let columnCount = $('#excelDataTable thead th').length;
                
                // Buat baris grup dengan colspan
                const groupRow = `
                    <tr class="group-row">
                        <td class="group-cell" colspan="${columnCount}">${rincian}</td>
                    </tr>
                `;
                $('#excelDataTable tbody').append(groupRow);
            }
            
            // Utility untuk membersihkan nilai numerik
            function parseNumber(value) {
                if (value === null || value === undefined) return 0;
                
                // Jika sudah berupa angka, kembalikan langsung
                if (typeof value === 'number') return value;
                
                // Jika string, bersihkan dari format Rupiah dan titik
                let cleanValue = value.toString().trim();
                
                // Hapus "Rp " jika ada
                cleanValue = cleanValue.replace('Rp ', '');
                
                // Hapus titik pemisah ribuan
                cleanValue = cleanValue.replace(/\./g, '');
                
                // Konversi ke angka
                return parseFloat(cleanValue) || 0;
            }
            
            // Utility untuk format Rupiah
            function formatRupiah(angka) {
                if(!angka) return '0';
                
                let number_string = angka.toString().replace(/[^,\d]/g, '').toString();
                let split = number_string.split(',');
                let sisa = split[0].length % 3;
                let rupiah = split[0].substr(0, sisa);
                let ribuan = split[0].substr(sisa).match(/\d{3}/gi);
                    
                if(ribuan){
                    let separator = sisa ? '.' : '';
                    rupiah += separator + ribuan.join('.');
                }
                
                rupiah = split[1] != undefined ? rupiah + ',' + split[1] : rupiah;
                return rupiah;
            }
            
            // Fungsi untuk menerapkan filter bulan
            function applyMonthFilter(selectedMonth) {
                let totalAmount = 0;
                let hasVisibleRows = false;
                
                // Update header harga dengan nama bulan yang dipilih
                $('#hargaHeader').text(selectedMonth);
                
                // Loop semua baris di tbody
                $('#excelDataTable tbody tr').each(function() {
                    let row = $(this);
                    
                    // Jika ini adalah baris grup, selalu tampilkan
                    if (row.hasClass('group-row')) {
                        row.show();
                        return; // Lanjut ke baris berikutnya
                    }
                    
                    // Untuk baris item, ambil nilai bulan
                    let monthCell = row.find('.month-price').data(selectedMonth.toLowerCase());
                    
                    // Definisikan nilai invalid
                    const invalidValues = [null, undefined, '-', '0', 0, '', ' '];
                    
                    // Cek apakah nilai bulan valid
                    let isValid = true;
                    if (invalidValues.includes(monthCell) || 
                        (typeof monthCell === 'string' && invalidValues.includes(monthCell.toString().trim()))) {
                        isValid = false;
                    }
                    
                    if (isValid) {
                        // Ambil harga asli
                        let hargaAsliText = row.find('.harga-asli').val();
                        let hargaAsli = parseNumber(hargaAsliText);
                        
                        // Set nilai tampilan harga bulan
                        let monthValue = parseNumber(monthCell);
                        row.find('.harga-bulan-text').text('Rp ' + formatRupiah(monthValue.toString()));
                        
                        // Untuk baris tanpa bullet, hitung volume
                        let rincian = '';
                        if (row.find('td:eq(1) .rincian-text').length > 0) {
                            rincian = row.find('td:eq(1) .rincian-text').text();
                        } else {
                            rincian = row.find('td:eq(1)').text();
                        }
                        
                        if (!rincian.startsWith('•')) {
                            // Hitung volume jika harga asli > 0
                            let volume = 0;
                            if (hargaAsli > 0) {
                                volume = Math.round(monthValue / hargaAsli);
                            }
                            row.find('.volume-text').text(volume);
                        }
                        
                        // Tambahkan ke total
                        totalAmount += monthValue;
                        hasVisibleRows = true;
                        
                        // Tampilkan baris
                        row.show();
                    } else {
                        // Sembunyikan baris
                        row.hide();
                    }
                });
                
                // Update total bulan
                $('#monthTotal').text('Rp ' + formatRupiah(totalAmount.toString()));
                
                // Tampilkan atau sembunyikan pesan "tidak ada data"
                if (hasVisibleRows) {
                    $('#noDataMessage').hide();
                    $('#excelDataTable').show();
                } else {
                    $('#noDataMessage').show();
                    $('#excelDataTable').hide();
                }
            }
            
            // Fungsi untuk reset filter bulan
            function resetMonthFilter() {
                currentSelectedMonth = ''; // Reset bulan yang dipilih
                
                // Reset header harga
                $('#hargaHeader').text('BULAN');
                
                // Loop semua baris di tbody
                $('#excelDataTable tbody tr').each(function() {
                    let row = $(this);
                    
                    // Jika ini adalah baris grup, tampilkan
                    if (row.hasClass('group-row')) {
                        row.show();
                        return; // Lanjut ke baris berikutnya
                    }
                    
                    // Untuk baris item, reset ke nilai default
                    let hargaAsliText = row.find('.harga-asli').val();
                    let hargaAsli = parseNumber(hargaAsliText);
                    
                    // Reset harga ke harga satuan asli
                    row.find('.harga-bulan-text').text('Rp ' + formatRupiah(hargaAsli.toString()));
                    
                    // Reset volume
                    let rincian = '';
                    if (row.find('td:eq(1) .rincian-text').length > 0) {
                        rincian = row.find('td:eq(1) .rincian-text').text();
                    } else {
                        rincian = row.find('td:eq(1)').text();
                    }
                    
                    let volume = 0;
                    if (!rincian.startsWith('•')) {
                        if (hargaAsli > 0) {
                            volume = 1; // Default volume = 1
                        }
                        row.find('.volume-text').text(volume);
                    }
                    
                    // Tampilkan baris
                    row.show();
                });
                
                // Reset total bulan
                $('#monthTotal').text('Rp 0');
                
                // Sembunyikan pesan "tidak ada data"
                $('#noDataMessage').hide();
                $('#excelDataTable').show();
            }
            
            // Event click pada baris tabel RKAS untuk memindahkan data ke X-Arkas
            $(document).on('click', '#excelDataTable tbody tr', function(e) {
                // Skip if clicking on any checkbox or switch button
                // Clicking the apple‑switch is used only to mark a row as transferred and should not trigger data transfer
                if ($(e.target).is('input') || $(e.target).closest('.apple-switch').length > 0) return;
                
                // Skip if this is a group row
                if ($(this).hasClass('group-row')) return;
                
                // Ambil data dari baris yang diklik
                let rincian = $(this).find('td:eq(1) .rincian-text').text();
                if (!rincian) {
                    rincian = $(this).find('td:eq(1)').text();
                }
                
                let hargaText = $(this).find('td:eq(3) .harga-satuan-text').text();
                
                // Hapus format Rp untuk mendapatkan angka asli
                let hargaAsli = hargaText.replace('Rp ', '').replace(/\./g, '');
                
                // Isi form X-Arkas
                $('#uraianTrans').val(rincian);
                // Format jumlah dengan pemisah ribuan
                $('#jumlah').val(formatRupiah(hargaAsli));
                
                // Tambahkan "Tgl. [tanggal]" jika tanggal lunas sudah diisi
                updateUraianWithDate();
                
                // Tampilkan notifikasi sukses
                Swal.fire({
                    icon: 'success',
                    title: 'Berhasil',
                    text: 'Data telah dipindahkan ke X-Arkas!',
                    timer: 1500,
                    showConfirmButton: false
                });
            });
            
            // Simpan data
            $('#simpanBtn').click(function() {
                // Validasi form - No Bukti tidak wajib diisi
                if ($('#tglLunas').val() === '' || $('#tglPembelian').val() === '') {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Peringatan',
                        text: 'Harap isi Tanggal Lunas dan Tanggal Pembelian!',
                        confirmButtonText: 'OK'
                    });
                    return;
                }
                
                // Periksa apakah tabel memiliki baris data
                let tableBody = $('#savedTable tbody');
                let hasData = tableBody.find('tr').length > 0;
                
                // Jika tidak ada data, hapus baris "Tidak ada data"
                if (!hasData || (hasData && tableBody.find('td[colspan]').length > 0)) {
                    tableBody.empty();
                }
                
                // Tambahkan "Dibayarkan " pada uraian
                (function(){
                    var node = document.getElementById('uraianTrans');
                    var raw = '';
                    if (window.jQuery && $('#uraianTrans').length && typeof $('#uraianTrans').val === 'function') {
                        raw = $('#uraianTrans').val();
                    } else if (node) {
                        raw = (node.value !== undefined ? node.value : (node.textContent || ''));
                    }
                    raw = (raw || '').trim();
                    window.__lastUraianDenganPrefix = raw ? ('Dibayarkan ' + raw) : 'Dibayarkan';
                })();
                
                // Gunakan nilai yang telah ditangkap sebagai uraian untuk template
                let uraianDenganPrefix = window.__lastUraianDenganPrefix || 'Dibayarkan';
                
                // Ambil data sub uraian dari hidden input
                let subUraianLines = $('#subUraianTrans').val().split('\n').filter(line => line.trim() !== '');
                let subUraianJson = JSON.stringify(subUraianLines);
                
                // Format jumlah dengan pemisah ribuan untuk tampilan
                let jumlahValRaw = $('#jumlah').val().replace(/[^0-9]/g, '');
                let jumlahFormatted = formatRupiah(jumlahValRaw);

                // Tambahkan data ke tabel tersimpan di bagian bawah
                let newRow = `
                    <tr>
                        <td>${$('#noBukti').val()}</td>
                        <td>${$('#noKode').val()}</td>
                        <td>${$('#tglLunas').val()}</td>
                        <td>${$('#tglPembelian').val()}</td>
                        <td>${uraianDenganPrefix}</td>
                        <td>Rp ${jumlahFormatted}</td>
                        <td>${$('#namaPegawai').val()}</td>
                        <td>${$('#belanja').val()}</td>
                        <td class="table-actions">
                            <button class="btn btn-sm btn-info sub-uraian-btn" title="Lihat Sub Uraian" data-suburaian='${subUraianJson.replace(/'/g, "&#39;")}'>
                                <i class="fas fa-list"></i>
                            </button>
                            <button class="btn btn-sm btn-warning edit-btn" title="Edit">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-danger delete-btn" title="Hapus">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `;
                
                // Tambahkan data di bagian bawah (append)
                tableBody.append(newRow);
                
                // Reset form
                $('#transactionForm')[0].reset();
                $('#noKode').val('');
                $('#namaPegawai').val('');
                $('#belanja').val('');
                
                // Reset sub uraian
                $('#subUraianList').empty();
                $('#subUraianTrans').val('');
                
                // Reset checkbox setelah simpan berhasil - PERBAIKAN 1
                $('.row-checkbox-rkas-right').prop('checked', false);
                $('#selectAllRKASRight').prop('checked', false);
                $('#selectedNotification').removeClass('show');
                $('#gabungkanBtn').removeClass('show');
                $('#selectedTotal').text('Rp 0');
                
                // Update sub uraian setelah reset checkbox
                if (typeof renderSubUraianFromSelection === 'function') {
                    renderSubUraianFromSelection();
                }
                
                // Attach delete event to new button
                attachEventHandlers();
                
                // Update total amount
                updateTotalAmount();
                
                Swal.fire({
                    icon: 'success',
                    title: 'Berhasil',
                    text: 'Data berhasil disimpan!',
                    timer: 1500,
                    showConfirmButton: false
                });
            });
            
            // Hapus data
            $('#hapusBtn').click(function() {
                showConfirm('Hapus Data', 'Apakah Anda yakin ingin menghapus semua data?', function() {
                    $('#transactionForm')[0].reset();
                    $('#noKode').val('');
                    $('#namaPegawai').val('');
                    $('#belanja').val('');
                    
                    Swal.fire({
                        icon: 'success',
                        title: 'Berhasil',
                        text: 'Data telah dihapus!',
                        timer: 1500,
                        showConfirmButton: false
                    });
                });
            });
            
            // Fungsi untuk menambahkan event handlers
            function attachEventHandlers() {
                // Delete button for saved data
                $('.delete-btn').off('click').on('click', function() {
                    let row = $(this).closest('tr');
                    showConfirm('Hapus Data', 'Apakah Anda yakin ingin menghapus data ini?', function() {
                        row.remove();
                        
                        // Update total amount
                        updateTotalAmount();
                        
                        // Jika tidak ada data lagi, tampilkan pesan "Tidak ada data"
                        if ($('#savedTable tbody tr').length === 0) {
                            $('#savedTable tbody').append('<tr><td colspan="9" class="text-center">Tidak ada data</td></tr>');
                            $('#totalRow').hide();
                        }
                    });
                });
                
                // Edit button for saved data
                $('.edit-btn').off('click').on('click', function() {
                    let row = $(this).closest('tr');
                    
                    // Ambil data dari baris yang dipilih
                    let noBukti = row.find('td:eq(0)').text();
                    let noKode = row.find('td:eq(1)').text();
                    let tglLunas = row.find('td:eq(2)').text();
                    let tglPembelian = row.find('td:eq(3)').text();
                    let uraian = row.find('td:eq(4)').text().replace('Dibayarkan ', ''); // Hapus prefix "Dibayarkan "
                    let jumlah = row.find('td:eq(5)').text().replace('Rp ', '');
                    let namaPegawai = row.find('td:eq(6)').text();
                    let belanja = row.find('td:eq(7)').text();
                    
                    // Isi form edit dengan data yang ada
                    $('#editNoBukti').val(noBukti);
                    $('#editNoKode').val(noKode);
                    $('#editTglLunas').val(tglLunas);
                    $('#editTglPembelian').val(tglPembelian);
                    $('#editUraian').val(uraian);
                    $('#editJumlah').val(jumlah);
                    $('#editNamaPegawai').val(namaPegawai);
                    $('#editBelanja').val(belanja);
                    
                    // Simpan referensi ke baris yang sedang diedit
                    $('#editForm').data('row', row);
                    
                    // Tampilkan modal edit
                    $('#editModal').show();
                });
                
                // Sub Uraian button for saved data
                $('.sub-uraian-btn').off('click').on('click', function() {
                    let subUraianJson = $(this).attr('data-suburaian');
                    let subUraianData = [];
                    
                    try {
                        subUraianData = JSON.parse(subUraianJson);
                    } catch(e) {
                        console.error('Error parsing sub uraian data:', e);
                        subUraianData = [];
                    }
                    
                    // Tampilkan data di modal
                    let tbody = $('#subUraianModalTbody');
                    tbody.empty();
                    
                    if (subUraianData.length === 0) {
                        tbody.append('<tr><td colspan="4" class="text-center">Tidak ada sub uraian</td></tr>');
                    } else {
                        subUraianData.forEach(function(item, index) {
                            // Parse item untuk mendapatkan komponen
                            let parts = item.split(' - ');
                            let uraian = parts[0] || '';
                            let volume = parts[1] || '';
                            let harga = parts[2] || '';
                            let jumlah = parts[3] || '';
                            
                            tbody.append(`
                                <tr>
                                    <td>${uraian}</td>
                                    <td>${volume}</td>
                                    <td>${harga}</td>
                                    <td>${jumlah}</td>
                                </tr>
                            `);
                        });
                    }
                    
                    // Tampilkan modal
                    var modal = new bootstrap.Modal(document.getElementById('subUraianModal'));
                    modal.show();
                });
            }
            
            // Function to update selected total for RKAS table (right checkboxes only)
            function updateSelectedTotalRKASRight() {
                let totalAmount = 0;
                
                $('.row-checkbox-rkas-right:checked').each(function() {
                    let row = $(this).closest('tr');
                    let hargaText = row.find('.harga-bulan-text').text();
                    let harga = parseFloat(hargaText.replace('Rp ', '').replace(/\./g, '')) || 0;
                    totalAmount += harga;
                });
                
                $('#selectedTotal').text('Rp ' + formatRupiah(totalAmount.toString()));
                
                if ($('.row-checkbox-rkas-right:checked').length > 0) {
                    $('#selectedNotification').addClass('show');
                    $('#gabungkanBtn').addClass('show');
                } else {
                    $('#selectedNotification').removeClass('show');
                    $('#gabungkanBtn').removeClass('show');
                }
            }
            
            // Select all checkbox functionality for RKAS table (right)
            $('#selectAllRKASRight').change(function() {
                $('.row-checkbox-rkas-right').prop('checked', $(this).prop('checked'));
                updateSelectedTotalRKASRight();
            });
            
            // Select all checkbox functionality for RKAS table (left)
            $('#selectAllRKAS').change(function() {
                const isChecked = $(this).prop('checked');
                $('.row-checkbox-rkas').each(function() {
                    $(this).prop('checked', isChecked);
                    const $switch = $(this).closest('.apple-switch');
                    const $row = $(this).closest('tr');
                    if (isChecked) {
                        // apply transferred state
                        $switch.css('background-color', 'var(--switch-transferred)');
                        $row.addClass('transferred');
                    } else {
                        // reset state
                        $switch.css('background-color', 'var(--switch-inactive)');
                        $row.removeClass('transferred');
                    }
                });
            });
            
            // Fungsi untuk mengupdate total amount
            function updateTotalAmount() {
                let total = 0;
                
                $('#savedTable tbody tr').each(function() {
                    // Skip the "no data" row
                    if ($(this).find('td[colspan]').length > 0) return;
                    
                    let amountText = $(this).find('td:eq(5)').text().replace('Rp ', '').replace(/\./g, '');
                    let amount = parseFloat(amountText) || 0;
                    total += amount;
                });
                
                // Update total amount display
                $('#totalAmount').text('Rp ' + formatRupiah(total.toString()));
                
                // Show or hide total row based on whether there's data
                if ($('#savedTable tbody tr').length > 0 && !$('#savedTable tbody tr').find('td[colspan]').length) {
                    $('#totalRow').show();
                } else {
                    $('#totalRow').hide();
                }
            }
            
            // Inisialisasi event handlers
            attachEventHandlers();
            
            // Export Excel untuk data tersimpan - PERBAIKAN 3
            $('#exportExcelBtn').click(function(e) {
                e.preventDefault();
                
                // Kumpulkan data utama dan sub uraian untuk diekspor dalam dua sheet
                let dataMain = [];
                let subUraianRows = [];
                let colorByNoBukti = {};
                let colorIndex = 0;
                const colorPalette = [
    'FFFFCCCC', // pale red
    'FFCCFFFF', // pale blue
    'FFC6EFCE', // pale green
    'FFEAD1DC', // pale pink
    'FFFFFFCC', // pale yellow
    'FFE2EFDA', // mint green
    'FFD9D2E9', // pale purple
    'FFFCE4D6', // light peach
    'FFDAEEF3', // pale teal
    'FFF2F2F2'  // light gray
];

                $('#savedTable tbody tr').each(function() {
                    // Lewati baris "Tidak ada data"
                    if ($(this).find('td[colspan]').length > 0) return;

                    const $td = $(this).find('td');
                    const noBukti = $td.eq(0).text();
                    const noKode  = $td.eq(1).text();
                    const tglLunas = $td.eq(2).text();
                    const tglPemb  = $td.eq(3).text();
                    const uraianInduk = $td.eq(4).text();
                    // Konversi jumlah ke angka agar Excel mengenali sebagai numerik
                    const jumlah = parseInt($td.eq(5).text().replace(/Rp\s*/, '').replace(/\./g, ''), 10) || 0;
                    const namaPegawai = $td.eq(6).text();
                    const belanja = $td.eq(7).text();

                    // Ambil sub uraian dari tombol aksi pada baris ini
                    let subBtn = $(this).find('.sub-uraian-btn');
                    let subJsonStr = subBtn.attr('data-suburaian');
                    let subArray = [];
                    if (subJsonStr) {
                        subJsonStr = subJsonStr.replace(/&#39;/g, "'");
                        try { subArray = JSON.parse(subJsonStr); } catch(e) { subArray = []; }
                    }

                    // Tambah ke sheet Data Tersimpan
                    dataMain.push({
                        'No Bukti': noBukti,
                        'No Kode': noKode,
                        'Tanggal Lunas': tglLunas,
                        'Tanggal Pembelian': tglPemb,
                        'Uraian': uraianInduk,
                        'Jumlah': jumlah,
                        'Nama Pegawai': namaPegawai,
                        'Belanja': belanja,
                        '__HAS_SUB__': subArray.length > 0 // flag internal untuk pewarnaan
                    });

                    // Jika ada sub uraian, alokasikan warna untuk No Bukti ini
                    if (subArray.length > 0 && !colorByNoBukti[noBukti]) {
                        colorByNoBukti[noBukti] = colorPalette[colorIndex % colorPalette.length];
                        colorIndex++;
                    }

                    // Pecah setiap baris sub uraian jadi kolom target; konversi nominal ke angka
                    subArray.forEach(function(line){
                        let parts = line.split(' - ');
                        let rincian = parts[0] || '';
                        let volSat  = parts[1] || '';
                        let hargaS  = parts[2] ? parseInt(parts[2].replace(/Rp\.?\s*/gi, '').replace(/\./g, ''), 10) || 0 : 0;
                        let jumlahS = parts[3] ? parseInt(parts[3].replace(/Rp\.?\s*/gi, '').replace(/\./g, ''), 10) || 0 : 0;
                        subUraianRows.push({
                            'No Bukti': noBukti,
                            'Uraian Induk': uraianInduk,
                            'Rincian': rincian,
                            'Volume & Satuan': volSat,
                            'Harga Satuan': hargaS,
                            'Jumlah': jumlahS
                        });
                    });
                });

                // Buat workbook baru
                const wb = XLSX.utils.book_new();

                // ===== Sheet 1: Data Tersimpan =====
                const wsMain = XLSX.utils.json_to_sheet(dataMain.map(({__HAS_SUB__, ...rest}) => rest));
                // Terapkan format angka ribuan untuk kolom Jumlah di sheet Data Tersimpan
                (function(){
                    if (dataMain.length > 0) {
                        const keys = Object.keys(dataMain[0]).filter(k => k !== '__HAS_SUB__');
                        const jumlahIdx = keys.indexOf('Jumlah');
                        if (jumlahIdx >= 0) {
                            dataMain.forEach(function(row, idx) {
                                const addr = XLSX.utils.encode_cell({ r: idx + 1, c: jumlahIdx });
                                const cell = wsMain[addr];
                                if (cell && typeof cell.v === 'number') {
                                    cell.z = '#,##0';
                                }
                            });
                        }
                    }
                })();

                // Warnai baris yang punya sub uraian (berdasarkan No Bukti)
                if (dataMain.length > 0) {
                    const keyList = Object.keys(dataMain[0]).filter(k => k !== '__HAS_SUB__');
                    dataMain.forEach((row, rIdx) => {
                        if (!row.__HAS_SUB__) return; // hanya baris yang ada sub
                        const noBukti = row['No Bukti'];
                        const color = colorByNoBukti[noBukti];
                        if (!color) return;
                        for (let cIdx = 0; cIdx < keyList.length; cIdx++) {
                            const addr = XLSX.utils.encode_cell({ r: rIdx + 1, c: cIdx });
                            if (!wsMain[addr]) continue;
                            wsMain[addr].s = Object.assign({}, wsMain[addr].s, {
                                fill: { patternType: 'solid', fgColor: { rgb: color } }
                            });
                        }
                    });
                }

                // ===== Sheet 2: Sub Uraian =====
                const headers = ['No Bukti','Uraian Induk','Rincian','Volume & Satuan','Harga Satuan','Jumlah'];
                const wsSub = XLSX.utils.aoa_to_sheet([headers]);
                subUraianRows.forEach((row, i) => {
                    const arr = headers.map(h => row[h] || '');
                    XLSX.utils.sheet_add_aoa(wsSub, [arr], { origin: { r: i+1, c: 0 } });
                    const color = colorByNoBukti[row['No Bukti']];
                    if (color) {
                        for (let c=0; c<headers.length; c++) {
                            const addr = XLSX.utils.encode_cell({ r: i+1, c });
                            if (!wsSub[addr]) continue;
                            wsSub[addr].s = Object.assign({}, wsSub[addr].s, {
                                fill: { patternType: 'solid', fgColor: { rgb: color } }
                            });
                        }
                    }
                });

                // Terapkan format angka ribuan pada kolom Harga Satuan dan Jumlah di sheet Sub Uraian
                (function(){
                    const rowCount = subUraianRows.length;
                    for (let r=1; r<=rowCount; r++) {
                        const hargaAddr = XLSX.utils.encode_cell({ r: r, c: 4 });
                        const jumlahAddr = XLSX.utils.encode_cell({ r: r, c: 5 });
                        const cellH = wsSub[hargaAddr];
                        if (cellH && typeof cellH.v === 'number') cellH.z = '#,##0';
                        const cellJ = wsSub[jumlahAddr];
                        if (cellJ && typeof cellJ.v === 'number') cellJ.z = '#,##0';
                    }
                })();

                // Tambahkan sheet dan simpan
                XLSX.utils.book_append_sheet(wb, wsMain, 'Data Tersimpan');
                XLSX.utils.book_append_sheet(wb, wsSub, 'Sub Uraian');
                XLSX.writeFile(wb, 'DataTersimpan_SubUraian_Berwarna.xlsx');

                // Tampilkan notifikasi sukses
                Swal.fire({
                    icon: 'success',
                    title: 'Berhasil',
                    text: 'Data berhasil diexport dengan 2 sheet + warna!'
                });
            });
            
            // Export PDF untuk data tersimpan
            $('#exportPdfBtn').click(function(e) {
                e.preventDefault();
                
                const { jsPDF } = window.jspdf;
                const doc = new jsPDF();
                
                // Judul
                doc.setFontSize(18);
                doc.text('Data Tersimpan', 105, 15, { align: 'center' });
                
                // Tanggal
                doc.setFontSize(10);
                doc.text(`Dicetak pada: ${new Date().toLocaleDateString('id-ID')}`, 105, 25, { align: 'center' });
                
                // Data tabel
                let data = [];
                $('#savedTable tbody tr').each(function() {
                    // Lewati baris "Tidak ada data"
                    if ($(this).find('td[colspan]').length > 0) return;
                    
                    let row = [
                        $(this).find('td:eq(0)').text(),
                        $(this).find('td:eq(1)').text(),
                        $(this).find('td:eq(2)').text(),
                        $(this).find('td:eq(3)').text(),
                        $(this).find('td:eq(4)').text(),
                        $(this).find('td:eq(5)').text(),
                        $(this).find('td:eq(6)').text(),
                        $(this).find('td:eq(7)').text()
                    ];
                    data.push(row);
                });
                
                // Header tabel
                let headers = [
                    'No Bukti',
                    'No Kode',
                    'Tanggal Lunas',
                    'Tanggal Pembelian',
                    'Uraian',
                    'Jumlah',
                    'Nama Pegawai',
                    'Belanja'
                ];
                
                // Buat tabel
                doc.autoTable({
                    head: [headers],
                    body: data,
                    startY: 30,
                    theme: 'grid',
                    styles: {
                        fontSize: 9,
                        cellPadding: 3
                    },
                    headStyles: {
                        fillColor: [106, 87, 255],
                        textColor: 255
                    }
                });
                
                // Add total row if there's data
                if (data.length > 0) {
                    let finalY = doc.lastAutoTable.finalY + 10;
                    
                    // Calculate total
                    let total = 0;
                    $('#savedTable tbody tr').each(function() {
                        if ($(this).find('td[colspan]').length > 0) return;
                        
                        let amountText = $(this).find('td:eq(5)').text().replace('Rp ', '').replace(/\./g, '');
                        let amount = parseFloat(amountText) || 0;
                        total += amount;
                    });
                    
                    // Add total row
                    doc.autoTable({
                        body: [
                            [
                                { content: 'Jumlah/Total', colSpan: 6, styles: { halign: 'right', fontStyle: 'bold' } },
                                { content: 'Rp ' + formatRupiah(total.toString()), styles: { fontStyle: 'bold', halign: 'right' } },
                                ''
                            ]
                        ],
                        startY: finalY,
                        theme: 'grid',
                        styles: {
                            fontSize: 9,
                            cellPadding: 3,
                            fillColor: [248, 249, 250]
                        }
                    });
                }
                
                // Save PDF
                doc.save('data_tersimpan_export.pdf');
            });
            
            // Export RKAS data - DIPERBAIKI
            $('#exportRKASBtn').click(function() {
                // Kumpulkan dan format data dari tabel RKAS (mencakup baris grup dan baris item) agar nilai nominal berupa angka dan baris grup diberi tanda & warna
                let dataToExport = [];

                $('#excelDataTable tbody tr:visible').each(function() {
                    const $row = $(this);
                    const isGroup = $row.hasClass('group-row');
                    let rowData = {};
                    if (isGroup) {
                        // Sertakan baris grup; gunakan teks dari sel grup dan tandai untuk pewarnaan
                        const groupText = $row.find('.group-cell').text().trim();
                        rowData['No'] = '';
                        rowData['Rincian'] = groupText.startsWith('•') ? groupText : ('• ' + groupText);
                        rowData['Volume'] = '';
                        rowData['Harga Satuan'] = '';
                        if (currentSelectedMonth) {
                            rowData[currentSelectedMonth] = '';
                        } else {
                            rowData['Bulan'] = '';
                        }
                        rowData.__GROUP__ = true;
                    } else {
                        // Ambil data baris item; konversikan nominal menjadi angka
                        const noText = $row.find('td:eq(0)').text();
                        const rincianText = $row.find('td:eq(1) .rincian-text').text() || $row.find('td:eq(1)').text();
                        const volumeText = $row.find('td:eq(2) .volume-text').text() || '';
                        const hargaText = $row.find('td:eq(3) .harga-satuan-text').text().replace(/Rp\s*/, '').replace(/\./g, '');
                        const hargaSatuan = parseInt(hargaText, 10) || 0;
                        rowData['No'] = noText;
                        rowData['Rincian'] = rincianText;
                        rowData['Volume'] = volumeText;
                        rowData['Harga Satuan'] = hargaSatuan;
                        if (currentSelectedMonth) {
                            const monthText = $row.find('td:eq(4) .harga-bulan-text').text().replace(/Rp\s*/, '').replace(/\./g, '');
                            const monthVal = parseInt(monthText, 10) || 0;
                            rowData[currentSelectedMonth] = monthVal;
                        } else {
                            rowData['Bulan'] = hargaSatuan;
                        }
                    }
                    dataToExport.push(rowData);
                });

                // Hilangkan properti internal dan buat worksheet
                const rowsForSheet = dataToExport.map(({__GROUP__, ...rest}) => rest);
                const ws = XLSX.utils.json_to_sheet(rowsForSheet);
                // Terapkan format angka ribuan pada kolom Harga Satuan dan kolom bulan untuk sheet Data RKAS
                (function(){
                    if (rowsForSheet.length > 0) {
                        const keys = Object.keys(rowsForSheet[0]);
                        keys.forEach(function(key, cIdx) {
                            if (key === 'Harga Satuan' || key === (currentSelectedMonth || 'Bulan')) {
                                for (let rIdx = 1; rIdx <= rowsForSheet.length; rIdx++) {
                                    const addr = XLSX.utils.encode_cell({ r: rIdx, c: cIdx });
                                    const cell = ws[addr];
                                    if (cell && typeof cell.v === 'number') {
                                        cell.z = '#,##0';
                                    }
                                }
                            }
                        });
                    }
                })();

                // Warnai baris grup dengan warna biru pastel
                if (dataToExport.length > 0) {
                    const keyList = Object.keys(rowsForSheet[0]);
                    dataToExport.forEach((row, rIdx) => {
                        if (!row.__GROUP__) return;
                        const color = 'CCE5FF'; // biru pastel
                        for (let cIdx = 0; cIdx < keyList.length; cIdx++) {
                            const addr = XLSX.utils.encode_cell({ r: rIdx + 1, c: cIdx });
                            if (!ws[addr]) continue;
                            ws[addr].s = Object.assign({}, ws[addr].s || {}, {
                                fill: { patternType: 'solid', fgColor: { rgb: color } }
                            });
                        }
                    });
                }

                // Buat workbook dan tambahkan sheet
                const wb = XLSX.utils.book_new();
                // Terapkan format angka ribuan untuk kolom nominal di sheet RKAS
                (function(){
                    if (rowsForSheet.length > 0) {
                        const headerKeys = Object.keys(rowsForSheet[0]);
                        const hargaIdx = headerKeys.indexOf('Harga Satuan');
                        // Ambil index kolom bulan (atau "Bulan" jika tidak ada pilihan khusus)
                        let bulanIdx = -1;
                        if (currentSelectedMonth) {
                            bulanIdx = headerKeys.indexOf(currentSelectedMonth);
                        } else {
                            bulanIdx = headerKeys.indexOf('Bulan');
                        }
                        for (let r = 1; r <= rowsForSheet.length; r++) {
                            [hargaIdx, bulanIdx].forEach(function(cIdx) {
                                if (cIdx >= 0) {
                                    const addr = XLSX.utils.encode_cell({ r: r, c: cIdx });
                                    const cell = ws[addr];
                                    if (cell && typeof cell.v === 'number') {
                                        cell.z = '#,##0';
                                    }
                                }
                            });
                        }
                    }
                })();
                XLSX.utils.book_append_sheet(wb, ws, 'Data RKAS');

                // Ekspor ke file Excel
                XLSX.writeFile(wb, 'data_rkas_export.xlsx');

                // Tampilkan animasi sukses
                $('#successAnimation').addClass('active');
                setTimeout(function() {
                    $('#successAnimation').removeClass('active');
                }, 2000);
            });
            
            // Fungsi untuk memproses file Excel
            function processExcelFile(file) {
                if (!file) return;
                // Primary reader: try reading as ArrayBuffer and parse with type:"array".
                const reader = new FileReader();
                reader.onload = function (e) {
                    try {
                        const data = new Uint8Array(e.target.result);
                        const workbook = XLSX.read(data, { type: 'array' });
                        handleWorkbook(workbook);
                    } catch (err) {
                        console.warn('Parsing as array failed, falling back to binary string...', err);
                        // Fallback reader: read as binary string and parse with type:"binary".
                        const reader2 = new FileReader();
                        reader2.onload = function (ev) {
                            try {
                                const workbook2 = XLSX.read(ev.target.result, { type: 'binary' });
                                handleWorkbook(workbook2);
                            } catch (err2) {
                                console.error('Gagal memuat Excel:', err2);
                                Swal.fire({ icon: 'error', title: 'Gagal memuat Excel', text: String(err2) });
                                $('#loadingOverlay').removeClass('active');
                            }
                        };
                        reader2.onerror = function (err2) {
                            console.error('FileReader binary error:', err2);
                            Swal.fire({ icon: 'error', title: 'Gagal membaca file', text: String(err2) });
                            $('#loadingOverlay').removeClass('active');
                        };
                        reader2.readAsBinaryString(file);
                    }
                };
                reader.onerror = function (err) {
                    console.error('FileReader array error:', err);
                    Swal.fire({ icon: 'error', title: 'Gagal membaca file', text: String(err) });
                    $('#loadingOverlay').removeClass('active');
                };
                reader.readAsArrayBuffer(file);
            }

            // Helper: populate the RKAS table from a parsed workbook and hide/show overlays.
            function handleWorkbook(workbook) {
                excelWorkbook = workbook;
                if (!excelWorkbook || excelWorkbook.SheetNames.length === 0) {
                    $('#loadingOverlay').removeClass('active');
                    Swal.fire({ icon: 'error', title: 'Gagal memuat Excel', text: 'Workbook tidak memiliki sheet.' });
                    return;
                }
                // Clear previous data and show table container
                $('#excelDataTable tbody').empty();
                $('#emptyState').hide();
                $('#tableContainer').show();
                const worksheet = excelWorkbook.Sheets[excelWorkbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, blankrows: false, defval: '' });
                if (jsonData.length > 1) {
                    const headers = jsonData[0];
                    // Determine column indices (case‑insensitive)
                    const noIndex = headers.findIndex(h => h && h.toString().toUpperCase() === 'NO');
                    const rincianIndex = headers.findIndex(h => h && h.toString().toUpperCase() === 'RINCIAN');
                    const volumeIndex = headers.findIndex(h => h && h.toString().toUpperCase() === 'VOLUME');
                    const objekIndex = headers.findIndex(h => h && h.toString().toUpperCase() === 'OBJEK');
                    const hargaSatuanIndex = headers.findIndex(h => h && h.toString().toUpperCase() === 'HARGA SATUAN');
                    const monthIndices = {};
                    const months = ['JANUARI', 'FEBRUARI', 'MARET', 'APRIL', 'MEI', 'JUNI', 'JULI', 'AGUSTUS', 'SEPTEMBER', 'OKTOBER', 'NOVEMBER', 'DESEMBER'];
                    months.forEach(m => {
                        const normalIndex = headers.findIndex(h => h && h.toString().toUpperCase() === m);
                        if (normalIndex !== -1) monthIndices[m.toLowerCase()] = { type: 'normal', index: normalIndex };
                        const vIndex = headers.findIndex(h => h && h.toString().toUpperCase() === 'V. ' + m);
                        if (vIndex !== -1) monthIndices[m.toLowerCase()] = { type: 'volume', index: vIndex };
                    });
                    for (let i = 1; i < jsonData.length; i++) {
                        const row = jsonData[i];
                        const rincian = row[rincianIndex] || '';
                        const volume = row[volumeIndex] || 0;
                        const hargaSatuan = row[hargaSatuanIndex] || 0;
                        const monthPrices = {};
                        months.forEach(m => {
                            const key = m.toLowerCase();
                            const md = monthIndices[key];
                            if (md !== undefined) monthPrices[key] = row[md.index] || 0;
                        });
                        // Group rows starting with bullet character (•)
                        if (rincian.toString().startsWith('•')) {
                            appendGroupRow(rincian);
                        } else {
                            const newRow = `
                                <tr>
                                    <td class="column1">
                                        <label class="apple-switch">
                                            <input type="checkbox" class="form-check-input custom-checkbox row-checkbox-rkas">
                                            <span class="apple-switch-slider"></span>
                                        </label>
                                    </td>
                                    <td class="column2">
                                        <div class="rincian-text">${rincian}</div>
                                    </td>
                                    <td class="column3">
                                        <div class="volume-text">${volume}</div>
                                    </td>
                                    <td class="column4">
                                        <div class="harga-satuan-text">Rp ${formatRupiah(hargaSatuan.toString())}</div>
                                        <input type="hidden" class="harga-asli" value="${formatRupiah(hargaSatuan.toString())}">
                                        <span class="month-price"
                                            data-januari="${monthPrices['januari'] || 0}"
                                            data-februari="${monthPrices['februari'] || 0}"
                                            data-maret="${monthPrices['maret'] || 0}"
                                            data-april="${monthPrices['april'] || 0}"
                                            data-mei="${monthPrices['mei'] || 0}"
                                            data-juni="${monthPrices['juni'] || 0}"
                                            data-juli="${monthPrices['juli'] || 0}"
                                            data-agustus="${monthPrices['agustus'] || 0}"
                                            data-september="${monthPrices['september'] || 0}"
                                            data-oktober="${monthPrices['oktober'] || 0}"
                                            data-november="${monthPrices['november'] || 0}"
                                            data-desember="${monthPrices['desember'] || 0}"
                                            style="display: none;"></span>
                                    </td>
                                    <td class="column5">
                                        <div class="harga-bulan-text">Rp ${formatRupiah(hargaSatuan.toString())}</div>
                                    </td>
                                    <td class="column6">
                                        <div class="checkbox-container">
                                            <input type="checkbox" class="form-check-input custom-checkbox row-checkbox-rkas-right">
                                        </div>
                                    </td>
                                </tr>
                            `;
                            $('#excelDataTable tbody').append(newRow);
                        }
                    }
                    // Rebind events for newly inserted elements
                    $('.currency-input input').off('keyup').on('keyup', function (e) {
                        if ([37, 38, 39, 40].includes(e.keyCode)) return;
                        let value = $(this).val().replace(/\D/g, '');
                        $(this).val(formatRupiah(value));
                        $(this).css('width', 'auto');
                        $(this).css('width', $(this).outerWidth() + 20);
                    });
                    $('.row-checkbox-rkas-right').off('change').on('change', function () {
                        updateSelectedTotalRKASRight();
                    });
                    $('.row-checkbox-rkas').off('change').on('change', function () {
                        const $switch = $(this).closest('.apple-switch');
                        const $row = $(this).closest('tr');
                        if ($(this).is(':checked')) {
                            $switch.css('background-color', 'var(--switch-transferred)');
                            $row.addClass('transferred');
                        } else {
                            $switch.css('background-color', 'var(--switch-inactive)');
                            $row.removeClass('transferred');
                        }
                    });
                    
                    // Tampilkan notifikasi sukses
                    Swal.fire({
                        icon: 'success',
                        title: 'Berhasil',
                        text: 'File Excel berhasil diupload dan data telah dimuat',
                        timer: 2000,
                        showConfirmButton: false
                    });
                } else {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Data Kosong',
                        text: 'File Excel tidak memiliki data yang dapat diproses',
                        confirmButtonText: 'OK'
                    });
                }
                
                // Hide loading overlay; tidak menampilkan animasi sukses agar tidak bentrok dengan animasi lain
                $('#loadingOverlay').removeClass('active');
            }
            
            // Fungsi untuk menampilkan konfirmasi kustom
            function showConfirm(title, message, callback) {
                $('#confirmTitle').text(title);
                $('#confirmMessage').text(message);
                $('#customConfirm').show();
                
                $('#confirmCancel').off('click').on('click', function() {
                    $('#customConfirm').hide();
                });
                
                $('#confirmOk').off('click').on('click', function() {
                    $('#customConfirm').hide();
                    if (callback) callback();
                });
            }
            
            // Move row up functionality
            $('#moveRowUp').click(function() {
                let selectedRow = $('#savedTable tbody tr.selected');
                if (selectedRow.length > 0 && selectedRow.prev().length > 0) {
                    selectedRow.insertBefore(selectedRow.prev());
                    
                    // Update total after moving
                    updateTotalAmount();
                } else {
                    Swal.fire({
                        icon: 'info',
                        title: 'Info',
                        text: 'Pilih baris data terlebih dahulu dengan mengkliknya!',
                        timer: 1500,
                        showConfirmButton: false
                    });
                }
            });
            
            // Move row down functionality
            $('#moveRowDown').click(function() {
                let selectedRow = $('#savedTable tbody tr.selected');
                if (selectedRow.length > 0 && selectedRow.next().length > 0) {
                    selectedRow.insertAfter(selectedRow.next());
                    
                    // Update total after moving
                    updateTotalAmount();
                } else {
                    Swal.fire({
                        icon: 'info',
                        title: 'Info',
                        text: 'Pilih baris data terlebih dahulu dengan mengkliknya!',
                        timer: 1500,
                        showConfirmButton: false
                    });
                }
            });
            
            // Row selection functionality with soft color
            $(document).on('click', '#savedTable tbody tr', function() {
                // Skip if this is the "no data" row
                if ($(this).find('td[colspan]').length > 0) return;
                
                // Remove selected class from all rows
                $('#savedTable tbody tr').removeClass('selected');
                
                // Add selected class to clicked row
                $(this).addClass('selected');
            });
            
            // Search functionality for saved data table
            $('#searchInput').on('keyup', function() {
                let value = $(this).val().toLowerCase();
                
                $('#savedTable tbody tr').each(function() {
                    // Skip the "no data" row
                    if ($(this).find('td[colspan]').length > 0) return;
                    
                    let found = false;
                    $(this).find('td').each(function() {
                        if ($(this).text().toLowerCase().indexOf(value) > -1) {
                            found = true;
                            return false; // Break the loop
                        }
                    });
                    
                    if (found) {
                        $(this).show();
                    } else {
                        $(this).hide();
                    }
                });
                
                // Check if any rows are visible
                let visibleRows = $('#savedTable tbody tr:visible').length;
                if (visibleRows === 0) {
                    $('#savedTable tbody').append('<tr class="no-search-results"><td colspan="9" class="text-center">Tidak ada hasil pencarian</td></tr>');
                    $('#totalRow').hide();
                } else {
                    $('#savedTable tbody .no-search-results').remove();
                    
                    // Update total after search
                    updateTotalAmount();
                }
            });
            
            // Search functionality for RKAS table - DIPERBAIKI
            $('#rkasSearchInput').on('keyup', function() {
                let value = $(this).val().toLowerCase();
                let hasVisibleRows = false;
                
                $('#excelDataTable tbody tr').each(function() {
                    let row = $(this);
                    
                    // Jika ini adalah baris grup, selalu tampilkan saat pencarian
                    if (row.hasClass('group-row')) {
                        // Tampilkan baris grup jika ada teks pencarian
                        if (value.length > 0) {
                            // Cek apakah teks pencarian ada di dalam teks grup
                            let groupText = row.find('.group-cell').text().toLowerCase();
                            if (groupText.indexOf(value) > -1) {
                                row.show();
                                hasVisibleRows = true;
                            } else {
                                row.hide();
                            }
                        } else {
                            // Jika tidak ada teks pencarian, tampilkan semua baris grup
                            row.show();
                            hasVisibleRows = true;
                        }
                        return; // Lanjut ke baris berikutnya
                    }
                    
                    // Untuk baris item, cek apakah sesuai dengan filter bulan
                    let isMonthFiltered = currentSelectedMonth !== '';
                    let isRowVisibleByMonth = true;
                    
                    // Jika ada filter bulan, hanya tampilkan baris yang terlihat karena filter bulan
                    if (isMonthFiltered) {
                        isRowVisibleByMonth = row.is(':visible');
                    }
                    
                    if (isRowVisibleByMonth) {
                        let found = false;
                        
                        // Cari di setiap sel dalam baris
                        row.find('td').each(function() {
                            let cellText = $(this).text().toLowerCase();
                            
                            // Jika ada input dalam sel, gunakan nilai input
                            if ($(this).find('input').length > 0) {
                                cellText = $(this).find('input').val().toLowerCase();
                            }
                            
                            if (cellText.indexOf(value) > -1) {
                                found = true;
                                return false; // Break the loop
                            }
                        });
                        
                        if (found) {
                            row.show();
                            hasVisibleRows = true;
                        } else {
                            row.hide();
                        }
                    }
                });
                
                // Periksa apakah ada baris yang terlihat
                if (hasVisibleRows) {
                    $('#noDataMessage').hide();
                    $('#excelDataTable').show();
                } else {
                    $('#noDataMessage').show();
                    $('#excelDataTable').hide();
                }
            });
            
            // Edit modal functionality
            $('#editCancel').click(function() {
                $('#editModal').hide();
            });
            
            $('#editSave').click(function() {
                // Validasi form
                if ($('#editTglLunas').val() === '' || $('#editTglPembelian').val() === '') {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Peringatan',
                        text: 'Harap isi Tanggal Lunas dan Tanggal Pembelian!',
                        confirmButtonText: 'OK'
                    });
                    return;
                }
                
                // Ambil referensi ke baris yang sedang diedit
                let row = $('#editForm').data('row');
                
                // Tambahkan "Dibayarkan " pada uraian
                (function(){
                    var node = document.getElementById('uraianTrans');
                    var raw = '';
                    if (window.jQuery && $('#uraianTrans').length && typeof $('#uraianTrans').val === 'function') {
                        raw = $('#uraianTrans').val();
                    } else if (node) {
                        raw = (node.value !== undefined ? node.value : (node.textContent || ''));
                    }
                    raw = (raw || '').trim();
                    window.__lastUraianDenganPrefix = raw ? ('Dibayarkan ' + raw) : 'Dibayarkan';
                })();
                
                // Update data di baris
                row.find('td:eq(0)').text($('#editNoBukti').val());
                row.find('td:eq(1)').text($('#editNoKode').val());
                row.find('td:eq(2)').text($('#editTglLunas').val());
                row.find('td:eq(3)').text($('#editTglPembelian').val());
                row.find('td:eq(4)').text(uraianDenganPrefix);
                // Format jumlah edit dengan pemisah ribuan
                let editJumlahRaw = $('#editJumlah').val().replace(/[^0-9]/g, '');
                let editJumlahFormatted = formatRupiah(editJumlahRaw);
                row.find('td:eq(5)').text('Rp ' + editJumlahFormatted);
                row.find('td:eq(6)').text($('#editNamaPegawai').val());
                row.find('td:eq(7)').text($('#editBelanja').val());
                
                // Tutup modal
                $('#editModal').hide();
                
                // Update total after editing
                updateTotalAmount();
                
                Swal.fire({
                    icon: 'success',
                    title: 'Berhasil',
                    text: 'Data berhasil diperbarui!',
                    timer: 1500,
                    showConfirmButton: false
                });
            });
            
            // Settings Modal functionality
            $('#settingsBtn').click(function() {
                // Load saved phrases from localStorage
                let savedPhrases = localStorage.getItem('autofillPhrases') || '';
                $('#autofillPhrases').val(savedPhrases);
                
                // Show settings modal
                $('#settingsModal').show();
            });
            
            $('#settingsClose').click(function() {
                $('#settingsModal').hide();
            });
            
            $('#savePhrasesBtn').click(function() {
                // Save phrases to localStorage
                let phrases = $('#autofillPhrases').val();
                localStorage.setItem('autofillPhrases', phrases);
                
                // Close modal
                $('#settingsModal').hide();
                
                // Show success message
                Swal.fire({
                    icon: 'success',
                    title: 'Berhasil',
                    text: 'Pengaturan autofill telah disimpan!',
                    timer: 1500,
                    showConfirmButton: false
                });
            });
            
            $('#clearPhrasesBtn').click(function() {
                // Clear textarea
                $('#autofillPhrases').val('');
                
                // Clear localStorage
                localStorage.removeItem('autofillPhrases');
                
                // Show success message
                Swal.fire({
                    icon: 'success',
                    title: 'Berhasil',
                    text: 'Semua frasa autofill telah dihapus!',
                    timer: 1500,
                    showConfirmButton: false
                });
            });

            // Handler untuk mengedit daftar Nama Pegawai & Belanja
            $('#editListsBtn').click(function() {
                // Isi textarea dengan daftar nama pegawai saat ini (abaikan placeholder)
                let names = [];
                $('#namaPegawai option').each(function() {
                    const val = $(this).val();
                    if (val) names.push(val);
                });
                $('#editNamaList').val(names.join('\n'));
                // Isi textarea dengan daftar belanja saat ini (abaikan placeholder)
                let belanjaItems = [];
                $('#belanja option').each(function() {
                    const val = $(this).val();
                    if (val) belanjaItems.push(val);
                });
                $('#editBelanjaList').val(belanjaItems.join('\n'));
                $('#editListsModal').show();
            });

            // Tutup modal edit lists
            $('#editListsClose').click(function() {
                $('#editListsModal').hide();
            });

            // Simpan perubahan nama pegawai & belanja
            $('#saveListBtn').click(function() {
                // Ambil daftar nama pegawai, satu per baris
                let names = $('#editNamaList').val().split('\n').map(function(s) { return s.trim(); }).filter(function(s) { return s; });
                // Ambil daftar belanja
                let belanjas = $('#editBelanjaList').val().split('\n').map(function(s) { return s.trim(); }).filter(function(s) { return s; });
                function updateSelect(selector, list) {
                    let sel = $(selector);
                    // Simpan placeholder (value kosong) jika ada
                    let placeholderOption = sel.find('option[value=""]').first().clone();
                    sel.empty().append(placeholderOption);
                    list.forEach(function(item) {
                        sel.append($('<option>', { value: item, text: item }));
                    });
                }
                updateSelect('#namaPegawai', names);
                updateSelect('#editNamaPegawai', names);
                updateSelect('#belanja', belanjas);
                updateSelect('#editBelanja', belanjas);
                $('#editListsModal').hide();
            });
            
            // Autofill functionality for uraian field
            function setupAutofill(textareaId, dropdownId) {
                const textarea = $(`#${textareaId}`);
                const dropdown = $(`#${dropdownId}`);
                
                // Double click to show all phrases
                textarea.on('dblclick', function() {
                    showAllPhrases(dropdown);
                });
                
                // Input event to show matching phrases
                textarea.on('input', function() {
                    const value = $(this).val().toLowerCase();
                    if (value.length > 0) {
                        showMatchingPhrases(value, dropdown);
                    } else {
                        dropdown.removeClass('show');
                    }
                });
                
                // Click outside to close dropdown
                $(document).on('click', function(e) {
                    if (!$(e.target).closest('.uraian-container').length) {
                        dropdown.removeClass('show');
                    }
                });
                
                // Select phrase from dropdown
                dropdown.on('click', '.autofill-item', function() {
                    const phrase = $(this).text();
                    textarea.val(phrase);
                    dropdown.removeClass('show');
                    textarea.focus();
                    
                    // Jika ini adalah field uraian utama, tambahkan tanggal
                    if (textareaId === 'uraianTrans') {
                        updateUraianWithDate();
                    } else if (textareaId === 'editUraian') {
                        updateEditUraianWithDate();
                    }
                });
            }
            
            // Show all saved phrases
            function showAllPhrases(dropdown) {
                const savedPhrases = localStorage.getItem('autofillPhrases') || '';
                const phrases = savedPhrases.split('\n').filter(phrase => phrase.trim() !== '');
                
                dropdown.empty();
                
                if (phrases.length > 0) {
                    phrases.forEach(phrase => {
                        dropdown.append(`<div class="autofill-item">${phrase}</div>`);
                    });
                    dropdown.addClass('show');
                }
            }
            
            // Show phrases that match the input
            function showMatchingPhrases(value, dropdown) {
                const savedPhrases = localStorage.getItem('autofillPhrases') || '';
                const phrases = savedPhrases.split('\n').filter(phrase => phrase.trim() !== '');
                
                dropdown.empty();
                
                const matchingPhrases = phrases.filter(phrase => 
                    phrase.toLowerCase().includes(value)
                );
                
                if (matchingPhrases.length > 0) {
                    matchingPhrases.forEach(phrase => {
                        dropdown.append(`<div class="autofill-item">${phrase}</div>`);
                    });
                    dropdown.addClass('show');
                } else {
                    dropdown.removeClass('show');
                }
            }
            
            // Initialize autofill for both uraian fields
            setupAutofill('uraianTrans', 'uraianDropdown');
            setupAutofill('editUraian', 'editUraianDropdown');
            
            // Gabungkan button functionality
            $('#gabungkanBtn').click(function() {
                // Hitung total dari checkbox yang dipilih
                let totalAmount = 0;
                $('.row-checkbox-rkas-right:checked').each(function() {
                    let row = $(this).closest('tr');
                    let hargaText = row.find('.harga-bulan-text').text();
                    let harga = parseFloat(hargaText.replace('Rp ', '').replace(/\./g, '')) || 0;
                    totalAmount += harga;
                });
                
                // Set total ke input di modal
                $('#totalGabungan').val(formatRupiah(totalAmount.toString()));
                
                // Tampilkan modal
                $('#gabungkanModal').show();
            });
            
            // Gabungkan modal cancel button
            $('#gabungkanCancel').click(function() {
                $('#gabungkanModal').hide();
                $('#jenisBelanja').val('');
            });

            // Tambahkan jenis belanja baru ke dropdown gabungkan melalui popup
            $('#editJenisBelanjaBtn').click(function() {
    var jen = document.getElementById('jenisBelanjaModal');
    if (jen){
        jen && (jen.style.display='flex');
        jen.style.zIndex = '10001';
        setTimeout(function(){ var i = document.getElementById('jenisBelanjaBaruInput'); if (i) i.focus(); }, 50);
    }
});
            
            // Transfer button functionality
            $('#transferBtn').click(function() {
                let jenisBelanja = $('#jenisBelanja').val();
                let totalGabungan = $('#totalGabungan').val().replace(/\./g, '');
                
                if (!jenisBelanja) {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Peringatan',
                        text: 'Harap pilih jenis belanja!',
                        confirmButtonText: 'OK'
                    });
                    return;
                }
                
                // Isi form X-Arkas dengan data gabungan
                $('#uraianTrans').val(jenisBelanja);
                // Gunakan pemisah ribuan saat mengisi input jumlah
                $('#jumlah').val(formatRupiah(totalGabungan));
                
                // Tambahkan "Tgl. [tanggal]" jika tanggal lunas sudah diisi
                updateUraianWithDate();
                
                // Enable switch button pada baris yang terpilih
                // When transferring, mark the left apple switch as checked and visually apply the transferred state
                $('.row-checkbox-rkas-right:checked').each(function() {
                    let row = $(this).closest('tr');
                    let switchInput = row.find('.row-checkbox-rkas');
                    switchInput.prop('checked', true);
                    // set the apple‑switch colour to the transferred colour
                    switchInput.closest('.apple-switch').css('background-color', 'var(--switch-transferred)');
                    // also apply the transferred highlight class on the entire row
                    row.addClass('transferred');
                });
                
                /*
                 * Do not reset the right‑hand checkboxes when performing a transfer.
                 *
                 * Previously, the transfer operation would immediately clear the selection
                 * (uncheck all right‑hand checkboxes, hide the selection notification, hide
                 * the combine button and reset the running total).  This meant that as soon
                 * as the user clicked the transfer button the visual selection disappeared,
                 * even though the user might subsequently want to review or edit those
                 * selections before finally saving them.  To align with the requested
                 * behaviour, we leave the checkboxes in their checked state after a
                 * transfer.  The user can still see which rows were used to populate
                 * the transfer form and the selection will only be cleared after the
                 * data is saved.
                 *
                 * If there is a function to update the Sub Uraian display based on the
                 * current selection, call it so that the right‑hand panel reflects the
                 * still‑selected items.  We do not modify the notification or total here.
                 */
                if (typeof renderSubUraianFromSelection === 'function') {
                    renderSubUraianFromSelection();
                }
                
                // Tutup modal
                $('#gabungkanModal').hide();
                $('#jenisBelanja').val('');
                
                // Tampilkan notifikasi sukses
                Swal.fire({
                    icon: 'success',
                    title: 'Berhasil',
                    text: 'Data telah dipindahkan ke X-Arkas dan switch button diaktifkan!',
                    timer: 1500,
                    showConfirmButton: false
                });
            });
        });
;
// ===== Sub Uraian: auto generate dari checkbox RKAS =====
    (function(){
        function parseRupiahToInt(txt){
            if(!txt) return 0;
            return parseInt(String(txt).replace(/[^\d]/g,'')) || 0;
        }
        function formatRupiah(n){
            n = Number(n||0);
            return n.toLocaleString('id-ID');
        }
        function inferUnitFromRincian(r){
            if(!r) return 'bh';
            r = r.toLowerCase();
            if(r.includes('kertas') || r.includes('hvs') || r.includes('folio') || r.includes('copy paper') || r.includes('buku kas')) return 'rim';
            return 'bh';
        }
        function getSelectedMonthName(){
            var sel = document.getElementById('bulanFilter');
            if(!sel) return '';
            var text = sel.options && sel.selectedIndex >= 0 ? sel.options[sel.selectedIndex].text : sel.value;
            return text || '';
        }
        
        // Fungsi untuk membuat baris sub uraian dengan format yang konsisten
        function toDisplayLine(item, bulan){
            // Format: Rincian - Volume Satuan - Rp. Harga Satuan - Rp. Jumlah
            var volStr = (item.volume||'1') + ' ' + (item.satuan||'bh');
            var hargaStr = 'Rp. ' + formatRupiah(item.harga);
            var jumlahStr = 'Rp. ' + formatRupiah(item.jumlah);
            return (item.rincian||'') + ' - ' + volStr + ' - ' + hargaStr + ' - ' + jumlahStr;
        }
        
        function collectSelectedRows(){
            var table = document.getElementById('excelDataTable');
            if(!table) return [];
            var rows = Array.from(table.querySelectorAll('tbody tr'));
            var selected = [];
            rows.forEach(function(row){
                // only consider the right‑hand selection checkbox when deciding if a row is selected
                // ignore the left apple‑style switch which is used only for marking and highlighting
                var cb = row.querySelector('.row-checkbox-rkas-right');
                if(cb && cb.checked){
                    var tds = row.querySelectorAll('td');
                    var rincian = (tds[1] && (tds[1].querySelector('.rincian-text')?.textContent || tds[1].textContent) || '').trim();
                    var volume = (tds[2] && (tds[2].querySelector('.volume-text')?.textContent || tds[2].textContent) || '').trim();
                    var hargaSatuanTxt = (tds[3] && (tds[3].querySelector('.harga-satuan-text')?.textContent || tds[3].textContent) || '').trim();
                    var jumlahBulanTxt = (tds[4] && (tds[4].querySelector('.harga-bulan-text')?.textContent || tds[4].textContent) || '').trim();
                    selected.push({
                        rincian: rincian,
                        volume: volume,
                        satuan: inferUnitFromRincian(rincian),
                        harga: parseRupiahToInt(hargaSatuanTxt),
                        jumlah: parseRupiahToInt(jumlahBulanTxt)
                    });
                }
            });
            return selected;
        }
        
        // Fungsi untuk menyinkronkan hidden input dan atribut data
        function syncHiddenInput(){
            var list = document.getElementById('subUraianList');
            var hidden = document.getElementById('subUraianTrans');
            if(!list || !hidden) return;
            var lines = Array.from(list.querySelectorAll('.sub-uraian-text')).map(function(inp){ return inp.value.trim(); }).filter(Boolean);
            hidden.value = lines.join('\n'); // versi newline
            hidden.setAttribute('data-joined', lines.join(', ')); // versi koma
        }
        
        // Fungsi utama untuk merender sub uraian
        function renderSubUraianFromSelection(){
            var list = document.getElementById('subUraianList');
            if(!list) return;
            var bulan = getSelectedMonthName();
            var bulanLbl = document.getElementById('bulanDipilihLabel');
            if(bulanLbl) bulanLbl.textContent = bulan || '-';
            list.innerHTML = '';
            var items = collectSelectedRows();
            items.forEach(function(item, idx){
                var text = toDisplayLine(item, bulan);
                var div = document.createElement('div');
                div.className = 'input-group input-group-sm sub-uraian-item';
                div.innerHTML = '<span class="input-group-text">'+(idx+1)+'</span>' +
                                '<input type="text" class="form-control form-control-sm sub-uraian-text" value="'+text.replace(/"/g,'&quot;')+'">' +
                                '<button class="btn btn-outline-danger btn-sm remove-sub-uraian" type="button" title="Hapus">&times;</button>';
                div.querySelector('.remove-sub-uraian').addEventListener('click', function(){ 
                    div.remove(); 
                    syncHiddenInput(); 
                });
                div.querySelector('.sub-uraian-text').addEventListener('input', syncHiddenInput);
                list.appendChild(div);
            });
            syncHiddenInput();
        }
        
        // Delegasi event: checkbox dalam tabel RKAS berubah
        document.addEventListener('change', function(e){
            var target = e.target;
            // Only respond when the right‑hand selection checkbox changes; ignore the apple‑style switch
            if(target && target.matches('#excelDataTable .row-checkbox-rkas-right')){
                renderSubUraianFromSelection();
            }
        }, true);
        
        // Perubahan bulan -> re-render
        var bulanSel = document.getElementById('bulanFilter');
        if(bulanSel){ 
            bulanSel.addEventListener('change', renderSubUraianFromSelection); 
        }
        
        // Tombol gabungkan -> re-render
        var gabungBtn = document.getElementById('gabungkanBtn');
        if(gabungBtn){ 
            gabungBtn.addEventListener('click', function(){ 
                setTimeout(renderSubUraianFromSelection, 50); 
            }); 
        }
        
        // Klik pada checkbox container juga akan memicu render
        document.addEventListener('click', function(e){
            var container = e.target.closest && e.target.closest('#excelDataTable .checkbox-container');
            if(!container) return;
            setTimeout(function(){
                if (window.renderSubUraianFromSelection) {
                    window.renderSubUraianFromSelection();
                }
            }, 20);
        }, true);
        
        // Ekspor fungsi untuk dipanggil manual jika perlu
        window.renderSubUraianFromSelection = renderSubUraianFromSelection;
    })();
;
// Tombol popup Sub Uraian -> tampilkan tabel dengan header + judul dari Uraian baris terkait
    $(document).off('click.subUraian').on('click.subUraian', '.sub-uraian-btn', function(){
        // Ambil data sub uraian dari atribut data
        var subUraianJson = $(this).attr('data-suburaian');
        var subUraianData = [];
        
        try {
            subUraianData = JSON.parse(subUraianJson);
        } catch(e) {
            console.error('Error parsing sub uraian data:', e);
            subUraianData = [];
        }
        
        // Tampilkan data di modal
        var tbody = $('#subUraianModalTbody');
        tbody.empty();
        
        if (subUraianData.length === 0) {
            tbody.append('<tr><td colspan="4" class="text-center">Tidak ada sub uraian</td></tr>');
        } else {
            subUraianData.forEach(function(item, index) {
                // Parse item untuk mendapatkan komponen
                var parts = item.split(' - ');
                var uraian = parts[0] || '';
                var volume = parts[1] || '';
                var harga = parts[2] || '';
                var jumlah = parts[3] || '';
                
                tbody.append(`
                <tr>
                    <td>${uraian}</td>
                    <td>${volume}</td>
                    <td>${harga}</td>
                    <td>${jumlah}</td>
                </tr>
                `);
            });
        }
        
        // Tampilkan modal
        var modal = new bootstrap.Modal(document.getElementById('subUraianModal'));
        modal.show();
    });
;
// Enforce: kolom Uraian (Data Tersimpan) = "Dibayarkan " + isi ✘-Arkas (#uraianTrans), tanpa Sub Uraian
    document.addEventListener('click', function(e){
        var t = e.target;
        if (t && (t.id === 'simpanBtn' || (t.closest && t.closest('#simpanBtn')))) {
            setTimeout(function(){
                var tbody = document.querySelector('#savedTable tbody');
                if(!tbody) return;
                var last = tbody.querySelector('tr:last-child');
                if(!last) return;
                var cells = last.querySelectorAll('td');
                if(!cells || cells.length < 5) return;
                var node = document.getElementById('uraianTrans');
                var raw = '';
                if (node) raw = (node.value !== undefined ? node.value : (node.textContent || ''));
                raw = (raw || '').trim();
                var finalUraian = raw ? ('Dibayarkan ' + raw) : 'Dibayarkan';
                cells[4].textContent = finalUraian;
            }, 60);
        }
    }, true);
;
// Pastikan yang tersimpan di kolom Uraian adalah nilai dari ✘-Arkas (tanpa Sub Uraian)
    document.addEventListener('click', function(e){
        var t = e.target;
        if (t && (t.id === 'simpanBtn' || (t.closest && t.closest('#simpanBtn')))) {
            setTimeout(function(){
                var tbody = document.querySelector('#savedTable tbody');
                if(!tbody) return;
                var last = tbody.querySelector('tr:last-child');
                if(!last) return;
                var cells = last.querySelectorAll('td');
                if(!cells || cells.length < 5) return;
                var finalUraian = window.__lastUraianDenganPrefix || '';
                if (!finalUraian) {
                    // fallback jika tak terset
                    var node = document.getElementById('uraianTrans');
                    var raw = '';
                    if (node) raw = (node.value !== undefined ? node.value : (node.textContent || ''));
                    raw = (raw || '').trim();
                    finalUraian = raw ? ('Dibayarkan ' + raw) : 'Dibayarkan';
                }
                cells[4].textContent = finalUraian;
            }, 60);
        }
    }, true);
;
(function() {
        function toDDMMYYYY(s) {
            if (!s) return '';
            // Pass-through if already dd-mm-yyyy or dd/mm/yyyy
            var m2 = s.match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})$/);
            if (m2) {
                var d = m2[1].padStart(2,'0');
                var mo = m2[2].padStart(2,'0');
                return d + '-' + mo + '-' + m2[3];
            }
            // Convert "d F Y" (Bahasa Indonesia month names)
            var map = {
                'januari':'01','februari':'02','maret':'03','april':'04','mei':'05','juni':'06',
                'juli':'07','agustus':'08','september':'09','oktober':'10','november':'11','desember':'12'
            };
            var m = s.match(/^(\d{1,2})\s+([A-Za-zÀ-ÿ]+)\s+(\d{4})$/);
            if (m) {
                var d = m[1].padStart(2,'0');
                var mo = map[(m[2] || '').toLowerCase()];
                if (mo) return d + '-' + mo + '-' + m[3];
            }
            return s; // fallback
        }

        // Override: ALWAYS read from Tanggal Pembelian/BKU and write to Uraian
        window.updateUraianWithDate = function() {
            try {
                var raw = $('#tglPembelian').val();
                var uraianEl = $('#uraianTrans');
                var uraian = (uraianEl.val() || '');

                // Clean previous "Tgl. ..." (dd-mm-yyyy or 'd F Y')
                uraian = uraian.replace(/ Tgl\. \d{2}-\d{2}-\d{4}/g, '');
                uraian = uraian.replace(/ Tgl\. \d{1,2}\s+[A-Za-zÀ-ÿ]+\s+\d{4}/g, '');

                var formatted = toDDMMYYYY(raw);
                if (formatted) uraianEl.val((uraian + ' Tgl. ' + formatted).trim());
                else uraianEl.val(uraian.trim());
            } catch (e) {
                console.error('updateUraianWithDate override error:', e);
            }
        };

        // Override edit version: ALWAYS read from Edit Tanggal Pembelian/BKU and write to Edit Uraian
        window.updateEditUraianWithDate = function() {
            try {
                var raw = $('#editTglPembelian').val();
                var uraianEl = $('#editUraian');
                var uraian = (uraianEl.val() || '');

                uraian = uraian.replace(/ Tgl\. \d{2}-\d{2}-\d{4}/g, '');
                uraian = uraian.replace(/ Tgl\. \d{1,2}\s+[A-Za-zÀ-ÿ]+\s+\d{4}/g, '');

                var formatted = toDDMMYYYY(raw);
                if (formatted) uraianEl.val((uraian + ' Tgl. ' + formatted).trim());
                else uraianEl.val(uraian.trim());
            } catch (e) {
                console.error('updateEditUraianWithDate override error:', e);
            }
        };
    })();
;
(function(){
        function toDDMMYYYY(s){
            if(!s) return '';
            var m2 = s.match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})$/);
            if(m2){
                return m2[1].padStart(2,'0') + '-' + m2[2].padStart(2,'0') + '-' + m2[3];
            }
            var map = {'januari':'01','februari':'02','maret':'03','april':'04','mei':'05','juni':'06','juli':'07','agustus':'08','september':'09','oktober':'10','november':'11','desember':'12'};
            var m = s.match(/^(\d{1,2})\s+([A-Za-zÀ-ÿ]+)\s+(\d{4})$/);
            if(m){
                var mo = map[(m[2]||'').toLowerCase()];
                if(mo) return m[1].padStart(2,'0') + '-' + mo + '-' + m[3];
            }
            return s;
        }

        // Hapus semua jejak "Tgl./tgl." sebelumnya, baik dd-mm-yyyy maupun "d F Y"
        function stripAnyDateTag(txt){
            if(!txt) return '';
            // Pola: spasi opsional + Tgl./tgl. + spasi + dd-mm-yyyy
            txt = txt.replace(/\s?(?:Tgl|tgl)\.\s+\d{1,2}[-\/]\d{1,2}[-\/]\d{4}/g, '');
            // Pola: spasi opsional + Tgl./tgl. + spasi + d MMMM yyyy
            txt = txt.replace(/\s?(?:Tgl|tgl)\.\s+\d{1,2}\s+[A-Za-zÀ-ÿ]+\s+\d{4}/g, '');
            return txt.trim();
        }

        function applyUraianFromPembelian(idDate, idUraian){
            try{
                var raw = $(idDate).val();
                var uraianEl = $(idUraian);
                var base = stripAnyDateTag(uraianEl.val() || '');
                var formatted = toDDMMYYYY(raw);
                if(formatted){
                    uraianEl.val((base + ' Tgl. ' + formatted).trim());
                }else{
                    uraianEl.val(base);
                }
            }catch(e){ console.error('applyUraianFromPembelian error', e); }
        }

        // Override fungsi lama agar selalu pakai Pembelian dan output "tgl. dd-mm-yyyy"
        window.updateUraianWithDate = function(){
            applyUraianFromPembelian('#tglPembelian', '#uraianTrans');
        };
        window.updateEditUraianWithDate = function(){
            applyUraianFromPembelian('#editTglPembelian', '#editUraian');
        };

        // Normalize setiap ada perubahan pada pembelian/lunas, supaya "tgl. ..." final selalu dari Pembelian
        $(document).on('change blur input', '#tglPembelian', function(){
            applyUraianFromPembelian('#tglPembelian', '#uraianTrans');
        });
        $(document).on('change blur input', '#editTglPembelian', function(){
            applyUraianFromPembelian('#editTglPembelian', '#editUraian');
        });

        // Jika ada script lain yang masih menulis dari Lunas, kita sanitasi sesudahnya juga
        $(document).on('change blur input', '#tglLunas', function(){
            applyUraianFromPembelian('#tglPembelian', '#uraianTrans');
        });
        $(document).on('change blur input', '#editTglLunas', function(){
            applyUraianFromPembelian('#editTglPembelian', '#editUraian');
        });

        // Jalankan sekali saat ready untuk merapikan tampilan awal
        $(function(){
            applyUraianFromPembelian('#tglPembelian', '#uraianTrans');
            applyUraianFromPembelian('#editTglPembelian', '#editUraian');
        });
    })();
;
(function(){
        function parseIntSafe(txt){
            if(!txt) return 0;
            return parseInt(String(txt).replace(/[^\d]/g,'')) || 0;
        }

        // Setelah handler klik baris RKAS bawaan jalan, kita setel ulang #jumlah ke nilai bulan aktif
        $(document).on('click', '#excelDataTable tbody tr', function(e){
            // Abaikan baris grup dan klik pada input/switch
            if ($(this).hasClass('group-row')) return;
            if ($(e.target).is('input') || $(e.target).closest('.apple-switch').length > 0) return;

            // Ambil nilai kolom BULAN yang sudah diformat di .harga-bulan-text (mis. "Rp 150.000")
            var monthTxt = $(this).find('td:eq(4) .harga-bulan-text').text() || '';
            var monthVal = parseIntSafe(monthTxt);
            if (monthVal > 0) {
                // Tampilkan angka dengan pemisah ribuan pada input jumlah
                $('#jumlah').val(formatRupiah(monthVal));
            }
        });
    })();
;
(function(){
        function toInt(txt){
            if(!txt) return 0;
            return parseInt(String(txt).replace(/[^\d]/g,'')) || 0;
        }
        // After any row click, force jumlah from month cell
        $(document).on('click', '#excelDataTable tbody tr', function(e){
            var $row = $(this);
            if ($row.hasClass('group-row')) return;
            if ($(e.target).is('input') || $(e.target).closest('.apple-switch').length) return;
            setTimeout(function(){
                var monthTxt = $row.find('td:eq(4) .harga-bulan-text').text() || '';
                var monthVal = toInt(monthTxt);
                if (monthVal > 0) {
                    // Gunakan pemisah ribuan untuk menampilkan nilai
                    $('#jumlah').val(formatRupiah(monthVal));
                }
            }, 0);
        });

        // When right-side checkbox is toggled, also update jumlah to current row's month value if single selection
        $(document).on('change', '.row-checkbox-rkas-right', function(){
            var checkedRows = $('.row-checkbox-rkas-right:checked').closest('tr');
            if(checkedRows.length === 1){
                var $row = checkedRows.eq(0);
                var monthTxt = $row.find('td:eq(4) .harga-bulan-text').text() || '';
                var monthVal = toInt(monthTxt);
                if (monthVal > 0) {
                    // Format nilai dengan pemisah ribuan
                    $('#jumlah').val(formatRupiah(monthVal));
                }
            }
        });
    })();
;
(function(){
        if (!window.jQuery) return;
        $(function(){
            // Ganti handler lama dengan yang baru
            $('#exportExcelBtn').off('click').on('click', function(e){
                e.preventDefault();
                try{
                    let dataMain = [];
                    let subUraianData = [];
                    // Map warna berdasarkan No Bukti yang MEMILIKI sub‑uraian
                    const colorByNoBukti = {};
                    let colorIndex = 0;
                    // Palet warna (urutan: merah, hijau, kuning, biru, ungu, oranye, pink)
                    const colorPalette = [
                        'FFFFCCCC', // merah pastel
                        'FFCCFFCC', // hijau pastel
                        'FFFFFFCC', // kuning pastel
                        'FFCCFFFF', // biru pastel
                        'FFFFCCFF', // ungu pastel
                        'FFFFE5CC', // oranye pastel
                        'FFE5CCFF'  // pink pastel
                    ];

                    // Kumpulkan data dari tabel "Data Tersimpan"
                    $('#savedTable tbody tr').each(function(){
                        if($(this).find('td[colspan]').length>0) return; // skip "Tidak ada data"
                        const td = $(this).find('td');
                        const noBukti = td.eq(0).text();
                        const rowObj = {
                            'No Bukti': noBukti,
                            'No Kode': td.eq(1).text(),
                            'Tanggal Lunas': td.eq(2).text(),
                            'Tanggal Pembelian': td.eq(3).text(),
                            'Uraian': td.eq(4).text(),
                            // Konversi jumlah ke angka agar dapat dirumuskan di Excel
                            'Jumlah': (function(){
                                const val = td.eq(5).text().replace(/Rp\s*/,'').replace(/\./g,'');
                                return parseInt(val, 10) || 0;
                            })(),
                            'Nama Pegawai': td.eq(6).text(),
                            'Belanja': td.eq(7).text()
                        };
                        dataMain.push(rowObj);

                        // Ambil sub‑uraian (dari tombol aksi pada kolom terakhir)
                        let subArray = [];
                        const subBtn = $(this).find('.sub-uraian-btn');
                        let subJsonStr = subBtn.attr('data-suburaian');
                        if (subJsonStr){
                            subJsonStr = subJsonStr.replace(/&#39;/g, "'");
                            try{ subArray = JSON.parse(subJsonStr) || []; } catch(e){ subArray = []; }
                        }

                        // Tetapkan warna hanya jika ADA sub‑uraian
                        if(subArray.length>0 && !colorByNoBukti[noBukti]){
                            colorByNoBukti[noBukti] = colorPalette[colorIndex % colorPalette.length];
                            colorIndex++;
                        }

                        // Susun baris di sheet "Sub Uraian" mengikuti contoh: No Bukti | Uraian Induk | Rincian | Volume & Satuan | Harga Satuan | Jumlah
                        subArray.forEach(function(line){
                            const parts = String(line).split(' - ');
                            const rincian = parts[0] || '';
                            const volSat = parts[1] || '';
                            const hargaSatuan = parts[2] ? parts[2].replace(/Rp\.?\s*/gi,'').replace(/\./g,'') : '';
                            const jumlah = parts[3] ? parts[3].replace(/Rp\.?\s*/gi,'').replace(/\./g,'') : '';
                            subUraianData.push({
                                'No Bukti': noBukti,
                                'Uraian Induk': rowObj['Uraian'],
                                'Rincian': rincian,
                                'Volume & Satuan': volSat,
                                'Harga Satuan': hargaSatuan,
                                'Jumlah': jumlah
                            });
                        });
                    });

                    // Pastikan nilai nominal di subUraianData berupa angka untuk kemudahan penghitungan di Excel
                    subUraianData = subUraianData.map(function(item) {
                        return Object.assign({}, item, {
                            'Harga Satuan': parseInt(String(item['Harga Satuan']).replace(/[^0-9]/g, ''), 10) || 0,
                            'Jumlah': parseInt(String(item['Jumlah']).replace(/[^0-9]/g, ''), 10) || 0
                        });
                    });

                    // Buat workbook + Sheet 1
                    const wb = XLSX.utils.book_new();
                    const wsMain = XLSX.utils.json_to_sheet(dataMain);

                    // Terapkan format angka ribuan untuk kolom Jumlah di sheet Data Tersimpan
                    (function(){
                        if (dataMain.length > 0) {
                            const keys = Object.keys(dataMain[0]);
                            const jumlahIdx = keys.indexOf('Jumlah');
                            if (jumlahIdx >= 0) {
                                dataMain.forEach(function(row, idx) {
                                    const addr = XLSX.utils.encode_cell({ r: idx + 1, c: jumlahIdx });
                                    const cell = wsMain[addr];
                                    if (cell && typeof cell.v === 'number') {
                                        cell.z = '#,##0';
                                    }
                                });
                            }
                        }
                    })();

                    // Terapkan warna per No Bukti pada Sheet 1 (hanya baris yang memiliki sub‑uraian)
                    if (dataMain.length>0){
                        const mainKeys = Object.keys(dataMain[0]);
                        dataMain.forEach((row, rIdx)=>{
                            const nb = row['No Bukti'];
                            const color = colorByNoBukti[nb];
                            if(!color) return;
                            for(let c=0;c<mainKeys.length;c++){
                                const addr = XLSX.utils.encode_cell({r:rIdx+1, c});
                                if(!wsMain[addr]) continue;
                                wsMain[addr].s = wsMain[addr].s || {};
                                wsMain[addr].s.fill = { patternType:'solid', fgColor:{rgb:color} };
                            }
                        });
                    }

                    // Sheet 2: Sub Uraian (dengan header sesuai contoh)
                    const subHeaders = ['No Bukti','Uraian Induk','Rincian','Volume & Satuan','Harga Satuan','Jumlah'];
                    const wsSubAOA = [subHeaders];
                    subUraianData.forEach(obj=>{
                        wsSubAOA.push([obj['No Bukti'], obj['Uraian Induk'], obj['Rincian'], obj['Volume & Satuan'], obj['Harga Satuan'], obj['Jumlah']]);
                    });
                    const wsSub = XLSX.utils.aoa_to_sheet(wsSubAOA);

                    // Terapkan format angka ribuan untuk kolom Harga Satuan dan Jumlah di sheet Sub Uraian
                    (function(){
                        const rowCount = wsSubAOA.length - 1;
                        for (let r = 1; r <= rowCount; r++) {
                            const hargaAddr = XLSX.utils.encode_cell({ r: r, c: 4 });
                            const jumlahAddr = XLSX.utils.encode_cell({ r: r, c: 5 });
                            const ch = wsSub[hargaAddr];
                            if (ch && typeof ch.v === 'number') ch.z = '#,##0';
                            const cj = wsSub[jumlahAddr];
                            if (cj && typeof cj.v === 'number') cj.z = '#,##0';
                        }
                    })();

                    // Terapkan warna per No Bukti pada Sheet 2
                    for(let r=1; r<wsSubAOA.length; r++){
                        const nb = wsSubAOA[r][0];
                        const color = colorByNoBukti[nb];
                        if(!color) continue;
                        for(let c=0;c<subHeaders.length;c++){
                            const addr = XLSX.utils.encode_cell({r, c});
                            if(!wsSub[addr]) continue;
                            wsSub[addr].s = wsSub[addr].s || {};
                            wsSub[addr].s.fill = { patternType:'solid', fgColor:{rgb:color} };
                        }
                    }

                    XLSX.utils.book_append_sheet(wb, wsMain, 'Data Tersimpan');
                    XLSX.utils.book_append_sheet(wb, wsSub, 'Sub Uraian');
                    XLSX.writeFile(wb, 'DataTersimpan_SubUraian_Berwarna.xlsx');
                    Swal.fire({ icon:'success', title:'Berhasil', text:'Export Excel 2 sheet dengan warna sinkron selesai!', timer:1800, showConfirmButton:false });
                }catch(err){
                    console.error(err);
                    Swal.fire({ icon:'error', title:'Gagal Export', text:String(err||'Terjadi kesalahan tidak diketahui.') });
                }
            });
        });
    })();
;
(function(){
  function cleanupBackdrop(){
    // bersihkan backdrop bootstrap yang suka nyangkut
    var backs = document.querySelectorAll('.modal-backdrop');
    backs.forEach(function(b){ b.parentNode && b.parentNode.removeChild(b); });
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
  }

  // load list dari localStorage ke select (hindari duplikat)
  function loadJenisBelanjaFromStorage(){
    try{
      var list = JSON.parse(localStorage.getItem('jenisBelanjaList')||'[]');
      var sel = document.getElementById('jenisBelanja');
      if (!sel) return;
      list.forEach(function(v){
        if (![...sel.options].some(o => o.value === v)){
          var opt = document.createElement('option');
          opt.value = v; opt.textContent = v;
          sel.appendChild(opt);
        }
      });
    }catch(e){}
  }
  loadJenisBelanjaFromStorage();

  // Klik ikon edit di Gabungkan Data -> sembunyikan Gabungkan, tampilkan Jenis
  document.addEventListener('click', function(e){
    if (e.target.closest('#editJenisBelanjaBtn')){
      var gab = document.getElementById('gabungkanModal');
      var jen = document.getElementById('jenisBelanjaModal');
      if (gab && jen){
        
        jen && (jen.style.display='flex'); jen.style.zIndex='10001';
        setTimeout(function(){
          var inp = document.getElementById('jenisBelanjaBaruInput');
          if (inp) inp.focus();
        }, 50);
        cleanupBackdrop();
      }
    }
  });

  // Tambah jenis baru -> tutup Jenis, buka lagi Gabungkan + auto-select
  function tambahJenisDanKembali(){
    var inp = document.getElementById('jenisBelanjaBaruInput');
    var val = (inp && inp.value || '').trim();
    if (!val) return;
    var cap = _capitalizedCaseJenis(val);
    // simpan ke localStorage (hindari duplikat)
    var list = [];
    try{ list = JSON.parse(localStorage.getItem('jenisBelanjaList')||'[]'); }catch(e){}
    if (!list.includes(cap)){
      list.push(upper);
      localStorage.setItem('jenisBelanjaList', JSON.stringify(list));
    }
    // tambah ke select jika belum ada
    var sel = document.getElementById('jenisBelanja');
    if (sel && ![...sel.options].some(o => o.value === cap)){
      var opt = document.createElement('option');
      opt.value = cap; opt.textContent = cap;
      sel.appendChild(opt);
    }
    if (sel){ sel.value = cap; sel.dispatchEvent(new Event('change')); }
    if (inp) inp.value = '';

    // switch modal
    var gab = document.getElementById('gabungkanModal');
    var jen = document.getElementById('jenisBelanjaModal');
    if (jen) jen.style.display = 'none';
  if (gab) gab.style.display = 'flex';
    if (gab) gab.style.display = 'flex';
    cleanupBackdrop();
  }

  var btnTambah = document.getElementById('jenisBelanjaTambah');
  if (btnTambah){ btnTambah.addEventListener('click', tambahJenisDanKembali); }

  var btnBatal = document.getElementById('jenisBelanjaBatal');
  if (btnBatal){
    btnBatal.addEventListener('click', function(){
      var jen = document.getElementById('jenisBelanjaModal');
      var gab = document.getElementById('gabungkanModal');
      if (jen) jen.style.display = 'none';
  if (gab) gab.style.display = 'flex';
      if (gab) gab.style.display = 'flex';
      cleanupBackdrop();
    });
  }

  // juga bersihkan backdrop saat gabungkan cancel/transfer yang menutup popup custom
  ['gabungkanCancel','transferBtn'].forEach(function(id){
    var el = document.getElementById(id);
    if (el) el.addEventListener('click', cleanupBackdrop);
  });
})();
;
// Hapus hanya opsi Jenis Belanja yang sedang dipilih pada combobox Gabungkan Data
document.addEventListener('click', function(e){
  var btn = e.target.closest('#deleteJenisBelanjaBtn');
  if (!btn) return;
  try {
    var sel = document.getElementById('jenisBelanja');
    if (!sel) return;
    var val = sel.value;
    if (!val) return;
    // Jangan hapus placeholder kosong
    if (val === '') return;
    // Konfirmasi singkat (tanpa mengubah UI lain)
    // Jika tidak ingin konfirmasi, hapus blok if berikut.
    if (!confirm('Hapus jenis belanja: "' + val + '" dari daftar?')) return;
    // Hapus opsi dari select
    for (var i = 0; i < sel.options.length; i++) {
      if (sel.options[i].value === val) {
        sel.remove(i);
        break;
      }
    }
    // Kosongkan pilihan
    sel.value = ''; sel.dispatchEvent(new Event('change'));
    // Sinkronkan localStorage (jenisBelanjaList)
    try {
      var list = JSON.parse(localStorage.getItem('jenisBelanjaList') || '[]');
      var idx = list.indexOf(val);
      if (idx !== -1) {
        list.splice(idx, 1);
        localStorage.setItem('jenisBelanjaList', JSON.stringify(list));
      }
    } catch(e) {}
  } catch(err){ console.warn('deleteJenisBelanjaBtn error:', err); }
}, false);
;
// Helper: Capitalized Case + whitelist akronim (KBM, BOS, ATK, ADM, PLN tetap kapital)
function _capitalizedCaseJenis(s){
  s = (s||'').trim();
  if (!s) return s;
  var lower = s.toLowerCase();
  var words = lower.split(/(\s+)/);
  for (var i=0;i<words.length;i++){
    if (words[i].trim().length>0 && !/\s+/.test(words[i])){
      words[i] = words[i].charAt(0).toUpperCase() + words[i].slice(1);
    }
  }
  var out = words.join('');
  var acr = ['KBM','BOS','ATK','ADM','PLN'];
  var reAcr = new RegExp('\\b(' + acr.join('|') + ')\\b','gi');
  out = out.replace(reAcr, function(m){ return m.toUpperCase(); });
  return out;
}
;
// Buka modal Jenis: sembunyikan Gabungkan, tampilkan Jenis (di depan)
function openJenisBelanjaModal(){
  var gab = document.getElementById('gabungkanModal');
  var jen = document.getElementById('jenisBelanjaModal');
  if (gab) gab && (gab.style.display='none');
  if (jen){ jen && (jen.style.display='flex'); jen.style.zIndex = '10001'; }
  setTimeout(function(){ var i=document.getElementById('jenisBelanjaBaruInput'); if(i) i.focus(); }, 50);
}
// Bind ke tombol edit & tombol tambah (jika ada)
document.addEventListener('click', function(e){
  if (e.target.closest('#editJenisBelanjaBtn') || e.target.closest('#openJenisBelanjaModalBtn')){
    e.preventDefault();
    openJenisBelanjaModal();
  }
}, true);
;
(function(){
  function cleanupBackdrop(){
    document.querySelectorAll('.modal-backdrop').forEach(el=>el.remove());
    document.body.classList.remove('modal-open');
    document.body.style.overflow='';
  }
  function _capitalizedCaseJenis(s){
    s=(s||'').trim(); if(!s) return s;
    var lower=s.toLowerCase();
    var words=lower.split(/(\s+)/);
    for(var i=0;i<words.length;i++){ if(words[i].trim().length>0 && !/\s+/.test(words[i])){ words[i]=words[i].charAt(0).toUpperCase()+words[i].slice(1);}}
    var out=words.join('');
    var acr=['KBM','BOS','ATK','ADM','PLN']; var reAcr=new RegExp('\\b('+acr.join('|')+')\\b','gi'); out=out.replace(reAcr,function(m){return m.toUpperCase();});
    return out;
  }
  window.tambahJenisDanKembali=function(ev){
    try{
      if(ev){ev.preventDefault();ev.stopPropagation();ev.stopImmediatePropagation();}
      var inp=document.getElementById('jenisBelanjaBaruInput');
      var val=(inp&&inp.value||'').trim(); if(!val) return false;
      var cap=_capitalizedCaseJenis(val);
      var list=[]; try{list=JSON.parse(localStorage.getItem('jenisBelanjaList')||'[]');}catch(e){}
      var found=false; for(var i=0;i<list.length;i++){ if((list[i]||'').toLowerCase()===cap.toLowerCase()){found=true;break;} }
      if(!found){ list.push(cap); localStorage.setItem('jenisBelanjaList', JSON.stringify(list)); }
      var sel=document.getElementById('jenisBelanja');
      if(sel){ var inSel=false; for(var j=0;j<sel.options.length;j++){ if((sel.options[j].value||'').toLowerCase()===cap.toLowerCase()){inSel=true;break;} } if(!inSel){ var opt=document.createElement('option'); opt.value=cap; opt.textContent=cap; sel.appendChild(opt);} sel.value=cap; sel.dispatchEvent(new Event('change')); }
      if(inp) inp.value='';
      var jen=document.getElementById('jenisBelanjaModal'); var gab=document.getElementById('gabungkanModal');
      if(jen) jen.style.display='none'; if(gab) gab.style.display='flex';
      cleanupBackdrop();
    }catch(err){ console.warn('tambahJenisDanKembali error:',err); }
    return false;
  };
  function bindTambahOnce(){
    var btn=document.getElementById('jenisBelanjaTambah');
    if(btn && !btn._bindOnce){ btn.disabled=false; btn.style.pointerEvents='auto'; btn.addEventListener('click', function(e){ return window.tambahJenisDanKembali(e); }, true); btn._bindOnce=true; }
    var inp=document.getElementById('jenisBelanjaBaruInput');
    if(inp && !inp._bindEnter){ inp.addEventListener('keydown', function(e){ if(e.key==='Enter'){ e.preventDefault(); window.tambahJenisDanKembali(e);} }, true); inp._bindEnter=true; }
  }
  document.addEventListener('DOMContentLoaded', bindTambahOnce);
  window.addEventListener('load', bindTambahOnce);
  setTimeout(bindTambahOnce, 400);
  document.addEventListener('click', function(e){
    if(e.target.closest('#editJenisBelanjaBtn') || e.target.closest('#openJenisBelanjaModalBtn')){
      e.preventDefault(); var gab=document.getElementById('gabungkanModal'); var jen=document.getElementById('jenisBelanjaModal'); if(gab) gab.style.display='none'; if(jen){ jen.style.display='flex'; jen.style.zIndex='10001'; } setTimeout(function(){ var i=document.getElementById('jenisBelanjaBaruInput'); if(i) i.focus(); }, 50);
    }
    if(e.target.closest('#jenisBelanjaBatal')){ e.preventDefault(); var jen=document.getElementById('jenisBelanjaModal'); var gab=document.getElementById('gabungkanModal'); if(jen) jen.style.display='none'; if(gab) gab.style.display='flex'; cleanupBackdrop(); }
  }, true);
})();
;
// ESC safety net: close any modal/overlay, remove stuck backdrops, and restore body scroll.
(function(){
  function escCleanup(){
    try {
      // Hide Bootstrap modals gracefully
      try {
        if (window.bootstrap && bootstrap.Modal) {
          document.querySelectorAll('.modal.show').forEach(function(modalEl){
            var inst = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
            inst.hide();
          });
        } else {
          document.querySelectorAll('.modal.show').forEach(function(modalEl){
            modalEl.classList.remove('show');
            modalEl.style.display = 'none';
          });
        }
      } catch(e){ /* noop */ }
      // Hide custom overlays (Gabungkan/Jenis Belanja/etc.)
      document.querySelectorAll('.gabungkan-modal').forEach(function(el){ el.style.display = 'none'; });
      // Remove all backdrops
      document.querySelectorAll('.modal-backdrop').forEach(function(b){ b.remove(); });
      // Restore body scroll
      document.body.classList.remove('modal-open');
      document.body.style.overflow = '';
    } catch(err){ /* noop */ }
  }
  // Global ESC handler
  document.addEventListener('keydown', function(e){
    if (e.key === 'Escape' || e.key === 'Esc'){
      e.preventDefault();
      escCleanup();
    }
  }, true);
})();
;
(function(){ 
  // Helper: remove backdrops only if there is no other modal visible
  function tidyAfterHide(){
  var visible = document.querySelectorAll('.modal.show');
  if (visible.length === 0) {
    document.querySelectorAll('.modal-backdrop').forEach(function(b){ b.remove(); });
    document.body.classList.remove('modal-open');
    // Restore body scroll and remove any leftover right padding to avoid layout shrink
    try { document.body.style.removeProperty('overflow'); } catch(e){ document.body.style.overflow=''; }
    try { document.body.style.removeProperty('padding-right'); } catch(e){ document.body.style.paddingRight=''; }
  }
}
function hideSubUraian(){ 
    var modalEl = document.getElementById('subUraianModal');
    if (!modalEl) return;
    try {
      if (window.bootstrap && bootstrap.Modal) {
        var inst = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
        inst.hide();
      } else {
        modalEl.classList.remove('show');
        modalEl.style.display = 'none';
      }
    } catch(e) { /* noop */ }
    // Cleanup after transition
    setTimeout(tidyAfterHide, 150);
  }

  // 2.1 Close when clicking the dedicated close buttons inside subUraian
  document.addEventListener('click', function(e){
    if (!document.getElementById('subUraianModal')) return;
    if (!document.getElementById('subUraianModal').classList.contains('show')) return;
    var closeBtn = e.target.closest('#subUraianModal [data-bs-dismiss="modal"], #subUraianModal .btn-close, #subUraianModal .btn-secondary');
    if (closeBtn) { e.preventDefault(); hideSubUraian(); }
  }, true);

  // 2.2 Close when clicking outside the dialog (on the modal container area)
  document.addEventListener('mousedown', function(e){
    var modalEl = document.getElementById('subUraianModal');
    if (!modalEl || !modalEl.classList.contains('show')) return;
    var dialog = modalEl.querySelector('.modal-dialog');
    if (dialog && !dialog.contains(e.target)) {
      e.preventDefault();
      hideSubUraian();
    }
  }, true);

  // 2.3 If user clicks the bootstrap backdrop while subUraian is open -> hide it (keep fade show behavior by default)
  document.addEventListener('click', function(e){
    var modalEl = document.getElementById('subUraianModal');
    if (!modalEl || !modalEl.classList.contains('show')) return;
    if (e.target && e.target.classList && e.target.classList.contains('modal-backdrop')) {
      e.preventDefault();
      hideSubUraian();
    }
  }, true);

  // 2.4 On hidden, tidy leftover backdrops if subUraian is the last one
  document.addEventListener('hidden.bs.modal', function(ev){
    if (ev && ev.target && ev.target.id === 'subUraianModal') {
      setTimeout(tidyAfterHide, 50);
    }
  }, true);

})();
;
(function(){
  function monthKey(){
    // Try bulanFilter text; fallback to current month-year
    var sel = document.getElementById('bulanFilter');
    var label = '';
    if (sel){
      label = sel.options && sel.selectedIndex >= 0 ? sel.options[sel.selectedIndex].text : sel.value;
    }
    if (!label){
      var d = new Date();
      label = (d.getFullYear()) + '-' + String(d.getMonth()+1).padStart(2,'0');
    }
    return 'NO_BUKTI_COUNTER::' + label;
  }
  function nextNoBukti(){
    var key = monthKey();
    var n = parseInt(localStorage.getItem(key) || '0', 10) || 0;
    n += 1;
    localStorage.setItem(key, String(n));
    return n;
  }
  function ensureNoBuktiForRow(tr){
    if (!tr) return;
    var tds = tr.querySelectorAll('td');
    if (!tds || tds.length === 0) return;
    var cell = tds[0];
    var current = (cell.textContent||'').trim();
    if (current) return; // already has number
    // Check sub-uraian data on action button
    var subBtn = tr.querySelector('.sub-uraian-btn');
    var jsonStr = subBtn && subBtn.getAttribute('data-suburaian') || '';
    var arr = [];
    try { if (jsonStr){ arr = JSON.parse(jsonStr.replace(/&#39;/g, "'")) || []; } } catch(e){ arr=[]; }
    if (arr.length > 0){
      var nb = nextNoBukti();
      cell.textContent = String(nb);
      tr.setAttribute('data-no-bukti', String(nb));
    }
  }
  function assignNoBuktiForNewTransfers(){
    var tbody = document.querySelector('#savedTable tbody');
    if (!tbody) return;
    // Assign to any row that still has empty No Bukti but already has sub uraian
    Array.prototype.forEach.call(tbody.querySelectorAll('tr'), ensureNoBuktiForRow);
  }
  // Bind robustly to transfer button
  document.addEventListener('click', function(e){
    if (e.target && (e.target.id === 'transferBtn' || (e.target.closest && e.target.closest('#transferBtn')))){
      setTimeout(assignNoBuktiForNewTransfers, 120); // give time for rows to render/update
    }
  }, true);
})();
;
(function(){
  // Toggle checkbox selection by clicking anywhere on the data row (except interactive controls)
  document.addEventListener('click', function(e){
    var row = e.target.closest('#gabungkanModal table tbody tr');
    if (!row) return;
    // ignore clicks on controls
    if (e.target.closest('input,button,select,a,label,textarea,[role="button"]')) return;
    // find right-side selection checkbox if present
    var cb = row.querySelector('.row-checkbox-rkas-right');
    if (!cb) return;
    cb.checked = !cb.checked;
    try {
      if (window.jQuery) { $(cb).trigger('change'); } 
      else { cb.dispatchEvent(new Event('change', {bubbles:true})); }
    } catch(err){}
  }, true);
})();
;
(function(){
  // Block any user interaction with the right checkboxes
  document.addEventListener('click', function(e){
    var cb = e.target.closest('#gabungkanModal .row-checkbox-rkas-right');
    if (cb){
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      return false;
    }
  }, true);

  // Toggle selection by clicking row (outside controls)
  document.addEventListener('click', function(e){
    var row = e.target.closest('#gabungkanModal table tbody tr');
    if (!row) return;
    if (e.target.closest('button, a, select, label, input, textarea, [role="button"]')) return;
    row.classList.toggle('row-selected');
    // Sync hidden checkbox state for compatibility with legacy code (programmatically only)
    var cb = row.querySelector('.row-checkbox-rkas-right');
    if (cb) cb.checked = row.classList.contains('row-selected');
    // Update total terpilih jika ada labelnya
    try {
      if (window.updateSelectedTotalRKASRight) { updateSelectedTotalRKASRight(); }
    } catch(err){}
  }, true);

  // Override updateSelectedTotalRKASRight to count .row-selected (fallback to checkbox if needed)
  if (typeof window.updateSelectedTotalRKASRight === 'function'){
    var _origUpdate = window.updateSelectedTotalRKASRight;
    window.updateSelectedTotalRKASRight = function(){
      var container = document.querySelector('#gabungkanModal');
      if (!container) return _origUpdate();
      var selected = container.querySelectorAll('table tbody tr.row-selected').length;
      var label = document.getElementById('selectedCountRKASRight');
      if (label){ label.textContent = selected; }
      // keep original side effects if any
      try { _origUpdate(); } catch(e){}
    };
  }

  // Hijack Transfer button to use .row-selected rows
  document.addEventListener('click', function(e){
    var btn = e.target.closest('#transferBtn');
    if (!btn) return;
    // Build a synthetic "checked" state from .row-selected before legacy handler runs
    var container = document.querySelector('#gabungkanModal');
    if (!container) return;
    var rows = container.querySelectorAll('table tbody tr');
    rows.forEach(function(r){
      var cb = r.querySelector('.row-checkbox-rkas-right');
      if (cb) cb.checked = r.classList.contains('row-selected');
    });
    // let the original click handler proceed normally
  }, true);

  // Optional: Clear selection after successful transfer (listen to a custom event if present)
  document.addEventListener('transfer:done', function(){
    document.querySelectorAll('#gabungkanModal table tbody tr.row-selected').forEach(function(r){
      r.classList.remove('row-selected');
    });
  }, false);
})();
;
// Klik baris data hasil upload (excelDataTable) => auto salin ke card ✘-Arkas (uraian, sub uraian, jumlah)
(function(){
  function getJumlahFromCell(cell){
    if (!cell) return 0;
    var txt = '';
    // Prioritas: span bulan aktif
    var active = cell.querySelector('.month-price[style*="inline"], .month-price.active');
    if (active){
      txt = active.textContent || active.getAttribute('data-value') || '';
    } else {
      txt = cell.textContent || '';
    }
    var num = (txt.match(/[0-9.]+/g) || []).join('');
    num = num.replace(/\./g, '');
    return parseInt(num || '0', 10) || 0;
  }

  document.addEventListener('click', function(e){
    var tr = e.target.closest('#excelDataTable tbody tr');
    if (!tr) return;
    // Abaikan klik pada kontrol
    if (e.target.closest('input,button,select,textarea,a,label,[role="button"]')) return;

    var tds = tr.querySelectorAll('td');
    var rincian = tds[1] ? (tds[1].textContent||'').replace(/^\s*•\s*/,'').trim() : '';
    var jumlahVal = getJumlahFromCell(tds[4]);

    // Isi field di ✘-Arkas
    var uraian = document.getElementById('uraianTrans');
    if (uraian){ uraian.value = rincian; uraian.dispatchEvent(new Event('input', {bubbles:true})); }

    var subHidden = document.getElementById('subUraianTrans');
    if (subHidden){ subHidden.value = ''; }

    var jumlah = document.getElementById('jumlah');
    if (jumlah){
      try {
        if (typeof formatRupiah === 'function') jumlah.value = formatRupiah(String(jumlahVal));
        else jumlah.value = (jumlahVal||0).toLocaleString('id-ID');
      } catch(_) { jumlah.value = (jumlahVal||0).toString(); }
      jumlah.dispatchEvent(new Event('input', {bubbles:true}));
      jumlah.dispatchEvent(new Event('change', {bubbles:true}));
    }

    // Opsional: fokuskan ke Nama Pegawai atau Belanja jika diinginkan
    // var selNama = document.getElementById('namaPegawai'); if (selNama) selNama.focus();
  }, true);
})();
;
(function(){
  var fromExcelClick = false;

  // When clicking a row in excelDataTable, mark it as a normal (NON sub-uraian) entry
  document.addEventListener('click', function(e){
    var tr = e.target.closest('#excelDataTable tbody tr');
    if (!tr) return;
    if (e.target.closest('input,button,select,textarea,a,label,[role="button"]')) return;
    fromExcelClick = true;
    // ensure hidden sub field is blank
    var subHidden = document.getElementById('subUraianTrans');
    if (subHidden) subHidden.value = '';
  }, true);

  // On click Simpan, if previous interaction was excel-click, tag the next appended row as no-sub
  document.addEventListener('click', function(e){
    var btn = e.target.closest('#simpanBtn');
    if (!btn) return;
    if (fromExcelClick){ window.__forceRowNoSubOnNextSave__ = true; fromExcelClick = false; }
  }, true);

  // Observe new rows appended into Data Tersimpan and zero out sub-uraian payload
  var tbody = document.querySelector('#savedTable tbody');
  if (tbody){
    var mo = new MutationObserver(function(muts){
      if (!window.__forceRowNoSubOnNextSave__) return;
      muts.forEach(function(m){
        Array.prototype.forEach.call(m.addedNodes || [], function(node){
          if (!(node && node.nodeType === 1 && node.matches('tr'))) return;
          var btn = node.querySelector('.sub-uraian-btn');
          if (btn){ btn.setAttribute('data-suburaian', '[]'); }
          node.dataset.noSub = '1';
        });
      });
      window.__forceRowNoSubOnNextSave__ = false;
    });
    mo.observe(tbody, {childList:true});
  }
})();
;
(function(){
  function monthKey(){
    var sel = document.getElementById('bulanFilter');
    var label = '';
    if (sel){
      label = sel.options && sel.selectedIndex >= 0 ? sel.options[sel.selectedIndex].text : sel.value;
    }
    if (!label){
      var d = new Date();
      label = (d.getFullYear()) + '-' + String(d.getMonth()+1).padStart(2,'0');
    }
    return 'NO_BUKTI_COUNTER::' + label;
  }

  function autoAssignNoBuktiSequential(){
    var tbody = document.querySelector('#savedTable tbody');
    if (!tbody) return;
    var rows = Array.prototype.slice.call(tbody.querySelectorAll('tr'));
    if (!rows.length) {
      // reset counter for this month if no rows
      try { localStorage.setItem(monthKey(), '0'); } catch(_) {}
      return;
    }
    var n = 0;
    rows.forEach(function(tr){
      // only count real data rows (skip if it's a placeholder row)
      if (!tr.querySelector('td')) return;
      n += 1;
      var firstCell = tr.querySelector('td');
      if (firstCell) firstCell.textContent = String(n);
      tr.setAttribute('data-no-bukti', String(n));
    });
    try { localStorage.setItem(monthKey(), String(n)); } catch(_) {}
  }

  // Run once after DOM ready
  document.addEventListener('DOMContentLoaded', function(){
    setTimeout(autoAssignNoBuktiSequential, 80);
  });

  // Re-run after month filter changes
  document.addEventListener('change', function(e){
    if (e && e.target && e.target.id === 'bulanFilter'){
      setTimeout(autoAssignNoBuktiSequential, 120);
    }
  }, true);

  // Keep sequential when rows are added/removed
  var tbody = document.querySelector('#savedTable tbody');
  if (tbody){
    var mo = new MutationObserver(function(muts){
      // small debounce to collapse multiple adds/removes
      if (window.__nobuktiDebounce) clearTimeout(window.__nobuktiDebounce);
      window.__nobuktiDebounce = setTimeout(autoAssignNoBuktiSequential, 60);
    });
    mo.observe(tbody, {childList:true});
  }
})();
;
(function(){
  function baseNorm(s){
    if(!s) return "";
    s = String(s).toLowerCase();
    s = s.replace(/\u2022|\u25CF|•/g, " "); // bullets
    s = s.replace(/\s+/g, " ").trim();
    return s;
  }
  function scrubFiller(s){
    if(!s) return "";
    s = baseNorm(s);
    // ignore common fillers/dates/numbers so "dibayarkan", "tgl", etc don't block match
    s = s.replace(/\b(tgl|tanggal|dibayarkan|dibayar|pembelian|bku|pada|no|bukti)\b/g, " ");
    s = s.replace(/\b(januari|februari|maret|april|mei|juni|juli|agustus|september|oktober|november|desember)\b/g, " ");
    s = s.replace(/\b\d{1,2}[-\/\s]\d{1,2}[-\/\s]\d{2,4}\b/g, " ");
    s = s.replace(/\b\d{2,4}[-\/]\d{1,2}[-\/]\d{1,2}\b/g, " ");
    s = s.replace(/\brp\.?\b/g, " ");
    s = s.replace(/[0-9\.\,]+/g, " ");
    s = s.replace(/\s+/g, " ").trim();
    return s;
  }
  function getSavedLastUraianClean(){
    var tb = document.querySelector('#savedTable tbody');
    if(!tb) return "";
    var rows = Array.prototype.slice.call(tb.querySelectorAll('tr'));
    // find last real data row (skip placeholders)
    for (var i = rows.length - 1; i >= 0; i--){
      var tr = rows[i];
      if(tr.querySelector('td[colspan]')) continue;
      var tds = tr.querySelectorAll('td');
      if(!tds || tds.length < 5) continue;
      var u = tds[4].textContent || "";
      var clean = scrubFiller(u);
      if(clean) return clean;
    }
    return "";
  }
  function getRincianClean(tr){
    var tds = tr.querySelectorAll('td');
    if(!tds || tds.length < 2) return "";
    var txt = (tr.querySelector('.rincian-text') || tds[1]).textContent || "";
    return baseNorm(txt);
  }
  function tryActivateRow(tr){
    // left checkbox in first cell (if present)
    var leftCb = tr.querySelector('td:first-child input[type="checkbox"]');
    if(leftCb){
      try{ leftCb.disabled = false; }catch(e){}
      leftCb.checked = true;
    }
    // add highlight
    tr.classList.add('transferred');
    // apple-switch shell: add red class if present
    var shell = tr.querySelector('td:first-child .apple-switch');
    if(shell){ shell.classList.add('as-on'); }
  }

  // track last clicked RKAS rincian (normalized) for precise activation
  var lastClickedRincian = "";
  document.addEventListener('click', function(e){
    var tr = e.target.closest('#excelDataTable tbody tr');
    if(!tr || tr.classList.contains('group-row')) return;
    // ignore when clicking inputs/labels/anchors to avoid conflict with checkboxes
    if(e.target.closest('input,label,button,select,textarea,a,[role="button"]')) return;
    lastClickedRincian = getRincianClean(tr);
  }, true);

  function activateAfterSave(){
    var rows = document.querySelectorAll('#excelDataTable tbody tr');
    if(!rows.length) return;
    // Choose target key: prefer last clicked rincian, else use last saved uraian
    var key = lastClickedRincian || getSavedLastUraianClean();
    if(!key) return;
    // find best matching row: "contains" both ways
    var target = null;
    rows.forEach(function(tr){
      if(tr.classList.contains('group-row')) return;
      var rc = getRincianClean(tr);
      if(!rc) return;
      if (rc.indexOf(key) !== -1 || key.indexOf(rc) !== -1) {
        target = tr;
      }
    });
    if(target){ tryActivateRow(target); }
  }

  // Re-apply after Simpan (multi-shot for robustness)
  document.addEventListener('click', function(e){
    if(e.target && e.target.closest('#simpanBtn')){
      setTimeout(activateAfterSave, 100);
      setTimeout(activateAfterSave, 300);
      setTimeout(activateAfterSave, 700);
      setTimeout(activateAfterSave, 1200);
    }
  }, true);

  // Also try once after page loads (in case form prefilled)
  document.addEventListener('DOMContentLoaded', function(){
    setTimeout(activateAfterSave, 250);
  });

  // When saved table changes (row appended), try activate again
  (function(){
    var tb = document.querySelector('#savedTable tbody');
    if(!tb) return;
    var mo = new MutationObserver(function(){
      setTimeout(activateAfterSave, 120);
    });
    mo.observe(tb, {childList:true});
  })();
})();
;
(function($){
  if (!$) return;
  $(function(){
    $('#editSave').off('click').on('click', function(){
      // Validasi wajib
      if ($('#editTglLunas').val() === '' || $('#editTglPembelian').val() === '') {
        if (window.Swal) {
          Swal.fire({ icon: 'warning', title: 'Peringatan', text: 'Harap isi Tanggal Lunas dan Tanggal Pembelian!', confirmButtonText: 'OK' });
        }
        return;
      }

      // Baris yang sedang diedit
      var row = $('#editForm').data('row');
      if (!row || row.length === 0) {
        if (window.Swal) {
          Swal.fire({ icon: 'error', title: 'Gagal', text: 'Baris yang diedit tidak ditemukan.' });
        }
        return;
      }

      // Bangun nilai Uraian: pastikan selalu diawali "Dibayarkan "
      var rawEdit = String($('#editUraian').val() || '').trim();
      var tanpaPrefix = rawEdit.replace(/^Dibayarkan\s+/i, '');
      var uraianDenganPrefix = 'Dibayarkan ' + tanpaPrefix;

      // Tulis ulang sel-sel pada baris tersimpan
      row.find('td:eq(0)').text($('#editNoBukti').val());
      row.find('td:eq(1)').text($('#editNoKode').val());
      row.find('td:eq(2)').text($('#editTglLunas').val());
      row.find('td:eq(3)').text($('#editTglPembelian').val());
      row.find('td:eq(4)').text(uraianDenganPrefix);

      // Format jumlah (id-ID)
      var editJumlahRaw = String($('#editJumlah').val() || '').replace(/[^0-9]/g, '');
      try { editJumlahRaw = (parseInt(editJumlahRaw, 10) || 0).toString(); } catch(e) {}
      var editJumlahFormatted = (typeof formatRupiah === 'function') ? formatRupiah(editJumlahRaw) : (Number(editJumlahRaw||0)).toLocaleString('id-ID');
      row.find('td:eq(5)').text('Rp ' + editJumlahFormatted);

      row.find('td:eq(6)').text($('#editNamaPegawai').val());
      row.find('td:eq(7)').text($('#editBelanja').val());

      // Tutup modal
      $('#editModal').hide();

      // Recalculate total if available
      if (typeof updateTotalAmount === 'function') { updateTotalAmount(); }

      if (window.Swal) {
        Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Data berhasil diperbarui!', timer: 1500, showConfirmButton: false });
      }
    });
  });
})(window.jQuery);
;
(function(){
  function uniqPush(arr, val){
    val = (val||"").trim();
    if (!val) return arr;
    // Normalisasi: UPPERCASE seperti opsi bawaan
    var up = val.toUpperCase();
    if (!arr.some(function(x){ return String(x||"").toUpperCase() === up; })){
      arr.push(up);
    }
    return arr;
  }

  function readList(key){
    try{ return JSON.parse(localStorage.getItem(key) || "[]"); } catch(e){ return []; }
  }
  function writeList(key, arr){
    try{ localStorage.setItem(key, JSON.stringify(arr)); }catch(e){}
  }

  function mergeIntoSelect(select, list){
    if (!select) return;
    var exists = {};
    for (var i=0;i<select.options.length;i++){
      exists[(select.options[i].value||"").toUpperCase()] = true;
    }
    list.forEach(function(v){
      var up = String(v||"").toUpperCase();
      if (!exists[up]){
        var opt = document.createElement("option");
        opt.value = up; opt.textContent = up;
        select.appendChild(opt);
        exists[up] = true;
      }
    });
  }

  // Sync all related selects (main & edit) for pegawai/belanja
  function syncAllSelects(){
    var pegList = readList("namaPegawaiList");
    var belList = readList("belanjaList");

    var selPegMain  = document.getElementById("namaPegawai");
    var selPegEdit  = document.getElementById("editNamaPegawai");
    var selBelMain  = document.getElementById("belanja");
    var selBelEdit  = document.getElementById("editBelanja");

    mergeIntoSelect(selPegMain, pegList);
    mergeIntoSelect(selPegEdit, pegList);
    mergeIntoSelect(selBelMain, belList);
    mergeIntoSelect(selBelEdit, belList);
  }

  // Add current values (if any) into lists and persist
  function persistFromCurrentFields(context){
    // context: "add" from #simpanBtn or "edit" from #editSave
    var pegVal = "", belVal = "";
    if (context === "edit"){
      var peg = document.getElementById("editNamaPegawai");
      var bel = document.getElementById("editBelanja");
      pegVal = peg ? peg.value : "";
      belVal = bel ? bel.value : "";
    } else {
      var peg = document.getElementById("namaPegawai");
      var bel = document.getElementById("belanja");
      pegVal = peg ? peg.value : "";
      belVal = bel ? bel.value : "";
    }
    var pegList = readList("namaPegawaiList");
    var belList = readList("belanjaList");
    uniqPush(pegList, pegVal);
    uniqPush(belList, belVal);
    writeList("namaPegawaiList", pegList);
    writeList("belanjaList", belList);
    // re-sync selects so new option appears in both places
    syncAllSelects();
  }

  // Initialize on DOMContentLoaded
  document.addEventListener("DOMContentLoaded", function(){
    // Seed lists from hardcoded options (one-time/no-op if already present)
    (function seedFromCurrent(){
      var peg = document.getElementById("namaPegawai");
      var bel = document.getElementById("belanja");
      var pegList = readList("namaPegawaiList");
      var belList = readList("belanjaList");
      if (peg){
        for (var i=0;i<peg.options.length;i++){
          uniqPush(pegList, peg.options[i].value);
        }
      }
      if (bel){
        for (var j=0;j<bel.options.length;j++){
          uniqPush(belList, bel.options[j].value);
        }
      }
      writeList("namaPegawaiList", pegList);
      writeList("belanjaList", belList);
    })();

    // Sync all selects with stored lists
    syncAllSelects();
  });

  // Hook main save (#simpanBtn): persist chosen pegawai & belanja
  document.addEventListener("click", function(e){
    if (e.target && (e.target.id === "simpanBtn" || (e.target.closest && e.target.closest("#simpanBtn")))){
      setTimeout(function(){ persistFromCurrentFields("add"); }, 10);
    }
  }, true);

  // Hook edit save (#editSave): persist edited pegawai & belanja
  document.addEventListener("click", function(e){
    if (e.target && (e.target.id === "editSave" || (e.target.closest && e.target.closest("#editSave")))){
      setTimeout(function(){ persistFromCurrentFields("edit"); }, 10);
    }
  }, true);
})();
;
(function(){
  function setHiddenInputs(row, key, val){
    try{
      var inputs = row.querySelectorAll('input,select,textarea');
      var re = new RegExp(key, 'i');
      inputs.forEach(function(el){
        if (el.name && re.test(el.name)) el.value = val;
        if (el.id && re.test(el.id)) el.value = val;
        if (el.className && re.test(el.className)) el.value = val;
        // reflect to dataset if present (for custom widgets)
        if (el.dataset) {
          for (var dk in el.dataset){
            if (re.test(dk)) el.dataset[dk] = val;
          }
        }
      });
    }catch(e){}
  }

  function updateCommonStores(row, peg, bel){
    var id = row.getAttribute('data-id') || row.dataset.id || null;
    var noBukti = (row.querySelector('td:nth-child(1)') || {}).textContent || "";
    noBukti = (noBukti||"").trim();

    var candidates = [
      'dataTersimpan','DATA_TERSIMPAN','savedData','SAVED_DATA',
      'rowsData','tableData','dataSaved','DATA_SAVED'
    ];
    candidates.forEach(function(name){
      var arr = window[name];
      if (!arr || !Array.isArray(arr)) return;
      // find by data-id first
      var idx = -1;
      if (id){
        idx = arr.findIndex(function(o){
          return o && (String(o.id||o.ID||o.Id||"") === String(id));
        });
      }
      // fallback: by noBukti
      if (idx === -1 && noBukti){
        idx = arr.findIndex(function(o){
          return o && (String(o.noBukti||o.NoBukti||o.no_bukti||"").trim() === noBukti);
        });
      }
      if (idx !== -1){
        var obj = arr[idx];
        try{
          if (obj){
            obj.namaPegawai = peg; obj.NamaPegawai = peg; obj.pegawai = peg;
            obj.belanja = bel; obj.Belanja = bel; obj.jenisBelanja = bel;
          }
        }catch(e){}
      }
    });
    try{
      if (typeof window.updateTotalAmount === 'function'){ window.updateTotalAmount(); }
    }catch(e){}
  }

  // Run AFTER any existing #editSave handler using capture + microtask
  document.addEventListener('click', function(ev){
    var t = ev.target;
    if (!t) return;
    var isBtn = t.id === 'editSave' || (t.closest && t.closest('#editSave'));
    if (!isBtn) return;

    Promise.resolve().then(function(){
      try{
        var form = document.getElementById('editForm');
        if (!form) return;
        var $row = (window.jQuery ? window.jQuery('#editForm').data('row') : null);
        var row = $row && $row[0] ? $row[0] : null;
        if (!row) return;

        var peg = (document.getElementById('editNamaPegawai') || {}).value || '';
        var bel = (document.getElementById('editBelanja') || {}).value || '';

        // Update cell text again to be sure
        var tds = row.querySelectorAll('td');
        if (tds && tds.length >= 8){
          tds[6].textContent = peg;
          tds[7].textContent = bel;
        }

        // Update data-* attributes & jQuery .data()
        row.setAttribute('data-nama-pegawai', peg);
        row.setAttribute('data-pegawai', peg);
        row.setAttribute('data-belanja', bel);
        if (window.jQuery){
          var $r = window.jQuery(row);
          $r.data('namaPegawai', peg);
          $r.data('pegawai', peg);
          $r.data('belanja', bel);
        }

        // Best-effort: update any hidden inputs/selects in the row
        setHiddenInputs(row, 'pegawai', peg);
        setHiddenInputs(row, 'belanja', bel);

        // Try to reflect into common global stores used for export/reopen edit
        updateCommonStores(row, peg, bel);
      }catch(e){ console && console.warn && console.warn('Persist patch error:', e); }
    });
  }, true);
})();
;
(function(){
  var STORAGE_KEYS = {
    pegawai: 'SimpleBOS_listNamaPegawai',
    belanja: 'SimpleBOS_listBelanja'
  };

  function readList(key) {
    try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch(e){ return []; }
  }
  function writeList(key, arr) {
    try { localStorage.setItem(key, JSON.stringify(arr || [])); } catch(e){}
  }
  function uniqPush(list, val){
    val = (val||'').trim();
    if (!val) return list;
    var up = val.toUpperCase();
    if (!list.some(function(x){ return String(x||'').toUpperCase() === up; })){
      list.push(up);
    }
    return list;
  }
  function currentOptions(selector){
    var sel = document.querySelector(selector);
    if (!sel) return [];
    var out = [];
    for (var i=0;i<sel.options.length;i++){
      var v = sel.options[i].value || '';
      if (v) out.push(v);
    }
    return out;
  }
  function updateSelect(selector, list){
    var sel = document.querySelector(selector);
    if (!sel) return;
    var placeholder = null;
    for (var i=0;i<sel.options.length;i++){
      if (sel.options[i].value === '') { placeholder = sel.options[i].cloneNode(true); break; }
    }
    while (sel.firstChild) sel.removeChild(sel.firstChild);
    if (placeholder) sel.appendChild(placeholder);
    (list || []).forEach(function(item){
      var opt = document.createElement('option');
      opt.value = item; opt.textContent = item;
      sel.appendChild(opt);
    });
  }
  function syncAllSelects(){
    var peg = readList(STORAGE_KEYS.pegawai);
    var bel = readList(STORAGE_KEYS.belanja);
    // if storage empty, seed from DOM (first load)
    if (!peg.length){
      currentOptions('#namaPegawai').concat(currentOptions('#editNamaPegawai')).forEach(function(v){ uniqPush(peg, v); });
      writeList(STORAGE_KEYS.pegawai, peg);
    }
    if (!bel.length){
      currentOptions('#belanja').concat(currentOptions('#editBelanja')).forEach(function(v){ uniqPush(bel, v); });
      writeList(STORAGE_KEYS.belanja, bel);
    }
    // push to both add & edit selects
    updateSelect('#namaPegawai', peg);
    updateSelect('#editNamaPegawai', peg);
    updateSelect('#belanja', bel);
    updateSelect('#editBelanja', bel);
  }
  function ensureValueAdded(context){ // context: 'add' or 'edit'
    var pegSel = document.querySelector(context === 'edit' ? '#editNamaPegawai' : '#namaPegawai');
    var belSel = document.querySelector(context === 'edit' ? '#editBelanja' : '#belanja');
    var pegVal = (pegSel && pegSel.value) ? pegSel.value : '';
    var belVal = (belSel && belSel.value) ? belSel.value : '';
    var peg = readList(STORAGE_KEYS.pegawai);
    var bel = readList(STORAGE_KEYS.belanja);
    uniqPush(peg, pegVal);
    uniqPush(bel, belVal);
    writeList(STORAGE_KEYS.pegawai, peg);
    writeList(STORAGE_KEYS.belanja, bel);
    syncAllSelects();
    // make sure the selects keep current selection after repopulating
    if (pegSel) pegSel.value = (pegVal || '');
    if (belSel) belSel.value = (belVal || '');
  }

  // Load persisted lists as soon as DOM is ready
  document.addEventListener('DOMContentLoaded', syncAllSelects);

  // Hook the existing "Simpan" in Edit Lists modal to persist to localStorage
  document.addEventListener('click', function(e){
    var t = e.target;
    if (!t) return;
    var isSaveList = (t.id === 'saveListBtn') || (t.closest && t.closest('#saveListBtn'));
    if (!isSaveList) return;
    // read textareas, store, and sync selects
    setTimeout(function(){
      var namaTxt = document.getElementById('editNamaList');
      var belTxt  = document.getElementById('editBelanjaList');
      var peg = (namaTxt && namaTxt.value ? namaTxt.value.split('\n') : []).map(function(s){return (s||'').trim();}).filter(Boolean);
      var bel = (belTxt  && belTxt.value  ? belTxt.value.split('\n')  : []).map(function(s){return (s||'').trim();}).filter(Boolean);
      // normalize upper
      peg = peg.map(function(x){ return x.toUpperCase(); });
      bel = bel.map(function(x){ return x.toUpperCase(); });
      writeList(STORAGE_KEYS.pegawai, peg);
      writeList(STORAGE_KEYS.belanja, bel);
      syncAllSelects();
    }, 10);
  }, true);

  // When user saves add or edit, make sure chosen values are added & persisted
  document.addEventListener('click', function(e){
    var t = e.target;
    if (!t) return;
    var isAddSave  = (t.id === 'simpanBtn') || (t.closest && t.closest('#simpanBtn'));
    var isEditSave = (t.id === 'editSave')  || (t.closest && t.closest('#editSave'));
    if (!(isAddSave || isEditSave)) return;
    setTimeout(function(){
      ensureValueAdded(isEditSave ? 'edit' : 'add');
    }, 10);
  }, true);

  // When opening Edit modal, ensure any value already in the row exists as an option
  document.addEventListener('click', function(e){
    var t = e.target;
    if (!t) return;
    var isEditBtn = (t.classList && t.classList.contains('edit-btn')) || (t.closest && t.closest('.edit-btn'));
    if (!isEditBtn) return;
    setTimeout(function(){
      var row = (window.jQuery ? window.jQuery('#editForm').data('row') : null);
      row = (row && row[0]) ? row[0] : null;
      if (!row) return;
      var tds = row.querySelectorAll('td');
      var pegVal = (tds && tds[6]) ? (tds[6].textContent || '').trim() : '';
      var belVal = (tds && tds[7]) ? (tds[7].textContent || '').trim() : '';
      var peg = readList(STORAGE_KEYS.pegawai);
      var bel = readList(STORAGE_KEYS.belanja);
      uniqPush(peg, pegVal); uniqPush(bel, belVal);
      writeList(STORAGE_KEYS.pegawai, peg);
      writeList(STORAGE_KEYS.belanja, bel);
      syncAllSelects();
      var pegSel = document.getElementById('editNamaPegawai');
      var belSel = document.getElementById('editBelanja');
      if (pegSel) pegSel.value = (pegVal || '');
      if (belSel) belSel.value = (belVal || '');
    }, 10);
  }, true);
})();
