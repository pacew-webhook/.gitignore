const express = require('express');
const Datastore = require('nedb-promises');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Database lokal berbasis file otomatis dibuat di folder proyek
const db = Datastore.create({ filename: 'database_accounts.db', autoload: true });

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API 1: Endpoint untuk menerima update dari Script Roblox (Bot/Alt)
app.post('/api/update', async (req, res) => {
    const { username, status, shekless, gems, currentFarm } = req.body;

    if (!username) {
        return res.status(400).json({ success: false, error: "Username wajib dikirim!" });
    }

    const accountData = {
        username,
        status: status || "Online",
        shekless: shekless || 0,
        gems: gems || 0,
        currentFarm: currentFarm || "Idle",
        lastUpdated: new Date()
    };

    // Upsert: Jika akun sudah ada di-update, jika belum akan dibuat baru
    await db.update({ username }, accountData, { upsert: true });

    res.json({ success: true, message: `Data ${username} berhasil diperbarui!` });
});

// API 2: Endpoint untuk mengambil data yang akan ditampilkan di Dashboard Web
app.get('/api/accounts', async (req, res) => {
    try {
        const accounts = await db.find({});
        res.json(accounts);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// API 3: Endpoint untuk menghapus/reset semua data akun di panel
app.delete('/api/accounts', async (req, res) => {
    await db.remove({}, { multi: true });
    res.json({ success: true, message: "Semua data akun di panel berhasil di-reset!" });
});

app.listen(PORT, () => {
    console.log(`Server RAM berjalan di port ${PORT}`);
});
