const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors()); // Cho phép Frontend truy cập dữ liệu không bị chặn

const PORT = 5000;
const MUSIC_DIR = path.join(__dirname, 'musicdata'); // Đường dẫn tới musicdata
const IGNORE_FOLDER = '_converter'; // Tên thư mục _converter cần bỏ qua

// Cấu hình để biến Thư mục A thành một kho lưu trữ tĩnh, 
// giúp App có thể phát file .mp3 trực tiếp thông qua URL công khai.
app.use('/api/songs-static', express.static(MUSIC_DIR));

// API chính để quét thư mục và trả về danh sách bài hát + lời kèm theo
app.get('/api/playlist', (req, res) => {
    try {
        // Đọc tất cả các mục có trong Thư mục A
        const items = fs.readdirSync(MUSIC_DIR);
        const playlist = [];

        items.forEach(itemName => {
            // 1. BỎ QUA thư mục B và các file hệ thống ẩn (như .DS_Store)
            if (itemName === IGNORE_FOLDER || itemName.startsWith('.')) {
                return; 
            }

            const itemPath = path.join(MUSIC_DIR, itemName);
            const stat = fs.statSync(itemPath);

            // 2. Kiểm tra xem có đúng là thư mục con (chứa bài hát) hay không
            if (stat.isDirectory()) {
                const files = fs.readdirSync(itemPath);
                
                // Tìm file mp3 và file json trong thư mục con này
                const mp3File = files.find(f => f.endsWith('.mp3'));
                const jsonFile = files.find(f => f.endsWith('.json'));

                if (mp3File && jsonFile) {
                    // Đọc nội dung file JSON lyric luôn để gửi về một thể
                    const jsonPath = path.join(itemPath, jsonFile);
                    const lyricContent = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

                    // Đóng gói thông tin bài hát đưa vào danh sách
                    playlist.push({
                        id: itemName, // Dùng luôn tên thư mục làm ID bài hát
                        title: lyricContent.title || itemName,
                        artist: lyricContent.artist || 'Unknown Artist',
                        audioUrl: `http://localhost:${PORT}/api/songs-static/${itemName}/${mp3File}`,
                        lyrics: lyricContent.lyrics // Mảng chứa kanji, reading, meaning từ file của bạn
                    });
                }
            }
        });

        // Trả danh sách bài hát về cho Frontend dưới dạng JSON
        res.json(playlist);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Đã xảy ra lỗi khi quét thư mục nhạc.' });
    }
});

// Node.js tự phục vụ file giao diện index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Khởi chạy server
app.listen(PORT, () => {
    console.log(`Server nhạc đang chạy tại: http://localhost:${PORT}`);
    console.log(`Bấm http://localhost:${PORT}/api/playlist để kiểm tra thử dữ liệu.`);
});